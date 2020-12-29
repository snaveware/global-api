function determineOptions(category, search,body){
   let options = {}

   if(search && search != ''){
      options['$text'] = {
         $search:search,
         $caseSensitive:false
      }
   }
   switch (category) {
      case 'active':
         options['$or'] = [
            {status:'complete'},
            {status:'shipping'},
            {status:'arrived'},

            
         ]
         if(body.permissions.incomplete){
            options.$or.push({status:'incomplete'})
         }else{
            options.$or.push({$and:[{status:'incomplete'},{branch:body.branch}]}) 
         }
         break;

      case 'incomplete':
         if(body.permissions.incomplete){
            options['status'] = 'incomplete'
         }else{
            options['$and'] = [
               {branch:body.branch},
               {status:'incomplete'}
            ]
         }       
         break;

      case 'archived':
         if(body.permissions.archived){
            options['status'] = 'archived'
         }else{
            options['$and'] = [
               {branch:body.branch},
               {status:'archived'}
            ]
         }       
         break
         
      case 'shipping':     
         options['status'] = 'complete'    
         break
      case 'arrived':     
         options['status'] = 'arrived'    
         break
    
   }
   return options
}

function determineUserOptions(category,search,body){
   let options = {}

   if(search && search != ''){
      options['$text'] = {
         $search:search,
         $caseSensitive:false
      }
   }

   switch (category) {
      case 'active':
         options['status'] = 'active'
         break;
      case 'locked':
         options['status'] = 'locked'
         break;
      
      
   }

   return options
}




module.exports.determineOptions = determineOptions
module.exports.determineUserOptions = determineUserOptions