const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const coordinatefinder = require('./refuseServices');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const axios = require('axios');
const { response } = require("express");
const path = require('path');
const fsone = require('fs');
const { generatePDFFromHTML } = require("./generatePDFFromHTML");
const { encryptWithAESPassPhrase } = require("../utils");
const oracleDb = require('oracledb');
const dotenv = require('dotenv');
dotenv.config();
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');

class auditServices {
    constructor() {
        this.orDao = new OrDao();
        this.coordinatefinder = new coordinatefinder()
    }
    auditPlan = async (reqData) => {
        try {
            let query = `INSERT INTO SROUSER.AUDIT_PLAN (
                SR_CODE,SR_NAME,"IAR_NUMBER","FROM_DT_AUDIT","TO_DT_AUDIT","FROM_AUDIT_PERIOD",
                "TO_AUDIT_PERIOD","DR_EMPL_ID","DR_EMPL_NAME","SUBMIT_DATE") 
                VALUES ('${reqData.SR_CODE}','${reqData.SR_NAME}',
                '${reqData.IAR_NUMBER}',
                TO_DATE('${reqData.FROM_DT_AUDIT}', 'YYYY-MM-DD'),
                TO_DATE('${reqData.TO_DT_AUDIT}', 'YYYY-MM-DD'),
                TO_DATE('${reqData.FROM_AUDIT_PERIOD}', 'YYYY-MM-DD'),
                TO_DATE('${reqData.TO_AUDIT_PERIOD}', 'YYYY-MM-DD'),
                '${reqData.DR_EMPL_ID}',
                '${reqData.DR_EMPL_NAME}',
                SYSDATE
                
            )`;
            let response = await this.orDao.oDbInsertDocs(query)
            return response;
        } catch (ex) {
            Logger.error("auditServices - getSroDetails || Error :", ex);
            console.error("auditServices - getSroDetails || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    auditplandelete = async (reqData) => {
        try {
            let response2
            let query = `DELETE FROM SROUSER.AUDIT_PLAN
            WHERE SR_CODE = '${reqData.SR_CODE}' AND "IAR_NUMBER" = '${reqData.IAR_NUMBER}'`;
            let response = await this.orDao.oDbDelete(query)
        } catch (ex) {
            Logger.error("auditServices - auditplandelete || Error :", ex);
            console.error("auditServices - auditplandelete || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getDataSrvc = async (reqData) => {
        try {
            let result;
            let imageQuery = `SELECT IMAGE FROM cardimages.digitally_sign_docs WHERE SR_CODE=${reqData.SR_CODE} AND BOOK_NO=${reqData.BOOK_NO} AND REG_YEAR = ${reqData.REG_YEAR} AND DOCT_NO=${reqData.DOCT_NO}`;
            result = await this.orDao.oDBQueryServiceread(imageQuery);
            if (result.length === 0) {
                try {
                    let query = `SELECT doct_no, reg_year FROM tran_major WHERE SR_CODE=${reqData.SR_CODE} AND BOOK_NO=${reqData.BOOK_NO} AND ryear = ${reqData.REG_YEAR} AND RDOCT_NO=${reqData.DOCT_NO}`;

                    result = await this.orDao.oDBQueryServiceread(query);
                    let data = JSON.stringify({
                        "sroCode": reqData.SR_CODE,
                        "bookNo": reqData.BOOK_NO,
                        "documentNo": result[0].DOCT_NO,
                        "registedYear": result[0].REG_YEAR
                    });

                    let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'http://10.96.47.48:3021/digitalSign/v1/dsc/signedFile',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: data
                    };
                    const response = await axios.request(config);
                    if (response.data.data.length === 0) {
                        console.log("No Data Found in scanuser Table");
                    } else {
                        result = response.data.data;
                    }
                } catch (error) {
                    console.error("Error occurred while fetching data from external API:", error);
                    throw new Error("Error occurred while fetching data from external API");
                }

            }
            return result;
        } catch (ex) {
            Logger.error("CCServices - getDataSrvc || Error :", ex);
            console.error("CCServices - getDataSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }

    updateAuditPlan = async (reqData) => {
        try {
            let query = `UPDATE srouser.audit_plan
                    SET 
                        FROM_DT_AUDIT = NVL('${reqData.FROM_DT_AUDIT}', FROM_DT_AUDIT),
                        TO_DT_AUDIT = NVL('${reqData.TO_DT_AUDIT}', TO_DT_AUDIT),
                        FROM_AUDIT_PERIOD = NVL('${reqData.FROM_AUDIT_PERIOD}', FROM_AUDIT_PERIOD),
                        TO_AUDIT_PERIOD = NVL('${reqData.TO_AUDIT_PERIOD}', TO_AUDIT_PERIOD),
                        DR_EMPL_ID = NVL('${reqData.DR_EMPL_ID}', DR_EMPL_ID),
                        DR_EMPL_NAME = NVL('${reqData.DR_EMPL_NAME}', DR_EMPL_NAME),
                        SUBMIT_DATE = NVL('${reqData.SUBMIT_DATE}', SUBMIT_DATE)
                    WHERE IAR_NUMBER= '${reqData.IAR_NUMBER}' and sr_code=${reqData.SR_CODE}`;
            let result = await this.orDao.oDbUpdate(query);


            return result;
        } catch (ex) {
            Logger.error("auditServices - updateAuditPlan || Error :", ex);
            console.error("auditServices - updateAuditPlan || Error :", ex);
            throw new CARDError(ex);
        }
    }


    getAuditPlanDetails = async (reqData) => {
        let srquery;
        if ((reqData.SR_CODE === '' && reqData.DR_CD != '') || reqData.SR_CODE == undefined || reqData.SR_CODE == null) {
            srquery = `SR_CODE IN (SELECT sr_code as SR_CD FROM card.audit_MASTER WHERE DR_CODE='${reqData.DR_CD}')`
        }
        else if (reqData.DIG_CODE != '') {
            srquery = `SR_CODE IN (SELECT SR_CD FROM sr_MASTER WHERE DIG_CD='${reqData.DIG_CODE}')`
        }
        else {
            srquery = `SR_CODE=${reqData.SR_CODE}`
        }
        try {
            let query = `select * FROM SROUSER.AUDIT_PLAN WHERE ${srquery} `;

            let result = await this.orDao.oDBQueryService(query);
            return result;
        } catch (ex) {
            Logger.error("auditServices - getDataSrvc || Error :", ex);
            console.error("auditServices - getDataSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }

    updateAuditRemarks1Srvc = async (reqData) => {
        try {
            let base64;
            let Auditquery = '';
            if (reqData.auditFile2) {
                base64 = Buffer.from(reqData.auditFile2, 'base64');
                Auditquery = `AUDIT_FILE_2 = NVL(${reqData.DR_REMARKS_2 ? `:blobdata` : `''`}, AUDIT_FILE_2),`
            }
            let query = `UPDATE srouser.audit_remarks
            SET
                DR_REMARKS_2 = NVL('${reqData.DR_REMARKS_2}', DR_REMARKS_2),
                DR_REMARKS_2_BY = NVL('${reqData.DR_REMARKS_2_BY}', DR_REMARKS_2_BY),
                DR_FILE_DESCRIPTION_2 = NVL('${reqData.DR_FILE_DESCRIPTION_2}', DR_FILE_DESCRIPTION_2),
                 ${Auditquery}
                DR_REMARKS_2_ON = SYSDATE
                WHERE sr_code = ${reqData.SR_CODE} AND ${reqData.DOCT_NO ? `doct_no = ${reqData.DOCT_NO} AND reg_year = ${reqData.REG_YEAR} AND book_no = ${reqData.BOOK_NO} AND` : ''} iar_number = '${reqData.IAR_NUMBER}' AND PARA_NO='${reqData.PARA_NO}'`;

            let result;
            { base64 ? result = await this.orDao.oDbInsertBlobDocs(query, base64) : result = await this.orDao.oDbUpdate(query) };
            ;
            return result;
        } catch (ex) {
            Logger.error("auditServices - updateAuditRemarks || Error :", ex);
            console.error("auditServices - updateAuditRemarks || Error :", ex);
            throw new CARDError(ex);
        }
    }
    updateAuditRemarkStatus = async (reqData) => {
        let statusquery;
        if (reqData.SR_STATUS === 'Y') {
            statusquery = `SR_STATUS = 'Y' `
        }
        else if (reqData.DR_STATUS === 'Y') {
            statusquery = `DR_STATUS = 'Y'`
        }
        else {
            statusquery = ` DIG_STATUS = 'Y'`
        }
        try {

            let query = `UPDATE srouser.audit_remarks
            SET ${statusquery}               
                WHERE sr_code = ${reqData.SR_CODE}  AND iar_number = '${reqData.IAR_NUMBER}'`;

            let result = await this.orDao.oDbUpdate(query);
            return result;
        } catch (ex) {
            Logger.error("auditServices - updateAuditRemarks || Error :", ex);
            console.error("auditServices - updateAuditRemarks || Error :", ex);
            throw new CARDError(ex);
        }
    }
    updateDIGcashmisdetails = async (reqData) => {
        try {
            let query = `update  srouser.audit_remarks  set dig_mis_remark= '${reqData.DIG_MIS_REMARK}' where sr_code =${reqData.SR_CODE} and iar_number = '${reqData.IAR_NUMBER}' and doct_no in (select RDOCT_NO from  tran_major where DOCT_NO =${reqData.DOCT_NO} and sr_code =${reqData.SR_CODE}  and REG_YEAR = ${reqData.REG_YEAR})`;
            // let query = `update  srouser.audit_remarks  set dig_mis_remark= '${reqData.DIG_MIS_REMARK}' where sr_code =${reqData.SR_CODE} and iar_number = '${reqData.IAR_NUMBER}'and doct_no=${reqData.DOCT_NO}`;    
            let result = await this.orDao.oDbUpdate(query);
            return result;
        } catch (ex) {
            Logger.error("auditServices - updateAuditRemarks || Error :", ex);
            console.error("auditServices - updateAuditRemarks || Error :", ex);
            throw new CARDError(ex);
        }
    }

    updateDIGAuditRemarksSrvc = async (reqData) => {
        try {
            let base64;
            let Auditquery = '';
            if (reqData.DIG_AUDIT_FILE) {
                base64 = Buffer.from(reqData.DIG_AUDIT_FILE, 'base64');
                Auditquery = `DIG_AUDIT_FILE = NVL(${reqData.DIG_AUDIT_FILE ? `:blobdata` : `''`}, DIG_AUDIT_FILE),`
            }

            let query = `UPDATE srouser.audit_remarks
            SET
                DIG_REMARKS = NVL('${reqData.DIG_REMARKS}', DIG_REMARKS),
                DIG_REMARKS_BY = NVL('${reqData.DIG_REMARKS_BY}', DIG_REMARKS_BY),
                                ${Auditquery}
                DIG_REMARKS_ON = SYSDATE
                WHERE sr_code = ${reqData.SR_CODE} and iar_number = '${reqData.IAR_NUMBER}' AND PARA_NO='${reqData.PARA_NO}'`;


            let result;
            { base64 ? result = await this.orDao.oDbInsertBlobDocs(query, base64) : result = await this.orDao.oDbUpdate(query) };
            ;

            return result;
        } catch (ex) {
            Logger.error("auditServices - updateDIGAuditRemarksSrvc || Error :", ex);
            console.error("auditServices - updateDIGAuditRemarksSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }

    getPdfreceiptSrvc = async (reqData) => {
        try {
            let query = `SELECT
            a.*,
            b.sr_name,
            (SELECT acc_desc FROM card.account_cd WHERE acc_code = c.account_code) AS account_name,
            e.empl_name
        FROM
            cash_det a
        JOIN
            sr_master b
        ON
            a.sr_code = b.sr_cd
        JOIN
            SROUSER.CASH_PAID c
        ON
            a.sr_code = c.sr_code
            AND a.doct_no = c.doct_no
            AND a.book_no = c.book_no
            AND a.reg_year = c.reg_year
            AND a.c_receipt_no = c.c_receipt_no
        JOIN
            SROUSER.mis_cash_audit d
        ON
            a.sr_code = d.sr_code
            AND a.doct_no = d.doct_no
            AND a.book_no = d.book_no
            AND a.reg_year = d.reg_year
            AND a.c_receipt_no = d.receipt_no
        JOIN
            employee_login_master e
        ON
            d.entry_by = e.empl_id and d.sr_code = e.sr_code
        WHERE
            a.sr_code = ${reqData.SR_CODE}
            AND a.reg_year = ${reqData.REG_YEAR}
            AND a.c_receipt_no IN (${reqData.C_RECEIPT_NO})`;
            let response = await this.orDao.oDBQueryService(query);
            let totalChargeableValue = 0;
            let totalChallans = 0;
            response.forEach(item => {
                totalChargeableValue += item.ECHALLAN_NO ? 0 : item.CHARGEABLE_VALUE;
                totalChallans += item.ECHALLAN_NO ? item.CHARGEABLE_VALUE : 0;
            });
            const originalDate = new Date(response[0].ENTRY_DATE);
            const formattedDate = `${originalDate.getDate().toString().padStart(2, '0')}/
                         ${(originalDate.getMonth() + 1).toString().padStart(2, '0')}/
                        ${originalDate.getFullYear()}`;
            const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
            const receiptNumbers = response.map(item => item.C_RECEIPT_NO).join(', ');
            const challanNumbers = response.map(item => item.ECHALLAN_NO).filter(challanNo => challanNo !== null).join(', ');
            const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
            const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
            <div style="display : flex;align-items:center;justify-content:center;">
                <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
                <div style= "margin-left : 10px">
                    <h3 style="margin:0px">Government Of Andhra Pradesh</h3>
                    <h3 style="margin:0px">Registration And Stamps Department</h3>
                </div>
            </div>
            <div style="display: flex; justify-content : around;margin-top : 25px">
                <div>
                    DATE : ${formattedDate}
                </div>
                <div style = "margin-left : 50px">
                    SR NAME : ${response[0].SR_NAME}
                </div>
                <div></div>
            </div>
            <hr style="margin: 5px 0;">
            <hr style="margin: 5px 0;">
            <table style="width: 100%;">
                <tr>
                    ${response[0].DOCT_NO !== 999999 ? `<td style="width : 20%;padding: 5px">RECEIPT NO: ${receiptNumbers}</td>` : `<td style="width : 50%;padding: 5px">RECEIPT NO: ${receiptNumbers}</td>`}
                    ${response[0].DOCT_NO !== 999999 ? `<td style="width : 20%;padding: 5px">Document No: ${response[0].DOCT_NO}</td>` : `<td style="width : 10%;padding: 5px"></td>`}
                    ${response[0].DOCT_NO !== 999999 ? `<td style="width : 15%;padding: 5px">Book No: ${response[0].BOOK_NO}</td>` : `<td style="width : 10%;padding: 5px"></td>`}
                    ${response[0].DOCT_NO !== 999999 ? `<td style="width : 20%;padding: 5px">Register Year: ${response[0].REG_YEAR}</td>` : `<td style="width : 10%;padding: 5px"></td>`}
                    <td style="width : 15%;padding: 5px">YEAR: ${response[0].RCPTYR}</td>
                </tr>
                <tr>
                    <td style="width : 30%;padding: 5px;" colspan="4">Party Name: ${response[0].PARTY_NAME}</td>
                </tr>
                <tr>
                    <td style="width : 30%;padding: 5px;" colspan="4">Bank Challan No: ${challanNumbers}</td>
                </tr>
            </table>
            <hr style="margin: 5px 0;">
            <hr style="margin: 5px 0;">
            <table>
            <tr>
            <td style="font-weight: bold;border-bottom: 1px solid black;">ACCOUNT DESCRIPTION</td>
            <td style = "border-bottom: 1px solid black;"></td>
            <td style="font-weight: bold;border-bottom: 1px solid black;">AMOUNT BY CASH</td>
            <td style="font-weight: bold;border-bottom: 1px solid black;">AMOUNT BY CHALLAN</td>
            </tr>              
                ${response.map((item, index) => `
                <tr key = ${index}>
                    <td style="width : 50%;padding: 8px">${item.ACCOUNT_NAME}</td>
                    <td style="width : 10%;padding: 8px"></td>
                    <td style="width : 20%;padding: 8px">${item.ECHALLAN_NO ? 0 : item.CHARGEABLE_VALUE}</td>
                    <td style="width : 20%;padding: 8px">${item.ECHALLAN_NO ? item.CHARGEABLE_VALUE : 0}</td>
                </tr>
                `).join('')}
                <tr>
                    <td style="width : 50%;padding: 8px">Prepared by : ${response[0].EMPL_NAME}</td>
                    <td style="width : 10%;padding: 8px">TOTAL</td>
                    <td style="width : 20%;padding: 8px;align-items:center;border-bottom: 1px solid black;border-top: 1px solid black;">${totalChargeableValue}</td>
                    <td style="width : 20%;padding: 8px;align-items:center;border-bottom: 1px solid black;border-top: 1px solid black;">${totalChallans}</td>
                </tr>
            </table>
            <div style="position: absolute; right: 0; margin-top: 50px; margin-right : 90px">
                <div>Signature</div>
            </div>              
        </div>
    `;
            const pdfBuffer = await this.generatePDFFromHTML(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("CashPayableHandler - getPdfreceiptSrvc || Error :", ex);
            console.error("CashPayableHandler - getPdfreceiptSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getDigschuduledata = async () => {
        try {
            let query = `select * FROM SROUSER.AUDIT_PLAN`;
            let result = await this.orDao.oDBQueryService(query);
            return result;
        } catch (ex) {
            Logger.error("auditServices - getAuditCashDetailsSrvc || Error :", ex);
            console.error("auditServices - getAuditCashDetailsSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }



    getAuditCashDetailsSrvc = async (reqData) => {
        try {
            // let query = `select * FROM cash_payable WHERE sr_code = ${reqData.SR_CODE} and 
            // doct_no = ${reqData.DOCT_NO} and reg_year = ${reqData.REG_YEAR} and book_no = ${reqData.BOOK_NO}`;
            let query = `select * FROM cash_paid WHERE (sr_code, book_no, reg_year, doct_no) in (select sr_code, book_no, reg_year, doct_no from  tran_major where sr_code= ${reqData.SR_CODE} and rdoct_no = ${reqData.DOCT_NO} and reg_year = ${reqData.REG_YEAR} and book_no = ${reqData.BOOK_NO}) `;
            let result = await this.orDao.oDBQueryServiceread(query);
            return result;
        } catch (ex) {
            Logger.error("auditServices - getAuditCashDetailsSrvc || Error :", ex);
            console.error("auditServices - getAuditCashDetailsSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }

    auditRemarksSrvc = async (reqData) => {
        let DR_REMARKS_2_ON;
        let DR_REMARKS_1_ON;

        try {
            if (reqData.dr_remarks_2) {
                DR_REMARKS_2_ON = `SYSDATE`;
                DR_REMARKS_1_ON = "";
            }
            else if (reqData.dr_remarks_1) {
                DR_REMARKS_1_ON = `SYSDATE`;
                DR_REMARKS_2_ON = '';
            }

            let query = `INSERT INTO srouser.audit_remarks (
                iar_number,
                sr_code,
                book_no,
                reg_year,
                doct_no,
                dr_remarks_1,
                audit_file,
                time_stamp,
                dr_remarks_1_on,
                dr_remarks_1_by,
                REMARK_ID,
                REMARK_ITEM,
                REMARK_SUB_ITEM,
                PARA_NO,
                SR_STATUS,
                DR_STATUS,
                DIG_STATUS,
                RESP_SRO
            ) VALUES (
                '${reqData.iar_number}',
                ${reqData.sr_code},
                ${reqData.book_no ? reqData.book_no : null},
                ${reqData.reg_year ? reqData.reg_year : null},
                ${reqData.doct_no ? reqData.doct_no : null},
                '${reqData.dr_remarks_1}',
                :blobData,
                SYSDATE,
                ${DR_REMARKS_1_ON ? DR_REMARKS_1_ON : "''"},               
                '${reqData.dr_remarks_1_by}',
                '${reqData.REMARK_ID}',
                '${reqData.REMARK_ITEM}',
                '${reqData.REMARK_SUB_ITEM}',
                '${reqData.PARA_NO}',
                'P',
                'P',
                'P',
                '${reqData.RESP_SRO}'

            )`;


            let base64 = Buffer.from(reqData.auditFile, 'base64');
            let response = await this.orDao.oDbInsertBlobDocs(query, base64);
            if (reqData.sr_code == !null || reqData.book_no == !null || reqData.doct_no == !null || reqData.reg_year == !null) {



                let querydeficit = `INSERT INTO srouser.Audit_deficit_table (
                sr_code, 
                book_no, 
                rdoct_no, 
                reg_year, 
                deficit_amount, 
                deficit_sd, 
                deficit_usercharge, 
                deficit_rf, 
                deficit_td,
                IAR_NUMBER
            ) VALUES (
                '${reqData.sr_code}', 
                '${reqData.book_no}', 
                '${parseInt(reqData.doct_no)}', 
                '${reqData.reg_year}', 
                '${reqData.deficit_amount}', 
                '${reqData.deficit_sd}', 
                '${reqData.deficit_usercharge}', 
                '${reqData.deficit_rf}', 
                '${reqData.deficit_td}',
                '${reqData.iar_number}'

            )`;
                let responsedeficit = await this.orDao.oDbInsertDocs(querydeficit);

            }
            return response;
        } catch (ex) {
            Logger.error("auditServices - auditRemarksSrvc || Error :", ex);
            console.error("auditServices - auditRemarksSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }

    dutyService = async (reqData) => {
        try {
            let query = `begin srouser.cca_duty_calc(:tmaj_code,:tmin_code,:local_body,:flat_nonflat,:final_taxable_value,:con_value1,:adv_amount, :sd_p,:td_p,:rf_p); end;`;

            let obj = {
                tmaj_code: { val: reqData.tmaj_code, type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_IN },
                tmin_code: { val: reqData.tmin_code, type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_IN },
                local_body: { val: parseInt(reqData.local_body), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
                flat_nonflat: { val: reqData.flat_nonflat, type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_IN },
                final_taxable_value: { val: parseInt(reqData.finalTaxbleValue), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
                con_value1: { val: parseInt(reqData.con_value), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
                adv_amount: { val: parseInt(reqData.adv_amount), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
                sd_p: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
                td_p: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
                rf_p: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT }
            }

            let details = await this.orDao.getSProcedurereadODB(query, obj);
            return details;
        } catch (ex) {
            Logger.error("auditServices - auditRemarksSrvc || Error :", ex);
            console.error("auditServices - auditRemarksSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    };

    getIndexByCriteriaReport = async (reqData) => {

        try {

            let query = `SELECT DISTINCT
            a.property || a.boundaries property,
            to_char(a.p_date,'dd/mm/yyyy'),
            to_char(a.e_date,'dd/mm/yyyy'),
            to_char(a.r_date,'dd/mm/yyyy'),
            TRANSLATE (a.con_val, 'Cons.Value:Rs. ', ' ') convalue,
            TRANSLATE (a.mkt_val, 'Mkt.Value:Rs. ', ' ') mktvalue,
            TO_CHAR (a.doct_no) || '/' || TO_CHAR (a.reg_year) dctyr,
            a.doct_no,
            a.reg_year,
            a.sr_code,
            '[' || a.schedule_no || ']' || a.sr_code src,
            a.vol_pag cd_no,
            b.tran_desc || '(' || a.tran_code1 || ')' tran_desc,
             b.tran_maj_code , b.tran_min_code,
            NVL (a.contra_entry, 'No Contra Entry') contra_entry,
            NVL (a.links, 'No Links') links,
            a.chargeble_value chrval,
            c.local_body_desc locbody,
            d.class_desc || '-' || DECODE (d.class_type, 'R', 'U', 'A', 'R', d.class_type) || '(' || a.land_use || ')' landuse,
            village_name,
            LISTAGG('[' || te.code || '] - ' || te.name, ', ') WITHIN GROUP (ORDER BY te.code) AS Name_code
        FROM
            card_index2 a
            JOIN tran_dir b ON a.tran_code1 = b.tran_maj_code || b.tran_min_code
            JOIN local_body_dir c ON a.local_body = c.local_body_code
            JOIN area_class d ON a.land_use = d.class_code
            JOIN hab_code e ON village_code = SUBSTR (hab_code, 1, 7)
            LEFT JOIN tran_ec te ON a.sr_code = te.sr_code AND te.rdoct_no = a.doct_no AND te.ryear = a.reg_year AND te.book_no = 1
            WHERE
            a.sr_code = DECODE('${reqData.srocode}','0000',a.sr_code,'${reqData.srocode}') AND
            TO_NUMBER (a.tran_code1) BETWEEN TO_NUMBER (NVL ('${reqData.natureCode}',0)) AND
            DECODE(TO_NUMBER (NVL('${reqData.natureCode}',0)), 0, 899, 100, 199, 200, 299, 300, 399, 400, 499, 500, 599, 600, 699, 700, 799, 800, 899, TO_NUMBER ('${reqData.natureCode}')) AND
            a.land_use IN (
                SELECT class_code
                FROM area_class
                WHERE class_type = NVL (DECODE('${reqData.landType}', 'B', '', '${reqData.landType}'),class_type) AND
                      class_code = NVL (DECODE ('${reqData.landCode}', '00', '', '${reqData.landCode}'), class_code)
            ) AND
            a.chargeble_value BETWEEN NVL ('${reqData.fromCharge}', 1) AND NVL ('${reqData.toCharge}', 9999999999999) AND
            a.local_body = NVL (DECODE ('${reqData.locCode}', 'A', '', '${reqData.locCode}'), a.local_body) AND
            NVL (ward_no, NVL ('${reqData.ward}', 0)) = NVL ('${reqData.ward}', NVL (ward_no, 0)) AND
            NVL (block_no, NVL ('${reqData.blockno}', 0)) = NVL ('${reqData.blockno}', NVL (block_no, 0)) AND
            r_date BETWEEN to_date('${reqData.fromDate}','yyyy-mm-dd') AND to_date('${reqData.toDate}','yyyy-mm-dd') AND
            (village_code = NVL (DECODE ('${reqData.villCode}', '${reqData.villCode}', '', '${reqData.villCode}'), village_code))
        GROUP BY
            a.property || a.boundaries,
            to_char(a.p_date,'dd/mm/yyyy'),
            to_char(a.e_date,'dd/mm/yyyy'),
            to_char(a.r_date,'dd/mm/yyyy'),
            TRANSLATE (a.con_val, 'Cons.Value:Rs. ', ' '),
            TRANSLATE (a.mkt_val, 'Mkt.Value:Rs. ', ' '),
            TO_CHAR (a.doct_no) || '/' || TO_CHAR (a.reg_year),
            a.doct_no,
            a.reg_year,
            a.sr_code,
            '[' || a.schedule_no || ']' || a.sr_code,
            a.vol_pag,
            b.tran_desc || '(' || a.tran_code1 || ')',
             b.tran_maj_code , b.tran_min_code,
            NVL (a.contra_entry, 'No Contra Entry'),
            NVL (a.links, 'No Links'),
            a.chargeble_value,
            c.local_body_desc,
            d.class_desc || '-' || DECODE (d.class_type, 'R', 'U', 'A', 'R', d.class_type) || '(' || a.land_use || ')',
            village_name
        `;


            let response = await this.orDao.oDBQueryServiceread(query)
            return response;
        } catch (ex) {
            Logger.error("IndexByCriteriaReport - getIndexByCriteriaReport || Error :", ex);
            console.error("IndexByCriteriaReport - getIndexByCriteriaReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getAuditRemarksSrvc = async (reqData) => {
        try {
            let IARQURYE;
            if (reqData.IAR_NUMBER === '') {
                IARQURYE = ''
            } else {
                IARQURYE = ` and iar_number = '${reqData.IAR_NUMBER}'`
            }
            let query = `select * FROM srouser.audit_remarks WHERE sr_code = ${reqData.SR_CODE} ${IARQURYE} order by REMARK_ID desc`;
            let result = await this.orDao.oDBQueryService(query);
            let data;
            let response = [];
            for (let i = 0; i < result.length; i++) {
                data = {
                    IAR_NUMBER: result[i].IAR_NUMBER,
                    SR_CODE: result[i].SR_CODE,
                    BOOK_NO: result[i].BOOK_NO,
                    REG_YEAR: result[i].REG_YEAR,
                    DOCT_NO: result[i].DOCT_NO,
                    DR_REMARKS_1: result[i].DR_REMARKS_1,
                    DR_REMARKS_2: result[i].DR_REMARKS_2,
                    SR_REMARKS: result[i].SR_REMARKS,
                    DIG_REMARKS: result[i].DIG_REMARKS,
                    AUDIT_FILE: result[i].AUDIT_FILE ? result[i].AUDIT_FILE.toString('base64') : '',
                    TIME_STAMP: result[i].TIME_STAMP,
                    DR_REMARKS_1_ON: result[i].DR_REMARKS_1_ON,
                    DR_REMARKS_2_ON: result[i].DR_REMARKS_2_ON,
                    SR_REMARKS_ON: result[i].SR_REMARKS_ON,
                    DIG_REMARKS_ON: result[i].DIG_REMARKS_ON,
                    DR_REMARKS_1_BY: result[i].DR_REMARKS_1_BY,
                    DR_REMARKS_2_BY: result[i].DR_REMARKS_2_BY,
                    SR_REMARKS_BY: result[i].SR_REMARKS_BY,
                    DIG_REMARKS_BY: result[i].DIG_REMARKS_BY,
                    RESPONSE_BY_SR: result[i].RESPONSE_BY_SR,
                    AUDIT_FILE_2: result[i].AUDIT_FILE_2 ? result[i].AUDIT_FILE_2.toString('base64') : '',
                    REMARK_ID: result[i].REMARK_ID,
                    REMARK_ITEM: result[i].REMARK_ITEM,
                    REMARK_SUB_ITEM: result[i].REMARK_SUB_ITEM,
                    DIG_FINAL_ORDER: result[i].DIG_FINAL_ORDER,
                    DR_FILE_DESCRIPTION: result[i].DR_FILE_DESCRIPTION,
                    SR_FILE_DESCRIPTION: result[i].SR_FILE_DESCRIPTION,
                    SR_AUDIT_FILE: result[i].SR_AUDIT_FILE ? result[i].SR_AUDIT_FILE.toString('base64') : '',
                    DIG_AUDIT_FILE: result[i].DIG_AUDIT_FILE ? result[i].DIG_AUDIT_FILE.toString('base64') : '',
                    SR_STATUS: result[i].SR_STATUS,
                    DR_STATUS: result[i].DR_STATUS,
                    DIG_STATUS: result[i].DIG_STATUS,
                    DIG_MIS_REMARK: result[i].DIG_MIS_REMARK

                }
                response.push(data);
            }

            return response;
        } catch (ex) {
            Logger.error("auditServices - getAuditRemarksSrvc || Error :", ex);
            console.error("auditServices - getAuditRemarksSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }
    getauditsrlistsrvc = async (reqData) => {
        try {
            let query = `select sr_code, sr_name from card.audit_master where dr_code='${reqData.dR}'`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("EmployeeHandler - getEmployeesSRSrvc || Error :", ex);
            console.error("EmployeeHandler - getEmployeesSRSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    };

    getAuditDRSrvc = async (reqData) => {
        try {
            let query = `SELECT distinct dr_name,dr_code From card.audit_master`;
            let response = await this.orDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("EmployeeHandler - getDRSrvc || Error :", ex);
            console.error("EmployeeHandler - getDRSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    };

    getEmployeesDRSrvc = async (reqData) => {
        try {
            let response;
            if (reqData.dR === '1' || reqData.dR === '8' || reqData.dR === '11' || reqData.dR === '2') {
                let query = `SELECT * FROM employee_login_master WHERE designation='Sub-Registrar' AND sr_code IN (SELECT sr_code FROM card.audit_master WHERE dr_code='${reqData.dR}')`;
                response = await this.orDao.oDBQueryService(query);
            }
            else {
                let query = `SELECT * From employee_login_master where designation='District Registrar' and sr_code in (select sr_code from card.audit_master where dr_code='${reqData.dR}')`;
                response = await this.orDao.oDBQueryService(query)
            }
            if (response != null) {
                response.map(element => {
                    if (element.AADHAR != null)
                        element.AADHAR = encryptWithAESPassPhrase(element.AADHAR.toString(), process.env.adhar_Secret_key);
                    if (element.PASSWRD) {
                        element.PASSWRD = encryptWithAESPassPhrase(element.PASSWRD, process.env.adhar_Secret_key)
                    }
                })
            }
            return response;
        } catch (ex) {
            Logger.error("EmployeeHandler - getEmployeesDRSrvc || Error :", ex);
            console.error("EmployeeHandler - getEmployeesDRSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getEmployeesDIGSrvc = async (reqData) => {
        try {
            let query = `SELECT a.*, b.dig_cd FROM employee_login_master a 
                        join dig_master b on ${reqData.DIG} = b.dig_cd
                        WHERE a.designation='DIG' AND a.sr_code IN (SELECT sr_cd FROM sr_master WHERE dig_cd='${reqData.DIG}')`;
            let response = await this.orDao.oDBQueryService(query);
            if (response != null) {
                response.map(element => {
                    if (element.AADHAR != null)
                        element.AADHAR = encryptWithAESPassPhrase(element.AADHAR.toString(), process.env.adhar_Secret_key);
                    if (element.PASSWRD) {
                        element.PASSWRD = encryptWithAESPassPhrase(element.PASSWRD, process.env.adhar_Secret_key)
                    }
                })
            }
            return response;
        } catch (ex) {
            Logger.error("EmployeeHandler - getEmployeesDIGSrvc || Error :", ex);
            console.error("EmployeeHandler - getEmployeesDIGSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getNatureDocumentsList = async (reqData) => {
        try {

            let query = `
            select TRAN_MAJ_CODE,TRAN_MIN_CODE,TRAN_DESC from tran_dir where tran_maj_code='${reqData.TRAN_MAJ_CODE}'`;
            const bindParams = {

            }
            let response = await this.orDao.oDBQueryService(query, bindParams)
            return response;
        } catch (ex) {
            Logger.error("NatureDocumentsList - getNatureDocumentsList || Error :", ex);
            console.error("NatureDocumentsList - getNatureDocumentsList || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getDIGLocationsSrvc = async () => {
        try {
            let query = `select * from dig_master where (dig_cd >=1 and dig_cd<=12) or dig_cd=99 order by dig_cd`;
            let result = await this.orDao.oDBQueryService(query);
            return result;
        } catch (ex) {
            Logger.error("auditServices - getDIGLocationsSrvc || Error :", ex);
            console.error("auditServices - getDIGLocationsSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }

    updateAuditRemarksSrvc = async (reqData) => {
        try {
            let DIG_REMARKS_ON = '';
            let DR_REMARKS_2_ON = ''
            let SR_REMARKS_ON = '';
            let base64, SRbase64;
            let srquery = '';
            let drquery = '';
            if (reqData.DIG_REMARKS) {
                DIG_REMARKS_ON = 'SYSDATE'
            }
            else if (reqData.DR_REMARKS_2) {
                DR_REMARKS_2_ON = 'SYSDATE'
                base64 = Buffer.from(reqData.auditFile2, 'base64');
                drquery = `AUDIT_FILE_2 = NVL(${reqData.DR_REMARKS_2 ? `:blobdata` : `''`}, AUDIT_FILE_2),`


            }
            else if (reqData.SR_REMARKS) {
                SR_REMARKS_ON = 'SYSDATE'
                base64 = Buffer.from(reqData.sr_audit_file, 'base64');
                srquery = `,SR_AUDIT_FILE = NVL(${reqData.SR_REMARKS ? `:blobdata` : `''`}, SR_AUDIT_FILE)`

            }
            let query = `UPDATE srouser.audit_remarks
            SET
                DR_REMARKS_2 = NVL('${reqData.DR_REMARKS_2}', DR_REMARKS_2),
                SR_REMARKS = NVL('${reqData.SR_REMARKS}', SR_REMARKS),
                DIG_REMARKS = NVL('${reqData.DIG_REMARKS}', DIG_REMARKS),
                DR_REMARKS_2_BY = NVL('${reqData.DR_REMARKS_2_BY}', DR_REMARKS_2_BY),
                SR_REMARKS_BY = NVL('${reqData.SR_REMARKS_BY}', SR_REMARKS_BY),
                DIG_REMARKS_BY = NVL('${reqData.DIG_REMARKS_BY}', DIG_REMARKS_BY),
                DR_REMARKS_2_ON = NVL(${DR_REMARKS_2_ON ? DR_REMARKS_2_ON : `'${DR_REMARKS_2_ON}'`}, DR_REMARKS_2_ON),
                SR_REMARKS_ON = NVL(${SR_REMARKS_ON ? SR_REMARKS_ON : `'${SR_REMARKS_ON}'`}, SR_REMARKS_ON),
                DIG_REMARKS_ON = NVL(${DIG_REMARKS_ON ? DIG_REMARKS_ON : `'${DIG_REMARKS_ON}'`}, DIG_REMARKS_ON),
                ${drquery}
                DIG_FINAL_ORDER = NVL('${reqData.DIG_FINAL_ORDER}', DIG_FINAL_ORDER),
                SR_FILE_DESCRIPTION = NVL('${reqData.SR_FILE_DESCRIPTION}', SR_FILE_DESCRIPTION),
                DR_FILE_DESCRIPTION = NVL('${reqData.DR_FILE_DESCRIPTION}', DR_FILE_DESCRIPTION),
                DR_FILE_DESCRIPTION_2 = NVL('${reqData.DR_FILE_DESCRIPTION_2}', DR_FILE_DESCRIPTION_2) ${srquery} 
                WHERE sr_code = ${reqData.SR_CODE} AND ${reqData.DOCT_NO ? `doct_no = ${reqData.DOCT_NO} AND reg_year = ${reqData.REG_YEAR} AND book_no = ${reqData.BOOK_NO} AND` : ''} iar_number = '${reqData.IAR_NUMBER}' AND PARA_NO='${reqData.PARA_NO}'`; console.log(query);
            let result = await this.orDao.oDbInsertBlobDocs(query, base64);
            console.log(query, "query");

            return result;
        } catch (ex) {
            Logger.error("auditServices - updateAuditRemarks || Error :", ex);
            console.error("auditServices - updateAuditRemarks || Error :", ex);
            throw new CARDError(ex);
        }
    }
    genarateAuditRevieworder = async (reqData, res) => {
        try {
            let query = `SELECT a.*, b.sr_cd, c.dr_cd,dr_name
                         FROM srouser.audit_plan a
                         LEFT JOIN sr_master b ON a.sr_code = b.sr_cd
                         LEFT JOIN dr_master c ON b.dr_cd = c.dr_cd 
                         WHERE a.iar_number = '${reqData.IAR_NUMBER}'`;
            let response = await this.orDao.oDBQueryService(query);
            let remarksquery = `select * from srouser.audit_remarks where IAR_NUMBER= '${reqData.IAR_NUMBER}'`;
            let remarksresponse = await this.orDao.oDBQueryService(remarksquery);
            let deficitquery = `select * from srouser.audit_deficit_table where IAR_NUMBER= '${reqData.IAR_NUMBER}'`;
            let deficitresponse = await this.orDao.oDBQueryService(deficitquery);
            let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
            let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

            const date = new Date(response[0].FROM_AUDIT_PERIOD);
            const fromdate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            let tdate = new Date(response[0].TO_AUDIT_PERIOD);
            const todate = tdate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            let withoutAlphabets = remarksresponse.filter(remarks => !/[a-zA-Z]/.test(remarks.remarks_id));
            let withAlphabets = remarksresponse.filter(remarks => /[a-zA-Z]/.test(remarks.remarks_id));

            let generatePartAHTML = (remarksList) => {
                let header = `
                <div style="border: 1px solid black; margin-top: 10px; text-align: start;">
                    <div>
                        <h1 style="text-align: center; font-size:25px;">Part-A</h1>
                        <h3 style="text-decoration: underline;">LOSS OF REVENUE</h3>
                    </div>
                `;
                if (remarksList.length === 0) {
                    return header + '<div style="text-align: center; padding: 20px;">No remarks found.</div></div>';
                }
                let deficitfind = (DOCT_NO) => {
                    let defict = deficitresponse.find(def => def.RDOCT_NO === parseInt(DOCT_NO));
                    return defict
                }

                let documentSections = remarksList.map((remarks, index) => {
                    return `
                    <div style="margin-top: 20px; border: 1px solid black; padding: 10px;">
                        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; text-align: center;">
                            <thead style="background-color: #f2f2f2;">
                                <tr style="border: 1px solid black; font-size: 14px;">
                                    <th style="border: 1px solid black;">S.No:</th>
                                    <th style="border: 1px solid black;">Document Number</th>
                                    <th style="border: 1px solid black;">Deficit Amount</th>
                                    <th style="border: 1px solid black;">Responsible SRO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="background-color: #fff;">
                                    <td style="border: 1px solid black;">${index + 1}</td>
                                    <td style="border: 1px solid black;">${remarks.DOCT_NO}/${remarks.REG_YEAR}</td>
                                    <td style="border: 1px solid black; text-align: left; padding-left: 5px;">
                                    Stamp Duty::${deficitfind(remarks.DOCT_NO) ? (deficitfind(remarks.DOCT_NO)).DEFICIT_SD : ''}<br>
                                    Registration Fee:${deficitfind(remarks.DOCT_NO) ? (deficitfind(remarks.DOCT_NO)).DEFICIT_RF : ''}<br>
                                    User Charges:${deficitfind(remarks.DOCT_NO) ? (deficitfind(remarks.DOCT_NO)).DEFICIT_TD : ''}<br>
                                    Trnasfer Duty:${deficitfind(remarks.DOCT_NO) ? (deficitfind(remarks.DOCT_NO)).DEFICIT_USERCHARGE : ''}
                                    </td>
                                    <td style="border: 1px solid black;">${remarks.RESP_SRO}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DR(MV & A) Remarks:</div>
                             <div style="border: 1px solid black; padding: 5px; margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                               ${remarks.DR_REMARKS_1}           
                              </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">SRO Explanation:</div>
                   <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                               ${remarks.SR_REMARKS}
                              </div>                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DR (MV & A) Further Remarks:</div>
                    <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                               ${remarks.DR_REMARKS_2}
                              </div>                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DIG Final Remarks:</div>
                   <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                               ${remarks.DIG_REMARKS}
                              </div>                        </div>
                    </div>
                    `;
                }).join('');

                return header + documentSections + '</div>';
            };

            // Function to generate Part-B HTML
            let generatePartBHTML = (remarksList) => {
                let header = `
                <div style="border: 1px solid black; margin-top: 10px; text-align: start;">
                    <div>
                        <h1 style="text-align: center; font-size:25px;">Part-B</h1>
                        <h3 style="text-decoration: underline;">PROCEDURE LAPSE</h3>
                    </div>
                `;

                if (remarksList.length === 0) {
                    return header + '<div style="text-align: center; padding: 20px;">No procedure lapse remarks found.</div></div>';
                }

                let deficitfind = (DOCT_NO) => {
                    let defict = deficitresponse.find(def => def.RDOCT_NO === parseInt(DOCT_NO));
                    return defict
                }

                let documentSections = remarksList.map((remarks, index) => {
                    return `
                    <div style="margin-top: 20px; border: 1px solid black; padding: 10px;">
                        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; text-align: center;">
                            <thead style="background-color: #f2f2f2;">
                                <tr style="border: 1px solid black; font-size: 14px;">
                                    <th style="border: 1px solid black;">S.No:</th>
                                    <th style="border: 1px solid black;">Document Number</th>
                                    <th style="border: 1px solid black;">Deficit Amount</th>
                                    <th style="border: 1px solid black;">Responsible SRO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="background-color: #fff;">
                                    <td style="border: 1px solid black;">${index + 1}</td>
                                    <td style="border: 1px solid black;">${remarks.DOCT_NO}/${remarks.REG_YEAR}</td>
                                    <td style="border: 1px solid black; text-align: left; padding-left: 5px;">
                                        Stamp Duty:${deficitfind(remarks.DOCT_NO) ? (deficitfind(remarks.DOCT_NO)).DEFICIT_SD : ''}<br>
                                        Registration Fee:${deficitfind(remarks.DOCT_NO) ? (deficitfind(remarks.DOCT_NO)).DEFICIT_RF : ''}<br>
                                        User Charges:${deficitfind(remarks.DOCT_NO) ? (deficitfind(remarks.DOCT_NO)).DEFICIT_TD : ''}<br>
                                        Trnasfer Duty:${deficitfind(remarks.DOCT_NO) ? (deficitfind(remarks.DOCT_NO)).DEFICIT_USERCHARGE : ''}
                                    </td>
                                    <td style="border: 1px solid black;">${remarks.RESP_SRO}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DR(MV & A) Remarks:</div>
                            <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                                ${remarks.DR_REMARKS_1}
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">SRO Explanation:</div>
                            <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                                ${remarks.SR_REMARKS}
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DR (MV & A) Further Remarks:</div>
                            <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                                ${remarks.DR_REMARKS_2}
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DIG Final Remarks:</div>
                            <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                                ${remarks.DIG_REMARKS}
                            </div>
                        </div>
                    </div>
                    `;
                }).join('');

                return header + documentSections + '</div>';
            };

            let generatePartCHTML = (remarksList) => {
                let header = `
                <div style="border: 1px solid black; margin-top: 10px; text-align: start;">
                    <div>
                        <h1 style="text-align: center; font-size:25px;">Part-C</h1>
                        <h3 style="text-decoration: underline;">Miscellaneous</h3>
                    </div>
                `;

                if (remarksList.length === 0) {
                    return header + '<div style="text-align: center; padding: 20px;">No Miscellaneouss remarks found.</div></div>';
                }
                let documentSections = remarksList.map((remarks, index) => {
                    return `
                    <div style="margin-top: 20px; border: 1px solid black; padding: 10px;">
                        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; text-align: center;">
                            <thead style="background-color: #f2f2f2;">
                                <tr style="border: 1px solid black; font-size: 14px;">
                                    <th style="border: 1px solid black;">S.No:</th>
                                    <th style="border: 1px solid black;">Document ID</th>
                                    <th style="border: 1px solid black;">Responsible SRO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="background-color: #fff;">
                                    <td style="border: 1px solid black;">${index + 1}</td>
                                    <td style="border: 1px solid black;">${remarks.PARA_NO}</td>
                                    <td style="border: 1px solid black;">${remarks.RESP_SRO}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DR(MV & A) Remarks:</div>
                            <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                                ${remarks.DR_REMARKS_1}
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">SRO Explanation:</div>
                            <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                                ${remarks.SR_REMARKS}
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DR (MV & A) Further Remarks:</div>
                            <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                                ${remarks.DR_REMARKS_2}
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div style="font-weight: bold;">DIG Final Remarks:</div>
                            <div style="border: 1px solid black; padding: 5px;  margin-top: 5px; word-wrap: break-word; overflow: hidden;">
                                ${remarks.DIG_REMARKS}
                            </div>
                        </div>
                    </div>
                    `;
                }).join('');

                return header + documentSections + '</div>';
            };

            let generateNote = () => {
                return `
                <div style="margin-top: 20px; border-top: 1px solid black; padding-top: 10px;">
                    <p style="font-style: italic;">*Note: He/she is requested to submit the replies within seven (7) days.</p>
                    <table style="width: 100%; margin-top: 10px;">
            <tr>
                <td style="text-align: left; width: 50%; vertical-align: top;">
                    <p>To:</p>
                    <p>The Sub Registar Office,</p>
                    <p>${response[0].SR_NAME}.</p>
                </td>
                <td style="text-align: right; width: 50%; vertical-align: top;">
                    <h4 style="margin-bottom: 5px;">District Registrar</h4>
                    <h6 style="font-size: 13px; margin-top: 0;">(Market Value & Audit)</h6>
                    <b>${response.map((item) => `${item.DR_NAME}`)}</b>
                </td>
            </tr>
        </table>    
                `;
            };
            let sortedRemarks = withoutAlphabets.concat(withAlphabets);
            let lossOfRevenueRemarks = sortedRemarks.filter(remark => remark.REMARK_ITEM === 'Loss of Revenue');
            let procedureLapseRemarks = sortedRemarks.filter(remark => remark.REMARK_ITEM === 'Procedures lapse');
            let nonNumericRemarks = sortedRemarks.filter(remark => remark.DOCT_NO === null);

            let html = `
            <div style="text-align: center;">
                <div style="display: inline-block; text-align: start; margin-left: 100px; font-size: 15px;">
                    <h3 style="margin-top: 10px; margin-bottom: 0;padding-top: 10px;">రిజిస్ట్రేషన్ & స్టాంప్స్ శాఖ</h3>
                    <h5 style="margin-top: 5px;">ఆంధ్రప్రదేశ్ రాష్ట్ర ప్రభుత్వం</h5>
                </div>
                <div style="display: inline-block; vertical-align: middle;">
                    <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width: 75px; height: 75px; vertical-align: middle;">
                </div>
                <div style="display: inline-block; text-align: start; vertical-align: middle;">
                    <h3 style="margin-top: 10px; margin-bottom: 0; font-size: 15px;">REGISTRATIONS & STAMPS DEPARTMENT</h3>
                    <h5 style="margin-top: 5px;">GOVERNMENT OF ANDHRA PRADESH</h5>
                </div>
            </div>
            
            <div style="border: 1px solid black; text-align: center; margin-top: 10px; padding:10px">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px; margin-top: 5px;">Audit Report</div>
                <div style="border: 1px solid black;">
                    <div style="border: 1px solid black;">
                        <div style="margin-bottom: 20px; text-align: start;">
                            <p style="margin:5px 15px;text-align:center;line-height:23px;letter-spacing:1px">
                                <span>INTERNAL AUDIT REPORT</span>
                                From<span style="margin: 5px; color: red;">${fromdate}</span>To<span style="margin: 5px; color: red;">${todate}</span>
                                <span style="margin-left: 10px;">SUB REGISTAR OFFICE</span><span style="margin: 5px; color: red;">${response[0].SR_NAME}</span>
                                BY SRI <b>${response.map((item) => `${item.DR_EMPL_NAME}`)}</b> DISTRICT REGISTRAR(MV & A)</span><span style="margin: 5px; color: red;">${response[0].IAR_NUMBER}</span>
                            </p>
                        </div>
                    </div>
                </div>
                ${generatePartAHTML(lossOfRevenueRemarks)}
                ${generatePartBHTML(procedureLapseRemarks)}
                ${generatePartCHTML(nonNumericRemarks)}
                ${generateNote()}
            </div>
          
            </div>
            `;
            let pdfBuffer = await generatePDFFromHTML(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return base64Pdf;
        } catch (ex) {
            Logger.error("auditServices - getAuditApplication || Error :", ex);
            console.error("auditServices - getAuditApplication || Error :", ex);
            throw new CARDError(ex);
        }
    }


    getAuditApplication = async (reqData) => {
        try {
            let query = `select APP_ID FROM SROUSER.PDE_DOC_STATUS_CR WHERE sr_code = ${reqData.SR_CODE} and doct_no = ${reqData.DOCT_NO} and reg_year = ${reqData.REG_YEAR} and book_no = ${reqData.BOOK_NO} `;
            let result = await this.orDao.oDBQueryService(query);
            return result;
        } catch (ex) {
            Logger.error("auditServices - getAuditApplication || Error :", ex);
            console.error("auditServices - getAuditApplication || Error :", ex);
            throw new CARDError(ex);
        }
    }


    getDIGiardetails = async (reqData) => {
        try {
            let query = `select iar_number FROM srouser.audit_remarks WHERE dr_remarks_2 is not null and sr_code in (select sr_cd from sr_master where dig_cd = '${reqData.DIG_CODE}')`;

            let result = await this.orDao.oDBQueryService(query);
            return result;
        } catch (ex) {
            Logger.error("auditServices - getDataSrvc || Error :", ex);
            console.error("auditServices - getDataSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }
    generatePDFFromHTML = async (html) => {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.setContent(html);

        const pdfBuffer = await page.pdf({
            // format: 'Legal',
            landscape: false,
            margin: {
                top: '20px',
                right: '10px',
                bottom: '30px',
                left: '10px',
            },
        });

        await browser.close();

        return pdfBuffer;
    }


    getAuditShadulePdfGenerate = async (reqBody) => {
        const { DR_CD, IAR_NUMBER } = reqBody;
        const currentdate = new Date()
        try {
            let query;
            let query2;
            let response;
            let response2;

            if (reqBody.DR_CD !== '', IAR_NUMBER !== '') {
                const valueArray = IAR_NUMBER.split(', ').map(value => `'${value.trim()}'`);
                const formatValues = valueArray.join(', ');
                // query = `select * FROM SROUSER.AUDIT_PLAN  WHERE SR_CODE IN (SELECT SR_CODE FROM card.audit_master WHERE DR_CODE='${DR_CD}') and IAR_NUMBER in (${formatValues})`;
                query = `SELECT a.*, b.dr_name,dr_code
                FROM SROUSER.AUDIT_PLAN a
                LEFT JOIN card.audit_master b ON a.sr_code = b.sr_code
                WHERE a.IAR_NUMBER IN (${formatValues}) and dr_code='${DR_CD}'`;

                response = await this.orDao.oDBQueryService(query);
                // response2 = await this.orDao.oDBQueryService(query2);


            }
            // let imagePath = 'logos\\ap_logo.jpg'
            // let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });


            const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
            let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
            const html = `<div style="text-align: center; margin:10px; margin-top:0 ">
        <h3 style="margin:0px; margin-top : 3px"> <div style="display: inline-block; vertical-align: middle;">
        <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width: 75px; height: 75px; vertical-align: middle;">
    </div>OFFICE OF THE DISTRICT REGISTRER,(MV & AUDIT)</h3>
        <h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH,</h5>
<div style="display: flex; justify-content: space-between;">
    <p style="margin: 0; text-align: justify;">Circular Memo NO.: <b>IAR|8575|2023</b></p>
    <p style="margin: 0;">Date: ${new Date(currentdate).toLocaleDateString('en-GB')}</p>
</div>        <P><span style="color:red; text-align: left;">Sub:</span> INTIMATION OF INTERNAL AUDIT --Internal Audit Programme for the Period ${new Date(response[0].FROM_AUDIT_PERIOD).toLocaleDateString('en-GB')} to ${new Date(response[0].TO_AUDIT_PERIOD).toLocaleDateString('en-GB')} by the internal Audit Team of District Registrar,(Market Value & Audit) Andhra Pradesh __ Reg.</P>
        <h5>Ref: C & I.G.(R&S) A.P</h5>
        <span>*********</span>
        <p style="text-align: left;">The Internal Audit of the following offices for the period noted against each office will be taken up during the month of by the Office of the District Registrar (Market Value & Audit) Andhra Pradesh.</p>

        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
          <thead>
            <tr style="font-size : 10px;">
              <th style="border: 1px solid #000;  width: 5%; padding: 2px;">IAR NUMBER</th>
              <th style="border: 1px solid #000;  width: 5%; padding: 2px;">SRO NAME</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DATE OF AUDIT</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">PERIOD OF AUDIT</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF THE AUDITOR</th>
     
              
            </tr>
          </thead>
          <tbody style="font-size: small;">
            ${response
                    .map(
                        (item, index) => `
                  <tr key = ${index}>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.IAR_NUMBER}</td>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${new Date(item.FROM_DT_AUDIT).toLocaleDateString('en-GB')}-${new Date(item.TO_DT_AUDIT).toLocaleDateString('en-GB')}</td>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${new Date(item.FROM_AUDIT_PERIOD).toLocaleDateString('en-GB')}-${new Date(item.TO_AUDIT_PERIOD).toLocaleDateString('en-GB')}</td>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DR_EMPL_NAME}</td>
                  </tr>
                `
                    )
                    .join('')}
          </tbody>
        </table>
        <div style="padding-top :20px; text-align: justify;">It is informed that the audit will be taken up 1st 150 sale deeds of high value in case of A-Category offices(as defined in G.O.Ms No 638 Revenue (Registration-I)department), and 1st 100 such sale deeds in case of offices other than A-Category offices; 30% of Gift deeds, Settlement deeds of higher value; 10% of Mortgage deeds; 100% of the documents registered under "Anywhere registration" shall also be covered. All Partition deeds and Development Agreements; All miscellaneous documents relating to immovable properties registered in Book-I; All documents where stamp duty is denoted u/s 16 of Indian Stamp Act, 1899; All documents registered in post-manual option; All documents allowed exemption/concession of stamp duty and fee; All documents registered in Book-III and Book-IV. All documents for which grant was given to the properties involved in prohibited list , but admitted under specific reason.</div>
        <div style="padding-top :20px; text-align: justify;">The above Sub Registrars are requested to spare the services of one staff member exclusively and to keep list of records ready for the Audit and produce the same before the Audit Party. Futher suitable instructions may begiven to your staff so as to ensure that the relevant documents relating to state receipt, Audit Expenditure Account, which will be required during the inspection should be kept ready so that the objections raised are taken up for settlement. It may please be ensured that list of objections/memos issued during the audit period are returned with replies within 24 hours of their receipt at any date before the last date of inspection</div>
        <div style="padding-top :20px; text-align: justify;">It would be useful if the present Audit Party is utilized for the discussion of list the outstanding paras of previous Audit report based on the latest position and the action taken, the pending paras may be reviewed by the District Registrar (MV & Audit),Andhra Pradesh with a view to settle them as per rules.
       </div>
        <div style="padding-top :20px; text-align: justify;"> Please acknowledge the receipt of this intimation immediately. The audit party Is instructed to verity the stamp counter and e-challan, edit under the rescan request at the time of audit.</div>
        <h5 style="padding-top :10px; text-align: right;">DISTRICT REGISTRAR<h5>
        <p style="padding-top :1px; text-align: right;">(MARKET VALUE & AUDIT)</p>
        ${response.map((item, index) => (
                        `<p key={index} style= "padding-top: 1px;text-align: right;"}}>${item.DR_NAME}</p>`
                    ))}
        
      </div>
      <div style="margin : 0; margin-right:20px; margin-left:20px;" >
      </div>
        `;
            const pdfBuffer = await this.generatePDFFromHTML(html);
            const base64Pdf = pdfBuffer.toString('base64');

            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("MvRevisionHandler - getForm1 || Error :", ex);
            console.error("MvRevisionHandler - getForm1 || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getmisAuditDetailsSrvc = async (reqData) => {
        try {
            let query = `select * from srouser.mis_cash_audit where sr_code = ${reqData.SR_CODE} AND doct_no in (select DOCT_NO from  tran_major where RDOCT_NO in (${reqData.DOCT_NO}) and sr_code = ${reqData.SR_CODE} AND book_no in (${reqData.BOOK_NO}) and reg_year in (${reqData.REG_YEAR})) AND book_no in (${reqData.BOOK_NO}) and reg_year in (${reqData.REG_YEAR}) `;
            let response = await this.orDao.oDBQueryService(query);

            return response;
        } catch (ex) {
            Logger.error("AccountServices - getmisAuditDetailsSrvc || Error :", ex);
            console.error("AccountServices - getmisAuditDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }

    };
    getAuditDigFinalOrderReport = async (reqBody) => {
        const { SR_CODE, IAR_NUMBER } = reqBody;
        try {

            if (SR_CODE !== '' && IAR_NUMBER !== '') {
                let period = `select * FROM SROUSER.AUDIT_PLAN  WHERE IAR_NUMBER = '${IAR_NUMBER}'`
                let query = `SELECT 
                remark_item, 
                remark_sub_item, 
                doct_no || '/' || reg_year AS DOCUMENT,
                dig_remarks
            FROM 
                srouser.audit_remarks 
            WHERE 
                sr_code = ${SR_CODE}
                AND iar_number ='${IAR_NUMBER}'
            ORDER BY 
                CASE 
                WHEN REMARK_ITEM = 'Loss of Revenue' THEN 1
                WHEN REMARK_ITEM = 'Procedures lapse' THEN 2
                ELSE 3
            END`;

                const response = await this.orDao.oDBQueryService(query);
                const periodresponse = await this.orDao.oDBQueryService(period);
                let tableRows = '';
                let tableRows2 = '';
                let tableRows3 = '';


                // First, add rows for 'Loss of Revenue'
                response.forEach(row => {
                    if (row.REMARK_ITEM === 'Loss of Revenue') {
                        tableRows += `
                        <tr>
                        <td style="border: 1px solid #000; padding: 8px;">${row.DOCUMENT}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${row.REMARK_ITEM}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${row.REMARK_SUB_ITEM}</td>
                           
                            <td style="border: 1px solid #000; padding: 8px;">${row.DIG_REMARKS}</td>
                        </tr>
                    `;
                    }
                });

                // Then, add rows for 'Procedures lapse'
                response.forEach(row => {
                    if (row.REMARK_ITEM === 'Procedures lapse') {
                        tableRows2 += `
                        <tr>
                        <td style="border: 1px solid #000; padding: 8px;">${row.DOCUMENT}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${row.REMARK_ITEM}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${row.REMARK_SUB_ITEM}</td>
                           
                            <td style="border: 1px solid #000; padding: 8px;">${row.DIG_REMARKS}</td>
                        </tr>
                    `;
                    }
                });
                response.forEach(row => {
                    if (row.REMARK_ITEM != 'Loss of Revenue' && row.REMARK_ITEM != 'Procedures lapse') {
                        tableRows3 += `
                        <tr>
                        <td style="border: 1px solid #000; padding: 8px;">${row.DOCUMENT}</td>
                            
                            <td style="border: 1px solid #000; padding: 8px;">${row.REMARK_ITEM}</td>
                            <td style="border: 1px solid #000; padding: 8px;">${row.DIG_REMARKS}</td>
                        </tr>
                    `;
                    }
                });


                // let imagePath = 'logos\\ap_logo.jpg';
                // let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

                const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
                let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

                const html = `
                <div style="text-align: center; margin:20px; margin-top:0;" >
                <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width: 75px; height: 75px; vertical-align: middle;">
                </div>
                    <div style="text-align: center; margin:20px; margin-top:0 ">
                        <h3 style="margin:0px; margin-top: 5px">
                            <div style="display: inline-block; vertical-align: middle;"></div>
                            REVIEW OF THE INTERNAL AUDIT REPORT OF ${IAR_NUMBER} for the period ${new Date(periodresponse[0].FROM_AUDIT_PERIOD).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} to ${new Date(periodresponse[0].TO_AUDIT_PERIOD).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            Audit Conducted by District Registrar (M V & A) VIJAYAWADA.
                        </h3>
                        <h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH,</h5>
                        <h4>PART-A</h4>
                       <h4 style="text-align:justify">Document Wise </h4>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                            
                                <tr>
                                <th style="border: 1px solid #000; padding: 8px;">Document No</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Remark Item</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Remark Sub Item</th>
                                   
                                    <th style="border: 1px solid #000; padding: 8px;">Dig Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr>    
                           
                            ${tableRows}
                            </tr>
                            </tbody>
                        </table>

                         <h4>PART-B</h4>
                        <h4 style="text-align:justify">Document Wise </h4>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                            
                                <tr>
                                <th style="border: 1px solid #000; padding: 8px;">Document No</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Remark Item</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Remark Sub Item</th>
                                    
                                    <th style="border: 1px solid #000; padding: 8px;">Dig Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr >
                            ${tableRows2}</tr>
                            </tbody>
                        </table>
                        <h4>PART-C</h4>
                        <h4 style="text-align:justify">Non-Document Wise </h4>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                            
                                <tr>
                                    <th style="border: 1px solid #000; padding: 8px;">Non-Document No</th>
                                    <th style="border: 1px solid #000; padding: 8px;">Remark Item</th>
                                   
                                   
                                    <th style="border: 1px solid #000; padding: 8px;">Dig Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr >
                            ${tableRows3}</tr>
                            </tbody>
                        </table>
                        <h5 style="padding-top: 20px; text-align: right;">DEPUTY INSPECTOR GENERAL</h5>

                    </div>
                `;
                const pdfBuffer = await this.generatePDFFromHTML(html);
                const base64Pdf = pdfBuffer.toString('base64');

                return base64Pdf;
            }
        } catch (ex) {
            Logger.error("auditServices - getAuditDigFinalOrderReport || Error :", ex);
            console.error("auditServices - getAuditDigFinalOrderReport || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getCheckSlipReportsSrvc = async (reqData) => {
        try {
            const isRdoc = reqData.rDoc ? `rdoct_no=${reqData.rDoc}` : `doct_no=${reqData.docNo}`;
            const linkRDoc = reqData.rDoc ? `r_doctno=${reqData.rDoc}` : `c_doctno=${reqData.docNo}`;
            let queries = [
                {
                    type: 'docDetails',
                    query: `select a.*,(select sr_name from sr_master where sr_cd = a.sr_code) srname,
                    to_char(p_date,'dd/mm/yyyy') p_date1,to_char(e_date,'dd/mm/yyyy') e_date1 from srouser.tran_major a where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear}`
                },
                {
                    type: 'partyDetails',
                    query: reqData.flag ? `select a.*,b.* from srouser.tran_ec a,srouser.tran_ec_aadhar_esign b where a.sr_code=${reqData.srCode} and a.book_no=${reqData.bookNo} and a.reg_year=${reqData.regYear} and a.doct_no=${reqData.docNo}
                    and a.sr_code=b.sr_code and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.book_no=b.book_no and a.code=substr(b.code,1,2) and 
                    a.ec_number=b.ec_number` : `select * from srouser.tran_ec where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and reg_year=${reqData.regYear} and ${isRdoc}`
                },
                {
                    type: 'representative',
                    query: `select * from srouser.tran_ec_firms where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear}`
                },
                {
                    type: 'schedule',
                    query: reqData.flag ? `SELECT  A.*,B.*,(SELECT LOCAL_BODY_DESC FROM local_body_dir i where i.LOCAL_BODY_CODE=A.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE , (SELECT LOCAL_BODY_NAME FROM hab_local_body j where j.HAB_CODE=A.HAB_CODE AND ROWNUM = 1 ) AS LOCAL_BODY_NAME,(SELECT VILLAGE_NAME FROM HAB_CODE WHERE HAB_CODE=A.VILLAGE_CODE||'01') VILLAGENAME,
                    (SELECT CLASS_DESC FROM AREA_CLASS WHERE NATURE_USE=CLASS_CODE) LANDUSE FROM SROUSER.TRAN_SCHED A,  
                    SROUSER.ADANGAL_DETAILS  B
                    WHERE A.SR_CODE=B.SR_CODE(+)
                    AND A.BOOK_NO=B.BOOK_NO(+)
                    AND A.DOCT_NO=B.DOCT_NO(+)
                    AND A.REG_YEAR=B.REG_YEAR(+)
                    AND A.schedule_no=B.schedule_no(+)
                    AND A.SR_CODE=${reqData.srCode} AND A.BOOK_NO=${reqData.bookNo} AND A.${isRdoc} AND A.REG_YEAR=${reqData.regYear}` : `select  a.*,(SELECT LOCAL_BODY_DESC FROM local_body_dir i where i.LOCAL_BODY_CODE=a.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE , (SELECT LOCAL_BODY_NAME FROM hab_local_body j where j.HAB_CODE=a.HAB_CODE AND ROWNUM = 1 ) AS LOCAL_BODY_NAME,(select village_name from hab_code where hab_code=a.village_code||'01') villagename,(select class_desc from area_class where nature_use=class_code) landuse from srouser.tran_sched a where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear}`
                },
                {
                    type: 'structure',
                    query: `select * from srouser.stru_det where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear}`
                },
                {
                    type: 'linkDocuments',
                    query: `select a.*,b.sr_name from srouser.recti a,sr_master b where a.l_srcd=b.sr_cd and c_srcd=${reqData.srCode} and c_bno=${reqData.bookNo} and ${linkRDoc} and c_regyear=${reqData.regYear}`
                },
                // {
                //     type: 'basicDetails',
                //     query: `select * from srouser.doc_ack where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear}`
                // },
                // {
                //     type: 'docStatus',
                //     query: `select * from srouser.pde_doc_status_cr where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and doct_no =${isRdoc} and reg_year=${reqData.regYear}`
                // },   
            ];
            if (reqData.sliceNumer) {
                queries = queries.slice(0, reqData.sliceNumer);
            }
            let response = {};


            for (let i = 0; i < queries.length; i++) {

                response[queries[i].type] = await this.orDao.oDBQueryServiceread(queries[i].query)
            }
            return response;

        } catch (ex) {
            Logger.error("checkSlipReportServices - getCheckSlipReportsSrvc || Error :", ex);
            console.error("checkSlipReportServices - getCheckSlipReportsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
}

module.exports = auditServices;