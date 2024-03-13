import React, { useState, useEffect, createContext } from "react"
import {
  Button,
  ButtonGroup,
  Container,
  Dropdown,
  Modal,
} from "react-bootstrap"
import TradingViewWidget from "./Components/TradingViewWidget"
import { Trade } from "./Components/Trade"
import { AllPositions } from "./Components/AllPositions"
import { list } from "./Lists/AssetList"

/*
 * Connect2ic provides essential utilities for IC app development
 */

import { createClient } from "@connect2ic/core"
import { defaultProviders, walletProviders } from "@connect2ic/core/providers"
import {
  ConnectButton,
  ConnectDialog,
  Connect2ICProvider,
} from "@connect2ic/react"
import { useWallet } from "@connect2ic/react"
import "@connect2ic/core/style.css"
import { MainInterface } from "src/declarations/MainInterface"
import { PositionLists } from "./Lists/PositionList"
import { Col, Row, ThemeProvider } from "react-bootstrap"
import { CurrentPair } from "./Components/CurrentPair"
import { LandingPage } from "./Components/LandingPage"
import { ChartData } from "./Components/ChartData"
import { Position } from "../src/declarations/MainInterface/MainInterface.did"

//App
function App() {
  const [wallet] = useWallet()
  const [user, setUser] = useState("")
  const [show, setShow] = useState<boolean>(false)
  const [Positions, setPositions] = useState<Position[]>(PositionLists.List)
  const [tradePage, setTradePage] = useState<Boolean>(true)
  const [currentAsset, setCurrentAsset] = useState(1)

  const openPosition = (position) => {
    setPositions([position, ...Positions])
    alert("Succesful")
  }
  const getCurrentAsset = (): string => {
    return list[currentAsset].symbol
  }

  // <a href="https://ibb.co/QXk1hmj"><img src="https://i.ibb.co/25SfRKY/bg.jpg" alt="bg" border="0" /></a>
  const handleShow = () => {
    setShow(true)
  }
  const handleClose = () => {
    setShow(false)
  }
  console.log("updated")
  const handleAssetChange = (index: number) => {
    setCurrentAsset(index)
  }

  const TardeView = <TradingViewWidget baseAsset={`${getCurrentAsset()}`} />
  useEffect(() => {
    if (wallet) {
      console.log(wallet.principal)
      setUser(wallet.principal)
    }
  }, [wallet])

  return (
    <ThemeProvider className="App">
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Body className="bg-dark border rounded border-warning ">
          <Row>
            <Col>Market</Col>
          </Row>
          {list.map((asset) => {
            return (
              <CurrentPair
                key={list.indexOf(asset)}
                selectChange={() => {
                  handleAssetChange(list.indexOf(asset))
                  handleClose()
                }}
                baseAsset={asset.symbol}
              />
            )
          })}
        </Modal.Body>
      </Modal>
      {tradePage ? (
        <LandingPage
          show={() => {
            setTradePage(false)
          }}
        />
      ) : (
        <Container>
          <Row className="auth-section my-3 g-2   justify-content-center">
            <Col xs={7} className="text-start text-warning fs-3 fw-bolder ">
              Quotex
            </Col>
            <Col xs={3} className="">
              <ConnectButton
                style={{ backgroundColor: "#ffc107", color: "black" }}
              />
            </Col>
            <Col xs={2}></Col>
          </Row>
          <div>
            <ConnectDialog />
          </div>
          <Row className=" container">
            <Col
              className="bg-warning text-dark fw-bolder"
              xs={4}
              // onClick={() => {
              //   setShow(true)
              // }}
            >
              <Dropdown as={ButtonGroup}>
                <Button variant="warning">
                  {list[currentAsset].symbol}/USD
                </Button>
                <Dropdown.Toggle
                  split
                  variant="warning"
                  id="dropdown-split-basic"
                ></Dropdown.Toggle>
                <Dropdown.Menu className="bg-dark drop">
                  {list.map((asset) => {
                    return (
                      <Dropdown.Item className="bg-dark">
                        <Row
                          className="bg-dark border-0 "
                          as={Button}
                          onClick={() => {
                            setCurrentAsset(list.indexOf(asset))
                          }}
                        >
                          <Col className="bg-dark" xs={2}>
                            {asset.symbol}/USD
                          </Col>
                          <Col xs={9}>
                            <CurrentPair baseAsset={asset.symbol} />
                          </Col>
                        </Row>
                      </Dropdown.Item>
                    )
                  })}
                  {/* <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item> */}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <CurrentPair
              selectShow={() => {
                handleShow()
              }}
              baseAsset={list[currentAsset].symbol}
            />
          </Row>

          <Row className="justify-content-center gy-2 ">
            <Col xs={12} lg={7} className="TradingViewWidget mx-1">
              <ChartData index={list[currentAsset].index} />
              {TardeView}
            </Col>
            <Col className="TradeComponent" lg={4}>
              <Trade
                baseAsset={list[currentAsset].symbol}
                createPosition={(position: Position) => {
                  openPosition(position)
                }}
                quoteAsset={"USD"}
              />
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col
              lg={7}
              className="PositionsList justify-content-center px-2 my-2"
              sm={10}
            >
              <AllPositions
                positions={Positions}
                user={wallet ? wallet.principal : "tjmnu-6aaaa-aaaal-adjha-cai"}
              />
            </Col>
            <Col lg={4} className="positions"></Col>
          </Row>
        </Container>
      )}
    </ThemeProvider>
  )
}

const client = createClient({
  canisters: {},
  providers: defaultProviders,
  globalProviderConfig: {
    dev: import.meta.env.DEV,
  },
})

export default () => (
  <Connect2ICProvider client={client}>
    <App />
  </Connect2ICProvider>
)
