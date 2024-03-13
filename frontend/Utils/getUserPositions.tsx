import { Position } from "../../src/declarations/MainInterface/MainInterface.did"
import { MainInterface } from "../../src/declarations/MainInterface"
import { Principal } from "@dfinity/principal"

export const getUserPositions = async (user: string): Promise<Position[]> => {
  try {
    const positions: Position[] = await MainInterface.getUserPositions(
      Principal.fromText(user),
    )
    return positions
  } catch (err) {
    return []
  }
}
