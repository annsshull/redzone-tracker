/**
 * RedZone Tracker - Simulation & What-If Climate Shock Engine
 * Simulates extreme hazard escalation, carrying capacity collapse, and relocation surges.
 */

import { HABITATIONS_DATA } from './data.js';
import { calculateRelocationPriority, calculateAHPScore, calculateCCI, estimateRelocationBudget } from './algorithms.js';

export class SimulationEngine {
  constructor() {
    this.baseHabitations = JSON.parse(JSON.stringify(HABITATIONS_DATA));
    this.currentSimulation = {
      cycloneCategory: 0, // 0 to 5
      rainfallSurgePct: 0, // -20% to +100%
      ccDepletionPct: 0, // 0 to 50%
      seismicShockActive: false,
      scenarioName: "Baseline State"
    };
    this.listeners = [];
  }

  onSimulationChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    const results = this.runSimulation();
    this.listeners.forEach(cb => {
      try {
        cb(results, this.currentSimulation);
      } catch (err) {
        console.error("Simulation listener error:", err);
      }
    });
  }

  setScenario(presetKey) {
    if (presetKey === "CYCLONE_CAT5") {
      this.currentSimulation = {
        cycloneCategory: 5,
        rainfallSurgePct: 65,
        ccDepletionPct: 35,
        seismicShockActive: false,
        scenarioName: "Category 5 Super Cyclone + 4.5m Storm Surge"
      };
    } else if (presetKey === "HIMALAYAN_CLOUDBURST") {
      this.currentSimulation = {
        cycloneCategory: 0,
        rainfallSurgePct: 80,
        ccDepletionPct: 40,
        seismicShockActive: false,
        scenarioName: "Himalayan Cloudburst (+80% Monsoon Flash Flood)"
      };
    } else if (presetKey === "SEISMIC_ZONE_V") {
      this.currentSimulation = {
        cycloneCategory: 0,
        rainfallSurgePct: 15,
        ccDepletionPct: 45,
        seismicShockActive: true,
        scenarioName: "M7.2 Great Himalayan Seismic Rupture (Zone V)"
      };
    } else if (presetKey === "CAPACITY_COLLAPSE") {
      this.currentSimulation = {
        cycloneCategory: 0,
        rainfallSurgePct: 20,
        ccDepletionPct: 50,
        seismicShockActive: false,
        scenarioName: "Critical Aquifer Exhaustion & Land Sinking (-50% CC)"
      };
    } else {
      // Reset
      this.currentSimulation = {
        cycloneCategory: 0,
        rainfallSurgePct: 0,
        ccDepletionPct: 0,
        seismicShockActive: false,
        scenarioName: "Baseline State (Normal Telemetry)"
      };
    }
    this.notify();
  }

  updateCustomParams(params) {
    this.currentSimulation = {
      ...this.currentSimulation,
      ...params,
      scenarioName: "Custom User Stress Test"
    };
    this.notify();
  }

  runSimulation() {
    const simHabitations = this.baseHabitations.map(hab => {
      const simulatedHab = JSON.parse(JSON.stringify(hab));
      let hazardMultiplier = 1.0;

      // 1. Rainfall surge impact (especially steep slopes and low elevation river basins)
      if (this.currentSimulation.rainfallSurgePct !== 0) {
        const surgeFactor = this.currentSimulation.rainfallSurgePct / 100;
        hazardMultiplier += surgeFactor * 0.35;
      }

      // 2. Cyclone surge (hits coastal habitations like Kendrapara heavily)
      if (this.currentSimulation.cycloneCategory > 0) {
        const cat = this.currentSimulation.cycloneCategory;
        if (simulatedHab.hazardType.toLowerCase().includes("cyclone") || simulatedHab.lat < 22 && simulatedHab.lng > 85) {
          hazardMultiplier += (cat * 0.12);
        }
      }

      // 3. Seismic shock (hits Joshimath, Mandi, Himalayan zones heavily)
      if (this.currentSimulation.seismicShockActive) {
        if (simulatedHab.state === "Uttarakhand" || simulatedHab.state === "Himachal Pradesh" || simulatedHab.primaryHazard.includes("Seismic")) {
          hazardMultiplier += 0.40;
        }
      }

      // Compute new simulated hazard score (capped at 1.0)
      simulatedHab.hazardScore = Math.min(1.0, Number((simulatedHab.hazardScore * hazardMultiplier).toFixed(3)));

      // 4. Carrying Capacity depletion shock
      if (this.currentSimulation.ccDepletionPct > 0) {
        const drop = this.currentSimulation.ccDepletionPct / 100;
        simulatedHab.carryingCapacity.water = Math.max(0.05, Number((simulatedHab.carryingCapacity.water * (1 - drop)).toFixed(2)));
        simulatedHab.carryingCapacity.land = Math.max(0.05, Number((simulatedHab.carryingCapacity.land * (1 - drop)).toFixed(2)));
        simulatedHab.carryingCapacity.sustainableCeiling = Math.round(simulatedHab.carryingCapacity.sustainableCeiling * (1 - (drop * 0.7)));
      }

      // Re-evaluate zone status
      if (simulatedHab.hazardScore >= 0.75) {
        simulatedHab.status = "RED_ZONE";
      } else if (simulatedHab.hazardScore >= 0.55) {
        simulatedHab.status = "ORANGE_ZONE";
      } else if (simulatedHab.hazardScore >= 0.35) {
        simulatedHab.status = "YELLOW_ZONE";
      } else {
        simulatedHab.status = "GREEN_ZONE";
      }

      // Recalculate relocation priority
      const priorityData = calculateRelocationPriority(simulatedHab);
      const budgetData = estimateRelocationBudget(simulatedHab);

      return {
        ...simulatedHab,
        priorityData,
        budgetData
      };
    });

    // Calculate aggregate metrics
    const redZoneCount = simHabitations.filter(h => h.status === "RED_ZONE").length;
    const baseRedZoneCount = this.baseHabitations.filter(h => h.status === "RED_ZONE").length;
    const newRedZonesFlipped = Math.max(0, redZoneCount - baseRedZoneCount);

    const totalVulnerablePop = simHabitations
      .filter(h => h.status === "RED_ZONE" || h.status === "ORANGE_ZONE")
      .reduce((acc, h) => acc + h.population, 0);

    const immediateEvacHabitations = simHabitations.filter(h => h.priorityData.priorityScore >= 0.75);
    const totalImmediateEvacPop = immediateEvacHabitations.reduce((acc, h) => acc + h.population, 0);

    const totalBudgetRequiredCr = simHabitations
      .filter(h => h.priorityData.priorityScore >= 0.60)
      .reduce((acc, h) => acc + parseFloat(h.budgetData.formattedTotal.replace(/[^0-9.]/g, '')), 0)
      .toFixed(2);

    return {
      habitations: simHabitations,
      metrics: {
        redZoneCount,
        newRedZonesFlipped,
        totalVulnerablePop,
        immediateEvacCount: immediateEvacHabitations.length,
        totalImmediateEvacPop,
        totalBudgetRequiredCr
      },
      scenario: this.currentSimulation
    };
  }
}

export const simulationEngine = new SimulationEngine();
