import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Asset {
  'id' : Principal,
  'class' : AssetClass,
  'symbol' : string,
}
export type AssetClass = { 'Cryptocurrency' : null } |
  { 'FiatCurrency' : null };
export interface Asset__1 {
  'id' : Principal,
  'class' : AssetClass,
  'symbol' : string,
}
export interface ClosePositionParams {
  'quote_id' : bigint,
  'quote_asset' : Asset,
  'base_asset' : Asset,
  'position_id' : bigint,
}
export interface Main {
  'addAsset' : ActorMethod<[Asset__1], bigint>,
  'addPool' : ActorMethod<[Principal], bigint>,
  'closePosition' : ActorMethod<[ClosePositionParams], undefined>,
  'getAssetsList' : ActorMethod<[], Array<Asset__1>>,
  'getPairPositions' : ActorMethod<[Principal, Principal], undefined>,
  'getPairQuotes' : ActorMethod<[Principal, Principal], Array<Quote>>,
  'getPools' : ActorMethod<[], Array<Principal>>,
  'getUserPositions' : ActorMethod<[Principal], Array<Position>>,
  'openPosition' : ActorMethod<[OpenPositionParams], Position>,
  'setQuote' : ActorMethod<[Principal, Principal, bigint, Quote], bigint>,
}
export interface OpenPositionParams {
  'collateral_amount' : bigint,
  'debt' : bigint,
  'base_asset_id' : bigint,
  'quote_asset_id' : bigint,
  'quote_id' : bigint,
  'pool_id' : bigint,
}
export interface Position {
  'owner' : Principal,
  'debt_pool' : Principal,
  'debt' : bigint,
  'collateral' : bigint,
  'timestamp' : bigint,
  'asset_out' : Asset,
  'amount_in' : bigint,
  'asset_In' : Asset,
  'marginFee' : bigint,
}
export interface Quote {
  'offer' : bigint,
  'liq_provider_id' : Principal,
  'time_limit' : bigint,
  'range' : Range,
}
export interface Range { 'max' : bigint, 'min' : bigint }
export interface _SERVICE extends Main {}
