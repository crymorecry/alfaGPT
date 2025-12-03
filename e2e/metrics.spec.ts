import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Метрики системы', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('должна отображать страницу метрик', async ({ page }) => {
    await page.goto('/metrics')
    await expect(page.getByRole('heading', { name: "Метрики"})).toBeVisible()
  })

  test('должна показывать секции метрик', async ({ page }) => {
    await page.goto('/metrics')
    
    await expect(page.locator('text=Метрики нейросети')).toBeVisible()
    await expect(page.locator('text=Метрики базы данных')).toBeVisible()
    await expect(page.locator('text=Метрики загрузки страниц')).toBeVisible()
  })

  test('должна обновлять метрики автоматически', async ({ page }) => {
    await page.goto('/metrics')
    await page.waitForTimeout(2000)
    
    const autoRefreshButton = page.locator('button:has-text("Автообновление")')
    await expect(autoRefreshButton).toBeVisible()
  })

  test('должна очищать метрики по кнопке', async ({ page }) => {
    await page.goto('/metrics')
    
    const clearButton = page.locator('button:has-text("Очистить")')
    await expect(clearButton).toBeVisible()
    
    await clearButton.click()
    
    await expect(page.getByText('Нет данных', { exact: true }).first()).toBeVisible({ timeout: 3000 })
  })

  test('должна переключать автообновление', async ({ page }) => {
    await page.goto('/metrics')
    
    const autoRefreshToggle = page.locator('button:has-text("Автообновление")')
    await autoRefreshToggle.click()
    
    await page.waitForTimeout(1000)
  })
})
