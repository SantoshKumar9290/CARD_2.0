const UpdateDocument = require('../services/updateDocumentServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require('../constants/errors');
// const { constructCARDError } = require("./errorHandler");
const { constructCARDError } = require("../handlers/errorHandler");


class updateDocumentHandler {
    constructor() {
        this.UpdateDocumentServices = new UpdateDocument();
    }

    getTranMajor = async (req,res) => {
        const reqQuery = req.query;
        console.log(reqQuery);
        if(reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status : false,
                    message : NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.UpdateDocumentServices.fetchTranMajor(reqQuery);
            // fetchTranMajor(reqQuery);
            let responseData = {
                status : true,
                message : "Success",
                code : "200",
                data : response
            };
            res.status(200).send({...responseData});
        }
        catch(ex) {
            console.error("UpdateDocumentHandler - getTranMajor || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status : false,
                    message : cardError
                }
            )
        }
    }


    getTranEC = async (req,res) => {
        const reqQuery = req.query;
        console.log(reqQuery);
        if(reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status : false,
                    message : NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.UpdateDocumentServices.getTranEC(reqQuery);
            // fetchTranMajor(reqQuery);
            let responseData = {
                status : true,
                message : "Success",
                code : "200",
                data : response
            };
            res.status(200).send({...responseData});
        }
        catch(ex) {
            console.error("UpdateDocumentHandler - getTranEC || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status : false,
                    message : cardError
                }
            )
        }
    }


    getRepresentativeDetails = async (req,res) => {
        const reqQuery = req.query;
        console.log(reqQuery);
        if(reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status : false,
                    message : NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.UpdateDocumentServices.getRepresentativeDetails(reqQuery);
            // fetchTranMajor(reqQuery);
            let responseData = {
                status : true,
                message : "Success",
                code : "200",
                data : response
            };
            res.status(200).send({...responseData});
        }
        catch(ex) {
            console.error("UpdateDocumentHandler - getRepresentativeDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status : false,
                    message : cardError
                }
            )
        }
    }


    
    getTranSched = async (req,res) => {
        const reqQuery = req.query;
        console.log(reqQuery);
        if(reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status : false,
                    message : NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.UpdateDocumentServices.getTranSched(reqQuery);
            // fetchTranMajor(reqQuery);
            let responseData = {
                status : true,
                message : "Success",
                code : "200",
                data : response
            };
            res.status(200).send({...responseData});
        }
        catch(ex) {
            console.error("UpdateDocumentHandler - getTranSched || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status : false,
                    message : cardError
                }
            )
        }
    }



    getLinkDocuments = async (req,res) => {
        const reqQuery = req.query;
        console.log(reqQuery);
        if(reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status : false,
                    message : NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.UpdateDocumentServices.getLinkDocuments(reqQuery);
            // fetchTranMajor(reqQuery);
            let responseData = {
                status : true,
                message : "Success",
                code : "200",
                data : response
            };
            res.status(200).send({...responseData});
        }
        catch(ex) {
            console.error("UpdateDocumentHandler - getLinkDocuments || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status : false,
                    message : cardError
                }
            )
        }
    }


    
updateTranECFIRMS = async (req,res) => {
    const reqQuery = req.query;
    console.log(reqQuery);
    if(reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.updateTranECFIRMS(reqQuery);
        // fetchTranMajor(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - updateTranECFIRMS || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
  }
  
  updateTranEC = async (req,res) => {
    const reqQuery = req.body;
    console.log(reqQuery);
    if(reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null)  {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.updateTranEC(reqQuery);
        // fetchTranMajor(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - updateTranEC || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
  }
  
  updateTransched = async (req,res) => {
    const reqQuery = req.body;
    console.log(reqQuery);
    if(reqQuery?.SR_CODE == null || reqQuery?.BOOK_NO == null || reqQuery?.REG_YEAR == null || reqQuery?.DOCT_NO == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.updateTransched(reqQuery);
        // fetchTranMajor(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - updateTransched || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
  }
  
  updateTranLinkdocumentdetails = async (req,res) => {
    const reqQuery = req.query;
    console.log(reqQuery);
    if(reqQuery?.C_SRCD == null || reqQuery?.C_BNO == null || reqQuery?.C_REGYEAR == null || reqQuery?.C_DOCTNO == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.updateTranLinkdocumentdetails(reqQuery);
        // fetchTranMajor(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - updateTranLinkdocumentdetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
  }


  //--------------EditIndex1983-------------//

getEIODBASEdetails  = async (req,res) => {
    const reqData = req.query;
    if(reqData?.SR_CODE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.getEIODBASEdetails(reqData);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - getEIODdetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}

getEIODBASEONSTATUSdetails = async (req,res) => {
    const reqData = req.query;
    if(reqData?.SR_CODE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.getEIODBASEONSTATUSdetails(reqData);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - getEIODBASEONSTATUSdetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}

getEIODdetails = async (req,res) => {
    const reqData = req.query;
    if(reqData?.SR_CODE == null || reqData?.REG_YEAR == null || reqData?.DOCT_NO == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.getEIODdetails(reqData);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - getEIODdetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
}

requestEditEIODDoctDetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.requestEditEIODDoctDetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Inserted"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - requestEditEIODDoctDetailsHandler || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }
  
  UpdateDrStatusOnEIODDetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.UpdateDrStatusOnEIODDetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - UpdateDrStatusOnEIODDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }
  
  getEIODSRPDFdetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.getEIODSRPDFdetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - UpdateDrStatusOnEIODDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }

UpdateFreezeEIODDetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.UpdateFreezeEIODDetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - UpdateFreezeEIODDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }
  updateEIODetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.updateEIODetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - updateEIODetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }
  updateEIODLINKetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.updateEIODLINKetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - updateEIODLINKetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }
  
  deleteEIODPartyDetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.deleteEIODPartyDetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows deleted"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - deleteEIODPartyDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }
  deleteEIODPropertyDetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.deleteEIODPropertyDetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows deleted"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - deleteEIODPropertyDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }
deleteEIODLinkDetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.deleteEIODLinkDetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows deleted"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - deleteEIODLinkDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }



  //----Edit Index New Functionality-Esign Integration API'S------------------------//
  FetchPartiesColNames = async (req,res) => {
    const reqQuery = req.query;
    try {
        let response = await this.UpdateDocumentServices.FetchPartiesColNames(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - FetchPartiesColNames || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}
 fetchPartiesColNames = async (req,res) => {
    const reqQuery = req.body;
    const requiredFields = ['SR_CODE', 'BOOK_NO', 'REG_YEAR', 'DOCT_NO'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
        let response = await this.UpdateDocumentServices.fetchPartiesColNames(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - FetchPartiesColNames || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}
GetRequestForm = async (req,res) => {
    const reqQuery = req.body;
    const requiredFields = ['SR_CODE', 'BOOK_NO', 'REG_YEAR', 'DOCT_NO'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
   
    try {
        let response = await this.UpdateDocumentServices.GetRequestDeatils(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - GetRequestForm || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}
SubmitRequestFormEdit = async (req,res) => {
    const reqBody = req.body;
    const requiredFields = ['SR_CODE', 'BOOK_NO', 'REG_YEAR', 'DOCT_NO', 'RDOCT_NO', 'RYEAR', 'EVENT'];
    for (let field of requiredFields) {
        if (reqBody[field] === undefined || reqBody[field] === null || reqBody[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
        let response = await this.UpdateDocumentServices.SubmitRequestFormEditIndex(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response+" Rows Updated"
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - updateEIODLINKetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }
  getEditIndexMisReport = async (req,res) => {
    const reqQuery = req.query;
    const requiredFields = ['SR_CODE', 'FROM_DATE', 'TO_DATE', 'STATUS'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
        let response = await this.UpdateDocumentServices.getEditIndexMisReport(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - GetRequestForm || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}

  generateRequestEditIndexPDF = async (req,res) => {
    const reqQuery = req.body;
    const requiredFields = ['SR_CODE', 'BOOK_NO', 'REG_YEAR', 'DOCT_NO'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
        let response = await this.UpdateDocumentServices.generateRequestEditIndexPDFSrvc(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
        // res.set({
        //     'Content-Type': 'application/pdf',
        //     'Content-Disposition': 'inline; filename="document.pdf"',
        //   });
        //   res.send(response);
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - generateEditIndexPDF || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
}
  
  getEditIndexSRPDFdetails = async (req,res) => {
    const reqBody = req.body;
    console.log(reqBody);
    if(reqBody == null ) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.getEditIndexSRPDFdetails(reqBody);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - getEditIndexSRPDFdetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
  }

  //RP
  generateEditIndexPDF = async (req,res) => {
    const reqQuery = req.body;
    const requiredFields = ['SR_CODE', 'BOOK_NO', 'REG_YEAR', 'DOCT_NO'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
        let response = await this.UpdateDocumentServices.generateEditIndexPDFSrvc(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
        // res.set({
        //     'Content-Type': 'application/pdf',
        //     'Content-Disposition': 'inline; filename="document.pdf"',
        //   });
        //   res.send(response);
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - generateEditIndexPDF || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError.message
            }
        )
    }
}
editIndexEsignStatus = async(req,res)=>{
    const reqBody = req.body;
    const requiredFields = ['SR_CODE', 'BOOK_NO', 'REG_YEAR', 'DOCT_NO'];
    for (let field of requiredFields) {
        if (reqBody[field] === undefined || reqBody[field] === null || reqBody[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
      let response = await this.UpdateDocumentServices.editIndexEsignStatusSrvc(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("UpdateDocumentHandler - editIndexEsignStatus || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }
 
 
  geteditIndexEsignDoct = async(req,res)=>{
    const reqBody = req.body;
    const requiredFields = ['SR_CODE', 'BOOK_NO', 'REG_YEAR', 'DOCT_NO'];
    for (let field of requiredFields) {
        if (reqBody[field] === undefined || reqBody[field] === null || reqBody[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
      let response = await this.UpdateDocumentServices.geteditIndexEsignDoctSrvc(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("UpdateDocumentHandler - editIndexEsignStatus || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }
 
 
  editIndexEsign = async(req,res)=>{
    const reqBody = req.body;
    const reqParams = req.params.type;
    if(reqBody?.SR_CODE == null || reqBody?.DOCT_NO == null || reqBody?.REG_YEAR == null || reqBody?.BOOK_NO == null || reqBody?.REFERENCE_ID == null || reqParams == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
      let response = await this.UpdateDocumentServices.editIndexEsignSrvc(reqBody, reqParams);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("UpdateDocumentHandler - editIndexEsign || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }
 
 
  addEditIndexData = async(req,res)=>{
    const reqBody = req.body;
    if(reqBody?.SR_CODE == null || reqBody?.DOCT_NO == null || reqBody?.REG_YEAR == null || reqBody?.BOOK_NO == null || reqBody?.REFERENCE_ID == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
      let response = await this.UpdateDocumentServices.addEditIndexDataSrvc(reqBody);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("UpdateDocumentHandler - editIndexEsign || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }

  getListVillagesR = async(req,res) => {
    const reqQuery = req.query;
    const requiredFields = ['srCode'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try{
        let response = await this.UpdateDocumentServices.getListVillagesRSrvc(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("UpdateDocumentHandler - getListVillagesR || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
} 
getListVillagesU = async(req,res) => {
    const reqQuery = req.query;
    const requiredFields = ['srCode'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try{
        let response = await this.UpdateDocumentServices.getListVillagesUSrvc(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("UpdateDocumentHandler - getListVillagesU || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getHabitations = async(req,res) => {
    const reqQuery = req.params;;
    const requiredFields = ['villageCode'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try{
        let response = await this.UpdateDocumentServices.getHabitationsSrvc(reqQuery);
        let responseData = {
            status:true, 
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({...responseData});	
    }catch(ex){
        console.error("UpdateDocumentHandler - getListVillagesU || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}


  getDocumentStatusDetails = async(req,res)=>{
    const reqQuery = req.query;
    const requiredFields = ['SR_CODE', 'BOOK_NO', 'REG_YEAR', 'DOCT_NO'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
      let response = await this.UpdateDocumentServices.getDocumentStatusDetailsSrvc(reqQuery);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
    };
    res.status(200).send({ ...responseData });
} catch (ex) {
    console.error("UpdateDocumentHandler - getDocumentStatusDetails || Error :", ex);
    const cardError = constructCARDError(ex);
    return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
            status: false,
            message: cardError.message
        }
    );
}
  }

  getTranDir = async (req,res) => {
    const reqQuery = req.query;
    if(reqQuery?.TRAN_MAJ_CODE == null || reqQuery?.TRAN_MIN_CODE == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
            {
                status : false,
                message : NAMES.VALIDATION_ERROR
            }
        );
        return;
    }
    try {
        let response = await this.UpdateDocumentServices.fetchTranDir(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - getTranDir || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}
 
getEditIndexMisReportInitial = async (req,res) => {
    const reqQuery = req.query;
    const requiredFields = ['SR_CODE', 'FROM_DATE', 'TO_DATE'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
        let response = await this.UpdateDocumentServices.getEditIndexMisReportInitial(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("UpdateDocumentHandler - getEditIndexMisReportInitial || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}
getEditIndexMISPdfReport = async (req,res) => {
    const reqQuery = req.query;
    const requiredFields = ['SR_CODE', 'FROM_DATE', 'TO_DATE'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
        let response = await this.UpdateDocumentServices.getEditIndexMISPdfReport(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("getEditIndexMISPdfReport - getEditIndexMISPdfReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}

deleteTempLinkDocument = async (req,res) => {
    const reqQuery = req.query;
    const requiredFields = ['ROWID'];
    for (let field of requiredFields) {
        if (reqQuery[field] === undefined || reqQuery[field] === null || reqQuery[field] === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                status: false,
                message: `Validation Error: '${field}' is required`
            });
            return;
    }}
    try {
        let response = await this.UpdateDocumentServices.deleteTempLinkDocumentSrvc(reqQuery);
        let responseData = {
            status : true,
            message : "Success",
            code : "200",
            data : response
        };
        res.status(200).send({...responseData});
    }
    catch(ex) {
        console.error("updateDocumentHandler - deleteTempLinkDocument || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status : false,
                message : cardError
            }
        )
    }
}


    }

module.exports = updateDocumentHandler;