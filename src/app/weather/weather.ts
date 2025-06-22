import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api';
import * as L from 'leaflet';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.html',
  styleUrls: ['./weather.css'],
})
export class WeatherComponent implements AfterViewInit {
  city = '';
  weatherData: any = null;
  errorMessage = '';
  isLoading = false;
  history: string[] = [];
  map!: L.Map;
  marker?: L.Marker;

  constructor(private api: ApiService) {}

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    this.map = L.map('map', { zoomControl: false }).setView([-6.2, 106.8], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  searchWeather() {
    if (!this.city.trim()) {
      this.errorMessage = 'Nama kota tidak boleh kosong.';
      this.weatherData = null;
      return;
    }
    this.isLoading = true;
    this.api.getWeatherByCity(this.city.trim()).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.errorMessage = '';
        this.isLoading = false;
        this.history.unshift(this.city);

        const { lat, lon } = data.coord;
        const desc = data.weather[0].description;
        const iconCode = data.weather[0].icon;

        // pindah view
        this.map.setView([lat, lon], 8);

        // hapus marker lama
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }

        // custom icon cuaca
        const weatherIcon = L.icon({
          iconUrl: `https://openweathermap.org/img/wn/${iconCode}@2x.png`,
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -50],
        });

        // tambahkan marker baru
        this.marker = L.marker([lat, lon], { icon: weatherIcon })
          .addTo(this.map)
          .bindPopup(`<b>${this.city}</b><br/>${desc}`)
          .openPopup();
      },
      error: () => {
        this.errorMessage = 'Kota tidak ditemukan atau terjadi kesalahan.';
        this.weatherData = null;
        this.isLoading = false;
      },
    });
  }
}
