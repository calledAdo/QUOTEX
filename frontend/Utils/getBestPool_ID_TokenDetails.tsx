import { MainInterface } from "src/declarations/MainInterface"
import { createActor } from "../../src/declarations/Pool"
import { TokenDetails } from "src/declarations/Pool/Pool.did"
import { Principal } from "@dfinity/principal"

export const getPoolTokenDetails = async (
  assetPrincipal: Principal,
  poolPrincipal: Principal,
): Promise<TokenDetails> => {
  let pool = createActor(poolPrincipal)
  return await pool.getTokenDetails(assetPrincipal)
}

export const getBestPool_ID_TokenDetails = async (
  baseAsset: Principal,
  params: { collateral_amount: bigint; debt: bigint },
): Promise<{ poolID: bigint; bestPoolTokenDetails: TokenDetails }> => {
  const poolsPrincipals: Principal[] = await MainInterface.getPools()
  let bestPoolPrincipal = poolsPrincipals[0]
  let bestPoolTokenDetails: TokenDetails
  for (let poolPrincipal of poolsPrincipals) {
    let poolTokenDetails: TokenDetails = await getPoolTokenDetails(
      baseAsset,
      poolPrincipal,
    )
    if (
      poolTokenDetails.is_allowed &&
      params.debt <= poolTokenDetails.max_debt &&
      params.collateral_amount >= poolTokenDetails.min_collateral &&
      poolTokenDetails.margin_fee <
        (await getPoolTokenDetails(baseAsset, bestPoolPrincipal)).margin_fee
    ) {
      bestPoolPrincipal = poolPrincipal
      bestPoolTokenDetails = poolTokenDetails
    }
  }
  return {
    poolID: BigInt(poolsPrincipals.indexOf(bestPoolPrincipal)),
    bestPoolTokenDetails,
  }
}
