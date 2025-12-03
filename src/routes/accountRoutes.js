const express = require('express')
const AccountHandler = require('../handlers/accountHandler');
const {verifyjwt} = require('../plugins/auth/authService');

const handler = new AccountHandler();
const router = express.Router();

router.get('/accountDetails', verifyjwt,[handler.getAccountDetails]);
router.get('/reportG', verifyjwt,[handler.accountG])
router.get('/reportA', verifyjwt,[handler.accountA]);
router.get('/reportD', verifyjwt,[handler.accountD]);
router.get('/minuteReport', verifyjwt,[handler.minuteReport]);
router.get('/reportB', verifyjwt,[handler.accountB]);
router.get('/reportH', verifyjwt,[handler.accountH]);
router.post('/addAccountCdataCol', verifyjwt,[handler.addCollectionAccountCData]);
router.post('/addAccountCdataDis', verifyjwt,[handler.addDisbursementsAccountCData]);
router.get('/reportC', verifyjwt,[handler.accountC]);
router.post('/getReport1PdfGenerateA', verifyjwt, [handler.getReport1PdfGenerateA]);
router.get('/getReport1PdfGenerateB',  verifyjwt,[handler.getReport1PdfGenerateB]);
router.get('/getReport1PdfGenerateC', verifyjwt, [handler.getReport1PdfGenerateC]);
router.get('/getReport1PdfGenerateD', verifyjwt, [handler.getReport1PdfGenerateD]);
router.get('/getReport1PdfGenerateMin', verifyjwt,[handler.getReport1PdfGenerateMin]);
router.post('/getReport1PdfGenerateG', verifyjwt,[handler.getReport1PdfGenerateG]);
router.post('/getReport1PdfGenerateH', verifyjwt,[handler.getReport1PdfGenerateH]);


module.exports = router;