import React, { useState, useEffect } from "react"
import axios from "axios"
import { Row, Col, Modal, Button, Container } from "react-bootstrap"

type Props = {
  baseAsset: string
  selectChange?: () => void
  selectShow?: () => void
}
//https://api.kucoin.com/api/v1/market/stats?symbol=BTC-USDT

//vol,high,low,last,changeRate
const getDetails = async (baseAsset: string) => {
  const [show, setShow] = useState<boolean>(false)
  try {
    const result = await axios.get(
      `https://api.kucoin.com/api/v1/market/stats?symbol=${baseAsset}-USDT`,
    )
    const { data } = result
    return data
  } catch {}
}
export const CurrentPair = (props: Props) => {
  const [pairDetails, setPairDetails] = useState({
    high: "0.00",
    low: "0.00",
    bid: "0.00",
    ask: "0.00",
  })

  const updatePrice = async () => {
    try {
      const result = await axios.get(
        `https://api.gemini.com/v2/ticker/${props.baseAsset.toLowerCase()}usd`,
      )
      const { bid, high, low, ask } = result.data

      setPairDetails({ bid, high, low, ask })
    } catch (err) {}
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updatePrice()
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [props])
  return (
    <Row
      onClick={props.selectChange}
      className=" bg-dark my-2 border rounded   justify-content-between border-1 border-warning text-center "
    >
      <Col className="text-center fw-bolder  " xs={6}>
        High
      </Col>
      <Col className="text-center fw-bolder" xs={6}>
        Low
      </Col>
      <Col xs={6} className="text-center green">
        ${pairDetails.high}
      </Col>
      <Col className="text-center red" xs={6}>
        ${pairDetails.low}
      </Col>
    </Row>
  )
}
