import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Дашборд', () => {
  test('должен перенаправлять на логин если не авторизован', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*login/)
  })

  test('должен отображать главную страницу после авторизации', async ({ page }) => {
    await setupAuth(page)

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Главная' })).toBeVisible({ timeout: 5000 })
  })

  test('должен показывать модули навигации', async ({ page }) => {
    await setupAuth(page)

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Финансы' })).toBeVisible()
    await expect(page.getByRole('heading', { name: "Работники" })).toBeVisible()
    await expect(page.getByRole('heading', { name: "Операции" })).toBeVisible()
    await expect(page.getByRole('heading', { name: "Аналитика"})).toBeVisible()
  })

  test('должен переходить на страницу финансов при клике', async ({ page }) => {
    await setupAuth(page)

    await page.goto('/')

    const financeCard = page.getByRole('heading', { name: "Финансы"})
    await financeCard.click()

    await expect(page).toHaveURL(/.*finance/)
  })
})
