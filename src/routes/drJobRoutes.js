const express = require('express');
const DrJobHandler = require('../handlers/drJobHandler')
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');

const router = express.Router();
const handler = new DrJobHandler();
router.get('/swapRNo',validateSchema(sqlQuerySchemaValidation),[handler.swapRNoHandler])
// router.get('/swapRNo',validateSchema(sqlQuerySchemaValidation),[handler.swapRNoHandler])
router.put('/updatestatusbydraccept',validateSchema(sqlQuerySchemaValidation),[handler.UpdatestatusByDraccept])
router.post('/saveDrJobSrvcdoct',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.saveDrJobSrvcdoct]);
router.get('/getDrJobStatusbySroName',validateSchema(sqlQuerySchemaValidation),[handler.getDrJobStatusbySroName]);
router.get('/getsrname',validateSchema(sqlQuerySchemaValidation),[handler.getsrname]);
router.post('/saveDrJob',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.saveDrJob]);
router.get('/getDrJobStatus',validateSchema(sqlQuerySchemaValidation),[handler.getDrJobStatus]);
router.put('/editIndexDREnable',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.editIndexDREnable])
router.put('/updatestatusbysro',validateSchema(sqlQuerySchemaValidation),[handler.UpdatestatusBySro])
router.get('/getDocumentsbysro',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getDocumentsBySro]);
router.put('/updatestatusbydr',validateSchema(sqlQuerySchemaValidation),[handler.UpdatestatusByDr])
router.put('/UpdatestatusregdocBySro',validateSchema(sqlQuerySchemaValidation),[handler.UpdatestatusregdocBySro])
router.get('/getRegDocDetails',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getRegDocDetails]);
router.get('/getSroJobStatus',validateSchema(sqlQuerySchemaValidation),[handler.getSroJobStatus]);
router.post('/insertProceedingDetails',validateSchema(sqlQuerySchemaValidation),[handler.insertProceedingDetails])
router.get('/getSroCode',validateSchema(sqlQuerySchemaValidation),[handler.getSroCode])
router.post('/InsertProceedingDetailsreject',validateSchema(sqlQuerySchemaValidation),[handler.InsertProceedingDetailsreject])
router.get('/getSroJobRequestStatus',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getSroJobRequestStatus]);
router.post('/InsertRescanData',validateSchema(sqlQuerySchemaValidation),[handler.InsertRescanData]);
router.put('/updatestatusbyrescan',[handler.UpdatestatusByRescan]);
router.get('/verifyDetailsStatus',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.verifyDetailsStatus]);
router.get('/getSrCode',[handler.getSrCode]);
// router.get('/verifyRequestDetails',validateSchema(sqlQuerySchemaValidation),[handler.verifyRequestDetails]);

router.get('/getDrJobStatusdata',validateSchema(sqlQuerySchemaValidation),[handler.getDrJobStatusdata]);

//----Edit Index New Functionality-Esign Integration API'S------------------------//
router.get('/getDrJobStatusbySroNameForEditIdex',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getDrJobStatusbySroNameForEditIdex]);
router.get('/getSroJobStatusEditIndex',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getSroJobStatusEditIndex]);

router.get('/pendingEsignList',verifyjwt,[handler.pendingEsignListHndlr]);
router.get('/rescanpdfpreview',verifyjwt,[handler.rescanpdfpreviewHndlr]);
router.get('/rescanDrJob',verifyjwt,[handler.rescanDrJobHndlr]);
router.post('/saverescanDrJob',verifyjwt,[handler.saveRescanDrJob]);

router.get('/getResubmitSignedDocument', verifyjwt,[handler.getResubmitSignedDocument])
router.post('/sroSignDocument',verifyjwt,[handler.sroSignDocument]); 
router.post('/drSignDocument',verifyjwt,[handler.drSignDocument]); 
router.get('/resubmitPdfPreview', verifyjwt, [handler.resubmitPdfPreview]);
router.get('/getAnywhereeSignStatus',  verifyjwt, [handler.getAnywhereeSignStatus])

module.exports = router;

