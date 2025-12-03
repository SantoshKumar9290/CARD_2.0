const express = require('express')
const assignHandlder = require('../handlers/assignHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');


const handler = new assignHandlder();
const router = express.Router();

router.get('/getBasicDetails',[handler.getBasicDetails]);
router.get('/getPartyDetails',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.getPartyDetails])
router.get('/getPropertyDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getPropertyDetails])
router.get('/getRepresentativeDetails',verifyjwt,[handler.getRepresentativeDetails]);
router.get('/asignRegNo',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.asignRegNoHandler])
router.get('/getVerifyRDocNo',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getVerifyRDocNo]);
router.get('/getDocAckDetails', verifyjwt, [handler.getDocAckDetails]);
router.get('/validateNumber',[handler.valiadteNumber]);
router.get('/swapRNo',validateSchema(sqlQuerySchemaValidation),[handler.swapRNoHandler])
router.get('/assignRegularNumber',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.assignRegularNumber])
router.get('/assignNegativeNumber',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.assignNegativeNumber])
router.get('/checkfreehold',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.checkFreehold])

//section89api 
router.post('/addSection89',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.addSection89Details]);
router.get('/getSection89details',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getSection89Details]);
module.exports = router;