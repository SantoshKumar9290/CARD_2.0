const ScanningServices = require('../services/scanningServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');


class ScanningHandler {
	constructor(){
		this.scanningServices = new ScanningServices();
    };

	saveScannedImg = async (req,res)=>{
        const reqQuery = req.body
		try{
			let response = await this.scanningServices.saveScannedImgSrvc(reqQuery);
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
			console.error("ScanningHandler - saveScannedImg || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	getScannedImg = async (req,res)=>{
        const reqQuery = req.query;
		if (reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.DOCT_NO == null || reqQuery?.REG_YEAR == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
			let response = await this.scanningServices.getScannedImgSrvc(reqQuery);
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
			console.error("ScanningHandler - getScannedImg || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	updateStatus = async (req,res)=>{
        const reqQuery = req.body
		try{
			let response = await this.scanningServices.updateStatusSrvc(reqQuery);
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
			console.error("ScanningHandler - updateStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	scannedScheduler = async () => {
		try {
			let response = await this.scanningServices.scannedSchedulerSrvc()
			return response;
		} catch (error) {
			console.log("ScanningHandler - scannedScheduler || Error :", error);
            throw error;	
		}
	}
	
	 
}
module.exports = ScanningHandler;