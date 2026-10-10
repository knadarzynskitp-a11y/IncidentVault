import nodemailer from 'nodemailer'

const sendEmailVerification = async(email: string, code:string) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
        }
    });

    await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to: email,
        subject: "Kod weryfikacyjny",
        html: `
        <!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>Your code: ${code}
</body>
</html>
        `
    })

};

export default sendEmailVerification