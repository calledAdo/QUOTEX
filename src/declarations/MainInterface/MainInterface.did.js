export const idlFactory = ({ IDL }) => {
  const AssetClass = IDL.Variant({
    'Cryptocurrency' : IDL.Null,
    'FiatCurrency' : IDL.Null,
  });
  const Asset__1 = IDL.Record({
    'id' : IDL.Principal,
    'class' : AssetClass,
    'symbol' : IDL.Text,
  });
  const Asset = IDL.Record({
    'id' : IDL.Principal,
    'class' : AssetClass,
    'symbol' : IDL.Text,
  });
  const ClosePositionParams = IDL.Record({
    'quote_id' : IDL.Nat,
    'quote_asset' : Asset,
    'base_asset' : Asset,
    'position_id' : IDL.Nat,
  });
  const Range = IDL.Record({ 'max' : IDL.Nat64, 'min' : IDL.Nat64 });
  const Quote = IDL.Record({
    'offer' : IDL.Nat64,
    'liq_provider_id' : IDL.Principal,
    'time_limit' : IDL.Int,
    'range' : Range,
  });
  const Position = IDL.Record({
    'owner' : IDL.Principal,
    'debt_pool' : IDL.Principal,
    'debt' : IDL.Nat64,
    'collateral' : IDL.Nat64,
    'timestamp' : IDL.Int,
    'asset_out' : Asset,
    'amount_in' : IDL.Nat,
    'asset_In' : Asset,
    'marginFee' : IDL.Nat64,
  });
  const OpenPositionParams = IDL.Record({
    'collateral_amount' : IDL.Nat64,
    'debt' : IDL.Nat64,
    'base_asset_id' : IDL.Nat,
    'quote_asset_id' : IDL.Nat,
    'quote_id' : IDL.Nat,
    'pool_id' : IDL.Nat,
  });
  const Main = IDL.Service({
    'addAsset' : IDL.Func([Asset__1], [IDL.Nat], []),
    'addPool' : IDL.Func([IDL.Principal], [IDL.Nat], []),
    'closePosition' : IDL.Func([ClosePositionParams], [], []),
    'getAssetsList' : IDL.Func([], [IDL.Vec(Asset__1)], ['query']),
    'getPairPositions' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [],
        ['query'],
      ),
    'getPairQuotes' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Vec(Quote)],
        ['query'],
      ),
    'getPools' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getUserPositions' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Position)],
        ['query'],
      ),
    'openPosition' : IDL.Func([OpenPositionParams], [Position], []),
    'setQuote' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat, Quote],
        [IDL.Nat],
        [],
      ),
  });
  return Main;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
