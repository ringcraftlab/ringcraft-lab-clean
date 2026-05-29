import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Step1 from './pages/Step1'
import Step2 from './pages/Step2'
import Step3 from './pages/Step3'
import Step4 from './pages/Step4'
import Tool from './pages/Tool'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/tool', element: <Tool /> },
  { path: '/tool/step1', element: <Step1 /> },
  { path: '/tool/step2', element: <Step2 /> },
  { path: '/tool/step3', element: <Step3 /> },
  { path: '/tool/step4', element: <Step4 /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
