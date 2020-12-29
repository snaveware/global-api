const { Schema, model } = require("mongoose");
const User = require("./user.model");

module.exports = class Group {
  static schema = new Schema({
    name: {
      type: String,
      required: true,
    },
    permissions: {
      type: Object,
      default: {
        incomplete: false,
        archived:false,
        shipments: [false,false,false,false],
        manifests: [false,false,false,false],
        users: [false,false,false,false],
        groups: [false,false,false,false],
      },
    },
    level: {
      type: Number,
      default: -1,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    createdOn: {
      type: Date,
      default: Date.now(),
    },
    lastUpdate: {
      type: Date,
      default: Date.now(),
    },
    createdBy:{
      type:String,
      default:''
    },
    editedBy:{
      type:String,
      default:''
    }
  });

  static Model = model("userGroup", this.schema);

  static async findOne(id) {
    try {
      const group = await this.Model.findOne({_id:id});
      return {group:group};
    } catch (error) {
      return {error:error}
    }
  }

  static async find(options) {
    try {
      const groups = await this.Model.find(options);
      return {groups:groups}
    } catch (error) {
      return {error:error}
    }
  }

  static async insertOne(group) {
    // check if another group has the same name 
    const {error,groups} = await this.find({name:group.name})
    if(error){
      return {error:error}
    }
    if(groups.length>0){
      return {error: new Error('a group with that name already exists')}
    }
    try {
      const newGroup = new this.Model(group);
      const createdGroup = await newGroup.save();
      return {createdGroup:createdGroup};
    } catch (error) {
      
      return {error:error}
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
      return {error:error}
    }
  }

  static async deleteOne(id) {
    try {
      //check if there are users in this group
      const options = {userGroup: id };
      const {error,users} = await User.find(options);
      if (error) {
        error.status = 500
        return {error: error};
      }else if(users.length>0){
        const e = new Error('The user group is still asigned to users')
        e.status = 400
        return {error:e}
      }

      const deletion = await this.Model.deleteOne({ _id: id });
      return {deletion:deletion};
    } catch (error) {
      return {error:error}
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
