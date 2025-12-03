const namesearchServices = require('../services/namesearchServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const CARDError = require("../errors/customErrorClass");
const { constructCARDError } = require("./errorHandler");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');

class nameSearchHandler {
	constructor() {
		this.namesearchServices = new namesearchServices();
	};

	getdistricts = async (req,res) => {   
		try{
			const loginUser = req.user;
            let response = await this.namesearchServices.getdistrictDetailsSrvc(loginUser);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("nameSearchHandler - getdistricts || Error :", ex);
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
		const loginUser = req.user;
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
            let response = await this.namesearchServices.getsroDetailsSrvc(reqQuery, loginUser);
			let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({...responseData});	
		}catch(ex){
			console.error("nameSearchHandler - getSroDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
    }

	getNameSearchCountByData = async (req, res) => {
		const qParams = req.body;
		const loggedInUser = req.user;
		if (qParams == null || qParams == undefined || qParams == "" ) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.namesearchServices.getNameSearchCountByData(qParams, loggedInUser);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("AssignHandlder - getbasicdetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(200).send(
				{
					status: false,
					message: cardError.message
				}
			);
		}
	}

	getNameSearchSROCountByData = async (req, res) => {
		const qParams = req.body;
		const loggedInUser = req.user;
		if (qParams == null || qParams == undefined || qParams == "" ) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.namesearchServices.getNameSearchSROCountByData(qParams, loggedInUser);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("AssignHandlder - getbasicdetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(200).send(
				{
					status: false,
					message: 'Type Error'
				}
			);
		}
	};

	getNameSearchPartiesDataListByData = async (req, res) => {
		const qParams = req.body;
		const loggedInUser = req.user;
		if (qParams == null || qParams == undefined || qParams == "" ) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.namesearchServices.getNameSearchPartiesDataListByData(qParams, loggedInUser);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("AssignHandlder - getbasicdetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(200).send(
				{
					status: false,
					message: 'Type Error'
				}
			);
		}
	};

	getNameSearchStatementBySelectedData = async (req, res) => {
		const qParams = req.body;
		const loggedInUser = req.user;
		if (qParams == null || qParams == undefined || qParams == "" ) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try {
			let response = await this.namesearchServices.getNameSearchStatementBySelectedData(qParams,loggedInUser);
			let responseData = {
				status: true,
				message: "Success",
				code: "200",
				data: response
			};
			res.status(200).send({ ...responseData });
		} catch (ex) {
			console.error("AssignHandlder - getbasicdetails || Error :", ex);
			const cardError = constructCARDError(ex);
			return res.status(200).send(
				{
					status: false,
					message: 'Type Error'
				}
			);
		}
	};

};

module.exports = nameSearchHandler;