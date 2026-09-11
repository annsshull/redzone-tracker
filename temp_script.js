
    (function() {
      const panel = document.getElementById('settings-thin-panel');
      const overlay = document.getElementById('settings-popup-overlay');
      const settingsBtn = document.getElementById('settings-btn');
      const closeBtn = document.getElementById('close-settings-panel-btn');
      const backBtn = document.getElementById('settings-back-btn');
      const titleEl = document.getElementById('settings-panel-title');
      const subtitleEl = document.getElementById('settings-panel-subtitle');

      const screenTitles = {
        'view-main': { title: 'Settings', subtitle: 'System Preferences & Tools' },
        'view-accessibility': { title: 'Accessibility', subtitle: 'Visual comfort & assistance tools' },
        'view-language': { title: 'Language', subtitle: 'Select Indian regional language' },
        'view-notifications': { title: 'Notifications', subtitle: 'Manage siren & dispatch preferences' },
        'view-bookmarks': { title: 'Saved Bookmarks', subtitle: 'Pinned habitations and red zones' },
        'view-feedback': { title: 'Feedback', subtitle: 'Direct feedback to DDMA team' }
      };

      function showScreen(viewId) {
        document.querySelectorAll('.settings-view-screen').forEach(function(s) {
          s.classList.add('hidden');
        });
        const targetScreen = document.getElementById('settings-' + viewId);
        if (targetScreen) targetScreen.classList.remove('hidden');

        if (viewId === 'view-main') {
          if (backBtn) backBtn.classList.add('hidden');
        } else {
          if (backBtn) backBtn.classList.remove('hidden');
        }

        const meta = screenTitles[viewId] || screenTitles['view-main'];
        if (titleEl) titleEl.textContent = meta.title;
        if (subtitleEl) subtitleEl.textContent = meta.subtitle;

        // Render languages if opening language screen and empty
        if (viewId === 'view-language') {
          renderLanguageListFallback();
        }
      }

      function openSettings() {
        if (!panel) return;
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0', 'panel-open');
        if (overlay) overlay.classList.remove('hidden');
        showScreen('view-main');
      }

      function closeSettings() {
        if (!panel) return;
        panel.classList.remove('translate-x-0', 'panel-open');
        panel.classList.add('translate-x-full');
        if (overlay) overlay.classList.add('hidden');
      }

      // Expose globally
      window.openSettingsDrawer = openSettings;
      window.closeSettingsDrawer = closeSettings;
      window.showSettingsScreen = showScreen;

      if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', closeSettings);
      }
      if (overlay) {
        overlay.addEventListener('click', closeSettings);
      }
      if (backBtn) {
        backBtn.addEventListener('click', function() {
          showScreen('view-main');
        });
      }

      document.querySelectorAll('.settings-nav-item').forEach(function(item) {
        item.addEventListener('click', function() {
          const target = item.getAttribute('data-target');
          if (target) showScreen(target);
        });
      });

      window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if (panel && panel.classList.contains('translate-x-0')) {
            closeSettings();
          }
          if (gpsModal && !gpsModal.classList.contains('hidden')) { closeGPSPermissionModal(); }
          if (sideDrawer && (sideDrawer.classList.contains('drawer-open') || sideDrawer.classList.contains('translate-x-0'))) {
            closeSideMenu();
          }
          // Close all open modals on Escape
          closeAllModals();
        }
      });

      // =========================================================================
      // LIVE GPS PERMISSION & TELEMETRY CONTROLLER (Standalone Fallback)
      // =========================================================================
      const gpsModal = document.getElementById('gps-permission-modal');
      const gpsHud = document.getElementById('user-gps-status-hud');
      const gpsBtn = document.getElementById('map-live-gps-btn');
      const gpsBtnLabel = document.getElementById('gps-btn-label');
      const gpsActiveDot = document.getElementById('gps-active-dot');
      let fallbackWatchId = null;
      let lastUserPos = null;

      function openGPSPermissionModal() {
        if (gpsModal) {
          gpsModal.classList.remove('hidden');
          if (window.lucide) window.lucide.createIcons();
        }
      }

      function closeGPSPermissionModal() {
        if (gpsModal) gpsModal.classList.add('hidden');
      }

      function requestUserGPS() {
        // If already tracking, offer option to toggle off or re-center
        if (fallbackWatchId !== null || (window.gpsService && window.gpsService.isTracking)) {
          recenterUserGPS();
          return;
        }

        const stored = localStorage.getItem('raksha_gps_permission');
        if (stored === 'granted') {
          startGPSExecution();
        } else {
          openGPSPermissionModal();
        }
      }

      function confirmUserGPS() {
        const remember = document.getElementById('gps-remember-preference');
        if (remember && remember.checked) {
          localStorage.setItem('raksha_gps_permission', 'granted');
        }
        closeGPSPermissionModal();
        startGPSExecution();
      }

      function startGPSExecution() {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser.");
          return;
        }

        if (gpsBtnLabel) gpsBtnLabel.textContent = "Acquiring...";

        const handleSuccess = function(pos) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);

          // Calculate basic proximity to prominent disaster zones
          const habs = [
            { name: "Sunil Ward (Joshimath)", lat: 30.5574, lng: 79.5658, type: "Subsidence & Landslide" },
            { name: "Meppadi Village (Wayanad)", lat: 11.5516, lng: 76.1264, type: "Debris Flow & Landslide" },
            { name: "Majuli Island Coastal Ward", lat: 26.9536, lng: 94.2037, type: "Severe River Erosion" },
            { name: "Satabhaya Coastal Cluster", lat: 20.6288, lng: 86.9281, type: "Cyclone & Sea Surge" },
            { name: "Kotropi Slide Zone (Mandi)", lat: 31.8845, lng: 76.9421, type: "Massive Slope Failure" }
          ];

          let nearest = null;
          let minDist = Infinity;
          for (let i = 0; i < habs.length; i++) {
            const dLat = (habs[i].lat - lat) * (Math.PI / 180);
            const dLon = (habs[i].lng - lng) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat * (Math.PI / 180)) * Math.cos(habs[i].lat * (Math.PI / 180)) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = Math.round(6371 * c * 10) / 10;
            if (d < minDist) {
              minDist = d;
              nearest = habs[i];
            }
          }

          lastUserPos = {
            lat: lat,
            lng: lng,
            accuracy: accuracy,
            proximity: {
              nearestRedZone: { name: nearest ? nearest.name : 'Unknown', distanceKm: minDist, hazardType: nearest ? nearest.type : '' },
              nearestSafeHaven: { name: 'Pipalkoti Secure Relief Hub', distanceKm: Math.round(minDist * 0.7 * 10) / 10, headroom: 1800 },
              threatLabel: minDist <= 10 ? '🚨 CRITICAL: Within 10km Hazard Zone' : (minDist <= 30 ? '🟠 ADVISORY: Near Hazard Zone' : '🟢 STABLE: Outside Active Hazard Zone'),
              threatClass: minDist <= 10 ? 'text-red-400 border-red-500/40 bg-red-500/20' : (minDist <= 30 ? 'text-amber-400 border-amber-500/40 bg-amber-500/20' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10')
            }
          };

          // Update UI Button
          if (gpsBtnLabel) gpsBtnLabel.textContent = "Live GPS";
          if (gpsActiveDot) gpsActiveDot.classList.remove('hidden');
          if (gpsBtn) {
            gpsBtn.classList.add('border-cyan-400', 'text-cyan-300', 'bg-cyan-950/40');
          }

          // Update HUD card
          if (gpsHud) {
            gpsHud.classList.remove('hidden');
            const cEl = document.getElementById('hud-gps-coords');
            const aEl = document.getElementById('hud-gps-accuracy');
            const rName = document.getElementById('hud-nearest-redzone-name');
            const rDist = document.getElementById('hud-nearest-redzone-dist');
            const hName = document.getElementById('hud-nearest-haven-name');
            const hDist = document.getElementById('hud-nearest-haven-dist');
            const tBadge = document.getElementById('hud-gps-threat-badge');

            if (cEl) cEl.textContent = lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E';
            if (aEl) aEl.textContent = '±' + accuracy + 'm';
            if (rName && nearest) rName.textContent = nearest.name;
            if (rDist) rDist.textContent = minDist + ' km away';
            if (hName) hName.textContent = 'Pipalkoti Haven';
            if (hDist) hDist.textContent = Math.round(minDist * 0.7 * 10) / 10 + ' km away';
            if (tBadge) {
              tBadge.textContent = lastUserPos.proximity.threatLabel;
              tBadge.className = 'text-[10px] font-semibold px-2.5 py-1 rounded-lg border text-center ' + lastUserPos.proximity.threatClass;
            }
          }

          // Update Map if available
          if (window.app && window.app.mapController && window.app.mapController.renderUserLocation) {
            window.app.mapController.renderUserLocation(lastUserPos, { flyTo: true });
          } else if (window.L && window.app && window.app.mapController && window.app.mapController.map) {
            const map = window.app.mapController.map;
            map.flyTo([lat, lng], 13);
          }
        };

        const handleError = function(err) {
          console.warn("GPS error:", err);
          if (gpsBtnLabel) gpsBtnLabel.textContent = "Live GPS";
          if (err.code === 1) {
            alert("Location permission was denied in your browser. You can still explore the interactive map manually.");
          } else {
            alert("Unable to acquire live GPS fix (" + err.message + ").");
          }
        };

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { enableHighAccuracy: true, timeout: 12000 });
        fallbackWatchId = navigator.geolocation.watchPosition(handleSuccess, handleError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 4000 });
      }

      function stopUserGPS() {
        if (fallbackWatchId !== null) {
          navigator.geolocation.clearWatch(fallbackWatchId);
          fallbackWatchId = null;
        }
        if (window.gpsService) {
          window.gpsService.stopTracking();
        }
        if (gpsHud) gpsHud.classList.add('hidden');
        if (gpsActiveDot) gpsActiveDot.classList.add('hidden');
        if (gpsBtn) {
          gpsBtn.classList.remove('border-cyan-400', 'text-cyan-300', 'bg-cyan-950/40');
        }
        if (window.app && window.app.mapController && window.app.mapController.clearUserLocation) {
          window.app.mapController.clearUserLocation();
        }
        lastUserPos = null;
      }

      function recenterUserGPS() {
        if (lastUserPos && window.app && window.app.mapController && window.app.mapController.map) {
          window.app.mapController.map.flyTo([lastUserPos.lat, lastUserPos.lng], 13, { duration: 1.2 });
        } else {
          requestUserGPS();
        }
      }

      window.requestUserGPS = requestUserGPS;
      window.confirmUserGPS = confirmUserGPS;
      window.closeGPSPermissionModal = closeGPSPermissionModal;
      window.stopUserGPS = stopUserGPS;
      window.recenterUserGPS = recenterUserGPS;

      // Side Menu Drawer & Tab Controller (Guarantees instant slide-in & tab navigation in all environments)
      const sideDrawer = document.getElementById('side-menu-drawer');
      const sideBackdrop = document.getElementById('sidebar-backdrop');
      const mapFloatingBtn = document.getElementById('map-floating-menu-btn');
      const navSideMenuBtn = document.getElementById('nav-side-menu-btn');
      const closeSideBtn = document.getElementById('close-side-menu-btn');

      function openSideMenu() {
        if (!sideDrawer) return;
        sideDrawer.classList.remove('-translate-x-full');
        sideDrawer.classList.add('translate-x-0', 'drawer-open');
        if (sideBackdrop) sideBackdrop.classList.remove('hidden');
        if (navSideMenuBtn) navSideMenuBtn.classList.add('active');
        if (mapFloatingBtn) {
          mapFloatingBtn.classList.add('border-cyan-400', 'text-cyan-300', 'bg-cyan-950/40');
        }
        if (window.lucide) window.lucide.createIcons();
        if (window.app && window.app.mapController) {
          setTimeout(function() { window.app.mapController.invalidateSize(); }, 100);
          setTimeout(function() { window.app.mapController.invalidateSize(); }, 350);
        }
      }

      function closeSideMenu() {
        if (!sideDrawer) return;
        sideDrawer.classList.remove('translate-x-0', 'drawer-open');
        sideDrawer.classList.add('-translate-x-full');
        if (sideBackdrop) sideBackdrop.classList.add('hidden');
        if (navSideMenuBtn) navSideMenuBtn.classList.remove('active');
        if (mapFloatingBtn) {
          mapFloatingBtn.classList.remove('border-cyan-400', 'text-cyan-300', 'bg-cyan-950/40');
        }
        if (window.app && window.app.mapController) {
          setTimeout(function() { window.app.mapController.invalidateSize(); }, 100);
          setTimeout(function() { window.app.mapController.invalidateSize(); }, 350);
        }
      }

      function toggleSideMenu(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (gpsModal && !gpsModal.classList.contains('hidden')) { closeGPSPermissionModal(); }
          if (sideDrawer && (sideDrawer.classList.contains('drawer-open') || sideDrawer.classList.contains('translate-x-0'))) {
          closeSideMenu();
        } else {
          openSideMenu();
        }
      }

      function switchSidebarTab(tabName) {
        document.querySelectorAll('.sidebar-tab-btn').forEach(function(btn) {
          if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });

        document.querySelectorAll('.tab-pane').forEach(function(pane) {
          pane.classList.add('hidden');
        });
        const activePane = document.getElementById('tab-' + tabName);
        if (activePane) {
          activePane.classList.remove('hidden');
        }
        if (window.lucide) window.lucide.createIcons();
      }

      window.openSideMenu = openSideMenu;
      window.closeSideMenu = closeSideMenu;
      window.toggleSideMenu = toggleSideMenu;
      window.switchSidebarTab = switchSidebarTab;

      if (mapFloatingBtn) mapFloatingBtn.addEventListener('click', toggleSideMenu);
      if (navSideMenuBtn) navSideMenuBtn.addEventListener('click', toggleSideMenu);
      if (closeSideBtn) closeSideBtn.addEventListener('click', closeSideMenu);
      if (sideBackdrop) sideBackdrop.addEventListener('click', closeSideMenu);

      document.querySelectorAll('.sidebar-tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const tabName = btn.getAttribute('data-tab');
          if (tabName) switchSidebarTab(tabName);
        });
      });

      // Navigation & Modal Controller (Guarantees instant response in both HTTP and file:// environments)
      const simModal = document.getElementById('simulation-modal');
      const methModal = document.getElementById('methodology-modal');
      const histModal = document.getElementById('history-modal');
      const repModal = document.getElementById('report-modal');

      function closeAllModals() {
        [simModal, methModal, histModal, repModal].forEach(function(m) {
          if (m) m.classList.add('hidden');
        });
      }

      function openModal(m) {
        closeAllModals();
        if (m) {
          m.classList.remove('hidden');
          if (window.lucide) window.lucide.createIcons();
        }
      }

      function setSubnavActive(btnId) {
        document.querySelectorAll('.subnav-clean-item').forEach(function(b) {
          b.classList.remove('active');
        });
        const target = document.getElementById(btnId);
        if (target) target.classList.add('active');
      }

      // Home Button
      const navHome = document.getElementById('nav-home');
      if (navHome) {
        navHome.addEventListener('click', function() {
          setSubnavActive('nav-home');
          closeAllModals();
          if (window.app && window.app.mapController) {
            window.app.mapController.resetView();
          }
        });
      }

      // About / Methodology Button
      const navAbout = document.getElementById('nav-about');
      if (navAbout) {
        navAbout.addEventListener('click', function() {
          setSubnavActive('nav-about');
          openModal(methModal);
        });
      }

      // Live Events Button
      const navLive = document.getElementById('nav-live');
      if (navLive) {
        navLive.addEventListener('click', function() {
          setSubnavActive('nav-live');
          closeAllModals();
          if (window.app && window.app.mapController) {
            window.app.mapController.flyToLocation(30.5564, 79.5647, 10);
          }
          const bar = document.getElementById('live-alert-bar');
          if (bar) {
            bar.classList.add('ring-2', 'ring-red-500');
            setTimeout(function() { bar.classList.remove('ring-2', 'ring-red-500'); }, 1200);
          }
        });
      }

      // Simulation Engine Button
      const navSim = document.getElementById('nav-simulation');
      if (navSim) {
        navSim.addEventListener('click', function() {
          setSubnavActive('nav-simulation');
          openModal(simModal);
        });
      }

      // History Button
      const navHist = document.getElementById('nav-history');
      if (navHist) {
        navHist.addEventListener('click', function() {
          setSubnavActive('nav-history');
          openModal(histModal);
        });
      }

      // Modal Close Buttons
      const closeSim = document.getElementById('close-sim-modal');
      if (closeSim) closeSim.addEventListener('click', function() { if (simModal) simModal.classList.add('hidden'); });

      const closeMeth = document.getElementById('close-methodology-modal');
      if (closeMeth) closeMeth.addEventListener('click', function() { if (methModal) methModal.classList.add('hidden'); });

      const closeHist = document.getElementById('close-history-modal');
      if (closeHist) closeHist.addEventListener('click', function() { if (histModal) histModal.classList.add('hidden'); });

      const closeRep = document.getElementById('close-report-modal');
      if (closeRep) closeRep.addEventListener('click', function() { if (repModal) repModal.classList.add('hidden'); });

      window.openSimulationModal = function() { setSubnavActive('nav-simulation'); openModal(simModal); };
      window.openMethodologyModal = function() { setSubnavActive('nav-about'); openModal(methModal); };
      window.openHistoryModal = function() { setSubnavActive('nav-history'); openModal(histModal); };
      window.openReportModal = function() { openModal(repModal); };
      window.printReport = function() { openModal(repModal); setTimeout(function() { window.print(); }, 400); };

      // Click outside dialog on backdrop to dismiss modal
      [simModal, methModal, histModal, repModal].forEach(function(m) {
        if (!m) return;
        m.addEventListener('click', function(e) {
          if (e.target === m) {
            m.classList.add('hidden');
          }
        });
      });

      // Quick links from analytics drawer
      const launchSim = document.getElementById('launch-sim-trigger');
      if (launchSim) {
        launchSim.addEventListener('click', function() {
          setSubnavActive('nav-simulation');
          openModal(simModal);
        });
      }

      const inspectDetails = document.getElementById('inspect-full-details-btn');
      if (inspectDetails) {
        inspectDetails.addEventListener('click', function() {
          setSubnavActive('nav-about');
          openModal(methModal);
        });
      }

      // Global helper to fly to historical site
      window.panToHistorySite = function(lat, lng) {
        closeAllModals();
        if (window.app && window.app.mapController) {
          window.app.mapController.flyToLocation(lat, lng, 11);
        }
      };

      // Quick fallback renderer for language list if app.js module wasn't loaded
      function renderLanguageListFallback() {
        const container = document.getElementById('language-options-container');
        if (!container || container.children.length > 0) return;

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

        const currentLang = localStorage.getItem('redzone_lang') || 'en';
        container.innerHTML = languages.map(function(lang) {
          const isCur = lang.code === currentLang;
          return '<button class="lang-select-btn w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ' +
            (isCur ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-bold shadow-sm' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06] text-slate-300') +
            '" data-lang="' + lang.code + '">' +
            '<div class="flex items-center space-x-2.5 text-xs">' +
            '<span class="font-mono text-cyan-400 uppercase text-[10px] w-6">' + lang.code + '</span>' +
            '<span class="text-white">' + lang.native + '</span>' +
            '<span class="text-slate-400 text-[11px]">(' + lang.name + ')</span>' +
            '</div>' +
            (isCur ? '<i data-lucide="check" class="w-4 h-4 text-cyan-400"></i>' : '') +
            '</button>';
        }).join('');

        if (window.lucide) window.lucide.createIcons();
      }

      // Theme Toggle Support (Ultra-Dark vs. Clean Minimal Light)
      const themeToggleBtn = document.getElementById('theme-toggle-btn');
      const themeIcon = document.getElementById('theme-icon');

      function applyTheme(theme) {
        if (theme === 'light') {
          document.body.classList.add('light-theme');
          document.documentElement.classList.remove('dark');
          if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
        } else {
          document.body.classList.remove('light-theme');
          document.documentElement.classList.add('dark');
          if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
        }
        localStorage.setItem('raksha_theme', theme);
        if (window.lucide) window.lucide.createIcons();
      }

      const savedTheme = localStorage.getItem('raksha_theme') || 'dark';
      applyTheme(savedTheme);

      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
          const isLight = document.body.classList.contains('light-theme');
          const newTheme = isLight ? 'dark' : 'light';
          applyTheme(newTheme);
          if (window.app && window.app.mapController) {
            window.app.mapController.setBaseLayer(newTheme === 'light' ? 'street' : 'dark');
          }
        });
      }

      // Initial Lucide call safety
      if (window.lucide) {
        window.lucide.createIcons();
      }
    

      // =======================================================================
      // CITY FILTER & DUAL RED/GREEN ZONE INTELLIGENCE CONTROLLER
      // =======================================================================
      let currentCityFilter = null;

      function toggleCityFilterDropdown() {
        const menu = document.getElementById('city-filter-menu');
        const chevron = document.getElementById('city-filter-chevron');
        if (!menu) return;
        const isClosed = menu.classList.contains('hidden');
        if (isClosed) {
          menu.classList.remove('hidden');
          if (chevron) chevron.classList.add('rotate-180');
        } else {
          menu.classList.add('hidden');
          if (chevron) chevron.classList.remove('rotate-180');
        }
        if (window.lucide) window.lucide.createIcons();
      }

      function selectCityFilter(cityId) {
        const cities = window.CITY_INTELLIGENCE_DATA || [];
        const target = cities.find(function(c) { return c.id === cityId; });
        if (!target) {
          console.warn("City not found:", cityId);
          return;
        }

        currentCityFilter = target;

        // Close dropdown
        const menu = document.getElementById('city-filter-menu');
        const chevron = document.getElementById('city-filter-chevron');
        if (menu) menu.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotate-180');

        // Update button label
        const label = document.getElementById('city-filter-label');
        if (label) label.textContent = target.name;

        const btn = document.getElementById('city-filter-btn');
        if (btn) btn.classList.add('border-amber-400', 'text-amber-300', 'bg-amber-950/40');

        // Render in MapController
        if (window.app && window.app.mapController && window.app.mapController.renderCityIntelligence) {
          window.app.mapController.renderCityIntelligence(target, { flyTo: true, autoOpenPopups: true });
        } else if (window.L && window.app && window.app.mapController && window.app.mapController.map) {
          window.app.mapController.map.flyTo([target.lat, target.lng], 12);
        }

        // Render in Dual Intelligence Floating Dock
        renderDualCityDock(target);

        if (window.lucide) window.lucide.createIcons();
      }

      function clearCityFilter() {
        currentCityFilter = null;
        const menu = document.getElementById('city-filter-menu');
        const chevron = document.getElementById('city-filter-chevron');
        if (menu) menu.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotate-180');

        const label = document.getElementById('city-filter-label');
        if (label) label.textContent = "Filter City";

        const btn = document.getElementById('city-filter-btn');
        if (btn) btn.classList.remove('border-amber-400', 'text-amber-300', 'bg-amber-950/40');

        if (window.app && window.app.mapController && window.app.mapController.clearCityIntelligence) {
          window.app.mapController.clearCityIntelligence();
        }

        closeDualCityDock();
      }

      function closeDualCityDock() {
        const dock = document.getElementById('dual-city-intelligence-dock');
        if (dock) dock.classList.add('hidden');
      }

      function renderDualCityDock(cityData) {
        const dock = document.getElementById('dual-city-intelligence-dock');
        if (!dock) return;

        dock.classList.remove('hidden');

        // City details
        const cName = document.getElementById('dock-city-name');
        const cContext = document.getElementById('dock-city-context');
        if (cName) cName.textContent = cityData.name + ', ' + cityData.state;
        if (cContext) cContext.textContent = 'Elev: ' + cityData.elevation + ' • ' + cityData.district;

        // Red Zone details
        const rDist = document.getElementById('dock-red-dist');
        const rName = document.getElementById('dock-red-name');
        const rMeta = document.getElementById('dock-red-meta');
        const rList = document.getElementById('dock-red-hazards-list');

        if (rDist) rDist.textContent = cityData.closestRedZone.distanceKm + ' km away (' + cityData.closestRedZone.bearing + ')';
        if (rName) rName.textContent = cityData.closestRedZone.name;
        if (rMeta) rMeta.textContent = cityData.closestRedZone.hazardType + ' • Risk: ' + Math.round(cityData.closestRedZone.hazardScore * 100) + '% • Pop: ' + cityData.closestRedZone.populationAtRisk.toLocaleString();

        if (rList && cityData.closestRedZone.pastHazards) {
          rList.innerHTML = cityData.closestRedZone.pastHazards.map(function(h) {
            return '<div class="bg-red-950/40 border border-red-500/25 rounded-xl p-2 text-[11px]">' +
              '<div class="flex items-center justify-between font-bold text-red-300 text-[10px] mb-0.5">' +
                '<span class="px-1.5 py-0.5 rounded bg-red-500/25 text-red-200">' + h.date + '</span>' +
                '<span class="text-zinc-300 truncate max-w-[180px]">' + h.event + '</span>' +
              '</div>' +
              '<div class="text-[10px] text-zinc-200 leading-snug mt-1">' +
                '<span class="text-red-400 font-semibold">Impact:</span> ' + h.affected +
              '</div>' +
            '</div>';
          }).join('');
        }

        // Green Safe Haven details
        const gDist = document.getElementById('dock-green-dist');
        const gName = document.getElementById('dock-green-name');
        const gMeta = document.getElementById('dock-green-meta');
        const gShelters = document.getElementById('dock-green-shelters-list');
        const gContacts = document.getElementById('dock-green-contacts-list');

        if (gDist) gDist.textContent = cityData.closestGreenZone.distanceKm + ' km via ' + cityData.closestGreenZone.transitRoute;
        if (gName) gName.textContent = cityData.closestGreenZone.name;
        if (gMeta) gMeta.textContent = 'Carrying Headroom: +' + cityData.closestGreenZone.availableCapacityHeadroom.toLocaleString() + ' Beds • ' + cityData.closestGreenZone.infrastructureRating;

        if (gShelters && cityData.closestGreenZone.safeHouses) {
          gShelters.innerHTML = cityData.closestGreenZone.safeHouses.map(function(sh) {
            return '<div class="bg-emerald-950/40 border border-emerald-500/25 rounded-xl p-2 text-[11px]">' +
              '<div class="flex items-center justify-between font-bold text-white mb-0.5">' +
                '<span class="truncate max-w-[200px]">' + sh.name + '</span>' +
                '<span class="px-1.5 py-0.2 rounded bg-emerald-500/25 text-emerald-300 text-[10px] font-mono shrink-0">' + sh.availableBeds + ' / ' + sh.capacity + '</span>' +
              '</div>' +
              '<div class="text-[10px] text-zinc-300 leading-snug mt-0.5">' +
                '<span class="text-emerald-400 font-medium">Amenities:</span> ' + sh.amenities +
              '</div>' +
            '</div>';
          }).join('');
        }

        if (gContacts && cityData.closestGreenZone.emergencyContacts) {
          gContacts.innerHTML = cityData.closestGreenZone.emergencyContacts.map(function(c) {
            return '<a href="tel:' + c.tel + '" class="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 flex flex-col transition-all group cursor-pointer" title="Call ' + c.role + '">' +
              '<span class="text-zinc-400 truncate text-[9px]">' + c.role + '</span>' +
              '<span class="font-bold text-emerald-400 group-hover:text-emerald-300 font-mono text-[10px] flex items-center gap-1">' +
                '<span>📞</span> ' + c.contact +
              '</span>' +
            '</a>';
          }).join('');
        }

        // =====================================================================
        // RENDER EVACUATION CORRIDORS SWITCHER PILLS & ACTIVE TELEMETRY
        // =====================================================================
        const pathsContainer = document.getElementById('dock-evac-pills-container');
        const paths = cityData.evacuationPaths || [];
        const countBadge = document.getElementById('dock-corridor-count');
        if (countBadge) countBadge.textContent = paths.length + ' Routes Mapped';

        if (pathsContainer && paths.length > 0) {
          let pillsHtml = `
            <button onclick="window.selectEvacuationPath && window.selectEvacuationPath('all')" id="evac-pill-all" class="evac-route-pill active-all px-2 py-1.5 rounded-lg border border-blue-500/40 bg-blue-950/30 text-blue-300 text-[10px] font-bold flex items-center justify-center gap-1 text-center transition-all cursor-pointer">
              <span>🌐</span> <span>All ${paths.length} Paths</span>
            </button>
          `;

          paths.forEach(function(p, idx) {
            const isPrimary = p.type === 'PRIMARY_HIGHWAY';
            const isSecondary = p.type === 'SECONDARY_BYPASS';
            const pillIcon = isPrimary ? '🟢' : isSecondary ? '🟡' : '🟣';
            const shortLabel = isPrimary ? 'Primary Hwy' : isSecondary ? 'Ridge Bypass' : 'Tactical Evac';

            pillsHtml += `
              <button onclick="window.selectEvacuationPath && window.selectEvacuationPath('${p.id}')" id="evac-pill-${p.id}" class="evac-route-pill px-2 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-[10px] font-semibold flex items-center justify-between gap-1 transition-all cursor-pointer truncate" title="${p.name} (${p.distanceKm} km, ${p.estimatedMinutes}m)">
                <span class="truncate flex items-center gap-1"><span>${pillIcon}</span> <span>${shortLabel}</span></span>
                <span class="text-[9px] font-mono shrink-0 opacity-80">${p.distanceKm}k</span>
              </button>
            `;
          });

          pathsContainer.innerHTML = pillsHtml;

          // Render active route details card (default to overview or primary)
          renderActiveRouteStrip(cityData, 'all');
        }

        // =====================================================================
        // RENDER SIDE MENU RELOCATION TAB MATRIX
        // =====================================================================
        renderRelocationTabCorridors(cityData);

        if (window.lucide) window.lucide.createIcons();
      }

      function selectEvacuationPath(pathId) {
        if (!currentCityFilter || !currentCityFilter.evacuationPaths) return;
        const paths = currentCityFilter.evacuationPaths;

        // Update pill active styles
        const allPills = document.querySelectorAll('.evac-route-pill');
        allPills.forEach(function(pill) {
          pill.className = 'evac-route-pill px-2 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-[10px] font-semibold flex items-center justify-between gap-1 transition-all cursor-pointer truncate';
        });

        const activePill = document.getElementById(pathId === 'all' ? 'evac-pill-all' : 'evac-pill-' + pathId);
        if (activePill) {
          if (pathId === 'all') {
            activePill.className = 'evac-route-pill active-all px-2 py-1.5 rounded-lg border border-blue-500/80 bg-blue-950/40 text-blue-300 text-[10px] font-bold flex items-center justify-center gap-1 text-center transition-all cursor-pointer ring-1 ring-blue-500/40';
          } else {
            const targetPath = paths.find(function(p) { return p.id === pathId; });
            const pType = targetPath ? targetPath.type : '';
            const activeClass = pType === 'PRIMARY_HIGHWAY' ? 'active-primary ring-1 ring-emerald-500/40' : pType === 'SECONDARY_BYPASS' ? 'active-secondary ring-1 ring-amber-500/40' : 'active-tactical ring-1 ring-purple-500/40';
            activePill.className = 'evac-route-pill ' + activeClass + ' px-2 py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-between gap-1 transition-all cursor-pointer truncate';
          }
        }

        // Update map
        if (window.app && window.app.mapController && window.app.mapController.focusEvacuationPath) {
          window.app.mapController.focusEvacuationPath(pathId);
        } else if (window.standaloneMapController && window.standaloneMapController.focusEvacuationPath) {
          window.standaloneMapController.focusEvacuationPath(pathId);
        }

        // Update strip
        renderActiveRouteStrip(currentCityFilter, pathId);

        if (window.lucide) window.lucide.createIcons();
      }

      function renderActiveRouteStrip(cityData, pathId) {
        const strip = document.getElementById('dock-active-route-strip');
        if (!strip || !cityData || !cityData.evacuationPaths) return;

        const paths = cityData.evacuationPaths;

        if (pathId === 'all') {
          strip.innerHTML = `
            <div class="flex items-center justify-between text-zinc-300">
              <span class="font-bold text-white flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Multi-Tier Evacuation Overview: 3 Feasible Corridors</span>
              </span>
              <span class="text-zinc-400 font-mono text-[9px]">SDRF & NDMA Validated</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-[9px] pt-1 border-t border-white/5">
              <div class="p-1.5 rounded bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.06]" onclick="window.selectEvacuationPath('${paths[0].id}')">
                <div class="text-emerald-400 font-bold">🟢 ${paths[0].tierLabel}</div>
                <div class="text-zinc-300 font-mono">${paths[0].distanceKm} km • ${paths[0].estimatedMinutes}m • ${paths[0].throughputPerHour} p/h</div>
              </div>
              <div class="p-1.5 rounded bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.06]" onclick="window.selectEvacuationPath('${paths[1].id}')">
                <div class="text-amber-400 font-bold">🟡 ${paths[1].tierLabel}</div>
                <div class="text-zinc-300 font-mono">${paths[1].distanceKm} km • ${paths[1].estimatedMinutes}m • ${paths[1].throughputPerHour} p/h</div>
              </div>
              <div class="p-1.5 rounded bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.06]" onclick="window.selectEvacuationPath('${paths[2].id}')">
                <div class="text-purple-400 font-bold">🟣 ${paths[2].tierLabel}</div>
                <div class="text-zinc-300 font-mono">${paths[2].distanceKm} km • ${paths[2].estimatedMinutes}m • ${paths[2].throughputPerHour} p/h</div>
              </div>
            </div>
          `;
          return;
        }

        const path = paths.find(function(p) { return p.id === pathId; });
        if (!path) return;

        const color = path.color || '#10b981';
        const chokesHtml = (path.chokePoints || []).map(function(cp) {
          return `<span class="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px] flex items-center gap-1" title="${cp.desc}">
                    <span>${cp.icon || '📍'}</span> <span>KM ${cp.km}: ${cp.name}</span>
                  </span>`;
        }).join(' ');

        strip.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" style="background:${color}"></span>
              <span class="font-bold text-white text-xs">${path.name}</span>
              <span class="px-2 py-0.2 rounded-full text-[9px] font-bold ${path.statusBadge}">${path.status}</span>
            </div>
            <div class="font-mono text-zinc-300 text-[10px] flex items-center gap-2">
              <span>Dist: <b class="text-white">${path.distanceKm} km</b></span>
              <span>ETA: <b class="text-white">${path.estimatedMinutes} min</b></span>
              <span>Throughput: <b class="text-emerald-400">${path.throughputPerHour} pers/hr</b></span>
            </div>
          </div>
          <div class="text-zinc-300 leading-snug">${path.description}</div>
          <div class="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-white/5 text-[9px]">
            <div class="flex items-center gap-1 text-zinc-400">
              <span class="font-bold text-zinc-300">Authorized Modes:</span>
              <span>${path.transitMode}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-amber-400 font-bold">Milestones & Choke Points:</span>
              <div class="flex flex-wrap gap-1">${chokesHtml}</div>
            </div>
          </div>
        `;
      }

      function renderRelocationTabCorridors(cityData) {
        const listContainer = document.getElementById('tab-relocation-corridors-list');
        const countBadge = document.getElementById('tab-reloc-corridor-count');
        if (!listContainer || !cityData || !cityData.evacuationPaths) return;

        const paths = cityData.evacuationPaths;
        if (countBadge) countBadge.textContent = paths.length + ' Routes Mapped (' + cityData.name + ')';

        listContainer.innerHTML = paths.map(function(p) {
          const color = p.color || '#10b981';
          const isPrimary = p.type === 'PRIMARY_HIGHWAY';
          const isSecondary = p.type === 'SECONDARY_BYPASS';
          const icon = isPrimary ? '🟢' : isSecondary ? '🟡' : '🟣';

          return `
            <div class="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span>${icon}</span>
                  <span class="font-bold text-white text-xs">${p.name}</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${p.statusBadge}">${p.status}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-[10px] text-zinc-300 bg-black/30 p-2 rounded-lg border border-white/5">
                <div>
                  <div class="text-zinc-400 text-[9px]">Corridor Distance</div>
                  <div class="font-bold text-white font-mono">${p.distanceKm} km</div>
                </div>
                <div>
                  <div class="text-zinc-400 text-[9px]">Transit ETA</div>
                  <div class="font-bold text-white font-mono">${p.estimatedMinutes} Minutes</div>
                </div>
                <div>
                  <div class="text-zinc-400 text-[9px]">Max Evac Flow</div>
                  <div class="font-bold text-emerald-400 font-mono">${p.throughputPerHour} pers/hr</div>
                </div>
              </div>
              <div class="text-[10px] text-zinc-400 leading-snug">
                <span class="text-zinc-300 font-semibold">Modes:</span> ${p.transitMode}
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-white/5">
                <span class="text-[9px] text-zinc-400">${p.chokePoints ? p.chokePoints.length : 0} Milestones Monitored</span>
                <button onclick="window.selectEvacuationPath && window.selectEvacuationPath('${p.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer">
                  <span>🗺️ Inspect Corridor</span>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }

      function zoomToCityRedZone() {
        if (currentCityFilter && window.app && window.app.mapController && window.app.mapController.zoomToCityRedZone) {
          window.app.mapController.zoomToCityRedZone(currentCityFilter);
        }
      }

      function zoomToCityGreenZone() {
        if (currentCityFilter && window.app && window.app.mapController && window.app.mapController.zoomToCityGreenZone) {
          window.app.mapController.zoomToCityGreenZone(currentCityFilter);
        }
      }

      window.toggleCityFilterDropdown = toggleCityFilterDropdown;
      

      // =======================================================================
      // EMBEDDED CITY INTELLIGENCE DATA (Available in file:// and http://)
      // =======================================================================
      window.CITY_INTELLIGENCE_DATA = [
  {
    id: "CITY-JOSHIMATH",
    name: "Joshimath",
    district: "Chamoli",
    state: "Uttarakhand",
    lat: 30.5574,
    lng: 79.5658,
    elevation: "1,890m",
    hazardContext: "Active Main Central Thrust (MCT) seismic belt, overburdened glacial moraine slope, accelerated InSAR subsidence.",
    closestRedZone: {
      id: "HAB-UK-01",
      name: "Sunil & Manohar Bagh Subsidence Sector",
      distanceKm: 0.8,
      bearing: "North-East",
      lat: 30.5585,
      lng: 79.5680,
      hazardType: "InSAR Land Subsidence & Seismic Zone V",
      hazardScore: 0.94,
      slope: "38°",
      elevation: "1,890m",
      populationAtRisk: 3420,
      pastHazards: [
        {
          date: "January 2023",
          event: "Rapid Land Subsidence & Fissure Surge",
          affected: "2,800+ residents evacuated; 868 structures cracked; 181 houses condemned and razed"
        },
        {
          date: "February 7, 2021",
          event: "Chamoli / Rishiganga Glacial Flash Flood",
          affected: "204 confirmed casualties; Tapovan tunnel flooded; 1,200 villagers isolated"
        },
        {
          date: "March 29, 1999",
          event: "Chamoli M6.8 Earthquake",
          affected: "103 deaths, 395 injured; 4,700 homes destroyed across Chamoli-Joshimath"
        },
        {
          date: "June 2013",
          event: "Kedarnath-Alaknanda Multi-Valley Flood",
          affected: "5,700+ deaths in state; Alaknanda inundation cut off Joshimath for 18 days"
        }
      ]
    },
    closestGreenZone: {
      id: "SAFE-UK-01",
      name: "Pipalkoti Resilient Township",
      distanceKm: 14.2,
      transitRoute: "NH-7 Paved All-Weather Corridor",
      lat: 30.4350,
      lng: 79.4380,
      geology: "Solid Granitic Gneiss Bedrock (<11° Slope, Zero Liquefaction)",
      carryingCapacityScore: 0.84,
      availableCapacityHeadroom: 4200,
      infrastructureRating: "88% Verified",
      safeHouses: [
        {
          name: "Pipalkoti Municipal Disaster Relief Complex",
          capacity: "1,200 Beds",
          availableBeds: 850,
          amenities: "Potable RO Water (25k L/day), 125 kVA Silent DG Set, Helipad Access, 20 Bio-Toilets"
        },
        {
          name: "Govt Inter College Emergency Shelter",
          capacity: "800 Beds",
          availableBeds: 620,
          amenities: "24/7 Community Kitchen Mess, Solar Power Microgrid, Child-Friendly Care Space"
        },
        {
          name: "Alaknanda Community Center Relief Shelter",
          capacity: "450 Beds",
          availableBeds: 350,
          amenities: "Trauma Stabilization Bay, Oxygen Concentrators, Satellite VSAT Terminal"
        }
      ],
      emergencyContacts: [
        { role: "DEOC Chamoli Control Room", contact: "01372-251077", tel: "01372251077" },
        { role: "SDM / Incident Commander", name: "Dr. R. Nautiyal", contact: "+91 94120 78201", tel: "+919412078201" },
        { role: "Chief Medical Officer (CHC)", contact: "01372-252200", tel: "01372252200" },
        { role: "Disaster Helpline", contact: "1077 / 1070 (Toll-Free)", tel: "1077" }
      ]
    },
    evacuationPaths: [
      {
        id: "PATH-JOSH-01",
        name: "Primary Highway: NH-7 All-Weather Arterial",
        type: "PRIMARY_HIGHWAY",
        tierLabel: "Primary Corridor",
        badge: "Paved Highway",
        color: "#10b981",
        dashArray: null,
        weight: 4,
        distanceKm: 14.2,
        estimatedMinutes: 28,
        throughputPerHour: 1400,
        transitMode: "Evacuation Buses, Ambulances, SDRF Heavy Trucks, Water Tankers",
        status: "Open - Paved",
        statusBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        elevationProfile: "Descent 1,890m -> 1,260m (Average Gradient: 4.4%)",
        description: "Direct double-lane paved national highway along the Alaknanda valley shelf. Cleared by BRO heavy dozers.",
        chokePoints: [
          { name: "Alaknanda Bridge Checkpoint", km: 4.2, lat: 30.5310, lng: 79.5380, icon: "🌉", desc: "Single-lane structural check; SDRF traffic marshals regulating convoy intervals." },
          { name: "Helang Transit Staging Post", km: 8.5, lat: 30.5050, lng: 79.5020, icon: "🏥", desc: "Mobile medical triage camp and emergency fuel refill point." }
        ],
        waypoints: [
          [30.5585, 79.5680],
          [30.5574, 79.5658],
          [30.5310, 79.5380],
          [30.5050, 79.5020],
          [30.4680, 79.4650],
          [30.4350, 79.4380]
        ]
      },
      {
        id: "PATH-JOSH-02",
        name: "Secondary Bypass: Helang-Urgam High-Ridge Route",
        type: "SECONDARY_BYPASS",
        tierLabel: "Alternative Bypass",
        badge: "Elevated Ridge",
        color: "#f59e0b",
        dashArray: "8, 6",
        weight: 3.5,
        distanceKm: 18.6,
        estimatedMinutes: 45,
        throughputPerHour: 650,
        transitMode: "Light Motor Vehicles (LMVs), 4x4 Off-Road Jeeps, Rapid Response Pickups",
        status: "Active Caution",
        statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        elevationProfile: "Ridge Ascent: 1,890m -> 2,050m -> 1,260m",
        description: "Bypasses the lower Alaknanda gorge. Traverses solid granitic spurs safe from riverbank undercut.",
        chokePoints: [
          { name: "Upper Auli Spur", km: 3.2, lat: 30.5720, lng: 79.5490, icon: "⛰️", desc: "High vantage radio repeater station and weather telemetry unit." },
          { name: "Urgam Valley Hairpins", km: 9.1, lat: 30.5380, lng: 79.4950, icon: "⚠️", desc: "Steep 16% gradient; strictly restricted to 4x4 and LMVs." }
        ],
        waypoints: [
          [30.5585, 79.5680],
          [30.5720, 79.5490],
          [30.5380, 79.4950],
          [30.4910, 79.4580],
          [30.4520, 79.4450],
          [30.4350, 79.4380]
        ]
      },
      {
        id: "PATH-JOSH-03",
        name: "Tactical Emergency Corridor: Auli Crest Trail & Air-Bridge",
        type: "TACTICAL_EMERGENCY",
        tierLabel: "Emergency Fallback",
        badge: "Air-Bridge / Foot Trail",
        color: "#a855f7",
        dashArray: "4, 6",
        weight: 3,
        distanceKm: 11.5,
        estimatedMinutes: 140,
        throughputPerHour: 250,
        transitMode: "Foot Evacuation, Mule Convoys, IAF Mi-17 Air-Lift, Medical Drones",
        status: "Emergency Only",
        statusBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        elevationProfile: "Mountain Trail & Air Corridor",
        description: "Non-motorized emergency route activated when all highways are severed by seismic displacement.",
        chokePoints: [
          { name: "Auli GREF Helipad", km: 3.5, lat: 30.5420, lng: 79.5820, icon: "🚁", desc: "IAF Mi-17 / ALH Dhruv air-evacuation pad with 24-bed mobile trauma tent." },
          { name: "Birahi River Suspension Footbridge", km: 8.8, lat: 30.5050, lng: 79.5480, icon: "🌉", desc: "Pedestrian only. Maximum static load capacity: 40 persons per crossing." }
        ],
        waypoints: [
          [30.5585, 79.5680],
          [30.5420, 79.5820],
          [30.5050, 79.5480],
          [30.4680, 79.4890],
          [30.4350, 79.4380]
        ]
      }
    ]
  },
  {
    id: "CITY-WAYANAD",
    name: "Meppadi (Wayanad)",
    district: "Wayanad",
    state: "Kerala",
    lat: 11.5516,
    lng: 76.1264,
    elevation: "980m",
    hazardContext: "Steep Western Ghats escarpment, 42° slope, heavy monsoon debris runoff.",
    closestRedZone: {
      id: "HAB-KL-02",
      name: "Chooralmala & Mundakkai Debris Fan",
      distanceKm: 0.6,
      bearing: "South-East",
      lat: 11.5284,
      lng: 76.1685,
      hazardType: "Debris Flow & Slope Failure",
      hazardScore: 0.92,
      slope: "42°",
      elevation: "980m",
      populationAtRisk: 4150,
      pastHazards: [
        {
          date: "July 30, 2024",
          event: "Chooralmala-Mundakkai Landslide Surge",
          affected: "420+ deaths and missing; 3,500+ residents displaced; Vellarmala school and village erased"
        },
        {
          date: "August 8, 2019",
          event: "Puthumala Landslide Collapse",
          affected: "17 killed, 5 missing; 50+ houses destroyed; 1,200 plantation workers evacuated"
        },
        {
          date: "August 2018",
          event: "Great Kerala Flood & Slope Runoff",
          affected: "483 deaths statewide; 1.45M people sheltered across 3,000+ relief camps"
        }
      ]
    },
    closestGreenZone: {
      id: "SAFE-KL-02",
      name: "Nedumbala Uplands / Kalpetta Center",
      distanceKm: 18.6,
      transitRoute: "SH-59 Paved State Highway Corridor",
      lat: 11.5540,
      lng: 76.2210,
      geology: "Laterite Bedrock Plateau (<8° Slope, Non-Debris Fan)",
      carryingCapacityScore: 0.86,
      availableCapacityHeadroom: 5100,
      infrastructureRating: "90% Verified",
      safeHouses: [
        {
          name: "Nedumbala Disaster Community Center",
          capacity: "1,500 Beds",
          availableBeds: 1100,
          amenities: "Potable Spring Filtration (30k L/day), 150 kVA DG Generator, 24/7 Dining Hall"
        },
        {
          name: "Kalpetta St. Joseph Relief Shelter",
          capacity: "950 Beds",
          availableBeds: 720,
          amenities: "12-Bed Emergency Trauma Unit, 4 Dedicated Ambulance Bays, Clean Water Storage"
        },
        {
          name: "Vythiri Civil Defense Camp",
          capacity: "700 Beds",
          availableBeds: 500,
          amenities: "10-Day Ration Reserves, Infant Nutrition Desk, Trauma Counseling Station"
        }
      ],
      emergencyContacts: [
        { role: "DDMA Wayanad Control Room", contact: "04936-204151", tel: "04936204151" },
        { role: "Deputy Collector / Incident Commander", name: "K. S. Narayanan", contact: "+91 94470 29330", tel: "+919447029330" },
        { role: "Taluk Hospital Emergency", contact: "04936-202245", tel: "04936202245" },
        { role: "Kerala Disaster Helpline", contact: "1077 / 112", tel: "1077" }
      ]
    },
    evacuationPaths: [
      {
        id: "PATH-WAYA-01",
        name: "Primary Highway: SH-59 Meppadi-Kalpetta Corridor",
        type: "PRIMARY_HIGHWAY",
        tierLabel: "Primary Arterial",
        badge: "State Highway",
        color: "#10b981",
        dashArray: null,
        weight: 4,
        distanceKm: 18.6,
        estimatedMinutes: 32,
        throughputPerHour: 1200,
        transitMode: "KSRTC Evacuation Buses, Emergency Ambulances, NDRF Heavy Logistics",
        status: "Open - Paved",
        statusBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        elevationProfile: "Descent from Western Ghats Escarpment to Plateau (Slope < 6%)",
        description: "Main arterial state highway connecting Chooralmala and Meppadi to district headquarters at Kalpetta.",
        chokePoints: [
          { name: "Meppadi Central Junction", km: 4.8, lat: 11.5516, lng: 76.1264, icon: "🚦", desc: "Traffic bottleneck; Kerala Police Quick Reaction Team deployed." },
          { name: "Chundale Bridge Checkpoint", km: 12.2, lat: 11.5650, lng: 76.1780, icon: "🌉", desc: "Flood clearance monitoring station over Kabini tributary." }
        ],
        waypoints: [
          [11.5284, 76.1685],
          [11.5420, 76.1450],
          [11.5516, 76.1264],
          [11.5650, 76.1780],
          [11.5540, 76.2210]
        ]
      },
      {
        id: "PATH-WAYA-02",
        name: "Secondary Bypass: Rippon-Kottappadi Ridge Route",
        type: "SECONDARY_BYPASS",
        tierLabel: "High Ridge Bypass",
        badge: "Plantation Ridge",
        color: "#f59e0b",
        dashArray: "8, 6",
        weight: 3.5,
        distanceKm: 22.4,
        estimatedMinutes: 48,
        throughputPerHour: 550,
        transitMode: "4x4 Emergency Jeeps, Light Vehicles, Minibuses",
        status: "Active Caution",
        statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        elevationProfile: "Elevated Tea Estate Ridge (Elev: 1,020m)",
        description: "Elevated route traversing tea garden ridge spurs. Bypasses lower stream beds vulnerable to flash flooding.",
        chokePoints: [
          { name: "Rippon Estate Gate", km: 6.8, lat: 11.5120, lng: 76.1820, icon: "🚧", desc: "Gated plantation road; SDRF escort mandated during heavy rain." },
          { name: "Kottappadi High Culvert", km: 16.5, lat: 11.5350, lng: 76.2100, icon: "⚠️", desc: "Single-lane concrete culvert; weight restriction 10 tonnes." }
        ],
        waypoints: [
          [11.5284, 76.1685],
          [11.5120, 76.1820],
          [11.5350, 76.2100],
          [11.5620, 76.2380],
          [11.5540, 76.2210]
        ]
      },
      {
        id: "PATH-WAYA-03",
        name: "Tactical Emergency Corridor: Army Bailey Bridge & Forest Trail",
        type: "TACTICAL_EMERGENCY",
        tierLabel: "Emergency Tactical",
        badge: "Bailey Bridge & Trail",
        color: "#a855f7",
        dashArray: "4, 6",
        weight: 3,
        distanceKm: 13.8,
        estimatedMinutes: 120,
        throughputPerHour: 300,
        transitMode: "Army 4x4 Stallions, Rescue Tractors, Stretcher Foot Patrols, Drone Air-Drop",
        status: "Emergency Only",
        statusBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        elevationProfile: "Forest Canopy & Riverbed Crossing",
        description: "Engineered military emergency corridor featuring the 190ft Bailey Bridge constructed by Madras Sappers.",
        chokePoints: [
          { name: "Vellarmala Army Bailey Bridge", km: 1.8, lat: 11.5320, lng: 76.1750, icon: "🌉", desc: "Indian Army 24-tonne Class 40 Bailey bridge across Iruvanipuzha river." },
          { name: "Nedumbala Forest Staging Post", km: 9.5, lat: 11.5450, lng: 76.1950, icon: "🏕️", desc: "Disaster management triage tent and oxygen refilling center." }
        ],
        waypoints: [
          [11.5284, 76.1685],
          [11.5320, 76.1750],
          [11.5450, 76.1950],
          [11.5540, 76.2210]
        ]
      }
    ]
  },
  {
    id: "CITY-MAJULI",
    name: "Majuli Island",
    district: "Majuli",
    state: "Assam",
    lat: 26.9536,
    lng: 94.2037,
    elevation: "84m",
    hazardContext: "Alluvial river island in Brahmaputra, high silt erosion, seasonal flood wave.",
    closestRedZone: {
      id: "HAB-AS-03",
      name: "Salmora Riverbank Erosion Sector",
      distanceKm: 1.4,
      bearing: "South-West",
      lat: 26.9380,
      lng: 94.1820,
      hazardType: "Brahmaputra Severe Inundation & Bank Breach",
      hazardScore: 0.81,
      slope: "2°",
      elevation: "84m",
      populationAtRisk: 5800,
      pastHazards: [
        {
          date: "June–August 2022",
          event: "Brahmaputra Super Flood Wave",
          affected: "197 deaths in state; 58,000 Majuli islanders affected; 4,200 ha cropland inundated"
        },
        {
          date: "July 2020",
          event: "Brahmaputra High Inundation Stage",
          affected: "3.3M affected in Assam; 32,000 livestock displaced on Majuli; 12 schools washed away"
        },
        {
          date: "August 1950",
          event: "M8.6 Great Assam Earthquake",
          affected: "4,800 casualties; riverbed uplifted 3m; island area reduced from 1,250 to 500 km²"
        }
      ]
    },
    closestGreenZone: {
      id: "SAFE-AS-03",
      name: "Garamur Elevated Resettlement Sector",
      distanceKm: 16.5,
      transitRoute: "Kamalabari-Garamur Embankment Highway",
      lat: 27.0120,
      lng: 94.2480,
      geology: "Engineered High-Embankment Silt-Clay (>4.5m Above HFL)",
      carryingCapacityScore: 0.79,
      availableCapacityHeadroom: 6500,
      infrastructureRating: "82% Verified",
      safeHouses: [
        {
          name: "Garamur Multipurpose Flood Shelter",
          capacity: "2,000 Beds",
          availableBeds: 1450,
          amenities: "Stilt Elevation 4.5m above HFL, Automated Water Chlorination, 2 Rescue Speedboats"
        },
        {
          name: "Kamalabari Model Disaster Hub",
          capacity: "1,200 Beds",
          availableBeds: 850,
          amenities: "Solar Microgrid Power, 50,000 L Potable Storage, Community Wireless Transmitter"
        },
        {
          name: "Sub-Divisional Civil Relief Center",
          capacity: "800 Beds",
          availableBeds: 650,
          amenities: "Infant Care Ward, Emergency Medical Dispensary, Dry Grain Warehouse"
        }
      ],
      emergencyContacts: [
        { role: "Majuli DEOC Control Room", contact: "03775-274400", tel: "03775274400" },
        { role: "SDO (Civil) / Incident Commander", name: "B. Kalita, ACS", contact: "+91 94350 48212", tel: "+919435048212" },
        { role: "Garamur Civil Hospital Desk", contact: "03775-274222", tel: "03775274222" },
        { role: "Assam Disaster Helpline", contact: "1070 / 1079", tel: "1070" }
      ]
    },
    evacuationPaths: [
      {
        id: "PATH-MAJU-01",
        name: "Primary Highway: Kamalabari-Garamur Embankment Road",
        type: "PRIMARY_HIGHWAY",
        tierLabel: "Primary Embankment",
        badge: "Paved Embankment",
        color: "#10b981",
        dashArray: null,
        weight: 4,
        distanceKm: 16.5,
        estimatedMinutes: 35,
        throughputPerHour: 1100,
        transitMode: "State Transport Buses, Government Relief Trucks, Tractors with Trailers",
        status: "Operational",
        statusBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        elevationProfile: "Engineered Embankment (+3.8m above surrounding floodplain)",
        description: "Reinforced paved road built on the main flood control embankment with geo-textile sandbag armor.",
        chokePoints: [
          { name: "Kamalabari Sluice Gate Crossing", km: 5.2, lat: 26.9536, lng: 94.2037, icon: "🌊", desc: "Automated river stage monitoring sensor; water level advisory active." },
          { name: "Dakhinpat Road Junction", km: 11.4, lat: 26.9820, lng: 94.2250, icon: "🚦", desc: "Convergence of North Majuli rural feeder routes." }
        ],
        waypoints: [
          [26.9380, 94.1820],
          [26.9536, 94.2037],
          [26.9820, 94.2250],
          [27.0120, 94.2480]
        ]
      },
      {
        id: "PATH-MAJU-02",
        name: "Secondary Bypass: Jengraimukh North Canal Ring Road",
        type: "SECONDARY_BYPASS",
        tierLabel: "North Ring Bypass",
        badge: "Inland Canal Road",
        color: "#f59e0b",
        dashArray: "8, 6",
        weight: 3.5,
        distanceKm: 21.0,
        estimatedMinutes: 50,
        throughputPerHour: 500,
        transitMode: "4x4 Ambulances, Tractors, Pickups, Motorcycle Couriers",
        status: "Active Caution",
        statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        elevationProfile: "Semi-Paved Canal Bank Road (+2.5m elevation)",
        description: "Circumvents the eroding south riverbank. Provides safe transit even during high tidal surge in Brahmaputra.",
        chokePoints: [
          { name: "Jengraimukh Sluice Checkpoint", km: 8.1, lat: 26.9750, lng: 94.1850, icon: "🚧", desc: "Flood barrier gate; manned by Water Resources Dept technicians." },
          { name: "North Majuli Bailey Culvert", km: 16.0, lat: 27.0250, lng: 94.2200, icon: "⚠️", desc: "Temporary steel decking; single-file vehicular passage." }
        ],
        waypoints: [
          [26.9380, 94.1820],
          [26.9250, 94.1550],
          [26.9750, 94.1850],
          [27.0250, 94.2200],
          [27.0120, 94.2480]
        ]
      },
      {
        id: "PATH-MAJU-03",
        name: "Tactical Emergency Corridor: SDRF Speedboat Waterway Ferry",
        type: "TACTICAL_EMERGENCY",
        tierLabel: "Waterway Ferry",
        badge: "Rescue Boats / Ferries",
        color: "#a855f7",
        dashArray: "4, 6",
        weight: 3,
        distanceKm: 14.0,
        estimatedMinutes: 25,
        throughputPerHour: 450,
        transitMode: "SDRF Motorized Speedboats, Inflatable Gemini Boats, Catamaran Ferries",
        status: "Standby Active",
        statusBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        elevationProfile: "Navigable Flood Channel (Water Depth: 3.5m)",
        description: "Dedicated river corridor utilized when road embankments are breached. Operated by SDRF 1st Battalion.",
        chokePoints: [
          { name: "Salmora Emergency Jetty", km: 0.5, lat: 26.9380, lng: 94.1820, icon: "⚓", desc: "Floating pontoon for rapid embarkation of elderly and children." },
          { name: "Garamur High Stilt Landing", km: 13.8, lat: 27.0120, lng: 94.2480, icon: "🚤", desc: "Concrete stilt boat dock adjacent to the Multipurpose Cyclone Shelter." }
        ],
        waypoints: [
          [26.9380, 94.1820],
          [26.9600, 94.2050],
          [26.9950, 94.2300],
          [27.0120, 94.2480]
        ]
      }
    ]
  },
  {
    id: "CITY-KENDRAPARA",
    name: "Kendrapara (Satabhaya)",
    district: "Kendrapara",
    state: "Odisha",
    lat: 20.6288,
    lng: 86.9281,
    elevation: "4m",
    hazardContext: "Bay of Bengal low-lying littoral zone, severe sea ingress, tidal storm surges.",
    closestRedZone: {
      id: "HAB-OD-04",
      name: "Satabhaya Coastal Ingress Cluster",
      distanceKm: 0.5,
      bearing: "East",
      lat: 20.6250,
      lng: 86.9320,
      hazardType: "Cyclone Storm Surge & Sea-Level Ingress",
      hazardScore: 0.87,
      slope: "1°",
      elevation: "4m",
      populationAtRisk: 3200,
      pastHazards: [
        {
          date: "May 26, 2021",
          event: "Very Severe Cyclonic Storm Yaas",
          affected: "4.2m tidal surge; 128 coastal villages submerged; 150,000 evacuated in Kendrapara"
        },
        {
          date: "May 3, 2019",
          event: "Extremely Severe Cyclone Fani",
          affected: "89 deaths, 16.5M affected in Odisha; 500,000 homes damaged; 14-day total blackout"
        },
        {
          date: "October 29, 1999",
          event: "Odisha Super Cyclone (05B)",
          affected: "9,887 confirmed dead; 1.9M houses flattened; 10,000 cattle lost in Kendrapara"
        }
      ]
    },
    closestGreenZone: {
      id: "SAFE-OD-04",
      name: "Bagapatia Resettlement Colony",
      distanceKm: 12.4,
      transitRoute: "Rajnagar-Bagapatia Concrete Evacuation Route",
      lat: 20.6540,
      lng: 86.8120,
      geology: "Inland Stable Deltaic Sandy Clay (>9m Elevation)",
      carryingCapacityScore: 0.83,
      availableCapacityHeadroom: 4800,
      infrastructureRating: "85% Verified",
      safeHouses: [
        {
          name: "Bagapatia Cyclone Relief Center",
          capacity: "1,800 Beds",
          availableBeds: 1350,
          amenities: "Wind-Resistant Structure (up to 250 km/h), Dual Borewells, Solar Water Purifier"
        },
        {
          name: "Rajnagar ODRAF Disaster Depot",
          capacity: "1,000 Beds",
          availableBeds: 750,
          amenities: "Inflatable Motorized Rescue Boats, Power Saws, Satellite Mobile Unit"
        },
        {
          name: "Gupti Multipurpose Shelter",
          capacity: "650 Beds",
          availableBeds: 480,
          amenities: "Emergency Maternity Clinic, Solar Generator, Dry Rations Buffer for 3 Weeks"
        }
      ],
      emergencyContacts: [
        { role: "Kendrapara DEOC Control Room", contact: "06727-232803", tel: "06727232803" },
        { role: "Collector & District Magistrate", name: "Amrit Ruturaj, IAS", contact: "06727-232801", tel: "06727232801" },
        { role: "DHH Kendrapara Emergency", contact: "06727-232444", tel: "06727232444" },
        { role: "OSDMA State Control Room", contact: "1077 / 0674-2395398", tel: "1077" }
      ]
    },
    evacuationPaths: [
      {
        id: "PATH-KEND-01",
        name: "Primary Highway: Rajnagar-Bagapatia Concrete Corridor",
        type: "PRIMARY_HIGHWAY",
        tierLabel: "Concrete Tidal Highway",
        badge: "Concrete Elevated",
        color: "#10b981",
        dashArray: null,
        weight: 4,
        distanceKm: 12.4,
        estimatedMinutes: 22,
        throughputPerHour: 1300,
        transitMode: "Evacuation Buses, OSRTC Convoys, Fire Service Water Tankers, Ambulances",
        status: "Open - Elevated",
        statusBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        elevationProfile: "Elevated Sea-Dike Shelf (+5.2m Above Sea Level)",
        description: "Specially engineered concrete evacuation road built on coastal defense embankment with reinforced culverts.",
        chokePoints: [
          { name: "Satabhaya Sea-Dike Guard", km: 1.2, lat: 20.6288, lng: 86.9281, icon: "🌊", desc: "Tidal surge sensor gate; monitored by Odisha Coastal Police." },
          { name: "Rajnagar Canal Bridge", km: 7.5, lat: 20.6410, lng: 86.8850, icon: "🌉", desc: "Double-lane concrete bridge; high flood clearance." }
        ],
        waypoints: [
          [20.6250, 86.9320],
          [20.6288, 86.9281],
          [20.6410, 86.8850],
          [20.6540, 86.8120]
        ]
      },
      {
        id: "PATH-KEND-02",
        name: "Secondary Bypass: Gupti-Mahakalapada Inland Link",
        type: "SECONDARY_BYPASS",
        tierLabel: "Inland Rural Link",
        badge: "Inland Bypass",
        color: "#f59e0b",
        dashArray: "8, 6",
        weight: 3.5,
        distanceKm: 17.8,
        estimatedMinutes: 40,
        throughputPerHour: 600,
        transitMode: "Light Trucks, Tractors, LMVs, 4x4 Emergency Jeeps",
        status: "Active Caution",
        statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        elevationProfile: "Inland Agricultural Ridge (+7.0m Above Sea Level)",
        description: "Bypasses coastal salt marsh areas; runs through stable agricultural terrain safe from saline inundation.",
        chokePoints: [
          { name: "Gupti Shelter Staging Post", km: 5.4, lat: 20.5980, lng: 86.9100, icon: "🏥", desc: "Intermediate community relief center with clean drinking water station." },
          { name: "Hansua Creek Crossing", km: 12.1, lat: 20.6150, lng: 86.8550, icon: "⚠️", desc: "Causeway submersible during extreme astronomical tides (>4.8m)." }
        ],
        waypoints: [
          [20.6250, 86.9320],
          [20.5980, 86.9100],
          [20.6150, 86.8550],
          [20.6540, 86.8120]
        ]
      },
      {
        id: "PATH-KEND-03",
        name: "Tactical Emergency Corridor: ODRAF Tidal Channel Boat Route",
        type: "TACTICAL_EMERGENCY",
        tierLabel: "ODRAF Waterway",
        badge: "Hovercraft & Boats",
        color: "#a855f7",
        dashArray: "4, 6",
        weight: 3,
        distanceKm: 9.2,
        estimatedMinutes: 20,
        throughputPerHour: 350,
        transitMode: "ODRAF Motorized Inflatable Boats, Shallow-Draft Catamarans, Indian Coast Guard Air-Cushion Vessels",
        status: "Standby Active",
        statusBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        elevationProfile: "Tidal Estuarine Channel (Bhitarkanika Backwaters)",
        description: "Emergency amphibious route deployed during severe cyclone landfall when road bridges are submerged.",
        chokePoints: [
          { name: "Pentha Tidal Jetty", km: 2.1, lat: 20.6380, lng: 86.8900, icon: "⚓", desc: "High-tide embarkation dock equipped with life-rafts and satellite radio." },
          { name: "Bagapatia Ingress Basin", km: 9.0, lat: 20.6540, lng: 86.8120, icon: "🚤", desc: "Sheltered inland canal landing with direct ramp access to the Resettlement Colony." }
        ],
        waypoints: [
          [20.6250, 86.9320],
          [20.6380, 86.8900],
          [20.6540, 86.8120]
        ]
      }
    ]
  },
  {
    id: "CITY-MANDI",
    name: "Mandi (Kotropi)",
    district: "Mandi",
    state: "Himachal Pradesh",
    lat: 31.8845,
    lng: 76.9421,
    elevation: "1,150m",
    hazardContext: "Sheared metamorphic flysch zone, fractured rock mass, high cloudburst frequency.",
    closestRedZone: {
      id: "HAB-HP-05",
      name: "Kotropi Massive Slope Failure Sector",
      distanceKm: 0.9,
      bearing: "North",
      lat: 31.8890,
      lng: 76.9460,
      hazardType: "Regolith Landslide & Torrent Erosion",
      hazardScore: 0.78,
      slope: "35°",
      elevation: "1,150m",
      populationAtRisk: 2400,
      pastHazards: [
        {
          date: "July–August 2023",
          event: "Himachal Cloudburst & Beas River Surge",
          affected: "514 deaths across HP; 12,000 homes destroyed; Mandi isolated for 12 days"
        },
        {
          date: "August 13, 2017",
          event: "Kotropi Landslide Tragedy",
          affected: "48 bus passengers killed when 250m mud avalanche swallowed NH-154"
        },
        {
          date: "August 2014",
          event: "Dharampur Cloudburst Flash Flood",
          affected: "15 deaths; 3 bus stations swept away; ₹120 Cr infrastructure damage"
        }
      ]
    },
    closestGreenZone: {
      id: "SAFE-HP-05",
      name: "Joginder Nagar Resettlement Ridge",
      distanceKm: 22.0,
      transitRoute: "NH-154 Reinforced Highway Corridor",
      lat: 31.9850,
      lng: 76.7720,
      geology: "Solid Quartzite Ridge (<7° Slope, Stable Bedrock)",
      carryingCapacityScore: 0.81,
      availableCapacityHeadroom: 3900,
      infrastructureRating: "84% Verified",
      safeHouses: [
        {
          name: "Joginder Nagar Disaster Relief Center",
          capacity: "1,200 Beds",
          availableBeds: 900,
          amenities: "Paved Highway Access, 100 kVA Generator, 30,000 L/day Municipal Spring Supply"
        },
        {
          name: "Padhar Civil Defense Shelter",
          capacity: "750 Beds",
          availableBeds: 520,
          amenities: "Trauma Stabilization Bay, Hot Meal Kitchen Mess, Satellite Phone Desk"
        },
        {
          name: "Govt Senior Secondary Relief Campus",
          capacity: "600 Beds",
          availableBeds: 450,
          amenities: "Clean Dormitories, Clean Sanitation Blocks, Supply Depot"
        }
      ],
      emergencyContacts: [
        { role: "Mandi DEOC Control Room", contact: "01905-226201", tel: "01905226201" },
        { role: "SDM / Incident Commander (Padhar)", name: "S. K. Thakur, HAS", contact: "+91 94180 34120", tel: "+919418034120" },
        { role: "Zonal Hospital Mandi Emergency", contact: "01905-222102", tel: "01905222102" },
        { role: "HP SDMA Helpline", contact: "1070 / 1077", tel: "1070" }
      ]
    },
    evacuationPaths: [
      {
        id: "PATH-MAND-01",
        name: "Primary Highway: NH-154 Mandi-Pathankot Highway",
        type: "PRIMARY_HIGHWAY",
        tierLabel: "National Highway",
        badge: "Paved Highway",
        color: "#10b981",
        dashArray: null,
        weight: 4,
        distanceKm: 22.0,
        estimatedMinutes: 42,
        throughputPerHour: 1150,
        transitMode: "HRTC Evacuation Convoys, Fire Tenders, Emergency Ambulances, Heavy Trucks",
        status: "Open - Paved",
        statusBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        elevationProfile: "Ascent 1,150m -> 1,220m (Smooth Gradient < 5%)",
        description: "Paved two-lane national highway with reinforced rockfall retaining nets and concrete toe-walls.",
        chokePoints: [
          { name: "Kotropi Slide Memorial Checkpoint", km: 1.5, lat: 31.8845, lng: 76.9421, icon: "⚠️", desc: "Automated geophone acoustic sensor monitoring active slope creep." },
          { name: "Padhar Sub-Divisional Depot", km: 11.2, lat: 31.9210, lng: 76.8850, icon: "🏥", desc: "Emergency fuel buffer and medical first-aid stabilization center." }
        ],
        waypoints: [
          [31.8890, 76.9460],
          [31.8845, 76.9421],
          [31.9210, 76.8850],
          [31.9540, 76.8250],
          [31.9850, 76.7720]
        ]
      },
      {
        id: "PATH-MAND-02",
        name: "Secondary Bypass: Padhar-Drang Terraced Mountain Route",
        type: "SECONDARY_BYPASS",
        tierLabel: "Terraced Mountain Bypass",
        badge: "Mountain Bypass",
        color: "#f59e0b",
        dashArray: "8, 6",
        weight: 3.5,
        distanceKm: 27.5,
        estimatedMinutes: 58,
        throughputPerHour: 500,
        transitMode: "4x4 SUVs, Light Commercial Vehicles, Himachal Police Patrols",
        status: "Active Caution",
        statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        elevationProfile: "Mountain Pass Traverse (Ridge Elev: 1,380m)",
        description: "Upper mountain road traversing stable sandstone terraces. Safe from Beas river flash inundation.",
        chokePoints: [
          { name: "Drang Salt Mine Hairpin", km: 8.5, lat: 31.9120, lng: 76.9650, icon: "🚧", desc: "Sharp switchback bends; strict one-way pilot vehicle convoy operation." },
          { name: "Uhl River Hydro Crossing", km: 20.4, lat: 31.9950, lng: 76.8100, icon: "🌉", desc: "Reinforced bridge over Uhl torrent with 24/7 flood gate watch." }
        ],
        waypoints: [
          [31.8890, 76.9460],
          [31.9120, 76.9650],
          [31.9650, 76.9100],
          [31.9950, 76.8100],
          [31.9850, 76.7720]
        ]
      },
      {
        id: "PATH-MAND-03",
        name: "Tactical Emergency Corridor: Civil Defense Ridge & Mule Trail",
        type: "TACTICAL_EMERGENCY",
        tierLabel: "Ridge Mule Track",
        badge: "Foot / Mule Trail",
        color: "#a855f7",
        dashArray: "4, 6",
        weight: 3,
        distanceKm: 15.2,
        estimatedMinutes: 210,
        throughputPerHour: 200,
        transitMode: "Foot Columns, Civil Defense Mule Packs, Mountain Rescue Teams, Air-Drop",
        status: "Emergency Only",
        statusBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        elevationProfile: "High-Altitude Ridgeway Footpath",
        description: "Traditional shepherd ridge corridor maintained by Himachal Home Guards for zero-road access scenarios.",
        chokePoints: [
          { name: "Shivalik Crest Shelter Post", km: 6.0, lat: 31.9350, lng: 76.9020, icon: "🏕️", desc: "Emergency stone shelter with high-frequency wireless communications relay." },
          { name: "Joginder Nagar South Trailhead", km: 14.5, lat: 31.9680, lng: 76.8250, icon: "🏁", desc: "Reception camp with warm rations, blankets, and ambulances." }
        ],
        waypoints: [
          [31.8890, 76.9460],
          [31.9350, 76.9020],
          [31.9680, 76.8250],
          [31.9850, 76.7720]
        ]
      }
    ]
  }
];

      // UNIVERSAL RESILIENT LEAFLET MAP ENGINE (Runs on file:// and http://)
      // =======================================================================
      function initResilientMap() {
        if (window.__resilient_map_done) return;
        if (window.app && window.app.mapController && window.app.mapController.map) {
          window.__resilient_map_done = true;
          return;
        }
        if (typeof L === 'undefined') {
          setTimeout(initResilientMap, 100);
          return;
        }

        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;
        if (mapContainer._leaflet_id) {
          window.__resilient_map_done = true;
          return;
        }

        window.__resilient_map_done = true;
        console.log("Starting Universal Resilient Map Engine (Offline file:// & HTTP verified)...");

        const INDIA_CENTER = [22.5937, 78.9629];
        const map = L.map('map-container', {
          center: INDIA_CENTER,
          zoom: 5,
          minZoom: 4,
          maxZoom: 16,
          zoomControl: false
        });

        // Tile layers
        const darkLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | NDMA Geospatial',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19,
          className: 'dark-tiles'
        }).addTo(map);

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri, Maxar, Earthstar Geographics',
          maxZoom: 19,
          className: 'satellite-tiles'
        });

        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19
        });

        let currentBase = darkLayer;

        // Layer groups
        const cityIntelGroup = L.layerGroup().addTo(map);
        const evacPathsGroup = L.layerGroup().addTo(map);
        const userLocationGroup = L.layerGroup().addTo(map);
        const markersGroup = L.layerGroup().addTo(map);

        // Initial default high-risk pin markers on map
        const defaultPins = [
          { name: "Sunil Ward (Joshimath)", lat: 30.5574, lng: 79.5658, state: "Uttarakhand", type: "MCT Subsidence", score: "94%" },
          { name: "Chooralmala (Wayanad)", lat: 11.5284, lng: 76.1685, state: "Kerala", type: "Debris Flow", score: "92%" },
          { name: "Salmora (Majuli Island)", lat: 26.9380, lng: 94.1820, state: "Assam", type: "Riverbank Erosion", score: "81%" },
          { name: "Satabhaya Cluster", lat: 20.6250, lng: 86.9320, state: "Odisha", type: "Cyclone Ingress", score: "87%" },
          { name: "Kotropi Slide Zone", lat: 31.8890, lng: 76.9460, state: "Himachal Pradesh", type: "Slope Failure", score: "78%" }
        ];

        defaultPins.forEach(function(pin) {
          const pinIcon = L.divIcon({
            className: 'red-danger-marker',
            html: '<div class="red-radar-beacon"><div class="red-radar-wave"></div><div class="red-radar-center">⚠️</div></div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
          });

          L.marker([pin.lat, pin.lng], { icon: pinIcon })
            .bindPopup(
              '<div class="p-3 text-xs font-sans text-slate-100">' +
                '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">🔴 High-Risk Habitation</span>' +
                '<div class="text-sm font-bold text-white mt-1.5">' + pin.name + '</div>' +
                '<div class="text-[11px] text-zinc-400 mb-2">' + pin.state + ' • Hazard Index: <b class="text-red-400">' + pin.score + '</b></div>' +
                '<div class="text-[10px] text-zinc-300 bg-white/[0.04] p-2 rounded-lg border border-white/10 mb-2">' + pin.type + '</div>' +
                '<button class="w-full text-xs bg-red-600 hover:bg-red-500 text-white font-semibold py-1.5 px-2 rounded-xl transition-all" onclick="window.selectCityFilter && window.selectCityFilter(\'' + (pin.name.includes('Joshimath') ? 'CITY-JOSHIMATH' : (pin.name.includes('Wayanad') ? 'CITY-WAYANAD' : (pin.name.includes('Majuli') ? 'CITY-MAJULI' : (pin.name.includes('Satabhaya') ? 'CITY-KENDRAPARA' : 'CITY-MANDI')))) + '\')">View Full Intelligence</button>' +
              '</div>',
              { className: 'city-intel-popup red-theme' }
            )
            .addTo(markersGroup);
        });

        window.map = map;
        window.standaloneMap = map;

        window.standaloneMapController = {
          map: map,
          cityIntelligenceLayerGroup: cityIntelGroup,
          evacuationPathsGroup: evacPathsGroup,
          activeEvacuationPathId: 'all',
          renderEvacuationPaths: function(paths, selectedPathId) {
            if (!map || !evacPathsGroup) return null;
            evacPathsGroup.clearLayers();
            if (!paths || paths.length === 0) return null;

            selectedPathId = selectedPathId || 'all';
            const allBounds = L.latLngBounds([]);

            paths.forEach(function(path) {
              const isSelected = (selectedPathId === 'all' || selectedPathId === path.id);
              const isDimmed = (selectedPathId !== 'all' && selectedPathId !== path.id);

              const color = path.color || (path.type === 'PRIMARY_HIGHWAY' ? '#10b981' : path.type === 'SECONDARY_BYPASS' ? '#f59e0b' : '#a855f7');
              const weight = isDimmed ? 2.5 : (isSelected && selectedPathId !== 'all' ? 5.5 : 4);
              const opacity = isDimmed ? 0.22 : (isSelected && selectedPathId !== 'all' ? 1.0 : 0.85);

              let dashArray = null;
              if (path.dashArray) dashArray = path.dashArray;
              else if (path.type === 'SECONDARY_BYPASS') dashArray = '8, 6';
              else if (path.type === 'TACTICAL_EMERGENCY') dashArray = '4, 6';

              const polyline = L.polyline(path.waypoints, {
                color: color,
                weight: weight,
                opacity: opacity,
                dashArray: dashArray,
                lineCap: 'round',
                lineJoin: 'round',
                className: 'evac-polyline-' + path.id + (isSelected ? ' active-path-glow' : '')
              }).addTo(evacPathsGroup);

              path.waypoints.forEach(function(pt) { allBounds.extend(pt); });

              polyline.bindTooltip(
                '<div class="p-1.5 font-sans text-xs">' +
                  '<div class="font-bold text-white flex items-center gap-1.5">' +
                    '<span class="w-2.5 h-2.5 rounded-full" style="background:' + color + ';"></span>' +
                    '<span>' + path.name + '</span>' +
                  '</div>' +
                  '<div class="text-[10px] text-zinc-300 mt-0.5"><b>' + path.distanceKm + ' km</b> • ETA: <b>' + path.estimatedMinutes + ' min</b> • <b>' + path.throughputPerHour + ' pers/hr</b></div>' +
                  '<div class="text-[9px] text-amber-300 mt-1 font-semibold">👉 Click to inspect corridor</div>' +
                '</div>',
                { sticky: true, className: 'corridor-hover-tooltip' }
              );

              polyline.on('click', function() {
                if (window.selectEvacuationPath) window.selectEvacuationPath(path.id);
              });

              // Midpoint route badge
              if (!isDimmed && path.waypoints.length > 1) {
                const midIdx = Math.floor(path.waypoints.length / 2);
                const midPt = path.waypoints[midIdx];
                const badgeTypeClass = path.type === 'PRIMARY_HIGHWAY' ? 'primary-badge' : path.type === 'SECONDARY_BYPASS' ? 'secondary-badge' : 'tactical-badge';
                const iconEmoji = path.type === 'PRIMARY_HIGHWAY' ? '🟢' : path.type === 'SECONDARY_BYPASS' ? '🟡' : '🟣';

                const badgeIcon = L.divIcon({
                  className: 'corridor-badge-container',
                  html: '<div class="corridor-dist-badge ' + badgeTypeClass + ' cursor-pointer" onclick="window.selectEvacuationPath && window.selectEvacuationPath('' + path.id + '')" title="Click to focus ' + path.name + '">' +
                           iconEmoji + ' ' + path.distanceKm + ' km • ' + path.estimatedMinutes + 'm' +
                         '</div>',
                  iconSize: [120, 24],
                  iconAnchor: [60, 12]
                });
                L.marker(midPt, { icon: badgeIcon, interactive: true }).addTo(evacPathsGroup);
              }

              // Checkpoints
              if (isSelected && path.chokePoints) {
                path.chokePoints.forEach(function(cp) {
                  const cpIcon = L.divIcon({
                    className: 'checkpoint-pin-container',
                    html: '<div class="evacuation-checkpoint-pin" style="border-color:' + color + '; background:rgba(10,12,18,0.9);" title="' + cp.name + '">' +
                            '<span>' + (cp.icon || '📍') + '</span>' +
                          '</div>',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                    popupAnchor: [0, -14]
                  });

                  const cpPopup = 
                    '<div class="p-2.5 font-sans text-slate-100 text-xs min-w-[210px]">' +
                      '<div class="flex items-center justify-between gap-1.5 mb-1">' +
                        '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300">KM ' + cp.km + ' MILESTONE</span>' +
                        '<span class="text-[9px] font-bold font-mono" style="color:' + color + '">' + path.tierLabel + '</span>' +
                      '</div>' +
                      '<div class="text-xs font-bold text-white mb-1 flex items-center gap-1.5"><span>' + (cp.icon || '📍') + '</span> <span>' + cp.name + '</span></div>' +
                      '<p class="text-[10px] text-zinc-300 leading-snug mb-1.5">' + cp.desc + '</p>' +
                      '<div class="text-[9px] text-zinc-400 border-t border-white/10 pt-1 flex justify-between">' +
                        '<span>Corridor:</span> <span class="font-medium text-white">' + path.name + '</span>' +
                      '</div>' +
                    '</div>';

                  L.marker([cp.lat, cp.lng], { icon: cpIcon })
                    .bindPopup(cpPopup, { className: 'checkpoint-info-popup', maxWidth: 280 })
                    .addTo(evacPathsGroup);
                });
              }
            });

            return allBounds;
          },
          focusEvacuationPath: function(pathId) {
            if (!currentCityFilter || !currentCityFilter.evacuationPaths) return;
            const paths = currentCityFilter.evacuationPaths;
            this.activeEvacuationPathId = pathId;

            if (pathId === 'all') {
              const allBounds = this.renderEvacuationPaths(paths, 'all');
              if (allBounds && allBounds.isValid()) {
                map.fitBounds(allBounds, { padding: [60, 60], maxZoom: 13, duration: 1.0 });
              }
            } else {
              const targetPath = paths.find(function(p) { return p.id === pathId; });
              if (targetPath) {
                this.renderEvacuationPaths(paths, pathId);
                const pathBounds = L.latLngBounds(targetPath.waypoints);
                map.fitBounds(pathBounds, { padding: [70, 70], maxZoom: 14, duration: 1.2 });
              }
            }
          },
          clearEvacuationPaths: function() {
            if (evacPathsGroup) evacPathsGroup.clearLayers();
          },
          userLocationLayerGroup: userLocationGroup,
          setBaseLayer: function(type) {
            if (currentBase) map.removeLayer(currentBase);
            if (type === 'satellite') currentBase = satelliteLayer;
            else if (type === 'street') currentBase = streetLayer;
            else currentBase = darkLayer;
            currentBase.addTo(map);
          },
          zoomIn: function() { map.zoomIn(); },
          zoomOut: function() { map.zoomOut(); },
          resetView: function() { map.flyTo(INDIA_CENTER, 5, { duration: 1.2 }); },
          flyToLocation: function(lat, lng, zoom) { map.flyTo([lat, lng], zoom || 12, { duration: 1.4 }); },
          renderCityIntelligence: function(cityData, options) {
            options = options || { flyTo: true, autoOpenPopups: true };
            cityIntelGroup.clearLayers();

            const lat = cityData.lat;
            const lng = cityData.lng;
            const closestRedZone = cityData.closestRedZone;
            const closestGreenZone = cityData.closestGreenZone;

            if (options.flyTo) {
              map.flyTo([lat, lng], 12, { duration: 1.4 });
            }

            // 1. City Center Epicenter Marker
            const cityIcon = L.divIcon({
              className: 'city-epicenter-marker',
              html: '<div class="city-beacon-container"><div class="city-beacon-ring"></div><div class="city-beacon-dot">📍</div></div>',
              iconSize: [36, 36],
              iconAnchor: [18, 18],
              popupAnchor: [0, -18]
            });

            L.marker([lat, lng], { icon: cityIcon })
              .bindPopup(
                '<div class="p-3 font-sans text-slate-100 text-xs">' +
                  '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">Selected Study City</span>' +
                  '<div class="text-sm font-bold text-white mt-1">' + cityData.name + '</div>' +
                  '<div class="text-[11px] text-zinc-400 mb-2">' + cityData.district + ', ' + cityData.state + ' • Elev: ' + cityData.elevation + '</div>' +
                  '<p class="text-[11px] text-zinc-300 mb-2 leading-snug">' + cityData.hazardContext + '</p>' +
                  '<div class="text-[10px] text-zinc-300 border-t border-white/10 pt-1.5 flex flex-col gap-1">' +
                    '<div class="flex justify-between text-red-300"><span>🔴 Closest Red Zone:</span><b>' + closestRedZone.distanceKm + ' km (' + closestRedZone.bearing + ')</b></div>' +
                    '<div class="flex justify-between text-emerald-300"><span>🟢 Closest Safe Haven:</span><b>' + closestGreenZone.distanceKm + ' km</b></div>' +
                  '</div>' +
                '</div>',
                { className: 'city-intel-popup amber-theme' }
              )
              .addTo(cityIntelGroup);

            // 2. Red Zone Danger Marker & Popup
            const redIcon = L.divIcon({
              className: 'red-danger-marker',
              html: '<div class="red-radar-beacon"><div class="red-radar-wave"></div><div class="red-radar-wave wave-2"></div><div class="red-radar-center">⚠️</div></div>',
              iconSize: [42, 42],
              iconAnchor: [21, 21],
              popupAnchor: [0, -22]
            });

            const redPopupContent = 
              '<div class="p-3.5 font-sans text-slate-100 text-xs max-w-[340px]">' +
                '<div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-red-500/20">' +
                  '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5">' +
                    '<span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> 🔴 CLOSEST RED ZONE' +
                  '</span>' +
                  '<span class="text-[10px] font-bold text-red-400 font-mono">' + closestRedZone.distanceKm + ' km from ' + cityData.name + '</span>' +
                '</div>' +
                '<div class="text-sm font-bold text-white leading-tight mb-1">' + closestRedZone.name + '</div>' +
                '<div class="text-[11px] text-zinc-400 mb-2.5">' +
                  '<span class="text-red-400 font-semibold">' + closestRedZone.hazardType + '</span> • ' +
                  'Risk: <b class="text-white">' + Math.round(closestRedZone.hazardScore * 100) + '%</b> • ' +
                  'At Risk: <b class="text-white">' + closestRedZone.populationAtRisk.toLocaleString() + '</b>' +
                '</div>' +
                '<div class="border-t border-red-500/20 pt-2 space-y-1.5">' +
                  '<div class="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">' +
                    '<span>📜 Past Hazards & Disasters</span>' +
                    '<span class="text-[9px] text-zinc-400 font-normal">Official Records</span>' +
                  '</div>' +
                  '<div class="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scroll">' +
                    closestRedZone.pastHazards.map(function(h) {
                      return '<div class="bg-red-950/40 border border-red-500/25 rounded-xl p-2 text-[11px]">' +
                        '<div class="flex items-center justify-between font-bold text-red-300 text-[10px] mb-0.5">' +
                          '<span class="px-1.5 py-0.5 rounded bg-red-500/25 text-red-200">' + h.date + '</span>' +
                          '<span class="text-zinc-300 truncate max-w-[170px]">' + h.event + '</span>' +
                        '</div>' +
                        '<div class="text-[11px] text-zinc-200 leading-snug mt-1">' +
                          '<span class="text-red-400 font-semibold">Impact:</span> ' + h.affected +
                        '</div>' +
                      '</div>';
                    }).join('') +
                  '</div>' +
                '</div>' +
                '<div class="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">' +
                  '<span>Slope: ' + closestRedZone.slope + ' • Elev: ' + closestRedZone.elevation + '</span>' +
                  '<span class="text-red-400 font-bold">Relocation: Priority Tier 1</span>' +
                '</div>' +
              '</div>';

            const redMarker = L.marker([closestRedZone.lat, closestRedZone.lng], { icon: redIcon })
              .bindPopup(redPopupContent, {
                className: 'city-intel-popup red-theme',
                autoClose: false,
                closeOnClick: false,
                maxWidth: 350
              })
              .addTo(cityIntelGroup);

            // 3. Green Zone Safe Haven Marker & Popup
            const greenIcon = L.divIcon({
              className: 'green-haven-marker',
              html: '<div class="green-radar-beacon"><div class="green-radar-wave"></div><div class="green-radar-wave wave-2"></div><div class="green-radar-center">🛡️</div></div>',
              iconSize: [42, 42],
              iconAnchor: [21, 21],
              popupAnchor: [0, -22]
            });

            const greenPopupContent = 
              '<div class="p-3.5 font-sans text-slate-100 text-xs max-w-[360px]">' +
                '<div class="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-emerald-500/20">' +
                  '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">' +
                    '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 🟢 CLOSEST SAFE HAVEN' +
                  '</span>' +
                  '<span class="text-[10px] font-bold text-emerald-400 font-mono">' + closestGreenZone.distanceKm + ' km from ' + cityData.name + '</span>' +
                '</div>' +
                '<div class="text-sm font-bold text-white leading-tight mb-1">' + closestGreenZone.name + '</div>' +
                '<div class="text-[11px] text-zinc-400 mb-2">' +
                  'Route: <span class="text-white font-medium">' + closestGreenZone.transitRoute + '</span> • ' +
                  'Headroom: <b class="text-emerald-300">+' + closestGreenZone.availableCapacityHeadroom.toLocaleString() + ' Beds</b>' +
                '</div>' +
                '<div class="border-t border-emerald-500/20 pt-2 space-y-1.5">' +
                  '<div class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">' +
                    '<span>🏠 Available Safe Houses & Shelters</span>' +
                    '<span class="text-[9px] text-zinc-400 font-normal">Available / Total</span>' +
                  '</div>' +
                  '<div class="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scroll">' +
                    closestGreenZone.safeHouses.map(function(sh) {
                      return '<div class="bg-emerald-950/40 border border-emerald-500/25 rounded-xl p-2 text-[11px]">' +
                        '<div class="flex items-center justify-between font-bold text-white mb-0.5">' +
                          '<span class="truncate max-w-[210px]">' + sh.name + '</span>' +
                          '<span class="px-1.5 py-0.2 rounded bg-emerald-500/25 text-emerald-300 text-[10px] font-mono shrink-0">' + sh.availableBeds + ' / ' + sh.capacity + '</span>' +
                        '</div>' +
                        '<div class="text-[10px] text-zinc-300 leading-snug mt-1">' +
                          '<span class="text-emerald-400 font-semibold">Amenities:</span> ' + sh.amenities +
                        '</div>' +
                      '</div>';
                    }).join('') +
                  '</div>' +
                '</div>' +
                '<div class="border-t border-emerald-500/20 pt-2 mt-2 space-y-1">' +
                  '<div class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">' +
                    '<span>📞 Official Emergency Contacts</span>' +
                    '<span class="text-[9px] text-zinc-400">Click to Call</span>' +
                  '</div>' +
                  '<div class="grid grid-cols-2 gap-1.5 text-[10px] pt-0.5">' +
                    closestGreenZone.emergencyContacts.map(function(c) {
                      return '<a href="tel:' + c.tel + '" class="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 flex flex-col transition-all group cursor-pointer" title="Call ' + c.role + '">' +
                        '<span class="text-zinc-400 truncate text-[9px]">' + c.role + '</span>' +
                        '<span class="font-bold text-emerald-400 group-hover:text-emerald-300 font-mono text-[10px] flex items-center gap-1">' +
                          '<span>📞</span> ' + c.contact +
                        '</span>' +
                      '</a>';
                    }).join('') +
                  '</div>' +
                '</div>' +
              '</div>';

            const greenMarker = L.marker([closestGreenZone.lat, closestGreenZone.lng], { icon: greenIcon })
              .bindPopup(greenPopupContent, {
                className: 'city-intel-popup green-theme',
                autoClose: false,
                closeOnClick: false,
                maxWidth: 370
              })
              .addTo(cityIntelGroup);

            // 4. Render Multi-Path Evacuation Corridors connecting Red Zone to Safe Haven
            if (cityData.evacuationPaths && cityData.evacuationPaths.length > 0) {
              this.renderEvacuationPaths(cityData.evacuationPaths, 'all');
            } else {
              L.polyline([[closestRedZone.lat, closestRedZone.lng], [closestGreenZone.lat, closestGreenZone.lng]], {
                color: '#10b981',
                weight: 3.5,
                dashArray: '6, 6',
                opacity: 0.85
              }).addTo(cityIntelGroup);
            }

            // Distance Badges
            const redDistIcon = L.divIcon({
              className: 'corridor-badge-container',
              html: '<span class="corridor-dist-badge red-badge">🔴 ' + closestRedZone.distanceKm + ' km</span>',
              iconSize: [80, 20],
              iconAnchor: [40, 10]
            });
            L.marker([(lat + closestRedZone.lat) / 2, (lng + closestRedZone.lng) / 2], { icon: redDistIcon, interactive: false }).addTo(cityIntelGroup);

            const greenDistIcon = L.divIcon({
              className: 'corridor-badge-container',
              html: '<span class="corridor-dist-badge green-badge">🟢 ' + closestGreenZone.distanceKm + ' km</span>',
              iconSize: [80, 20],
              iconAnchor: [40, 10]
            });
            L.marker([(lat + closestGreenZone.lat) / 2, (lng + closestGreenZone.lng) / 2], { icon: greenDistIcon, interactive: false }).addTo(cityIntelGroup);

            // Both popups open simultaneously after flyTo completes
            if (options.autoOpenPopups) {
              const openBoth = function() {
                try {
                  if (redMarker && redMarker.openPopup) redMarker.openPopup();
                  if (greenMarker && greenMarker.openPopup) greenMarker.openPopup();
                } catch(e) {}
              };
              map.once('moveend', openBoth);
              setTimeout(openBoth, 1600);
            }

            window.__lastRedMarker = redMarker;
            window.__lastGreenMarker = greenMarker;
          },
          clearCityIntelligence: function() {
            cityIntelGroup.clearLayers();
          },
          zoomToCityRedZone: function(cityData) {
            if (!cityData || !cityData.closestRedZone) return;
            map.flyTo([cityData.closestRedZone.lat, cityData.closestRedZone.lng], 14, { duration: 1.2 });
            if (window.__lastRedMarker) window.__lastRedMarker.openPopup();
          },
          zoomToCityGreenZone: function(cityData) {
            if (!cityData || !cityData.closestGreenZone) return;
            map.flyTo([cityData.closestGreenZone.lat, cityData.closestGreenZone.lng], 14, { duration: 1.2 });
            if (window.__lastGreenMarker) window.__lastGreenMarker.openPopup();
          }
        };

        if (!window.app) {
          window.app = { mapController: window.standaloneMapController };
        } else if (!window.app.mapController || !window.app.mapController.map) {
          window.app.mapController = window.standaloneMapController;
        }

        // Invalidate map size to ensure rendering
        setTimeout(function() { map.invalidateSize(true); }, 100);
        setTimeout(function() { map.invalidateSize(true); }, 400);
        window.addEventListener('resize', function() { map.invalidateSize(true); });

        console.log("Universal Resilient Map Engine loaded successfully.");
      }

      // Start map initialization immediately
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResilientMap);
      } else {
        initResilientMap();
      }
      setTimeout(initResilientMap, 200);

      // Global control actions
      window.mapZoomIn = function() {
        if (window.app && window.app.mapController) window.app.mapController.zoomIn();
        else if (window.map) window.map.zoomIn();
      };
      window.mapZoomOut = function() {
        if (window.app && window.app.mapController) window.app.mapController.zoomOut();
        else if (window.map) window.map.zoomOut();
      };
      window.mapResetView = function() {
        if (window.app && window.app.mapController) window.app.mapController.resetView();
        else if (window.map) window.map.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
      };
      window.setMapBaseLayer = function(type) {
        if (window.app && window.app.mapController) window.app.mapController.setBaseLayer(type);
        document.querySelectorAll('.map-layer-btn').forEach(function(b) {
          if (b.getAttribute('data-layer') === type) b.classList.add('active');
          else b.classList.remove('active');
        });
      };

      window.selectCityFilter = selectCityFilter;
      window.selectEvacuationPath = selectEvacuationPath;
      window.renderDualCityDock = renderDualCityDock;
      window.clearCityFilter = clearCityFilter;
      window.closeDualCityDock = closeDualCityDock;
      window.zoomToCityRedZone = zoomToCityRedZone;
      window.zoomToCityGreenZone = zoomToCityGreenZone;

    })();
  