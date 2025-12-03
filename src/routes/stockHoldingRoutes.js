const express = require('express')
const stockHandler = require('../handlers/stockHoldingHandler');
const CashHandler = require('../handlers/cashRecieptHandler')
const {verifyjwt, validateThirdPartyAccess} = require('../plugins/auth/authService');



const handler = new stockHandler();
const cashHandler = new CashHandler();
const router = express.Router();


router.get('/eReceiptVerify',verifyjwt, [handler.eRegRecieptVerify]);
router.put('/lockrecipt',verifyjwt, [handler.eRegReceiptLock])

//QR Code

router.post('/qrCode/generate',[handler.qrCodeGenerate]);
router.put('/qrCode/updateSlotstatus',verifyjwt, [handler.slotStatusUpdatte]);

//Stock holding payment verifications API for slot booking.
router.get('/verifyStockHoldingReceipt',validateThirdPartyAccess, [handler.eRegRecieptVerify]);
router.get('/getStockHoldingReceipt/:type',validateThirdPartyAccess,[cashHandler.getAmountPaidHandler]);

//Franklin API's
router.post('/getVendors',[handler.getVendorDetails]);
router.post('/saveFund',[handler.createFundFile]);

module.exports = router;
