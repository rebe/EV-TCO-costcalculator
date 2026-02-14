import { EVTCOCalculator, FinlandCosts, VehicleSpecs } from './tco-calculator';

// Finnish market costs (2024 estimates)
const finlandCosts: FinlandCosts = {
  electricityPricePerKwh: 0.25, // EUR/kWh (including transfer fees)
  gasolinePrice: 1.85, // EUR/liter
  annualMileage: 15000, // km
  electricDrivingPercentage: 70, // % for PHEV (typical for Finnish commuters)
};

// Example vehicles for Finnish market - Mix of new and used
const vehicles: VehicleSpecs[] = [
  // NEW CARS
  {
    name: 'Toyota RAV4 PHEV',
    type: 'PHEV',
    purchasePrice: 52000,
    yearModel: 2024,
    currentMileage: 0,
    batteryCapacity: 18.1,
    electricRange: 75,
    fuelConsumption: 6.2,
    electricConsumption: 18.0,
    insuranceClass: 18,
  },
  {
    name: 'Tesla Model Y Long Range',
    type: 'EV',
    purchasePrice: 55000,
    yearModel: 2024,
    currentMileage: 0,
    batteryCapacity: 75,
    electricRange: 533,
    electricConsumption: 16.9,
    insuranceClass: 20,
  },
  {
    name: 'Volkswagen ID.4 Pro',
    type: 'EV',
    purchasePrice: 48000,
    yearModel: 2024,
    currentMileage: 0,
    batteryCapacity: 77,
    electricRange: 520,
    electricConsumption: 17.5,
    insuranceClass: 17,
  },
  {
    name: 'BMW iX xDrive40',
    type: 'EV',
    purchasePrice: 85000,
    yearModel: 2024,
    currentMileage: 0,
    batteryCapacity: 76.6,
    electricRange: 425,
    electricConsumption: 19.5,
    insuranceClass: 25,
  },
  {
    name: 'Mercedes-Benz EQE 350',
    type: 'EV',
    purchasePrice: 82000,
    yearModel: 2024,
    currentMileage: 0,
    batteryCapacity: 90.6,
    electricRange: 590,
    electricConsumption: 18.7,
    insuranceClass: 26,
  },

  // USED CARS - 2021 Models
  {
    name: 'VW Passat GTE',
    type: 'PHEV',
    purchasePrice: 28000,
    yearModel: 2021,
    currentMileage: 45000,
    batteryCapacity: 13.0,
    electricRange: 55,
    fuelConsumption: 5.8,
    electricConsumption: 17.0,
    insuranceClass: 16,
  },
  {
    name: 'Tesla Model 3 Long Range',
    type: 'EV',
    purchasePrice: 38000,
    yearModel: 2021,
    currentMileage: 52000,
    batteryCapacity: 75,
    electricRange: 580,
    electricConsumption: 15.5,
    insuranceClass: 19,
  },
  {
    name: 'Audi e-tron 55 quattro',
    type: 'EV',
    purchasePrice: 52000,
    yearModel: 2021,
    currentMileage: 38000,
    batteryCapacity: 95,
    electricRange: 441,
    electricConsumption: 22.5,
    insuranceClass: 24,
  },
  {
    name: 'BMW 330e',
    type: 'PHEV',
    purchasePrice: 35000,
    yearModel: 2021,
    currentMileage: 42000,
    batteryCapacity: 12.0,
    electricRange: 60,
    fuelConsumption: 5.5,
    electricConsumption: 16.5,
    insuranceClass: 20,
  },

  // USED CARS - 2020 Models
  {
    name: 'Porsche Taycan 4S',
    type: 'EV',
    purchasePrice: 68000,
    yearModel: 2020,
    currentMileage: 35000,
    batteryCapacity: 93.4,
    electricRange: 463,
    electricConsumption: 24.8,
    insuranceClass: 28,
  },
  {
    name: 'Volvo XC60 T8 Recharge',
    type: 'PHEV',
    purchasePrice: 42000,
    yearModel: 2020,
    currentMileage: 48000,
    batteryCapacity: 11.6,
    electricRange: 50,
    fuelConsumption: 7.0,
    electricConsumption: 20.0,
    insuranceClass: 21,
  },

  // USED CARS - 2019 Models
  {
    name: 'Kia Niro PHEV',
    type: 'PHEV',
    purchasePrice: 22000,
    yearModel: 2019,
    currentMileage: 65000,
    batteryCapacity: 8.9,
    electricRange: 58,
    fuelConsumption: 5.3,
    electricConsumption: 15.5,
    insuranceClass: 14,
  },
  {
    name: 'Jaguar I-PACE',
    type: 'EV',
    purchasePrice: 45000,
    yearModel: 2019,
    currentMileage: 58000,
    batteryCapacity: 90,
    electricRange: 470,
    electricConsumption: 23.0,
    insuranceClass: 23,
  },
];

// Run the comparison
const calculator = new EVTCOCalculator(finlandCosts);
calculator.compareVehicles(vehicles);

