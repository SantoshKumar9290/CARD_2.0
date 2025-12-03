const express = require('express')
const EsignPendingHandler = require('../handlers/esignPendingHandler');
const {verifyjwt} = require('../plugins/auth/authService');


const handler = new EsignPendingHandler();
const router = express.Router();

router.get('/',verifyjwt,[handler.getPendingEsign]);


module.exports = router;