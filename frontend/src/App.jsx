import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AppRouter } from './router/AppRouter'
import { queryClient } from './lib/queryClient'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <ToastContainer
        position="bottom-right"
        newestOnTop
        pauseOnFocusLoss={false}
        theme="dark"
      />
    </QueryClientProvider>
  )
}

export default App
