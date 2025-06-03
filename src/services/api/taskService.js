import tasksData from '../mockData/tasks.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let tasks = [...tasksData]

export const getAll = async () => {
  await delay(300)
  return [...tasks]
}

export const getById = async (id) => {
  await delay(200)
  const task = tasks.find(task => task.id === id)
  if (!task) {
    throw new Error('Task not found')
  }
  return { ...task }
}

export const create = async (taskData) => {
  await delay(400)
  const newTask = {
    id: Date.now().toString(),
    ...taskData,
    status: taskData.status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: taskData.tags || [],
    subtasks: []
  }
  tasks.push(newTask)
  return { ...newTask }
}

export const update = async (id, taskData) => {
  await delay(350)
  const index = tasks.findIndex(task => task.id === id)
  if (index === -1) {
    throw new Error('Task not found')
  }
  
  tasks[index] = {
    ...tasks[index],
    ...taskData,
    updatedAt: new Date().toISOString()
  }
  return { ...tasks[index] }
}

export const delete_ = async (id) => {
  await delay(250)
  const index = tasks.findIndex(task => task.id === id)
  if (index === -1) {
    throw new Error('Task not found')
  }
  
  const deletedTask = tasks[index]
  tasks.splice(index, 1)
  return { ...deletedTask }
}

// Alias for delete since 'delete' is a reserved keyword
export { delete_ as delete }