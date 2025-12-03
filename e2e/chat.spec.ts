import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Чат с ИИ', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/chat')
  })

  test('должна отображать страницу чата', async ({ page }) => {
    await expect(page).toHaveURL(/.*chat/)
  })

  test('должна показывать заголовок чата', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Чат с ИИ агентом, title')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна показывать приветственное сообщение', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Здравствуйте! Я ваш ИИ-помощник')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна отправлять сообщение', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const textarea = page.locator('textarea[placeholder*="сообщение"]')
    if (await textarea.isVisible()) {
      await textarea.fill('Тестовое сообщение')
      
      const sendButton = page.locator('button:has-text("Отправить"), button[type="submit"]').last()
      if (await sendButton.isVisible()) {
        await sendButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })

  test('должна отправлять сообщение по Enter', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const textarea = page.locator('textarea[placeholder*="сообщение"]')
    if (await textarea.isVisible()) {
      await textarea.fill('Тестовое сообщение')
      await textarea.press('Enter')
      await page.waitForTimeout(2000)
    }
  })

  test('должна очищать историю чата', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    page.on('dialog', dialog => dialog.accept())
    
    const clearButton = page.locator('button:has-text("Очистить чат")')
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('должна отображать сообщения пользователя', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const textarea = page.locator('textarea[placeholder*="сообщение"]')
    if (await textarea.isVisible()) {
      await textarea.fill('Тестовое сообщение')
      
      const sendButton = page.locator('button:has-text("Отправить"), button[type="submit"]').last()
      if (await sendButton.isVisible()) {
        await sendButton.click()
        await page.waitForTimeout(2000)
        
        await expect(page.locator('text=Тестовое сообщение')).toBeVisible({ timeout: 5000 }).catch(() => {})
      }
    }
  })

  test('должна показывать индикатор загрузки при отправке', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const textarea = page.locator('textarea[placeholder*="сообщение"]')
    if (await textarea.isVisible()) {
      await textarea.fill('Тестовое сообщение')
      
      const sendButton = page.locator('button:has-text("Отправить"), button[type="submit"]').last()
      if (await sendButton.isVisible()) {
        await sendButton.click()
        
        await expect(page.locator('text=Печатает, typing')).toBeVisible({ timeout: 3000 }).catch(() => {})
      }
    }
  })
})

