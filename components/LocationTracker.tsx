import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import * as Location from 'expo-location';

const GEOFENCE_RADIUS = 100; // 100 meters (adjustable)

const GeofencingLocation = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [homeLocation, setHomeLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    // Request foreground location permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required for geofencing.');
      return;
    }

    // Request background location permission
    let backgroundStatus = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus.status !== 'granted') {
      Alert.alert('Background Permission Denied', 'We need background location access for geofencing.');
      return;
    }

    // Get initial location and set it as home
    let currentLocation = await Location.getCurrentPositionAsync({});
    setHomeLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });

    // Start real-time location tracking
    startGeofencing();
  };

  const startGeofencing = async () => {
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5, // Update every 5 meters
        timeInterval: 5000, // Update every 5 seconds
      },
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        if (homeLocation) {
          const distance = getDistanceFromHome(latitude, longitude);
          if (distance > GEOFENCE_RADIUS) {
            Alert.alert('You have left your home location!');
          }
        }
      }
    );
  };

  const getDistanceFromHome = (lat: number, lon: number): number =>  {
    if (!homeLocation) return 0;

    const R = 6371e3; // Earth radius in meters
    const φ1 = (homeLocation.latitude * Math.PI) / 180;
    const φ2 = (lat * Math.PI) / 180;
    const Δφ = ((lat - homeLocation.latitude) * Math.PI) / 180;
    const Δλ = ((lon - homeLocation.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  return (
    <View>
      <Text> Current Location:</Text>
      {location && <Text>Lat: {location.latitude}, Lon: {location.longitude}</Text>}
      {homeLocation && <Text> This is the Home Location: Lat: {homeLocation.latitude}, Lon: {homeLocation.longitude}</Text>}
    </View>
  );
};

export default GeofencingLocation;