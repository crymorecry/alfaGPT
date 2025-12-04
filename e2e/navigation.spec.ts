import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Навигация', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('должна работать навигация по сайдбару', async ({ page }) => {
    await page.goto('/')
    
    const sidebarLinks = [
      { text: 'Main', href: '/' },
      { text: 'Analytics', href: '/analytics' },
      { text: 'Finance', href: '/finance' },
      { text: 'Employees', href: '/employees' },
      { text: 'Operations', href: '/operations' },
      { text: 'Chat', href: '/chat' },
    ]

    for (const link of sidebarLinks) {
      const linkElement = page.locator(`a[href="${link.href}"]`)
      await expect(linkElement).toBeVisible()
    }
  })

  test('должна переходить на страницу аналитики', async ({ page }) => {
    await page.goto('/')
    
    const analyticsLink = page.locator('a[href="/analytics"]')
    await analyticsLink.click()
    
    await expect(page).toHaveURL(/.*analytics/)
  })

  test('должна переходить на страницу финансов', async ({ page }) => {
    await page.goto('/')
    
    const financeLink = page.locator('a[href="/finance"]')
    await financeLink.click()
    
    await expect(page).toHaveURL(/.*finance/)
  })

  test('должна переходить на страницу работников', async ({ page }) => {
    await page.goto('/')
    
    const employeesLink = page.locator('a[href="/employees"]')
    await employeesLink.click()
    
    await expect(page).toHaveURL(/.*employees/)
  })

  test('должна переходить на страницу операций', async ({ page }) => {
    await page.goto('/')
    
    const operationsLink = page.locator('a[href="/operations"]')
    await operationsLink.click()
    
    await expect(page).toHaveURL(/.*operations/)
  })

  test('должна переходить на страницу чата', async ({ page }) => {
    await page.goto('/')
    
    const chatLink = page.locator('a[href="/chat"]')
    await chatLink.click()
    
    await expect(page).toHaveURL(/.*chat/)
  })

})
