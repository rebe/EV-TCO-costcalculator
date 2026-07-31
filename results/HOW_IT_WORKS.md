# How TCO & Financial Calculations Work

This document explains the mathematical formulas, financial mechanics, and practical metrics used in the **EV & PHEV Total Cost of Ownership (TCO) Calculator for Finland**.

---

## 1. The Net Cost Formula & Negative Net Cost Explained

### Net Cost Formula:
$$\text{Net Cost} = \text{Total 5-Year Ownership Costs} - \text{Residual Value after 5 Years}$$

Where **Total 5-Year Ownership Costs** includes:
- **Depreciation** (loss of car value over 5 years)
- **Fuel & Electricity Costs** (with Finnish winter consumption multipliers)
- **Insurance** (value & insurance-class adjusted)
- **Maintenance & Repairs** (age-adjusted)
- **Vehicle Tax** (including 2026+ mass-based EV tax reform)
- **Financing / Opportunity Cost** (loan interest minus investment yield on retained cash)

---

### Example Calculation: VW ID.4 Pro (Used 2021)

- **Purchase Price**: €23,000
- **Total 5-Year Ownership Costs**: €13,673.15
- **Residual Value after 5 Years**: €16,870.24
- **Net Cost**: $€13,673.15 - €16,870.24 = \mathbf{-€3,197.09}$

### Why Does "Negative Net Cost" Happen?

1. **Previous Depreciation Hit**: A 3-to-4 year old used EV has already suffered its largest initial value drop (the 20-25% first-year drop). Older vehicles depreciate at much lower annual rates (8% down to 4% per year).
2. **Low Running Costs**: Electricity costs for EVs (~€450–€470/year at €0.11/kWh) and low maintenance (~€520–€616/year) are dramatically lower than internal combustion engine (ICE) fuel costs (€2,000–€2,500/year).
3. **High Retained Value**: After 5 years of ownership (car becomes 8 years old), the vehicle retains ~73% of its used purchase price (€16,870 residual value). Because the total 5-year running costs (€13,673) are lower than the car's remaining resale value (€16,870), the net cost formula yields a negative number.

> ⚠️ **Real-World Meaning**: This does not mean you gain cash in your bank account; it means the vehicle retains enough resale value that your net equity loss over 5 years is smaller than the residual value of the car. You drive for 5 years essentially paying only operating expenses and minor age depreciation.

---

## 2. Vehicles with Negative Net Cost (Current Market Data)

With the 2024–2026 drop in used EV market prices, several used 77kWh+ EVs offer negative net cost over a 5-year ownership period:

| Vehicle | Year | Used Purchase Price | 5-Year Total Cost | Residual Value | Net Cost (after resale) |
|---|---|---|---|---|---|
| **Volkswagen ID.4 Pro** | 2021 | €23,000 | €13,673.15 | €16,870.24 | **-€3,197.09** |
| **Tesla Model 3 Long Range** | 2021 | €26,000 | €15,028.30 | €19,070.71 | **-€4,042.41** |
| **Hyundai Ioniq 5 LR RWD** | 2021 | €26,000 | €15,136.49 | €19,070.71 | **-€3,934.22** |
| **Skoda Enyaq iV 80** | 2021 | €27,000 | €15,612.45 | €19,804.20 | **-€4,191.74** |
| **Audi e-tron 55 quattro** | 2021 | €32,000 | €19,377.70 | €23,471.64 | **-€4,093.94** |
| **Kia EV6 GT-Line** | 2021 | €31,000 | €17,790.12 | €22,738.15 | **-€4,948.03** |

---

## 3. Practical EV Metrics: Battery, Pre-Heating & Fast Charging

In addition to financial parameters, the calculator evaluates practical EV ownership factors critical for Finnish winter conditions:

- **Battery Size (kWh) & WLTP Range**: Larger batteries (75 kWh to 99.8 kWh) allow long highway trips between charges and provide a buffer against winter range reduction (typically 20–30% drop in freezing temperatures).
- **Battery Pre-heating (Preconditioning)**: Essential in Nordic climates. Cold batteries cannot accept high charging speeds. Vehicles with navigation-based or manual battery pre-heating (e.g. Tesla Model Y, VW ID.7 with SW 4.0, Hyundai Ioniq 5/6, Kia EV6, XPeng G9) warm the battery to ~25°C before arriving at a DC fast charger, enabling full charging speeds even in sub-zero winter temperatures.
- **Fast Charging (kW Peak & 800V Architecture)**: 800V vehicles (Hyundai Ioniq 5, Kia EV6, XPeng G9, Kia EV9) charge from 10% to 80% in just 18–20 minutes. 400V vehicles (Tesla Model Y 250 kW, VW ID.7 175 kW) take 25–28 minutes.
- **Cargo Space & Rear Legroom**: Evaluates interior space for 4 adults and family luggage (boot capacity ranges from 400L up to 854L in Tesla Model Y).

---

## 4. Leasing vs. Buying: Capital Opportunity Cost Math

Comparing **leasing** against **buying** requires tracking **capital opportunity cost**:

### Scenario Parameters:
- **Initial Cash Available**: €20,000 (e.g. from trading in an old vehicle)
- **Car List Price**: €54,000 (VW ID.7 Pro 2024)
- **Loan Interest Rate**: 6.0% APR
- **Investment Return Rate**: 4.0% per annum compounding

### Option A: Buying the Vehicle
1. You use your €20,000 cash as down payment.
2. You take a loan of €34,000 (€54,000 - €20,000) at 6.0% interest over 5 years.
3. Your €20,000 cash is locked up in the vehicle, so **investment yield is €0**.
4. You pay loan interest over 5 years + full vehicle depreciation.

### Option B: Leasing the Vehicle
1. You pay €792 / month on a private lease with €0 down payment (maintenance included).
2. Your €20,000 initial cash is **NOT spent** on a down payment. It remains invested in low-risk index funds or savings at 4.0% compounding annually.
3. Over 5 years, your €20,000 grows to **€24,333**, yielding a **finance income of -€4,333** (reducing your total lease cost).

### Financial Summary:
By accounting for compounding investment returns on unspent cash, private leasing becomes financially transparent. While buying generally results in lower overall cost if resale values remain strong, retaining liquid cash through leasing significantly narrows the gap when capital market returns are factored in.

---
*EV Total Cost of Ownership Calculator - Finland*