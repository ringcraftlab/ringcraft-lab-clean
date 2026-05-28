import { createBrowserRouter, Link, Outlet, RouterProvider } from 'react-router-dom'

function Layout() {
  return (
    <main style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <Link to="/">Home</Link>
        <Link to="/tool">Tool</Link>
      </nav>
      <Outlet />
    </main>
  )
}

function HomePage() {
  return <h1>Home</h1>
}

function ToolPage() {
  return <h1>Tool</h1>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tool', element: <ToolPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
