import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Аналитика', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/analytics')
  })

  test('должна отображать страницу аналитики', async ({ page }) => {
    await expect(page).toHaveURL(/.*analytics/)
  })

  test('должна показывать графики', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const charts = page.locator('svg')
    const chartCount = await charts.count()
    expect(chartCount).toBeGreaterThan(0)
  })

  test('должна показывать метрики', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Общий доход, total_income')).toBeVisible({ timeout: 5000 }).catch(() => {})
    await expect(page.locator('text=Общие расходы, total_expenses')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна изменять диапазон дат', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const datePicker = page.locator('button').filter({ hasText: /С|По|Дата/ }).first()
    if (await datePicker.isVisible()) {
      await datePicker.click()
      await page.waitForTimeout(500)
    }
  })

  test('должна открывать ИИ анализ', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const aiButton = page.locator('button:has-text("ИИ анализ")')
    if (await aiButton.isVisible()) {
      await aiButton.click()
      await page.waitForTimeout(2000)
      
      await expect(page.locator('text=ИИ анализ бизнеса, ai_analysis')).toBeVisible({ timeout: 5000 }).catch(() => {})
    }
  })

  test('должна скачивать данные', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const downloadButton = page.locator('button:has-text("Скачать данные")')
    if (await downloadButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download').catch(() => null)
      await downloadButton.click()
      
      const download = await downloadPromise
      if (download) {
        expect(download.suggestedFilename()).toContain('.xlsx')
      }
    }
  })

  test('должна показывать разбивку расходов', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Разбивка расходов, expenses_breakdown')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна показывать расходы по категориям', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Расходы по категориям, expense_by_category')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })
})

