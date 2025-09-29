declare module 'mapbox-gl' {
  export interface MapboxOptions {
    container: HTMLElement | string;
    style?: string;
    center?: [number, number];
    zoom?: number;
  }

  export class Map {
    constructor(options: MapboxOptions);
    addControl(control: any): void;
    remove(): void;
  }

  export class NavigationControl {
    constructor();
  }

  const mapboxgl: {
    accessToken: string;
    Map: typeof Map;
    NavigationControl: typeof NavigationControl;
  };

  export default mapboxgl;
}
