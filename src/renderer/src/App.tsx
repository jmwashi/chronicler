import { createHashRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Characters from '@/pages/Characters'
import CharacterDetail from '@/pages/Characters/CharacterDetail'
import Lore from '@/pages/Lore'
import LoreDetail from '@/pages/Lore/LoreDetail'
import Notes from '@/pages/Notes'
import NoteDetail from '@/pages/Notes/NoteDetail'
import Documents from '@/pages/Documents'
import DocumentDetail from '@/pages/Documents/DocumentDetail'
import Items from '@/pages/Items'
import ItemDetail from '@/pages/Items/ItemDetail'
import Locations from '@/pages/Locations'
import LocationDetail from '@/pages/Locations/LocationDetail'
import Factions from '@/pages/Factions'
import FactionDetail from '@/pages/Factions/FactionDetail'
import Tags from '@/pages/Tags'
import TagDetail from '@/pages/Tags/TagDetail'
import Sessions from '@/pages/Sessions'
import SessionDetail from '@/pages/Sessions/SessionDetail'
import GameRules from '@/pages/GameRules'
import Tools from '@/pages/Tools'

// Hash router is required in Electron — the app uses file:// protocol,
// which cannot serve path-based routes like /characters.
const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true,               element: <Dashboard />      },
      { path: 'characters',        element: <Characters />     },
      { path: 'characters/:id',    element: <CharacterDetail /> },
      { path: 'lore',               element: <Lore />           },
      { path: 'lore/:id',           element: <LoreDetail />     },
      { path: 'documents',          element: <Documents />      },
      { path: 'documents/:id',     element: <DocumentDetail /> },
      { path: 'notes',             element: <Notes />          },
      { path: 'notes/:id',         element: <NoteDetail />     },
      { path: 'items',             element: <Items />          },
      { path: 'items/:id',         element: <ItemDetail />     },
      { path: 'locations',         element: <Locations />      },
      { path: 'locations/:id',     element: <LocationDetail /> },
      { path: 'factions',          element: <Factions />       },
      { path: 'factions/:id',      element: <FactionDetail />  },
      { path: 'tags',              element: <Tags />           },
      { path: 'tags/:id',          element: <TagDetail />      },
      { path: 'sessions',          element: <Sessions />       },
      { path: 'sessions/:id',      element: <SessionDetail />  },
      { path: 'game-rules',        element: <GameRules />      },
      { path: 'tools',             element: <Tools />          }
    ]
  }
])

export default function App() {
  return <RouterProvider router={router} />
}
