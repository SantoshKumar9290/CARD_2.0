const RefuseServices = require("../services/refuseServices");
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const CARDError = require("../errors/customErrorClass");
const { constructCARDError } = require("./errorHandler");
const {
  encryptWithAESPassPhrase,
  decryptWithAESPassPhrase,
} = require("../utils/index");
class refusehandler {
  constructor() {
    this.refuseservices = new RefuseServices();
  }
  refuseDoc = async (req, res) => {
    const reqData = req.query;
    if (
      reqData.srCode == null ||
      reqData.bookNo == null ||
      reqData.regYear == null
    ) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
        status: false,
        message: NAMES.VALIDATION_ERROR,
      });
      return;
    }
    try {
      let response = await this.refuseservices.refuseDocument(reqData);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response,
      };
      // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
      // responseData.hash = hash;
      res.status(200).send({ ...responseData });
    } catch (ex) {
      console.error("refuseHandlers - refuseDoc || Error :", ex);
      const pdeError = constructCARDError(ex);
      return res.status(NAMES_STATUS_MAPPINGS[pdeError.name]).send({
        status: false,
        message: pdeError.message,
      });
    }
  };
  generateDocument = async (req, res) => {
    const qParams = req.query;
    if (qParams.SR_CODE == null || qParams.BOOK_NO == null || qParams.REG_YEAR == null || qParams.DOCT_NO == null) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        {
          status: false,
          message: NAMES.VALIDATION_ERROR
        }
      );
      return;
    }
    try {
      let response = await this.refuseservices.generateDocument(qParams);
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
      console.error("refuseHandler - generateDocument || Error :", ex);
      const cardError = constructCARDError(ex);
      return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
          status: false,
          message: cardError.message
        }
      );
    }
  }
  getcoordinatesdata = async (req, res) => {
    const qParams = req.query;
    if (qParams.SR_CODE == null || qParams.BOOK_NO == null || qParams.REG_YEAR == null || qParams.DOCT_NO == null) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        {
          status: false,
          message: NAMES.VALIDATION_ERROR
        }
      );
      return;
    }
    try {
      let response = await this.refuseservices.getcoordinatesdata(qParams);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
      };
      console.log('Handler', responseData);
      res.status(200).send({ ...responseData });
    } catch (ex) {
      console.error("CashPayableHandler - getChallanDetails || Error :", ex);
      const cardError = constructCARDError(ex);
      return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
          status: false,
          message: cardError.message
        }
      );
    }
  }
  refuseDocrepresent = async (req, res) => {
    const reqData = req.query;
    if (
      reqData.srCode == null ||
      reqData.bookNo == null ||
      reqData.regYear == null
    ) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
        status: false,
        message: NAMES.VALIDATION_ERROR,
      });
      return;
    }
    try {
      let response = await this.refuseservices.refuseDocrepresent(reqData);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response,
      };
      // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
      // responseData.hash = hash;
      res.status(200).send({ ...responseData });
    } catch (ex) {
      console.error("refuseHandlers - refuseDocrepresent || Error :", ex);
      const pdeError = constructCARDError(ex);
      return res.status(NAMES_STATUS_MAPPINGS[pdeError.name]).send({
        status: false,
        message: pdeError.message,
      });
    }
  };
  pendingesignlist = async (req, res) => {
    const reqData = req.query;
    if (
      reqData.SR_CODE == null ||
      reqData.DOCT_NO == null ||
      reqData.REG_YEAR == null || reqData.BOOK_NO == null
    ) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
        status: false,
        message: NAMES.VALIDATION_ERROR,
      });
      return;
    }
    try {
      let response = await this.refuseservices.pendingEsignList(reqData);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response,
      };
      // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
      // responseData.hash = hash;
      res.status(200).send({ ...responseData });
    } catch (ex) {
      console.error("refuseHandlers - pendingEsignList || Error :", ex);
      const pdeError = constructCARDError(ex);
      return res.status(NAMES_STATUS_MAPPINGS[pdeError.name]).send({
        status: false,
        message: pdeError.message,
      });
    }
  };

  getrdoctnoPendingNo = async (req, res) => {
    const reqData = req.query;
    if (
      reqData.SR_CODE == null || reqData.DOCT_NO == null || reqData.REG_YEAR == null || reqData.BOOK_NO == null
    ) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
        status: false,
        message: NAMES.VALIDATION_ERROR,
      });
      return;
    }
    try {
      let response = await this.refuseservices.getrdoctnoPendingNo(reqData);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response,
      };
      // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
      // responseData.hash = hash;
      res.status(200).send({ ...responseData });
    } catch (ex) {
      console.error("refuseHandlers - getrdoctnoPendingNo || Error :", ex);
      const pdeError = constructCARDError(ex);
      return res.status(NAMES_STATUS_MAPPINGS[pdeError.name]).send({
        status: false,
        message: pdeError.message,
      });
    }
  };
  pdfpreview = async (req, res) => {
    const reqData = req.query;
    if (
      reqData.SR_CODE == null ||
      reqData.DOCT_NO == null ||
      reqData.REG_YEAR == null || reqData.BOOK_NO == null
    ) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
        status: false,
        message: NAMES.VALIDATION_ERROR,
      });
      return;
    }
    try {
      const response = await this.refuseservices.pdfpreviewSrvc(reqData);
      res.setHeader('Content-Type', 'application/pdf');
      res.status(200).send(response);
    } catch (ex) {
      console.error("Error in pdfpreview:", ex);
      const pdeError = constructCARDError(ex);
      res.status(NAMES_STATUS_MAPPINGS[pdeError.name]).send({
        status: false,
        message: pdeError.message,
      });
    }
  };
  getRdocstatus = async (req,res)=>{
    const reqBody = req.query;
    if(reqBody.SR_CODE == null || reqBody.BOOK_NO == null || reqBody.DOCT_NO == null || reqBody.REG_YEAR == null){
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status: false,
                message: NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try{
        let response = await this.refuseservices.getRdocstatus(reqBody);
        let responseData = {
            status:true,
            message: "Success",
            code: "200",
            data: response
        };
        // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
        // responseData.hash = hash;
        res.status(200).send({...responseData});    
    }catch(ex){
        console.error("refuseHandlder - getRdocstatus || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
  }
  verifyApplicationExistance = async(req, res) => {
    const reqBody = req.query;
    if(reqBody.ID == null){
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        {
            status: false,
            message: NAMES.VALIDATION_ERROR
        }
      );
      return;
    }
    try{
      let response = await this.refuseservices.verifyApplicationExistance(reqBody);
      let responseData = {
          status:true,
          message: "Success",
          code: "200",
          data: response
      };
      res.status(200).send({...responseData});    
    }catch(ex){
      console.error("refuseHandlder - verifyApplicationExistance || Error :", ex);
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
module.exports = refusehandler;