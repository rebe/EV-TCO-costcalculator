interface VehicleSpecs {
  name: string;
  type: 'PHEV' | 'EV' | 'ICE'; // Added ICE (Internal Combustion Engine)
  purchasePrice: number; // EUR
  yearModel: number; // e.g., 2021, 2024
  currentMileage: number; // km (for display purposes)
  batteryCapacity: number; // kWh (0 for ICE)
  electricRange: number; // km (0 for ICE)
  fuelConsumption?: number; // l/100km (for PHEV and ICE)
  electricConsumption: number; // kWh/100km (0 for ICE)
  insuranceClass: number; // 1-30
  condition?: 'new' | 'used'; // Auto-determined from year
  realWorldConsumptionFactor?: number; // Optional: override global factor for specific vehicle
}

interface FinlandCosts {
  electricityPricePerKwh: number; // EUR/kWh
  gasolinePrice: number; // EUR/liter
  annualMileage: number; // km
  electricDrivingPercentage: number; // % for PHEV (0 for ICE, 100 for EV)
  realWorldElectricConsumptionFactor: number; // Multiplier for realistic consumption (e.g., 1.2 = 20% higher)
}

interface TCOResult {
  vehicleName: string;
  type: string;
  yearModel: number;
  currentMileage: number;
  condition: string;
  year1: YearlyBreakdown;
  year2: YearlyBreakdown;
  year3: YearlyBreakdown;
  year4: YearlyBreakdown;
  year5: YearlyBreakdown;
  totalCost: number;
  averageAnnualCost: number;
  residualValue: number;
  purchasePrice: number;
}

interface YearlyBreakdown {
  depreciation: number;
  fuelCost: number;
  electricityCost: number;
  insurance: number;
  maintenance: number;
  tax: number;
  total: number;
}

class EVTCOCalculator {
  private readonly YEARS = 5;
  private readonly finlandCosts: FinlandCosts;
  private readonly currentYear: number;

  // Finnish market specific constants (2024-2026)
  // Source: https://www.traficom.fi/en/transport/road/vehicle-tax
  // NOTE: From 2026, EVs will start paying vehicle tax in Finland
  // The tax reform introduces a new calculation method based on vehicle mass

  // 2024-2025: Current system
  private readonly VEHICLE_TAX_BASE_2024 = 53.29; // EUR/year base
  private readonly VEHICLE_TAX_CO2_RATE_2024 = 0.9; // EUR per g/km CO2

  // 2026+: New system (EVs will pay tax based on vehicle mass)
  // Basic tax: €53.29 + mass-based component
  // For EVs: approximately €3.70 per 100 kg above 1,400 kg
  // For PHEVs/ICE: CO2-based system continues but rates may change
  private readonly VEHICLE_TAX_BASE_2026 = 53.29; // EUR/year base
  private readonly VEHICLE_TAX_MASS_RATE_2026 = 3.70; // EUR per 100kg above 1400kg
  private readonly VEHICLE_TAX_CO2_RATE_2026 = 1.1; // EUR per g/km CO2 (increased for PHEVs/ICE)

  private readonly MAINTENANCE_COST_EV = 300; // EUR/year
  private readonly MAINTENANCE_COST_PHEV = 500; // EUR/year
  private readonly MAINTENANCE_COST_ICE = 700; // EUR/year (highest due to oil changes, etc.)

  // Real-world consumption factors based on user data
  // Source: Spritmonitor.de, ADAC tests, and Finnish EV forums
  // Winter conditions in Finland increase consumption significantly
  private readonly DEFAULT_CONSUMPTION_FACTORS = {
    // EVs: WLTP vs real-world (Finnish climate with winter)
    // Summer: +10-15%, Winter: +30-40%, Annual average: +20-25%
    EV: 1.22, // 22% higher than WLTP (conservative estimate for Finnish conditions)

    // PHEVs: Similar to EVs when running on electric
    // Often driven more aggressively, less efficient than pure EVs
    PHEV: 1.25, // 25% higher than WLTP

    // ICE: Modern cars are closer to WLTP, but still optimistic
    // Real-world typically 10-20% higher
    ICE: 1.15, // 15% higher than WLTP
  };

  constructor(costs: FinlandCosts) {
    this.finlandCosts = costs;
    this.currentYear = new Date().getFullYear();
  }

  calculateTCO(vehicle: VehicleSpecs): TCOResult {
    const yearlyBreakdowns: YearlyBreakdown[] = [];
    const vehicleAge = this.currentYear - vehicle.yearModel;
    const condition = vehicleAge === 0 ? 'new' : 'used';
    let remainingValue = vehicle.purchasePrice;

    for (let year = 1; year <= this.YEARS; year++) {
      const depreciation = this.calculateDepreciation(
        vehicle.purchasePrice,
        year,
        vehicle.type,
        vehicleAge
      );
      remainingValue = vehicle.purchasePrice - this.calculateTotalDepreciation(
        vehicle.purchasePrice,
        year,
        vehicle.type,
        vehicleAge
      );

      const fuelCost = this.calculateFuelCost(vehicle, year);
      const electricityCost = this.calculateElectricityCost(vehicle, year);
      const insurance = this.calculateInsurance(vehicle, remainingValue, year);
      const maintenance = this.calculateMaintenance(vehicle, year, vehicleAge);
      const tax = this.calculateVehicleTax(vehicle, year);

      yearlyBreakdowns.push({
        depreciation,
        fuelCost,
        electricityCost,
        insurance,
        maintenance,
        tax,
        total: depreciation + fuelCost + electricityCost + insurance + maintenance + tax,
      });
    }

    const totalCost = yearlyBreakdowns.reduce((sum, year) => sum + year.total, 0);
    const residualValue = vehicle.purchasePrice - this.calculateTotalDepreciation(
      vehicle.purchasePrice,
      this.YEARS,
      vehicle.type,
      vehicleAge
    );

    return {
      vehicleName: vehicle.name,
      type: vehicle.type,
      yearModel: vehicle.yearModel,
      currentMileage: vehicle.currentMileage,
      condition,
      year1: yearlyBreakdowns[0],
      year2: yearlyBreakdowns[1],
      year3: yearlyBreakdowns[2],
      year4: yearlyBreakdowns[3],
      year5: yearlyBreakdowns[4],
      totalCost,
      averageAnnualCost: totalCost / this.YEARS,
      residualValue,
      purchasePrice: vehicle.purchasePrice,
    };
  }

  private calculateDepreciation(
    purchasePrice: number,
    year: number,
    type: 'PHEV' | 'EV' | 'ICE',
    currentAge: number
  ): number {
    // Depreciation rates for Finnish market - slows down with age
    // New cars (0-1 years old)
    const newCarRates = {
      EV: [0.25, 0.15, 0.12, 0.10, 0.08],
      PHEV: [0.23, 0.14, 0.11, 0.09, 0.07],
      ICE: [0.20, 0.13, 0.10, 0.08, 0.06], // ICE depreciates slower initially but less desirable long-term
    };

    // Used cars (2-4 years old)
    const youngUsedRates = {
      EV: [0.12, 0.10, 0.09, 0.08, 0.07],
      PHEV: [0.11, 0.09, 0.08, 0.07, 0.06],
      ICE: [0.10, 0.08, 0.07, 0.06, 0.05],
    };

    // Older used cars (5+ years old)
    const olderUsedRates = {
      EV: [0.08, 0.07, 0.06, 0.05, 0.04],
      PHEV: [0.07, 0.06, 0.05, 0.04, 0.03],
      ICE: [0.06, 0.05, 0.04, 0.03, 0.02],
    };

    let rates;
    if (currentAge === 0) {
      rates = newCarRates[type];
    } else if (currentAge <= 4) {
      rates = youngUsedRates[type];
    } else {
      rates = olderUsedRates[type];
    }

    const rate = rates[year - 1];
    const previousDepreciation = this.calculateTotalDepreciation(
      purchasePrice,
      year - 1,
      type,
      currentAge
    );
    const remainingValue = purchasePrice - previousDepreciation;

    return remainingValue * rate;
  }

  private calculateTotalDepreciation(
    purchasePrice: number,
    upToYear: number,
    type: 'PHEV' | 'EV' | 'ICE',
    currentAge: number
  ): number {
    let totalDepreciation = 0;
    let remainingValue = purchasePrice;

    const newCarRates = {
      EV: [0.25, 0.15, 0.12, 0.10, 0.08],
      PHEV: [0.23, 0.14, 0.11, 0.09, 0.07],
      ICE: [0.20, 0.13, 0.10, 0.08, 0.06],
    };

    const youngUsedRates = {
      EV: [0.12, 0.10, 0.09, 0.08, 0.07],
      PHEV: [0.11, 0.09, 0.08, 0.07, 0.06],
      ICE: [0.10, 0.08, 0.07, 0.06, 0.05],
    };

    const olderUsedRates = {
      EV: [0.08, 0.07, 0.06, 0.05, 0.04],
      PHEV: [0.07, 0.06, 0.05, 0.04, 0.03],
      ICE: [0.06, 0.05, 0.04, 0.03, 0.02],
    };

    let rates;
    if (currentAge === 0) {
      rates = newCarRates[type];
    } else if (currentAge <= 4) {
      rates = youngUsedRates[type];
    } else {
      rates = olderUsedRates[type];
    }

    for (let year = 0; year < upToYear; year++) {
      const depreciation = remainingValue * rates[year];
      totalDepreciation += depreciation;
      remainingValue -= depreciation;
    }

    return totalDepreciation;
  }

  private calculateFuelCost(vehicle: VehicleSpecs, year: number): number {
    if (vehicle.type === 'EV') return 0;

    let kmOnFuel: number;

    if (vehicle.type === 'ICE') {
      // ICE cars use 100% fuel
      kmOnFuel = this.finlandCosts.annualMileage;
    } else {
      // PHEV: calculate fuel cost based on non-electric driving
      const nonElectricPercentage = 1 - this.finlandCosts.electricDrivingPercentage / 100;
      kmOnFuel = this.finlandCosts.annualMileage * nonElectricPercentage;
    }

    // Apply real-world consumption factor for ICE
    const consumptionFactor = vehicle.type === 'ICE'
      ? this.DEFAULT_CONSUMPTION_FACTORS.ICE
      : 1.0; // PHEV fuel consumption is already realistic in specs

    const litersUsed = (kmOnFuel / 100) * (vehicle.fuelConsumption || 0) * consumptionFactor;

    return litersUsed * this.finlandCosts.gasolinePrice;
  }

  private calculateElectricityCost(vehicle: VehicleSpecs, year: number): number {
    if (vehicle.type === 'ICE') return 0;

    let electricKm: number;

    if (vehicle.type === 'EV') {
      electricKm = this.finlandCosts.annualMileage;
    } else {
      // PHEV
      electricKm =
        this.finlandCosts.annualMileage *
        (this.finlandCosts.electricDrivingPercentage / 100);
    }

    // Use vehicle-specific factor if provided, otherwise use default for vehicle type
    const consumptionFactor = vehicle.realWorldConsumptionFactor !== undefined
      ? vehicle.realWorldConsumptionFactor
      : (vehicle.type === 'EV'
          ? this.DEFAULT_CONSUMPTION_FACTORS.EV
          : this.DEFAULT_CONSUMPTION_FACTORS.PHEV);

    // Apply real-world consumption factor
    const realWorldConsumption = vehicle.electricConsumption * consumptionFactor;
    const kwhUsed = (electricKm / 100) * realWorldConsumption;

    return kwhUsed * this.finlandCosts.electricityPricePerKwh;
  }

  private calculateInsurance(
    vehicle: VehicleSpecs,
    currentValue: number,
    year: number
  ): number {
    // Finnish insurance calculation (simplified)
    // Base rate varies by insurance class and vehicle value
    const baseRate = 0.015; // 1.5% of vehicle value
    const classMultiplier = 1 + (vehicle.insuranceClass - 15) * 0.02;

    return currentValue * baseRate * classMultiplier;
  }

  private calculateMaintenance(vehicle: VehicleSpecs, year: number, currentAge: number): number {
    let baseCost: number;

    if (vehicle.type === 'EV') {
      baseCost = this.MAINTENANCE_COST_EV;
    } else if (vehicle.type === 'PHEV') {
      baseCost = this.MAINTENANCE_COST_PHEV;
    } else {
      baseCost = this.MAINTENANCE_COST_ICE;
    }

    // Maintenance costs increase with total age (current age + ownership years)
    const totalAge = currentAge + year;
    const ageMultiplier = 1 + (totalAge - 1) * 0.08;

    // Additional cost for older cars (5+ years)
    const oldCarSurcharge = totalAge >= 5 ? 100 : 0;

    return baseCost * ageMultiplier + oldCarSurcharge;
  }

  private calculateVehicleTax(vehicle: VehicleSpecs, ownershipYear: number): number {
    const calendarYear = this.currentYear + ownershipYear;

    if (calendarYear < 2026) {
      // Current system (2024-2025): EVs pay €0, PHEVs/ICE pay based on CO2
      if (vehicle.type === 'EV') {
        return 0; // EVs currently exempt
      } else {
        // PHEV/ICE: CO2-based tax
        // PHEV: typically 30-50 g/km
        // ICE: typically 120-180 g/km for modern cars
        const co2Emissions = vehicle.type === 'PHEV' ? 40 : 150; // g/km average
        return this.VEHICLE_TAX_BASE_2024 + co2Emissions * this.VEHICLE_TAX_CO2_RATE_2024;
      }
    } else {
      // New system from 2026: EVs pay mass-based tax, PHEVs/ICE continue CO2-based
      if (vehicle.type === 'EV') {
        // Mass-based calculation for EVs
        // Estimate vehicle mass based on battery capacity
        // Rough estimate: 1400kg base + 6kg per kWh of battery
        const estimatedMass = 1400 + (vehicle.batteryCapacity * 6);
        const massAboveThreshold = Math.max(0, estimatedMass - 1400);
        const massTax = (massAboveThreshold / 100) * this.VEHICLE_TAX_MASS_RATE_2026;

        return this.VEHICLE_TAX_BASE_2026 + massTax;
      } else {
        // PHEV/ICE: CO2-based tax with potentially higher rate
        const co2Emissions = vehicle.type === 'PHEV' ? 40 : 150; // g/km average
        return this.VEHICLE_TAX_BASE_2026 + co2Emissions * this.VEHICLE_TAX_CO2_RATE_2026;
      }
    }
  }

  compareVehicles(vehicles: VehicleSpecs[]): void {
    console.log('\n=== TCO COMPARISON - FINNISH MARKET (5 YEARS) ===\n');
    console.log(`Annual Mileage: ${this.finlandCosts.annualMileage} km`);
    console.log(`Electricity Price: €${this.finlandCosts.electricityPricePerKwh}/kWh`);
    console.log(`Gasoline Price: €${this.finlandCosts.gasolinePrice}/liter`);
    console.log(`\n⚠️  NOTE: Real-world consumption factors applied:`);
    console.log(`   - EVs: ${(this.DEFAULT_CONSUMPTION_FACTORS.EV * 100 - 100).toFixed(0)}% higher than WLTP (Finnish winter conditions)`);
    console.log(`   - PHEVs: ${(this.DEFAULT_CONSUMPTION_FACTORS.PHEV * 100 - 100).toFixed(0)}% higher than WLTP`);
    console.log(`   - ICE: ${(this.DEFAULT_CONSUMPTION_FACTORS.ICE * 100 - 100).toFixed(0)}% higher than WLTP`);
    console.log(`\n⚠️  NOTE: From 2026, EVs will pay vehicle tax based on mass (€3.70/100kg above 1400kg)`);
    console.log(`   PHEVs/ICE continue CO2-based taxation with potentially higher rates\n`);

    const results = vehicles.map((vehicle) => this.calculateTCO(vehicle));

    results.forEach((result) => {
      this.printVehicleResult(result);
    });

    this.printComparison(results);
  }

  private printVehicleResult(result: TCOResult): void {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`${result.vehicleName} (${result.type}) - ${result.yearModel} Model`);
    console.log(`Condition: ${result.condition.toUpperCase()} | Current Mileage: ${result.currentMileage.toLocaleString()} km | Purchase Price: €${result.purchasePrice.toLocaleString()}`);
    console.log('='.repeat(70));

    console.log('\nYearly Breakdown:');
    console.log(
      'Year | Deprec. | Fuel | Electric | Insurance | Maint. | Tax | Total'
    );
    console.log('-'.repeat(80));

    [result.year1, result.year2, result.year3, result.year4, result.year5].forEach(
      (year, index) => {
        console.log(
          `  ${index + 1}  | €${year.depreciation.toFixed(0).padStart(6)} | €${year.fuelCost.toFixed(0).padStart(4)} | €${year.electricityCost.toFixed(0).padStart(6)} | €${year.insurance.toFixed(0).padStart(7)} | €${year.maintenance.toFixed(0).padStart(5)} | €${year.tax.toFixed(0).padStart(3)} | €${year.total.toFixed(0).padStart(6)}`
        );
      }
    );

    console.log('-'.repeat(80));
    console.log(`Total 5-Year Cost: €${result.totalCost.toFixed(2)}`);
    console.log(`Average Annual Cost: €${result.averageAnnualCost.toFixed(2)}`);
    console.log(`Residual Value: €${result.residualValue.toFixed(2)}`);
  }

  private printComparison(results: TCOResult[]): void {
    console.log('\n\n' + '='.repeat(70));
    console.log('SUMMARY COMPARISON');
    console.log('='.repeat(70));

    results.sort((a, b) => a.totalCost - b.totalCost);

    console.log('\nRanked by Total Cost of Ownership:');
    results.forEach((result, index) => {
      const savings = index > 0 ? result.totalCost - results[0].totalCost : 0;
      const emoji = result.condition === 'new' ? '🆕' : '🔄';
      const typeEmoji = result.type === 'EV' ? '⚡' : result.type === 'PHEV' ? '🔌' : '⛽';
      console.log(
        `${index + 1}. ${emoji} ${typeEmoji} ${result.vehicleName} (${result.type}, ${result.yearModel}): €${result.totalCost.toFixed(2)}${savings !== 0 ? ` (+€${Math.abs(savings).toFixed(2)} vs best)` : ' ⭐ BEST'}`
      );
    });

    console.log('\nNet Cost After Resale (Total Cost - Residual Value):');
    results.forEach((result) => {
      const netCost = result.totalCost - result.residualValue;
      console.log(
        `${result.vehicleName} (${result.yearModel}): €${netCost.toFixed(2)} (Residual: €${result.residualValue.toFixed(2)})`
      );
    });

    console.log('\n\nNew vs Used Comparison:');
    const newCars = results.filter(r => r.condition === 'new');
    const usedCars = results.filter(r => r.condition === 'used');

    if (newCars.length > 0) {
      console.log('\n🆕 Best New Car:');
      const bestNew = newCars[0];
      console.log(`   ${bestNew.vehicleName} - €${bestNew.totalCost.toFixed(2)} total TCO`);
    }

    if (usedCars.length > 0) {
      console.log('\n🔄 Best Used Car:');
      const bestUsed = usedCars[0];
      console.log(`   ${bestUsed.vehicleName} (${bestUsed.yearModel}) - €${bestUsed.totalCost.toFixed(2)} total TCO`);
    }

    // Type comparison
    console.log('\n\nBy Vehicle Type:');
    const evs = results.filter(r => r.type === 'EV');
    const phevs = results.filter(r => r.type === 'PHEV');
    const ices = results.filter(r => r.type === 'ICE');

    if (evs.length > 0) {
      console.log(`\n⚡ Best EV: ${evs[0].vehicleName} (${evs[0].yearModel}) - €${evs[0].totalCost.toFixed(2)}`);
    }
    if (phevs.length > 0) {
      console.log(`🔌 Best PHEV: ${phevs[0].vehicleName} (${phevs[0].yearModel}) - €${phevs[0].totalCost.toFixed(2)}`);
    }
    if (ices.length > 0) {
      console.log(`⛽ Best ICE: ${ices[0].vehicleName} (${ices[0].yearModel}) - €${ices[0].totalCost.toFixed(2)}`);
    }
  }
}

export { EVTCOCalculator, VehicleSpecs, FinlandCosts, TCOResult };
