import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

interface RouteInfo {
  path: string
  method: string
  filePath: string
}

async function scanApiRoutes(dir: string, basePath: string = ''): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    
    if (entry.isDirectory()) {
      const newBasePath = basePath ? `${basePath}/${entry.name}` : entry.name
      const subRoutes = await scanApiRoutes(fullPath, newBasePath)
      routes.push(...subRoutes)
    } else if (entry.name === 'route.ts') {
      const content = await readFile(fullPath, 'utf-8')
      // Заменяем [id] на {id} для OpenAPI формата
      const apiPath = `/api${basePath ? `/${basePath}` : ''}`.replace(/\[(\w+)\]/g, '{$1}')
      
      // Определяем методы из экспортов
      if (content.includes('export async function GET')) {
        routes.push({ path: apiPath, method: 'get', filePath: fullPath })
      }
      if (content.includes('export async function POST')) {
        routes.push({ path: apiPath, method: 'post', filePath: fullPath })
      }
      if (content.includes('export async function PUT')) {
        routes.push({ path: apiPath, method: 'put', filePath: fullPath })
      }
      if (content.includes('export async function DELETE')) {
        routes.push({ path: apiPath, method: 'delete', filePath: fullPath })
      }
      if (content.includes('export async function PATCH')) {
        routes.push({ path: apiPath, method: 'patch', filePath: fullPath })
      }
    }
  }

  return routes
}

function getTagFromPath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  if (parts.length < 2) return 'General'
  
  const resource = parts[1]
  return resource.charAt(0).toUpperCase() + resource.slice(1).replace(/-/g, ' ')
}

function generateSchemaFromPrismaModel(modelName: string): any {
  const schemas: Record<string, any> = {
    Business: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        name: { type: 'string' },
        ip: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        yandexMapLink: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    Transaction: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        businessId: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        category: { type: 'string' },
        type: { type: 'string', enum: ['income', 'expense'] },
        amount: { type: 'number' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    Employee: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        businessId: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        position: { type: 'string', nullable: true },
        dailyRate: { type: 'number' },
        workSchedule: { type: 'string' },
        notes: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    Task: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        businessId: { type: 'string' },
        title: { type: 'string' },
        priority: { type: 'string' },
        deadline: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    Reminder: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        businessId: { type: 'string' },
        title: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        description: { type: 'string', nullable: true },
        completed: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    Payment: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        businessId: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        contractor: { type: 'string' },
        description: { type: 'string' },
        amount: { type: 'number' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    RecurringExpense: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        businessId: { type: 'string' },
        name: { type: 'string' },
        amount: { type: 'number' },
        frequency: { type: 'string', enum: ['monthly', 'weekly', 'yearly'] },
        description: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  }
  
  return schemas[modelName] || { type: 'object' }
}

function inferParameters(path: string, method: string, fileContent: string): any[] {
  const parameters: any[] = []
  
  // Параметры из пути (формат {id} для OpenAPI)
  const pathParams = path.match(/\{(\w+)\}/g)
  if (pathParams) {
    pathParams.forEach(param => {
      const paramName = param.replace(/[{}]/g, '')
      parameters.push({
        in: 'path',
        name: paramName,
        required: true,
        schema: { type: 'string' },
        description: `ID ${paramName}`,
      })
    })
  }
  
  // Query параметры из кода
  if (method === 'get' && fileContent.includes('searchParams.get')) {
    const queryMatches = fileContent.match(/searchParams\.get\(['"]([^'"]+)['"]\)/g)
    if (queryMatches) {
      queryMatches.forEach(match => {
        const paramName = match.match(/['"]([^'"]+)['"]/)?.[1]
        if (paramName && !parameters.find(p => p.name === paramName)) {
          parameters.push({
            in: 'query',
            name: paramName,
            required: false,
            schema: { type: 'string' },
            description: `Параметр ${paramName}`,
          })
        }
      })
    }
  }
  
  return parameters
}

function inferRequestBody(method: string, fileContent: string): any {
  if (method === 'post' || method === 'put' || method === 'patch') {
    const bodyMatch = fileContent.match(/const\s+body\s*=\s*await\s+request\.json\(\)/)
    if (bodyMatch) {
      // Пытаемся найти деструктуризацию body
      const destructureMatch = fileContent.match(/const\s*\{\s*([^}]+)\s*\}\s*=\s*body/)
      if (destructureMatch) {
        const fields = destructureMatch[1].split(',').map(f => f.trim())
        const properties: Record<string, any> = {}
        
        fields.forEach(field => {
          const fieldName = field.split(':')[0].trim()
          properties[fieldName] = { type: 'string' }
        })
        
        return {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties,
              },
            },
          },
        }
      }
    }
  }
  
  return undefined
}

function inferResponse(path: string, method: string, fileContent: string): any {
  const responses: Record<string, any> = {
    '200': {
      description: 'Успешный ответ',
      content: {
        'application/json': {
          schema: method === 'get' ? {
            type: 'array',
            items: { type: 'object' },
          } : { type: 'object' },
        },
      },
    },
    '401': {
      description: 'Не авторизован',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  }
  
  if (method === 'post') {
    responses['201'] = {
      description: 'Создано',
      content: {
        'application/json': {
          schema: { type: 'object' },
        },
      },
    }
  }
  
  if (fileContent.includes('status: 404')) {
    responses['404'] = {
      description: 'Не найдено',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    }
  }
  
  if (fileContent.includes('status: 400')) {
    responses['400'] = {
      description: 'Ошибка валидации',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    }
  }
  
  return responses
}

export async function generateSwaggerSpec() {
  const apiDir = join(process.cwd(), 'app', 'api')
  const routes = await scanApiRoutes(apiDir)
  
  const paths: Record<string, any> = {}
  const tags = new Set<string>()
  
  for (const route of routes) {
    const fileContent = await readFile(route.filePath, 'utf-8')
    const tag = getTagFromPath(route.path)
    tags.add(tag)
    
    if (!paths[route.path]) {
      paths[route.path] = {}
    }
    
    const summary = route.method === 'get' ? 'Получить' :
                    route.method === 'post' ? 'Создать' :
                    route.method === 'put' ? 'Обновить' :
                    route.method === 'delete' ? 'Удалить' : 'Операция'
    
    paths[route.path][route.method] = {
      summary: `${summary} ${tag}`,
      tags: [tag],
      security: [{ bearerAuth: [] }],
      parameters: inferParameters(route.path, route.method, fileContent),
      requestBody: inferRequestBody(route.method, fileContent),
      responses: inferResponse(route.path, route.method, fileContent),
    }
  }
  
  return {
    openapi: '3.0.0',
    info: {
      title: 'AlfaGPT API',
      version: '1.0.0',
      description: 'API документация для AlfaGPT - системы управления бизнесом',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: Array.from(tags).map(tag => ({ name: tag })),
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        Business: generateSchemaFromPrismaModel('Business'),
        Transaction: generateSchemaFromPrismaModel('Transaction'),
        Employee: generateSchemaFromPrismaModel('Employee'),
        Task: generateSchemaFromPrismaModel('Task'),
        Reminder: generateSchemaFromPrismaModel('Reminder'),
        Payment: generateSchemaFromPrismaModel('Payment'),
        RecurringExpense: generateSchemaFromPrismaModel('RecurringExpense'),
      },
    },
  }
}

