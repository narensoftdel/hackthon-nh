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
  // ...existing code...

  public getStackedRanges(label: string) {
    // Map label to type for range
    const typeMap: any = {
      'TVOC': 'tvoc',
      'CO₂': 'co2',
      'Temperature': 'temperature',
      'Humidity': 'humidity',
      'PM2.5': 'pm25',
      'PM10': 'pm10'
    };
    const type = typeMap[label];
    switch (type) {
      case 'tvoc':
        return [
          { type: 'good', text: 'Good: <300' },
          { type: 'concern', text: 'Concern: <700' },
          { type: 'poor', text: 'Poor: ≥700 (ppb)' }
        ];
      case 'co2':
        return [
          { type: 'good', text: 'Good: <800' },
          { type: 'concern', text: 'Concern: <1200' },
          { type: 'poor', text: 'Poor: ≥1200 (ppm)' }
        ];
      case 'temperature':
        return [
          { type: 'good', text: 'Good: 20-26°C' },
          { type: 'concern', text: 'Concern: 18-20°C or 26-28°C' },
          { type: 'poor', text: 'Poor: <18°C or >28°C' }
        ];
      case 'humidity':
        return [
          { type: 'good', text: 'Good: 30-60%' },
          { type: 'concern', text: 'Concern: 20-30% or 60-70%' },
          { type: 'poor', text: 'Poor: <20% or >70%' }
        ];
      case 'pm25':
        return [
          { type: 'good', text: 'Good: <35' },
          { type: 'concern', text: 'Concern: <75' },
          { type: 'poor', text: 'Poor: ≥75 (µg/m³)' }
        ];
      case 'pm10':
        return [
          { type: 'good', text: 'Good: <50' },
          { type: 'concern', text: 'Concern: <150' },
          { type: 'poor', text: 'Poor: ≥150 (µg/m³)' }
        ];
      default:
        return [];
    }
  }

  triggerFireAlarm(idx: number) {
    const floorNum = idx + 1;
    this.sensorService.setFireAlarm(floorNum, true).subscribe({
      next: () => {
        this.fetchSensorData();
      },
      error: () => {
        this.error = 'Failed to trigger fire alarm.';
      }
    });
  }

  resetFireAlarm(idx: number) {
    const floorNum = idx + 1;
    this.sensorService.setFireAlarm(floorNum, false).subscribe({
      next: () => {
        this.fetchSensorData();
      },
      error: () => {
        this.error = 'Failed to reset fire alarm.';
      }
    });
  }
  sendAlarmToAll() {
    this.alarmEmailStatus = 'Sending fire alarm email to all users...';
    this.sensorService.sendAlarmEmail('active').subscribe({
      next: (res: any) => {
        this.alarmEmailStatus = 'Alarm email sent to all users.';
      },
      error: (err: any) => {
        this.alarmEmailStatus = 'Failed to send alarm email.';
      }
    });
  }
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
    if (!floorData) return { group1: [], group2: [], misc: [] };
    const formatTemp = (v: any) => typeof v === 'number' ? v.toFixed(2) : v;
    const formatInt = (v: any) => typeof v === 'number' ? Math.round(v) : (v === undefined || v === null ? '--' : v);
    return {
      group1: [
        { icon: '🌫️', label: 'TVOC', value: formatInt(floorData.tvoc), meta: 'Air Quality (ppb)', status: this.getCardStatus('tvoc', floorData.tvoc), range: this.getCardRange('tvoc') },
        { icon: '☁️', label: 'CO₂', value: formatInt(floorData.co2), meta: 'CO₂ Level (ppm)', status: this.getCardStatus('co2', floorData.co2), range: this.getCardRange('co2') },
        { icon: '🟤', label: 'PM2.5', value: formatInt(floorData.pm25) + ' µg/m³', meta: 'Fine Particles', status: this.getCardStatus('pm25', floorData.pm25), range: this.getCardRange('pm25') },
        { icon: '⚪', label: 'PM10', value: formatInt(floorData.pm10) + ' µg/m³', meta: 'Coarse Particles', status: this.getCardStatus('pm10', floorData.pm10), range: this.getCardRange('pm10') }
      ],
      group2: [
        { icon: '🌡️', label: 'Temperature', value: formatTemp(floorData.temperature) + ' °C', meta: 'Ambient', status: this.getCardStatus('temperature', floorData.temperature), range: this.getCardRange('temperature') },
        { icon: '💧', label: 'Humidity', value: (typeof floorData.humidity === 'number' && !isNaN(floorData.humidity) ? formatInt(floorData.humidity) + ' %' : '--'), meta: 'Relative Humidity', status: this.getCardStatus('humidity', floorData.humidity), range: this.getCardRange('humidity') },
        { icon: '🚨', label: 'Fire Alarm', value: floorData.fireAlarm ? 'Active' : 'Normal', meta: 'Status', status: floorData.fireAlarm ? 'poor' : 'good', range: '' },
      ],
      misc: [
        { icon: '💨', label: 'Smoke Detected', value: floorData.smokeDetected ? 'Yes' : 'No', meta: 'Status', status: floorData.smokeDetected ? 'concern' : 'good', range: '' }
      ]
    }
  }

  getCardRange(type: string): string {
    switch (type) {
      case 'tvoc':
        return 'Good: <300 | Concern: <700 | Poor: ≥700 (ppb)';
      case 'co2':
        return 'Good: <800 | Concern: <1200 | Poor: ≥1200 (ppm)';
      case 'temperature':
        return 'Good: 20-26°C | Concern: 18-20/26-28 | Poor: <18/>28';
      case 'humidity':
        return 'Good: 30-60% | Concern: 20-30/60-70 | Poor: <20/>70';
      case 'pm25':
        return 'Good: <35 | Concern: <75 | Poor: ≥75 (µg/m³)';
      case 'pm10':
        return 'Good: <50 | Concern: <150 | Poor: ≥150 (µg/m³)';
      default:
        return '';
    }
  }

  getBuildingAvgData() {
    if (!this.sensorData.length) return null;
    const avg = (arr: number[]) => {
      const nums = arr.filter(v => typeof v === 'number' && !isNaN(v));
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    };
    return {
      tvoc: avg(this.sensorData.map(f => f.tvoc)),
      co2: avg(this.sensorData.map(f => f.co2)),
      temperature: avg(this.sensorData.map(f => f.temperature)),
      humidity: avg(this.sensorData.map(f => f.humidity)),
      pm25: avg(this.sensorData.map(f => f.pm25)),
      pm10: avg(this.sensorData.map(f => f.pm10)),
      fireAlarm: this.sensorData.some(f => f.fireAlarm),
      smokeDetected: this.sensorData.some(f => f.smokeDetected)
    };
  }

  getCardStatus(type: string, value: any): 'good' | 'concern' | 'poor' {
 
    if (type === 'humidity') {
      if (value >= 30 && value <= 60) return 'good';
      if ((value >= 20 && value < 30) || (value > 60 && value <= 70)) return 'concern';
      return 'poor';
    }   if (type === 'tvoc') {
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
     if (type === 'pm25') {
        if (value < 35) return 'good';
        if (value < 75) return 'concern';
        return 'poor';
      }
      if (type === 'pm10') {
        if (value < 50) return 'good';
        if (value < 150) return 'concern';
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

  simulateTvoc(idx: number) {
    const floorNum = idx + 1;
    this.sensorService.simulateTvoc(floorNum).subscribe({
      next: () => {
        this.fetchSensorData();
      },
      error: () => {
        this.error = 'Failed to simulate TVOC spike.';
      }
    });
  }
}
