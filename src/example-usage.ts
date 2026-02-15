import { EVTCOCalculator, FinlandCosts } from './tco-calculator';

import { evVehicles } from './data/ev-vehicles';
import { iceVehicles } from './data/ice-vehicles';
import { phevVehicles } from './data/phev-vehicles';

// Finnish market costs (2025 actual rates)
const finlandCosts: FinlandCosts = {
  electricityPricePerKwh: 0.11, // EUR/kWh (6c energy + 5c transfer in Tampere)
  gasolinePrice: 1.85, // EUR/liter
  annualMileage: 20000, // km
  electricDrivingPercentage: 70, // % for PHEV (0 for ICE, ignored for EV)
  realWorldElectricConsumptionFactor: 1.22, // 22% higher than WLTP (Finnish winter conditions)
};

// Create calculator instance
const calculator = new EVTCOCalculator(finlandCosts);

// You can compare all vehicles or select specific ones
const allVehicles = [...evVehicles, ...phevVehicles, ...iceVehicles];

// Or compare specific categories:
// const selectedVehicles = [...evVehicles]; // Only EVs
// const selectedVehicles = [...phevVehicles]; // Only PHEVs
// const selectedVehicles = [...iceVehicles]; // Only ICE
// const selectedVehicles = [...evVehicles.slice(0, 5), ...phevVehicles.slice(0, 3)]; // Mix

// Run comparison
calculator.compareVehicles(allVehicles);

// You can also calculate TCO for a single vehicle
// const singleResult = calculator.calculateTCO(evVehicles[0]);
// console.log(singleResult);
