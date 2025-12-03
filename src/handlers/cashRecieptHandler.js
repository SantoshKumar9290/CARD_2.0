const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const odbService = require('../services/cashServices');
const obdDao = require('../dao/oracledbDao')
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');

class CashPayableHandler {
	constructor() {
		this.obService = new odbService();
		this.oDao = new obdDao();
	};

	getAllcashDataBySro = async (req, res) => {
		const qParams = req.query;
		if (qParams.srCode == null || qParams.regYear == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			qParams.srCode = parseInt(qParams.srCode);
			qParams.regYear = parseInt(qParams.regYear);
			let response = await this.obService.getAllcash(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getAllcashDataBySro || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getVSWSReqAssign = async (req, res) => {
		const reqQuery = req.query;
		if (reqQuery?.SR_CODE == null || reqQuery?.REG_YEAR == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		};
		try {
			let response = await this.obService.getVSWSReqAssignSvc(reqQuery);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getVSWSReqAssign || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	//clickbutton
	getCashPayable = async (req, res) => {
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

		try {
			qParams.srCode = parseInt(qParams.srCode);
			qParams.bookNo = parseInt(qParams.bookNo);
			qParams.docNo = parseInt(qParams.docNo);
			qParams.regYear = parseInt(qParams.regYear);
			let response = await this.obService.getCashPayableSvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getCashPayable || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getPendingPde = async (req, res) => {
		const qParams = req.query;
		if (qParams.srCode == null || qParams.regYear == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			qParams.srCode = parseInt(qParams.srCode);
			qParams.regYear = parseInt(qParams.regYear);
			let response = await this.obService.getPendingPdeSvc(qParams)
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });

		} catch (ex) {
			console.error("CashPayableHandler - getPendingPde || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	getAmountPaidHandler = async (req, res) => {
		const qParams = req.query;
		const reqParams = req.params;
		if (reqParams.type === "online" && (qParams.dptId === null || qParams.srCode === null)) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		if (reqParams.type === "stock" && qParams.certificateId === null || qParams.certIssueDate === null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}

		try {
                        if(qParams.challanNo)
			qParams.challanNo = parseInt(qParams.challanNo);
			let response = await this.obService.getAmountPaidSrvc(qParams, reqParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getAmountPaidHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	lockCerHandler = async(req,res)=>{
		const qParams = req.query;
		const reqParams = req.params;
		if (qParams.certificateId === null || qParams.certIssueDate === null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.stockLockCertificateSrvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });

		}catch(ex){
			console.error("CashPayableHandler - lockCerHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);

		}
	}
	getSaveHandler = async (req, res) => {
		const qParams = req.query;
		const reqBody = req.body;
		if (qParams.SR_CODE == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			// let response = await this.obService.savingCash(reqBody);
			let response = await this.obService.saveLogic(reqBody);
			if (response.status) {
				let responseData = {
					status: true,
					message: "Success",
					code: "200",
					response
				};
				// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
				// responseData.hash = hash;
				res.status(200).send({ ...responseData });
				return
			} else {
				res.status(400).send({
					status: false,
					message: response.message,
					code: "400",
				});
				return
			}
		}
		catch (err) {
			console.error("CashPayableHandler - getCashHandler || Error :", err);
			const cardError = constructCARDError(err);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	getChallanHandler = async (req, res) => {
		const qParams = req.query;
		if (qParams.srCode === null || !qParams.days) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			qParams.srCode = parseInt(qParams.srCode);
			qParams.days = parseInt(qParams.days);
			let response = await this.obService.getChallanSvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });

		} catch (ex) {
			console.error("CashPayableHandler - getChallanHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getChallanStatus = async (req, res) => {
		const qParams = req.query;
		if (qParams.cfmsChallan === null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			qParams.cfmsChallan = qParams.cfmsChallan;
			let response = await this.obService.getChallanStatus(qParams)
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getChallanStatus || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	updateApplicationStatus = async (req, res) => {
		const qParams = req.query;
		if (qParams.srCode == null || qParams.regYear == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			qParams.srCode = parseInt(qParams.srCode);
			qParams.regYear = parseInt(qParams.regYear);
			await this.obService.updateApplicationStatus(qParams);
			let responseData = {
				status: true,
				message: "Status Updated Successfully",
				code: "200"
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - updateApplicationStatus || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	updateVerifyBy = async (req, res) => {
		const reqQuery = req.query;
		if (reqQuery?.DOC_VERIFIED_BY == null || reqQuery?.DOC_VERIFY == null || reqQuery?.APP_ID == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.obService.updateVerifyBySrvc(reqQuery)
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - updateVerifyBy || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getCashPaid = async (req, res) => {
		const qParams = req.query;
		if (qParams.srCode == null || qParams.bookNo == null || qParams.doctNo == null || qParams.regYear == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.obService.getCashPaid(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getCashPaid || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getCashReceipt = async (req, res) => {
		const qParams = req.query;
		if (qParams.srCode == null || qParams.receipt_no == null || qParams.receipt_date == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.obService.getCashReceiptSrvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getCashPaid || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getCash = async (req, res) => {
		const qParams = req.query;
		if (qParams.srCode == null || qParams.receipt_no == null || qParams.receipt_date == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.obService.getCashSrvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getCash || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getDocStatus = async (req, res) => {
		const qParams = req.query;
		if (qParams.srCode == null || qParams.doctNo == null || qParams.bookNo == null || qParams.regYear == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.obService.getDocStatusSrvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getDocStatus || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getChallanDetails = async (req, res) => {
		const qParams = req.query;
		if (qParams.challanno == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.obService.getChallanDetailsSrvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getChallanDetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	
	getDeficitDetails = async(req,res) => {
		const qParams = req.query;
		if(qParams.SR_CODE == null || qParams.REG_YEAR == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.getDeficitDetailsSrv(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("CashPayableHandler - getDeficitDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	addDeficitDetails = async(req,res) => {
		const qParams = req.body;
		if(qParams.SR_CODE == null || qParams.BOOK_NO == null || qParams.RDOCT_NO == null || qParams.RYEAR == null || qParams.FLAG == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.addDeficitDetailsSrv(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("CashPayableHandler - addDeficitDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	deleteDeficitDetails = async(req,res) => {
		const qParams = req.query;
		if(qParams.SR_CODE == null || qParams.RYEAR == null || qParams.BOOK_NO == null || qParams.RDOCT_NO == null || qParams.FLAG == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.deleteDeficitDetailsSrv(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("CashPayableHandler - deleteDeficitDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	getDocsDetails = async(req,res) => {
		const qParams = req.query;
		if(qParams.SR_CODE == null || qParams.RYEAR == null || qParams.RDOCT_NO == null || qParams.BOOK_NO == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.getDocsDetailsSrv(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("CashPayableHandler - getDeficitDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}


	getPdfreceipt = async(req,res) => {
		const qParams = req.query;
		if(qParams.SR_CODE == null || qParams.C_RECEIPT_NO == null ){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.getPdfreceiptSrvc(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	
		}catch(ex){
			console.error("CashPayableHandler - getDeficitDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	postAuditCashDetails = async(req,res) => {
		const qParams = req.body;
		if(qParams.SR_CODE == null || qParams.REG_YEAR == null || qParams.DOCT_NO == null || qParams.BOOK_NO == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.postAuditCashDetailsSrvc(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("CashPayableHandler - postAuditCashDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	getMajorDetails = async(req,res) => {
		const qParams = req.query;
		if(qParams.SR_CODE == null || qParams.REG_YEAR == null || qParams.DOCT_NO == null || qParams.BOOK_NO == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.getMajorDetailsSrvc(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("CashPayableHandler - postAuditCashDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	updateDeficitDetails = async(req,res) => {
		const qParams = req.body;
		if(qParams.SR_CODE == null || qParams.REG_YEAR == null || qParams.BOOK_NO == null || qParams.CSNO == null || qParams.RDOCT_NO == null || qParams.RYEAR == null || qParams.FLAG == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.updateDeficitDetailsSrv(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	

		}catch(ex){
			console.error("CashPayableHandler - updateDeficitDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	} 

	getStampindentDetails = async(req,res) => {
        const qParams = req.query;
        if(qParams.cfmsChallan == null){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.obService.getStampindentDetailsSrvc(qParams);
            res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );  
 
        }catch(ex){
            console.error("CashPayableHandler - getStampindentDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    updateStampIndent = async(req,res) => {
        const qParams = req.body;
        if(qParams.REQUEST_ID == null || qParams.RECEIPT_NO == null || qParams.PURCHASE_YEAR == null){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.obService.updateStampIndentSrvc(qParams);
            res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );  
 
        }catch(ex){
            console.error("CashPayableHandler - updateStampIndent || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getStampDetailswithApp = async(req,res) => {
        const qParams = req.query;
        if(qParams.REQUEST_ID == null){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.obService.getStampDetailswithAppSrvc(qParams);
			if(response === 'SRO Verify') {
				res.status(200).send(
					{
						status:false,
						message: "Indent form is not verified by SRO",
						code: "200",
						data: []
					}
				);
			}
			else {
				res.status(200).send(
					{
						status:true,
						message: "Success",
						code: "200",
						data: response
					}
				);  
			}
        }catch(ex){
            console.error("CashPayableHandler - getStampDetailswithApp || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    insertStampData = async(req,res) => {
        const qParams = req.body;
        let data = qParams.data;
        if(data.length === 0){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try{
            let response = await this.obService.insertStampDataSrvc(qParams);
            res.status(200).send(
                {
                    status:true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );  
 
        }catch(ex){
            console.error("CashPayableHandler - insertStampData || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

	getVendorDetails = async(req,res) => {
		const qParams = req.query;
		if(qParams.VENDOR_ID == null || qParams.SR_CODE == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.obService.getVendorDetailsSrvc(qParams);
			res.status(200).send(
                {
                    status:true, 
                    message: "Success",
                    code: "200",
                    data: response
                }
            );	
		}catch(ex){
			console.error("CashPayableHandler - getVendorDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}

	getCashPaidDetails = async (req, res) => {
		const qParams = req.body;
		if (qParams.SR_CODE == null || qParams.BOOK_NO == null || qParams.RDOCT_NO == null || qParams.RYEAR == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.obService.getCashPaidDetailsSrvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - getCashPaidDetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	insertSec16Data = async (req, res) => {
		const qParams = req.body;
		try {
			let response = await this.obService.insertSec16DataSrvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - insertSec16Data || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	VerifySec16 = async (req, res) => {
		const qParams = req.query;
		try {
			let response = await this.obService.VerifySec16Srvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("CashPayableHandler - VerifySec16Srvc || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getChallanFrank = async (req, res) => {
		const qParams = req.query;
		if (!qParams.days) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			qParams.days = parseInt(qParams.days);
			let response = await this.obService.getFrankChallanSvc(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
	
		} catch (ex) {
			console.error("CashPayableHandler - getChallanFrank || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	
	getChallansByDoct = async (req, res) => {
		const qParams = req.query;
		const requiredFields = ['SR_CODE', 'DOCT_NO', 'BOOK_NO', 'REG_YEAR'];		
		for (let field of requiredFields) {
		 if (qParams[field] === undefined || qParams[field] === null || qParams[field] === '') {
		 res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).json({
		  status: false,
		  message: `Validation Error: '${field}' is required`
		 });
		 return;
		}}
		if(!(req?.user?.SRO_CODE == qParams?.SR_CODE && (req?.user?.role == 'SRO' || req?.user?.role == 'STAFF'))){
		 res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).json({
		 status: false,
		 message: `Not authorized to access this data`
		 });
		 return;
		}
		try {
		 let response = await this.obService.getChallansByDoctSrvc(qParams);
		 let responseData = {
		 status: true,
		 message: "Success",
		 code: "200",
		 data: response
		 };
		 res.status(200).send({ ...responseData });
		} catch (ex) {
		 console.error("CashPayableHandler - getChallansByDoct || Error :", ex);
		 const cardError = constructCARDError(ex);
		 return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
		 {
		  status: false,
		  message: cardError.message
		 }
		 );
		}
	}

	getCashReceiptNumberWithAppId = async (req, res) => {
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
		try {
			let response = await this.obService.getCashReceiptNumberWithAppId(qParams);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			
			res.status(200).send(responseData);
		} catch (ex) {
			console.error("CashPayableHandler - getCashReceiptNumberWithAppId || Error :", ex);
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
module.exports = CashPayableHandler;