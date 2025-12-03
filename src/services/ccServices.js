const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const axios = require('axios');
// const oracleDb = require('oracledb');
// const dotenv = require('dotenv');
// dotenv.config();
class CCServices {
    constructor() {
        this.orDao = new OrDao();
    }
    getSroDetailsSrvc = async () => {
        try {
            let query = `SELECT SR_CD, SR_NAME FROM CARD.sr_master WHERE STATE_CD = '01'`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("CCServices - getSroDetails || Error :", ex);
            console.error("CCServices - getSroDetails || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getChallanSrvc = async (reqData) => {
        try {
            let query = `SELECT * FROM cfms_challans WHERE cfms_challan = '${reqData.CHALLAN_NO}'`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("CCServices - getChallan || Error :", ex);
            console.error("CCServices - getChallan || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getDataSrvc = async (reqData) => {
        try {
            let result;
            const checkQuery = `select count(*) as count from tran_major tm
                                join pde_doc_status_cr pde on tm.sr_code = pde.sr_code
                                and tm.doct_no = pde.doct_no
                                and tm.reg_year = pde.reg_year
                                and tm.book_no = pde.book_no
                                where tm.SR_CODE=:srCode AND tm.BOOK_NO=:bookNo AND tm.ryear = :regYear AND tm.RDOCT_NO=:doctNo`;
            let bindParams = {
                srCode: reqData.SR_CODE,
                bookNo: reqData.BOOK_NO,
                regYear: reqData.REG_YEAR,
                doctNo: reqData.DOCT_NO
            }
    
            const checkResult = await this.orDao.oDBQueryServiceWithBindParams(checkQuery, bindParams);
    
            let imageQuery = `SELECT IMAGE FROM cardimages.digitally_sign_docs WHERE SR_CODE=:srCode AND BOOK_NO=:bookNo AND REG_YEAR = :regYear AND DOCT_NO=:doctNo`;
            result = await this.orDao.oDBQueryServiceCCWithBindParams(imageQuery, bindParams);
    
            if (result.length === 0 || checkResult[0].COUNT > 0) {
                try {
                    let query = `SELECT doct_no, reg_year FROM tran_major WHERE SR_CODE=:srCode AND BOOK_NO=:bookNo AND ryear = :regYear AND RDOCT_NO=:doctNo`;
                    result = await this.orDao.oDBQueryServiceWithBindParams(query, bindParams);
    
                    if(result.length > 0) {
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
                            result = [];
                        } else {
                            result = response.data.data;
                        }
                    } else {
                        result = [];
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
    getDataSrvcDoc = async (reqData) => {
        try {
            let imageQuery = `SELECT IMAGE FROM cardimages.digitally_sign_docs WHERE SR_CODE=${reqData.SR_CODE} AND BOOK_NO=${reqData.BOOK_NO} AND REG_YEAR = ${reqData.REG_YEAR} AND RDOCT_NO=${reqData.RDOCT_NO}`;
            let result = await this.orDao.oDBQueryServiceCC(imageQuery);
            if (result.length === 0) {
                let pdfQuery = `SELECT LOCATION FROM scanuser.img_base_cca WHERE SRO_CODE=${reqData.SR_CODE} AND BOOK_NO=${reqData.BOOK_NO} AND RYEAR = ${reqData.REG_YEAR} AND DOCT_NO=${reqData.DOCT_NO}`;
                result = await this.orDao.oDBQueryService(pdfQuery);
                if (result.length === 0) {
                    console.log("No Data Found in scanuser Table");
                } else {
                    const pdfFilePathFromDB = result[0].LOCATION;
                    if (pdfFilePathFromDB) {
                        const reversedPath = pdfFilePathFromDB.split('').reverse().join('');
                        const removedCharsPath = reversedPath.slice(4);
                        const finalPath = removedCharsPath.replace(/\//g, '@');
                        const url = process.env.ORACLE_URL;
                        const downloadLink = url.concat(finalPath);
                        result[0].LOCATION = downloadLink;
                        result[0].type = "link";
                    }
                }
            }
            return result;
        } catch (ex) {
            Logger.error("CCServices - getDataSrvc || Error :", ex);
            console.error("CCServices - getDataSrvc || Error :", ex);
            throw new CARDError(ex);
        }
    }

    searchByName = async (reqData) => {
        try {
            let srquery;
            if(reqData.DR_CD){
                srquery= ` SR_CODE IN (select sr_cd from sr_master where dr_cd='${reqData.DR_CD}' ) AND`
            }
            else{
                srquery=''
            }
            let Query = `SELECT distinct IND1V.SR_CODE, SR_MASTER.SR_NAME, IND1V.REG_YEAR, IND1V.DOCT_NO
            FROM IND1V
            JOIN SR_MASTER ON IND1V.SR_CODE = SR_MASTER.SR_CD
            WHERE
            ${srquery}
            UPPER(IND1V.INDGP_NAME) LIKE '%${reqData.LAST_NAME}%${reqData.FIRST_NAME}%${reqData.MIDDLE_NAME}%' AND UPPER(R_NAME) LIKE '%${reqData.RLAST_NAME}%${reqData.RFIRST_NAME}%${reqData.RMIDDLE_NAME}%'
            ORDER BY SR_CODE, DOCT_NO, REG_YEAR`;
           
            console.log(Query, 'poejroeje');
            let result = await this.orDao.oDBQueryService(Query);
if(result.length>0){
            let InsertQuery = `INSERT INTO SROUSER.TRAN_NAME_SEARCH (
                DISTRICT,
                FIRST_NAME,
                MIDDLE_NAME,
                LAST_NAME,
                RFIRST_NAME,
                RMIDDLE_NAME,
                RLAST_NAME,
                TIME_STAMP,
                USER_NAME
            ) VALUES (
                '${reqData.DISTRICT}',
                '${reqData.FIRST_NAME}',
                '${reqData.MIDDLE_NAME}',
                '${reqData.LAST_NAME}',
                '${reqData.RFIRST_NAME}',
                '${reqData.RMIDDLE_NAME}',
                '${reqData.RLAST_NAME}',
                SYSDATE,
                '${reqData.USER_NAME}'
            )`;
            // console.log(Query, 'poejroeje');
            let response = await this.orDao.oDbInsertDocs(InsertQuery);
            }
            return result;
        } catch (ex) {
            Logger.error("CCServices - searchByName || Error :", ex);
            console.error("CCServices - searchByName || Error :", ex);
            throw new CARDError(ex);
        }
    }

    getCurrentTimeSrvc = async () => {
        try {
            let query = `SELECT TO_CHAR(SYSTIMESTAMP, 'Dy Mon DD YYYY HH24:MI:SS') || ' GMT+0530 (India Standard Time)' AS CURRENT_DATE FROM dual`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("CCServices - getCurrentTimeSrvc || Error :", ex);
            console.error("CCServices - getCurrentTimeSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

}

module.exports = CCServices;