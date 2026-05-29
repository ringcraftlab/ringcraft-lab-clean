import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Tool from './pages/Tool'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/tool', element: <Tool /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
