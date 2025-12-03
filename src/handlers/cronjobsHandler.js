const CronJobService = require('../services/cronjobsServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const CARDError = require("../errors/customErrorClass");
const { constructCARDError } = require("./errorHandler");
const axios = require('axios');
const OrDao = require('../dao/oracledbDao');
const https = require('https');

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

class CronjobsTimeStampHandler {
    constructor() {
        this.orDao = new OrDao();
        this.cronJobHandlerService = new CronJobService();

    };

    fileTimestampfinderHndlr = async (req, res) => {
        const qParams = req.query;
        try {
            let response = await this.cronJobHandlerService.fileTimestampfinderSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - rescanDrJobHndlr || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }




}
module.exports = CronjobsTimeStampHandler;
