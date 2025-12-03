const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const { get } = require('lodash');
const { CODES } = require('../constants/appConstants');
const { returnCleanAddress, returnCleanSpecialCharacters, toBase64, formatDate,getValue } = require('../utils');
const checkSlipReportServices = require('./checkSlipReportServices');
const AutoMutationServices = require('../services/autoMutationService');
const cashServices = require('../services/cashServices');
const axios = require('axios');
const https = require('https');
const { xml2json } = require('xml-js');



const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});
class MutationServices {
    constructor() {
        this.orDao = new OrDao();
        this.checkSlip = new checkSlipReportServices();
        this.mutationServices = new AutoMutationServices();
        this.cashService = new cashServices();
    }

     getAdangalDetails = async (sryno, vgcode) => {
            try {
                console.log("url ====> ", `/pdeapi/v1/villages/pahaniDetails?sryno=${sryno}&vgcode=${vgcode}`);
                let result = await instance.get(`${process.env.PDE_HOST}/pdeapi/v1/villages/pahaniDetails?sryno=${sryno}&vgcode=${vgcode}`);
                if (get(result, 'data.status', false)) {
                    return result.data.data;
                } else {
                    return null;
                }
            } catch (err) {
                console.log("errror ====>", err)
                return null;
            }
        }

    generateAutomutationToken = async () => {
        try {
            let result = await axios.post(`${process.env.AUTOMUTATION_BASE_URL}/Token`, { 'un': process.env.LPM_UNAME, 'up': process.env.LPM_PASSWORD });
            return result.data;
        } catch (err) {
            console.log('error ===> token generation failed', err.message);
            return {};
        }
    }
        
      sendRequestForSubdivision = async (reqData) => {
            try {
                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: reqData.partition ? `${process.env.PARTITION_AUTOMUTATION_URL}` : `${process.env.AUTOMUTATION_URL}`,
                    headers: {
                        'Content-Type': 'text/xml;charset=UTF-8',
                        'Accept': '*/*',
                    },
                    data: reqData.data
                };
                let result = await axios.request(config);
                console.log(result.data);
                Logger.error(`Sub division failed for this request body ==> ${reqData.data} ===> ${result.data}`, '');
                console.log("req.body.flag :::::::", reqData.flag);
                if (reqData.flag) {
    
                    if (`${result.data}`.includes('<VillageCode>9999</VillageCode>')) {
                        if (!reqData.partition) {
                            return `${result.data}`.match(new RegExp('<SurveyNo>' + "(.*)" + '</SurveyNo>'))[1]
                        }
                        else {
                            return `${result.data}`.match(new RegExp('<OldSurveyNo>' + "(.*)" + '</OldSurveyNo>'))[1]
                        }
                    } else {
                        let jsonData = xml2json(result.data, { compact: true, spaces: 4 });
                        if (`${result.data}`.includes('AutoSubdivisionDetails')) {
                            let d = getValue(JSON.parse(jsonData), 'AutoSubdivisionDetails');
                            if (d) {
                                if (typeof d === 'object' && !Array.isArray(d) && Object.keys(d.KhataNo).length === 0) {
                                    console.log("return null 123:::::::");
                                    return null;
                                } else {
                                    console.log("return d 234:::::::", d);
                                    return Array.isArray(d) ? d : [d];
                                }
                            }
                            console.log("return d 123:::::::", d);
                            return d;
                        } else {
                            console.log("return null 123:::::::");
                            return null;
                        }
                    }
                } else {
                    // return res.status(200).send(JSON.stringify(result.data));
                    return JSON.stringify(result.data);
                }
    
            } catch (err) {
                console.log('sub error ==============>', err)
                console.log(err.message);
                if (reqData.flag) {
                    return null;
                } else {
                    // return res.status(400).send({
                    //     message: "Sub Division api failed",
                    // })
                    throw Error ('Sub Division api failed')
                }
            }
        }

     postAutomutationData = async (data, token, transactionType) => {
        const PartitionLPMUrl = `${process.env.AUTOMUTATION_BASE_URL}/RegistrationService/AMP`
        const SaleGiftLPMUrl = `${process.env.AUTOMUTATION_BASE_URL}/RegistrationService/AM`
        console.log(data)
        try {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: transactionType === "4" ? PartitionLPMUrl : SaleGiftLPMUrl ,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                'data': JSON.stringify(data)
            };

            let result = await axios.request(config);
            if (result.data.Code === '100') {
                console.log(`successfull`)
            } else {
                console.log(result.data)
                console.log(`failure`)
            }
            return result.data;
        } catch (err) {
            console.log("MutationServices - PostAutomutationData || Error :", err.message);
            return get(err, 'response.data', {})
        }
    }

      updateMutationSentData = async (data) => {
            try {
                let bindParams ={
                    SR_CODE:data.SR_CODE,
                    BOOK_NO : data.BOOK_NO,
                    REG_YEAR: data.REG_YEAR,
                    DOCT_NO: data.DOCT_NO,
                    TYPE:data.TYPE,
                    S_LP_NO : data.S_LP_NO
                }
                // let query = `SELECT * FROM MUTATION_SENT_CR WHERE SR_CODE=${data.SR_CODE} AND DOCT_NO=${data.DOCT_NO} and REG_YEAR=${data.REG_YEAR}`;
                // let resultData = await this.orDao.oDBQueryService(query);
                let REQ_BODY = Buffer.from(data.REQ_BODY, 'utf8');
                let RESPONSE = Buffer.from(data.RESPONSE, 'utf8');
    
                // if (resultData.length) {
                //     let q = `UPDATE srouser.mutation_sent_cr SET SR_CODE=:SR_CODE,BOOK_NO=:BOOK_NO,DOCT_NO=:DOCT_NO,REG_YEAR=:REG_YEAR,TYPE=:TYPE,S_LP_NO=:S_LP_NO,TIME_STAMP=SYSDATE, 	
                //     REQ_BODY = :blobdata, RESPONSE = :blobData2 WHERE SR_CODE=:SR_CODE and DOCT_NO=:DOCT_NO AND REG_YEAR=:REG_YEAR`;
                //     let result = await this.orDao.oDbInsertBlobDocsWithBindParams(q, bindParams, REQ_BODY, RESPONSE);
                //     return true;
                // }
                // else {
                    let q = `INSERT INTO srouser.mutation_sent_cr (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,TYPE,S_LP_NO,TIME_STAMP, REQ_BODY, RESPONSE) values (:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:TYPE,:S_LP_NO,SYSDATE, :blobdata, :blobData2)`;
                    let result = await this.orDao.oDbInsertBlobDocsWithBindParams(q, bindParams, REQ_BODY, RESPONSE);
                    return true;
                // }
            } catch (ex) {
                console.error("MutationServices - updateMutationSentData || Error :", ex.message);
                Logger.error(`MutationServices - updateMutationSentData (${data.SR_CODE}-${data.BOOK_NO}-${data.DOCT_NO}-${data.REG_YEAR}) || Error :  ==============>`, ex.message);
                return false;
            }
        }


    updateStatusFromMutationAPI = async (reqData) => {
        try {
            let j = {
                srCode: reqData.srCode,
                bookNo: reqData.bookNo,
                doctNo: reqData.docNo,
                regYear: reqData.regYear,
                status: reqData.STATUS,
                subDiv: reqData.subDiv ? reqData.subDiv : ''
            };
            let updateStatus = await this.cashService.updateApplicationStatus(j, true);
            if (reqData.statusFlag || updateStatus > 0) {
                return true;
            } else {
                throw Error(reqData.RES_OBJ)
            }
        } catch (ex) {
            console.error("MutationServices - updateStatusFromMutationAPI || Error :", ex.message);
            let cardError = constructCARDError(ex);
            if (reqData.statusFlag) {
                return false;
            } else {
                return {
                    status: false,
                    message: cardError.message
                }
            }
        }
    }

    // handleDigitalSignatureFailure = async (data) => {
    //     try {
    //         const bindParams = { SR_CODE: data.SR_CODE, DOCT_NO: data.DOCT_NO, REG_YEAR: data.REG_YEAR, BOOK_NO: data.BOOK_NO || null };

    //         const queries = [
    //             {
    //                 query: `INSERT INTO srouser.adangal_details_del_log SELECT a.*, SYSDATE FROM adangal_details a WHERE sr_code = :SR_CODE AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR`,
    //                 bindParams
    //             },
    //             {
    //                 query: `DELETE FROM adangal_details WHERE sr_code = :SR_CODE AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR`,
    //                 bindParams
    //             },
    //             {
    //                 query: `INSERT INTO srouser.subdiv_status_record_del_log SELECT SR_CODE, DOCT_NO, REG_YEAR, SCHEDULE_NO, WEBLAND_TRAN_ID, VILLAGE_CODE, SURVEY_NO, SUB_DIV_SURVEY, TIME_STAMP, JOINT_PATTA, KATA_NO, SRO_PID, ERROR_LOG, SYSDATE, REQ_DATA, RESPONSE FROM srouser.subdiv_status_record WHERE sr_code = :SR_CODE AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR`,
    //                 bindParams
    //             },
    //             {
    //                 query: `INSERT INTO SROUSER.SUBDIV_STATUS_RECORD_DEL_LOG (SR_CODE, DOCT_NO, REG_YEAR, SCHEDULE_NO, WEBLAND_TRAN_ID, VILLAGE_CODE, SURVEY_NO, SUB_DIV_SURVEY, TIME_STAMP, JOINT_PATTA, KATA_NO, SRO_PID, ERROR_LOG, DELETE_ON, REQ_DATA, RESPONSE) VALUES (:SR_CODE, :DOCT_NO, :REG_YEAR, :BOOK_NO, NULL, '', '', NULL, '', '', NULL, '', 'Digital Signature Verification Failed Please contact Tahsildar', '', '', '')`,
    //                 bindParams
    //             },
    //             {
    //                 query: `DELETE FROM srouser.subdiv_status_record WHERE sr_code = :SR_CODE AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR`,
    //                 bindParams
    //             },
    //             {
    //                 query: `UPDATE pde_doc_status_cr SET doc_subdiv = 'Y', doc_mutation = 'Y' WHERE sr_code = :SR_CODE AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR`,
    //                 bindParams
    //             }
    //         ];

    //         await this.orDao.oDbMultipleInsertDocsWithBindParams(queries, bindParams);
    //         return true;
    //     } catch (ex) {
    //         console.error("MutationServices - handleDigitalSignatureFailure || Error :", ex.message);
    //         Logger.error(`MutationServices - handleDigitalSignatureFailure ('${data.SR_CODE}'-'${data.BOOK_NO}'-'${data.DOCT_NO}'-'${data.REG_YEAR}') || Error :`, ex.message);
    //         return false;
    //     }
    // };

    processSubDivErrors = async (resultArr, reqData, vCode, sropid, claimants) => {
        // if(resultArr.message && resultArr.message.toLowerCase().includes("digital signature verification failed please contact tahsildar")){
        //      await this.handleDigitalSignatureFailure(reqData);
        // }else{
              for (let resulObj of resultArr) {
            const subdivData = {
                'SR_CODE': reqData.srCode,
                'DOCT_NO': reqData.docNo,
                'REG_YEAR': reqData.regYear,
                'SCHEDULE_NO': resulObj.schedule,
                'SURVEY_NO': resulObj.surveyNo,
                'WEBLAND_TRAN_ID': '',
                'VILLAGE_CODE': vCode,
                'SUB_DIV_SURVEY': '',
                'JOINT_PATTA': claimants.length > 1 ? 'Y' : 'N',
                'KATA_NO': '',
                'SRO_PID': sropid,
                'subDiv_error_log': resulObj.message,
                'subdiv_status': 'N',
                'REQ_BODY': Buffer.from(JSON.stringify(reqData.XML) , 'utf8'),
                'RESPONSE': Buffer.from(JSON.stringify(resulObj), 'utf8')
            };

            await this.mutationServices.SubDivErrorSrvc(subdivData, true);
        }
    //   }
    }

    doSubDivisionAndMutation = async (docData,subdivStatus) => {
        try {
            let subdivResponse = {}
            if(subdivStatus === 'N'|| subdivStatus === undefined){
              subdivResponse = await this.subDivisionProcess(docData);
            }
            if (subdivResponse?.status === true || subdivStatus === 'Y') {
                let adangalDetails = subdivResponse.adangals;
                return await this.MutationForDocument(docData,adangalDetails);
            } else {
                return {
                    status: false,
                    message: 'Subdivision failed'
                };
            }
        } catch (ex) {
            console.error("MutationServices - subDivisionProcess || Error :", ex.message);
            let cardError = constructCARDError(ex);
            return {
                status: false,
                message: cardError.message
            }
        }

    }

getDistrictCode = (villageCode) => {
    villageCode = villageCode.toString();
    return villageCode.length === 6 ? villageCode.substring(0, 1) : villageCode.substring(0, 2);
};

// Function to get or create SRO_PID for a district
getSroPidForDistrict = (districtCode, ourDBresults, srCode) => {
    let ResultData = ourDBresults.find(result => {
        let VCode = (parseInt(result.VILLAGE_CODE)).toString();
        let DistCode = this.getDistrictCode(VCode);
        return DistCode === districtCode;
    });

    if (ResultData) {
        return ResultData.SRO_PID;
    } else {
        return `${srCode}_AMT${new Date().getTime()}`;
    }
};


    subDivisionProcess = async (reqData) => {
        try {
            let XML ='';
            // 1. Get document Details
            // let data = await this.checkSlip.getCheckSlipReportsSrvc({ ...reqData, flag: 1 });
            let data = await this.checkSlip.getCheckSlipReportsSrvc({ ...reqData, flag: 1 });
            if (!data || !Array.isArray(data.docDetails) || data.docDetails.length === 0) {
                throw new Error('Document details not found');
            }
            let adangalMap = {}
            const major_code = get(data, 'docDetails.0.TRAN_MAJ_CODE', '');
            const minor_code = get(data, 'docDetails.0.TRAN_MIN_CODE', '');
            let subResult, vCode, sropid;
            let schedules = get(data, 'schedule', []);
            let claimants = get(data, 'partyDetails', []).filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
            if (claimants.length === 0) {
                throw Error('Claimants not found')
            }
            // filter schedules which are not lpm
            let filteredSchedules = schedules.filter(s => !s.LP_NO);
            // filter schedules which has S_LP_NO and nature code should match to be agricultural.
            let AdangalSchedules = filteredSchedules.filter(f => f.S_LP_NO && CODES.AGRI_NATURE.includes(`${f.NATURE_USE}`));
            if (AdangalSchedules.length === 0) {
                reqData.RES_OBJ = {
                    status: true,
                    code: 0,
                    'message': 'No Sub Division needed'
                };
                reqData.STATUS = 'W';
                const result = await this.updateStatusFromMutationAPI(reqData);
                if(result === true) {
                    return reqData.RES_OBJ;
                }
                else {
                    return {status : false, message : result}
                }
            }
            let ourDBresults = await this.mutationServices.getSubDivSrvc({ ...reqData, flag: 1 });
            // 48 hours back survey numbers subdivision data deleted before exicuting the subdivision process

            if (ourDBresults.length) {
                const currentTime = new Date();
                let expirdedIndexes = [];
                let subDiveExpiredSurveyNosAndPids = ourDBresults
                    .filter((entry, index) => {
                        const createdTime = new Date(entry.TIME_STAMP);
                        const hoursDiff = (currentTime.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
                        const isExpired = hoursDiff > 48;
                        if(isExpired)
                            expirdedIndexes.push(index);
                        return isExpired;
                    })
                    .map(entry => entry.SURVEY_NO+"__"+entry.SRO_PID);

                // subDiveExpiredSurveyNosAndPids = new Set(subDiveExpiredSurveyNosAndPids);
                subDiveExpiredSurveyNosAndPids = [...new Set(subDiveExpiredSurveyNosAndPids)];

                console.log((subDiveExpiredSurveyNosAndPids)," subDiveExpiredSurveyNosAndPids ::::::::::0000000000:")

                if (subDiveExpiredSurveyNosAndPids.length > 0) {
                    const deleteQuery = `DELETE FROM SROUSER.SUB_DIV_SURVEY WHERE DOCT_NO = :DOCT_NO AND SR_CODE = :SR_CODE
                                        AND REG_YEAR = :REG_YEAR AND SURVEY_NO = :survey AND SRO_PID = :sroPid AND NOT EXISTS 
                                        (SELECT 1 FROM mutation_sent_cr  WHERE DOCT_NO = :DOCT_NO AND SR_CODE = :SR_CODE AND REG_YEAR = :REG_YEAR)`;
                    let bindParams = {
                        DOCT_NO: reqData.docNo,
                        SR_CODE: reqData.srCode,
                        REG_YEAR: reqData.regYear
                    };
                    //  699-3_713_AMT1752484493434,454-2B_713_AMT1752484493434,455-3B_713_AMT1752484493434  subDiveExpiredSurveyNosAndPids ::::::::::0000000000:
                    for(const surevyAndSroPid of subDiveExpiredSurveyNosAndPids){
                        const [surevyVal, sroPidVal] = surevyAndSroPid.split("__");
                        bindParams["survey"] = surevyVal;
                        bindParams["sroPid"] = sroPidVal;
                        const result = await this.orDao.oDbDeleteDocsWithBindParams(deleteQuery, bindParams);
                    }
                    // ourDBresults = await this.mutationServices.getSubDivSrvc({ ...reqData, flag: 1 });
                    if(expirdedIndexes.length>0){
                        for(let indexVal of expirdedIndexes){
                            ourDBresults.splice(indexVal,1);
                        }
                    }
                }
            }


            //Checking weather doc is partition or not, if true move to partition flow
            if (major_code == '04' && ['01', '02'].includes(minor_code)) {
                let formattedArr = [];
                let scheduleSet = new Set(); // To avoid duplicate schedules
                for (let adSchData of AdangalSchedules) {
                    adSchData.S_LP_NO = adSchData.S_LP_NO.trim();
                    let key = `${adSchData.S_LP_NO}_${adSchData.SCHEDULE_NO}`;
                    if (!scheduleSet.has(key)) {
                        scheduleSet.add(key);
                        formattedArr.push({
                            schedule: adSchData.SCHEDULE_NO,
                            surveyNo: adSchData.S_LP_NO,
                            list: [adSchData]
                        });
                    }
                }

                let subReqBodys = [];
                if (formattedArr.length === 0) {
                    reqData.RES_OBJ = {
                        status: true,
                        code: 0,
                        'message': 'No Sub Division needed'
                    };
                    reqData.STATUS = 'W';
                    const result = await this.updateStatusFromMutationAPI(reqData);
                    if(result === true) {
                        return reqData.RES_OBJ;
                    }
                    else {
                        return { status : false, message : result }
                    }
                } else {
                    let resultArr = formattedArr.map(f => {
                        f.surveyNo = f.surveyNo.trim()
                        return {
                            'schedule': f.schedule,
                            'surveyNo': f.surveyNo,
                            'result': [],
                            'message': ""
                        }
                    });               
                    // Fixed: Group schedules by survey number, village code, and khata number
                    let groupedSchedules = {};
                    for (let item of formattedArr) {
                        let surveyNo = item.surveyNo.trim();
                        for (let schedule of item.list) {
                            //Below logic is added to remove the 0 at starting position.
                            let vCode = (parseInt(schedule.VILLAGE_CODE_1)).toString();

                            let groupKey = `${surveyNo}_${vCode}_${schedule.KHATA_NO}`;

                            if (!groupedSchedules[groupKey]) {
                                groupedSchedules[groupKey] = {
                                    surveyNo: surveyNo,
                                    vCode: vCode,
                                    khataNo: schedule.KHATA_NO,
                                    schedules: [],
                                    totalTransferExtent: 0
                                };
                            }
                            groupedSchedules[groupKey].schedules.push({
                                schedule: item.schedule,
                                data: schedule
                            });
                            groupedSchedules[groupKey].totalTransferExtent += parseFloat(schedule.SELLING_EXTENT);
                        }
                    }

                    //partition subdivide starts from here
                    // Group by district for partition flow
                    let districtGroups = {};
                    for (let groupKey in groupedSchedules) {
                        let group = groupedSchedules[groupKey];
                        let districtCode = this.getDistrictCode(group.vCode);
                        
                        if (!districtGroups[districtCode]) {
                            districtGroups[districtCode] = [];
                        }
                        districtGroups[districtCode].push({
                            groupKey: groupKey,
                            group: group
                        });
                    }

                    for (let districtCode in districtGroups) {
                        let districtItems = districtGroups[districtCode];
                        sropid = this.getSroPidForDistrict(districtCode, ourDBresults, reqData.srCode);
                        
                        // Process all groups in this district
                        for (let districtItem of districtItems) {
                            let group = districtItem.group;
                            let transactionId = 'AMT' + new Date().getTime() + reqData.srCode;
                            let vCode = group.vCode;
                            let surveyNo = group.surveyNo;
                            let khataNo = group.khataNo;
                            let scheduleNos = group.schedules.map(s => s.schedule);

                            // Check if already subdivided
                            let subdivResults = ourDBresults.filter(ou =>
                                scheduleNos.includes(parseInt(ou.SCHEDULE_NO)) &&
                                ou.SURVEY_NO === surveyNo && ou.VILLAGE_CODE === vCode
                            );

                            if (subdivResults.length) {
                                // Already subdivided, update result as success and continue for next loop.
                                for (let scheduleItem of subdivResults) {
                                    let ind = resultArr.findIndex(r => r.schedule === scheduleItem.schedule && r.surveyNo === surveyNo);
                                    if (ind > -1) {
                                        resultArr[ind].result = subdivResults.filter(ou =>
                                            ou.SCHEDULE_NO === scheduleItem.schedule.toString()
                                        );
                                        resultArr[ind].message = 'success';
                                    }
                                }
                                continue;
                            }

                            // Get adangal details
                            let adangalslist;
                            let adangalKey = surveyNo + '_' + vCode;
                            if (adangalMap[adangalKey] == undefined) {
                                adangalslist = await this.getAdangalDetails(surveyNo, vCode);
                                adangalMap[adangalKey] = adangalslist;
                            } else {
                                adangalslist = adangalMap[adangalKey];
                            }

                            if (!adangalslist || adangalslist.length === 0) {
                                console.log("Adangal list not found");

                                for (let scheduleNo of scheduleNos) {
                                    let ind = resultArr.findIndex(r => r.schedule === scheduleNo && r.surveyNo === surveyNo);
                                    resultArr[ind].result = [];
                                    resultArr[ind].message = `Adangal details not found for survey number: ${surveyNo}`;
                                }
                                continue;
                            }
                                                
                            // Find the matching adangal for this khata
                            let khataAdangal = adangalslist.find(ad => ad.occupantKhataNo == khataNo  );

                            if (!khataAdangal) {
                                for(let scheduleNo of scheduleNos){
                                    let ind = resultArr.findIndex(r => r.schedule === scheduleNo && r.surveyNo === surveyNo);
                                    resultArr[ind].result = [];
                                    resultArr[ind].message = `Khata number not matched with adangal data for the survey number : ${surveyNo}`;
                                }
                                continue;
                            }else{
                                let isDispute = false;
                                if (khataAdangal) {
                                    if (khataAdangal.isAnyDispute != undefined && khataAdangal.isAnyDispute.trim().length > 0 &&
                                        khataAdangal.isAnyDispute.trim().toUpperCase() != 'NO') {
                                        isDispute = true;
                                        let errorMsg = khataAdangal.isAnyDispute + ` :: Survey number : ${surveyNo}`;
                                        for (let scheduleNo of scheduleNos) {
                                            let ind = resultArr.findIndex(r => r.schedule === scheduleNo && r.surveyNo === surveyNo);
                                            resultArr[ind].result = [];
                                            resultArr[ind].message = errorMsg;
                                        }
                                    }
                                }
                                if(isDispute)
                                    continue;
                            }

                            // Fixed: Check if total transfer extent equals pattadar extent
                            let pattadarExtent = Number(khataAdangal.occupantExtent);
                            let totalTransferExtent = group.totalTransferExtent;

                            if (Math.abs(pattadarExtent - totalTransferExtent) > 0.001) {
                                let errorMsg = `Sum of Transfer Extent (${totalTransferExtent}) Not Equal to Pattadar Extent (${pattadarExtent}) for the survey no :${surveyNo} `;
                                for (let scheduleNo of scheduleNos) {
                                    let ind = resultArr.findIndex(r =>r.schedule === scheduleNo &&r.surveyNo === surveyNo);
                                    resultArr[ind].result = [];
                                    resultArr[ind].message = errorMsg;
                                }
                                continue;
                            }

                            // Create XML for this group
                            let XML = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><PartionDeedSubDivisionRequest xmlns="http://tempuri.org/"><districtcode>${vCode.length === 6 ? vCode.substring(0, 1) : vCode.substring(0, 2)}</districtcode><mandalcode> ${vCode.length === 6 ? vCode.substring(1, 3) : vCode.substring(2, 4)}</mandalcode><villagecode>${vCode}</villagecode><surveyno>${surveyNo.replaceAll('/', '/')}</surveyno><KhataNo>${khataNo}</KhataNo><UserName>${process.env.PARTITION_SUBDIVISION_USERNAME}</UserName><Password>${process.env.PARTITION_SUBDIVISION_PASSWORD}</Password><SROCODE_PID>${sropid}</SROCODE_PID><ARFS>`;

                            // Add subdivision requests for each schedule in this group
                            for (let scheduleItem of group.schedules) {
                                let scheduleData = scheduleItem.data;
                                if (Number(scheduleData.SELLING_EXTENT) > 0) {
                                    XML += `<AutoRequestForSubdivision><TranscationId>${transactionId}</TranscationId><VillageCode>${vCode}</VillageCode><SurveyNo>${surveyNo.replaceAll('/', '/')}</SurveyNo><KhataNo>${scheduleData.KHATA_NO}</KhataNo><KhataExtent>${pattadarExtent}</KhataExtent><TranferExtent>${Number(scheduleData.SELLING_EXTENT)}</TranferExtent><IsPattadar>${scheduleData.IS_PATTADAR || 'N'}</IsPattadar></AutoRequestForSubdivision>`;
                                }
                            }

                            XML += `</ARFS></PartionDeedSubDivisionRequest></soap:Body></soap:Envelope>`;

                            subReqBodys.push(XML);
                            // return res.status(200).send(c);
                            Logger.error(` subdivision reqData body ${reqData.srCode}-${reqData.bookNo}-${reqData.docNo}-${reqData.regYear}-${scheduleNos.join(',')} =====> ${XML}`, '');

                            // Send subdivision request
                            subResult = await this.sendRequestForSubdivision({
                                data: XML,
                                flag: 1,
                                partition: 'Y'
                            });
                            console.log("subResult :::::: ", subResult);
                            if (!subResult || typeof subResult === 'string') {
                                console.log('Sub Division request failed for this survey number: ', surveyNo);
                                for (let scheduleItem of group.schedules) {
                                    let ind = resultArr.findIndex(r =>
                                        r.schedule === scheduleItem.schedule &&
                                        r.surveyNo === surveyNo
                                    );
                                    if (ind > -1) {
                                        resultArr[ind].result = [];
                                        resultArr[ind].message = "Survey Number (" + surveyNo + "): " + subResult;
                                    }
                                }
                            } else {
                                // Process successful subdivision results
                                for (let i = 0; i < subResult.length; i++) {
                                    let scheduleItem = group.schedules[i];
                                    let subArr = {
                                        'SR_CODE': reqData.srCode,
                                        'DOCT_NO': reqData.docNo,
                                        'REG_YEAR': reqData.regYear,
                                        'SCHEDULE_NO': scheduleItem.schedule,
                                        'WEBLAND_TRAN_ID': subResult[i].TranscationId._text,
                                        'VILLAGE_CODE': vCode,
                                        'SURVEY_NO': surveyNo,
                                        'SUB_DIV_SURVEY': subResult[i].NewSurveyNo._text,
                                        'JOINT_PATTA': claimants.length > 1 ? 'Y' : 'N',
                                        'KATA_NO': subResult[i].KhataNo._text,
                                        'SRO_PID': sropid,
                                        'IS_PARTITION': 'Y'
                                    }
                                    let insertData = await this.mutationServices.saveSubDivSrvc(subArr, true);
                                    let ind = resultArr.findIndex(r => r.schedule === scheduleItem.schedule && r.surveyNo === surveyNo);
                                    if (insertData) {
                                        resultArr[ind].result = subArr;
                                        resultArr[ind].message = 'success';
                                    } else {
                                        console.log('Inserting sub-divided adangals into our Oracle DB failed. for survey no: ', surveyNo);
                                        resultArr[ind].result = [];
                                        resultArr[ind].message = `Inserting sub-divided adangals into our Oracle DB failed - survey no: ${surveyNo}`;
                                    }
                                }
                            }
                        }
                  }
                   if (resultArr.filter(r => r.message === 'success').length === formattedArr.length) {
                        reqData.RES_OBJ = {
                            'status': true,
                            'code': 1,
                            'data': resultArr,
                            'docStatusUpdate': true,
                            'reqbody': subReqBodys
                        };
                        reqData.STATUS = 'W';
                        const result = await this.updateStatusFromMutationAPI(reqData);
                        if(result === true) {
                            return {status : true, message: "Sub division Successfull", adangals : adangalMap};
                        }
                        else {
                            return {status : false, message: result};
                        }
                    } else {
                        reqData.XML= XML  ? XML : '';
                        await this.processSubDivErrors(resultArr, reqData, vCode, sropid, claimants);
                        return {
                            'status': false,
                            'code': 1,
                            'data': resultArr,
                            'docStatusUpdate': false,
                            'reqbody': subReqBodys
                        };
                    }
                }
            }
            else {
                // prepare an arr which holds specific survey number to a schedule
                let formattedArr = [];
                for (let AdangalSchObj of AdangalSchedules) {
                    AdangalSchObj.S_LP_NO = AdangalSchObj.S_LP_NO.trim()
                    let vCode = AdangalSchObj.VILLAGE_CODE_1.trim().length < 7 ? `0${AdangalSchObj.VILLAGE_CODE_1.trim()}` : AdangalSchObj.VILLAGE_CODE_1.trim();
                    let ind = formattedArr.findIndex(f => f.schedule == AdangalSchObj.SCHEDULE_NO && f.surveyNo == AdangalSchObj.S_LP_NO && f.villageCode == vCode);
                    if (ind > -1) {
                        formattedArr[ind].list = [...formattedArr[ind].list, AdangalSchObj];
                    } else {
                        formattedArr = [...formattedArr, {
                            'schedule': AdangalSchObj.SCHEDULE_NO,
                            'surveyNo': AdangalSchObj.S_LP_NO,
                            'villageCode': vCode,
                            'list': [AdangalSchObj]
                        }];
                    }
                }

                // Group schedules by district
                let districtGroups = {};
                for (let formtedObj of formattedArr) {
                    let vCode = formtedObj.villageCode;
                    let districtCode = this.getDistrictCode(vCode);
                    
                    if (!districtGroups[districtCode]) {
                        districtGroups[districtCode] = [];
                    }
                    districtGroups[districtCode].push(formtedObj);
                }

                let subReqBodys = [];
                // return res.status(200).send(formattedArr);
                // if formatted array is empty then just change status of application  

                /* code in response 200 suggests
                 0 - no sub division needed just change status of document
                 1 - subdivided data is present
                */
                if (formattedArr.length === 0) {
                    reqData.RES_OBJ = {
                        status: true,
                        code: 0,
                        'message': 'No Sub Division needed'
                    };
                    reqData.STATUS = 'W';
                    const result = await this.updateStatusFromMutationAPI(reqData);
                    if(result === true) {
                        return reqData.RES_OBJ;
                    }
                    else {
                        return { status : false, message : result }
                    }
                } else {
                    let resultArr = formattedArr.map(f => {
                        f.surveyNo =  f.surveyNo.trim()
                        return {
                            'schedule': f.schedule,
                            'surveyNo': f.surveyNo,
                            'villageCode': f.villageCode,
                            'result': [],
                            'message': ""
                        }
                    });

                    // Process each district group separately
                    for (let districtCode in districtGroups) {
                        let districtSchedules = districtGroups[districtCode];
                        sropid = this.getSroPidForDistrict(districtCode, ourDBresults, reqData.srCode);
                        // Process all schedules in this district
                        for (let formtedObj of districtSchedules) {
                            let adangals;
                            let transactionId = 'AMT' + new Date().getTime() + reqData.srCode;
                            formtedObj.surveyNo = formtedObj.surveyNo.trim()

                        // Get village code and district code for SRO_PID
                            vCode = formtedObj.villageCode;
                            let oursubdbresults = ourDBresults.filter(ou => `${ou.SCHEDULE_NO}` === `${formtedObj.schedule}` && `${ou.SURVEY_NO}` === `${formtedObj.surveyNo}` && `${ou.VILLAGE_CODE}` === `${vCode}`);
                            if (oursubdbresults.length) {
                                let ind = resultArr.findIndex(r => r.schedule === formtedObj.schedule && r.surveyNo === formtedObj.surveyNo && r.villageCode === vCode);
                                resultArr[ind].result = oursubdbresults;
                                resultArr[ind].message = 'success';
                                continue; // Move to next schedule
                            }
                            // get adangal details for a survey number
                            let key = formtedObj.surveyNo + '_' + vCode
                            if(adangalMap[key]==undefined){
                                adangals = await this.getAdangalDetails(formtedObj.surveyNo, vCode);
                                adangalMap[key] = adangals;
                            }else{
                                adangals = adangalMap[key];
                            }
                            if (adangals && adangals.length) {
                                let XML = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><SubDivisionRequest xmlns="http://tempuri.org/"><districtcode>${vCode.substring(0, 2)}</districtcode><mandalcode>${vCode.substring(2, 4)}</mandalcode><villagecode>${vCode}</villagecode><surveyno>${formtedObj.surveyNo.replaceAll('/', '/')}</surveyno><UserName>${process.env.SUBDIVISION_USERNAME}</UserName><Password>${process.env.SUBDIVISION_PASSWORD}</Password><SROCODE_PID>${sropid}</SROCODE_PID><TranscationID>${transactionId}</TranscationID><ARFS>`;                            
                                let isValidData = false;
                                for (let slngExtntData of formtedObj.list.filter(item => Number(item.SELLING_EXTENT) > 0)) {
                                    isValidData = true;
                                    let khataAdangals = adangals.filter(ad => ad?.occupantKhataNo == slngExtntData.KHATA_NO);
                                    if (khataAdangals) {
                                        let isDispute = false;
                                        for(let adangal of khataAdangals){
                                            if(adangal.isAnyDispute!=undefined && adangal.isAnyDispute.trim().length>0 &&
                                                adangal.isAnyDispute.trim().toUpperCase() != 'NO' ){
                                                isDispute = true;
                                                let errorMsg = adangal.isAnyDispute+` :: Survey number : ${formtedObj.surveyNo}`;
                                                let ind = resultArr.findIndex(r => r.schedule === formtedObj.schedule && r.surveyNo === formtedObj.surveyNo && r.villageCode === vCode);
                                                resultArr[ind].result = [];
                                                resultArr[ind].message = errorMsg;
                                            }
                                        }

                                        if(!isDispute){
                                            let adangal = khataAdangals.filter(ad =>Number(`${ad?.occupantExtent}`) == Number(`${slngExtntData.TOTAL_EXTENT}`))[0];
                                            if (adangal) {
                                                console.log("Adangal details ====> ", adangal, adangals);
                                                let fullOrPart;
                                                if (Number(slngExtntData.SELLING_EXTENT) === Number(adangal?.occupantExtent ? adangal?.occupantExtent : slngExtntData.TOTAL_EXTENT)) {
                                                    if (khataAdangals.length >= 2) {
                                                        fullOrPart = 'P'
                                                    }
                                                    else {
                                                        fullOrPart = 'F'
                                                    }
                                                }
                                                else {
                                                    fullOrPart = 'P'
                                                }
                                                XML = XML + `<AutoRequestForSubdivision><VillageCode>${vCode}</VillageCode><SurveyNo>${formtedObj.surveyNo.replaceAll('/', '/')}</SurveyNo><KhataNo>${slngExtntData.KHATA_NO}</KhataNo><PartFull>${fullOrPart}</PartFull><TransferExtent>${Number(slngExtntData.SELLING_EXTENT)}</TransferExtent></AutoRequestForSubdivision>`;
                                            } else {
                                                let errorMsg = `Khata number not matched with adangal data for the survey number : ${formtedObj.surveyNo}`;
                                                let ind = resultArr.findIndex(r => r.schedule === formtedObj.schedule && r.surveyNo === formtedObj.surveyNo && r.villageCode === vCode);
                                                resultArr[ind].result = [];
                                                resultArr[ind].message = errorMsg;
                                                continue;
                                            }
                                        }
                                    } else {
                                        let errorMsg = `Khata number not matched with adangal data for the survey number : ${formtedObj.surveyNo}`;
                                        let ind = resultArr.findIndex(r => r.schedule === formtedObj.schedule && r.surveyNo === formtedObj.surveyNo && r.villageCode === vCode);
                                        resultArr[ind].result = [];
                                        resultArr[ind].message = errorMsg;
                                        continue;
                                    }
                                }

                                if(!isValidData){
                                    let errorMsg = `Selling extent is 0 in our records for survey : ${formtedObj.surveyNo} and schedule number :${formtedObj.schedule}`;
                                    let ind = resultArr.findIndex(r => r.schedule === formtedObj.schedule && r.surveyNo === formtedObj.surveyNo && r.villageCode === vCode);
                                    resultArr[ind].result = [];
                                    resultArr[ind].message = errorMsg;
                                    continue;
                                }

                                // Complete XML for this schedule
                                XML = `${XML}</ARFS><_ClaimantDetails>`;
                                for (let j of formtedObj.list) {
                                    let adangal = adangals.filter(ad => ad?.occupantKhataNo == j.KHATA_NO)[0];
                                    XML = XML + `<ClaimantDetails><VillageCode>${vCode}</VillageCode><BuyerName>${returnCleanSpecialCharacters(adangal?.occupantName)}</BuyerName><BuyerRelationName>${returnCleanSpecialCharacters(adangal?.fatherName)}</BuyerRelationName></ClaimantDetails>`;
                                }
                                XML = `${XML}</_ClaimantDetails></SubDivisionRequest></soap:Body></soap:Envelope>`;
                                subReqBodys.push(XML);            
                                Logger.error(` subdivision reqData body ${reqData.srCode}-${reqData.bookNo}-${reqData.docNo}-${reqData.regYear}-${formtedObj.schedule} =====> ${XML}`, '')                        
                                subResult = await this.sendRequestForSubdivision({
                                    data: XML,
                                    flag: 1
                                });
                                if (!subResult || typeof subResult === 'string') {
                                    console.log('Sub Division request failed for this survey number: ', formtedObj.surveyNo);
                                    let ind = resultArr.findIndex(r => r.schedule === formtedObj.schedule && r.surveyNo === formtedObj.surveyNo && r.villageCode === vCode);
                                    resultArr[ind].result = [];
                                    resultArr[ind].message = "Survey Number (" + formtedObj.surveyNo + "): " + subResult;
                                } else {
                                    // prepare sub divided survey numbers data to insert into our DB
                                    const subArr = subResult.map(s => {
                                        return {
                                            'SR_CODE': reqData.srCode,
                                            'DOCT_NO': reqData.docNo,
                                            'REG_YEAR': reqData.regYear,
                                            'SCHEDULE_NO': formtedObj.schedule,
                                            'WEBLAND_TRAN_ID': s.TranscationId._text,
                                            'VILLAGE_CODE': vCode,
                                            'SURVEY_NO': formtedObj.surveyNo,
                                            'SUB_DIV_SURVEY': s.SurveyNo._text,
                                            'JOINT_PATTA': claimants.length > 1 ? 'Y' : 'N',
                                            'KATA_NO': s.KhataNo._text,
                                            'SRO_PID': sropid
                                        }
                                    });
                                    let insertData = await this.mutationServices.saveSubDivSrvc(subArr, true);
                                    let ind = resultArr.findIndex(r => r.schedule === formtedObj.schedule && r.surveyNo === formtedObj.surveyNo && r.villageCode === vCode);
                                    if (insertData) {
                                        resultArr[ind].result = subArr;
                                        resultArr[ind].message = 'success';
                                    } else {
                                        console.log('Inserting sub-divided adangals into our Oracle DB failed. for survey no: ', formtedObj.surveyNo);
                                        resultArr[ind].result = [];
                                        resultArr[ind].message = `Inserting sub-divided adangals into our Oracle DB failed - survey no: ${formtedObj.surveyNo}`;
                                    }
                                }
                            } else {
                                console.log('Adangals not found for survey number', formtedObj.surveyNo);
                                let ind = resultArr.findIndex(r => r.schedule === formtedObj.schedule && r.surveyNo === formtedObj.surveyNo && r.villageCode === vCode);
                                resultArr[ind].result = [];
                                resultArr[ind].message = `Adangals not found for survey number: ${formtedObj.surveyNo}`;
                            }
                        }
                    }

                    if (resultArr.filter(r => r.message === 'success').length === formattedArr.length) {
                        reqData.RES_OBJ = {
                            'status': true,
                            'code': 1,
                            'data': resultArr,
                            'docStatusUpdate': true,
                            'reqbody': subReqBodys
                        };
                        reqData.STATUS = 'W';
                        const result = await this.updateStatusFromMutationAPI(reqData);
                        if(result === true) {
                            return {status : true, message: "Sub division Successfull", adangals : adangalMap};
                        }
                        else {
                            return {status : false, message: result};
                        }
                    } else {
                        reqData.XML= XML ? XML : '';
                        await this.processSubDivErrors(resultArr, reqData, vCode, sropid, claimants);
                        return {
                            'status': false,
                            'code': 1,
                            'data': resultArr,
                            'docStatusUpdate': false,
                            'reqbody': subReqBodys
                        };
                    }
                }
            }
        } catch (ex) {
            console.error("MutationServices - subDivisionProcess || Error :", ex.message);
            let cardError = constructCARDError(ex);
            return {
                status: false,
                message: cardError.message
            }
        }

    }

    isOnlyZeros = (str) => {
        return /^0+$/.test(str);
    }
    CircularStringify =(obj, indent = 2) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, indent);
}


    getIdTypeAndNumber = (idNumber) => {
        if(idNumber == undefined || idNumber == null || idNumber.trim() == "" ){
            return { idType: 0, idNumber: null };
        }
        if (/^\d{12}$/.test(idNumber) && !this.isOnlyZeros(idNumber)) {
            return { idType: 1, idNumber }; // Aadhaar
        }
        const idNumberUpperCase = idNumber.toString().toUpperCase();
        if (/^[0-9]{11}$/.test(idNumberUpperCase) && !this.isOnlyZeros(idNumberUpperCase)) {
            return { idType: 2, idNumber: idNumberUpperCase }; // TIN
        } else if (/^[a-zA-Z0-9]{10}$/.test(idNumberUpperCase) && !this.isOnlyZeros(idNumberUpperCase)) {
            if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idNumberUpperCase)) {
                return { idType: 4, idNumber: idNumberUpperCase }; // PAN
            } else if (/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/.test(idNumberUpperCase)) {
                return { idType: 3, idNumber: idNumberUpperCase }; // TAN
            } else {
                return { idType: 0, idNumber: null }; // Invalid ID
            }

        } else {
            return { idType: 0, idNumber: null }; // Invalid ID
        }
    };


    postLPMData = async (reqData) => {
        try {
            let data = reqData.checkSlipData ? JSON.parse(JSON.stringify(reqData.checkSlipData)) : await this.checkSlip.getCheckSlipReportsSrvc({ ...reqData, flag: 1 });
            let claimants = get(data, 'partyDetails', []).filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
            let schedules = get(data, 'schedule', []).filter(s => s.LP_NO && s.NATURE_USE!=null && s.NATURE_USE!="null" && s.NATURE_USE!=undefined );
            let mutationdata;
            if (claimants.length === 0) {
                throw Error('Claimants not found')
            }
            if (schedules.length === 0) {
                throw Error('Schedules not found')
            }
            let tokenresult = await this.generateAutomutationToken();
            if (tokenresult.Code === '100') {
                let docDet = data.docDetails[0];
                let dclink = data.docStatus[0].DOC_TYPE === 'O' ? `${process.env.BACKEND_URL}/files/${reqData.srCode}/${reqData.bookNo}/${reqData.docNo}/${reqData.regYear}/signedBundledDocument.pdf` : await this.mutationServices.getFilePath(reqData);

                let transactionType = "";
                if (docDet.TRAN_MAJ_CODE === '03') {
                    transactionType = "7"; // Gift
                } else if (docDet.TRAN_MAJ_CODE === '01') {
                    transactionType = "5"; // Sale
                } else if (docDet.TRAN_MAJ_CODE === '04') {
                    transactionType = "4"; // Partition
                }

                if (transactionType === "") {
                    reqData.STATUS = 'F';
                    reqData.RES_OBJ = {
                        status: true,
                        message: "Mutation Not Needed",
                    };
                    const result = await this.updateStatusFromMutationAPI(reqData);
                    if (result === true) {
                        return reqData.RES_OBJ;
                    } else {
                        return { status: false, message: result };
                    }
                }                   
                let obj = {
                    DocumentNumber: `${docDet.DOCT_NO}`,
                    RegistrationYear: `${docDet.REG_YEAR}`,
                    SroCode: `${docDet.SR_CODE}`,
                    RegistrationDate: formatDate(docDet.R_DATE, true),
                    DocumentLink: dclink,
                    TranscationType: transactionType,
                    DistrictCode: "",
                    MandalCode: "",
                    VillageCode: "",
                    ScheduleDetails: [],
                    ClaimantDetails: []
                };

                for (let i of schedules) {
                    let lpm_nos = get(i, 'LP_NO', '') ? get(i, 'LP_NO', '').split(',').filter(l => l) : [];
                    let vCode1 = `${i.VILLAGE_CODE_1}`.trim();
                    vCode1 = vCode1.length === 6 ? `0${vCode1}` : vCode1;
                    for (let j of lpm_nos) {
                        let schOb = {
                            DocumentNumber: `${i.DOCT_NO}`,
                            RegistrationYear: `${i.REG_YEAR}`,
                            SroCode: `${i.SR_CODE}`,
                            ScheduleNumber: `${i.SCHEDULE_NO}`,
                            DistrictCode: `${vCode1}`.substring(0, 2),
                            MandalCode: `${vCode1}`.substring(2, 4),
                            VillageCode: `${vCode1}`,
                            LPMNumber: `${j}`
                        };
                        obj["ScheduleDetails"] = [...obj["ScheduleDetails"], schOb];
                    }
                }

                // Validate LPM numbers - Check for duplicates across different schedules
                const lpmScheduleMap = {};
                const duplicateLPMs = [];

                for (let schedule of obj["ScheduleDetails"]) {
                    const lpmNum = schedule.LPMNumber;
                    const scheduleNum = schedule.ScheduleNumber;

                    if (lpmScheduleMap[lpmNum]) {
                        if (lpmScheduleMap[lpmNum] !== scheduleNum) {
                            duplicateLPMs.push(lpmNum);
                        }
                    } else {
                        lpmScheduleMap[lpmNum] = scheduleNum;
                    }
                }
                if (duplicateLPMs.length > 0) {
                    const uniqueDuplicates = [...new Set(duplicateLPMs)];
                    let errorMessage = uniqueDuplicates.join(', ')+" LPM number(s) should not included in multliple schedules."
                    mutationdata = {
                        'bookNo': reqData.bookNo,
                        'docNo': reqData.docNo,
                        'regYear': reqData.regYear,
                        'srCode': reqData.srCode,
                        'mutation_error_log': errorMessage,
                        'mutation_status': 'N',
                        'SCHEDULE_NO': obj['ScheduleDetails'].map(sd => sd.ScheduleNumber).join(','),
                        'MUTATION_VALUE': obj['ScheduleDetails'].map(sd => sd.LPMNumber).join(','),
                        'PROPERTY_TYPE': 'RL',
                        'REQ_BODY':typeof obj === 'object' ? JSON.stringify(obj, null, 2) : '',
                        'RESPONSE': typeof uniqueDuplicates === 'object' ? JSON.stringify(uniqueDuplicates, null, 2) : ''
                    }
                    let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                    throw Error(errorMessage);
                }

                // Validate claimant IDs first
                for (let claimant of claimants) {
                    let idData = {};
                    if (claimant.AADHAR) {
                        idData = this.getIdTypeAndNumber((claimant.AADHAR+'') || (claimant.AADHAR_1+''));
                    }
                    console.log("idData::::::::::::::::", idData)
                    if (idData.idType === 0) {
                        let errorMessage = "Invalid ID number. Please provide a valid Aadhaar, TIN, TAN, or PAN number.";
                        mutationdata = {
                            'bookNo': reqData.bookNo,
                            'docNo': reqData.docNo,
                            'regYear': reqData.regYear,
                            'srCode': reqData.srCode,
                            'mutation_error_log': errorMessage,
                            'mutation_status': 'N',
                            'SCHEDULE_NO': obj['ScheduleDetails'].map(sd => sd.ScheduleNumber).join(','),
                            'MUTATION_VALUE': obj['ScheduleDetails'].map(sd => sd.LPMNumber).join(','),
                            'PROPERTY_TYPE': 'RL',
                            'REQ_BODY': `${claimant.AADHAR}`,
                            'RESPONSE': typeof idData === 'object' ? JSON.stringify(idData) : ''
                        }
                        let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                        throw Error(errorMessage);
                    }
                }

                const createClaimantDetails = (claimant, scheduleNumber = null) => {
                    let p = get(claimant, 'PHOTO.data', '');
                    let idData = this.getIdTypeAndNumber((claimant.AADHAR+'') || (claimant.AADHAR_1+''));
                    let claimantObj = {
                        DocumentNumber: `${docDet.DOCT_NO}`,
                        RegistrationYear: `${docDet.REG_YEAR}`,
                        SroCode: `${docDet.SR_CODE}`,
                        BuyerName: returnCleanSpecialCharacters(claimant.NAME),
                        BuyerRelationName: returnCleanSpecialCharacters(claimant.R_NAME ? claimant.R_NAME : ' '),
                        BuyerPhoto: claimant.PHOTO ? `${toBase64(p ? p : claimant.PHOTO, !!p)}` : '',
                        IdType: idData.idType,
                        IdNumber: idData.idNumber,
                        ECNumber: `${claimant.EC_NUMBER}`,
                        Address: returnCleanAddress(`${claimant.ADDRESS1}`),
                        PinCode: "518122",
                        MobileNumber: claimant.PHONE_NO ? `${claimant.PHONE_NO}` : '',
                        Gender: "M",
                        Caste: "1",
                        Religion: "H",
                        Email: claimant.EMAIL_ID ? claimant.EMAIL_ID : ''
                    };
                    if (transactionType === "4") {
                        // PARTITION: Requires ScheduleNumber
                        claimantObj.ScheduleNumber = scheduleNumber;
                    } else {
                        // NON-PARTITION (Sale/Gift): Requires BuyerKhata
                        claimantObj.BuyerKhata = "0";
                    }
                    return claimantObj;
                };

                if (transactionType === "4") {
                    // Process each schedule and map claimants based on party numbers
                    for (let schedule of schedules) {
                        let filteredClaimantArray = [];
                        // Get party numbers from schedule (similar to survey number approach)
                        if (schedule.P_PARTY_NO) {
                            let partyNos = `${schedule.P_PARTY_NO}`.split(',').map(p => p.trim());
                            // Filter claimants based on party numbers matching EC_NUMBER
                            let filteredClaimantsData = claimants
                                .filter(c => partyNos.includes(`${c.EC_NUMBER}`.trim()))
                                .map(fc => ({ ...fc, SCHEDULE_NO: schedule.SCHEDULE_NO }));
                            filteredClaimantArray.push(...filteredClaimantsData);

                            // Add claimant details for this schedule
                            for (const filteredClaimant of filteredClaimantArray) {
                                obj["ClaimantDetails"].push(createClaimantDetails(filteredClaimant, schedule.SCHEDULE_NO));
                            }
                        } else {
                            // If no party numbers specified, throw error for partition
                            let errorMessage = `Party numbers not found for schedule ${schedule.SCHEDULE_NO} in partition transaction.`;
                            mutationdata = {
                                'bookNo': reqData.bookNo,
                                'docNo': reqData.docNo,
                                'regYear': reqData.regYear,
                                'srCode': reqData.srCode,
                                'mutation_error_log': errorMessage,
                                'mutation_status': 'N',
                                'SCHEDULE_NO': schedule.SCHEDULE_NO,
                                'MUTATION_VALUE': get(schedule, 'LP_NO', ''),
                                'PROPERTY_TYPE': 'RL',
                                'REQ_BODY':typeof obj === 'object' ? JSON.stringify(obj, null, 2) : '',
                                'RESPONSE': `Party numbers not found for schedule ${schedule.SCHEDULE_NO} in partition transaction.`
                            }
                            let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                            throw Error(errorMessage);
                        }
                    }
                    // check partition distribution
                    const scheduleDistribution = obj["ClaimantDetails"].reduce((acc, detail) => {
                        acc[detail.ScheduleNumber] = (acc[detail.ScheduleNumber] || 0) + 1;
                        return acc;
                    }, {});
                    // Validate that all schedules have at least one claimant
                    const schedulesWithClaimants = Object.keys(scheduleDistribution);
                    const allScheduleNumbers = [...new Set(obj["ScheduleDetails"].map(sd => sd.ScheduleNumber))];
                    const schedulesWithoutClaimants = allScheduleNumbers.filter(sn => !schedulesWithClaimants.includes(sn));
                    if (schedulesWithoutClaimants.length > 0) {
                        let errorMessage = schedulesWithoutClaimants.join(', ')+" Each schedule in partition must have at least one claimant.";
                        mutationdata = {
                            'bookNo': reqData.bookNo,
                            'docNo': reqData.docNo,
                            'regYear': reqData.regYear,
                            'srCode': reqData.srCode,
                            'mutation_error_log': errorMessage,
                            'mutation_status': 'N',
                            'SCHEDULE_NO': obj['ScheduleDetails'].map(sd => sd.ScheduleNumber).join(','),
                            'MUTATION_VALUE': obj['ScheduleDetails'].map(sd => sd.LPMNumber).join(','),
                            'PROPERTY_TYPE': 'RL',
                            'REQ_BODY':typeof obj === 'object' ? JSON.stringify(obj, null, 2) : '',
                            'RESPONSE': typeof schedulesWithoutClaimants === 'object' ? JSON.stringify(schedulesWithoutClaimants, null, 2) : ''
                        }
                        let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                        throw Error(errorMessage);
                    }
                } else {
                    // (Sale/Gift)
                    for (let claimant of claimants) {
                        obj["ClaimantDetails"].push(createClaimantDetails(claimant));
                    }
                }
                // Final validation
                if (obj["ClaimantDetails"].length === 0) {
                    throw Error(`No claimant details generated for transaction type ${transactionType}.`);
                }

                if (obj['ScheduleDetails'].length) {
                    Logger.error(`LPM reqData ${reqData.srCode}-${reqData.bookNo}-${reqData.docNo}-${reqData.regYear} =====> ${JSON.stringify(obj)}`, '');
                    let postResult = await this.postAutomutationData(obj, tokenresult.Data, transactionType);
                    if (postResult.Code === '100' || postResult.Message == 'Document already exists' ||
                        `${postResult.data}`.toLowerCase().includes('success') ||
                        `${postResult.Message}`.toLowerCase().includes('success') ||
                        `${postResult.Message}`.toLowerCase().includes('violation of primary key constraint') ||
                        `${postResult.Message}`.toLowerCase().includes('successfully received') ||
                        `${postResult.Message}`.toLowerCase().includes('sro code pid already exists')) {
                        let t_data = {
                            'SR_CODE': reqData.srCode,
                            'BOOK_NO': reqData.bookNo,
                            'DOCT_NO': reqData.docNo,
                            'REG_YEAR': reqData.regYear,
                            'TYPE': 'LPM',
                            'S_LP_NO': obj['ScheduleDetails'].map(sd => sd.LPMNumber).join(','),
                            'REQ_BODY': this.CircularStringify(obj) || '',
                            'RESPONSE': this.CircularStringify(postResult) || ''
                        };
                        this.updateMutationSentData(t_data);
                        reqData.STATUS = 'F';
                        reqData.RES_OBJ = {
                            status: true,
                            message: "AutoMutation Successfull",
                        };
                        const result = await this.updateStatusFromMutationAPI(reqData);
                        if( result === true) {
                            return  reqData.RES_OBJ;
                        }
                         else {
                            return {status : false, message: result };
                        }
                    } else {
                        mutationdata = {
                            'bookNo': reqData.bookNo,
                            'docNo': reqData.docNo,
                            'regYear': reqData.regYear,
                            'srCode': reqData.srCode,
                            'mutation_error_log': postResult.Message,
                            'mutation_status': 'N',
                            'SCHEDULE_NO': obj['ScheduleDetails'].map(sd => sd.ScheduleNumber).join(','),
                            'MUTATION_VALUE': obj['ScheduleDetails'].map(sd => sd.LPMNumber).join(','),
                            'PROPERTY_TYPE': 'RL',
                            'REQ_BODY':typeof obj === 'object' ? JSON.stringify(obj, null, 2) : '',
                            'RESPONSE': typeof postResult === 'object' ? JSON.stringify(postResult, null, 2) : ''
                        }
                        let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                        Logger.error(`LPM error ${reqData.srCode}-${reqData.bookNo}-${reqData.docNo}-${reqData.regYear} =====> ${typeof postResult === 'object' ? JSON.stringify(postResult) : ''}`, '');
                        throw Error(postResult && postResult.Message ? postResult.Message : 'Automutation Failed')
                    }
                }
                 else {
                    throw Error('No LPM number based schedules found.')
                }
            }
             else {
                throw Error('Token Generation Failed')
            }

        } catch (err) {
            console.error("MutationServices - PostLPMData || Error :", err);
            const cardError = constructCARDError(err);
            throw Error(cardError.message);
        }
    }

    MutationForDocument = async (reqData,adangalDetailsMap) => {
        try {
            //get subdivision details
            let ourDBresults = await this.mutationServices.getSubDivSrvc({ ...reqData, flag: 1 });
            //get checkslip data
            let data = await this.checkSlip.getCheckSlipReportsSrvc({ ...reqData, flag: 1 });
            if (!data || !Array.isArray(data.docDetails) || data.docDetails.length === 0) {
                throw new Error('Document details not found');
            }
            reqData.checkSlipData = data;
            //get property(schedules) data
            let schedules = get(data, 'schedule', []).filter(s => s.NATURE_USE != null && s.NATURE_USE != "null" && s.NATURE_USE != undefined);
            if (schedules.length === 0) {
                const bindparam = {
                    SR_CODE: reqData.srCode,
                    BOOK_NO: reqData.bookNo,
                    REG_YEAR: reqData.regYear,
                    DOCT_NO: reqData.docNo
                }
                const result = await this.mutationServices.handleMovetoScan(bindparam);
                return result;
            }
            //get only lpm (schedules)
            let filteredSchedules = schedules.filter(s => s.LP_NO);
            let reqbodys = [];
            let mutationdata;
            //check mutationcondition -- needed or not
            if (!await this.mutationServices.isMutationNeeded(data)) {
                reqData.mutation_message = "No Mutation needed. Status Changed Successfully";
                reqData.STATUS = 'F';
                const result = await this.updateStatusFromMutationAPI(reqData);
                if(result === true) {
                    return {status : true, message: "No Mutation needed. Status Changed Successfully"};
                }
                else {
                    return {status : false, message : result}
                }
            } else {
                if (ourDBresults.length) {
                    let docDet = data.docDetails[0];
                    // return res.status(200).send(data)
                    //get claimants details only from subdivision data
                    let claimants = get(data, 'partyDetails', []).filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
                    if (claimants.length === 0) {
                        throw Error('Claimants not found')               
                    }                 

                    /*
                    let indexArr = [];
                    let filteredDBResults = ourDBresults.filter((o, index) => {
                        if (indexArr.includes(`${o.SURVEY_NO}(${o.SCHEDULE_NO})`)) {
                            return false;
                        } else {
                            indexArr.push(`${o.SURVEY_NO}(${o.SCHEDULE_NO})`)
                            return true;
                        }
                    });
                    */
                    // Group results by district code
                    let districtGroups = {};
                    ourDBresults.forEach(result => {
                        // let villageCode = result.VILLAGE_CODE;
                        let villageCode = Number(result.VILLAGE_CODE).toString();
                        let distCode = villageCode.length === 6 ? villageCode.substring(0, 1) : villageCode.substring(0, 2);

                        if (!districtGroups[distCode]) {
                            districtGroups[distCode] = [];
                        }
                        districtGroups[distCode].push(result);
                    });
                    let date = formatDate(docDet.R_DATE, true);
                    // let docLink = `${process.env.BACKEND_URL}/files/${reqData.srCode}/${reqData.bookNo}/${reqData.docNo}/${reqData.regYear}/signedBundledDocument.pdf`;
                    let docLink = data.docStatus[0].DOC_TYPE === 'P' ? await this.mutationServices.getFilePath(reqData) : `${process.env.BACKEND_URL}/files/${reqData.srCode}/${reqData.bookNo}/${reqData.docNo}/${reqData.regYear}/signedBundledDocument.pdf`;
                    // if (data.docStatus[0].DOC_DIGI_SIGN != 'Y') {
                    //     return res.status(400).send({
                    //         status: false,
                    //         message: "Please complete digital sign"
                    //     })
                    // }
                    // need to confirm district code, transaction type
                    if (docDet.TRAN_MAJ_CODE == '04') {
                        let xmlRequests = []

                        // Process each district group separately
                        for (let distCode in districtGroups) {
                            let filteredDBResults = districtGroups[distCode];
                            let sropid = filteredDBResults[0].SRO_PID; // Use SRO_PID from first result in this district
                            let villageCode = Number(filteredDBResults[0].VILLAGE_CODE).toString(); // Use village code from first result in this district
                            let mndlCode = villageCode.length === 6 ? villageCode.substring(1, 3) : villageCode.substring(2, 4);

                            let docPart = `<?xml version="1.0" encoding="utf-8"?> <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><PostofAutomutationPartitionAPI xmlns="http://tempuri.org/"> 
                                <DistrictCode>${distCode}</DistrictCode> 
                                <AutoMutationDocumentDetails> 
                                <SroCodePID>${sropid}</SroCodePID> 
                                <SroCode>${reqData.srCode}</SroCode> 
                                <DocumentNumber>${docDet.DOCT_NO}</DocumentNumber> 
                                <RegistrationYear>${reqData.regYear}</RegistrationYear> 
                                <RegistrationDate>${date}</RegistrationDate> 
                                <DocumentLink>${docLink ? docLink : "http://docLink"}</DocumentLink> 
                                <TranscationType>${docDet.TRAN_MAJ_CODE}</TranscationType> 
                                <DistrictCode>0</DistrictCode> 
                                <MandalCode>0</MandalCode> 
                                <VillageCode>0</VillageCode>`
                            let schedulesPart = `<scheduleDetails>`;
                            let claimantsPart = `<claimantDetails>`;
                            let executantSchedules = []
                            let serialNumber = 0

                            // Process only results for this district
                            for (let f of filteredDBResults) {
                                let villageCode = Number(f.VILLAGE_CODE).toString();
                                let DistCode = villageCode.length === 6 ? villageCode.substring(0, 1) : villageCode.substring(0, 2);
                                let mndlCode = villageCode.length === 6 ? villageCode.substring(1, 3) : villageCode.substring(2, 4);
                                let filteredClaimantArray = []
                                let compSch = []
                                schedules.filter(async sc => {
                                    sc.S_LP_NO = sc.S_LP_NO.trim()
                                    //get adangal details from webland
                                    // let adangals = await this.getAdangalDetails(sc.S_LP_NO, sc.VILLAGE_CODE_1);
                                    let adangals
                                    let key = sc.S_LP_NO + "_" + sc.VILLAGE_CODE_1
                                    if (adangalDetailsMap != undefined) {
                                        if (adangalDetailsMap[key] != undefined) {
                                            adangals = adangalDetailsMap[key]
                                        console.log("adangals from map::::::::::",adangals)
                                        } else {
                                            adangals = await this.getAdangalDetails(sc.S_LP_NO, sc.VILLAGE_CODE_1);
                                            adangalDetailsMap[key] = adangals;
                                        }
                                    } else {
                                        adangalDetailsMap = {};
                                        adangals = await this.getAdangalDetails(sc.S_LP_NO, sc.VILLAGE_CODE_1);
                                        adangalDetailsMap[key] = adangals;
                                    }
                                 console.log("adangals::::::::::",adangals)
                                    let fullOrPart;
                                    if (adangals && adangals.length && adangals[0].occupantKhataNo && Number(adangals[0].occupantKhataNo)) {
                                        let adangal = adangals.filter(ad => { return ad.occupantKhataNo == sc.KHATA_NO })
                                        if (Number(sc.SELLING_EXTENT) === Number(adangal?.occupantExtent ? adangal?.occupantExtent : sc.TOTAL_EXTENT)) {
                                            if (adangal.length >= 2) {
                                                fullOrPart = 'P'
                                            }
                                            else {
                                                fullOrPart = 'F'
                                            }
                                        }
                                        else {
                                            fullOrPart = 'P'
                                        }
                                        // if selling extent is not full (partial) then remaining extent need to update in adangal for exicutant
                                        if ((fullOrPart != 'F') && (sc.S_LP_NO == f.SUB_DIV_SURVEY)) {
                                            if (compSch.includes(sc.S_LP_NO)) {
                                                return true;
                                            }
                                            else {
                                                compSch.push(sc.S_LP_NO)
                                                return executantSchedules.push({ "schedule": f.SCHEDULE_NO, "survNo": f.SUB_DIV_SURVEY, "khataNo": f.KATA_NO, "villageCode": f.VILLAGE_CODE, "isPattadar": "Y" })
                                            }
                                        }
                                    } else {
                                        mutationdata = {
                                            'bookNo': reqData.bookNo,
                                            'docNo': reqData.docNo,
                                            'regYear': reqData.regYear,
                                            'srCode': reqData.srCode,
                                            'mutation_error_log': 'adangals Not found for surveyNumber' + `${f.SUB_DIV_SURVEY}`,
                                            'mutation_status': 'N',
                                            'SCHEDULE_NO': filteredDBResults.map(f => f.SCHEDULE_NO).join(','),
                                            'MUTATION_VALUE': filteredDBResults.map(f => f.SURVEY_NO).join(','),
                                            'PROPERTY_TYPE': 'R',
                                            'REQ_BODY':JSON.stringify({S_LP_NO:sc.S_LP_NO, VILLAGE_CODE_1: sc.VILLAGE_CODE_1}),
                                            'RESPONSE': typeof adangals === 'object' ? JSON.stringify(adangals, null, 2) : ''
                                        }
                                        let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                                        throw Error(`Adangals not found for survey number: ${sc.S_LP_NO}`);
                                    }
                                });
                                let isPattadar = ''
                                //Filter the property deatils of schedule number with subdivision schedule number 
                                let findParty = schedules.filter(sc => { return sc.SCHEDULE_NO == f.SCHEDULE_NO })
                                // let findEcNumber=findParty.length ? findParty[0].PARTY_NO : 0
                                // let filteredClaimant = claimants.filter(c => { return c.EC_NUMBER == findEcNumber })
                                if (findParty.length > 0) {
                                    //get the party numbers from the schedule details
                                    let partyNos = `${findParty[0].P_PARTY_NO}`.split(',').map(p => p.trim());
                                    // filtered schedules party numbers with claimants ec number
                                    let filteredClaimantsData = claimants
                                        .filter(c => partyNos.includes(`${c.EC_NUMBER}`.trim()))
                                        .map(fc => ({ ...fc, SCHEDULE_NO: findParty[0].SCHEDULE_NO }));
                                    filteredClaimantArray.push(...filteredClaimantsData);
                                }
                                // filter the executant schedules of survey and khatha number with subdivision details of survey and khatha number
                                let findExecutant = executantSchedules.filter(sur => { return sur.survNo == f.SUB_DIV_SURVEY && sur.khataNo == f.KATA_NO })
                                if (findExecutant.length) {
                                    findExecutant[0].survNo = findExecutant[0]?.survNo.trim()
                                    // check again exicutatant adangal details with survey number and village code
                                    // let adangals = await this.getAdangalDetails(findExecutant[0]?.survNo, findExecutant[0].villageCode);
                                    let adangals
                                    let key = findExecutant[0]?.survNo + "_" + findExecutant[0].villageCode
                                    if (adangalDetailsMap != undefined) {
                                        if (adangalDetailsMap[key] != undefined) {
                                            adangals = adangalDetailsMap[key]
                                        console.log("adangals from map::::::::::",adangals)
                                        } else {
                                            adangals = await this.getAdangalDetails(findExecutant[0]?.survNo, findExecutant[0].villageCode);
                                            adangalDetailsMap[key] = adangals;
                                        }
                                    } else {
                                        adangalDetailsMap = {};
                                        adangals = await this.getAdangalDetails(findExecutant[0]?.survNo, findExecutant[0].villageCode);
                                        adangalDetailsMap[key] = adangals;
                                    }
                                console.log("adangals::::::::::",adangals)
                                    if (adangals && adangals.length && adangals[0].occupantKhataNo && Number(adangals[0].occupantKhataNo)) {
                                        //check the condition of exicutant of khatha with adangal khatha number
                                        let allotClaimant = adangals.filter(ad => { return ad.occupantKhataNo == findExecutant[0].khataNo })
                                        allotClaimant[0]["isPattadar"] = "Y"
                                        isPattadar = 'Y'
                                        let p = get(filteredClaimantArray, 'PHOTO.data', '');
                                        serialNumber += 1

                                        let idInfo = this.getIdTypeAndNumber(allotClaimant[0]?.adharNumber || "");
                                        let idType = idInfo.idType;
                                        let idNumber = idInfo.idNumber;

                                        if (idType === 0) {
                                            mutationdata = {
                                                'bookNo': reqData.bookNo,
                                                'docNo': reqData.docNo,
                                                'regYear': reqData.regYear,
                                                'srCode': reqData.srCode,
                                                'mutation_error_log': 'Invalid ID number. Please provide a valid Aadhaar/TIN/TAN/PAN number.',
                                                'mutation_status': 'N',
                                                'SCHEDULE_NO': filteredDBResults.map(f => f.SCHEDULE_NO).join(','),
                                                'MUTATION_VALUE': filteredDBResults.map(f => f.SURVEY_NO).join(','),
                                                'PROPERTY_TYPE': 'R',
                                                'REQ_BODY': allotClaimant[0]?.adharNumber ? `${allotClaimant[0]?.adharNumber}`:'',
                                                'RESPONSE': typeof idInfo === 'object' ? JSON.stringify(idInfo) :''
                                            }
                                            let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                                            throw Error('Invalid ID number. Please provide a valid Aadhaar/TIN/TAN/PAN number.')
                                            // return res.status(400).send({
                                            //     status: false,
                                            //     message: 'Invalid ID number. Please provide a valid Aadhaar/TIN/TAN/PAN number.',
                                            //     'surveyRequestBody': reqbodys
                                            // });
                                        }
                                        //send the executant deatils for mutation (if sell the partial property)
                                        claimantsPart = claimantsPart + `<ClaimantDetails>
                                    <SroCodePID>${sropid}</SroCodePID>
                                    <SubDivisionTranscationId>${f.WEBLAND_TRAN_ID}</SubDivisionTranscationId>
                                    <ClaimantSerialNumber>${serialNumber}</ClaimantSerialNumber>
                                    <SroCode>${reqData.srCode}</SroCode>
                                    <DocumentNumber>${docDet.DOCT_NO}</DocumentNumber>
                                    <RegistrationYear>${reqData.regYear}</RegistrationYear>
                                    <BuyerName>${returnCleanSpecialCharacters(allotClaimant[0].occupantName)}</BuyerName>
                                    <BuyerRelationName>${returnCleanSpecialCharacters(allotClaimant[0].fatherName)}</BuyerRelationName>
                                    <BuyerPhoto>""</BuyerPhoto>
                                    <IdType>${idType}</IdType>
                                    <IdNumber>${idNumber}</IdNumber>
                                    <Address>""</Address>
                                    <PinCode>518122</PinCode>
                                    <MobileNumber>${9999999}</MobileNumber>
                                    <Gender>M</Gender>
                                    <Caste>OC</Caste>
                                    <Religion>HINDU</Religion>
                                    <Email>cr@test.com</Email>
                                    <IsPattadar>${isPattadar ? isPattadar == 'Y' ? 'Y' : 'N' : 'N'}</IsPattadar>
                                    <BuyerKhata>${allotClaimant[0].occupantKhataNo}</BuyerKhata>
                                    <ScheduleNumber>${f.SCHEDULE_NO}</ScheduleNumber>
                                </ClaimantDetails>`

                                    }
                                    else {
                                        mutationdata = {
                                            'bookNo': reqData.bookNo,
                                            'docNo': reqData.docNo,
                                            'regYear': reqData.regYear,
                                            'srCode': reqData.srCode,
                                            'mutation_error_log': 'adangals Not found for surveyNumber' + `${f.SURVEY_NO}`,
                                            'mutation_status': 'N',
                                            'SCHEDULE_NO': filteredDBResults.map(f => f.SCHEDULE_NO).join(','),
                                            'MUTATION_VALUE': filteredDBResults.map(f => f.SURVEY_NO).join(','),
                                            'PROPERTY_TYPE': 'R',
                                            'REQ_BODY':JSON.stringify({survNo:findExecutant[0]?.survNo, villageCode:  findExecutant[0].villageCode}),
                                            'RESPONSE': typeof adangals === 'object' ? JSON.stringify(adangals, null, 2) : ''
                                        }
                                        let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                                        throw Error('adangals Not found for surveyNumber' + `${f.SURVEY_NO}`)
                                    }
                                }
                                else {
                                    // send Claimant details for mutation in XML format 
                                    for (const filteredClaimant of filteredClaimantArray) {
                                        let p = get(filteredClaimant, 'PHOTO.data', "");
                                        serialNumber += 1
                                        let idInfo = this.getIdTypeAndNumber((filteredClaimant?.AADHAR+'') || (filteredClaimant?.AADHAR_1+'') || "");
                                        let idType = idInfo.idType;
                                        let idNumber = idInfo.idNumber;
                                        if (idType === 0) {
                                            mutationdata = {
                                                'bookNo': reqData.bookNo,
                                                'docNo': reqData.docNo,
                                                'regYear': reqData.regYear,
                                                'srCode': reqData.srCode,
                                                'mutation_error_log': 'Invalid ID number. Please provide a valid Aadhaar/TIN/TAN/PAN number.',
                                                'mutation_status': 'N',
                                                'SCHEDULE_NO': filteredDBResults.map(f => f.SCHEDULE_NO).join(','),
                                                'MUTATION_VALUE': filteredDBResults.map(f => f.SURVEY_NO).join(','),
                                                'PROPERTY_TYPE': 'R',
                                                'REQ_BODY': `${filteredClaimant?.AADHAR}`,
                                                'RESPONSE': typeof idInfo === 'object' ? JSON.stringify(idInfo) : ''
                                            }
                                            let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                                            throw Error('Invalid ID number. Please provide a valid Aadhaar/TIN/TAN/PAN number.')
                                        }
                                        //send the claimant deatils for mutation
                                        claimantsPart = claimantsPart + `<ClaimantDetails>
                                    <SroCodePID>${f.SRO_PID}</SroCodePID>
                                    <SubDivisionTranscationId>${f.WEBLAND_TRAN_ID}</SubDivisionTranscationId>
                                    <ClaimantSerialNumber>${serialNumber}</ClaimantSerialNumber>
                                    <SroCode>${reqData.srCode}</SroCode>
                                    <DocumentNumber>${docDet.DOCT_NO}</DocumentNumber>
                                    <RegistrationYear>${reqData.regYear}</RegistrationYear>
                                    <BuyerName>${returnCleanSpecialCharacters(filteredClaimant?.NAME)}</BuyerName>
                                    <BuyerRelationName>${returnCleanSpecialCharacters(filteredClaimant?.R_NAME)}</BuyerRelationName>
                                    <BuyerPhoto>${filteredClaimant?.PHOTO ? toBase64(p ? p : filteredClaimant?.PHOTO, !!p) : ""}</BuyerPhoto>
                                    <IdType>${idType}</IdType>
                                    <IdNumber>${idNumber}</IdNumber>
                                    <Address>${filteredClaimant?.ADDRESS1 ? returnCleanAddress(filteredClaimant?.ADDRESS1) : ""}</Address>
                                    <PinCode>518122</PinCode>
                                    <MobileNumber>${filteredClaimant?.PHONE_NO}</MobileNumber>
                                    <Gender>M</Gender>
                                    <Caste>OC</Caste>
                                    <Religion>HINDU</Religion>
                                    <Email>${filteredClaimant?.EMAIL_ID ? filteredClaimant?.EMAIL_ID : 'cr@test.com'}</Email>
                                    <IsPattadar>${isPattadar ? isPattadar == 'Y' ? 'Y' : 'N' : 'N'}</IsPattadar>
                                    <BuyerKhata>${f?.KATA_NO}</BuyerKhata>
                                    <ScheduleNumber>${f.SCHEDULE_NO}</ScheduleNumber>
                                    </ClaimantDetails>`
                                    }
                                }
                                // schedule details 
                                schedulesPart = schedulesPart + ` <ScheduleDetails> 
                                    <SroCodePID>${f.SRO_PID}</SroCodePID> 
                                    <SubDivisionTranscationId>${f.WEBLAND_TRAN_ID}</SubDivisionTranscationId> 
                                    <SroCode>${reqData.srCode}</SroCode> 
                                    <DocumentNumber>${docDet.DOCT_NO}</DocumentNumber> 
                                    <RegistrationYear>${reqData.regYear}</RegistrationYear> 
                                    <ScheduleNumber>${f.SCHEDULE_NO}</ScheduleNumber> 
                                    <DistrictCode>${DistCode}</DistrictCode> 
                                    <MandalCode>${mndlCode}</MandalCode> 
                                    <VillageCode>${villageCode}</VillageCode> 
                                    <SurveyNumber>${f.SUB_DIV_SURVEY.replaceAll('/', '/')}</SurveyNumber> 
                                    <IsPattadar>${isPattadar ? isPattadar == 'Y' ? 'Y' : 'N' : 'N'}</IsPattadar> 
                                    </ScheduleDetails> `
                            }
                            schedulesPart = schedulesPart + `</scheduleDetails>`
                            claimantsPart = claimantsPart + `</claimantDetails></AutoMutationDocumentDetails>
                    <username>${process.env.PARTITION_AUTOMUTATION_USERNAME}</username>
                    <password>${process.env.PARTITION_AUTOMUTATION_PASSWORD}</password>
                  </PostofAutomutationPartitionAPI>
                </soap:Body>
              </soap:Envelope>`

                            let body = docPart + schedulesPart + claimantsPart;
                            // return res.status(200).send(body);
                            Logger.error(`survey mutation reqData body :::: ${reqData.srCode}-${reqData.bookNo}-${reqData.docNo}-${reqData.regYear} =====> ${body}`, '');
                            console.log(body);
                            reqbodys.push(body);
                            xmlRequests.push({
                                distCode: distCode,
                                body: body
                            });
                        }
                        for (let xml of xmlRequests) {
                            let currentDistrictResults = districtGroups[xml.distCode];
                            let config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: `${process.env.PARTITIONDEED_MUTATION_BASE_URL}`,
                                headers: {
                                    'Content-Type': 'text/xml;charset=UTF-8',
                                    'Accept': '*/*',
                                },
                                data: xml.body
                            };
                            let result = await axios.request(config);
                            console.log(result.data);
                            if (result.data.toLowerCase().includes('document already exists') ||
                                `${result.data}`.toLowerCase().includes('success') ||
                                `${result.data}`.toLowerCase().includes('violation of primary key constraint') ||
                                `${result.data}`.toLowerCase().includes('successfully received') ||
                                `${result.data}`.toLowerCase().includes('sro code pid already exists')) {
                                 let t_data = {
                                'SR_CODE': reqData.srCode,
                                'BOOK_NO': reqData.bookNo,
                                'DOCT_NO': reqData.docNo,
                                'REG_YEAR': reqData.regYear,
                                'TYPE': 'SURVEY',
                                'S_LP_NO': currentDistrictResults.map(f => f.SURVEY_NO).join(','),
                                'REQ_BODY':JSON.stringify(xml.body, null, 2) || '',
                                'RESPONSE': this.CircularStringify(result) || ''
                            };
                            this.updateMutationSentData(t_data);
                            }
                            else {
                                Logger.error(`Mutation request body error ==> ${xml.body} and response ===> ${result.data}`, '');
                                let error = `${result.data}`.match(new RegExp('<PostofAutomutationPartitionAPIResult>' + "(.*)" + '</PostofAutomutationPartitionAPIResult>'))[1]
                                if (error == 'There is no transcation at sub division request' || error.indexOf('Sub Division Transcation Ids not available with SRO Code PID') > -1) {
                                    let query = `DELETE SROUSER.SUB_DIV_SURVEY WHERE DOCT_NO=:DOCT_NO and SR_CODE=:SR_CODE and REG_YEAR=:REG_YEAR`;
                                    let bindParams = {
                                        DOCT_NO:reqData.docNo,
                                        SR_CODE:reqData.srCode,
                                        REG_YEAR:reqData.regYear
                                    }
                                    // let data = await this.mutationServices.deleteSubDivSrvc(query);
                                    let data = await this.orDao.oDbDeleteDocsWithBindParams(query,bindParams)
                                    // if (data) {
                                    // error = `Please complete the subdivision again, After subdivision please complete mutation within 48 hours.`
                                    // // let p = {
                                    // //     'SR_CODE': reqData.srCode,
                                    // //     'BOOK_NO': reqData.bookNo,
                                    // //     'DOCT_NO': reqData.docNo,
                                    // //     'REG_YEAR': reqData.regYear,
                                    // //     'TYPE': 'SURVEY',
                                    // //     'S_LP_NO': filteredDBResults.map(f => f.SURVEY_NO).join(',')
                                    // // }
                                    // await this.updateMutationSentData(p)
                                    reqData.STATUS = 'W';
                                    reqData.subDiv = 'N';
                                    await this.updateStatusFromMutationAPI(reqData);
                                    // // }
                                    let mutationResponse = await this.doSubDivisionAndMutation(reqData, reqData.subDiv);
                                    return mutationResponse;
                                }else{
                                    mutationdata = {
                                        'bookNo': reqData.bookNo,
                                        'docNo': reqData.docNo,
                                        'regYear': reqData.regYear,
                                        'srCode': reqData.srCode,
                                        'mutation_error_log': error,
                                        'mutation_status': 'N',
                                        'SCHEDULE_NO': currentDistrictResults.map(f => f.SCHEDULE_NO).join(','),
                                        'MUTATION_VALUE': currentDistrictResults.map(f => f.SURVEY_NO).join(','),
                                        'PROPERTY_TYPE': 'R',
                                        'REQ_BODY': xml.body || '',
                                        'RESPONSE': typeof result === 'object' ? JSON.stringify(result.data) :''
                                    }
                                    let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata, false);
                                    return {
                                        status: false,
                                        message: error ? error : 'Automutation Failed',
                                        'surveyRequestBody': reqbodys
                                    };
                                }
                            }
                        }
                    }

                    else {
                        let xmlRequests = []

                        // Process each district group separately
                        for (let distCode in districtGroups) {
                            let filteredDBResults = districtGroups[distCode];
                            let sropid = filteredDBResults[0].SRO_PID; // Use SRO_PID from first result in this district
                            let villageCode = Number(filteredDBResults[0].VILLAGE_CODE).toString(); // Use village code from first result in this district
                            let mndlCode = villageCode.length === 6 ? villageCode.substring(1, 3) : villageCode.substring(2, 4);


                            let body = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><PostofAutomutationAPI xmlns="http://tempuri.org/"><DistrictCode>${distCode}</DistrictCode><AutoMutationDocumentDetails><DocumentNumber>${docDet.DOCT_NO}</DocumentNumber><RegistrationYear>${reqData.regYear}</RegistrationYear><SroCode>${reqData.srCode}</SroCode><RegistrationDate>${date}</RegistrationDate><DocumentLink>${docLink}</DocumentLink><TranscationType>${docDet.TRAN_MAJ_CODE}</TranscationType><SROCODE_PID>${sropid}</SROCODE_PID><DistrictCode>0</DistrictCode><MandalCode>0</MandalCode><VillageCode>0</VillageCode><scheduleDetails>`;
                            filteredDBResults.forEach(f => {
                                let matchedSchedule = schedules.find(s => s.KHATA_NO && f.KATA_NO && String(s.KHATA_NO).trim() === String(f.KATA_NO).trim() && String(s.SCHEDULE_NO) === String(f.SCHEDULE_NO) );
                                if (matchedSchedule) {
                                    let villageCode = Number(f.VILLAGE_CODE).toString();
                                    let DistCode = villageCode.length === 6 ? villageCode.substring(0, 1) : villageCode.substring(0, 2);
                                    let mndlCode = villageCode.length === 6 ? villageCode.substring(1, 3) : villageCode.substring(2, 4);
                                    let sh = `<ScheduleDetails><SubDivisionTranscationId>${f.WEBLAND_TRAN_ID}</SubDivisionTranscationId><DocumentNumber>${docDet.DOCT_NO}</DocumentNumber><RegistrationYear>${reqData.regYear}</RegistrationYear><SroCode>${reqData.srCode}</SroCode><ScheduleNumber>${f.SCHEDULE_NO}</ScheduleNumber><DistrictCode>${DistCode}</DistrictCode><MandalCode>${mndlCode}</MandalCode><VillageCode>${villageCode}</VillageCode><SurveyNumber>${f.SUB_DIV_SURVEY.replaceAll('/', '/')}</SurveyNumber></ScheduleDetails>`;
                                    body = body + sh;
                                }
                            });
                            body = body + `</scheduleDetails><claimantDetails>`;
                            // claimants.forEach(c => {
                            //     let p = get(c, 'PHOTO.data', '');
                            //     let cl = `<ClaimantDetail><DocumentNumber>${docDet.DOCT_NO}</DocumentNumber><RegistrationYear>${reqData.regYear}</RegistrationYear><SroCode>${reqData.srCode}</SroCode><BuyerName>${c.NAME}</BuyerName><BuyerRelationName>${c.R_NAME}</BuyerRelationName><BuyerPhoto>${c.PHOTO ? toBase64(p ? p : c.PHOTO, !!p) : ''}</BuyerPhoto><IdType>1</IdType><IdNumber>${c.AADHAR}</IdNumber><ECNumber>${c.EC_NUMBER}</ECNumber><Address>${returnCleanAddress(c.ADDRESS1)}</Address><PinCode>518122</PinCode><MobileNumber>${c.PHONE_NO}</MobileNumber><Gender>M</Gender><Caste>OC</Caste><Religion>Hindu</Religion><Email>${c.EMAIL_ID ? c.EMAIL_ID : 'cr@test.com'}</Email><BuyerKhata>0</BuyerKhata></ClaimantDetail>`;
                            //     body = body + cl;
                            // });
                            let uniqueDataArray = [];
                            let uniqueAadharArray = [];
                            let processedClaimants = []; // Store processed claimant XML
                            // claimants.forEach(c => {
                        for(let c of claimants){
                                //Below logic is adding to remove the duplicate claimant data from the db results.
                                let isValidClaimant = false;
                                let uniqueyForClaimant = c.SR_CODE + "-" + c.BOOK_NO + "-" + c.DOCT_NO + "-" + c.REG_YEAR + "-" + c.EC_NUMBER + "-" + c.CODE;
                                if (uniqueDataArray.indexOf(uniqueyForClaimant) == -1) {
                                    let aadhaar = c.AADHAR;
                                    if (aadhaar) {
                                        if (uniqueAadharArray.indexOf(c.AADHAR) === -1) {
                                            uniqueDataArray.push(uniqueyForClaimant);
                                            uniqueAadharArray.push(c.AADHAR);
                                            isValidClaimant = true;
                                        }
                                    }
                                    else {
                                        uniqueDataArray.push(uniqueyForClaimant);
                                        isValidClaimant = true;
                                    }
                                }
                                if (isValidClaimant) {
                                    let p = get(c, 'PHOTO.data', '');
                                    let idInfo = this.getIdTypeAndNumber((c.AADHAR+'') || (c.AADHAR_1+''));
                                    let idType = idInfo.idType;
                                    let idNumber = idInfo.idNumber;

                                    if (idType === 0) {
                                        mutationdata = {
                                            'bookNo': reqData.bookNo,
                                            'docNo': reqData.docNo,
                                            'regYear': reqData.regYear,
                                            'srCode': reqData.srCode,
                                            'mutation_error_log': 'Invalid ID number. Please provide a valid Aadhaar/TIN/TAN/PAN number.',
                                            'mutation_status': 'N',
                                            'SCHEDULE_NO': filteredDBResults.map(f => f.SCHEDULE_NO).join(','),
                                            'MUTATION_VALUE': filteredDBResults.map(f => f.SURVEY_NO).join(','),
                                            'PROPERTY_TYPE': 'R',
                                            'REQ_BODY': `${c.AADHAR}`,
                                            'RESPONSE': typeof idInfo === 'object' ? JSON.stringify(idInfo) : ''
                                        }
                                        let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                                        return {
                                            status: false,
                                            message: "Invalid ID number. Please provide a valid Aadhaar/TIN/TAN/PAN number."
                                        };
                                    } else {
                                        let cl = `<ClaimantDetail><DocumentNumber>${docDet.DOCT_NO}</DocumentNumber><RegistrationYear>${reqData.regYear}</RegistrationYear><SroCode>${reqData.srCode}</SroCode><BuyerName>${returnCleanSpecialCharacters(c.NAME)}</BuyerName><BuyerRelationName>${returnCleanSpecialCharacters(c.R_NAME)}</BuyerRelationName><BuyerPhoto>${c.PHOTO ? toBase64(p ? p : c.PHOTO, !!p) : ''}</BuyerPhoto><IdType>${idType}</IdType><IdNumber>${idNumber}</IdNumber><ECNumber>${c.EC_NUMBER}</ECNumber><Address>${returnCleanAddress(c.ADDRESS1)}</Address><PinCode>518122</PinCode><MobileNumber>${c.PHONE_NO}</MobileNumber><Gender>M</Gender><Caste>OC</Caste><Religion>Hindu</Religion><Email>${c.EMAIL_ID ? c.EMAIL_ID : 'cr@test.com'}</Email><BuyerKhata>0</BuyerKhata></ClaimantDetail>`;
                                        processedClaimants.push(cl);
                                        // body = body + cl;
                                    }
                                }
                            }
                            // Add all unique claimants to the body
                            processedClaimants.forEach(claimant => {
                                body = body + claimant;
                            });
                            body = body + `</claimantDetails></AutoMutationDocumentDetails><username>${process.env.SURVEY_MUTATION_USERNAME}</username><password>${process.env.SURVEY_MUTATION_PASSWORD}</password></PostofAutomutationAPI></soap:Body></soap:Envelope>`;
                            // return res.status(200).send(body);
                            Logger.error(`survey mutation reqData body ${reqData.srCode}-${reqData.bookNo}-${reqData.docNo}-${reqData.regYear} =====> ${body}`, '');
                            reqbodys.push(body);
                            xmlRequests.push({
                                distCode: distCode,
                                body: body
                            });
                        }
                        for (let xml of xmlRequests) {
                            let currentDistrictResults = districtGroups[xml.distCode];
                            let config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: `${process.env.AUTOMUTATION_URL}`,
                                headers: {
                                    'Content-Type': 'text/xml;charset=UTF-8',
                                    'Accept': '*/*',
                                },
                                data: xml.body
                            };
                            let result;
                            try {
                                result = await axios.request(config);
                                if (`${result.data}`.toLowerCase().includes('document already exists') ||
                                    `${result.data}`.toLowerCase().includes('success') ||
                                    `${result.data}`.toLowerCase().includes('violation of primary key constraint') ||
                                    `${result.data}`.toLowerCase().includes('successfully received') ||
                                    `${result.data}`.toLowerCase().includes('sro code pid already exists')) {
                                        let t_data = {
                                    'SR_CODE': reqData.srCode,
                                    'BOOK_NO': reqData.bookNo,
                                    'DOCT_NO': reqData.docNo,
                                    'REG_YEAR': reqData.regYear,
                                    'TYPE': 'SURVEY',
                                    'S_LP_NO': currentDistrictResults.map(f => f.SURVEY_NO).join(','),
                                    'REQ_BODY': JSON.stringify(xml.body, null, 2) || '',
                                    'RESPONSE':  this.CircularStringify(result) || ''
                                };
                                await this.updateMutationSentData(t_data);

                                } else {
                                    Logger.error(`Mutation request body error ==> ${xml.body} and response ===> ${result.data}`, '');
                                    let error = `${result.data}`.match(new RegExp('<PostofAutomutationAPIResult>' + "(.*)" + '</PostofAutomutationAPIResult>'))[1]
                                    if (error == 'There is no transcation at sub division request' || error.indexOf('Sub Division Transcation Ids not available with SRO Code PID') > -1) {
                                        let query = `DELETE SROUSER.SUB_DIV_SURVEY WHERE DOCT_NO=:DOCT_NO and SR_CODE=:SR_CODE and REG_YEAR=:REG_YEAR`;
                                        let bindParams = {
                                            DOCT_NO: reqData.docNo,
                                            SR_CODE: reqData.srCode,
                                            REG_YEAR: reqData.regYear
                                        }
                                        // let data = await this.mutationServices.deleteSubDivSrvc(query);
                                        let data = await this.orDao.oDbDeleteDocsWithBindParams(query,bindParams)
                                        // if (data) {
                                        // error = `Please complete the subdivision again, After subdivision please complete mutation within 48 hours.`
                                        // let p = {
                                        //     'SR_CODE': reqData.srCode,
                                        //     'BOOK_NO': reqData.bookNo,
                                        //     'DOCT_NO': reqData.docNo,
                                        //     'REG_YEAR': reqData.regYear,
                                        //     'TYPE': 'SURVEY',
                                        //     'S_LP_NO': filteredDBResults.map(f => f.SURVEY_NO).join(',')
                                        // }
                                        // await this.updateMutationSentData(p)
                                        reqData.STATUS = 'W';
                                        reqData.subDiv = 'N';
                                        await this.updateStatusFromMutationAPI(reqData);
                                        let mutationResponse = await this.doSubDivisionAndMutation(reqData, reqData.subDiv);
                                        return mutationResponse;
                                    }else{
                                        mutationdata = {
                                            'bookNo': reqData.bookNo,
                                            'docNo': reqData.docNo,
                                            'regYear': reqData.regYear,
                                            'srCode': reqData.srCode,
                                            'mutation_error_log': error,
                                            'mutation_status': 'N',
                                            'SCHEDULE_NO': currentDistrictResults.map(f => f.SCHEDULE_NO).join(','),
                                            'MUTATION_VALUE': currentDistrictResults.map(f => f.SURVEY_NO).join(','),
                                            'PROPERTY_TYPE': 'R',
                                            'REQ_BODY': xml.body || '',
                                            'RESPONSE': typeof result === 'object' ? JSON.stringify(result.data) : ''
                                        }
                                        let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata, false);
                                        return {
                                            status: false,
                                            message: error ? error : 'Automutation Failed',
                                            'surveyRequestBody': reqbodys
                                        }
                                    }
                                }
                            }
                            catch (ex) {
                                mutationdata = {
                                    'bookNo': reqData.bookNo,
                                    'docNo': reqData.docNo,
                                    'regYear': reqData.regYear,
                                    'srCode': reqData.srCode,
                                    'mutation_error_log': ex.message,
                                    'mutation_status': 'N',
                                    'SCHEDULE_NO': currentDistrictResults.map(f => f.SCHEDULE_NO).join(','),
                                    'MUTATION_VALUE': currentDistrictResults.map(f => f.SURVEY_NO).join(','),
                                    'PROPERTY_TYPE': 'R',
                                    'REQ_BODY':xml.body || '',
                                    'RESPONSE': `${ex.message}`
                                }
                                let response = await this.mutationServices.Mutationerrorstoresrvc(mutationdata);
                                console.log("MutationServices - MutationForDocument || Error :", ex.message);
                                let cardError = constructCARDError(ex);
                                throw cardError;
                            }
                        }
                    }
                    if (!filteredSchedules.length) {
                        reqData.STATUS = 'F';
                        reqData.RES_OBJ = {
                            status: true,
                            message: "Automutation Successfull",
                        };
                        const result = await this.updateStatusFromMutationAPI(reqData);
                            if( result === true) {
                            return reqData.RES_OBJ;
                        }
                        else {
                                return {status : false, message: result};
                        }
                    } else {
                        let lpmResponse = await this.postLPMData(reqData);
                        return lpmResponse;
                    }
                } else {
                    if (filteredSchedules.length) {
                        let lpmResponse = await this.postLPMData(reqData);
                        return lpmResponse;
                    } else {
                        //not understanding this part
                        let ourDBresults = await this.mutationServices.getMutationSrvc({ ...reqData, flag: 1 });
                        reqData.STATUS = 'F';
                        reqData.RES_OBJ = {
                            status: true,
                            message: !ourDBresults.length ? 'Please complete the subdivision again, After subdivision please complete mutation within 48 hours' : "Mutation not needed. Status Change Successfull"
                        };
                        if (!ourDBresults.length) {
                            await this.updateStatusFromMutationAPI(reqData);
                        }
                        return reqData.RES_OBJ;
                    }
                }
            }
        } catch (ex) {
            console.log("MutationServices - MutationForDocument || Error :", ex);
            let cardError = constructCARDError(ex);
            return {
                status: false,
                message: cardError.message
            }
        }
    }
}

module.exports = MutationServices;
