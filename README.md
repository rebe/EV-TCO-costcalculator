# EV & PHEV Total Cost of Ownership Calculator - Finland

A comprehensive TypeScript-based calculator for comparing the Total Cost of Ownership (TCO) of Electric Vehicles (EVs) and Plug-in Hybrid Electric Vehicles (PHEVs) in the Finnish market over a 5-year period.

## Features

- **Comprehensive TCO Analysis**: Calculates depreciation, fuel costs, electricity costs, insurance, maintenance, and vehicle tax
- **New & Used Vehicle Support**: Compares both new and used vehicles with age-adjusted depreciation rates
- **2026 Tax Reform Compliance**: Implements the new Finnish vehicle tax system for EVs (mass-based) starting in 2026
- **Real Finnish Market Data**: Uses actual 2025 electricity prices, fuel costs, and tax rates
- **Multiple Vehicle Comparison**: Compare up to 20+ vehicles side-by-side
- **Detailed Yearly Breakdown**: See costs broken down year-by-year for the 5-year ownership period

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Run the calculator with example vehicles:

\`\`\`bash
npm start
\`\`\`

Or use it in your own TypeScript project:

\`\`\`typescript
import { EVTCOCalculator, VehicleSpecs, FinlandCosts } from './tco-calculator';

const finlandCosts: FinlandCosts = {
  electricityPricePerKwh: 0.11, // EUR/kWh (6c energy + 5c transfer)
  gasolinePrice: 1.85, // EUR/liter
  annualMileage: 15000, // km
  electricDrivingPercentage: 70, // % for PHEV
};

const vehicle: VehicleSpecs = {
  name: 'Tesla Model Y Long Range',
  type: 'EV',
  purchasePrice: 55000,
  yearModel: 2024,
  currentMileage: 0,
  batteryCapacity: 75,
  electricRange: 533,
  electricConsumption: 16.9,
  insuranceClass: 20,
};

const calculator = new EVTCOCalculator(finlandCosts);
const result = calculator.calculateTCO(vehicle);
\`\`\`

## Finnish Market Parameters (2025)

- **Electricity Price**: €0.11/kWh (€0.06 energy + €0.05 transfer in Tampere)
- **Gasoline Price**: €1.85/liter
- **Vehicle Tax (2024-2025)**: 
  - EVs: €0 (exempt)
  - PHEVs: €53.29 + (CO2 g/km × €0.90)
- **Vehicle Tax (2026+)**:
  - EVs: €53.29 + (€3.70 per 100kg above 1,400kg)
  - PHEVs: €53.29 + (CO2 g/km × €1.10)

## Example Results

Based on actual calculations with 15,000 km annual mileage:

### Top 5 Best TCO (5-Year Total Cost)

1. 🔄 **Kia Niro PHEV (2019)**: €16,577.70 ⭐ BEST
   - Purchase: €22,000 | Mileage: 65,000 km
   - Net cost after resale: -€436.05 (you make money!)

2. 🔄 **Kia EV6 GT-Line (2021)**: €16,681.33
   - Purchase: €35,000 | Mileage: 48,000 km
   - Net cost after resale: -€8,990.77

3. 🔄 **Tesla Model 3 Long Range (2021)**: €17,532.18
   - Purchase: €38,000 | Mileage: 52,000 km
   - Net cost after resale: -€10,340.40

4. 🔄 **VW Passat GTE (2021)**: €18,448.14
   - Purchase: €28,000 | Mileage: 45,000 km
   - Net cost after resale: -€3,205.72

5. 🔄 **BMW 330e (2021)**: €20,406.69
   - Purchase: €35,000 | Mileage: 42,000 km
   - Net cost after resale: -€6,660.64

### Best New Car

🆕 **Volkswagen ID.4 Pro (2024)**: €25,707.73 total TCO
- Purchase: €48,000 | 0 km
- Net cost after resale: -€3,891.38

### Sample Detailed Breakdown: Tesla Model 3 Long Range (2021)

\`\`\`
======================================================================
Tesla Model 3 Long Range (EV) - 2021 Model
Condition: USED | Current Mileage: 52,000 km | Purchase Price: €38,000
======================================================================

Yearly Breakdown:
Year | Deprec. | Fuel | Electric | Insurance | Maint. | Tax | Total
--------------------------------------------------------------------------------
  1  | €  3040 | €   0 | €   341 | €    566 | €  520 | € 70 | €  4537
  2  | €  2447 | €   0 | €   341 | €    527 | €  544 | € 70 | €  3929
  3  | €  1951 | €   0 | €   341 | €    495 | €  568 | € 70 | €  3425
  4  | €  1528 | €   0 | €   341 | €    470 | €  592 | € 70 | €  3001
  5  | €  1161 | €   0 | €   341 | €    452 | €  616 | € 70 | €  2640
--------------------------------------------------------------------------------
Total 5-Year Cost: €17,532.18
Average Annual Cost: €3,506.44
Residual Value: €27,872.57
\`\`\`

## Key Insights

### Used vs New
- **Used EVs (2-3 years old)** typically offer the best value due to lower depreciation
- **New cars** depreciate 23-25% in the first year
- **Used cars (2-4 years)** depreciate only 9-12% per year
- **Older cars (5+ years)** depreciate 3-8% per year

### EV vs PHEV
- **EVs** have lower running costs (no fuel, less maintenance)
- **PHEVs** may have lower purchase prices but higher maintenance costs
- From 2026, EVs will pay €70-120/year in vehicle tax (mass-based)
- **PHEVs** continue paying CO2-based tax (€90-100/year typically)

### Premium vs Budget
- Premium EVs (BMW, Mercedes, Porsche) have higher insurance and depreciation
- Mid-range EVs (VW ID.4, Kia EV6) offer best balance
- Budget used PHEVs can have excellent TCO if well-maintained

## Cost Components Explained

### Depreciation
- Largest cost component for new cars
- Calculated using Finnish market data
- Age-adjusted rates for used vehicles

### Fuel & Electricity
- PHEV: 70% electric, 30% gasoline (configurable)
- EV: 100% electric
- Based on actual consumption figures

### Insurance
- Calculated as 1.5% of vehicle value
- Adjusted by insurance class (1-30)
- Decreases as vehicle depreciates

### Maintenance
- EV: €300/year base cost
- PHEV: €500/year base cost
- Increases 8% per year of vehicle age
- Additional €100/year for cars 5+ years old

### Vehicle Tax
- **2024-2025**: EVs exempt, PHEVs pay CO2-based
- **2026+**: EVs pay mass-based tax, PHEVs continue CO2-based with higher rates

## Supported Vehicles

The calculator includes examples of:
- **New Cars (2024)**: Toyota RAV4 PHEV, Tesla Model Y, VW ID.4, VW ID.7, BMW i4, Kia EV6, BMW iX, Mercedes EQE
- **Used Cars (2019-2022)**: VW Passat GTE, Tesla Model 3, BMW 330e, Audi e-tron, Kia Niro PHEV, Porsche Taycan, Volvo XC60 T8, Jaguar I-PACE, and more

## Project Structure

\`\`\`
ev-tco-calculator-finland/
├── src/
│   ├── tco-calculator.ts    # Main calculator logic
│   ├── example-usage.ts     # Example vehicles and usage
│   └── index.ts             # Entry point
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
\`\`\`

## Development

Build the project:

\`\`\`bash
npm run build
\`\`\`

Run in development mode:

\`\`\`bash
npm start
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Areas for improvement:
- Additional vehicle models
- More accurate insurance calculations
- Regional electricity price variations
- Battery degradation modeling
- Charging infrastructure costs

## License

MIT

## Disclaimer

This calculator provides estimates based on average Finnish market conditions. Actual costs may vary based on:
- Individual driving patterns
- Specific insurance quotes
- Regional electricity prices
- Vehicle condition and maintenance history
- Market fluctuations

Always consult with financial advisors and dealers for specific purchase decisions.

## References

- [Traficom - Finnish Vehicle Tax Information](https://www.traficom.fi/en/transport/road/vehicle-tax)
- Finnish electricity market data (2025)
- Vehicle depreciation data from Finnish used car markets
- Insurance class data from Finnish insurance companies

---

**Made with ❤️ for the Finnish EV community**
