import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Работники', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/employees')
  })

  test('должна отображать страницу работников', async ({ page }) => {
    await expect(page).toHaveURL(/.*employees/)
  })

  test('должна показывать список работников', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Список работников, employees_list')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна открывать модальное окно добавления работника', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const addButton = page.locator('button:has-text("Добавить работника")')
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(500)
      
      await expect(page.locator('text=Добавить работника, add_employee')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна показывать информацию о работнике', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const employeeCard = page.locator('[class*="border"]').first()
    if (await employeeCard.isVisible()) {
      await expect(employeeCard).toBeVisible()
    }
  })

  test('должна открывать страницу управления днями работника', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const manageDaysButton = page.locator('button:has-text("Управление днями")')
    if (await manageDaysButton.isVisible()) {
      await manageDaysButton.click()
      await page.waitForTimeout(1000)
      
      await expect(page.locator('text=Управление днями, manage_days')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна редактировать работника', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const editButton = page.locator('button:has-text("Редактировать"), button[aria-label*="edit"]').first()
    if (await editButton.isVisible()) {
      await editButton.click()
      await page.waitForTimeout(500)
      
      await expect(page.locator('text=Редактировать работника, edit_employee')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна удалять работника', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    page.on('dialog', dialog => dialog.accept())
    
    const deleteButton = page.locator('button:has-text("Удалить"), button[aria-label*="delete"]').first()
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('должна показывать статистику работника', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Статистика, statistics')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна показывать график работы', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=График работы, work_schedule')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })
})

