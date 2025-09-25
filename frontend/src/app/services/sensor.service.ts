import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SensorService {
  private apiUrl = 'http://localhost:3000/api/sensors'; // Adjust if needed
  private alarmEmailUrl = 'http://localhost:3000/api/send-alarm-email';

  constructor(private http: HttpClient) {}

  getSensorData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  sendAlarmEmail(status: 'active' | 'inactive'): Observable<any> {
    return this.http.post<any>(this.alarmEmailUrl, { status });
  }
}
