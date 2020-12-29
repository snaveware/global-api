//third party modules
const jwt = require("jsonwebtoken");
require("dotenv").config();

//local modules
const RequestHandler  = require('../utils/RequestHandler')

module.exports = async (req, res, next) => {
  
 

  try {
    //get token from req header
    let token = req.header("token");
    const url = req.originalUrl.toLowerCase()
    let isFile = false
    if(url.indexOf('file') != -1){
      token = req.query.t
      isFile = true
    }
    
    if (!token) {
      if(isFile){
        return res.status(403).end()
      }
      RequestHandler.throwError(403,'Access denied. please provide a token')();
    }
    const verified = jwt.verify(token, process.env.SECRET);
    req.body.verified = true;
    req.body.userId = verified.id;
    req.body.level = verified.level;
    req.body.permissions = verified.permissions;
    req.body.branch = verified.branch;
    req.body.firstName = verified.firstName;
    req.body.lastName = verified.lastName
    req.body.token = token
    req.body.telephone = verified.telephone
  } catch (error) {
    return RequestHandler.sendError(res,error)
  }
 
  next();
};
