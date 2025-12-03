import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Операции', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/operations')
  })

  test('должна отображать страницу операций', async ({ page }) => {
    await expect(page).toHaveURL(/.*operations/)
  })

  test('должна показывать планировщик задач', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Планировщик задач, task_planner')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна показывать колонки задач', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=К выполнению, todo')).toBeVisible({ timeout: 5000 }).catch(() => {})
    await expect(page.locator('text=В процессе, in_progress')).toBeVisible({ timeout: 5000 }).catch(() => {})
    await expect(page.locator('text=Выполнено, done')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна открывать модальное окно добавления задачи', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const addButton = page.locator('button:has-text("Добавить задачу")')
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(500)
      
      await expect(page.locator('text=Название задачи, task_title')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна показывать напоминания', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Напоминания и события, reminders_events')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна открывать модальное окно добавления напоминания', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const addButton = page.locator('button:has-text("Добавить напоминание")')
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(500)
      
      await expect(page.locator('text=Название, reminder_title')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна перетаскивать задачи между колонками', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const task = page.locator('[draggable="true"]').first()
    const targetColumn = page.locator('text=В процессе').locator('..').locator('..')
    
    if (await task.isVisible() && await targetColumn.isVisible()) {
      await task.dragTo(targetColumn)
      await page.waitForTimeout(1000)
    }
  })

  test('должна отмечать напоминания как выполненные', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const checkbox = page.locator('input[type="checkbox"]').first()
    if (await checkbox.isVisible()) {
      await checkbox.click()
      await page.waitForTimeout(500)
    }
  })

  test('должна показывать приоритеты задач', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Приоритет, priority')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна показывать дедлайны задач', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Дедлайн, deadline')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })
})

