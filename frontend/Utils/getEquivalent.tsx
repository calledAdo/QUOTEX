import { parseUnits, formatUnits } from "ethers"
import axios from "axios"

//actual amount *  10e5
export const getEquivalent = async (
  quoteAmount: bigint,
  baseAsset: string,
  quoteAsset: string,
): Promise<bigint> => {
  const baseAssetRate = await axios.get(
    `https://api.coinbase.com/v2/exchange-rates?currency=${baseAsset}`,
  )
  const quoteAssetRate = await axios.get(
    `https://api.coinbase.com/v2/exchange-rates?currency=${quoteAsset}`,
  )
  const baseToUSD: string = baseAssetRate.data.data.rates.USD
  const quoteToUSD: string = quoteAssetRate.data.data.rates.USD
  const amountEquivalentUSD = parseUnits(quoteToUSD, 10) * quoteAmount

  return amountEquivalentUSD / parseUnits(baseToUSD, 10)
}
// price * 10**18
