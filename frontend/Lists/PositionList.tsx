import {
  Asset,
  Position,
} from "../../src/declarations/MainInterface/MainInterface.did"
import { Principal } from "@dfinity/principal"
import { parseUnits } from "ethers"

//btc price 30K,2k
const positionList: Position[] = [
  {
    owner: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    debt_pool: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    debt: parseUnits("1", 18),
    collateral: parseUnits("4000", 18),
    timestamp: 100000000n,
    amount_in: parseUnits("4000", 18) + parseUnits("40000", 18),
    marginFee: parseUnits("4", 4),
    asset_In: {
      id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
      class: { Cryptocurrency: null },
      symbol: "USD",
    },
    asset_out: {
      id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
      class: { Cryptocurrency: null },
      symbol: "BTC",
    },
  },
  {
    owner: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    debt_pool: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    debt: parseUnits("3", 18),
    collateral: parseUnits("4000", 18),
    timestamp: 100000000n,
    amount_in: parseUnits("4000", 18) + parseUnits("6000", 18),
    marginFee: parseUnits("4", 4),
    asset_In: {
      id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
      class: { Cryptocurrency: null },
      symbol: "USD",
    },
    asset_out: {
      id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
      class: { Cryptocurrency: null },
      symbol: "ETH",
    },
  },
  {
    owner: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    debt_pool: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
    debt: parseUnits("1000", 18),
    collateral: parseUnits("4000", 18),
    timestamp: 100000000n,
    amount_in: parseUnits("4000", 18) + parseUnits("100000", 18),
    marginFee: parseUnits("4", 4),
    asset_In: {
      id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
      class: { Cryptocurrency: null },
      symbol: "USDT",
    },
    asset_out: {
      id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
      class: { Cryptocurrency: null },
      symbol: "ICP",
    },
  },
]

class Lists {
  constructor(defList: Position[]) {
    this.List = defList
  }
  List: Position[]
  public addPosition(newPosition: Position) {
    this.List.push(newPosition)
  }
}

export const PositionLists = new Lists(positionList)
