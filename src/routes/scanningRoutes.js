const express = require('express')
const scanningHandler = require('../handlers/scanningHandler');
const { verifyjwt } = require('../plugins/auth/authService');
const cron = require('node-cron');

const handler = new scanningHandler();
const router = express.Router();

router.post('/saveScannedImg', verifyjwt,[handler.saveScannedImg]);
router.get('/getImg',[handler.getScannedImg]);
router.put('/updateStatus',verifyjwt,[handler.updateStatus])

//Scheduler to delete scanned docuemnts which are older than 10 days after completing the digital sign
cron.schedule('0 0 0 * * *', async () => {
    console.log("Inside of cron job execution :::scannedScheduler");
    console.log("Before starting the process::::::::CARD", new Date());
    let result = await handler.scannedScheduler();
    console.log("After completing the process::::::::CARD", new Date());
    console.log("End of cron job execution with status :::scannedScheduler", result);
});

module.exports = router;