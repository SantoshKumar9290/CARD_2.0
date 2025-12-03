const thumbImprressionServices=require('../services/thumbImpressionServices')
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');


class thumbImprressioNHandler {
    constructor() {
        this.thumbImprressionHandlerService = new thumbImprressionServices();
    }


     insertTableHandler = async (req, res) => {
        const reqBody = req.body;
        try {
        
        let response  = await this.thumbImprressionHandlerService.insertTableService(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("thumbImprressionHandler - insertTable || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
}
generateDocumentHandler = async (req, res) => {
    const reqBody = req.query;
    try {
      let response = await this.thumbImprressionHandlerService.generateDocumentService(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("thumbImprressionHandler - generateDocument || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }

  getCoordinatesDataHandler = async (req, res) =>{
    const reqBody = req.query;
    try {
      let response = await this.thumbImprressionHandlerService.getCoordinatesData(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("thumbImprressionHandler - Coordinatesdata || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }


  updatePdfHandler = async(req,res)=>{
    const reqBody = req.query;
    try {
      let response = await this.thumbImprressionHandlerService.updatePdf(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("thumbImprressionHandler - updatePdf || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }

  pendingEsignList = async(req,res)=>{
    const reqBody = req.query;
    try {
      let response = await this.thumbImprressionHandlerService.pendingEsignList(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("thumbImprressionHandler - pending esign || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }


  pdfPreview = async(req,res)=>{
    const reqBody = req.query;
    try {
      let response = await this.thumbImprressionHandlerService.PDFPreview(reqBody);
    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(response);
} catch (ex) {
    console.error("thumbImprressionHandler - pending esign || Error :", ex);
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
module.exports = thumbImprressioNHandler;