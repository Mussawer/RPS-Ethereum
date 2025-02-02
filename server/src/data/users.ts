import { HexString, User } from "../types"


let players: User[] = []

const getUser = (userId: string) => players.find(user => user.id === userId)

const updateUser = (userData: User) => {
  const player = players.find((user) => user.address === userData.address)
  if (player) {
    player.choice = userData.choice
  }
}

const getRoomMembers = (gameId: string) =>
  players
    .filter(user => user.gameId === gameId)
    .map(({ id, username }) => ({ id, username }))

const addUser = (user: User) => players.push(user)

const removeUser = (userId: string) => {
  players = players.filter(user => user.id !== userId)
}

export { getUser, getRoomMembers, addUser, removeUser, updateUser }
