const Joi = require("joi");

module.exports = async (group,myPermissions,isUpdate = false) => {
  

   const schema = Joi.object({
      name:Joi.string().required(),
      level:Joi.number().integer().required(),
      shipments:Joi.array().items(Joi.boolean()).length(4).required(),
      manifests:Joi.array().items(Joi.boolean()).length(4).required(),
      users:Joi.array().items(Joi.boolean()).length(4).required(),
      groups:Joi.array().items(Joi.boolean()).length(4).required(),
      incomplete:Joi.boolean().required(),
      archived:Joi.boolean().required(),
      description:Joi.string().allow('').required()
       
   });
   

   const updateSchema = Joi.object({
      name:Joi.string(),
      level:Joi.number().integer(),
      shipments:Joi.array().items(Joi.boolean()).length(4),
      manifests:Joi.array().items(Joi.boolean()).length(4),
      users:Joi.array().items(Joi.boolean()).length(4),
      groups:Joi.array().items(Joi.boolean()).length(4),
      incomplete:Joi.boolean(),
      archived:Joi.boolean(),
      description:Joi.string().allow('')
       
   });

   
   
   if(isUpdate){
      const {error} = await updateSchema.validate(group)
      if(error){
         return {error: error.details[0].message}
      }
      
   }else{
      const { error } = await schema.validate(group);
      if(error){
         return {error: error.details[0].message}
      }
   }

   for (let index = 0; index < 4; index++) {
      if(!myPermissions.shipments[index] && group.shipments[index]){
         return {error:'You cannot award permissons you dont have'}
      }  
   }

   for (let index = 0; index < 4; index++) {
      if(!myPermissions.manifests[index] && group.manifests[index]){
         return {error:'You cannot award permissons you dont have'}
      }  
   }

   for (let index = 0; index < 4; index++) {
      if(!myPermissions.users[index] && group.users[index]){
         return {error:'You cannot award permissons you dont have'}
      }  
   }

   for (let index = 0; index < 4; index++) {
      if(!myPermissions.groups[index] && group.groups[index]){
         return {error:'You cannot award permissons you dont have'}
      }  
   }

   if(!myPermissions.incomplete && group.incomplete){
      return {error:'You cannot award permissons you dont have'}
   }  
   if(!myPermissions.archived && group.archived){
      return {error:'You cannot award permissons you dont have'}
   }  
   
   let permissions = {}
   permissions["incomplete"] = group.incomplete
   permissions["archived"] = group.archived
   permissions["manifests"] = group.manifests
   permissions["shipments"] = group.shipments
   permissions["users"] = group.users
   permissions["groups"] = group.groups


   let reorganizedGroup  = {}

   if(group.name){
      reorganizedGroup["name"] = group.name
   }
   if(group.level){
      reorganizedGroup["level"] = group.level
   }
   if(group.description){
      reorganizedGroup["description"] = group.description
   }
   if(permissions){
      reorganizedGroup["permissions"] = permissions
   }

   return {validatedGroup:reorganizedGroup}
};
