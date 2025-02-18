import { Player} from "../types"


let players: Player[] = []

const getPlayer = (userId: string) => players.find(user => user.id === userId)

const updatePlayer = (userData: Player) => {
  const player = players.find((user) => user.address === userData.address)
  if (player) {
    player.choiceHash = userData.choiceHash
    player.stake = userData.stake
    player.contractAddress = userData.contractAddress
  }
}

const getRoomMembers = (gameId: string) =>
  players
    .filter(user => user.gameId === gameId)
    .map(({ id, username, gameId, address, p1, choiceHash, contractAddress, stake }) => ({ id, username, gameId, address, p1, choiceHash, contractAddress, stake }))

const addPlayer = (user: Player) => players.push(user)

const removePlayer = (userId: string) => {
  players = players.filter(user => user.id !== userId)
}

export { getPlayer, getRoomMembers, addPlayer, removePlayer, updatePlayer }
