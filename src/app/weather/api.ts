import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WeatherResponse } from './weather.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) {}

  getWeatherByCity(city: string): Observable<any> {
    const url = `${this.apiUrl}?q=${city}&appid=${environment.openWeatherApiKey}&units=metric`;
    return this.http.get(url);
  }

  getWeatherByCoord(lat: number, lon: number): Observable<WeatherResponse> {
    const url = `${this.apiUrl}?lat=${lat}&lon=${lon}&appid=${environment.openWeatherApiKey}&units=metric`;
    return this.http.get<WeatherResponse>(url);
  }
}
