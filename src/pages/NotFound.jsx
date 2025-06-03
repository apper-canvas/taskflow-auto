import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-surface-100 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <div className="text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center">
            <ApperIcon name="SearchX" className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-surface-900 dark:text-surface-100 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-surface-700 dark:text-surface-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. Let's get you back to managing your tasks.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-soft hover:shadow-card"
          >
            <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            <span>Back to TaskFlow</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound