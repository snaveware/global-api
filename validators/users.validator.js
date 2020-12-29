const Joi = require("joi");

module.exports = async (user,isUpdate = false) => {
  

   schema = Joi.object({
      firstName: Joi.string().max(30).required(),
      lastName: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      confirmPassword: Joi.ref("password"),
      telephone: Joi.string().min(10).required(),
      branch: Joi.string().max(50).required(),
      userGroup: Joi.string().min(24).required(),
      groupName: Joi.string().max(50).required()
   });

   updateSchema = Joi.object({
      firstName: Joi.string().max(30),
      lastName: Joi.string().max(30),
      email: Joi.string().email(),
      telephone: Joi.string().min(10),
      branch: Joi.string().max(50),
      userGroup: Joi.string(),
      status:Joi.string(),
      groupName: Joi.string().max(50)
   });

   if(isUpdate){
      const {error} = await updateSchema.validate(user)
      if(error){
         return {error: error.details[0].message}
      }
      
   }else{
      const { error } = await schema.validate(user);
      if(error){
         console.log(error)
         return {error: error.details[0].message}
      }
   }
  
   return {isValid:true}
};
