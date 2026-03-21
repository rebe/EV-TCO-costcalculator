# EV & PHEV Total Cost of Ownership Calculator - Finland

A comprehensive TypeScript-based calculator for comparing the Total Cost of Ownership (TCO) of Electric Vehicles (EVs), Plug-in Hybrid Electric Vehicles (PHEVs), and Internal Combustion Engine (ICE) vehicles in the Finnish market over a 5-year period.

## Features

- **Comprehensive TCO Analysis**: Calculates depreciation, fuel costs, electricity costs, insurance, maintenance, vehicle tax, **and capital financing**.
- **Financial Opportunity Cost**: Calculates loan interest for bought cars and investment yield (compounding interest) for unused initial capital.
- **Leasing vs Buying**: Incorporates private leasing configurations to effectively compare leasing against traditional vehicle purchases.
- **Multi-Vehicle Type Support**: Compare EVs, PHEVs, and ICE vehicles side-by-side
- **New & Used Vehicle Support**: Compares both new and used vehicles with age-adjusted depreciation rates
- **2026 Tax Reform Compliance**: Implements the new Finnish vehicle tax system for EVs (mass-based) starting in 2026
- **Real-World Consumption Factors**: Applies realistic consumption multipliers based on Finnish winter conditions
- **Real Finnish Market Data**: Uses actual 2025 electricity prices, fuel costs, and tax rates
- **Multiple Vehicle Comparison**: Compare 30+ vehicles across all categories
- **Detailed Yearly Breakdown**: See costs broken down year-by-year for the 5-year ownership period
- **Modular Vehicle Database**: Separate data files for EVs, PHEVs, and ICE vehicles

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
  annualMileage: 20000, // km
  electricDrivingPercentage: 40, // % for PHEV (0 for ICE)
  realWorldElectricConsumptionFactor: 1.22, // 22% higher than WLTP
  initialCash: 20000, // EUR available from old car
  loanInterestRate: 0.06, // 6.0% APR
  investmentReturnRate: 0.04, // 4.0% return on invested cash
  loanTermYears: 5,
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
  - ICE: €53.29 + (CO2 g/km × €0.90)
- **Vehicle Tax (2026+)**:
  - EVs: €53.29 + (€3.70 per 100kg above 1,400kg)
  - PHEVs/ICE: €53.29 + (CO2 g/km × €1.10)

## Real-World Consumption Factors

The calculator applies realistic consumption multipliers based on actual user data and Finnish winter conditions:

- **EVs**: 22% higher than WLTP (1.22x multiplier)
  - Accounts for winter heating, battery efficiency loss in cold weather
  - Based on data from Finnish EV forums and Spritmonitor.de
  
- **PHEVs**: 25% higher than WLTP (1.25x multiplier)
  - Electric mode consumption affected by cold weather
  - Often driven more aggressively than pure EVs
  
- **ICE**: 15% higher than WLTP (1.15x multiplier)
  - Modern engines closer to WLTP but still optimistic
  - Real-world driving conditions and winter fuel consumption

You can override these with vehicle-specific factors using the \`realWorldConsumptionFactor\` property.

## Example Results

**📊 [View Full Comparison Results](results/COMPARE.md)**

The full comparison includes 30+ vehicles across all categories with detailed yearly breakdowns and cost analysis.

## How calculations work?

** [Explain the calculations results](results/HOW_IT_WORKS.md)**

### Quick Summary (20,000 km/year)

**Top 5 Best TCO (5-Year Total Cost):**

1. 🔄 ⛽ **Toyota Yaris Hybrid (2019)**: €19,156.96 ⭐ BEST
2. 🔄 ⚡ **Kia EV6 GT-Line (2021)**: €19,840.38
3. 🔄 ⚡ **Polestar 2 Long Range (2020)**: €20,245.42
4. 🔄 ⚡ **Tesla Model 3 Long Range (2021)**: €21,193.76
5. 🔄 ⛽ **Toyota Corolla Hybrid (2021)**: €22,459.24

**Best by Category:**
- ⚡ **Best EV**: Kia EV6 GT-Line (2021) - €19,840.38
- 🔌 **Best PHEV**: Kia Niro PHEV (2019) - €22,531.80
- ⛽ **Best ICE**: Toyota Yaris Hybrid (2019) - €19,156.96

[See detailed breakdown in results/COMPARE.md](results/COMPARE.md)

## Key Insights

### Used vs New
- **Used EVs (2-3 years old)** typically offer the best value due to lower depreciation
- **New cars** depreciate 20-25% in the first year
- **Used cars (2-4 years)** depreciate only 8-12% per year
- **Older cars (5+ years)** depreciate 3-7% per year

### EV vs PHEV vs ICE
- **EVs** have lowest running costs (no fuel, minimal maintenance)
- **PHEVs** offer flexibility but higher maintenance than EVs
- **ICE** vehicles have highest fuel and maintenance costs
- From 2026, EVs will pay €70-120/year in vehicle tax (mass-based)
- **PHEVs/ICE** continue paying CO2-based tax (€90-220/year typically)

### Premium vs Budget
- Premium EVs (BMW, Mercedes, Porsche) have higher insurance and depreciation
- Mid-range EVs (VW ID.4, Kia EV6, Hyundai Ioniq 6) offer best balance
- Budget used PHEVs can have excellent TCO if well-maintained
- Small hybrid ICE cars (Toyota Yaris, Corolla) are most economical in ICE category

## Cost Components Explained

### Depreciation
- Largest cost component for new cars
- Calculated using Finnish market data
- Age-adjusted rates for used vehicles
- EVs depreciate faster initially but stabilize
- ICE vehicles have more predictable depreciation

### Fuel & Electricity
- **EV**: 100% electric (with real-world consumption factor)
- **PHEV**: Configurable split (default 70% electric, 30% gasoline)
- **ICE**: 100% gasoline/diesel (with real-world consumption factor)
- Based on actual consumption figures with Finnish winter adjustments

### Insurance
- Calculated as 1.5% of vehicle value
- Adjusted by insurance class (1-30)
- Decreases as vehicle depreciates
- Premium vehicles have higher insurance costs

### Maintenance
- **EV**: €300/year base cost (no oil changes, fewer parts)
- **PHEV**: €500/year base cost (dual powertrain complexity)
- **ICE**: €700/year base cost (oil changes, more wear items)
- Increases 8% per year of vehicle age
- Additional €100/year for cars 5+ years old
- Zero if a private lease contract includes maintenance

### Financing & Opportunity Cost
- **Initial Cash**: Split across down payment and capital investment.
- **Loan**: Any required loan amount is amortized at the specific `loanInterestRate`.
- **Investment Return**: Any unused `initialCash` generates an annual compounding return (`investmentReturnRate`), rewarding options that tie up less initial capital such as vehicle leasing.

### Vehicle Tax
- **2024-2025**: EVs exempt, PHEVs/ICE pay CO2-based
- **2026+**: EVs pay mass-based tax, PHEVs/ICE continue CO2-based with higher rates

## Supported Vehicles

The calculator includes examples of:

### Electric Vehicles (EVs)
- **New (2024)**: Tesla Model Y, VW ID.4, VW ID.7, BMW i4, Kia EV6, BMW iX, Mercedes EQE, Hyundai Ioniq 6
- **Used (2019-2022)**: Tesla Model 3, Audi e-tron, Kia EV6, Porsche Taycan, Jaguar I-PACE

### Plug-in Hybrids (PHEVs)
- **New (2024)**: Toyota RAV4 PHEV, Volvo XC60 T8, BMW 330e, Mercedes GLE 350 de
- **Used (2019-2021)**: VW Passat GTE, BMW 330e, Volvo XC60 T8, Mitsubishi Outlander PHEV, Kia Niro PHEV, BMW X5 xDrive45e

### Internal Combustion (ICE)
- **New (2024)**: Toyota RAV4 Hybrid, VW Tiguan TDI, BMW 320d, Mazda CX-60, Skoda Octavia TDI
- **Used (2018-2021)**: Toyota Corolla Hybrid, VW Golf, BMW 320d, Skoda Octavia, Toyota Yaris Hybrid, Mazda 3, VW Passat

## Project Structure

\`\`\`
ev-tco-calculator-finland/
├── src/
│   ├── data/
│   │   ├── ev-vehicles.ts       # Electric vehicle database
│   │   ├── phev-vehicles.ts     # Plug-in hybrid database
│   │   ├── ice-vehicles.ts      # ICE vehicle database
│   │   └── index.ts             # Data exports
│   ├── tco-calculator.ts        # Main calculator logic
│   ├── example-usage.ts         # Example usage with all vehicles
│   └── index.ts                 # Entry point
├── results/
│   └── COMPARE.md               # Full comparison results
├── package.json
├── tsconfig.json
├── generate-readme.sh
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
npm start'
or to file:
npm start -- --markdown > results/COMPARE.md
\`\`\`

## Adding Your Own Vehicles

You can easily add vehicles to the appropriate data file:

\`\`\`typescript
// src/data/ev-vehicles.ts
export const evVehicles: VehicleSpecs[] = [
  {
    name: 'Your EV Model',
    type: 'EV',
    purchasePrice: 45000,
    yearModel: 2024,
    currentMileage: 0,
    batteryCapacity: 75,
    electricRange: 500,
    electricConsumption: 17.0,
    insuranceClass: 18,
    realWorldConsumptionFactor: 1.22, // Optional: override default
  },
  // ... more vehicles
];
\`\`\`

Or create custom comparisons:

\`\`\`typescript
import { EVTCOCalculator } from './tco-calculator';
import { evVehicles, phevVehicles, iceVehicles } from './data';

// Compare only budget options
const budgetVehicles = [
  ...evVehicles.filter(v => v.purchasePrice < 40000),
  ...phevVehicles.filter(v => v.purchasePrice < 35000),
  ...iceVehicles.filter(v => v.purchasePrice < 25000),
];

calculator.compareVehicles(budgetVehicles);
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Areas for improvement:
- Additional vehicle models and data
- More accurate insurance calculations
- Regional electricity price variations
- Battery degradation modeling
- Charging infrastructure costs
- Import vehicle data from CSV/JSON
- Web interface for the calculator

## License

MIT

## Disclaimer

This calculator provides estimates based on average Finnish market conditions. Actual costs may vary based on:
- Individual driving patterns
- Specific insurance quotes
- Regional electricity prices
- Vehicle condition and maintenance history
- Market fluctuations
- Actual real-world consumption (varies by driver and conditions)

Always consult with financial advisors and dealers for specific purchase decisions.

## References

- [Traficom - Finnish Vehicle Tax Information](https://www.traficom.fi/en/transport/road/vehicle-tax)
- Finnish electricity market data (2025)
- Vehicle depreciation data from Finnish used car markets
- Insurance class data from Finnish insurance companies
- Real-world consumption data from Spritmonitor.de and Finnish EV forums
- WLTP consumption figures from manufacturer specifications

---

**Made with ❤️ for the Finnish EV community**
