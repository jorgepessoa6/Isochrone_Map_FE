import React, { useEffect, useState } from 'react';
import {MapContainer, TileLayer, useMapEvents, Marker, Popup, Polygon, ZoomControl} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MapService from '../../services/MapService';
import {IsochroneRequest} from "../../types/Isochrone"; // Import your MapService
import {Box, Button, Select, MenuItem, IconButton, Grid, CircularProgress} from '@mui/material';
import { DirectionsCar, DirectionsBike, DirectionsWalk } from '@mui/icons-material';
import { icon, Icon } from 'leaflet';
import markerIcon from './marker.png';
interface MapProps {
    center: [number, number];
}

const myIcon: Icon = icon({
    iconUrl: markerIcon,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [-3, -76]
});

const IsochroneMap: React.FC<MapProps> = ({ center }) => {
    const [markerPosition, setMarkerPosition] = useState(center);
    const [isochroneData, setIsochroneData] = useState(null); // State to store the isochrone data
    const [time, setTime] = React.useState(15);
    const [mode, setMode] = React.useState('driving-car');
    const [isLoading, setIsLoading] = React.useState(false);
    const handleTimeChange = (event : any) => {
        const newTime = event.target.value;
        setTime(newTime);
        calculateIsochrone(markerPosition, newTime, mode);
    };

    const handleModeChange = (newMode : string) => {
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
            <Marker position={markerPosition} icon={myIcon}>
                <Popup>You clicked here</Popup>
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
            setIsochroneData(coordinates);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        calculateIsochrone(markerPosition, time, mode);
    }, []);

    return (
        <Grid container style={{ position: 'relative' }}>
            <Grid item style={{ position: 'absolute', zIndex: 1, margin: '5px' }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                    backgroundColor: 'white',
                    margin: '5px',
                    borderRadius: '5px',
                    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
                    position: 'relative' // Add this to position the overlay and spinner
                }}>
                    {isLoading && (
                        <>
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
                        </>
                    )}
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
                        inputProps={{'aria-label': 'Without label'}}
                        disabled={isLoading}
                    >
                        <MenuItem value={5}>5 min</MenuItem>
                        <MenuItem value={15}>15 min</MenuItem>
                        <MenuItem value={30}>30 min</MenuItem>
                        <MenuItem value={60}>60 min</MenuItem>
                    </Select>
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
                </MapContainer>
            </Grid>
        </Grid>
    );
}

export default IsochroneMap;
