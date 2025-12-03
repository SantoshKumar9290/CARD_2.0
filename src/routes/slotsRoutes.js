const express = require('express');
const SlotsHandler = require('../handlers/slotsHandler')
const {verifyjwt} = require('../plugins/auth/authService');

const router = express.Router();
const handler = new SlotsHandler();


router.get('/getslotsdashboarddata',verifyjwt,[handler.getCheckSlotsDataHandler])
router.post('/increaseSlotSize',verifyjwt,[handler.increaseSlotSize]);
router.post('/srSlotDetails',verifyjwt,[handler.srSlotDetails]);




module.exports = router;