const router = require('express').Router()
const Controller = require('../controllers/users.controller')

router.use(require('../middlewares/protectRoute'))

router.post('/upload/:userId',Controller.uploadProfile)

router.use(require('../middlewares/verifyPermissions'))

router.get('/emails',Controller.getEmails)

router.get('/', Controller.getUsers)

router.get('/count',Controller.count)

router.get('/:id', Controller.getUser)


router.post('/', Controller.createUser)

router.put('/', Controller.updateUser)

router.delete('/:id', Controller.deleteUser)




module.exports = router