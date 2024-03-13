import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Pool {
  'approve' : ActorMethod<[Principal, bigint], undefined>,
  'getTokenDetails' : ActorMethod<[Principal], TokenDetails>,
  'isLiquidator' : ActorMethod<[Principal], boolean>,
  'sendOutICRC' : ActorMethod<[Principal, Principal, bigint], bigint>,
  'setOperator' : ActorMethod<[Principal, boolean], undefined>,
  'setToken' : ActorMethod<[Principal, TokenDetails], undefined>,
}
export interface TokenDetails {
  'max_debt' : bigint,
  'is_allowed' : boolean,
  'margin_fee' : bigint,
  'min_collateral' : bigint,
}
export interface _SERVICE extends Pool {}
