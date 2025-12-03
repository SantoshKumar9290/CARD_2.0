const formService = require('../services/fromServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');



class formHandler {
    constructor() {
        this.formHandlerService = new formService();
    }
    getdistricts = async (req,res) => {   
		try{
            let response = await this.formHandlerService.getdistrictDetailsSrvc();
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getdistricts || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

    getsroDetails = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.DR_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getsroDetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getSroDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

    getForm1Details = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null || reqQuery.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getForm1DetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getForm1Details || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }


    getForm2Details = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null || reqQuery.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getForm2DetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getForm2Details || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }


    getForm3Details = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null|| reqQuery.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getForm3DetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getForm3Details || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }


    getForm4Details = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null|| reqQuery.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getForm4DetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getForm4Details || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }


    getRuralProhibDetails = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getRuralProhibDetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getRuralProhibDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }


    getUrbanProhibDetails = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getUrbanProhibDetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getUrbanProhibDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }


    getRuralProhibDenotifyDetails = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getRuralProhibDenotifyDetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getRuralProhibDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }


    getUrbanProhibDenotifyDetails = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getUrbanProhibDenotifyDetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getUrbanProhibDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }



    getVillagelist = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.formHandlerService.getVillagelistSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("formHandler - getVillagelist || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

    getURBANProhbPdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.formHandlerService.getURBANProhbPdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getRURALProhbPdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.formHandlerService.getRURALProhbPdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getURBANProhbDenotifyPdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.formHandlerService.getURBANProhbDenotifyPdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getRURALProhbDenotifyPdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.formHandlerService.getRURALProhbDenotifyPdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    
    getMVURBANFORM1PdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.formHandlerService.getMVURBANFORM1PdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getMVURBANFORM2PdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.formHandlerService.getMVURBANFORM2PdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getMVRURALFORM3PdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.formHandlerService.getMVRURALFORM3PdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getMVRURALFORM4PdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VILLAGE_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.formHandlerService.getMVRURALFORM4PdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    

}
module.exports = formHandler;





