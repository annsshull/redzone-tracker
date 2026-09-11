/**
 * RedZone Tracker - Geospatial Map Controller (Ultra-Modern Edition)
 * Built with Leaflet.js and CartoDB Dark Matter tiles.
 * Provides interactive hazard zonation, state borders, live threat markers, and zone inspection.
 */

import { HAZARD_ZONES_GEOJSON, HABITATIONS_DATA, SAFE_HAVEN_DESTINATIONS } from './data.js';
import { calculateRelocationPriority } from './algorithms.js';

export class MapController {
  constructor(mapElementId = "map-container") {
    this.mapElementId = mapElementId;
    this.map = null;
    this.zoneLayerGroup = null;
    this.habitationLayerGroup = null;
    this.safeHavenLayerGroup = null;
    this.liveEventsLayerGroup = null;
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

    // Initialize Leaflet Map
    this.map = L.map(this.mapElementId, {
      center: INDIA_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 4,
      maxZoom: 16,
      zoomControl: false // Custom Apple-styled buttons in HUD
    });

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
}
