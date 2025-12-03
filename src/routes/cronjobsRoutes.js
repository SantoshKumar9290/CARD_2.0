const express = require('express');
const CronjobsTimeStampHandler = require('../handlers/cronjobsHandler')
const {verifyjwt} = require('../plugins/auth/authService');
const sqlQuerySchemaValidation = require('../schemas/apiValidationSchemas/sqlQueryValidationSchema');
const { validateSchema } = require('../plugins/ajv');
const cron = require('node-cron');
const router = express.Router();
const handler = new CronjobsTimeStampHandler();


router.post('/fileTimestampfinder',[handler.fileTimestampfinderHndlr]);

// cron.schedule('0 0 22 * * *', async () => {
//     console.log("Inside of endorment time stamp cron job execution ::: ", new Date());
//     let result = await handler.fileTimestampfinderHndlr();
//     console.log("End of endorment time stamp cron job execution with status result 1 ::: ", result);
//  });

module.exports = router;
