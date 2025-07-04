import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Globe from 'globe.gl';

@Component({
  selector: 'app-globe-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './globe-view.html',
  styleUrls: ['./globe-view.css'],
})
export class GlobeViewComponent implements AfterViewInit, OnChanges {
  @ViewChild('globeContainer', { static: true }) globeContainer!: ElementRef;
  @Input() cities: any[] = [];
  globeInstance: any;

  ngAfterViewInit(): void {
    this.globeInstance = new Globe(this.globeContainer.nativeElement)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#3a228a')
      .atmosphereAltitude(0.25)
      .backgroundColor('rgba(0,0,0,0)')
      .pointAltitude('size')
      .pointColor('color')
      .pointLabel((d: any) => `<b>${d.city}</b><br/>${d.weather}`);

    this.focusOnIndonesia();
    this.updatePoints();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cities'] && this.globeInstance) {
      this.updatePoints();
    }
  }

  updatePoints() {
    if (!this.cities || this.cities.length === 0) return;

    const points = this.cities.map((city) => ({
      lat: city.lat,
      lng: city.lon,
      size: 1.5,
      color: this.getColor(city.weather),
      city: city.name,
      weather: city.weather,
    }));

    this.globeInstance.pointsData(points);
  }

  getColor(weather: string): string {
    switch (weather) {
      case 'Rain':
        return 'lightblue';
      case 'Clear':
        return 'yellow';
      case 'Clouds':
        return 'gray';
      case 'Drizzle':
        return 'lightgray';
      case 'Thunderstorm':
        return 'purple';
      default:
        return 'white';
    }
  }

  focusOnIndonesia() {
    this.globeInstance.pointOfView(
      { lat: -2.2, lng: 117.8, altitude: 2.5 },
      1500
    );
  }
}
