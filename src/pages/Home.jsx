import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import * as taskService from '../services/api/taskService'
import * as categoryService from '../services/api/categoryService'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadData()
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ])
      setTasks(tasksData || [])
      setCategories(categoriesData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const getTaskStats = () => {
    const total = tasks.length || 0
    const completed = tasks.filter(task => task?.status === 'completed').length || 0
    const pending = tasks.filter(task => task?.status === 'pending').length || 0
    const inProgress = tasks.filter(task => task?.status === 'in_progress').length || 0
    const urgent = tasks.filter(task => task?.priority === 'urgent').length || 0
    
    return { total, completed, pending, inProgress, urgent }
  }

  const stats = getTaskStats()

  const filteredTasks = tasks.filter(task => {
    if (!task) return false
    
    switch (activeFilter) {
      case 'completed':
        return task.status === 'completed'
      case 'pending':
        return task.status === 'pending'
      case 'in_progress':
        return task.status === 'in_progress'
      case 'urgent':
        return task.priority === 'urgent'
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-100 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-surface-900/80 border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <ApperIcon name="CheckSquare" className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </motion.div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Quick Stats */}
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-surface-600 dark:text-surface-400">
                  <ApperIcon name="Target" className="w-4 h-4" />
                  <span>{stats.total} Total</span>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <ApperIcon name="CheckCircle2" className="w-4 h-4" />
                  <span>{stats.completed} Done</span>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <ApperIcon 
                  name={darkMode ? "Sun" : "Moon"} 
                  className="w-5 h-5 text-surface-600 dark:text-surface-400" 
                />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8"
        >
          <div className="card p-4 lg:p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Target" className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stats.total}</div>
            <div className="text-sm text-surface-600 dark:text-surface-400">Total Tasks</div>
          </div>
          
          <div className="card p-4 lg:p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="CheckCircle2" className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stats.completed}</div>
            <div className="text-sm text-surface-600 dark:text-surface-400">Completed</div>
          </div>
          
          <div className="card p-4 lg:p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Clock" className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stats.pending}</div>
            <div className="text-sm text-surface-600 dark:text-surface-400">Pending</div>
          </div>
          
          <div className="card p-4 lg:p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Play" className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stats.inProgress}</div>
            <div className="text-sm text-surface-600 dark:text-surface-400">In Progress</div>
          </div>
          
          <div className="card p-4 lg:p-6 text-center col-span-2 lg:col-span-1">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">{stats.urgent}</div>
            <div className="text-sm text-surface-600 dark:text-surface-400">Urgent</div>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 lg:gap-3 mb-6 lg:mb-8"
        >
          {[
            { key: 'all', label: 'All Tasks', icon: 'List' },
            { key: 'pending', label: 'Pending', icon: 'Clock' },
            { key: 'in_progress', label: 'In Progress', icon: 'Play' },
            { key: 'completed', label: 'Completed', icon: 'CheckCircle2' },
            { key: 'urgent', label: 'Urgent', icon: 'AlertTriangle' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.key
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              <ApperIcon name={filter.icon} className="w-4 h-4" />
              <span className="hidden sm:inline">{filter.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Main Feature Component */}
        <MainFeature 
          tasks={filteredTasks} 
          categories={categories || []}
          onTasksUpdate={loadData}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-card"
          >
            <div className="flex items-center space-x-2">
              <ApperIcon name="AlertCircle" className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default Home