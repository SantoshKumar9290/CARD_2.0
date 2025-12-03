const AutoMutationServices = require('../services/autoMutationService');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const axios = require('axios');
const checkSlipReportServices = require('../services/checkSlipReportServices');
const cashServices = require('../services/cashServices');
const { get } = require('lodash');
const { CODES } = require('../constants/appConstants');
const { getValue } = require('../utils');
const { xml2json } = require('xml-js');
const OrDao = require('../dao/oracledbDao');
const { SURVEY } = require('../utils/sysConstanst');
const { Logger } = require('../../services/winston');
const { cdmaHostURL, cdmaAPIs } = require('../constants/CDMAConstants')
const urbanService = require('../services/urbanService')
const MutationServices = require('../services/mutationServices')
const FormData = require('form-data');

class AutoMutationHandler {
    constructor() {
        this.automutationServices = new AutoMutationServices();
        this.checkSlip = new checkSlipReportServices();
        this.cashService = new cashServices();
        this.orDao = new OrDao();
        this.urbanService = new urbanService();
        this.mutationServices = new MutationServices();
    };

    getDocuments = async (req, res) => {
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
            let response = await this.automutationServices.getDocumentsSrvc(qParams);
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
            console.error("AutoMutationHandler - getDocuments || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getProperty = async (req, res) => {
        const qParams = req.query;
        if (qParams.srCode == null || qParams.bookNo == null || qParams.regYear == null || qParams.doctNo == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.automutationServices.getPropertyDetailsSrvc(qParams);
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
            console.error("AutoMutationHandler - getProperty || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getSurveyDetails = async (req, res) => {
        try {
            let response = await this.automutationServices.getSurveyDetails(req.query);
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
            console.error("AutoMutationHandler - getSurveyDetails || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    generateAutomutationToken = async (req, res) => {
        try {
            let details = await this.mutationServices.generateAutomutationToken();
            res.status(200).send({ ...details });
        } catch (ex) {
            console.error("AutoMutationHandler - generateAutomutationToken || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


    saveSubDiv = async (req, res) => {
        const reqQuery = req.body;
        try {
            let details = await this.automutationServices.saveSubDivSrvc(reqQuery);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: details
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("AutoMutationHandler - saveSubDiv || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }

    }


    sendRequestForSubdivision = async (req, res) => {
        const requestBody = req.body;
        const Data = ['data'];
        for (let field of Data) {
            if (!requestBody[field]) {
                return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).json({
                    status: false,
                    message: `Validation Error: '${field}' is required`
                });
            }
        }
        try {
            let details = await this.mutationServices.sendRequestForSubdivision(requestBody);
            res.status(200).send({ ...details });
        } catch (ex) {
            console.error("AutoMutationHandler - sendRequestForSubdivision || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getSurveyOrLPM = async (vCode) => {
        try {
            if (vCode) {
                let query = `select count(1) from card.gs_srcode where village_code = ${vCode.trim().length < 7 ? ('0' + vCode.trim()) : vCode}`;
                let response = await this.automutationServices.orDao.oDBQueryService(query);
                return response[0]['COUNT(1)'];
            } else {
                return null
            }
        } catch (err) {
            console.log('AutoMutationHandler - getSurveyOrLPM || Error :', err.message);
            return null;
        }
    }
    

    updateStatusFromMutationAPI = async (req, res) => {
        try {
            let j = {
                srCode: req.body.srCode,
                bookNo: req.body.bookNo,
                doctNo: req.body.docNo,
                regYear: req.body.regYear,
                status: req.body.STATUS,
                subDiv: req.body.subDiv ? req.body.subDiv : ''
            };
            let updateStatus = await this.cashService.updateApplicationStatus(j, true);
            if (req.body.statusFlag) {
                return true;
            } else {
                return res.status(200).send(req.body.RES_OBJ);
            }
        } catch (ex) {
            console.error("AutoMutationHandler - updateStatusFromMutationAPI || Error :", ex.message);
            let cardError = constructCARDError(ex);
            if (req.body.statusFlag) {
                return false;
            } else {
                return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                    {
                        status: false,
                        message: cardError.message
                    }
                );
            }
        }
    }

    isOnlyZeros = (str) => {
        return /^0+$/.test(str);
    }

    getIdTypeAndNumber = (idNumber) => {

        if (/^\d{12}$/.test(idNumber) && !this.isOnlyZeros(idNumber)) {
            return { idType: 1, idNumber }; // Aadhaar
        }
        const idNumberUpperCase = idNumber.toUpperCase();
        if (/^[a-zA-Z0-9]{11}$/.test(idNumberUpperCase) && !this.isOnlyZeros(idNumberUpperCase)) {
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

    previewSubDivision = async (req, res) => {
        try {
            // 1. Get document Details
            let data = await this.checkSlip.getCheckSlipReportsSrvc({ ...req.body, flag: 1 });
            // return res.status(200).send(data);
            if (this.automutationServices.isMutationNeeded(data)) {
                const major_code = get(data, 'docDetails.0.TRAN_MAJ_CODE', '');
                const minor_code = get(data, 'docDetails.0.TRAN_MIN_CODE', '');
                let schedules = get(data, 'schedule', []);
                if (req.body.ekycPreview) {
                    let AdangalSchedules = schedules.filter(f => f.S_LP_NO && CODES.AGRI_NATURE.includes(`${f.NATURE_USE}`));
                    if (!AdangalSchedules.length) {
                        req.body.RES_OBJ = {
                            status: true,
                            code: 0,
                            'message': 'No Sub Division needed. Status Changed Successfully'
                        };
                        req.body.STATUS = 'W';
                        await this.updateStatusFromMutationAPI(req, res);
                        return;
                    } else {
                        return res.status(200).send({ status: true, data: AdangalSchedules });
                    }
                } else {
                    // filter schedules which are not lpm
                    let filteredSchedules = schedules.filter(s => !s.LP_NO);
                    // filter schedules which has S_LP_NO and nature code should match to be agricultural.
                    let AdangalSchedules = filteredSchedules.filter(f => f.S_LP_NO && CODES.AGRI_NATURE.includes(`${f.NATURE_USE}`));
                    // prepare an arr which holds specific survey number to a schedule

                    let uniqueSureyNos = []
                    let nonUniqueSurveyNos = []
                    let isSurvCompleted = []
                    let completedKhataNos = []
                    let formattedArr = [];
                    if (major_code == '04' && ['01', '02'].includes(minor_code)) {
                        for (let i of AdangalSchedules) {
                            //storing unique survey nos 
                            if (!uniqueSureyNos.includes(i.S_LP_NO)) {
                                uniqueSureyNos.push(i.S_LP_NO)
                            }
                            nonUniqueSurveyNos.push(i.S_LP_NO)
                        }

                        function convertToDecimal(allotmentExtent) {
                            let p = allotmentExtent
                            if (`${allotmentExtent}`.includes(".") ? `${allotmentExtent}`.split(".")[1].length > 2 : 0) {
                                p = parseFloat((Math.round(p * 1000) / 1000).toString())
                                return p
                            }
                            else {
                                return parseFloat(allotmentExtent);
                            }
                        }


                        //     for(let srNo=0; srNo<uniqueSrNoarr.length; srNo++){
                        //         let adangalSchedulesLength=AdangalSchedules.length
                        //     for(let i=0; i<adangalSchedulesLength; i++){
                        //         if(uniqueSrNoarr[srNo]==AdangalSchedules[i].S_LP_NO){
                        //             allotmentExtent+=parseFloat(AdangalSchedules[i].SELLING_EXTENT)
                        //         let ind = formattedArr.findIndex(f => f.schedule == AdangalSchedules[i].SCHEDULE_NO && f.surveyNo == AdangalSchedules[i].S_LP_NO);
                        //         if(ind > -1){
                        //             formattedArr[ind].list = [...formattedArr[ind].list, AdangalSchedules[i]]; 
                        //         } else {
                        //            AdangalSchedules[i].VILLAGE_CODE='1820010'
                        //             formattedArr = [...formattedArr, {
                        //                 'schedule': AdangalSchedules[i].SCHEDULE_NO,
                        //                 'surveyNo': AdangalSchedules[i].S_LP_NO,
                        //                 'list': [AdangalSchedules[i]]
                        //             }];
                        //         }
                        //         //
                        //         if(!isSurvCompleted[srNo] && (isSurvCompleted[srNo]!='Y')){
                        //         if((i+1)==adangalSchedulesLength){
                        //             if(allotmentExtent<parseFloat(AdangalSchedules[i].TOTAL_EXTENT) || (parseFloat(AdangalSchedules[i].TOTAL_EXTENT)-allotmentExtent)!=0){
                        //                 adangalSchedulesLength+=1
                        //                 let pattadarAdangal=Object.assign({},AdangalSchedules[i])
                        //                 let allotmentExtentPointVal;
                        //                 if(parseFloat(AdangalSchedules[i].TOTAL_EXTENT)<1){
                        //                 let totalExtent=parseFloat('0'+AdangalSchedules[i].TOTAL_EXTENT);
                        //                  allotmentExtentPointVal=(totalExtent-allotmentExtent) %10 == 0?(totalExtent-allotmentExtent):(totalExtent-allotmentExtent).toString()+'0'
                        //                 }else{
                        //                  allotmentExtentPointVal=(parseFloat(AdangalSchedules[i].TOTAL_EXTENT)-(allotmentExtent)) %10==0?parseFloat(AdangalSchedules[i].TOTAL_EXTENT)-(allotmentExtent):parseFloat((AdangalSchedules[i].TOTAL_EXTENT)-(allotmentExtent)).toString()+'0'
                        //                 }
                        //               pattadarAdangal.SELLING_EXTENT=(Math.round(allotmentExtentPointVal*1000)/1000).toString();
                        //               pattadarAdangal.EXTENT=(Math.round(allotmentExtentPointVal*1000)/1000).toString();
                        //               pattadarAdangal.SCHEDULE_NO=adangalSchedulesLength
                        //               pattadarAdangal.VILLAGE_CODE='1820010'
                        //                 AdangalSchedules[i+1]=pattadarAdangal 
                        //                 isSurvCompleted.push('Y')
                        //             }

                        //         }
                        //     }
                        //     }
                        // }
                        // }
                        for (let srNo = 0; srNo < nonUniqueSurveyNos.length; srNo++) {
                            let allotmentExtent = .0
                            let matchedKahata;
                            let khataAdded = ''
                            let adangalSchedulesLength = AdangalSchedules.length
                            let lastSurveySchedule = 0
                            for (let i = 0; i < adangalSchedulesLength; i++) {
                                let flag = false
                                for (let j = 0; j < completedKhataNos.length; j++) {
                                    if (completedKhataNos[j].khataNo == AdangalSchedules[i].KHATA_NO && completedKhataNos[j].surNo == AdangalSchedules[i].S_LP_NO) {
                                        flag = true
                                    }
                                }

                                // if that survey or khata number not completed
                                if (flag === false) {
                                    if (nonUniqueSurveyNos[srNo] == AdangalSchedules[i].S_LP_NO) {
                                        lastSurveySchedule = i
                                        if (khataAdded === '') {
                                            matchedKahata = AdangalSchedules[i].KHATA_NO
                                            khataAdded = 'Y'
                                        }
                                        if (nonUniqueSurveyNos[srNo] == AdangalSchedules[i].S_LP_NO && matchedKahata == AdangalSchedules[i].KHATA_NO) {

                                            allotmentExtent += parseFloat(AdangalSchedules[i].SELLING_EXTENT)
                                            let ind = formattedArr.findIndex(f => f.schedule == AdangalSchedules[i].SCHEDULE_NO && f.surveyNo == AdangalSchedules[i].S_LP_NO);
                                            if (ind > -1) {
                                                formattedArr[ind].list = [...formattedArr[ind].list, AdangalSchedules[i]];
                                            } else {

                                                formattedArr = [...formattedArr, {
                                                    'schedule': AdangalSchedules[i].SCHEDULE_NO,
                                                    'surveyNo': AdangalSchedules[i].S_LP_NO,
                                                    'list': [AdangalSchedules[i]]
                                                }];
                                            }
                                            //
                                            if (!isSurvCompleted[srNo] && (isSurvCompleted[srNo] != 'Y')) {
                                                if ((i + 1) == adangalSchedulesLength) {
                                                    if (allotmentExtent.toString().includes(".") && `${allotmentExtent}`.split(".")[1].length > 2) {
                                                        allotmentExtent = parseFloat((Math.round(allotmentExtent * 1000) / 1000).toString())
                                                    }
                                                    if (allotmentExtent < parseFloat(AdangalSchedules[i].TOTAL_EXTENT) || (parseFloat(AdangalSchedules[i].TOTAL_EXTENT) - allotmentExtent) != 0) {
                                                        adangalSchedulesLength += 1
                                                        let pattadarAdangal = Object.assign({}, AdangalSchedules[i])
                                                        let allotmentExtentPointVal;
                                                        if (parseFloat(AdangalSchedules[i].TOTAL_EXTENT) < 1) {
                                                            let totalExtent = parseFloat('0' + AdangalSchedules[i].TOTAL_EXTENT);
                                                            allotmentExtentPointVal = (totalExtent - allotmentExtent) % 10 == 0 ? (totalExtent - allotmentExtent) : (totalExtent - allotmentExtent).toString() + '0'
                                                        } else {
                                                            allotmentExtentPointVal = (parseFloat(AdangalSchedules[i].TOTAL_EXTENT) - (allotmentExtent)) % 10 == 0 ? parseFloat(AdangalSchedules[i].TOTAL_EXTENT) - (allotmentExtent) : parseFloat((AdangalSchedules[i].TOTAL_EXTENT) - (allotmentExtent)).toString() + '0'
                                                        }
                                                        pattadarAdangal.SELLING_EXTENT = (Math.round(allotmentExtentPointVal * 1000) / 1000).toString();
                                                        pattadarAdangal.EXTENT = (Math.round(allotmentExtentPointVal * 1000) / 1000).toString()
                                                        pattadarAdangal.SCHEDULE_NO = `${adangalSchedulesLength}`
                                                        pattadarAdangal['IS_PATTADAR'] = 'Y'
                                                        AdangalSchedules[i + 1] = pattadarAdangal
                                                        isSurvCompleted.push('Y')
                                                    }
                                                    else {
                                                        isSurvCompleted.push('Y')
                                                    }
                                                }
                                            }
                                        }
                                        if ((i + 1) == adangalSchedulesLength) {
                                            completedKhataNos.push({ khataNo: AdangalSchedules[i].KHATA_NO, surNo: nonUniqueSurveyNos[srNo] })
                                        }
                                    }
                                    else if ((convertToDecimal(allotmentExtent) < parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) || (parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) - convertToDecimal(allotmentExtent)) != 0) && (i + 1) == adangalSchedulesLength && parseFloat(allotmentExtent) > 0) {
                                        adangalSchedulesLength += 1
                                        let pattadarAdangal = Object.assign({}, AdangalSchedules[lastSurveySchedule])
                                        let allotmentExtentPointVal;
                                        if (parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) < 1) {
                                            let totalExtent = parseFloat('0' + AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT);
                                            allotmentExtentPointVal = (totalExtent - allotmentExtent) % 10 == 0 ? (totalExtent - allotmentExtent) : (totalExtent - allotmentExtent).toString() + '0'
                                        } else {
                                            allotmentExtentPointVal = (parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) - (allotmentExtent)) % 10 == 0 ? parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) - (allotmentExtent) : parseFloat((AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) - (allotmentExtent)).toString() + '0'
                                        }

                                        pattadarAdangal.SELLING_EXTENT = (Math.round(allotmentExtentPointVal * 1000) / 1000).toString();
                                        pattadarAdangal.EXTENT = (Math.round(allotmentExtentPointVal * 1000) / 1000).toString()
                                        pattadarAdangal.SCHEDULE_NO = `${adangalSchedulesLength}`
                                        pattadarAdangal['IS_PATTADAR'] = 'Y'
                                        AdangalSchedules[i + 1] = pattadarAdangal
                                        isSurvCompleted.push('Y')
                                        allotmentExtent += parseFloat(AdangalSchedules[i + 1].SELLING_EXTENT)
                                        formattedArr = [...formattedArr, {
                                            'schedule': AdangalSchedules[i + 1].SCHEDULE_NO,
                                            'surveyNo': AdangalSchedules[i + 1].S_LP_NO,
                                            'list': [AdangalSchedules[i + 1]]
                                        }];

                                        completedKhataNos.push({ khataNo: AdangalSchedules[lastSurveySchedule].KHATA_NO, surNo: nonUniqueSurveyNos[srNo] })


                                    }
                                    else if ((i + 1) == adangalSchedulesLength) {
                                        completedKhataNos.push({ khataNo: AdangalSchedules[lastSurveySchedule].KHATA_NO, surNo: nonUniqueSurveyNos[srNo] })
                                    }
                                }
                                else if ((convertToDecimal(allotmentExtent) < parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) || (parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) - convertToDecimal(allotmentExtent)) != 0) && ((i + 1) == adangalSchedulesLength) && isSurvCompleted[srNo] != 'Y' && parseFloat(allotmentExtent) > 0) {
                                    adangalSchedulesLength += 1
                                    let pattadarAdangal = Object.assign({}, AdangalSchedules[lastSurveySchedule])
                                    let allotmentExtentPointVal;
                                    if (parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) < 1) {
                                        let totalExtent = parseFloat('0' + AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT);
                                        allotmentExtentPointVal = (totalExtent - allotmentExtent) % 10 == 0 ? (totalExtent - allotmentExtent) : (totalExtent - allotmentExtent).toString() + '0'
                                    } else {
                                        allotmentExtentPointVal = (parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) - (allotmentExtent)) % 10 == 0 ? parseFloat(AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) - (allotmentExtent) : parseFloat((AdangalSchedules[lastSurveySchedule].TOTAL_EXTENT) - (allotmentExtent)).toString() + '0'
                                    }
                                    pattadarAdangal.SELLING_EXTENT = (Math.round(allotmentExtentPointVal * 1000) / 1000).toString();
                                    pattadarAdangal.EXTENT = (Math.round(allotmentExtentPointVal * 1000) / 1000).toString()
                                    pattadarAdangal.SCHEDULE_NO = `${adangalSchedulesLength}`
                                    pattadarAdangal['IS_PATTADAR'] = 'Y'
                                    AdangalSchedules[i + 1] = pattadarAdangal
                                    isSurvCompleted.push('Y')
                                    allotmentExtent += parseFloat(AdangalSchedules[i + 1].SELLING_EXTENT)
                                    formattedArr = [...formattedArr, {
                                        'schedule': AdangalSchedules[i + 1].SCHEDULE_NO,
                                        'surveyNo': AdangalSchedules[i + 1].S_LP_NO,
                                        'list': [AdangalSchedules[i + 1]]
                                    }];

                                    completedKhataNos.push({ khataNo: AdangalSchedules[lastSurveySchedule].KHATA_NO, surNo: nonUniqueSurveyNos[srNo] })


                                }
                                else if ((i + 1) == adangalSchedulesLength) {
                                    completedKhataNos.push({ khataNo: AdangalSchedules[i].KHATA_NO, surNo: nonUniqueSurveyNos[srNo] })
                                }

                            }

                        }
                    }
                    else {
                        for (let i of AdangalSchedules) {
                            let ind = formattedArr.findIndex(f => f.schedule == i.SCHEDULE_NO && f.surveyNo == i.S_LP_NO);
                            if (ind > -1) {
                                formattedArr[ind].list = [...formattedArr[ind].list, i];
                            } else {
                                formattedArr = [...formattedArr, {
                                    'schedule': i.SCHEDULE_NO,
                                    'surveyNo': i.S_LP_NO,
                                    'list': [i]
                                }];
                            }
                        }
                    }
                    // return res.status(200).send(formattedArr);
                    // if formatted array is empty then just change status of application  

                    /* code in response 200 suggests
                     0 - no sub division needed just change status of document
                     1 - subdivided data is present
                    */
                    if (formattedArr.length === 0) {
                        req.body.RES_OBJ = {
                            status: true,
                            code: 0,
                            'message': 'No Sub Division needed. Status Changed Successfully'
                        };
                        req.body.STATUS = 'W';
                        await this.updateStatusFromMutationAPI(req, res);
                        return;
                    } else {
                        return res.status(200).send({ status: true, data: formattedArr });
                    }
                }
            } else {
                req.body.RES_OBJ = {
                    status: true,
                    code: 0,
                    'message': 'No Sub Division needed. Status Changed Successfully'
                };
                req.body.STATUS = 'W';
                await this.updateStatusFromMutationAPI(req, res);
                return;
            }
        }
        catch (ex) {
            console.error("AutoMutationHandler - Preview Sub Division || Error :", ex.message);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    previewMutation = async (req, res) => {
        try {
            // 1. Get document Details
            let data = await this.checkSlip.getCheckSlipReportsSrvc({ ...req.body, flag: 1 });

            if (!this.automutationServices.isMutationNeeded(data)) {
                req.body.RES_OBJ = {
                    status: true,
                    code: 0,
                    'message': 'No Mutation needed. Status Changed Successfully'
                };
                req.body.STATUS = 'F';
                await this.updateStatusFromMutationAPI(req, res);
                return;
            } else {
                // return res.status(200).send(data);

                let schedules = get(data, 'schedule', []);
                // filter only LPM schedules
                let lpmSchedules = schedules.filter(s => s.LP_NO);
                // filter schedules which are not lpm
                let filteredSchedules = schedules.filter(s => !s.LP_NO);
                // filter schedules which has S_LP_NO and nature code should match to be agricultural.
                let AdangalSchedules = filteredSchedules.filter(f => f.S_LP_NO && CODES.AGRI_NATURE.includes(`${f.NATURE_USE}`));
                let claimants = get(data, 'partyDetails', []).filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
                const major_code = get(data, 'docDetails.0.TRAN_MAJ_CODE', '')
                const minor_code = get(data, 'docDetails.0.TRAN_MIN_CODE', '')

                let orderClaimantsArr = []

                // prepare an arr which holds specific survey number to a schedule
                let formattedArr = [];
                let count = 1
                for (let i of AdangalSchedules) {

                    let ind = formattedArr.findIndex(f => f.schedule == i.SCHEDULE_NO && f.surveyNo == i.S_LP_NO);
                    if (ind > -1) {
                        formattedArr[ind].list = [...formattedArr[ind].list, i];
                    } else {
                        if (major_code == '04' && ['01', '02'].includes(minor_code)) {
                            if (!claimants.length) {
                                req.body.RES_OBJ = {
                                    status: false,
                                    code: 0,
                                    claimants: claimants,
                                    'message': 'Claimants not found'
                                };
                                return res.status(200).send(req.body.RES_OBJ);
                            }
                            let partyNos = `${i.P_PARTY_NO}`.split(',').map(p => p.trim());
                            let filteredClaimants = claimants
                                .filter(j => partyNos.includes(`${j.EC_NUMBER}`.trim()))
                                .map(fc => ({ ...fc, SCHEDULE_NO: i.SCHEDULE_NO }));
                            orderClaimantsArr.push(...filteredClaimants);
                            // let filteredClaimants = claimants.filter(j => { return i.P_PARTY_NO == j?.EC_NUMBER })
                            // let filteredClaimants = claimants.filter(j => {
                            //     if (i.PARTY_NO !== 0) {
                            //       return i.PARTY_NO === j?.EC_NUMBER;
                            //     } else if (i.P_PARTY_NO) {
                            //       const partyNos = i.P_PARTY_NO.split(',').map(p => p.trim());
                            //       return partyNos.includes(j?.EC_NUMBER?.toString());
                            //     } else {
                            //       return false; 
                            //     }
                            //   });
                            //filteredClaimants[0]['SCHEDULE_NO']=`${count}`;
                            // if(filteredClaimants.length){
                            // filteredClaimants[0]['SCHEDULE_NO'] = i.SCHEDULE_NO
                            // }
                            // orderClaimantsArr.push(...filteredClaimants)
                            // if(filteredClaimants.length){
                            //     filteredClaimants[0]['SCHEDULE_NO'] = i.SCHEDULE_NO
                            //     }
                            //     let newClm=Object.assign({},...filteredClaimants)
                            //     orderClaimantsArr.push(newClm)
                            //     filteredClaimants=[]


                        }
                        //AdangalSchedules[(count-1)]['CLAIMANT_NAME']=filteredClaimants[0].NAME
                        formattedArr = [...formattedArr, {
                            'schedule': i.SCHEDULE_NO,
                            'surveyNo': i.S_LP_NO,
                            'list': [i]
                        }];
                    }

                    count = count + 1



                }

                // let newOrderClaimants=JSON.parse(JSON.stringify(orderClaimantsArr));

                //   for(let i=0; i<newOrderClaimants.length; i++){
                //     newOrderClaimants[i].SCHEDULE_NO=i+1
                //   }

                console.log(orderClaimantsArr)
                // return res.status(200).send(formattedArr);
                // if formatted array is empty then just change status of application  

                /* code in response 200 suggests
                 0 - no sub division needed just change status of document
                 1 - subdivided data is present
                */
                if (formattedArr.length === 0 && lpmSchedules.length === 0) {

                    req.body.RES_OBJ = {
                        status: true,
                        code: 0,
                        'message': 'No Mutation needed. Status Changed Successfully'
                    };
                    req.body.STATUS = 'F';
                    await this.updateStatusFromMutationAPI(req, res);
                    return;

                } else {

                    if (major_code == '04' && ['01', '02'].includes(minor_code)) {
                        claimants = orderClaimantsArr
                        return res.status(200).send({ status: true, surveyNo: formattedArr, lpNo: lpmSchedules, claimants });
                    }
                    else {
                        return res.status(200).send({ status: true, surveyNo: formattedArr, lpNo: lpmSchedules, claimants });
                    }
                }

            }

        } catch (ex) {
            console.error("AutoMutationHandler - Preview Mutation || Error :", ex.message);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    collectStatus = async (req, res) => {
        const qParams = req.body;
        if (!qParams.SR_CODE || !qParams.REG_YEAR || !qParams.DOCT_NO || !qParams.BOOK_NO || !qParams.TYPE || !CODES.AGRI_VILLAGE_TYPES.includes(qParams.TYPE) || (qParams.TYPE === SURVEY && !qParams.SRO_PID)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.automutationServices.collectStatus(qParams);
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
            console.error("AutoMutationHandler - collectStatus || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    checkIfDocIsRural = async (req, res) => {
        try {
            if (typeof req.body === 'object' && ['srCode', 'bookNo', 'docNo', 'regYear'].every(k => Object.keys(req.body).includes(k) && req.body[k])) {
                let data = await this.checkSlip.getCheckSlipReportsSrvc({ ...req.body, flag: 1 });
                if (!this.automutationServices.isMutationNeeded(data)) {
                    return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                        {
                            status: false,
                            message: "This Document doesnot need mutation certificate"
                        }
                    );
                } else {
                    let schedules = get(data, 'schedule', []);
                    // filter only LPM schedules
                    let lpmSchedules = schedules.filter(s => s.LP_NO);
                    // filter schedules which are not lpm
                    let filteredSchedules = schedules.filter(s => !s.LP_NO);
                    // filter schedules which has S_LP_NO and nature code should match to be agricultural.
                    let AdangalSchedules = filteredSchedules.filter(f => f.S_LP_NO && CODES.AGRI_NATURE.includes(`${f.NATURE_USE}`));
                    if (AdangalSchedules.length || lpmSchedules.length) {
                        return res.status(200).send({
                            status: true,
                            AdangalSchedules,
                            lpmSchedules
                        })
                    } else {
                        return res.status(404).send({
                            status: false,
                            message: "No rural schedules found in the document."
                        })
                    }
                }
            } else {
                return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                    {
                        status: false,
                        message: NAMES.VALIDATION_ERROR
                    }
                );
            }
        } catch (ex) {
            console.error("AutoMutationHandler - checkIfDocIsRural || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    createResponseObj = async (req, res, data) => {
        let ar = [];
        data.V_KHATA_NO.split(',').forEach(v => {
            let vCode = v.split('_')[0];
            let index = ar.findIndex(o => o.vCode == vCode);
            if (index < 0) {
                ar.push({
                    'vCode': vCode,
                    'khata': [v.split('_')[1]]
                });
            } else {
                ar[index].khata = [...ar[index].khata, v.split('_')[1]];
            }
        });

        let subquery = `SROUSER.DIST_MANDAL_VILL('${ar.map(s => String(s.vCode).length === 6 ? '0' + s.vCode : s.vCode).join(',')}')`;
        let distQuery = `select ${subquery} from dual`;
        let dist_result = await this.orDao.oDBQueryService(distQuery);
        if (dist_result[0][subquery]) {
            let d_m_vs = dist_result[0][subquery].split('~').filter(f => f);
            console.log(d_m_vs);
            if (d_m_vs.length === ar.length) {
                d_m_vs.forEach((d, i) => {
                    let [district, mandal, village] = d.split(',');
                    ar[i].district = district;
                    ar[i].mandal = mandal;
                    ar[i].village = village;
                });
                return ar;
            } else {
                res.status(400).send({
                    status: false,
                    message: "Unable to fetch all district and mandal names from village codes"
                })
                return '';
            }
        } else {
            res.status(400).send({
                status: false,
                message: "Unable to fetch district and mandal names from village code"
            })
            return '';
        }
    }

    getPrerequisiteDataForCertificate = async (req, res) => {
        try {
            if (typeof req.body === 'object' && ['srCode', 'bookNo', 'docNo', 'regYear', 'AdangalSchedules', 'lpmSchedules'].every(k => Object.keys(req.body).includes(k) && req.body[k])) {
                let body = req.body;
                let res_data = {};
                if (body.AdangalSchedules.length) {
                    let query = `Select * from srouser.WEBLAND_STATUS_SURV_CR where SR_CODE=${body.srCode} and BOOK_NO=1 and REG_YEAR=${body.regYear} and DOCT_NO=${body.docNo} and status = 'Y'
                    ORDER BY REG_TIMESTAMP DESC`;
                    let s_results = await this.orDao.oDBQueryService(query);
                    if (s_results.length) {
                        res_data.survey = await this.createResponseObj(req, res, s_results[0]);
                        if (!res_data.survey) {
                            return;
                        }
                    } else {
                        return res.status(404).send({
                            status: false,
                            message: "Status Update Pending from webland"
                        })
                    }
                }
                if (body.lpmSchedules.length) {
                    let query = `Select * from srouser.WEBLAND_STATUS_LPM_CR where SR_CODE=${body.srCode} and BOOK_NO=1 and REG_YEAR=${body.regYear} and DOCT_NO=${body.docNo} and status = 'Y'
                    ORDER BY REG_TIMESTAMP DESC`;
                    let l_results = await this.orDao.oDBQueryService(query);
                    if (l_results.length) {
                        res_data.lpm = await this.createResponseObj(req, res, l_results[0]);
                        if (!res_data.lpm) {
                            return;
                        }
                    } else {
                        return res.status(404).send({
                            status: false,
                            message: "Status Update Pending from webland"
                        })
                    }
                }
                return res.status(200).send({
                    status: true,
                    res_data: res_data
                })
            } else {
                return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                    {
                        status: false,
                        message: NAMES.VALIDATION_ERROR
                    }
                );
            }
        } catch (ex) {
            console.error("AutoMutationHandler - getPrerequisiteDataForCertificate || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getSurveyDetailsByKhataNo = async (req, res) => {
        try {
            let { vCode, KhataNo } = req.query;
            if (!vCode || !KhataNo) {
                return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                    {
                        status: false,
                        message: NAMES.VALIDATION_ERROR
                    }
                );
            } else {
                vCode = String(vCode).length === 6 ? '0' + vCode : vCode
                let config = {
                    method: 'post',
                    url: process.env.SURVEY_KHATA_ADANGAL_URL + '',
                    headers: {
                        'Content-Type': 'text/xml',
                    },
                    data: `<?xml version="1.0" encoding="utf-8"?>
                    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                      <soap:Body>
                        <GetRORDetailsForReg xmlns="http://tempuri.org/">
                          <Dcode>${vCode.substring(0, 2)}</Dcode>
                          <Mcode>${vCode.substring(2, 4)}</Mcode>
                          <VCode>${vCode}</VCode>
                          <KhataNo>${KhataNo}</KhataNo>
                          <uid>${process.env.SURVEY_UID}</uid>
                          <pwd>${process.env.SURVEY_PWD}</pwd>
                        </GetRORDetailsForReg>
                      </soap:Body>
                    </soap:Envelope>
                    `
                    // data : `DCode=${vCode.substring(0,2)}&MCode=${vCode.substring(2,4)}&VCode=${vCode}&KhataNo=${KhataNo}&uid=${process.env.SURVEY_UID}&pwd=${process.env.SURVEY_PWD}`
                };

                let result = await axios.request(config);
                let jsonData = xml2json(result.data, { compact: true, spaces: 4 });
                let d = getValue(JSON.parse(jsonData), 'ROR_Str');
                if (d) {
                    if (typeof d === 'object' && !Array.isArray(d) && d.pSerialNo._text != 1) {
                        return res.status(404).send({
                            status: false,
                            message: d.pSurvey_no._text,
                        })
                    } else {
                        return res.status(200).send({ khata: KhataNo, vCode: vCode, data: Array.isArray(d) ? d : [d] });
                    }
                } else {
                    return res.status(400).send({
                        status: false,
                        message: "Unable to fetch adangals. Try again"
                    })
                }
            }
        } catch (ex) {
            console.error("AutoMutationHandler - getSurveyDetailsByKhataNo || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getLPMDetailsByKhata = async (req, res) => {
        try {
            let { vCode, KhataNo } = req.query;
            if (!vCode || !KhataNo) {
                return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                    {
                        status: false,
                        message: NAMES.VALIDATION_ERROR
                    }
                );
            } else {
                let tokenresult = await this.mutationServices.generateAutomutationToken();
                if (tokenresult.Code === '100') {
                    let data = {
                        "Ptype": "VKHATA",
                        "DistrictCode": "",
                        "MandalCode": "",
                        "VillageCode": vCode,
                        "LPM": KhataNo
                    };
                    let config = {
                        method: 'post',
                        url: `${process.env.LPM_KHATA_ADANGAL_URL}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tokenresult.Data}`
                        },
                        'data': data
                    };
                    let result = await axios.request(config);
                    if (result.data.Code == 100) {
                        return res.status(200).send({ status: true, data: result.data.Data, khata: KhataNo, vCode: vCode });
                    } else {
                        return res.status(404).send({
                            status: false,
                            message: get(result, 'data.Message', 'Requst Failed. Please try again')
                        })
                    }
                }
                else {
                    return res.status(400).send({
                        status: false,
                        message: "Token Generation Failed"
                    })
                }
            }
        } catch (ex) {
            console.error("AutoMutationHandler - getLPMDetailsByKhata || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getRevenueName = async (req, res) => {
        const reqQuery = req.query;
        if (reqQuery?.OLD_REVDISTRICTCODE == null || reqQuery?.OLD_MANDAL_CODE == null) {
            return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
        }
        try {
            let response = await this.automutationServices.getRevenueNameSrvc(reqQuery);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "No Data Found",
                    code: "404"
                })
                return;
            } else {
                let responseData = {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                };
                // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
                // responseData.hash = hash;
                res.status(200).send({ ...responseData });
            }
        } catch (ex) {
            console.error("AutoMutationHandler - getRevenueName || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getGramPanchayathAssessmentDetails = async (ulbCode) => {
        try {
            // let url='https://svamitvapitest.apcfss.in/svamitva-services/ppn-data/20040959016301000'
            // let url=process.env.URBAN_PANCHAYATH_BASE_URL+`ppn-data/${ulbCode}`; 
            // let config = {
            //     method: 'get',
            //     maxBodyLength: Infinity,
            //     url: url,
            //     headers: { 
            //       'Content-Type': 'application/json', 
            //       'SVAMITVA-API-KEY': process.env.URBAN_PANCHAYATH_API_KEY
            //     }
            //   };
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.URBAN_PANCHAYATH_BASE_URL + '/ppn-data/' + `${ulbCode}`,
                headers: {
                    'Content-Type': 'application/json',
                    'SVAMITVA-API-KEY': process.env.URBAN_PANCHAYATH_API_KEY
                }
            };

            //axios.request(config)

            let assDetResponse = await axios.request(config);
            try {
                if (assDetResponse.data.SCODE == '01') {
                    return assDetResponse.data;
                }
                else {
                    return {};
                }
            }
            catch (err) {
                return err.message
            }


        } catch (error) {
            Logger.error(error.message);
            console.error("VillageService - getVillages || Error :", error.message);
            let pdeError = constructCARDError(error);
            throw pdeError;
        }
    }
    getCDMAPropertyAssessmentDetails = async (req, res) => {
        try {
            let data = JSON.stringify({

                "ulbCode": req.ulbCode,
                "assessmentNo": req.assessmentNo,
                "partyValue": req.marketValue,
                "marketValue": req.marketValue
            });
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: process.env.URBAN_BASE_URL + '/v1.0/property/automutation/assessmentdetails',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.token}`,
                    'Referer': `${process.env.URBAN_SERVER_IP}`,
                },
                data: data
            };
            let re = await axios.request(config)
            return re;
        } catch (error) {
            Logger.error(error.message);
            console.error("CDMADetails - UrbanDetails || Error :", error.message);
            let pdeError = constructCARDError(error);
            throw pdeError;
        }
    };


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
                url: process.env.URBAN_BASE_URL + '/oauth/token?ulbCode=' + (req.ptin).toString().slice(0, 4),
                headers: {
                    'Referer': `${process.env.URBAN_SERVER_IP}`,
                    'Authorization': `Basic ${base64Credentials}`,
                },
                data: data
            };
            let response = await axios.request(config);
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
    panchayathWithAssesFull = async (req, res) => {
        let { ptin_schedules, i, claimants, resObj } = req.body
        console.log(`${ptin_schedules[0].PTIN}`.length)
        if (`${ptin_schedules[0].PTIN}`.length == 17) {
            let response = await this.getGramPanchayathAssessmentDetails(ptin_schedules[0].PTIN);
            let PTIN = `${ptin_schedules[0].PTIN}`;

            if (response.SCODE == '01') {
                //if(i.TOTAL_EXTENT == response.DATA[0].extent_of_built_up_area){
                // req.body.STATUS = 'U';
                // await this.updateStatusFromMutationAPI(req, res);
                //             return res.status(200).send({
                //                 'status':true,
                //                 'message':"Partial automutation feature will be available soon",
                //                 'schedule_no': i.SCHEDULE_NO
                //             })
                //}

                if ((`${response?.DATA[0]?.extent_of_property_parcel}`).includes(".")) {
                    let secondPart = `${response?.DATA[0]?.extent_of_property_parcel}`.split(".")[1].substring(0, 2)
                    let firstPart = `${response?.DATA[0]?.extent_of_property_parcel}`.split(".")[0]
                    response.DATA[0].extent_of_property_parcel = firstPart + "." + secondPart;
                }

                if (ptin_schedules[0].SELLING_EXTENT == (response?.DATA[0]?.extent_of_property_parcel || response.DATA[0].extent_of_built_up_area)) {
                    let applicants = []
                    claimants.map(cl => applicants.push(`${cl.NAME}`))
                    let data = {
                        "lp_number": Number(response.DATA[0].lp_number),
                        "ppn": PTIN.substring(14, 17),
                        "tot_no_of_floors_ppn": response.DATA[0].tot_no_of_floors_ppn,
                        "slno_out_of_total_flats_or_owners_in_the_ppn": response.DATA[0].slno_out_of_total_flats_or_owners_in_the_ppn,
                        "nature_of_property": response.DATA[0].nature_of_property,
                        "nature_of_land_use": response.DATA[0].nature_of_land_use,
                        "extent_of_property_parcel": response.DATA[0].extent_of_property_parcel,//
                        "extent_of_built_up_area": response.DATA[0].extent_of_built_up_area,//
                        "rcc_non_rcc": response.DATA[0].rcc_non_rcc,
                        "nature_of_usage": response.DATA[0].nature_of_usage,
                        "nature_of_ownership": response.DATA[0].nature_of_ownership,
                        "tax_assesment_no": response.DATA[0].tax_assesment_no,//
                        "door_no": response.DATA[0].door_no,
                        "street_colony": response.DATA[0].village_name,
                        "surname": claimants.map(m => { return m.A_NAME.split(" ")[0] }),
                        "applicant_name": claimants.map(m => {
                            let t = m.A_NAME.split(" ")
                            console.log(t)
                            let cl = ''
                            for (let i = 1; i < t.length; i++) {
                                cl += t[i] + ' '
                            }
                            return cl;
                        }),
                        "so_ho": "Pydayya (Late)",
                        "aadhar_no_of_property_owner": claimants[0].AADHAR,
                        "mode_of_acquisition": response.DATA[0].mode_of_acquisition,
                        "photograph": "NA",
                        "remarks_dispute_no_dispute": "No-Dispute",
                        // "receiptNumber": '',
                        // "receiptDate": ""
                    };
                    console.log(data)
                    let config = {
                        method: 'post',
                        //maxBodyLength: Infinity,
                        url: process.env.URBAN_PANCHAYATH_BASE_URL + `/sale-mutation-single-multiple/${ptin_schedules[0].PTIN}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'SVAMITVA-API-KEY': process.env.URBAN_PANCHAYATH_API_KEY
                        },
                        data: JSON.stringify(data)
                    };
                    try {
                        let result = await axios.request(config);
                        console.log(result.data)
                        if (result.data.SCODE == "01") {
                            let REQ_BODY = this.mutationServices.CircularStringify(config);
                            let RESPONSE = this.mutationServices.CircularStringify(result);
                            REQ_BODY = Buffer.from(REQ_BODY, 'utf8');
                            RESPONSE = Buffer.from(RESPONSE, 'utf8');
                             let q = `Insert into srouser.mutation_sent_urban_cr (ID,SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,SCHEDULE_NO,PTIN,CERTIFICATE_LINK, TIME_STAMP, REQ_BODY, RESPONSE) values ('', ${i.SR_CODE}, ${i.BOOK_NO}, ${i.DOCT_NO}, ${i.REG_YEAR}, '${i.SCHEDULE_NO}', '${ptin_schedules[0].PTIN}', 'NA', SYSDATE, :blobdata, :blobData2)`;
                            await this.orDao.oDbInsertBlobDocsWithBindParams(q, {}, REQ_BODY,RESPONSE );
                            return resObj[resObj.length] = {
                                'status': true,
                                'result': {
                                    'CERTIFICATE_LINK': 'Not Avaialble',
                                    'PTIN': ptin_schedules[0].PTIN
                                },
                                'schedule_no': i.SCHEDULE_NO
                            }
                        }


                        else if (result.data.SCODE == '02') {
                            return resObj[resObj.length] = {
                                'status': false,
                                'message': result.data.SDESC,
                                'errorData': result.data.errorData ? result.data.errorData.ERROR_MESSAGE[0] : 'Internal server error',
                                'schedule_no': i.SCHEDULE_NO,
                                'result': {
                                    'PTIN': ptin_schedules[0].PTIN
                                }
                            }
                        }


                    } catch (err) {
                        console.log("err =====> ", err);
                        return resObj[resObj.length] = {
                            'status': false,
                            'message': err.response.data.ERROR_MESSAGE[0],
                            'errorData': err.response.data,
                            'schedule_no': i.SCHEDULE_NO,
                            'result': {
                                'PTIN': ptin_schedules[0].PTIN
                            }
                        }
                    }

                }
                else {
                    return resObj[resObj.length] = {
                        'status': false,
                        'message': `If property type is full site extent must be equal to total extent`,
                        'schedule_no': i.SCHEDULE_NO,
                        'result': {
                            'PTIN': ptin_schedules[0].PTIN
                        }
                    }
                }
            }
            else {
                return resObj[resObj.length] = {
                    'status': false,
                    'message': `No Details found with this AssessmentNo ${ptin_schedules[0].PTIN}`,
                    'schedule_no': i.SCHEDULE_NO,
                    'result': {
                        'PTIN': ptin_schedules[0].PTIN
                    }
                }
            }
        }
        else {

            return resObj[resObj.length] = {
                'status': false,
                'message': `No Details found with this AssessmentNo ${ptin_schedules[0].PTIN}`,
                'schedule_no': i.SCHEDULE_NO,
                'result': {
                    'PTIN': ptin_schedules[0].PTIN
                }

            }
        }
    }
    //  This function needs to declare all the values and generate the config file
    getConfigurationsOfWithPTINFullExtent = async (body, token, scheduleDetails) => {
        const paramsForMutationRequest = {
            ulbCode: `${scheduleDetails.PTIN}`.substring(0, 4),
            assessmentNumber: scheduleDetails.PTIN,
            documentNumber: scheduleDetails.RDOCT_NO,
            documentDate: scheduleDetails.TIME_STAMP,
            registeredDocumentLink: await this.automutationServices.getFilePath(body),
            applicationNumber: scheduleDetails.PTIN_APPLICATIONID
        }
        const config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `${cdmaHostURL}${cdmaAPIs.autoMutationAPIForFullTransferWithPTIN}${(scheduleDetails.PTIN).toString().substring(0, 4)}`,
            headers: {
                'Referer': `${process.env.URBAN_SERVER_IP}`,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,

            },
            data: paramsForMutationRequest
        }
        return config;
    }

    getConfigurationsOfWithoutPTIN = async (body, token, scheduleDetails, structureDetails, ptinScheduleDetails, ulbCode, appData, isExecutantMutationNeeded) => {
        let claimants = get(appData, 'partyDetails', []).filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
        let executants = get(appData, 'partyDetails', []).filter(C => CODES.EXECUTANT_CODES.includes(C.CODE));
        const paramsObj = {
            ulbCode: `${ulbCode}`,
            propertyDetails: {
                ulbCode: `${ulbCode}`,
                ownershipCategory: (ptinScheduleDetails.PROPERTY_TYPE).toUpperCase(),
                propertyType: (ptinScheduleDetails.PROPERTY_TYPE).toUpperCase() === 'PRIVATE'? (scheduleDetails.NATURE_USE == "01" ? "RESIDENTIAL" : "NON_RESIDENTIAL") : "VACANTLAND",                
                apartmentName: scheduleDetails.APT_NAME ?? "",
                extensionOfSite: parseFloat((scheduleDetails.EXTENT).toFixed(2))
            },
            ownerDetails: claimants.map(c => {
                return { "mobileNumber": '' + c.PHONE_NO, "ownerName": c.NAME.toUpperCase().replace(/[\t,(),/,:,.,&]/g, " ").trim(), "gender": c.GENDER ? c.GENDER === 'M' ? "MALE" : c.GENDER === 'F' ? 'FEMALE' : 'OTHERS' : "MALE", "emailAddress": c.EMAIL_ID ? c.EMAIL_ID : "", "guardianRelation": c.R_CODE ? c.R_CODE === 'S' ? "Father" : c.R_CODE === 'W' ? 'Husband' : c.R_CODE === 'M' ? 'Mother' : 'Other' : "Other", "guardian": c.R_NAME.toUpperCase().replace(/[\t,(),/,:,.,&]/g, " ").trim(), "aadhaarNumber": "" }
            }),
            propertyAddress: {
                electionWardNo: scheduleDetails.ELECTION_WARD_NO,
                wardSecretariat: scheduleDetails.SECRATARIAT_WARD_NO,
                northBoundary: scheduleDetails.NORTH,
                eastBoundary: scheduleDetails.EAST,
                westBoundary: scheduleDetails.WEST,
                southBoundary: scheduleDetails.SOUTH
            },
            igrsDetails: {
                sroCode: `${scheduleDetails.SR_CODE}`,
                sroName: get(appData, 'docDetails.0.SRNAME', ''),
                igrsWard: `Ward ${scheduleDetails.WARD_NO}`,
                igrsLocality: `${(scheduleDetails.LOC_HAB_NAME).split('(')[0]}`,// Confirmed with DIG Sir we need to pass Habitation
                igrsBlock: `Block ${scheduleDetails.BLOCK_NO}`,
                habitation: `${scheduleDetails.VILLAGE_NAME}`,
                igrsDoorNoFrom: "",
                igrsDoorNoTo: ""
            },
            // floorDetails: structureDetails.map(structureObj => {
            //     return {
            //         floorNumber: scheduleDetails.TOT_FLOOR ? `${scheduleDetails.TOT_FLOOR}` : "0",
            //         // floorNumber:  "0",
            //         classificationOfBuilding: structureObj.STRU_TYPE ? structureObj.STRU_TYPE : "",
            //         igrsClassification: structureObj.STRU_TYPE ? structureObj.STRU_TYPE : "",
            //         firmName: "",
            //         plinthArea: structureObj.PLINTH ? `${structureObj.PLINTH}` : "0"
            //     }
            // }),
             floorDetails: (Array.isArray(structureDetails) && structureDetails.length ? structureDetails : [{floorNumber: "", classificationOfBuilding: "", igrsClassification: "", firmName: "", plinthArea: ""}]).map(structureObj => {
            return {
                floorNumber: scheduleDetails.TOT_FLOOR!==null || scheduleDetails.TOT_FLOOR!==undefined ? `${scheduleDetails.TOT_FLOOR}` : "",
                classificationOfBuilding: structureObj?.STRU_TYPE ? structureObj.STRU_TYPE : "",
                igrsClassification: structureObj?.STRU_TYPE ? structureObj.STRU_TYPE : "",
                firmName: "",
                plinthArea: structureObj?.PLINTH ? `${structureObj.PLINTH}` : ""
            };
        }),
            vltDetails: {
                surveyNumber: `${scheduleDetails.SURVEY_NO}`,
                vacantLandArea: parseFloat((scheduleDetails.EXTENT).toFixed(2)),
                igrsClassification: structureDetails[0]?.STRU_TYPE ? structureDetails[0].STRU_TYPE : "",
                currentMarketValue: scheduleDetails.MKT_VALUE,
                registeredDocumentValue: scheduleDetails.MKT_VALUE
            },
            documentNumber: ptinScheduleDetails.RDOCT_NO,
            documentDate: ptinScheduleDetails.TIME_STAMP,
            registeredDocumentLink: await this.automutationServices.getFilePath(body),
            mutationType: ptinScheduleDetails.URBAN_SELLING_EXTENT==='PARTIAL'? 'UNASSESSED_PARTIAL_MUTATION':"UNASSESSED_FULL_MUTATION",
            registrationYear: scheduleDetails.REG_YEAR,
            bookNumber: scheduleDetails.BOOK_NO,
            marketValue: scheduleDetails.MKT_VALUE

        };
        if (isExecutantMutationNeeded) {
            paramsObj['ownerDetails'] = executants.map(c => {
                return { "mobileNumber": '' + c.PHONE_NO, "ownerName": c.NAME.toUpperCase().replace(/[\t,(),/,:,.,&]/g, " ").trim(), "gender": c.GENDER ? c.GENDER === 'M' ? "MALE" : c.GENDER === 'F' ? 'FEMALE' : 'OTHERS' : "MALE", "emailAddress": c.EMAIL_ID ? c.EMAIL_ID : "", "guardianRelation": c.R_CODE ? c.R_CODE === 'S' ? "Father" : c.R_CODE === 'W' ? 'Husband' : c.R_CODE === 'M' ? 'Mother' : 'Other' : "Other", "guardian": c.R_NAME.toUpperCase().replace(/[\t,(),/,:,.,&]/g, " ").trim(), "aadhaarNumber": "" }
            });
            paramsObj['propertyDetails']['extensionOfSite'] = (parseFloat((scheduleDetails.TOTAL_EXTENT_URBAN || 0).toFixed(2)) - parseFloat((scheduleDetails.EXTENT).toFixed(2)));
            paramsObj['vltDetails']['vacantLandArea'] = (parseFloat((scheduleDetails.TOTAL_EXTENT_URBAN || 0).toFixed(2)) - parseFloat((scheduleDetails.EXTENT).toFixed(2)));
        }
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${cdmaHostURL}${cdmaAPIs.createAssessment}`,
            headers: {
                'Referer': `${process.env.URBAN_SERVER_IP}`,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            data: paramsObj
        };
        return config
    }

    getConfigurationsWithPTINPartialExtent = async (body, token, scheduleDetails, structureDetails, ptinScheduleDetails, ulbCode, appData) => {
        let claimants = get(appData, 'partyDetails', []).filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
        const paramsObj = {
            ulbCode: `${ulbCode}`,
            assessmentNumber: `${ptinScheduleDetails.PTIN}`,
            propertyDetails: {
                ulbCode: `${ulbCode}`,
                ownershipCategory: (ptinScheduleDetails.PROPERTY_TYPE).toUpperCase(),
                propertyType: (ptinScheduleDetails.PROPERTY_TYPE).toUpperCase() === 'PRIVATE'? (scheduleDetails.NATURE_USE == "01" ? "RESIDENTIAL" : "NON_RESIDENTIAL") : "VACANTLAND",                
                apartmentName: scheduleDetails.APT_NAME ?? "",
                extensionOfSite: scheduleDetails.EXTENT
            },
            ownerDetails: claimants.map(c => {
                return { "mobileNumber": '' + c.PHONE_NO, "ownerName": c.NAME.toUpperCase().replace(/[\t,(),/,:,.,&]/g, " ").trim(), "gender": c.GENDER ? c.GENDER === 'M' ? "MALE" : c.GENDER === 'F' ? 'FEMALE' : 'OTHERS' : "MALE", "emailAddress": c.EMAIL_ID ? c.EMAIL_ID : "", "guardianRelation": c.R_CODE ? c.R_CODE === 'S' ? "Father" : c.R_CODE === 'W' ? 'Husband' : c.R_CODE === 'M' ? 'Mother' : 'Other' : "Other", "guardian": c.R_NAME.toUpperCase().replace(/[\t,(),/,:,.,&]/g, " ").trim(), "aadhaarNumber": "" }
            }),
            propertyAddress: {
                electionWardNo: scheduleDetails.ELECTION_WARD_NO,
                wardSecretariat: scheduleDetails.SECRATARIAT_WARD_NO,
                northBoundary: scheduleDetails.NORTH,
                eastBoundary: scheduleDetails.EAST,
                westBoundary: scheduleDetails.WEST,
                southBoundary: scheduleDetails.SOUTH
            },
            // floorDetails: structureDetails.map(structureObj => {
            //     return {
            //         floorNumber: scheduleDetails.TOT_FLOOR ? `${scheduleDetails.TOT_FLOOR}` : "0",
            //         classificationOfBuilding: structureObj.STRU_TYPE ? structureObj.STRU_TYPE : "",
            //         igrsClassification: structureObj.STRU_TYPE ? structureObj.STRU_TYPE : "",
            //         firmName: "",
            //         plinthArea: structureObj.PLINTH ? `${structureObj.PLINTH}` : "0"
            //     }
            // }),
            floorDetails: (Array.isArray(structureDetails) && structureDetails.length ? structureDetails : [{floorNumber: "", classificationOfBuilding: "", igrsClassification: "", firmName: "", plinthArea: ""}]).map(structureObj => {
            return {
                floorNumber: scheduleDetails.TOT_FLOOR!==null || scheduleDetails.TOT_FLOOR!==undefined ? `${scheduleDetails.TOT_FLOOR}` : "",
                classificationOfBuilding: structureObj?.STRU_TYPE ? structureObj.STRU_TYPE : "",
                igrsClassification: structureObj?.STRU_TYPE ? structureObj.STRU_TYPE : "",
                firmName: "",
                plinthArea: structureObj?.PLINTH ? `${structureObj.PLINTH}` : ""
            };
        }),
            igrsDetails: {
                sroCode: `${scheduleDetails.SR_CODE}`,
                sroName: get(appData, 'docDetails.0.SRNAME', ''),
                // igrsWard: `Ward ${scheduleDetails.WARD_NO}`,
                // igrsLocality: `${(scheduleDetails.LOC_HAB_NAME).split('(')[0]}`,// Confirmed with DIG Sir we need to pass Habitation
                // igrsBlock: `Block ${scheduleDetails.BLOCK_NO}`,
                // habitation: `${scheduleDetails.VILLAGE_NAME}`,
                // igrsDoorNoFrom: "",
                // igrsDoorNoTo: ""
            },

            vltDetails: {
                surveyNumber: `${scheduleDetails.SURVEY_NO}`,
                vacantLandArea: parseFloat((scheduleDetails.EXTENT).toFixed(2)),
                igrsClassification: structureDetails[0]?.STRU_TYPE ? structureDetails[0].STRU_TYPE : "",
                currentMarketValue: scheduleDetails.MKT_VALUE,
                registeredDocumentValue: scheduleDetails.MKT_VALUE
            },
            sroName: get(appData, 'docDetails.0.SRNAME', ''),
            documentNumber: ptinScheduleDetails.RDOCT_NO,
            documentDate: ptinScheduleDetails.TIME_STAMP,
            registeredDocumentLink: await this.automutationServices.getFilePath(body),
            mutationType: "ASSESSED_PARTIAL_MUTATION",
            registrationYear: scheduleDetails.REG_YEAR,
            bookNumber: scheduleDetails.BOOK_NO,
            marketValue: scheduleDetails.MKT_VALUE

        };
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${cdmaHostURL}${cdmaAPIs.autoMutationAPIForPartTransferWithPTIN}`,
            headers: {
                'Referer': `${process.env.URBAN_SERVER_IP}`,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            data: paramsObj
        };        
        return config
    }

    urbanMutationRequest = async (req, res) => {
        try {
            let resObj = [];
            let appData = await this.checkSlip.getCheckSlipReportsSrvc({ ...req.query, flag: 2 });
            let claimants = get(appData, 'partyDetails', []).filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
            let executants = get(appData, 'partyDetails', []).filter(C => CODES.EXECUTANT_CODES.includes(C.CODE));
            if (claimants.length === 0) {
                return res.status(200).send({ message: 'Claimants not found' });
            } else {
                let token;
                let ulbData;
                const mutationsData = appData.schedule.map(async (i) => {
                    let isMutable = await this.automutationServices.filterUrbanMutationSchedules(i);
                    if(isMutable){
                    let query = `Select * from srouser.mutation_sent_urban_cr where sr_code = ${i.SR_CODE} and book_no = ${i.BOOK_NO} and doct_no = ${i.DOCT_NO} and reg_year = ${i.REG_YEAR} and schedule_no= ${i.SCHEDULE_NO}`;
                    let qResults = await this.orDao.oDBQueryService(query);
                    if (qResults.length) {
                        for (let data of qResults) {
                            resObj[resObj.length] = {
                                'status': true,
                                'result': data,
                                'schedule_no': i.SCHEDULE_NO
                            }
                        }
                    } else {
                        let query2 = `Select a.*, b.rdoct_no, b.ryear from SROUSER.PTIN_DETAILS_CR a
                                    join tran_major b on a.sr_code =b.sr_code and a.doct_no = b.doct_no and a.book_no = b.book_no and a.reg_year = b.reg_year
                                     where a.sr_code = ${i.SR_CODE} and a.book_no = ${i.BOOK_NO} and a.doct_no = ${i.DOCT_NO} and a.reg_year = ${i.REG_YEAR} and a.schedule_no= ${i.SCHEDULE_NO}`;
                        let result = await this.orDao.oDBQueryService(query2);
                        let ptin_schedules = result.filter(f => f.SCHEDULE_NO == i.SCHEDULE_NO);
                        const structure = appData.structure.filter(s => s.SCHEDULE_NO == i.SCHEDULE_NO)
                        if (ptin_schedules.length) {
                            // if (!token) {
                                ulbData = await this.urbanService.getUlbCodeOfMuncipality(i);
                                if (ulbData.length < 1) {
                                    return resObj[resObj.length] = {
                                        'status': false,
                                        'message': 'Ulb code not availble Scheduled SRO Juridiction please',
                                        'schedule_no': i.SCHEDULE_NO
                                    }
                                }
                                token = await this.UrbanTokenGeneration({ ptin: ptin_schedules[0].PTIN != 0 ? ptin_schedules[0].PTIN : ulbData[0].MUNI_CODE, flag: 1 });
                            // };
                            if (typeof token !== 'string') {
                                token = token.access_token;
                                let mutableSchedules = [];
                                let updatedAppData = appData
                                if (appData.docDetails[0].TRAN_MAJ_CODE === '04') {
                                    const mutableClaimantsNumbers = i.PARTITION_PARTY_NO.split(',').map(val => +val);
                                    const claimantsList = claimants.filter(item => mutableClaimantsNumbers.includes(item.EC_NUMBER));
                                    updatedAppData = { ...updatedAppData, partyDetails: claimantsList }
                                }
                                if (ptin_schedules[0].PTIN == 0) {
                                    let isExecutantMutationNeeded = false;
                                    let configData = await this.getConfigurationsOfWithoutPTIN(req.body, token, i, structure, ptin_schedules[0], ulbData[0].MUNI_CODE, updatedAppData, isExecutantMutationNeeded);
                                    mutableSchedules.push(configData);
                                    if (ptin_schedules[0].URBAN_SELLING_EXTENT === 'PARTIAL' && appData.docDetails[0].TRAN_MAJ_CODE !== '04') {
                                        isExecutantMutationNeeded = true;
                                        let configData = await this.getConfigurationsOfWithoutPTIN(req.body, token, i, structure, ptin_schedules[0], ulbData[0].MUNI_CODE, updatedAppData, isExecutantMutationNeeded);
                                        mutableSchedules.push(configData);                                        
                                    }
                                } else if (ptin_schedules[0].PTIN !== 0 && ptin_schedules[0].URBAN_SELLING_EXTENT === 'FULL') {
                                    let configData = await this.getConfigurationsOfWithPTINFullExtent(req.body, token, ptin_schedules[0]);
                                    mutableSchedules.push(configData);

                                } else {
                                    // We are commenting the code because 2A case put on hold .
                                    let configData = await this.getConfigurationsWithPTINPartialExtent(req.body, token, i, structure, ptin_schedules[0], ulbData[0].MUNI_CODE, updatedAppData);
                                    mutableSchedules.push(configData);
                                }
                                let mutationdata;
                                for (let config of mutableSchedules) {                                                                        
                                    try {
                                        let result = await axios.request(config);
                                        let resdata = result.data; 
                                        if ((ptin_schedules[0].PTIN !== 0  && resdata.errorCode === "PTIS-REST-0") ||
                                            (resdata.errorCode === null || resdata.errorCode === undefined)) {
                                            let REQ_BODY = this.mutationServices.CircularStringify(config);
                                            let RESPONSE = this.mutationServices.CircularStringify(result);
                                            REQ_BODY = Buffer.from(REQ_BODY, 'utf8');
                                            RESPONSE = Buffer.from(RESPONSE, 'utf8');
                                            let q = `INSERT INTO srouser.mutation_sent_urban_cr 
                                                    (ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, PTIN, CERTIFICATE_LINK, TIME_STAMP,PTIN_APPLICATIONID,PROVISIONAL_PTIN, REQ_BODY, RESPONSE) 
                                                    VALUES ( '${ptin_schedules[0].ID}',  ${i.SR_CODE},  ${i.BOOK_NO},  ${i.DOCT_NO},  ${i.REG_YEAR},  '${i.SCHEDULE_NO}',${ptin_schedules[0].PTIN}, '${resdata?.certificateLink}', SYSDATE ,'${resdata.applicationNumber}','${resdata.assessmentNumber}', :blobdata, :blobData2)`;
                                            let qResult = await this.orDao.oDbInsertBlobDocsWithBindParams(q, {}, REQ_BODY,RESPONSE );
                                            resObj[resObj.length] = {
                                                'status': true,
                                                'result': {
                                                    'CERTIFICATE_LINK': resdata.certificateLink,
                                                    'PTIN': resdata.assessmentNumber
                                                },
                                                'schedule_no': i.SCHEDULE_NO
                                            }
                                        }

                                        else {
                                            mutationdata = {
                                                'bookNo': i.BOOK_NO,
                                                'docNo': i.DOCT_NO,
                                                'regYear': i.REG_YEAR,
                                                'srCode': i.SR_CODE,
                                                'mutation_error_log': resdata.errorMessage,
                                                'mutation_status': 'N',
                                                'SCHEDULE_NO': i.SCHEDULE_NO,
                                                'MUTATION_VALUE': ptin_schedules[0].PTIN,
                                                'PROPERTY_TYPE': 'U',
                                                'REQ_BODY':  this.mutationServices.CircularStringify(config) || '',
                                                'RESPONSE':  this.mutationServices.CircularStringify(resdata) || ''
                                            }
                                            let response = await this.automutationServices.Mutationerrorstoresrvc(mutationdata);
                                            resObj[resObj.length] = {
                                                'status': false,
                                                'message': resdata.errorMessage,
                                                'errorData': resdata,
                                                'schedule_no': i.SCHEDULE_NO,
                                                'result': {
                                                    'PTIN': ptin_schedules[0].PTIN
                                                }
                                            }
                                            return { status: "success" }
                                        }
                                    } catch (err) {
                                        mutationdata = {
                                            'bookNo': i.BOOK_NO,
                                            'docNo': i.DOCT_NO,
                                            'regYear': i.REG_YEAR,
                                            'srCode': i.SR_CODE,
                                            'mutation_error_log': get(err, 'response.data.error', err.message),
                                            'mutation_status': 'N',
                                            'SCHEDULE_NO': i.SCHEDULE_NO,
                                            'MUTATION_VALUE': ptin_schedules[0].PTIN,
                                            'PROPERTY_TYPE': 'U',
                                            'REQ_BODY': typeof config === 'object' ? JSON.stringify(config, null, 2) : '',
                                            'RESPONSE': typeof err?.response === 'object' && err?.response?.data ? JSON.stringify(err?.response?.data) : err.message
                                        }
                                        let response = await this.automutationServices.Mutationerrorstoresrvc(mutationdata);
                                        resObj[resObj.length] = {
                                            'status': false,
                                            'message': get(err, 'response.data.error', err.message),
                                            'errorData': err?.response?.data,
                                            'schedule_no': i.SCHEDULE_NO,
                                            'result': {
                                                'PTIN': ptin_schedules[0].PTIN
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                return res.status(400).send({
                                    status: false,
                                    message: `Token Generation Failed. ${token}`
                                })
                            }
                        }}
                    }
                })
                await Promise.all(mutationsData);
                if (!resObj.filter(r => r.message).length > 0) {
                    this.updateStatusFromMutationAPI({
                        body: { ...req.body, 'STATUS': 'U', 'statusFlag': true }
                    }, res);
                    return res.status(200).send({ status: true, resObj })
                }
                else {
                    return res.status(200).send({ status: false, resObj })
                }
            }
        }
        catch (ex) {
            console.error("AutoMutationHandler - urbanMutationRequest || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    ////-------------------------------------------------------------------------------------------------------------------------//
     ReExecuteurbanMutationErrorRequest = async (req, res) => {
        try {
            let resObj = [];
            let appData = await this.checkSlip.getCheckSlipReportsSrvc({ ...req.query, flag: 2 });
            let claimants = get(appData, 'partyDetails', []).filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
            let executants = get(appData, 'partyDetails', []).filter(C => CODES.EXECUTANT_CODES.includes(C.CODE));
            if (claimants.length === 0) {
                return res.status(200).send({ message: 'Claimants not found' });
            } else {
                let token;
                let ulbData;
                const mutationsData = appData.schedule.map(async (i) => {
                    let isMutable = await this.automutationServices.filterUrbanMutationSchedules(i);
                    if(isMutable){
                    let query = `Select * from srouser.mutation_sent_urban_cr where sr_code = ${i.SR_CODE} and book_no = ${i.BOOK_NO} and doct_no = ${i.DOCT_NO} and reg_year = ${i.REG_YEAR} and schedule_no= ${i.SCHEDULE_NO}`;
                    let qResults = await this.orDao.oDBQueryService(query);
                    if (qResults.length) {
                        for (let data of qResults) {
                            resObj[resObj.length] = {
                                'status': true,
                                'result': data,
                                'schedule_no': i.SCHEDULE_NO
                            }
                        }
                    } else {
                        let query2 = `Select a.*, b.rdoct_no, b.ryear from SROUSER.PTIN_DETAILS_CR a
                                    join tran_major b on a.sr_code =b.sr_code and a.doct_no = b.doct_no and a.book_no = b.book_no and a.reg_year = b.reg_year
                                     where a.sr_code = ${i.SR_CODE} and a.book_no = ${i.BOOK_NO} and a.doct_no = ${i.DOCT_NO} and a.reg_year = ${i.REG_YEAR} and a.schedule_no= ${i.SCHEDULE_NO}`;
                        let result = await this.orDao.oDBQueryService(query2);
                        let ptin_schedules = result.filter(f => f.SCHEDULE_NO == i.SCHEDULE_NO);
                        const structure = appData.structure.filter(s => s.SCHEDULE_NO == i.SCHEDULE_NO)
                        if (ptin_schedules.length) {
                            if (!token) {
                                ulbData = await this.urbanService.getUlbCodeOfMuncipality(i.JURISDICTION);
                                if (ulbData.length < 1) {
                                    return resObj[resObj.length] = {
                                        'status': false,
                                        'message': 'Ulb code not availble Scheduled SRO Juridiction please',
                                        'schedule_no': i.SCHEDULE_NO
                                    }
                                }
                                token = await this.UrbanTokenGeneration({ ptin: ptin_schedules[0].PTIN != 0 ? ptin_schedules[0].PTIN : ulbData[0].MUNI_CODE, flag: 1 });
                            };
                            if (typeof token !== 'string') {
                                token = token.access_token;
                                let mutableSchedules = [];
                                let updatedAppData = appData
                                if (appData.docDetails[0].TRAN_MAJ_CODE === '04') {
                                    const mutableClaimantsNumbers = i.PARTITION_PARTY_NO.split(',').map(val => +val);
                                    const claimantsList = claimants.filter(item => mutableClaimantsNumbers.includes(item.EC_NUMBER));
                                    updatedAppData = { ...updatedAppData, partyDetails: claimantsList }
                                }
                                if (ptin_schedules[0].PTIN == 0) {
                                    let isExecutantMutationNeeded = false;
                                    let configData = await this.getConfigurationsOfWithoutPTIN(req.body, token, i, structure, ptin_schedules[0], ulbData[0].MUNI_CODE, updatedAppData, isExecutantMutationNeeded);
                                    mutableSchedules.push(configData);
                                    if (ptin_schedules[0].URBAN_SELLING_EXTENT === 'PARTIAL' && appData.docDetails[0].TRAN_MAJ_CODE !== '04') {
                                        isExecutantMutationNeeded = true;
                                        let configData = await this.getConfigurationsOfWithoutPTIN(req.body, token, i, structure, ptin_schedules[0], ulbData[0].MUNI_CODE, updatedAppData, isExecutantMutationNeeded);
                                        mutableSchedules.push(configData);
                                    }
                                } else if (ptin_schedules[0].PTIN !== 0 && ptin_schedules[0].URBAN_SELLING_EXTENT === 'FULL') {
                                    let configData = await this.getConfigurationsOfWithPTINFullExtent(req.body, token, ptin_schedules[0]);
                                    mutableSchedules.push(configData);

                                } else {
                                    // We are commenting the code because 2A case put on hold .
                                    let configData = await this.getConfigurationsWithPTINPartialExtent(req.body, token, i, structure, ptin_schedules[0], ulbData[0].MUNI_CODE, updatedAppData);
                                    mutableSchedules.push(configData);
                                }
                                let mutationdata;
                                for (let config of mutableSchedules) {
                                    try {
                                        let result = await axios.request(config);
                                        let resdata = result.data; 
                                        if ((ptin_schedules[0].PTIN !== 0  && resdata.errorCode === "PTIS-REST-0") ||
                                            (resdata.errorCode === null || resdata.errorCode === undefined)) {
                                            let REQ_BODY = this.mutationServices.CircularStringify(config);
                                            let RESPONSE = this.mutationServices.CircularStringify(result);
                                            REQ_BODY = Buffer.from(REQ_BODY, 'utf8');
                                            RESPONSE = Buffer.from(RESPONSE, 'utf8');
                                            let q = `INSERT INTO srouser.mutation_sent_urban_cr 
                                                    (ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, PTIN, CERTIFICATE_LINK, TIME_STAMP,PTIN_APPLICATIONID,PROVISIONAL_PTIN, REQ_BODY, RESPONSE) 
                                                    VALUES ( '${ptin_schedules[0].ID}',  ${i.SR_CODE},  ${i.BOOK_NO},  ${i.DOCT_NO},  ${i.REG_YEAR},  '${i.SCHEDULE_NO}',${ptin_schedules[0].PTIN}, '${resdata?.certificateLink}', SYSDATE ,'${resdata.applicationNumber}','${resdata.assessmentNumber}', :blobdata, :blobData2)`;
                                            let qResult = await this.orDao.oDbInsertBlobDocsWithBindParams(q, {}, REQ_BODY,RESPONSE );
                                            resObj[resObj.length] = {
                                                'status': true,
                                                'result': {
                                                    'CERTIFICATE_LINK': resdata.certificateLink,
                                                    'PTIN': resdata.assessmentNumber
                                                },
                                                'schedule_no': i.SCHEDULE_NO
                                            }
                                        }

                                        else {
                                            mutationdata = {
                                                'bookNo': i.BOOK_NO,
                                                'docNo': i.DOCT_NO,
                                                'regYear': i.REG_YEAR,
                                                'srCode': i.SR_CODE,
                                                'mutation_error_log': resdata.errorMessage,
                                                'mutation_status': 'N',
                                                'SCHEDULE_NO': i.SCHEDULE_NO,
                                                'MUTATION_VALUE': ptin_schedules[0].PTIN,
                                                'PROPERTY_TYPE': 'U',
                                                'REQ_BODY': typeof config === 'object' ? JSON.stringify(config, null, 2) : '',
                                                'RESPONSE': typeof resdata === 'object' ? JSON.stringify(resdata, null, 2) : ''
                                            }
                                            let response = await this.automutationServices.Mutationerrorstoresrvc(mutationdata);
                                            resObj[resObj.length] = {
                                                'status': false,
                                                'message': resdata.errorMessage,
                                                'errorData': resdata,
                                                'schedule_no': i.SCHEDULE_NO,
                                                'result': {
                                                    'PTIN': ptin_schedules[0].PTIN
                                                }
                                            }
                                            return { status: "success" }
                                        }
                                    } catch (err) {
                                        mutationdata = {
                                            'bookNo': i.BOOK_NO,
                                            'docNo': i.DOCT_NO,
                                            'regYear': i.REG_YEAR,
                                            'srCode': i.SR_CODE,
                                            'mutation_error_log': get(err, 'response.data.error', err.message),
                                            'mutation_status': 'N',
                                            'SCHEDULE_NO': i.SCHEDULE_NO,
                                            'MUTATION_VALUE': ptin_schedules[0].PTIN,
                                            'PROPERTY_TYPE': 'U',
                                            'REQ_BODY': typeof config === 'object' ? JSON.stringify(config, null, 2) : '',
                                            'RESPONSE': typeof err?.response === 'object' && err?.response?.data ? JSON.stringify(err?.response?.data) : err.message
                                        }
                                        let response = await this.automutationServices.Mutationerrorstoresrvc(mutationdata);
                                        resObj[resObj.length] = {
                                            'status': false,
                                            'message': get(err, 'response.data.error', err.message),
                                            'errorData': err?.response?.data,
                                            'schedule_no': i.SCHEDULE_NO,
                                            'result': {
                                                'PTIN': ptin_schedules[0].PTIN
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                return res.status(400).send({
                                    status: false,
                                    message: `Token Generation Failed. ${token}`
                                })
                            }
                        }}
                    }
                })
                await Promise.all(mutationsData);
                if (!resObj.filter(r => r.message).length > 0) {
                    this.updateStatusFromMutationAPI({
                        body: { ...req.body, 'STATUS': 'U', 'statusFlag': true }
                    }, res);
                    return res.status(200).send({ status: true, resObj })
                }
                else {
                    return res.status(200).send({ status: false, resObj })
                }
            }
        }
        catch (ex) {
            console.error("AutoMutationHandler - urbanMutationRequest || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

async processUrbanMutationRecord(srCode, bookNo, regYear, docNo, RDOCT_NO, rDOc) {
    try {
        const reqQuery = {
            srCode: srCode,
            bookNo: bookNo,
            regYear: regYear,
	    docNo: docNo,
	    RDOCT_NO: RDOCT_NO,
	    rDOc: rDOc
        };

        const mockReq = {
            query: reqQuery,
            body: reqQuery,
        };

        const mockRes = {
            status: (code) => ({
                send: (data) => {
                    return { statusCode: code, data };
                }
            })
        };

        const result = await this.ReExecuteurbanMutationErrorRequest(mockReq, mockRes);
        return result;
    } catch (err) {
        console.error(`Error processing srCode ${srCode}:`, err.message);
        return {
            statusCode: 500,
            data: {
                status: false,
                message: err.message
            }
        };
    }
}

runUrbanMutationForAll = async () => {
    try {
        //const query = `SELECT sr_code, book_no, reg_year, doct_no FROM srouser.Mutation_status_record where rownum=1`;
        const query = `select distinct a.sr_code, a.book_no,a.reg_year, a.doct_no, b.rdoct_no from
srouser.Mutation_status_record a join tran_major b on a.sr_code=b.sr_code and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.book_no=b.book_no  where  a.Property_type='U' and a.mutation_error_log like '%Request failed with status code 500%' and a.sr_code not in ('628') 
and trunc(a.time_stamp) between TO_DATE('14-07-2025','DD-MM-YYYY') AND TO_DATE('27-07-2025','DD-MM-YYYY')`;
console.log("query::::::::::",query)
        const mutationRecords = await this.orDao.oDBQueryService(query);
console.log("Dummy")

        if (!mutationRecords.length) {
            console.log("No mutation records found.");
            return [];
        }

        const results = [];

        for (const record of mutationRecords) {
            const apiPayload = {
                docNo: record.DOCT_NO,
                regYear: record.REG_YEAR,
                srCode: record.SR_CODE,
                bookNo: record.BOOK_NO,
		RDOCT_NO: record.RDOCT_NO,
		rDOc: record.RDOCT_NO
            };

            const result = await this.processUrbanMutationRecord(
                apiPayload.srCode,
                apiPayload.bookNo,
                apiPayload.regYear,
		apiPayload.docNo,
		apiPayload.RDOCT_NO,
		apiPayload.rDOc,

            );

            results.push({
                input: apiPayload,
                output: result
            });
        }

        console.log("All mutation records processed.");
	console.log("results::::::::",JSON.stringify(results))
        return res.status(200).send(results);

    } catch (err) {
        console.error("Error in runUrbanMutationForAll:", err.message);
        const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
    }
}

//-----------------------------------------------------------------------------------------------------------//


    previewUrbanMutation = async (req, res) => {
        try {
            // 1. Get document Details // include flag = 1
            let data = await this.checkSlip.getCheckSlipReportsSrvc({ ...req.body, flag: 2 });
            const isMutable = await this.automutationServices.isUrbanMutationNeeded(data);
            if (!isMutable){
                req.body.RES_OBJ = {
                    status: true,
                    code: 0,
                    'message': 'No Mutation needed. Status Changed Successfully'
                };
                req.body.STATUS = 'U';
                await this.updateStatusFromMutationAPI(req, res);
                return;
            } else {


               let query = `select a.*,b.jurisdiction,b.hab_code,b.village_code ,hl.village_code as webland_code,se.urban_mutation_status from SROUSER.PTIN_DETAILS_CR a
                            join tran_sched b on a.reg_year=b.reg_year and a.book_no=b.book_no and  a.sr_code=b.sr_code and a.doct_no=b.doct_no and a.schedule_no=b.schedule_no
                            join srouser.slot_enable_sro se on b.jurisdiction=se.sr_code
                            left join hab_match hb on b.hab_code= hb.hab_code and rownum=1
                            left join sromstr.hab_ulb hl on hb.webland_code=hl.village_code
                            where a.sr_code =${req.body.srCode} and a.book_no =${req.body.bookNo} and a.reg_year =${req.body.regYear} and a.doct_no =${req.body.docNo} and se.urban_mutation_status='Y' and hl.village_code is not null`;

                let newRes = await this.orDao.oDBQueryService(query);
                const result = []
                const filterMutableSroSchedules = await newRes.map(async (r) => {
                        if ((`${r.SITE_EXTENT}`).includes(".")) {
                            let secondPart = `${r.SITE_EXTENT}`.split(".")[1].substring(0, 2)
                            let firstPart = `${r.SITE_EXTENT}`.split(".")[0]
                            r.SITE_EXTENT = firstPart + "." + secondPart;
                        }
                        // if (r.PTIN == 0 || r.PTIN == '0' || (r.PTIN != 0 && r.URBAN_SELLING_EXTENT == "FULL")) {
                            result.push(r)
                        // }
                    

                })
                await Promise.all(filterMutableSroSchedules);
                if (result.length) {
                    return res.status(200).send({
                        'status': true,
                        'message': "Mutation needed.",
                        'data': { 'csData': data, 'reqbody': req.body, result }
                    })
                } else if (result.length == 0 && newRes.length) {
                    req.body.RES_OBJ = {
                        'status': true,
                        'code': 0,
                        'message': 'No schedules found for Auto Mutation'
                    };
                    req.body.STATUS = 'U';
                    await this.updateStatusFromMutationAPI(req, res);
                    return;
                }
                else {
                    req.body.RES_OBJ = {
                        'status': true,
                        'code': 0,
                        'message': 'No Mutation needed status changed successfully!'
                    };
                    req.body.STATUS = 'U';
                    await this.updateStatusFromMutationAPI(req, res);
                    return;
                }
                const isSroEnabledForMutationDataquery = `Select * from srouser.slot_enable_sro where sr_code=${req.body.srCode}`
                const isSroEnabledForMutationData = await this.orDao.oDBQueryService(isSroEnabledForMutationDataquery);
                if (isSroEnabledForMutationData[0].URBAN_MUTATION_STATUS === 'Y') {
                    // this query gets schedules present in preregistration table
                    let query = `Select * from SROUSER.PTIN_DETAILS_CR where sr_code = ${req.body.srCode} and book_no = ${req.body.bookNo} and reg_year = ${req.body.regYear} and doct_no = ${req.body.docNo}`;
                    let newRes = await this.orDao.oDBQueryService(query);
                    //newRes[0].PTIN='19883959331900999'
                    let result = []
                    newRes.map(r => {
                        if ((`${r.SITE_EXTENT}`).includes(".")) {
                            let secondPart = `${r.SITE_EXTENT}`.split(".")[1].substring(0, 2)
                            let firstPart = `${r.SITE_EXTENT}`.split(".")[0]
                            r.SITE_EXTENT = firstPart + "." + secondPart;
                        }
                        // if(r.URBAN_SELLING_EXTENT == "FULL"){
                        //     result.push(r)
                        // }
                        if ( r.PTIN ==0 || r.PTIN=='0' || (r.PTIN!=0 && r.URBAN_SELLING_EXTENT == "FULL")) {
                            result.push(r)
                        }
                    });
                    if (result.length) {
                        return res.status(200).send({
                            'status': true,
                            'message': "Mutation needed.",
                            'data': { 'csData': data, 'reqbody': req.body, result }
                        })
                    } else if (result.length == 0 && newRes.length) {
                        req.body.RES_OBJ = {
                            'status': true,
                            'code': 0,
                            'message': 'No schedules found with full extent property, Partial mutation will be available soon'
                        };
                        req.body.STATUS = 'U';
                        await this.updateStatusFromMutationAPI(req, res);
                        return;
                    }
                    else {
                        req.body.RES_OBJ = {
                            'status': true,
                            'code': 0,
                            'message': 'No Mutation needed status changed successfully!'
                        };
                        req.body.STATUS = 'U';
                        await this.updateStatusFromMutationAPI(req, res);
                        return;
                    }
                } else {
                    req.body.RES_OBJ = {
                        'status': true,
                        'code': 0,
                        'message': 'Auto mutation not enabled for this SRO!'
                    };
                    req.body.STATUS = 'U';
                    await this.updateStatusFromMutationAPI(req, res);
                    return;
                }
            }
        } catch (ex) {
            console.error("AutoMutationHandler - previewUrbanMutation || Error :", ex.message);
            //Logger.error(`Urban mutation failure =======> ${req.body.srCode}-${req.body.bookNo}-${req.body.docNo}-${req.body.regYear} =======> ${ex.message}`);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    isMutationNeeded = async (req, res) => {
        try {
            let body = req.body;
            if (this.automutationServices.isMutationNeeded(body)) {
                return res.status(200).send({
                    status: true,
                    mutation: true
                })
            } else {
                return res.status(200).send({
                    status: true,
                    mutation: false
                })
            }
        } catch (ex) {
            console.error("AutoMutationHandler - isMutationNeeded || Error :", ex.message);
            //Logger.error(`Urban mutation failure =======> ${req.body.srCode}-${req.body.bookNo}-${req.body.docNo}-${req.body.regYear} =======> ${ex.message}`);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    sendWhatsAppNotificationForCC = async(req,res)=>{
        const requiredParams = {
            srCode:req.params.sroCode,
            bookNo:req.params.bookNo,
            regYear:req.params.regYear,
            doctNo:req.params.docNo,
        }
        if(requiredParams.bookNo==1){
        const data = await this.automutationServices.sendWhatsAppNotificationService(requiredParams);
        return res.status(200).json({
            status: true,
            message: "Message sent Successfully",
            code: "200",
        })
        }else{
            return res.json({
                status: true,
            message: "No need to send whatsapp message",
            code: "400",
            })
        }
    }
    MutationStatusMailHndlr = async (req, res) => {
        let reqData = req.body;
        if (reqData.SR_CODE == null || reqData.BOOK_NO == null || reqData.REG_YEAR == null || reqData.DOCT_NO == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.automutationServices.MutationStatusMailsrvc(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });

        } catch (ex) {
            console.error("AutoMutationHandler - MutationStatusMailHndlr || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    MutationcountHndlr = async (req, res) => {
        let reqData = req.query;
        if (reqData.srCode == null || reqData.srCode == undefined || reqData.srCode === '') {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.automutationServices.Mutationcountsrvc(reqData);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });

        } catch (ex) {
            console.error("AutoMutationHandler - MutationerrorstoreHndlr || Error :", ex.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    subdivisionAndMuationSubmit = async (req, res) => {
        try {
            let subDivresponse = await this.executeAutoRuralSubdivionProcess();
            let pendingMutResponse = await this.executeRuralMutationProcess();
            let scriptResponse = await this.executeAutoScriptsAfterAllSubmits();
            console.log("End of subdivisionAndMuationSubmit ::::: ");
            return res.status(200).send({
                status: "Success",
                data: {
                    "subDivisionStatus": subDivresponse,
                    "mutationPendingStatus": pendingMutResponse,
                    //"lpmPendingStatus":lpmPendingResponse,
                    "scriptResponse": scriptResponse
                }
            });
        } catch (error) {
            console.log("End of subdivisionAndMuationSubmit ::::: ", error);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
                status: "Failure",
                message: "Error while executing the steps ::: " + error.message
            });
        }
    }

    executeSubdivisionAndRuralMutationProcess = async () => {
        console.log("Inside of executeSubdivisionAndRuralMutationProcess ::::: ");
        try {
            let subDivresponse = await this.executeAutoRuralSubdivionProcess();
            let pendingMutResponse = await this.executeRuralMutationProcess();
            let scriptResponse = await this.executeAutoScriptsAfterAllSubmits();
            return {
                status: "Success",
                data: {
                    "subDivisionStatus": subDivresponse,
                    "mutationPendingStatus": pendingMutResponse,
                    //"lpmPendingStatus":lpmPendingResponse,
                    "scriptResponse": scriptResponse
                }
            }
        } catch (error) {
            return {
                status: "Success",
                message: "Error while executing the steps ::: " + error.message
            }
        }
    }

    executeAutoScriptsAfterAllSubmits = async () => {
        console.log("Inside of executeAutoScriptsAfterAllSubmits ::::: ");
        try {
            /*
            let insertScript1 = `INSERT INTO srouser.mutation_sent_cr ( SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, 
                                TYPE, TIME_STAMP, S_LP_NO ) SELECT SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR,
                                'LPM' AS TYPE, TIME_STAMP, MUTATION_VALUE FROM srouser.Mutation_status_record a
                                WHERE a.reg_year = 2025 AND a.book_no = 1 AND a.MUTATION_ERROR_LOG IS NULL 
                                AND TRUNC(a.time_stamp) = TRUNC(SYSDATE)`;

            let count1 = await this.orDao.oDbInsertDocs(insertScript1);
            console.log("insertScript1 count :::::: ", count1);

            let insertScript2 = `INSERT INTO srouser.mutation_sent_cr ( SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR,
                                TYPE, TIME_STAMP, S_LP_NO ) SELECT SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, 
                                'LPM' AS TYPE, TIME_STAMP, MUTATION_VALUE FROM srouser.Mutation_status_record a
                                WHERE (a.MUTATION_ERROR_LOG LIKE '%Document already exists%' OR 
                                a.MUTATION_ERROR_LOG LIKE '%Sro Code Pid already exists%' OR 
                                a.MUTATION_ERROR_LOG LIKE '%Sro Code Pid already exists With Document%' OR
                                a.MUTATION_ERROR_LOG LIKE '%Sro Code Pid Already Used%') AND a.reg_year = 2025 AND
                                a.book_no = 1 AND trunc(a.time_stamp) = TRUNC(SYSDATE)`;

            let count2 = await this.orDao.oDbInsertDocs(insertScript2);
            console.log("insertScript2 count :::::: ", count2);
            */
            let insertScript3 = `insert into srouser.mutation_status_record( select b.sr_code,1 ,b.doct_no,b.reg_year,
                                error_log,'N',B.TIME_sTAMP,B.SCHEDULE_NO,'R',333,REQ_DATA,RESPONSE FROM SROUSER. SUBDIV_STATUS_RECORD B 
                                WHERE (B.SR_cODE,B.DOCT_NO,B.REG_YEAR) NOT IN (SELECT C.SR_CODE,C.DOCT_NO,C.REG_YEAR 
                                FROM srouser.mutation_status_record C))`;

            let count3 = await this.orDao.oDbInsertDocs(insertScript3);
            console.log("insertScript3 count :::::: ", count3);

            return {
                status:"Success",
                data : {
                    "count3":count3
                }
            }
        } catch (error) {
            return {
                status: "Success",
                message: "Error while executing the steps ::: " + error.message
            }
        }
    }

    executeDataByRequest = async (req, res) => {
        try {
            console.log("Inside of executeDataByRequest ::::: ");
            const mutationResponse = await this.mutationServices.doSubDivisionAndMutation(req.body);
            return res.status(200).send(mutationResponse); 
        }catch (ex) {
            console.error("executeDataByRequest - executeDataByRequest || Error :", ex);
            let responseData = {
                status: false,
                message: "Failed with Error :::: " + (ex.message),
                code: "500",
            };
            return res.status(500).send(responseData);
        }

    }

    executeAutoRuralSubdivionProcess = async () => {
        try {
            console.log("Inside of executeAutoRuralSubdivionProcess ::::: ");

            let query = `select sr_code,book_no,doct_no,reg_year from pde_doc_status_cr where
                        doc_subdiv='N' AND doc_muTation='N' AND DOC_ESIGN='Y' AND
                        (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR) IN (SELECT A.SR_CODE,A.BOOK_NO,A.DOCT_NO,
                        A.REG_YEAR FROM TRAN_MAJOR A,TRAN_SCHED B WHERE TRUNC(R_DATE)=TRUNC(SYSDATE-1)
                        AND A.SR_CODE=B.SR_CODE AND A.BOOK_NO=B.BOOK_NO AND A.DOCT_NO=B.DOCT_NO AND
                        A.REG_YEAR=B.REG_YEAR AND ((A.TRAN_MAJ_CODE='01' AND A.tran_min_code IN 
                        ('01', '04', '05', '06', '08', '14', '15', '16', '17', '19', '27' ,'28', '29')) OR (
                        A.tran_maj_code = '03' AND A.tran_min_code IN ('01', '02', '03', '04','05', '06', '07', '08', '09'))
                         OR (A.tran_maj_code = '04' AND A.tran_min_code IN ('01', '02'))) and 
                         B.nature_use in ('21','22','26','30','44','45','46'))`;

            let response = await this.orDao.oDBQueryService(query);
            console.log(response.length, '::::::::::::::::::::::response');

            if (response && response.length > 0) {
                let count = 1;
                let convertedArray = this.splitArray(response, 500);
                console.log(convertedArray.length, '::::::::::::::::::::::convertedArray ');

                let promisesArray = [];
                for (let mutationArray of convertedArray) {
                    let promiseObj = new Promise(async (resolve, reject) => {
                        try {
                            for (let i = 0; i < mutationArray.length; i++) {
                                //for (let i = 0; i < 1; i++) {
                                let data = {};
                                //console.log("executing record :::: ", (count));
                                let docDetails = mutationArray[i];
                                try {
                                    data = {
                                        "bookNo": docDetails.BOOK_NO,
                                        "docNo": docDetails.DOCT_NO,
                                        "regYear": docDetails.REG_YEAR,
                                        "srCode": docDetails.SR_CODE
                                    }
                                    let mutationResponse = await this.mutationServices.doSubDivisionAndMutation(data);
                                } catch (error) {
                                    console.error("autoMutationHandler - executeAutoRuralSubdivionProcess || Error :", error);
                                }
                                console.log("executed record :::: ", (count));
                                count++;
                            }
                            resolve({ "result": "Success" });
                        } catch (error) {
                            reject(error);
                        }
                    });
                    promisesArray.push(promiseObj);
                }
                //console.log("promisesArray :::: ", promisesArray);
                let result1 = Promise.all(promisesArray);
                let finalResponse;
                await result1.then((data) => {
                    finalResponse = data;
                }).catch(err => { throw err; });
            }
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
            };
            console.log("End of executeAutoRuralSubdivionProcess ::::: ");
            return responseData;
        }
        catch (ex) {
            console.error("grantapproveServices - GetRejectListsrvc || Error :", ex);
            let responseData = {
                status: false,
                message: "Failed with Error :::: " + (ex.message),
                code: "500",
            };
            return responseData;
        }
    }


    executeRuralMutationProcess = async () => {
        try {
            console.log("Inside of executeRuralMutationProcess :::: ");
            let query = `select sr_code,book_no,doct_no,reg_year from pde_doc_status_cr where 
                        doc_subdiv='Y' AND doc_muTation='N' AND DOC_ESIGN='Y' AND 
                        (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR) IN (SELECT A.SR_CODE,A.BOOK_NO,A.DOCT_NO,
                        A.REG_YEAR FROM TRAN_MAJOR A,TRAN_SCHED B WHERE TRUNC(R_DATE)=TRUNC(SYSDATE-1) 
                        AND A.SR_CODE=B.SR_CODE AND A.BOOK_NO=B.BOOK_NO AND A.DOCT_NO=B.DOCT_NO AND 
                        A.REG_YEAR=B.REG_YEAR AND ((A.TRAN_MAJ_CODE='01' AND A.tran_min_code IN 
                        ('01', '04', '05', '06', '08', '14', '15', '16', '17', '19', '27' ,'28', '29')) OR (
                        A.tran_maj_code = '03' AND A.tran_min_code IN ('01', '02', '03', '04','05', '06', '07', '08', '09'))
                         OR (A.tran_maj_code = '04' AND A.tran_min_code IN ('01', '02'))) and 
                         B.nature_use in ('21','22','26','30','44','45','46'))`;

            let response = await this.orDao.oDBQueryService(query);
            console.log(response.length, '::::::::::::::::::::::response');

            if (response && response.length > 0) {
                let count = 1;
                let convertedArray = this.splitArray(response, 500);
                let promisesArray = [];
                for (let mutationArray of convertedArray) {
                    let promiseObj = new Promise(async (resolve, reject) => {
                        try {
                            for (let i = 0; i < mutationArray.length; i++) {
                                let data = { 'body': {} };
                                //console.log("executing record :::: ", (count));
                                let docDetails = mutationArray[i];
                                try {
                                    data.body = {
                                        "bookNo": docDetails.BOOK_NO,
                                        "docNo": docDetails.DOCT_NO,
                                        "regYear": docDetails.REG_YEAR,
                                        "srCode": docDetails.SR_CODE
                                    }
                                    await this.mutationServices.MutationForDocument(data);
                                } catch (error) {
                                    console.error("grantapproveServices - GetRejectListsrvc || Error :", error);
                                }
                                console.log("executed record :::: ", (count));
                                count++;
                            }
                            resolve({ "result": "Success" });
                        } catch (error) {
                            reject(error);
                        }
                    });
                    promisesArray.push(promiseObj);
                }
                //console.log("promisesArray :::: ", promisesArray);
                let result1 = Promise.all(promisesArray);
                let finalResponse;
                await result1.then((data) => {
                    finalResponse = data;
                }).catch(err => { throw err; });
            }
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
            };
            return responseData;
        }
        catch (ex) {
            console.error("grantapproveServices - GetRejectListsrvc || Error :", ex);
            let responseData = {
                status: false,
                message: "Failed with Error :::: " + (ex.message),
                code: "500",
            };
            return responseData;
        }

    }

    splitArray = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }


    getRuralDocuments = async (req, res) => {
        const qParams = req.query;
        const requiredFields = ['SR_CODE', 'DOCT_NO', 'BOOK_NO', 'REG_YEAR'];
        for (let field of requiredFields) {
            if (qParams[field] === undefined || qParams[field] === null || qParams[field] === '') {
                res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).json({
                    status: false,
                    message: `Validation Error: '${field}' is required`
                });
                return;
            }
        }
        try {
            let response = await this.automutationServices.getRuralDocumentsSrvc(qParams);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("autoMutationHandler - getRuralDocuments || Error :", ex);
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

module.exports = AutoMutationHandler;
