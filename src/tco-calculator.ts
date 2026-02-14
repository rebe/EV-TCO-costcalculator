interface VehicleSpecs {
  name: string;
  type: 'PHEV' | 'EV';
  purchasePrice: number; // EUR
  batteryCapacity: number; // kWh
  electricRange: number; // km
  fuelConsumption?: number; // l/100km (for PHEV in hybrid mode)
  electricConsumption: number; // kWh/100km
  insuranceClass: number; // 1-30
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
  year1: YearlyBreakdown;
  year2: YearlyBreakdown;
  year3: YearlyBreakdown;
  year4: YearlyBreakdown;
  year5: YearlyBreakdown;
  totalCost: number;
  averageAnnualCost: number;
  residualValue: number;
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

  // Finnish market specific constants
  private readonly VEHICLE_TAX_BASE = 53.29; // EUR/year base
  private readonly VEHICLE_TAX_CO2_RATE = 0.9; // EUR per g/km CO2
  private readonly MAINTENANCE_COST_EV = 300; // EUR/year
  private readonly MAINTENANCE_COST_PHEV = 500; // EUR/year

  constructor(costs: FinlandCosts) {
    this.finlandCosts = costs;
  }

  calculateTCO(vehicle: VehicleSpecs): TCOResult {
    const yearlyBreakdowns: YearlyBreakdown[] = [];
    let remainingValue = vehicle.purchasePrice;

    for (let year = 1; year <= this.YEARS; year++) {
      const depreciation = this.calculateDepreciation(
        vehicle.purchasePrice,
        year,
        vehicle.type
      );
      remainingValue = vehicle.purchasePrice - this.calculateTotalDepreciation(
        vehicle.purchasePrice,
        year,
        vehicle.type
      );

      const fuelCost = this.calculateFuelCost(vehicle, year);
      const electricityCost = this.calculateElectricityCost(vehicle, year);
      const insurance = this.calculateInsurance(vehicle, remainingValue, year);
      const maintenance = this.calculateMaintenance(vehicle, year);
      const tax = this.calculateVehicleTax(vehicle);

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
      vehicle.type
    );

    return {
      vehicleName: vehicle.name,
      type: vehicle.type,
      year1: yearlyBreakdowns[0],
      year2: yearlyBreakdowns[1],
      year3: yearlyBreakdowns[2],
      year4: yearlyBreakdowns[3],
      year5: yearlyBreakdowns[4],
      totalCost,
      averageAnnualCost: totalCost / this.YEARS,
      residualValue,
    };
  }

  private calculateDepreciation(
    purchasePrice: number,
    year: number,
    type: 'PHEV' | 'EV'
  ): number {
    // Depreciation rates for Finnish market
    // EVs tend to depreciate slightly faster due to battery concerns
    const depreciationRates = {
      EV: [0.25, 0.15, 0.12, 0.10, 0.08], // Year 1-5
      PHEV: [0.23, 0.14, 0.11, 0.09, 0.07],
    };

    const rate = depreciationRates[type][year - 1];
    const previousDepreciation = this.calculateTotalDepreciation(
      purchasePrice,
      year - 1,
      type
    );
    const remainingValue = purchasePrice - previousDepreciation;

    return remainingValue * rate;
  }

  private calculateTotalDepreciation(
    purchasePrice: number,
    upToYear: number,
    type: 'PHEV' | 'EV'
  ): number {
    let totalDepreciation = 0;
    let remainingValue = purchasePrice;

    const depreciationRates = {
      EV: [0.25, 0.15, 0.12, 0.10, 0.08],
      PHEV: [0.23, 0.14, 0.11, 0.09, 0.07],
    };

    for (let year = 0; year < upToYear; year++) {
      const depreciation = remainingValue * depreciationRates[type][year];
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

  private calculateMaintenance(vehicle: VehicleSpecs, year: number): number {
    const baseCost =
      vehicle.type === 'EV' ? this.MAINTENANCE_COST_EV : this.MAINTENANCE_COST_PHEV;

    // Maintenance costs increase slightly with age
    const ageMultiplier = 1 + (year - 1) * 0.1;

    return baseCost * ageMultiplier;
  }

  private calculateVehicleTax(vehicle: VehicleSpecs): number {
    // EVs have 0 g/km CO2, PHEVs typically 30-50 g/km
    const co2Emissions = vehicle.type === 'EV' ? 0 : 40; // g/km average for PHEV

    return this.VEHICLE_TAX_BASE + co2Emissions * this.VEHICLE_TAX_CO2_RATE;
  }

  compareVehicles(vehicles: VehicleSpecs[]): void {
    console.log('\n=== TCO COMPARISON - FINNISH MARKET (5 YEARS) ===\n');
    console.log(`Annual Mileage: ${this.finlandCosts.annualMileage} km`);
    console.log(`Electricity Price: €${this.finlandCosts.electricityPricePerKwh}/kWh`);
    console.log(`Gasoline Price: €${this.finlandCosts.gasolinePrice}/liter\n`);

    const results = vehicles.map((vehicle) => this.calculateTCO(vehicle));

    results.forEach((result) => {
      this.printVehicleResult(result);
    });

    this.printComparison(results);
  }

  private printVehicleResult(result: TCOResult): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${result.vehicleName} (${result.type})`);
    console.log('='.repeat(60));

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
    console.log('\n\n' + '='.repeat(60));
    console.log('SUMMARY COMPARISON');
    console.log('='.repeat(60));

    results.sort((a, b) => a.totalCost - b.totalCost);

    console.log('\nRanked by Total Cost of Ownership:');
    results.forEach((result, index) => {
      const savings =
        index > 0 ? results[0].totalCost - result.totalCost : 0;
      console.log(
        `${index + 1}. ${result.vehicleName} (${result.type}): €${result.totalCost.toFixed(2)}${savings !== 0 ? ` (€${Math.abs(savings).toFixed(2)} ${savings > 0 ? 'cheaper' : 'more expensive'})` : ' (BEST)'}`
      );
    });

    console.log('\nNet Cost (Purchase - Residual Value):');
    results.forEach((result) => {
      const netCost = result.totalCost - result.residualValue;
      console.log(
        `${result.vehicleName}: €${netCost.toFixed(2)} (Residual: €${result.residualValue.toFixed(2)})`
      );
    });
  }
}

export { EVTCOCalculator, VehicleSpecs, FinlandCosts, TCOResult };
