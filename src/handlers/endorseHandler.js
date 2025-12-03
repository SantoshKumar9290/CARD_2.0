const EndorseSrvc = require('../services/endorseService');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');


class EndorseHandler {
	constructor() {
		this.endorseSrvc = new EndorseSrvc();
	}
	saveEndorseHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sro_code == null || reqBody.doct_no == null || reqBody.book_no == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.saveBundling(reqBody);
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
			console.error("EndorseHandler - saveEndorseHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	createEndorsementDocumentHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.createEndorsement(reqBody);
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
			console.error("EndorseHandler - createEndorsementDocumentHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	createEndorsementDocumentWithFingerPrintHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.createEndorsementWithFingerPrint(reqBody);
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
			console.error("EndorseHandler - createEndorsementDocumentWithFingerPrintHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	createCertificateOfGenerationHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.createCertificateOfRegistration(reqBody);
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
			console.error("EndorseHandler - createCertificateOfGenerationHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	createEndorsementDocumentWithFingerPrintPendingHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.createPendingEndorsementWithFingerPrint(reqBody);
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
			console.error("EndorseHandler - createEndorsementDocumentWithFingerPrintPendingHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	createFinalReportHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null || reqBody.applicationId == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.createReportDocument(reqBody);
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
			console.error("EndorseHandler - createFinalReportHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	createBundlingDocumentHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.createBundlingDocument(reqBody);
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
			console.error("EndorseHandler - createBundlingDocumentHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	createBundlingDocumentHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.createBundlingDocument(reqBody);
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
			console.error("EndorseHandler - createBundlingDocumentHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	scannedDocumentHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null || reqBody.scannedDocument == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.saveScannedDocument(reqBody);
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
			console.error("EndorseHandler - scannedDocumentHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	getSrNamesHandler = async (req, res) => {
		const reqQuery = req.query;
		if (reqQuery.sro_code == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.getSrSrvc(reqQuery);
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
			console.error("EndorseHandler - getSrNamesHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	createRefusalCertificateOfGenerationHandler = async (req, res) => {
		const reqBody = req.body;
		if (reqBody.sroCode == null || reqBody.documentNo == null || reqBody.registedYear == null || reqBody.bookNo == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.endorseSrvc.createRefusalCertificateOfRegistration(reqBody);
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
			console.error("EndorseHandler - createRefusalCertificateOfGenerationHandler || Error :", ex);
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

module.exports = EndorseHandler;