/**
 * RedZone Tracker - Geospatial Map Controller (Ultra-Modern Edition)
 * Built with Leaflet.js and CartoDB Dark Matter tiles.
 * Provides interactive hazard zonation, state borders, live threat markers, and zone inspection.
 */

import { HAZARD_ZONES_GEOJSON, HABITATIONS_DATA, SAFE_HAVEN_DESTINATIONS, CITY_INTELLIGENCE_DATA } from './data.js';
import { calculateRelocationPriority } from './algorithms.js';

export class MapController {
  constructor(mapElementId = "map-container") {
    this.mapElementId = mapElementId;
    this.map = null;
    this.zoneLayerGroup = null;
    this.habitationLayerGroup = null;
    this.safeHavenLayerGroup = null;
    this.liveEventsLayerGroup = null;
    this.userLocationLayerGroup = null;
    this.cityIntelligenceLayerGroup = null;
    this.evacuationPathsLayerGroup = null;
    this.activeEvacuationPathId = 'all';
    this.activeCityData = null;
    this.cityRedPopup = null;
    this.cityGreenPopup = null;
    this.userMarker = null;
    this.userAccuracyCircle = null;
    this.activeLayers = {
      redZones: true,
      habitations: true,
      safeHavens: true,
      liveAlerts: true
    };
    this.onSelectHabitationCallback = null;
  }

  init(onSelectHabitation) {
    this.onSelectHabitationCallback = onSelectHabitation;

    // Center coordinates for India
    const INDIA_CENTER = [22.5937, 78.9629];
    const DEFAULT_ZOOM = 5;

    // Initialize or attach to existing Leaflet Map
    if (window.map) {
      this.map = window.map;
    } else if (window.L && L.DomUtil.get(this.mapElementId) && L.DomUtil.get(this.mapElementId)._leaflet_id) {
      this.map = window.standaloneMap || window.map;
    } else {
      this.map = L.map(this.mapElementId, {
        center: INDIA_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 4,
        maxZoom: 16,
        zoomControl: false
      });
      window.map = this.map;
    }

    // 100% Free, Reliable Keyless Base Tile Layers (NO API Key Needed)
    this.baseLayers = {
      dark: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | NDMA Geospatial',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
        className: 'dark-tiles'
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
        className: 'satellite-tiles'
      }),
      street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19
      })
    };

    // Set Default Keyless Dark Layer
    this.currentBaseLayer = this.baseLayers.dark;
    this.currentBaseLayer.addTo(this.map);

    // Layer groups
    this.zoneLayerGroup = L.layerGroup().addTo(this.map);
    this.habitationLayerGroup = L.layerGroup().addTo(this.map);
    this.safeHavenLayerGroup = L.layerGroup().addTo(this.map);
    this.liveEventsLayerGroup = L.layerGroup().addTo(this.map);
    this.userLocationLayerGroup = L.layerGroup().addTo(this.map);
    this.cityIntelligenceLayerGroup = L.layerGroup().addTo(this.map);
    this.evacuationPathsLayerGroup = L.layerGroup().addTo(this.map);

    // Render features
    this.renderHazardZones();
    this.renderHabitationMarkers();
    this.renderSafeHavenMarkers();

    // Ensure Leaflet recalculates viewport bounds immediately and after layout render
    const refreshMap = () => {
      if (this.map) {
        this.map.invalidateSize(true);
      }
    };
    setTimeout(refreshMap, 100);
    setTimeout(refreshMap, 300);
    setTimeout(refreshMap, 700);
    setTimeout(refreshMap, 1500);
    window.addEventListener('resize', refreshMap);
    window.addEventListener('load', refreshMap);

    console.log("Geospatial Map initialized with 100% free, keyless dark tiles.");
  }

  // Switch Base Map Layer (Dark / Satellite / Street)
  setBaseLayer(type) {
    if (!this.baseLayers || !this.baseLayers[type]) return;
    if (this.currentBaseLayer) {
      this.map.removeLayer(this.currentBaseLayer);
    }
    this.currentBaseLayer = this.baseLayers[type];
    this.currentBaseLayer.addTo(this.map);
    // Ensure overlays remain in front
    if (this.zoneLayerGroup) this.zoneLayerGroup.bringToFront();
    if (this.corridorLayerGroup) this.corridorLayerGroup.bringToFront();
  }

  // Custom Zoom Controls
  zoomIn() {
    if (this.map) this.map.zoomIn();
  }

  zoomOut() {
    if (this.map) this.map.zoomOut();
  }

  resetView() {
    if (this.map) {
      this.map.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    }
  }

  invalidateSize() {
    if (this.map) {
      this.map.invalidateSize(true);
    }
  }

  flyToLocation(lat, lng, zoom = 12) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, {
        duration: 1.4,
        easeLinearity: 0.25
      });
    }
  }

  // Render Hazard Polygons
  renderHazardZones() {
    this.zoneLayerGroup.clearLayers();

    L.geoJSON(HAZARD_ZONES_GEOJSON, {
      style: (feature) => {
        const type = feature.properties.zoneType;
        let fillColor = '#FF3B30';
        let strokeColor = '#FF6961';

        if (type === 'ORANGE_ZONE') {
          fillColor = '#FF9500';
          strokeColor = '#FFAA33';
        } else if (type === 'GREEN_ZONE') {
          fillColor = '#30D158';
          strokeColor = '#5CE67E';
        }

        return {
          color: strokeColor,
          weight: 2,
          opacity: 0.9,
          fillColor: fillColor,
          fillOpacity: 0.32,
          dashArray: type === 'RED_ZONE' ? '5, 5' : null
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const popupContent = `
          <div class="p-3.5 max-w-xs font-sans text-slate-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                props.zoneType === 'RED_ZONE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                props.zoneType === 'ORANGE_ZONE' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }">
                ${props.zoneType.replace('_', ' ')}
              </span>
              <span class="text-xs font-mono font-semibold text-slate-400">Score: ${props.riskScore}</span>
            </div>
            <h4 class="font-bold text-sm text-white mb-0.5 tracking-tight">${props.name}</h4>
            <p class="text-[11px] text-slate-400 mb-2.5">${props.hazardType} (${props.district}, ${props.state})</p>
            <div class="grid grid-cols-2 gap-2 text-[11px] bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.08] mb-3">
              <div><span class="text-slate-500">CCI Index:</span> <b class="text-white">${props.cci}</b></div>
              <div><span class="text-slate-500">Habitations:</span> <b class="text-white">${props.habitationsCount}</b></div>
              <div class="col-span-2"><span class="text-slate-500">Pop At Risk:</span> <b class="text-red-400 font-bold">${props.vulnerablePop.toLocaleString()}</b></div>
            </div>
            <button class="w-full text-xs bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold py-2 px-3 rounded-xl transition-all shadow-md shadow-red-600/30"
              onclick="window.dispatchEvent(new CustomEvent('inspect-zone', { detail: '${feature.id}' }))">
              Inspect Zone Intelligence
            </button>
          </div>
        `;
        layer.bindPopup(popupContent, {
          className: 'apple-glass-popup',
          closeButton: false
        });

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ fillOpacity: 0.52, weight: 3 });
          },
          mouseout: (e) => {
            const l = e.target;
            l.setStyle({ fillOpacity: 0.32, weight: 2 });
          }
        });
      }
    }).addTo(this.zoneLayerGroup);
  }

  // Render Habitation Pin Markers
  renderHabitationMarkers() {
    this.habitationLayerGroup.clearLayers();

    HABITATIONS_DATA.forEach(hab => {
      const priority = calculateRelocationPriority(hab);
      const isRed = hab.status === "RED_ZONE";
      const isOrange = hab.status === "ORANGE_ZONE";

      const pinColor = isRed ? "bg-red-500 shadow-red-500/80 threat-live-beacon" :
                       isOrange ? "bg-orange-500 shadow-orange-500/80" : "bg-emerald-500 shadow-emerald-500/80";

      const customIcon = L.divIcon({
        className: 'custom-hab-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-7 h-7 rounded-2xl ${pinColor} flex items-center justify-center text-white text-[10px] font-bold shadow-xl border-2 border-white/90 transition-transform group-hover:scale-125">
              ${isRed ? '!' : '●'}
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap bg-slate-900/95 backdrop-blur-md text-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              ${hab.name}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([hab.lat, hab.lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3.5 max-w-xs font-sans text-slate-100">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              isRed ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400'
            }">
              ${hab.hazardType}
            </span>
            <span class="text-xs font-mono font-bold text-red-400">Score: ${hab.hazardScore}</span>
          </div>
          <h4 class="font-bold text-sm text-white mb-0.5 tracking-tight">${hab.name}</h4>
          <p class="text-[11px] text-slate-400 mb-2.5">${hab.district}, ${hab.state} • Elev: ${hab.elevation}</p>
          
          <div class="space-y-1.5 text-xs bg-white/[0.04] p-3 rounded-xl border border-white/[0.08] mb-3">
            <div class="flex justify-between"><span class="text-slate-500">Population:</span> <b class="text-white">${hab.population.toLocaleString()} (${hab.households} families)</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Kutcha Houses:</span> <b class="text-amber-300">${hab.kutchaHousesPct}%</b></div>
            <div class="flex justify-between"><span class="text-slate-500">CC Deficit:</span> <b class="text-red-400 font-bold">+${priority.cc.overloadPercentage}% Overload</b></div>
            <div class="flex justify-between"><span class="text-slate-500">Urgency:</span> <b class="${isRed ? 'text-red-400' : 'text-orange-400'} font-bold">${priority.urgencyTier.split(':')[0]}</b></div>
          </div>

          <button class="w-full text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2 px-3 rounded-xl transition-all shadow-md shadow-blue-600/30"
            onclick="window.dispatchEvent(new CustomEvent('select-habitation', { detail: '${hab.id}' }))">
            Open Relocation Dossier
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'apple-glass-popup',
        closeButton: false
      });

      marker.on('click', () => {
        if (this.onSelectHabitationCallback) {
          this.onSelectHabitationCallback(hab);
        }
      });

      marker.addTo(this.habitationLayerGroup);
    });
  }

  // Render Safe Haven Resettlement Sanctuary Markers
  renderSafeHavenMarkers() {
    this.safeHavenLayerGroup.clearLayers();

    SAFE_HAVEN_DESTINATIONS.forEach(haven => {
      const customIcon = L.divIcon({
        className: 'custom-haven-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-8 h-8 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-xl shadow-emerald-500/50 border-2 border-emerald-300 transition-transform group-hover:scale-125">
              🛡️
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap bg-slate-900/95 backdrop-blur-md text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              ${haven.name}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([haven.lat, haven.lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3.5 max-w-xs font-sans text-slate-100">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Safe Green Haven
            </span>
            <span class="text-xs font-mono font-bold text-emerald-400">CCI: ${haven.carryingCapacityScore}</span>
          </div>
          <h4 class="font-bold text-sm text-white mb-0.5 tracking-tight">${haven.name}</h4>
          <p class="text-[11px] text-slate-400 mb-2.5">${haven.district}, ${haven.state} • ${haven.geology}</p>
          
          <div class="space-y-1.5 text-xs bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60 mb-3">
            <div class="flex justify-between"><span class="text-slate-400">Capacity Headroom:</span> <b class="text-emerald-300 font-bold">+${haven.availableCapacityHeadroom.toLocaleString()} Persons</b></div>
            <div class="flex justify-between"><span class="text-slate-400">Infra Index:</span> <b class="text-emerald-300 font-bold">${haven.infrastructureRating * 100}%</b></div>
            <div class="text-[11px] text-slate-300 pt-1.5 border-t border-emerald-800/40">
              <b>Amenities:</b> ${haven.amenities.slice(0, 3).join(', ')}
            </div>
          </div>

          <div class="text-[11px] text-emerald-300 text-center font-medium bg-emerald-500/10 py-1.5 rounded-xl border border-emerald-500/20">
            Validated Resettlement Destination
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'apple-glass-popup',
        closeButton: false
      });

      marker.addTo(this.safeHavenLayerGroup);
    });
  }

  // Render Real-time Live Threat Epics & Weather Markers
  renderLiveEvents(events) {
    if (!this.liveEventsLayerGroup || !events) return;
    this.liveEventsLayerGroup.clearLayers();

    events.forEach(evt => {
      const isCritical = evt.severity === "CRITICAL";
      const iconText = evt.type === "SEISMIC" ? "⚡" : evt.type === "METEOROLOGICAL" ? "🌧️" : "⚠️";

      const pulseHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute w-12 h-12 rounded-full ${isCritical ? 'bg-red-500/30 animate-ping' : 'bg-amber-500/30 animate-ping'}"></div>
          <div class="w-7 h-7 rounded-full ${isCritical ? 'bg-red-600' : 'bg-amber-600'} flex items-center justify-center text-[11px] text-white shadow-xl border-2 border-white">
            ${iconText}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'live-pulse-marker',
        html: pulseHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([evt.lat, evt.lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 max-w-xs font-sans text-slate-100">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
            }">
              🔴 Live Threat
            </span>
            <span class="text-[10px] text-slate-400 font-mono">${evt.time}</span>
          </div>
          <h5 class="font-bold text-xs text-white mb-1 tracking-tight">${evt.title}</h5>
          <p class="text-[11px] text-slate-300 mb-2"><span class="text-slate-500">Source:</span> ${evt.source}</p>
          <div class="text-[11px] bg-red-950/40 p-2 rounded-xl border border-red-800/40 text-red-200">
            <b>Directive:</b> ${evt.actionRecommendation}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'apple-glass-popup',
        closeButton: false
      });

      marker.addTo(this.liveEventsLayerGroup);
    });
  }

  // Alias for renderLiveEvents
  renderLiveThreatMarkers(events) {
    this.renderLiveEvents(events);
  }

  // Toggle Layer Visibility
  toggleLayer(layerKey, isVisible) {
    this.activeLayers[layerKey] = isVisible;
    if (layerKey === 'redZones') {
      if (isVisible) this.map.addLayer(this.zoneLayerGroup);
      else this.map.removeLayer(this.zoneLayerGroup);
    } else if (layerKey === 'habitations') {
      if (isVisible) this.map.addLayer(this.habitationLayerGroup);
      else this.map.removeLayer(this.habitationLayerGroup);
    } else if (layerKey === 'safeHavens') {
      if (isVisible) this.map.addLayer(this.safeHavenLayerGroup);
      else this.map.removeLayer(this.safeHavenLayerGroup);
    } else if (layerKey === 'liveAlerts') {
      if (isVisible) this.map.addLayer(this.liveEventsLayerGroup);
      else this.map.removeLayer(this.liveEventsLayerGroup);
    }
  }

  // Render User Live GPS Location with Pulsing Radar Beacon
  renderUserLocation(pos, options = { flyTo: true }) {
    if (!this.map || !this.userLocationLayerGroup) return;

    const { lat, lng, accuracy, proximity } = pos;

    // Clear existing user layers
    this.userLocationLayerGroup.clearLayers();

    // Accuracy Circle
    if (accuracy && accuracy > 0) {
      this.userAccuracyCircle = L.circle([lat, lng], {
        radius: Math.min(accuracy, 5000),
        color: '#06b6d4',
        weight: 1.5,
        fillColor: '#06b6d4',
        fillOpacity: 0.10,
        dashArray: '4, 6'
      }).addTo(this.userLocationLayerGroup);
    }

    // Custom DivIcon for Pulsing User Radar Beacon
    const userIcon = L.divIcon({
      className: 'user-gps-marker-container',
      html: `
        <div class="user-gps-pulse-beacon">
          <div class="user-gps-radar-wave"></div>
          <div class="user-gps-radar-wave wave-2"></div>
          <div class="user-gps-center-dot"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    const nearestRedZoneHtml = proximity && proximity.nearestRedZone ? `
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 mb-2">
        <div class="flex items-center justify-between text-[10px] text-red-400 font-bold uppercase">
          <span>Nearest Red Zone</span>
          <span>${proximity.nearestRedZone.distanceKm} km</span>
        </div>
        <div class="text-xs font-bold text-white mt-0.5">${proximity.nearestRedZone.name}</div>
        <div class="text-[10px] text-zinc-400">${proximity.nearestRedZone.hazardType}</div>
      </div>
    ` : '';

    const nearestHavenHtml = proximity && proximity.nearestSafeHaven ? `
      <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 mb-2.5">
        <div class="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase">
          <span>Nearest Safe Haven</span>
          <span>${proximity.nearestSafeHaven.distanceKm} km</span>
        </div>
        <div class="text-xs font-bold text-white mt-0.5">${proximity.nearestSafeHaven.name}</div>
        <div class="text-[10px] text-zinc-400">+${proximity.nearestSafeHaven.headroom ? proximity.nearestSafeHaven.headroom.toLocaleString() : '1,500'} Persons Shelter Capacity</div>
      </div>
    ` : '';

    const popupHtml = `
      <div class="p-3 max-w-[260px] font-sans text-slate-100">
        <div class="flex items-center justify-between mb-2">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            📍 Your Current Position
          </span>
          <span class="text-[10px] text-zinc-400">±${accuracy}m</span>
        </div>
        
        <div class="text-xs text-zinc-300 font-mono mb-2">
          ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E
        </div>

        ${nearestRedZoneHtml}
        ${nearestHavenHtml}

        <div class="text-[10px] font-semibold ${proximity ? proximity.threatClass : 'text-zinc-400'} px-2.5 py-1 rounded-lg border text-center mb-2">
          ${proximity ? proximity.threatLabel : 'Position Acquired'}
        </div>

        <button class="w-full text-xs bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold py-1.5 px-2.5 rounded-xl border border-white/15 transition-all text-center cursor-pointer"
          onclick="window.recenterUserGPS && window.recenterUserGPS()">
          Re-center Map on Me
        </button>
      </div>
    `;

    this.userMarker = L.marker([lat, lng], { icon: userIcon })
      .bindPopup(popupHtml, { className: 'apple-glass-popup', closeButton: false })
      .addTo(this.userLocationLayerGroup);

    if (options.flyTo) {
      this.map.flyTo([lat, lng], 13, {
        duration: 1.4,
        easeLinearity: 0.25
      });
    }
  }

  clearUserLocation() {
    if (this.userLocationLayerGroup) {
      this.userLocationLayerGroup.clearLayers();
    }
    this.userMarker = null;
    this.userAccuracyCircle = null;
  }

  // =========================================================================
  // CITY INTELLIGENCE: CLOSEST RED & GREEN ZONES, PAST HAZARDS & SAFE HOUSES
  // =========================================================================
  renderCityIntelligence(cityData, options = { flyTo: true, autoOpenPopups: true }) {
    if (!this.map || !this.cityIntelligenceLayerGroup) return;

    this.activeCityData = cityData;
    this.cityIntelligenceLayerGroup.clearLayers();

    const { lat, lng, name, district, state, elevation, closestRedZone, closestGreenZone } = cityData;

    // 1. Center & Zoom Map over the selected city
    if (options.flyTo) {
      this.map.flyTo([lat, lng], 12, {
        duration: 1.4,
        easeLinearity: 0.25
      });
    }

    // 2. City Center Epicenter Marker
    const cityIcon = L.divIcon({
      className: 'city-epicenter-marker',
      html: `
        <div class="city-beacon-container">
          <div class="city-beacon-ring"></div>
          <div class="city-beacon-dot">📍</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    const cityPopupHtml = `
      <div class="p-3 font-sans text-slate-100 text-xs">
        <div class="flex items-center space-x-2 mb-1.5">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Selected Study City
          </span>
        </div>
        <div class="text-sm font-bold text-white mb-0.5">${name}</div>
        <div class="text-[11px] text-zinc-400 mb-2">${district}, ${state} • Elev: ${elevation}</div>
        <p class="text-[11px] text-zinc-300 mb-2.5 leading-snug">${cityData.hazardContext}</p>
        <div class="text-[10px] text-zinc-300 border-t border-white/10 pt-2 flex flex-col gap-1">
          <div class="flex items-center justify-between text-red-300">
            <span>🔴 Closest Red Zone:</span>
            <span class="font-bold">${closestRedZone.distanceKm} km (${closestRedZone.bearing})</span>
          </div>
          <div class="flex items-center justify-between text-emerald-300">
            <span>🟢 Closest Safe Haven:</span>
            <span class="font-bold">${closestGreenZone.distanceKm} km</span>
          </div>
        </div>
      </div>
    `;

    L.marker([lat, lng], { icon: cityIcon })
      .bindPopup(cityPopupHtml, { className: 'city-intel-popup amber-theme' })
      .addTo(this.cityIntelligenceLayerGroup);

    // 3. Closest Red Zone Marker & Popup (Past Hazards Timeline with Dates & Casualties)
    const redIcon = L.divIcon({
      className: 'red-danger-marker',
      html: `
        <div class="red-radar-beacon">
          <div class="red-radar-wave"></div>
          <div class="red-radar-wave wave-2"></div>
          <div class="red-radar-center">⚠️</div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -22]
    });

    const redPopupHtml = `
      <div class="p-3.5 font-sans text-slate-100 text-xs max-w-[340px]">
        <div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-red-500/20">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> 🔴 CLOSEST RED ZONE
          </span>
          <span class="text-[10px] font-bold text-red-400 font-mono">${closestRedZone.distanceKm} km from ${name}</span>
        </div>

        <div class="text-sm font-bold text-white leading-tight mb-1">${closestRedZone.name}</div>
        <div class="text-[11px] text-zinc-400 mb-2.5">
          <span class="text-red-400 font-semibold">${closestRedZone.hazardType}</span> • 
          Risk: <b class="text-white">${Math.round(closestRedZone.hazardScore * 100)}%</b> • 
          At Risk: <b class="text-white">${closestRedZone.populationAtRisk.toLocaleString()}</b>
        </div>

        <!-- PAST HAZARDS TIMELINE -->
        <div class="border-t border-red-500/20 pt-2 space-y-1.5">
          <div class="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
            <span>📜 Past Hazards & Disasters</span>
            <span class="text-[9px] text-zinc-400 font-normal">Official Records</span>
          </div>
          <div class="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scroll">
            ${closestRedZone.pastHazards.map(h => `
              <div class="bg-red-950/40 border border-red-500/25 rounded-xl p-2 text-[11px]">
                <div class="flex items-center justify-between font-bold text-red-300 text-[10px] mb-0.5">
                  <span class="px-1.5 py-0.5 rounded bg-red-500/25 text-red-200">${h.date}</span>
                  <span class="text-zinc-300 truncate max-w-[170px]">${h.event}</span>
                </div>
                <div class="text-[11px] text-zinc-200 leading-snug mt-1">
                  <span class="text-red-400 font-semibold">Impact:</span> ${h.affected}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">
          <span>Slope: ${closestRedZone.slope} • Elev: ${closestRedZone.elevation}</span>
          <span class="text-red-400 font-bold">Relocation: Priority Tier 1</span>
        </div>
      </div>
    `;

    const redMarker = L.marker([closestRedZone.lat, closestRedZone.lng], { icon: redIcon })
      .bindPopup(redPopupHtml, {
        className: 'city-intel-popup red-theme',
        autoClose: false,
        closeOnClick: false,
        maxWidth: 350
      })
      .addTo(this.cityIntelligenceLayerGroup);

    // 4. Closest Green Zone Safe Haven Marker & Popup (Safe Houses, Beds, Amenities & Contacts)
    const greenIcon = L.divIcon({
      className: 'green-haven-marker',
      html: `
        <div class="green-radar-beacon">
          <div class="green-radar-wave"></div>
          <div class="green-radar-wave wave-2"></div>
          <div class="green-radar-center">🛡️</div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -22]
    });

    const greenPopupHtml = `
      <div class="p-3.5 font-sans text-slate-100 text-xs max-w-[360px]">
        <div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-emerald-500/20">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 🟢 CLOSEST SAFE HAVEN
          </span>
          <span class="text-[10px] font-bold text-emerald-400 font-mono">${closestGreenZone.distanceKm} km from ${name}</span>
        </div>

        <div class="text-sm font-bold text-white leading-tight mb-1">${closestGreenZone.name}</div>
        <div class="text-[11px] text-zinc-400 mb-2">
          Route: <span class="text-white font-medium">${closestGreenZone.transitRoute}</span> • 
          Headroom: <b class="text-emerald-300">+${closestGreenZone.availableCapacityHeadroom.toLocaleString()} Beds</b>
        </div>

        <!-- SAFE HOUSES LIST -->
        <div class="border-t border-emerald-500/20 pt-2 space-y-1.5">
          <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>🏠 Available Safe Houses & Shelters</span>
            <span class="text-[9px] text-zinc-400 font-normal">Available / Total</span>
          </div>
          <div class="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scroll">
            ${closestGreenZone.safeHouses.map(sh => `
              <div class="bg-emerald-950/40 border border-emerald-500/25 rounded-xl p-2 text-[11px]">
                <div class="flex items-center justify-between font-bold text-white mb-0.5">
                  <span class="truncate max-w-[210px]">${sh.name}</span>
                  <span class="px-1.5 py-0.2 rounded bg-emerald-500/25 text-emerald-300 text-[10px] font-mono shrink-0">${sh.availableBeds} / ${sh.capacity}</span>
                </div>
                <div class="text-[10px] text-zinc-300 leading-snug mt-1">
                  <span class="text-emerald-400 font-semibold">Amenities:</span> ${sh.amenities}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- EMERGENCY CONTACT NUMBERS -->
        <div class="border-t border-emerald-500/20 pt-2 mt-2 space-y-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>📞 Official Emergency Contacts</span>
            <span class="text-[9px] text-zinc-400">Click to Call</span>
          </div>
          <div class="grid grid-cols-2 gap-1.5 text-[10px] pt-0.5">
            ${closestGreenZone.emergencyContacts.map(c => `
              <a href="tel:${c.tel}" class="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 flex flex-col transition-all group cursor-pointer" title="Call ${c.role}">
                <span class="text-zinc-400 truncate text-[9px]">${c.role}</span>
                <span class="font-bold text-emerald-400 group-hover:text-emerald-300 font-mono text-[10px] flex items-center gap-1">
                  <span>📞</span> ${c.contact}
                </span>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const greenMarker = L.marker([closestGreenZone.lat, closestGreenZone.lng], { icon: greenIcon })
      .bindPopup(greenPopupHtml, {
        className: 'city-intel-popup green-theme',
        autoClose: false,
        closeOnClick: false,
        maxWidth: 370
      })
      .addTo(this.cityIntelligenceLayerGroup);

        // 5. Render Multi-Path Evacuation Corridors connecting Red Zone to Safe Haven
    if (cityData.evacuationPaths && cityData.evacuationPaths.length > 0) {
      this.renderEvacuationPaths(cityData.evacuationPaths, 'all');
    } else {
      // Fallback straight lines
      L.polyline([[closestRedZone.lat, closestRedZone.lng], [closestGreenZone.lat, closestGreenZone.lng]], {
        color: '#10b981',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.85
      }).addTo(this.cityIntelligenceLayerGroup);
    }

    // 6. Automatically open BOTH popups simultaneously after map movement finishes
    if (options.autoOpenPopups) {
      const openBoth = () => {
        try {
          if (redMarker && redMarker.openPopup) redMarker.openPopup();
          if (greenMarker && greenMarker.openPopup) greenMarker.openPopup();
        } catch (err) {
          console.warn("Popup trigger error:", err);
        }
      };
      this.map.once('moveend', openBoth);
      setTimeout(openBoth, 1600);
    }

    this.cityRedPopup = redMarker;
    this.cityGreenPopup = greenMarker;
  }

  // =========================================================================
  // MULTI-PATH EVACUATION CORRIDORS & INTERMEDIATE CHECKPOINTS RENDERING
  // =========================================================================
  renderEvacuationPaths(paths, selectedPathId = 'all') {
    if (!this.map || !this.evacuationPathsLayerGroup) return null;
    this.evacuationPathsLayerGroup.clearLayers();
    if (!paths || paths.length === 0) return null;

    this.activeEvacuationPathId = selectedPathId;
    const allBounds = L.latLngBounds([]);

    paths.forEach(path => {
      const isSelected = (selectedPathId === 'all' || selectedPathId === path.id);
      const isDimmed = (selectedPathId !== 'all' && selectedPathId !== path.id);

      const color = path.color || (path.type === 'PRIMARY_HIGHWAY' ? '#10b981' : path.type === 'SECONDARY_BYPASS' ? '#f59e0b' : '#a855f7');
      const weight = isDimmed ? 2.5 : (isSelected && selectedPathId !== 'all' ? 5.5 : 4);
      const opacity = isDimmed ? 0.22 : (isSelected && selectedPathId !== 'all' ? 1.0 : 0.85);

      let dashArray = null;
      if (path.dashArray) dashArray = path.dashArray;
      else if (path.type === 'SECONDARY_BYPASS') dashArray = '8, 6';
      else if (path.type === 'TACTICAL_EMERGENCY') dashArray = '4, 6';

      // 1. Draw Polyline
      const polyline = L.polyline(path.waypoints, {
        color: color,
        weight: weight,
        opacity: opacity,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round',
        className: `evac-polyline-${path.id} ${isSelected ? 'active-path-glow' : ''}`
      }).addTo(this.evacuationPathsLayerGroup);

      path.waypoints.forEach(pt => allBounds.extend(pt));

      // Tooltip
      polyline.bindTooltip(`
        <div class="p-1.5 font-sans text-xs">
          <div class="font-bold text-white flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" style="background:${color};"></span>
            <span>${path.name}</span>
          </div>
          <div class="text-[10px] text-zinc-300 mt-0.5">
            <b>${path.distanceKm} km</b> • ETA: <b>${path.estimatedMinutes} min</b> • <b>${path.throughputPerHour} pers/hr</b>
          </div>
          <div class="text-[9px] text-amber-300 mt-1 font-semibold">
            👉 Click to inspect corridor telemetry & checkpoints
          </div>
        </div>
      `, { sticky: true, className: 'corridor-hover-tooltip' });

      polyline.on('click', () => {
        if (window.selectEvacuationPath) {
          window.selectEvacuationPath(path.id);
        } else {
          this.focusEvacuationPath(path.id);
        }
      });

      // 2. Midpoint Route Badge
      if (!isDimmed && path.waypoints.length > 1) {
        const midIdx = Math.floor(path.waypoints.length / 2);
        const midPt = path.waypoints[midIdx];
        const badgeTypeClass = path.type === 'PRIMARY_HIGHWAY' ? 'primary-badge' : path.type === 'SECONDARY_BYPASS' ? 'secondary-badge' : 'tactical-badge';
        const iconEmoji = path.type === 'PRIMARY_HIGHWAY' ? '🟢' : path.type === 'SECONDARY_BYPASS' ? '🟡' : '🟣';

        const badgeIcon = L.divIcon({
          className: 'corridor-badge-container',
          html: `<div class="corridor-dist-badge ${badgeTypeClass} cursor-pointer" onclick="window.selectEvacuationPath && window.selectEvacuationPath('${path.id}')" title="Click to focus ${path.name}">
                   ${iconEmoji} ${path.distanceKm} km • ${path.estimatedMinutes}m
                 </div>`,
          iconSize: [120, 24],
          iconAnchor: [60, 12]
        });
        L.marker(midPt, { icon: badgeIcon, interactive: true }).addTo(this.evacuationPathsLayerGroup);
      }

      // 3. Intermediate Checkpoints (Bridges, Triage Stations, Helipads, Choke Points)
      if (isSelected && path.chokePoints) {
        path.chokePoints.forEach(cp => {
          const cpIcon = L.divIcon({
            className: 'checkpoint-pin-container',
            html: `
              <div class="evacuation-checkpoint-pin" style="border-color:${color}; background:rgba(10,12,18,0.9);" title="${cp.name}">
                <span>${cp.icon || '📍'}</span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14]
          });

          const cpPopup = `
            <div class="p-2.5 font-sans text-slate-100 text-xs min-w-[210px]">
              <div class="flex items-center justify-between gap-1.5 mb-1">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300">
                  KM ${cp.km} MILESTONE
                </span>
                <span class="text-[9px] font-bold font-mono" style="color:${color}">
                  ${path.tierLabel}
                </span>
              </div>
              <div class="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <span>${cp.icon || '📍'}</span>
                <span>${cp.name}</span>
              </div>
              <p class="text-[10px] text-zinc-300 leading-snug mb-1.5">${cp.desc}</p>
              <div class="text-[9px] text-zinc-400 border-t border-white/10 pt-1 flex justify-between">
                <span>Corridor:</span>
                <span class="font-medium text-white">${path.name}</span>
              </div>
            </div>
          `;

          L.marker([cp.lat, cp.lng], { icon: cpIcon })
            .bindPopup(cpPopup, { className: 'checkpoint-info-popup', maxWidth: 280 })
            .addTo(this.evacuationPathsLayerGroup);
        });
      }
    });

    return allBounds;
  }

  focusEvacuationPath(pathId) {
    if (!this.activeCityData || !this.activeCityData.evacuationPaths) return;
    const paths = this.activeCityData.evacuationPaths;
    this.activeEvacuationPathId = pathId;

    if (pathId === 'all') {
      const allBounds = this.renderEvacuationPaths(paths, 'all');
      if (allBounds && allBounds.isValid()) {
        this.map.fitBounds(allBounds, { padding: [60, 60], maxZoom: 13, duration: 1.0 });
      }
    } else {
      const targetPath = paths.find(p => p.id === pathId);
      if (targetPath) {
        this.renderEvacuationPaths(paths, pathId);
        const pathBounds = L.latLngBounds(targetPath.waypoints);
        this.map.fitBounds(pathBounds, { padding: [70, 70], maxZoom: 14, duration: 1.2 });
      }
    }
  }

  clearEvacuationPaths() {
    if (this.evacuationPathsLayerGroup) {
      this.evacuationPathsLayerGroup.clearLayers();
    }
    this.activeEvacuationPathId = 'all';
  }

  clearCityIntelligence() {
    if (this.cityIntelligenceLayerGroup) {
      this.cityIntelligenceLayerGroup.clearLayers();
    }
    this.clearEvacuationPaths();
    this.activeCityData = null;
    this.cityRedPopup = null;
    this.cityGreenPopup = null;
  }

  zoomToCityRedZone(cityData = this.activeCityData) {
  zoomToCityGreenZone(cityData = this.activeCityData) {
    if (!this.map || !cityData || !cityData.closestGreenZone) return;
    this.map.flyTo([cityData.closestGreenZone.lat, cityData.closestGreenZone.lng], 14, { duration: 1.2 });
    if (this.cityGreenPopup) this.cityGreenPopup.openPopup();
  }

}
