const router = require('express').Router()



router.get('/', async (req,res) =>{
   res.json('emails')
})


module.exports = router