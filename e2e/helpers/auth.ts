export async function setupAuth(page: any) {
  const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
  
  const response = await page.request.post(`${baseURL}/api/test/create-user`)
  
  if (!response.ok()) {
    throw new Error('Failed to create test user')
  }
  
  const data = await response.json()
  
  await page.context().addCookies([{
    name: 'auth_token',
    value: data.token,
    domain: 'localhost',
    path: '/',
  }])
  
  return data.token
}

