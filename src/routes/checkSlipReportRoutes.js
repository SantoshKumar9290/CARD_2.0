const express = require('express')
const CheckSlipReportHandler = require('../handlers/checkSlipReportHandler');
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema')
const { validateSchema } = require('../plugins/ajv');

const handler = new CheckSlipReportHandler();
const router = express.Router();

router.get('/getCheckSlipReports',verifyjwt,validateSchema(sqlQuerySchemaValidation),[handler.getCheckSlipReports]);


module.exports = router;