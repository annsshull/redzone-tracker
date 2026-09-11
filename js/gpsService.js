/**
 * RedZone Tracker - Live GPS Telemetry & Proximity Engine
 * Manages user geolocation, continuous watch tracking, permission states,
 * and calculates Haversine proximity to active Red Zones and Safe Havens.
 */

import { HABITATIONS_DATA, SAFE_HAVEN_DESTINATIONS } from './data.js';

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function evaluateUserHazardProximity(lat, lng) {
  // Find nearest high-risk habitation / red zone
  let nearestHab = null;
  let minHabDist = Infinity;

  HABITATIONS_DATA.forEach(hab => {
    const d = calculateDistanceKm(lat, lng, hab.lat, hab.lng);
    if (d < minHabDist) {
      minHabDist = d;
      nearestHab = hab;
    }
  });

  // Find nearest safe haven
  let nearestHaven = null;
  let minHavenDist = Infinity;

  SAFE_HAVEN_DESTINATIONS.forEach(haven => {
    const d = calculateDistanceKm(lat, lng, haven.lat, haven.lng);
    if (d < minHavenDist) {
      minHavenDist = d;
      nearestHaven = haven;
    }
  });

  let threatLevel = "SAFE";
  let threatLabel = "🟢 STABLE: Outside Active Hazard Perimeter";
  let threatClass = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";

  if (minHabDist <= 5) {
    threatLevel = "CRITICAL";
    threatLabel = "🚨 CRITICAL DANGER: Within 5km of Active Hazard Red Zone";
    threatClass = "text-red-400 border-red-500/40 bg-red-500/20";
  } else if (minHabDist <= 20) {
    threatLevel = "WARNING";
    threatLabel = "🟠 ELEVATED ADVISORY: Within 20km Hazard Buffer";
    threatClass = "text-amber-400 border-amber-500/40 bg-amber-500/20";
  } else if (minHabDist <= 50) {
    threatLevel = "MONITORED";
    threatLabel = "🟡 REGIONAL ADVISORY: Monitoring Basin Telemetry";
    threatClass = "text-yellow-400 border-yellow-500/40 bg-yellow-500/20";
  }

  return {
    nearestRedZone: nearestHab ? {
      id: nearestHab.id,
      name: nearestHab.name,
      district: nearestHab.district,
      state: nearestHab.state,
      hazardType: nearestHab.hazardType,
      hazardScore: nearestHab.hazardScore,
      distanceKm: minHabDist
    } : null,
    nearestSafeHaven: nearestHaven ? {
      id: nearestHaven.id,
      name: nearestHaven.name,
      district: nearestHaven.district,
      state: nearestHaven.state,
      distanceKm: minHavenDist,
      headroom: nearestHaven.availableCapacityHeadroom
    } : null,
    threatLevel,
    threatLabel,
    threatClass
  };
}

class GPSService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.currentPosition = null;
    this.subscribers = [];
  }

  isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  hasStoredPermission() {
    return localStorage.getItem('raksha_gps_permission') === 'granted';
  }

  setStoredPermission(granted) {
    if (granted) {
      localStorage.setItem('raksha_gps_permission', 'granted');
    } else {
      localStorage.removeItem('raksha_gps_permission');
    }
  }

  startTracking(onSuccess, onError) {
    if (!this.isGeolocationAvailable()) {
      const err = new Error("Geolocation is not supported by your browser.");
      if (onError) onError(err);
      return;
    }

    if (this.watchId !== null) {
      this.stopTracking();
    }

    this.isTracking = true;

    const options = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 3000
    };

    const handleSuccess = (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const proximity = evaluateUserHazardProximity(latitude, longitude);

      this.currentPosition = {
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
        proximity,
        timestamp: pos.timestamp
      };

      this.notifySubscribers(this.currentPosition);
      if (onSuccess) onSuccess(this.currentPosition);

      // Global event
      window.dispatchEvent(new CustomEvent('raksha-gps-update', {
        detail: this.currentPosition
      }));
    };

    const handleError = (err) => {
      console.warn("GPS Tracking Error:", err.message);
      if (onError) onError(err);
      window.dispatchEvent(new CustomEvent('raksha-gps-error', {
        detail: { code: err.code, message: err.message }
      }));
    };

    // First do a quick single fix
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Then start watch position for continuous telemetry
    this.watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.currentPosition = null;

    window.dispatchEvent(new CustomEvent('raksha-gps-stopped'));
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers(data) {
    this.subscribers.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error("Subscriber notification error:", e);
      }
    });
  }
}

export const gpsService = new GPSService();
