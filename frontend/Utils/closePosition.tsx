import { Principal } from "@dfinity/principal"
import { MainInterface } from "src/declarations/MainInterface"
import {
  Position,
  Asset,
} from "../../src/declarations/MainInterface/MainInterface.did"
import { getBestQuote_ID_QUOTE } from "./getBestQuote_ID_QUOTE"

const getPositionID = async (
  baseAsset: Principal,
  quoteAsset: Principal,
  position: Position,
): Promise<bigint> => {
  const pairPositions: Position[] = await MainInterface.getPairPositions(
    baseAsset,
    quoteAsset,
  )
  for (let pairposition of pairPositions) {
    if (pairposition == position) {
      return BigInt(pairPositions.indexOf(pairposition))
    }
  }
}

export const closePosition = async (
  baseAsset: Asset,
  quoteAsset: Asset,
  position: Position,
) => {
  const positionId = await getPositionID(baseAsset.id, quoteAsset.id, position)
  const { quoteID } = await getBestQuote_ID_QUOTE(
    baseAsset.id,
    quoteAsset.id,
    position.amount_in,
  )
  await MainInterface.closePosition({
    quote_id: BigInt(quoteID),
    base_asset: baseAsset,
    quote_asset: quoteAsset,
    position_id: BigInt(positionId),
  })
}
