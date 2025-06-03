import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

function App() {
  return (
<div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/10 to-surface-100 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-primary-400/20 dark:from-primary-800/10 dark:to-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-200/20 to-secondary-400/20 dark:from-secondary-800/10 dark:to-secondary-600/10 rounded-full blur-3xl" />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        className="mt-20"
        toastClassName="backdrop-blur-sm"
      />
    </div>
  )
}

export default App