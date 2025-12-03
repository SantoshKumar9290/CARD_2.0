const SroListServices = require('../services/sroListServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');
const os = require("os");



class SroListHandler {
	constructor() {
		this.sroListServices = new SroListServices();
	};


	getSroList = async (req, res) => {

		try {
			const forwarded = req.headers["x-forwarded-for"]
            console.log("forwarded ::::: ", forwarded);
            let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;			
            if(ip.indexOf("ffff:")>-1){
                ip = ip.split("ffff:")[1];
            }            
            console.log("SRO IP ::::: ", ip);
			let response = await this.sroListServices.getSroList();
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response,
				client: ip
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("SroListHandler - getSroList || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}
	updDeclaredCopy = async (req, res) => {
		const reqBody = req.body;
		try {
			await this.sroListServices.updDeclarationSrvc(reqBody);
			let responseData = {
				status: true,
				message: "Status Updated Successfully",
				code: "200"
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("SroListHandler - updDeclaredCopy || Error :", ex);
			let cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	getCheckcs = async (req, res) => {
		const reqQuery = req.query;
		console.log(reqQuery);
		if (reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.sroListServices.getCheckcs(reqQuery);
			// fetchTranMajor(reqQuery);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
		}
		catch (ex) {
			console.error("SroListHandler - getCheckcs || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError
				}
			)
		}
	}

	generateNewAppid = async (req, res) => {
		const reqQuery = req.body;
		const requiredFields = ['SR_CODE', 'DOCT_NO', 'BOOK_NO', 'REG_YEAR'];
    	for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    	}}
		try {
			let response = await this.sroListServices.generateNewAppid(reqQuery);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response + " Rows Updated"
			};
			res.status(200).send({ ...responseData });
		}
		catch (ex) {
			console.error("SroListHandler - generateNewAppid || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
				status: false,
				message: cardError.message || "Move to assign failed"
			}
		)
		}
}


	getLanData = async (req, res) => {
		let reqQuery = req.query;
		try {
			let neworkadress = os.networkInterfaces();
			let results;
			let obj = {};
			for (const name of Object.keys(neworkadress)) {
				for (const net of neworkadress[name]) {
					if (!net.internal && !net.scopeid) {
						results = net;
					}
				}
			}
			let response = await this.sroListServices.getLanDataSrvc(reqQuery);
			obj.latitude =  response[0].LATITUDE;
			obj.longitude = response[0].LONGITUDE;
			let lastRange = results.address.split(".").slice(-1);
			if(response[0].IP_FROM >= lastRange <= response[0].IP_TO){
				let checkSROIPAddress = `${response[0].IP_ADDRESS}.${lastRange}`;
				if(checkSROIPAddress === results.address){
					obj.isValidIP = true;
				}else{
					obj.isValidIP = false
				}
			}else{
				obj.isValidIP = false
			}
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: obj
			};
			res.status(200).send({ ...responseData });	
		}
		catch (ex) {
			console.error("SroListHandler - getLanData || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError
				}
			)
		}
	}

	scrollHandler = async (req,res) => {
		const reqQuery = req.query;
		try {
			let response = await this.sroListServices.scrollSrvc(reqQuery);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
		}
		catch (ex) {
			console.error("SroListHandler - scrollHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError
				}
			)
		}
	}

	getScrollHandler = async (req,res) => {
		const reqQuery = req.query;
		try {
			let response = await this.sroListServices.getScrollSrvc(reqQuery);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
		}
		catch (ex) {
			console.error("SroListHandler - getScrollHandler || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
				{
					status: false,
					message: cardError
				}
			)
		}
	}

}
module.exports = SroListHandler;