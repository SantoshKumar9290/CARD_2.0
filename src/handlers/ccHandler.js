const CCService = require('../services/ccServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');



class CCHandler {
    constructor() {
        this.ccHandlerService = new CCService();
    }
    getSroDetails = async (req,res) => {   
        const reqQuery = req.query;
		try{
            let response = await this.ccHandlerService.getSroDetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("CCHandler - getSroDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }
    getChallan = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery?.CHALLAN_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.ccHandlerService.getChallanSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("CCHandler - getChallan || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}

    }
    getData = async (req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.ccHandlerService.getDataSrvc(reqQuery);
            if(response.length === 0){
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            }else{
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
            res.status(200).send({...responseData});
        }
		}catch(ex){
			console.error("CCHandler - getData || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[NAMES.INTERNAL_SERVER_ERROR]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	
    }

    getCurrentTime = async (req,res) => {
		try{
            let response = await this.ccHandlerService.getCurrentTimeSrvc();
            if(response.length === 0){
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            }else{
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
            res.status(200).send({...responseData});
        }
		}catch(ex){
			console.error("CCHandler - getCurrentTime || Error :", ex);
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
module.exports = CCHandler;





