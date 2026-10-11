import { test, expect } from '@playwright/test'

test('lesson checks teach signs and link into a practice question', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Time value')
  await page.getByRole('button', { name: 'Negative', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Not quite')
  await page.getByRole('button', { name: 'Positive', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Correct')
  await page.getByRole('button', { name: 'Try this question →', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'One deposit, three years' })).toBeVisible()
})

test('practice checks a signed answer and tracks completion only once', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Practice', exact: true }).click()
  await page.getByLabel('Your answer for FV').fill('-1157.63')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('Your magnitude is right', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Get a hint', exact: false }).click()
  await page.getByLabel('Your answer for FV').fill('1157.63')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('1 / 9 solved', { exact: false })).toBeVisible()
  await expect(page.getByRole('heading', { name: '$1,157.63' })).toBeVisible()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('1 / 9 solved', { exact: false })).toBeVisible()
})

test('revealed solutions do not earn unassisted completion', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Practice', exact: true }).click()
  await page.getByRole('button', { name: 'Show worked solution' }).click()
  await page.getByLabel('Your answer for FV').fill('1157.63')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('0 / 9 solved', { exact: false })).toBeVisible()
  await expect(page.getByText('That matches the solution', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Learn', exact: true }).click()
  await page.getByRole('button', { name: 'Practice', exact: true }).click()
  await page.getByLabel('Your answer for FV').fill('1157.63')
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.getByText('0 / 9 solved', { exact: false })).toBeVisible()
})

test('calculator supports manual entry, storage, compute and memory clearing', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Calculator trainer', exact: true }).click()
  const entry = page.getByLabel('Calculator entry', { exact: true })
  for (const [value, key] of [
    ['3', 'N'],
    ['5', 'I/Y'],
    ['-1000', 'PV'],
    ['0', 'PMT'],
  ]) {
    await entry.fill(value)
    await page.getByRole('button', { name: key, exact: true }).click()
  }
  await page.getByRole('button', { name: 'CPT', exact: true }).click()
  await page.getByRole('button', { name: 'FV', exact: true }).click()
  await expect(page.getByRole('heading', { name: '$1,157.63' })).toBeVisible()
  await page.getByRole('button', { name: 'Learn', exact: true }).click()
  await page.getByRole('button', { name: 'Calculator trainer', exact: true }).click()
  await expect(page.getByRole('heading', { name: '$1,157.63' })).toBeVisible()
  await page.getByLabel('Payments per year').fill('12')
  await expect(page.getByLabel('Compounds per year')).toHaveValue('12')
  await page.getByLabel('Compounds per year').fill('2')
  await page.getByLabel('Timing', { exact: true }).selectOption('BGN')
  await page.getByRole('button', { name: 'CLR TVM', exact: true }).click()
  await expect(page.getByLabel('Compounds per year')).toHaveValue('2')
  await expect(page.getByLabel('Timing', { exact: true })).toHaveValue('BGN')
  await expect(page.getByRole('status')).toContainText('timing are unchanged')
})

test('all worked setups compute, including N, I/Y and different frequencies', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await page.getByRole('button', { name: 'Calculator trainer', exact: true }).click()
  for (const [id, target] of [
    ['growth', 'FV'],
    ['discount', 'PV'],
    ['saving', 'FV'],
    ['loan', 'PMT'],
    ['due', 'PV'],
    ['frequency', 'PMT'],
    ['time', 'N'],
    ['rate', 'I/Y'],
    ['zero', 'PMT'],
  ]) {
    await page.getByLabel('Try a worked example').selectOption(id)
    await page.getByRole('button', { name: 'Load known values' }).click()
    await page.getByRole('button', { name: 'CPT', exact: true }).click()
    await page.getByRole('button', { name: target, exact: true }).click()
    await expect(page.getByText(`Worked solution · ${target}`, { exact: true })).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
  }
  expect(errors).toEqual([])
})

test('phone layout fits without horizontal scrolling across all views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  for (const view of ['Learn', 'Practice', 'Calculator trainer']) {
    await page.getByRole('button', { name: view, exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})

test('save current documentation screenshots', async ({ page }) => {
  await page.goto('./')
  await page.screenshot({ path: 'docs/learn.png', fullPage: true })
  await page.getByRole('button', { name: 'Practice', exact: true }).click()
  await page.getByRole('button', { name: 'Show worked solution' }).click()
  await page.screenshot({ path: 'docs/practice.png', fullPage: true })
  await page.getByRole('button', { name: 'Calculator trainer', exact: true }).click()
  await page.getByRole('button', { name: 'Load known values' }).click()
  await page.getByRole('button', { name: 'CPT', exact: true }).click()
  await page.getByRole('button', { name: 'FV', exact: true }).click()
  await page.screenshot({ path: 'docs/calculator.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Learn', exact: true }).click()
  await page.screenshot({ path: 'docs/mobile.png', fullPage: true })
})
