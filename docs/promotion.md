# Promoting TVM Study Desk

## Start small

Ask 5–10 classmates taking introductory finance to try one lesson and one question. Ask where they got stuck, whether they understood the cash-flow signs, and whether they could repeat the calculator steps. Fix repeated problems before sharing more widely.

Post only where project sharing is welcome, and describe it honestly as an independent teaching project. It is not an official Texas Instruments emulator. No paid advertising is needed to learn whether it helps people.

## Share links

Use a different link for each channel. Labels are deliberately simple and contain no personal information.

- Classmates: https://tvm-study-desk.vercel.app/?utm_source=classmates&utm_medium=share&utm_campaign=first_launch
- Reddit: https://tvm-study-desk.vercel.app/?utm_source=reddit&utm_medium=community&utm_campaign=first_launch
- LinkedIn: https://tvm-study-desk.vercel.app/?utm_source=linkedin&utm_medium=social&utm_campaign=first_launch
- A direct practice challenge: https://tvm-study-desk.vercel.app/?utm_source=classmates&utm_medium=share&utm_campaign=first_problem#practice/growth

## A short post you can adapt

I built TVM Study Desk for students learning time value of money. It has five short lessons, nine practice questions with hints, and a financial-calculator trainer that shows what is stored and why the answer works.

If you're learning loans, savings or annuities, try one question and tell me which step was confusing. It's free, works without an account, and saves your practice history on your device.

[Add the appropriate share link above.]

## Measure something useful

Your private [TVM usage dashboard](https://us.posthog.com/project/659292/dashboard/2199041) shows visits, practice participation, outcomes, help use, calculator activity and seven-day return visits. [Activity history](https://us.posthog.com/project/659292/activity/events) shows individual events in time order. The project receives events only after a visitor allows usage statistics. Use its activity list for a chronological event history and the usage dashboard for trends. A browser/device ID is not a verified person. Ad blockers, denied consent, cleared storage and multiple devices affect counts.

| Question | What to measure | Why it matters |
| --- | --- | --- |
| Are people reaching it? | Unique anonymous devices with `study_viewed` | Approximate reach among consenting visitors |
| Are they trying it? | Unique devices with `practice_attempted` | Active practice, not just loading a page |
| Where do they struggle? | Attempt outcomes and hint/reveal use by question | Tells you what to clarify |
| Does sharing work? | Views and practice participation by `utm_source` | Compare promotion channels |
| Do they return? | Returning device activity on different dates | A sign of repeat use, not proof of learning |

Initial goals, not claims: 20 real learners trying a question, 5 concrete feedback responses, and 5 returning learners over the first two weeks. Record dates, channels and changes. Never turn test events or pageviews into claims about students helped or grades improved.

All setup checks use `?test_analytics=1`. Dashboard charts exclude `is_test=true`. Use that flag for your own future checks. The SDK's bot filter remains enabled.

## Event dictionary and privacy

- `study_viewed`: page and lesson/question ID.
- `lesson_checked`: lesson ID and correct/incorrect outcome.
- `practice_attempted`: question ID, outcome, number of hints, whether the solution was revealed.
- `practice_hinted` / `practice_revealed`: question ID and hint index where relevant.
- `calculator_computed`: target variable and whether the calculation succeeded.
- Every event: sanitized campaign labels, app identifier and test marker.

The SDK loads only after opt-in. It uses an anonymous browser ID for return visits. Session replay, autocapture, surveys, heatmaps, personal profiles and exception collection are disabled. An explicit property allowlist strips typed answers, financial inputs, email addresses, arbitrary URLs and referrers. Local history stays on the learner's device and can be downloaded or cleared. There is no public admin panel or public analytics-data API.

## Configure another deployment

Set GitHub Actions repository variables `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST`. The key is PostHog's **public write-only project token**, not a personal API key. Both values are compiled into the browser bundle. Leave them unset to disable remote statistics entirely. For local work, put them in ignored `.env.local`.

PostHog is on its capped free plan. The analytics allowance is currently 1 million events/month; check [current pricing](https://posthog.com/pricing) before changing the plan.

## Design research

Reddit feedback is qualitative, not a usability study. The practical takeaway was to make layouts fit the user's actual task, avoid giving every panel equal weight, and test smaller screens and keyboard use. That informed the existing workbook layout, simpler navigation, persistent history, and direct links rather than adding decorative sections.

- [UX discussion: recurring problems in generated interfaces](https://www.reddit.com/r/UX_Design/comments/1v3tghy/what_gives_away_a_website_as_fully_vibecoded/)
- [UI feedback: repeated card layouts and generic styling](https://www.reddit.com/r/vibecoding/comments/1vyprc9/how_to_avoid_ai_default_design_help_please/)
- [PostHog event capture documentation](https://posthog.com/docs/product-analytics/capture-events)
