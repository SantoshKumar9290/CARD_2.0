const express = require('express');
const AutoMutationHandler = require('../handlers/autoMutationHandler')
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');
const cron = require('node-cron');
const router = express.Router();
const handler = new AutoMutationHandler();


router.get('/getDocuments',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getDocuments]);
router.get('/getProperty',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getProperty]);
router.get('/getToken', [handler.generateAutomutationToken]);
router.get('/getSurveyDetails', [handler.getSurveyDetails]);
router.post('/saveSub',[handler.saveSubDiv]);
router.post('/subdivision', [handler.sendRequestForSubdivision]);
router.post('/preview', verifyjwt,validateSchema(sqlQuerySchemaValidation), [handler.previewSubDivision]);
router.post('/previewMutation', verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.previewMutation]);
router.post('/statusUpdate', [handler.collectStatus]);
router.get('/surveyByKhata', verifyjwt, [handler.getSurveyDetailsByKhataNo]); 
router.get('/LPMByKhata', verifyjwt, [handler.getLPMDetailsByKhata]);
router.post('/checkIfDocIsRural', verifyjwt, [handler.checkIfDocIsRural]);
router.post('/PrerequisiteDataForCertificate', verifyjwt, [handler.getPrerequisiteDataForCertificate]);
router.get('/getName',[handler.getRevenueName]);
router.get("/urbanToken", [handler.UrbanTokenGeneration]);
router.post("/urbanMutation",verifyjwt, [handler.urbanMutationRequest]);
router.post("/previewUrbanMutation",verifyjwt, [handler.previewUrbanMutation]);
router.post("/isMutationNeeded", [handler.isMutationNeeded]);
router.post("/MutationStatusMail", [handler.MutationStatusMailHndlr]);
router.get('/sendwhatsappnotification/:sroCode/:bookNo/:regYear/:docNo',[handler.sendWhatsAppNotificationForCC])
router.get("/Mutationcount",verifyjwt, [handler.MutationcountHndlr]);
router.get("/getRuralDocuments", verifyjwt,[handler.getRuralDocuments]);

router.post('/singleRuralSubdivionProcess', [handler.executeDataByRequest]);
router.get('/subdivisionAndMuationSubmit', [handler.subdivisionAndMuationSubmit]);
router.post("/urbanMutationError", [handler.runUrbanMutationForAll]);


//cron job schedular will execute by 12.30am.
/*
cron.schedule('0 30 0 * * *', async () => {
    console.log("Inside of cron job execution ::: ", new Date());
    let result = await handler.executeSubdivisionAndRuralMutationProcess();
    console.log("End of cron job execution with status result 1 ::: ", result);
    //result = await handler.executeSubdivisionAndRuralMutationProcess();
    //console.log("End of cron job execution with status result 2 ::: ", result);
 });
*/

module.exports = router;

