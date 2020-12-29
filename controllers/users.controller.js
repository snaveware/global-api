const Model = require('../models/user.model')
const validator = require('../validators/users.validator')
const RequestHandler = require('../utils/RequestHandler')
const Group = require('../models/group.model')
const {determineUserOptions} =  require('../utils/query')
const formidable = require('formidable')
const fs = require('fs')

module.exports = class Users{

   static async getUsers(req,res){

      try {
         const category = req.query.c
         const search = req.query.s
         const options = determineUserOptions(category,search,req.body)
         const {error,users} = await Model.find(options)

         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         RequestHandler.sendSuccess(res,users)
      } catch (error) {
        RequestHandler.sendError(res,error) 
      }
   }

   static async getUser(req,res){
      
      try {
         const id = req.params.id
         const {error,user} = await Model.findOne(id)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }  
         
         // const group = await Group.findOne(user.userGroup)  

         // if(group.error){
         //    RequestHandler.throwError(500,group.error.message)()
         // } 

         RequestHandler.sendSuccess(res,user)
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async createUser(req,res){

      try {
         if(!req.body || !req.body.user){
            RequestHandler.throwError(400,'You did not provide a user')()
         }
         const user = req.body.user

         //validate
         const validation = await validator(user)
         
         if(validation.error){
            RequestHandler.throwError(500,validation.error)()
         }

         user.createdBy = req.body.userId
         user.editedBy = req.body.userId
         const {error,createdUser} = await Model.insertOne(user)
   
         if(error){
            RequestHandler.throwError(500,error.message)()
         }
         
         RequestHandler.sendSuccess(res,createdUser)
         
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }
   static async updateUser(req,res){
      try {
         if(!req.body || !req.body.update){
            RequestHandler.throwError(400,'You need to provide an update')()
         }else if(!req.body.id){
            RequestHandler.throwError(400," You need to provide the user's id ")()
         }
         const update = req.body.update

         //validate
         const validation = await validator(update,true)
                  
         if(validation.error){
            RequestHandler.throwError(500,validation.error)()
         }

         update.lastedited = Date.now()
         update.editedBy = req.body.userId
         const id = req.body.id
         
         const {error,updation} = await Model.updateOne(id,update)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         RequestHandler.sendSuccess(res,updation)

      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async deleteUser(req,res){
      try {
         const id = req.params.id
         const {error,deletion} = await Model.deleteOne(id)
   
         if(error){
            RequestHandler.throwError(500,error.message)()
         }
         RequestHandler.sendSuccess(res,deletion)
         
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }
   static async uploadProfile(req,res){
      try {
         if(req.body.userId != req.params.userId){
            RequestHandler.throwError(403,'This is not your account let the owner change the profile')()
         }

         const form = new formidable.IncomingForm() 
      
         form.parse(req,(err,fields,files) =>{
         
             const oldPath = files.profile.path
             const newPath = `${appRoot}/images/profile_${req.body.userId}.jpg`
    
             fs.rename(oldPath,newPath,err=>{
                if(err){
                   RequestHandler.throwError(500,'error saving profile')()
                }
             })  
         })

         RequestHandler.sendSuccess(res,'Upload successful')

      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async getEmails(req,res){
      try {
         const {error,emails} = await Model.findEmails()
         if(error){
            RequestHandler.throwError(500,error.message,error)()
         }
         RequestHandler.sendSuccess(res,emails)
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async count(req,res){
      try {
         const options = determineUserOptions(req.query.c,req.query.s,req.body)
         const {count,error} = await Model.countDocuments(options)
         if(error){
            RequestHandler.throwError(500,error.message,error)
         }
         RequestHandler.sendSuccess(res,count)
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }
}