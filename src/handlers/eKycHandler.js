const EkycServices = require('../services/eKycService');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');


class EkycHandlder {
	constructor(){
		this.eKycServices = new EkycServices();
    };
	getAadharNo = async(req,res) => {
		const qParams = req.query;
		try{
			let response = await this.eKycServices.getAadhar(qParams);
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
			console.error("EkycHandlder - getAadharNo || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 
	getAadharNoRefusal = async(req,res) => {
		const qParams = req.query;
		try{
			let response = await this.eKycServices.getAadharNoRefusal(qParams);
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
			console.error("EkycHandlder - getAadharNo || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	
	getParties = async(req,res) => {
		const qParams = req.query;
		if(qParams.sr_code == null || qParams.book_no == null || qParams.doct_no == null || qParams.reg_year == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.getParties(qParams);
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
			console.error("EkycHandlder - getParties || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	getPartiesRefusal = async(req,res) => {
		const qParams = req.query;
		if(qParams.sr_code == null || qParams.book_no == null || qParams.doct_no == null || qParams.reg_year == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.getPartiesRefusal(qParams);
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
			console.error("EkycHandlder - getPartiesRefusal || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 


	saveEkycDetails = async(req,res) => {
		const qParams = req.query;
		if(qParams.sr_code == null || qParams.book_no == null || qParams.doct_no == null || qParams.reg_year == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.saveEkycDetails(qParams);
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
			console.error("EkycHandlder - saveEkycDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	saveECPhotosDetails = async(req,res) => {
		const qParams = req.query;
		if(qParams.sr_code == null || qParams.book_no == null || qParams.doct_no == null || qParams.reg_year == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.getECPhotosDetails(qParams);
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
			console.error("EkycHandlder - saveECPhotosDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	saveECPhotosDetailsRefusal = async(req,res) => {
		const qParams = req.query;
		if(qParams.sr_code == null || qParams.book_no == null || qParams.doct_no == null || qParams.reg_year == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.getECPhotosDetailsRefusal(qParams);
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
			console.error("EkycHandlder - saveECPhotosDetailsRefusal || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	savePartyhandler = async (req,res)=>{
		const reqBody = req.body;
		if(reqBody.AADHAR == null || reqBody.A_NAME == null || reqBody.CARE_OF == null || reqBody.GENDER == null || reqBody.PIN_CODE == null || reqBody.AGE == null || reqBody.ADDRESS == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.saveParty(reqBody);
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
			console.error("EkycHandlder - savePartyhandler || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	savePartyhandlerRefusal = async (req,res)=>{
		const reqBody = req.body;
		if(reqBody.AADHAR == null || reqBody.A_NAME == null || reqBody.CARE_OF == null || reqBody.GENDER == null || reqBody.PIN_CODE == null || reqBody.AGE == null || reqBody.ADDRESS == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.savePartyRefusal(reqBody);
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
			console.error("EkycHandlder - savePartyhandlerRefusal || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	savePhoto = async (req,res)=>{
		const reqBody = req.body;
		if(reqBody.SR_CODE == null || reqBody.BOOK_NO == null || reqBody.DOCT_NO == null || reqBody.REG_YEAR == null || reqBody.EC_NUMBER == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.savePhotoSvc(reqBody);
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
			console.error("EkycHandlder - savePhoto || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	savePhotoRefusal = async (req,res)=>{
		const reqBody = req.body;
		if(reqBody.SR_CODE == null || reqBody.BOOK_NO == null || reqBody.DOCT_NO == null || reqBody.REG_YEAR == null || reqBody.EC_NUMBER == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.savePhotoSvcRefusal(reqBody);
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
			console.error("EkycHandlder - savePhotoRefusal || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	getWitnessDetails = async (req,res)=>{
		const reqBody = req.query;
		if(reqBody.SR_CODE == null || reqBody.BOOK_NO == null || reqBody.DOCT_NO == null || reqBody.REG_YEAR == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.getWitnessDetails(reqBody);
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
			console.error("EkycHandlder - getwitnessDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}


	getWitnessDetailsRefusal = async (req,res)=>{
		const reqBody = req.query;
		if(reqBody.SR_CODE == null || reqBody.BOOK_NO == null || reqBody.DOCT_NO == null || reqBody.REG_YEAR == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.getWitnessDetailsRefusal(reqBody);
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
			console.error("EkycHandlder - getWitnessDetailsRefusal || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	saveWPhoto = async (req,res)=>{
		const reqBody = req.body;
		if(reqBody.SR_CODE == null || reqBody.BOOK_NO == null || reqBody.DOCT_NO == null || reqBody.REG_YEAR == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.saveWPhotoSvc(reqBody);
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
			console.error("EkycHandlder - savePhoto || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	saveWPhotoRefusal = async (req,res)=>{
		const reqBody = req.body;
		if(reqBody.SR_CODE == null || reqBody.BOOK_NO == null || reqBody.DOCT_NO == null || reqBody.REG_YEAR == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.saveWPhotoSvcRefusal(reqBody);
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
			console.error("EkycHandlder - savePhotoRefusal || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	saveParties = async (req,res)=>{
		const reqBody = req.body;
		try{
			let response = await this.eKycServices.saveParties(reqBody);
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
			console.error("EkycHandlder - saveparties || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	savePartiesRefusal = async (req,res)=>{
		const reqBody = req.body;
		try{
			let response = await this.eKycServices.savePartiesRefusal(reqBody);
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
			console.error("EkycHandlder - savePartiesRefusal || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	getverifyTidcoZeroTwo = async(req,res) => {
        const qParams = req.body;
		console.log( req.body," req.body");
		console.log(req.query,req.param,"qParams");
		
		
        if(qParams.SR_CODE == null || qParams.BOOK_NO == null || qParams.DOCT_NO == null || qParams.REG_YEAR == null ){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.eKycServices.getverifyTidcoZeroTwo(qParams);
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
            console.error("EkycHandlder - getverifyTidcoZeroTwo || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
	getTidcoAadharWitness = async(req,res) => {
        // const reqData = req.body;
		const qParams = req.body;
		console.log(req.body,req.params,req.query,"body");
		
        if(qParams.aadhar == null){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
		}
        try{
            let response = await this.eKycServices.getTidcoAadharWitness(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({...responseData});    
 
        }catch(ex){
            console.error("EkycHandlder - getTidcoAadharWitness || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
	GetValidateQrData = async (req, res) => {
        const reqQuery = req.body;
        const requiredFields = ['SR_CODE', 'REG_YEAR', 'DOCT_NO', 'BOOK_NO','CODE', 'EC_NUMBER', 'AADHAR', 'EMPL_NAME'];
        for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
         }}
        try {
            let response = await this.eKycServices.GetValidateQrData(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("EkycHandlder - ValidateQrData || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

	saveEkycExemptionDetailsHandler = async (req,res)=>{
		const reqBody = req.body;
        const requiredParams={
			applicationId:'string',
			executants:"boolean",
			claimants:"boolean",
			witness:"boolean"
		}

		for(let key in requiredParams){
            if(typeof reqBody[key] !== requiredParams[key] || !reqBody.hasOwnProperty(key)){
                return res.status(400).send({
                    status: false,
                    message: `Validation error: '${key}' is required and should be of type '${requiredParams[key]}'`
                });
            }
        }
		try{
			let response = await this.eKycServices.saveEkycExemptionDetailsService(reqBody);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("EkycHandlder - saveEkycExemptionDetailsHandler || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	getExemptionDetailsHandler = async (req,res)=>{
		const reqBody = req.params;
		if(!reqBody.applicationId){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.eKycServices.getExemptionDetailsService(reqBody);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("EkycHandlder - getExemptionDetailsHandler || Error :", ex);
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
module.exports = EkycHandlder;





