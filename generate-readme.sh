#!/bin/bash

# 1. Regenerate README.md
cat > README.md << 'EOF'
# EV & PHEV Total Cost of Ownership Calculator - Finland

A comprehensive TypeScript-based calculator for comparing the Total Cost of Ownership (TCO) of Electric Vehicles (EVs), Plug-in Hybrid Electric Vehicles (PHEVs), and Internal Combustion Engine (ICE) vehicles in the Finnish market over a 5-year period.

---

### 📌 Quick Navigation & Documentation Links

- 📊 **[Full 5-Year Vehicle TCO Comparison Results](results/COMPARE.md)** (Detailed breakdown of 53+ vehicles, yearly costs & rankings)
- 🧮 **[How Calculations & Financial Opportunity Cost Work](results/HOW_IT_WORKS.md)** (Explains depreciation math, negative net cost, and buying vs leasing calculations)
- 📝 **[Walkthrough of 2026-07-31 Updates](docs/walkthrough_2026-07-31.md)** (Summary of today's EV market price drops, battery/range specs, and pre-heating updates)

---

## ⚡ 2025/2026 Family EV Shortlist (Space, Range, Fast Charging & Cargo)

EV prices have **skyrocketed down** (plummeted) in the Finnish and European used EV market. Used 2–4 year old EVs now deliver significantly lower 5-year total ownership costs than compact hybrid petrol cars, while offering massive battery packs, winter pre-heating, and spacious family cabins.

Here is the updated shortlist of family EVs evaluated for **4-person legroom**, **fast charging**, **battery pre-heater for winter**, and **large cargo space**:

| Model | Year & Condition | Battery (kWh) | WLTP Range | Purchase Price | 5-Year Total Cost | Rear Legroom | Fast Charging | Battery Pre-heater | Boot Capacity |
|---|---|---|---|---|---|---|---|---|---|
| **VW ID.4 Pro** | 🔄 Used (2021) | 77 kWh | 520 km | **€23,000** | **€13,673** | Good | 135 kW | ❌ No | 543 L |
| **Hyundai Ioniq 5 LR RWD** | 🔄 Used (2021) | 72.6 kWh | 481 km | **€26,000** | **€15,136** | Excellent | **220 kW (800V)** | ✅ Yes | 527 L |
| **Skoda Enyaq iV 80** | 🔄 Used (2021) | 77 kWh | 520 km | **€27,000** | **€15,612** | Excellent | 135 kW | ❌ No | 585 L |
| **Kia EV6 Long Range** | 🔄 Used (2022) | 77.4 kWh | 528 km | **€29,000** | **€19,717** | Excellent | **235 kW (800V)** | ✅ Yes | 520 L |
| **Audi e-tron 55 quattro** | 🔄 Used (2021) | 95 kWh | 441 km | **€32,000** | **€19,377** | Excellent | 150 kW (Flat curve) | ✅ Yes | 660 L |
| **Tesla Model Y LR** | 🔄 Used (2022) | 75 kWh | 533 km | **€34,000** | **€22,951** | Excellent | **250 kW** | ✅ Yes | 854 L total |
| **VW ID.7 Pro** | 🔄 Used (2023) | 77 kWh | 615 km | **€39,000** | **€25,757** | **Outstanding** | 175 kW | ✅ Yes | 532 L |
| **XPeng G9 RWD LR** | 🔄 Used (2023) | 98 kWh | 570 km | **€44,000** | **€29,477** | **Outstanding** | **300 kW (800V)** | ✅ Yes | 660 L |
| **Mercedes-Benz EQE 350+** | 🔄 Used (2022) | 90.6 kWh | 590 km | **€43,000** | **€29,110** | **Outstanding** | 170 kW | ✅ Yes | 430 L |
| **BMW iX xDrive40** | 🔄 Used (2022) | 76.6 kWh | 425 km | **€46,000** | **€31,043** | **Outstanding** | 150 kW | ✅ Yes | 500 L |

👉 **[View full detailed breakdown of all 53 vehicles in results/COMPARE.md](results/COMPARE.md)**

---

## Features

- **Comprehensive TCO Analysis**: Calculates depreciation, fuel costs, electricity costs, insurance, maintenance, vehicle tax, **and capital financing**.
- **Financial Opportunity Cost**: Calculates loan interest for bought cars and investment yield (compounding interest) for unused initial capital.
- **Leasing vs Buying**: Incorporates private leasing configurations to effectively compare leasing against traditional vehicle purchases.
- **Multi-Vehicle Type Support**: Compare EVs, PHEVs, and ICE vehicles side-by-side.
- **New & Used Vehicle Support**: Compares both new and used vehicles with age-adjusted depreciation rates.
- **Battery Capacity & Range Modeling**: Displays battery size (kWh) and official WLTP range for every EV/PHEV model.
- **Winter & Practical Specs**: Evaluates battery pre-heating support, fast charging peak kW, legroom ratings, and boot capacity.
- **2026 Tax Reform Compliance**: Implements the new Finnish vehicle tax system for EVs (mass-based) starting in 2026.
- **Real-World Consumption Factors**: Applies realistic consumption multipliers based on Finnish winter conditions.

## Installation

```bash
npm install
```

## Usage

Run the calculator with example vehicles:

```bash
npm start
```

Generate markdown output:

```bash
npm start -- --markdown > results/COMPARE.md
```

Or use it in your own TypeScript project:

```typescript
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
  purchasePrice: 49900,
  yearModel: 2024,
  currentMileage: 0,
  batteryCapacity: 75,
  electricRange: 533,
  electricConsumption: 16.9,
  insuranceClass: 20,
  cargoVolumeLiters: 854,
  fastChargingKw: 250,
  batteryPreheating: true,
  rearLegroomRating: 'Excellent',
};

const calculator = new EVTCOCalculator(finlandCosts);
const result = calculator.calculateTCO(vehicle);
```

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
- **ICE**: 15% higher than WLTP (1.15x multiplier)
  - Modern engines closer to WLTP but still optimistic in winter

## Project Structure

```
ev-tco-calculator-finland/
├── docs/
│   └── walkthrough_2026-07-31.md # Walkthrough of today's updates & feature changes
├── src/
│   ├── data/
│   │   ├── ev-vehicles.ts       # Electric vehicle database (with battery & practical specs)
│   │   ├── phev-vehicles.ts     # Plug-in hybrid database
│   │   ├── ice-vehicles.ts      # ICE vehicle database
│   │   └── index.ts             # Data exports
│   ├── tco-calculator.ts        # Main calculator logic
│   ├── example-usage.ts         # Example usage with all vehicles
│   └── index.ts                 # Entry point
├── results/
│   ├── COMPARE.md               # Full comparison results (markdown formatted)
│   └── HOW_IT_WORKS.md          # Calculation mechanics & financial opportunity cost
├── package.json
├── tsconfig.json
├── generate-readme.sh
└── README.md
```

## License

MIT

---
*Made for the Finnish EV community*
EOF

echo "README.md generated successfully!"

# 2. Regenerate results/COMPARE.md cleanly (without npm log header lines)
mkdir -p results
npx ts-node src/example-usage.ts --markdown | sed '/^>/d' > results/COMPARE.md
echo "results/COMPARE.md generated successfully!"
