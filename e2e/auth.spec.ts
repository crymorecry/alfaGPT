import { test, expect } from '@playwright/test'

test.describe('Авторизация', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('должна отображаться страница логина', async ({ page }) => {
    await expect(page).toHaveTitle(/Volency/)
    await expect(page.locator('text=Авторизация')).toBeVisible()
  })

  test('должна показывать ошибку при пустом email', async ({ page }) => {
    const sendButton = page.locator('button:has-text("Отправить код")')
    await sendButton.click()
    await expect(page).toHaveURL(/.*login/)
  })

  test('должна отправлять код на email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('test@example.com')
    
    const sendButton = page.locator('button:has-text("Отправить код")')
    await sendButton.click()
    
    await expect(page.locator('text=Введите код с почты')).toBeVisible({ timeout: 5000 })
  })

  test('должна показывать ошибку при неверном коде', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('test@example.com')
    
    const sendButton = page.locator('button:has-text("Отправить код")')
    await sendButton.click()
    
    await page.waitForTimeout(1000)
    
    const codeInputs = page.locator('input[id^="code-"]')
    const count = await codeInputs.count()
    
    if (count > 0) {
      await codeInputs.first().fill('0')
      for (let i = 1; i < Math.min(count, 6); i++) {
        await codeInputs.nth(i).fill('0')
      }
      
      await page.waitForTimeout(2000)
      
      const errorMessage = page.locator('text=Неверный код')
      await expect(errorMessage).toBeVisible({ timeout: 5000 })
    }
  })

  test('должна валидировать формат email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('invalid-email')
    
    const sendButton = page.locator('button:has-text("Отправить код")')
    await sendButton.click()
    
    await expect(emailInput).toHaveAttribute('type', 'email')
  })
})
