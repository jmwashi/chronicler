import { createHashRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Characters from '@/pages/Characters'
import Timeline from '@/pages/Timeline'
import Notes from '@/pages/Notes'

// Hash router is required in Electron — the app uses file:// protocol,
// which cannot serve path-based routes like /characters.
const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true,         element: <Dashboard />  },
      { path: 'characters',  element: <Characters /> },
      { path: 'timeline',    element: <Timeline />   },
      { path: 'notes',       element: <Notes />      }
    ]
  }
])

export default function App() {
  return <RouterProvider router={router} />
}
