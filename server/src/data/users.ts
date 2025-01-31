import { User } from "../types"


let users: User[] = []

const getUser = (userId: string) => users.find(user => user.id === userId)

const getRoomMembers = (gameId: string) =>
  users
    .filter(user => user.gameId === gameId)
    .map(({ id, username }) => ({ id, username }))

const addUser = (user: User) => users.push(user)

const removeUser = (userId: string) => {
  users = users.filter(user => user.id !== userId)
}

export { getUser, getRoomMembers, addUser, removeUser }
