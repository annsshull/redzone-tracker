/**
 * RedZone Tracker - Core Application Controller (Ultra-Modern Edition)
 * Orchestrates geospatial mapping, live threat telemetry, analytical engines, 
 * multi-language UI localization (10 regional Indian languages), accessibility suite,
 * bookmarks, notifications, and Apple-style UI.
 */

import { HABITATIONS_DATA, SAFE_HAVEN_DESTINATIONS, HISTORICAL_DISASTERS } from './data.js';
import { calculateRelocationPriority, calculateCCI, calculateVulnerability, findBestSafeHaven, estimateRelocationBudget } from './algorithms.js';
import { MapController } from './map.js';
import { liveFeedService } from './liveFeed.js';
import { gpsService } from './gpsService.js';
import { simulationEngine } from './simulation.js';
import { generateDistrictCollectorBrief } from './exportReport.js';
import { TRANSLATIONS } from './translations.js';

class RedZoneApp {
  constructor() {
    this.mapController = new MapController("map-container");
    this.currentHabitation = HABITATIONS_DATA[0]; // Default: Sunil Ward (Joshimath)
    this.rankedHabitations = [];
    this.currentLanguage = localStorage.getItem('redzone_lang') || 'en';
    this.currentFontSize = localStorage.getItem('redzone_fontsize') || 'medium';
    this.currentColorBlind = localStorage.getItem('redzone_colorblind') || 'none';
    this.magnifierActive = false;
    this.bookmarks = JSON.parse(localStorage.getItem('redzone_bookmarks') || '[]');
    this.liveFeedService = liveFeedService;
    window.liveFeedService = liveFeedService;
  }

  init() {
    console.log("Initializing RedZone Tracker Ultra-Modern Base Model...");
    
    // Apply persisted accessibility & language settings
    this.applyFontSize(this.currentFontSize);
    this.applyColorBlindMode(this.currentColorBlind);
    this.initBookmarks();

    // Initialize Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Rank habitations by MCDA Priority
    this.updateRankedHabitations();

    // Initialize Map (Safeguarded)
    try {
      this.mapController.init((hab) => {
        this.selectHabitation(hab);
      });
    } catch (e) {
      console.warn("MapController init deferred or caught:", e);
    }

    // Populate Initial Sidebar Data (Safeguarded)
    try {
      this.updateSpotlightHabitation(this.currentHabitation);
      this.renderRankedHabitationsList();
      this.renderHistoryModalContent();
    } catch (e) {
      console.warn("Sidebar data render caught:", e.message, e.stack);
    }

    // Bind Event Listeners
    this.bindNavigationEvents();
    this.bindSearchEvents();
    this.bindSidebarTabEvents();
    this.bindSideMenuDrawer();
    this.bindMapControls();
    this.bindIndicatorDrawerEvents();
    this.bindSimulationEvents();
    this.bindReportEvents();
    this.bindLiveFeedEvents();
    this.bindModalControls();
    this.bindKeyboardShortcuts();
    this.bindSettingsDrawer();
    this.bindAccessibilityControls();
    this.bindLanguageSwitcher();
    this.bindBookmarkControls();
    this.bindFeedbackControls();
    this.bindGPSEvents();

    // Apply translations on load
    this.applyLanguage(this.currentLanguage);

    // Start Live Polling & Automated Telemetry Streaming (30s interval)
    liveFeedService.startLivePolling(30000);

    // Custom Map Event Listener
    window.addEventListener('select-habitation', (e) => {
      const habId = e.detail;
      const target = HABITATIONS_DATA.find(h => h.id === habId);
      if (target) this.selectHabitation(target);
    });

    window.addEventListener('inspect-zone', (e) => {
      const zoneId = e.detail;
      if (zoneId.includes('WAYANAD')) {
        const h = HABITATIONS_DATA.find(x => x.id === 'HAB-KL-02');
        if (h) this.selectHabitation(h);
      } else if (zoneId.includes('MAJULI')) {
        const h = HABITATIONS_DATA.find(x => x.id === 'HAB-AS-03');
        if (h) this.selectHabitation(h);
      } else if (zoneId.includes('KENDRAPARA')) {
        const h = HABITATIONS_DATA.find(x => x.id === 'HAB-OD-04');
        if (h) this.selectHabitation(h);
      } else {
        const h = HABITATIONS_DATA.find(x => x.id === 'HAB-UK-01');
        if (h) this.selectHabitation(h);
      }
    });

    console.log("RedZone Tracker ready with modern aesthetic interface.");
  }

  // Bind Keyboard Shortcuts (Ctrl+K or Cmd+K for Search)
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('city-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  // Rank Habitations by MCDA Relocation Urgency
  updateRankedHabitations(habitationsList = HABITATIONS_DATA) {
    this.rankedHabitations = habitationsList.map(h => {
      const priority = calculateRelocationPriority(h);
      return {
        ...h,
        priority
      };
    }).sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);
  }

  // Select and Spotlight a Habitation
  selectHabitation(hab) {
    this.currentHabitation = hab;
    this.updateSpotlightHabitation(hab);
    this.mapController.flyToLocation(hab.lat, hab.lng, 13);
  }

  // Update Sidebar Spotlight with Habitation Metrics
  updateSpotlightHabitation(hab) {
    const priority = calculateRelocationPriority(hab);
    const cci = calculateCCI(hab.carryingCapacity, hab.population, hab.carryingCapacity.sustainableCeiling);
    const vuln = calculateVulnerability(hab);
    const safeHaven = findBestSafeHaven(hab, SAFE_HAVEN_DESTINATIONS);
    const budget = estimateRelocationBudget(hab);

    // Header Spotlight
    const badge = document.getElementById('spotlight-badge');
    const score = document.getElementById('spotlight-score');
    const name = document.getElementById('spotlight-name');
    const meta = document.getElementById('spotlight-meta');

    if (badge) {
      badge.textContent = hab.status.replace('_', ' ');
      badge.className = `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        hab.status === 'RED_ZONE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
        hab.status === 'ORANGE_ZONE' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      }`;
    }
    if (score) score.textContent = `${Math.round(hab.hazardScore * 100)}% Hazard Index`;
    if (name) name.textContent = hab.name;
    if (meta) meta.textContent = `${hab.district} District, ${hab.state} • Elev: ${hab.elevation} • Slope: ${hab.slopeAngle}`;

    // Danger Meter (Speedometer Gauge)
    const gaugeArc = document.getElementById('spotlight-gauge-arc');
    const gaugeVal = document.getElementById('spotlight-gauge-val');
    const citizenStatus = document.getElementById('spotlight-citizen-status');
    const citizenDesc = document.getElementById('spotlight-citizen-desc');

    const riskPct = Math.round(hab.hazardScore * 100);
    if (gaugeVal) gaugeVal.textContent = `${riskPct}%`;
    if (gaugeArc) {
      // Half circumference of r=40 is ~125.66
      const offset = 125.66 * (1 - Math.min(1, Math.max(0, hab.hazardScore)));
      gaugeArc.style.strokeDashoffset = offset;
    }

    if (citizenStatus) {
      if (hab.hazardScore >= 0.85) {
        citizenStatus.textContent = "🚨 Severe Danger: Relocate Immediately";
        citizenStatus.className = "text-xs font-bold text-red-400";
      } else if (hab.hazardScore >= 0.70) {
        citizenStatus.textContent = "🟠 High Threat: Relocation Recommended";
        citizenStatus.className = "text-xs font-bold text-amber-400";
      } else {
        citizenStatus.textContent = "🟢 Moderate / Stable: Active Monitoring";
        citizenStatus.className = "text-xs font-bold text-emerald-400";
      }
    }

    if (citizenDesc) {
      citizenDesc.textContent = hab.primaryHazard 
        ? `${hab.primaryHazard} affecting ${hab.population.toLocaleString()} residents.`
        : "Geological stability and environmental thresholds monitored via ISRO telemetry.";
    }

    // Tab 1: Carrying Capacity (Donut Chart & Overload Meter)
    const cciScoreDisplay = document.getElementById('cci-score-display');
    const cciOverloadDisplay = document.getElementById('cci-overload-display');
    const cciMeterBar = document.getElementById('cci-meter-bar');
    const cciCurrentPop = document.getElementById('cci-current-pop');
    const cciCeilingPop = document.getElementById('cci-ceiling-pop');
    const cciStatusBadge = document.getElementById('cci-status-badge');
    const ccOverflowPop = document.getElementById('cc-overflow-pop');

    if (cciScoreDisplay) cciScoreDisplay.textContent = `${cci.cci}`;
    if (cciOverloadDisplay) cciOverloadDisplay.textContent = `+${cci.overloadPercentage}% Overcrowded`;
    if (cciMeterBar) {
      const loadWidth = Math.min(100, Math.max(15, (hab.population / (hab.carryingCapacity.sustainableCeiling * 2)) * 100));
      cciMeterBar.style.width = `${loadWidth}%`;
    }
    if (cciCurrentPop) cciCurrentPop.textContent = hab.population.toLocaleString();
    if (cciCeilingPop) cciCeilingPop.textContent = hab.carryingCapacity.sustainableCeiling.toLocaleString();
    if (cciStatusBadge) {
      cciStatusBadge.textContent = cci.status.split('(')[0].trim();
      cciStatusBadge.className = `text-[10px] px-2.5 py-0.5 rounded-full font-bold ${cci.badgeColor}`;
    }
    if (ccOverflowPop) ccOverflowPop.textContent = `${cci.overflowPopulation.toLocaleString()} persons`;

    // Carrying Capacity Metrics
    const paramWater = document.getElementById('param-water-val');
    const paramLand = document.getElementById('param-land-val');
    const paramInfra = document.getElementById('param-infra-val');
    const paramEco = document.getElementById('param-eco-val');
    const paramPop = document.getElementById('param-pop-val');

    if (paramWater) paramWater.textContent = `${Math.round(hab.carryingCapacity.water * 100)}%`;
    if (paramLand) paramLand.textContent = `${Math.round(hab.carryingCapacity.land * 100)}%`;
    if (paramInfra) paramInfra.textContent = `${Math.round(hab.carryingCapacity.infra * 100)}%`;
    if (paramEco) paramEco.textContent = `${Math.round(hab.carryingCapacity.eco * 100)}%`;
    if (paramPop) paramPop.textContent = `${Math.round(hab.carryingCapacity.popPressure * 100)}%`;

    // Dynamic Donut Slices for Capacity
    const circ = 175.93; // 2 * pi * 28
    const wP = hab.carryingCapacity.water;
    const lP = hab.carryingCapacity.land;
    const iP = hab.carryingCapacity.infra;
    const eP = hab.carryingCapacity.eco;
    const pP = hab.carryingCapacity.popPressure;
    const capSum = wP + lP + iP + eP + pP || 1;

    const s1 = (wP / capSum) * circ;
    const s2 = (lP / capSum) * circ;
    const s3 = (iP / capSum) * circ;
    const s4 = (eP / capSum) * circ;
    const s5 = (pP / capSum) * circ;

    const dWater = document.getElementById('donut-slice-water');
    const dLand = document.getElementById('donut-slice-land');
    const dInfra = document.getElementById('donut-slice-infra');
    const dEco = document.getElementById('donut-slice-eco');
    const dPop = document.getElementById('donut-slice-pop');

    if (dWater) { dWater.setAttribute('stroke-dasharray', `${s1} ${circ - s1}`); dWater.setAttribute('stroke-dashoffset', '0'); }
    if (dLand) { dLand.setAttribute('stroke-dasharray', `${s2} ${circ - s2}`); dLand.setAttribute('stroke-dashoffset', `${-s1}`); }
    if (dInfra) { dInfra.setAttribute('stroke-dasharray', `${s3} ${circ - s3}`); dInfra.setAttribute('stroke-dashoffset', `${-(s1 + s2)}`); }
    if (dEco) { dEco.setAttribute('stroke-dasharray', `${s4} ${circ - s4}`); dEco.setAttribute('stroke-dashoffset', `${-(s1 + s2 + s3)}`); }
    if (dPop) { dPop.setAttribute('stroke-dasharray', `${s5} ${circ - s5}`); dPop.setAttribute('stroke-dashoffset', `${-(s1 + s2 + s3 + s4)}`); }

    // Tab 2: Vulnerability (Donut & Medical Access)
    const vScore = document.getElementById('vuln-score-display');
    const vClass = document.getElementById('vuln-class-badge');
    const vMeter = document.getElementById('vuln-meter-bar');
    const kutcha = document.getElementById('demo-kutcha-pct');
    const bpl = document.getElementById('demo-bpl-pct');
    const dep = document.getElementById('demo-age-dep-pct');
    const dHosp = document.getElementById('demo-hospital-dist');
    const histList = document.getElementById('spotlight-history-list');

    if (vScore) vScore.textContent = `${Math.round(vuln.vulnerabilityScore * 100)}%`;
    if (vClass) {
      vClass.textContent = (vuln.vulnerabilityClass || 'Moderate Vulnerability').split('(')[0].trim();
      vClass.className = `text-[10px] px-2.5 py-0.5 rounded-full font-bold ${vuln.badgeColor || 'bg-amber-500/20 text-amber-300'}`;
    }
    if (vMeter) {
      const distPct = Math.min(100, Math.max(10, Math.round((hab.distanceToHospitalKm / 20) * 100)));
      vMeter.style.width = `${distPct}%`;
    }

    if (kutcha) kutcha.textContent = `${hab.kutchaHousesPct}%`;
    if (bpl) bpl.textContent = `${hab.bplPopulationPct}%`;
    if (dep) dep.textContent = `${hab.ageDependencyPct}%`;
    if (dHosp) dHosp.textContent = `${hab.distanceToHospitalKm} km away`;

    // Vulnerability Donut Slices
    const kP = hab.kutchaHousesPct;
    const bPct = hab.bplPopulationPct;
    const aP = hab.ageDependencyPct;
    const vTot = kP + bPct + aP || 1;
    const vs1 = (kP / vTot) * circ;
    const vs2 = (aP / vTot) * circ;
    const vs3 = (bPct / vTot) * circ;

    const vSliceKutcha = document.getElementById('vuln-slice-kutcha');
    const vSliceDep = document.getElementById('vuln-slice-dep');
    const vSliceBpl = document.getElementById('vuln-slice-bpl');

    if (vSliceKutcha) { vSliceKutcha.setAttribute('stroke-dasharray', `${vs1} ${circ - vs1}`); vSliceKutcha.setAttribute('stroke-dashoffset', '0'); }
    if (vSliceDep) { vSliceDep.setAttribute('stroke-dasharray', `${vs2} ${circ - vs2}`); vSliceDep.setAttribute('stroke-dashoffset', `${-vs1}`); }
    if (vSliceBpl) { vSliceBpl.setAttribute('stroke-dasharray', `${vs3} ${circ - vs3}`); vSliceBpl.setAttribute('stroke-dashoffset', `${-(vs1 + vs2)}`); }

    if (histList && hab.historicalDisasters) {
      histList.innerHTML = hab.historicalDisasters.map(d => `<li>${d}</li>`).join('');
    }

    // Tab 3: Relocation Action Tool
    const relocTierBadge = document.getElementById('reloc-tier-badge');
    const matchedHavenName = document.getElementById('matched-haven-name');
    const matchedHavenMeta = document.getElementById('matched-haven-meta');
    const matchedHavenDist = document.getElementById('matched-haven-distance');
    const matchedHavenHeadroom = document.getElementById('matched-haven-headroom');
    const matchedHavenInfra = document.getElementById('matched-haven-infra');
    const relocTotalBudget = document.getElementById('reloc-total-budget');
    const budgetPmay = document.getElementById('budget-pmay-cr');
    const budgetSdrf = document.getElementById('budget-sdrf-cr');
    const budgetInfra = document.getElementById('budget-infra-cr');

    if (relocTierBadge) {
      relocTierBadge.textContent = (priority.urgencyTier || 'TIER 1').split(':')[0];
      relocTierBadge.className = `text-[10px] px-3 py-1 rounded-full font-bold ${priority.urgencyClass || 'bg-red-500/20 text-red-300'}`;
    }

    if (safeHaven) {
      if (matchedHavenName) matchedHavenName.textContent = safeHaven.haven.name;
      if (matchedHavenMeta) matchedHavenMeta.textContent = `${safeHaven.haven.district}, ${safeHaven.haven.state} • Stable ${safeHaven.haven.geology}`;
      if (matchedHavenDist) matchedHavenDist.textContent = `${safeHaven.distanceKm} km transit`;
      if (matchedHavenHeadroom) matchedHavenHeadroom.textContent = `+${safeHaven.haven.availableCapacityHeadroom.toLocaleString()} Persons`;
      if (matchedHavenInfra) matchedHavenInfra.textContent = `${Math.round(safeHaven.haven.infrastructureRating * 100)}% (Verified)`;
    }

    if (relocTotalBudget) relocTotalBudget.textContent = (budget.formattedTotal || '₹0 Cr').split(' ')[0];
    if (budgetPmay) budgetPmay.textContent = `₹${budget.housingGrantCr} Cr`;
    if (budgetSdrf) budgetSdrf.textContent = `₹${budget.shiftingGrantCr} Cr`;
    if (budgetInfra) budgetInfra.textContent = `₹${budget.infraGrantCr} Cr`;

    // Budget Donut Slices
    const hG = parseFloat(budget.housingGrantCr) || 0;
    const iG = parseFloat(budget.infraGrantCr) || 0;
    const sG = parseFloat(budget.shiftingGrantCr) || 0;
    const bSum = hG + iG + sG || 1;
    const bs1 = (hG / bSum) * circ;
    const bs2 = (iG / bSum) * circ;
    const bs3 = (sG / bSum) * circ;

    const bSlicePmay = document.getElementById('budget-slice-pmay');
    const bSliceInfra = document.getElementById('budget-slice-infra');
    const bSliceSdrf = document.getElementById('budget-slice-sdrf');

    if (bSlicePmay) { bSlicePmay.setAttribute('stroke-dasharray', `${bs1} ${circ - bs1}`); bSlicePmay.setAttribute('stroke-dashoffset', '0'); }
    if (bSliceInfra) { bSliceInfra.setAttribute('stroke-dasharray', `${bs2} ${circ - bs2}`); bSliceInfra.setAttribute('stroke-dashoffset', `${-bs1}`); }
    if (bSliceSdrf) { bSliceSdrf.setAttribute('stroke-dasharray', `${bs3} ${circ - bs3}`); bSliceSdrf.setAttribute('stroke-dashoffset', `${-(bs1 + bs2)}`); }
  }

  // Render Ranked Habitations in Relocation Tab (Ultra-Modern Aesthetic)
  renderRankedHabitationsList() {
    const container = document.getElementById('all-ranked-habitations-list');
    if (!container) return;

    container.innerHTML = this.rankedHabitations.map((h, i) => {
      const isSelected = h.id === this.currentHabitation.id;
      const isUrgent = h.priority.priorityScore >= 0.75;
      return `
        <div class="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs aesthetic-card ${
          isSelected 
            ? 'bg-red-500/10 border-red-500/40 shadow-sm shadow-red-500/20' 
            : 'hover:border-white/20'
        }" onclick="window.dispatchEvent(new CustomEvent('select-habitation', { detail: '${h.id}' }))">
          <div class="flex items-center space-x-3">
            <span class="w-6 h-6 rounded-xl flex items-center justify-center font-bold text-[11px] ${
              isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-slate-400 border border-white/10'
            }">
              #${i + 1}
            </span>
            <div>
              <div class="font-bold text-white tracking-tight">${h.name}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">${h.district}, ${h.state} • ${h.population.toLocaleString()} pop</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono font-bold text-sm ${isUrgent ? 'text-red-400' : 'text-amber-400'}">
              ${h.priority.priorityScore}
            </div>
            <div class="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Priority</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Bind Top Navigation Tabs
  bindNavigationEvents() {
    const navButtons = [
      { id: 'nav-home', action: () => {
        this.mapController.resetView();
        document.querySelectorAll('.app-modal-layer').forEach(m => m.classList.add('hidden'));
      }},
      { id: 'nav-about', action: () => {
        document.querySelectorAll('.app-modal-layer').forEach(m => m.classList.add('hidden'));
        const modal = document.getElementById('methodology-modal');
        if (modal) modal.classList.remove('hidden');
      }},
      { id: 'nav-live', action: () => {
        document.querySelectorAll('.app-modal-layer').forEach(m => m.classList.add('hidden'));
        const liveItems = liveFeedService.currentEvents;
        if (liveItems && liveItems.length > 0) {
          this.mapController.flyToLocation(liveItems[0].lat, liveItems[0].lng, 10);
        } else {
          this.mapController.flyToLocation(30.5564, 79.5647, 10);
        }
        const bar = document.getElementById('live-alert-bar');
        if (bar) {
          bar.classList.add('ring-2', 'ring-red-500');
          setTimeout(() => bar.classList.remove('ring-2', 'ring-red-500'), 1200);
        }
      }},
      { id: 'nav-simulation', action: () => {
        document.querySelectorAll('.app-modal-layer').forEach(m => m.classList.add('hidden'));
        const modal = document.getElementById('simulation-modal');
        if (modal) modal.classList.remove('hidden');
      }},
      { id: 'nav-history', action: () => {
        document.querySelectorAll('.app-modal-layer').forEach(m => m.classList.add('hidden'));
        const modal = document.getElementById('history-modal');
        if (modal) modal.classList.remove('hidden');
      }}
    ];

    navButtons.forEach(btn => {
      const el = document.getElementById(btn.id);
      if (el) {
        el.addEventListener('click', () => {
          document.querySelectorAll('.subnav-clean-item').forEach(b => b.classList.remove('active'));
          el.classList.add('active');
          btn.action();
        });
      }
    });

    // Launch Sim from Sidebar Footer
    const simTrigger = document.getElementById('launch-sim-trigger');
    if (simTrigger) {
      simTrigger.addEventListener('click', () => {
        document.querySelectorAll('.app-modal-layer').forEach(m => m.classList.add('hidden'));
        const modal = document.getElementById('simulation-modal');
        if (modal) modal.classList.remove('hidden');
      });
    }

    const rawMathBtn = document.getElementById('inspect-full-details-btn');
    if (rawMathBtn) {
      rawMathBtn.addEventListener('click', () => {
        document.querySelectorAll('.app-modal-layer').forEach(m => m.classList.add('hidden'));
        const modal = document.getElementById('methodology-modal');
        if (modal) modal.classList.remove('hidden');
      });
    }
  }

  // Bind Global City/Habitation Search
  bindSearchEvents() {
    const input = document.getElementById('city-search-input');
    const trigger = document.getElementById('search-trigger-btn');
    const dropdown = document.getElementById('search-suggestions');
    const list = document.getElementById('suggestions-list');

    if (!input || !dropdown || !list) return;

    const performSearch = (query) => {
      const q = query.toLowerCase().trim();
      if (!q) {
        dropdown.classList.add('hidden');
        return;
      }

      const matches = HABITATIONS_DATA.filter(h => 
        h.name.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.hazardType.toLowerCase().includes(q)
      );

      if (matches.length > 0) {
        list.innerHTML = matches.map(h => `
          <div class="p-3 hover:bg-white/[0.06] cursor-pointer flex items-center justify-between transition-colors" data-id="${h.id}">
            <div>
              <div class="font-bold text-white tracking-tight">${h.name}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">${h.district}, ${h.state} • ${h.hazardType}</div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              h.status === 'RED_ZONE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }">
              Score: ${h.hazardScore}
            </span>
          </div>
        `).join('');

        dropdown.classList.remove('hidden');

        // Bind clicks
        list.querySelectorAll('[data-id]').forEach(item => {
          item.addEventListener('click', () => {
            const hId = item.getAttribute('data-id');
            const hab = HABITATIONS_DATA.find(x => x.id === hId);
            if (hab) {
              this.selectHabitation(hab);
              input.value = `${hab.name}, ${hab.district}`;
              dropdown.classList.add('hidden');
            }
          });
        });
      } else {
        list.innerHTML = `<div class="p-4 text-slate-400 text-center">No high-risk habitation found matching "${query}".</div>`;
        dropdown.classList.remove('hidden');
      }
    };

    input.addEventListener('input', (e) => performSearch(e.target.value));
    if (trigger) trigger.addEventListener('click', () => performSearch(input.value));

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Quick Hotspot buttons
    document.querySelectorAll('.hotspot-jump-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lat = parseFloat(btn.getAttribute('data-lat'));
        const lng = parseFloat(btn.getAttribute('data-lng'));
        this.mapController.flyToLocation(lat, lng, 12);
        const match = HABITATIONS_DATA.find(h => Math.abs(h.lat - lat) < 0.1);
        if (match) this.updateSpotlightHabitation(match);
      });
    });
  }

  // Bind Sidebar Tab Switching (The 5 Tools)
  bindSidebarTabEvents() {
    const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Toggle active states
        tabBtns.forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        // Show pane
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
        const activePane = document.getElementById(`tab-${targetTab}`);
        if (activePane) {
          activePane.classList.remove('hidden');
          if (window.lucide) window.lucide.createIcons();
        }
      });
    });

    // Layer toggles in Tab 4
    const tRed = document.getElementById('layer-toggle-redzones');
    const tHab = document.getElementById('layer-toggle-habitations');
    const tSafe = document.getElementById('layer-toggle-safehavens');
    const tLive = document.getElementById('layer-toggle-livealerts');

    if (tRed) tRed.addEventListener('change', (e) => this.mapController.toggleLayer('redZones', e.target.checked));
    if (tHab) tHab.addEventListener('change', (e) => this.mapController.toggleLayer('habitations', e.target.checked));
    if (tSafe) tSafe.addEventListener('change', (e) => this.mapController.toggleLayer('safeHavens', e.target.checked));
    if (tLive) tLive.addEventListener('change', (e) => this.mapController.toggleLayer('liveAlerts', e.target.checked));
  }

  // Bind Custom Map Controls (+ / - / Reset)
  bindMapControls() {
    const zoomIn = document.getElementById('map-zoom-in');
    const zoomOut = document.getElementById('map-zoom-out');
    const reset = document.getElementById('map-reset-view');

    if (zoomIn) zoomIn.addEventListener('click', () => this.mapController.zoomIn());
    if (zoomOut) zoomOut.addEventListener('click', () => this.mapController.zoomOut());
    if (reset) reset.addEventListener('click', () => this.mapController.resetView());

    // Map Layer Switcher (Dark / Satellite / Street - 100% Free & Keyless)
    const layerBtns = document.querySelectorAll('.map-layer-btn');
    layerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        layerBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const layer = btn.getAttribute('data-layer');
        this.mapController.setBaseLayer(layer);
      });
    });
  }

  // Bind Interactive Indicator HUD Drawer
  bindIndicatorDrawerEvents() {
    const triggerBtn = document.getElementById('toggle-indicators-btn');
    const drawer = document.getElementById('indicator-hud-drawer');
    const closeBtn = document.getElementById('close-indicator-drawer');

    if (triggerBtn && drawer) {
      triggerBtn.addEventListener('click', () => {
        drawer.classList.toggle('hidden');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.add('hidden');
      });
    }
  }

  // Bind Dynamic "What-If" Simulation Events
  bindSimulationEvents() {
    const modal = document.getElementById('simulation-modal');
    const closeBtn = document.getElementById('close-sim-modal');
    const resetBtn = document.getElementById('reset-sim-btn');
    const applyBtn = document.getElementById('apply-sim-btn');

    const sliderRain = document.getElementById('sim-slider-rain');
    const sliderCc = document.getElementById('sim-slider-cc');
    const sliderCyclone = document.getElementById('sim-slider-cyclone');

    const labelRain = document.getElementById('sim-val-rain');
    const labelCc = document.getElementById('sim-val-cc');
    const labelCyclone = document.getElementById('sim-val-cyclone');

    const metricRedZones = document.getElementById('sim-metric-redzones');
    const metricFlipped = document.getElementById('sim-metric-flipped');
    const metricPop = document.getElementById('sim-metric-pop');
    const metricBudget = document.getElementById('sim-metric-budget');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    // Scenario Preset Buttons
    document.querySelectorAll('.sim-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scenarioKey = btn.getAttribute('data-scenario');
        simulationEngine.setScenario(scenarioKey);
      });
    });

    // Custom Sliders
    const onSliderChange = () => {
      const rain = parseInt(sliderRain.value);
      const cc = parseInt(sliderCc.value);
      const cyclone = parseInt(sliderCyclone.value);

      simulationEngine.updateCustomParams({
        rainfallSurgePct: rain,
        ccDepletionPct: cc,
        cycloneCategory: cyclone
      });
    };

    if (sliderRain) sliderRain.addEventListener('input', onSliderChange);
    if (sliderCc) sliderCc.addEventListener('input', onSliderChange);
    if (sliderCyclone) sliderCyclone.addEventListener('input', onSliderChange);

    // Simulation Engine Output Listener
    simulationEngine.onSimulationChange((simResults, scenario) => {
      if (metricRedZones) metricRedZones.textContent = `${simResults.metrics.redZoneCount} Zones`;
      if (metricFlipped) metricFlipped.textContent = `+${simResults.metrics.newRedZonesFlipped} newly flipped to RED`;
      if (metricPop) metricPop.textContent = simResults.metrics.totalVulnerablePop.toLocaleString();
      if (metricBudget) metricBudget.textContent = `₹${simResults.metrics.totalBudgetRequiredCr} Cr`;

      if (sliderRain) sliderRain.value = scenario.rainfallSurgePct;
      if (sliderCc) sliderCc.value = scenario.ccDepletionPct;
      if (sliderCyclone) sliderCyclone.value = scenario.cycloneCategory;

      if (labelRain) labelRain.textContent = `+${scenario.rainfallSurgePct}%`;
      if (labelCc) labelCc.textContent = `-${scenario.ccDepletionPct}%`;
      if (labelCyclone) labelCyclone.textContent = scenario.cycloneCategory === 0 ? "Category 0 (None)" : `Category ${scenario.cycloneCategory} Cyclone`;
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        simulationEngine.setScenario('RESET');
      });
    }

    if (applyBtn && modal) {
      applyBtn.addEventListener('click', () => {
        const simResults = simulationEngine.runSimulation();
        this.updateRankedHabitations(simResults.habitations);
        this.renderRankedHabitationsList();
        
        // Spotlight first simulated urgent habitation
        const topUrgent = this.rankedHabitations[0];
        if (topUrgent) this.selectHabitation(topUrgent);

        modal.classList.add('hidden');
      });
    }
  }

  // Bind Export District Collector Brief Events
  bindReportEvents() {
    const previewBtn = document.getElementById('preview-report-btn');
    const printBtn = document.getElementById('print-report-btn');
    const modal = document.getElementById('report-preview-modal');
    const closeBtn = document.getElementById('close-report-modal');
    const modalBody = document.getElementById('report-modal-body');
    const modalPrintBtn = document.getElementById('modal-print-btn');

    const openReportModal = () => {
      if (!modal || !modalBody) return;
      modalBody.innerHTML = generateDistrictCollectorBrief("All");
      modal.classList.remove('hidden');
    };

    if (previewBtn) previewBtn.addEventListener('click', openReportModal);

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        openReportModal();
        setTimeout(() => window.print(), 400);
      });
    }

    if (modalPrintBtn) {
      modalPrintBtn.addEventListener('click', () => window.print());
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
  }

  // Bind History Modal Content (Modern Aesthetic Cards)
  renderHistoryModalContent() {
    const container = document.getElementById('history-cards-container');
    if (!container) return;

    container.innerHTML = HISTORICAL_DISASTERS.map(d => `
      <div class="aesthetic-card p-4 space-y-2 hover:border-white/20 transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ${d.year}
            </span>
            <h4 class="font-bold text-sm text-white tracking-tight">${d.title}</h4>
          </div>
          <button class="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors" onclick="window.dispatchEvent(new CustomEvent('pan-to-live', { detail: { lat: ${d.lat}, lng: ${d.lng} } }))">
            Fly to Site &rarr;
          </button>
        </div>
        <p class="text-[11px] text-slate-300 leading-relaxed">${d.description}</p>
        <div class="flex items-center space-x-1.5 pt-1 text-[10px]">
          ${d.tags.map(t => `<span class="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400 font-medium">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  // Bind Modals & Methodology
  bindModalControls() {
    const modals = [
      { closeId: 'close-sim-modal', modalId: 'simulation-modal' },
      { closeId: 'close-methodology-modal', modalId: 'methodology-modal' },
      { closeId: 'close-history-modal', modalId: 'history-modal' },
      { closeId: 'close-report-modal', modalId: 'report-modal' }
    ];

    modals.forEach(({ closeId, modalId }) => {
      const closeBtn = document.getElementById(closeId);
      const modal = document.getElementById(modalId);
      if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
      }
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.add('hidden');
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.app-modal-layer').forEach(m => m.classList.add('hidden'));
      }
    });
  }

  // Slide-out Analytical Side Menu Drawer (Capacity, Vulnerability, Relocation, Layers, Export)
  bindSideMenuDrawer() {
    const drawer = document.getElementById('side-menu-drawer');
    const backdrop = document.getElementById('sidebar-backdrop');
    const closeBtn = document.getElementById('close-side-menu-btn');

    const openDrawer = () => {
      if (window.openSideMenu && window.openSideMenu !== openDrawer) {
        window.openSideMenu();
        return;
      }
      if (!drawer) return;
      drawer.classList.remove('-translate-x-full');
      drawer.classList.add('translate-x-0', 'drawer-open');
      if (backdrop) backdrop.classList.remove('hidden');
      const navBtn = document.getElementById('nav-side-menu-btn');
      if (navBtn) navBtn.classList.add('active', 'bg-cyan-500/30', 'text-white');
      setTimeout(() => {
        if (this.mapController) this.mapController.invalidateSize();
      }, 100);
      setTimeout(() => {
        if (this.mapController) this.mapController.invalidateSize();
      }, 350);
    };

    const closeDrawer = () => {
      if (window.closeSideMenu && window.closeSideMenu !== closeDrawer) {
        window.closeSideMenu();
        return;
      }
      if (!drawer) return;
      drawer.classList.remove('translate-x-0', 'drawer-open');
      drawer.classList.add('-translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
      const navBtn = document.getElementById('nav-side-menu-btn');
      if (navBtn) navBtn.classList.remove('active', 'bg-cyan-500/30', 'text-white');
      setTimeout(() => {
        if (this.mapController) this.mapController.invalidateSize();
      }, 100);
      setTimeout(() => {
        if (this.mapController) this.mapController.invalidateSize();
      }, 350);
    };

    let lastAppToggle = 0;
    const toggleDrawer = (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      const now = Date.now();
      if (now - lastAppToggle < 280) return;
      lastAppToggle = now;

      if (window.toggleSideMenu && window.toggleSideMenu !== toggleDrawer) {
        window.toggleSideMenu(e);
        return;
      }
      if (drawer && (drawer.classList.contains('translate-x-0') || drawer.classList.contains('drawer-open'))) {
        closeDrawer();
      } else {
        openDrawer();
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && (drawer.classList.contains('translate-x-0') || drawer.classList.contains('drawer-open'))) {
        closeDrawer();
      }
    });

    if (!window.openSideMenu) window.openSideMenu = openDrawer;
    if (!window.closeSideMenu) window.closeSideMenu = closeDrawer;
    if (!window.toggleSideMenu) window.toggleSideMenu = toggleDrawer;
  }

  // =========================================================================
  // SETTINGS THIN DRAWER WITH MULTI-LEVEL ONE-PANEL-AT-A-TIME NAVIGATION
  // =========================================================================
  bindSettingsDrawer() {
    const settingsBtn = document.getElementById('settings-btn');
    const panel = document.getElementById('settings-thin-panel');
    const overlay = document.getElementById('settings-popup-overlay');
    const closeBtn = document.getElementById('close-settings-panel-btn');
    const backBtn = document.getElementById('settings-back-btn');
    const titleEl = document.getElementById('settings-panel-title');
    const subtitleEl = document.getElementById('settings-panel-subtitle');

    if (!panel || !settingsBtn) return;

    const screenTitles = {
      'view-main': { title: 'Settings', subtitle: 'System Preferences & Tools' },
      'view-accessibility': { title: 'Accessibility', subtitle: 'Visual comfort & assistance tools' },
      'view-language': { title: 'Language', subtitle: 'Select Indian regional language' },
      'view-notifications': { title: 'Notifications', subtitle: 'Manage siren & dispatch preferences' },
      'view-bookmarks': { title: 'Saved Bookmarks', subtitle: 'Pinned habitations and red zones' },
      'view-feedback': { title: 'Feedback', subtitle: 'Direct feedback to DDMA team' }
    };

    const showScreen = (viewId) => {
      document.querySelectorAll('.settings-view-screen').forEach(s => s.classList.add('hidden'));
      const targetScreen = document.getElementById(`settings-${viewId}`);
      if (targetScreen) targetScreen.classList.remove('hidden');

      if (viewId === 'view-main') {
        if (backBtn) backBtn.classList.add('hidden');
      } else {
        if (backBtn) backBtn.classList.remove('hidden');
      }

      const meta = screenTitles[viewId] || screenTitles['view-main'];
      if (titleEl) titleEl.textContent = meta.title;
      if (subtitleEl) subtitleEl.textContent = meta.subtitle;
    };

    const openSettings = () => {
      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0', 'panel-open');
      if (overlay) overlay.classList.remove('hidden');
      showScreen('view-main');
    };

    const closeSettings = () => {
      panel.classList.remove('translate-x-0', 'panel-open');
      panel.classList.add('translate-x-full');
      if (overlay) overlay.classList.add('hidden');
    };

    settingsBtn.addEventListener('click', openSettings);
    if (closeBtn) closeBtn.addEventListener('click', closeSettings);
    if (overlay) overlay.addEventListener('click', closeSettings);
    if (backBtn) backBtn.addEventListener('click', () => showScreen('view-main'));

    // Navigation items inside main view
    document.querySelectorAll('.settings-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        showScreen(target);
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('translate-x-0')) {
        closeSettings();
      }
    });

    window.openSettingsDrawer = openSettings;
    window.closeSettingsDrawer = closeSettings;
    window.showSettingsScreen = showScreen;
  }

  // =========================================================================
  // ACCESSIBILITY FEATURES (FONT SIZE, LENS MAGNIFIER, COLOR BLIND)
  // =========================================================================
  bindAccessibilityControls() {
    // 1. Font Size Adjustment
    const fontBtns = document.querySelectorAll('.font-size-btn');
    const indicator = document.getElementById('font-size-indicator');

    fontBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fontBtns.forEach(b => {
          b.classList.remove('active', 'border-cyan-500/50', 'bg-cyan-500/20', 'text-white');
          b.classList.add('border-white/10');
        });
        btn.classList.add('active', 'border-cyan-500/50', 'bg-cyan-500/20', 'text-white');
        btn.classList.remove('border-white/10');

        const size = btn.getAttribute('data-size');
        this.applyFontSize(size);
        if (indicator) indicator.textContent = size.charAt(0).toUpperCase() + size.slice(1);
      });
    });

    // 2. Magnifying Glass Lens Mode
    const lensToggle = document.getElementById('toggle-magnifier-lens');
    const lens = document.getElementById('magnifier-lens');

    if (lensToggle && lens) {
      lensToggle.addEventListener('change', (e) => {
        this.magnifierActive = e.target.checked;
        if (this.magnifierActive) {
          lens.style.display = 'block';
          document.body.style.cursor = 'crosshair';
        } else {
          lens.style.display = 'none';
          document.body.style.cursor = 'default';
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.magnifierActive) return;
        lens.style.left = `${e.clientX}px`;
        lens.style.top = `${e.clientY}px`;
      });
    }

    // 3. Color Blind Mode
    const cbSelect = document.getElementById('colorblind-select');
    const cbIndicator = document.getElementById('colorblind-indicator');

    if (cbSelect) {
      cbSelect.value = this.currentColorBlind;
      cbSelect.addEventListener('change', (e) => {
        this.applyColorBlindMode(e.target.value);
        if (cbIndicator) {
          cbIndicator.textContent = e.target.options[e.target.selectedIndex].text.split('(')[0].trim();
        }
      });
    }
  }

  applyFontSize(size) {
    this.currentFontSize = size;
    localStorage.setItem('redzone_fontsize', size);
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    if (size === 'small') document.body.classList.add('font-size-small');
    if (size === 'large') document.body.classList.add('font-size-large');
  }

  applyColorBlindMode(mode) {
    this.currentColorBlind = mode;
    localStorage.setItem('redzone_colorblind', mode);
    document.body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-highcontrast');
    if (mode === 'protanopia') document.body.classList.add('colorblind-protanopia');
    if (mode === 'deuteranopia') document.body.classList.add('colorblind-deuteranopia');
    if (mode === 'highcontrast') document.body.classList.add('colorblind-highcontrast');
  }

  // =========================================================================
  // MULTI-LANGUAGE SWITCHER (10 REGIONAL INDIAN LANGUAGES + ENGLISH)
  // =========================================================================
  bindLanguageSwitcher() {
    const container = document.getElementById('language-options-container');
    if (!container) return;

    const languages = [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
      { code: 'ur', name: 'Urdu', native: 'اردو' },
      { code: 'bn', name: 'Bengali', native: 'বাংলা' },
      { code: 'te', name: 'Telugu', native: 'తెలుగు' },
      { code: 'mr', name: 'Marathi', native: 'मराठी' },
      { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
      { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
      { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
      { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' }
    ];

    container.innerHTML = languages.map(lang => {
      const isCurrent = lang.code === this.currentLanguage;
      return `
        <button class="lang-select-btn w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
          isCurrent 
            ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-bold shadow-sm' 
            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06] text-slate-300'
        }" data-lang="${lang.code}">
          <div class="flex items-center space-x-2.5 text-xs">
            <span class="font-mono text-cyan-400 uppercase text-[10px] w-6">${lang.code}</span>
            <span class="text-white">${lang.native}</span>
            <span class="text-slate-400 text-[11px]">(${lang.name})</span>
          </div>
          ${isCurrent ? '<i data-lucide="check" class="w-4 h-4 text-cyan-400"></i>' : ''}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.lang-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const langCode = btn.getAttribute('data-lang');
        this.applyLanguage(langCode);
        this.bindLanguageSwitcher(); // re-render list checkmark
      });
    });
  }

  applyLanguage(langCode) {
    const t = TRANSLATIONS[langCode] || TRANSLATIONS.en;
    this.currentLanguage = langCode;
    localStorage.setItem('redzone_lang', langCode);

    // Update chip in settings
    const chip = document.getElementById('current-language-chip');
    if (chip) chip.textContent = `${t.native} (${t.name})`;

    // Header & Brand elements
    const searchInput = document.getElementById('city-search-input');
    if (searchInput) searchInput.placeholder = t.search_placeholder;

    const navHome = document.querySelector('#nav-home span');
    if (navHome) navHome.textContent = t.home;

    const navAbout = document.querySelector('#nav-about span');
    if (navAbout) navAbout.textContent = t.about;

    const navLive = document.querySelector('#nav-live span:last-child');
    if (navLive) navLive.textContent = t.live_events;

    const navSim = document.querySelector('#nav-simulation span');
    if (navSim) navSim.textContent = t.sim_engine;

    const navHistory = document.querySelector('#nav-history span');
    if (navHistory) navHistory.textContent = t.history;

    const navSideMenu = document.querySelector('#nav-side-menu-btn span');
    if (navSideMenu) navSideMenu.textContent = t.side_menu;

    const mapSideMenu = document.querySelector('#map-floating-menu-btn span');
    if (mapSideMenu) mapSideMenu.textContent = t.side_menu;

    // Sidebar Tab Labels
    const tabCapacity = document.querySelector('[data-tab="carrying-capacity"] span');
    if (tabCapacity) tabCapacity.textContent = t.capacity;

    const tabVuln = document.querySelector('[data-tab="vulnerability"] span');
    if (tabVuln) tabVuln.textContent = t.vulnerability;

    const tabReloc = document.querySelector('[data-tab="relocation"] span');
    if (tabReloc) tabReloc.textContent = t.relocation;

    const tabLayers = document.querySelector('[data-tab="hazard-layers"] span');
    if (tabLayers) tabLayers.textContent = t.layers;

    const tabExport = document.querySelector('[data-tab="export-report"] span');
    if (tabExport) tabExport.textContent = t.export;

    // Re-create icons if any were replaced
    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================================
  // BOOKMARKS MANAGER
  // =========================================================================
  initBookmarks() {
    if (this.bookmarks.length === 0) {
      // Default initial bookmarks
      this.bookmarks = [
        { id: "HAB-UK-01", name: "Sunil Ward (Joshimath)", district: "Chamoli", state: "Uttarakhand", score: 0.94 },
        { id: "HAB-KL-02", name: "Chooralmala (Wayanad)", district: "Wayanad", state: "Kerala", score: 0.92 }
      ];
      localStorage.setItem('redzone_bookmarks', JSON.stringify(this.bookmarks));
    }
  }

  bindBookmarkControls() {
    const listContainer = document.getElementById('bookmarks-list-container');
    const bookmarkBtn = document.getElementById('bookmark-current-btn');
    const chip = document.getElementById('bookmarks-count-chip');

    const renderBookmarks = () => {
      if (chip) chip.textContent = `${this.bookmarks.length} saved habitations`;
      if (!listContainer) return;

      if (this.bookmarks.length === 0) {
        listContainer.innerHTML = `<div class="p-4 text-slate-400 text-center text-xs">No bookmarks saved. Click 'Bookmark Current' above to save.</div>`;
        return;
      }

      listContainer.innerHTML = this.bookmarks.map(bm => `
        <div class="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between text-xs group">
          <div class="cursor-pointer flex-1" onclick="window.dispatchEvent(new CustomEvent('select-habitation', { detail: '${bm.id}' }))">
            <div class="font-bold text-white group-hover:text-cyan-300 transition-colors">${bm.name}</div>
            <div class="text-[10px] text-slate-400">${bm.district}, ${bm.state} • Score: ${bm.score}</div>
          </div>
          <button class="delete-bm-btn p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors" data-id="${bm.id}" title="Remove Bookmark">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');

      listContainer.querySelectorAll('.delete-bm-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const bmId = btn.getAttribute('data-id');
          this.bookmarks = this.bookmarks.filter(b => b.id !== bmId);
          localStorage.setItem('redzone_bookmarks', JSON.stringify(this.bookmarks));
          renderBookmarks();
        });
      });

      if (window.lucide) window.lucide.createIcons();
    };

    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => {
        if (!this.currentHabitation) return;
        const exists = this.bookmarks.some(b => b.id === this.currentHabitation.id);
        if (!exists) {
          this.bookmarks.push({
            id: this.currentHabitation.id,
            name: this.currentHabitation.name,
            district: this.currentHabitation.district,
            state: this.currentHabitation.state,
            score: this.currentHabitation.hazardScore
          });
          localStorage.setItem('redzone_bookmarks', JSON.stringify(this.bookmarks));
          renderBookmarks();
        }
      });
    }

    renderBookmarks();
  }

  // =========================================================================
  // FEEDBACK DISPATCH
  // =========================================================================
  bindFeedbackControls() {
    const submitBtn = document.getElementById('submit-feedback-btn');
    const msgInput = document.getElementById('feedback-message');
    const categorySelect = document.getElementById('feedback-category');
    const statusMsg = document.getElementById('feedback-status-msg');

    if (!submitBtn || !msgInput) return;

    submitBtn.addEventListener('click', () => {
      const msg = msgInput.value.trim();
      if (!msg) {
        msgInput.focus();
        return;
      }

      const feedbackData = {
        category: categorySelect ? categorySelect.value : 'General',
        message: msg,
        habitation: this.currentHabitation ? this.currentHabitation.name : 'Unknown',
        timestamp: new Date().toISOString()
      };

      console.log("Feedback dispatched to DDMA Log:", feedbackData);
      msgInput.value = '';
      if (statusMsg) {
        statusMsg.classList.remove('hidden');
        setTimeout(() => statusMsg.classList.add('hidden'), 4000);
      }
    });

    const notifBtn = document.getElementById('save-notifs-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        notifBtn.textContent = 'Saved Preferences ✓';
        notifBtn.classList.add('bg-emerald-600');
        setTimeout(() => {
          notifBtn.textContent = 'Update Notification Settings';
          notifBtn.classList.remove('bg-emerald-600');
        }, 2000);
      });
    }
  }

  // Live Threat Event Handlers
  bindLiveFeedEvents() {
    const refreshBtn = document.getElementById('refresh-feed-btn');
    const tickerTrack = document.getElementById('live-ticker-track');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const icon = refreshBtn.querySelector('i');
        if (icon) icon.classList.add('animate-spin');
        await liveFeedService.fetchRealtimeDisasters();
        setTimeout(() => {
          if (icon) icon.classList.remove('animate-spin');
        }, 800);
      });
    }

    liveFeedService.subscribe((events) => {
      if (this.mapController) {
        this.mapController.renderLiveThreatMarkers(events);
      }

      if (tickerTrack && events.length > 0) {
        tickerTrack.innerHTML = events.map(e => `
          <span class="inline-flex items-center space-x-2 hover:text-white transition-colors py-1 cursor-pointer" onclick="window.dispatchEvent(new CustomEvent('pan-to-live', { detail: { lat: ${e.lat}, lng: ${e.lng} } }))">
            <span class="px-1.5 py-0.5 rounded-md ${
              e.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-orange-500/20 text-orange-300'
            } font-bold text-[9px] uppercase tracking-wider">
              ${e.type}
            </span>
            <span class="font-medium">${e.title}</span>
          </span>
        `).join('<span class="text-white/20 px-2">•</span>');
      }

      // Update auto-sync status badge
      const autoSyncLabel = document.getElementById('auto-sync-label');
      if (autoSyncLabel) {
        const d = new Date();
        const tStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        autoSyncLabel.textContent = `AUTO-STREAMED (${tStr})`;
      }
    });

    // Listen for new live hazard alerts to display animated HUD toast
    window.addEventListener('new-hazard-alert', (e) => {
      const threat = e.detail;
      const toast = document.getElementById('live-hazard-toast');
      const toastTitle = document.getElementById('toast-hazard-title');
      const toastTime = document.getElementById('toast-hazard-time');
      const toastZoomBtn = document.getElementById('toast-zoom-btn');

      if (toast && threat) {
        if (toastTitle) toastTitle.textContent = threat.title.replace(/^[🔴🟠🟡]\s*/, '');
        if (toastTime) toastTime.textContent = threat.time || 'Just Now';
        if (toastZoomBtn) {
          toastZoomBtn.onclick = () => {
            if (threat.lat && threat.lng && this.mapController) {
              this.mapController.flyToLocation(threat.lat, threat.lng, 12);
            }
          };
        }
        toast.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();

        // Auto-dismiss after 8 seconds
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
          if (toast) toast.classList.add('hidden');
        }, 8000);
      }
    });

    window.addEventListener('pan-to-live', (e) => {
      const { lat, lng } = e.detail;
      if (this.mapController) {
        this.mapController.flyToLocation(lat, lng, 12);
      }
    });
  }

  // Bind Live GPS Telemetry Events
  bindGPSEvents() {
    window.gpsService = gpsService;

    window.addEventListener('raksha-gps-update', (e) => {
      const pos = e.detail;
      if (this.mapController && this.mapController.renderUserLocation) {
        const shouldFly = !this.hasInitialGPSFly;
        if (shouldFly) this.hasInitialGPSFly = true;
        this.mapController.renderUserLocation(pos, { flyTo: shouldFly });
      }
    });

    window.addEventListener('raksha-gps-stopped', () => {
      this.hasInitialGPSFly = false;
      if (this.mapController && this.mapController.clearUserLocation) {
        this.mapController.clearUserLocation();
      }
    });
  }
}

// Robust Instant Instantiation across all environments
function initApp() {
  if (window.__redzone_initialized) return;
  window.__redzone_initialized = true;
  try {
    const app = new RedZoneApp();
    window.app = app;
    app.init();
  } catch (err) {
    console.error("RedZoneApp init error:", err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
