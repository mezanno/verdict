import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Question, Answer, Session, Source } from '@/types'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

export const evaluationSchema = z.object({
  accuracy: z.string().min(1, 'La précision est requise'),
  historical_accuracy: z.string().min(1, 'La précision historique est requise'),
  grounded_in_sources: z.string().min(1, 'Le fondement dans les sources est requis'),
  comments: z.string().optional(),
})

export type EvaluationFormData = z.infer<typeof evaluationSchema>

interface UseSessionLogicProps {
  sessionId: number;
}

export function useSessionLogic({ sessionId }: UseSessionLogicProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sources, setSources] = useState<Record<string, Source[]>>({})
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [answers, setAnswers] = useState<Record<string, Partial<Answer>>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema) as any,
    defaultValues: {
      accuracy: '',
      historical_accuracy: '',
      grounded_in_sources: '',
      comments: '',
    },
  })

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex])

  useEffect(() => {
    if (currentQuestion) {
      const existing = answers[currentQuestion.id] || {
        accuracy: '',
        historical_accuracy: '',
        grounded_in_sources: '',
        comments: '',
      }
      reset({
        accuracy: existing.accuracy || '',
        historical_accuracy: existing.historical_accuracy || '',
        grounded_in_sources: existing.grounded_in_sources || '',
        comments: existing.comments || '',
      } as EvaluationFormData)
    }
  }, [currentIndex, currentQuestion, reset, answers])

  const fetchSessionData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError
      setSession(sessionData)

      const { data: questionsData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('session_id', sessionId)

      if (questionError) throw questionError
      setQuestions(questionsData || [])

      if (questionsData && questionsData.length > 0) {
        const questionIds = questionsData.map(q => q.id)
        const { data: junctionData, error: junctionError } = await supabase
          .from('sources_questions')
          .select('*')
          .in('question_id', questionIds)

        if (junctionError) throw junctionError

        if (junctionData && junctionData.length > 0) {
          const sourceIds = Array.from(new Set(junctionData.map(j => j.source_id)))
          const { data: sourcesData, error: sourcesError } = await supabase
            .from('sources')
            .select('*')
            .in('id', sourceIds)

          if (sourcesError) throw sourcesError

          const sourcesMap: Record<string, Source[]> = {}
          junctionData.forEach(j => {
            const source = sourcesData?.find(s => s.id === j.source_id)
            if (source) {
              if (!sourcesMap[j.question_id]) sourcesMap[j.question_id] = []
              sourcesMap[j.question_id].push(source)
            }
          })
          setSources(sourcesMap)
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: answersData, error: answerError } = await supabase
        .from('answers')
        .select('*')
        .eq('user_id', user.id)

      if (answerError) throw answerError

      const questionIdsSet = new Set(questionsData?.map(q => q.id) || [])
      const answersMap: Record<string, Partial<Answer>> = {}
      answersData?.filter(ans => ans.question_id && questionIdsSet.has(ans.question_id)).forEach(ans => {
        if (ans.question_id) answersMap[ans.question_id] = ans
      })
      setAnswers(answersMap)

      if (answersData.length > 0 && answersData.length < (questionsData?.length || 0)) {
        const firstUnanswered = questionsData?.findIndex(q => !answersMap[q.id])
        if (firstUnanswered !== undefined && firstUnanswered !== -1) {
          setCurrentIndex(firstUnanswered)
        }
      } else if (answersData.length === (questionsData?.length || 0) && (questionsData?.length || 0) > 0) {
        setCompleted(true)
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Erreur lors du chargement de la session')
      }
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchSessionData()
  }, [sessionId, fetchSessionData])

  const saveAnswer = async (updates: Partial<Answer>) => {
    if (!currentQuestion) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const existing = answers[currentQuestion.id] || {}
      const payload = {
        ...existing,
        ...updates,
        user_id: user.id,
        question_id: currentQuestion.id,
        // Ensure non-nullable strings for required fields
        accuracy: updates.accuracy ?? existing.accuracy ?? '',
        historical_accuracy: updates.historical_accuracy ?? existing.historical_accuracy ?? '',
        grounded_in_sources: updates.grounded_in_sources ?? existing.grounded_in_sources ?? '',
      }

      const { error } = await supabase
        .from('answers')
        .upsert(payload, { onConflict: 'user_id,question_id' })

      if (error) throw error

      setAnswers(prev => ({ ...prev, [currentQuestion.id]: payload }))
    } catch (err) {
      toast.error('Échec de l\'enregistrement de l\'évaluation')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async (data: EvaluationFormData) => {
    await saveAnswer(data)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCompleted(true)
      toast.success('Questionnaire terminé !')
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const progressPercent = Math.round(((currentIndex + 1) / (questions.length || 1)) * 100)

  return {
    session,
    questions,
    sources,
    selectedSource,
    setSelectedSource,
    currentIndex,
    loading,
    saving,
    completed,
    setCompleted,
    register,
    handleSubmit,
    errors,
    getValues,
    currentQuestion,
    progressPercent,
    saveAnswer,
    handleNext,
    handlePrevious,
  }
}
