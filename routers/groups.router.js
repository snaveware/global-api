const router = require('express').Router()
const Controller = require('../controllers/groups.controller')

router.use(require('../middlewares/protectRoute'))

router.use(require('../middlewares/verifyPermissions'))

router.get('/',Controller.getGroups)

router.get('/count',Controller.count)

router.get('/:id',Controller.getGroup)

router.post('/',Controller.createGroup)

router.put('/',Controller.updateGroup)

router.delete('/:id',Controller.deleteGroup)

module.exports = router