const express = require('express');
const UpdateDocumentHandler = require('../handlers/updateDocumentHandler');
const { verifyjwt } = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');

const handler = new UpdateDocumentHandler(); 
const router = express.Router();

router.get('/getmajordata',validateSchema(sqlQuerySchemaValidation),verifyjwt,[handler.getTranMajor]);
router.get('/gettranEC',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getTranEC]);
router.get('/getRepresentativeDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getRepresentativeDetails]);
router.get('/getTranSched',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getTranSched]);
router.get('/getLinkDocuments',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getLinkDocuments]);
router.put('/updateTranECFIRMS',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.updateTranECFIRMS]);
router.put('/updateTranEC',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.updateTranEC]);
router.put('/updateTransched',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.updateTransched]);
router.put('/updateTranLinkdocumentdetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.updateTranLinkdocumentdetails]);



// --------------------------Routes Related to EditIndex1983-------------------------//
router.get('/getEIODBASEdetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getEIODBASEdetails]);
router.get('/getEIODBASEONSTATUSdetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getEIODBASEONSTATUSdetails]);
router.get('/getEIODdetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getEIODdetails]);
router.put('/requestEditEIODDoctDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.requestEditEIODDoctDetails]);
router.put('/UpdateDrStatusOnEIODDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.UpdateDrStatusOnEIODDetails]);

router.put('/getEIODSRPDFdetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getEIODSRPDFdetails]);


router.put('/UpdateFreezeEIODDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.UpdateFreezeEIODDetails]);
router.put('/updateEIODetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.updateEIODetails]);
router.put('/updateEIODLINKetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.updateEIODLINKetails]);
router.put('/deleteEIODPartyDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.deleteEIODPartyDetails]);
router.put('/deleteEIODPropertyDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.deleteEIODPropertyDetails]);
router.put('/deleteEIODLinkDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.deleteEIODLinkDetails]);



//NR----Edit Index New Functionality-Esign Integration API'S------------------------//

router.post('/fetchPartiesColNames',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.fetchPartiesColNames]);
router.post('/SubmitRequestFormEdit',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.SubmitRequestFormEdit]);
router.post('/GetRequestForm',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.GetRequestForm])
router.put('/getEditIndexSRPDFdetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getEditIndexSRPDFdetails]);
router.post('/generateRequestEditIndexPDF',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.generateRequestEditIndexPDF]);
router.get('/getEditIndexMisReport',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getEditIndexMisReport]);
router.get('/getEditIndexPdfReport',verifyjwt,[handler.getEditIndexMISPdfReport]);
router.get('/getEditIndexMisReportInitial',verifyjwt,[handler.getEditIndexMisReportInitial]);



//RP
router.post('/generateEditIndexPDF',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.generateEditIndexPDF]);
router.post('/editIndexEsignStatus',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.editIndexEsignStatus]);
router.post('/geteditIndexEsignDoct',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.geteditIndexEsignDoct]);
router.post('/editIndexEsign/:type',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.editIndexEsign]);
router.post('/addEditIndexData',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.addEditIndexData]);
router.get('/getDocumentStatusDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getDocumentStatusDetails]); 
router.get('/getmajorDirdata',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getTranDir]);
router.get('/getListVillagesR',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getListVillagesR]);
router.get('/getListVillagesU',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getListVillagesU]);
router.get('/getHabitations/:type/:villageCode',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getHabitations]);
router.delete('/deleteTempLinkDocument',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.deleteTempLinkDocument]);
 
module.exports = router;