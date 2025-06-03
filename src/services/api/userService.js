import usersData from '../mockData/users.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let users = [...usersData]

export const getAll = async () => {
  await delay(300)
  return [...users]
}

export const getById = async (id) => {
  await delay(250)
  const user = users.find(user => user.id === id)
  if (!user) {
    throw new Error('User not found')
  }
  return { ...user }
}

export const create = async (userData) => {
  await delay(400)
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString(),
    preferences: userData.preferences || {
      theme: 'light',
      notifications: true,
      defaultView: 'list'
    }
  }
  users.push(newUser)
  return { ...newUser }
}

export const update = async (id, userData) => {
  await delay(350)
  const index = users.findIndex(user => user.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }
  
  users[index] = {
    ...users[index],
    ...userData
  }
  return { ...users[index] }
}

export const delete_ = async (id) => {
  await delay(250)
  const index = users.findIndex(user => user.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }
  
  const deletedUser = users[index]
  users.splice(index, 1)
  return { ...deletedUser }
}

// Alias for delete since 'delete' is a reserved keyword
export { delete_ as delete }