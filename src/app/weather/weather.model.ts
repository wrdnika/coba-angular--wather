export interface WeatherResponse {
  coord: { lat: number; lon: number };
  weather: { icon: string; description: string }[];
  main: { temp: number; humidity: number };
  wind: { speed: number };
  sys: { country: string };
  name: string;
}
