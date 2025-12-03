const express = require('express')
const CashHandler = require('../handlers/cashRecieptHandler')
const {validateSchema} = require('../plugins/ajv');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema')
const {verifyjwt} = require('../plugins/auth/authService');

const handler = new CashHandler();
const router = express.Router();
router.get('/getCashDatabySro',verifyjwt,[handler.getAllcashDataBySro])
router.get('/CashPayable',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getCashPayable]);
router.get('/getpendingPde',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getPendingPde]);
router.get('/:type/getAmountPaid',verifyjwt,[handler.getAmountPaidHandler]);
router.put('/stock/lockReceipt',verifyjwt,[handler.lockCerHandler]);
router.post('/save',verifyjwt,[handler.getSaveHandler]);
router.get('/getChallanHandler',verifyjwt,[handler.getChallanHandler]);
router.get('/getChallanStatus',verifyjwt,[handler.getChallanStatus]);
router.put('/updateApplicationStatus',verifyjwt,[handler.updateApplicationStatus]);
router.get('/getCashPaid',verifyjwt, [handler.getCashPaid]);
router.get('/getCashReceipt',verifyjwt,[handler.getCashReceipt]);
router.get('/getCash',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getCash]);
router.get('/VSWSReqAssign',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getVSWSReqAssign]);
router.get('/getDocStatus',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getDocStatus]);
router.get('/getChallanDetails',verifyjwt,[handler.getChallanDetails]);
router.get('/getDeficitDetails',verifyjwt, [handler.getDeficitDetails]);
router.post('/addDeficitDetails', verifyjwt, [handler.addDeficitDetails]);
router.delete('/deleteDeficitDetails', verifyjwt, [handler.deleteDeficitDetails]);
router.get('/getDocsDetails', verifyjwt, [handler.getDocsDetails]);
router.get('/getPdfreceipt', verifyjwt, [handler.getPdfreceipt]);
router.post('/saveAuditCash', verifyjwt, [handler.postAuditCashDetails]);
router.get('/getMajorDetails', verifyjwt, [handler.getMajorDetails]);
router.put('/updateDeficitDetails', verifyjwt, [handler.updateDeficitDetails]);
router.get('/getStampIndent', verifyjwt, [handler.getStampindentDetails]);
router.put('/updateStampReceipt', verifyjwt, [handler.updateStampIndent]);
router.get('/getStampdetailswithApp', verifyjwt, [handler.getStampDetailswithApp]);
router.post('/insertStampIndent', verifyjwt, [handler.insertStampData]);
router.get('/getVendor', verifyjwt, [handler.getVendorDetails]);
router.post('/getCashPaidDetails',verifyjwt, [handler.getCashPaidDetails]);
router.post('/insertSec16',verifyjwt, [handler.insertSec16Data]);
router.get('/VerifySec16',verifyjwt, [handler.VerifySec16]);
router.get('/getCashReceiptNumberWithAppId',verifyjwt,[handler.getCashReceiptNumberWithAppId]);

//frankin Routes
router.get('/getChallanFrank',[handler.getChallanFrank]);
router.get('/getChallansByDoct',verifyjwt, [handler.getChallansByDoct]);
module.exports = router;