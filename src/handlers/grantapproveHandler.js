const OrServices = require('../services/cashServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const oracleDb = require('oracledb');
const grantapproveservice = require('../services/grantapproveServices');
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');

class Grantapprovehandler {
    constructor() {
        this.OrServices = new OrServices();
        this.grantapproveservice = new grantapproveservice();
    };

    getDrgrantaprroveDocshndlr = async (req, res) => {
        const qParams = req.query;
        if (qParams.DR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.grantapproveservice.getDrgrantaprroveDocssrvc(qParams)
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({ ...responseData });
        }
        catch (ex) {
            console.error("Grantapprovehandler - getPreRegistrationDocsForPending || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    GetRejectList = async (req, res) => {
        const qParams = req.query;
        if (qParams.APP_ID == null || qParams.APP_ID == undefined || qParams.APP_ID == '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.grantapproveservice.GetRejectListsrvc(qParams)
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({ ...responseData });
        }
        catch (ex) {
            console.error("Grantapprovehandler - GetRejectList || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    grantapprovalcoordinatesHandler = async (req, res) => {
        const reqBody = req.body;
        // console.log('inside handler', reqBody);
        try {
            let response = await this.grantapproveservice.grantapprovalcoordinatessrvc(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("grantapprovalHandler - grantapprovalcoordinatesHandler || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    pendingEsignList = async (req, res) => {
        const reqBody = req.query;
        try {
            let response = await this.grantapproveservice.pendingEsignList(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("Grantapprovehandler - pendingEsignList || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    CheckPPstathndlr = async (req, res) => {
        const reqBody = req.body;
        console.log(req.body, 'b', req.query,'q');
        
        try {
            let response = await this.grantapproveservice.CheckPPstatsrvc(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("Grantapprovehandler - pendingEsignList || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    grantpdfpreviewhndlr = async (req, res) => {
        const reqData = req.query;
        if (
          reqData.SR_CODE == null || reqData.APP_ID== null
        ) {
          res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
            status: false,
            message: NAMES.VALIDATION_ERROR,
          });
          return;
        }
        try {
          const response = await this.grantapproveservice.grantpdfpreviewSrvc(reqData);
        //   res.setHeader('Content-Type', 'application/pdf');
        //   res.status(200).send(response);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
        } catch (ex) {
          console.error("Error in pdfpreview:", ex);
          const cardError = constructCARDError(ex);
          res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
            status: false,
            message: cardError.message,
          });
        }
      };

      RejectGrantApproval = async (req,res)=>{
		const reqBody = req.body;
		try{
			await this.grantapproveservice.grantApprovalRejectSrvc(reqBody);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("grantapprovelHandler - saveGrantApproval || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

    getgrantProhibDetailshndl = async (req,res) => {   
        const reqQuery = req.query;
        if (reqQuery.APP_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
		try{
            let response = await this.grantapproveservice.getgrantProhibDetailsSrvc(reqQuery);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("grantapprovelHandler - getgrantProhibDetailshndl || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

    GetRejectcomments = async (req, res) => {
        const qParams = req.query;
        if (qParams.APP_ID == null || qParams.APP_ID == undefined || qParams.APP_ID == '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.grantapproveservice.GetRejectcommentssrvc(qParams)
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({ ...responseData });
        }
        catch (ex) {
            console.error("Grantapprovehandler - GetRejectcomments || Error :", ex);
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
module.exports = Grantapprovehandler;




