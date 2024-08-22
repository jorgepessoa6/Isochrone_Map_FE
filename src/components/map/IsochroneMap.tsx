import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, Polygon, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapService from '../../services/MapService';
import { IsochroneRequest } from "../../types/Isochrone";
import { Box, Select, MenuItem, IconButton, Grid, CircularProgress} from '@mui/material';
import { DirectionsCar, DirectionsBike, DirectionsWalk } from '@mui/icons-material';
import { icon, Icon } from 'leaflet';
import markerIcon from './marker/marker.png';
import houseIcon from './marker/house.png';
import * as turf from "@turf/turf";
import { LatLngTuple } from 'leaflet';

interface MapProps {
    center: [number, number];
}

const myIcon: Icon = icon({
    iconUrl: houseIcon,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -20]
});

const myIconL: Icon = icon({
    iconUrl: markerIcon,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [-3, -76]
});

declare const require: {
    context: (path: string, deep?: boolean, filter?: RegExp) => {
        keys: () => string[];
        (id: string): any;
    };
};

const IsochroneMap: React.FC<MapProps> = ({ center }) => {
    const [markerPosition, setMarkerPosition] = useState(center);
    const [isochroneData, setIsochroneData] = useState(null); // State to store the isochrone data
    const [time, setTime] = React.useState(15);
    const [mode, setMode] = React.useState('driving-car');
    const [isLoading, setIsLoading] = React.useState(false);
    const [randomPoints, setRandomPoints] = useState<LatLngTuple[]>([]);

    const importAllImages = (r: any) => {
        return r.keys()
            .map((key: string) => ({
                path: r(key), // Import the image
                filename: parseInt(key.match(/(\d+)\./)![1], 10) // Extract the numeric part of the filename
            }))
            .sort((a: any, b: any) => a.filename - b.filename) // Sort images by the numeric value of the filename
            .map((file: any) => file.path); // Return only the image paths in the correct order
    };
    const images = importAllImages(require.context('./images', false, /\.(png|jpe?g|svg)$/));

    const descriptions = [
        "Mansão de luxo com piscina",
        "T3 com vista deslumbrante",
        "Apartamento moderno no centro",
        "Casa rústica com jardim",
        "Vivenda espaçosa com garagem",
        "Moradia geminada com varanda",
        "T2 acolhedor perto do mar",
        "Chalé encantador na serra",
        "Quinta com terreno agrícola",
        "Estúdio elegante em zona urbana",
        "Moradia com piscina e barbecue",
        "Apartamento T1 com terraço",
        "Duplex com acabamentos de luxo",
        "T4 com lareira e jardim",
        "Casa de campo"
    ];


    const handleTimeChange = (event: any) => {
        const newTime = event.target.value;
        setTime(newTime);
        calculateIsochrone(markerPosition, newTime, mode);
    };

    const handleModeChange = (newMode: string) => {
        setMode(newMode);
        calculateIsochrone(markerPosition, time, newMode);
    };

    const Markers = () => {
        const map = useMapEvents({
            click: async (e) => {
                setMarkerPosition([e.latlng.lat, e.latlng.lng]);
                await calculateIsochrone([e.latlng.lat, e.latlng.lng], time, mode);
            },
        });

        useEffect(() => {
            map.flyTo(markerPosition);
        }, [markerPosition]);

        return markerPosition === null ? null : (
            <Marker position={markerPosition} icon={myIconL}>
            </Marker>
        );
    };

    const calculateIsochrone = async (position: number[], time: number, mode: string) => {
        setIsLoading(true);
        const requestBody: IsochroneRequest = {
            id: "my_request",
            locations: [[position[1], position[0]]],
            location_type: "start",
            range: [time * 60],
            range_type: "time",
            units: "m",
            options: {
                avoid_borders: "controlled"
            },
            area_units: "m",
            intersections: false,
            attributes: ["area"],
            interval: time * 60,
            smoothing: 0
        };
        try {
            const response = await MapService.isochroneInformation(requestBody, mode);
            let coordinates = response.features[0].geometry.coordinates[0];
            coordinates = coordinates.map((c: any[]) => [c[1], c[0]]);

            const polygon = turf.polygon([coordinates]); // Create a polygon from the coordinates
            const randomPoints = generateRandomPointsInsideIsochrone(polygon, 15); // Generate 15 random points


            setIsochroneData(coordinates);
            setRandomPoints(randomPoints);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    // Function to generate random points within the isochrone polygon
    const generateRandomPointsInsideIsochrone = (polygon: any, numberOfPoints: number): LatLngTuple[] => {
        const points: LatLngTuple[] = [];
        const bbox = turf.bbox(polygon); // Get bounding box of the polygon
        while (points.length < numberOfPoints) {
            const randomPoint = turf.randomPoint(1, { bbox }).features[0];
            if (turf.booleanPointInPolygon(randomPoint, polygon)) {
                const [lng, lat] = randomPoint.geometry.coordinates;
                points.push([lng, lat]); // Ensure the tuple is in [lat, lng] order
            }
        }
        return points;
    };

    useEffect(() => {
        calculateIsochrone(markerPosition, time, mode);
    }, []);

    return (
        <Grid container style={{ position: 'relative' }}>
            <Grid item style={{ position: 'absolute', zIndex: 1, margin: '5px' }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 2,
                    backgroundColor: 'white',
                    margin: '5px',
                    borderRadius: '5px',
                    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
                    position: 'relative' // Add this to position the overlay and spinner
                }}>
                    {isLoading && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)' // Semi-transparent overlay
                        }}>
                            <CircularProgress />
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => handleModeChange('driving-car')} color={mode === 'driving-car' ? 'primary' : 'default'} disabled={isLoading}>
                            <DirectionsCar />
                        </IconButton>
                        <IconButton onClick={() => handleModeChange('cycling-regular')} color={mode === 'cycling-regular' ? 'primary' : 'default'} disabled={isLoading}>
                            <DirectionsBike />
                        </IconButton>
                        <IconButton onClick={() => handleModeChange('foot-walking')} color={mode === 'foot-walking' ? 'primary' : 'default'} disabled={isLoading}>
                            <DirectionsWalk />
                        </IconButton>

                        <Select
                            value={time}
                            onChange={handleTimeChange}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            disabled={isLoading}
                        >
                            <MenuItem value={5}>5 min</MenuItem>
                            <MenuItem value={15}>15 min</MenuItem>
                            <MenuItem value={30}>30 min</MenuItem>
                        </Select>
                    </Box>
                </Box>
            </Grid>
            <Grid item style={{ height: '100vh', width: '100%', zIndex: 0 }}>
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ZoomControl position="topright" />
                    <Markers />
                    {isochroneData && <Polygon positions={isochroneData} />}
                    {randomPoints.map((point, index) => (
                        <Marker key={index} position={point} icon={myIcon}>
                            <Popup>
                                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{descriptions[index]}</p>
                                <img src={images[index]} alt={`House ${index}`} style={{ width: '250px', height: 'auto' }} />
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Grid>
        </Grid>
    );
};

export default IsochroneMap;
