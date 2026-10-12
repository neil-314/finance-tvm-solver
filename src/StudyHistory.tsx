import { questions } from './learning'
import type { Progress } from './progress'

export default function StudyHistory({
  progress,
  saved,
  onReset,
}: {
  progress: Progress
  saved: boolean
  onReset: () => void
}) {
  function download() {
    const lines = [
      'date,question,correct,hints,solution_revealed',
      ...progress.attempts.map(
        (a) => `${a.at},${a.question},${a.correct},${a.hints},${a.revealed}`,
      ),
    ]
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'tvm-study-history.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <details className="reference study-history">
      <summary>Your study history ({progress.attempts.length} attempts)</summary>
      <p>
        {saved
          ? 'Saved on this device, including after you close the page.'
          : 'Browser storage is unavailable. History will last for this visit only.'}{' '}
        No account needed. The most recent 100 attempts are kept. Hints are allowed; revealed
        solutions do not earn completion.
      </p>
      {progress.attempts.length > 0 ? (
        <>
          <div className="history-scroll">
            <table>
              <caption>Recent practice attempts</caption>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Question</th>
                  <th>Result</th>
                  <th>Help used</th>
                </tr>
              </thead>
              <tbody>
                {[...progress.attempts].reverse().map((a, i) => (
                  <tr key={i}>
                    <td>
                      <time dateTime={a.at}>{new Date(a.at).toLocaleString()}</time>
                    </td>
                    <td>{questions.find((q) => q.id === a.question)?.title || a.question}</td>
                    <td>{a.correct ? 'Correct' : 'Try again'}</td>
                    <td>{a.revealed ? 'Solution shown' : `${a.hints} hints`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="button-row">
            <button onClick={download}>Download history CSV</button>
            <button onClick={onReset}>Clear history and start over</button>
          </div>
        </>
      ) : (
        <p>Check an answer in Practice to start your history.</p>
      )}
    </details>
  )
}
