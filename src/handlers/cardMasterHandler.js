const CardMasterService = require('../services/cardMasterServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');



class CardMasterHandler {
    constructor() {
        this.cardMasterHandlerService = new CardMasterService();
    };

    landingPages = async (req,res) => {   
        const reqParams = req.params;
        const reqQuery = req.query;
		try{
            let response = await this.cardMasterHandlerService.landingPagesSrvc(reqQuery,reqParams);
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
			console.error("CardMasterHandler - landingPages || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	
    }
    selectDig = async (req,res) => {  
		try{
            let response = await this.cardMasterHandlerService.selectDigSrvc();
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
			console.error("CardMasterHandler - selectDig || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	
    }
    selectDR = async (req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.DIG_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.cardMasterHandlerService.selectDRSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("CardMasterHandler - selectDR || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	
    }
    saveMasters = async (req,res)=>{
        const reqParams = req.params;
        const reqBody = req.body;
        try{
            let response = await this.cardMasterHandlerService.saveMasterSrvc(reqBody,reqParams);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
        }catch(ex){
            console.error("CardMasterHandler - saveMasters || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    deleteDR = async(req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.DR_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
		try{
			let response = await this.cardMasterHandlerService.deleteDR(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("CardMasterHandler - deleteDR || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    deleteLocalbody = async(req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.LOCAL_BODY_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
		try{
			let response = await this.cardMasterHandlerService.deleteLocalBodySrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("CardMasterHandler - deleteLocalbody || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    deleteJobs = async(req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.JOB_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
		try{
			let response = await this.cardMasterHandlerService.deleteJobsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("CardMasterHandler - deleteLocalbody || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    deleteLandUse = async(req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.CLASS_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
		try{
			let response = await this.cardMasterHandlerService.landuseSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("CardMasterHandler - deleteLandUse || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    deleteProhibition = async(req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.CLASS_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
		try{
			let response = await this.cardMasterHandlerService.deleteProhibition(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("CardMasterHandler - deleteProhibition || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    getSRM = async (req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.DIG_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.cardMasterHandlerService.srMSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("CardMasterHandler - getSRM || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	
    }
    deleteSRMasters = async(req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.SR_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
		try{
			let response = await this.cardMasterHandlerService.deleteSRMSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("CardMasterHandler - deleteSRMasters || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    deleteMinor = async(req,res) => {
        const reqQuery = req.body;
        if (reqQuery?.TRAN_MAJ_CODE == null || reqQuery?.TRAN_MIN_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
		try{
			let response = await this.cardMasterHandlerService.deleteMinorSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("CardMasterHandler - deleteMinor || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    selectLength = async (req,res) => {
        const reqQuery = req.query;
        if (reqQuery?.DR_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.cardMasterHandlerService.lenghtSRSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("CardMasterHandler - selectLength || Error :", ex);
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
module.exports = CardMasterHandler;





