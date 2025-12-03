const OrServices = require('../services/cashServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const oracleDb = require('oracledb');
const preRegServices = require('../services/preRegistrationServices');
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');

class PreRegistrationHandler {
	constructor(){
        this.OrServices = new OrServices();
		this.preRegServices = new preRegServices();
    };
	getPreRegistrationDocsForPending = async(req,res) => {
		const qParams = req.query;
		if (qParams.srCode == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.preRegServices.getPreRegistrationDocs(qParams)
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});	
		}
        catch(ex){
			console.error("PreRegistrationHandler - getPreRegistrationDocsForPending || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	postPDE = async (req,res)=>{
        const reqQuery = req.query;
		if(reqQuery?.pres_id == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
			let details = await this.preRegServices.postPdeService(reqQuery);
			if(details === 'pde api failed'){
				return res.status(400).send({
					status: false,
					message: 'PDE API failed'
				})
			} else {
				let responseData = {
					status:true, 
					message: "Success",
					code: "200",
					data: details
				};
				// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
				// responseData.hash = hash;
				res.status(200).send({...responseData});
			}
        }catch(ex){
            console.error("PreRegistrationHandler - postPDE || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
	amendHandler = async (req, res)=>{
		const reqQuery = req.query;
		if(reqQuery?.id == null || reqQuery?.reason == null  || reqQuery?.ammend_by == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };    
		try{
			await this.preRegServices.amendmentSrvc(reqQuery);
            let responseData = {
				status:true, 
				message: "Status Updated Successfully",
				code: "200",
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
        }catch(ex){
            console.error("PreRegistrationHandler - postPDE || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
	}
    getAmmend = async(req,res) => {
        const qParams = req.query;
		if (qParams.id == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.preRegServices.getAmmendSrvc(qParams);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "ID Not Found",
                    code: "404"
                })
                return;
            }
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
			console.error("PreRegistrationHandler - getAmmend || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 
	SaveNomineDetilas = async (req,res)=>{
		const reqQuery = req.body;
		if(reqQuery?.SR_CODE == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };  
		try{
			await this.preRegServices.saveNominee(reqQuery);
             let responseData = {
				status:true, 
				message: "Success",
				code: "200",
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - SaveNomineDetilas || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
		// Insert into SROUSER.TRAN_NOMINE (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,NOMINE_NAME,NOMINE_AADHAR,DOC_HANDOVER,DOC_HANDOVER_TIME,TIME_STAMP) values (612,null,null,null,null,null,null,null,to_date('19-05-23','DD-MM-RR'));

	}
    postPdeByAcceptHandler = async (req,res)=>{
		const reqQuery = req.body;
		if(reqQuery?.SR_CODE == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };  
		try{
			await this.preRegServices.postPdeByAccept(reqQuery);
            let responseData =  {
				status:true, 
				message: "Success",
				code: "200",
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - postPdeByAccept || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
		
	}
    updateDocVerify = async (req, res) => {
        const reqBody = req.body;
        try {
            let result = await this.preRegServices.updateDocVerifySvc(reqBody);
            let responseData = {
				status: true,
				message: "Success",
				code: "200",
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
			return result;
        } catch (ex) {
            console.error("PreRegistrationHandler - updateDocVerify || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

	anyWhereAccept = async (req,res)=>{
		const reqQuery = req.query;
		if(reqQuery?.SR_CODE == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };  
		try{
			let details = await this.preRegServices.anyWhereAcceptSvc(reqQuery);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: details
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - anyWhereAccept || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    anyWhereStatus = async (req,res)=>{
		const reqQuery = req.query;
		if(reqQuery?.ID == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };  
		try{
			let details = await this.preRegServices.anyWhereStatusSrvc(reqQuery);
            if (details.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "ID Not Found",
                    code: "404"
                })
                return;
            }
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: details
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - anyWhereStatus || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    anyWherePending = async (req,res)=>{
		const reqQuery = req.query;
		if(reqQuery?.sro_location == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };  
		try{
			let details = await this.preRegServices.anyWherePendingSrvc(reqQuery);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: details
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - anyWherePending || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    anyWhereSave = async (req,res)=>{
		const reqQuery = req.body;  
		try{
			await this.preRegServices.anyWhereSaveSvc(reqQuery, req.user || {});
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - anyWhereSave || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    savePending = async (req,res)=>{
		const reqBody = req.body;
		try{
			await this.preRegServices.savePendingSrvc(reqBody);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - SavePending || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	getDocVerify = async(req,res) => {
        const qParams = req.query;
		if (qParams.id == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.preRegServices.getDocVerifySrvc(qParams);
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
			console.error("PreRegistrationHandler - getDocVerify || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	saveProbAudit = async (req,res)=>{
		const reqBody = req.body;
		try{
			await this.preRegServices.saveProbAuditSrvc(reqBody);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - saveProbAudit || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	saveGrantApproval = async (req,res)=>{
		const reqBody = req.body;
		try{
			await this.preRegServices.grantApprovalSrvc(reqBody);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - saveGrantApproval || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	getProhbStatus = async(req,res) => {
		const qParams = req.query;
		if (qParams.ID == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.preRegServices.ProhibitedstatusSrvc(qParams)
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});	
		}
        catch(ex){
			console.error("PreRegistrationHandler - getProhbStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 
	UpdatePPGrant = async (req,res)=>{
		const reqQuery = req.body;  
		try{
			await this.preRegServices.PPGrantSrvc(reqQuery);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - UpdatePPGrant || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	getPreviewAnywhereDocument = async(req,res) => {
        const reqData = req.body;
        if(reqData.APP_ID == null){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.preRegServices.getPreviewAnywhereDocumentSrvc(reqData);
            res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        }catch(ex){
            console.error("PreRegistrationHandler - getPreviewAnywhereDocument || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

	getSlotEnableStatus = async (req, res) => {
        const qParams = req.query;
        if (!qParams.SR_CODE) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.preRegServices.getSlotEnableStatusSrvc(qParams);
            let sroEnableCount=0;
			if(response.length > 0){
				sroEnableCount=response[0].STATUS==='Y' ? 1 : 0
			}
			console.log(sroEnableCount)
			let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: sroEnableCount,
				isUrbanMutationEnabled:response[0].URBAN_MUTATION_STATUS
            };




            // let response = await this.preRegServices.getSlotEnableStatusSrvc(qParams)
            // let responseData = {
            //     status: true,
            //     message: "Success",
            //     code: "200",
            //     data: response
            // };
            res.status(200).send({ ...responseData });
        }
        catch (ex) {
            console.error("PreRegistrationHandler - getSlotEnableStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


	getVerifyOTP = async (req, res) => {
        const qParams = req.body;
        if (!qParams.APP_ID || !qParams.OTP) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.preRegServices.getVerifyOTPSrvc(qParams)
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        }
        catch (ex) {
            console.error("PreRegistrationHandler - getVerifyOTP || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

	rejectDuplicateSurveyNoDoc = async (req, res) =>{
		const reqQuery = req.body;  
		try{
			await this.preRegServices.rejectDuplicateSurveyNoDoc(reqQuery.ID);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - rejectDuplicateSurveyNoDoc || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	reSubmitAnywhereDocument = async (req, res) =>{
		const reqQuery = req.body;  
		try{
			await this.preRegServices.reSubmitAnywhereDocument(reqQuery);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - reSubmitAnywhereDocument || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	getClaimantDetails = async( req, res ) => {
		const qParams = req.query;
		if (qParams.ID == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.preRegServices.getClaimantDetails(qParams)
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}
        catch(ex){
			console.error("PreRegistrationHandler - getClaimantDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	SaveEkycClaimantDetails = async (req,res)=>{
		const reqQuery = req.body;
		if(reqQuery?.id == null && reqQuery.claimant_name == null &&  reqQuery.claimant_aadhar == null && reqQuery.ekyc_type == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
        };  
		try{
			await this.preRegServices.SaveEkycClaimantDetails(reqQuery);
             let responseData = {
				status:true, 
				message: "Success",
				code: "200",
			};
			res.status(200).send({...responseData});
		}catch(ex){
			console.error("PreRegistrationHandler - SaveEkycClaimantDetails || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	rejectDuplicateStampsDoc = async (req, res) =>{
		const reqQuery = req.body;  
		try{
			await this.preRegServices.rejectDuplicateStampsDoc(reqQuery.ID);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200"
			};
			res.status(200).send({...responseData});
		} catch (ex) {
			console.error("PreRegistrationHandler - rejectDuplicateStampDoc || Error :", ex);
			let cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}


	getOCIParties = async (req,res) => {
		const qParams = req.query;
		if (qParams.ID == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
            let response = await this.preRegServices.getOCIParties(qParams)
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}
        catch(ex){
			console.error("PreRegistrationHandler - getOCIParties || Error :", ex);
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
module.exports = PreRegistrationHandler;





