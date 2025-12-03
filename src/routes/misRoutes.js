const express = require('express')
const MISHandler = require('../handlers/misHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema')
const { validateSchema } = require('../plugins/ajv');

const handler = new MISHandler();
const router = express.Router();
router.get('/misDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getMisDetails])
router.get('/getdata',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getMisDevelop]);
router.get('/drillData',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getDrillData]);
router.get('/drlist',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getDrListData]);
router.get('/srocode',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getSROcodeData])
router.get('/mutation',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getMutationStatus])
router.get('/Anywhere',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getanywhere])
router.get('/Prohb',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getProhb])
router.get('/anyDrilDown',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getanyDrilDown])
router.get('/dataProhb',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getProhbData])
router.get('/documentdetailsReport',verifyjwt,[handler.documentdetailsReport]);
router.get('/getnatureofdoclist',verifyjwt, [handler.getnatureofdoclist])
router.get('/getTopNDocuments',verifyjwt,[handler.getTopNDocuments]);
router.get('/getTopNDocumentsDetails',verifyjwt,[handler.getTopNDocumentsDetails])
router.get('/getSelectedDocumentDetails',[handler.getSelectedDocumentDetails]);
router.post('/mvAssitanceReport',[handler.mvAssitanceReport]);
router.get('/pdfpreview' ,[handler.pdfpreview]);
router.get("/pendingEsignList" ,[handler.pendingesignlist]);
router.get('/getmvacoordinatesdata',[handler.getmvacoordinatesdata]);
router.get('/getTopSelectedDocumentDetails',[handler.getTopSelectedDocumentDetails]);
router.get('/getChallanReports',verifyjwt,[handler.getChallansReport]);
router.post('/getChallanReportsgeneratePDF',verifyjwt,[handler.getChallansReportgeneratePDF]);
router.get('/getAnywhereDocStatus', verifyjwt, [handler.getAnywhereDocStatus]); // Anywhere Document Status
router.get('/getassessmentnumberwithdoornumber', verifyjwt, [handler.getSearchAssessmentNumberWithDoorNumberHandler]); // Assessment Search
router.get('/getulbname', verifyjwt, [handler.getUlbNameHandler]); // ULB Code's
module.exports = router;