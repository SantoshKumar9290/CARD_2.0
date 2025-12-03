const AccountService = require('../services/accountServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');

class AccountHandler {
    constructor() {
        this.accountHandlerService = new AccountService();
    }
    
    getAccountDetails = async (req, res) => {
        const { srCode, regYear, month } = req.query;
        try {
            let response = await this.accountHandlerService.getAccountDetailsSrvc(srCode, regYear, month);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - getAccountDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    accountG = async (req, res) => {
        const qParams = req.query;
		if (qParams.SR_CODE == null || qParams.FROM_DATE == null|| qParams.TO_DATE == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}        
        try {
            let response = await this.accountHandlerService.accountGSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - accountG || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    accountA = async (req, res) => {
        const qParams = req.query;
		if (qParams.SR_CODE == null || qParams.FROM_DATE == null || qParams.TO_DATE == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}        
        try {
            let response = await this.accountHandlerService.accountASrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - accountA || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    accountD = async (req, res) => {
        const qParams = req.query;
		if (qParams.SR_CODE == null || qParams.FROM_DATE == null || qParams.TO_DATE == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}        
        try {
            let response = await this.accountHandlerService.accountDSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - accountD || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    minuteReport = async (req, res) => {
        const qParams = req.query;
		if (qParams.SR_CODE == null || qParams.FROM_DATE == null || qParams.TO_DATE == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}        
        try {
            let response = await this.accountHandlerService.minitueReportSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - minuteReport || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getReport1PdfGenerateA = async (req, res) => {
        const qParams = req.body;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.accountHandlerService.getReport1PdfGenerateA(qParams);
            if(!response) {
                res.status(200).send({
                    status: false,
                    message: "No data found",
                    code: "200"
                })
                return;
            }
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("AccountHandler - getReport1PdfGenerateA || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getReport1PdfGenerateB = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.accountHandlerService.getReport1PdfGenerateB(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("AccountHandler - getReport1PdfGenerateB || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getReport1PdfGenerateC = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.accountHandlerService.getReport1PdfGenerateC(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("AccountHandler - getReport1PdfGenerateC || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getReport1PdfGenerateD = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.accountHandlerService.getReport1PdfGenerateD(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("AccountHandler - getReport1PdfGenerateD || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getReport1PdfGenerateMin = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.accountHandlerService.getReport1PdfGenerateMin(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("AccountHandler - getReport1PdfGenerateMin || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getReport1PdfGenerateG = async (req, res) => {
        const qParams = req.body;
        console.log(qParams);
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.accountHandlerService.getReport1PdfGenerateG(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("AccountHandler - getReport1PdfGenerateG || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getReport1PdfGenerateH = async (req, res) => {
        const qParams = req.body;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.accountHandlerService.getReport1PdfGenerateH(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("AccountHandler - getReport1PdfGenerateH || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    accountB = async (req, res) => {
        const qParams = req.query;
		if (qParams.SR_CODE == null || qParams.FROM_DATE == null || qParams.TO_DATE == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}        
        try {
            let response = await this.accountHandlerService.accountBSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - accountB || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    accountH = async (req, res) => {
        const qParams = req.query;
		if (qParams.SR_CODE == null || qParams.FROM_DATE == null || qParams.TO_DATE == null) {
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}        
        try {
            let response = await this.accountHandlerService.accountHSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - accountH || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    addCollectionAccountCData = async (req, res) => {
        const qParams = req.body;
        if (qParams.DATE == null || qParams.DOC_DETAILS == null || qParams.AMOUNT == null || qParams.OTHER_RECEIPT == null || qParams.CROSS_REF == null || qParams.ENTRY_BY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }        
        try {
            let response = await this.accountHandlerService.addCollectionAccountCDataSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - addCollectionAccountCData || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    addDisbursementsAccountCData = async (req, res) => {
        const qParams = req.body;
        if (qParams.DATE == null || qParams.DOC_DETAILS == null || qParams.AMOUNT == null || qParams.OTHER_RECEIPT == null || qParams.CROSS_REF == null || qParams.ENTRY_BY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }        
        try {
            let response = await this.accountHandlerService.addDisbursementsAccountCDataSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - addCollectionAccountCData || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    accountC = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.FROM_DATE == null || qParams.TO_DATE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }        
        try {
            let response = await this.accountHandlerService.accountCSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AccountHandler - accountC || Error :", ex);
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
module.exports = AccountHandler;