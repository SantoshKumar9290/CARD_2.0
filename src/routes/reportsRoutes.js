const express = require('express');
const ReportsHandler = require('../handlers/reportHandler');
const {verifyjwt} = require('../plugins/auth/authService');

const router = express.Router();
let handler = new ReportsHandler();

router.post('/endorsement',verifyjwt,[handler.createEndorsement]);
router.post('/bundling',verifyjwt, [handler.createBundlingDocument])


module.exports = router;