import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api';
import { WeatherResponse } from './weather.model';
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
    this.loadMultipleCitiesWeather();
  }

  private initMap() {
    this.map = L.map('map', { zoomControl: false }).setView([-6.2, 106.8], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  loadMultipleCitiesWeather() {
    const cities = [
      { name: 'Jakarta', lat: -6.2, lon: 106.8 },
      { name: 'Surabaya', lat: -7.25, lon: 112.75 },
      { name: 'Bandung', lat: -6.917, lon: 107.6 },
      { name: 'Medan', lat: 3.583, lon: 98.667 },
      { name: 'Makassar', lat: -5.15, lon: 119.433 },
      { name: 'Semarang', lat: -6.9667, lon: 110.4167 },
      { name: 'Palembang', lat: -2.9833, lon: 104.755 },
      { name: 'Balikpapan', lat: -1.265, lon: 116.831 },
      { name: 'Padang', lat: -0.95, lon: 100.35 },
      { name: 'Denpasar', lat: -8.65, lon: 115.2167 },
      { name: 'Pontianak', lat: -0.02, lon: 109.333 },
      { name: 'Banjarmasin', lat: -3.3167, lon: 114.5833 },
      { name: 'Manado', lat: 1.4931, lon: 124.8413 },
      { name: 'Jayapura', lat: -2.5333, lon: 140.7167 },
      { name: 'Yogyakarta', lat: -7.8014, lon: 110.3644 },
    ];

    cities.forEach((city) => {
      this.api.getWeatherByCoord(city.lat, city.lon).subscribe({
        next: (data: WeatherResponse) => {
          const icon = data.weather[0].icon;
          const description = data.weather[0].description;
          const marker = L.marker([city.lat, city.lon], {
            icon: L.icon({
              iconUrl: `https://openweathermap.org/img/wn/${icon}.png`,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            }),
          }).addTo(this.map);

          marker.bindPopup(
            `<b>${city.name}</b><br>${description}<br>Suhu: ${data.main.temp}°C`
          );
        },
        error: (err) => {
          console.error('Gagal memuat cuaca untuk', city.name);
        },
      });
    });
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
