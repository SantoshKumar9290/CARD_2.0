const express = require('express')
const endorseHandler = require('../handlers/endorseHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');

const handler = new endorseHandler();
const router = express.Router();

router.post('/save',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.saveEndorseHandler]);
router.post('/endorsementReport',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.createEndorsementDocumentHandler]);
router.post('/endorsementReport/fingerprint',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.createEndorsementDocumentWithFingerPrintHandler]);
router.post('/endorsementReport/fingerprint/pending',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.createEndorsementDocumentWithFingerPrintPendingHandler]);
router.post('/bundlingReport',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.createBundlingDocumentHandler]);
router.post('/certificateOfRegistration',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.createCertificateOfGenerationHandler]);
router.post('/scannedReport',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.scannedDocumentHandler]);
router.get('/getSRNames',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.getSrNamesHandler]);
router.post('/report',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.createFinalReportHandler]);
router.post('/refusalCertificateOfRegistration',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.createRefusalCertificateOfGenerationHandler]);


module.exports = router;