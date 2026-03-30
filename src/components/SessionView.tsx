import { Loader2, ArrowLeft, Save, ChevronRight, HelpCircle, Trophy, BookOpen, X, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useSessionLogic } from '@/hooks/useSessionLogic'

interface SessionViewProps {
  sessionId: number;
  onBack: () => void;
}

export function SessionView({ sessionId, onBack }: SessionViewProps) {
  const {
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
  } = useSessionLogic({ sessionId })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Chargement du questionnaire...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground/50" />
        <h2 className="text-2xl font-bold">Aucune question trouvée</h2>
        <p className="text-muted-foreground">Cette session n'a pas encore de questions.</p>
        <Button onClick={onBack} variant="outline" className="mt-4 gap-1.5"><ArrowLeft className="h-4 w-4" /> Retour</Button>
      </div>
    )
  }

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto py-10 transition-all duration-500">
        <Card className="text-center border-2 border-primary/20 shadow-xl overflow-hidden">
          <div className="h-2 bg-primary"></div>
          <CardHeader className="pt-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 scale-110">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Questionnaire Terminé !</CardTitle>
            <CardDescription className="text-lg">Merci pour vos précieux retours. Vos réponses ont été enregistrées.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4 pb-10">
            <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
              <p className="text-center font-medium mb-4 italic text-muted-foreground">"Votre contribution nous aide à améliorer nos services chaque jour."</p>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" onClick={() => setCompleted(false)} className="gap-2 px-6 rounded-lg font-semibold hover:bg-primary/5 hover:text-primary transition-all">
                  Revoir vos réponses
                </Button>
                <Button onClick={onBack} className="gap-2 px-6 rounded-lg font-semibold shadow-lg shadow-primary/25 active:scale-95 transition-all">
                  <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-2">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg pr-4">
          <ArrowLeft className="h-4 w-4" /> Retour à la liste
        </Button>
        <span className="text-sm font-bold bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
          Question {currentIndex + 1} sur {questions.length}
        </span>
      </div>

      <div className="space-y-2 group">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          <span>Progression de la session</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 rounded-full overflow-hidden bg-muted group-hover:bg-muted/80 shadow-inner" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(handleNext)}>
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="space-y-4 pb-8 border-b bg-muted/5">
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{session?.title || 'Questionnaire'}</span>
                  {session?.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{session.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                    <span className="font-black">{currentIndex + 1}</span>
                  </div>
                  <CardTitle className="text-2xl font-bold leading-tight tracking-tight">{currentQuestion?.label}</CardTitle>
                </div>
                
                {currentQuestion && sources[currentQuestion.id] && sources[currentQuestion.id].length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4 ml-[52px]">
                    {sources[currentQuestion.id].map((source, idx) => (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => setSelectedSource(source)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-md border border-primary/20 transition-all active:scale-95 group"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>Source {idx + 1}: {source.title}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-8 pt-8 pb-10">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-primary/80">Réponse générée</Label>
                  <div className="p-5 rounded-xl border-2 border-muted bg-muted/20 text-lg leading-relaxed shadow-inner">
                    {currentQuestion?.generated_answer}
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-1">
                  {(['accuracy', 'historical_accuracy', 'grounded_in_sources'] as const).map((metric) => (
                    <div key={metric} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-bold uppercase tracking-wider">
                          {metric === 'accuracy' ? 'Précision' :
                            metric === 'historical_accuracy' ? 'Précision historique' :
                              'Fondé sur les sources'}
                        </Label>
                      </div>
                      <div className="relative group">
                        <Input
                          placeholder="Votre évaluation ici..."
                          {...register(metric)}
                          onBlur={() => saveAnswer({ [metric]: getValues(metric) })}
                          className={`bg-white text-black border-zinc-300 focus:border-primary focus:ring-primary/20 transition-all h-11 shadow-sm placeholder:text-zinc-400 ${errors[metric] ? 'border-red-500' : ''}`}
                        />
                        {errors[metric] && (
                          <p className="text-xs text-red-500 mt-1">{errors[metric]?.message}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-3 pt-4">
                    <Label className="text-sm font-bold uppercase tracking-wider">Commentaires</Label>
                    <textarea
                      placeholder="Ajoutez votre commentaire ici..."
                      {...register('comments')}
                      onBlur={() => saveAnswer({ comments: getValues('comments') })}
                      className="w-full min-h-20 p-4 rounded-xl border-2 border-zinc-300 bg-white text-black focus:border-primary focus:ring-primary/20 transition-all shadow-sm outline-none resize-y placeholder:text-zinc-400"
                    />
                    <p className="text-[10px] text-muted-foreground italic pl-1 flex items-center gap-1.5">
                      <Save className="h-3 w-3" /> Enregistrement automatique en dehors du champ
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center py-6 border-t bg-muted/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="gap-2 px-6 rounded-lg font-semibold h-11 border-border/50 transition-all hover:bg-background"
                >
                  <ArrowLeft className="h-4 w-4" /> Précédent
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="group gap-2 px-8 rounded-lg font-bold h-11 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> :
                    currentIndex === questions.length - 1 ? "Terminer et valider" : "Continuer"}
                  {!saving && <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedSource && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSource(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[400px] sm:w-[500px] bg-background border-l shadow-2xl z-[60] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg line-clamp-1">{selectedSource.title}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedSource(null)} className="rounded-full h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Contenu de la source</h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 bg-muted/20 p-6 rounded-2xl border border-border/50">
                      {selectedSource.content}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-muted/10">
                <Button variant="outline" className="w-full rounded-lg" onClick={() => setSelectedSource(null)}>
                  Fermer le panneau
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
