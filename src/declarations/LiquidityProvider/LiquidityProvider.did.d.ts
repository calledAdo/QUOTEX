import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface LiquidityProvider {
  'approveLiquidity' : ActorMethod<[Principal, bigint], undefined>,
  'getAdmin' : ActorMethod<[], Principal>,
  'sendOut' : ActorMethod<[Principal, Principal, bigint], bigint>,
}
export interface _SERVICE extends LiquidityProvider {}
