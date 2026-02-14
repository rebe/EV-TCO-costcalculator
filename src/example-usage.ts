import { EVTCOCalculator, FinlandCosts, VehicleSpecs } from './tco-calculator';

// Finnish market costs (2024 estimates)
const finlandCosts: FinlandCosts = {
  electricityPricePerKwh: 0.1 + 0.08, // EUR/kWh (including transfer fees)
  gasolinePrice: 1.85, // EUR/liter
  annualMileage: 20000, // km
  electricDrivingPercentage: 60, // % for PHEV (typical for Finnish commuters)
};

// Example vehicles for Finnish market
const vehicles: VehicleSpecs[] = [
  {
    name: 'Toyota RAV4 PHEV',
    type: 'PHEV',
    purchasePrice: 52000,
    batteryCapacity: 18.1,
    electricRange: 75,
    fuelConsumption: 6.2, // l/100km in hybrid mode
    electricConsumption: 18.0, // kWh/100km
    insuranceClass: 18,
  },
  {
    name: 'Tesla Model Y Long Range',
    type: 'EV',
    purchasePrice: 55000,
    batteryCapacity: 75,
    electricRange: 533,
    electricConsumption: 16.9, // kWh/100km
    insuranceClass: 20,
  },
  {
    name: 'Volkswagen ID.4 Pro',
    type: 'EV',
    purchasePrice: 48000,
    batteryCapacity: 77,
    electricRange: 520,
    electricConsumption: 17.5, // kWh/100km
    insuranceClass: 17,
  },
  {
    name: 'Kia Sportage PHEV',
    type: 'PHEV',
    purchasePrice: 48000,
    batteryCapacity: 13.8,
    electricRange: 70,
    fuelConsumption: 6.5, // l/100km in hybrid mode
    electricConsumption: 19.0, // kWh/100km
    insuranceClass: 16,
  },
  {
    name: 'Hyundai Ioniq 5',
    type: 'EV',
    purchasePrice: 50000,
    batteryCapacity: 72.6,
    electricRange: 481,
    electricConsumption: 16.7, // kWh/100km
    insuranceClass: 18,
  },
];

// Run the comparison
const calculator = new EVTCOCalculator(finlandCosts);
calculator.compareVehicles(vehicles);
