import React, { useState, useEffect } from "react"
import axios from "axios"
import { Col, Row } from "react-bootstrap"
import { parseUnits } from "ethers"

type Props = {
  index: number
}
export const ChartData = ({ index }: Props) => {
  const [changes, setChanges] = useState({
    percent_change_24h: "0.00",
    percent_change_1h: "0.00",
    percent_change_7d: "0.00",
    price_usd: "0.00",
  })

  const updateChanges = async () => {
    try {
      const { data } = await axios.get("https://api.coinlore.net/api/tickers/")
      const coinStats = data.data[index]
      const {
        percent_change_24h,
        percent_change_1h,
        percent_change_7d,
        price_usd,
      } = coinStats
      //console.log(coinStats)
      setChanges({
        percent_change_1h,
        percent_change_24h,
        percent_change_7d,
        price_usd,
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateChanges()
    }, 2500)

    return () => {
      clearInterval(interval)
    }
  }, [index])

  return (
    <Row className="bg-warning opacity-75 rounded text-dark  my-1 fw-bolder">
      <Col className=" border border-dark rounded-start border-2">
        <Row className="justify-content-center">Price</Row>
        <Row className="justify-content-center">${changes.price_usd}</Row>
      </Col>
      <Col className="border border-dark  border-2">
        <Row className="justify-content-center">1hr Vol</Row>
        <Row
          className={`
            ${
              parseUnits(changes.percent_change_1h, 2) < 0n ? "red" : "green"
            } justify-content-center`}
        >
          {changes.percent_change_1h}%
        </Row>
      </Col>
      <Col className="border border-2 border-dark  ">
        <Row className="justify-content-center">24hr Vol </Row>
        <Row
          className={`
         ${
           parseUnits(changes.percent_change_24h, 2) < 0n ? "red" : "green"
         } justify-content-center`}
        >
          {changes.percent_change_24h}%
        </Row>
      </Col>
      <Col className="border border-2 border-dark rounded-end">
        <Row className="justify-content-center">7d Vol</Row>
        <Row
          className={`
          ${
            parseUnits(changes.percent_change_7d, 2) < 0n ? "red" : "green"
          } justify-content-center`}
        >
          {changes.percent_change_7d}%
        </Row>
      </Col>
    </Row>
  )
}
