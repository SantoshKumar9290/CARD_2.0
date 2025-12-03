const DrJobService = require('../services/drJobServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase,decryptData,encryptData } = require('../utils/index');



class DrJobHandler {
    constructor() {
        this.drJobHandlerService = new DrJobService();
    };

    // getDocumentsdata = async (req, res) => {
    //     const qParams = req.query;
    //     if (qParams.srCode == null || qParams.regYear == null) {
    //         res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
    //             {
    //                 status: false,
    //                 message: NAMES.VALIDATION_ERROR
    //             }
    //         );
    //         return;
    //     }
    //     try {
    //         let response = await this.drJobHandlerService.getDocumentsDrSrvc(qParams);
    //         let responseData = {
    // 			status:true, 
    // 			message: "Success",
    // 			code: "200",
    // 			data: response
    // 		};
    // 		// let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
    // 		// responseData.hash = hash;
    // 		res.status(200).send({...responseData});
    // 	}catch(ex){
    // 		console.error("sro - getDocuments || Error :", ex);
    //         const cardError = constructCARDError(ex);
    //         return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
    //             {
    //                 status: false,
    //                 message: cardError.message
    //             }
    //         );
    //     }
    // }
    getDocumentsBySro = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getDocumentsSroSrvc(qParams);
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
            console.error("sro - getDocuments || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getDocumentsByDr = async (req, res) => {
        const qParams = req.query;
        if (qParams.DistrictCode == null || qParams.regYear == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getDocumentsDrSrvc(qParams);
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
            console.error("drjobs - getDocuments || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    saveDrJob = async (req, res) => {
        const reqBody = req.body;
// '${reqData.RESPONSE_BY}',TO_DATE('${reqData.RESPONSE_TIME}','DD-MM-YYYY'),${reqData.REQUEST_REASONS},'${reqData.STATUS}',${reqData.NEW_DOCTNO},'${reqData.REJECT_REASONS}',${reqData.REQ_NO})`;
			
        //  if(reqBody.REJECT_REASONS==null||reqBody.REQ_NO==null||reqBody.EVENT==null||reqBody.RESPONSE_BY==null||reqBody.NEW_DOCTNO==null||reqBody.RESPONSE_BY==null||reqBody.RESPONSE_TIME==null)
       try {
            let response = await this.drJobHandlerService.saveDrJobSrvc(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - saveDrJob || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    
    saveDrJobSrvcdoct = async (req, res) => {
        const reqBody = req.body;
// '${reqData.RESPONSE_BY}',TO_DATE('${reqData.RESPONSE_TIME}','DD-MM-YYYY'),${reqData.REQUEST_REASONS},'${reqData.STATUS}',${reqData.NEW_DOCTNO},'${reqData.REJECT_REASONS}',${reqData.REQ_NO})`;
			
        //  if(reqBody.REJECT_REASONS==null||reqBody.REQ_NO==null||reqBody.EVENT==null||reqBody.RESPONSE_BY==null||reqBody.NEW_DOCTNO==null||reqBody.RESPONSE_BY==null||reqBody.RESPONSE_TIME==null)
       try {
            let response = await this.drJobHandlerService.saveDrJobSrvcdoct(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - saveDrJob || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    InsertProceedingDetailsreject = async (req, res) => {
        const reqBody = req.body;
        // if(reqQuery?.SR_CD == null ){
		// 	res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
		// 		{
		// 			status: false,
		// 			message: NAMES.VALIDATION_ERROR
		// 		}
		// 	);
		// 	return;
        // };  
        try {
            let response = await this.drJobHandlerService.InsertProceedingDetailsreject(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - insertproceedingdetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    insertProceedingDetails = async (req, res) => {
        const reqBody = req.body;
        // if(reqQuery?.SR_CD == null ){
		// 	res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
		// 		{
		// 			status: false,
		// 			message: NAMES.VALIDATION_ERROR
		// 		}
		// 	);
		// 	return;
        // };  
        try {
            let response = await this.drJobHandlerService.InsertProceedingDetails(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - insertproceedingdetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    InsertRescanData = async (req, res) => {
        const reqBody = req.body;
        // console.log(req.query);
        //  if(qParams.SR_CODE == null || qParams.REG_YEAR == null || qParams.BOOK_NO == null || qParams.DOCT_NO == null){
        // 	res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
        // 		{
        // 			status: false,
        // 			message: NAMES.VALIDATION_ERROR
        // 		}
        // 	);
        // 	return;
        // };
        try {
          let response = await this.drJobHandlerService.InsertrescanData(reqBody);
          let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response,
          };
          res.status(200).send({ ...responseData });
        } catch (ex) {
          console.error("drJobHandler - insertrescandata || Error :", ex);
          const cardError = constructCARDError(ex);
          return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
            status: false,
            message: cardError.message,
          });
        }
      };
    
    getsrname = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CD == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getsrname(qParams);
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
            console.error("drJobHandler - getsrname || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    swapRNoHandler = async (req,res)=>{
		const qParams = req.query;
		if(qParams.srCode == null || qParams.bookNo == null || qParams.docNo == null || qParams.regYear == null){
			res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
				{
					status: false,
					message: NAMES.VALIDATION_ERROR
				}
			);
			return;
		}
		try{
			let response = await this.drJobHandlerService.swapRNoProcSvc(qParams);
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
			console.error("AssignHandlder - asignRegNoHandler || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
		}
	}
    getDrJobStatusbySroName = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_NAME == null||qParams.DR_CD==null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getDrJobStatusbySroName(qParams);
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
            console.error("drJobHandler - getDrJobStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getDrJobStatus = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null||qParams.DR_CD==null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getDrJobStatus(qParams);
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
            console.error("drJobHandler - getDrJobStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getDrJobStatusdata = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null||qParams.DR_CD==null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getDrJobStatusdata(qParams);
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
            console.error("drJobHandler - getDrJobStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getSrCode = async (req, res) => {
        const qParams = req.query;
        console.log(req.query);
        if (qParams.SR_CODE == null || qParams.DOC_RESCAN == null) {
          res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
            status: false,
            message: NAMES.VALIDATION_ERROR,
          });
          return;
        }
        try {
          let response = await this.drJobHandlerService.getSrCode(qParams);
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
          console.error("drJobHandler - getSrCode || Error :", ex);
          const cardError = constructCARDError(ex);
          return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
            status: false,
            message: cardError.message,
          });
        }
      };
    
    verifyDetailsStatus = async (req, res) => {
        const qParams = req.query;
        // if (qParams.SR_CODE == null||qParams.BOOK_NO==null||qParams.EVENT==null) {
        if (qParams.SR_CODE == null||qParams.BOOK_NO==null||qParams.REG_YEAR==null||qParams.RDOCT_NO==null||qParams.STATUS==null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.verifyDetailsStatus(qParams);
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
            console.error("verifydrjob status - verifydrjob status || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getSroJobRequestStatus = async (req, res) => {
        const qParams = req.query;
        // if (qParams.SR_CODE == null||qParams.BOOK_NO==null||qParams.EVENT==null) {
        if (qParams.SR_CODE == null||qParams.BOOK_NO==null||qParams.REG_YEAR==null||qParams.RDOCT_NO==null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getSroJobRequestStatus(qParams);
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
            console.error("sroJobHandler - getSroJobStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getSroJobStatus = async (req, res) => {
        const qParams = req.query;
        // if (qParams.SR_CODE == null||qParams.BOOK_NO==null||qParams.EVENT==null) {
        if (qParams.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getSroJobStatus(qParams);
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
            console.error("sroJobHandler - getSroJobStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    editIndexDREnable = async (req, res) => {
        const reqQuery = req.body;
        try {
            let response = await this.drJobHandlerService.editIndexDREnableSrvc(reqQuery);
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
            console.error("drJobHandler - EditIndexDREnable || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    
    UpdatestatusregdocBySro = async (req, res) => {
        const reqQuery = req.query;
        try {
            let response = await this.drJobHandlerService.UpdatestatusregdocBySro(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("sroJobHandler - Updatestatus for change regular document number || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    UpdatestatusByRescan = async (req, res) => {
        const reqQuery = req.query;
        try {
          let response = await this.drJobHandlerService.UpdatestatusByrescan(reqQuery);
          let responseData = {
            status: true,
            message: "Success",
            code: "200",
            data: response,
          };
          res.status(200).send({ ...responseData });
        } catch (ex) {
          console.error("drJobHandler - Updatestatus || Error :", ex);
          const cardError = constructCARDError(ex);
          return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
            status: false,
            message: cardError.message,
          });
        }
      };
    UpdatestatusBySro = async (req, res) => {
        const reqQuery = req.query;
        try {
            let response = await this.drJobHandlerService.UpdatestatusBySro(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("sroJobHandler - Updatestatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    
    UpdatestatusByDraccept = async (req, res) => {
        const reqQuery = req.query;
        try {
            let response = await this.drJobHandlerService.UpdatestatusByDraccept(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - Updatestatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    UpdatestatusByDr = async (req, res) => {
        const reqQuery = req.query;
        try {
            let response = await this.drJobHandlerService.UpdatestatusByDr(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - Updatestatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getSroCode= async (req, res) => {
            const qParams = req.query;
            if (qParams.SR_NAME == null) {
                res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                    {
                        status: false,
                        message: NAMES.VALIDATION_ERROR
                    }
                );
                return;
            }
            try {
                let response = await this.drJobHandlerService.getSroCode(qParams);
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
                console.error("drJobHandler - getregdocdetails || Error :", ex);
                const cardError = constructCARDError(ex);
                return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                    {
                        status: false,
                        message: cardError.message
                    }
                );
            }
        }
    getRegDocDetails = async (req, res) => {
        const qParams = req.query;
        if (qParams.sroCode == null || qParams.bookNo == null || qParams.doctNo == null || qParams.newdoctno == null || qParams.regYear == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.drJobHandlerService.getDrJobStatus(qParams);
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
            console.error("drJobHandler - getregdocdetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

//----Edit Index New Functionality-Esign Integration API'S------------------------//

    getDrJobStatusbySroNameForEditIdex = async (req, res) => {
        const qParams = req.query;
        for (let [key, value] of Object.entries(qParams)) {
            if (value === undefined || value === null || value === '') {
                res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                    status: false,
                    message: `Validation Error: '${key}' is required`
                });
                return;
            }
        }
        try {
            let response = await this.drJobHandlerService.getDrJobStatusbySroNameForEditIdex(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - getDrJobStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getSroJobStatusEditIndex = async (req, res) => {
        const qParams = req.query;
        for (let [key, value] of Object.entries(qParams)) {
            if (value === undefined || value === null || value === '') {
                res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                    status: false,
                    message: `Validation Error: '${key}' is required`
                });
                return;
            }
        }
        try {
            let response = await this.drJobHandlerService.getSroJobStatusEditIndex(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("sroJobHandler - getSroJobStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    rescanpdfpreviewHndlr = async (req, res) => {
        const reqData = req.query;
        if (reqData.SR_CODE == null || reqData.REG_YEAR == null  || reqData.BOOK_NO== null || reqData.DOCT_NO ==null  ) {
          res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
            status: false,
            message: NAMES.VALIDATION_ERROR,
          });
          return;
        }
        try {
          const response = await this.drJobHandlerService.rescanpdfpreviewSrvc(reqData);
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

      pendingEsignListHndlr = async (req, res) => {
        let qParams = req.query;  
        let decodedData = decodeURIComponent(qParams.data); 
        qParams = JSON.parse(decryptData(decodedData));   
           
        if (qParams.SR_CODE == null||qParams.BOOK_NO==null||qParams.REG_YEAR==null||qParams.DOCT_NO==null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }

        try {
            let response = await this.drJobHandlerService.pendingEsignListSRVC(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - pendingEsignListHndlr || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    rescanDrJobHndlr = async (req, res) => {
        const qParams = req.query;
        const requiredFields = [
            "BOOK_NO",
            "DOCT_NO",
            "REG_YEAR",
            "SR_CODE",
            "EMPL_ID",
            "EMPL_SRCD",
            "REQ_NO"
        ];
    
        for (let field of requiredFields) {
            if (qParams[field] === undefined || qParams[field] === null || qParams[field].trim() === '') {
                return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
                    status: false,
                    message: `Validation Error: '${field}' is required`
                });
        }
        }
        try {
            let response = await this.drJobHandlerService.rescanDrJobSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - rescanDrJobHndlr || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    saveRescanDrJob = async (req, res) => {
        const reqBody = req.body;
        if (!reqBody) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
       try {
            let response = await this.drJobHandlerService.saveScanDrJobSrvc(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - saveRescanDrJob || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

     getResubmitSignedDocument = async (req, res) => {
        let qParams = req.query;  
        let decodedData = decodeURIComponent(qParams.data); 
        qParams = JSON.parse(decryptData(decodedData));  

        if (qParams.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }

        try {
            let response = await this.drJobHandlerService.getResubmitSignedDocument(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - getResubmitSignedDocument || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    sroSignDocument = async (req, res) => {
        const reqBody = req.body;
        if (!reqBody) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }

        req.user;
        let sroCode = reqBody.SR_CODE;
        let employeeID = reqBody.EMPL_ID;
        if(!sroCode || sroCode.length == 0){
            reqBody.SR_CODE = req.user.SRO_CODE;
        }

        if(!employeeID || employeeID.length == 0){
            reqBody.EMPL_ID = req.user.EMPL_ID;
        }

       try {
            let response = await this.drJobHandlerService.sroSignDocument(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - sroSignDocument || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

     drSignDocument = async (req, res) => {
        const reqBody = req.body;
        if (!reqBody) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        req.user;
        let sroCode = reqBody.SR_CODE;
        let employeeID = reqBody.EMPL_ID;
        if(!sroCode || sroCode.length == 0){
            reqBody.SR_CODE = req.user.SRO_CODE;
        }

        if(!employeeID || employeeID.length == 0){
            reqBody.EMPL_ID = req.user.EMPL_ID;
        }

        try {
            let response = await this.drJobHandlerService.drSignDocument(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("drJobHandler - drSignDocument || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    resubmitPdfPreview = async (req, res) => {
        const reqData = req.query;
        if (reqData.SR_CODE == null || reqData.APP_ID ==null  ) {
          res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
            status: false,
            message: NAMES.VALIDATION_ERROR,
          });
          return;
        }
        try {
          const response = await this.drJobHandlerService.resubmitPdfPreview(reqData);
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

    getAnywhereeSignStatus = async (req, res) => {
        const reqData = req.query;
        if (reqData.ID == null ) {
          res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send({
            status: false,
            message: NAMES.VALIDATION_ERROR,
          });
          return;
        }
        try {
          const response = await this.drJobHandlerService.getAnywhereeSignStatus(reqData);
          res.status(200).send(response);
        } catch (ex) {
            console.error("drJobHandler - getAnywhereeSignStatus || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    };
}
module.exports = DrJobHandler;





