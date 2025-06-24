export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number; // suhu sekarang
    feels_like: number; // suhu terasa
    temp_min: number; // suhu minimum
    temp_max: number; // suhu maksimum
    pressure: number; // tekanan udara (hPa)
    humidity: number; // kelembapan (%)
    sea_level?: number; // tekanan laut (opsional)
    grnd_level?: number; // tekanan permukaan tanah (opsional)
  };
  visibility: number; // dalam meter
  wind: {
    speed: number; // m/s
    deg: number; // arah angin (derajat)
    gust?: number; // hembusan angin (opsional)
  };
  clouds: {
    all: number; // persen tutupan awan
  };
  dt: number; // timestamp UTC
  sys: {
    type?: number;
    id?: number;
    country: string; // kode negara, e.g. "ID"
    sunrise: number; // timestamp UTC
    sunset: number; // timestamp UTC
  };
  timezone: number; // offset UTC dalam detik
  id: number; // ID kota
  name: string; // nama kota
  cod: number; // HTTP status code
}
