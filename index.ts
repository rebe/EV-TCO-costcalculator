import { EVTCOCalculator, FinlandCosts, VehicleSpecs } from './src/tco-calculator';

// Export for use in other applications
export { EVTCOCalculator, VehicleSpecs, FinlandCosts };


// Run example if executed directly
if (require.main === module) {
  require('./example-usage');
}
