import { EVTCOCalculator, FinlandCosts } from './tco-calculator';
import { evVehicles, iceVehicles, phevVehicles } from './data/index';

const finlandCosts: FinlandCosts = {
  electricityPricePerKwh: 0.11,
  gasolinePrice: 1.85,
  annualMileage: 15000,
  electricDrivingPercentage: 80, // High electric usage for PHEV
  realWorldElectricConsumptionFactor: 1.22,
};

const calculator = new EVTCOCalculator(finlandCosts);

// Compare only budget-friendly options
const budgetVehicles = [
  ...evVehicles.filter(v => v.purchasePrice < 40000),
  ...phevVehicles.filter(v => v.purchasePrice < 35000),
  ...iceVehicles.filter(v => v.purchasePrice < 25000),
];

calculator.compareVehicles(budgetVehicles);
