const express = require('express');
const urabnHandler = require('../handlers/urbanHandler');
const handler = new urabnHandler();
const router = express.Router();
const {verifyjwt,roleAuthorization} = require('../plugins/auth/authService');


//router.post('/generateassessment', [handler.generateNewAssessment]);
// router.get('/searchassessmentbydoornumber',[handler.searchAssessmentNumberByDoorNumber])


module.exports = router;