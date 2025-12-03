const express = require('express');
const SroListHandler = require('../handlers/sroListHandlers')
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');

const router = express.Router();
const handler = new SroListHandler();


router.get('/getSroList', [handler.getSroList]);
router.put('/updDeclaredCopy',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.updDeclaredCopy]);
router.get('/getCheckcs',verifyjwt, [handler.getCheckcs]);
router.post('/generateNewAppid',verifyjwt, [handler.generateNewAppid]);
router.put('/scroll',verifyjwt,[handler.scrollHandler])
router.get('/getText',[handler.getScrollHandler])




module.exports = router;