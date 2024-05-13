export interface IsochroneRequest {
    id: string;
    locations: LatLng[];
    location_type: string;
    range: number[];
    range_type: string;
    units: string;
    options: RouteOptions;
    area_units: string;
    intersections: boolean;
    attributes: string[];
    interval: number;
    smoothing: number;
}

interface RouteOptions {
    avoid_borders: string;
}

export interface IsochroneRequest {
    id: string;
    locations: LatLng[];
    location_type: string;
    range: number[];
    range_type: string;
    units: string;
    options: RouteOptions;
    area_units: string;
    intersections: boolean;
    attributes: string[];
    interval: number;
    smoothing: number;
}

interface RouteOptions {
    avoid_borders: string;
}

type LatLng = [number, number];