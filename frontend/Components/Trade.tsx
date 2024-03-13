import React, { useState, useEffect } from "react"
import { Principal } from "@dfinity/principal"
import {
  Asset,
  Position,
} from "../../src/declarations/MainInterface/MainInterface.did"
import { Row, Col, Form, Container, Button } from "react-bootstrap"
import axios from "axios"
import { PositionLists } from "../Lists/PositionList"
import { formatUnits, parseUnits } from "ethers"
import FormControl from "react-bootstrap"
import { time } from "console"
type Props = {
  baseAsset: string
  quoteAsset: string
  createPosition?: (position: Position) => void
}

type FormControlElement = HTMLInputElement | HTMLTextAreaElement

//when leverage is changed
//if short
//positionSize = positonValuye = collateral  x leverage
//if long
//positionSize= collateral x levarage
//positionValue = positionSize x price
//when collateral is changed

//

export const Trade = ({ baseAsset, quoteAsset, createPosition }: Props) => {
  const [markPrice, setMarkPrice] = useState("0.00")
  const [tradeDetails, setDetails] = useState<{
    isLong: boolean
    leverage: number
    collateral: string
  }>({
    isLong: true,
    leverage: 1,
    collateral: "",
  })

  const [userdetails, setUserDetails] = useState({
    balance: 100.02,
    isLong: true,
  })
  const getPositionSize = (): number => {
    return Number(tradeDetails.collateral) * tradeDetails.leverage
  }

  const openPosition = () => {
    const newPosition = {
      owner: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
      debt_pool: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
      debt:
        BigInt(tradeDetails.leverage - 1) *
        parseUnits(tradeDetails.collateral, 18),
      collateral: parseUnits(tradeDetails.collateral, 18),
      timestamp: 100000000345n,
      amount_in:
        BigInt(tradeDetails.leverage) * parseUnits(tradeDetails.collateral, 18),
      marginFee: parseUnits("4", 4),
      asset_In: {
        id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
        class: { Cryptocurrency: null },
        symbol: `${tradeDetails.isLong ? baseAsset : "USD"}`,
      },
      asset_out: {
        id: Principal.fromText("tjmnu-6aaaa-aaaal-adjha-cai"),
        class: { Cryptocurrency: null },
        symbol: `${tradeDetails.isLong ? "USD" : baseAsset}`,
      },
    }
    if (newPosition.collateral > 0n) {
      createPosition(newPosition)
      console.log("done")
    }
  }
  const getPositionValue = (): number | string => {
    const size = getPositionSize()
    return tradeDetails.isLong
      ? formatUnits(
          parseUnits(size.toString(), 4) * parseUnits(markPrice, 5),
          9,
        )
      : size
  }
  const collateralChange = async (e: React.ChangeEvent<FormControlElement>) => {
    const collateral = e.target.value
    setDetails({ ...tradeDetails, collateral })
  }

  const leverageChange = async (e: React.ChangeEvent<FormControlElement>) => {
    const leverage: number = Number(e.target.value)
    setDetails({ ...tradeDetails, leverage })
  }
  const updateMarkPrice = async () => {
    try {
      const baseAssetRate = await axios.get(
        `https://api.coinbase.com/v2/exchange-rates?currency=${baseAsset}`,
      )
      const markPrice: string = baseAssetRate.data.data.rates.USD
      setMarkPrice(markPrice)
    } catch {}
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateMarkPrice()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [baseAsset, quoteAsset])
  return (
    <Row className="bd-black border text-warning rounded border-warning p-3 justify-content-center">
      <Row className=" text-center">
        <Col
          as={Button}
          xs={5}
          onClick={() => {
            setDetails({ ...tradeDetails, isLong: true })
          }}
          className="btn-dark btn-outline-success p-1 mx-2 rounded"
        >
          LONG
        </Col>
        <Col
          as={Button}
          xs={5}
          onClick={() => {
            setDetails({ ...tradeDetails, isLong: false })
          }}
          className="btn-dark btn-outline-danger p-1 mx-2 rounded"
        >
          SHORT
        </Col>
      </Row>
      <Row className="bd-black p-1 my-2 g-1">
        <Col xs={8}>Collateral</Col>
        <Col xs={3}>Asset</Col>
        <Col xs={9}>
          <Form.Control
            value={tradeDetails.collateral}
            className="border-0 text-warning fw-bolder  bg-dark"
            type="number"
            onChange={(e) => {
              collateralChange(e)
            }}
          ></Form.Control>
        </Col>
        <Col xs={2} className="text-center fs-4 ">
          {tradeDetails.isLong ? baseAsset : quoteAsset}
        </Col>
      </Row>
      <Row className="bd-black p-3  justify-content-between">
        <Col xs={5}>$ {getPositionValue()}</Col>
        <Col xs={5}>Leverage:{tradeDetails.leverage}x</Col>
      </Row>
      <Row className="bd-black p-3 fs-4">
        <Col xs={8}>{getPositionSize()}</Col>
        <Col xs={2}>{tradeDetails.isLong ? baseAsset : quoteAsset}</Col>
      </Row>
      <Row className="bd-black justify-content-center">
        <Col xs={11}>
          <Form.Range
            min={1}
            value={tradeDetails.leverage}
            max={50}
            onChange={(e) => {
              leverageChange(e)
            }}
          ></Form.Range>
        </Col>
        <Col xs={11} className="row justify-content-between">
          <div className="col text-start">1</div>
          {[15, 25, 35].map((val) => {
            return (
              <div key={val} className="col text-center">
                {val}
              </div>
            )
          })}
          <div className="col text-end">50</div>
        </Col>
      </Row>

      <Row className="bd-black g-4 my-2">
        <Col xs={6}>Pool</Col>
        <Col className=" text-decoration-underline fw-bolder" xs={6}>
          {baseAsset}-{quoteAsset} Pool
        </Col>
        <Col xs={6}>Collateral</Col>
        <Col className=" text-decoration-underline fw-bolder" xs={6}>
          {" "}
          {tradeDetails.isLong ? baseAsset : quoteAsset}
        </Col>
        <Col xs={6}>Current Price</Col>
        <Col className=" text-decoration-underline fw-bolder" xs={6}>
          {markPrice}
        </Col>
        <Col className="d-grid" xs={12}>
          <Button
            onClick={openPosition}
            size="lg"
            className={` btn-warning text-dark ${
              tradeDetails.isLong
                ? "btn-outline-success text-white"
                : " btn-outline-danger text-white"
            }`}
          >
            {tradeDetails.isLong ? "Long" : "Short"}
          </Button>
        </Col>
      </Row>
    </Row>
  )
}
