import { useEffect, useState } from "react"
import React from "react"
import { Nav } from "react-bootstrap"
import { getUserPositions } from "../Utils/getUserPositions"
import { PositionComponent } from "../Components/PositionComponent"
//https://api.coinbase.com/v2/exchange-rates?currency=BTC
import { Position } from "../../src/declarations/MainInterface/MainInterface.did"
import { PositionLists } from "../Lists/PositionList"
import { Button, Col, Row } from "react-bootstrap"

type Props = {
  user?: string
  positions: Position[]
}

export const AllPositions = ({ user, positions }: Props) => {
  return (
    <Row className="bd-black">
      <Col xs={12}>
        <Nav
          variant="underline"
          className=" p-2 border-bottom border-2 border-warning"
          defaultActiveKey="#1"
        >
          <Nav.Item as={Nav.Link} href="#1" className="text-warning">
            Positions
          </Nav.Item>
          <Nav.Item as={Nav.Link} href="#2" className="text-warning">
            Orders
          </Nav.Item>
          <Nav.Item></Nav.Item>
        </Nav>
      </Col>

      <Col xs={12} className="row">
        {positions.map((position) => {
          return (
            <PositionComponent
              val={position}
              key={positions.indexOf(position)}
            />
          )
        })}
      </Col>
    </Row>
  )
}
