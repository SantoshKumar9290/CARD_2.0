const Status = require("http-status");
const ErrorHandler = require("./errorHandler");
const ReportService = require("../services/reportServices");

class ReportsHandler {
    constructor(options = {}) {
        this.headers = options.headers;
    }

    async createEndorsement(request, reply) {
        try {
            const reportService = new ReportService();
            const respToSend = await reportService.createEndorsement(request.body);
            return reply.status(Status.OK).send(respToSend);
        } catch (err) {
            console.log(ex);
            const { code, msg  } = ErrorHandler.constructCARDError(ex);
            return reply
                .status(code || Status.INTERNAL_SERVER_ERROR)
                .send(msg);
        }
    }

    async createBundlingDocument(request, reply) {
        try {
            const reportService = new ReportService();
            const respToSend = await reportService.createBundlingDocument(request.body);
            return reply.status(Status.OK).send(respToSend);
        } catch (err) {
            console.log(ex);
            const { code, msg } = ErrorHandler.constructCARDError(ex);
            return reply
                .status(code || Status.INTERNAL_SERVER_ERROR)
                .send(msg);
        }
    }

}

module.exports = ReportsHandler;