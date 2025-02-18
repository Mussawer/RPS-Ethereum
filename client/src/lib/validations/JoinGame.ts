import * as z from 'zod'

export const joinGameSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must contain at least 2 characters')
    .max(50, 'Username must not contain more than 50 characters'),
  gameId: z.string().trim().length(30, 'Room ID must contain exactly 30 characters'),
})
