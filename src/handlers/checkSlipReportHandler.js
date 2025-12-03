const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const odbService = require('../services/checkSlipReportServices');
const obdDao = require('../dao/oracledbDao')
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');


class CheckSlipReportHandler {
	constructor() {
		this.obService = new odbService();
		this.oDao = new obdDao();
	};


    getCheckSlipReports = async(req,res) => {
        const reqQuery = req.query;
    if (reqQuery.srCode == null || reqQuery.bookNo == null || reqQuery.docNo == null || reqQuery.regYear == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.obService.getCheckSlipReportsSrvc(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
        // responseData.hash = hash;
        res.status(200).send({...responseData});
    }catch(ex){
        console.error("checkSlipReportHandler - getReports || Error :", ex);
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
module.exports = CheckSlipReportHandler;