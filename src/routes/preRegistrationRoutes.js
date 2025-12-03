const express = require('express')
const preRegistrationHandler = require('../handlers/preRegistrationHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');


const handler = new preRegistrationHandler();
const router = express.Router();

router.get('/pedingRegistrationDoc',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.getPreRegistrationDocsForPending]);
router.get('/postPdeDocs',verifyjwt,[handler.postPDE]);
router.put('/amend',verifyjwt,[handler.amendHandler]);
router.get('/getAmmend',verifyjwt,[handler.getAmmend]);
router.post('/SaveNomineDetilas',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.SaveNomineDetilas]);
router.post('/postPde/accept', verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.postPdeByAcceptHandler]);
router.put('/updateDoc',verifyjwt,[handler.updateDocVerify]);
router.get('/getDoc',[handler.getDocVerify]);
router.get('/anywhere/accept',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.anyWhereAccept]);
router.get('/anywhere/status',verifyjwt,[handler.anyWhereStatus]);
router.put('/anywhere/save', verifyjwt,[handler.anyWhereSave])
router.get('/anywhere/pending',verifyjwt,[handler.anyWherePending]);
router.post('/savePending',verifyjwt,[handler.savePending]);
router.post('/saveProbAudit',[handler.saveProbAudit]);
router.post('/saveGrantApproval',[handler.saveGrantApproval]);
router.get('/getProhbStatus',[handler.getProhbStatus]);
router.put('/UpdatePPGrant',[handler.UpdatePPGrant])
router.post('/previewAnywhereDocument',verifyjwt,[handler.getPreviewAnywhereDocument]);
router.get('/slotEnableStatus',verifyjwt, [handler.getSlotEnableStatus]);
router.post('/verifyOTP',verifyjwt, [handler.getVerifyOTP]);
router.put('/rejectDuplicateSurveyNoDoc', verifyjwt, [handler.rejectDuplicateSurveyNoDoc]) 
router.put('/reSubmitAnywhereDocument', verifyjwt, [handler.reSubmitAnywhereDocument]) 
router.get('/getClaimantDetails', verifyjwt, [handler.getClaimantDetails])
router.post('/SaveEkycClaimantDetails',verifyjwt, [handler.SaveEkycClaimantDetails]);
router.put('/rejectDuplicateStampsDoc', verifyjwt, [handler.rejectDuplicateStampsDoc])
router.get('/getOCIParties', verifyjwt, [handler.getOCIParties])

module.exports = router;