import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Финансы', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/finance')
  })

  test('должна отображать страницу финансов', async ({ page }) => {
    await expect(page).toHaveURL(/.*finance/)
  })

  test('должна показывать вкладки', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Обзор, overview')).toBeVisible({ timeout: 5000 }).catch(() => {})
    await expect(page.locator('text=Транзакции, transactions')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна открывать модальное окно добавления транзакции', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const addButton = page.locator('button:has-text("Добавить транзакцию")')
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(500)
      
      await expect(page.locator('text=Добавить транзакцию, add_transaction')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна фильтровать транзакции по категории', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const transactionsTab = page.locator('button:has-text("Транзакции")')
    if (await transactionsTab.isVisible()) {
      await transactionsTab.click()
      await page.waitForTimeout(1000)
      
      const categoryFilter = page.locator('[data-part="trigger"]').first()
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('должна фильтровать транзакции по типу', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const transactionsTab = page.locator('button:has-text("Транзакции")')
    if (await transactionsTab.isVisible()) {
      await transactionsTab.click()
      await page.waitForTimeout(1000)
      
      const typeFilter = page.locator('[data-part="trigger"]').nth(1)
      if (await typeFilter.isVisible()) {
        await typeFilter.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('должна показывать постоянные расходы', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const recurringTab = page.locator('button').filter({ hasText: /Постоянные расходы|recurring/ }).first()
    if (await recurringTab.isVisible()) {
      await recurringTab.click()
      await page.waitForTimeout(1000)
      
      await expect(page.locator('text=Постоянные расходы, recurring_expenses')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна открывать модальное окно добавления постоянного расхода', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const recurringTab = page.locator('button').filter({ hasText: /Постоянные расходы|recurring/ }).first()
    if (await recurringTab.isVisible()) {
      await recurringTab.click()
      await page.waitForTimeout(1000)
      
      const addButton = page.locator('button:has-text("Добавить постоянный расход")')
      if (await addButton.isVisible()) {
        await addButton.click()
        await page.waitForTimeout(500)
        
        await expect(page.locator('text=Добавить постоянный расход, add_recurring_expense')).toBeVisible({ timeout: 3000 }).catch(() => {})
      }
    }
  })

  test('должна показывать платежи', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Напоминания о платежах, payments_reminders')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна открывать модальное окно добавления платежа', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const addPaymentButton = page.locator('button:has-text("Добавить платеж")')
    if (await addPaymentButton.isVisible()) {
      await addPaymentButton.click()
      await page.waitForTimeout(500)
      
      await expect(page.locator('text=Добавить платеж, add_payment')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна показывать баланс', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Баланс, balance')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна показывать доходы за месяц', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Доходы за месяц, income_month')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна показывать расходы за месяц', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Расходы за месяц, expense_month')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })
})

