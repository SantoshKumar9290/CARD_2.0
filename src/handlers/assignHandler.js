const AssignServices = require('../services/assignServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const CARDError = require("../errors/customErrorClass");
const { constructCARDError } = require("./errorHandler");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');

class AssignHandlder {
	constructor() {
		this.assignServices = new AssignServices();
	};
	getBasicDetails = async (req, res) => {
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
			let response = await this.assignServices.getBasicDetails(qParams);
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
			console.error("AssignHandlder - getbasicdetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getPartyDetails = async (req, res) => {
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
			let response = await this.assignServices.getPartyDetails(qParams);
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
			console.error("AssignHandlder - getPartyDetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getPropertyDetails = async (req, res) => {
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
			let response = await this.assignServices.getPropertyDetails(qParams);
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
			console.error("AssignHandlder - getPropertyDetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getRepresentativeDetails = async (req, res) => {
		try {
			let response = await this.assignServices.getRepresentativeDetails();
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
			console.error("AssignHandlder - getRepresentativeDetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}


	swapRNoHandler = async (req, res) => {

		const qParams = req.query;

		if (qParams.srCode == null || qParams.bookNo == null || qParams.ryr == null) {

			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(

				{

					status: false,

					message: NAMES.VALIDATION_ERROR

				}

			);

			return;

		}

		try {

			let response = await this.assignServices.swapRNoProcSvc(qParams);

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

			console.error("AssignHandlder - asignRegNoHandler || Error :", ex);

			const cardError = constructCARDError(ex);

			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(

				{

					status: false,

					message: cardError.message

				}

			);

		}

	}

	asignRegNoHandler = async (req, res) => {
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
			let response = await this.assignServices.asingRNoProcSvc(qParams);
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
			console.error("AssignHandlder - asignRegNoHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getVerifyRDocNo = async (req, res) => {
		const qParams = req.query;
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
			let response = await this.assignServices.getVerifyRDocSvc(qParams);
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
			console.error("AssignHandlder - getVerifyRDocNo || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	getDocAckDetails = async (req, res) => {
		try {
			let result = await this.assignServices.getDocAckDetails(req.query);
			let responseData = {
				status: true,
				data: result
			};
			return res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("AssignHandlder - getDocAckDetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	valiadteNumber = async (req, res) => {
		let qParams = req.query;
		if (qParams.SR_CODE == null || qParams.REG_YEAR == null || qParams.BOOK_NO == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let result = await this.assignServices.validateNumberSrvc(qParams);
			let responseData = {
				status: true,
				data: result
			};
			return res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("AssignHandlder - valiadteNumber || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}



	assignRegularNumber = async(req,res) => {
		const reqData = req.query;
		if(reqData.srCode == null || reqData.bookNo == null || reqData.regYear == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.assignServices.assignRegularNumberSrvc(reqData);
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
			console.error("AssignHandlder - assignRegularNumber || Error :", ex);
            const pdeError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[pdeError.name]).send(
                {
                    status: false,
                    message: pdeError.message
                }
            );
		}
	}

	assignNegativeNumber = async(req,res) => {
		const reqData = req.query;
		if(reqData.srCode == null || reqData.bookNo == null || reqData.regYear == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.assignServices.assignNegativeNumberSrvc(reqData);
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
			console.error("AssignHandlder - assignNegativeNumber || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}

	}

	checkFreehold = async(req,res) => {
		const reqData = req.query;
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
			let response = await this.assignServices.checkFreeholdSrvc(reqData);
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
			console.error("AssignHandlder - checkFreehold || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
	addSection89Details = async (req, res) => {
		try {
			const qParams = req.body;
			if (!qParams.SR_CODE || !qParams.BOOK_NO || !qParams.DOCT_NO || 
				!qParams.REG_YEAR || !qParams.COURT_ID) {
				return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
					status: false,
					message: NAMES.VALIDATION_ERROR
				});
			}
			let response = await this.assignServices.addSection89Details(qParams);
			return res.status(200).send({
				status: true,
				message: "Success",
				code: "200",
				data: response
			});
	
		} catch (ex) {
			console.error("AssignHandler - addSection89Details || Error:", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
				status: false,
				message: cardError.message
			});
		}
	};

	getSection89Details = async (req, res) => {
		let reqData = req.query;
		try {
			let result = await this.assignServices.getSection89Details(reqData);
			let responseData = {
				status: true,
				data: result
			};
			return res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("AssignHandlder - getSection89Details || Error :", ex);
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
module.exports = AssignHandlder;