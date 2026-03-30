import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types'
import { Loader2, ClipboardCheck, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Button } from './ui/button'

interface DashboardProps {
  onSelectSession: (id: number) => void;
}

interface SessionWithProgress extends Session {
  totalQuestions: number;
  answeredQuestions: number;
}

export function Dashboard({ onSelectSession }: DashboardProps) {
  const [sessions, setSessions] = useState<SessionWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessionsWithProgress()
  }, [])

  const fetchSessionsWithProgress = async () => {
    setLoading(true)
    try {
      // 1. Fetch Sessions
      const { data: sessionsData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .order('id', { ascending: false })

      if (sessionError) throw sessionError

      // 2. For each session, fetch total questions and user answers
      const { data: questionsData, error: questionError } = await supabase
        .from('questions')
        .select('id, session_id')

      if (questionError) throw questionError

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: answersData, error: answerError } = await supabase
        .from('answers')
        .select('id, question_id')
        .eq('user_id', user.id)

      if (answerError) throw answerError

      // 3. Combine data
      const processedSessions: SessionWithProgress[] = (sessionsData || []).map(session => {
        const sessionQuestions = (questionsData || []).filter(q => q.session_id === session.id)
        const total = sessionQuestions.length

        // Find answers that belong to this session's questions
        const questionIds = new Set(sessionQuestions.map(q => q.id))
        const answered = (answersData || []).filter(a => questionIds.has(a.question_id)).length

        return {
          ...session,
          totalQuestions: total,
          answeredQuestions: answered
        }
      })

      setSessions(processedSessions)
    } catch (err: any) {
      console.error('Error fetching sessions:', err)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 text-center sm:text-left"
      >
        <h1 className="text-4xl font-extrabold tracking-tight dark:text-zinc-100">Vos Sessions</h1>
        <p className="text-muted-foreground text-lg">Choisissez un questionnaire pour commencer ou reprendre là où vous vous étiez arrêté.</p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session, index) => {
          const progress = session.totalQuestions > 0
            ? Math.round((session.answeredQuestions / session.totalQuestions) * 100)
            : 0
          const isCompleted = progress === 100 && session.totalQuestions > 0

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group border h-full flex flex-col justify-between border-border/50 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-2 mb-4 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                      <ClipboardCheck className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Terminé
                      </span>
                    ) : progress > 0 ? (
                      <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <Clock className="h-3.5 w-3.5" /> En cours
                      </span>
                    ) : (
                      <span className="text-zinc-500 bg-zinc-500/10 px-2.5 py-1 rounded-full text-xs font-semibold">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{session.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">{session.description || "No description provided."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-muted group-hover:bg-muted/80" />
                    <p className="text-[10px] text-muted-foreground text-right">
                      {session.answeredQuestions} sur {session.totalQuestions} questions répondues
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full gap-2 rounded-lg py-6 font-semibold shadow-md active:scale-95 transition-all"
                    variant={isCompleted ? "outline" : "default"}
                    onClick={() => onSelectSession(session.id)}
                  >
                    {isCompleted ? "Revoir les réponses" :
                      progress > 0 ? "Reprendre la session" :
                        "Démarrer la session"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}

        {sessions.length === 0 && !loading && (
          <div className="col-span-full text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border/50">
            <p className="text-muted-foreground italic">Aucune session disponible pour le moment. Veuillez revenir plus tard.</p>
          </div>
        )}
      </div>
    </div>
  )
}
