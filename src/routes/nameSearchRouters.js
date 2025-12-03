const express = require('express')
const nameSearchHandler = require('../handlers/nameSearchHandler');
const {verifyjwt} = require('../plugins/auth/authService');


const handler = new nameSearchHandler();
const router = express.Router();


router.get('/districtDetails', verifyjwt, [handler.getdistricts]);
router.get('/sroDetails', verifyjwt, [handler.getsroDetails]);
router.post('/getNameSearchCountByData', verifyjwt, [handler.getNameSearchCountByData]);
router.post('/getNameSearchSROCountByData', verifyjwt, [handler.getNameSearchSROCountByData]); 
router.post('/getNameSearchPartiesDataListByData', verifyjwt, [handler.getNameSearchPartiesDataListByData]);
router.post('/getNameSearchStatementBySelectedData', verifyjwt, [handler.getNameSearchStatementBySelectedData]);
module.exports = router;