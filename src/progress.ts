// Only learning outcomes are saved. Answers and calculator inputs stay out of analytics.
export type Attempt = {
  question: string
  at: string
  correct: boolean
  hints: number
  revealed: boolean
}
export type Progress = { solved: string[]; revealed: string[]; attempts: Attempt[] }
export const progressKey = 'tvm-study-progress-v1'
export const emptyProgress = (): Progress => ({ solved: [], revealed: [], attempts: [] })

export function readProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(progressKey) || 'null')
    if (!p || !Array.isArray(p.solved) || !Array.isArray(p.revealed) || !Array.isArray(p.attempts))
      return emptyProgress()
    return {
      solved: p.solved.filter((id: unknown) => typeof id === 'string'),
      revealed: p.revealed.filter((id: unknown) => typeof id === 'string'),
      attempts: p.attempts
        .filter(
          (a: Attempt) =>
            a &&
            typeof a.question === 'string' &&
            typeof a.at === 'string' &&
            Number.isFinite(Date.parse(a.at)) &&
            typeof a.correct === 'boolean' &&
            Number.isInteger(a.hints) &&
            a.hints >= 0 &&
            typeof a.revealed === 'boolean',
        )
        .slice(-100),
    }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: Progress): boolean {
  try {
    localStorage.setItem(progressKey, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

export function addAttempt(progress: Progress, attempt: Attempt): Progress {
  return {
    ...progress,
    solved:
      attempt.correct && !attempt.revealed
        ? [...new Set([...progress.solved, attempt.question])]
        : progress.solved,
    attempts: [...progress.attempts, attempt].slice(-100),
  }
}
