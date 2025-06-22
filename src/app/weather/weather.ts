import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.html',
  styleUrls: ['./weather.css'],
})
export class WeatherComponent {
  city: string = '';
  weatherData: any = null;
  errorMessage: string = '';

  constructor(private api: ApiService) {}

  searchWeather() {
    if (!this.city.trim()) {
      this.errorMessage = 'Nama kota tidak boleh kosong.';
      this.weatherData = null;
      return;
    }

    this.api.getWeatherByCity(this.city.trim()).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Kota tidak ditemukan atau terjadi kesalahan.';
        this.weatherData = null;
      },
    });
  }
}
