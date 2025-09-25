import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SensorService } from './services/sensor.service';
// import { SensorService } from '../services/sensor.service';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})


export class DashboardComponent implements OnInit, OnDestroy {
  buildingExpanded = true;
  floorAccordion: boolean[] = [];
  floorTesting: boolean[] = [];
  sensorData: any[] = [];
  users: any[] = [];
  loading = true;
  error = '';
  private intervalId: any;
  selectedFloor: number | null = null;
  alarmEmailStatus: string = '';
  fireAlarmToggle: boolean = false;

  onFireAlarmToggle(event: any) {
    const checked = event.target.checked;
    this.fireAlarmToggle = checked;
    if (checked) {
      // Only send to users of the selected floor
      if (this.selectedFloor == null) return;
      const floorUsers = this.getUsersForFloor(this.selectedFloor);
      if (!floorUsers.length) {
        this.alarmEmailStatus = 'No users found for this floor.';
        return;
      }
      this.alarmEmailStatus = 'Sending...';
      this.sensorService.sendAlarmEmail('active').subscribe({
        next: (res) => {
          this.alarmEmailStatus = 'Alarm email (active) sent to all users.';
        },
        error: (err) => {
          this.alarmEmailStatus = 'Failed to send alarm email.';
        }
      });
    } else {
      this.alarmEmailStatus = '';
    }
  }

  // Handler for Evacuate button
  onEvacuate() {
    this.router.navigate(['/floor-plan']);
  }

  constructor(private sensorService: SensorService, private router: Router) {}

  ngOnInit(): void {
    this.fetchSensorData();
    this.startPolling();
    // Initialize accordion and testing state for each floor
    this.floorAccordion = Array(this.sensorData.length).fill(false);
    this.floorTesting = Array(this.sensorData.length).fill(false);
  }

  startPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      // If a floor is selected and its fire alarm is active, stop polling
      if (this.selectedFloor !== null && this.sensorData[this.selectedFloor - 1]?.fireAlarm) {
        this.stopPolling();
        return;
      }
      // If any floor is in testing mode, skip sending emails for that floor (frontend only)
      // (Backend logic is needed for full enforcement)
      // Just fetch data as usual
      this.fetchSensorData();
    }, 10000);
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchSensorData() {
    this.sensorService.getSensorData().subscribe({
      next: (data: any) => {
        this.sensorData = data.floors || [];
        this.users = data.users || [];
        this.floorTesting = data.floorTesting || Array(this.sensorData.length).fill(false);
        this.loading = false;
        // Re-initialize accordion state if floor count changes
        if (this.floorAccordion.length !== this.sensorData.length) {
          this.floorAccordion = Array(this.sensorData.length).fill(false);
        }
      },
      error: (err: any) => {
        this.error = 'Failed to load sensor data';
        this.loading = false;
      }
    });
  }

  toggleTesting(i: number) {
    const floorNum = i + 1;
    const newTesting = !this.floorTesting[i];
    this.sensorService.setFloorTesting(floorNum, newTesting).subscribe({
      next: () => {
        this.fetchSensorData();
      },
      error: () => {
        this.error = 'Failed to update testing state.';
      }
    });
  }

  getUsersForFloor(floor: number) {
    return this.users.filter(u => u.floor === floor);
  }

  getSensorCards(floorData: any) {
    if (!floorData) return [];
    const formatTemp = (v: any) => typeof v === 'number' ? v.toFixed(2) : v;
    const formatInt = (v: any) => typeof v === 'number' ? Math.round(v) : v;
    return [
      { icon: '🌫️', label: 'TVOC', value: formatInt(floorData.tvoc), meta: 'Air Quality (ppb)', status: this.getCardStatus('tvoc', floorData.tvoc) },
      { icon: '☁️', label: 'CO₂', value: formatInt(floorData.co2), meta: 'CO₂ Level (ppm)', status: this.getCardStatus('co2', floorData.co2) },
      { icon: '🌡️', label: 'Temperature', value: formatTemp(floorData.temperature) + ' °C', status: this.getCardStatus('temperature', floorData.temperature) },
      { icon: '🚨', label: 'Fire Alarm', value: floorData.fireAlarm ? 'Active' : 'Normal', status: floorData.fireAlarm ? 'poor' : 'good' },
      { icon: '💨', label: 'Smoke Detected', value: floorData.smokeDetected ? 'Yes' : 'No', status: floorData.smokeDetected ? 'concern' : 'good' }
    ];
  }

  getBuildingAvgData() {
    if (!this.sensorData.length) return null;
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
      tvoc: avg(this.sensorData.map(f => f.tvoc)),
      co2: avg(this.sensorData.map(f => f.co2)),
      temperature: avg(this.sensorData.map(f => f.temperature)),
      fireAlarm: this.sensorData.some(f => f.fireAlarm),
      smokeDetected: this.sensorData.some(f => f.smokeDetected)
    };
  }

  getCardStatus(type: string, value: any): 'good' | 'concern' | 'poor' {
    if (type === 'tvoc') {
      if (value < 300) return 'good';
      if (value < 700) return 'concern';
      return 'poor';
    }
    if (type === 'co2') {
      if (value < 800) return 'good';
      if (value < 1200) return 'concern';
      return 'poor';
    }
    if (type === 'temperature') {
      if (value >= 20 && value <= 26) return 'good';
      if ((value >= 18 && value < 20) || (value > 26 && value <= 28)) return 'concern';
      return 'poor';
    }
    return 'good';
  }

  selectFloor(floor: number) {
    this.selectedFloor = floor;
    // Sync toggle with current floor's fire alarm state
    if (this.sensorData && this.sensorData[floor - 1]) {
      this.fireAlarmToggle = !!this.sensorData[floor - 1].fireAlarm;
      // If fire alarm is active, stop polling
      if (this.sensorData[floor - 1].fireAlarm) {
        this.stopPolling();
      } else {
        this.startPolling();
      }
    } else {
      this.fireAlarmToggle = false;
      this.startPolling();
    }
  }

  showBuildingView() {
    this.selectedFloor = null;
    this.startPolling();
  }

  resetFloor() {
    if (this.selectedFloor == null) return;
    this.alarmEmailStatus = 'Resetting...';
    this.sensorService.resetFloor(this.selectedFloor).subscribe({
      next: (res) => {
        this.alarmEmailStatus = res.message || 'Floor reset.';
        this.fetchSensorData();
        this.startPolling();
      },
      error: (err) => {
        this.alarmEmailStatus = 'Failed to reset floor.';
      }
    });
  }

  // Returns true if any sensor for the floor is in 'poor' status
  isFloorBad(idx: number): boolean {
    const floor = this.sensorData && this.sensorData[idx];
    if (!floor) return false;
    if (this.getCardStatus('tvoc', floor.tvoc) === 'poor') return true;
    if (this.getCardStatus('co2', floor.co2) === 'poor') return true;
    if (this.getCardStatus('temperature', floor.temperature) === 'poor') return true;
    if (floor.fireAlarm) return true;
    if (floor.smokeDetected) return true;
    return false;
  }
}
