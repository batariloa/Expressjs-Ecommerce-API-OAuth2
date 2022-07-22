const nodemailer = require("nodemailer");


const nodemailerConfig = require('./nodemailerConfig')

const sendEmail = async({to, subject, html}) =>{

        let testAccount = await nodemailer.createTestAccount()  ;
        const transporter =  nodemailer.createTransport(nodemailerConfig)

 // send mail with defined transport object
  return transporter.sendMail({
    from: '"Andrej Batarilo👻" <batarilocore@gmail.com>', // sender address
    to, // list of receivers
    subject, // Subject line
    text: "Hello world?", // plain text body
    html, // html body
  });


}

module.exports = sendEmail