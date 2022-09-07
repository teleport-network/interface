import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MethodParameters } from '@uniswap/v3-sdk';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

export type QuoteQueryParams = {
  tokenInAddress: string;
  tokenInChainId: number;
  tokenOutAddress: string;
  tokenOutChainId: number;
  amount: string;
  type: string;
  recipient?: string;
  slippageTolerance?: string;
  deadline?: string;
  algorithm?: string;
  gasPriceWei?: string;
  minSplits?: number;
  forceCrossProtocol?: boolean;
  forceMixedRoutes?: boolean;
  protocols?: string[] | string;
  simulateFromAddress?: string;
};

export type QuoteResponse = {
  quoteId: string;
  amount: string;
  amountDecimals: string;
  quote: string;
  quoteDecimals: string;
  quoteGasAdjusted: string;
  quoteGasAdjustedDecimals: string;
  gasUseEstimate: string;
  gasUseEstimateQuote: string;
  gasUseEstimateQuoteDecimals: string;
  gasUseEstimateUSD: string;
  simulationError?: boolean;
  gasPriceWei: string;
  blockNumber: string;
  routeString: string;
  route: Array<PoolInRoute[]>;
  methodParameters?: MethodParameters;
};

export type PoolInRoute = {
  type: 'teleswap-pool';
  address: string;
  tokenIn: TokenInRoute;
  tokenOut: TokenInRoute;
  reserve0: Reserve;
  reserve1: Reserve;
  amountIn?: string;
  amountOut?: string;
};

export type TokenInRoute = {
  address: string;
  chainId: number;
  symbol: string;
  decimals: string;
};

export type Reserve = {
  token: TokenInRoute;
  quotient: string;
};

export type V2PoolInRoute = {
  type: 'teleswap-pool';
  address: string;
  tokenIn: TokenInRoute;
  tokenOut: TokenInRoute;
  reserve0: V2Reserve;
  reserve1: V2Reserve;
  amountIn?: string;
  amountOut?: string;
};

export type V2Reserve = {
  token: TokenInRoute;
  quotient: string;
};

export type Response<Res> = {
  statusCode: 200 | 202;
  body: Res;
  headers?: any;
};

export type ErrorResponse = {
  statusCode: 400 | 403 | 404 | 408 | 409 | 500;
  errorCode: string;
  detail?: string;
};
