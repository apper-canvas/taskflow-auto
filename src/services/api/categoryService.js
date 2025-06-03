import categoriesData from '../mockData/categories.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let categories = [...categoriesData]

export const getAll = async () => {
  await delay(250)
  return [...categories]
}

export const getById = async (id) => {
  await delay(200)
  const category = categories.find(cat => cat.id === id)
  if (!category) {
    throw new Error('Category not found')
  }
  return { ...category }
}

export const create = async (categoryData) => {
  await delay(300)
  const newCategory = {
    id: Date.now().toString(),
    ...categoryData,
    createdAt: new Date().toISOString()
  }
  categories.push(newCategory)
  return { ...newCategory }
}

export const update = async (id, categoryData) => {
  await delay(300)
  const index = categories.findIndex(cat => cat.id === id)
  if (index === -1) {
    throw new Error('Category not found')
  }
  
  categories[index] = {
    ...categories[index],
    ...categoryData
  }
  return { ...categories[index] }
}

export const delete_ = async (id) => {
  await delay(200)
  const index = categories.findIndex(cat => cat.id === id)
  if (index === -1) {
    throw new Error('Category not found')
  }
  
  const deletedCategory = categories[index]
  categories.splice(index, 1)
  return { ...deletedCategory }
}

// Alias for delete since 'delete' is a reserved keyword
export { delete_ as delete }