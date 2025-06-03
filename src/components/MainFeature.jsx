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
    <div className="space-y-6 lg:space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full sm:w-64"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>

        {/* Create Task Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>New Task</span>
        </motion.button>
      </div>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field resize-none"
                    rows="3"
                    placeholder="Enter task description..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select category...</option>
                      {categories?.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="input-field"
                      placeholder="work, urgent, project..."
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center space-x-2 flex-1"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <ApperIcon name={editingTask ? "Save" : "Plus"} className="w-5 h-5" />
                        <span>{editingTask ? 'Update Task' : 'Create Task'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredAndSortedTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 lg:p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-surface-100 dark:bg-surface-700 rounded-2xl flex items-center justify-center">
              <ApperIcon name="ListTodo" className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
              {searchTerm ? 'No tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or filters.'
                : 'Create your first task to get started with TaskFlow.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create Your First Task
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 lg:gap-6">
            {filteredAndSortedTasks.map((task, index) => {
              const dueDateInfo = getDueDateDisplay(task.dueDate)
              const category = categories?.find(cat => cat.id === task.categoryId)
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`task-card p-4 lg:p-6 transition-all duration-200 hover:shadow-card group ${
                    task.status === 'completed' ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleStatusToggle(task)}
                          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            task.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-surface-300 dark:border-surface-600 hover:border-primary'
                          }`}
                        >
                          {task.status === 'completed' && (
                            <ApperIcon name="Check" className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-lg mb-1 ${
                            task.status === 'completed'
                              ? 'line-through text-surface-500 dark:text-surface-500'
                              : 'text-surface-900 dark:text-surface-100'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-surface-600 dark:text-surface-400 text-sm mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {task.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 text-xs rounded-lg"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Meta Information */}
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            {/* Priority */}
                            <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                            </span>

                            {/* Status */}
                            <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status?.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>

                            {/* Category */}
                            {category && (
                              <span className="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 rounded-lg text-xs">
                                {category.name}
                              </span>
                            )}

                            {/* Due Date */}
                            {dueDateInfo && (
                              <span className={`flex items-center space-x-1 text-xs ${dueDateInfo.color}`}>
                                <ApperIcon name="Calendar" className="w-3 h-3" />
                                <span>{dueDateInfo.text}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
                        title="Edit task"
                      >
                        <ApperIcon name="Edit2" className="w-5 h-5 text-surface-500 hover:text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
                        title="Delete task"
                      >
                        <ApperIcon name="Trash2" className="w-5 h-5 text-surface-500 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MainFeature