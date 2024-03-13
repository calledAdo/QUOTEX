import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Asset { 'class' : AssetClass, 'symbol' : string }
export type AssetClass = { 'Cryptocurrency' : null } |
  { 'FiatCurrency' : null };
export interface ExchangeRate {
  'metadata' : ExchangeRateMetadata,
  'rate' : bigint,
  'timestamp' : [] | [bigint],
  'quote_asset' : Asset,
  'base_asset' : Asset,
}
export interface ExchangeRateMetadata {
  'decimals' : number,
  'forex_timestamp' : [] | [bigint],
  'quote_asset_num_received_rates' : bigint,
  'base_asset_num_received_rates' : bigint,
  'base_asset_num_queried_sources' : bigint,
  'standard_deviation' : bigint,
  'quote_asset_num_queried_sources' : bigint,
}
export interface GetExchangeRateRequest {
  'timestamp' : [] | [bigint],
  'quote_asset' : Asset,
  'base_asset' : Asset,
}
export interface PriceFeed {
  'get_exchange_rate' : ActorMethod<[GetExchangeRateRequest], ExchangeRate>,
  'setApproval' : ActorMethod<[Principal, boolean], undefined>,
}
export interface _SERVICE extends PriceFeed {}
