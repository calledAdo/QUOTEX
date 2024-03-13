import { formatUnits, parseUnits } from "ethers"
import axios from "axios"
import { getEquivalent } from "../Utils/getEquivalent"
import React, { useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import { Position } from "../../src/declarations/MainInterface/MainInterface.did"

type Props = {
  val: Position
}

const calculatePNL = (markPrice: bigint, entryPrice: bigint): string => {
  const result = ((entryPrice - markPrice) * 100000n) / entryPrice
  return formatUnits(result, 3)
}

//symbol ,size entryPrice  MarkPrice  liqPrice MarginRatio Margin PNL

export const PositionComponent = ({ val }: Props) => {
  const [details, setDetails] = useState({
    markPrice: "0.00",
    pnl: "0.00",
  })

  const symbol =
    val.asset_out.symbol != "USD"
      ? ` ${val.asset_out.symbol}/${val.asset_In.symbol} `
      : `${val.asset_In.symbol}/${val.asset_out.symbol}`
  const amountIn: string = formatUnits(val.amount_in, 18)
  // const amountOut: string = formatUnits(val.debt, 0)
  // const collateral: string = formatUnits(val.collateral, 0)
  const entryPrice: bigint =
    ((val.amount_in - val.collateral) * 10000000000n) / val.debt
  const update = async () => {}

  const updateMarkPrice = async () => {
    try {
      const baseAssetRate = await axios.get(
        `https://api.coinbase.com/v2/exchange-rates?currency=${
          val.asset_out.symbol != "USD"
            ? val.asset_out.symbol
            : val.asset_In.symbol
        }`,
      )
      const markPrice = baseAssetRate.data.data.rates.USD
      const pnl =
        val.asset_out.symbol != "USD"
          ? calculatePNL(parseUnits(markPrice, 10), entryPrice)
          : calculatePNL(entryPrice, parseUnits(markPrice, 10))
      setDetails({ markPrice, pnl })
    } catch {}
  }
  useEffect(() => {
    const interval = setInterval(() => {
      updateMarkPrice()
    }, 1500)
    return () => {
      clearInterval(interval)
    }
  }, [])
  return (
    <div>
      <Row>
        <Col className="" xs={4} lg={2}>
          <div className="py-2 fw-bolder">Symbol</div>
          <div>
            {symbol} {formatUnits(val.amount_in / val.collateral, 0)}x
          </div>
        </Col>
        <Col xs={4} lg={2}>
          <div className="py-2 text-decoration-underline fw-bolder">
            Position Size
          </div>
          <div>
            {amountIn}
            {val.asset_In.symbol}
          </div>
        </Col>
        <Col xs={4} lg={2}>
          <div className="py-2 text-decoration-underline fw-bolder">
            Entry Price
          </div>
          <div>{formatUnits(entryPrice, 10)}</div>
        </Col>
        <Col xs={4} lg={2}>
          <div className="py-2 text-decoration-underline fw-bolder">
            Mark Price
          </div>
          <div>{details.markPrice}</div>
        </Col>
        <Col xs={4} lg={2} className="align-items-center">
          <div className="py-2 text-decoration-underline fw-bolder">PNL</div>
          <div
            className={`p-1 rounded bg-${
              Number(details.pnl) > 0 ? "success" : "danger"
            }`}
          >
            {details.pnl}%
          </div>
        </Col>
      </Row>
    </div>
  )
}
