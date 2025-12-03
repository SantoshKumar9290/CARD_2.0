const express = require('express');
const DscHandler = require('../handlers/dscHandler');
const { verifyjwt } = require('../plugins/auth/authService');


const router = express.Router();
const handler = new DscHandler();


router.get('/token', [handler.getDscToken]);
router.post('/signPdf', [handler.signPdf]);
router.post('/uploadFile', [handler.uploadFile]);

module.exports = router;

