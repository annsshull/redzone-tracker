/**
 * RedZone Tracker - Core Datasets & Geospatial Definitions
 * Scientific data aligned with NDMA, Bhuvan (ISRO), Census of India, and GSI benchmarks.
 */

export const AHP_WEIGHTS = {
  slope: 0.28,
  rainfallIntensity: 0.24,
  elevationGeology: 0.20,
  seismicProximity: 0.16,
  soilLulc: 0.12
};

export const CARRYING_CAPACITY_WEIGHTS = {
  waterAvailability: 0.25,
  habitableLand: 0.20,
  infrastructure: 0.20,
  ecologicalSensitivity: 0.15,
  populationPressure: 0.20
};

export const RELOCATION_PRIORITY_WEIGHTS = {
  hazardSeverity: 0.30,
  ccOverflow: 0.25,
  vulnerabilityIndex: 0.25,
  populationAtRisk: 0.20
};

// Target Vulnerable Habitations across High-Risk Indian Districts
export const HABITATIONS_DATA = [
  {
    id: "HAB-UK-01",
    name: "Sunil Ward (Joshimath)",
    district: "Chamoli",
    state: "Uttarakhand",
    lat: 30.5574,
    lng: 79.5658,
    hazardType: "Landslide & Subsidence",
    hazardScore: 0.94,
    primaryHazard: "Land Subsidence / Seismic Zone V",
    elevation: "1890m",
    slopeAngle: "38°",
    population: 3420,
    households: 680,
    kutchaHousesPct: 62,
    bplPopulationPct: 48,
    ageDependencyPct: 34,
    distanceToHospitalKm: 14.5,
    distanceToShelterKm: 12.0,
    carryingCapacity: {
      water: 0.22,
      land: 0.18,
      infra: 0.25,
      eco: 0.15,
      popPressure: 0.18,
      sustainableCeiling: 1200
    },
    historicalDisasters: ["2023 Rapid Subsidence Crisis", "2021 Rishiganga Glacial Flash Flood", "1999 Chamoli Earthquake"],
    status: "RED_ZONE"
  },
  {
    id: "HAB-KL-02",
    name: "Chooralmala (Meppadi)",
    district: "Wayanad",
    state: "Kerala",
    lat: 11.5284,
    lng: 76.1685,
    hazardType: "Debris Flow & Landslide",
    hazardScore: 0.92,
    primaryHazard: "Heavy Monsoon Cloudburst & Slope Failure",
    elevation: "980m",
    slopeAngle: "42°",
    population: 4150,
    households: 890,
    kutchaHousesPct: 58,
    bplPopulationPct: 52,
    ageDependencyPct: 31,
    distanceToHospitalKm: 18.2,
    distanceToShelterKm: 9.5,
    carryingCapacity: {
      water: 0.35,
      land: 0.15,
      infra: 0.20,
      eco: 0.10,
      popPressure: 0.22,
      sustainableCeiling: 1400
    },
    historicalDisasters: ["2024 Catastrophic Landslide Surge", "2019 Puthumala Debris Flow"],
    status: "RED_ZONE"
  },
  {
    id: "HAB-AS-03",
    name: "Salmora Riverbank Village",
    district: "Majuli",
    state: "Assam",
    lat: 26.9534,
    lng: 94.2045,
    hazardType: "Riverbank Erosion & Flooding",
    hazardScore: 0.89,
    primaryHazard: "Brahmaputra Severe Inundation",
    elevation: "84m",
    slopeAngle: "2°",
    population: 5800,
    households: 1120,
    kutchaHousesPct: 78,
    bplPopulationPct: 64,
    ageDependencyPct: 37,
    distanceToHospitalKm: 22.0,
    distanceToShelterKm: 16.5,
    carryingCapacity: {
      water: 0.40,
      land: 0.12,
      infra: 0.18,
      eco: 0.20,
      popPressure: 0.15,
      sustainableCeiling: 1800
    },
    historicalDisasters: ["2022 Brahmaputra Super Flood", "2020 Island Embankment Collapse"],
    status: "RED_ZONE"
  },
  {
    id: "HAB-OD-04",
    name: "Satabhaya Coastal Cluster",
    district: "Kendrapara",
    state: "Odisha",
    lat: 20.6288,
    lng: 86.9281,
    hazardType: "Cyclone Storm Surge & Inundation",
    hazardScore: 0.87,
    primaryHazard: "Bay of Bengal Cyclone & Shoreline Inundation",
    elevation: "4m",
    slopeAngle: "1°",
    population: 3200,
    households: 610,
    kutchaHousesPct: 71,
    bplPopulationPct: 59,
    ageDependencyPct: 35,
    distanceToHospitalKm: 19.5,
    distanceToShelterKm: 8.2,
    carryingCapacity: {
      water: 0.28,
      land: 0.14,
      infra: 0.22,
      eco: 0.25,
      popPressure: 0.20,
      sustainableCeiling: 1100
    },
    historicalDisasters: ["2021 Cyclone Yaas Surge", "2019 Cyclone Fani", "1999 Super Cyclone"],
    status: "RED_ZONE"
  },
  {
    id: "HAB-HP-05",
    name: "Dharampur River Settlement",
    district: "Mandi",
    state: "Himachal Pradesh",
    lat: 31.7892,
    lng: 76.9324,
    hazardType: "Cloudburst & Flash Flood",
    hazardScore: 0.78,
    primaryHazard: "Son River Torrential Flash Floods",
    elevation: "1120m",
    slopeAngle: "34°",
    population: 2600,
    households: 510,
    kutchaHousesPct: 44,
    bplPopulationPct: 39,
    ageDependencyPct: 29,
    distanceToHospitalKm: 8.5,
    distanceToShelterKm: 6.0,
    carryingCapacity: {
      water: 0.38,
      land: 0.32,
      infra: 0.35,
      eco: 0.28,
      popPressure: 0.30,
      sustainableCeiling: 1600
    },
    historicalDisasters: ["2023 Monsoon River Inundation", "2015 Cloudburst Disaster"],
    status: "ORANGE_ZONE"
  },
  {
    id: "HAB-BR-06",
    name: "Kusaha Embankment Zone",
    district: "Supaul (Kosi Basin)",
    state: "Bihar",
    lat: 26.2415,
    lng: 86.8742,
    hazardType: "Embankment Breach Flood",
    hazardScore: 0.74,
    primaryHazard: "Kosi River Sudden Discharge Overflow",
    elevation: "55m",
    slopeAngle: "1°",
    population: 6200,
    households: 1240,
    kutchaHousesPct: 74,
    bplPopulationPct: 68,
    ageDependencyPct: 39,
    distanceToHospitalKm: 16.0,
    distanceToShelterKm: 11.5,
    carryingCapacity: {
      water: 0.45,
      land: 0.30,
      infra: 0.28,
      eco: 0.32,
      popPressure: 0.24,
      sustainableCeiling: 3100
    },
    historicalDisasters: ["2008 Kosi Mega Disaster", "2019 North Bihar Flood"],
    status: "ORANGE_ZONE"
  },
  {
    id: "HAB-OD-07",
    name: "Muniguda Tribal Enclave",
    district: "Rayagada",
    state: "Odisha",
    lat: 19.6241,
    lng: 83.4891,
    hazardType: "Flash Flood & Slope Runoff",
    hazardScore: 0.65,
    primaryHazard: "Vamsadhara River Basin Runoff",
    elevation: "320m",
    slopeAngle: "18°",
    population: 2900,
    households: 560,
    kutchaHousesPct: 82,
    bplPopulationPct: 76,
    ageDependencyPct: 36,
    distanceToHospitalKm: 24.5,
    distanceToShelterKm: 14.0,
    carryingCapacity: {
      water: 0.42,
      land: 0.40,
      infra: 0.31,
      eco: 0.38,
      popPressure: 0.35,
      sustainableCeiling: 2200
    },
    historicalDisasters: ["2018 Cyclone Titli Flash Inundation"],
    status: "YELLOW_ZONE"
  },
  {
    id: "HAB-UK-08",
    name: "Pipalkoti Plateau Sector",
    district: "Chamoli",
    state: "Uttarakhand",
    lat: 30.4312,
    lng: 79.4315,
    hazardType: "Low Hazard / Stable Bedrock",
    hazardScore: 0.28,
    primaryHazard: "Moderate Geotechnical Stress",
    elevation: "1340m",
    slopeAngle: "12°",
    population: 2100,
    households: 410,
    kutchaHousesPct: 22,
    bplPopulationPct: 24,
    ageDependencyPct: 22,
    distanceToHospitalKm: 3.5,
    distanceToShelterKm: 1.5,
    carryingCapacity: {
      water: 0.82,
      land: 0.88,
      infra: 0.80,
      eco: 0.75,
      popPressure: 0.85,
      sustainableCeiling: 7500
    },
    historicalDisasters: ["Minor Slope Creep"],
    status: "GREEN_ZONE"
  }
];

// Resettlement Destinations (Candidate Safe Green Havens)
export const SAFE_HAVEN_DESTINATIONS = [
  {
    id: "SAFE-UK-01",
    name: "Pipalkoti Resilient Township",
    district: "Chamoli",
    state: "Uttarakhand",
    lat: 30.4350,
    lng: 79.4380,
    elevation: "1350m",
    slopeAngle: "11°",
    geology: "Solid Gneiss Bedrock (Low Liquefaction)",
    carryingCapacityScore: 0.84,
    availableCapacityHeadroom: 4200,
    infrastructureRating: 0.88,
    amenities: ["PHC Hospital", "Paved NH Connectivity", "24/7 Piped Water", "Govt School", "Helipad"],
    targetRedZoneMatch: "HAB-UK-01"
  },
  {
    id: "SAFE-KL-02",
    name: "Nedumbala Uplands",
    district: "Wayanad",
    state: "Kerala",
    lat: 11.5540,
    lng: 76.2210,
    elevation: "780m",
    slopeAngle: "8°",
    geology: "Laterite Bedrock / Non-Debris Fan",
    carryingCapacityScore: 0.86,
    availableCapacityHeadroom: 5100,
    infrastructureRating: 0.90,
    amenities: ["Taluk Hospital Proximity", "Disaster Resilience Center", "Power Substation", "Community Hall"],
    targetRedZoneMatch: "HAB-KL-02"
  },
  {
    id: "SAFE-AS-03",
    name: "Garamur Elevated Resettlement Sector",
    district: "Majuli",
    state: "Assam",
    lat: 27.0120,
    lng: 94.2480,
    elevation: "92m",
    slopeAngle: "1°",
    geology: "High-Embankment Engineered Silt-Clay",
    carryingCapacityScore: 0.79,
    availableCapacityHeadroom: 6500,
    infrastructureRating: 0.82,
    amenities: ["Multipurpose Cyclone/Flood Shelter", "Sub-Divisional Hospital", "State Highway Link"],
    targetRedZoneMatch: "HAB-AS-03"
  },
  {
    id: "SAFE-OD-04",
    name: "Bagapatia Resettlement Colony",
    district: "Kendrapara",
    state: "Odisha",
    lat: 20.6540,
    lng: 86.8120,
    elevation: "9m",
    slopeAngle: "1°",
    geology: "Inland Stable Deltaic Sandy Clay",
    carryingCapacityScore: 0.83,
    availableCapacityHeadroom: 4800,
    infrastructureRating: 0.85,
    amenities: ["Odisha Disaster Rapid Action Force (ODRAF) Depot", "Pucca Concrete Colony", "Borewell Grid"],
    targetRedZoneMatch: "HAB-OD-04"
  }
];

// Hazard Multi-Polygons for Dynamic Visual Overlays
export const HAZARD_ZONES_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "ZONE-JOSHIMATH",
      properties: {
        name: "Joshimath Critical Subsidence Sector",
        district: "Chamoli",
        state: "Uttarakhand",
        zoneType: "RED_ZONE",
        hazardType: "Slope Subsidence & Seismic Zone V",
        riskScore: 0.94,
        cci: 0.19,
        habitationsCount: 9,
        vulnerablePop: 18500
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [79.540, 30.540],
          [79.585, 30.545],
          [79.590, 30.575],
          [79.555, 30.585],
          [79.535, 30.560],
          [79.540, 30.540]
        ]]
      }
    },
    {
      type: "Feature",
      id: "ZONE-WAYANAD",
      properties: {
        name: "Meppadi Debris Flow Corridor",
        district: "Wayanad",
        state: "Kerala",
        zoneType: "RED_ZONE",
        hazardType: "Slope Failure & Heavy Cloudburst Runoff",
        riskScore: 0.92,
        cci: 0.22,
        habitationsCount: 7,
        vulnerablePop: 14200
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [76.130, 11.510],
          [76.195, 11.515],
          [76.210, 11.555],
          [76.160, 11.560],
          [76.125, 11.530],
          [76.130, 11.510]
        ]]
      }
    },
    {
      type: "Feature",
      id: "ZONE-MAJULI",
      properties: {
        name: "Brahmaputra Salmora Active Inundation Belt",
        district: "Majuli",
        state: "Assam",
        zoneType: "RED_ZONE",
        hazardType: "Riverbank Erosion & Flash Flooding",
        riskScore: 0.89,
        cci: 0.21,
        habitationsCount: 14,
        vulnerablePop: 32000
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [94.160, 26.920],
          [94.260, 26.935],
          [94.275, 26.985],
          [94.180, 26.990],
          [94.140, 26.950],
          [94.160, 26.920]
        ]]
      }
    },
    {
      type: "Feature",
      id: "ZONE-KENDRAPARA",
      properties: {
        name: "Satabhaya Marine Inundation Front",
        district: "Kendrapara",
        state: "Odisha",
        zoneType: "RED_ZONE",
        hazardType: "Cyclone Storm Surge & Extreme Erosion",
        riskScore: 0.87,
        cci: 0.23,
        habitationsCount: 8,
        vulnerablePop: 16800
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [86.880, 20.590],
          [86.975, 20.610],
          [86.960, 20.670],
          [86.890, 20.665],
          [86.865, 20.620],
          [86.880, 20.590]
        ]]
      }
    },
    {
      type: "Feature",
      id: "ZONE-MANDI",
      properties: {
        name: "Dharampur Torrential Gorge",
        district: "Mandi",
        state: "Himachal Pradesh",
        zoneType: "ORANGE_ZONE",
        hazardType: "Cloudburst Flash Flood",
        riskScore: 0.78,
        cci: 0.37,
        habitationsCount: 6,
        vulnerablePop: 11500
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [76.880, 31.750],
          [76.970, 31.765],
          [76.985, 31.820],
          [76.910, 31.815],
          [76.870, 31.775],
          [76.880, 31.750]
        ]]
      }
    },
    {
      type: "Feature",
      id: "ZONE-SAFE-PIPALKOTI",
      properties: {
        name: "Pipalkoti Geotechnical Safe Haven",
        district: "Chamoli",
        state: "Uttarakhand",
        zoneType: "GREEN_ZONE",
        hazardType: "Bedrock Low Hazard Haven",
        riskScore: 0.24,
        cci: 0.84,
        habitationsCount: 4,
        vulnerablePop: 0
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [79.410, 30.410],
          [79.460, 30.420],
          [79.465, 30.455],
          [79.420, 30.460],
          [79.400, 30.430],
          [79.410, 30.410]
        ]]
      }
    }
  ]
};

// Historical Disaster Case Studies
export const HISTORICAL_DISASTERS = [
  {
    year: "July 2024",
    title: "Wayanad Debris Avalanche",
    region: "Wayanad, Kerala",
    description: "Cloudburst-triggered multiple massive debris flows at Chooralmala and Mundakkai, resulting in over 400 casualties. Highlighted the catastrophic collapse of steep-slope carrying capacity during extreme rainfall.",
    tags: ["Landslide", "Slope Failure", "Monsoon Surge"],
    lat: 11.5284,
    lng: 76.1685
  },
  {
    year: "January 2023",
    title: "Joshimath Land Subsidence Crisis",
    region: "Chamoli, Uttarakhand",
    description: "Hundreds of residential and commercial structures developed severe structural cracks due to overloaded slopes, lack of sewage disposal, and seismic activity in Zone V, forcing immediate evacuation of Sunil and Manohar Bagh wards.",
    tags: ["Subsidence", "Carrying Capacity", "Seismic Zone V"],
    lat: 30.5574,
    lng: 79.5658
  },
  {
    year: "June 2022",
    title: "Assam & Majuli Super Inundation",
    region: "Brahmaputra Valley, Assam",
    description: "Repeated embankment collapses and severe soil liquefaction submerged 32 districts, stranding over 5 million people and eroding entire riverine habitations in Majuli island.",
    tags: ["Flood", "Riverbank Erosion", "Vulnerability"],
    lat: 26.9534,
    lng: 94.2045
  },
  {
    year: "May 2021",
    title: "Cyclone Yaas Storm Surge",
    region: "Kendrapara & Jagatsinghpur, Odisha",
    description: "A 4.5-meter storm surge breached coastal embankments at Satabhaya and Rajnagar, salinizing thousands of hectares of arable land and isolating coastal hamlets.",
    tags: ["Cyclone", "Storm Surge", "Sea Level Rise"],
    lat: 20.6288,
    lng: 86.9281
  },
  {
    year: "February 2021",
    title: "Chamoli Glacial Lake Outburst / Flash Flood",
    region: "Rishiganga Valley, Uttarakhand",
    description: "Rock and ice avalanche from Ronti Peak triggered a devastating flash flood down the Rishiganga and Dhauliganga rivers, destroying the Tapovan Vishnugad Hydel Project.",
    tags: ["GLOF", "Flash Flood", "High Altitude"],
    lat: 30.4850,
    lng: 79.7120
  }
];
