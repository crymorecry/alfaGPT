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
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Ошибка отправки email:', error)
    return { success: false, error: 'Не удалось отправить email' }
  }
}

