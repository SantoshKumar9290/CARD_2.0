const express = require('express')
const mvRevisionHandler = require('../handlers/MvRevisionHandler');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');
const {verifyjwt} = require('../plugins/auth/authService');

const handler = new mvRevisionHandler();
const router = express.Router();

//From SRO to DR
//SRO Apis

router.post('/sendEnableRequest',verifyjwt, validateSchema(sqlQuerySchemaValidation), [handler.sendEnableRequest]); 
router.get('/testAPI',[handler.testAPI]); 



//From1 APIs
router.get('/getHabitations', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getHabitations]);
router.get('/getForm1Data', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getForm1Data]); 
router.get('/getForm1WardData', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getForm1WardData]); 
router.put('/updateForm1Data',verifyjwt,[handler.updateForm1Data]); 
router.post('/deleteForm1Data',verifyjwt,[handler.deleteForm1Data]); 
router.post('/addForm1Data',verifyjwt,[handler.addForm1Data]); 

//Form4 Apis
router.get('/getAreaClass',verifyjwt,[handler.getAreaClass]); 
router.get('/getLocalBodyDirData',verifyjwt,[handler.getLocalBodyDirData]); 
router.get('/getForm4Data', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getForm4Data]); 
router.put('/updateForm4Data',verifyjwt,[handler.updateForm4Data]); 
router.post('/deleteForm4Data',verifyjwt,[handler.deleteForm4Data]); 
router.post('/addForm4Data',verifyjwt,[handler.addForm4Data]); 

//From3 APIs
router.get('/getForm3Data', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getForm3Data]); 
router.put('/updateForm3Data',verifyjwt,[handler.updateForm3Data]); 
router.post('/deleteForm3Data',verifyjwt,[handler.deleteForm3Data]); 
router.post('/addForm3Data',verifyjwt,[handler.addForm3Data]); 


//Form2 APIs
router.get('/getForm2Data', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getForm2Data]); 
router.get('/getForm2WardData', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getForm2WardData]); 
router.put('/updateForm2Data',verifyjwt,[handler.updateForm2Data]); 
router.post('/deleteForm2Data',verifyjwt,[handler.deleteForm2Data]); 
router.post('/addForm2Data',verifyjwt,[handler.addForm2Data]); 


//DR Apis
router.post('/updateMvRevisionReq',verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.updateMvRevisionReq]); 
router.get('/getMvRequestList',verifyjwt, [handler.getMvRequestList]);
router.get('/getMvRequestsStatus', verifyjwt,[handler.getMvRequestsStatus]);
router.get('/getMakeEffectiveRequestBySroStatus',verifyjwt, [handler.getMakeEffectiveRequestBySroStatus]);

//Jurisdiction APIs
router.get('/getServeyNo', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getServeyNo]);
router.get('/getSurveyNoAccordtoJuriAdded', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.getSurveyNoAccordtoJuriAdded]);
router.post('/insertServeyNo', verifyjwt,[handler.insertServeyNo]);
router.post('/deleteServeyNo', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.deleteServeyNo]);

//@VEJAN rowid add in schema validation




router.get('/getMakeEffectiveRequestBySro',verifyjwt, [handler.getMakeEffectiveRequestBySro]);
router.put('/makeEffectiveFinalDRApprove',verifyjwt,[handler.makeEffectiveFinalDRApprove]); 
router.post('/makeEffectiveRequest', verifyjwt,[handler.makeEffectiveRequest]);

router.get('/getPdfGenerateForm1', verifyjwt,[handler.getForm1PdfGenerate]);
router.get('/getPdfGenerateForm2',verifyjwt, [handler.getForm2PdfGenerate]);
router.get('/getPdfGenerateForm3', verifyjwt,[handler.getForm3PdfGenerate]);
router.get('/getPdfGenerateForm4', verifyjwt,[handler.getForm4PdfGenerate]);

router.get('/getPdfGenerateDataForm1', verifyjwt,[handler.getForm1PdfGenerateData]);
router.get('/getPdfGenerateDataForm2', verifyjwt,[handler.getForm2PdfGenerateData]);
router.get('/getPdfGenerateDataForm3', verifyjwt,[handler.getForm3PdfGenerateData]);
router.get('/getPdfGenerateDataForm4', verifyjwt,[handler.getForm4PdfGenerateData]);

router.get('/getSurveyNo', verifyjwt,[handler.getSurveyNoList]);
router.get('/getLpmCheck', verifyjwt,[handler.getLpmCheck])
router.get('/getUrbanJuri', verifyjwt,[handler.getUrbanJurisdiction]);
router.post('/insertUrbanJuri', verifyjwt,[handler.insertUrbanJurisdiction]);

module.exports = router;