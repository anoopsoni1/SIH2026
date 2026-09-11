import { IPaymentBreakdown } from '../../../shared/src/index';

export class WageCalculatorService {
  /**
   * Transparent payment breakdown calculator
   * Default percentages: Worker 82%, Co-op 10%, Platform 5%, Tax 3%
   */
  static calculateBreakdown(
    grossAmount: number,
    customRates?: {
      workerPct?: number;
      coopPct?: number;
      platformPct?: number;
      taxPct?: number;
    }
  ): IPaymentBreakdown {
    const workerPct = customRates?.workerPct ?? 0.82;
    const coopPct = customRates?.coopPct ?? 0.10;
    const platformPct = customRates?.platformPct ?? 0.05;
    const taxPct = customRates?.taxPct ?? 0.03;

    const workerEarnings = Math.round(grossAmount * workerPct * 100) / 100;
    const cooperativeContribution = Math.round(grossAmount * coopPct * 100) / 100;
    const platformFee = Math.round(grossAmount * platformPct * 100) / 100;
    const taxes = Math.round(grossAmount * taxPct * 100) / 100;

    return {
      grossAmount,
      workerEarnings,
      cooperativeContribution,
      platformFee,
      taxes,
    };
  }
}
