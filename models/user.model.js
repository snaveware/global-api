const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

module.exports = class User {
  static schema = new Schema({
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      default: "",
    },
    branch: {
      type: String,
      default: "",
    },
    userGroup: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "active",
    },
    createdOn: {
      type: Date,
      default: Date.now(),
    },
    createdBy: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Date,
      default: Date.now(),
    },
    editedBy: {
      type: String,
      default: "",
    },
    lastEdited: {
      type: Date,
      default: Date.now(),
    },
    profilePicUrl: {
      type: String,
      default: "",
    },
    groupName:{
      type: String,
      default:'',
    },
    darkMode:{
      type:Boolean,
      default:false
    }
  }).index({
    firstName:'text',
    lastName:'text',
    telephone:'text',
    branch:'text'
  });

  static Model = model("User", this.schema);

  static async findOne(id) {
    try {

      const user = await this.Model.findOne({_id:id})
      //make sure the user exists
      if (!user) {
        return {error: new Error('user not found')};
      }


      //remove sensitive properties
      user.password = undefined;

      return {user:user}
    } catch (error) {
      return {error:error};
    }
  }

  static async find(options ={}) {
    try{
      const users =  await this.Model.find(options)
      users.forEach(user =>{
        user.password = undefined
      })
      return {users:users};
    } catch (error) {
      return {error:error};
    }
  }

  static async findEmails(options = {}){
    try{
      const emails=  await this.Model.find(options,{email:1,_id:0})
      let asString = []
      emails.forEach(email =>{
        asString.push(email.email)
      })
      return {emails:asString};
    } catch (error) {
      return {error:error};
    }
  }

  static async insertOne(registerUser) {
    //ensure no user with such email exists
    const { error, user } = await this.findByEmail(registerUser.email);
    if (user) {
      return {error:new Error('The email you provided is already registered to a user')};
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerUser.password, salt);
    registerUser.password = hashedPassword;
    try {
      const newUser = new this.Model(registerUser);
      const createdUser = await newUser.save();
      return {createdUser:createdUser};
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
      return {error:error}
    }
  }

  static async deleteOne(id) {
    try {
      const deletion = await this.Model.deleteOne({ _id: id });
      return {deletion:deletion}
    } catch (error) {
      return {error:error}
    }
  }

  static async findByEmail(email) {
    try {
      const user = await this.Model.find({email:email})
      if (!user[0]) {
        return { error: new Error('The email you provided is not registered to a user') };
      }
      return { user: user[0] };
    } catch (error) {
      return { error: error };
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
