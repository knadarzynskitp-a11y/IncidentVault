import nodemailer from 'nodemailer'

const sendResetMail = async (email:string, resetLink:string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS
    }
  })

  await transporter.sendMail({
    from: process.env.USER_EMAIL,
    to: email,
    subject: 'Link do zmiany hasła',
    html: `
    Link: ${resetLink}
      `
  })
}

export default sendResetMail