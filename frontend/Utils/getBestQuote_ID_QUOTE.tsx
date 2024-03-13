import { Principal } from "@dfinity/principal"
import { MainInterface } from "../../src/declarations/MainInterface"
import { Quote } from "../../src/declarations/MainInterface/MainInterface.did"

export const getBestQuote_ID_QUOTE = async (
  baseAsset: Principal,
  quoteAsset: Principal,
  amount: bigint,
): Promise<{ quoteID: bigint; quote: Quote }> => {
  const time = Date.now() * 10e6
  const pairQuotes: Quote[] = await MainInterface.getPairQuotes(
    baseAsset,
    quoteAsset,
  )
  let quote = pairQuotes[0]
  for (let quote of pairQuotes) {
    if (
      quote.time_limit > BigInt(time) &&
      quote.range.min > amount &&
      quote.range.max &&
      quote.offer < quote.offer
    ) {
      quote = quote
    }
  }
  return { quoteID: BigInt(pairQuotes.indexOf(quote)), quote }
}
