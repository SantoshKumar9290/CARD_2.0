const express = require('express');
const thumbImpressionHandler = require('../handlers/thumbImpressionHandler');

const handler = new thumbImpressionHandler(); 
const router = express.Router();
const { verifyjwt } = require('../plugins/auth/authService');



router.post('/insertTable',verifyjwt ,[handler.insertTableHandler]);
router.get('/generateDocument',verifyjwt, [handler.generateDocumentHandler]);
router.get('/getCoordinatesData',verifyjwt, [handler.getCoordinatesDataHandler]);
router.get('/updatePdf',verifyjwt, [handler.updatePdfHandler]);
router.get('/pendingesignlist',verifyjwt, [handler.pendingEsignList]);
router.get('/pdfpreview',verifyjwt, [handler.pdfPreview]);

module.exports = router;