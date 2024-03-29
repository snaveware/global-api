const Config = require('../Config')
const sgMail = require('@sendgrid/mail')
const fs = require('fs')
require('dotenv').config()
const RequestHandler = require('../utils/RequestHandler')

module.exports = class Email{
   constructor(){
      this.from = Config.FROM
      this.api_key = process.env.SENDGRID_API_KEY
      this.logo = fs.readFileSync(`${appRoot}/images/logo.jpg`).toString('base64')
   }
 
   
   prepareManifestEmail(to,subject,message,filePath){
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

   preparePasswordRecoveryEmail(to,subject,url){
      sgMail.setApiKey(this.api_key)
      const email = {
         to:to,
         from:{
            email:this.from,
            name:Config.COMPANY_NAME
         },
         subject:subject,
         text:`
         Click the url below to recover your password
         ${url}
         `,
         html:`
         <p> click the link below to recover your password.</p>
         <a href="${url}" style="background-color: rgb(100,100,250); text-decoration: none; color: white; padding: 8px 15px; border-radius: 5px;">Recover Your Password </a>

         <p>Or visit the following url</p>
         <p style="padding: 5px; text-align: center">${url}</p>
         
         `,
      }

      return email
   }

}