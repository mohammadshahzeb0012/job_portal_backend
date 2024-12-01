const nodemailer = require("nodemailer");
const sendFroGotLinkHtml = require("../MailTempletes/ForgotPassword");

const sendEmail = async ({ email, subject, name,role,operatingSystem,browserName,sendData }) => {
    try {
        const transporter = await nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        })

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            html: sendFroGotLinkHtml(name,role,operatingSystem,browserName,sendData),
        })
        console.log("email sent sucessfully");
    } catch (error) {
        console.log("email not sent", error);
    }
}

module.exports = sendEmail