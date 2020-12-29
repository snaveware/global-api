const router = require('express').Router()
const Controller = require('../controllers/manifests.controller')


router.use(require('../middlewares/protectRoute'))//middleware - is logged in

router.post('/pdf/:manifestId', Controller.generatePdf)

router.post('/email/:manifestId',Controller.sendEmail)

router.use(require('../middlewares/verifyPermissions'))//middleware -has permissions

router.get('/',Controller.getManifests)

router.get('/count',Controller.count)

router.get('/:id',Controller.getManifest)

router.post('/',Controller.createManifest)

router.put('/',Controller.updateManifest)

router.delete('/:id',Controller.deleteManifest)



module.exports = router