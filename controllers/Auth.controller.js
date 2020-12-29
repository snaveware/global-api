const Login = require('../utils/Login')
const RequestHandler = require('../utils/RequestHandler')

module.exports = class Auth{
   static async login(req,res) {  
      try {
         //make sure email and password are passed
         if(!req.body || !req.body.email || !req.body.password){
            RequestHandler.throwError(400,'Email and password are required')()
         }
         const email = req.body.email
         const password = req.body.password

         //validate email and password
         const { validationError, value } = Login.validate(email,password);
         if (validationError) {
            RequestHandler.throwError(400,validationError)()
         }
   
         //find user
         const { userError, user } = await Login.findUser(email);
         if (userError) {
            RequestHandler.throwError(400,userError)()
         }else if(user.details.status != 'active'){
            RequestHandler.throwError(400,'Your account is currently deactivated')()
         }

         if(!user){
            RequestHandler.throwError(400,'could not find your account')()
         }
   
         //compare passwords
         const { passwordError, isValid } = await Login.comparePasswords(
         password,user.details.password
         );
         if (passwordError) {
            RequestHandler.throwError(400,passwordError)()
         }
         //generate token
         const { tokenError, token } = await Login.genToken(
         user.details._id,
         user.group.level,
         user.group.permissions,
         user.details.branch,
         user.details.firstName,
         user.details.lastName,
         user.details.telephone
         );
         if (tokenError) {
            RequestHandler.throwError(400,tokenError)()
         }
   
         //prepare response
         const response = {
         id: user.details._id,
         firstName: user.details.firstName,
         lastName: user.details.lastName,
         level: user.group.level,
         permissions: user.group.permissions,
         token: token,
         };
         RequestHandler.sendSuccess(res,response)

      } catch (error) {
         RequestHandler.sendError(res,error)
      }
     
   }
}

