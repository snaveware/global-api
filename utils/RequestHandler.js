module.exports = class RequestHandler{
   static throwError(status,message,e = null){
      return (e) =>{
         if(e){
            throw e
            return
         }
         e = new Error(message)
         e.status = 400
         throw e
      }
   }

   static sendError(res,error){
      console.log(error)
     return res.status(error.status || 500).json(error.message)
   }

   static sendSuccess(res,data){
      return res.status(200).json(data)
   }
}