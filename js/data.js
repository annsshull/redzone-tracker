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
  {
    id: "HAB-BR-08",
    name: "Danapur & Digha Diara Island Habitations",
    district: "Patna",
    state: "Bihar",
    lat: 25.6420,
    lng: 85.0920,
    hazardType: "Severe Ganga River Inundation",
    hazardScore: 0.95,
    primaryHazard: "Ganga Extreme Flood Level (50.44m / +1.84m Above Danger Level)",
    elevation: "49m",
    slopeAngle: "0.5°",
    population: 38500,
    households: 7200,
    kutchaHousesPct: 82,
    bplPopulationPct: 71,
    ageDependencyPct: 36,
    distanceToHospitalKm: 8.5,
    distanceToShelterKm: 18.5,
    carryingCapacity: {
      water: 0.18,
      land: 0.12,
      infra: 0.15,
      eco: 0.10,
      popPressure: 0.14,
      sustainableCeiling: 6500
    },
    historicalDisasters: ["2026 Confluent Ganga-Kosi Flood Surge", "2024 Late-Sept Barrage Release Crisis", "2019 Patna Urban Inundation", "2016 Ganga Spate", "1975 Historic Patna Inundation"],
    status: "RED_ZONE"
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
    id: "SAFE-BR-06",
    name: "AIIMS Patna & Bihta High-Ground Logistics Base",
    district: "Patna",
    state: "Bihar",
    lat: 25.5640,
    lng: 84.8620,
    elevation: "62m",
    slopeAngle: "1°",
    geology: "High Alluvial Terrace (Zero Historical Inundation)",
    carryingCapacityScore: 0.89,
    availableCapacityHeadroom: 14500,
    infrastructureRating: 0.94,
    amenities: ["AIIMS Super-Specialty Medical Trauma Wing", "SDRF 9th Battalion Regional Headquarters", "24/7 Silent Generator Microgrid", "Central Food Grain Depots", "Helipad"],
    targetRedZoneMatch: "HAB-BR-08"
  },

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
      id: "ZONE-PATNA",
      properties: {
        name: "Patna Ganga Diara & Confluence Inundation Belt",
        district: "Patna / Saran / Vaishali",
        state: "Bihar",
        zoneType: "RED_ZONE",
        hazardType: "Active Fluvial Inundation & Embankment Overtopping",
        riskScore: 0.95,
        cci: 0.16,
        habitationsCount: 14,
        vulnerablePop: 78500
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [84.980, 25.660],
          [85.080, 25.680],
          [85.180, 25.660],
          [85.240, 25.620],
          [85.190, 25.590],
          [85.090, 25.600],
          [85.000, 25.630],
          [84.980, 25.660]
        ]]
      }
    },

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
    year: "September 2026 (Live)",
    title: "Ganga-Kosi Severe Inundation Surge",
    region: "Patna & North Bihar Basin, Bihar",
    description: "Confluent high discharges from Nepal catchments and Ganga-Sone spate pushed water levels at Patna Gandhi Ghat to 50.44m (+1.84m over danger mark), inundating over 1.4 million residents across 16 districts.",
    tags: ["Fluvial Inundation", "Embankment Surge", "Active Crisis"],
    lat: 25.6139,
    lng: 85.1376
  },

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


// =========================================================================
// CITY INTELLIGENCE DATA (STUDY CITIES, CLOSEST RED/GREEN ZONES, HAZARDS & CONTACTS)
// =========================================================================
export const CITY_INTELLIGENCE_DATA = [
  {
    id: "CITY-PATNA",
    name: "Patna (Bihar - Ganga Flood Basin)",
    district: "Patna",
    state: "Bihar",
    lat: 25.6139,
    lng: 85.1376,
    elevation: "53m",
    hazardContext: "Active confluence of Ganga, Sone, Punpun, and Gandak river systems. Heavy monsoon discharges from upstream barrages causing acute riverbank overtopping, with Gandhi Ghat recording 50.44m (+1.84m above danger level as of 20 September 2026).",
    closestRedZone: {
      id: "HAB-BR-08",
      name: "Danapur & Digha Diara Flood Red Zone",
      distanceKm: 1.8,
      bearing: "North-West",
      lat: 25.6385,
      lng: 85.0880,
      hazardType: "Extreme Fluvial Inundation & Embankment Overtopping",
      hazardScore: 0.95,
      slope: "<1° Flat Alluvial Floodplain",
      elevation: "49m",
      populationAtRisk: 38500,
      pastHazards: [
        {
          date: "20 September 2026 (Active)",
          event: "Ganga & Kosi Confluent Extreme Flood Surge",
          affected: "Ganga flowing at 50.44m (+1.84m above danger level at Gandhi Ghat); 1.4M people affected across 16 districts; 12 NDRF/SDRF rescue columns deployed"
        },
        {
          date: "Late September 2024",
          event: "Birpur Barrage Record Discharge Crisis",
          affected: "6.61 lakh cusecs released from Kosi; 29 districts affected; 1.2M+ displaced across North Bihar"
        },
        {
          date: "October 2019",
          event: "Patna Catastrophic Urban Inundation",
          affected: "320mm rainfall in 72 hours; Rajendra Nagar and Kankarbagh submerged under 6-8ft water for 10 days; 2.2M impacted"
        },
        {
          date: "August 2016",
          event: "Ganga High Flood Level Spillover",
          affected: "2.1 million people displaced across 12 riverine districts; 52 fatalities"
        },
        {
          date: "August 1975",
          event: "Historic Patna Sone Embankment Collapse",
          affected: "75% of Patna inundated in minutes; catastrophic infrastructural destruction"
        }
      ]
    },
    closestGreenZone: {
      id: "SAFE-BR-06",
      name: "AIIMS Patna & Bihta High-Ground Logistics Base",
      distanceKm: 18.5,
      transitRoute: "NH-922 Elevated Highway Corridor (All-Weather Flood Resilient)",
      lat: 25.5640,
      lng: 84.8620,
      geology: "High Alluvial Terrace (Elev: 62m, Zero Inundation History)",
      carryingCapacityScore: 0.89,
      availableCapacityHeadroom: 14500,
      infrastructureRating: "94% Verified",
      safeHouses: [
        {
          name: "AIIMS Patna Emergency Disaster Wing",
          capacity: "3,500 Beds",
          availableBeds: 2400,
          amenities: "Tertiary Trauma ICU, 24/7 Power, Liquid O2 Plant, 50k L/day Potable Water, Blood Bank",
          contact: "+91 612 245 1070"
        },
        {
          name: "Bihta Resilient High-Ground Shelter Complex",
          capacity: "8,000 Beds",
          availableBeds: 5800,
          amenities: "SDRF 9th Battalion Regional Hub, Helipad, Central Community Kitchen (30k meals/day), Solar Microgrid",
          contact: "+91 94318 20042"
        },
        {
          name: "Phulwari Sharif Multi-Purpose Relief Centre",
          capacity: "3,000 Beds",
          availableBeds: 2200,
          amenities: "Elevated Logistics Warehouse, Dry Ration Storage, Water Purification Units, Pediatric Care",
          contact: "+91 612 221 5400"
        }
      ],
      emergencyContacts: [
        { role: "State Emergency Operations Centre (SEOC) Patna", contact: "1070 / 0612-2217300", tel: "06122217300" },
        { role: "Addl. Relief Commissioner (Disaster Mgmt Dept)", name: "Dr. Manoj Kumar, IAS", contact: "+91 612 221 5400", tel: "+916122215400" },
        { role: "Patna District Control Room (Disaster Cell)", contact: "0612-2219810 / 112", tel: "06122219810" },
        { role: "NDRF 9th Battalion Command (Bihta Base)", contact: "+91 94318 20042", tel: "+919431820042" }
      ]
    },
    evacuationPaths: [
      {
        id: "PATH-PATNA-01",
        name: "Primary Highway: NH-922 Elevated Expressway Corridor",
        type: "PRIMARY_HIGHWAY",
        tierLabel: "Primary Elevated Corridor",
        badge: "Elevated Expressway",
        color: "#10b981",
        dashArray: null,
        weight: 4,
        distanceKm: 18.5,
        estimatedMinutes: 28,
        throughputPerHour: 2200,
        transitMode: "State Transport Fleet, Evacuation Buses, NDRF Heavy Trucks, Ambulances",
        status: "Open - Elevated 4-Lane",
        statusBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        elevationProfile: "Ascent from 49m Floodplain -> 62m High Alluvial Shelf",
        description: "Four-lane elevated highway constructed above the 100-year High Flood Level (HFL). Bypasses riverbank inundation directly to Bihta Logistics Hub.",
        chokePoints: [
          { name: "Digha Embankment Junction Checkpoint", km: 2.1, lat: 25.6280, lng: 85.0750, icon: "🚧", desc: "Traffic regulation checkpoint; SDRF marshals directing civilian convoys." },
          { name: "Danapur Cantonment Staging Depot", km: 7.4, lat: 25.6020, lng: 85.0120, icon: "🏥", desc: "Emergency medical triage, bottled drinking water distribution, and fuel replenishment." }
        ],
        waypoints: [
          [25.6385, 85.0880],
          [25.6280, 85.0750],
          [25.6020, 85.0120],
          [25.5810, 84.9350],
          [25.5640, 84.8620]
        ]
      },
      {
        id: "PATH-PATNA-02",
        name: "Secondary Bypass: Danapur Station High-Embankment Bypass",
        type: "SECONDARY_BYPASS",
        tierLabel: "Embankment Bypass",
        badge: "Paved Embankment",
        color: "#f59e0b",
        dashArray: "8, 6",
        weight: 3.5,
        distanceKm: 21.8,
        estimatedMinutes: 42,
        throughputPerHour: 950,
        transitMode: "Light Commercial Vehicles, Auto-Rickshaws, Private Cars, Mini-Buses",
        status: "Active Caution",
        statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        elevationProfile: "Protected Rail & Canal Bund Corridor",
        description: "Runs along the reinforced railway embankment and high canal ridge. Free from backwater seepage.",
        chokePoints: [
          { name: "Khagaul Rail Overbridge Flyover", km: 6.2, lat: 25.5850, lng: 85.0420, icon: "🌉", desc: "Narrow bridge approach; police convoy control in effect." },
          { name: "Naubatpur High Road Interlink", km: 15.0, lat: 25.5720, lng: 84.9520, icon: "⚠️", desc: "Secondary staging camp with dry food rations and mobile ambulances." }
        ],
        waypoints: [
          [25.6385, 85.0880],
          [25.6150, 85.0600],
          [25.5850, 85.0420],
          [25.5720, 84.9520],
          [25.5640, 84.8620]
        ]
      },
      {
        id: "PATH-PATNA-03",
        name: "Tactical Emergency Corridor: NDRF Motorboat & Air-Bridge Link",
        type: "TACTICAL_EMERGENCY",
        tierLabel: "Amphibious Air-Bridge",
        badge: "Boat & Helipad",
        color: "#a855f7",
        dashArray: "4, 6",
        weight: 3,
        distanceKm: 14.5,
        estimatedMinutes: 65,
        throughputPerHour: 450,
        transitMode: "NDRF Inflatable Motorboats (BAP), Air Force Mi-17 V5 Helicopters, SDRF Rescue Launches",
        status: "Active Flood Rescue",
        statusBadge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        elevationProfile: "Riverine Diara Navigation & Air Evacuation",
        description: "Specialized amphibious and aviation rescue corridor extracting marooned villagers from submerged Diara islands.",
        chokePoints: [
          { name: "Digha Ghat Rescue Boat Jetty", km: 1.5, lat: 25.6420, lng: 85.1050, icon: "🚤", desc: "18 motorized boats operating shuttle runs to marooned island hamlets." },
          { name: "Bihta Air Force Base Tactical Helipad", km: 14.2, lat: 25.5710, lng: 84.8720, icon: "🚁", desc: "IAF rescue helicopter staging zone with medical airlift facilities." }
        ],
        waypoints: [
          [25.6385, 85.0880],
          [25.6420, 85.1050],
          [25.6120, 85.0250],
          [25.5710, 84.8720],
          [25.5640, 84.8620]
        ]
      }
    ]
  },

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

if (typeof window !== 'undefined') {
  window.CITY_INTELLIGENCE_DATA = CITY_INTELLIGENCE_DATA;
}
