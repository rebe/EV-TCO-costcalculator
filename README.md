# EV TCO Calculator - Finnish Market

A comprehensive Total Cost of Ownership (TCO) calculator comparing PHEVs and full EVs over 5 years, specifically tailored for the Finnish market.

## Features

- **Depreciation**: Different rates for EVs vs PHEVs based on Finnish market data
- **Fuel Costs**: Gasoline consumption for PHEV hybrid mode
- **Electricity Costs**: Based on Finnish electricity prices (including transfer fees)
- **Insurance**: Calculated based on vehicle value and insurance class
- **Maintenance**: Lower costs for EVs (no oil changes, fewer moving parts)
- **Vehicle Tax**: Finnish road tax based on CO2 emissions

## Installation

```bash
npm install
```

## Usage

Run the example comparison:

```bash
npm start
```

Build the project:

```bash
npm run build
```

## Customization

Edit `src/example-usage.ts` to adjust:

- **Electricity price**: Current Finnish market rate
- **Gasoline price**: Current pump price
- **Annual mileage**: Your expected driving distance
- **Electric driving percentage**: For PHEVs, how much you'll drive on electric vs gasoline
- **Vehicle specifications**: Add your own vehicles to compare

## Example Output

The calculator provides:
- Year-by-year cost breakdown
- Total 5-year ownership cost
- Average annual cost
- Residual value after 5 years
- Ranked comparison of all vehicles

## Finnish Market Considerations

- Vehicle tax: €53.29 base + €0.90 per g/km CO2
- EVs have 0 g/km CO2 (lower tax)
- Electricity prices include transfer fees (typical: €0.20-0.30/kWh)
- Insurance costs based on Finnish insurance classes
- Depreciation rates reflect Finnish used car market

## License

MIT
```

To use this calculator:

```bash
npm install
```

```bash
npm start
