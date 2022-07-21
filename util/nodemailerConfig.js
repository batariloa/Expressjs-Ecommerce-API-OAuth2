const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'rossie.spinka6@ethereal.email',
        pass: '9kXzvatk3C7cCzN9bz'
    }
});

module.exports = transporter