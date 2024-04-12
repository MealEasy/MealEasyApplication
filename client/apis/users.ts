import request from 'superagent'
import { User } from '../../models/users'

const rootUrl = '/api/v1'

export async function getUserById(id: User) {
  const user = await request.get(`${rootUrl}/users/${id}`)
  console.log('getbyid', user)
  return user.body as User
}

export async function addUser(data: User) {
  await request.post(`${rootUrl}/users/`).send(data)
}
