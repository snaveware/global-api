const { Schema, model } = require("mongoose");
const Shipment = require("./shipment.model");
const Config = require('../Config');

module.exports = class Manifest {
  static schema = new Schema({
    source: {
      type: String,
      default: "",
      required: true,
    },
    destination: {
      type: String,
      default: "",
      required: true,
    },
    agent: {
      type: String,
      default: "",
    },
    agentName: {
      type: String,
      default: "",
    },
    agentTelephone: {
      type: String,
      default: "",
    },
    departure: {
      type: String,
      default: "",
    },
    arrival: {
      type: String,
      default: "",
    },
    shipperName: {
      type: String,
      default: "",
    },
    shipperContact: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "incomplete",
    },
    createdOn: {
      type: Date,
      default: Date.now(),
    },
    lastUpdated: {
      type: Date,
      default: Date.now(),
    },
    shipmentsCount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      default: "",
    },
    editedBy: {
      type: String,
      default: "",
    },
    branch:{
      type: String,
      default: "",
    },
    trackingId:{
      type:String,
      default:''
    }

  }).index({
    source:'text',
    destination:'text',
    agentName:'text',
    agentTelephone:'text',
    shipperName:'text',
    shipperContact:'text'
  });
  
  static Model = model("Manifest", this.schema);

  static async find(options = {}) {
    
    try {
      const manifests = await this.Model.find(options)
      
      const count = await this.countDocuments(options)
    
      return {manifests:manifests};
    } catch (error) {

      return {error: error};
    }
  }

  static async findOne(id) {
    try {
      const manifest = await this.Model.findOne({ _id: id });
      return {manifest: manifest};
    } catch (error) {
      return {error: error};
    }
  }

  static async insertOne(manifest) {
    try {
      const newManifest = new this.Model(manifest);
      const createdManifest = await newManifest.save();
      return {createdManifest: createdManifest};
    } catch (error) {
      return {error:error};
    }
  }

  static async updateOne(id, update) {
    try {
      const updation = await this.Model.updateOne(
        { _id: id },
        { $set: update }
      );
      return {updation:updation};
    } catch (error) {
      return {error:error};
    }
  }
  
  static async increment(id,update){
    try {
      const updation = await this.Model.updateOne(
        { _id: id },
        { $inc: update }
      );
      return {updation:updation};
    } catch (error) {
      return {error:'updation incomplete'};
    }
  }

  static async deleteOne(id) {
    try {
      //check if it still has shipments
      const options = { manifestId: id };
      const {error,shipments} = await Shipment.find(options);

      if (error) {
        
        error.status = 500
        {error:error} ;
      }else if(shipments.length >0){
        const e = new Error('the manifest you are trying to delete is still registered to shipments')
        e.status = 400
        return{error:e}
      }

      const deletion = await this.Model.deleteOne({ _id: id });
      return {deletion:deletion};
    } catch (error) {
      return {error:''};
    }
  }

  static async countDocuments(options = {}) {
    try {
      const count = await this.Model.countDocuments(options);
      return {count:count}
    } catch (error) {
      return {serror:error};
    }
  }
};
