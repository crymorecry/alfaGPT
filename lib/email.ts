import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.timeweb.ru',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NAME_EMAIL,
      pass: process.env.PASS_EMAIL,
    }
  })
}

async function sendTelegramMessage(code: string, email: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram bot token или chat ID не настроены')
    return { success: false }
  }

  try {
    const message = `🔐 Код авторизации\n\nEmail: ${email}\nКод: ${code}\n\nКод действителен в течение 10 минут.`

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Ошибка отправки в Telegram:', errorData)
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error)
    return { success: false }
  }
}

export async function sendAuthCode(email: string, code: string) {
  const transporter = createTransporter()

  const mailOptions = { 
    from: '"ONVIBE" <mail@onvibe.fun>',
    to: email,
    subject: 'Код авторизации',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Код авторизации</h2>
        <p>Ваш код для входа:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">Этот код действителен в течение 10 минут.</p>
        <p style="color: #666; font-size: 14px;">Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
      </div>
    `,
  }

  try {
    // Отправляем email
    await transporter.sendMail(mailOptions)
    
    sendTelegramMessage(code, email).catch((error) => {
      console.error('Не удалось отправить в Telegram:', error)
    })
    
    return { success: true }
  } catch (error) {
    console.error('Ошибка отправки email:', error)
    return { success: false, error: 'Не удалось отправить email' }
  }
}

