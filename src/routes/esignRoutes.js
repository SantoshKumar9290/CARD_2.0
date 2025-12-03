const express = require('express');
const EsignHandler = require('../handlers/esignHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');


const handler = new EsignHandler();
const router = express.Router();

router.post('/',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.eSignDocument]);
router.post('/endorsement',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.eSignEndorsementDocument]);
router.post('/refusalCor',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.eSignRefusalCorDocument]);


router.post('/status',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.eSignStatus]);
router.post('/endorsement/status',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.eSignEndorsementStatus]);
router.post('/refusalCor/status',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.eSignRefusalCorStatus]);

router.get("/getMutationCertificate", verifyjwt,[handler.getMutationCertificate]);



module.exports = router;