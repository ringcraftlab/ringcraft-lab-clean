import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'

function ToolPage() {
  return <div>Tool</div>
}

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/tool', element: <ToolPage /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
