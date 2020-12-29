const Joi = require("joi");

module.exports = async (manifest,isUpdate = false) => {
  

  const schema = Joi.object({
    source: Joi.string().max(50).min(2).max(50).required(),
    destination: Joi.string().max(50).min(2).required(),
    shipperName: Joi.string().max(50),
    shipperContact: Joi.string().max(50),
    description: Joi.string().allow(''),
    departure:Joi.string().allow(''),
    arrival:Joi.string().allow(''),
  });

  const updateSchema = Joi.object({
   source: Joi.string().max(50).min(2).max(50),
   destination: Joi.string().max(50).min(2),
   shipperName: Joi.string().max(50),
   shipperContact: Joi.string().allow('').max(50),
   description: Joi.string().allow(''),
   departure:Joi.string().allow(''),
   arrival:Joi.string().allow(''),
   status:Joi.string()
 });
   if(isUpdate){
      const {error} = await updateSchema.validate(manifest)
      if(error){     
         return {error: error.details[0].message}
      }
      
   }else{
      const { error } = await schema.validate(manifest);
      if(error){
         return {error: error.details[0].message}
      }
   }
  

   return {isValid:true}
};
