const User = require("./models/user.model");
const bcrypt = require("bcryptjs");
const Group = require("./models/group.model");
require("dotenv").config();
mongoose = require("mongoose");
const Config = require('./Config');

function db() {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };
  mongoose.connect(process.env.DB_URI, options);
  mongoose.connection.on("connected", async () => {
    console.log("database connected");

    const {error,groups} = await Group.find()
    if(error){
      throw error
    }else{
      if(groups.length == 0){
        init()
      }
    }

  });
}

async function init(){

  const adminGroup = {
    name: "admin",
    level:0,
    permissions: {
      incomplete: true,
      archived:true,
      shipments: [true, true, true, true],
      manifests: [true, true, true, true],
      users: [true, true, true, true],
      groups: [true, true, true, true],
    },
    description: "access to everything",
  }
  
  const agentGroup = {
    name: "Agent",
    level:5,
    permissions: {
      incomplete: false,
      archived:false,
      shipments: [true, true, true, false],
      manifests: [true, true, true, false],
      users: [false, true, false, false],
      groups: [false, true, false, false],
    },
    description: "day to day user",
  }
  
  const afterCreatingAgentGroup = await Group.insertOne(agentGroup)

  if(afterCreatingAgentGroup.error){
    throw afterCreatingAgentGroup.error
  }

  
  const afterCreatingAdminGroup = await Group.insertOne(adminGroup)
  if(afterCreatingAdminGroup.error){
    throw afterCreatingAdminGroup.error
  }else{
    const rootUser = {
      lastName:Config.DEFAULT_ADMIN_LASTNAME,
      userGroup:afterCreatingAdminGroup.createdGroup._id,
      status:"active",
      profilePicUrl:"",
      groupName:'admin',
      firstName:Config.DEFAULT_ADMIN_FIRSTNAME,
      email:Config.DEFAULT_ADMIN_EMAIL,
      password:Config.DEFAULT_ADMIN_PASSWORD
    }

    const afterCreatingRootUser = await User.insertOne(rootUser)

    if(afterCreatingRootUser.error){
      throw afterCreatingRootUser.error
    }
  }

}

module.exports = db;
