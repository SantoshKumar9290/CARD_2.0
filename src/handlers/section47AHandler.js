const section47AServices = require('../services/section47AServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");



class section47AHandler {
    constructor() {
        this.Section47AService = new section47AServices();
    }
    generateForm1PDF47A = async (req,res) => {   
        const reqQuery = req.body;
        if (reqQuery.SR_CODE == null || reqQuery.BOOK_NO == null || reqQuery.DOCT_NO == null || reqQuery.REG_YEAR == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.Section47AService.generateForm1PDF47ASrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("Section47AHandler - generateForm1PDF47A || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

    generateForm2PDF47A = async (req,res) => {   
        const reqQuery = req.body;
        if (reqQuery.SR_CODE == null || reqQuery.BOOK_NO == null || reqQuery.DOCT_NO == null || reqQuery.REG_YEAR == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.Section47AService.generateForm2PDF47ASrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("Section47AHandler - generateForm2PDF47A || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

    getSRDoctDetails = async (req,res) => {   
        const reqQuery = req.query;
        const reqParams = req.params.type;
        if (reqQuery.SR_CODE == null || reqQuery.REG_YEAR == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.Section47AService.getSRDoctDetailsSrvc(reqQuery,reqParams);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("Section47AHandler - getSRDoctDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

    getSection47APDF = async (req,res) => {   
        const reqQuery = req.body;
        const reqParams = req.params;
        if (reqQuery.SR_CODE == null || reqQuery.BOOK_NO == null || reqQuery.DOCT_NO == null || reqQuery.REG_YEAR == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.Section47AService.getSection47APDFSrvc(reqQuery,reqParams);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("Section47AHandler - getSection47APDF || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

	getSec47aStatus = async (req,res) => {  
        const reqQuery = req.query;
        if (reqQuery.SR_CODE == null || reqQuery.BOOK_NO == null || reqQuery.DOCT_NO == null || reqQuery.REG_YEAR == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.Section47AService.getSec47aStatusSrvc(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({...responseData});    
        }catch(ex){
            console.error("Section47AHandler - getSection47APDF || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

	drAccept = async (req,res) => {  
        const reqQuery = req.body;
        if (reqQuery.SR_CODE == null || reqQuery.BOOK_NO == null || reqQuery.DOCT_NO == null || reqQuery.REG_YEAR == null || reqQuery.DR_PROCEED_NO == null || reqQuery.PROCEED_DATE == null || reqQuery.EMPL_NAME == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.Section47AService.drAcceptSrvc(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({...responseData});    
        }catch(ex){
            console.error("Section47AHandler - drAccept || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

	srAccept = async (req,res) => {  
        const reqQuery = req.body;
        if (reqQuery.SR_CODE == null || reqQuery.BOOK_NO == null || reqQuery.DOCT_NO == null || reqQuery.REG_YEAR == null || reqQuery.MIS_STATUS == null || reqQuery.EMPL_NAME == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.Section47AService.srAcceptSrvc(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({...responseData});    
        }catch(ex){
            console.error("Section47AHandler - srAccept || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    VerifySec47a = async (req,res) => {  
        const reqQuery = req.body;
        if (reqQuery.APP_ID == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.Section47AService.VerifySec47aSrvc(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({...responseData});    
        }catch(ex){
            console.error("Section47AHandler - VerifySec47a || Error :", ex);
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
module.exports = section47AHandler;