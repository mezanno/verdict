import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Auth } from './components/Auth'
import { Dashboard } from './components/Dashboard'
import { SessionView } from './components/SessionView'
import { Loader2 } from 'lucide-react'
import { Toaster } from './components/ui/sonner'

function App() {
  const { user, loading } = useAuth()
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Auth />
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter cursor-pointer" onClick={() => setSelectedSessionId(null)}>
            <span className="bg-primary text-primary-foreground p-1 px-2 rounded-md">V</span>
            <span>Verdict</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">Connecté en tant que {user.email}</span>
            <button
              onClick={() => import('@/lib/supabase').then(s => s.supabase.auth.signOut())}
              className="text-sm font-medium hover:text-primary transition-colors hover:underline"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        {!selectedSessionId ? (
          <Dashboard onSelectSession={setSelectedSessionId} />
        ) : (
          <SessionView
            sessionId={selectedSessionId}
            onBack={() => setSelectedSessionId(null)}
          />
        )}
      </main>
      <Toaster />
    </div>
  )
}

export default App
