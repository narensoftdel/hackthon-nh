// Dummy model for sensor data (expand as needed)
class SensorData {
  constructor(tvoc, fireAlarm, co2, temperature, smokeDetected, lastUpdated) {
    this.tvoc = tvoc;
    this.fireAlarm = fireAlarm;
    this.co2 = co2;
    this.temperature = temperature;
    this.smokeDetected = smokeDetected;
    this.lastUpdated = lastUpdated;
  }
}

module.exports = SensorData;
