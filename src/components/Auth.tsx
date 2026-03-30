import { useState } from 'react'
import { supabase } from '@/lib/supabase'

import { motion } from 'framer-motion'
import { Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const isRegister = false;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success("Compte créé avec succès !")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success("Connexion réussie !")
      }
    } catch (error) {
      if(error instanceof Error) {
        toast.error(error.message || "Une erreur d'authentification est survenue")
      } else {
        toast.error("Une erreur d'authentification est survenue")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 transition-colors">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-125 bg-linear-to-b from-blue-500/20 to-transparent blur-3xl rounded-full translate-y-[-50%]" />
        <div className="absolute inset-x-0 bottom-0 h-125 bg-linear-to-t from-purple-500/20 to-transparent blur-3xl rounded-full translate-y-[50%]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-border/40 bg-zinc-900/80 backdrop-blur-xl shadow-2xl text-zinc-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
              <span className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/50">
                {isRegister ? <UserPlus className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
              </span>
              {isRegister ? "Créer un compte" : "Bon retour"}
            </CardTitle>
            <CardDescription className="text-zinc-400 text-center mt-2">
              {isRegister ? "Entrez vos informations pour vous inscrire" : "Connectez-vous pour accéder à votre tableau de bord"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Adresse Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-100 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-lg h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Mot de passe</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-zinc-950/50 border-zinc-800 text-zinc-100 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-lg h-11"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/30 group" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> :
                  isRegister ? "Créer un compte" : "Se connecter"
                }
              </Button>
            </form>
          </CardContent>
          {/* <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900 px-2 text-zinc-500">or continue with</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-medium hover:text-blue-400 text-zinc-400 transition-colors underline-offset-4 hover:underline"
            >
              {isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </CardFooter> */}
        </Card>
      </motion.div>
    </div>
  )
}
