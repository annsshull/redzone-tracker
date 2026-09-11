/**
 * RedZone Tracker - District Collector & DDMA Executive Brief Generator
 * Generates an official, print-ready disaster vulnerability and relocation report.
 */

import { HABITATIONS_DATA, SAFE_HAVEN_DESTINATIONS, AHP_WEIGHTS } from './data.js';
import { calculateRelocationPriority, findBestSafeHaven, estimateRelocationBudget } from './algorithms.js';

export function generateDistrictCollectorBrief(districtFilter = "All") {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const habitations = (districtFilter === "All" 
    ? HABITATIONS_DATA 
    : HABITATIONS_DATA.filter(h => h.district.toLowerCase() === districtFilter.toLowerCase())
  ).map(hab => {
    const priority = calculateRelocationPriority(hab);
    const safeHaven = findBestSafeHaven(hab, SAFE_HAVEN_DESTINATIONS);
    const budget = estimateRelocationBudget(hab);
    return { ...hab, priority, safeHaven, budget };
  }).sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);

  const totalPopAtRisk = habitations.reduce((acc, h) => acc + h.population, 0);
  const totalFamilies = habitations.reduce((acc, h) => acc + h.households, 0);
  const tier1Count = habitations.filter(h => h.priority.priorityScore >= 0.75).length;
  const totalEstimatedCostCr = habitations.reduce((acc, h) => acc + (h.budget.totalCostRupees / 10000000), 0).toFixed(2);

  const reportHTML = `
    <div id="print-report-container" class="bg-white text-gray-900 p-8 max-w-4xl mx-auto font-sans leading-relaxed shadow-xl rounded-xl">
      <!-- Official Header -->
      <div class="border-b-2 border-red-800 pb-4 mb-6 flex justify-between items-start">
        <div>
          <div class="flex items-center space-x-3 mb-1">
            <span class="text-2xl">🏛️</span>
            <div>
              <h1 class="text-xl font-bold uppercase tracking-wider text-red-900">National Disaster Management Authority (NDMA)</h1>
              <h2 class="text-sm font-semibold text-gray-700">District Disaster Management Authority (DDMA) Command Intelligence</h2>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">Ref: DDMA/REDZONE-RELOC/SIH-2026/DOC-0994 | Classification: SENSITIVE - OPERATIONAL BRIEF</p>
        </div>
        <div class="text-right">
          <div class="inline-block bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded font-bold border border-red-300">
            IMMEDIATE ACTION DIRECTIVE
          </div>
          <div class="text-xs text-gray-500 mt-1">Date: ${dateStr}</div>
          <div class="text-xs text-gray-500">Region: ${districtFilter === "All" ? "Pan-India High Risk Zones" : districtFilter}</div>
        </div>
      </div>

      <!-- Subject & Purpose -->
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 class="text-sm font-bold text-gray-900 mb-1">SUBJECT: Scientific Identification of Hazard Red Zones & Priority Relocation Schedule</h3>
        <p class="text-xs text-gray-600">
          This report compiles geotechnical hazard zonation (AHP), composite carrying capacity deficits (CCI), and IPCC vulnerability metrics to provide the District Collector with an evidence-based habitation relocation priority list compliant with Sendai Framework Target G and NDMA guidelines.
        </p>
      </div>

      <!-- Key Metrics Overview Grid -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <div class="p-3 bg-red-50 border border-red-200 rounded text-center">
          <div class="text-xs text-red-700 font-semibold uppercase">Critical Red Zones</div>
          <div class="text-2xl font-bold text-red-900">${tier1Count} Habitations</div>
          <div class="text-[11px] text-red-600">Immediate evacuation order</div>
        </div>
        <div class="p-3 bg-amber-50 border border-amber-200 rounded text-center">
          <div class="text-xs text-amber-700 font-semibold uppercase">Population at Risk</div>
          <div class="text-2xl font-bold text-amber-900">${totalPopAtRisk.toLocaleString()}</div>
          <div class="text-[11px] text-amber-700">${totalFamilies} Vulnerable Families</div>
        </div>
        <div class="p-3 bg-blue-50 border border-blue-200 rounded text-center">
          <div class="text-xs text-blue-700 font-semibold uppercase">Resettlement Sites</div>
          <div class="text-2xl font-bold text-blue-900">${SAFE_HAVEN_DESTINATIONS.length} Safe Havens</div>
          <div class="text-[11px] text-blue-600">High Capacity Headroom</div>
        </div>
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded text-center">
          <div class="text-xs text-emerald-700 font-semibold uppercase">Relocation Budget</div>
          <div class="text-2xl font-bold text-emerald-900">₹${totalEstimatedCostCr} Cr</div>
          <div class="text-[11px] text-emerald-700">PMAY-G & SDRF Resettlement</div>
        </div>
      </div>

      <!-- Priority Relocation Action Table -->
      <div class="mb-6">
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2 flex items-center justify-between">
          <span>Priority-Ranked Habitation Evacuation Schedule</span>
          <span class="text-[11px] font-normal text-gray-500">Sorted by MCDA Urgency Score</span>
        </h4>
        <div class="overflow-x-auto border border-gray-200 rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                <th class="p-2.5">Rank</th>
                <th class="p-2.5">Habitation & District</th>
                <th class="p-2.5">Primary Threat</th>
                <th class="p-2.5 text-center">CC Overload</th>
                <th class="p-2.5 text-center">Priority</th>
                <th class="p-2.5">Recommended Safe Haven</th>
                <th class="p-2.5 text-right">Est. Budget</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${habitations.map((h, i) => `
                <tr class="${i === 0 ? 'bg-red-50/50' : 'hover:bg-gray-50'}">
                  <td class="p-2.5 font-bold ${h.priority.priorityScore >= 0.75 ? 'text-red-700' : 'text-gray-700'}">#${i + 1}</td>
                  <td class="p-2.5">
                    <div class="font-bold text-gray-900">${h.name}</div>
                    <div class="text-[11px] text-gray-500">${h.district}, ${h.state} | ${h.population.toLocaleString()} pop</div>
                  </td>
                  <td class="p-2.5 text-gray-700">${h.primaryHazard}</td>
                  <td class="p-2.5 text-center font-semibold text-red-600">
                    +${h.priority.cc.overloadPercentage}%
                  </td>
                  <td class="p-2.5 text-center">
                    <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      h.priority.priorityScore >= 0.75 ? 'bg-red-100 text-red-800' :
                      h.priority.priorityScore >= 0.60 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                    }">
                      ${h.priority.priorityScore}
                    </span>
                  </td>
                  <td class="p-2.5">
                    <div class="font-semibold text-emerald-800">${h.safeHaven ? h.safeHaven.haven.name : 'Regional Haven'}</div>
                    <div class="text-[10px] text-gray-500">${h.safeHaven ? `${h.safeHaven.distanceKm} km transit | ${h.safeHaven.haven.elevation}` : 'Optimal buffer'}</div>
                  </td>
                  <td class="p-2.5 text-right font-bold text-gray-900">
                    ${h.budget.formattedTotal.split(' ')[0]}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Scientific Methodology Brief -->
      <div class="grid grid-cols-2 gap-4 text-xs text-gray-700 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <h5 class="font-bold text-gray-900 mb-1">1. AHP Multi-Hazard Weights (GSI/NDMA)</h5>
          <p class="text-[11px] text-gray-600 mb-1">
            Slope (28%), Rainfall Intensity (24%), Elevation & Geology (20%), Seismic Proximity (16%), Soil/LULC (12%).
          </p>
          <div class="text-[11px] text-gray-500 font-mono">Consistency Ratio (CR) < 0.10 (Mathematically Validated)</div>
        </div>
        <div>
          <h5 class="font-bold text-gray-900 mb-1">2. Relocation Formula & IPCC Vulnerability</h5>
          <p class="text-[11px] text-gray-600 mb-1">
            Priority = (0.30·Hazard) + (0.25·CC_Overflow) + (0.25·Vulnerability) + (0.20·Pop_Norm).
          </p>
          <div class="text-[11px] text-gray-500 font-mono">V = (Exposure × Sensitivity) / Adaptive Capacity</div>
        </div>
      </div>

      <!-- Signatures & Directives -->
      <div class="border-t border-gray-300 pt-4 flex justify-between items-end text-xs text-gray-600">
        <div>
          <div class="font-bold text-gray-900">Directive for Action:</div>
          <div>1. Deploy SDRF/NDRF evacuation flotillas to Tier 1 habitations.</div>
          <div>2. Issue land-allotment sanads at designated safe havens under PMAY-G.</div>
          <div>3. Continuous telemetry monitoring of active subsidence & river gauges.</div>
        </div>
        <div class="text-center">
          <div class="border-b border-gray-400 w-40 mb-1"></div>
          <div class="font-bold text-gray-900">District Magistrate & Collector</div>
          <div class="text-[10px] text-gray-500">Chairman, DDMA</div>
        </div>
      </div>
    </div>
  `;

  return reportHTML;
}
