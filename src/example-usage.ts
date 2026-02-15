import { EVTCOCalculator, FinlandCosts } from './tco-calculator';
import { evVehicles, iceVehicles, phevVehicles } from './data';

// Finnish market costs (2025)
const finlandCosts: FinlandCosts = {
  electricityPricePerKwh: 0.11, // EUR/kWh (6c energy + 5c transfer in Tampere)
  gasolinePrice: 1.85, // EUR/liter
  annualMileage: 20000, // km per year
  electricDrivingPercentage: 70, // % for PHEV (70% electric, 30% fuel)
  realWorldElectricConsumptionFactor: 1.22, // 22% higher than WLTP
};

const calculator = new EVTCOCalculator(finlandCosts);

// Check if markdown output is requested via command line argument
const args = process.argv.slice(2);
if (args.includes('--markdown') || args.includes('-md')) {
  calculator.setOutputFormat('markdown');
}

// Combine all vehicles for comparison
const allVehicles = [...evVehicles, ...phevVehicles, ...iceVehicles];

// Run the comparison
calculator.compareVehicles(allVehicles);
