module.exports = class Config{
   //site
   static BASE_URL = process.env.BASE_URL || 'http://localhost:5000'
   static EMAIL = 'work.evans020@gmail.com'
   static COMPANY_NAME = 'Global Inc'
   //email
   static FROM = 'metametaross@gmail.com' //email used to send other emails
   //database
   static DEFAULT_LIMIT = 0
   static DEFAULT_PAGE = 1
   static INCOMPLETE_STATUS = 'incomplete' //status for all incomplete shipments and manifests
   static COMPLETE_STATUS = 'complete' // status for all complete shipments and manifest in transit
   static ARRIVED_STATUS = 'arrived' //status for all manifests and shipments that have arrived
   static UPDATE_REQUEST_METHOD = 'put' // method used for update requests
   static ACTIVE_USERS_STATUS = 'active' //status for users whose accounts are accessible
   static INACTIVE_USERS_STATUS = 'inactive' //status for users whose accounts are inaccessible
   //admin
   static DEFAULT_ADMIN_FIRSTNAME = 'Root'
   static DEFAULT_ADMIN_LASTNAME = 'Admin'
   static DEFAULT_ADMIN_EMAIL = Config.EMAIL
   static DEFAULT_ADMIN_PASSWORD = 'password'
}