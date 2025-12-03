const express = require('express')
const formHandler = require('../handlers/formsHandler');
const {verifyjwt} = require('../plugins/auth/authService');

const handler = new formHandler();
const router = express.Router();

router.get('/districtDetails',verifyjwt,[handler.getdistricts]);
router.get('/sroDetails',verifyjwt,[handler.getsroDetails]);
router.get('/getForm1Details',verifyjwt,[handler.getForm1Details]);
router.get('/getForm2Details',verifyjwt,[handler.getForm2Details]);
router.get('/getForm3Details',verifyjwt,[handler.getForm3Details]);
router.get('/getForm4Details',verifyjwt,[handler.getForm4Details]);
router.get('/getRuralProhibDetails',verifyjwt,[handler.getRuralProhibDetails]);
router.get('/getUrbanProhibDetails',verifyjwt,[handler.getUrbanProhibDetails]);
router.get('/getRuralProhibDenotifyDetails',verifyjwt,[handler.getRuralProhibDenotifyDetails]);
router.get('/getUrbanProhibDenotifyDetails',verifyjwt,[handler.getUrbanProhibDenotifyDetails]);
router.get('/getVillageList', verifyjwt,[handler.getVillagelist]);
router.get('/getURBANProhbPdfGenerate', verifyjwt,[handler.getURBANProhbPdfGenerate]);
router.get('/getRURALProhbPdfGenerate', verifyjwt,[handler.getRURALProhbPdfGenerate]);
router.get('/getURBANProhbDenotifyPdfGenerate', verifyjwt,[handler.getURBANProhbDenotifyPdfGenerate]);
router.get('/getRURALProhbDenotifyPdfGenerate', verifyjwt,[handler.getRURALProhbDenotifyPdfGenerate]);
router.get('/getMVURBANFORM1PdfGenerate', verifyjwt,[handler.getMVURBANFORM1PdfGenerate]);
router.get('/getMVURBANFORM2PdfGenerate', verifyjwt,[handler.getMVURBANFORM2PdfGenerate]);
router.get('/getMVRURALFORM3PdfGenerate', verifyjwt,[handler.getMVRURALFORM3PdfGenerate]);
router.get('/getMVRURALFORM4PdfGenerate', verifyjwt,[handler.getMVRURALFORM4PdfGenerate]);








module.exports = router;