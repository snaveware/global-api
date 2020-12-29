const Joi = require('joi')


module.exports = async (values) =>{
   const schema = Joi.object({
      email: Joi.string().email().required(),
      subject:Joi.string().max(100).allow(''),
      message:Joi.string().max(300).allow('')
   })
   const {error} = await schema.validate(values)
   
   if(error){
      return {error:error.details[0].message}
   }
   
   if(values.subject == ''){
      values.subject = 'Manifest'
   }
   if(values.message == ''){
      values.message = 'see attached manifest'
   }
   
   return {values:values}
}