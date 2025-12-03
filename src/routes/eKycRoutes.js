const express = require('express')
const eKycHandlder = require('../handlers/eKycHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema')
const { validateSchema } = require('../plugins/ajv');


const handler = new eKycHandlder();
const router = express.Router();

router.get('/getAadharNo',validateSchema(sqlQuerySchemaValidation),[handler.getAadharNo]);
router.get('/getParties', verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getParties]);
router.get('/getsaveECPhotosDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.saveECPhotosDetails]);
router.post('/saveparty',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.savePartyhandler]);
router.post('/savePhoto',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.savePhoto]);
router.post('/saveWPhoto',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.saveWPhoto]);
router.get('/getWitnessDetails', verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getWitnessDetails]);
router.post('/saveParties', verifyjwt, [handler.saveParties]);

router.get('/getAadharNoRefusal',validateSchema(sqlQuerySchemaValidation),[handler.getAadharNoRefusal]);
router.get('/getPartiesRefusal', verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getPartiesRefusal]);
router.get('/getsaveECPhotosDetailsRefusal',verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.saveECPhotosDetailsRefusal]);
router.post('/savepartyRefusal',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.savePartyhandlerRefusal]);
router.post('/savePhotoRefusal',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.savePhotoRefusal]);
router.post('/saveWPhotoRefusal',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.saveWPhotoRefusal]);
router.get('/getWitnessDetailsRefusal', verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getWitnessDetailsRefusal]);
router.post('/savePartiesrefusal', verifyjwt, [handler.savePartiesRefusal]);
router.post('/getverifyTidcoZeroTwo', verifyjwt, [handler.getverifyTidcoZeroTwo]);
router.post('/getTidcoAadharWitness', verifyjwt, [handler.getTidcoAadharWitness]);
router.post('/GetValidateQrData',verifyjwt, [handler.GetValidateQrData]);

router.post('/saveekycexemptiondetails', verifyjwt, [handler.saveEkycExemptionDetailsHandler]);
router.get('/getexemptiondetails/:applicationId', verifyjwt, [handler.getExemptionDetailsHandler]);
module.exports = router;