declare module 'maplibre-gl' {
  export interface MapOptions {
    container: HTMLElement | string;
    style?: string;
    center?: [number, number];
    zoom?: number;
  }

  export interface Feature {
    geometry: { coordinates: [number, number] | number[] };
    properties: { [key: string]: unknown } & {
      id?: number;
      cluster_id?: number;
      point_count?: number;
      point_count_abbreviated?: string;
    };
  }

  export interface GeoJSONSource {
    type: 'geojson';
    data: unknown;
    cluster?: boolean;
    clusterMaxZoom?: number;
    clusterRadius?: number;
    getClusterExpansionZoom(clusterId: number, callback: (err: Error | null, zoom: number) => void): void;
  }

  export interface QueryRenderedFeaturesOptions {
    layers?: string[];
  }

  export interface PointLike {
    x: number;
    y: number;
  }

  export type MapMouseEvent = {
    point: PointLike;
    features?: Feature[];
  };

  export class Map {
    constructor(options: MapOptions);
    addControl(control: unknown): void;
    remove(): void;
    on(type: 'load', listener: () => void): void;
    on(type: 'movestart' | 'moveend', listener: () => void): void;
    on(type: 'click', layer: string, listener: (e: MapMouseEvent) => void): void;
    easeTo(opts: { center?: [number, number]; zoom?: number } | unknown): void;
    getSource(name: string): GeoJSONSource | undefined;
    queryRenderedFeatures(point: PointLike | [number, number], opts?: QueryRenderedFeaturesOptions): Feature[];
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

  const maplibregl: {
    Map: typeof Map;
    NavigationControl: typeof NavigationControl;
    Popup: typeof Popup;
    Marker: typeof Marker;
  };

  export default maplibregl;
}
