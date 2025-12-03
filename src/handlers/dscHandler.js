const DscService = require('../services/dscServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');



class DscHandler {
    constructor() {
        this.dscHandlerService = new DscService();
    };

    getDscToken = async (req, res) => {
        try {
            let response = await this.dscHandlerService.getDscToken();
            res.status(200).send({...response});	
        } catch (ex) {
            console.error("dscHandler - getDscToken || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    signPdf = async (req, res) => {
        try {
            await this.dscHandlerService.signPdfSrvc(req.body);
            let responseData = {
				status:true, 
				message: "Success",
				code: "200",
				data: req.body
			};
			res.status(200).send({...responseData});	
        } catch (ex) {
            console.error("dscHandler - signPdf || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message,
                    data: req.body
                }
            );
        }
    }

    uploadFile = async (req, res) => {
        try {
            let response = await this.dscHandlerService.uploadFile(req.body);
            res.status(200).send({
                status: true,
                message: "Success",
                code: "200",
                data: response
            });
        } catch (ex) {
            console.error("dscHandler - uploadFile || Error :", ex);
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
module.exports = DscHandler;





