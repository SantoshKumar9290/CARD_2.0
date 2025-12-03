const express = require('express')
const DocumentHandoverHandler  = require('../handlers/documentHandoverHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema')
const { validateSchema } = require('../plugins/ajv');


const handler = new DocumentHandoverHandler();
const router = express.Router();


router.get('/getNominee',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getNominee]);
router.put('/saveHandover',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.saveDocHandover])
router.get('/getValidateNomineeQr',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getValidateNomineeQr]);
router.get('/partyExemptionCheck',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.partyExemptionCheck]);


module.exports = router;