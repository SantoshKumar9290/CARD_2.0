const ESignService = require('../services/esignService');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');
const ObDao = require('../dao/oracledbDao');
const MutationServices = require('../services/mutationServices');
const AutoMutationServices = require('../services/autoMutationService');

class EsignHandler {
    constructor() {
        this.esignService = new ESignService();
        this.obDao = new ObDao();
        this.mutationServices = new MutationServices();
        this.automutationServices = new AutoMutationServices();

    };

    eSignDocument = async (req, res) => {
        try {
            let response = await this.esignService.getEsign(req.body);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EsignHandler - eSignDocument || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    eSignEndorsementDocument = async (req, res) => {
        try {
            let response = await this.esignService.getEndorsementEsign(req.body);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EsignHandler - eSignEndorsementDocument || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    eSignStatus = async (req, res) => {
        try {
            let response = await this.esignService.getEsignStatus(req.body);
            if(!req.body.isCertficateOfRegistrationEsign){
                let query = `UPDATE SROUSER.pde_doc_status_cr SET DOC_ESIGN='P' where SR_CODE=${req.body.sroCode} AND BOOK_NO=${req.body.bookNo} AND DOCT_NO=${req.body.documentNo} AND REG_YEAR=${req.body.registedYear}`;
                let response2 = await this.obDao.oDbUpdate(query);
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
        } catch (ex) {
            console.error("EsignHandler - eSignStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    eSignEndorsementStatus = async (req, res) => {
        try {
            let response = await this.esignService.getEndorsementEsignStatus(req.body);
            if(!req.body.isCertficateOfRegistrationEsign){
                let query = `UPDATE SROUSER.pde_doc_status_cr SET DOC_ESIGN='P' WHERE SR_CODE=${req.body.sroCode} AND BOOK_NO=${req.body.bookNo} AND DOCT_NO=${req.body.documentNo} AND REG_YEAR=${req.body.registedYear}`;
                let response2 = await this.obDao.oDbUpdate(query);
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
        } catch (ex) {
            console.error("EsignHandler - eSignEndorsementStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

   eSignRefusalCorDocument = async (req, res) => {
        try {
            let response = await this.esignService.getRefusalCorEsign(req.body);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EsignHandler - eSignRefusalCorDocument || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    eSignRefusalCorStatus = async (req, res) => {
        try {
            let response = await this.esignService.getRefusalCorEsignStatus(req.body);
            // let query = `UPDATE SROUSER.pde_doc_status_cr SET DOC_ESIGN='P' WHERE SR_CODE=${req.body.sroCode} AND BOOK_NO=${req.body.bookNo} AND DOCT_NO=${req.body.documentNo} AND REG_YEAR=${req.body.registedYear}`;
            // let response2 = await this.obDao.oDbUpdate(query);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: response
			};
			// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			// responseData.hash = hash;
			res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EsignHandler - eSignRefusalCorStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getMutationCertificate = async (req, res) => {
        const qParams = req.query;
        const requiredFields = ['SR_CODE', 'DOCT_NO', 'BOOK_NO', 'REG_YEAR'];
        for (let field of requiredFields) {
            if (!qParams[field]) {
                return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).json({
                    status: false,
                    message: `Validation Error: '${field}' is required`
                });
            }
        }
        try {
            const response = await this.automutationServices.getRuralDocumentsSrvc(qParams);
            const adangalSchedules = response?.AdangalSchedules;
            const lpmSchedules = response?.lpmSchedules;
            if (adangalSchedules.length > 0 || lpmSchedules.length > 0) {
                let mutationResponse = {};
                const docSubDiv = adangalSchedules[0]?.DOC_SUBDIV || lpmSchedules[0]?.DOC_SUBDIV;
                const docMutation = adangalSchedules[0]?.DOC_MUTATION || lpmSchedules[0]?.DOC_MUTATION;
                const docEsign = (adangalSchedules[0]?.DOC_ASSIGN === 'Y' && adangalSchedules[0]?.DOC_ESIGN === 'Y' && (adangalSchedules[0]?.DOC_PEND === null || (adangalSchedules[0]?.DOC_PEND === 'Y' && adangalSchedules[0]?.DOC_COR === 'Y')))
                                  || (lpmSchedules[0]?.DOC_ASSIGN === 'Y' && lpmSchedules[0]?.DOC_ESIGN === 'Y' && (lpmSchedules[0]?.DOC_PEND === null || (lpmSchedules[0]?.DOC_PEND === 'Y' && lpmSchedules[0]?.DOC_COR === 'Y')));
                let docData = {srCode : qParams.SR_CODE, bookNo : qParams.BOOK_NO, docNo : qParams.DOCT_NO, regYear : qParams.REG_YEAR};
                if ((docSubDiv === 'N' || (docSubDiv === 'Y' && docMutation === 'N')) && docEsign) {
                   mutationResponse = await this.mutationServices.doSubDivisionAndMutation(docData,docSubDiv);
                   if(mutationResponse.message == "Subdivision failed"){
                        return res.status(500).json({
                            status: false,
                            message: 'Subdivision failed'
                        });
                    }
                }else{
                    mutationResponse.status = true;
                }
                if (mutationResponse.status === true) {
                    return res.status(200).json({
                        status: true,
                        message: 'AutoMutation successfull',
                        data: mutationResponse
                    });
                }
                else {
                    return res.status(500).json({
                        status: false,
                        message: 'AutoMutation failed',
                        data: mutationResponse
                    });
                }
            } else {
                return res.status(404).json({
                    status: false,
                    message: 'No Adangal or LPM schedules found'
                });
            }

        } catch (ex) {
            console.error("getMutationCertificate || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name] || 500).send({
                status: false,
                message: cardError.message || 'Internal server error'
            });
        }
    };

    GetValidateQrData = async (req, res) => {
            const reqQuery = req.body;

            const requiredFields = ['SR_CODE', 'REG_YEAR', 'DOCT_NO', 'BOOK_NO','code', 'ec_number', 'name', 'txnid'];
            for (let field of requiredFields) {
            if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
                res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                    status: false,
                    message: `Validation Error: '${field}' is required`
                });
                return;
             }}
            try {
                let response = await this.esignService.GetValidateQrData(reqQuery);
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            } catch (ex) {
                console.error("ESignHandlder - ValidateQrData || Error :", ex);
                const cardError = constructCARDError(ex);
                return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                    {
                        status: false,
                        message: cardError.message
                    }
                );
            }
        }
  GetValidateQrDataRefusal = async (req, res) => {
            const reqQuery = req.body;

            const requiredFields = ['SR_CODE', 'REG_YEAR', 'DOCT_NO', 'BOOK_NO','code', 'ec_number', 'name', 'txnid'];
            for (let field of requiredFields) {
            if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
                res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                    status: false,
                    message: `Validation Error: '${field}' is required`
                });
                return;
             }}
            try {
                let response = await this.esignService.GetValidateQrDataRefusal(reqQuery);
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            } catch (ex) {
                console.error("ESignHandlder - ValidateQrData || Error :", ex);
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

module.exports = EsignHandler;





