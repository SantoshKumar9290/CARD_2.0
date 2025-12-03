const orDao = require('../dao/oracledbDao')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { getDataFromCache, addDataToCache, deleteDataFromCache } = require("../plugins/nodeCache/myCache");
const { constructCARDError } = require("../handlers/errorHandler");
const Path = require('path');
const PDFPageCounter = require('pdf-page-counter');
const { Logger } = require('../../services/winston');
const { CODES } = require('../constants/appConstants');
const { encryptWithAESPassPhrase,getPrivateAttendanceStatus,AadhardecryptData } = require('../utils');
const MutationServices = require('../services/mutationServices');
const https = require('https');
const AutoMutationServices = require('./autoMutationService');

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

class ESignServices {
    constructor() {
        this.obDao = new orDao();
        this.mutationServices = new MutationServices();
        this.AutoMutationServices = new AutoMutationServices();
    }

    getEsign = async (reqBody) => {
        try {
            const originalBundledFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/bundledDocument.pdf`);
            const signedBundledFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/signedBundledDocument.pdf`);
            // const originalBundledFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/bundledDocument.pdf`);
            // const signedBundledFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/signedBundledDocument.pdf`);
            let filePath = null;
            if (fs.existsSync(`${signedBundledFilePath}`)) {
                filePath = signedBundledFilePath;
            } else if (fs.existsSync(`${originalBundledFilePath}`)) {
                filePath = originalBundledFilePath;
            } else {
                throw new Error("No File to eSign");
            }
            let coOrdinatesData = "";
            const contents = fs.readFileSync(filePath, { encoding: 'base64' });
            let count = 1;
            let pdfData;
            let executantPageEndCoordinates = [
                "480,10,50,100",
                "390,10,50,100",
                "300,10,50,100"
            ];
            let claimantPageEndCoordinates = [
                "210,10,50,100",
                "120,10,50,100",
                "30,10,50,100"
            ];
            let uid = "";
            let dinQualifier = "";
            let signerName = "";
            if (reqBody.code == "OF") {
                let eSignUserCoordinatesExistingQuery;
                let endorsementUserCoordinatesExistingResponse;
                if (!reqBody.isUsersExempted) {
                    eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and (ESIGN = 'N' or ESIGN = 'P')`;
                    endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                    if (endorsementUserCoordinatesExistingResponse.length > 0) {
                        throw new Error("Please complete eSign of Executants/Claimants/Witness");
                    }
                }
                eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and nvl(SR_ESIGN,'Z') != 'Y'`;
                endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                if (endorsementUserCoordinatesExistingResponse.length == 0) {
                    throw new Error("eSign Is Already done for the user");
                }

                if (reqBody.emplId) {
                    let employeeData = `SELECT * from EMPLOYEE_LOGIN_MASTER where EMPL_ID = ${reqBody.emplId}`;
                    let employeeDataResponse = await this.obDao.oDBQueryService(employeeData);
                    for(let i of employeeDataResponse)
                        try {
                        if( i.AADHAR_ENCRYPT)
                            i.AADHAR = i.AADHAR_ENCRYPT.length > 12 ? AadhardecryptData(i.AADHAR_ENCRYPT) : i.AADHAR;
                        } catch (ex) {
                        i.AADHAR = i.AADHAR;
                        }
                    if (employeeDataResponse.length == 0) {
                        throw new Error("No Employee Found");
                    }
                    uid = employeeDataResponse[0].AADHAR;
                } else if (reqBody.aadharNo) {
                    uid = reqBody.aadharNo;
                }

                const endorsementFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
                // const endorsementFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
                let dataBuffer1 = fs.readFileSync(endorsementFilePath);
                let officerSignCoOrdinates = [
                    "75,710,50,100",
                    [
                        "75,710,50,100",
                        "75,160,50,100"
                    ],
                    [
                        "75,720,50,100",
                        "75,285,50,100",
                        "75,165,50,100"
                    ]
                ]
                pdfData = await PDFPageCounter(dataBuffer1);
                count = 2;
                let exClPageCount = await this.getExClUsersPageCount(reqBody);
                console.log("EXCL PAGE COUNT", exClPageCount)
                for (let i = 0; i < exClPageCount; i++) {
                    coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};`;
                    count = count + 2;
                }
                coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[1][0]};${count}-${officerSignCoOrdinates[1][1]};`;
                count = count + 2;
                coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[2][0]};${count}-${officerSignCoOrdinates[2][1]};${count}-${officerSignCoOrdinates[2][2]};`;
                count = count + 2;
                for (let i = exClPageCount + 2; i < pdfData.numpages; i++) {
                    coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};`;
                    count = count + 2;
                }
            } else {
                let pendingStatusquery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and ESIGN = 'P'`;
                let pendingStatusResponse = await this.obDao.oDBQueryService(pendingStatusquery);
                if (pendingStatusResponse.length > 0 && !(pendingStatusResponse[0].CODE == reqBody.code && pendingStatusResponse[0].EC_NUMBER == reqBody.ec_number)) {
                    throw new Error("Please complete the Esign of " + pendingStatusResponse[0].A_NAME);
                }

                let eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number}`;
                let endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                  for(let i of endorsementUserCoordinatesExistingResponse)
                    try {               
                    if( i.AADHAR_ENCRPT)
                        i.AADHAR = i.AADHAR_ENCRPT.length > 12 ? AadhardecryptData(i.AADHAR_ENCRPT) : i.AADHAR;
                    } catch (ex) {
                        i.AADHAR = i.AADHAR;
                    }
                if (endorsementUserCoordinatesExistingResponse.length == 0) {
                    throw new Error("No Coordinates for this user to eSign");
                }
                if (endorsementUserCoordinatesExistingResponse[0].ESIGN == 'Y') {
                    throw new Error("eSign is already done");
                }
                if (endorsementUserCoordinatesExistingResponse[0].PAGE_NO == null || endorsementUserCoordinatesExistingResponse[0].COORDINATES == null) {
                    throw new Error("Coordinates are not present to eSign")
                }
                console.log(endorsementUserCoordinatesExistingResponse)
                coOrdinatesData = endorsementUserCoordinatesExistingResponse[0].PAGE_NO + "-" + endorsementUserCoordinatesExistingResponse[0].COORDINATES + ";"
                if (CODES.EXECUTANT_CODES.includes(reqBody.code) || CODES.CLAIMANT_CODES.includes(reqBody.code)) {
                    let dataBuffer2 = fs.readFileSync(filePath);
                    pdfData = await PDFPageCounter(dataBuffer2);
                    let coordinatesCount = reqBody.ec_number >= 3 ? 3 : reqBody.ec_number;
                    for (let i = 1; i < pdfData.numpages;) {
                        coOrdinatesData = coOrdinatesData + `${i}-${CODES.EXECUTANT_CODES.includes(reqBody.code) ? executantPageEndCoordinates[coordinatesCount - 1] : claimantPageEndCoordinates[coordinatesCount - 1]};`;
                        count = count + 2;
                        i = i + 2;
                    }
                }
                uid = endorsementUserCoordinatesExistingResponse[0].AADHAR;
                dinQualifier = endorsementUserCoordinatesExistingResponse[0].DN_QUALIFIER;
                signerName = endorsementUserCoordinatesExistingResponse[0].A_NAME;
            }
            if (signerName == null || signerName.length == 0)
                signerName = reqBody.name
            console.log("COORADIBATES DATA IS ", coOrdinatesData);
            if (signerName) {
                signerName = signerName.replace('\t', '').trim();
            }
            let eSignData = JSON.stringify({
                "rrn": Math.floor(Math.random() * 100000000000000000),
                "coordinates_location": "Top_Right",
                "coordinates": coOrdinatesData,
                "doctype": "PDF",
                "uid": uid,
                "dinQualifier": dinQualifier,
                "signername": signerName?.substring(0, 50),
                "signerlocation": reqBody.location,
                "filepassword": "",
                "signreason": "endorsementSign",
                "authmode": reqBody.authmode,
                "webhookurl": process.env.ESIGN_REDIRECTION_URL,
                "file": contents
            });

            let eSignReponse;

            if (reqBody.igrsEsign) {
                // eSignData.rrn = uuidv4();
                eSignData = JSON.parse(eSignData);
                eSignData.rrn = new Date().getTime();
                eSignData.callBackData = reqBody;
                // console.log(`ESIGN FOR ${reqBody.sroCode}-${reqBody.documentNo} and `, eSignData.rrn, " ", date.toISOString());
                eSignReponse = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");

                if (reqBody.code == "OF") {
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN_TXN_ID = ${eSignData.rrn.toString()} where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`);
                } else {
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set TXN_ID = ${eSignData.rrn}, ESIGN = 'P' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number}`);
                }

            } else {
                eSignReponse = await this.esignAxiosCall(JSON.stringify(eSignData));
                if (eSignReponse.txnid) {
                    // console.log(`ESIGN FOR ${reqBody.sroCode}-${reqBody.documentNo} and `, eSignReponse.txnid, " ", date.toISOString())
                    if (reqBody.code == "OF") {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN_TXN_ID = ${parseInt(eSignReponse.txnid)} where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`);
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set TXN_ID = ${parseInt(eSignReponse.txnid)}, ESIGN = 'P' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number}`);
                    }
                }
            }

            return eSignReponse;

        } catch (ex) {
            Logger.error("EndorseService - getEsign || Error :", ex.message);
            console.error("EndorseService - getEsign || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    getEndorsementEsign = async (reqBody) => {
        try {
            const originalEndorsementFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
            const signedEndorsementFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/signedEndorsementDocument.pdf`);
            const certificateOfRegistrationFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/certificateOfRegistration.pdf`);
            // const originalEndorsementFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
            // const signedEndorsementFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/signedEndorsementDocument.pdf`);
            // const certificateOfRegistrationFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/certificateOfRegistration.pdf`);
            let filePath = null;
            let esignTablename = "esign_urls"
            if (reqBody.isCertficateOfRegistrationEsign) {
                filePath = certificateOfRegistrationFilePath;
                esignTablename = "cor_esign_urls"
            } else if (fs.existsSync(`${signedEndorsementFilePath}`)) {
                filePath = signedEndorsementFilePath;
            } else if (fs.existsSync(`${originalEndorsementFilePath}`)) {
                filePath = originalEndorsementFilePath;
            } else {
                throw new Error("No File to eSign");
            }
            let coOrdinatesData = "";
            const contents = fs.readFileSync(filePath, { encoding: 'base64' });
            let count = 1;
            let pdfData;
            let uid = "";
            let executantPageEndCoordinates = [
                "480,10,50,100",
                "390,10,50,100",
                "300,10,50,100"
            ];
            let claimantPageEndCoordinates = [
                "210,10,50,100",
                "120,10,50,100",
                "30,10,50,100"
            ];
            //let pdeDocumentStatus = await this.pdeDocumentStatus(reqBody.applicationId);
            let pdeDocumentType = await this.getPdeDocumentType(reqBody.sroCode, reqBody.bookNo, reqBody.registedYear, reqBody.documentNo);
            let pdeDocumentStatus = await this.pdeDocumentStatus(reqBody.applicationId, pdeDocumentType);
		let dinQualifier = "";
            let signerName = "";
            if (reqBody.isCertficateOfRegistrationEsign) {
                const checkQuery = `select count(*) as count from srouser.tran_section_47a where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR and mis_receipt_no is not null`;
                const bindParams = {
                    SR_CODE: reqBody.sroCode,
                    DOCT_NO: reqBody.documentNo,
                    BOOK_NO: reqBody.bookNo,
                    REG_YEAR: reqBody.registedYear
                }
                const checkResult = await this.obDao.oDBQueryServiceWithBindParams(checkQuery, bindParams)
                const sec47aCoordinates = checkResult.length > 0 ? (checkResult[0].COUNT > 0 ? '1-75,460,50,100' : '1-75,600,50,100') : '1-75,600,50,100';
                // coOrdinatesData = "1-75,720,50,100;1-75,600,50,100"
                    coOrdinatesData = `1-75,700,50,100;${sec47aCoordinates}`
                if (reqBody.emplId) {
                    let employeeData = `SELECT * from EMPLOYEE_LOGIN_MASTER where EMPL_ID = ${reqBody.emplId}`;
                    let employeeDataResponse = await this.obDao.oDBQueryService(employeeData);
                    for(let i of employeeDataResponse)  
                        try {
                        if( i.AADHAR_ENCRYPT)
                            i.AADHAR = i.AADHAR_ENCRYPT.length > 12 ? AadhardecryptData(i.AADHAR_ENCRYPT) : i.AADHAR;
                        } catch (ex) {
                        i.AADHAR = i.AADHAR;
                        }
                    if (employeeDataResponse.length == 0) {
                        throw new Error("No Employee Found");
                    }
                    uid = employeeDataResponse[0].AADHAR;
                }
            }
            else if (reqBody.code == "OF") {
                let documentDetailsQuery = `SELECT * from pde_doc_status_cr where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`;
                let documentDetailsResponse = await this.obDao.oDBQueryService(documentDetailsQuery);
                let isPendingDocument = false;
                if (documentDetailsResponse == null || documentDetailsResponse.length == 0) {
                    throw Error('Document Not Found')
                }

                if (documentDetailsResponse[0].DOC_PEND != null && documentDetailsResponse[0].DOC_PEND == "Y") {
                    isPendingDocument = true;
                }

                let eSignUserCoordinatesExistingQuery;
                let endorsementUserCoordinatesExistingResponse;
                if (!reqBody.isUsersExempted) {
                    eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and (ESIGN = 'N' or ESIGN = 'P')`;
                    endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                    if (endorsementUserCoordinatesExistingResponse.length > 0) {
                        throw new Error("Please complete eSign of Executants/Claimants/Witness");
                    }
                }

                eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and nvl(SR_ESIGN,'Z') != 'Y'`;
                endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                if (endorsementUserCoordinatesExistingResponse.length == 0) {
                    throw new Error("eSign Is Already done for the user");
                }

                if (reqBody.emplId) {
                    let employeeData = `SELECT * from EMPLOYEE_LOGIN_MASTER where EMPL_ID = ${reqBody.emplId}`;
                    let employeeDataResponse = await this.obDao.oDBQueryService(employeeData);
                    for(let i of employeeDataResponse)
                        try {
                        if( i.AADHAR_ENCRYPT)
                            i.AADHAR = i.AADHAR_ENCRYPT.length > 12 ? AadhardecryptData(i.AADHAR_ENCRYPT) : i.AADHAR;
                        } catch (ex) {
                        i.AADHAR = i.AADHAR;
                        }
                    if (employeeDataResponse.length == 0) {
                        throw new Error("No Employee Found");
                    }
                    uid = employeeDataResponse[0].AADHAR;
                } else if (reqBody.aadharNo) {
                    uid = reqBody.aadharNo;
                }

                const endorsementFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
                // const endorsementFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
                let dataBuffer1 = fs.readFileSync(endorsementFilePath);
                // let officerSignCoOrdinates = [
                //     "75,710,50,100",
                //     [
                //         "75,710,50,100",
                //         "75,160,50,100"
                //     ],
                //     [
                //         "75,720,50,100",
                //         "75,285,50,100",
                //         "75,165,50,100"
                //     ]
                // ]
                let officerSignCoOrdinates = [
                    "75,720,50,100",
                    [
                        "75,720,50,100",
                        "75,160,50,100"
                    ],
                    [
                        "75,720,50,100",
                        "75,285,50,100",
                        "75,160,50,100"
                    ]
                ]
                pdfData = await PDFPageCounter(dataBuffer1);
                let pageCountIncreaseValue = pdeDocumentStatus == "Executed" || pdeDocumentType == "Physical" ? 1 : 2;
                count = pageCountIncreaseValue;
                // for(let i=0; i<pdfData.numpages - 2; i++){
                //     coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};`;
                //     count = count+1;
                // }
                // coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[1][0]};${count}-${officerSignCoOrdinates[1][1]};`;
                // count = count+1;
                // coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[2][0]};${count}-${officerSignCoOrdinates[2][1]};${count}-${officerSignCoOrdinates[2][2]};`;
                let exClPageCount = await this.getExClUsersPageCount(reqBody);
                console.log("EXCL PAGE COUNT", exClPageCount)
                for (let i = 0; i < exClPageCount; i++) {
                    coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};`;
                    count = count + pageCountIncreaseValue;
                }
                coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[1][0]};${count}-${officerSignCoOrdinates[1][1]};`;
                count = count + pageCountIncreaseValue;
                let ociDetailsQuery = `SELECT PARTY_CODE FROM srouser.tran_oci WHERE sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
                let ociDetailsQueryRespons = await this.obDao.oDBQueryService(ociDetailsQuery);
                let ekycOciDeatilsQuery = `Select b.photo from SROUSER.tran_ec_parties_cr a, PHOTOFP.tran_ec_photos b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number`
                let ekycOciDeatilsQueryRespons = await this.obDao.oDBQueryService(ekycOciDeatilsQuery);
                if(ekycOciDeatilsQueryRespons && ekycOciDeatilsQueryRespons?.length > 0 && ekycOciDeatilsQueryRespons.every(item => item.PHOTO == null)){
                    coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};`
                    count = count + Math.ceil(ociDetailsQueryRespons.length/3)
                }else if(ociDetailsQueryRespons.length > 0){
                    coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};${count+1}-${officerSignCoOrdinates[0]};`
                    count = count + 2 * Math.ceil(ociDetailsQueryRespons.length/3)
                }
                coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[2][0]};${count}-${officerSignCoOrdinates[2][1]};${count}-${officerSignCoOrdinates[2][2]};`;
                count = count + pageCountIncreaseValue;

                if (pdfData.numpages >= count) {
                    if (isPendingDocument) {
                        coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};`;
                        count = count + pageCountIncreaseValue;
                    } else {
                        coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};${count}-75,550,50,100;`;
                        count = count + pageCountIncreaseValue;
                    }
                }
                while (pdfData.numpages >= count) {
                    coOrdinatesData = coOrdinatesData + `${count}-${officerSignCoOrdinates[0]};`;
                    count = count + pageCountIncreaseValue;
                }

            } else {
                let pendingStatusquery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and ESIGN = 'P'`;
                let pendingStatusResponse = await this.obDao.oDBQueryService(pendingStatusquery);
                if (pendingStatusResponse.length > 0 && !(pendingStatusResponse[0].CODE == reqBody.code && pendingStatusResponse[0].EC_NUMBER == reqBody.ec_number)) {
                    throw new Error("Please complete the Esign of " + pendingStatusResponse[0].A_NAME);
                }
                let eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number}`;
                let endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                for(let i of endorsementUserCoordinatesExistingResponse)
                    try {               
                    if( i.AADHAR_ENCRPT)
                        i.AADHAR = i.AADHAR_ENCRPT.length > 12 ? AadhardecryptData(i.AADHAR_ENCRPT) : i.AADHAR;
                    } catch (ex) {
                        i.AADHAR = i.AADHAR;
                    }

                if (endorsementUserCoordinatesExistingResponse.length == 0) {
                    throw new Error("No Coordinates for this user to eSign");
                }
                if (endorsementUserCoordinatesExistingResponse[0].ESIGN == 'Y') {
                    throw new Error("eSign is already done");
                }
                if (endorsementUserCoordinatesExistingResponse[0].PAGE_NO == null || endorsementUserCoordinatesExistingResponse[0].COORDINATES == null) {
                    throw new Error("Coordinates are not present to eSign")
                }

                if (pdeDocumentStatus == "Executed" || pdeDocumentType == "Physical") {
                    endorsementUserCoordinatesExistingResponse[0].PAGE_NO = endorsementUserCoordinatesExistingResponse[0].PAGE_NO / 2;
                    console.log(endorsementUserCoordinatesExistingResponse)
                    coOrdinatesData = endorsementUserCoordinatesExistingResponse[0].PAGE_NO + "-" + endorsementUserCoordinatesExistingResponse[0].COORDINATES + ";"
                } else {
                    coOrdinatesData = endorsementUserCoordinatesExistingResponse[0].PAGE_NO + "-" + endorsementUserCoordinatesExistingResponse[0].COORDINATES + ";"
                    if (CODES.EXECUTANT_CODES.includes(reqBody.code) || CODES.CLAIMANT_CODES.includes(reqBody.code)) {
                        let dataBuffer2 = fs.readFileSync(filePath);
                        pdfData = await PDFPageCounter(dataBuffer2);
                        let coordinatesCount = reqBody.ec_number >= 3 ? 3 : reqBody.ec_number;
                        for (let i = 1; i < pdfData.numpages;) {
                            coOrdinatesData = coOrdinatesData + `${i}-${CODES.EXECUTANT_CODES.includes(reqBody.code) ? executantPageEndCoordinates[coordinatesCount - 1] : claimantPageEndCoordinates[coordinatesCount - 1]};`;
                            count = count + 2;
                            i = i + 2;
                        }
                    }
                }
                uid = endorsementUserCoordinatesExistingResponse[0].AADHAR;
                dinQualifier = endorsementUserCoordinatesExistingResponse[0].DN_QUALIFIER;
                signerName = endorsementUserCoordinatesExistingResponse[0].A_NAME;
            }

            if (signerName == null || signerName.length == 0)
                signerName = reqBody.name

            const coOrdinatesDataDup = coOrdinatesData.split(";").filter(entry => entry);
            const uniquecoOrdinatesData = [];
            for (let i = 0; i < coOrdinatesDataDup.length; i++) {
                if (uniquecoOrdinatesData.indexOf(coOrdinatesDataDup[i]) === -1) {
                    uniquecoOrdinatesData.push(coOrdinatesDataDup[i]);
                }
            }

            coOrdinatesData = uniquecoOrdinatesData.join(";") + ";";

            console.log("COORADIBATES DATA IS ", coOrdinatesData);
            if (signerName) {
                signerName = signerName.replace('\t', '').trim();
            }
            let eSignData = {
                "rrn": Math.floor(Math.random() * 100000000000000000),
                "coordinates_location": "Top_Right",
                "coordinates": coOrdinatesData,
                "doctype": "PDF",
                "uid": uid,
                "dinQualifier": dinQualifier,
                "signername": signerName?.substring(0, 50),
                "signerlocation": reqBody.location,
                "filepassword": "",
                "signreason": "endorsementSign",
                "authmode": reqBody.authmode,
                "webhookurl": process.env.ESIGN_REDIRECTION_URL,
                "file": contents
            };

            let eSignReponse;
            let date = new Date();

            if (reqBody.igrsEsign) {
                eSignData.rrn = Math.floor(Math.random() * 100000000000000000);
                // eSignData.rrn = new Date().getTime();
                eSignData.callBackData = reqBody;
                console.log(`ESIGN FOR ${reqBody.sroCode}-${reqBody.documentNo} and `, eSignData.rrn, " ", date.toISOString());
                let esignUrlData = await this.obDao.oDBQueryService(`Select * from SROUSER.${esignTablename}`);
                if (esignUrlData == null || esignUrlData.length == 0) {
                    throw Error('Esign Urls Not Found');
                }


                let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
                let esignUrl = parseInt(reqBody.documentNo) % 2 == 0 ? esignUrlData[0].NSDL_URL  : esignUrlData[0].EMUDHRA;
                eSignReponse = await this.igrsEsignAxiosCall(esignUrl, esignRequestData);


                if(eSignReponse.status == "Success"){
                    if (reqBody.isCertficateOfRegistrationEsign) {
                        console.log("CERTIFICATE OF REGISTRATION ESIGN");
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_COR_ESIGN_TXN_ID = ${eSignData.rrn.toString()} where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`);
                    } else if (reqBody.code == "OF") {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN_TXN_ID = ${eSignData.rrn.toString()} where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`);
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set TXN_ID = ${eSignData.rrn}, ESIGN = 'P' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number}`);
                    }
                    eSignReponse.txnid = eSignData.rrn;
                } else {
                    console.log("ERROR IN ESIGN IS ", eSignReponse);
                    throw new Error(eSignReponse.message);
                }
            } else {
                eSignReponse = await this.esignAxiosCall(JSON.stringify(eSignData));
                if (eSignReponse.txnid) {
                    console.log(`ESIGN FOR ${reqBody.sroCode}-${reqBody.documentNo} and `, eSignReponse.txnid, " ", date.toISOString())
                    if (reqBody.code == "OF") {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN_TXN_ID = ${parseInt(eSignReponse.txnid)} where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`);
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set TXN_ID = ${parseInt(eSignReponse.txnid)}, ESIGN = 'P' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number}`);
                    }
                }
            }


            return eSignReponse;

        } catch (ex) {
            Logger.error("EndorseService - getEsign || Error :", ex.message);
            console.error("EndorseService - getEsign || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

   getRefusalCorEsign = async (reqBody) => {
        try {
            const originalEndorsementFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/refusalCor.pdf`);
            const signedEndorsementFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/signedRefusalCor.pdf`);
            let filePath = "";
            if (fs.existsSync(`${signedEndorsementFilePath}`)) {
                filePath = signedEndorsementFilePath;
            } else if (fs.existsSync(`${originalEndorsementFilePath}`)) {
                filePath = originalEndorsementFilePath;
            } else {
                throw new Error("No File to eSign");
            }
            let coOrdinatesData = "";
            const contents = fs.readFileSync(filePath, { encoding: 'base64' });
            let count = 1;
            let pdfData;
            let uid = "";
            let executantPageEndCoordinates = [
                "480,10,50,100",
                "390,10,50,100",
                "300,10,50,100"
            ];
            let claimantPageEndCoordinates = [
                "210,10,50,100",
                "120,10,50,100",
                "30,10,50,100"
            ];

            let dinQualifier = "";
            let signerName = "";
            if (reqBody.code == "OF") {


                let eSignUserCoordinatesExistingQuery;
                let endorsementUserCoordinatesExistingResponse;
                if (!reqBody.isUsersExempted) {
                    eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign_refusal where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and (ESIGN = 'N' or ESIGN = 'P')`;
                    endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                    if (endorsementUserCoordinatesExistingResponse.length > 0) {
                        throw new Error("Please complete eSign of Executants/Claimants/Witness");
                    }
                }

                eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign_refusal where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and nvl(SR_ESIGN,'Z') != 'Y'`;
                endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                if (endorsementUserCoordinatesExistingResponse.length == 0) {
                    throw new Error("eSign Is Already done for the user");
                }

                if (reqBody.emplId) {
                    let employeeData = `SELECT * from EMPLOYEE_LOGIN_MASTER where EMPL_ID = ${reqBody.emplId}`;
                    let employeeDataResponse = await this.obDao.oDBQueryService(employeeData);
                    for(let i of employeeDataResponse)
                        try {
                        if( i.AADHAR_ENCRYPT)
                            i.AADHAR = i.AADHAR_ENCRYPT.length > 12 ? AadhardecryptData(i.AADHAR_ENCRYPT) : i.AADHAR;
                        } catch (ex) {
                        i.AADHAR = i.AADHAR;
                        }
                    if (employeeDataResponse.length == 0) {
                        throw new Error("No Employee Found");
                    }
                    uid = employeeDataResponse[0].AADHAR;
                } else if (reqBody.aadharNo) {
                    uid = reqBody.aadharNo;
                }


                let officerSignCoOrdinates = [
                    "75,720,50,100",
                    [
                        "75,720,50,100",
                        "75,150,50,100"
                    ]
                ]


                coOrdinatesData = coOrdinatesData + `${1}-${officerSignCoOrdinates[0]};`;
                coOrdinatesData = coOrdinatesData + `${2}-${officerSignCoOrdinates[1][0]};${2}-${officerSignCoOrdinates[1][1]};`;

            } else {
                let pendingStatusquery = `SELECT * from SROUSER.tran_ec_aadhar_esign_refusal where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and ESIGN = 'P'`;
                let pendingStatusResponse = await this.obDao.oDBQueryService(pendingStatusquery);
                if (pendingStatusResponse.length > 0 && !(pendingStatusResponse[0].CODE == reqBody.code && pendingStatusResponse[0].EC_NUMBER == reqBody.ec_number)) {
                    throw new Error("Please complete the Esign of " + pendingStatusResponse[0].A_NAME);
                }
                let eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign_refusal where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number}`;
                let endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
                for(let i of endorsementUserCoordinatesExistingResponse)
                    try {
                    if( i.AADHAR_ENCRPT)
                        i.AADHAR = i.AADHAR_ENCRPT.length > 12 ? AadhardecryptData(i.AADHAR_ENCRPT) : i.AADHAR;
                    } catch (ex) {
                        i.AADHAR = i.AADHAR;
                    }
                if (endorsementUserCoordinatesExistingResponse.length == 0) {
                    throw new Error("No Coordinates for this user to eSign");
                }
                if (endorsementUserCoordinatesExistingResponse[0].ESIGN == 'Y') {
                    throw new Error("eSign is already done");
                }
                if (endorsementUserCoordinatesExistingResponse[0].PAGE_NO == null || endorsementUserCoordinatesExistingResponse[0].COORDINATES == null) {
                    throw new Error("Coordinates are not present to eSign")
                }

                endorsementUserCoordinatesExistingResponse[0].PAGE_NO = endorsementUserCoordinatesExistingResponse[0].PAGE_NO/2;

                coOrdinatesData = endorsementUserCoordinatesExistingResponse[0].PAGE_NO + "-" + endorsementUserCoordinatesExistingResponse[0].COORDINATES + ";"
                uid = endorsementUserCoordinatesExistingResponse[0].AADHAR;
                dinQualifier = endorsementUserCoordinatesExistingResponse[0].DN_QUALIFIER;
                signerName = endorsementUserCoordinatesExistingResponse[0].A_NAME;
            }

            if (signerName == null || signerName.length == 0)
                signerName = reqBody.name

            console.log("COORADIBATES DATA IS ", coOrdinatesData);
            if (signerName) {
                signerName = signerName.replace('\t', '').trim();
            }
            let eSignData = {
                "rrn": uuidv4(),
                "coordinates_location": "Top_Right",
                "coordinates": coOrdinatesData,
                "doctype": "PDF",
                "uid": uid,
                "dinQualifier": dinQualifier,
                "signername": signerName?.substring(0, 50),
                "signerlocation": reqBody.location,
                "filepassword": "",
                "signreason": "endorsementSign",
                "authmode": reqBody.authmode,
                "webhookurl": process.env.REFUSALCOR_CARD_UI_ESIGN,
                // "webhookurl": process.env.REFUSALCOR_ESIGN_REDIRECTION_URL,

                "file": contents
            };

            let date = new Date();


            eSignData.rrn = Math.floor(Math.random() * 100000000000000000);
            // eSignData.rrn = new Date().getTime();
            eSignData.callBackData = reqBody;
            console.log(`ESIGN FOR ${reqBody.sroCode}-${reqBody.documentNo} and `, eSignData.rrn, " ", date.toISOString());
            let esignUrlData = await this.obDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
            if (esignUrlData == null || esignUrlData.length == 0) {
                throw Error('Esign Urls Not Found');
            }

            let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
            let esignUrl = parseInt(reqBody.documentNo) % 2 == 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
            let eSignReponse = await this.igrsEsignAxiosCall(esignUrl, esignRequestData);


            if (eSignReponse.status == "Success") {
                if (reqBody.code == "OF") {
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign_refusal set SR_ESIGN_TXN_ID = ${eSignData.rrn.toString()} where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`);
                } else {
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign_refusal set TXN_ID = ${eSignData.rrn}, ESIGN = 'P' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number}`);
                }
                eSignReponse.txnid = eSignData.rrn;
            } else {
                console.log("ERROR IN ESIGN IS ", eSignReponse);
                throw new Error(eSignReponse.message);
            }



            return eSignReponse;

        } catch (ex) {
            Logger.error("EndorseService - getEsign || Error :", ex.message);
            console.error("EndorseService - getEsign || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }


    getEsignStatus = async (reqBody) => {
        try {
            let aadharESignData
            if (reqBody.code == "OF") {
                aadharESignData = await this.obDao.oDBQueryService(`SELECT * from SROUSER.tran_ec_aadhar_esign  where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
            } else {
                aadharESignData = await this.obDao.oDBQueryService(`SELECT * from SROUSER.tran_ec_aadhar_esign  where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
            }
            if (aadharESignData.length == 0) {
                throw Error('Data Mismatch');
            }
            let data = JSON.stringify({
                "rrn": reqBody.rrn,
                "txnid": reqBody.txnid
            });
            // let statusResponse = await this.esignStatusAxiosCall(data);
            let date = new Date();


            let statusResponse;
            if (reqBody.igrsEsign) {
                let esignUrlData = await this.obDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
                let esignUrl = parseInt(reqBody.documentNo) % 2 == 0 ? esignUrlData[0].NSDL_URL  : esignUrlData[0].EMUDHRA
                statusResponse = await this.igrsEsignStatusAxiosCall(esignUrl, reqBody.txnid);
                if (statusResponse != null && statusResponse.status == "Success") {
                    console.log("INSIDE");

                    let documentsFolderPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
                    // let documentsFolderPath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
                    await fs.writeFileSync(`${documentsFolderPath}signedBundledDocument.pdf`, statusResponse.data, { encoding: 'base64' });
                    if (reqBody.code == "OF") {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                    }
                } else if (statusResponse != null && statusResponse.status == "Failure") {
                    if (reqBody.code == "OF") {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN = 'N' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set ESIGN = 'N' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                    }
                    throw new Error(statusResponse.message)
                }
            } else {
                let data = JSON.stringify({
                    "rrn": reqBody.rrn,
                    "txnid": reqBody.txnid
                });
                statusResponse = await this.esignStatusAxiosCall(data);
                if (statusResponse != null && statusResponse.status == "completed") {
                    console.log("INSIDE");
                    let documentsFolderPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
                    // let documentsFolderPath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
                    await fs.writeFileSync(`${documentsFolderPath}signedBundledDocument.pdf`, statusResponse.signedfile, { encoding: 'base64' });
                    if (reqBody.code == "OF") {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                    }
                }
            }


            return statusResponse;

        } catch (ex) {
            Logger.error("EndorseService - getEsign || Error :", ex.message);
            console.error("EndorseService - getEsign || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    getEndorsementEsignStatus = async (reqBody) => {
        try {
            let aadharESignData
            let esignTablename = "esign_urls"
            if (!reqBody.isCertficateOfRegistrationEsign) {
                if (reqBody.code == "OF") {
                    aadharESignData = await this.obDao.oDBQueryService(`SELECT * from SROUSER.tran_ec_aadhar_esign  where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                } else {
                    aadharESignData = await this.obDao.oDBQueryService(`SELECT * from SROUSER.tran_ec_aadhar_esign  where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                }
                if (aadharESignData.length == 0) {
                    throw Error('Data Mismatch');
                }
            } else {
                esignTablename = "cor_esign_urls"
            }

            let statusResponse;
            if (reqBody.igrsEsign) {
		    let esignUrlData = await this.obDao.oDBQueryService(`Select * from SROUSER.${esignTablename}`);
                let esignUrl = parseInt(reqBody.documentNo) % 2 == 0 ? esignUrlData[0].NSDL_URL  : esignUrlData[0].EMUDHRA
                statusResponse = await this.igrsEsignStatusAxiosCall(esignUrl, reqBody.txnid);
                if (statusResponse != null && statusResponse.status == "Success") {
                    console.log("INSIDE");
                    let documentsFolderPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
                    // let documentsFolderPath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);

                    if (reqBody.isCertficateOfRegistrationEsign) {
                        await fs.writeFileSync(`${documentsFolderPath}signedCertificateOfRegistration.pdf`, statusResponse.data, { encoding: 'base64' });
                    }
                    else {
                        await fs.writeFileSync(`${documentsFolderPath}signedEndorsementDocument.pdf`, statusResponse.data, { encoding: 'base64' });
                    }
                    let updateResult = 0;
                    if (reqBody.isCertficateOfRegistrationEsign) {
                        updateResult = await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set COR_ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_cor_esign_txn_id = ${reqBody.txnid}`);
                    } else if (reqBody.code == "OF") {
                        updateResult = await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set ESIGN = 'Y', ESIGN_TIME_STAMP = SYSDATE where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                    }
                    //Subdivision and mutation condition added After completed the SR and COR esign for Physial document
                    let docData = {srCode : reqBody.sroCode, bookNo : reqBody.bookNo, docNo : reqBody.documentNo, regYear : reqBody.registedYear}
                    const statusData = await this.obDao.oDBQueryServiceWithBindParams(`SELECT * FROM pde_doc_status_cr a, tran_major b where a.sr_code = :srCode AND a.book_no = :bookNo AND a.doct_no = :docNo AND a.reg_year = :regYear AND a.doc_assign = 'Y' AND a.doc_mutation = 'N'
                            and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.book_no = b.book_no and a.reg_year = b.reg_year`, docData)
                    if (updateResult > 0 && Array.isArray(statusData) && statusData?.length > 0) {
                        if(await this.AutoMutationServices.isMutationNeeded({docDetails : statusData})) {
                            await this.mutationServices.doSubDivisionAndMutation(docData,statusData[0]?.DOC_SUBDIV);
                        }
                        else {
                            await this.obDao.oDbInsertDocsWithBindParams(`UPDATE SROUSER.pde_doc_status_cr set doc_mutation = 'Y', doc_subdiv = 'Y' where sr_code = :srCode and book_no = :bookNo and doct_no = :docNo and reg_year = :regYear`, docData);
                        }
                    }
                    //ending
                } else if (statusResponse != null && statusResponse.status == "Failure") {
                    if (reqBody.code == "OF") {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN = 'N' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set ESIGN = 'N' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                    }
                    throw new Error(statusResponse.message)
                }
            } else {
                let data = JSON.stringify({
                    "rrn": reqBody.rrn,
                    "txnid": reqBody.txnid
                });
                statusResponse = await this.esignStatusAxiosCall(data);
                if (statusResponse != null && statusResponse.status == "completed") {
                    console.log("INSIDE");
                    // let documentsFolderPath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
                    await fs.writeFileSync(`${documentsFolderPath}signedEndorsementDocument.pdf`, statusResponse.signedfile, { encoding: 'base64' });
                    if (reqBody.code == "OF") {
                        const updateResult = await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set SR_ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                        //Subdivision and mutation condition added After completed the SR esign in Bundling process
                        let docData = {srCode : reqBody.sroCode, bookNo : reqBody.bookNo, docNo : reqBody.documentNo, regYear : reqBody.registedYear}
                        const statusData = await this.obDao.oDBQueryServiceWithBindParams(`SELECT * FROM pde_doc_status_cr a, tran_major b where a.sr_code = :srCode AND a.book_no = :bookNo AND a.doct_no = :docNo AND a.reg_year = :regYear AND a.doc_assign = 'Y' AND a.doc_mutation = 'N'
                            and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.book_no = b.book_no and a.reg_year = b.reg_year`, docData)
                        if (updateResult > 0 && Array.isArray(statusData) && statusData?.length > 0) {
                            if(await this.AutoMutationServices.isMutationNeeded({docDetails : statusData})) {
                                 await this.mutationServices.doSubDivisionAndMutation(docData,statusData[0]?.DOC_SUBDIV);
                            }
                            else {
                                await this.obDao.oDbInsertDocsWithBindParams(`UPDATE SROUSER.pde_doc_status_cr set doc_mutation = 'Y', doc_subdiv = 'Y' where sr_code = :srCode and book_no = :bookNo and doct_no = :docNo and reg_year = :regYear`, docData);
                            }
                        }
                         //ending
                    } else {
                        await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set ESIGN = 'Y', ESIGN_TIME_STAMP = SYSDATE where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                    }
                }
            }

            return statusResponse;

        } catch (ex) {
            Logger.error("EndorseService - getEndorsementEsignStatus || Error :", ex.message);
            console.error("EndorseService - getEndorsementEsignStatus || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    async getPdeDocumentType(sroCode, bookNo, regYear, doctNo) {
        try {
            let query = `Select * from SROUSER.pde_doc_status_cr where SR_CODE=${sroCode} AND BOOK_NO=${bookNo} AND DOCT_NO=${doctNo} AND REG_YEAR=${regYear}`;
            let response = await this.obDao.oDBQueryService(query);
            if (response.length == 0) {
                throw new Error("Data not found")
            }
            if (response[0].DOC_TYPE == "P")
                return "Physical";
            return "Online";
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async pdeDocumentStatus(applicationId, pdeDocumentType) {
        try {
	    if(pdeDocumentType == "Physical"){
                return "NotExecuted";
            }
            // NEED TO IMPLETED STTAUS API
            const headers = {
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJ1c2VySWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJsb2dpbkVtYWlsIjoiIiwibG9naW5OYW1lIjoiU1VESEFLQVIiLCJsb2dpbk1vYmlsZSI6IjkxNjAwNjE4MDAiLCJsb2dpblR5cGUiOiJVU0VSIiwiYWFkaGFyIjowLCJpYXQiOjE2ODQ4NDQ5MjUsImV4cCI6MTY4NDg0NjcyNX0.ZOe8d6YV32aF-Dr6n9DJesWVhU4tEf2tRHUUHVnHkQcnZ1kbhJLrwah7xe79GWSdQDUb7B0N3ZHKSW43U8QdbCLCYnA7ntqWkIxjdu6TbK8z8tDL_naTSFs5CRBXovlYAqNzxhHNXAhk-5xkgdwa0h8XnNZD-R3wfzYYgfSuyz28XMaUbywdxvvuo-CMTqcYeelFE7CVxA97yca9jikIGCn-w6yz4_r194TJcwuJ45SJrI9UoKVWJGl41NV5UI_--DzHyz4caZUcOTGzhD5uRQm-y1ZVtYo_ncR8UkPR4N9GuOzT8meYg2jr8g53cbi4X9gveZwNmYdSuGTrpqdn9cjt4FtFi1kMrENxqVnSGWlaUI2FJi9EDOXD7Pg2yTmStYLhXwKTr5GNct3ZbS74oHfpkX_Fz0IdLNx0_EXyAHvKSoucy8n6A7kabQVD5f5xhmOa8Z5ejNEjl7jBj67FN7i0xavXy4gTy28MeLU-u0Hgo8RisQ66CnbB8GAymwpkU3CYe6p5l6cYvdXPvr90ovz1e6Zsj92r2n8ycihU67UVLZSmaBXUQAhXHrJg5gGlw3_x6IzPr-mre_Cj8oVgU5i9NMKFmn_hBVzA82hcsKC2PYuEL6yAIpATlFVEISrwOypNcB2oiENbZXi64_GLt-ROfK1NWgaERFARo_61kH0',
                'Content-Type': 'application/json'
            };
            let flagsData = await instance({ method: "GET", url: `${process.env.PDE_HOST}/pdeapi/v1/documents/flags/${applicationId}`, headers: headers });
            flagsData = flagsData.data.data;
            if (flagsData.esignExecuted != null && flagsData.esignExecuted == true)
                return "Executed";
            else
                return "NotExecuted";
            // return "Pending";
        } catch (ex) {
            Logger.error("EndorseService - createBundlingDocument || Error :", ex);
            console.error("EndorseService - createBundlingDocument || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    igrsEsignAxiosCall = async (eSignUrl, eSignData) => {
        try {

            let data = JSON.stringify({
                "esignRequest": eSignData
            });

            let eSignConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${eSignUrl}/storeAndProcessEsignRequest`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };
            let fileResponse = await instance.request(eSignConfig);
            if (fileResponse == null || fileResponse.data == null) {
                throw Error('IGRS Esign api error');
            }

            return fileResponse.data;

        } catch (ex) {
            console.error("ESignServices - igrsEsignAxiosCall || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    esignAxiosCall = async (eSignData) => {
        try {
            let eSignToken = getDataFromCache("E_SIGN_TOKEN");
            console.log(eSignToken);
            if (eSignToken == null) {
                eSignToken = await this.esignLoginAxoisCall();
            }
            let eSignConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.SYNTIZEN_URL}/InitiateRequest`,
                headers: {
                    'apikey': '0',
                    'authkey': eSignToken,
                    'Content-Type': 'application/json'
                },
                data: eSignData
            };
            let fileResponse = await axios.request(eSignConfig);
            if (fileResponse == null || fileResponse.data == null) {
                throw Error('Syntizen api error');
            }
            if (fileResponse.data.respcode == "403") {
                deleteDataFromCache("E_SIGN_TOKEN");
                return await this.esignAxiosCall(eSignData);
            }

            return fileResponse.data;

        } catch (ex) {
            console.error("ESignServices - esignAxiosCall || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    esignLoginAxoisCall = async () => {
        try {
            let data = JSON.stringify({
                "username": process.env.SYNTIZEN_USERNAME,
                "password": process.env.SYNTIZEN_PASSWORD
            });

            let config = {
                method: 'post',
                url: `${process.env.SYNTIZEN_URL}/userauthentication`,
                headers: {
                    'apikey': '0',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            console.log(config)
            let response = await axios.request(config);
            if (response != null && response.data != null && response.data.respcode == "200") {
                await addDataToCache("E_SIGN_TOKEN", response.data.authkey);
                console.log("DATA IS ", getDataFromCache("E_SIGN_TOKEN"))
                return response.data.authkey;
            } else {
                throw Error(response);
            }
        } catch (ex) {
            console.error("ESignServices - esignLoginAxoisCall || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    igrsEsignStatusAxiosCall = async (esignUrl, rrn) => {
        console.log(rrn);
        rrn = encryptWithAESPassPhrase(`${rrn}`, "igrsSecretPhrase");
        console.log(rrn);
        rrn = encodeURIComponent(`${rrn}`);
        console.log(rrn);

        try {
            let eSignConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${esignUrl}/downloadSignedDocTransID?transactionId=${rrn}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                // httpsAgent
            };
            let fileResponse = await instance.request(eSignConfig);
            if (fileResponse == null || fileResponse.data == null) {
                throw Error('IGRS Esign api error');
            }

            return fileResponse.data;

        } catch (ex) {
            console.error("ESignServices - igrsEsignStatusAxiosCall || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    esignStatusAxiosCall = async (eSignData) => {
        try {
            let eSignToken = getDataFromCache("E_SIGN_TOKEN");
            console.log(eSignToken);
            if (eSignToken == null) {
                eSignToken = await this.esignLoginAxoisCall();
            }
            let eSignConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.SYNTIZEN_URL}/FetchTransactionStatus`,
                headers: {
                    'apikey': '0',
                    'authkey': eSignToken,
                    'Content-Type': 'application/json'
                },
                data: eSignData
            };
            let fileResponse = await axios.request(eSignConfig);
            if (fileResponse == null || fileResponse.data == null) {
                throw Error('Syntizen api error');
            }
            if (fileResponse.data.respcode == "403") {
                deleteDataFromCache("E_SIGN_TOKEN");
                return await this.esignStatusAxiosCall(eSignData);
            }

            return fileResponse.data;

        } catch (ex) {
            console.error("ESignServices - esignAxiosCall || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    getExClUsersPageCount = async (reqBody) => {
        try {
            // let tranEcQuery = `Select a.*, b.photo from SROUSER.tran_ec a, SROUSER.tran_ec_aadhar_esign b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} `+
            // `and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year `+
            // `and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number order by a.code DESC, a.ec_number ASC`;
            // let tranEcOracleDbResponse = await this.obDao.oDBQueryService(tranEcQuery);
            // if(tranEcOracleDbResponse == null || tranEcOracleDbResponse.length <= 2)
            //     return 1;
            // tranEcOracleDbResponse = tranEcOracleDbResponse - 2;
            // return 1+ tranEcOracleDbResponse/3 + tranEcOracleDbResponse%3;
            let eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`;
            let endorsementUserCoordinatesExistingResponse = await this.obDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
            if (endorsementUserCoordinatesExistingResponse == null || endorsementUserCoordinatesExistingResponse.length == 0)
                return 1;
            let pageNumber = 10000;
            endorsementUserCoordinatesExistingResponse.forEach(element => {
                if (element.CODE == "WT" && element.PAGE_NO < pageNumber)
                    pageNumber = element.PAGE_NO;
            });
            console.log("PAGE NUMBER IS ", pageNumber);
            if (pageNumber == 10000)
                return 1;
            return pageNumber / 2 - 1;
        } catch (error) {
            console.log("ERROR IN getExClUsersPageCount IS ", error);
            return 1;
        }
    }


    getRefusalCorEsignStatus = async (reqBody) => {
        try {
            let aadharESignData

            if (reqBody.code == "OF") {
                aadharESignData = await this.obDao.oDBQueryService(`SELECT * from SROUSER.tran_ec_aadhar_esign_refusal  where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
            } else {
                aadharESignData = await this.obDao.oDBQueryService(`SELECT * from SROUSER.tran_ec_aadhar_esign_refusal  where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
            }
            if (aadharESignData.length == 0) {
                throw Error('Data Mismatch');
            }


            let statusResponse;
            let esignUrlData = await this.obDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
            let esignUrl = parseInt(reqBody.documentNo) % 2 == 0 ? esignUrlData[0].NSDL_URL  : esignUrlData[0].EMUDHRA
            statusResponse = await this.igrsEsignStatusAxiosCall(esignUrl, reqBody.txnid);
            if (statusResponse != null && statusResponse.status == "Success") {
                console.log("INSIDE");
                let documentsFolderPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
                // let documentsFolderPath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);


                await fs.writeFileSync(`${documentsFolderPath}signedRefusalCor.pdf`, statusResponse.data, { encoding: 'base64' });

                if (reqBody.isCertficateOfRegistrationEsign) {
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign_refusal set COR_ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_cor_esign_txn_id = ${reqBody.txnid}`);
                } else if (reqBody.code == "OF") {
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign_refusal set SR_ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                } else {
                    // await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign set ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign_refusal set ESIGN = 'Y' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and txn_id = ${reqBody.txnid}`);
                }
            } else if (statusResponse != null && statusResponse.status == "Failure") {
                if (reqBody.code == "OF") {
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign_refusal set SR_ESIGN = 'N' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and sr_esign_txn_id = ${reqBody.txnid}`);
                } else {
                    await this.obDao.oDbUpdate(`UPDATE SROUSER.tran_ec_aadhar_esign_refusal set ESIGN = 'N' where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${reqBody.code}' and ec_number = ${reqBody.ec_number} and txn_id = ${reqBody.txnid}`);
                }
                throw new Error(statusResponse.message)
            }


            return statusResponse;

        } catch (ex) {
            Logger.error("EndorseService - getEndorsementEsignStatus || Error :", ex.message);
            console.error("EndorseService - getEndorsementEsignStatus || Error :", ex.message);
            throw constructCARDError(ex);
        }

    }

    GetValidateQrData = async (reqData) => {
 
		try {
            const { code, SR_CODE, BOOK_NO, REG_YEAR, DOCT_NO, ec_number,name, txnid } = reqData;
            let ecStatus = 'N';
		  if (code && code.substring(0, 2) !== 'WT') {
            let query = `
			SELECT 
	  CASE 
		WHEN COUNT(*) > 0 THEN 'Y' 
		ELSE 'N' 
	  END AS status 
    FROM srouser.tran_ec a join SROUSER.tran_ec_aadhar_esign b  on  a.sr_code = b.sr_code  and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year 
      
			WHERE a.sr_code = :sr_code
			  AND a.book_no = :book_no
			  AND a.reg_year = :reg_year
			  AND a.doct_no = :doct_no
			  AND a.code = :code
              and a.NAME = :name
			  AND a.ec_number = :ec_number
              and b.TXN_ID = :tran_id`;
		  let bindparam = {
			sr_code: SR_CODE,
			book_no: BOOK_NO,
			reg_year: REG_YEAR,
			doct_no: DOCT_NO,
			code: code.substring(0,2), 
			ec_number: ec_number,
			name: name, 
            tran_id:txnid
		  };
    
		  let result = await this.obDao.oDBQueryServiceWithBindParams(query, bindparam);
          ecStatus = result?.[0]?.STATUS || 'N';
           } else {
      ecStatus = 'Y';
    }
          const isPrivate = await getPrivateAttendanceStatus(this.obDao, {
                sr_code:  SR_CODE,
                doct_no:  DOCT_NO,
                reg_year: REG_YEAR,
                book_no:  BOOK_NO
              });
          
              return [{ status: ecStatus, isPrivateAttendance: isPrivate }];

		} catch (ex) {
		  Logger.error("eSignServices || ValidateQrData || Error :", ex);
		  throw constructCARDError(ex);
		}
	  };

 GetValidateQrDataRefusal = async (reqData) => {
 
		try {
            const { code, SR_CODE, BOOK_NO, REG_YEAR, DOCT_NO, ec_number,name, txnid } = reqData;
            let ecStatus = 'N';
		  if (code && code.substring(0, 2) !== 'WT') {
            let query = `
			SELECT 
	  CASE 
		WHEN COUNT(*) > 0 THEN 'Y' 
		ELSE 'N' 
	  END AS status 
    FROM srouser.tran_ec a join SROUSER.tran_ec_aadhar_esign_refusal b  on  a.sr_code = b.sr_code  and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year 
      
			WHERE a.sr_code = :sr_code
			  AND a.book_no = :book_no
			  AND a.reg_year = :reg_year
			  AND a.doct_no = :doct_no
			  AND a.code = :code
              and b.A_NAME = :name
			  AND a.ec_number = :ec_number
              and b.TXN_ID = :tran_id`;
		  let bindparam = {
			sr_code: SR_CODE,
			book_no: BOOK_NO,
			reg_year: REG_YEAR,
			doct_no: DOCT_NO,
			code: code.substring(0,2), 
			ec_number: ec_number,
			name: name, 
            tran_id:txnid
		  };
    
		  let result = await this.obDao.oDBQueryServiceWithBindParams(query, bindparam);
          ecStatus = result?.[0]?.STATUS || 'N';
           } else {
      ecStatus = 'Y';
    }
          const isPrivate = await getPrivateAttendanceStatus(this.obDao, {
                sr_code:  SR_CODE,
                doct_no:  DOCT_NO,
                reg_year: REG_YEAR,
                book_no:  BOOK_NO
              });
          
              return [{ status: ecStatus, isPrivateAttendance: isPrivate }];

		} catch (ex) {
		  Logger.error("eSignServices || ValidateQrData || Error :", ex);
		  throw constructCARDError(ex);
		}
	  };
};



module.exports = ESignServices;
