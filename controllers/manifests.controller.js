const Model = require('../models/manifest.model')
const validator = require('../validators/manifests.validator')
const emailValidator = require('../validators/email.validator')
const RequestHandler = require('../utils/RequestHandler')
const Shipments = require('../models/shipment.model')
const ManifestPdf = require('../utils/ManifestPdf')
const fs = require('fs')
const Config = require('../Config')
const Email = require('../utils/Email')
const {determineOptions} = require('../utils/query')
const sgMail = require('@sendgrid/mail')

module.exports = class Manifests{

   static async getManifests(req,res){

      try {
         const category = req.query.c
         const search = req.query.s
         const options = determineOptions(category,search,req.body)
         const {error,manifests} = await Model.find(options)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         RequestHandler.sendSuccess(res,manifests)
      } catch (error) {
        RequestHandler.sendError(res,error) 
      }
   }

   
   static async getManifest(req,res){
      try {
         const id = req.params.id
         const {error,manifest} = await Model.findOne(id)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         const shipments = await Shipments.find({manifestId:id})
         if(shipments.error){
            RequestHandler.throwError(500,error.message)()
         }

         RequestHandler.sendSuccess(res,{manifest:manifest,shipments:shipments.shipments})
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async createManifest(req,res){
      try {
         if(!req.body || !req.body.manifest){
            RequestHandler.throwError(400,'You did not provide a manifest')()
         }
         const manifest = req.body.manifest

         //validate
         const validation = await validator(manifest)
         
         if(validation.error){
            RequestHandler.throwError(500,validation.error)()
         }

         //fill in default values
         manifest.createdBy = req.body.userId
         manifest.editedBy = req.body.userId
         manifest.agentName = `${req.body.firstName} ${req.body.lastName}`
         manifest.trackingId = `${Date.now()}`
         manifest.branch = req.body.branch

         const {error,createdManifest} = await Model.insertOne(manifest)
   
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

   
         RequestHandler.sendSuccess(res,createdManifest)
         
      } catch (error) {
         RequestHandler.sendError(res,error)
      }

   }


   static async updateManifest(req,res){
      try {
         if(!req.body || !req.body.update){
            RequestHandler.throwError(400,'You need to provide an update')()
         }else if(!req.body.id){
            RequestHandler.throwError(400," You need to provide the manifest's id ")()
         }

         let update = req.body.update
         //validate
         const validation = await validator(update,true)
         if(validation.error){
            RequestHandler.throwError(500,validation.error)()
         }
         
         update.lastUpdated = Date.now()
         update.editedBy = req.body.userId
         const id = req.body.id

         //if updating status of the manifest, update status of all shipments in that manifest
         if(update.status){
            const shipmentsUpdation = await Shipments.update({manifestId:id},{status:update.status})

            if(shipmentsUpdation.error){
               RequestHandler.throwError(500,'could not update the status of shipments in this manifest')()
            }
         }

         const {error,updation} = await Model.updateOne(id,update)
         if(error){
            RequestHandler.throwError(500,error.message)()
         }

         RequestHandler.sendSuccess(res,updation)

      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async deleteManifest(req,res){
      try {
         const id = req.params.id
         const {error,deletion} = await Model.deleteOne(id)
         if(error){
            RequestHandler.throwError(400,error.message,error)()
         }

         RequestHandler.sendSuccess(res,deletion)
         
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
   }

   static async generatePdf(req,res){
      try {
         const manifest = await Model.findOne(req.params.manifestId)
         const shipments = await Shipments.find({manifestId:req.params.manifestId})
         
         if(manifest.error || shipments.error ){
          
            RequestHandler.throwError(400,"could not retrieve either the manifest or the  shipments in that manifest ")()
         }
         const doc = new ManifestPdf(manifest.manifest,shipments.shipments,{margin:50,size:'letter',layout:'landscape'})
         doc.manifest()
         doc.pipe(fs.createWriteStream(`${appRoot}/pdfs/manifest_${req.params.manifestId}.pdf`));
         doc.end()
         const data = `${Config.BASE_URL}/files/manifest/${req.params.manifestId}/?t=${req.body.token}`
         RequestHandler.sendSuccess(res,data)
      } catch (error) {
         RequestHandler.sendError(res,error)
      }
      
   }

   static async sendEmail(req,res){
      try {
         if(!req.body || !req.body.values){
            RequestHandler.throwError(400,'Provide required data')()
         }
         const {error,values} = await emailValidator(req.body.values)
         if(error){
            RequestHandler.throwError(400,error)()
         }

         const to = values.email
         const subject = values.subject
         const message = values.message
         const filePath = `${appRoot}/pdfs/manifest_${req.params.manifestId}.pdf`


         if(!fs.existsSync(filePath)){
            const manifest = await Model.findOne(req.params.manifestId)
            const shipments = await Shipments.find({manifestId:req.params.manifestId})
         
            if(manifest.error || shipments.error ){
            
               RequestHandler.throwError(400,"could not retrieve either the manifest or the  shipments in that manifest ")()
            }
            const doc = new ManifestPdf(manifest.manifest,shipments.shipments,{margin:50,size:'letter',layout:'landscape'})
            doc.manifest()
            doc.pipe(fs.createWriteStream(`${appRoot}/pdfs/manifest_${req.params.manifestId}.pdf`));
            doc.end()
        
         }
         
         const emailSender = new Email()
         const email = emailSender.prepare(to,subject,message,filePath)
         sgMail.send(email)
         .then( success =>{
            return RequestHandler.sendSuccess(res,'Email sent successfully')
         })
         .catch( error =>{
            return RequestHandler.sendError(res,new Error('Failed to send the manifest'))
         })
         
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