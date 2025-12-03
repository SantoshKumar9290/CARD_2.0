const oracleDb = require('oracledb');
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const odbDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const fs = require('fs');
const puppeteer = require('puppeteer');
const sizeOf = require('image-size');
const hbs = require('handlebars');
oracleDb.autoCommit = true;
const Path = require('path');
const PDFPageCounter = require('pdf-page-counter');
const PDFMerger = require('pdf-merger-js');
const QRCode = require('qrcode')
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const { reject } = require("lodash");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");
const { exec } = require('child_process');
const assert = require("assert").strict;
const QrCodeReader = require('qrcode-reader');
const Jimp = require("jimp");
const { query } = require("express");
const { Logger } = require('../../services/winston');
const https = require('https');
const FormData = require('form-data');
const { statusCheck, sendSMSNotification } = require('../common/smsCommon');
const { AadhardecryptData } = require('../utils');

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});
function NodeCanvasFactory() { }
NodeCanvasFactory.prototype = {
    create: function NodeCanvasFactory_create(width, height) {
        assert(width > 0 && height > 0, "Invalid canvas size");
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        return {
            canvas: canvas,
            context: context,
        };
    },

    reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
        assert(canvasAndContext.canvas, "Canvas is not specified");
        assert(width > 0 && height > 0, "Invalid canvas size");
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    },

    destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
        assert(canvasAndContext.canvas, "Canvas is not specified");

        // Zeroing the width and height cause Firefox to release graphics
        // resources immediately, which can greatly reduce memory consumption.
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    },
};

const CMAP_URL = "../../../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

class EndorseService {
    constructor() {
        this.orDao = new odbDao()
    }
    saveBundling = async (reqData) => {
        try {
            let query = `INSERT INTO scanuser.img_base_cca(sro_code,book_no,doct_no,reg_year,doct_id,image,file_size,cd_vol_no,rdoct_no,ryear,signed,signedby,signeddate,pagecnt,scan_date,scan_by,location,resign_cnt,sign_type,sign_device,bio_auth_by) VALUES (${reqData.sro_code},${reqData.book_no},${reqData.doct_no},${reqData.reg_year},${reqData.doct_id},empty_blob(),${reqData.file_size},${reqData.cd_vol_no},${reqData.rdoct_no},${reqData.ryear},'${reqData.signed}',${reqData.signedby},${reqData.signeddate},${reqData.pagecnt},SYSDATE,${reqData.scan_by},${reqData.location},${reqData.resign_cnt},${reqData.sign_type},${reqData.sign_device},${reqData.bio_auth_by})`;
            let response = await this.orDao.oDbInsertDocs(query);
            return response;
        } catch (ex) {
            Logger.error("EndorseService - saveBundling || Error :", ex);
            console.error("EndorseService - saveBundling || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getSrSrvc = async (reqData) => {
        try {
            let query = `SELECT * FROM CARD.SUBREGISTRAR_DET where sr_code=${reqData.sro_code} AND (UPPER(DESIGNATION) LIKE '%SUB%REGISTRAR%' OR  UPPER(DESIGNATION)  LIKE '%JOINT%REGISTRAR%') 
            UNION
                SELECT * FROM subregistrar_det where sr_code=${reqData.sro_code}
                   and (trunc(sysdate) between trunc(from_date) and trunc(To_date)  or trunc(sysdate)
                       between trunc(from_date) and trunc(to_date) ) AND UPPER(DESIGNATION) NOT LIKE '%SUB%REGISTRAR%' and to_date is not null`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("EndorseService - getSrSrvc || Error :", ex);
            console.error("EndorseService - getSrSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    async createEndorsement(reqBody) {
        let conn;
        try {
            conn = await oracleDb.getConnection(dbConfig)
            console.log("CONN IS ", conn);
            let endorsementDirectiory = Path.join(__dirname, `../../../../../pdfs/`);
            // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}/uploads/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.sroCode}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.bookNo}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.documentNo}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.registedYear}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }

            const endorsementHtmlFilesPath = Path.join(__dirname, `../reports/endorsement1/`);
            const assetsPath = Path.join(__dirname, `../../assets/`);
            let tranEcQuery = `SELECT * From srouser.TRAN_EC_PARTIES_CR a,srouser.tran_ec_aadhar_esign b where ` +
                `a.sr_code=${reqBody.sroCode} and a.book_no=${reqBody.bookNo} and a.doct_no=${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} and ` +
                `a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.book_no = b.book_no and a.ec_number = b.ec_number and a.code = b.code and rownum<=200`
            // let tranEcQuery = `Select a.*, b.photo from SROUSER.tran_ec a, SROUSER.tran_ec_aadhar_esign b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} `+
            // `and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year `+
            // `and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number order by a.code DESC, a.ec_number ASC`;
            let tranEcOracleDbResponse = await conn.execute(tranEcQuery, {}, { outFormat: oracleDb.OBJECT });
            tranEcOracleDbResponse = tranEcOracleDbResponse.rows;

            if (tranEcOracleDbResponse == null)
                tranEcOracleDbResponse = []
            // if (tranEcOracleDbResponse.length < 2) {
            //     let tranEcOracleDbDummyResponse = {
            //         type: "DUMMY"
            //     };
            //     for (let i = tranEcOracleDbResponse.length; i < 2; i++) {
            //         tranEcOracleDbResponse.push(tranEcOracleDbDummyResponse);
            //     }
            // }

            await tranEcOracleDbResponse.map(async element => {
                // if (element.CODE)
                //     element.CODE = element.CODE.substr(0, 2);
                console.log(element.ADDRESS);
                element.MASKED_AADHAR = this.maskAadharString(element.AADHAR);
                if (element.PHOTO != null && element.PHOTO != "(BLOB)") {
                    let bufferBase64 = new Buffer.from(element.PHOTO).toString('base64');
                    element.PHOTO_URL = bufferBase64;
                }
            })
            console.log("AFTER")
            let tranEcWitnessQuery = `Select * from PHOTOFP.TRAN_EC_WITNESS_PHOTOS where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and reg_year = ${reqBody.registedYear} and book_no = ${reqBody.bookNo} order by WITNESS_NUMBER`;
            let tranEcWitnessDbResponse = await conn.execute(tranEcWitnessQuery, {}, { outFormat: oracleDb.OBJECT });
            tranEcWitnessDbResponse = tranEcWitnessDbResponse.rows;

            if (tranEcWitnessDbResponse == null)
                tranEcWitnessDbResponse = [];
            if (tranEcWitnessDbResponse.length < 2) {
                let tranEcWitnessDbDummyResponse = {
                    type: "DUMMY"
                };
                for (let i = tranEcWitnessDbResponse.length; i < 2; i++) {
                    tranEcWitnessDbResponse.push(tranEcWitnessDbDummyResponse);
                }
            }

            tranEcWitnessDbResponse = tranEcWitnessDbResponse.slice(0, 2);

            await tranEcWitnessDbResponse.map(async element => {
                element.MASKED_AADHAR = this.maskAadharString(element.AADHAR);
                if (element.PHOTO != null && element.PHOTO != "(BLOB)") {
                    let bufferBase64 = new Buffer.from(element.PHOTO).toString('base64');
                    element.PHOTO_URL = bufferBase64;
                }
            })


            let srMasterQuery = `select * from sr_master where sr_cd = ${reqBody.sroCode}`;
            let srMasterDbReponse = await conn.execute(srMasterQuery, {}, { outFormat: oracleDb.OBJECT });
            srMasterDbReponse = srMasterDbReponse.rows;

            let registrationFeeQuery = `SELECT TO_CHAR(SUM(NVL(AMOUNT,0))+SUM(NVL(AMOUNT_BY_CHALLAN,0))+SUM(NVL(AMOUNT_BY_DD,0))+SUM(NVL(AMOUNT_BY_ONLINE,0))) rfee FROM CASH_PAID a ,cash_det b WHERE ACCOUNT_CODE=1 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo} and a.doct_no = ${reqBody.documentNo} and a.reg_year = ${reqBody.registedYear} and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
            let registrationFeeDbReponse = await conn.execute(registrationFeeQuery, {});
            registrationFeeDbReponse = registrationFeeDbReponse.rows;

            let registrationDetailsQuery = `select * FROM TRAN_MAJOR where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
            let registrationDetailsDbReponse = await conn.execute(registrationDetailsQuery, {}, { outFormat: oracleDb.OBJECT });
            registrationDetailsDbReponse = registrationDetailsDbReponse.rows;

            if (registrationDetailsDbReponse.length == 0) {
                registrationDetailsDbReponse = [{
                    type: "DUMMY",
                    RF_PAYABLE: 0
                }];
            }

            let stampDutyDetailsQuery = `SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL ` +
                `FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=7 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo}  and a.doct_no= ${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} ` +
                `and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
            let stampDutyDetailDbReponse = await conn.execute(stampDutyDetailsQuery, {}, { outFormat: oracleDb.OBJECT });

            if (stampDutyDetailDbReponse.rows.length > 0) {
                stampDutyDetailDbReponse = stampDutyDetailDbReponse.rows[0];
            } else {
                stampDutyDetailDbReponse = {
                    ONLINE_VAL: 0,
                    CASH_VAL: 0,
                    SHC_VAL: 0,
                    CHALLAN_VAL: 0,
                    STAMP_PAPER_VAL: 0
                }
            }

            let transferDutyDetailsQuery = `SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL ` +
                `FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=6 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo}  and a.doct_no= ${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} ` +
                `and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
            let transferDutyDetailDbReponse = await conn.execute(transferDutyDetailsQuery, {}, { outFormat: oracleDb.OBJECT });

            if (transferDutyDetailDbReponse.rows.length > 0) {
                transferDutyDetailDbReponse = transferDutyDetailDbReponse.rows[0];
            } else {
                transferDutyDetailDbReponse = {
                    ONLINE_VAL: 0,
                    CASH_VAL: 0,
                    SHC_VAL: 0,
                    CHALLAN_VAL: 0,
                    STAMP_PAPER_VAL: 0
                }
            }

            let registrationFeeDetailsQuery = `SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL ` +
                `FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=1 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo}  and a.doct_no= ${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} ` +
                `and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
            let registrationFeeDetailDbReponse = await conn.execute(registrationFeeDetailsQuery, {}, { outFormat: oracleDb.OBJECT });

            if (registrationFeeDetailDbReponse.rows.length > 0) {
                registrationFeeDetailDbReponse = registrationFeeDetailDbReponse.rows[0];
            } else {
                registrationFeeDetailDbReponse = {
                    ONLINE_VAL: 0,
                    CASH_VAL: 0,
                    SHC_VAL: 0,
                    CHALLAN_VAL: 0,
                    STAMP_PAPER_VAL: 0
                }
            }

            let userChargesDetailsQuery = `SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL ` +
                `FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=59 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo}  and a.doct_no= ${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} ` +
                `and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
            let userChargesDetailDbReponse = await conn.execute(userChargesDetailsQuery, {}, { outFormat: oracleDb.OBJECT });

            if (userChargesDetailDbReponse.rows.length > 0) {
                userChargesDetailDbReponse = userChargesDetailDbReponse.rows[0];
            } else {
                userChargesDetailDbReponse = {
                    ONLINE_VAL: 0,
                    CASH_VAL: 0,
                    SHC_VAL: 0,
                    CHALLAN_VAL: 0,
                    STAMP_PAPER_VAL: 0
                }
            }

            let chargesDataQuery = `select srouser.payment_endors_det(${reqBody.sroCode},${reqBody.documentNo},${reqBody.bookNo},${reqBody.registedYear}) from dual`;
            let chargesDataDbReponse = await conn.execute(chargesDataQuery, {}, { outFormat: oracleDb.OBJECT });
            chargesDataDbReponse = chargesDataDbReponse.rows[0];



            //Calculate Total
            stampDutyDetailDbReponse.STAMP_PAPER_VAL = registrationDetailsDbReponse[0].STAMP_DUTY_PAID;
            stampDutyDetailDbReponse.TOTAL_VAL = stampDutyDetailDbReponse.ONLINE_VAL + stampDutyDetailDbReponse.CASH_VAL + stampDutyDetailDbReponse.SHC_VAL + stampDutyDetailDbReponse.CHALLAN_VAL + stampDutyDetailDbReponse.STAMP_PAPER_VAL;

            transferDutyDetailDbReponse.STAMP_PAPER_VAL = 0;
            transferDutyDetailDbReponse.TOTAL_VAL = transferDutyDetailDbReponse.ONLINE_VAL + transferDutyDetailDbReponse.CASH_VAL + transferDutyDetailDbReponse.SHC_VAL + transferDutyDetailDbReponse.CHALLAN_VAL + transferDutyDetailDbReponse.STAMP_PAPER_VAL;

            registrationFeeDetailDbReponse.STAMP_PAPER_VAL = 0;
            registrationFeeDetailDbReponse.TOTAL_VAL = registrationFeeDetailDbReponse.ONLINE_VAL + registrationFeeDetailDbReponse.CASH_VAL + registrationFeeDetailDbReponse.SHC_VAL + registrationFeeDetailDbReponse.CHALLAN_VAL + registrationFeeDetailDbReponse.STAMP_PAPER_VAL;

            userChargesDetailDbReponse.STAMP_PAPER_VAL = 0;
            userChargesDetailDbReponse.TOTAL_VAL = userChargesDetailDbReponse.ONLINE_VAL + userChargesDetailDbReponse.CASH_VAL + userChargesDetailDbReponse.SHC_VAL + userChargesDetailDbReponse.CHALLAN_VAL + userChargesDetailDbReponse.STAMP_PAPER_VAL;

            let totalCharges = {
                ONLINE_VAL: stampDutyDetailDbReponse.ONLINE_VAL + transferDutyDetailDbReponse.ONLINE_VAL + registrationFeeDetailDbReponse.ONLINE_VAL + userChargesDetailDbReponse.ONLINE_VAL,
                CASH_VAL: stampDutyDetailDbReponse.CASH_VAL + transferDutyDetailDbReponse.CASH_VAL + registrationFeeDetailDbReponse.CASH_VAL + userChargesDetailDbReponse.CASH_VAL,
                SHC_VAL: stampDutyDetailDbReponse.SHC_VAL + transferDutyDetailDbReponse.SHC_VAL + registrationFeeDetailDbReponse.SHC_VAL + userChargesDetailDbReponse.SHC_VAL,
                CHALLAN_VAL: stampDutyDetailDbReponse.CHALLAN_VAL + transferDutyDetailDbReponse.CHALLAN_VAL + registrationFeeDetailDbReponse.CHALLAN_VAL + userChargesDetailDbReponse.CHALLAN_VAL,
                STAMP_PAPER_VAL: stampDutyDetailDbReponse.STAMP_PAPER_VAL + transferDutyDetailDbReponse.STAMP_PAPER_VAL + registrationFeeDetailDbReponse.STAMP_PAPER_VAL + userChargesDetailDbReponse.STAMP_PAPER_VAL,
                TOTAL_VAL: stampDutyDetailDbReponse.TOTAL_VAL + transferDutyDetailDbReponse.TOTAL_VAL + registrationFeeDetailDbReponse.TOTAL_VAL + userChargesDetailDbReponse.TOTAL_VAL
            }

            let doclengthQuery = `select * FROM SROUSER.TRAN_NOMINE where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
            let doclengthQueryDbReponse = await conn.execute(doclengthQuery, {}, { outFormat: oracleDb.OBJECT });
            doclengthQueryDbReponse = doclengthQueryDbReponse.rows[0];

            if (doclengthQueryDbReponse != null) {
                reqBody.pdePageSize = doclengthQueryDbReponse.NO_PAGES;
            } else {
                reqBody.pdePageSize = 0;
            }

            let timeQuery = `select min(TIME_STAMP) as timeValue from srouser.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
            let timeQueryDbReponse = await conn.execute(timeQuery, {}, { outFormat: oracleDb.OBJECT });
            timeQueryDbReponse = timeQueryDbReponse.rows;
            console.log("TIME QUERY RESPONSE IS", timeQueryDbReponse);

            let startTimeValue = "";
            let endTimeValue = "";

            if (timeQueryDbReponse != null && timeQueryDbReponse.length > 0 && timeQueryDbReponse[0].TIMEVALUE != null) {
                let timeValue = timeQueryDbReponse[0].TIMEVALUE;
                timeValue = new Date(timeValue);
                let acceptedHour = timeValue.getHours();
                startTimeValue = ((acceptedHour % 12) + (acceptedHour == 12 ? 1 : 0)).toString() + (acceptedHour >= 12 ? "PM" : "AM");
                endTimeValue = ((acceptedHour % 12) + (acceptedHour == 12 ? 1 : 0) + 1).toString() + (acceptedHour >= 12 ? "PM" : "AM");
            }

            let bitmap = fs.readFileSync(`${assetsPath}OfficialLogo.png`);
            let logoBase64 = bitmap.toString('base64');
            bitmap = fs.readFileSync(`${assetsPath}Approved.png`);
            let stampBase64 = bitmap.toString('base64');
            bitmap = fs.readFileSync(`${assetsPath}OfficialSeal.png`);
            let officialSealBase64 = bitmap.toString('base64');

            let headerData = {
                logoLinkImage: logoBase64,
                bookNo: reqBody.bookNo,
                csNo: reqBody.documentNo,
                year: reqBody.registedYear,
                registrarType: reqBody.registrarType,
                doctNo: registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RDOCT_NO,
                rYear: registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RYEAR,
                totalPageCount: 3
            };

            let commonData = {
                bookNo: reqBody.bookNo,
                sroCode: reqBody.sroCode,
                sroData: srMasterDbReponse[0],
                registrarType: reqBody.registrarType,
                registrarName: reqBody.registrarName,
                stampImageLink: stampBase64,
                officialSealLink: officialSealBase64,
                registrationFee: registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RF_PAYABLE
            };

            let extraPageCount = reqBody.isEstampPaper != null && reqBody.isEstampPaper ? 1 : 0;

            let estampPageData = {
                pageCount: extraPageCount
            };
            let extraPageData = [];
            let page1Data = {
                pageCount: 1 + extraPageCount,
                paymentDate: timeQueryDbReponse.length > 0 && timeQueryDbReponse[0].TIMEVALUE != null ? this.getDateinStandardFormat(timeQueryDbReponse[0].TIMEVALUE) : "",
                startTimeValue: startTimeValue,
                endTimeValue: endTimeValue,
                emptySpaces: []
            };

            if (tranEcOracleDbResponse.length == 0) {
                page1Data.emptySpaces.push(1);
                page1Data.emptySpaces.push(2);
            } else if (tranEcOracleDbResponse.length == 1) {
                page1Data.emptySpaces.push(1);
            }

            let page2Data = {
                witnessPageData: tranEcWitnessDbResponse,
            };
            let page3Data = {
                registartionDetails: {
                    fee: registrationFeeDbReponse != null && registrationFeeDbReponse.length > 0 ? registrationFeeDbReponse[0].RFEE : "",
                    rDoctNo: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RDOCT_NO : "",
                    doctNo: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].DOCTNO : "",
                    year: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RYEAR : "",
                    date: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RDATE : ""
                },
                chargeDetails: {
                    stampDutyDetails: stampDutyDetailDbReponse,
                    transferDutyDetails: transferDutyDetailDbReponse,
                    registrationFeeDetails: registrationFeeDetailDbReponse,
                    userChargesDetails: userChargesDetailDbReponse,
                    totalDetails: totalCharges
                },
                paymentRelatedData: chargesDataDbReponse[`SROUSER.PAYMENT_ENDORS_DET(${reqBody.sroCode},${reqBody.documentNo},${reqBody.bookNo},${reqBody.registedYear})`],
                scannedDate: this.dateTimeInFormat(registrationDetailsDbReponse[0].FST_SCAN_DATE, 2),
                paymentDate: this.getDateinStandardFormat(registrationDetailsDbReponse[0].P_DATE)
            };

            let executantsClaimantsPageData = [];
            for (let i = 0; i < 2 && i < tranEcOracleDbResponse.length; i++) {
                executantsClaimantsPageData[i] = tranEcOracleDbResponse[i];
                await this.insertEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[i], 2 + extraPageCount * 2, i == 0 ? "65,430,50,100" : "65,250,50,100");
            }
            // executantsClaimantsPageData[0] = tranEcOracleDbResponse[0];
            // executantsClaimantsPageData[1] = tranEcOracleDbResponse[1];


            // await this.insertEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[0], 2 + extraPageCount * 2, "60,430,50,100");
            // await this.insertEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[1], 2 + extraPageCount * 2, "60,250,50,100");

            let executantsClaimantsContinuationPageData = [];
            let count = 2 + extraPageCount;
            let coOrdinates = [
                "60,550,50,100",
                "60,310,50,100",
                "60,190,50,100"
            ]
            for (let i = 2; i < tranEcOracleDbResponse.length;) {
                let pageData = {
                    pageSubCount: count,
                    userDetails: [],
                    emptySpaces: []
                };
                let j = 0;
                while (j < 3 && i < tranEcOracleDbResponse.length) {
                    pageData.userDetails.push(tranEcOracleDbResponse[i]);
                    await this.insertEndorsementCoordinates(conn, reqBody, tranEcOracleDbResponse[i], count * 2, coOrdinates[j]);
                    i++;
                    j++;
                }
                if (j == 1) {
                    pageData.emptySpaces.push(1);
                    pageData.emptySpaces.push(2);
                } else if (j == 2) {
                    pageData.emptySpaces.push(1);
                }
                executantsClaimantsContinuationPageData.push(pageData)
                count++;
            }
            page1Data.executantsClaimantsPageData = executantsClaimantsPageData;
            page1Data.executantsClaimantsContinuationPageData = executantsClaimantsContinuationPageData;
            page2Data.pageCount = count;


            // await this.insertEndorsementCoordinates(conn, reqBody, tranEcWitnessDbResponse[0], count * 2, "60,480,50,100");
            // await this.insertEndorsementCoordinates(conn, reqBody, tranEcWitnessDbResponse[1], count * 2, "60,300,50,100");
            await this.insertEndorsementCoordinates(conn, reqBody, tranEcWitnessDbResponse[0], count * 2, "65,480,50,100");
            await this.insertEndorsementCoordinates(conn, reqBody, tranEcWitnessDbResponse[1], count * 2, "65,300,50,100");
            count++;

            page3Data.pageCount = count;
            headerData.totalPageCount = count;

            if (count < reqBody.pdePageSize) {
                headerData.totalPageCount = reqBody.pdePageSize;
                for (let i = count + 1; i <= reqBody.pdePageSize; i++) {
                    extraPageData.push({
                        headerMarginTop: 25,
                        pageCount: i
                    })
                }
            }

            let qrCodeData = await QRCode.toDataURL(`${commonData.bookNo} - ${commonData.sroCode} - ${page3Data.registartionDetails.rDoctNo} - ${page3Data.registartionDetails.year}`);
            let splitQrCodeData = await QRCode.toDataURL(`${process.env.IP_ADDRESS}:${process.env.PORT}/files/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/signedBundledDocument.pdf`)
            let qrImagesData = await this.splitImages(splitQrCodeData);
            let qrImageCount = 0;
            page1Data.QR_LINK = qrImagesData[qrImageCount++];
            page2Data.QR_LINK = qrImagesData[qrImageCount++];
            page3Data.QR_LINK = qrImagesData[qrImageCount++];
            commonData.qrCodeLink = qrCodeData;
            commonData.generatedOn = this.dateTimeInFormat(null, 1);
            page1Data.headerMarginTop = extraPageCount * 18;

            let dynamicData = {
                headerData: headerData,
                page1Data: page1Data,
                page2Data: page2Data,
                page3Data: page3Data,
                commonData: commonData,
                estampPageData: estampPageData,
                extraPageData: extraPageData
            };

            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            const files = [
                `${endorsementHtmlFilesPath}page1.hbs`,
                `${endorsementHtmlFilesPath}page2.hbs`,
                `${endorsementHtmlFilesPath}page3.hbs`
            ];
            if (reqBody.isEstampPaper != null && reqBody.isEstampPaper) files.splice(0, 0, `${endorsementHtmlFilesPath}estampPage.hbs`);

            if (count < reqBody.pdePageSize)
                files.push(`${endorsementHtmlFilesPath}extraPage.hbs`);

            let html = "";
            files.forEach(file => {
                html += fs.readFileSync(`${file}`, 'utf-8');
            })
            page.setOfflineMode(true);
            await page.setContent(hbs.compile(html)(dynamicData));
            await page.pdf({
                path: `${endorsementDirectiory}endorsement.pdf`,
                printBackground: true,
                format: 'A4',
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            });
            console.log(`${endorsementDirectiory}endorsement.pdf`)
            console.log("Done Pdf printing!!");

            if (fs.existsSync(`${endorsementDirectiory}signedBundledDocument.pdf`)) {
                fs.unlinkSync(`${endorsementDirectiory}signedBundledDocument.pdf`);
            }

            if (fs.existsSync(`${endorsementDirectiory}signedEndorsementDocument.pdf`)) {
                fs.unlinkSync(`${endorsementDirectiory}signedEndorsementDocument.pdf`);
            }

            await browser.close();

            let updateStatusQuery = `UPDATE SROUSER.pde_doc_status_cr SET DOC_ENDORS='Y', ENDORS_TIME_STAMP= SYSDATE WHERE SR_CODE=${reqBody.sroCode} AND BOOK_NO=${reqBody.bookNo} AND DOCT_NO=${reqBody.documentNo} AND REG_YEAR=${reqBody.registedYear}` ?? "";
            await conn.execute(updateStatusQuery, {}, { outFormat: oracleDb.OBJECT });

            bitmap = fs.readFileSync(`${endorsementDirectiory}endorsement.pdf`);
            let convertBase64 = bitmap.toString('base64');
            return {
                dataBase64: convertBase64,
                fileName: `endorsement.pdf`
            };

        } catch (err) {
            Logger.error("EndorseService - createEndorsement || Error :", err);
            console.error("EndorseService - createEndorsement || Error :", err);
            throw constructCARDError(err);
        } finally {
            if (conn != null)
                doRelease(conn);
        }
    }

    async createEndorsementWithFingerPrint(reqBody) {
        let conn;
        try {
            conn = await oracleDb.getConnection(dbConfig)
                console.log("CONN IS ", conn);
                let endorsementDirectiory = Path.join(__dirname, `../../../../../pdfs/`);
                // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
                if (!fs.existsSync(endorsementDirectiory)) {
                    fs.mkdirSync(endorsementDirectiory, { recursive: true });
                }
                endorsementDirectiory = `${endorsementDirectiory}/uploads/`;
                if (!fs.existsSync(endorsementDirectiory)) {
                    fs.mkdirSync(endorsementDirectiory, { recursive: true });
                }
                endorsementDirectiory = `${endorsementDirectiory}${reqBody.sroCode}/`;
                if (!fs.existsSync(endorsementDirectiory)) {
                    fs.mkdirSync(endorsementDirectiory, { recursive: true });
                }
                endorsementDirectiory = `${endorsementDirectiory}${reqBody.bookNo}/`;
                if (!fs.existsSync(endorsementDirectiory)) {
                    fs.mkdirSync(endorsementDirectiory, { recursive: true });
                }
                endorsementDirectiory = `${endorsementDirectiory}${reqBody.documentNo}/`;
                if (!fs.existsSync(endorsementDirectiory)) {
                    fs.mkdirSync(endorsementDirectiory, { recursive: true });
                }
                endorsementDirectiory = `${endorsementDirectiory}${reqBody.registedYear}/`;
                if (!fs.existsSync(endorsementDirectiory)) {
                    fs.mkdirSync(endorsementDirectiory, { recursive: true });
                }

                let ociDetailsQuery = `SELECT * FROM srouser.tran_oci WHERE sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
                let ociDetailsQueryResponse = await conn.execute(ociDetailsQuery, {}, {
                    outFormat: oracleDb.OBJECT,
                    fetchInfo: {
                        "PARTY_FILE": { type: oracleDb.BUFFER }
                    }
                });
                const ociRows = ociDetailsQueryResponse.rows;

                if (ociRows == null)
                    ociRows = []

                const endorsementHtmlFilesPath = Path.join(__dirname, `../reports/endorsement2/`);
                const assetsPath = Path.join(__dirname, `../../assets/`);
                let tranEcQuery = `SELECT * From srouser.TRAN_EC_PARTIES_CR a,srouser.tran_ec_aadhar_esign b where ` +
                    `a.sr_code=${reqBody.sroCode} and a.book_no=${reqBody.bookNo} and a.doct_no=${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} and ` +
                    `a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.book_no = b.book_no and a.ec_number = b.ec_number and nvl(a.AADHAR_ENCRPT,a.aadhar) = NVL(b.AADHAR_ENCRPT, b.aadhar) and substr(a.code, 1, 2) = substr(b.code, 1, 2) and rownum<=200`
                //  let tranEcQuery = `SELECT * From srouser.TRAN_EC_PARTIES_CR a,srouser.tran_ec_aadhar_esign b where ` +
                //     `a.sr_code=${reqBody.sroCode} and a.book_no=${reqBody.bookNo} and a.doct_no=${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} and ` +
                //     `a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.book_no = b.book_no and a.ec_number = b.ec_number and nvl(a.AADHAR_ENCRPT,nvl(a.aadhar, 0)) = NVL(b.AADHAR_ENCRPT, nvl(b.aadhar, 0)) and substr(a.code, 1, 2) = substr(b.code, 1, 2) and rownum<=200`
                // let tranEcQuery = `Select a.*, b.photo from SROUSER.tran_ec a, SROUSER.tran_ec_aadhar_esign b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} `+
                // `and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year `+
                // `and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number order by a.code DESC, a.ec_number ASC`;
                let tranEcOracleDbResponse = await conn.execute(tranEcQuery, {}, { outFormat: oracleDb.OBJECT });
                tranEcOracleDbResponse = tranEcOracleDbResponse.rows;

                if (tranEcOracleDbResponse == null)
                    tranEcOracleDbResponse = []
                // if (tranEcOracleDbResponse.length < 2) {
                //     let tranEcOracleDbDummyResponse = {
                //         type: "DUMMY"
                //     };
                //     for (let i = tranEcOracleDbResponse.length; i < 2; i++) {
                //         tranEcOracleDbResponse.push(tranEcOracleDbDummyResponse);
                //     }
                // }

                // let tranEcFingerQuery = `Select a.*, b.finger from SROUSER.tran_ec a, PHOTOFP.tran_ec_photos b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} `+
                // `and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year `+
                // `and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number`;
                let tranEcFingerQuery = `Select a.*, b.finger, b.photo from SROUSER.tran_ec_parties_cr a, PHOTOFP.tran_ec_photos b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} ` +
                    `and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year ` +
                    `and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number`;
                let tranEcFingerOracleDbResponse = await conn.execute(tranEcFingerQuery, {}, { outFormat: oracleDb.OBJECT });
                tranEcFingerOracleDbResponse = tranEcFingerOracleDbResponse.rows;

                await tranEcOracleDbResponse.map(async element => {
                    // if (element.CODE)
                    //     element.CODE = element.CODE.substr(0, 2);
                    element.MASKED_AADHAR = this.maskAadharString((element.AADHAR_ENCRPT != null) ? AadhardecryptData(element.AADHAR_ENCRPT) : (element.AADHAR?.length == 12 ? element.AADHAR : ''));
                    element.MASKED_PASSPORT = this.maskPassportString(element.PASSPORT_NO)
                    element.THUMB_PHOTO = null;
                    if (element.PHOTO != null && element.PHOTO != "(BLOB)") {
                        let bufferBase64 = new Buffer.from(element.PHOTO).toString('base64');
                        element.PHOTO_URL = bufferBase64;
                    }
                    for (let tranEcFingerOracleDbRow of tranEcFingerOracleDbResponse) {
                        if (tranEcFingerOracleDbRow.CODE == element.CODE && tranEcFingerOracleDbRow.EC_NUMBER == element.EC_NUMBER) {
                            element.THUMB_PHOTO = tranEcFingerOracleDbRow.FINGER;
                            break;
                        }
                    }
                    if (element.THUMB_PHOTO != null && element.THUMB_PHOTO != "(BLOB)") {
                        let bufferBase64 = new Buffer.from(element.THUMB_PHOTO).toString('base64');
                        element.THUMB_PHOTO = bufferBase64;
                    }
                })
                let webEkyc = []
                await ociRows.map(async element =>{
                    for (let tranEcFingerOracleDbRow of tranEcFingerOracleDbResponse) {
                        if (tranEcFingerOracleDbRow?.CODE?.includes(element?.PARTY_CODE) && tranEcFingerOracleDbRow.EC_NUMBER == element.PARTY_NUMBER && tranEcFingerOracleDbRow.PHOTO != null) {
                            let data ={
                                CODE : tranEcFingerOracleDbRow.CODE,
                                EC_NUMBER: element.PARTY_NUMBER,
                                PASSPORT_NO: this.maskPassportString(tranEcFingerOracleDbRow.PASSPORT_NO),
                                THUMB_PHOTO: tranEcFingerOracleDbRow.FINGER,
                                PHOTO_URL: tranEcFingerOracleDbRow.PHOTO,
                                NAME: tranEcFingerOracleDbRow.NAME,
                                ADDRESS: tranEcFingerOracleDbRow.ADDRESS_NEW,
                                R_NAME: tranEcFingerOracleDbRow.R_NAME,
                                R_CODE: tranEcFingerOracleDbRow.R_CODE
                            }
                            if (data.THUMB_PHOTO != null && data.THUMB_PHOTO != "(BLOB)") {
                                let bufferBase64 = new Buffer.from(data.THUMB_PHOTO).toString('base64');
                                data.THUMB_PHOTO = bufferBase64;
                            }
                            if (data.PHOTO_URL != null) {
                                let base64Image = data.PHOTO_URL.toString('base64');
                                data.PHOTO_URL = base64Image;
                            }
                            webEkyc.push(data)
                        }
                    }
                })

                let tranEcWitnessQuery = `Select * from PHOTOFP.TRAN_EC_WITNESS_PHOTOS where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and reg_year = ${reqBody.registedYear} and book_no = ${reqBody.bookNo} order by WITNESS_NUMBER`;
                let tranEcWitnessDbResponse = await conn.execute(tranEcWitnessQuery, {}, { outFormat: oracleDb.OBJECT });
                tranEcWitnessDbResponse = tranEcWitnessDbResponse.rows;

                if (tranEcWitnessDbResponse == null)
                    tranEcWitnessDbResponse = [];
                if (tranEcWitnessDbResponse.length < 2) {
                    let tranEcWitnessDbDummyResponse = {
                        type: "DUMMY"
                    };
                    for (let i = tranEcWitnessDbResponse.length; i < 2; i++) {
                        tranEcWitnessDbResponse.push(tranEcWitnessDbDummyResponse);
                    }
                }

                tranEcWitnessDbResponse = tranEcWitnessDbResponse.slice(0, 2);

                await tranEcWitnessDbResponse.map(async element => {
                    element.MASKED_AADHAR = this.maskAadharString((element.AADHAR_ENCRPT != null) ? AadhardecryptData(element.AADHAR_ENCRPT) : element.AADHAR);
                    if (element.PHOTO != null && element.PHOTO != "(BLOB)") {
                        let bufferBase64 = new Buffer.from(element.PHOTO).toString('base64');
                        element.PHOTO_URL = bufferBase64;
                    }
                    if (element.FINGER != null && element.FINGER != "(BLOB)") {
                        let bufferBase64 = new Buffer.from(element.FINGER).toString('base64');
                        element.THUMB_PHOTO = bufferBase64;
                    }
                })


                let srMasterQuery = `select * from sr_master where sr_cd = ${reqBody.sroCode}`;
                let srMasterDbReponse = await conn.execute(srMasterQuery, {}, { outFormat: oracleDb.OBJECT });
                srMasterDbReponse = srMasterDbReponse.rows;

                let registrationFeeQuery = `SELECT TO_CHAR(SUM(NVL(AMOUNT,0))+SUM(NVL(AMOUNT_BY_CHALLAN,0))+SUM(NVL(AMOUNT_BY_DD,0))+SUM(NVL(AMOUNT_BY_ONLINE,0))) rfee FROM CASH_PAID a ,cash_det b WHERE ACCOUNT_CODE=1 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo} and a.doct_no = ${reqBody.documentNo} and a.reg_year = ${reqBody.registedYear} and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
                let registrationFeeDbReponse = await conn.execute(registrationFeeQuery, {});
                registrationFeeDbReponse = registrationFeeDbReponse.rows;

                let registrationDetailsQuery = `select * FROM TRAN_MAJOR where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
                let registrationDetailsDbReponse = await conn.execute(registrationDetailsQuery, {}, { outFormat: oracleDb.OBJECT });
                registrationDetailsDbReponse = registrationDetailsDbReponse.rows;

                if (registrationDetailsDbReponse.length == 0) {
                    registrationDetailsDbReponse = [{
                        type: "DUMMY"
                    }];
                }

                let section16Result;
                try {
                    if(reqBody.secType == "Section 16"){
                        let section16CashQuery = `select * from srouser.sec_16_cash where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
                        let section16CashQueryDbReponse = await conn.execute(section16CashQuery, {}, { outFormat: oracleDb.OBJECT });
                        section16Result = section16CashQueryDbReponse.rows;                   
                    }
                } catch (error) {
                    console.log("Error in getting section 16 data", error);
                }

                let stampDutyDetailsQuery = `SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL ` +
                    `FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=7 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo}  and a.doct_no= ${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} ` +
                    `and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
                let stampDutyDetailDbReponse = await conn.execute(stampDutyDetailsQuery, {}, { outFormat: oracleDb.OBJECT });

                if (stampDutyDetailDbReponse.rows.length > 0) {
                    stampDutyDetailDbReponse = stampDutyDetailDbReponse.rows[0];
                    stampDutyDetailDbReponse.CASH_VAL = stampDutyDetailDbReponse.CASH_VAL - ((section16Result && section16Result.length > 0)  ? section16Result[0].PAID_AMOUNT : 0);  
                    stampDutyDetailDbReponse.SEC_16 =  (section16Result && section16Result.length > 0) ? section16Result[0].PAID_AMOUNT : 0
                } else {
                    stampDutyDetailDbReponse = {
                        ONLINE_VAL: 0,
                        CASH_VAL: 0,
                        SHC_VAL: 0,
                        CHALLAN_VAL: 0,
                        STAMP_PAPER_VAL: 0,
                        SEC_16: 0
                    }
                }

                let transferDutyDetailsQuery = `SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL ` +
                    `FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=6 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo}  and a.doct_no= ${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} ` +
                    `and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
                let transferDutyDetailDbReponse = await conn.execute(transferDutyDetailsQuery, {}, { outFormat: oracleDb.OBJECT });

                if (transferDutyDetailDbReponse.rows.length > 0) {
                    transferDutyDetailDbReponse = transferDutyDetailDbReponse.rows[0];
                } else {
                    transferDutyDetailDbReponse = {
                        ONLINE_VAL: 0,
                        CASH_VAL: 0,
                        SHC_VAL: 0,
                        CHALLAN_VAL: 0,
                        STAMP_PAPER_VAL: 0
                    }
                }

                let registrationFeeDetailsQuery = `SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL ` +
                    `FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=1 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo}  and a.doct_no= ${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} ` +
                    `and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
                let registrationFeeDetailDbReponse = await conn.execute(registrationFeeDetailsQuery, {}, { outFormat: oracleDb.OBJECT });

                if (registrationFeeDetailDbReponse.rows.length > 0) {
                    registrationFeeDetailDbReponse = registrationFeeDetailDbReponse.rows[0];
                } else {
                    registrationFeeDetailDbReponse = {
                        ONLINE_VAL: 0,
                        CASH_VAL: 0,
                        SHC_VAL: 0,
                        CHALLAN_VAL: 0,
                        STAMP_PAPER_VAL: 0
                    }
                }

                let userChargesDetailsQuery = `SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL ` +
                    `FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=59 and a.sr_code = ${reqBody.sroCode} and a.book_no = ${reqBody.bookNo}  and a.doct_no= ${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} ` +
                    `and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.ACC_CANC<>'C'`;
                let userChargesDetailDbReponse = await conn.execute(userChargesDetailsQuery, {}, { outFormat: oracleDb.OBJECT });

                if (userChargesDetailDbReponse.rows.length > 0) {
                    userChargesDetailDbReponse = userChargesDetailDbReponse.rows[0];
                } else {
                    userChargesDetailDbReponse = {
                        ONLINE_VAL: 0,
                        CASH_VAL: 0,
                        SHC_VAL: 0,
                        CHALLAN_VAL: 0,
                        STAMP_PAPER_VAL: 0
                    }
                }

                let chargesDataQuery = `select srouser.payment_endors_det(${reqBody.sroCode},${reqBody.documentNo},${reqBody.bookNo},${reqBody.registedYear}) from dual`;
                let chargesDataDbReponse = await conn.execute(chargesDataQuery, {}, { outFormat: oracleDb.OBJECT });
                chargesDataDbReponse = chargesDataDbReponse.rows[0];

                let pendingDataQuery = `select * from SROUSER.TRAN_PENDING where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and reg_year = ${reqBody.registedYear} and book_no = ${reqBody.bookNo}`;
                let pendingDataReponse = await conn.execute(pendingDataQuery, {}, { outFormat: oracleDb.OBJECT });                

            if(pendingDataReponse.rows.length == 0){
                        pendingDataReponse = [
                            {
                                P_NUMBER: ""
                            }
                        ]
                    } else {
                        pendingDataReponse = pendingDataReponse.rows[0];
                    }


                    //Calculate Total
                    stampDutyDetailDbReponse.STAMP_PAPER_VAL = registrationDetailsDbReponse[0].STAMP_DUTY_PAID;
                    stampDutyDetailDbReponse.TOTAL_VAL = stampDutyDetailDbReponse.ONLINE_VAL + stampDutyDetailDbReponse.CASH_VAL + stampDutyDetailDbReponse.SHC_VAL + stampDutyDetailDbReponse.CHALLAN_VAL + stampDutyDetailDbReponse.STAMP_PAPER_VAL + stampDutyDetailDbReponse.SEC_16;

                    transferDutyDetailDbReponse.STAMP_PAPER_VAL = 0;
                    transferDutyDetailDbReponse.TOTAL_VAL = transferDutyDetailDbReponse.ONLINE_VAL + transferDutyDetailDbReponse.CASH_VAL + transferDutyDetailDbReponse.SHC_VAL + transferDutyDetailDbReponse.CHALLAN_VAL + transferDutyDetailDbReponse.STAMP_PAPER_VAL;

                    registrationFeeDetailDbReponse.STAMP_PAPER_VAL = 0;
                    registrationFeeDetailDbReponse.TOTAL_VAL = registrationFeeDetailDbReponse.ONLINE_VAL + registrationFeeDetailDbReponse.CASH_VAL + registrationFeeDetailDbReponse.SHC_VAL + registrationFeeDetailDbReponse.CHALLAN_VAL + registrationFeeDetailDbReponse.STAMP_PAPER_VAL;

                    userChargesDetailDbReponse.STAMP_PAPER_VAL = 0;
                    userChargesDetailDbReponse.TOTAL_VAL = userChargesDetailDbReponse.ONLINE_VAL + userChargesDetailDbReponse.CASH_VAL + userChargesDetailDbReponse.SHC_VAL + userChargesDetailDbReponse.CHALLAN_VAL + userChargesDetailDbReponse.STAMP_PAPER_VAL;

                    let totalCharges = {
                        ONLINE_VAL: stampDutyDetailDbReponse.ONLINE_VAL + transferDutyDetailDbReponse.ONLINE_VAL + registrationFeeDetailDbReponse.ONLINE_VAL + userChargesDetailDbReponse.ONLINE_VAL,
                        CASH_VAL: stampDutyDetailDbReponse.CASH_VAL + transferDutyDetailDbReponse.CASH_VAL + registrationFeeDetailDbReponse.CASH_VAL + userChargesDetailDbReponse.CASH_VAL,
                        SHC_VAL: stampDutyDetailDbReponse.SHC_VAL + transferDutyDetailDbReponse.SHC_VAL + registrationFeeDetailDbReponse.SHC_VAL + userChargesDetailDbReponse.SHC_VAL,
                        CHALLAN_VAL: stampDutyDetailDbReponse.CHALLAN_VAL + transferDutyDetailDbReponse.CHALLAN_VAL + registrationFeeDetailDbReponse.CHALLAN_VAL + userChargesDetailDbReponse.CHALLAN_VAL,
                        SEC_16_VAL: (section16Result && section16Result.length > 0) ? section16Result[0].PAID_AMOUNT : 0, 
                        STAMP_PAPER_VAL: stampDutyDetailDbReponse.STAMP_PAPER_VAL + transferDutyDetailDbReponse.STAMP_PAPER_VAL + registrationFeeDetailDbReponse.STAMP_PAPER_VAL + userChargesDetailDbReponse.STAMP_PAPER_VAL,
                        TOTAL_VAL: stampDutyDetailDbReponse.TOTAL_VAL + transferDutyDetailDbReponse.TOTAL_VAL + registrationFeeDetailDbReponse.TOTAL_VAL + userChargesDetailDbReponse.TOTAL_VAL
                    }

                    let doclengthQuery = `select * FROM SROUSER.TRAN_NOMINE where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
                    let doclengthQueryDbReponse = await conn.execute(doclengthQuery, {}, { outFormat: oracleDb.OBJECT });
                    doclengthQueryDbReponse = doclengthQueryDbReponse.rows[0];

                    if (doclengthQueryDbReponse != null) {
                        reqBody.pdePageSize = doclengthQueryDbReponse.NO_PAGES;
                    } else {
                        reqBody.pdePageSize = 0;
                    }

                    let timeQuery = `select min(TIME_STAMP) as timeValue from srouser.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
                    let timeQueryDbReponse = await conn.execute(timeQuery, {}, { outFormat: oracleDb.OBJECT });
                    timeQueryDbReponse = timeQueryDbReponse.rows;
                    console.log("TIME QUERY RESPONSE IS", timeQueryDbReponse);

                    let startTimeValue = "";
                    let endTimeValue = "";

                    if (timeQueryDbReponse != null && timeQueryDbReponse.length > 0 && timeQueryDbReponse[0].TIMEVALUE != null) {
                        let timeValue = timeQueryDbReponse[0].TIMEVALUE;
                        timeValue = new Date(timeValue);
                        let acceptedHour = timeValue.getHours();
                        startTimeValue = ((acceptedHour % 12) + (acceptedHour == 12 ? 1 : 0)).toString() + (acceptedHour >= 12 ? "PM" : "AM");
                        endTimeValue = ((acceptedHour % 12) + (acceptedHour == 12 ? 1 : 0) + 1).toString() + (acceptedHour >= 12 ? "PM" : "AM");
                    }

                    let bitmap = fs.readFileSync(`${assetsPath}OfficialLogo.png`);
                    let logoBase64 = bitmap.toString('base64');
                    bitmap = fs.readFileSync(`${assetsPath}Approved.png`);
                    let stampBase64 = bitmap.toString('base64');
                    bitmap = fs.readFileSync(`${assetsPath}OfficialSeal.png`);
                    let officialSealBase64 = bitmap.toString('base64');

                    let headerData = {
                        logoLinkImage: logoBase64,
                        bookNo: reqBody.bookNo,
                        csNo: reqBody.documentNo.toString(),
                        year: reqBody.registedYear,
                        notPending: reqBody.isPendingDocument ? [] : [1],
                        pendingDocument: reqBody.isPendingDocument ? [1] : [],
                        pendingNumber: pendingDataReponse.P_NUMBER,
                        registrarType: reqBody.registrarType,
                        doctNo: registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RDOCT_NO,
                        rYear: reqBody.isPendingDocument ? reqBody.registedYear : registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RYEAR,
                        totalPageCount: 3
                    };

                    let commonData = {
                        bookNo: reqBody.bookNo,
                        sroCode: reqBody.sroCode,
                        sroData: srMasterDbReponse[0],
                        registrarType: reqBody.registrarType,
                        registrarName: reqBody.registrarName,
                        stampImageLink: stampBase64,
                        officialSealLink: officialSealBase64,
                        registrationFee: registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RF_PAYABLE
                    };

                    let extraPageCount = reqBody.isEstampPaper != null && reqBody.isEstampPaper ? 1 : 0;

                    let estampPageData = {
                        pageCount: extraPageCount
                    };
                    let extraPageData = [];
                    
                    let ociPartyData = [];
                    if (ociRows.length > 0) {
                        for (const row of ociRows) {
                            let base64Image = null;
                            if (row.PARTY_FILE) {
                                base64Image = row.PARTY_FILE.toString('base64');
                            }
                            let PARTY_NAME = ''
                            for (let tranEcFingerOracleDbRow of tranEcFingerOracleDbResponse) {
                                if (tranEcFingerOracleDbRow?.CODE?.includes(row?.PARTY_CODE) && tranEcFingerOracleDbRow.EC_NUMBER == row.PARTY_NUMBER) {
                                    PARTY_NAME = tranEcFingerOracleDbRow.NAME
                                }
                            }
                            ociPartyData.push({
                                imageBase64: base64Image,
                                partyCode: row.PARTY_CODE,
                                partyNumber: row.PARTY_NUMBER,
                                partyName: PARTY_NAME
                            });
                        }
                    }
                    let page1Data = {
                        pageCount: 1 + extraPageCount,
                        paymentDate: timeQueryDbReponse.length > 0 && timeQueryDbReponse[0].TIMEVALUE != null ? this.getDateinStandardFormat(timeQueryDbReponse[0].TIMEVALUE) : "",
                        startTimeValue: startTimeValue,
                        endTimeValue: endTimeValue,
                        emptySpaces: []
                    };

                    if (tranEcOracleDbResponse.length == 0) {
                        page1Data.emptySpaces.push(1);
                        page1Data.emptySpaces.push(2);
                    } else if (tranEcOracleDbResponse.length == 1) {
                        page1Data.emptySpaces.push(1);
                    }

                    let page2Data = {
                        witnessPageData: tranEcWitnessDbResponse,
                        webEkyc: webEkyc
                    };

                    let section16Data = "."
                    try {
                        if (reqBody.secType == "Section 16") {
                            let section16CashQuery = `select * from srouser.sec_16_cash where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
                            let section16CashQueryDbReponse = await conn.execute(section16CashQuery, {}, { outFormat: oracleDb.OBJECT });
                            section16CashQueryDbReponse = section16CashQueryDbReponse.rows;
                            if (section16CashQueryDbReponse.length > 0) {
                                section16CashQueryDbReponse = section16CashQueryDbReponse[0];
                                let usedRegistrationDetailsQuery = `select * FROM TRAN_MAJOR where sr_code = ${section16CashQueryDbReponse.USING_SR_CODE} AND book_no = ${section16CashQueryDbReponse.USING_BOOK_NO} AND doct_no = ${section16CashQueryDbReponse.USING_DOCT_NO} AND reg_year = ${section16CashQueryDbReponse.USING_REG_YEAR}`;
                                let usedRegistrationDetailsDbReponse = await conn.execute(usedRegistrationDetailsQuery, {}, { outFormat: oracleDb.OBJECT });
                                usedRegistrationDetailsDbReponse = usedRegistrationDetailsDbReponse.rows;
                                if (usedRegistrationDetailsDbReponse.length > 0) {
                                    section16Data = "(" + section16CashQueryDbReponse.USING_SR_CODE + "-" + section16CashQueryDbReponse.USING_BOOK_NO + "-" + usedRegistrationDetailsDbReponse[0].RDOCT_NO + "-" + usedRegistrationDetailsDbReponse[0].RYEAR + ").";
                                }
                            }

                        }

                    } catch (error) {
                        console.log("Error in getting section 16 data", error);
                    }

                    let page3Data = {
                        registartionDetails: {
                            fee: registrationFeeDbReponse != null && registrationFeeDbReponse.length > 0 ? registrationFeeDbReponse[0].RFEE : "",
                            rDoctNo: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RDOCT_NO : "",
                            doctNo: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].DOCTNO : "",
                            year: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RYEAR : "",
                            date: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RDATE : ""
                        },
                        chargeDetails: {
                            stampDutyDetails: stampDutyDetailDbReponse,
                            transferDutyDetails: transferDutyDetailDbReponse,
                            registrationFeeDetails: registrationFeeDetailDbReponse,
                            userChargesDetails: userChargesDetailDbReponse,
                            totalDetails: totalCharges
                        },
                        paymentRelatedData: chargesDataDbReponse[`SROUSER.PAYMENT_ENDORS_DET(${reqBody.sroCode},${reqBody.documentNo},${reqBody.bookNo},${reqBody.registedYear})`],
                        scannedDate: this.dateTimeInFormat(registrationDetailsDbReponse[0].FST_SCAN_DATE, 2),
                        paymentDate: this.getDateinStandardFormat(registrationDetailsDbReponse[0].P_DATE),
                        section88: reqBody.secType == "Section 88" ? [1] : [],
                        section16: reqBody.secType == "Section 16" ? [1] : [],
                        section73: reqBody.secType == "Section 73" ? [1] : [],
                        section16Data: section16Data,
                        act11: reqBody.secType == "Endorsement U/Sec 41 & 42 of Act 11 of 1899" ? [1] : [],
                        emptySpace: reqBody.secType != "Section 88" && reqBody.secType != "Section 16" && reqBody.secType != "Section 73"
                            && reqBody.secType != "Endorsement U/Sec 41 & 42 of Act 11 of 1899" ? [1] : []
                    };

                    let executantsClaimantsPageData = [];

                    for (let i = 0; i < 2 && i < tranEcOracleDbResponse.length; i++) {
                        executantsClaimantsPageData[i] = tranEcOracleDbResponse[i];
                        console.log(executantsClaimantsPageData.length);
                await this.insertEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[i], 2 + extraPageCount * 2, i == 0 ? "65,430,50,100" : "65,250,50,100");
                    }
                    // executantsClaimantsPageData[0] = tranEcOracleDbResponse[0];
                    // executantsClaimantsPageData[1] = tranEcOracleDbResponse[1];


                    // await this.insertEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[0], 2 + extraPageCount * 2, "60,430,50,100");
                    // await this.insertEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[1], 2 + extraPageCount * 2, "60,250,50,100");

                    let executantsClaimantsContinuationPageData = [];
                    let count = 2 + extraPageCount;
                    let coOrdinates = [
                        "60,550,50,100",
                        "60,310,50,100",
                        "60,190,50,100"
                    ]
                    for (let i = 2; i < tranEcOracleDbResponse.length;) {
                        let pageData = {
                            pageSubCount: count,
                            userDetails: [],
                            emptySpaces: []
                        };
                        let j = 0;
                        while (j < 3 && i < tranEcOracleDbResponse.length) {
                            pageData.userDetails.push(tranEcOracleDbResponse[i]);
                            await this.insertEndorsementCoordinates(conn, reqBody, tranEcOracleDbResponse[i], count * 2, coOrdinates[j]);
                            i++;
                            j++;
                        }
                        if (j == 1) {
                            pageData.emptySpaces.push(1);
                            pageData.emptySpaces.push(2);
                        } else if (j == 2) {
                            pageData.emptySpaces.push(1);
                        }
                        executantsClaimantsContinuationPageData.push(pageData)
                        count++;
                    }
                    page1Data.executantsClaimantsPageData = executantsClaimantsPageData;
                    page1Data.executantsClaimantsContinuationPageData = executantsClaimantsContinuationPageData;
                    page2Data.pageCount = count;

                    await this.insertEndorsementCoordinates(conn, reqBody, tranEcWitnessDbResponse[0], count * 2, "65,480,50,100");
                    await this.insertEndorsementCoordinates(conn, reqBody, tranEcWitnessDbResponse[1], count * 2, "65,300,50,100");

                    if(webEkyc.length == 0 && ociPartyData.length > 0){
                        count++;
                        page2Data.ociPartyPageCount = count;
                    }else if(webEkyc.length > 0 && ociPartyData.length > 0){
                        count++;
                        page2Data.webEkycPageCount = count;
                        count++;
                        page2Data.ociPartyPageCount = count;
                    }

                    count++;

                    page3Data.pageCount = count;
                    count++;
                    let corData = {
                        pageCount: count
                    }
                    headerData.totalPageCount = count;

                    if (count < reqBody.pdePageSize) {
                        headerData.totalPageCount = reqBody.pdePageSize;
                        for (let i = count + 1; i <= reqBody.pdePageSize; i++) {
                            extraPageData.push({
                                headerMarginTop: 25,
                                pageCount: i
                            })
                        }
                    }

                    let qrCodeData = await QRCode.toDataURL(`${process.env.IP_ADDRESS}:${process.env.PORT}/files/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
                    let splitQrCodeData = await QRCode.toDataURL(`${process.env.IP_ADDRESS}:${process.env.PORT}/files/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/signedEndorsementDocument.pdf`)
                    let qrImagesData = await this.splitImages(splitQrCodeData);
                    let qrImageCount = 0;
                    page1Data.QR_LINK = qrImagesData[qrImageCount++];
                    page2Data.QR_LINK = qrImagesData[qrImageCount++];
                    page3Data.QR_LINK = qrImagesData[qrImageCount++];
                    commonData.qrCodeLink = qrCodeData;
                    commonData.generatedOn = this.dateTimeInFormat(null, 1);
                    page1Data.headerMarginTop = extraPageCount * 18;

                    let dynamicData = {
                        headerData: headerData,
                        page1Data: page1Data,
                        page2Data: page2Data,
                        page3Data: page3Data,
                        corData: corData,
                        commonData: commonData,
                        estampPageData: estampPageData,
                        extraPageData: extraPageData,
                        ociPartyData: ociPartyData
                    };

                    let browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                    let page = await browser.newPage();
                    let files = [
                        `${endorsementHtmlFilesPath}page1.hbs`,
                        `${endorsementHtmlFilesPath}page2.hbs`,
                        `${endorsementHtmlFilesPath}page3.hbs`
                    ];
                    if (!reqBody.isPendingDocument) {
                        files.push(`${endorsementHtmlFilesPath}certificateOfRegistration.hbs`,)
                    }
                    if (reqBody.isEstampPaper != null && reqBody.isEstampPaper) files.splice(0, 0, `${endorsementHtmlFilesPath}estampPage.hbs`);

                    if (count < reqBody.pdePageSize)
                        files.push(`${endorsementHtmlFilesPath}extraPage.hbs`);

                    let html = "";
                    files.forEach(file => {
                        html += fs.readFileSync(`${file}`, 'utf-8');
                    })
                    hbs.compile(html)(dynamicData)
                    await page.setContent(hbs.compile(html)(dynamicData));
                    await page.pdf({
                        path: `${endorsementDirectiory}endorsement.pdf`,
                        printBackground: true,
                        format: 'A4',
                        margin: {
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                        },
                    });
                    console.log(`${endorsementDirectiory}endorsement.pdf`)
                    console.log("Done Pdf printing!!");

                    await browser.close();

                    if (fs.existsSync(`${endorsementDirectiory}signedBundledDocument.pdf`)) {
                        fs.unlinkSync(`${endorsementDirectiory}signedBundledDocument.pdf`);
                    }

                    if (fs.existsSync(`${endorsementDirectiory}signedEndorsementDocument.pdf`)) {
                        fs.unlinkSync(`${endorsementDirectiory}signedEndorsementDocument.pdf`);
                    }


                    console.log("CALLING PDE STATUS");

            //let pdeDocumentStatus = await this.pdeDocumentStatus(reqBody.applicationId);
                    let pdeDocumentType = await this.getPdeDocumentType(reqBody.sroCode, reqBody.bookNo, reqBody.registedYear, reqBody.documentNo);
	    let pdeDocumentStatus = await this.pdeDocumentStatus(reqBody.applicationId, pdeDocumentType);

                    console.log("STATUS IS", pdeDocumentStatus);

                    // Status is Executed so generate onle endorsement document
                    if (pdeDocumentStatus == "Executed" || pdeDocumentType == "Physical") {
                        let updateStatusQuery = `UPDATE SROUSER.pde_doc_status_cr SET DOC_ENDORS='Y', ENDORS_TIME_STAMP= SYSDATE WHERE SR_CODE=${reqBody.sroCode} AND BOOK_NO=${reqBody.bookNo} AND DOCT_NO=${reqBody.documentNo} AND REG_YEAR=${reqBody.registedYear}` ?? "";
                        let dataResponse =  await conn.execute(updateStatusQuery, {}, { outFormat: oracleDb.OBJECT });
                        dataResponse = dataResponse.rowsAffected;
                        bitmap = fs.readFileSync(`${endorsementDirectiory}endorsement.pdf`);
                        let convertBase64 = bitmap.toString('base64');
                        //start
                if(dataResponse.rowsAffected > 0) {                         
                    const statusCheckResult = await statusCheck({
                    srCode: reqBody.sroCode,
                    doctNo: reqBody.documentNo,
                    bookNo: reqBody.bookNo,
                    regYear: reqBody.registedYear
                    });
                // console.log("Status Check Results:", statusCheckResult);
                if (statusCheckResult && statusCheckResult.status && statusCheckResult.contactInfo && statusCheckResult.contactInfo.PHONE_NO) {                                
                    const enhancedReqData = {
                        srCode: reqBody.sroCode,
                        doctNo: reqBody.documentNo,
                        bookNo: reqBody.bookNo,
                        regYear: reqBody.registedYear,
                        NAME: statusCheckResult.contactInfo.NAME || "User",
                        PHONE_NO: statusCheckResult.contactInfo.PHONE_NO,
                        APP_ID: statusCheckResult.contactInfo.APP_ID
                    };
                const statusName = "Endorsement";
                // console.log(`Sending notification for current status update: ${statusName}`);
                await sendSMSNotification(enhancedReqData, statusName);
            } else {
                console.log("Contact data not found");
            }
        }                   
        //end
                        return {
                            dataBase64: convertBase64,
                            fileName: `endorsement.pdf`
                        };

                    }

                    // Status is pending so merge the documents
                    return await this.mergeGeneratedDocument(reqBody, `${endorsementDirectiory}endorsement.pdf`, conn);

        } catch (ex) {
            Logger.error("EndorseService - createEndorsementWithFingerPrint || Error :", ex);
            console.error("EndorseService - createEndorsementWithFingerPrint || Error :", ex);
            throw constructCARDError(ex);
        } finally {
            if (conn != null)
                doRelease(conn);
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

    async getPdeDocumentType(sroCode, bookNo, regYear, doctNo) {
        try {
            let query = `Select * from SROUSER.pde_doc_status_cr where SR_CODE=${sroCode} AND BOOK_NO=${bookNo} AND DOCT_NO=${doctNo} AND REG_YEAR=${regYear}`;
            let response = await this.orDao.oDBQueryService(query);
            if(response.length == 0){
                throw new Error("Data not found")
            }
            if(response[0].DOC_TYPE == "P")
                return "Physical";
            return "Online";
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async mergeGeneratedDocument(reqBody, endorsementFilePath, conn) {
        try {
            const headers = {
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJ1c2VySWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJsb2dpbkVtYWlsIjoiIiwibG9naW5OYW1lIjoiU1VESEFLQVIiLCJsb2dpbk1vYmlsZSI6IjkxNjAwNjE4MDAiLCJsb2dpblR5cGUiOiJVU0VSIiwiYWFkaGFyIjowLCJpYXQiOjE2ODQ4NDQ5MjUsImV4cCI6MTY4NDg0NjcyNX0.ZOe8d6YV32aF-Dr6n9DJesWVhU4tEf2tRHUUHVnHkQcnZ1kbhJLrwah7xe79GWSdQDUb7B0N3ZHKSW43U8QdbCLCYnA7ntqWkIxjdu6TbK8z8tDL_naTSFs5CRBXovlYAqNzxhHNXAhk-5xkgdwa0h8XnNZD-R3wfzYYgfSuyz28XMaUbywdxvvuo-CMTqcYeelFE7CVxA97yca9jikIGCn-w6yz4_r194TJcwuJ45SJrI9UoKVWJGl41NV5UI_--DzHyz4caZUcOTGzhD5uRQm-y1ZVtYo_ncR8UkPR4N9GuOzT8meYg2jr8g53cbi4X9gveZwNmYdSuGTrpqdn9cjt4FtFi1kMrENxqVnSGWlaUI2FJi9EDOXD7Pg2yTmStYLhXwKTr5GNct3ZbS74oHfpkX_Fz0IdLNx0_EXyAHvKSoucy8n6A7kabQVD5f5xhmOa8Z5ejNEjl7jBj67FN7i0xavXy4gTy28MeLU-u0Hgo8RisQ66CnbB8GAymwpkU3CYe6p5l6cYvdXPvr90ovz1e6Zsj92r2n8ycihU67UVLZSmaBXUQAhXHrJg5gGlw3_x6IzPr-mre_Cj8oVgU5i9NMKFmn_hBVzA82hcsKC2PYuEL6yAIpATlFVEISrwOypNcB2oiENbZXi64_GLt-ROfK1NWgaERFARo_61kH0',
                'Content-Type': 'application/json'
            };
            // const endorsementFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
            // const endorsementFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
            const blankPdfPath = Path.join(__dirname, `../../pdf/BlankPdf.pdf`);
            console.log(endorsementFilePath);
            if (!fs.existsSync(`${endorsementFilePath}`)) {
                await this.createEndorsement(reqBody);
            }

            let flagsData = await instance({ method: "GET", url: `${process.env.PDE_HOST}/pdeapi/v1/documents/flags/${reqBody.applicationId}`, headers: headers });
            flagsData = flagsData.data.data;
            let documentsUrl = `${process.env.PDE_HOST}/pdeapi/v1/reports/engDocs/N`;
            if (flagsData.docProcessType == "PDEWD") {
                documentsUrl = flagsData.docDownLoadedBy == "E" ? `${process.env.PDE_HOST}/pdeapi/v1/reports/engDocs/N` : `${process.env.PDE_HOST}/pdeapi/v1/reports/telugu/N/pdf`
            } else if (flagsData.docProcessType == "PDE") {
                documentsUrl = flagsData.docDownLoadedBy == "D" ? `${process.env.PDE_HOST}/pdeapi/v1/reports/document/N` : `${process.env.PDE_HOST}/pdeapi/v1/reports/telugu/N/pdf`
            }

            console.log("DOCUMENT URL IS ", documentsUrl);
            let documentResponse = await instance({ method: "GET", url: `${documentsUrl}/${reqBody.applicationId}`, headers: headers })
            let documentsFolderPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
            // let documentsFolderPath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
            let pdeFiePath = `${documentsFolderPath}pdeDocument.pdf`;
            await fs.writeFileSync(pdeFiePath, documentResponse.data.dataBase64, { encoding: 'base64' })
            let dataBuffer1 = fs.readFileSync(pdeFiePath);
            let pdf1Data = await PDFPageCounter(dataBuffer1);
            let dataBuffer2 = fs.readFileSync(endorsementFilePath);
            let pdf2Data = await PDFPageCounter(dataBuffer2);
            let maxPageCount = pdf1Data.numpages > pdf2Data.numpages ? pdf1Data.numpages : pdf2Data.numpages;
            const merger = new PDFMerger();
            for (let i = 1; i <= maxPageCount; i++) {
                pdf1Data.numpages >= i ? await merger.add(pdeFiePath, i) : await merger.add(blankPdfPath, 1);
                pdf2Data.numpages >= i ? await merger.add(endorsementFilePath, i) : await merger.add(blankPdfPath, 1);
            }
            fs.unlinkSync(endorsementFilePath);
            let mergeDocumentPath = `${endorsementFilePath}`;
            await merger.save(mergeDocumentPath);
            let updateStatusQuery = `UPDATE SROUSER.pde_doc_status_cr SET DOC_ENDORS='Y', ENDORS_TIME_STAMP= SYSDATE WHERE SR_CODE=${reqBody.sroCode} AND BOOK_NO=${reqBody.bookNo} AND DOCT_NO=${reqBody.documentNo} AND REG_YEAR=${reqBody.registedYear}` ?? "";
            await conn.execute(updateStatusQuery, {}, { outFormat: oracleDb.OBJECT });
            let bitmap = fs.readFileSync(mergeDocumentPath);
            let convertBase64 = bitmap.toString('base64');
            return {
                dataBase64: convertBase64
            };

        } catch (ex) {
            Logger.error("EndorseService - createBundlingDocument || Error :", ex);
            console.error("EndorseService - createBundlingDocument || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    async createCertificateOfRegistration(reqBody) {
        let conn;
        try {
            conn = await oracleDb.getConnection(dbConfig)
            console.log("CONN IS ", conn);
            let endorsementDirectiory = Path.join(__dirname, `../../../../../pdfs/`);
            // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}/uploads/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.sroCode}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.bookNo}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.documentNo}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.registedYear}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }

            const endorsementHtmlFilesPath = Path.join(__dirname, `../reports/`);
            const assetsPath = Path.join(__dirname, `../../assets/`);

            let srMasterQuery = `select * from sr_master where sr_cd = ${reqBody.sroCode}`;
            let srMasterDbReponse = await conn.execute(srMasterQuery, {}, { outFormat: oracleDb.OBJECT });
            srMasterDbReponse = srMasterDbReponse.rows;

            let registrationDetailsQuery = `select * FROM TRAN_MAJOR where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
            let registrationDetailsDbReponse = await conn.execute(registrationDetailsQuery, {}, { outFormat: oracleDb.OBJECT });
            registrationDetailsDbReponse = registrationDetailsDbReponse.rows;

            if (registrationDetailsDbReponse.length == 0) {
                registrationDetailsDbReponse = [{
                    type: "DUMMY",
                    RF_PAYABLE: 0
                }];
            }


            let bitmap = fs.readFileSync(`${assetsPath}OfficialLogo.png`);
            let logoBase64 = bitmap.toString('base64');
            bitmap = fs.readFileSync(`${assetsPath}Approved.png`);
            let stampBase64 = bitmap.toString('base64');
            bitmap = fs.readFileSync(`${assetsPath}OfficialSeal.png`);
            let officialSealBase64 = bitmap.toString('base64');

            let headerData = {
                logoLinkImage: logoBase64,
                bookNo: reqBody.bookNo,
                csNo: reqBody.documentNo,
                year: reqBody.registedYear,
                registrarType: reqBody.registrarType,
                doctNo: registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RDOCT_NO,
                rYear: registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RYEAR,
                scannedDate: this.dateTimeInFormat(registrationDetailsDbReponse[0].FST_SCAN_DATE, 2)
            };

            let commonData = {
                bookNo: reqBody.bookNo,
                sroCode: reqBody.sroCode,
                sroData: srMasterDbReponse[0],
                registrarType: reqBody.registrarType,
                registrarName: reqBody.registrarName,
                stampImageLink: stampBase64,
                officialSealLink: officialSealBase64
            };

            let page3Data = {
                registartionDetails: {
                    rDoctNo: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RDOCT_NO : "",
                    year: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RYEAR : ""
                }

            };

            let qrCodeData = await QRCode.toDataURL(`${process.env.IP_ADDRESS}/files/${commonData.sroCode}/${commonData.bookNo}/${page3Data.registartionDetails.rDoctNo}/${page3Data.registartionDetails.year}/endorsement.pdf`);
            commonData.qrCodeLink = qrCodeData;
            commonData.generatedOn = this.dateTimeInFormat(null, 1);
            let section47 = false;
            let section47AStampDuty = 0;
            let section47PartyName = ''
            let section47aReceiptDate = '';
            try {
                let sec47AStampDutyDetailsQuery = `
                    SELECT SUM(NVL(AMOUNT_BY_ONLINE,0)) ONLINE_VAL, SUM(NVL(AMOUNT,0)) CASH_VAL, SUM(NVL(AMOUNT_BY_SHC,0)) SHC_VAL, SUM(NVL(AMOUNT_BY_CHALLAN,0)) CHALLAN_VAL, b.party_name, a.receipt_date
                    FROM CASH_PAID a,cash_det b WHERE ACCOUNT_CODE=7 and a.sr_code = :SR_CODE and a.book_no = :BOOK_NO and a.doct_no= :DOCT_NO and a.reg_year= :REG_YEAR
                    and a.sr_code=b.sr_code and a.book_no=b.book_no and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.C_RECEIPT_NO=b.C_RECEIPT_NO and b.C_RECEIPT_NO IN (
                    WITH numbers AS (
                        SELECT LEVEL AS n
                        FROM dual
                        CONNECT BY LEVEL <= 100
                    )
                    SELECT TRIM(REGEXP_SUBSTR(mis_receipt_no, '[^,]+', 1, numbers.n)) AS mis_receipt_no
                    FROM srouser.tran_section_47a
                    JOIN numbers ON numbers.n <= LENGTH(mis_receipt_no) - LENGTH(REPLACE(mis_receipt_no, ',', '')) + 1
                    WHERE sr_code = a.sr_code
                    AND doct_no = a.doct_no
                    AND reg_year = a.reg_year
                    AND book_no = a.book_no
                    ) and b.ACC_CANC<>'C'
                    group by b.party_name, a.receipt_date
                    order by a.receipt_date desc
                `;
                const bindParams = {
                    SR_CODE : reqBody.sroCode,
                    DOCT_NO : reqBody.documentNo,
                    REG_YEAR : reqBody.registedYear,
                    BOOK_NO : reqBody.bookNo
                    }
                let section47CashQueryDbReponse = await conn.execute(sec47AStampDutyDetailsQuery, bindParams, { outFormat: oracleDb.OBJECT });
                section47CashQueryDbReponse = section47CashQueryDbReponse.rows;
                if (section47CashQueryDbReponse.length > 0) {
                    section47AStampDuty = section47CashQueryDbReponse.reduce((total, item) => total + item.ONLINE_VAL + item.CASH_VAL + item.SHC_VAL + item.CHALLAN_VAL,0);                      
                    section47 = true;
                    section47PartyName = section47CashQueryDbReponse[0].PARTY_NAME;
                    section47aReceiptDate = moment(section47CashQueryDbReponse[0].RECEIPT_DATE).format('DD/MM/YYYY');
                }
            } catch (error) {
                console.log("Error in getting section 47A data", error);
            }
            const sec47aData = {
                section47 : section47,
                section47AStampDuty : section47AStampDuty,
                section47PartyName : section47PartyName,
                section47aReceiptDate : section47aReceiptDate
            }
            let browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            let page = await browser.newPage();
            let files = [
                `${endorsementHtmlFilesPath}certificateOfRegistration.hbs`
            ];

            let dynamicData = {
                headerData: headerData,
                page3Data: page3Data,
                commonData: commonData,
                sec47aData : sec47aData
            };

            let html = "";
            files.forEach(file => {
                html += fs.readFileSync(`${file}`, 'utf-8');
            })
            hbs.compile(html)(dynamicData)
            await page.setContent(hbs.compile(html)(dynamicData));
            await page.pdf({
                path: `${endorsementDirectiory}certificateOfRegistration.pdf`,
                printBackground: true,
                format: 'A4',
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            });
            console.log(`${endorsementDirectiory}certificateOfRegistration.pdf`)
            await browser.close();

            bitmap = fs.readFileSync(`${endorsementDirectiory}certificateOfRegistration.pdf`);
            let convertBase64 = bitmap.toString('base64');
            return {
                dataBase64: convertBase64,
                fileName: `certificateOfRegistration.pdf`
            };

        } catch (err) {
            Logger.error("EndorseService - createCertificateOfRegistration || Error :", err);
            console.error("EndorseService - createCertificateOfRegistration || Error :", err);
            throw constructCARDError(err);
        } finally {
            if (conn != null)
                doRelease(conn);
        }
    }

    async createRefusalCertificateOfRegistration(reqBody) {
        let conn;
        try {
            conn = await oracleDb.getConnection(dbConfig)
            console.log("CONN IS ", conn);
            let endorsementDirectiory = Path.join(__dirname, `../../../../../pdfs/`);
            // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}/uploads/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.sroCode}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.bookNo}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.documentNo}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.registedYear}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }

            const endorsementHtmlFilesPath = Path.join(__dirname, `../reports/refusalCor/`);
            const assetsPath = Path.join(__dirname, `../../assets/`);
            let tranEcQuery = `SELECT * From srouser.tran_ec_parties_cr_refuse a,srouser.tran_ec_aadhar_esign_refusal b where ` +
                `a.sr_code=${reqBody.sroCode} and a.book_no=${reqBody.bookNo} and a.doct_no=${reqBody.documentNo} and a.reg_year=${reqBody.registedYear} and ` +
                `a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.book_no = b.book_no and a.ec_number = b.ec_number and a.aadhar = b.aadhar and substr(a.code, 1, 2) = substr(b.code, 1, 2) and rownum<=200`
            // let tranEcQuery = `Select a.*, b.photo from SROUSER.tran_ec a, SROUSER.tran_ec_aadhar_esign b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} `+
            // `and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year `+
            // `and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number order by a.code DESC, a.ec_number ASC`;
            let tranEcOracleDbResponse = await conn.execute(tranEcQuery, {}, { outFormat: oracleDb.OBJECT });
            tranEcOracleDbResponse = tranEcOracleDbResponse.rows;

            if (tranEcOracleDbResponse == null)
                tranEcOracleDbResponse = []
            // if (tranEcOracleDbResponse.length < 2) {
            //     let tranEcOracleDbDummyResponse = {
            //         type: "DUMMY"
            //     };
            //     for (let i = tranEcOracleDbResponse.length; i < 2; i++) {
            //         tranEcOracleDbResponse.push(tranEcOracleDbDummyResponse);
            //     }
            // }

            // let tranEcFingerQuery = `Select a.*, b.finger from SROUSER.tran_ec a, PHOTOFP.tran_ec_photos b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} `+
            // `and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year `+
            // `and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number`;
            let tranEcFingerQuery = `Select a.*, b.finger from srouser.tran_ec_parties_cr_refuse a, PHOTOFP.tran_ec_photos_refusal b  where a.sr_code = ${reqBody.sroCode} and a.doct_no = ${reqBody.documentNo} ` +
                `and a.reg_year = ${reqBody.registedYear} and a.book_no = ${reqBody.bookNo} and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year ` +
                `and a.book_no = b.book_no and a.code = b.code and a.ec_number = b.ec_number`;
            let tranEcFingerOracleDbResponse = await conn.execute(tranEcFingerQuery, {}, { outFormat: oracleDb.OBJECT });
            tranEcFingerOracleDbResponse = tranEcFingerOracleDbResponse.rows;



            await tranEcOracleDbResponse.map(async element => {
                // if (element.CODE)
                //     element.CODE = element.CODE.substr(0, 2);
                element.MASKED_AADHAR = this.maskAadharString(element.AADHAR);
                element.THUMB_PHOTO = null;
                if (element.PHOTO != null && element.PHOTO != "(BLOB)") {
                    let bufferBase64 = new Buffer.from(element.PHOTO).toString('base64');
                    element.PHOTO_URL = bufferBase64;
                }
                for (let tranEcFingerOracleDbRow of tranEcFingerOracleDbResponse) {
                    if (tranEcFingerOracleDbRow.CODE == element.CODE && tranEcFingerOracleDbRow.EC_NUMBER == element.EC_NUMBER) {
                        element.THUMB_PHOTO = tranEcFingerOracleDbRow.FINGER;
                        break;
                    }
                }
                if (element.THUMB_PHOTO != null && element.THUMB_PHOTO != "(BLOB)") {
                    let bufferBase64 = new Buffer.from(element.THUMB_PHOTO).toString('base64');
                    element.THUMB_PHOTO = bufferBase64;
                }
            })
            console.log("AFTER")

            let tranEcWitnessQuery = `Select * from PHOTOFP.TRAN_EC_WITNESS_PHOTOS_REFUSAL where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and reg_year = ${reqBody.registedYear} and book_no = ${reqBody.bookNo} order by WITNESS_NUMBER`;
            let tranEcWitnessDbResponse = await conn.execute(tranEcWitnessQuery, {}, { outFormat: oracleDb.OBJECT });
            tranEcWitnessDbResponse = tranEcWitnessDbResponse.rows;

            if (tranEcWitnessDbResponse == null)
                tranEcWitnessDbResponse = [];
            if (tranEcWitnessDbResponse.length < 2) {
                let tranEcWitnessDbDummyResponse = {
                    type: "DUMMY"
                };
                for (let i = tranEcWitnessDbResponse.length; i < 2; i++) {
                    tranEcWitnessDbResponse.push(tranEcWitnessDbDummyResponse);
                }
            }

            tranEcWitnessDbResponse = tranEcWitnessDbResponse.slice(0, 2);

            await tranEcWitnessDbResponse.map(async element => {
                element.MASKED_AADHAR = this.maskAadharString(element.AADHAR);
                if (element.PHOTO != null && element.PHOTO != "(BLOB)") {
                    let bufferBase64 = new Buffer.from(element.PHOTO).toString('base64');
                    element.PHOTO_URL = bufferBase64;
                }
                if (element.FINGER != null && element.FINGER != "(BLOB)") {
                    let bufferBase64 = new Buffer.from(element.FINGER).toString('base64');
                    element.THUMB_PHOTO = bufferBase64;
                }
            })

            let tranRefuseQuery = `select * from srouser.tran_refuse where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and reg_year = ${reqBody.registedYear} and book_no = ${reqBody.bookNo}`;
            let tranRefuseResponse = await conn.execute(tranRefuseQuery, {}, { outFormat: oracleDb.OBJECT });
            tranRefuseResponse = tranRefuseResponse.rows;

            let orderNo = tranRefuseResponse.length > 0 ? tranRefuseResponse[0].PR_NO : '';
            let orderDate = tranRefuseResponse.length > 0 ? this.dateTimeInFormat(tranRefuseResponse[0].PR_DT, 3) : '';



            let srMasterQuery = `select * from sr_master where sr_cd = ${reqBody.sroCode}`;
            let srMasterDbReponse = await conn.execute(srMasterQuery, {}, { outFormat: oracleDb.OBJECT });
            srMasterDbReponse = srMasterDbReponse.rows;

            let registrationDetailsQuery = `select * FROM TRAN_MAJOR where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
            let registrationDetailsDbReponse = await conn.execute(registrationDetailsQuery, {}, { outFormat: oracleDb.OBJECT });
            registrationDetailsDbReponse = registrationDetailsDbReponse.rows;

            if (registrationDetailsDbReponse.length == 0) {
                registrationDetailsDbReponse = [{
                    type: "DUMMY"
                }];
            }

            reqBody.pdePageSize = 0;


            let bitmap = fs.readFileSync(`${assetsPath}OfficialLogo.png`);
            let logoBase64 = bitmap.toString('base64');
            bitmap = fs.readFileSync(`${assetsPath}Approved.png`);
            let stampBase64 = bitmap.toString('base64');
            bitmap = fs.readFileSync(`${assetsPath}OfficialSeal.png`);
            let officialSealBase64 = bitmap.toString('base64');

            let headerData = {
                logoLinkImage: logoBase64,
                bookNo: reqBody.bookNo,
                csNo: reqBody.documentNo.toString(),
                year: reqBody.registedYear,
                notPending: [1],
                pendingDocument:  [],
                registrarType: reqBody.registrarType,
                doctNo: registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RDOCT_NO,
                rYear: reqBody.isPendingDocument ? reqBody.registedYear : registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0 ? "" : registrationDetailsDbReponse[0].RYEAR,
                totalPageCount: 2,
                scannedDate: this.dateTimeInFormat(registrationDetailsDbReponse[0].FST_SCAN_DATE, 2)
            };

            let commonData = {
                bookNo: reqBody.bookNo,
                sroCode: reqBody.sroCode,
                sroData: srMasterDbReponse[0],
                registrarType: reqBody.registrarType,
                registrarName: reqBody.registrarName,
                stampImageLink: stampBase64,
                officialSealLink: officialSealBase64,
                orderNo: orderNo,
                orderDate: orderDate
            };

            let page1Data = {
                presenterData: [], 
                emptySpaces: []
            };

            if (tranEcOracleDbResponse.length == 0) {
                page1Data.emptySpaces.push(1);
                page1Data.emptySpaces.push(2);
            } else if (tranEcOracleDbResponse.length == 1) {
                page1Data.emptySpaces.push(1);
            }

            let page2Data = {
                witnessPageData: tranEcWitnessDbResponse,
            };
            
            let executantsClaimantsPageData = [];

            for (let i = 0; i < 1 && i < tranEcOracleDbResponse.length; i++) {
                executantsClaimantsPageData[i] = tranEcOracleDbResponse[i];
                console.log(executantsClaimantsPageData.length);
                await this.insertRefusalEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[i], 2 ,  "55,430,50,100");
            }

            page1Data.presenterData.push(executantsClaimantsPageData[0]);
            // executantsClaimantsPageData[0] = tranEcOracleDbResponse[0];
            // executantsClaimantsPageData[1] = tranEcOracleDbResponse[1];


            // await this.insertEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[0], 2 + extraPageCount * 2, "60,430,50,100");
            // await this.insertEndorsementCoordinates(conn, reqBody, executantsClaimantsPageData[1], 2 + extraPageCount * 2, "60,250,50,100");

           
            let count = 2;
           


            await this.insertRefusalEndorsementCoordinates(conn, reqBody, tranEcWitnessDbResponse[0], count * 2, "55,480,50,100");
            await this.insertRefusalEndorsementCoordinates(conn, reqBody, tranEcWitnessDbResponse[1], count * 2, "55,300,50,100");
            count++;

            let page3Data = {
                registartionDetails: {
                    rDoctNo: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RDOCT_NO : "",
                    doctNo: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].DOCTNO : "",
                    year: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RYEAR : "",
                    date: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RDATE : ""
                },
            };

           
            let qrCodeData = await QRCode.toDataURL(`${process.env.IP_ADDRESS}:${process.env.PORT}/files/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
            let splitQrCodeData = await QRCode.toDataURL(`${process.env.IP_ADDRESS}:${process.env.PORT}/files/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/signedEndorsementDocument.pdf`)
            // let qrImagesData = await this.splitImages(splitQrCodeData);
            // let qrImageCount = 0;
            // page1Data.QR_LINK = qrImagesData[qrImageCount++];
            // page2Data.QR_LINK = qrImagesData[qrImageCount++];
            commonData.qrCodeLink = qrCodeData;
            commonData.generatedOn = this.dateTimeInFormat(null, 1);
            page1Data.headerMarginTop = 0 * 18;


            let dynamicData = {
                headerData: headerData,
                page1Data: page1Data,
                page2Data: page2Data,
                page3Data: page3Data,
                commonData: commonData
            };

            let browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            let page = await browser.newPage();
            let files = [
                `${endorsementHtmlFilesPath}page1.hbs`,
                `${endorsementHtmlFilesPath}page2.hbs`
            ];

            let html = "";
            files.forEach(file => {
                html += fs.readFileSync(`${file}`, 'utf-8');
            })

            await page.setContent(hbs.compile(html)(dynamicData));
            await page.pdf({
                path: `${endorsementDirectiory}refusalCor.pdf`,
                printBackground: true,
                format: 'A4',
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            });

            console.log("Done Pdf printing!!", `${endorsementDirectiory}refusalCor.pdf`);

            await browser.close();

            if (fs.existsSync(`${endorsementDirectiory}signedRefusalCor.pdf`)) {
                fs.unlinkSync(`${endorsementDirectiory}signedRefusalCor.pdf`);
            }

            let updateStatusQuery = `UPDATE SROUSER.pde_doc_status_cr SET doc_rcors='Y' WHERE SR_CODE=${reqBody.sroCode} AND BOOK_NO=${reqBody.bookNo} AND DOCT_NO=${reqBody.documentNo} AND REG_YEAR=${reqBody.registedYear}` ?? "";
            await conn.execute(updateStatusQuery, {}, { outFormat: oracleDb.OBJECT });
            bitmap = fs.readFileSync(`${endorsementDirectiory}refusalCor.pdf`);
            let convertBase64 = bitmap.toString('base64');
            return {
                dataBase64: convertBase64,
                fileName: `refusalCor.pdf`
            };



        } catch (ex) {
            Logger.error("EndorseService - createRefusalCertificateOfRegistration || Error :", ex);
            console.error("EndorseService - createRefusalCertificateOfRegistration || Error :", ex);
            throw constructCARDError(ex);
        } finally {
            if (conn != null)
                doRelease(conn);
        }
    }


    async createReportDocument(reqBody) {
        let conn;
        try {
            const headers = {
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJ1c2VySWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJsb2dpbkVtYWlsIjoiIiwibG9naW5OYW1lIjoiU1VESEFLQVIiLCJsb2dpbk1vYmlsZSI6IjkxNjAwNjE4MDAiLCJsb2dpblR5cGUiOiJVU0VSIiwiYWFkaGFyIjowLCJpYXQiOjE2ODQ4NDQ5MjUsImV4cCI6MTY4NDg0NjcyNX0.ZOe8d6YV32aF-Dr6n9DJesWVhU4tEf2tRHUUHVnHkQcnZ1kbhJLrwah7xe79GWSdQDUb7B0N3ZHKSW43U8QdbCLCYnA7ntqWkIxjdu6TbK8z8tDL_naTSFs5CRBXovlYAqNzxhHNXAhk-5xkgdwa0h8XnNZD-R3wfzYYgfSuyz28XMaUbywdxvvuo-CMTqcYeelFE7CVxA97yca9jikIGCn-w6yz4_r194TJcwuJ45SJrI9UoKVWJGl41NV5UI_--DzHyz4caZUcOTGzhD5uRQm-y1ZVtYo_ncR8UkPR4N9GuOzT8meYg2jr8g53cbi4X9gveZwNmYdSuGTrpqdn9cjt4FtFi1kMrENxqVnSGWlaUI2FJi9EDOXD7Pg2yTmStYLhXwKTr5GNct3ZbS74oHfpkX_Fz0IdLNx0_EXyAHvKSoucy8n6A7kabQVD5f5xhmOa8Z5ejNEjl7jBj67FN7i0xavXy4gTy28MeLU-u0Hgo8RisQ66CnbB8GAymwpkU3CYe6p5l6cYvdXPvr90ovz1e6Zsj92r2n8ycihU67UVLZSmaBXUQAhXHrJg5gGlw3_x6IzPr-mre_Cj8oVgU5i9NMKFmn_hBVzA82hcsKC2PYuEL6yAIpATlFVEISrwOypNcB2oiENbZXi64_GLt-ROfK1NWgaERFARo_61kH0',
                'Content-Type': 'application/json'
            };
            const folderPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
            // const folderPath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
            let pdeStatus = await this.pdeDocumentStatus(reqBody.applicationId);
            let mergedDocumentPath = folderPath + 'signedEndorsementDocument.pdf';
            let pdeDocumentType = await this.getPdeDocumentType(reqBody.sroCode, reqBody.bookNo, reqBody.registedYear, reqBody.documentNo);
            if (pdeStatus == 'Executed' || pdeDocumentType == "Physical") {
                const blankPdfPath = Path.join(__dirname,  `../../pdf/BlankPdf.pdf`);
                mergedDocumentPath = folderPath + 'mergedDocument.pdf';
                let pdeFiePath = `${folderPath}pdeDocument.pdf`;;
                if (pdeDocumentType == "Online") {
                    let documentResponse = await instance({ method: "GET", url: `${process.env.PDE_HOST}/pdeapi/v1/documents/signed/${reqBody.applicationId}`, headers: headers });
                    await fs.writeFileSync(pdeFiePath, documentResponse.data.dataBase64, { encoding: 'base64' });
                } else {

                    let docLocationQuery = `select Location from scanuser.img_base_cca where sro_code = ${reqBody.sroCode} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and doct_no = ${reqBody.documentNo}`;
                    let docLocationReponse = await this.orDao.oDBQueryService(docLocationQuery);
                    if(docLocationReponse.length == 0){
                        throw new Error("File Location Not Present");
                    }
                    let url = docLocationReponse.split('.pdf')[0].split('');
                    url = url.reverse().join('').replaceAll('/', '@');
                    console.log("URL IS ", url);

                    await this.downloadFile(url, pdeFiePath);
                }
                let dataBuffer1 = fs.readFileSync(pdeFiePath);
                let pdf1Data = await PDFPageCounter(dataBuffer1);
                let signedEndorsementFilePath = folderPath + 'signedEndorsementDocument.pdf';
                let dataBuffer2 = fs.readFileSync(signedEndorsementFilePath);
                let pdf2Data = await PDFPageCounter(dataBuffer2);
                let maxPageCount = pdf1Data.numpages > pdf2Data.numpages ? pdf1Data.numpages : pdf2Data.numpages;
                let merger = new PDFMerger();
                for (let i = 1; i <= maxPageCount; i++) {
                    pdf1Data.numpages >= i ? await merger.add(pdeFiePath, i) : await merger.add(blankPdfPath, 1);
                    pdf2Data.numpages >= i ? await merger.add(signedEndorsementFilePath, i) : await merger.add(blankPdfPath, 1);
                }
                await merger.save(mergedDocumentPath);
            }

            let corPath = folderPath + 'certificateOfRegistration.pdf';

            let filesDirectiory = Path.join(__dirname, `../../../../../pdfs/`);
            // let filesDirectiory = Path.join(__dirname, `../../public/`);
            if (!fs.existsSync(filesDirectiory)) {
                fs.mkdirSync(filesDirectiory, { recursive: true });
            }
            filesDirectiory = `${filesDirectiory}/uploads/`;
            if (!fs.existsSync(filesDirectiory)) {
                fs.mkdirSync(filesDirectiory, { recursive: true });
            }
            filesDirectiory = `${filesDirectiory}/${reqBody.applicationId}/`;
            if (!fs.existsSync(filesDirectiory)) {
                fs.mkdirSync(filesDirectiory, { recursive: true });
            }

            let consolidatedDocumentPath = filesDirectiory + 'consolidatedDocument.pdf';

            let merger = new PDFMerger();
            await merger.add(mergedDocumentPath);

            if (fs.existsSync(`${corPath}`)) {
                await merger.add(corPath);
            }

            await merger.save(consolidatedDocumentPath);
            console.log(consolidatedDocumentPath)


            let bitmap = fs.readFileSync(consolidatedDocumentPath);
            let convertBase64 = bitmap.toString('base64');
            return {
                dataBase64: convertBase64,
                fileName: `consolidatedDocument.pdf`
            };

        } catch (ex) {
            Logger.error("EndorseService - createReportDocument || Error :", ex);
            console.error("EndorseService - createReportDocument || Error :", ex);
            throw constructCARDError(ex);
        } finally {
            if (conn != null)
                doRelease(conn);
        }
    }

    async downloadFile(fileUrl , outputLocationPath ) {
        console.log("FILE PATH IS ", outputLocationPath);
        const writer = fs.createWriteStream(outputLocationPath);
      
        return axios({
          method: 'get',
          url: fileUrl,
          responseType: 'stream',
        }).then(response => {
      
          //ensure that the user can call `then()` only when the file has
          //been downloaded entirely.
      
          return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                console.log("ERROR IS ", err)
              error = err;
              writer.close();
              reject(err);
            });
            writer.on('close', () => {
                console.log("ON CLOSE")
              if (!error) {
                resolve(true);
              }
              //no need to call the reject here, as it will have been called in the
              //'error' stream;
            });
          });
        });
      }

    async createBundlingDocument(reqBody) {
        let conn;
        try {
            const headers = {
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJ1c2VySWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJsb2dpbkVtYWlsIjoiIiwibG9naW5OYW1lIjoiU1VESEFLQVIiLCJsb2dpbk1vYmlsZSI6IjkxNjAwNjE4MDAiLCJsb2dpblR5cGUiOiJVU0VSIiwiYWFkaGFyIjowLCJpYXQiOjE2ODQ4NDQ5MjUsImV4cCI6MTY4NDg0NjcyNX0.ZOe8d6YV32aF-Dr6n9DJesWVhU4tEf2tRHUUHVnHkQcnZ1kbhJLrwah7xe79GWSdQDUb7B0N3ZHKSW43U8QdbCLCYnA7ntqWkIxjdu6TbK8z8tDL_naTSFs5CRBXovlYAqNzxhHNXAhk-5xkgdwa0h8XnNZD-R3wfzYYgfSuyz28XMaUbywdxvvuo-CMTqcYeelFE7CVxA97yca9jikIGCn-w6yz4_r194TJcwuJ45SJrI9UoKVWJGl41NV5UI_--DzHyz4caZUcOTGzhD5uRQm-y1ZVtYo_ncR8UkPR4N9GuOzT8meYg2jr8g53cbi4X9gveZwNmYdSuGTrpqdn9cjt4FtFi1kMrENxqVnSGWlaUI2FJi9EDOXD7Pg2yTmStYLhXwKTr5GNct3ZbS74oHfpkX_Fz0IdLNx0_EXyAHvKSoucy8n6A7kabQVD5f5xhmOa8Z5ejNEjl7jBj67FN7i0xavXy4gTy28MeLU-u0Hgo8RisQ66CnbB8GAymwpkU3CYe6p5l6cYvdXPvr90ovz1e6Zsj92r2n8ycihU67UVLZSmaBXUQAhXHrJg5gGlw3_x6IzPr-mre_Cj8oVgU5i9NMKFmn_hBVzA82hcsKC2PYuEL6yAIpATlFVEISrwOypNcB2oiENbZXi64_GLt-ROfK1NWgaERFARo_61kH0',
                'Content-Type': 'application/json'
            };
            const endorsementFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
            // const endorsementFilePath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/endorsement.pdf`);
            const blankPdfPath = Path.join(__dirname,  `../../pdf/BlankPdf.pdf`);
            console.log(endorsementFilePath);
            if (!fs.existsSync(`${endorsementFilePath}`)) {
                await this.createEndorsement(reqBody);
            }

            let flagsData = await instance({ method: "GET", url: `${process.env.PDE_HOST}/pdeapi/v1/documents/flags/${reqBody.applicationId}`, headers: headers });
            flagsData = flagsData.data.data;
            let documentsUrl = `${process.env.PDE_HOST}/pdeapi/v1/reports/engDocs/N`;
            if (flagsData.docProcessType == "PDEWD") {
                documentsUrl = flagsData.docDownLoadedBy == "E" ? `${process.env.PDE_HOST}/pdeapi/v1/reports/engDocs/N` : `${process.env.PDE_HOST}/pdeapi/v1/reports/telugu/N/pdf`
            } else if (flagsData.docProcessType == "PDE") {
                documentsUrl = flagsData.docDownLoadedBy == "D" ? `${process.env.PDE_HOST}/pdeapi/v1/reports/document/N` : `${process.env.PDE_HOST}/pdeapi/v1/reports/telugu/N/pdf`
            }

            console.log("DOCUMENT URL IS ", documentsUrl);
            let documentResponse = await instance({ method: "GET", url: `${documentsUrl}/${reqBody.applicationId}`, headers: headers })
            let documentsFolderPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
            // let documentsFolderPath = Path.join(__dirname, `../../public/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
            let pdeFiePath = `${documentsFolderPath}pdeDocument.pdf`;
            await fs.writeFileSync(pdeFiePath, documentResponse.data.dataBase64, { encoding: 'base64' })
            let dataBuffer1 = fs.readFileSync(pdeFiePath);
            let pdf1Data = await PDFPageCounter(dataBuffer1);
            let dataBuffer2 = fs.readFileSync(endorsementFilePath);
            let pdf2Data = await PDFPageCounter(dataBuffer2);
            let maxPageCount = pdf1Data.numpages > pdf2Data.numpages ? pdf1Data.numpages : pdf2Data.numpages;
            const merger = new PDFMerger();
            for (let i = 1; i <= maxPageCount; i++) {
                pdf1Data.numpages >= i ? await merger.add(pdeFiePath, i) : await merger.add(blankPdfPath, 1);
                pdf2Data.numpages >= i ? await merger.add(endorsementFilePath, i) : await merger.add(blankPdfPath, 1);
            }
            let mergeDocumentPath = `${documentsFolderPath}bundledDocument.pdf`;
            await merger.save(mergeDocumentPath);
            let bitmap = fs.readFileSync(mergeDocumentPath);
            let convertBase64 = bitmap.toString('base64');
            return {
                dataBase64: convertBase64,
                fileName: `bundledDocument.pdf`
            };

        } catch (ex) {
            Logger.error("EndorseService - createBundlingDocument || Error :", ex);
            console.error("EndorseService - createBundlingDocument || Error :", ex);
            throw constructCARDError(ex);
        } finally {
            if (conn != null)
                doRelease(conn);
        }
    }

    async saveScannedDocument(reqBody) {
        let conn;
        try {
            conn = await oracleDb.getConnection(dbConfig)
            console.log("CONN IS ", conn);
            let endorsementDirectiory = Path.join(__dirname, `../../../../../pdfs/`);
            // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}/uploads/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.sroCode}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.bookNo}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.documentNo}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            endorsementDirectiory = `${endorsementDirectiory}${reqBody.registedYear}/`;
            if (!fs.existsSync(endorsementDirectiory)) {
                fs.mkdirSync(endorsementDirectiory, { recursive: true });
            }
            const scannedFinalDocumentPath = `${endorsementDirectiory}scannedFinalDocument.pdf`;
            await fs.writeFileSync(scannedFinalDocumentPath, reqBody.scannedDocument, { encoding: 'base64' });
            let registrationDetailsQuery = `select * FROM TRAN_MAJOR where sr_code = ${reqBody.sroCode} AND book_no = ${reqBody.bookNo} AND doct_no = ${reqBody.documentNo} AND reg_year = ${reqBody.registedYear}`;
            let registrationDetailsDbReponse = await conn.execute(registrationDetailsQuery, {}, { outFormat: oracleDb.OBJECT });
            registrationDetailsDbReponse = registrationDetailsDbReponse.rows;
            if (registrationDetailsDbReponse == null || registrationDetailsDbReponse.length == 0) {
                throw Error('Registartion Details are not found');
            }

            let data = {
                sroCode: reqBody.sroCode,
                bookNo: reqBody.bookNo,
                documentNo: reqBody.documentNo,
                registedYear: reqBody.registedYear
            }

            let configData = fs.readFileSync('../../../../../pdfs/CardConfigs.json', 'utf8');
            configData = JSON.parse(configData);
            console.log("CONFIG DATA IS ", JSON.stringify(configData));

            let AppIDQuery = `SELECT * FROM PDE_DOC_STATUS_CR  WHERE sr_code = :sroCode AND book_no = :bookNo AND doct_no = :documentNo AND reg_year = :registedYear`;
            let APPIDResponse = await conn.execute(AppIDQuery, data, { outFormat: oracleDb.OBJECT });
            APPIDResponse = APPIDResponse.rows || [];
            let tempAPPID =
                String(data.registedYear).substring(2, 4) +
                String(data.sroCode).padStart(4, '0') +
                String(data.bookNo) +
                String(data.documentNo).padStart(6, '0') +
                String(data.registedYear).substring(1, 4);
            if (APPIDResponse[0].APP_ID !== tempAPPID) {
            if(configData.verifyScannedDocument){
                // Verify the QR Code Match
                let verifyFile = await this.verifyScannedDocument(data, scannedFinalDocumentPath);
                console.log("VERIFY DATA : ", verifyFile);
                if (!verifyFile) {
                    fs.unlinkSync(scannedFinalDocumentPath)
                    throw new Error('Selected CS number and inserted document are not the same');
                }
                }
            }

            data = {
                sroCode: reqBody.sroCode,
                bookNo: reqBody.bookNo,
                documentNo: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RDOCT_NO : "",
                registedYear: registrationDetailsDbReponse != null && registrationDetailsDbReponse.length > 0 ? registrationDetailsDbReponse[0].RYEAR : ""
            }

            let compressedScannedFinalDocument = `${endorsementDirectiory}compressedScannedFinalDocument.pdf`;
            let originalScannedFinalDocument = `${endorsementDirectiory}originalScannedDocument.pdf`;
            let usersPageCount = await this.getUsersPageCount(reqBody);
            if (usersPageCount != 0) {
                await this.createCompressedDocument(scannedFinalDocumentPath, originalScannedFinalDocument, compressedScannedFinalDocument, usersPageCount);
            }

            let dataBuffer1 = fs.readFileSync(scannedFinalDocumentPath);
            let pdf1Data = await PDFPageCounter(dataBuffer1);
            const stats = fs.statSync(scannedFinalDocumentPath);            
            let imgBaseCcaDbInsertQuery = `INSERT INTO SCANUSER.IMG_BASE_CCA (SRO_CODE, BOOK_NO, DOCT_NO, REG_YEAR, DOCT_ID, IMAGE, FILE_SIZE, CD_VOL_NO, RDOCT_NO, RYEAR, SIGNED, SIGNEDBY, SIGNEDDATE, PAGECNT, SCAN_DATE, SCAN_BY, LOCATION, RESIGN_CNT, SIGN_TYPE, SIGN_DEVICE, BIO_AUTH_BY) values (${reqBody.sroCode}, ${reqBody.bookNo}, ${reqBody.documentNo}, ${reqBody.registedYear}, null, :blobData, ${stats.size}, null, ${data.documentNo}, ${data.registedYear}, 'N', null, null, ${pdf1Data.numpages}, SYSDATE, '${reqBody.scanBy}', null, null, null, null, null)`;
            let convertBase64 = dataBuffer1.toString('base64');
            let base64 = Buffer.from(convertBase64, 'base64');
            console.log("QEURY IS ", imgBaseCcaDbInsertQuery);
            let response = await this.orDao.oDbInsertBlobDocs(imgBaseCcaDbInsertQuery, base64);            
            return response;

        } catch (err) {
            Logger.error("EndorseService - saveScannedDocument || Error :", err);
            console.error("EndorseService - saveScannedDocument || Error :", err);
            throw constructCARDError(err);
        } finally {
            if (conn != null)
                doRelease(conn);
        }
    }

    async verifyScannedDocument(reqBody, pdfPath) {
        return new Promise(async (resolve, reject) => {

            const scannedPageFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/scannedPage.png`);
            await fs.mkdirSync(Path.dirname(scannedPageFilePath), { recursive: true });
            try {
                console.log("INSIDE")
                // Loading file from file system into typed array.
                // const pdfPath = filePath;
                const data = new Uint8Array(fs.readFileSync(pdfPath));
                // Load the PDF file.
                let pdfDocument = await pdfjsLib.getDocument({
                    data: data,
                    cMapUrl: CMAP_URL,
                    cMapPacked: CMAP_PACKED,
                }).promise;
                let page = await pdfDocument.getPage(2);

                const viewport = page.getViewport({ scale: 10.0 });

                const canvasFactory = new NodeCanvasFactory();
                const canvasAndContext = canvasFactory.create(
                    viewport.width,
                    viewport.height
                );
                const renderContext = {
                    canvasContext: canvasAndContext.context,
                    viewport: viewport,
                    canvasFactory: canvasFactory,
                };

                await page.render(renderContext).promise;
                let buffer = canvasAndContext.canvas.toBuffer("image/png");
                await fs.writeFileSync(scannedPageFilePath, buffer);

                let scanText = await this.getScannedText(scannedPageFilePath, `${reqBody.sroCode}-${reqBody.bookNo}-${reqBody.documentNo}-${reqBody.registedYear}`);
                if (scanText == null || scanText.length == 0) {
                    return resolve(true);
                }

                scanText = scanText.split("/");
                console.log("SCAN TEXT IS",scanText);

                if (scanText.length != 9) {
                    return resolve(false);
                }

                if (scanText[4] != reqBody.sroCode || scanText[5] != reqBody.bookNo ||
                    scanText[6] != reqBody.documentNo || scanText[7] != reqBody.registedYear) {
                    return resolve(false);
                }

                return resolve(true);

            } catch (error) {
                Logger.error("EndorseService - verifyScannedDocument || Error :", error);
                console.error("EndorseService - verifyScannedDocument || Error :", error);
                return reject(error);
            } finally {
                if (fs.existsSync(scannedPageFilePath)) {
                    await fs.unlinkSync(scannedPageFilePath);
                }
            }
        })
    }

    async getScannedText(filePath, fileName) {
        let data = new FormData();
        try {
            data.append('file', fs.createReadStream(filePath));
            data.append('fileName', fileName);
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.GENERIC_VALIDATION_URL}/qrCode/scan`,
                headers: {
                    ...data.getHeaders()
                },
                data: data
            };
            let response = await instance.request(config);
            console.log("RESPONSE IS ", JSON.stringify(response.data))
            if (response?.data?.status) {
                return response.data.qrValue;
            }

        } catch (ex) {
            Logger.error("EndorseService - createBundlingDocument || Error :", ex);
            console.error("EndorseService - createBundlingDocument || Error :", ex);
            return null;
        }
        return null;
    }

    async splitImages(image) {
        let parts = [];
        try {
            const img = Buffer.from(image.substr(22), 'base64');
            const dimensions = sizeOf(img);
            const w2 = dimensions.width;
            const canvas = createCanvas(dimensions.width / 3, dimensions.height);
            const ctx = canvas.getContext('2d');
            let imageData = await loadImage(image);
            for (let i = 0; i < 3; i++) {
                ctx.drawImage(imageData, - (w2 / 3) * i, 0); // imgObject, X, Y, width, height
                parts.push(canvas.toDataURL());
            }
            return parts;
        } catch (ex) {
            console.log(ex);
            return parts;
        }
    }

    async compressFile(filePath, compressFilePath) {
        return new Promise(async (resolve) => {
            try {
                let endorsementDirectory = Path.join(__dirname, `../../../../../pdfs/`);
                const shrinkFilePath = `${endorsementDirectory}uploads/shrinkpdf.sh`;
                exec(`${shrinkFilePath} -r 90 -o ${compressFilePath} ${filePath}`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        throw error;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        throw stderr
                    }
                    return resolve(true);
                })
            } catch (error) {
                Logger.error("EndorseService - compressFile || Error :", error);
                console.error("EndorseService - compressFile || Error :", error);
                compressFilePath = filePath;
                return resolve(false);
            }
        })
    }

    async createCompressedDocument(filePath, originalFilePath, compressFilePath, compressPageCount) {
        return new Promise(async (resolve) => {
            try {
                let compressedResponse = await this.compressFile(filePath, compressFilePath);
                console.log("COMPLETED COMPRESSED", compressedResponse)
                if (compressedResponse == null || compressedResponse == false) {
                    compressFilePath = filePath;
                    return resolve(true)
                }
                let dataBuffer1 = fs.readFileSync(filePath);
                let pdfData = await PDFPageCounter(dataBuffer1);

                const merger = new PDFMerger();
                for (let i = 1; i <= pdfData.numpages; i++) {
                    if (i % 2 == 0 && i <= compressPageCount) {
                        await merger.add(filePath, i)
                    } else {
                        await merger.add(compressFilePath, i)
                    }
                }

                await fs.promises.copyFile(filePath, originalFilePath)

                await merger.save(filePath);
                return resolve(true);

            } catch (error) {
                Logger.error("EndorseService - createCompressedDocument || Error :", error);
                console.error("EndorseService - createCompressedDocument || Error :", error);
                return resolve(false);
            } finally {
                if (compressFilePath != filePath && fs.existsSync(compressFilePath)) {
                    await fs.unlinkSync(compressFilePath);
                }
                //THIS LINE WILL BE UNCOMMENTED POST TESTING AS WE NEED TO CHECK DIFFERENCE BETWEEN ORIGINAL AND COMPRESSED
                if (originalFilePath != filePath && fs.existsSync(originalFilePath)) {
                    await fs.unlinkSync(originalFilePath);
                }
            }
        })
    }

    getUsersPageCount = async (reqBody) => {
        try {
            let eSignUserCoordinatesExistingQuery = `SELECT * from SROUSER.tran_ec_aadhar_esign where sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear}`;
            let endorsementUserCoordinatesExistingResponse = await this.orDao.oDBQueryService(eSignUserCoordinatesExistingQuery);
            if (endorsementUserCoordinatesExistingResponse == null || endorsementUserCoordinatesExistingResponse.length == 0)
                return 0;
            let pageNumber = 10000;
            endorsementUserCoordinatesExistingResponse.forEach(element => {
                if (element.CODE == "WT" && element.PAGE_NO < pageNumber)
                    pageNumber = element.PAGE_NO;
            });
            console.log("PAGE NUMBER IS ", pageNumber);
            if (pageNumber == 10000)
                return 0;
            return pageNumber;
        } catch (error) {
            console.log("ERROR IN getUsersPageCount IS ", error);
            return 0;
        }
    }

    maskAadharString(aadhar) {
        if (aadhar == null || aadhar.length != 12)
            return "";
        let maskedAadhar = 'XXXXXXXX';
        maskedAadhar = maskedAadhar + aadhar.substr(8, 12);
        return maskedAadhar;
    }

    maskPassportString(Passport) {
        if (Passport == null || (Passport.length < 8 || Passport.length > 9)) {
            return "";
        }
        let maskedPassport = "XXXX";
        maskedPassport += Passport.substr(4);
        return maskedPassport;
    }

    async insertEndorsementCoordinates(conn, reqBody, userData, pageNumber, coordinates) {
        console.log('coordinates ==========>', coordinates);
        try {
            if (userData == null || (userData.type != null && userData.type == "DUMMY"))
                return;
            let details = {
                code: userData.CODE ? userData.CODE : "WT",
                ec_number: userData.EC_NUMBER ? userData.EC_NUMBER : userData.WITNESS_NUMBER ? userData.WITNESS_NUMBER : 1
            }
            let response = await conn.execute(`UPDATE SROUSER.tran_ec_aadhar_esign set PAGE_NO = ${pageNumber}, COORDINATES = '${coordinates}', ESIGN = 'N', SR_ESIGN = (null) where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${details.code}' and ec_number = ${details.ec_number} and aadhar is not null`, {}, { outFormat: oracleDb.OBJECT });;
            console.log(response);
        } catch (ex) {
            console.log(ex)
            throw ex;
        }
    }

    async insertRefusalEndorsementCoordinates(conn, reqBody, userData, pageNumber, coordinates) {
        console.log('coordinates ==========>', coordinates);
        try {
            if (userData == null || (userData.type != null && userData.type == "DUMMY"))
                return;
            let details = {
                code: userData.CODE ? userData.CODE : "WT",
                ec_number: userData.EC_NUMBER ? userData.EC_NUMBER : userData.WITNESS_NUMBER ? userData.WITNESS_NUMBER : 1
            }
            let response = await conn.execute(`UPDATE SROUSER.tran_ec_aadhar_esign_refusal set PAGE_NO = ${pageNumber}, COORDINATES = '${coordinates}', ESIGN = 'N', SR_ESIGN = (null) where  sr_code = ${reqBody.sroCode} and doct_no = ${reqBody.documentNo} and book_no = ${reqBody.bookNo} and reg_year = ${reqBody.registedYear} and code = '${details.code}' and ec_number = ${details.ec_number}`, {}, { outFormat: oracleDb.OBJECT });;
            console.log(response);
        } catch (ex) {
            console.log(ex)
            throw ex;
        }
    }


     dateTimeInFormat(dateTime, formatType = 1) {
        let date_time = dateTime ? new Date(dateTime) : new Date();

        let date = ("0" + date_time.getDate()).slice(-2);
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();

        let hours = ("0" + date_time.getHours()).slice(-2);
        let minutes = ("0" + date_time.getMinutes()).slice(-2);
        let seconds = ("0" + date_time.getSeconds()).slice(-2);

        if (formatType == 1) {
            return date + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
        } else if (formatType == 2) {
            let month_names_short = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            return date + "-" + month_names_short[date_time.getMonth()] + "-" + ("0" + date_time.getFullYear()).slice(-2);
        } else if(formatType == 3){
            return date + "/" + month + "/" + year;
        }

        return "";
    }

    getDateinStandardFormat(dateValue) {
        let dateString = "";
        try {
            let date_time = dateValue ? new Date(dateValue) : new Date();


            switch (date_time.getDate()) {
                case 1:
                case "01":
                    console.log("INSIDE")
                    dateString = "1st day of "
                    break;
                case 2:
                case "02":
                    dateString = "2nd day of "
                    break;
                case 3:
                case "03":
                    dateString = "3rd day of "
                    break;
                case 4:
                case "04":
                    dateString = "4th day of "
                    break;
                case 5:
                case "05":
                    dateString = "5th day of "
                    break;
                case 6:
                case "06":
                    dateString = "6th day of "
                    break;
                case 7:
                case "07":
                    dateString = "7th day of "
                    break;
                case 8:
                case "08":
                    dateString = "8th day of "
                    break;
                case 9:
                case "09":
                    dateString = "9th day of "
                    break;
                case 10:
                    dateString = "10th day of "
                    break;
                case 11:
                    dateString = "11th day of "
                    break;
                case 12:
                    dateString = "12th day of "
                    break;
                case 13:
                    dateString = "13th day of "
                    break;
                case 14:
                    dateString = "14th day of "
                    break;
                case 15:
                    dateString = "15th day of "
                    break;
                case 16:
                    dateString = "16th day of "
                    break;
                case 17:
                    dateString = "17th day of "
                    break;
                case 18:
                    dateString = "18th day of "
                    break;
                case 19:
                    dateString = "19th day of "
                    break;
                case 20:
                    dateString = "20th day of "
                    break;
                case 21:
                    dateString = "21st day of "
                    break;
                case 22:
                    dateString = "22nd day of "
                    break;
                case 23:
                    dateString = "23rd day of "
                    break;
                case 24:
                    dateString = "24th day of "
                    break;
                case 25:
                    dateString = "25th day of "
                    break;
                case 26:
                    dateString = "26th day of "
                    break;
                case 27:
                    dateString = "27th day of "
                    break;
                case 28:
                    dateString = "28th day of "
                    break;
                case 29:
                    dateString = "29th day of "
                    break;
                case 30:
                    dateString = "30th day of "
                    break;
                case 31:
                    dateString = "31st day of "
                    break;
                default:

                    break;
            }

            switch (date_time.getMonth() + 1) {
                case 1:
                case "01":
                    dateString = dateString + "January, "
                    break;
                case 2:
                case "02":
                    dateString = dateString + "February, "
                    break;
                case 3:
                case "03":
                    dateString = dateString + "March, "
                    break;
                case 4:
                case "04":
                    dateString = dateString + "April, "
                    break;
                case 5:
                case "05":
                    dateString = dateString + "May, "
                    break;
                case 6:
                case "06":
                    dateString = dateString + "June, "
                    break;
                case 7:
                case "07":
                    dateString = dateString + "July, "
                    break;
                case 8:
                case "08":
                    dateString = dateString + "August, "
                    break;
                case 9:
                case "09":
                    dateString = dateString + "September, "
                    break;
                case 10:
                    dateString = dateString + "October, "
                    break;
                case 11:
                    dateString = dateString + "November, "
                    break;
                case 12:
                    dateString = dateString + "December, "
                    break;

                default:
                    break;
            }

            dateString = dateString + date_time.getFullYear();

            console.log("DATE STRING " + dateString);

            return dateString;


        } catch (ex) {
            console.log(ex);
            return dateString;
        }
    }
}
module.exports = EndorseService;
