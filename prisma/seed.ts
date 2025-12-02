import prisma from '../lib/prisma'


async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Очищаем базу данных
  await prisma.employeeDay.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.reminder.deleteMany()
  await prisma.recurringExpense.deleteMany()
  await prisma.business.deleteMany()
  await prisma.authToken.deleteMany()
  await prisma.user.deleteMany()

  // Пользователь 1: Ларёк и шаурмечная
  const user1 = await prisma.user.create({
    data: {
      email: 'test1@volency.ru',
    },
  })

  const business1 = await prisma.business.create({
    data: {
      userId: user1.id,
      name: 'Ларёк и Шаурмечная "Восточная"',
      address: 'г. Москва, ул. Ленина, д. 10',
      yandexMapLink: 'https://yandex.ru/maps/-/CCUQZJX~',
      ip: '192.168.1.10',
    },
  })

  // Сотрудники для бизнеса 1
  const employee1_1 = await prisma.employee.create({
    data: {
      businessId: business1.id,
      name: 'Ахмед Ибрагимов',
      email: 'ahmed@shaurma.ru',
      phone: '+7 (999) 123-45-67',
      position: 'Повар',
      dailyRate: 2500,
      workSchedule: '5/2',
      notes: 'Опытный повар, работает с 2020 года',
    },
  })

  const employee1_2 = await prisma.employee.create({
    data: {
      businessId: business1.id,
      name: 'Мария Петрова',
      email: 'maria@shaurma.ru',
      phone: '+7 (999) 234-56-78',
      position: 'Кассир',
      dailyRate: 2000,
      workSchedule: '5/2',
      notes: 'Работает в вечернюю смену',
    },
  })

  // Рабочие дни для сотрудников бизнеса 1
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      await prisma.employeeDay.create({
        data: {
          employeeId: employee1_1.id,
          date: date,
          type: 'work',
          notes: 'Обычный рабочий день',
        },
      })
      await prisma.employeeDay.create({
        data: {
          employeeId: employee1_2.id,
          date: date,
          type: 'work',
          notes: 'Вечерняя смена',
        },
      })
    }
  }

  // Транзакции для бизнеса 1
  await prisma.transaction.createMany({
    data: [
      {
        userId: user1.id,
        businessId: business1.id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        category: 'Продукты',
        type: 'expense',
        amount: 15000,
        description: 'Закупка мяса и овощей',
      },
      {
        userId: user1.id,
        businessId: business1.id,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        category: 'Продажи',
        type: 'income',
        amount: 45000,
        description: 'Выручка за день',
      },
      {
        userId: user1.id,
        businessId: business1.id,
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        category: 'Аренда',
        type: 'expense',
        amount: 50000,
        description: 'Аренда помещения',
      },
      {
        userId: user1.id,
        businessId: business1.id,
        date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
        category: 'Продажи',
        type: 'income',
        amount: 52000,
        description: 'Выручка за день',
      },
    ],
  })

  // Платежи для бизнеса 1
  await prisma.payment.createMany({
    data: [
      {
        userId: user1.id,
        businessId: business1.id,
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        contractor: 'ООО "Снабжение"',
        description: 'Оплата за продукты',
        amount: 20000,
        status: 'pending',
      },
      {
        userId: user1.id,
        businessId: business1.id,
        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        contractor: 'ООО "Аренда"',
        description: 'Арендная плата',
        amount: 50000,
        status: 'paid',
      },
    ],
  })

  // Задачи для бизнеса 1
  await prisma.task.createMany({
    data: [
      {
        userId: user1.id,
        businessId: business1.id,
        title: 'Заказать новую партию лаваша',
        priority: 'high',
        deadline: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
      },
      {
        userId: user1.id,
        businessId: business1.id,
        title: 'Проверить срок годности продуктов',
        priority: 'medium',
        deadline: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ],
  })

  // Напоминания для бизнеса 1
  await prisma.reminder.createMany({
    data: [
      {
        userId: user1.id,
        businessId: business1.id,
        title: 'Оплатить аренду',
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        description: 'Не забыть оплатить аренду помещения',
        completed: false,
      },
      {
        userId: user1.id,
        businessId: business1.id,
        title: 'Встреча с поставщиком',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        description: 'Обсудить новые условия поставки',
        completed: false,
      },
    ],
  })

  // Регулярные расходы для бизнеса 1
  await prisma.recurringExpense.createMany({
    data: [
      {
        businessId: business1.id,
        name: 'Аренда помещения',
        amount: 50000,
        frequency: 'monthly',
        description: 'Ежемесячная арендная плата',
      },
      {
        businessId: business1.id,
        name: 'Коммунальные услуги',
        amount: 15000,
        frequency: 'monthly',
        description: 'Электричество, вода, интернет',
      },
    ],
  })

  // Сообщения в чате для пользователя 1
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: user1.id,
        role: 'user',
        content: 'Как увеличить выручку в ларьке?',
      },
      {
        userId: user1.id,
        role: 'assistant',
        content: 'Для увеличения выручки в ларьке рекомендую: 1) Расширить ассортимент популярных позиций, 2) Провести акции и скидки, 3) Улучшить визуальное оформление витрины, 4) Оптимизировать цены на основе анализа конкурентов.',
      },
    ],
  })

  // Пользователь 2: Пункты выдачи
  const user2 = await prisma.user.create({
    data: {
      email: 'test2@volency.ru',
    },
  })

  const business2_1 = await prisma.business.create({
    data: {
      userId: user2.id,
      name: 'Пункт выдачи "Центральный"',
      address: 'г. Москва, ул. Тверская, д. 5',
      yandexMapLink: 'https://yandex.ru/maps/-/CCUQZJX~',
      ip: '192.168.1.20',
    },
  })

  const business2_2 = await prisma.business.create({
    data: {
      userId: user2.id,
      name: 'Пункт выдачи "Северный"',
      address: 'г. Москва, ул. Ленинградский проспект, д. 15',
      yandexMapLink: 'https://yandex.ru/maps/-/CCUQZJX~',
      ip: '192.168.1.21',
    },
  })

  const business2_3 = await prisma.business.create({
    data: {
      userId: user2.id,
      name: 'Пункт выдачи "Южный"',
      address: 'г. Москва, ул. Варшавское шоссе, д. 25',
      yandexMapLink: 'https://yandex.ru/maps/-/CCUQZJX~',
      ip: '192.168.1.22',
    },
  })

  // Сотрудники для бизнеса 2_1
  const employee2_1 = await prisma.employee.create({
    data: {
      businessId: business2_1.id,
      name: 'Дмитрий Соколов',
      email: 'dmitry@pickup.ru',
      phone: '+7 (999) 345-67-89',
      position: 'Менеджер пункта выдачи',
      dailyRate: 3000,
      workSchedule: '5/2',
      notes: 'Работает с открытия',
    },
  })

  const employee2_2 = await prisma.employee.create({
    data: {
      businessId: business2_1.id,
      name: 'Елена Кузнецова',
      email: 'elena@pickup.ru',
      phone: '+7 (999) 456-78-90',
      position: 'Оператор',
      dailyRate: 2500,
      workSchedule: '5/2',
      notes: 'Обрабатывает заказы',
    },
  })

  // Сотрудники для бизнеса 2_2
  const employee2_3 = await prisma.employee.create({
    data: {
      businessId: business2_2.id,
      name: 'Сергей Волков',
      email: 'sergey@pickup.ru',
      phone: '+7 (999) 567-89-01',
      position: 'Менеджер пункта выдачи',
      dailyRate: 3000,
      workSchedule: '5/2',
    },
  })

  // Сотрудники для бизнеса 2_3
  const employee2_4 = await prisma.employee.create({
    data: {
      businessId: business2_3.id,
      name: 'Ольга Морозова',
      email: 'olga@pickup.ru',
      phone: '+7 (999) 678-90-12',
      position: 'Менеджер пункта выдачи',
      dailyRate: 3000,
      workSchedule: '5/2',
    },
  })

  // Рабочие дни для сотрудников бизнеса 2
  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      await prisma.employeeDay.create({
        data: {
          employeeId: employee2_1.id,
          date: date,
          type: 'work',
        },
      })
      await prisma.employeeDay.create({
        data: {
          employeeId: employee2_2.id,
          date: date,
          type: 'work',
        },
      })
    }
  }

  // Транзакции для бизнесов 2
  await prisma.transaction.createMany({
    data: [
      {
        userId: user2.id,
        businessId: business2_1.id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        category: 'Услуги',
        type: 'income',
        amount: 120000,
        description: 'Выручка от выдачи заказов',
      },
      {
        userId: user2.id,
        businessId: business2_1.id,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        category: 'Аренда',
        type: 'expense',
        amount: 80000,
        description: 'Аренда помещения',
      },
      {
        userId: user2.id,
        businessId: business2_2.id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        category: 'Услуги',
        type: 'income',
        amount: 95000,
        description: 'Выручка от выдачи заказов',
      },
      {
        userId: user2.id,
        businessId: business2_3.id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        category: 'Услуги',
        type: 'income',
        amount: 110000,
        description: 'Выручка от выдачи заказов',
      },
    ],
  })

  // Платежи для бизнесов 2
  await prisma.payment.createMany({
    data: [
      {
        userId: user2.id,
        businessId: business2_1.id,
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        contractor: 'ООО "Логистика"',
        description: 'Оплата за доставку',
        amount: 30000,
        status: 'pending',
      },
      {
        userId: user2.id,
        businessId: business2_2.id,
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        contractor: 'ООО "Аренда"',
        description: 'Арендная плата',
        amount: 75000,
        status: 'paid',
      },
    ],
  })

  // Задачи для бизнесов 2
  await prisma.task.createMany({
    data: [
      {
        userId: user2.id,
        businessId: business2_1.id,
        title: 'Проверить складские остатки',
        priority: 'high',
        deadline: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
      {
        userId: user2.id,
        businessId: business2_2.id,
        title: 'Обновить систему учета',
        priority: 'medium',
        deadline: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
      },
      {
        userId: user2.id,
        businessId: business2_3.id,
        title: 'Нанять дополнительного сотрудника',
        priority: 'high',
        deadline: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ],
  })

  // Напоминания для бизнесов 2
  await prisma.reminder.createMany({
    data: [
      {
        userId: user2.id,
        businessId: business2_1.id,
        title: 'Инвентаризация',
        date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
        description: 'Провести ежемесячную инвентаризацию',
        completed: false,
      },
      {
        userId: user2.id,
        businessId: business2_2.id,
        title: 'Встреча с арендодателем',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        description: 'Обсудить условия продления аренды',
        completed: false,
      },
    ],
  })

  // Регулярные расходы для бизнесов 2
  await prisma.recurringExpense.createMany({
    data: [
      {
        businessId: business2_1.id,
        name: 'Аренда помещения',
        amount: 80000,
        frequency: 'monthly',
        description: 'Ежемесячная арендная плата',
      },
      {
        businessId: business2_2.id,
        name: 'Аренда помещения',
        amount: 75000,
        frequency: 'monthly',
        description: 'Ежемесячная арендная плата',
      },
      {
        businessId: business2_3.id,
        name: 'Аренда помещения',
        amount: 70000,
        frequency: 'monthly',
        description: 'Ежемесячная арендная плата',
      },
    ],
  })

  // Сообщения в чате для пользователя 2
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: user2.id,
        role: 'user',
        content: 'Как оптимизировать работу пунктов выдачи?',
      },
      {
        userId: user2.id,
        role: 'assistant',
        content: 'Для оптимизации работы пунктов выдачи рекомендую: 1) Внедрить систему электронной очереди, 2) Оптимизировать складское пространство, 3) Автоматизировать процесс выдачи заказов, 4) Обучить персонал работе с новым оборудованием.',
      },
    ],
  })

  // Пользователь 3: Рестораны
  const user3 = await prisma.user.create({
    data: {
      email: 'test3@volency.ru',
    },
  })

  const business3_1 = await prisma.business.create({
    data: {
      userId: user3.id,
      name: 'Ресторан "Итальянская кухня"',
      address: 'г. Москва, ул. Арбат, д. 20',
      yandexMapLink: 'https://yandex.ru/maps/-/CCUQZJX~',
      ip: '192.168.1.30',
    },
  })

  const business3_2 = await prisma.business.create({
    data: {
      userId: user3.id,
      name: 'Ресторан "Азиатская кухня"',
      address: 'г. Москва, ул. Новый Арбат, д. 30',
      yandexMapLink: 'https://yandex.ru/maps/-/CCUQZJX~',
      ip: '192.168.1.31',
    },
  })

  // Сотрудники для бизнеса 3_1
  const employee3_1 = await prisma.employee.create({
    data: {
      businessId: business3_1.id,
      name: 'Антонио Росси',
      email: 'antonio@restaurant.ru',
      phone: '+7 (999) 789-01-23',
      position: 'Шеф-повар',
      dailyRate: 5000,
      workSchedule: '5/2',
      notes: 'Опытный шеф-повар с 15-летним стажем',
    },
  })

  const employee3_2 = await prisma.employee.create({
    data: {
      businessId: business3_1.id,
      name: 'Виктория Смирнова',
      email: 'victoria@restaurant.ru',
      phone: '+7 (999) 890-12-34',
      position: 'Официант',
      dailyRate: 3000,
      workSchedule: '5/2',
      notes: 'Работает в вечернюю смену',
    },
  })

  const employee3_3 = await prisma.employee.create({
    data: {
      businessId: business3_1.id,
      name: 'Александр Новиков',
      email: 'alexander@restaurant.ru',
      phone: '+7 (999) 901-23-45',
      position: 'Бармен',
      dailyRate: 3500,
      workSchedule: '5/2',
    },
  })

  // Сотрудники для бизнеса 3_2
  const employee3_4 = await prisma.employee.create({
    data: {
      businessId: business3_2.id,
      name: 'Чен Ли',
      email: 'chen@restaurant.ru',
      phone: '+7 (999) 012-34-56',
      position: 'Шеф-повар',
      dailyRate: 5000,
      workSchedule: '5/2',
      notes: 'Специалист по азиатской кухне',
    },
  })

  const employee3_5 = await prisma.employee.create({
    data: {
      businessId: business3_2.id,
      name: 'Екатерина Белова',
      email: 'ekaterina@restaurant.ru',
      phone: '+7 (999) 123-45-67',
      position: 'Официант',
      dailyRate: 3000,
      workSchedule: '5/2',
    },
  })

  // Рабочие дни для сотрудников бизнеса 3
  for (let i = 0; i < 6; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      await prisma.employeeDay.create({
        data: {
          employeeId: employee3_1.id,
          date: date,
          type: 'work',
        },
      })
      await prisma.employeeDay.create({
        data: {
          employeeId: employee3_2.id,
          date: date,
          type: 'work',
        },
      })
    }
  }

  // Транзакции для бизнесов 3
  await prisma.transaction.createMany({
    data: [
      {
        userId: user3.id,
        businessId: business3_1.id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        category: 'Продажи',
        type: 'income',
        amount: 250000,
        description: 'Выручка ресторана за день',
      },
      {
        userId: user3.id,
        businessId: business3_1.id,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        category: 'Продукты',
        type: 'expense',
        amount: 80000,
        description: 'Закупка продуктов',
      },
      {
        userId: user3.id,
        businessId: business3_1.id,
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        category: 'Аренда',
        type: 'expense',
        amount: 200000,
        description: 'Аренда помещения',
      },
      {
        userId: user3.id,
        businessId: business3_2.id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        category: 'Продажи',
        type: 'income',
        amount: 280000,
        description: 'Выручка ресторана за день',
      },
      {
        userId: user3.id,
        businessId: business3_2.id,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        category: 'Продукты',
        type: 'expense',
        amount: 90000,
        description: 'Закупка продуктов',
      },
    ],
  })

  // Платежи для бизнесов 3
  await prisma.payment.createMany({
    data: [
      {
        userId: user3.id,
        businessId: business3_1.id,
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        contractor: 'ООО "Аренда премиум"',
        description: 'Арендная плата',
        amount: 200000,
        status: 'pending',
      },
      {
        userId: user3.id,
        businessId: business3_1.id,
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        contractor: 'ООО "Поставка продуктов"',
        description: 'Оплата за продукты',
        amount: 75000,
        status: 'paid',
      },
      {
        userId: user3.id,
        businessId: business3_2.id,
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        contractor: 'ООО "Аренда премиум"',
        description: 'Арендная плата',
        amount: 220000,
        status: 'pending',
      },
    ],
  })

  // Задачи для бизнесов 3
  await prisma.task.createMany({
    data: [
      {
        userId: user3.id,
        businessId: business3_1.id,
        title: 'Обновить меню',
        priority: 'high',
        deadline: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
      },
      {
        userId: user3.id,
        businessId: business3_1.id,
        title: 'Провести обучение персонала',
        priority: 'medium',
        deadline: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
      {
        userId: user3.id,
        businessId: business3_2.id,
        title: 'Заказать новую посуду',
        priority: 'medium',
        deadline: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
      {
        userId: user3.id,
        businessId: business3_2.id,
        title: 'Организовать рекламную кампанию',
        priority: 'high',
        deadline: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ],
  })

  // Напоминания для бизнесов 3
  await prisma.reminder.createMany({
    data: [
      {
        userId: user3.id,
        businessId: business3_1.id,
        title: 'Встреча с поставщиком вина',
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        description: 'Обсудить новую коллекцию вин',
        completed: false,
      },
      {
        userId: user3.id,
        businessId: business3_2.id,
        title: 'Проверка санитарных норм',
        date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
        description: 'Плановый визит санитарной службы',
        completed: false,
      },
    ],
  })

  // Регулярные расходы для бизнесов 3
  await prisma.recurringExpense.createMany({
    data: [
      {
        businessId: business3_1.id,
        name: 'Аренда помещения',
        amount: 200000,
        frequency: 'monthly',
        description: 'Ежемесячная арендная плата',
      },
      {
        businessId: business3_1.id,
        name: 'Коммунальные услуги',
        amount: 35000,
        frequency: 'monthly',
        description: 'Электричество, вода, газ',
      },
      {
        businessId: business3_2.id,
        name: 'Аренда помещения',
        amount: 220000,
        frequency: 'monthly',
        description: 'Ежемесячная арендная плата',
      },
      {
        businessId: business3_2.id,
        name: 'Коммунальные услуги',
        amount: 40000,
        frequency: 'monthly',
        description: 'Электричество, вода, газ',
      },
    ],
  })

  // Сообщения в чате для пользователя 3
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: user3.id,
        role: 'user',
        content: 'Как повысить средний чек в ресторане?',
      },
      {
        userId: user3.id,
        role: 'assistant',
        content: 'Для повышения среднего чека в ресторане рекомендую: 1) Обучить официантов технике продаж дополнительных блюд, 2) Создать специальные предложения и сет-меню, 3) Улучшить презентацию блюд, 4) Внедрить программу лояльности для постоянных гостей.',
      },
    ],
  })

  console.log('✅ База данных успешно заполнена!')
  console.log('\n📊 Создано:')
  console.log(`   - 3 пользователя`)
  console.log(`   - 6 бизнесов (1 + 3 + 2)`)
  console.log(`   - 12 сотрудников`)
  console.log(`   - Множество транзакций, платежей, задач и напоминаний`)
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

