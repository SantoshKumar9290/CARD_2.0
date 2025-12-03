const misService = require('../services/misService');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const axios = require('axios');
const FormData = require('form-data');
const {cdmaHostURL,cdmaAPIs}= require("../constants/CDMAConstants")

class MISHandler {
    constructor() {
        this.misHandlerService = new misService();
    }
    getMisDetails = async (req, res) => {
        const reqQuery = req.query;
        try {
            let response = await this.misHandlerService.getMisDetailsSrvc(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("CCHandler - getSroDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }
    getMisDevelop = async (req, res) => {
        const District = req.query.District;
        const srocode = req.query.srocode;
        const fromdate = req.query.fromdate;
        const todate = req.query.todate;
        const parameter = req.query.parameter;
 
        try {
            let response = await this.misHandlerService.getMisOracleSrvc(District, srocode, fromdate, todate, parameter);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getDrillData = async (req, res) => {
        const srocode = req.query.srocode;
        const fromdate = req.query.fromdate;
        const todate = req.query.todate;
        const parameter = req.query.parameter;
        try {
            let response = await this.misHandlerService.getDrillDataSrvc(srocode, fromdate, todate, parameter);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getDrListData = async (req, res) => {
        
        try {
            let response = await this.misHandlerService.getDrListDataSrvc();
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }



    getanywhere = async (req, res) => {
        const reqData = req.query;
        try {
            let response = await this.misHandlerService.getanywhere(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getProhb = async (req, res) => {
        const reqData = req.query;
        try {
            let response = await this.misHandlerService.getProhb(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getanyDrilDown = async (req, res) => {  
        const reqData = req.query;
        try {
            let response = await this.misHandlerService.getanyDrilDown(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getProhbData = async (req, res) => {  
        const reqData = req.query;
        try {
            let response = await this.misHandlerService.getProhbData(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getSROcodeData = async (req, res) => {
        const parameter = req.query.parameter;
        try {
            let response = await this.misHandlerService.getSROcodeListDataSrvc(parameter);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getMutationStatus = async (req, res) => {
        const srocode = req.query.srocode;
        const fromdate = req.query.fromdate;
        const todate = req.query.todate;
        const parameter = req.query.parameter;
        try {
            let response = await this.misHandlerService.getMutationStatusSrvc(srocode,fromdate,todate,parameter);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getMISDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 documentdetailsReport = async (req, res) => {  
    const reqData = req.query;
    try {
        let response = await this.misHandlerService.documentdetailsReport(reqData);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("MISHandler - getMISDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getnatureofdoclist = async (req, res) => {
    try {
        let response = await this.misHandlerService.getnatureofdoclist();
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("MISHandler - getMISDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
getTopNDocuments = async (req, res) => {
    const reqData = req.query;
    console.log(reqData);
    try {
        let response = await this.misHandlerService.getTopNDocumentsSrvc(reqData);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
     } catch (ex) {
        console.error("MISHandler - getTopNDocuments || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getTopNDocumentsDetails = async (req, res) => {
    const reqData = req.query;
    try {
        let response = await this.misHandlerService.getTopNDocumentsDetailsSrvc(reqData);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("MISHandler - getTopNDocumentsDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getSelectedDocumentDetails = async (req, res) => {
    const reqData = req.query;
    try {
        let response = await this.misHandlerService.getSelectedDocumentDetails(reqData);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("MISHandler - getSelectedDocumentDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

mvAssitanceReport = async (req, res) => {  
    const reqData = req.body;
    try {
        let response = await this.misHandlerService.mvAssitanceReport(reqData);
        // let responseData = {
        //     status: true,
        //     message: "Success",
        //     code: "200",
        //     data: response
        // };
        // res.status(200).send({ ...responseData });

        if(response.length === 0){
            res.status(404).send({
                status: false,
                message: "No data found",
                code: "404"
            })
            return;
        }else{
        // let responseData = {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
   
            // Send the PDF buffer in the response
            res.send(response);

    }
    }  catch (ex) {
        console.error("MISHandler - mvAssitanceReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}
pdfpreview = async (req, res) => {
    const reqData = req.query;
    if (
      reqData.SR_CODE == null ||
      reqData.REG_YEAR == null  || reqData.REQ_NO== null
    ) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
        status: false,
        message: NAMES.VALIDATION_ERROR,
      });
      return;
    }
    try {
      const response = await this.misHandlerService.pdfpreviewSrvc(reqData);
      res.setHeader('Content-Type', 'application/pdf');
      res.status(200).send(response);
    } catch (ex) {
      console.error("Error in pdfpreview:", ex);
      const cardError = constructCARDError(ex);
      res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
        status: false,
        message: cardError.message,
      });
    }
  };
  pendingesignlist = async (req, res) => {
    const reqData = req.query;
    if (
      reqData.SR_CODE == null ||
      reqData.REQ_NO == null ||
      reqData.REG_YEAR == null 
    ) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
        status: false,
        message: NAMES.VALIDATION_ERROR,
      });
      return;
    }
    try {
      let response = await this.misHandlerService.pendingEsignList(reqData);
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
      console.error("misHandler - pendingEsignList || Error :", ex);
      const cardError = constructCARDError(ex);
      return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
        status: false,
        message: cardError.message,
      });
    }
  };
  getmvacoordinatesdata = async (req, res) => {
    const qParams = req.query;
    if (qParams.SR_CODE == null || qParams.REG_YEAR == null || qParams.REQ_NO == null) {
      res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        {
          status: false,
          message: NAMES.VALIDATION_ERROR
        }
      );
      return;
    }
    try {
      let response = await this.misHandlerService.getmvacoordinatesdata(qParams);
      let responseData = {
        status: true,
        message: "Success",
        code: "200",
        data: response
      };
      res.status(200).send({ ...responseData });
    } catch (ex) {
      console.error("misHandler - getmvacoordinatesdata || Error :", ex);
      const cardError = constructCARDError(ex);
      return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
        {
          status: false,
          message: cardError.message
        }
      );
    }
  }
  getTopSelectedDocumentDetails = async (req, res) => {
    const reqData = req.query;
    try {
        let response = await this.misHandlerService.getTopSelectedDocumentDetails(reqData);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("MISHandler - getTopSelectedDocumentDetails || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getChallansReport = async (req, res) => {
    const reqData = req.query;
    if (reqData.SR_CODE == null || reqData.MONTH == null || reqData.YEAR == null || reqData.SR_CODE == '' || reqData.MONTH == '' || reqData.YEAR == '') {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
          {
            status: false,
            message: NAMES.VALIDATION_ERROR
          }
        );
        return;
      }
    try {
        let response = await this.misHandlerService.getChallanReportSrvc(reqData);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("MISHandler - getChallansReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getChallansReportgeneratePDF = async (req, res) => {
    const reqData = req.body;
    if (reqData.SR_CODE == null || reqData.MONTH == null || reqData.YEAR == null) {
        res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
          {
            status: false,
            message: NAMES.VALIDATION_ERROR
          }
        );
        return;
      }
    try {
        let response = await this.misHandlerService.getChallanReportgeneratePDFSrvc(reqData);
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("MISHandler - getChallansReport || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

getAnywhereDocStatus = async (req, res) => {
    const requiredParamsObj = {
        APP_ID: req.query.APP_ID,
        JURISDICTION:req.query.JURISDICTION
    }
    for(let key in requiredParamsObj){
        if(!req.query[key] ){
            return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                  status: false,
                  message: NAMES.VALIDATION_ERROR
                }
              );
        }
    }
    const reqData = req.query;
    try {      
        let response = await this.misHandlerService.getAnywhereDocStatusSrvc(reqData);
                // if (Array.isArray(response) && response.length === 0) {
        //     res.status(200).send({
        //         status: false,
        //         message: "This document is not available.",
        //         data:[{message: "This document is not available."}]
        //     });
        //     return;
        // }
        let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response
        };
        res.status(200).send({ ...responseData });
    } catch (ex) {
        console.error("MISHandler - getAnywhereDocStatus || Error :", ex);
        const cardError = constructCARDError(ex);
        return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
            {
                status: false,
                message: cardError.message
            }
        );
    }
}

    UrbanTokenGeneration = async (req, res) => {
        try {
            let data = new FormData();
            data.append('grant_type', 'password');
            data.append('username', process.env.URBAN_USERNAME);
            data.append('password', process.env.URBAN_PASSWORD);
            const credentials = `${process.env.URBAN_AUTH_USERNAME}:${process.env.URBAN_AUTH_PASSWORD}`;
            const base64Credentials = Buffer.from(credentials).toString('base64');
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                // url: process.env.URBAN_BASE_URL + '/oauth/token?ulbCode=' + req.ulbCode,
                url: `${cdmaHostURL}${cdmaAPIs.tokenGeneration}${req.ulbCode}`,
                headers: {
                    'Referer': `${process.env.URBAN_SERVER_IP}`,
                    'Authorization': `Basic ${base64Credentials}`,
                },
                data: data
            };
            let response = await axios(config);
            console.log(response)
            if (req.flag) {
                return response.data
            } else {
                return res.status(200).send(response.data);
            }
        } catch (ex) {
            if (req.flag) {
                return ex.message
            } else {
                return res.status(400).send({
                    status: false,
                    message: ex.message
                })
            }
        }
    }

    getSearchAssessmentNumberWithDoorNumberHandler = async (req,res) =>{
        const requiredParams = {
            ulbCode:req.query.ulbCode,
            doorNo:req.query.doorNo
        }
        
        for(let key in requiredParams){
            if(!requiredParams[key]){
                return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                    {
                        status: false,
                        message: NAMES.VALIDATION_ERROR
                    }
                );
            }
        }

        const data=JSON.stringify(requiredParams)
        
        try{
            let token = await this.UrbanTokenGeneration({flag:1, ulbCode:requiredParams.ulbCode})
            console.log("token after call", token)
            if(typeof token !== 'string'){
                token = token.access_token
                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    // url: process.env.URBAN_BASE_URL + '/v1.0/property/search/doorno',
                    url: `${cdmaHostURL}${cdmaAPIs.searchByDoorNumber}`,

                    headers: {
                        'Referer': `${process.env.URBAN_SERVER_IP}`,
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    data: data
                };

                let response = await axios.request(config);
                if (response?.data) {
                const finlResponse = response.data.filter((obj)=>{return obj.houseNo!=='N/A'&& obj.houseNo && obj.houseNo.startsWith(req.query.doorNo)});
                return res.status(200).send({
                    status: true,
                    message: "Success",
                    code: "200",
                    data: finlResponse, 
                });
            } else {
                return res.status(404).send({
                    status: false,
                    message: "No data found",
                    code: "404",
                    data: [],
                });
            }
            }else{
                return res.status(400).send(`Token Generation failed, ${token}`)
            }
        }catch(ex) {
            if (req.flag) {
                return ex.message
            } else {
                return res.status(400).send({
                    status: false,
                    message: ex.message
                })
            }
        }
    }

    getUlbNameHandler = async (req, res) => {
        const reqData = req.query;
        try {
            let response = await this.misHandlerService.getUlbNameService(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("MISHandler - getUlbNameHandler || Error :", ex);
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
 
module.exports = MISHandler;