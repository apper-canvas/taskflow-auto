import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import ApperIcon from './ApperIcon'
import * as taskService from '../services/api/taskService'

const MainFeature = ({ tasks, categories, onTasksUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('dueDate')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    categoryId: '',
    tags: ''
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      categoryId: '',
      tags: ''
    })
    setEditingTask(null)
    setShowCreateForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Task title is required')
      return
    }

    setLoading(true)
    try {
      const taskData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        status: editingTask ? editingTask.status : 'pending'
      }

      if (editingTask) {
        await taskService.update(editingTask.id, taskData)
        toast.success('Task updated successfully!')
      } else {
        await taskService.create(taskData)
        toast.success('Task created successfully!')
      }

      resetForm()
      onTasksUpdate()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      categoryId: task.categoryId || '',
      tags: task.tags ? task.tags.join(', ') : ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    setLoading(true)
    try {
      await taskService.delete(taskId)
      toast.success('Task deleted successfully!')
      onTasksUpdate()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (task) => {
    setLoading(true)
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      await taskService.update(task.id, { ...task, status: newStatus })
      toast.success(`Task marked as ${newStatus}!`)
      onTasksUpdate()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      default: return 'text-surface-600 bg-surface-50 border-surface-200 dark:bg-surface-800 dark:border-surface-700'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
      default: return 'text-surface-600 bg-surface-50 border-surface-200 dark:bg-surface-800 dark:border-surface-700'
    }
  }

  const getDueDateDisplay = (dueDate) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    
    if (isToday(date)) return { text: 'Today', color: 'text-blue-600' }
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-yellow-600' }
    if (isPast(date)) return { text: 'Overdue', color: 'text-red-600' }
    
    return { text: format(date, 'MMM dd'), color: 'text-surface-600 dark:text-surface-400' }
  }

  const filteredAndSortedTasks = tasks
    ?.filter(task => 
      task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'status':
          const statusOrder = { pending: 3, in_progress: 2, completed: 1 }
          return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0)
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
    }) || []

return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-100 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <div className="glass-effect dark:glass-effect-dark rounded-3xl p-8 lg:p-10 space-y-8 lg:space-y-10 shadow-elevation-2 border border-white/20 dark:border-surface-700/30">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative group">
              <ApperIcon name="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-full sm:w-72 h-12 rounded-2xl shadow-soft focus:shadow-elevation-1 focus:scale-[1.02] transition-all duration-300"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-full sm:w-auto h-12 rounded-2xl shadow-soft focus:shadow-elevation-1 focus:scale-[1.02] transition-all duration-300"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>

          {/* Create Task Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-8 rounded-2xl shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 flex items-center space-x-3 w-full sm:w-auto justify-center group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ApperIcon name="Plus" className="w-6 h-6 relative z-10" />
            <span className="relative z-10 font-medium">New Task</span>
          </motion.button>
        </div>

        {/* Create/Edit Form Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && resetForm()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative glass-effect dark:glass-effect-dark w-full max-w-3xl p-8 lg:p-10 max-h-[90vh] overflow-y-auto rounded-3xl shadow-elevation-3 border border-white/30 dark:border-surface-700/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-surface-900 to-surface-700 dark:from-surface-100 dark:to-surface-300 bg-clip-text text-transparent">
                        {editingTask ? 'Edit Task' : 'Create New Task'}
                      </h2>
                      <p className="text-surface-600 dark:text-surface-400 mt-2">
                        {editingTask ? 'Update your task details' : 'Add a new task to your workflow'}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={resetForm}
                      className="p-3 hover:bg-surface-100/80 dark:hover:bg-surface-700/80 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                    >
                      <ApperIcon name="X" className="w-6 h-6" />
                    </motion.button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="input-field h-14 rounded-2xl shadow-soft focus:shadow-elevation-1 focus:scale-[1.01] transition-all duration-300"
                        placeholder="Enter a descriptive task title..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="input-field resize-none rounded-2xl shadow-soft focus:shadow-elevation-1 focus:scale-[1.01] transition-all duration-300"
                        rows="4"
                        placeholder="Add more details about this task..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="input-field h-14 rounded-2xl shadow-soft focus:shadow-elevation-1 focus:scale-[1.01] transition-all duration-300"
                        >
                          <option value="low">🟢 Low Priority</option>
                          <option value="medium">🟡 Medium Priority</option>
                          <option value="high">🟠 High Priority</option>
                          <option value="urgent">🔴 Urgent</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="input-field h-14 rounded-2xl shadow-soft focus:shadow-elevation-1 focus:scale-[1.01] transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                          Category
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="input-field h-14 rounded-2xl shadow-soft focus:shadow-elevation-1 focus:scale-[1.01] transition-all duration-300"
                        >
                          <option value="">Select a category...</option>
                          {categories?.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="input-field h-14 rounded-2xl shadow-soft focus:shadow-elevation-1 focus:scale-[1.01] transition-all duration-300"
                          placeholder="work, urgent, project..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative overflow-hidden bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 disabled:from-surface-400 disabled:to-surface-500 text-white font-semibold py-4 px-8 rounded-2xl shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 flex items-center justify-center space-x-3 flex-1 group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-3 border-white border-t-transparent rounded-full relative z-10"
                          />
                        ) : (
                          <>
                            <ApperIcon name={editingTask ? "Save" : "Plus"} className="w-6 h-6 relative z-10" />
                            <span className="relative z-10">{editingTask ? 'Update Task' : 'Create Task'}</span>
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={resetForm}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-secondary flex-1 py-4 px-8 rounded-2xl shadow-soft hover:shadow-elevation-1 transition-all duration-300"
                      >
Cancel
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className="space-y-6">
          {filteredAndSortedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative overflow-hidden glass-effect dark:glass-effect-dark p-12 lg:p-16 text-center rounded-3xl shadow-elevation-2 border border-white/20 dark:border-surface-700/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/20" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 rounded-3xl flex items-center justify-center shadow-soft">
                  <ApperIcon name="ListTodo" className="w-12 h-12 text-surface-400" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-surface-900 to-surface-700 dark:from-surface-100 dark:to-surface-300 bg-clip-text text-transparent mb-3">
                  {searchTerm ? 'No tasks found' : 'Welcome to TaskFlow'}
                </h3>
                <p className="text-surface-600 dark:text-surface-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'Your productivity journey starts here. Create your first task and take control of your workflow.'
                  }
                </p>
                {!searchTerm && (
                  <motion.button
                    onClick={() => setShowCreateForm(true)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-semibold py-4 px-8 rounded-2xl shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Create Your First Task</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-6 lg:gap-8">
              {filteredAndSortedTasks.map((task, index) => {
                const dueDateInfo = getDueDateDisplay(task.dueDate)
                const category = categories?.find(cat => cat.id === task.categoryId)
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.5,
                      type: "spring",
                      damping: 25,
                      stiffness: 300 
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`relative overflow-hidden glass-effect dark:glass-effect-dark p-6 lg:p-8 transition-all duration-300 hover:shadow-elevation-3 rounded-3xl border border-white/20 dark:border-surface-700/30 group ${
                      task.status === 'completed' ? 'opacity-80' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4 mb-4">
                          {/* Enhanced Checkbox */}
                          <motion.button
                            onClick={() => handleStatusToggle(task)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`mt-1 w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 shadow-soft ${
                              task.status === 'completed'
                                ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white shadow-green-200'
                                : 'border-surface-300 dark:border-surface-600 hover:border-primary hover:shadow-primary/20 hover:bg-primary/5'
                            }`}
                          >
                            {task.status === 'completed' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 15, stiffness: 300 }}
                              >
                                <ApperIcon name="Check" className="w-5 h-5" />
                              </motion.div>
                            )}
                          </motion.button>

                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-xl mb-2 transition-all duration-300 ${
                              task.status === 'completed'
                                ? 'line-through text-surface-500 dark:text-surface-500'
                                : 'text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                            }`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-surface-600 dark:text-surface-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            {/* Enhanced Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {task.tags.map((tag, tagIndex) => (
                                  <motion.span
                                    key={tagIndex}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: tagIndex * 0.1 }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 text-surface-600 dark:text-surface-400 text-xs font-medium rounded-xl shadow-soft border border-surface-200/50 dark:border-surface-600/50"
                                  >
                                    #{tag}
                                  </motion.span>
                                ))}
                              </div>
                            )}

                            {/* Enhanced Meta Information */}
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              {/* Priority with enhanced styling */}
                              <span className={`px-3 py-2 rounded-xl border text-xs font-bold shadow-soft ${getPriorityColor(task.priority)}`}>
                                {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                              </span>

                              {/* Status with enhanced styling */}
                              <span className={`px-3 py-2 rounded-xl border text-xs font-bold shadow-soft ${getStatusColor(task.status)}`}>
                                {task.status?.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>

                              {/* Category with enhanced styling */}
                              {category && (
                                <span className="px-3 py-2 bg-gradient-to-r from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 text-surface-600 dark:text-surface-400 rounded-xl text-xs font-medium shadow-soft border border-surface-200/50 dark:border-surface-600/50">
                                  {category.name}
                                </span>
                              )}

                              {/* Due Date with enhanced styling */}
                              {dueDateInfo && (
                                <span className={`flex items-center space-x-2 text-xs font-medium px-3 py-2 rounded-xl shadow-soft bg-white/50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-600/50 ${dueDateInfo.color}`}>
                                  <ApperIcon name="Calendar" className="w-4 h-4" />
                                  <span>{dueDateInfo.text}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Actions */}
                      <div className="flex items-center space-x-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                        <motion.button
                          onClick={() => handleEdit(task)}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 hover:bg-surface-100/80 dark:hover:bg-surface-700/80 rounded-2xl transition-all duration-300 shadow-soft hover:shadow-elevation-1 backdrop-blur-sm border border-surface-200/50 dark:border-surface-600/50"
                          title="Edit task"
                        >
                          <ApperIcon name="Edit2" className="w-6 h-6 text-surface-500 hover:text-primary transition-colors" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(task.id)}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 shadow-soft hover:shadow-elevation-1 backdrop-blur-sm border border-surface-200/50 dark:border-surface-600/50 hover:border-red-200 dark:hover:border-red-800"
                          title="Delete task"
                        >
                          <ApperIcon name="Trash2" className="w-6 h-6 text-surface-500 hover:text-red-500 transition-colors" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MainFeature