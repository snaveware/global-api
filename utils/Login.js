const User = require("../models/user.model");
const Group = require('../models/group.model')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
require("dotenv").config();

module.exports = class Login {
  static schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  static validate(email,password) {
    const data = {
      email: email,
      password: password,
    };
    const { error, value } = this.schema.validate(data);
    if (error) {
      return { validationError: error.details[0].message};
    }
    return { value: value };
  }

  static async comparePasswords(userPassword,dbPassword) {
    const isPasswordValid = await bcrypt.compare(userPassword, dbPassword);
    if (!isPasswordValid) {
     return { passwordError: 'Invalid password'};
    }
    return { isValid: isPasswordValid };
  }

  static  async findUser(email) {
    const { error, user } = await User.findByEmail(email);
    if (error) {
      return { userError: error };
    }
    const userGroup = await Group.findOne(user.userGroup)
    if(userGroup.error){
      return { userError: userGroup.error };
    }
    
   
    return { user: {details:user,group:userGroup.group} };
  }

  static async genToken(id, level, permissions,branch,firstName,lastName,telephone) {
    try {
      const tokenDetails = {
        id: id,
        level: level,
        permissions: permissions,
        branch: branch,
        firstName:firstName,
        lastName:lastName,
        telephone:telephone
      };
      const token = await jwt.sign(tokenDetails, process.env.SECRET);
      return { token: token };
    } catch (error) {
      return { tokenError: 'Invalid token'};
    }
  }
};
