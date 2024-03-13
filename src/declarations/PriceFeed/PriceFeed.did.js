export const idlFactory = ({ IDL }) => {
  const AssetClass = IDL.Variant({
    'Cryptocurrency' : IDL.Null,
    'FiatCurrency' : IDL.Null,
  });
  const Asset = IDL.Record({ 'class' : AssetClass, 'symbol' : IDL.Text });
  const GetExchangeRateRequest = IDL.Record({
    'timestamp' : IDL.Opt(IDL.Nat64),
    'quote_asset' : Asset,
    'base_asset' : Asset,
  });
  const ExchangeRateMetadata = IDL.Record({
    'decimals' : IDL.Nat32,
    'forex_timestamp' : IDL.Opt(IDL.Nat64),
    'quote_asset_num_received_rates' : IDL.Nat64,
    'base_asset_num_received_rates' : IDL.Nat64,
    'base_asset_num_queried_sources' : IDL.Nat64,
    'standard_deviation' : IDL.Nat64,
    'quote_asset_num_queried_sources' : IDL.Nat64,
  });
  const ExchangeRate = IDL.Record({
    'metadata' : ExchangeRateMetadata,
    'rate' : IDL.Nat64,
    'timestamp' : IDL.Opt(IDL.Nat64),
    'quote_asset' : Asset,
    'base_asset' : Asset,
  });
  const PriceFeed = IDL.Service({
    'get_exchange_rate' : IDL.Func(
        [GetExchangeRateRequest],
        [ExchangeRate],
        [],
      ),
    'setApproval' : IDL.Func([IDL.Principal, IDL.Bool], [], []),
  });
  return PriceFeed;
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
