const tdAllocatons = require('../services/tdAllocationsServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require('../constants/errors');
// const { constructCARDError } = require("./errorHandler");
const { constructCARDError } = require("../handlers/errorHandler");


class tdAllocatonsHandler {
    constructor() {
        this.tdAllocatonsServices = new tdAllocatons();
    }

    getTdAllocationReport1 = async (req,res) => {
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
            let response = await this.tdAllocatonsServices.getTdAllocationReport1(qParams);
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
            console.error("tdAllocations - getTdAllocationReport1 || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    getTdAllocationReport2 = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.getTdAllocationReport2(qParams);
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
            console.error("tdAllocations - getTdAllocationReport2 || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    getReport1PdfGenerate1 = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.getReport1PdfGenerate1(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - getReport1PdfGenerate1 || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getReport1PdfGenerate2 = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.getReport1PdfGenerate2(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - getReport1PdfGenerate2 || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    getTdAllocationReport1A = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.getTdAllocationReport1A(qParams);
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
            console.error("tdAllocations - getTdAllocationReport1A || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    getTdAllocationReport2A = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.getTdAllocationReport2A(qParams);
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
            console.error("tdAllocations - getTdAllocationReport2A || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    getReport1PdfGenerate1A = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.getReport1PdfGenerate1A(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - getReport1PdfGenerate1A || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getReport1PdfGenerate2A = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.getReport1PdfGenerate2A(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - getReport1PdfGenerate2A || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    getTdAllocationReport1B = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.getTdAllocationReport1B(qParams);
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
            console.error("tdAllocations - getTdAllocationReport1B || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    getTdAllocationReport2B = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.getTdAllocationReport2B(qParams);
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
            console.error("tdAllocations - getTdAllocationReport2B || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    getReport1PdfGenerate1B = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.getReport1PdfGenerate1B(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - getReport1PdfGenerate1B || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getReport1PdfGenerate2B = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.getReport1PdfGenerate2B(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - getReport1PdfGenerate2B || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormC = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormC(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormC || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2C = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2C(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2C || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1C = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1C(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1C || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2C = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2C(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2C || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormD = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormD(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormD || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2D = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2D(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2D || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1D = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1D(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1D || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2D = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2D(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2D || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormE = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormE(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormE || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2E = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2E(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2E || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1E = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1E(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1E || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2E = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2E(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2E || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormF = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormF(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormF || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2F = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2F(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2F || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1F = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1F(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1F || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2F = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2F(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2F || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormG = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormE(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormE || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2G = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2E(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2E || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1G = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1G(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1G || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2G = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2E(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2E || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormH = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormH(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormH || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2H = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2H(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2H || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1H = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1H(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1H || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2H = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2H(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2H || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormI = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormI(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormI || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2I = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2I(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2I || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1I = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1I(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1I || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2I = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2I(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2I || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormJ = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormJ(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormJ || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2J = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2J(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2J || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1J = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1J(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1J || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2J = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2J(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2J || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormK = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormK(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormK || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2K = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2K(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2K || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1K = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1K(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1K || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2K = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2K(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2K || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    
    tdAllocationReportFormL = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormL(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormL || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2L = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2L(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2L || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1L = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1L(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1L || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2L = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2L(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2L || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormM = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormM(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormM || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2M = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2M(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2M || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1M = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1M(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1M || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2M = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2M(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2M || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormN = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormN(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormN || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2N = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2N(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2N || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1N = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1N(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1N || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2N = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2N(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2N || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    tdAllocationReportFormO = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.tdAllocationReportFormO(qParams);
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
            console.error("tdAllocations - tdAllocationReportFormO || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    tdAllocationReportForm2O = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.tdAllocationReportForm2O(qParams);
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
            console.error("tdAllocations - tdAllocationReportForm2O || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError
                }
            )
        }
    }
    report1PdfGenerateForm1O = async (req, res) => {
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
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm1O(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm1O || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    report1PdfGenerateForm2O = async (req, res) => {
        const qParams = req.query;
        if (qParams?.SR_CODE == null || qParams?.TO_DATE == null || qParams?.FROM_DATE == null || qParams?.LOCAL_BODY == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.tdAllocatonsServices.report1PdfGenerateForm2O(qParams);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("tdAllocations - report1PdfGenerateForm2O || Error :", ex);
            var cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


}


module.exports = tdAllocatonsHandler;