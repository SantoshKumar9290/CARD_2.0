const auditService = require('../services/auditServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');



class auditHandler {
    constructor() {
        this.auditHandlerService = new auditService();
    }
    auditPlan = async (req, res) => {
        const reqData = req.body;
        if (reqData?.SR_CODE == null || reqData?.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.auditPlan(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - auditPlan || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    auditplandelete = async (req, res) => {
        const reqData = req.query;
        if (reqData?.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.auditplandelete(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - auditplandelete || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    updateAuditPlan = async (req, res) => {
        const reqData = req.body;
        if (reqData?.SR_CODE == null || reqData?.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.updateAuditPlan(reqData);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("auditHandler - updateAuditPlan || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[NAMES.INTERNAL_SERVER_ERROR]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    getDigAuditschuduleDetails = async (req, res) => {
        const reqQuery = req.query;

        try {
            let response = await this.auditHandlerService.getDigschuduledata(reqQuery);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("auditHandler - getAuditPlanDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }

    // getTopNDocuments = async (req, res) => {
    //     const reqData = req.query;
    //     try {
    //         let response = await this.auditHandlerService.getTopNDocumentsSrvc(reqData);
    //         let responseData = {
    //             status: true,
    //             message: "Success",
    //             code: "200",
    //             data: response
    //         };
    //         res.status(200).send({ ...responseData });
    //     } catch (ex) {
    //         console.error("MISHandler - getTopNDocuments || Error :", ex);
    //         const cardError = constructCARDError(ex);
    //         return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
    //             {
    //                 status: false,
    //                 message: cardError.message
    //             }
    //         );
    //     }
    // }

    getPdfreceipt = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.C_RECEIPT_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getPdfreceiptSrvc(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
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

    getAuditRemarksStatus = async (req, res) => {
        const reqQuery = req.body;
        

        try {
            let response = await this.auditHandlerService.updateAuditRemarkStatus(reqQuery);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("auditHandler - getAuditPlanDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    getNatureDocumentsList = async (req, res) => {
        const qParams = req.query;
        if (qParams.TRAN_MAJ_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getNatureDocumentsList(qParams);;
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("NatureDocumentsListHandler - getNatureDocumentsListHandler || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getAuditPlanDetails = async (req, res) => {
        const reqQuery = req.query;
        // if (reqQuery?.DR_CD == null) {
        //     res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        //         {
        //             status: false,
        //             message: NAMES.VALIDATION_ERROR
        //         }
        //     );
        //     return;
        // }
        try {
            let response = await this.auditHandlerService.getAuditPlanDetails(reqQuery);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("auditHandler - getAuditPlanDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    getIndexByCriteriaReport = async (req, res) => {
        const qParams = req.query;
        if (qParams.srocode == null || qParams.natureCode == null || qParams.landType == null || qParams.landCode == null || qParams.fromCharge == null || qParams.toCharge == null || qParams.locCode == null || qParams.ward == null || qParams.blockno == null || qParams.villCode == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getIndexByCriteriaReport(qParams);;
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("IndexByCriteriaReport - getIndexByCriteriaReport || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    sendPDFEmailHandler = async (req, res) => {
        const { emails } = req.body;

        if (!emails || !Array.isArray(emails)) {
            return res.status(400).send('Emails are required and should be an array');
        }

        try {
            await this.auditHandlerService.sendPDFEmails(emails);
            res.status(200).send({
                status: true,
                message: 'PDFs sent successfully',
                code: '200',
            });
        } catch (ex) {
            console.error('emailController - sendPDFEmailHandler || Error:', ex);
            res.status(500).send({
                status: false,
                message: 'An error occurred',
            });
        }
    };




    getAuditPdfGenerate = async (req, res) => {
        const qParams = req.query;
        if (qParams.DR_CD == null || qParams.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getAuditShadulePdfGenerate(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("MvRevisionHandler - getForm1Data || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getAuditDigfinalReport = async (req, res) => {
        const qParams = req.query;
        
        if (qParams.SR_CODE == null || qParams.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getAuditDigFinalOrderReport(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );

        } catch (ex) {
            console.error("MvRevisionHandler - getDig report || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getmisAuditDetails = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.DOCT_NO == null || qParams.REG_YEAR == null || qParams.BOOK_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getmisAuditDetailsSrvc(qParams);
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


    getAuditCashDetails = async (req, res) => {
        const reqQuery = req.query;
        if (reqQuery?.SR_CODE == null || reqQuery?.DOCT_NO == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getAuditCashDetailsSrvc(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - getAuditCashDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    auditRemarks = async (req, res) => {
        const reqQuery = req.body;
        
        
        if (reqQuery?.iar_number == null || reqQuery?.sr_code == null || reqQuery?.doct_no == null || reqQuery?.book_no == null || reqQuery?.reg_year == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }

        try {
            let response = await this.auditHandlerService.auditRemarksSrvc(reqQuery);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("auditHandler - auditRemarks || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getEmployeesDR = async (req, res) => {
        const qParams = req.query;
        if (qParams.dR == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getEmployeesDRSrvc(qParams);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "DR Not Found",
                    code: "404"
                })
                return;
            }
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
            console.error("EmployeeHandler - getEmployeesDR || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getEmployeesDIG = async (req, res) => {
        const qParams = req.query;
        if (qParams.DIG == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getEmployeesDIGSrvc(qParams);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "DR Not Found",
                    code: "404"
                })
                return;
            }
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
            console.error("EmployeeHandler - getEmployeesDIG || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getDIGLocations = async (req, res) => {
        try {
            let response = await this.auditHandlerService.getDIGLocationsSrvc();
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - getDIGLocations || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getAuditdocument = async (req, res) => {
        const reqQuery = req.query;
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
            let response = await this.auditHandlerService.getDataSrvc(reqQuery);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("CCHandler - getData || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[NAMES.INTERNAL_SERVER_ERROR]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    getAuditRemarksDetails = async (req, res) => {
        const reqQuery = req.query;
        if (reqQuery?.SR_CODE == null || reqQuery?.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getAuditRemarksSrvc(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - getAuditCashDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getauditsrlist = async (req, res) => {
        const qParams = req.query;
        if (qParams.dR == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getauditsrlistsrvc(qParams);
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
            console.error("EmployeeHandler - getEmployees || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getAuditDRList = async (req, res) => {
        try {
            let response = await this.auditHandlerService.getAuditDRSrvc();
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
            console.error("EmployeeHandler - getDRList || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    updateAuditRemarksDetails = async (req, res) => {
        const reqQuery = req.body;
        // console.log(reqQuery);
        if (reqQuery?.SR_CODE == null || reqQuery?.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.updateAuditRemarksSrvc(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - getAuditCashDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    updateAuditRemarks1Details = async (req, res) => {
        const reqQuery = req.body;
        // console.log(reqQuery);
        if (reqQuery?.SR_CODE == null || reqQuery?.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.updateAuditRemarks1Srvc(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - getAuditCashDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    updateDIGAuditMISCashdetails = async (req, res) => {
        const reqQuery = req.body;

        if (reqQuery?.SR_CODE == null || reqQuery?.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.updateDIGcashmisdetails(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - updateDIGAuditRemarksDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    updateDIGAuditRemarksDetails = async (req, res) => {
        const reqQuery = req.body;
        // console.log(reqQuery);
        if (reqQuery?.SR_CODE == null || reqQuery?.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.updateDIGAuditRemarksSrvc(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("auditHandler - updateDIGAuditRemarksDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getAuditApplication = async (req, res) => {
        const reqQuery = req.query;
        if (reqQuery?.SR_CODE == null || reqQuery?.DOCT_NO == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.IAR_NUMBER == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getAuditApplication(reqQuery);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("auditHandler - getAuditPlanDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    genarateAuditRevieworder = async (req, res) => {
        const reqQuery = req.query;
        // if (reqQuery?.IAR_NUMBER == null) {
        //     res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        //         {
        //             status: false,
        //             message: NAMES.VALIDATION_ERROR
        //         }
        //     );
        //     return;
        // }
        try {
            let response = await this.auditHandlerService.genarateAuditRevieworder(reqQuery, res);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {

                return res.status(200).send(
                    {
                        status: true,
                        code: "200",
                        data: response
                    }
                );

            }
        } catch (ex) {
            console.error("auditHandler - getAuditPlanDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    dutyCalculaterHandler = async (req, res) => {
        const reqBody = req.body;
        // if(reqBody?.tmaj_code == null || reqBody?.tmin_code ==null || reqBody?.local_body == null || reqBody.flat_nonflat == null || reqBody.finalTaxbleValue  == null|| reqBody.adv_amount  == null ){
        //  res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        //      {
        //          status: false,
        //          message: NAMES.VALIDATION_ERROR
        //      }
        //  );
        //  return;
        // }
        
        try {
            let response = await this.auditHandlerService.dutyService(reqBody);
            let hash = encryptWithAESPassPhrase(JSON.stringify(response), "123456");
            response.hash = hash;
            return res.status(200).send(
                {
                    status: true,
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("auditHandler - getAuditPlanDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getDIGiarDetails = async (req, res) => {
        const reqQuery = req.query;
        // if (reqQuery?.DR_CD == null) {
        //     res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        //         {
        //             status: false,
        //             message: NAMES.VALIDATION_ERROR
        //         }
        //     );
        //     return;
        // }
        try {
            let response = await this.auditHandlerService.getDIGiardetails(reqQuery);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("auditHandler - getAuditPlanDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    getCheckSlipReports = async (req, res) => {
        const reqQuery = req.query;
        if (reqQuery.srCode == null || reqQuery.bookNo == null || reqQuery.regYear == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.auditHandlerService.getCheckSlipReportsSrvc(reqQuery);
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
            console.error("checkSlipReportHandler - getReports || Error :", ex);
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
module.exports = auditHandler;





