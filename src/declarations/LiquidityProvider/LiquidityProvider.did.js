export const idlFactory = ({ IDL }) => {
  const LiquidityProvider = IDL.Service({
    'approveLiquidity' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'getAdmin' : IDL.Func([], [IDL.Principal], ['query']),
    'sendOut' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Nat],
        [],
      ),
  });
  return LiquidityProvider;
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
