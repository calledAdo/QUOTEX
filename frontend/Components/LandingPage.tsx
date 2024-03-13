import React from "react"
import {
  Button,
  Col,
  Container,
  Image,
  Nav,
  Navbar,
  Row,
} from "react-bootstrap"

type Props = {
  show?: () => void
}

export const LandingPage = ({ show }: Props) => {
  return (
    <Container className="Landing_Page">
      <Navbar>
        <Container>
          <Navbar.Brand className="text-warning">Quotex</Navbar.Brand>
          <Nav>
            <Nav.Link>Docs</Nav.Link>
            <Nav.Item
              as={Button}
              onClick={show}
              className="btn-dark btn-outline-warning justify-content-center"
            >
              Start Trading
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>
      <Row className="my-5 justify-content-center g-2">
        <Col xs={12} md={7} className=" my-5">
          <Row className=" text-warning fs-1 fw-bolder text-center">
            TRADE ckBTC PERPETUAL
          </Row>
          <Row className=" text-center">
            Dive into the of world top trading with zero slippage utilising our
            unique price discovery model to make swift trades with up to 50x +
            leverage on all your trades
          </Row>
          <Row className="justify-content-center">
            <Col xs={4}></Col>
            <Col
              as={Button}
              size="sm"
              className="btn-dark btn-outline-warning my-2 text center"
            >
              Trade Now
            </Col>
            <Col xs={4}></Col>
          </Row>
        </Col>
        <Col xs={12} md={8}>
          <Row>
            <Col
              as={Image}
              className="TradeImage"
              src="https://cdn.pixabay.com/photo/2016/11/27/21/42/stock-1863880_1280.jpg"
              style={{ height: "350px" }}
            ></Col>
          </Row>
        </Col>
      </Row>
      <Row className="row justify-content-between  text-dark g-2 ">
        <Col md={4} className=" bg-warning fw-bolder  p-3  rounded ">
          <Col>Total Trade Volume</Col>
          <Col className="fs-3">3.5M</Col>
        </Col>
        <Col md={4} className="bg-warning fw-bolder  p-3   rounded ">
          <Col>Total No of Trades</Col>
          <Col className="fs-3">4.2M</Col>
        </Col>
        <Col md={4} className="bg-warning fw-bolder  p-3  rounded ">
          <Col>Open Interest</Col>
          <Col className="fs-3">100K</Col>
        </Col>
      </Row>
    </Container>
  )
}
