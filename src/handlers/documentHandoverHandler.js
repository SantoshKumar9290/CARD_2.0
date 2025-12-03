const DocumentHandoverServices = require('../services/documentHandoverService');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');


class DocumentHandoverHandler {
	constructor(){
		this.documentHandoverServices = new DocumentHandoverServices();
    };
	 
	
	getNominee = async(req,res) => {
        const qParams = req.query;
        if (qParams.srCode == null || qParams.bookNo == null || qParams.docNo == null || qParams.regYear == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
		try{
			let response = await this.documentHandoverServices.getNominee(qParams);
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
			console.error("documentHandoverServices - getNominee || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 


    saveDocHandover = async (req, res)=>{
		const reqQuery = req.body;
		if(reqQuery?.sr_code == null || reqQuery?.book_no == null || reqQuery?.doct_no == null || reqQuery?.reg_year == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
			await this.documentHandoverServices.saveDocHandover(reqQuery);
            let responseData = {
				status:true, 
				message: "Status Updated Successfully",
				code: "200",
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
        }catch(ex){
            console.error("documentHandoverServices - saveDocHandover || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
	}
	getValidateNomineeQr = async (req, res) => {
        const reqQuery = req.query;
        const requiredFields = ['SR_CODE', 'REG_YEAR', 'DOCT_NO', 'BOOK_NO', 'AADHAR'];
        for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
         }}
        try {
            let response = await this.documentHandoverServices.getValidateNomineeQr(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("documentHandoverServices - ValidateQrData || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    partyExemptionCheck = async (req, res) => {
        const reqQuery = req.query;
        const requiredFields = ['SR_CODE', 'ID'];
        for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
         }}
        try {
            let response = await this.documentHandoverServices.partyExemptionCheck(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("documentHandoverServices - partyExemptionCheck || Error :", ex);
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
module.exports = DocumentHandoverHandler;





