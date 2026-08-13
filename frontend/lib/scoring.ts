import type { StatSnapshot } from '@/lib/api'

export interface CodeHealthScores {
  consistency: number
  problemDifficulty: number
  repoQuality: number
  contestActivity: number
}

export interface CodeHealthResult {
  scores: CodeHealthScores
  totalHealth: number
  grade: 'A' | 'B' | 'C' | 'D'
}

type GhMeta = { contributionWeeks?: number[]; recentEvents?: unknown[]; repos?: number }
type LcMeta = { byDifficulty?: { difficulty: string; count: number }[] }

/**
 * Computes normalized sub-scores and overall Code Health score (0-100) + letter grade
 * from platform snapshot metadata.
 */
export function calculateCodeHealth(
  latestGithub: StatSnapshot | undefined,
  latestCodeforces: StatSnapshot | undefined,
  latestLeetcode: StatSnapshot | undefined,
): CodeHealthResult {
  const ghMeta = (latestGithub?.meta ?? {}) as GhMeta
  const lcMeta = (latestLeetcode?.meta ?? {}) as LcMeta

  const contributionWeeks: number[] = ghMeta.contributionWeeks ?? []
  const weeksActive = contributionWeeks.filter((w) => w > 0).length
  const consistencyScore = contributionWeeks.length
    ? Math.min(100, Math.round((weeksActive / contributionWeeks.length) * 100 * 1.2))
    : 0

  let diffScore = 0
  if (lcMeta.byDifficulty) {
    const easy = lcMeta.byDifficulty.find((d) => d.difficulty === 'Easy')?.count ?? 0
    const medium = lcMeta.byDifficulty.find((d) => d.difficulty === 'Medium')?.count ?? 0
    const hard = lcMeta.byDifficulty.find((d) => d.difficulty === 'Hard')?.count ?? 0
    diffScore = Math.min(100, Math.round((easy + medium * 3 + hard * 5) / 5))
  }

  const repoScore = Math.min(100, (ghMeta.repos ?? 0) * 4)
  const contestScore = Math.min(100, Math.round((latestCodeforces?.value ?? 0) / 15))

  const scores: CodeHealthScores = {
    consistency: consistencyScore || 10,
    problemDifficulty: diffScore || 10,
    repoQuality: repoScore || 10,
    contestActivity: contestScore || 10,
  }

  const totalHealth = Math.round(
    (scores.consistency + scores.problemDifficulty + scores.repoQuality + scores.contestActivity) / 4,
  )
  const grade: 'A' | 'B' | 'C' | 'D' =
    totalHealth >= 80 ? 'A' : totalHealth >= 60 ? 'B' : totalHealth >= 40 ? 'C' : 'D'

  return { scores, totalHealth, grade }
}

/**
 * Normalizes a series independently to [0, 100] so all platform
 * lines occupy the full chart area regardless of their absolute scale.
 */
export function normalizeToRange(data: number[]): number[] {
  if (data.length === 0) return []
  if (data.length === 1) return [100]
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min
  // Flat series (all values identical) — keep at 100 rather than dividing by zero
  if (span === 0) return data.map(() => 100)
  return data.map((d) => Math.round(((d - min) / span) * 100))
}
