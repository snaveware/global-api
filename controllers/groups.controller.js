const Model = require('../models/group.model')
const validator = require('../validators/groups.validator')
const RequestHandler = require('../utils/RequestHandler')

module.exports = class Groups{

   static async getGroups(req,res){

      try {
         if(!req.body || (!req.body.level && req.body.level != 0)){
            RequestHandler.throwError(500,'Error determining your level')()
         }
         const {error,groups} = await Model.find({level:{$gte:req.body.level}})
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         RequestHandler.sendSuccess(res,groups)
      } catch (error) {
        RequestHandler.sendError(res,error) 
      }
   }

   static async getGroup(req,res){
      try {
         const id = req.params.id
         const {error,group} = await Model.findOne(id)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

        

         RequestHandler.sendSuccess(res,group)
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async createGroup(req,res){

      try {
         if(!req.body || !req.body.group){
            RequestHandler.throwError(400,'You did not provide a group')()
         }
         const group = req.body.group

         //validate
         const validation = await validator(group,req.body.permissions)
         
         if(validation.error){
            RequestHandler.throwError(500,validation.error)()
         }

         group.createdBy = req.body.userId
         group.editedBy = req.body.userId
         const {error,createdGroup} = await Model.insertOne(validation.validatedGroup)
   
         if(error){
            RequestHandler.throwError(500,error.message)()
         }
   
         RequestHandler.sendSuccess(res,createdGroup)
         
      } catch (error) {
         RequestHandler.sendError(res,error)
      }

   }

   static async updateGroup(req,res){
      try {
         if(!req.body || !req.body.update){
            RequestHandler.throwError(400,'You need to provide an update')()
         }else if(!req.body.id){
            RequestHandler.throwError(400," You need to provide the group's id ")()
         }
         const update = req.body.update

         //validate
         const validation = await validator(update,req.body.permissions,true)
                  
         if(validation.error){
            RequestHandler.throwError(500,validation.error)()
         }

         update.lastUpdate = Date.now()
         update.editedBy = req.body.userId
         
         const id = req.body.id
         const {error,updation} = await Model.updateOne(id,validation.validatedGroup)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         RequestHandler.sendSuccess(res,updation)

      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async deleteGroup(req,res){
      try {
         const id = req.params.id
         const {error,deletion} = await Model.deleteOne(id)
   
         if(error){
            RequestHandler.throwError(500,error.message,error)()
         }
         RequestHandler.sendSuccess(res,deletion)
         
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async count(req,res){
      try {
        
         const {count,error} = await Model.countDocuments()
         if(error){
            RequestHandler.throwError(500,error.message,error)
         }
         RequestHandler.sendSuccess(res,count)
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }
}