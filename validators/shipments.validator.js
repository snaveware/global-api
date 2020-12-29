const Joi = require("joi");

module.exports = async (shipment,isUpdate = false) => {
  

   const schema = Joi.object({
      title: Joi.string().max(50).required(),
      customerName: Joi.string().max(30).required(),
      customerTelephone: Joi.string().allow("").required(),
      CBM: Joi.number().integer().required(),
      totalCost: Joi.number().required(),
      amountPaid: Joi.number().required(),
      manifestId: Joi.string().alphanum().min(24).required(),
      description: Joi.string().allow(''),
      currency: Joi.string()
      
    });


    const updateSchema = Joi.object({
      title: Joi.string().max(50),
      customerName: Joi.string().max(30),
      customerTelephone: Joi.string().allow(""),
      CBM: Joi.number().integer(),
      totalCost: Joi.number(),
      amountPaid: Joi.number(),
      manifestId: Joi.string().alphanum().min(24),
      description: Joi.string().allow(''),
      currency: Joi.string(),
      status:Joi.string(),
      picked:Joi.boolean()
      
    });


   if(isUpdate){
      const {error} = await updateSchema.validate(shipment)
      if(error){
         return {error: error.details[0].message}
      }
      
   }else{
      const { error } = await schema.validate(shipment);
      if(error){
         return {error: error.details[0].message}
      }
   }
  

   return {isValid:true}
};
