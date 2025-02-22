import { BigNumber } from '@ethersproject/bignumber';
import {
  InsufficientInputAmountError,
  InsufficientReservesError,
} from '@teleswap/v2-sdk';
import { TradeType } from '@uniswap/sdk-core';

import { V2Route } from '../../routers/router';
import { CurrencyAmount } from '../../util/amounts';
import { log } from '../../util/log';
import { routeToString } from '../../util/routes';

// Quotes can be null (e.g. pool did not have enough liquidity).
export type V2AmountQuote = {
  amount: CurrencyAmount;
  quote: BigNumber | null;
};

export type V2RouteWithQuotes = [V2Route, V2AmountQuote[]];

export interface IV2QuoteProvider {
  getQuotesManyExactIn(
    amountIns: CurrencyAmount[],
    routes: V2Route[]
  ): Promise<{ routesWithQuotes: V2RouteWithQuotes[] }>;

  getQuotesManyExactOut(
    amountOuts: CurrencyAmount[],
    routes: V2Route[]
  ): Promise<{ routesWithQuotes: V2RouteWithQuotes[] }>;
}

/**
 * Computes quotes for V2 off-chain. Quotes are computed using the balances
 * of the pools within each route provided.
 *
 * @export
 * @class V2QuoteProvider
 */
export class V2QuoteProvider implements IV2QuoteProvider {
  /* eslint-disable @typescript-eslint/no-empty-function */
  constructor() {}
  /* eslint-enable @typescript-eslint/no-empty-function */

  public async getQuotesManyExactIn(
    amountIns: CurrencyAmount[],
    routes: V2Route[]
  ): Promise<{ routesWithQuotes: V2RouteWithQuotes[] }> {
    return this.getQuotes(amountIns, routes, TradeType.EXACT_INPUT);
  }

  public async getQuotesManyExactOut(
    amountOuts: CurrencyAmount[],
    routes: V2Route[]
  ): Promise<{ routesWithQuotes: V2RouteWithQuotes[] }> {
    return this.getQuotes(amountOuts, routes, TradeType.EXACT_OUTPUT);
  }

  private async getQuotes(
    amounts: CurrencyAmount[],
    routes: V2Route[],
    tradeType: TradeType
  ): Promise<{ routesWithQuotes: V2RouteWithQuotes[] }> {
    const routesWithQuotes: V2RouteWithQuotes[] = [];

    const debugStrs: string[] = [];
    for (const route of routes) {
      const amountQuotes: V2AmountQuote[] = [];

      let insufficientInputAmountErrorCount = 0;
      let insufficientReservesErrorCount = 0;
      for (const amount of amounts) {
        try {
          if (tradeType == TradeType.EXACT_INPUT) {
            let inputAmount = amount.wrapped;
            for (const pair of route.pairs) {
              const [outputAmountNew] = pair.getOutputAmount(inputAmount);
              inputAmount = outputAmountNew;
            }
            amountQuotes.push({
              amount,
              quote: BigNumber.from(inputAmount.quotient.toString()),
            });
          } else {
            let outputAmount = amount.wrapped;

            for (let i = route.pairs.length - 1; i >= 0; i--) {
              const pair = route.pairs[i]!;
              [outputAmount] = pair.getInputAmount(outputAmount);
            }

            amountQuotes.push({
              amount,
              quote: BigNumber.from(outputAmount.quotient.toString()),
            });
          }
        } catch (err) {
          // Can fail to get quotes, e.g. throws InsufficientReservesError or InsufficientInputAmountError.
          if (err instanceof InsufficientInputAmountError) {
            insufficientInputAmountErrorCount =
              insufficientInputAmountErrorCount + 1;
            amountQuotes.push({ amount, quote: null });
          } else if (err instanceof InsufficientReservesError) {
            insufficientReservesErrorCount = insufficientReservesErrorCount + 1;
            amountQuotes.push({ amount, quote: null });
          } else {
            throw err;
          }
        }
      }

      if (
        insufficientInputAmountErrorCount > 0 ||
        insufficientReservesErrorCount > 0
      ) {
        debugStrs.push(
          `${[
            routeToString(route),
          ]} Input: ${insufficientInputAmountErrorCount} Reserves: ${insufficientReservesErrorCount} }`
        );
      }

      routesWithQuotes.push([route, amountQuotes]);
    }

    if (debugStrs.length > 0) {
      log.info({ debugStrs }, `Failed quotes for V2 routes`);
    }

    return {
      routesWithQuotes,
    };
  }
}
