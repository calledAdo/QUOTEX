import { Principal } from "@dfinity/principal"
import {
  Asset,
  AssetClass,
} from "src/declarations/MainInterface/MainInterface.did"

type AssetswithID = {
  id: Principal
  symbol: string
  class: AssetClass
  index?: number
}

export let list: AssetswithID[] = [
  {
    id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    class: { Cryptocurrency: null },
    symbol: "BTC",
    index: 0,
  },
  {
    id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    class: { Cryptocurrency: null },
    symbol: "ETH",
    index: 1,
  },
  {
    id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    class: { Cryptocurrency: null },
    symbol: "SOL",
    index: 4,
  },
  {
    id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    class: { Cryptocurrency: null },
    symbol: "XRP",
    index: 6,
  },
]
