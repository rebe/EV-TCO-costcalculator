interface VehicleSpecs {
  name: string;
  type: 'PHEV' | 'EV';
  purchasePrice: number; // EUR
  yearModel: number; // e.g., 2021, 2024
  currentMileage: number; // km (for display purposes)
  batteryCapacity: number; // kWh
  electricRange: number; // km
  fuelConsumption?: number; // l/100km (for PHEV in hybrid mode)
  electricConsumption: number; // kWh/100km
  insuranceClass: number; // 1-30
  condition?: 'new' | 'used'; // Auto-determined from year
}

interface FinlandCosts {
  electricityPricePerKwh: number; // EUR/kWh
  gasolinePrice: number; // EUR/liter
  annualMileage: number; // km
  electricDrivingPercentage: number; // % for PHEV
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
  // For PHEVs: CO2-based system continues but rates may change
  private readonly VEHICLE_TAX_BASE_2026 = 53.29; // EUR/year base
  private readonly VEHICLE_TAX_MASS_RATE_2026 = 3.70; // EUR per 100kg above 1400kg
  private readonly VEHICLE_TAX_CO2_RATE_2026 = 1.1; // EUR per g/km CO2 (increased for PHEVs)
  
  private readonly MAINTENANCE_COST_EV = 300; // EUR/year
  private readonly MAINTENANCE_COST_PHEV = 500; // EUR/year

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
    type: 'PHEV' | 'EV',
    currentAge: number
  ): number {
    // Depreciation rates for Finnish market - slows down with age
    // New cars (0-1 years old)
    const newCarRates = {
      EV: [0.25, 0.15, 0.12, 0.10, 0.08],
      PHEV: [0.23, 0.14, 0.11, 0.09, 0.07],
    };

    // Used cars (2-4 years old)
    const youngUsedRates = {
      EV: [0.12, 0.10, 0.09, 0.08, 0.07],
      PHEV: [0.11, 0.09, 0.08, 0.07, 0.06],
    };

    // Older used cars (5+ years old)
    const olderUsedRates = {
      EV: [0.08, 0.07, 0.06, 0.05, 0.04],
      PHEV: [0.07, 0.06, 0.05, 0.04, 0.03],
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
    type: 'PHEV' | 'EV',
    currentAge: number
  ): number {
    let totalDepreciation = 0;
    let remainingValue = purchasePrice;

    const newCarRates = {
      EV: [0.25, 0.15, 0.12, 0.10, 0.08],
      PHEV: [0.23, 0.14, 0.11, 0.09, 0.07],
    };

    const youngUsedRates = {
      EV: [0.12, 0.10, 0.09, 0.08, 0.07],
      PHEV: [0.11, 0.09, 0.08, 0.07, 0.06],
    };

    const olderUsedRates = {
      EV: [0.08, 0.07, 0.06, 0.05, 0.04],
      PHEV: [0.07, 0.06, 0.05, 0.04, 0.03],
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

    // For PHEV, calculate fuel cost based on non-electric driving
    const nonElectricPercentage = 1 - this.finlandCosts.electricDrivingPercentage / 100;
    const kmOnFuel = this.finlandCosts.annualMileage * nonElectricPercentage;
    const litersUsed = (kmOnFuel / 100) * (vehicle.fuelConsumption || 0);

    return litersUsed * this.finlandCosts.gasolinePrice;
  }

  private calculateElectricityCost(vehicle: VehicleSpecs, year: number): number {
    let electricKm: number;

    if (vehicle.type === 'EV') {
      electricKm = this.finlandCosts.annualMileage;
    } else {
      // PHEV
      electricKm =
        this.finlandCosts.annualMileage *
        (this.finlandCosts.electricDrivingPercentage / 100);
    }

    const kwhUsed = (electricKm / 100) * vehicle.electricConsumption;
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
    const baseCost =
      vehicle.type === 'EV' ? this.MAINTENANCE_COST_EV : this.MAINTENANCE_COST_PHEV;

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
      // Current system (2024-2025): EVs pay €0, PHEVs pay based on CO2
      if (vehicle.type === 'EV') {
        return 0; // EVs currently exempt
      } else {
        // PHEV: CO2-based tax (typically 30-50 g/km)
        const co2Emissions = 40; // g/km average for PHEV
        return this.VEHICLE_TAX_BASE_2024 + co2Emissions * this.VEHICLE_TAX_CO2_RATE_2024;
      }
    } else {
      // New system from 2026: EVs pay mass-based tax, PHEVs continue CO2-based
      if (vehicle.type === 'EV') {
        // Mass-based calculation for EVs
        // Estimate vehicle mass based on battery capacity
        // Rough estimate: 1400kg base + 6kg per kWh of battery
        const estimatedMass = 1400 + (vehicle.batteryCapacity * 6);
        const massAboveThreshold = Math.max(0, estimatedMass - 1400);
        const massTax = (massAboveThreshold / 100) * this.VEHICLE_TAX_MASS_RATE_2026;
        
        return this.VEHICLE_TAX_BASE_2026 + massTax;
      } else {
        // PHEV: CO2-based tax with potentially higher rate
        const co2Emissions = 40; // g/km average for PHEV
        return this.VEHICLE_TAX_BASE_2026 + co2Emissions * this.VEHICLE_TAX_CO2_RATE_2026;
      }
    }
  }

  compareVehicles(vehicles: VehicleSpecs[]): void {
    console.log('\n=== TCO COMPARISON - FINNISH MARKET (5 YEARS) ===\n');
    console.log(`Annual Mileage: ${this.finlandCosts.annualMileage} km`);
    console.log(`Electricity Price: €${this.finlandCosts.electricityPricePerKwh}/kWh`);
    console.log(`Gasoline Price: €${this.finlandCosts.gasolinePrice}/liter`);
    console.log(`\n⚠️  NOTE: From 2026, EVs will pay vehicle tax based on mass (€3.70/100kg above 1400kg)`);
    console.log(`   PHEVs continue CO2-based taxation with potentially higher rates\n`);

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
      const condition = result.condition === 'new' ? '🆕' : '🔄';
      console.log(
        `${index + 1}. ${condition} ${result.vehicleName} (${result.type}, ${result.yearModel}): €${result.totalCost.toFixed(2)}${savings !== 0 ? ` (+€${Math.abs(savings).toFixed(2)} vs best)` : ' ⭐ BEST'}`
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
  }
}

export { EVTCOCalculator, VehicleSpecs, FinlandCosts, TCOResult };
