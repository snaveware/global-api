const Model = require('../models/shipment.model')
const validator = require('../validators/shipments.validator')
const RequestHandler = require('../utils/RequestHandler')
const Manifest = require('../models/manifest.model')
const { determineOptions }  = require('../utils/query')

module.exports = class Shipments{

   static async getShipments(req,res){
      const category = req.query.c
      const search = req.query.s
      const options = determineOptions(category,search,req.body)
      try {
         const {error,shipments} = await Model.find(options)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         RequestHandler.sendSuccess(res,shipments)
      } catch (error) {
        RequestHandler.sendError(res,error) 
      }
   }

   static async getShipment(req,res){
      try {
         const id = req.params.id
         const {error,shipment} = await Model.findOne(id)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }else if(!shipment.manifestId || shipment.manifestId == ''){
            RequestHandler.throwError(500,'This shipment does not belong to any manifest')()
         }
         
         const manifest = await Manifest.findOne(shipment.manifestId)
         if(manifest.error){
            RequestHandler.throwError(500,manifest.error.message)()
         }

         RequestHandler.sendSuccess(res,{shipment:shipment,manifest:manifest.manifest})
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async createShipment(req,res){

      try {
         if(!req.body || !req.body.shipment){
            RequestHandler.throwError(400,'You did not provide a shipment')()
         }
         const shipment = req.body.shipment
         //validate
         const validation = await validator(shipment)
         if(validation.error){
            RequestHandler.throwError(500,validation.error)()
         }
         shipment.createdBy = req.body.userId
         shipment.editedBy =req.body.userId
         shipment.trackingId = `${Date.now()}`
         shipment.branch = req.body.branch
         const {error,createdShipment} = await Model.insertOne(shipment)
   
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         //increment the counts in the manifest
         const increment = await Manifest.increment(shipment.manifestId,{$inc:{shipmentsCount:1}})
         if((increment).error){
            RequestHandler.throwError(500,increment.error.message)()
         }
         RequestHandler.sendSuccess(res,createdShipment)
         
      } catch (error) {
         RequestHandler.sendError(res,error)
      }

   }

   static async updateShipment(req,res){
      try {
         if(!req.body || !req.body.update){
            RequestHandler.throwError(400,'You need to provide an update')()
         }else if(!req.body.id){
            RequestHandler.throwError(400," You need to provide the shipment's id ")()
         }
         const update = req.body.update

         //validate
         const validation = await validator(update,true)
                  
         if(validation.error){
            RequestHandler.throwError(500,validation.error)()
         }

         update.lastEdited = Date.now()
         update.editedBy = req.body.userId
         const id = req.body.id

         //find this shipment for later use
         const theShipment = await Model.findOne(id)
         if(theShipment.error){
            RequestHandler.throwError(500,'Could not find the shipment you are trying to update')()
         }

         const {error,updation} = await Model.updateOne(id,update)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         //if updating the picked value, check if other shipments in the same manifest are picke
         // if they are, archive the manifest and its shipments.
         if(!theShipment || !theShipment.shipment || !theShipment.shipment.manifestId){
            RequestHandler.throwError(500,'could not find the shipment')()
         }
         if(update.picked == false || update.picked == true){
           
            const notPickedShipments = await Model.find({manifestId:theShipment.shipment.manifestId,picked:false})
            
            if(notPickedShipments.error){
               RequestHandler.throwError(500,'Error checking the status of the parent manifest')()
            }else if(notPickedShipments.shipments.length == 0){
            
               const manifestUpdation = await Manifest.updateOne(theShipment.shipment.manifestId,{status:'archived'})
               if(manifestUpdation.error){
                  RequestHandler.throwError(500,'error archiving the manifest')()
               }
               const shipmentsUpdation = Model.update({manifestId:theShipment.shipment.manifestId},{status:'archived'})
            }
         }

         RequestHandler.sendSuccess(res,updation)

      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async deleteShipment(req,res){
      try {
         const id = req.params.id
           
           const shipment = await Model.findOne(id)
           if(shipment.error){
              RequestHandler.throwError(500,shipment.error.message)()
           }else if(!shipment.shipment){
              RequestHandler.throwError(400,'could not find the shipment you are trying to delete')()
           }
         
         const {error,deletion} = await Model.deleteOne(id)
   
         if(error){
            RequestHandler.throwError(500,error.message)()
         }
         
         //decrement the counts in the manifest
         const increment = await Manifest.increment(shipment.shipment.manifestId,{shipmentsCount:-1})
         if((increment).error){
            RequestHandler.throwError(500,'could not decrement the no of shipments in the manifest')()
         }
       
         RequestHandler.sendSuccess(res,deletion)
         
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async count(req,res){
      try {
         const options = determineOptions(req.query.c,req.query.s,req.body)
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