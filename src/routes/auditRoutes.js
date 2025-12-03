const express = require('express')
const auditHandler = require('../handlers/auditHandler');
const { verifyjwt } = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema')
const { validateSchema } = require('../plugins/ajv');
const handler = new auditHandler();
const router = express.Router();

router.post('/auditPlan', verifyjwt, [handler.auditPlan]);
router.delete('/auditplandelete', verifyjwt, [handler.auditplandelete]);
router.put('/updateAuditPlan', verifyjwt,[handler.updateAuditPlan]);
router.get('/getEmployeesDR', [handler.getEmployeesDR]);
router.get('/getauditsrlist', [handler.getauditsrlist]);
router.get('/getAuditDRList', [handler.getAuditDRList]);
router.get('/getEmployeesDIG', [handler.getEmployeesDIG]);
router.get('/getDIGLocations', [handler.getDIGLocations]);
router.get('/getAuditPlanDetails', verifyjwt, [handler.getAuditPlanDetails]);
router.get('/getAuditCashDetails', verifyjwt, [handler.getAuditCashDetails]);
router.post('/auditRemarks', verifyjwt, [handler.auditRemarks]);
router.get('/getAuditRemarksDetails', verifyjwt, [handler.getAuditRemarksDetails]);
router.put('/updateAuditRemarks', verifyjwt, [handler.updateAuditRemarksDetails]);
router.get('/getAuditApplication', verifyjwt, [handler.getAuditApplication]);
router.get('/genarateAuditRevieworder', verifyjwt, [handler.genarateAuditRevieworder]);
router.put('/dutyCalculator', verifyjwt, [handler.dutyCalculaterHandler]);
router.put('/updateAuditRemarks1', verifyjwt, [handler.updateAuditRemarks1Details]);
router.put('/updateDIGAuditRemarksDetails', verifyjwt, [handler.updateDIGAuditRemarksDetails]);
router.get('/getDigAuditschuduleDetails', verifyjwt, [handler.getDigAuditschuduleDetails]);
router.get('/getDIGiarDetails', verifyjwt, [handler.getDIGiarDetails]);
router.get('/getAuditdocument', verifyjwt, [handler.getAuditdocument]);
router.get('/getAuditPdfGenerate', verifyjwt, [handler.getAuditPdfGenerate]);
router.get('/getIndexByCriteriaReport', verifyjwt, [handler.getIndexByCriteriaReport]);
// router.post('/send-pdfs', [handler.sendPDFEmailHandler]);
router.put('/getAuditRemarksStatus', verifyjwt, [handler.getAuditRemarksStatus]);
router.get('/getAuditDigfinalReport', verifyjwt, [handler.getAuditDigfinalReport]);
router.get('/getNatureDocumentsList', verifyjwt, [handler.getNatureDocumentsList])
router.get('/getPdfreceipt', verifyjwt, [handler.getPdfreceipt]);
router.put('/updateDIGAuditMISCashdetails', verifyjwt, [handler.updateDIGAuditMISCashdetails]);
router.get('/getMISAuditDetails', verifyjwt, [handler.getmisAuditDetails]);
router.get('/getCheckSlipReports', verifyjwt, [handler.getCheckSlipReports]);

module.exports = router;