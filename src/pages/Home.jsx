import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import * as taskService from '../services/api/taskService'
import * as categoryService from '../services/api/categoryService'
import { format } from 'date-fns'
import clsx from 'clsx'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showQuickAdd, setShowQuickAdd] = useState(false)

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
      // Simulate network delay for better loading experience
      await new Promise(resolve => setTimeout(resolve, 800))
      
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
  
  // Calculate productivity score
  const productivityScore = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0

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

  // Skeleton component for loading states
  const SkeletonCard = () => (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-12 w-12 rounded-xl" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
      <div className="skeleton h-8 w-16 rounded mb-2" />
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  )
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }
return (
    <div className="min-h-screen relative">
      {/* Floating Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="glass-effect dark:glass-effect-dark rounded-2xl shadow-elevation-2 px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-glow animate-pulse-soft">
                  <ApperIcon name="CheckSquare" className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gradient">
                    TaskFlow
                  </h1>
                  <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
                    {format(new Date(), 'EEEE, MMMM d')}
                  </p>
                </div>
              </motion.div>

              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Productivity Score */}
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-surface-100/50 dark:bg-surface-800/50 rounded-xl">
                  <div className="text-sm">
                    <div className="text-surface-500 dark:text-surface-400">Productivity</div>
                    <div className="text-lg font-bold text-gradient">{productivityScore}%</div>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-surface-200 dark:text-surface-700"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - productivityScore / 100)}`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="hidden sm:flex items-center space-x-4 text-sm">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-surface-100/50 dark:bg-surface-800/50 rounded-lg"
                  >
                    <ApperIcon name="Target" className="w-4 h-4 text-primary" />
                    <span className="font-medium">{stats.total}</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-green-100/50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"
                  >
                    <ApperIcon name="CheckCircle2" className="w-4 h-4" />
                    <span className="font-medium">{stats.completed}</span>
                  </motion.div>
                </div>

                {/* Dark Mode Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleDarkMode}
                  className="relative p-3 rounded-xl bg-surface-100/50 dark:bg-surface-800/50 hover:bg-surface-200/50 dark:hover:bg-surface-700/50 transition-all duration-300 group"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={darkMode ? 'sun' : 'moon'}
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ApperIcon 
                        name={darkMode ? "Sun" : "Moon"} 
                        className="w-5 h-5 text-surface-600 dark:text-surface-400 group-hover:text-primary transition-colors" 
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
{/* Main Content */}
      <main className="relative pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Stats Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <SkeletonCard />
                  </motion.div>
                ))}
              </div>
              
              {/* Filter Skeleton */}
              <div className="flex gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-10 w-24 rounded-xl" />
                ))}
              </div>
              
              {/* Main Content Skeleton */}
              <div className="skeleton h-96 w-full rounded-2xl" />
            </motion.div>
          ) : (
            <>
              {/* Stats Overview */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8"
              >
                <motion.div variants={itemVariants}>
                  <div className="stat-card from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-200/50 dark:border-blue-800/50 group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-glow transform group-hover:scale-110 transition-transform duration-300">
                        <ApperIcon name="Target" className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-surface-900 dark:text-surface-100">{stats.total}</div>
                      <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">Total Tasks</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="stat-card from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 border border-green-200/50 dark:border-green-800/50 group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-glow transform group-hover:scale-110 transition-transform duration-300">
                        <ApperIcon name="CheckCircle2" className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-surface-900 dark:text-surface-100">{stats.completed}</div>
                      <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">Completed</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="stat-card from-yellow-500/10 to-yellow-600/10 dark:from-yellow-500/20 dark:to-yellow-600/20 border border-yellow-200/50 dark:border-yellow-800/50 group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-glow transform group-hover:scale-110 transition-transform duration-300">
                        <ApperIcon name="Clock" className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-surface-900 dark:text-surface-100">{stats.pending}</div>
                      <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">Pending</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="stat-card from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 border border-purple-200/50 dark:border-purple-800/50 group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow transform group-hover:scale-110 transition-transform duration-300">
                        <ApperIcon name="Play" className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-surface-900 dark:text-surface-100">{stats.inProgress}</div>
                      <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">In Progress</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="stat-card from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 border border-red-200/50 dark:border-red-800/50 group col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative">
                      <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-glow transform group-hover:scale-110 transition-transform duration-300">
                        <ApperIcon name="AlertTriangle" className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-surface-900 dark:text-surface-100">{stats.urgent}</div>
                      <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">Urgent</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
{/* Filter Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {[
                  { key: 'all', label: 'All Tasks', icon: 'List', color: 'primary' },
                  { key: 'pending', label: 'Pending', icon: 'Clock', color: 'yellow' },
                  { key: 'in_progress', label: 'In Progress', icon: 'Play', color: 'purple' },
                  { key: 'completed', label: 'Completed', icon: 'CheckCircle2', color: 'green' },
                  { key: 'urgent', label: 'Urgent', icon: 'AlertTriangle', color: 'red' }
                ].map((filter, index) => (
                  <motion.button
                    key={filter.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveFilter(filter.key)}
                    className={clsx(
                      'relative flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 transform',
                      activeFilter === filter.key
                        ? 'text-white shadow-elevation-2 scale-105'
                        : 'bg-white/50 dark:bg-surface-800/50 backdrop-blur-sm text-surface-600 dark:text-surface-400 hover:bg-white/80 dark:hover:bg-surface-700/80 hover:shadow-soft border border-surface-200/50 dark:border-surface-700/50'
                    )}
                    style={{
                      background: activeFilter === filter.key 
                        ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                        : undefined,
                      '--tw-gradient-from': activeFilter === filter.key 
                        ? filter.color === 'primary' ? '#6366f1' 
                        : filter.color === 'green' ? '#10b981'
                        : filter.color === 'yellow' ? '#f59e0b'
                        : filter.color === 'purple' ? '#8b5cf6'
                        : '#ef4444'
                        : undefined,
                      '--tw-gradient-to': activeFilter === filter.key 
                        ? filter.color === 'primary' ? '#4f46e5' 
                        : filter.color === 'green' ? '#059669'
                        : filter.color === 'yellow' ? '#d97706'
                        : filter.color === 'purple' ? '#7c3aed'
                        : '#dc2626'
                        : undefined,
                    }}
                  >
                    <ApperIcon name={filter.icon} className="w-4 h-4" />
                    <span>{filter.label}</span>
                    {activeFilter === filter.key && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 rounded-2xl ring-2 ring-white/30 ring-offset-2 ring-offset-transparent"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
{/* Main Feature Component */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <MainFeature 
                  tasks={filteredTasks} 
                  categories={categories || []}
                  onTasksUpdate={loadData}
                />
              </motion.div>
            </>
          )}

          {/* Floating Action Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowQuickAdd(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full shadow-elevation-3 flex items-center justify-center group hover:shadow-glow transition-all duration-300"
          >
            <ApperIcon name="Plus" className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              {stats.pending}
            </div>
          </motion.button>

          {error && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96"
              >
                <div className="glass-effect dark:glass-effect-dark rounded-2xl p-4 shadow-elevation-2 border border-red-200/50 dark:border-red-800/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <ApperIcon name="AlertCircle" className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-surface-900 dark:text-surface-100">Error</p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                    >
                      <ApperIcon name="X" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
)
}

export default Home