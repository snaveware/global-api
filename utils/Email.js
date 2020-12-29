const Config = require('../Config')
const sgMail = require('@sendgrid/mail')
const fs = require('fs')
require('dotenv').config()
const RequestHandler = require('../utils/RequestHandler')

module.exports = class Email{
   from = Config.FROM
   api_key = process.env.SENDGRID_API_KEY
   logo = fs.readFileSync(`${appRoot}/images/logo.jpg`).toString('base64')
   
   prepare(to,subject,message,filePath){
      sgMail.setApiKey(this.api_key)
      const file = fs.readFileSync(filePath).toString('base64')
      const email = {
         to:to,
         from:{
            email:this.from,
            name:Config.COMPANY_NAME
         },
         subject:subject,
         text:message,
         html:`
         <img src="data:logo/jpg;base64,/9j/4s/+${this.logo}" alt="Logo">
         <p>${message}</p>
         `,
         attachments:[
            {
               content:file,
               filename:'manifest.pdf',
               type: "application/pdf",
               disposition: "attachment"
            }
         ]//,
         // files:[
         //    {
         //       filename:'logo.jpg',
         //       contentType:'image/jpg',
         //       cid:'logo',
         //       content:this.logo

         //    }
         // ]
      }
      return email
   }

}