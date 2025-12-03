const express = require('express')
const CCHandler = require('../handlers/ccHandler');
const {verifyjwt} = require('../plugins/auth/authService');

const handler = new CCHandler();
const router = express.Router();

router.get('/sroDetails',[handler.getSroDetails]);
router.get('/challan',[handler.getChallan]);
router.get('/get',verifyjwt,[handler.getData])
router.get('/getCurrentTime', [handler.getCurrentTime]);

module.exports = router;