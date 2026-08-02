export type DailyEntry = {
  date: string;
  tMax: number;
  tMin: number;
  code: number;
  precip: number;
};

export type Forecast = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  tempUnit: string;
  windUnit: string;
  daily: DailyEntry[];
};