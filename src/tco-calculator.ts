interface VehicleSpecs {
  name: string;
  type: 'PHEV' | 'EV' | 'ICE';
  purchasePrice: number;
  yearModel: number;
  currentMileage: number;
  batteryCapacity: number;
  electricRange: number;
  fuelConsumption?: number;
  electricConsumption: number;
  insuranceClass: number;
  condition?: 'new' | 'used';
  realWorldConsumptionFactor?: number;
  leasing?: LeaseConfig;
}

interface LeaseConfig {
  monthlyPayment: number;
  downPayment?: number;
  durationMonths: number;
  includesMaintenance: boolean;
  includesInsurance: boolean;
  includesTax: boolean;
}

interface FinlandCosts {
  electricityPricePerKwh: number;
  gasolinePrice: number;
  annualMileage: number;
  electricDrivingPercentage: number;
  realWorldElectricConsumptionFactor: number;
  initialCash: number;
  loanInterestRate: number;
  investmentReturnRate: number;
  loanTermYears: number;
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
  financing: number;
  total: number;
}

type OutputFormat = 'console' | 'markdown';

class EVTCOCalculator {
  private readonly YEARS = 5;
  private readonly finlandCosts: FinlandCosts;
  private readonly currentYear: number;
  private outputFormat: OutputFormat = 'console';

  private readonly VEHICLE_TAX_BASE_2024 = 53.29;
  private readonly VEHICLE_TAX_CO2_RATE_2024 = 0.9;
  private readonly VEHICLE_TAX_BASE_2026 = 53.29;
  private readonly VEHICLE_TAX_MASS_RATE_2026 = 3.70;
  private readonly VEHICLE_TAX_CO2_RATE_2026 = 1.1;

  private readonly MAINTENANCE_COST_EV = 300;
  private readonly MAINTENANCE_COST_PHEV = 500;
  private readonly MAINTENANCE_COST_ICE = 700;

  private readonly DEFAULT_CONSUMPTION_FACTORS = {
    EV: 1.22,
    PHEV: 1.25,
    ICE: 1.15,
  };

  constructor(costs: FinlandCosts) {
    this.finlandCosts = costs;
    this.currentYear = new Date().getFullYear();
  }

  setOutputFormat(format: OutputFormat): void {
    this.outputFormat = format;
  }

  calculateTCO(vehicle: VehicleSpecs): TCOResult {
    const yearlyBreakdowns: YearlyBreakdown[] = [];
    const vehicleAge = this.currentYear - vehicle.yearModel;
    const condition = vehicleAge === 0 ? 'new' : 'used';
    let remainingValue = vehicle.purchasePrice;

    const isLeased = !!vehicle.leasing;
    const leaseAnnualCost = isLeased ? ((vehicle.leasing!.monthlyPayment * 12) + ((vehicle.leasing!.downPayment || 0) / (vehicle.leasing!.durationMonths / 12))) : 0;

    let totalLoanAmount = 0;
    let investedCash = 0;
    let remainingLoanPrincipal = 0;

    if (isLeased) {
      const cashUsed = vehicle.leasing!.downPayment || 0;
      investedCash = Math.max(0, this.finlandCosts.initialCash - cashUsed);
    } else {
      const cashUsed = Math.min(this.finlandCosts.initialCash, vehicle.purchasePrice);
      totalLoanAmount = Math.max(0, vehicle.purchasePrice - this.finlandCosts.initialCash);
      remainingLoanPrincipal = totalLoanAmount;
      investedCash = Math.max(0, this.finlandCosts.initialCash - vehicle.purchasePrice);
    }
    
    // Calculate annual principal payment if there's a loan
    const annualPrincipalPayment = totalLoanAmount > 0 ? totalLoanAmount / this.finlandCosts.loanTermYears : 0;

    for (let year = 1; year <= this.YEARS; year++) {
      let depreciation = 0;
      let financing = 0;

      if (isLeased) {
        depreciation = leaseAnnualCost;
        // Investment yield is a negative cost (savings)
        financing = -(investedCash * this.finlandCosts.investmentReturnRate);
        // Compounding investment for next year:
        investedCash *= (1 + this.finlandCosts.investmentReturnRate);
      } else {
        depreciation = this.calculateDepreciation(
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

        // Calculate loan interest on current principal
        let loanInterest = 0;
        if (remainingLoanPrincipal > 0 && year <= this.finlandCosts.loanTermYears) {
          loanInterest = remainingLoanPrincipal * this.finlandCosts.loanInterestRate;
          remainingLoanPrincipal -= annualPrincipalPayment;
        }

        // Investment yield
        const investmentReturn = investedCash * this.finlandCosts.investmentReturnRate;
        financing = loanInterest - investmentReturn;

        // Compounding investment for next year
        investedCash *= (1 + this.finlandCosts.investmentReturnRate);
      }

      const fuelCost = this.calculateFuelCost(vehicle, year);
      const electricityCost = this.calculateElectricityCost(vehicle, year);
      const insurance = (isLeased && vehicle.leasing!.includesInsurance) ? 0 : this.calculateInsurance(vehicle, isLeased ? vehicle.purchasePrice : remainingValue, year);
      const maintenance = (isLeased && vehicle.leasing!.includesMaintenance) ? 0 : this.calculateMaintenance(vehicle, year, vehicleAge);
      const tax = (isLeased && vehicle.leasing!.includesTax) ? 0 : this.calculateVehicleTax(vehicle, year);

      yearlyBreakdowns.push({
        depreciation,
        fuelCost,
        electricityCost,
        insurance,
        maintenance,
        tax,
        financing,
        total: depreciation + fuelCost + electricityCost + insurance + maintenance + tax + financing,
      });
    }

    const totalCost = yearlyBreakdowns.reduce((sum, year) => sum + year.total, 0);
    const residualValue = isLeased ? 0 : vehicle.purchasePrice - this.calculateTotalDepreciation(
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
      kmOnFuel = this.finlandCosts.annualMileage;
    } else {
      const nonElectricPercentage = 1 - this.finlandCosts.electricDrivingPercentage / 100;
      kmOnFuel = this.finlandCosts.annualMileage * nonElectricPercentage;
    }

    const consumptionFactor = vehicle.type === 'ICE'
      ? this.DEFAULT_CONSUMPTION_FACTORS.ICE
      : 1.0;

    const litersUsed = (kmOnFuel / 100) * (vehicle.fuelConsumption || 0) * consumptionFactor;

    return litersUsed * this.finlandCosts.gasolinePrice;
  }

  private calculateElectricityCost(vehicle: VehicleSpecs, year: number): number {
    if (vehicle.type === 'ICE') return 0;

    let electricKm: number;

    if (vehicle.type === 'EV') {
      electricKm = this.finlandCosts.annualMileage;
    } else {
      electricKm =
        this.finlandCosts.annualMileage *
        (this.finlandCosts.electricDrivingPercentage / 100);
    }

    const consumptionFactor = vehicle.realWorldConsumptionFactor !== undefined
      ? vehicle.realWorldConsumptionFactor
      : (vehicle.type === 'EV'
          ? this.DEFAULT_CONSUMPTION_FACTORS.EV
          : this.DEFAULT_CONSUMPTION_FACTORS.PHEV);

    const realWorldConsumption = vehicle.electricConsumption * consumptionFactor;
    const kwhUsed = (electricKm / 100) * realWorldConsumption;

    return kwhUsed * this.finlandCosts.electricityPricePerKwh;
  }

  private calculateInsurance(
    vehicle: VehicleSpecs,
    currentValue: number,
    year: number
  ): number {
    const baseRate = 0.015;
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

    const totalAge = currentAge + year;
    const ageMultiplier = 1 + (totalAge - 1) * 0.08;
    const oldCarSurcharge = totalAge >= 5 ? 100 : 0;

    return baseCost * ageMultiplier + oldCarSurcharge;
  }

  private calculateVehicleTax(vehicle: VehicleSpecs, ownershipYear: number): number {
    const calendarYear = this.currentYear + ownershipYear;

    if (calendarYear < 2026) {
      if (vehicle.type === 'EV') {
        return 0;
      } else {
        const co2Emissions = vehicle.type === 'PHEV' ? 40 : 150;
        return this.VEHICLE_TAX_BASE_2024 + co2Emissions * this.VEHICLE_TAX_CO2_RATE_2024;
      }
    } else {
      if (vehicle.type === 'EV') {
        const estimatedMass = 1400 + (vehicle.batteryCapacity * 6);
        const massAboveThreshold = Math.max(0, estimatedMass - 1400);
        const massTax = (massAboveThreshold / 100) * this.VEHICLE_TAX_MASS_RATE_2026;

        return this.VEHICLE_TAX_BASE_2026 + massTax;
      } else {
        const co2Emissions = vehicle.type === 'PHEV' ? 40 : 150;
        return this.VEHICLE_TAX_BASE_2026 + co2Emissions * this.VEHICLE_TAX_CO2_RATE_2026;
      }
    }
  }

  compareVehicles(vehicles: VehicleSpecs[]): void {
    if (this.outputFormat === 'markdown') {
      this.compareVehiclesMarkdown(vehicles);
    } else {
      this.compareVehiclesConsole(vehicles);
    }
  }

  private compareVehiclesConsole(vehicles: VehicleSpecs[]): void {
    console.log('\n=== TCO COMPARISON - FINNISH MARKET (5 YEARS) ===\n');
    console.log(`Annual Mileage: ${this.finlandCosts.annualMileage} km`);
    console.log(`Electricity Price: €${this.finlandCosts.electricityPricePerKwh}/kWh`);
    console.log(`Gasoline Price: €${this.finlandCosts.gasolinePrice}/liter`);
    console.log(`Initial Cash: €${this.finlandCosts.initialCash.toLocaleString()}`);
    console.log(`Loan Interest Rate: ${(this.finlandCosts.loanInterestRate * 100).toFixed(1)}% (over ${this.finlandCosts.loanTermYears} years)`);
    console.log(`Investment Return Rate: ${(this.finlandCosts.investmentReturnRate * 100).toFixed(1)}%`);
    console.log(`\n⚠️  NOTE: Real-world consumption factors applied:`);
    console.log(`   - EVs: ${(this.DEFAULT_CONSUMPTION_FACTORS.EV * 100 - 100).toFixed(0)}% higher than WLTP (Finnish winter conditions)`);
    console.log(`   - PHEVs: ${(this.DEFAULT_CONSUMPTION_FACTORS.PHEV * 100 - 100).toFixed(0)}% higher than WLTP`);
    console.log(`   - ICE: ${(this.DEFAULT_CONSUMPTION_FACTORS.ICE * 100 - 100).toFixed(0)}% higher than WLTP`);
    console.log(`\n⚠️  NOTE: From 2026, EVs will pay vehicle tax based on mass (€3.70/100kg above 1400kg)`);
    console.log(`   PHEVs/ICE continue CO2-based taxation with potentially higher rates\n`);

    const results = vehicles.map((vehicle) => this.calculateTCO(vehicle));

    results.forEach((result) => {
      this.printVehicleResultConsole(result);
    });

    this.printComparisonConsole(results);
  }

  private compareVehiclesMarkdown(vehicles: VehicleSpecs[]): void {
    console.log('# TCO Comparison - Finnish Market (5 Years)\n');
    console.log('## Parameters\n');
    console.log(`- **Annual Mileage**: ${this.finlandCosts.annualMileage.toLocaleString()} km`);
    console.log(`- **Electricity Price**: €${this.finlandCosts.electricityPricePerKwh}/kWh`);
    console.log(`- **Gasoline Price**: €${this.finlandCosts.gasolinePrice}/liter`);
    console.log(`- **Initial Cash**: €${this.finlandCosts.initialCash.toLocaleString()}`);
    console.log(`- **Loan Interest Rate**: ${(this.finlandCosts.loanInterestRate * 100).toFixed(1)}% (over ${this.finlandCosts.loanTermYears} years)`);
    console.log(`- **Investment Return Rate**: ${(this.finlandCosts.investmentReturnRate * 100).toFixed(1)}%`);
    console.log(`- **PHEV Electric Driving**: ${this.finlandCosts.electricDrivingPercentage}%\n`);

    console.log('## Real-World Consumption Factors\n');
    console.log(`- **EVs**: ${(this.DEFAULT_CONSUMPTION_FACTORS.EV * 100 - 100).toFixed(0)}% higher than WLTP (Finnish winter conditions)`);
    console.log(`- **PHEVs**: ${(this.DEFAULT_CONSUMPTION_FACTORS.PHEV * 100 - 100).toFixed(0)}% higher than WLTP`);
    console.log(`- **ICE**: ${(this.DEFAULT_CONSUMPTION_FACTORS.ICE * 100 - 100).toFixed(0)}% higher than WLTP\n`);

    console.log('> **Note**: From 2026, EVs will pay vehicle tax based on mass (€3.70/100kg above 1400kg). PHEVs/ICE continue CO2-based taxation with potentially higher rates.\n');

    const results = vehicles.map((vehicle) => this.calculateTCO(vehicle));

    console.log('---\n');
    console.log('## Vehicle Comparisons\n');

    results.forEach((result, index) => {
      this.printVehicleResultMarkdown(result, index + 1);
    });

    this.printComparisonMarkdown(results);
  }

  private printVehicleResultConsole(result: TCOResult): void {
    const isLeased = result.residualValue === 0 && result.year1.depreciation > 0 && result.purchasePrice > 0; // Simple heuristic, or we ideally pass 'isLeased' down
    const leaseText = isLeased ? ' [📝 LEASED]' : '';

    console.log(`\n${'='.repeat(70)}`);
    console.log(`${result.vehicleName} (${result.type}) - ${result.yearModel} Model${leaseText}`);
    console.log(`Condition: ${result.condition.toUpperCase()} | Current Mileage: ${result.currentMileage.toLocaleString()} km | ${isLeased ? 'List' : 'Purchase'} Price: €${result.purchasePrice.toLocaleString()}`);
    console.log('='.repeat(70));

    console.log('\nYearly Breakdown:');
    console.log(
      'Year | Deprec. | Fuel | Electric | Insurance | Maint. | Tax | Financ. | Total'
    );
    console.log('-'.repeat(88));

    [result.year1, result.year2, result.year3, result.year4, result.year5].forEach(
      (year, index) => {
        console.log(
          `  ${index + 1}  | €${year.depreciation.toFixed(0).padStart(6)} | €${year.fuelCost.toFixed(0).padStart(4)} | €${year.electricityCost.toFixed(0).padStart(6)} | €${year.insurance.toFixed(0).padStart(7)} | €${year.maintenance.toFixed(0).padStart(5)} | €${year.tax.toFixed(0).padStart(3)} | €${year.financing.toFixed(0).padStart(6)} | €${year.total.toFixed(0).padStart(6)}`
        );
      }
    );

    console.log('-'.repeat(88));
    console.log(`Total 5-Year Cost: €${result.totalCost.toFixed(2)}`);
    console.log(`Average Annual Cost: €${result.averageAnnualCost.toFixed(2)}`);
    if (!isLeased) {
      console.log(`Residual Value: €${result.residualValue.toFixed(2)}`);
      console.log(`Net Cost (after resale): €${(result.totalCost - result.residualValue).toFixed(2)}`);
    } else {
      console.log(`Residual Value: N/A (Returned at end of lease)`);
    }
  }

  private printVehicleResultMarkdown(result: TCOResult, index: number): void {
    const isLeased = result.residualValue === 0 && result.year1.depreciation > 0 && result.purchasePrice > 0;
    const typeEmoji = result.type === 'EV' ? '⚡' : result.type === 'PHEV' ? '🔌' : '⛽';
    const conditionEmoji = result.condition === 'new' ? '🆕' : '🔄';
    const leaseTag = isLeased ? ' 📝 **[LEASED]**' : '';

    console.log(`### ${index}. ${conditionEmoji} ${typeEmoji} ${result.vehicleName} (${result.yearModel})${leaseTag}\n`);
    console.log(`**Type**: ${result.type} | **Condition**: ${result.condition} | **Mileage**: ${result.currentMileage.toLocaleString()} km | **${isLeased ? 'List' : 'Purchase'} Price**: €${result.purchasePrice.toLocaleString()}\n`);

    console.log('| Year | Depreciation | Fuel | Electricity | Insurance | Maintenance | Tax | Financing | **Total** |');
    console.log('|------|--------------|------|-------------|-----------|-------------|-----|-----------|-----------|');

    [result.year1, result.year2, result.year3, result.year4, result.year5].forEach(
      (year, idx) => {
        console.log(
          `| ${idx + 1} | €${year.depreciation.toFixed(0)} | €${year.fuelCost.toFixed(0)} | €${year.electricityCost.toFixed(0)} | €${year.insurance.toFixed(0)} | €${year.maintenance.toFixed(0)} | €${year.tax.toFixed(0)} | €${year.financing.toFixed(0)} | **€${year.total.toFixed(0)}** |`
        );
      }
    );

    console.log('');
    console.log(`**5-Year Summary:**`);
    console.log(`- Total Cost: **€${result.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}**`);
    console.log(`- Average Annual Cost: €${result.averageAnnualCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    
    if (!isLeased) {
      console.log(`- Residual Value: €${result.residualValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
      console.log(`- Net Cost (after resale): €${(result.totalCost - result.residualValue).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`);
    } else {
      console.log(`- Residual Value: N/A (Returned at end of lease)\n`);
    }
  }

  private printComparisonConsole(results: TCOResult[]): void {
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
      const isLeased = result.residualValue === 0 && result.purchasePrice > 0;
      console.log(
        `${result.vehicleName} (${result.yearModel}): €${netCost.toFixed(2)}${isLeased ? ' (Returned)' : ` (Residual: €${result.residualValue.toFixed(2)})`}`
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

  private printComparisonMarkdown(results: TCOResult[]): void {
    console.log('---\n');
    console.log('## Summary Rankings\n');

    results.sort((a, b) => a.totalCost - b.totalCost);

    console.log('### Ranked by Total Cost of Ownership\n');
    console.log('| Rank | Vehicle | Type | Year | Condition | Total Cost | vs Best |');
    console.log('|------|---------|------|------|-----------|------------|---------|');

    results.forEach((result, index) => {
      const savings = index > 0 ? result.totalCost - results[0].totalCost : 0;
      const emoji = result.condition === 'new' ? '🆕' : '🔄';
      const typeEmoji = result.type === 'EV' ? '⚡' : result.type === 'PHEV' ? '🔌' : '⛽';
      const savingsText = savings !== 0 ? `+€${savings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '⭐ BEST';

      console.log(
        `| ${index + 1} | ${emoji} ${typeEmoji} ${result.vehicleName} | ${result.type} | ${result.yearModel} | ${result.condition} | €${result.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} | ${savingsText} |`
      );
    });

    console.log('\n### Net Cost After Resale\n');
    console.log('| Vehicle | Year | Total Cost | Residual Value | Net Cost |');
    console.log('|---------|------|------------|----------------|----------|');

    results.forEach((result) => {
      const netCost = result.totalCost - result.residualValue;
      const isLeased = result.residualValue === 0 && result.purchasePrice > 0;
      console.log(
        `| ${result.vehicleName} | ${result.yearModel} | €${result.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} | ${isLeased ? 'Returned' : `€${result.residualValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} | €${netCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} |`
      );
    });

    console.log('\n### Best by Category\n');

    const newCars = results.filter(r => r.condition === 'new');
    const usedCars = results.filter(r => r.condition === 'used');

    if (newCars.length > 0) {
      const bestNew = newCars[0];
      console.log(`**🆕 Best New Car:**  `);
      console.log(`${bestNew.vehicleName} (${bestNew.yearModel}) - €${bestNew.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`);
    }

    if (usedCars.length > 0) {
      const bestUsed = usedCars[0];
      console.log(`**🔄 Best Used Car:**  `);
      console.log(`${bestUsed.vehicleName} (${bestUsed.yearModel}) - €${bestUsed.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`);
    }

    const evs = results.filter(r => r.type === 'EV');
    const phevs = results.filter(r => r.type === 'PHEV');
    const ices = results.filter(r => r.type === 'ICE');

    console.log('**By Vehicle Type:**\n');
    if (evs.length > 0) {
      console.log(`- ⚡ **Best EV**: ${evs[0].vehicleName} (${evs[0].yearModel}) - €${evs[0].totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    }
    if (phevs.length > 0) {
      console.log(`- 🔌 **Best PHEV**: ${phevs[0].vehicleName} (${phevs[0].yearModel}) - €${phevs[0].totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    }
    if (ices.length > 0) {
      console.log(`- ⛽ **Best ICE**: ${ices[0].vehicleName} (${ices[0].yearModel}) - €${ices[0].totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    }

    console.log('\n---\n');
    console.log('*Generated by EV TCO Calculator - Finland*');
  }
}

export { EVTCOCalculator, VehicleSpecs, FinlandCosts, TCOResult };
