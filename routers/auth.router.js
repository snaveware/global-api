const router = require('express').Router()
const Controller = require('../controllers/Auth.controller')


router.get('/', async (req,res) =>{
   res.json('auth')
})

router.post('/login',Controller.login)

module.exports = router