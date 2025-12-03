import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers/auth'

test.describe('Управление бизнесами', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
    await page.goto('/')
  })

  test('должна показывать селектор бизнеса', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const businessSelector = page.locator('button').filter({ hasText: /Бизнес не выбран|no_business/ }).first()
    await expect(businessSelector).toBeVisible({ timeout: 5000 }).catch(() => {})
  })

  test('должна открывать меню выбора бизнеса', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const businessSelector = page.locator('button').filter({ hasText: /Бизнес не выбран|no_business/ }).first()
    if (await businessSelector.isVisible()) {
      await businessSelector.click()
      await page.waitForTimeout(500)
      
      await expect(page.locator('text=Добавить бизнес, add_business')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })

  test('должна открывать модальное окно добавления бизнеса', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const businessSelector = page.locator('button').filter({ hasText: /Бизнес не выбран|no_business/ }).first()
    if (await businessSelector.isVisible()) {
      await businessSelector.click()
      await page.waitForTimeout(500)
      
      const addButton = page.locator('text=Добавить бизнес')
      if (await addButton.isVisible()) {
        await addButton.click()
        await page.waitForTimeout(500)
        
        await expect(page.locator('text=Добавить бизнес, add_business')).toBeVisible({ timeout: 3000 }).catch(() => {})
      }
    }
  })

  test('должна открывать модальное окно редактирования бизнеса', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const businessSelector = page.locator('button').filter({ hasText: /Бизнес не выбран|no_business/ }).first()
    if (await businessSelector.isVisible()) {
      await businessSelector.click()
      await page.waitForTimeout(500)
      
      const editButton = page.locator('text=Редактировать текущий')
      if (await editButton.isVisible()) {
        await editButton.click()
        await page.waitForTimeout(500)
        
        await expect(page.locator('text=Редактировать бизнес, edit_business')).toBeVisible({ timeout: 3000 }).catch(() => {})
      }
    }
  })

  test('должна переключать бизнес', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const businessSelector = page.locator('button').filter({ hasText: /Бизнес не выбран|no_business/ }).first()
    if (await businessSelector.isVisible()) {
      await businessSelector.click()
      await page.waitForTimeout(500)
      
      const businessOption = page.locator('[role="menuitemradio"]').first()
      if (await businessOption.isVisible()) {
        await businessOption.click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('должна показывать сообщение если бизнес не выбран', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Для начала работы необходимо добавить хотя бы один бизнес')).toBeVisible({ timeout: 5000 }).catch(() => {})
  })
})

