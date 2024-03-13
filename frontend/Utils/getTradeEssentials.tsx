import { parseUnits, formatUnits } from "ethers"
import { Principal } from "@dfinity/principal"

//Interface imports
import { TokenDetails } from "src/declarations/Pool/Pool.did"
import { Quote } from "../../src/declarations/MainInterface/MainInterface.did"

//getBestPool,getEquivalent,getBestQuote
import { getBestPool_ID_TokenDetails } from "./getBestPool_ID_TokenDetails"
import { getBestQuote_ID_QUOTE } from "./getBestQuote_ID_QUOTE"
import { getEquivalent } from "./getEquivalent"

export const getTradeEssentails = async (
  collateral = 0,
  debt = 0,
  baseAsset: Principal,
  quoteAsset: Principal,
): Promise<{
  quote: { quoteID: bigint; quote: Quote }
  bestPool: { poolID: bigint; bestPoolTokenDetails: TokenDetails }
  positionSize: string
}> => {
  //margin fee,leverage,equivalent,
  let quote = await getBestQuote_ID_QUOTE(
    baseAsset,
    quoteAsset,
    parseUnits(`${debt}`, 18),
  )
  let bestPool = await getBestPool_ID_TokenDetails(baseAsset, {
    collateral_amount: parseUnits(`${collateral}`, 18),
    debt: parseUnits(`${debt}`, 18),
  })
  let positionSize = await getEquivalent(
    BigInt(debt),
    baseAsset.toString(),
    quoteAsset.toString(),
  )

  return { quote, bestPool, positionSize: formatUnits(positionSize, 0) }
}
