declare module 'mapbox-gl' {
  export interface MapboxOptions {
    container: HTMLElement | string;
    style?: string;
    center?: [number, number];
    zoom?: number;
  }

  export class Map {
    constructor(options: MapboxOptions);
  addControl(control: unknown): void;
    remove(): void;
  }

  export class NavigationControl {
    constructor();
  }

  export class Popup {
    constructor();
    setLngLat(lnglat: [number, number]): this;
    setHTML(html: string): this;
    addTo(map: Map): this;
  }

  export class Marker {
    constructor(options?: { color?: string });
    setLngLat(lnglat: [number, number]): this;
    addTo(map: Map): this;
  }

  const mapboxgl: {
    accessToken: string;
    Map: typeof Map;
    NavigationControl: typeof NavigationControl;
    Popup: typeof Popup;
    Marker: typeof Marker;
  };

  export default mapboxgl;
}
