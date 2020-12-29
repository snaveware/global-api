const Shipment = require('../models/shipment.model')
const Manifest = require('../models/manifest.model')
const Config = require('../Config')
const User = require('../models/user.model');
const Group = require('../models/group.model')
const RequestHandler = require('../utils/RequestHandler')


module.exports = async (req, res, next) => {
  try {
    const method = req.method.trim().toLowerCase();
    const url  = req.originalUrl.trim().toLowerCase()
    const permissions = req.body.permissions;
    const level = req.body.level;
    const body = req.body
    if(!permissions){
      RequestHandler.throwError(400, 'Could not resolve your permissions')()
    }
    const {categoryError,category} = findCategory(url)
    if(categoryError){
      RequestHandler.throwError(400, 'Could not resolve the url')()
    }
    
    const {methodError,position} = findPosition(method)
    if(methodError){
      RequestHandler.throwError(400, 'unSupported request method')()
    }

    const {isAllowedError,isAllowed} = isPermitted(category,position,permissions);
    if(isAllowedError){
      return RequestHandler.throwError(403, 'You do not have permissions to access this resource')()
    }
    
    // special case if you are editing a document
    // if it's incomplete, you need permissions to edit incomplete documents or belong to the branch it was created
    // if it's archived you need permissions to edit archived documents
    //if it's user you need permissions to edit users or can edit only your account.
    // you cant edit some parameters in you account eg. user group
    if(method == Config.UPDATE_REQUEST_METHOD){
      const {permissionsError,allow} = await ifUpdate(category,body,isAllowed)
      if(permissionsError){
        RequestHandler.throwError(403,permissionsError)()
      }else if(!allow){
        RequestHandler.throwError(403,'You do not have permissions to access this resource')()
      }
    }else{
      if(!isAllowed){
        RequestHandler.throwError(403,'You do not have permissions to access this resource')()
      }
    
    }
  } catch (error) {
    return RequestHandler.sendError(res,error)
  }
  
  next();

};


function findCategory(url){
  try {
    const first = url.charAt(0)
    if(first == '/'){
      url = url.replace('/','').trim()
    }

    let urlArray;
    let path = url

    if(url.indexOf('?') != -1){
      urlArray = url.split('?')
      path = urlArray[0].trim()
    }

    let pathArray;
    
    if(path.indexOf('/') != -1){
      pathArray = path.split('/')
      let category = pathArray[0].trim()
      return {category:category}
    }else{
      return {category:path}
    }

  } catch (error) {
    return {error: 'invalid route'}
  }
}

function findPosition(method){
  let position;
  switch (method) {
    case "get":
      position = 1;
      break;
    case "post":
      position = 0;
      break;
    case Config.UPDATE_REQUEST_METHOD:
      position = 2;
      break;
    case "delete":
      position = 3;
      break;
    default:
      return {methodError:'The request method is unsupported by this api'}
  }

  return {position:position}
}

function isPermitted(category,position,permissions){
  try {
    const isAllowed = permissions[category][position]? true:false
    return {isAllowed: isAllowed}
  } catch (error) {
    return {isAllowedError: "You do not have required permissions to access this resource"}
  }
}

async function reviewShipmentEditPermissions(body,isAllowed){
  const {error,shipment} =  await Shipment.findOne(body.id) 
  if(error){
    return {permissionsError: error.message}
  }

  switch(shipment.status){
    case 'incomplete':
      if(body.permissions.incomplete){
        return {allow:true}
      }else if(shipment.branch == body.branch){
        return {allow:true}
      }else{
        return {allow:false}
      }
      break
    case 'archived':
      if(body.permissions.archived){
        return {allow:true}
      }else{
        return {allow:false}
      }
      break
    default:
    return {allow: isAllowed}
  }
}

async function reviewManifestEditPermissions(body,isAllowed){
  const {error,manifest} =  await Manifest.findOne(body.id)
  if(error){
    return {permissionsError:error.message}
  }

  switch(manifest.status){
    case 'incomplete':
      if(body.permissions.incomplete){
        return {allow:true}
      }else if(manifest.branch == body.branch){
        return {allow:true}
      }else{
        return {allow:false}
      }
      break
    case 'archived':
      if(body.permissions.archived){
        return {allow:true}
      }else{
        return {allow:false}
      }
      break
    default:
    return {allow: isAllowed}
  }
  
}

async function reviewUserEditPermissions(body,isAllowed){

  const {error,user} = await User.findOne(body.id)
  if(error){
    return {permissionsError:error.message}
  }

  const group = await Group.findOne(user.userGroup)
  if(group.error){
    return {permissionsError: 'could not find the group you are trying to update'}
  }

  if(group.group.level < body.level){
    return {permissionsError: "access denied. You might be editing your superior's account"}
  }
  

  if(user._id == body.userId)
  {
    
    if(body.update.userGroup && user.userGroup != body.update.userGroup){
      
      return {permissionsError: 'You cannot edit your own user group'}
    }else{
      return {allow:true}
    }
  }else{
   
    if(body.update.status && group.group.level < body.level){
      return {permissionsError: 'Access denied'}
    }
  }
  
  return {allow:isAllowed}

}
async function reviewGroupEditPermissions(body,isAllowed){
  if(!isAllowed){
    
    return isAllowed
  }else{
    
    const {group,error} = await Group.findOne(body.id)
    if(error){
    
      return {permissionsError: 'could not find the group you are trying to update'}
    }
    if(group.level <= body.level){
      
      return {permissionsError: "The level is too low. Make sure it's greater or equal to yours"}
    }
  }
  return {allow: isAllowed}
}


async function ifUpdate(category,body,isAllowed){
  switch(category){
    case 'manifests':
      return await reviewManifestEditPermissions(body,isAllowed)
      break
    case 'shipments':
      return await reviewShipmentEditPermissions(body,isAllowed)
      break
    case 'users':
      return await reviewUserEditPermissions(body,isAllowed)
      break
    case 'groups':
      return  await reviewGroupEditPermissions(body,isAllowed)
    default:
      return {allow:isAllowed}
  }
}