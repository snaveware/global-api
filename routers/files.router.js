const router = require('express').Router()
const fs = require('fs')

router.use(require('../middlewares/protectRoute'))

router.get('/profile/:userId', async (req,res) =>{
   let path = `${appRoot}/images/profile_${req.params.userId}.jpg`
   if(!fs.existsSync(path)){
      path = `${appRoot}/images/profile.jpg`
   }
   res.sendFile(path)

})

router.get('/manifest/:manifestId', (req,res)=>{
   const path = `${appRoot}/pdfs/manifest_${req.params.manifestId}.pdf`
   if(!fs.existsSync(path)){
      return res.status(404).end()
   }

  return res.sendFile(path)
})
module.exports = router