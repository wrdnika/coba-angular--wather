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
  filterWeather: { [key: string]: boolean } = {
    Rain: false,
    Clear: false,
    Clouds: false,
    Drizzle: false,
    Thunderstorm: false,
  };
  allCityMarkers: L.Marker[] = [];

  isSidebarOpen = false;

  constructor(private api: ApiService) {}

  ngAfterViewInit() {
    this.initMap();
    this.loadMultipleCitiesWeather();
  }

  private initMap() {
    this.map = L.map('map', { zoomControl: false }).setView([-2.2, 117.8], 5);
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(this.map);
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
      { name: 'Malang', lat: -7.9833, lon: 112.6167 },
      { name: 'Tangerang', lat: -6.1781, lon: 106.63 },
      { name: 'Bekasi', lat: -6.2349, lon: 106.9925 },
      { name: 'Bogor', lat: -6.595, lon: 106.8166 },
      { name: 'Pekanbaru', lat: 0.5333, lon: 101.45 },
      { name: 'Batam', lat: 1.0667, lon: 104.0167 },
      { name: 'Bandar Lampung', lat: -5.45, lon: 105.2667 },
      { name: 'Samarinda', lat: -0.5, lon: 117.15 },
      { name: 'Mataram', lat: -8.5833, lon: 116.1167 },
      { name: 'Bengkulu', lat: -3.7956, lon: 102.2592 },
      { name: 'Jambi', lat: -1.59, lon: 103.61 },
      { name: 'Serang', lat: -6.12, lon: 106.1503 },
      { name: 'Kupang', lat: -10.1667, lon: 123.5833 },
      { name: 'Palu', lat: -0.895, lon: 119.8592 },
    ];

    this.allCityMarkers.forEach((m) => this.map.removeLayer(m));
    this.allCityMarkers = [];

    cities.forEach((city) => {
      this.api.getWeatherByCoord(city.lat, city.lon).subscribe({
        next: (data: WeatherResponse) => {
          const { icon, description } = data.weather[0];
          const { temp, temp_min, temp_max, pressure, humidity } = data.main;
          const windSpeed = data.wind.speed;
          const main = data.weather[0].main;

          const marker = L.marker([city.lat, city.lon], {
            icon: L.icon({
              iconUrl: `https://openweathermap.org/img/wn/${icon}.png`,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            }),
          }).addTo(this.map);

          marker.bindPopup(
            `<b>${city.name}</b><br/>
          ${description}<br/>
          🌡️ Suhu: ${temp}°C<br/>
          🔻 Min: ${temp_min}°C, 🔺 Max: ${temp_max}°C<br/>
          💧 Kelembapan: ${humidity}%<br/>
          📏 Tekanan: ${pressure} hPa<br/>
          🌬️ Angin: ${windSpeed} m/s`
          );
          (marker as any).weatherType = main;
          marker.addTo(this.map);
          this.allCityMarkers.push(marker);
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
      next: (data: WeatherResponse) => {
        this.weatherData = data;
        this.errorMessage = '';
        this.isLoading = false;
        this.history.unshift(this.city);

        const { lat, lon } = data.coord;
        const { icon, description } = data.weather[0];
        const { temp, temp_min, temp_max, pressure } = data.main;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;

        // Update map view
        this.map.setView([lat, lon], 8);

        // Hapus marker lama
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }

        // Buat icon cuaca custom
        const weatherIcon = L.icon({
          iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -50],
        });

        // Tambahkan marker dengan info popup lengkap
        this.marker = L.marker([lat, lon], { icon: weatherIcon })
          .addTo(this.map)
          .bindPopup(
            `<b>${this.city}</b><br/>
          ${description}<br/>
          🌡️ Suhu: ${temp}°C<br/>
          🔻 Min: ${temp_min}°C, 🔺 Max: ${temp_max}°C<br/>
          💧 Kelembapan: ${humidity}%<br/>
          📏 Tekanan: ${pressure} hPa<br/>
          🌬️ Angin: ${windSpeed} m/s`
          )
          .openPopup();
      },
      error: () => {
        this.errorMessage = 'Kota tidak ditemukan atau terjadi kesalahan.';
        this.weatherData = null;
        this.isLoading = false;
      },
    });
  }
  applyWeatherFilter() {
    const selectedTypes = Object.keys(this.filterWeather).filter(
      (type) => this.filterWeather[type]
    );

    this.allCityMarkers.forEach((marker) => {
      const markerWeather = (marker as any).weatherType;
      if (selectedTypes.length === 0 || selectedTypes.includes(markerWeather)) {
        marker.addTo(this.map);
      } else {
        this.map.removeLayer(marker);
      }
    });
  }

  getMyLocationWeather() {
    if (!navigator.geolocation) {
      this.errorMessage = 'Geolocation tidak didukung di browser ini.';
      return;
    }

    this.isLoading = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.api.getWeatherByCoord(lat, lon).subscribe({
          next: (data: WeatherResponse) => {
            this.weatherData = data;
            this.errorMessage = '';
            this.isLoading = false;
            const { icon, description } = data.weather[0];
            const { temp, temp_min, temp_max, pressure, humidity } = data.main;
            const windSpeed = data.wind.speed;

            // geser peta
            this.map.setView([lat, lon], 10);

            // hapus marker sebelumnya jika ada
            if (this.marker) {
              this.map.removeLayer(this.marker);
            }

            // buat marker baru
            const weatherIcon = L.icon({
              iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
              iconSize: [50, 50],
              iconAnchor: [25, 50],
              popupAnchor: [0, -50],
            });

            this.marker = L.marker([lat, lon], { icon: weatherIcon })
              .addTo(this.map)
              .bindPopup(
                `<b>Lokasi Saya</b><br/>
              ${description}<br/>
              🌡️ Suhu: ${temp}°C<br/>
              🔻 Min: ${temp_min}°C, 🔺 Max: ${temp_max}°C<br/>
              💧 Kelembapan: ${humidity}%<br/>
              📏 Tekanan: ${pressure} hPa<br/>
              🌬️ Angin: ${windSpeed} m/s`
              )
              .openPopup();
          },
          error: () => {
            this.errorMessage = 'Gagal mendapatkan data cuaca lokasi Anda.';
            this.isLoading = false;
          },
        });
      },
      (error) => {
        this.errorMessage = 'Izin lokasi ditolak atau terjadi kesalahan.';
        this.isLoading = false;
      }
    );
  }
}
