const esignPendingServices = require('../services/esignPendingServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');



class EsignPendingHandler {
    constructor() {
        this.esignPendingServices = new esignPendingServices();
    };
    getPendingEsign = async (req, res) => {
        const qParams = req.query;
        if (qParams.srCode == null || qParams.regYear == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.esignPendingServices.getEsignPending(qParams);
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
            console.error("PendingEsignHandler - getPendingEsign || Error :", ex);
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
module.exports = EsignPendingHandler;





