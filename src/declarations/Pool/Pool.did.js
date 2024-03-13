export const idlFactory = ({ IDL }) => {
  const TokenDetails = IDL.Record({
    'max_debt' : IDL.Nat64,
    'is_allowed' : IDL.Bool,
    'margin_fee' : IDL.Nat64,
    'min_collateral' : IDL.Nat64,
  });
  const Pool = IDL.Service({
    'approve' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'getTokenDetails' : IDL.Func([IDL.Principal], [TokenDetails], ['query']),
    'isLiquidator' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'sendOutICRC' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Nat],
        [],
      ),
    'setOperator' : IDL.Func([IDL.Principal, IDL.Bool], [], []),
    'setToken' : IDL.Func([IDL.Principal, TokenDetails], [], []),
  });
  return Pool;
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
