/**
 * RedZone Tracker - Mathematical Intelligence & Decision Algorithms
 * Formulated under AHP, IPCC Vulnerability Framework, and NDMA Guidelines.
 */

import { AHP_WEIGHTS, CARRYING_CAPACITY_WEIGHTS, RELOCATION_PRIORITY_WEIGHTS } from './data.js';

/**
 * 1. Analytical Hierarchy Process (AHP) Multi-Hazard Zonation
 * Evaluates geotechnical and environmental factors into a normalized hazard severity score [0, 1].
 */
export function calculateAHPScore(params) {
  const {
    slope = 0.5,
    rainfallIntensity = 0.5,
    elevationGeology = 0.5,
    seismicProximity = 0.5,
    soilLulc = 0.5
  } = params;

  const score = 
    (slope * AHP_WEIGHTS.slope) +
    (rainfallIntensity * AHP_WEIGHTS.rainfallIntensity) +
    (elevationGeology * AHP_WEIGHTS.elevationGeology) +
    (seismicProximity * AHP_WEIGHTS.seismicProximity) +
    (soilLulc * AHP_WEIGHTS.soilLulc);

  let classification = "GREEN_ZONE";
  let label = "Safe / Low Risk Haven";
  let color = "#10B981"; // Emerald green

  if (score >= 0.75) {
    classification = "RED_ZONE";
    label = "Critical Red Zone";
    color = "#EF4444"; // Red
  } else if (score >= 0.55) {
    classification = "ORANGE_ZONE";
    label = "High Hazard Risk";
    color = "#F97316"; // Orange
  } else if (score >= 0.35) {
    classification = "YELLOW_ZONE";
    label = "Moderate Hazard Risk";
    color = "#FBBF24"; // Amber/Yellow
  }

  return {
    score: Number(score.toFixed(3)),
    classification,
    label,
    color
  };
}

/**
 * 2. Carrying Capacity Index (CCI) - Composite Index Model
 * CCI = Sum(Wi * Xi)
 * Parameters: Water (25%), Land (20%), Infrastructure (20%), Eco-sensitivity (15%), Population Pressure (20%)
 */
export function calculateCCI(ccParams, currentPop, sustainableCeiling) {
  const cci = 
    (ccParams.water * CARRYING_CAPACITY_WEIGHTS.waterAvailability) +
    (ccParams.land * CARRYING_CAPACITY_WEIGHTS.habitableLand) +
    (ccParams.infra * CARRYING_CAPACITY_WEIGHTS.infrastructure) +
    (ccParams.eco * CARRYING_CAPACITY_WEIGHTS.ecologicalSensitivity) +
    (ccParams.popPressure * CARRYING_CAPACITY_WEIGHTS.populationPressure);

  const overflowPopulation = Math.max(0, currentPop - sustainableCeiling);
  const overloadPercentage = sustainableCeiling > 0 
    ? Number(((overflowPopulation / sustainableCeiling) * 100).toFixed(1)) 
    : 0;

  let status = "Sustainable";
  let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  if (cci < 0.30) {
    status = "Critical Deficit (Severe Overload)";
    badgeColor = "bg-red-500/20 text-red-300 border-red-500/30";
  } else if (cci < 0.50) {
    status = "High Stress";
    badgeColor = "bg-orange-500/20 text-orange-300 border-orange-500/30";
  } else if (cci < 0.70) {
    status = "Moderate Strain";
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  }

  return {
    cci: Number(cci.toFixed(3)),
    overloadPercentage,
    overflowPopulation,
    status,
    badgeColor
  };
}

/**
 * 3. IPCC Vulnerability Framework
 * V = (Exposure * Sensitivity) / Adaptive Capacity
 */
export function calculateVulnerability(habitation) {
  // Exposure: Hazard Score
  const exposure = habitation.hazardScore;

  // Sensitivity: Kutcha houses (40%) + BPL ratio (35%) + Age dependency (25%)
  const sensitivity = 
    ((habitation.kutchaHousesPct / 100) * 0.40) +
    ((habitation.bplPopulationPct / 100) * 0.35) +
    ((habitation.ageDependencyPct / 100) * 0.25);

  // Adaptive Capacity: Distance to hospital (decay) + Distance to shelter (decay) + Basic infrastructure
  const hospitalScore = Math.max(0.1, 1 - (habitation.distanceToHospitalKm / 30));
  const shelterScore = Math.max(0.1, 1 - (habitation.distanceToShelterKm / 20));
  const infraScore = habitation.carryingCapacity.infra;
  
  const adaptiveCapacity = Math.max(0.15, (hospitalScore * 0.40) + (shelterScore * 0.35) + (infraScore * 0.25));

  // Vulnerability Score normalized to [0, 1]
  const rawV = (exposure * sensitivity) / adaptiveCapacity;
  const normalizedV = Number(Math.min(1.0, Math.max(0.05, rawV * 0.5)).toFixed(3));

  return {
    vulnerabilityScore: normalizedV,
    exposure: Number(exposure.toFixed(2)),
    sensitivity: Number(sensitivity.toFixed(2)),
    adaptiveCapacity: Number(adaptiveCapacity.toFixed(2))
  };
}

/**
 * 4. Multi-Criteria Decision Analysis (MCDA) Relocation Priority Engine
 * Priority = (0.30 * Hazard) + (0.25 * CC_Overflow) + (0.25 * Vulnerability) + (0.20 * PopAtRisk)
 */
export function calculateRelocationPriority(habitation, maxPop = 10000) {
  const hazard = habitation.hazardScore;
  const cc = calculateCCI(habitation.carryingCapacity, habitation.population, habitation.carryingCapacity.sustainableCeiling);
  const vuln = calculateVulnerability(habitation);
  
  // Normalized CC Overflow: 0 to 1
  const ccOverflowNorm = Math.min(1.0, cc.overflowPopulation / Math.max(1, habitation.population));
  
  // Normalized Population at risk
  const popNorm = Math.min(1.0, habitation.population / maxPop);

  const priorityScore = 
    (hazard * RELOCATION_PRIORITY_WEIGHTS.hazardSeverity) +
    (ccOverflowNorm * RELOCATION_PRIORITY_WEIGHTS.ccOverflow) +
    (vuln.vulnerabilityScore * RELOCATION_PRIORITY_WEIGHTS.vulnerabilityIndex) +
    (popNorm * RELOCATION_PRIORITY_WEIGHTS.populationAtRisk);

  const finalScore = Number(priorityScore.toFixed(3));

  let urgencyTier = "TIER 4: In-situ Mitigation";
  let urgencyClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  let recommendedAction = "Strengthen drainage, structural retrofitting, periodic telemetry monitoring.";

  if (finalScore >= 0.75) {
    urgencyTier = "TIER 1: Immediate Emergency Relocation";
    urgencyClass = "text-red-400 bg-red-500/10 border-red-500/30 animate-pulse";
    recommendedAction = "Immediate evacuation order. Deploy NDRF/SDRF transport. Activate Resettlement Action Plan.";
  } else if (finalScore >= 0.60) {
    urgencyTier = "TIER 2: High Priority Relocation";
    urgencyClass = "text-orange-400 bg-orange-500/10 border-orange-500/20";
    recommendedAction = "Pre-monsoon rehabilitation mandatory. Allot PMAY-G safe plots within 60 days.";
  } else if (finalScore >= 0.45) {
    urgencyTier = "TIER 3: Phased Transition";
    urgencyClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    recommendedAction = "Scheduled phased resettlement with compensation disbursement.";
  }

  return {
    priorityScore: finalScore,
    urgencyTier,
    urgencyClass,
    recommendedAction,
    cc,
    vuln
  };
}

/**
 * 5. Safe Relocation Site Matching (Weighted Haversine & Capacity Distance)
 * Matches affected habitation to the optimal Green Zone Haven.
 */
export function findBestSafeHaven(habitation, safeHavens) {
  let bestMatch = null;
  let highestSuitability = -Infinity;

  safeHavens.forEach(haven => {
    // Haversine Distance in Kilometers
    const distKm = calculateHaversineDistance(
      habitation.lat, habitation.lng,
      haven.lat, haven.lng
    );

    // Factors:
    // Distance proximity: closer is better (decay over 100km)
    const distFactor = Math.max(0, 1 - (distKm / 100));
    // Capacity headroom: ability to absorb population
    const headroomFactor = Math.min(1.0, haven.availableCapacityHeadroom / habitation.population);
    // Infrastructure rating
    const infraFactor = haven.infrastructureRating;

    // Suitability Formula
    const suitability = (distFactor * 0.40) + (headroomFactor * 0.35) + (infraFactor * 0.25);

    if (suitability > highestSuitability) {
      highestSuitability = suitability;
      bestMatch = {
        haven,
        distanceKm: Number(distKm.toFixed(1)),
        suitabilityScore: Number(suitability.toFixed(2)),
        headroomAvailable: haven.availableCapacityHeadroom >= habitation.population
      };
    }
  });

  return bestMatch;
}

/**
 * 6. Haversine Distance Formula (Great-Circle Distance)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 7. Relocation Budget Estimator (Under PMAY-G & NDRF Resettlement Norms)
 */
export function estimateRelocationBudget(habitation) {
  const families = habitation.households;
  
  // Official relief & rehabilitation guidelines
  const pmayHousingGrantPerFamily = 150000; // ₹1.50 Lakh
  const sdrfRelocationGrantPerFamily = 50000; // ₹50,000 immediate shifting & allowance
  const infrastructureCivicGrantPerFamily = 60000; // ₹60,000 water/roads/civic facilities
  
  const totalPerFamily = pmayHousingGrantPerFamily + sdrfRelocationGrantPerFamily + infrastructureCivicGrantPerFamily;
  const totalCostRupees = families * totalPerFamily;
  const totalInCrores = (totalCostRupees / 10000000).toFixed(2);
  const totalInLakhs = (totalCostRupees / 100000).toFixed(1);

  return {
    families,
    housingGrantCr: ((families * pmayHousingGrantPerFamily) / 10000000).toFixed(2),
    shiftingGrantCr: ((families * sdrfRelocationGrantPerFamily) / 10000000).toFixed(2),
    infraGrantCr: ((families * infrastructureCivicGrantPerFamily) / 10000000).toFixed(2),
    totalCostRupees,
    formattedTotal: `₹${totalInCrores} Cr (${totalInLakhs} Lakhs)`
  };
}
