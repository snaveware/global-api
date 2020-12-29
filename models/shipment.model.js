const { Schema, model } = require("mongoose");
const Config = require("../Config");

module.exports = class Shipment {
  static schema = new Schema({
    title: {
      type: String,
      default: "",
    },
    customerName: {
      type: String,
      default: "",
    },
    customerTelephone: {
      type: String,
      default: "",
    },
    CBM: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    manifestId: {
      type: String,
      default: "",
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
    createdOn: {
      type: Date,
      default: Date.now(),
    },
    lastEdited: {
      type: Date,
      default: Date.now(),
    },
    currency: {
      type: String,
      default: "USD",
    },
    picked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "incomplete",
    },
    branch:{
      type:String,
      default:''
    },
    trackingId:{
      type:String,
      default:''
    }
  }).index({
    customerName: "text",
    customerTelephone: "text",
    title: "text",
  });

  static Model = model("Shipment", this.schema);

  static async find(options = {}) {
    
    try {
      const shipments = await this.Model.find(options)
      return {shipments:shipments};
    } catch (error) {
      return {error:error}
    }
  }

  static async findOne(id) {
    try {
      const shipment = await this.Model.findOne({ _id: id });
      return {shipment:shipment};
      
    } catch (error) {
      return {error:error};
    }
  }

  static async insertOne(shipment) {
    try {
      const newShipment = new this.Model(shipment);
      const createdShipment = await newShipment.save();
      return {createdShipment:createdShipment};
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
      return {error:error};;
    }
  }

  static async update(filter, update) {
    try {
      const updation = await this.Model.updateMany(filter, { $set: update });

      return {updation:updation}
    } catch (error) {
      return {error:error};
    }
  }

  static async deleteOne(id) {
    try {
      const deletion = await this.Model.deleteOne({ _id: id });
      return {deletion:deletion};
    } catch (error) {
      return {error:error};
    }
  }

  static async countDocuments(options = {}) {
    try {
      const count = await this.Model.countDocuments(options);
      return {count:count}
    } catch (error) {
      return {error:error};
    }
  }
};
