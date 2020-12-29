const router = require('express').Router()
const Controller = require('../controllers/shipments.controller')

router.use(require('../middlewares/protectRoute'))

router.use(require('../middlewares/verifyPermissions'))

router.get('/',Controller.getShipments)

router.get('/count',Controller.count)

router.get('/:id', Controller.getShipment)

router.post('/', Controller.createShipment)

router.put('/',Controller.updateShipment)

router.delete('/:id',Controller.deleteShipment)


module.exports = router