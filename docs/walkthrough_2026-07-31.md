# Walkthrough of EV Calculator Updates (2026-07-31)

## Summary of Changes

Today's updates reflect the recent 2024–2026 market shift in Finland where EV prices have **skyrocketed down** (plummeted). Used 2 to 4-year-old EVs now offer significantly lower 5-year Total Cost of Ownership (TCO) than compact hybrid petrol vehicles. 

We updated the EV vehicle database, extended the calculator engine to track practical EV metrics (Battery size, WLTP Range, Fast Charging kW, Winter Battery Pre-heater, Rear Legroom, and Boot Cargo Volume), and regenerated all markdown documentation with clean quick-navigation links for GitHub.

---

## Key Features & Evaluation Criteria Added

1. **EV Market Price Re-alignment ("Prices Skyrocketed Down")**:
   - Used 2021-2022 EVs received major price adjustments based on current Finnish market values:
     - **VW ID.4 Pro (2021)**: €23,000 (5-Year TCO: **€13,673**)
     - **Hyundai Ioniq 5 LR RWD (2021)**: €26,000 (5-Year TCO: **€15,136**)
     - **Skoda Enyaq iV 80 (2021)**: €27,000 (5-Year TCO: **€15,612**)
     - **Kia EV6 Long Range (2022)**: €29,000 (5-Year TCO: **€19,717**)
     - **Audi e-tron 55 quattro (2021)**: €32,000 *(down from €52,000!)* (5-Year TCO: **€19,377**)
     - **Tesla Model Y LR (2022)**: €34,000 *(down from €50,000+)* (5-Year TCO: **€22,951**)
     - **Volkswagen ID.7 Pro (2023)**: €39,000 (5-Year TCO: **€25,757**)
     - **XPeng G9 RWD LR (2023)**: €44,000 (5-Year TCO: **€29,477**)

2. **Battery Pack & Electric Range Modeling**:
   - Every EV and PHEV entry now displays its **Battery Capacity (kWh)** and official **WLTP Range (km)** across individual result blocks and summary ranking tables.

3. **Winter Pre-heating & Practical Family Specs**:
   - Added tracking for **Battery Pre-heating (Preconditioning)**, essential for Finnish winter fast charging.
   - Added **Fast Charging Peak (kW)** & **800V Architecture** tracking (e.g. 18-minute 10-80% charging on Ioniq 5, Kia EV6, XPeng G9, Kia EV9).
   - Added **Rear Legroom Rating** (Outstanding >1m legroom in ID.7, EQE, iX, G9, EV9; Excellent in Model Y, Ioniq 5, EV6, Enyaq).
   - Added **Cargo Boot Capacity (Liters)** (ranging from 520L up to 854L in Model Y).

---

## File Changes & Modifications

### 1. `src/tco-calculator.ts`
- Extended `VehicleSpecs` and `TCOResult` interfaces with optional practical fields:
  - `cargoVolumeLiters?: number`
  - `fastChargingKw?: number`
  - `batteryPreheating?: boolean`
  - `rearLegroomRating?: 'Outstanding' | 'Excellent' | 'Good' | 'Fair'`
  - `notes?: string`
- Updated `printVehicleResultConsole`, `printVehicleResultMarkdown`, and `printComparisonMarkdown` to include Battery (kWh) and Range (km) in header metadata and summary tables.

### 2. `src/data/ev-vehicles.ts`
- Updated prices across all 27+ EV entries.
- Added new key models: **Tesla Model Y RWD**, **VW ID.7 Tourer Pro**, **Skoda Enyaq 85**, **XPeng G9 LR**, **Kia EV9 Earth LR**.
- Populated all battery, range, pre-heater, fast-charging, legroom, and cargo specs for every entry.

### 3. `generate-readme.sh`
- Updated shell script to generate a clean, GitHub-ready `README.md` and rebuild `results/COMPARE.md` without `ts-node` header artifacts.

### 4. `README.md`
- Added **Quick Navigation & Documentation Links** section at the top.
- Embedded the **2025/2026 Family EV Shortlist** summary table directly on the main landing page.

### 5. `results/COMPARE.md`
- Regenerated full 5-year breakdown report for all 53 vehicles with battery size, range, and practical specs.

### 6. `results/HOW_IT_WORKS.md`
- Updated negative net cost math, battery/winter pre-heating explanations, and buying vs leasing calculations.

---

## Verification & Output Testing

- Ran `npm start` to verify clean compilation and output formatting.
- Executed `bash generate-readme.sh` to update `README.md` and `results/COMPARE.md`.
- Verified clean git status.
