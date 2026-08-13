import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

function HealthRing({ score }: { score: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--success)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-semibold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

interface CodeHealthProps {
  total: number
  grade: string
  scores: {
    consistency: number
    problemDifficulty: number
    repoQuality: number
    contestActivity: number
  }
}

export function CodeHealthPanel({ total, grade, scores }: CodeHealthProps) {
  const factors = [
    { label: 'Consistency', value: scores.consistency, accent: 'success' as const },
    { label: 'Problem Difficulty', value: scores.problemDifficulty, accent: 'info' as const },
    { label: 'Repo Quality', value: scores.repoQuality, accent: 'success' as const },
    { label: 'Contest Activity', value: scores.contestActivity, accent: 'warning' as const },
  ]

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Code Health</CardTitle>
        <Badge variant="success">Grade {grade}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex justify-center sm:justify-start">
          <HealthRing score={total} />
        </div>
        <div className="flex-1 space-y-4">
          {factors.map((f) => (
            <div key={f.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-mono font-medium text-foreground">{f.value}</span>
              </div>
              <Progress value={f.value} accent={f.accent} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
