
const OrDao = require('../dao/oracledbDao');
const oracleDb = require('oracledb');
// const { constructPDEError } = require("../handlers/errorHandler");
const { constructCARDError } = require("../handlers/errorHandler");
const path = require('path');
const fsone = require('fs');
const { result } = require('lodash');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const moment = require('moment');
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const EXECUTANT_CODES = ["EX", "MR", "DR", "RR", "FP", "LR", "PL", "TR", "NP", "DC", "OR", "HS", "PA", "AR", "FP", 'E'];
const CLAIMANT_CODES = ['RE','AY','TE','CL','LE','ME','DE','OE','AP','SP','WI'];

 
const { Logger } = require('../../services/winston');

const Esign = require('../services/esignService');
const coordinates=require('../services/refuseServices');
const { PDFDocument, rgb } = require('pdf-lib');
const { encryptWithAESPassPhrase, AadharencryptData } = require('../utils');

 
const convertBase64ToPdf = async (base64String) => {
    const decodedBuffer = Buffer.from(base64String, 'base64');
    const pdfDoc = await PDFDocument.load(decodedBuffer);
    return pdfDoc.save();
  }
  const savePdfToFile = async (pdfBytes, filePath) => {
    await fs.writeFile(filePath, pdfBytes);
    return true;
  }


class UpdateDocument {
    constructor() {
        this.orDao = new OrDao();
        this.esign = new Esign();
        this.coordinates=new coordinates();
    }

    fetchTranMajor = async (reqData) => {
        try {
            let query = `select a.*,(select tran_desc from tran_dir where tran_maj_code = a.tran_maj_code and tran_min_code = a.tran_min_code and rownum = 1) as tran_desc from tran_major a where a.sr_code = ${reqData.SR_CODE} and a.book_no = ${reqData.BOOK_NO} and a.doct_no =${reqData.DOCT_NO} and a.reg_year = ${reqData.REG_YEAR}`
            let result = await this.orDao.oDBQueryService(query);
            return result;
        }
        catch (ex) {
            console.error("Update Document - fetchTranMajor || Error : ", ex );
            throw constructCARDError(ex);
        }
    }

    getTranEC = async (reqData) => {
        try {
            // let query = `select * from tran_ec where sr_code = ${reqData.SR_CODE} and book_no = ${reqData.BOOK_NO} and doct_no =${reqData.DOCT_NO} and reg_year = ${reqData.REG_YEAR}`
            let query =`select DISTINCT a.*,b.reference_id,b.service_type,b.NEW_COUNT,b.FIRM_NUMBER,b.PARTY_TYPE from tran_ec a left join srouser.tran_ec_edit b on a.sr_code=b.sr_code and a.book_no=b.book_no and a.reg_year=b.reg_year and a.doct_no=b.doct_no and a.ec_number=b.EC_NUMBER and a.code=b.code where a.sr_code='${reqData.SR_CODE}' and a.reg_year='${reqData.REG_YEAR}' and a.doct_no='${reqData.DOCT_NO}' and a.book_no='${reqData.BOOK_NO}'  and b.REFERENCE_ID = '${reqData.REFERENCE_ID}' and b.status='P' and b.firm_number is null`;
            let ServiceTypeAddQuery =`select * from srouser.tran_ec_edit where sr_code='${reqData.SR_CODE}' and reg_year='${reqData.REG_YEAR}' and doct_no='${reqData.DOCT_NO}' and book_no='${reqData.BOOK_NO}' and status='P' and REFERENCE_ID = '${reqData.REFERENCE_ID}'`;
            let result = await this.orDao.oDBQueryService(query);
            let ServiceTypeAddResult = await this.orDao.oDBQueryService(ServiceTypeAddQuery);
            return {result : result, ServiceTypeAddResult:ServiceTypeAddResult};
        }
        catch (ex) {
            console.error("Update Document - getTranEC || Error : ", ex );
            throw constructCARDError(ex);
        }
    }


    getRepresentativeDetails = async (reqData) => {
        try {
            let query = `select DISTINCT a.*,b.* from tran_ec_firms a left join srouser.tran_ec_edit b on a.sr_code=b.sr_code and a.book_no=b.book_no and a.reg_year=b.reg_year and a.doct_no=b.doct_no and a.ec_number=b.EC_NUMBER and a.code=b.code where a.sr_code = ${reqData.SR_CODE} and a.book_no = ${reqData.BOOK_NO} and a.doct_no =${reqData.DOCT_NO} and a.reg_year = ${reqData.REG_YEAR}  and b.REFERENCE_ID = '${reqData.REFERENCE_ID}' and b.party_type='R' and b.firm_number is not null`
            let result = await this.orDao.oDBQueryService(query);
            return result;
        }
        catch (ex) {
            console.error("Update Document - getRepresentativeDetails || Error : ", ex );
            throw constructCARDError(ex);
        }
    }


    getTranSched = async (reqData) => {
        try {
            let query = `select DISTINCT a.*,b.* from  tran_sched a left join srouser.tran_sched_edit b on a.sr_code=b.sr_code and a.book_no=b.book_no and a.reg_year=b.reg_year and a.doct_no=b.doct_no and a.schedule_no=b.schedule_no where a.sr_code = ${reqData.SR_CODE} and a.book_no = ${reqData.BOOK_NO} and a.doct_no =${reqData.DOCT_NO} and a.reg_year = ${reqData.REG_YEAR}  and b.REFERENCE_ID = '${reqData.REFERENCE_ID}' and b.status='P' AND SERVICE_TYPE!='A'`;
            let AddingPropertyQuery = `select * from srouser.tran_sched_edit where sr_code='${reqData.SR_CODE}' and reg_year='${reqData.REG_YEAR}' and doct_no='${reqData.DOCT_NO}' and book_no='${reqData.BOOK_NO}' and status='P' and service_type='A' and REFERENCE_ID = '${reqData.REFERENCE_ID}'`;
            let PartitionPartiesNumber = `select count(*) as PARTIES_NUMBER from srouser.tran_ec where sr_code='${reqData.SR_CODE}' and reg_year='${reqData.REG_YEAR}' and doct_no='${reqData.DOCT_NO}' and book_no='${reqData.BOOK_NO}'`;
            let result = await this.orDao.oDBQueryService(query);
            let AddingPropertyResult = await this.orDao.oDBQueryService(AddingPropertyQuery);
            let PartitionPartiesNumberResult = await this.orDao.oDBQueryService(PartitionPartiesNumber);
            return {result : result, PartitionPartiesNumber:PartitionPartiesNumberResult, AddingPropertyResult:AddingPropertyResult};
        }
        catch (ex) {
            console.error("Update Document - getTranSched || Error : ", ex );
            throw constructCARDError(ex);
        }
    }


    getLinkDocuments = async (reqData) => {
        try {
            const query = `
                select a.*, b.NUM_LINK,B.REFERENCE_ID 
                from recti a 
                left join srouser.recti_edit b 
                on a.C_SRCD = b.C_SRCD 
                and a.C_BNO = b.C_BNO 
                and a.C_DOCTNO = b.C_DOCTNO 
                and a.C_REGYEAR = b.C_REGYEAR
                and a.L_SRCD=b.L_SRCD
                and a.L_BNO=b.L_BNO
                and a.L_DOCTNO=b.L_DOCTNO
                and a.L_REGYEAR=b.L_REGYEAR
                and a.C_SCHNO=b.C_SCHNO   
                where a.C_SRCD = :SR_CODE
                and a.C_BNO = :BOOK_NO 
                and a.C_DOCTNO = :DOCT_NO
                and a.C_REGYEAR = :REG_YEAR
                and b.status = 'P' and b.REFERENCE_ID = :REFERENCE_ID
            `;
    
            const query1 = `
                select a.*, rowid
                from srouser.recti_edit a
                where C_SRCD = :SR_CODE 
                and C_REGYEAR = :REG_YEAR
                and C_DOCTNO = :DOCT_NO
                and C_BNO = :BOOK_NO
                and status = 'P' and REFERENCE_ID = :REFERENCE_ID
                union all
                select 
                    a.C_SRCD,
                    a.C_BNO,
                    a.C_DOCTNO,
                    a.C_REGYEAR,
                    b.L_SRCD,
                    b.L_BNO,
                    b.L_DOCTNO,
                    b.L_REGYEAR,
                    b.CODE,
                    b.C_SCHNO,
                    b.L_SCHNO,
                    a.R_DOCTNO,
                    a.R_YEAR,
                    a.STATUS,
                    a.SERVICE_TYPE,
                    a.NUM_LINK,
                    a.REFERENCE_ID,
                    b.rowid 
                from srouser.recti_edit a 
                join srouser.recti_temp b 
                on a.C_SRCD = b.C_SRCD 
                and a.C_BNO = b.C_BNO 
                and a.C_DOCTNO = b.C_DOCTNO 
                and a.C_REGYEAR = b.C_REGYEAR
                where a.C_SRCD = :SR_CODE 
                and a.C_REGYEAR = :REG_YEAR
                and a.C_DOCTNO = :DOCT_NO
                and a.C_BNO = :BOOK_NO 
                and a.status = 'P' and a.REFERENCE_ID = :REFERENCE_ID
            `;
            const bindParams = {
                SR_CODE: reqData.SR_CODE,
                BOOK_NO: reqData.BOOK_NO,
                DOCT_NO: reqData.DOCT_NO,
                REG_YEAR: reqData.REG_YEAR,
                REFERENCE_ID: reqData.REFERENCE_ID
            };
            const result = await this.orDao.oDBQueryServiceWithBindParams(query,bindParams);            
            if (result && result.length > 0) {
                return result;
            } else {
                const fallbackResult = await this.orDao.oDBQueryServiceWithBindParams(query1, bindParams);
                return fallbackResult;
            }
        } catch (ex) {
            console.error("Update Document - getLinkDocuments || Error : ", ex);
            throw constructCARDError(ex);
        }
    };
    

    updateTranECFIRMS = async (reqData) => {
        try {
            const {SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, REFERENCE_ID, NAME, R_CODE, R_NAME, AGE, ADDRESS1, ADDRESS2, RYEAR, RDOCT_NO, PAN_NO, AADHAR, EC_NUMBER, CODE, FIRM_NUMBER, CAPACITY} = reqData;
          // Check if record exists
          const checkQuery = `SELECT COUNT(*) AS COUNT FROM srouser.tran_ec_firms_temp WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR AND code = :CODE AND ec_number = :EC_NUMBER AND firm_number= :FIRM_NUMBER AND reference_id = :REFERENCE_ID`;
          const checkParams = {
            SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, REFERENCE_ID,EC_NUMBER, CODE, FIRM_NUMBER
          };
           const AllParams = {
            ...checkParams,
                NAME: NAME || null,
                R_CODE: R_CODE || null,
                R_NAME: R_NAME || null,
                AGE: AGE || null,
                ADDRESS1: ADDRESS1 || null,
                ADDRESS2: ADDRESS2 || null,
                CAPACITY: CAPACITY || null,
                RYEAR: RYEAR || null,
                RDOCT_NO: RDOCT_NO || null,
                PAN_NO: PAN_NO || null,
                AADHAR: AADHAR || null,
           };   
            const checkResult = await this.orDao.oDBQueryServicemis(checkQuery, checkParams);            
            const recordExists = checkResult?.[0]?.COUNT > 0;
            let query = '';
            let bindParams = {};
            if (recordExists) {
                 query = `
                UPDATE srouser.tran_ec_firms_temp
                SET 
                  name = NVL(:NAME, name),
                  r_code = NVL(:R_CODE, r_code),
                  r_name = NVL(:R_NAME, r_name),
                  age = NVL(:AGE, age),
                  address1 = NVL(:ADDRESS1, address1),
                  address2 = NVL(:ADDRESS2, address2),
                  capacity = NVL(:CAPACITY, capacity),
                  ryear = NVL(:RYEAR, ryear),
                  rdoct_no = NVL(:RDOCT_NO, rdoct_no),
                  pan_no = NVL(:PAN_NO, pan_no),
                  aadhar = NVL(:AADHAR, aadhar)
                WHERE 
                  sr_code = :SR_CODE AND 
                  book_no = :BOOK_NO AND 
                  doct_no = :DOCT_NO AND 
                  reg_year = :REG_YEAR AND 
                  code = :CODE AND 
                  ec_number = :EC_NUMBER AND 
                  firm_number = :FIRM_NUMBER
                    AND reference_id = :REFERENCE_ID
              `;
              
               bindParams = {...AllParams, };
        }
        else {
             query = `insert into srouser.tran_ec_firms_temp (sr_code, book_no, doct_no, reg_year, code, ec_number, reference_id, name, r_code, r_name, age, address1, address2, capacity, ryear, rdoct_no, pan_no, aadhar, firm_number) values 
             (:SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :CODE, :EC_NUMBER, :REFERENCE_ID, :NAME, :R_CODE, :R_NAME, :AGE, :ADDRESS1, :ADDRESS2, :CAPACITY, :RYEAR, :RDOCT_NO, :PAN_NO, :AADHAR, :FIRM_NUMBER)`;
              bindParams = {...AllParams, };
            }
            const queries = [{ query, bindParams }];
            return await this.orDao.oDbMultipleInsertDocsWithBindParams(queries, bindParams);
        }
        catch (ex) {
            console.error("Update Document - updateTranECFIRMS || Error : ", ex );
            throw constructCARDError(ex);
        }
      }
    
      updateTranEC = async (reqData) => {
        try {
          const {SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, CODE, EC_NUMBER, REFERENCE_ID, NAME, R_CODE, R_NAME, AGE, ADDRESS1, ADDRESS2, RYEAR, RDOCT_NO, PAN_NO, AADHAR} = reqData;
          // Check if record exists
          const checkQuery = `SELECT COUNT(*) AS COUNT FROM srouser.tran_ec_temp WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR AND code = :CODE AND ec_number = :EC_NUMBER AND reference_id = :REFERENCE_ID`;
          const checkParams = {
            SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR,
            CODE, EC_NUMBER, REFERENCE_ID
          };

          const checkResult = await this.orDao.oDBQueryServicemis(checkQuery, checkParams);
          const recordExists = checkResult?.[0]?.COUNT > 0;
          
          const dataParams = {
            NAME: NAME || null,
            R_CODE: R_CODE || null,
            R_NAME: R_NAME || null,
            AGE: AGE || null,
            ADDRESS1: ADDRESS1 || null,
            ADDRESS2: ADDRESS2 || null,
            RYEAR: RYEAR || null,
            RDOCT_NO: RDOCT_NO || null,
            PAN_NO: PAN_NO || null,
            AADHAR: AADHAR || null
          };
      
          let query = '';
          let bindParams = {};
      
          if (recordExists) {
            // FOR UPDATE
            query = `
              UPDATE srouser.tran_ec_temp SET
                name = NVL(:NAME, name),
                r_code = NVL(:R_CODE, r_code),
                r_name = NVL(:R_NAME, r_name),
                age = NVL(:AGE, age),
                address1 = NVL(:ADDRESS1, address1),
                address2 = NVL(:ADDRESS2, address2),
                ryear = NVL(:RYEAR, ryear),
                rdoct_no = NVL(:RDOCT_NO, rdoct_no),
                pan_no = NVL(:PAN_NO, pan_no),
                aadhar = NVL(:AADHAR, aadhar)
              WHERE sr_code = :SR_CODE
                AND book_no = :BOOK_NO
                AND doct_no = :DOCT_NO
                AND reg_year = :REG_YEAR
                AND code = :CODE
                AND ec_number = :EC_NUMBER
                AND reference_id = :REFERENCE_ID
            `;
            bindParams = { ...checkParams, ...dataParams };
          } else {
            // FOR INSERT
            query = `
              INSERT INTO srouser.tran_ec_temp (
                sr_code, book_no, doct_no, reg_year, code, ec_number, reference_id,
                name, r_code, r_name, age, address1, address2, ryear, rdoct_no, pan_no, aadhar
              ) VALUES (
                :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :CODE, :EC_NUMBER, :REFERENCE_ID,
                :NAME, :R_CODE, :R_NAME, :AGE, :ADDRESS1, :ADDRESS2, :RYEAR, :RDOCT_NO, :PAN_NO, :AADHAR
              )
            `;
            bindParams = { ...checkParams, ...dataParams };
          }
      
          const queries = [{ query, bindParams }];
          return await this.orDao.oDbMultipleInsertDocsWithBindParams(queries);
      
        } catch (ex) {
          console.error("updateTranEC || Error: ", ex);
          throw constructCARDError(ex);
        }
      };
      
      
      
      
      updateTransched = async (reqData) => {
        try {
            const {
                WARD_NO, BLOCK_NO, LOC_CODE, LOC_HAB_NAME, ROAD_CODE,
                LOCAL_BODY, VILLAGE_CODE, HAB_CODE, SURVEY_NO, OLD_SURVEY_NO,
                PLOT_NO, OLD_PLOT_NO, NEW_HOUSE_NO, OLD_HOUSE_NO, EAST, WEST, NORTH, SOUTH,
                EXTENT, UNIT, EXTENT_RATE, EXTENT_UNIT, NATURE_USE, FLAT_NONFLAT,
                APT_NAME, FLAT_NO, TOT_FLOOR, PREV_SRCODE, PREV_DOCTNO, PREV_RYEAR,
                PREV_SCHNO, CON_VALUE, MKT_VALUE, TAXABLE_VALUE, CHARG_ITEM_CD, ANNUAL_RENT,
                LEASE_DATE, LEASE_PERIOD, LEASE_ADV, TYPE_OF_ADV, LEASE_IMP, LEASE_TAX,
                PARTY_NO, JURISDICTION, ULC_ACT, MORE_SCH, SVIL, SCOL, SAPN, RYEAR, RDOCT_NO,
                ADD_VALUE, ADD_DESC, P_P_DESC, NEAR_HNO, TOTAL_PLINTH, PREV_BNO, ADV_AMOUNT,
                TERRACE_EXTENT, TERRACE_UNIT, MRO_PUSH, APT_NORTH, APT_SOUTH, APT_EAST,
                APT_WEST, APT_EXTENT, APT_EXTENT_UNIT, VILL_CODE_ALIAS, SURVEY_EXT,
                SURVEY_EXT_UNIT, MULTI_SURVEY, DOORNO, BI_WARD, BI_BLOCK, LP_NO, PLP_NO,
                LPM_SURVEYNO, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO,REFERENCE_ID
              } = reqData;
              
            const checkQuery = `
            SELECT COUNT(*) AS COUNT FROM srouser.tran_sched_temp
           WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND doct_no =  :DOCT_NO AND reg_year = :REG_YEAR and schedule_no = :SCHEDULE_NO AND reference_id = :REFERENCE_ID`;
           const checkParams = {
            SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR,
            REFERENCE_ID,SCHEDULE_NO,
          };
          let bindParams = {
            WARD_NO: WARD_NO || null,
            BLOCK_NO: BLOCK_NO || null,
            LOC_CODE: LOC_CODE || null,
            LOC_HAB_NAME: LOC_HAB_NAME || null,
            ROAD_CODE: ROAD_CODE || null,
            LOCAL_BODY: LOCAL_BODY || null,
            VILLAGE_CODE: VILLAGE_CODE || null,
            HAB_CODE: HAB_CODE || null,
            SURVEY_NO: SURVEY_NO || null,
            OLD_SURVEY_NO: OLD_SURVEY_NO || null,
            PLOT_NO: PLOT_NO || null,
            OLD_PLOT_NO: OLD_PLOT_NO || null,
            NEW_HOUSE_NO: NEW_HOUSE_NO || null,
            OLD_HOUSE_NO: OLD_HOUSE_NO || null,
            EAST: EAST || null,
            WEST: WEST || null,
            NORTH: NORTH || null,
            SOUTH: SOUTH || null,
            EXTENT: EXTENT || null,
            UNIT: UNIT || null,
            EXTENT_RATE: EXTENT_RATE || null,
            EXTENT_UNIT: EXTENT_UNIT || null,
            NATURE_USE: NATURE_USE || null,
            FLAT_NONFLAT: FLAT_NONFLAT || null,
            APT_NAME: APT_NAME || null,
            FLAT_NO: FLAT_NO || null,
            TOT_FLOOR: TOT_FLOOR || null,
            PREV_SRCODE: PREV_SRCODE || null,
            PREV_DOCTNO: PREV_DOCTNO || null,
            PREV_RYEAR: PREV_RYEAR || null,
            PREV_SCHNO: PREV_SCHNO || null,
            CON_VALUE: CON_VALUE || null,
            MKT_VALUE: MKT_VALUE || null,
            TAXABLE_VALUE: TAXABLE_VALUE || null,
            CHARG_ITEM_CD: CHARG_ITEM_CD || null,
            ANNUAL_RENT: ANNUAL_RENT || null,
            LEASE_DATE: LEASE_DATE || null,
            LEASE_PERIOD: LEASE_PERIOD || null,
            LEASE_ADV: LEASE_ADV || null,
            TYPE_OF_ADV: TYPE_OF_ADV || null,
            LEASE_IMP: LEASE_IMP || null,
            LEASE_TAX: LEASE_TAX || null,
            PARTY_NO: PARTY_NO || null,
            JURISDICTION: JURISDICTION || null,
            ULC_ACT: ULC_ACT || null,
            MORE_SCH: MORE_SCH || null,
            SAPN: SAPN || null,
            RYEAR: RYEAR || null,
            RDOCT_NO: RDOCT_NO || null,
            ADD_VALUE: ADD_VALUE || null,
            ADD_DESC: ADD_DESC || null,
            P_P_DESC: P_P_DESC || null,
            NEAR_HNO: NEAR_HNO || null,
            TOTAL_PLINTH: TOTAL_PLINTH || null,
            PREV_BNO: PREV_BNO || null,
            ADV_AMOUNT: ADV_AMOUNT || null,
            TERRACE_EXTENT: TERRACE_EXTENT || null,
            TERRACE_UNIT: TERRACE_UNIT || null,
            MRO_PUSH: MRO_PUSH || null,
            APT_NORTH: APT_NORTH || null,
            APT_SOUTH: APT_SOUTH || null,
            APT_EAST: APT_EAST || null,
            APT_WEST: APT_WEST || null,
            APT_EXTENT: APT_EXTENT || null,
            APT_EXTENT_UNIT: APT_EXTENT_UNIT || null,
            VILL_CODE_ALIAS: VILL_CODE_ALIAS || null,
            SURVEY_EXT: SURVEY_EXT || null,
            SURVEY_EXT_UNIT: SURVEY_EXT_UNIT || null,
            MULTI_SURVEY: MULTI_SURVEY || null,
            DOORNO: DOORNO || null,
            BI_WARD: BI_WARD || null,
            BI_BLOCK: BI_BLOCK || null,
            LP_NO: LP_NO || null,
            PLP_NO: PLP_NO || null,
            LPM_SURVEYNO: LPM_SURVEYNO || null,
          };    

          const checkResult = await this.orDao.oDBQueryServicemis(checkQuery, checkParams);          
          const recordExists = checkResult?.[0]?.COUNT > 0;

          if (recordExists) { 
          let query = `
          UPDATE srouser.tran_sched_temp SET
            ward_no = NVL(:WARD_NO, ward_no),
            block_no = NVL(:BLOCK_NO, block_no),
            loc_code = NVL(:LOC_CODE, loc_code),
            loc_hab_name = NVL(:LOC_HAB_NAME, loc_hab_name),
            road_code = NVL(:ROAD_CODE, road_code),
            local_body = NVL(:LOCAL_BODY, local_body),
            village_code = NVL(:VILLAGE_CODE, village_code),
            hab_code = NVL(:HAB_CODE, hab_code),
            survey_no = NVL(:SURVEY_NO, survey_no),
            old_survey_no = NVL(:OLD_SURVEY_NO, old_survey_no),
            plot_no = NVL(:PLOT_NO, plot_no),
            old_plot_no = NVL(:OLD_PLOT_NO, old_plot_no),
            new_house_no = NVL(:NEW_HOUSE_NO, new_house_no),
            old_house_no = NVL(:OLD_HOUSE_NO, old_house_no),
            east = NVL(:EAST, east),
            west = NVL(:WEST, west),
            north = NVL(:NORTH, north),
            south = NVL(:SOUTH, south),
            extent = NVL(:EXTENT, extent),
            unit = NVL(:UNIT, unit),
            extent_rate = NVL(:EXTENT_RATE, extent_rate),
            extent_unit = NVL(:EXTENT_UNIT, extent_unit),
            nature_use = NVL(:NATURE_USE, nature_use),
            flat_nonflat = NVL(:FLAT_NONFLAT, flat_nonflat),
            apt_name = NVL(:APT_NAME, apt_name),
            flat_no = NVL(:FLAT_NO, flat_no),
            tot_floor = NVL(:TOT_FLOOR, tot_floor),
            prev_srcode = NVL(:PREV_SRCODE, prev_srcode),
            prev_doctno = NVL(:PREV_DOCTNO, prev_doctno),
            prev_ryear = NVL(:PREV_RYEAR, prev_ryear),
            prev_schno = NVL(:PREV_SCHNO, prev_schno),
            con_value = NVL(:CON_VALUE, con_value),
            mkt_value = NVL(:MKT_VALUE, mkt_value),
            taxable_value = NVL(:TAXABLE_VALUE, taxable_value),
            charg_item_cd = NVL(:CHARG_ITEM_CD, charg_item_cd),
            annual_rent = NVL(:ANNUAL_RENT, annual_rent),
            lease_date = NVL(TO_DATE(:LEASE_DATE, 'YYYY-MM-DD'), lease_date),
            lease_period = NVL(:LEASE_PERIOD, lease_period),
            lease_adv = NVL(:LEASE_ADV, lease_adv),
            type_of_adv = NVL(:TYPE_OF_ADV, type_of_adv),
            lease_imp = NVL(:LEASE_IMP, lease_imp),
            lease_tax = NVL(:LEASE_TAX, lease_tax),
            party_no = NVL(:PARTY_NO, party_no),
            jurisdiction = NVL(:JURISDICTION, jurisdiction),
            ulc_act = NVL(:ULC_ACT, ulc_act),
            more_sch = NVL(:MORE_SCH, more_sch),
            svil = (select soundex((select village_name from hab_code where hab_code = :HAB_CODE and rownum=1)) from dual),
            scol = (select soundex(:LOC_HAB_NAME) from dual),
            sapn = NVL(:SAPN, sapn),
            ryear = NVL(:RYEAR, ryear),
            rdoct_no = NVL(:RDOCT_NO, rdoct_no),
            add_value = NVL(:ADD_VALUE, add_value),
            add_desc = NVL(:ADD_DESC, add_desc),
            p_p_desc = NVL(:P_P_DESC, p_p_desc),
            near_hno = NVL(:NEAR_HNO, near_hno),
            total_plinth = NVL(:TOTAL_PLINTH, total_plinth),
            prev_bno = NVL(:PREV_BNO, prev_bno),
            adv_amount = NVL(:ADV_AMOUNT, adv_amount),
            terrace_extent = NVL(:TERRACE_EXTENT, terrace_extent),
            terrace_unit = NVL(:TERRACE_UNIT, terrace_unit),
            mro_push = NVL(:MRO_PUSH, mro_push),
            apt_north = NVL(:APT_NORTH, apt_north),
            apt_south = NVL(:APT_SOUTH, apt_south),
            apt_east = NVL(:APT_EAST, apt_east),
            apt_west = NVL(:APT_WEST, apt_west),
            apt_extent = NVL(:APT_EXTENT, apt_extent),
            apt_extent_unit = NVL(:APT_EXTENT_UNIT, apt_extent_unit),
            vill_code_alias = NVL(:VILL_CODE_ALIAS, vill_code_alias),
            survey_ext = NVL(:SURVEY_EXT, survey_ext),
            survey_ext_unit = NVL(:SURVEY_EXT_UNIT, survey_ext_unit),
            time_stamp = time_stamp,
            multi_survey = NVL(:MULTI_SURVEY, multi_survey),
            doorno = NVL(:DOORNO, doorno),
            bi_ward = NVL(:BI_WARD, bi_ward),
            bi_block = NVL(:BI_BLOCK, bi_block),
            lp_no = NVL(:LP_NO, lp_no),
            plp_no = NVL(:PLP_NO, plp_no),
            lpm_surveyno = NVL(:LPM_SURVEYNO, lpm_surveyno)
          WHERE sr_code = :SR_CODE
            AND book_no = :BOOK_NO
            AND doct_no = :DOCT_NO
            AND reg_year = :REG_YEAR
            AND schedule_no = :SCHEDULE_NO
            AND reference_id = :REFERENCE_ID
        `;
        let UpdatebindParams = { ...checkParams, ...bindParams };
             
          const queries = [{
            query: query,
            bindParams: UpdatebindParams
          }];
          return await this.orDao.oDbMultipleInsertDocsWithBindParams(queries);}
         
          else {

            let insertQuery =`INSERT INTO srouser.TRAN_SCHED_TEMP (
                        SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, WARD_NO, BLOCK_NO, LOC_CODE, LOC_HAB_NAME, ROAD_CODE,
                        LOCAL_BODY, VILLAGE_CODE, HAB_CODE, SURVEY_NO, OLD_SURVEY_NO, PLOT_NO, OLD_PLOT_NO, NEW_HOUSE_NO,
                        OLD_HOUSE_NO, EAST, WEST, NORTH, SOUTH, EXTENT, UNIT, EXTENT_RATE, EXTENT_UNIT, NATURE_USE, FLAT_NONFLAT,
                        APT_NAME, FLAT_NO, TOT_FLOOR, PREV_SRCODE, PREV_DOCTNO, PREV_RYEAR, PREV_SCHNO, CON_VALUE, MKT_VALUE,
                        TAXABLE_VALUE, CHARG_ITEM_CD, ANNUAL_RENT, LEASE_DATE, LEASE_PERIOD, LEASE_ADV, TYPE_OF_ADV, LEASE_IMP,
                        LEASE_TAX, PARTY_NO, JURISDICTION, ULC_ACT, MORE_SCH, SVIL, SCOL, SAPN, RYEAR, RDOCT_NO, ADD_VALUE,
                        ADD_DESC, P_P_DESC, NEAR_HNO, TOTAL_PLINTH, PREV_BNO, ADV_AMOUNT, TERRACE_EXTENT, TERRACE_UNIT, MRO_PUSH,
                        APT_NORTH, APT_SOUTH, APT_EAST, APT_WEST, APT_EXTENT, APT_EXTENT_UNIT, VILL_CODE_ALIAS, SURVEY_EXT,
                        SURVEY_EXT_UNIT, TIME_STAMP, MULTI_SURVEY, DOORNO, BI_WARD, BI_BLOCK, LP_NO, PLP_NO, LPM_SURVEYNO,
                        REFERENCE_ID
                    )
                    VALUES (
                        :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :SCHEDULE_NO, :WARD_NO, :BLOCK_NO, :LOC_CODE, :LOC_HAB_NAME, :ROAD_CODE,
                        :LOCAL_BODY, :VILLAGE_CODE, :HAB_CODE,
                        :SURVEY_NO, :OLD_SURVEY_NO, :PLOT_NO, :OLD_PLOT_NO, :NEW_HOUSE_NO,
                        :OLD_HOUSE_NO, :EAST, :WEST, :NORTH, :SOUTH, :EXTENT, :UNIT, :EXTENT_RATE, :EXTENT_UNIT,
                        :NATURE_USE,
                        :FLAT_NONFLAT, :APT_NAME, :FLAT_NO, :TOT_FLOOR, :PREV_SRCODE, :PREV_DOCTNO, :PREV_RYEAR, :PREV_SCHNO,
                        :CON_VALUE,
                        :MKT_VALUE, :TAXABLE_VALUE, :CHARG_ITEM_CD, :ANNUAL_RENT, :LEASE_DATE, :LEASE_PERIOD, :LEASE_ADV,
                        :TYPE_OF_ADV, :LEASE_IMP, :LEASE_TAX, :PARTY_NO, :JURISDICTION, :ULC_ACT, :MORE_SCH,(select soundex((select village_name from hab_code where hab_code = :HAB_CODE and rownum=1)) from dual),
                         (select soundex(:LOC_HAB_NAME) from dual),:SAPN,
                        :RYEAR, :RDOCT_NO, :ADD_VALUE, :ADD_DESC, :P_P_DESC, :NEAR_HNO, :TOTAL_PLINTH, :PREV_BNO, :ADV_AMOUNT,
                        :TERRACE_EXTENT, :TERRACE_UNIT, :MRO_PUSH, :APT_NORTH, :APT_SOUTH, :APT_EAST, :APT_WEST, :APT_EXTENT,
                        :APT_EXTENT_UNIT, :VILL_CODE_ALIAS, :SURVEY_EXT, :SURVEY_EXT_UNIT, sysdate, :MULTI_SURVEY, :DOORNO,
                        :BI_WARD, :BI_BLOCK, :LP_NO, :PLP_NO, :LPM_SURVEYNO, :REFERENCE_ID
                    )`;
                    let InsertbindParams = { ...checkParams, ...bindParams };

            const queries = [{
                query: insertQuery,
                bindParams: InsertbindParams
              }];
              return await this.orDao.oDbMultipleInsertDocsWithBindParams(queries);}
          }
        catch (ex) {
            console.error("Update Document - updateTransched || Error : ", ex );
            throw constructCARDError(ex);
        }
      }
      
      updateTranLinkdocumentdetails = async (reqData) => {
        try {
            let queries;
            if(reqData.ROWID) {
                let query = `update srouser.recti_temp set  
                    L_SRCD = :L_SRCD,
                    L_BNO = :L_BNO,
                    L_DOCTNO = :L_DOCTNO,
                    L_REGYEAR = :L_REGYEAR,
                    CODE = :CODE,
                    C_SCHNO = :C_SCHNO,
                    L_SCHNO = :L_SCHNO
                    where rowid = :ROW_ID`;
                    const bindParams = {
                        L_SRCD: reqData.L_SRCD || null,
                        L_BNO: reqData.L_BNO || null,
                        L_DOCTNO: reqData.L_DOCTNO || null,
                        L_REGYEAR: reqData.L_REGYEAR || null,
                        CODE: reqData.CODE || null,
                        C_SCHNO: reqData.C_SCHNO || null,
                        L_SCHNO: reqData.L_SCHNO || null,
                        ROW_ID: reqData.ROWID || null
                      };
                queries = [{
                    query: query,
                    bindParams: bindParams
                }];
            }
            else {
                let query = `INSERT INTO srouser.recti_temp (
                            C_SRCD, C_BNO, C_DOCTNO, C_REGYEAR,
                            L_SRCD, L_BNO, L_DOCTNO, L_REGYEAR,
                            CODE, C_SCHNO, L_SCHNO, R_DOCTNO, R_YEAR, REFERENCE_ID) 
                            VALUES (
                            :C_SRCD, :C_BNO, :C_DOCTNO, :C_REGYEAR,
                            :L_SRCD, :L_BNO, :L_DOCTNO, :L_REGYEAR,
                            :CODE, :C_SCHNO, :L_SCHNO, :R_DOCTNO, :R_YEAR, :REFERENCE_ID)`;
                            const bindParams = {
                                C_SRCD: reqData.C_SRCD ,
                                C_BNO: reqData.C_BNO,
                                C_DOCTNO: reqData.C_DOCTNO,
                                C_REGYEAR: reqData.C_REGYEAR,
                                L_SRCD: reqData.L_SRCD || null,
                                L_BNO: reqData.L_BNO || null,
                                L_DOCTNO: reqData.L_DOCTNO || null,
                                L_REGYEAR: reqData.L_REGYEAR || null,
                                CODE: reqData.CODE || null,
                                C_SCHNO: reqData.C_SCHNO || null,
                                L_SCHNO: reqData.L_SCHNO || null,
                                R_DOCTNO: reqData.R_DOCTNO || null,
                                R_YEAR: reqData.R_YEAR || null,
                                REFERENCE_ID: reqData.REFERENCE_ID || null
                            };
                    queries = [{
                        query: query,
                        bindParams: bindParams
                    }];
            }
            return await this.orDao.oDbMultipleInsertDocsWithBindParams(queries);
            
        }
        catch (ex) {
            console.error("Update Document - updateTranLinkdocumentdetails || Error : ", ex );
            throw constructCARDError(ex);
        }
      }
//----Edit Index New Functionality-Esign Integration API'S------------------------//
fetchPartiesColNames = async (reqData) => {
    try {
    // let PartiesQuery = `  select a.sr_code,a.book_no,a.doct_no,a.reg_year,a.ec_number,a.code,a.name,nvl((select party1 from tran_dir where upper(a.CODE)=upper(party1_code) and rownum=1),
    //                      (select party2 from tran_dir where upper(a.CODE)=upper(party2_code) and rownum=1)) code_desc2,a.ec_number || '-' || a.code || '-' || NVL(
    //     (SELECT party1 FROM tran_dir WHERE UPPER(a.CODE) = UPPER(party1_code) AND ROWNUM = 1),
    //     (SELECT party2 FROM tran_dir WHERE UPPER(a.CODE) = UPPER(party2_code) AND ROWNUM = 1)
    //     )||'-' || a.NAME  AS GROUPCOLUMN from tran_ec a where a.reg_year=:REG_YEAR and a.sr_code=:SR_CODE and a.doct_no=:DOCT_NO and a.book_no=:BOOK_NO`;
    let PartiesQuery =`select a.sr_code,a.book_no,a.doct_no,a.reg_year,a.ec_number,a.code,a.name,nvl((select party1 from tran_dir where upper(a.CODE)=upper(party1_code) and rownum=1),
                         (select party2 from tran_dir where upper(a.CODE)=upper(party2_code) and rownum=1)) code_desc2,a.ec_number || '-' || a.code || '-' || NVL(
        (SELECT party1 FROM tran_dir WHERE UPPER(a.CODE) = UPPER(party1_code) AND ROWNUM = 1),
        (SELECT party2 FROM tran_dir WHERE UPPER(a.CODE) = UPPER(party2_code) AND ROWNUM = 1)
        )||'-' || a.NAME  AS GROUPCOLUMN,'N' AS PARTY_TYPE,NULL AS FIRM_NUMBER  from tran_ec a where a.reg_year=:REG_YEAR and a.sr_code=:SR_CODE and a.doct_no=:DOCT_NO and a.book_no=:BOOK_NO  UNION 
select a.sr_code,a.book_no,a.doct_no,a.reg_year,a.ec_number,a.code,a.name,nvl((select party1 from tran_dir where upper(a.CODE)=upper(party1_code) and rownum=1),
    (select party2 from tran_dir where upper(a.CODE)=upper(party2_code) and rownum=1)) code_desc2,a.ec_number || '-' || a.code || '-' || NVL(          
        (SELECT party1 FROM tran_dir WHERE UPPER(a.CODE) = UPPER(party1_code) AND ROWNUM = 1),
        (SELECT party2 FROM tran_dir WHERE UPPER(a.CODE) = UPPER(party2_code) AND ROWNUM = 1)
        )||'-' || a.NAME  AS GROUPCOLUMN,'R' AS PARTY_TYPE,A.FIRM_NUMBER from tran_ec_firms a where a.reg_year=:REG_YEAR and a.sr_code=:SR_CODE and a.doct_no=:DOCT_NO and a.book_no=:BOOK_NO ORDER BY FIRM_NUMBER DESC`;
        let BindParams={
        SR_CODE:reqData.SR_CODE,
        DOCT_NO:reqData.DOCT_NO,
        REG_YEAR:reqData.REG_YEAR,
        BOOK_NO:reqData.BOOK_NO
       }
    let PartiesResult = await this.orDao.oDBQueryServicereadWithBindParamsed(PartiesQuery,BindParams);

    let MinMajFind =`select distinct TRAN_MAJ_CODE,TRAN_MIN_CODE from tran_major a where a.reg_year=:REG_YEAR and a.sr_code=:SR_CODE and a.doct_no=:DOCT_NO and a.book_no=:BOOK_NO `;
    let MinMajFindResult = await this.orDao.oDBQueryServicereadWithBindParamsed(MinMajFind,BindParams);


    let PartiesTitleQuery = `select PARTY1,PARTY1_CODE,PARTY2,PARTY2_CODE from tran_dir where tran_maj_code=:TRAN_MAJ_CODE and tran_min_code=:TRAN_MIN_CODE`;
         let PartiesTitleBindParams={
            TRAN_MIN_CODE:'00',
            TRAN_MAJ_CODE:MinMajFindResult[0].TRAN_MAJ_CODE,
        }
    let PartiesTitleResult = await this.orDao.oDBQueryServicereadWithBindParamsed(PartiesTitleQuery,PartiesTitleBindParams);
    let DocNatureQuery = `select TRAN_MAJ_CODE, TRAN_MIN_CODE FROM TRAN_MAJOR WHERE REG_YEAR=:REG_YEAR AND SR_CODE=:SR_CODE AND DOCT_NO=:DOCT_NO AND BOOK_NO=:BOOK_NO`;
    let DocNatureResult = await this.orDao.oDBQueryServicereadWithBindParamsed(DocNatureQuery, BindParams);

    let schedulesQuery=`select SCHEDULE_NO from tran_sched a where a.reg_year=:REG_YEAR and a.sr_code=:SR_CODE and a.doct_no=:DOCT_NO and a.book_no=:BOOK_NO order by a.schedule_no`;
    let schedulesQueryResult= await this.orDao.oDBQueryServicereadWithBindParamsed(schedulesQuery,BindParams);

    let PropertiesQuery = `select * from srouser.properties_names where status='Y' and CTYPE='P'`;
    let PropertiesResult  = await this.orDao.oDBQueryService(PropertiesQuery);

    let LinkDocQuery = `SELECT  a.*,L_SRCD || '-' || L_BNO || '-' || L_DOCTNO  || '-' || L_REGYEAR || '-' || L_SCHNO AS GROUP_VALUE from  recti a WHERE  a.C_REGYEAR=:REG_YEAR and a.C_SRCD=:SR_CODE and a.C_DOCTNO=:DOCT_NO and a.C_BNO=:BOOK_NO`;
    let LinkDocResults = await this.orDao.oDBQueryServicereadWithBindParamsed(LinkDocQuery,BindParams);

    // let PropertiesResult = [];
    // let LinkDocResults = [];

    // if (Array.isArray(allPropertiesResult)) {
    // PropertiesResult = allPropertiesResult.filter(item => item.CTYPE === 'P');
    // LinkDocResults = allPropertiesResult.filter(item => item.CTYPE === 'L');
    // }

        return { PartiesResult, PropertiesResult,LinkDocResults,schedulesQueryResult,PartiesTitleResult,DocNatureResult };
     }
    catch (ex) {
        console.error("Update Document - FetchPartiesColNames || Error : ", ex );
        throw constructCARDError(ex);
    }
}

GetRequestDeatils = async (reqData) =>{
    try {
        const PartiesQuery =`select*from srouser.tran_ec_edit where sr_code=:SR_CODE AND BOOK_NO=:BOOK_NO AND DOCT_NO=:DOCT_NO AND REG_YEAR=:REG_YEAR`;
        const PropertiesQuery = `select*from srouser.tran_sched_edit where sr_code=:SR_CODE AND BOOK_NO=:BOOK_NO AND DOCT_NO=:DOCT_NO AND REG_YEAR=:REG_YEAR`;
        const linkDoctQuery =`select*from srouser.recti_edit where C_SRCD=:SR_CODE AND C_BNO=:BOOK_NO AND C_DOCTNO=:DOCT_NO AND C_REGYEAR=:REG_YEAR`;
        let BindParams={
            SR_CODE:reqData.SR_CODE,
            DOCT_NO:reqData.DOCT_NO,
            REG_YEAR:reqData.REG_YEAR,
            BOOK_NO:reqData.BOOK_NO
           }

           const Parties = await this.orDao.oDBQueryServicereadWithBindParamsed(PartiesQuery, BindParams);
           const Properties = await this.orDao.oDBQueryServicereadWithBindParamsed(PropertiesQuery, BindParams);
           const LinkDoct = await this.orDao.oDBQueryServicereadWithBindParamsed(linkDoctQuery, BindParams);
           return {Parties,Properties,LinkDoct};
    }
    catch (ex) {
        console.error("Update Document - GetRequestDeatils || Error : ", ex );
        throw constructCARDError(ex);
    }

    
}
getEditIndexMisReport = async (reqData) => {
    try {
        let statusCondition = '';
        const bindParams = {
            SR_CODE: reqData.SR_CODE,
            FROM_DATE: reqData.FROM_DATE,
            TO_DATE: reqData.TO_DATE
        };

        if (reqData.STATUS === 'P') {
            statusCondition = "AND a.status IN ('P', 'A', 'S')";
        } else {
            statusCondition = "AND a.status = :STATUS";
            bindParams.STATUS = reqData.STATUS;
        }

        const reportQuery = `
SELECT 
    b.sr_name,
    a.*,
    TO_CHAR(a.request_time, 'DD-MON-YYYY HH:MI AM') AS request_date,
    emp.empl_name || ' (' || emp.designation || ')' AS empl_details
FROM 
    dr_jobs a
JOIN 
    sr_master b ON b.sr_cd = a.sr_code
LEFT JOIN (
    SELECT empl_id, empl_name, designation
    FROM (
        SELECT empl_id, empl_name, designation,
               ROW_NUMBER() OVER (PARTITION BY empl_id ORDER BY empl_id) AS rn
        FROM employee_login_master
    )
    WHERE rn = 1
) emp ON emp.empl_id = a.request_by
WHERE 
    a.sr_code = :SR_CODE
    ${statusCondition}
    AND a.event = '2'
    AND a.request_time BETWEEN TO_DATE(:FROM_DATE, 'YYYY-MM-DD') AND TO_DATE(:TO_DATE, 'YYYY-MM-DD') + 1 - (1/86400)
    AND a.reference_id IS NOT NULL
ORDER BY 
    a.sr_code, a.request_time DESC`;
        const reportResult = await this.orDao.oDBQueryServicereadWithBindParamsed(reportQuery, bindParams);
        return reportResult;
    } catch (ex) {
        console.error("Update Document - getEditIndexMisReport || Error : ", ex );
        throw constructCARDError(ex);
    }
}


SubmitRequestFormEditIndex = async (reqBody) => {
    try {
        const PartyInserts = [];
        const generateDocumentId = () => {
            const prefix = reqBody.ServiceType;
            const year = String(new Date().getFullYear()).substring(2, 4);
            const timestamp = Math.floor(Date.now() / 1000);
            const srCode = String(reqBody.SR_CODE).padStart(4, '0');

            return `${prefix}${year}${srCode}${timestamp}`;
            
        };
        const REFERENCE_ID = generateDocumentId();

        PartyInserts.push({
            query: `INSERT INTO srouser.dr_jobs 
                (sr_code, book_no, doct_no, reg_year, rdoct_no, ryear, request_by, request_time, request_reasons, status, event,REFERENCE_ID) 
                VALUES 
                (:SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :RDOCT_NO, :RYEAR, :REQUEST_BY, SYSDATE, :REQUEST_REASONS, :STATUS, :EVENT,:REFERENCE_ID)`,
            params: {
                SR_CODE: reqBody.SR_CODE,
                BOOK_NO: reqBody.BOOK_NO,
                DOCT_NO: reqBody.DOCT_NO,
                REG_YEAR: reqBody.REG_YEAR,
                RDOCT_NO: reqBody.RDOCT_NO,
                RYEAR: reqBody.RYEAR,
                REQUEST_BY: reqBody.REQUEST_BY || null,
                REQUEST_REASONS: reqBody.REQUEST_REASONS || null,
                STATUS: reqBody.STATUS || null,
                EVENT: reqBody.EVENT || null,
                REFERENCE_ID:REFERENCE_ID
            }
        });
        

        // Handle PartyEdit
        if (Array.isArray(reqBody.PartyEdit) && (reqBody.PartyEdit.length > 0 || reqBody.PartyDelete.length > 0)) {
            // const isEdit = reqBody.PartyEdit.length > 0;
            // const servicesType = isEdit ? 'E' : 'D';

            for (const party of reqBody.PartyEdit.length > 0 ? reqBody.PartyEdit : reqBody.PartyDelete) {
                PartyInserts.push({
                    query: `
        INSERT INTO srouser.tran_ec_edit 
        (SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, EC_NUMBER, CODE, NAME, PARTY_TYPE, FIRM_NUMBER, SERVICE_TYPE,CODEDESC,STATUS,REFERENCE_ID) 
        VALUES (:SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :EC_NUMBER, :CODE, :NAME, :PARTY_TYPE, :FIRM_NUMBER, :SERVICE_TYPE,:CODEDESC,:STATUS,:REFERENCE_ID)`,
    params: {
        SR_CODE: reqBody.SR_CODE,
        BOOK_NO: reqBody.BOOK_NO,
        DOCT_NO: reqBody.DOCT_NO,
        REG_YEAR: reqBody.REG_YEAR,
        EC_NUMBER: party.EC_NUMBER,
        CODE: party.CODE || null,
        NAME: party.P_NAME || null,
        PARTY_TYPE: party.PARTY_TYPE,
        FIRM_NUMBER: party.FIRM_NUMBER || null,
        SERVICE_TYPE:reqBody.ServiceType,
        CODEDESC:party.CODEDESC || null,
        STATUS:'P',
        REFERENCE_ID: REFERENCE_ID || null

    }
                });
            }
        }
        if (Array.isArray(reqBody.RepresentativesNew) && (reqBody.RepresentativesNew.length > 0 )) {
            for (const party of reqBody.RepresentativesNew) {
                PartyInserts.push({
                    query: `
        INSERT INTO srouser.tran_ec_edit 
        (SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, EC_NUMBER, CODE, NAME, PARTY_TYPE, FIRM_NUMBER, SERVICE_TYPE,CODEDESC,STATUS,REFERENCE_ID) 
        VALUES (:SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :EC_NUMBER, :CODE, :NAME, :PARTY_TYPE, :FIRM_NUMBER, :SERVICE_TYPE,:CODEDESC,:STATUS,:REFERENCE_ID)`,
    params: {
        SR_CODE: reqBody.SR_CODE,
        BOOK_NO: reqBody.BOOK_NO,
        DOCT_NO: reqBody.DOCT_NO,
        REG_YEAR: reqBody.REG_YEAR,
        EC_NUMBER: party.EC_NUMBER,
        CODE: party.CODE || null,
        NAME: party.P_NAME || null,
        PARTY_TYPE: 'R',
        FIRM_NUMBER: party.FIRM_NUMBER || null,
        SERVICE_TYPE:reqBody.ServiceType,
        CODEDESC:party.CODEDESC || null,
        STATUS:'P',
        REFERENCE_ID: REFERENCE_ID || null

    }
                });
            }
        }

        if (
            Array.isArray(reqBody.PropertyEdit) &&
            (reqBody.PropertyEdit.length > 0 || reqBody.PropertyDelete.length > 0)
          ) {
            const isEdit = reqBody.PropertyEdit.length > 0;
            const targetArray = isEdit ? reqBody.PropertyEdit : reqBody.PropertyDelete;
          
            for (const value of targetArray) {
              const property = isEdit ? value : {};
              const scheduleNo = isEdit ? property.SCHEDULE_NO || null : value;
          
              PartyInserts.push({
                query: `INSERT INTO srouser.tran_sched_edit (
                  SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, WARD_NO, BLOCK_NO, LOC_CODE, LOC_HAB_NAME,
                  ROAD_CODE, LOCAL_BODY, VILLAGE_CODE, HAB_CODE, SURVEY_NO, OLD_SURVEY_NO, PLOT_NO, OLD_PLOT_NO,
                  NEW_HOUSE_NO, OLD_HOUSE_NO, EAST, WEST, NORTH, SOUTH, EXTENT, UNIT, EXTENT_RATE, EXTENT_UNIT,
                  NATURE_USE, FLAT_NONFLAT, APT_NAME, FLAT_NO, TOT_FLOOR, PREV_SRCODE, PREV_DOCTNO, PREV_RYEAR,
                  PREV_SCHNO, CON_VALUE, MKT_VALUE, TAXABLE_VALUE, CHARG_ITEM_CD, ANNUAL_RENT, LEASE_DATE,
                  LEASE_PERIOD, LEASE_ADV, TYPE_OF_ADV, LEASE_IMP, LEASE_TAX, PARTY_NO, JURISDICTION, ULC_ACT,
                  MORE_SCH, SVIL, SCOL, SAPN, RYEAR, RDOCT_NO, ADD_VALUE, ADD_DESC, P_P_DESC, NEAR_HNO,
                  TOTAL_PLINTH, PREV_BNO, ADV_AMOUNT, TERRACE_EXTENT, TERRACE_UNIT, MRO_PUSH, APT_NORTH,
                  APT_SOUTH, APT_EAST, APT_WEST, APT_EXTENT, APT_EXTENT_UNIT, VILL_CODE_ALIAS, SURVEY_EXT,
                  SURVEY_EXT_UNIT, TIME_STAMP, MULTI_SURVEY, DOORNO, BI_WARD, BI_BLOCK, LP_NO, PLP_NO,
                  LPM_SURVEYNO, STATUS, SERVICE_TYPE,REFERENCE_ID
                ) VALUES (
                  :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :SCHEDULE_NO, :WARD_NO, :BLOCK_NO, :LOC_CODE, :LOC_HAB_NAME,
                  :ROAD_CODE, :LOCAL_BODY, :VILLAGE_CODE, :HAB_CODE, :SURVEY_NO, :OLD_SURVEY_NO, :PLOT_NO, :OLD_PLOT_NO,
                  :NEW_HOUSE_NO, :OLD_HOUSE_NO, :EAST, :WEST, :NORTH, :SOUTH, :EXTENT, :UNIT, :EXTENT_RATE, :EXTENT_UNIT,
                  :NATURE_USE, :FLAT_NONFLAT, :APT_NAME, :FLAT_NO, :TOT_FLOOR, :PREV_SRCODE, :PREV_DOCTNO, :PREV_RYEAR,
                  :PREV_SCHNO, :CON_VALUE, :MKT_VALUE, :TAXABLE_VALUE, :CHARG_ITEM_CD, :ANNUAL_RENT, :LEASE_DATE,
                  :LEASE_PERIOD, :LEASE_ADV, :TYPE_OF_ADV, :LEASE_IMP, :LEASE_TAX, :PARTY_NO, :JURISDICTION, :ULC_ACT,
                  :MORE_SCH, :SVIL, :SCOL, :SAPN, :RYEAR, :RDOCT_NO, :ADD_VALUE, :ADD_DESC, :P_P_DESC, :NEAR_HNO,
                  :TOTAL_PLINTH, :PREV_BNO, :ADV_AMOUNT, :TERRACE_EXTENT, :TERRACE_UNIT, :MRO_PUSH, :APT_NORTH,
                  :APT_SOUTH, :APT_EAST, :APT_WEST, :APT_EXTENT, :APT_EXTENT_UNIT, :VILL_CODE_ALIAS, :SURVEY_EXT,
                  :SURVEY_EXT_UNIT, :TIME_STAMP, :MULTI_SURVEY, :DOORNO, :BI_WARD, :BI_BLOCK, :LP_NO, :PLP_NO,
                  :LPM_SURVEYNO, :STATUS, :SERVICE_TYPE,:REFERENCE_ID
                )`,
                params: {
                  SR_CODE: reqBody.SR_CODE || '0',
                  BOOK_NO: reqBody.BOOK_NO || "0",
                  DOCT_NO: reqBody.DOCT_NO || "0",
                  REG_YEAR: reqBody.REG_YEAR || "0",
                  SCHEDULE_NO: scheduleNo || "0",
                  WARD_NO: property.WARD_NO || "0",
                  BLOCK_NO: property.BLOCK_NO || "0",
                  LOC_CODE: property.LOC_CODE || "0",
                  LOC_HAB_NAME: property.LOC_HAB_NAME || "0",
                  ROAD_CODE: property.ROAD_CODE || "0",
                  LOCAL_BODY: property.LOCAL_BODY || "0",
                  VILLAGE_CODE: property.VILLAGE_CODE || "0",
                  HAB_CODE: property.HAB_CODE || "0",
                  SURVEY_NO: property.SURVEY_NO || "0",
                  OLD_SURVEY_NO: property.OLD_SURVEY_NO || "0",
                  PLOT_NO: property.PLOT_NO || "0",
                  OLD_PLOT_NO: property.OLD_PLOT_NO || "0",
                  NEW_HOUSE_NO: property.NEW_HOUSE_NO || "0",
                  OLD_HOUSE_NO: property.OLD_HOUSE_NO || "0",
                  EAST: property.EAST || "0",
                  WEST: property.WEST || "0",
                  NORTH: property.NORTH || "0",
                  SOUTH: property.SOUTH || "0",
                  EXTENT: property.EXTENT || "0",
                  UNIT: property.UNIT || "0",
                  EXTENT_RATE: property.EXTENT_RATE || "0",
                  EXTENT_UNIT: property.EXTENT_UNIT || "0",
                  NATURE_USE: property.NATURE_USE || "0",
                  FLAT_NONFLAT: property.FLAT_NONFLAT || "0",
                  APT_NAME: property.APT_NAME || "0",
                  FLAT_NO: property.FLAT_NO || "0",
                  TOT_FLOOR: property.TOT_FLOOR || "0",
                  PREV_SRCODE: property.PREV_SRCODE || "0",
                  PREV_DOCTNO: property.PREV_DOCTNO || "0",
                  PREV_RYEAR: property.PREV_RYEAR || "0",
                  PREV_SCHNO: property.PREV_SCHNO || "0",
                  CON_VALUE: property.CON_VALUE || "0",
                  MKT_VALUE: property.MKT_VALUE || "0",
                  TAXABLE_VALUE: property.TAXABLE_VALUE || "0",
                  CHARG_ITEM_CD: property.CHARG_ITEM_CD || "0",
                  ANNUAL_RENT: property.ANNUAL_RENT || "0",
                  LEASE_DATE: property.LEASE_DATE || "0",
                  LEASE_PERIOD: property.LEASE_PERIOD || "0",
                  LEASE_ADV: property.LEASE_ADV || "0",
                  TYPE_OF_ADV: property.TYPE_OF_ADV || "0",
                  LEASE_IMP: property.LEASE_IMP || "0",
                  LEASE_TAX: property.LEASE_TAX || "0",
                  PARTY_NO: property.PARTY_NO || "0",
                  JURISDICTION: property.JURISDICTION || "0",
                  ULC_ACT: property.ULC_ACT || "0",
                  MORE_SCH: property.MORE_SCH || "0",
                  SVIL: property.SVIL || "0",
                  SCOL: property.SCOL || "0",
                  SAPN: property.SAPN || "0",
                  RYEAR: property.RYEAR || "0",
                  RDOCT_NO: property.RDOCT_NO || "0",
                  ADD_VALUE: property.ADD_VALUE || "0",
                  ADD_DESC: property.ADD_DESC || "0",
                  P_P_DESC: property.P_P_DESC || "0",
                  NEAR_HNO: property.NEAR_HNO || "0",
                  TOTAL_PLINTH: property.TOTAL_PLINTH || "0",
                  PREV_BNO: property.PREV_BNO || "0",
                  ADV_AMOUNT: property.ADV_AMOUNT || "0",
                  TERRACE_EXTENT: property.TERRACE_EXTENT || "0",
                  TERRACE_UNIT: property.TERRACE_UNIT || "0",
                  MRO_PUSH: property.MRO_PUSH || "0",
                  APT_NORTH: property.APT_NORTH || "0",
                  APT_SOUTH: property.APT_SOUTH || "0",
                  APT_EAST: property.APT_EAST || "0",
                  APT_WEST: property.APT_WEST || "0",
                  APT_EXTENT: property.APT_EXTENT || "0",
                  APT_EXTENT_UNIT: property.APT_EXTENT_UNIT || "0",
                  VILL_CODE_ALIAS: property.VILL_CODE_ALIAS || "0",
                  SURVEY_EXT: property.SURVEY_EXT || "0",
                  SURVEY_EXT_UNIT: property.SURVEY_EXT_UNIT || "0",
                  TIME_STAMP: property.TIME_STAMP || "0",
                  MULTI_SURVEY: property.MULTI_SURVEY || "0",
                  DOORNO: property.DOORNO || "0",
                  BI_WARD: property.BI_WARD || "0",
                  BI_BLOCK: property.BI_BLOCK || "0",
                  LP_NO: property.LP_NO || "0",
                  PLP_NO: property.PLP_NO || "0",
                  LPM_SURVEYNO: property.LPM_SURVEYNO || "0",
                  STATUS: property.STATUS || 'P',
                  SERVICE_TYPE: reqBody.ServiceType,
                  REFERENCE_ID: REFERENCE_ID || null

                }
              });
            }
          }
          if (Array.isArray(reqBody.LinkDoctDelete) && reqBody.LinkDoctDelete.length > 0) {
            for (const Link of reqBody.LinkDoctDelete) {
                PartyInserts.push({
                    query: `
        INSERT INTO srouser.recti_edit 
        (C_SRCD, C_BNO, C_DOCTNO, C_REGYEAR, L_SRCD, L_BNO, L_DOCTNO, L_REGYEAR, CODE, C_SCHNO,L_SCHNO,R_DOCTNO,R_YEAR,STATUS,SERVICE_TYPE,REFERENCE_ID) 
        VALUES (:C_SRCD, :C_BNO, :C_DOCTNO, :C_REGYEAR, :L_SRCD, :L_BNO, :L_DOCTNO, :L_REGYEAR, :CODE, :C_SCHNO,:L_SCHNO,:R_DOCTNO,:R_YEAR,:STATUS,:SERVICE_TYPE,:REFERENCE_ID)`,
    params: {
        C_SRCD: reqBody.SR_CODE || null,
        C_BNO: reqBody.BOOK_NO || null,
        C_DOCTNO: reqBody.DOCT_NO || null,
        C_REGYEAR: reqBody.REG_YEAR || null,
        L_SRCD: Link.L_SRCD || "",
        L_BNO: Link.L_BNO || "",
        L_DOCTNO: Link.L_DOCTNO || "",
        L_REGYEAR: Link.L_REGYEAR || "",
        CODE: Link.CODE || "",
        C_SCHNO: Link.C_SCHNO || "",
        L_SCHNO: Link.L_SCHNO || "",
        R_DOCTNO: reqBody.RDOCT_NO || "",
        R_YEAR: reqBody.RYEAR || "",
        STATUS: 'P',
        SERVICE_TYPE:reqBody.ServiceType,
        REFERENCE_ID: REFERENCE_ID || null


    }
                });
            }
        }

        if(reqBody.LinkDoctNumberNew && reqBody.LinkDoctNumberNew !== ''){
            PartyInserts.push({
                query: `
                INSERT INTO srouser.recti_edit 
                (C_SRCD, C_BNO, C_DOCTNO, C_REGYEAR,STATUS,SERVICE_TYPE,NUM_LINK,REFERENCE_ID,R_DOCTNO,R_YEAR) 
                VALUES (:C_SRCD, :C_BNO, :C_DOCTNO, :C_REGYEAR,:STATUS,:SERVICE_TYPE,:NUM_LINK,:REFERENCE_ID,:R_DOCTNO,:R_YEAR)`,
            params: {
                C_SRCD: reqBody.SR_CODE || null,
                C_BNO: reqBody.BOOK_NO || null,
                C_DOCTNO: reqBody.DOCT_NO || null,
                C_REGYEAR: reqBody.REG_YEAR || null,
                STATUS: 'P',
                SERVICE_TYPE:reqBody.ServiceType,
                NUM_LINK: reqBody.LinkDoctNumberNew || '',
                REFERENCE_ID: REFERENCE_ID || null,
                R_DOCTNO: reqBody.RDOCT_NO || "",
                R_YEAR: reqBody.RYEAR || "",

        
            }
                
            })
        }
        if (reqBody.PartiesNew && typeof reqBody.PartiesNew === 'object') {
            for (const [key, value] of Object.entries(reqBody.PartiesNew)) {
                PartyInserts.push({
                    query: `
                        INSERT INTO srouser.tran_ec_edit 
                        (SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, CODE, NEW_COUNT, STATUS, SERVICE_TYPE,REFERENCE_ID) 
                        VALUES (:SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :CODE, :NEW_COUNT, :STATUS, :SERVICE_TYPE,:REFERENCE_ID)`,
                    params: {
                        SR_CODE: reqBody.SR_CODE || null,
                        BOOK_NO: reqBody.BOOK_NO || null,
                        DOCT_NO: reqBody.DOCT_NO || null,
                        REG_YEAR: reqBody.REG_YEAR || null,
                        CODE: key,
                        NEW_COUNT: value,
                        STATUS: 'P',
                        SERVICE_TYPE: reqBody.ServiceType,
                        REFERENCE_ID: REFERENCE_ID || null

                    }
                });
            }
        }
    const processPartiesAfterInsert = async () => {
    const representatives = reqBody.RepresentativesNew;
  
    if (!Array.isArray(representatives) || representatives.length === 0 || reqBody.ServiceType != 'A') return;
  
    const executentArray = [];
    const claimantArray = [];
  
    representatives.forEach(rep => {
      const formatted = formatParty(rep);
      const code = rep.CODE;
  
      if (EXECUTANT_CODES.includes(code)) {
        executentArray.push(formatted);
      } else if (CLAIMANT_CODES.includes(code)) {
        claimantArray.push(formatted);
      }
    });
  
    const documentId = `${reqBody.SR_CODE}-${reqBody.BOOK_NO}-${reqBody.RDOCT_NO}-${reqBody.RYEAR}`;
  
    const postData = {
      referenceId: REFERENCE_ID,
      documentId,
      executent: executentArray,
      claimant: claimantArray,
      property: []
    };  
    axios.post(`${process.env.PDE_HOST}/pdeapi/v1/parties/insertEditIndexData`,
        postData, {
            httpsAgent: httpsAgent,
          })
      .then(res => {
        console.log("POST Success:", res.data);
      })
      .catch(err => {
        console.error("POST Error:", err.message);
      });
  }
          
          //function to format each party
          function formatParty(rep) {
            return {
              isExisting : true,
              name: rep.P_NAME,
              ecNumber: rep.EC_NUMBER || "",
              relationType: rep.R_CODE || "",
              relationName: rep.R_NAME || "",
              age: rep.AGE || "",
              panNoOrForm60orForm61: rep.PAN_NO || "",
              tan: rep.tan || "",
              aadhaar: rep.AADHAR || "",
              representType: rep.CODEDESC ||'',
              email: rep.email || "",
              phone: rep.PHONE_NO || "",
              address: rep.ADDRESS1 || "",
              representSubType: rep.representSubType || "",
              operation: rep.operation || "Add",
              partyId: rep.partyId || "",
              PartyType: rep.CODE, 
              applicationId: reqBody.applicationId || '',
              partyCode: rep.CODE || "",
              objectType: rep.objectType || "form60",
              partyType: rep.partyType || "Public",
              wa: rep.wa || "Aadhar Without OTP",
              aadhar: rep.aadhaar || rep.aadhar || "",
              currentAddress: rep.currentAddress || rep.address || "",
              represent: []
            };
          }
        if(reqBody.PropertiesNew && reqBody.PropertiesNew !== ''){

            const dummy ='0';            
            PartyInserts.push({
                query: `
                INSERT INTO srouser.tran_sched_edit (
                  SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, WARD_NO, BLOCK_NO, LOC_CODE, LOC_HAB_NAME,
                  ROAD_CODE, LOCAL_BODY, VILLAGE_CODE, HAB_CODE, SURVEY_NO, OLD_SURVEY_NO, PLOT_NO, OLD_PLOT_NO,
                  NEW_HOUSE_NO, OLD_HOUSE_NO, EAST, WEST, NORTH, SOUTH, EXTENT, UNIT, EXTENT_RATE, EXTENT_UNIT,
                  NATURE_USE, FLAT_NONFLAT, APT_NAME, FLAT_NO, TOT_FLOOR, PREV_SRCODE, PREV_DOCTNO, PREV_RYEAR,
                  PREV_SCHNO, CON_VALUE, MKT_VALUE, TAXABLE_VALUE, CHARG_ITEM_CD, ANNUAL_RENT, LEASE_DATE,
                  LEASE_PERIOD, LEASE_ADV, TYPE_OF_ADV, LEASE_IMP, LEASE_TAX, PARTY_NO, JURISDICTION, ULC_ACT,
                  MORE_SCH, SVIL, SCOL, SAPN, RYEAR, RDOCT_NO, ADD_VALUE, ADD_DESC, P_P_DESC, NEAR_HNO,
                  TOTAL_PLINTH, PREV_BNO, ADV_AMOUNT, TERRACE_EXTENT, TERRACE_UNIT, MRO_PUSH, APT_NORTH,
                  APT_SOUTH, APT_EAST, APT_WEST, APT_EXTENT, APT_EXTENT_UNIT, VILL_CODE_ALIAS, SURVEY_EXT,
                  SURVEY_EXT_UNIT, TIME_STAMP, MULTI_SURVEY, DOORNO, BI_WARD, BI_BLOCK, LP_NO, PLP_NO,
                  LPM_SURVEYNO, STATUS, SERVICE_TYPE, REFERENCE_ID, PROPERTY_TYPE, PROPERTY_NEW_COUNT
                ) VALUES (
                  :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :SCHEDULE_NO, :WARD_NO, :BLOCK_NO, :LOC_CODE, :LOC_HAB_NAME,
                  :ROAD_CODE, :LOCAL_BODY, :VILLAGE_CODE, :HAB_CODE, :SURVEY_NO, :OLD_SURVEY_NO, :PLOT_NO, :OLD_PLOT_NO,
                  :NEW_HOUSE_NO, :OLD_HOUSE_NO, :EAST, :WEST, :NORTH, :SOUTH, :EXTENT, :UNIT, :EXTENT_RATE, :EXTENT_UNIT,
                  :NATURE_USE, :FLAT_NONFLAT, :APT_NAME, :FLAT_NO, :TOT_FLOOR, :PREV_SRCODE, :PREV_DOCTNO, :PREV_RYEAR,
                  :PREV_SCHNO, :CON_VALUE, :MKT_VALUE, :TAXABLE_VALUE, :CHARG_ITEM_CD, :ANNUAL_RENT, :LEASE_DATE,
                  :LEASE_PERIOD, :LEASE_ADV, :TYPE_OF_ADV, :LEASE_IMP, :LEASE_TAX, :PARTY_NO, :JURISDICTION, :ULC_ACT,
                  :MORE_SCH, :SVIL, :SCOL, :SAPN, :RYEAR, :RDOCT_NO, :ADD_VALUE, :ADD_DESC, :P_P_DESC, :NEAR_HNO,
                  :TOTAL_PLINTH, :PREV_BNO, :ADV_AMOUNT, :TERRACE_EXTENT, :TERRACE_UNIT, :MRO_PUSH, :APT_NORTH,
                  :APT_SOUTH, :APT_EAST, :APT_WEST, :APT_EXTENT, :APT_EXTENT_UNIT, :VILL_CODE_ALIAS, :SURVEY_EXT,
                  :SURVEY_EXT_UNIT, :TIME_STAMP, :MULTI_SURVEY, :DOORNO, :BI_WARD, :BI_BLOCK, :LP_NO, :PLP_NO,
                  :LPM_SURVEYNO, :STATUS, :SERVICE_TYPE, :REFERENCE_ID, :PROPERTY_TYPE, :PROPERTY_NEW_COUNT)`,
                params: {
                    SR_CODE: reqBody.SR_CODE,
                    BOOK_NO: reqBody.BOOK_NO,
                    DOCT_NO: reqBody.DOCT_NO,
                    REG_YEAR: reqBody.REG_YEAR,
                    SCHEDULE_NO: dummy,
                    WARD_NO:  dummy,
                    BLOCK_NO: dummy,
                    LOC_CODE: dummy,
                    LOC_HAB_NAME: dummy,
                    ROAD_CODE: dummy,
                    LOCAL_BODY:  dummy,
                    VILLAGE_CODE: dummy,
                    HAB_CODE:dummy,
                    SURVEY_NO: dummy,
                    OLD_SURVEY_NO: dummy,
                    PLOT_NO: dummy,
                    OLD_PLOT_NO: dummy,
                    NEW_HOUSE_NO: dummy,
                    OLD_HOUSE_NO: dummy,
                    EAST: dummy,
                    WEST: dummy,
                    NORTH: dummy,
                    SOUTH: dummy,
                    EXTENT: dummy,
                    UNIT: dummy,
                    EXTENT_RATE: dummy,
                    EXTENT_UNIT: dummy,
                    NATURE_USE:  dummy,
                    FLAT_NONFLAT: dummy,
                    APT_NAME: dummy,
                    FLAT_NO:  dummy,
                    TOT_FLOOR: dummy,
                    PREV_SRCODE: dummy,
                    PREV_DOCTNO: dummy,
                    PREV_RYEAR:  dummy,
                    PREV_SCHNO:  dummy,
                    CON_VALUE: dummy,
                    MKT_VALUE: dummy,
                    TAXABLE_VALUE: dummy,
                    CHARG_ITEM_CD: dummy,
                    ANNUAL_RENT: dummy,
                    LEASE_DATE:  dummy,
                    LEASE_PERIOD: dummy,
                    LEASE_ADV: dummy,
                    TYPE_OF_ADV: dummy,
                    LEASE_IMP: dummy,
                    LEASE_TAX: dummy,
                    PARTY_NO: dummy,
                    JURISDICTION: dummy,
                    ULC_ACT: dummy,
                    MORE_SCH: dummy,
                    SVIL: dummy,
                    SCOL: dummy,
                    SAPN: dummy,
                    RYEAR: dummy,
                    RDOCT_NO: dummy,
                    ADD_VALUE: dummy,
                    ADD_DESC: dummy,
                    P_P_DESC: dummy,
                    NEAR_HNO: dummy,
                    TOTAL_PLINTH: dummy,
                    PREV_BNO: dummy,
                    ADV_AMOUNT:  dummy,
                    TERRACE_EXTENT: dummy,
                    TERRACE_UNIT: dummy,
                    MRO_PUSH: dummy,
                    APT_NORTH: dummy,
                    APT_SOUTH: dummy,
                    APT_EAST: dummy,
                    APT_WEST: dummy,
                    APT_EXTENT:  dummy,
                    APT_EXTENT_UNIT: dummy,
                    VILL_CODE_ALIAS: dummy,
                    SURVEY_EXT: dummy,
                    SURVEY_EXT_UNIT: dummy,
                    TIME_STAMP:  dummy,
                    MULTI_SURVEY: dummy,
                    DOORNO: dummy,
                    BI_WARD:  dummy,
                    BI_BLOCK: dummy,
                    LP_NO: dummy,
                    PLP_NO: dummy,
                    LPM_SURVEYNO: dummy,
                    STATUS: 'P',
                    SERVICE_TYPE: reqBody.ServiceType,
                    REFERENCE_ID: REFERENCE_ID || null,
                    PROPERTY_NEW_COUNT: reqBody.PropertiesNew || dummy,
                    PROPERTY_TYPE: reqBody.PropertyType || dummy

                }
                
            })
        }

        // let EditIndexDirectory = `/pdfs/uploads/EditIndexESIGN/SrUpload/${reqBody.SR_CODE}_${reqBody.BOOK_NO}_${reqBody.DOCT_NO}_${reqBody.REG_YEAR}_${REFERENCE_ID}`;
        // if (!fsone.existsSync(EditIndexDirectory)) {
        //     await fsone.mkdirSync(EditIndexDirectory, { recursive: true });
        // }
        
        // const filePath = path.join(EditIndexDirectory,`UploadedDocument_${REFERENCE_ID}.pdf`);
        // const data = Buffer.from(reqBody.FILE, 'base64');
        //          fsone.writeFileSync(filePath, data) 

        const EditIndexDirectory = path.join(
            "/pdfs/uploads/EditIndexESIGN/SrUpload",
            `${reqBody.SR_CODE}_${reqBody.BOOK_NO}_${reqBody.DOCT_NO}_${reqBody.REG_YEAR}_${REFERENCE_ID}`
          );
          
          // Create folder if not exists
          if (!fsone.existsSync(EditIndexDirectory)) {
            fsone.mkdirSync(EditIndexDirectory, { recursive: true });
          }
          
          // Get existing count of PDF files in the directory
          let existingCount = fsone.readdirSync(EditIndexDirectory)
            .filter(file => file.endsWith(".pdf")).length;

            const fileCount = Array.isArray(reqBody.FILE) ? reqBody.FILE.length : 0;

          
          // Loop over reqBody.FILE array
          if (Array.isArray(reqBody.FILE) && reqBody.FILE.length > 0) {
            reqBody.FILE.forEach((fileObj, idx) => {
              const fileIndex = existingCount + idx + 1; // Continue from next index
              const filePath = path.join(EditIndexDirectory, `_${fileIndex}.pdf`);
              
              const data = Buffer.from(fileObj.base64, 'base64');
              fsone.writeFileSync(filePath, data);
            });
          
                    PartyInserts.push({
                        query: `
                        INSERT INTO SROUSER.EDIT_INDEX_ESIGN_FILE 
                                (SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR,REFERENCE_ID,SR_PATH,SERVICE_TYPE,RDOCT_NO,RYEAR,FILE_COUNT) 
                                VALUES (:SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR,:REFERENCE_ID,:SR_PATH,:SERVICE_TYPE,:RDOCT_NO,:RYEAR,:FILE_COUNT)`,
                        params: {
                            SR_CODE: reqBody.SR_CODE,
                            BOOK_NO: reqBody.BOOK_NO,
                            DOCT_NO: reqBody.DOCT_NO,
                            REG_YEAR: reqBody.REG_YEAR,
                            REFERENCE_ID: REFERENCE_ID,
                            SR_PATH: EditIndexDirectory,
                            RDOCT_NO:reqBody.RDOCT_NO,
                            RYEAR:reqBody.RYEAR,
                            SERVICE_TYPE:reqBody.ServiceType,
                            FILE_COUNT: fileCount

                            
                        }
                        
                    })
                }
        const results = [];
        if (PartyInserts.length > 0) {
            const result = await this.orDao.oDbMultipleInsertDocsWithBindParams(
                PartyInserts.map(item => ({
                    query: item.query,
                    bindParams: item.params
                }))
            );
            results.push(...result);
            processPartiesAfterInsert(); 
        }

        return results;
    } catch (ex) {
        console.error("Update Document - SubmitRequestForm || Error: ", ex);
        throw constructCARDError(ex);
    }
};
generateRequestEditIndexPDFSrvc = async (reqData) => {
    try {
        const bindParams = {SR_CODE : reqData.SR_CODE, BOOK_NO : reqData.BOOK_NO, DOCT_NO : reqData.DOCT_NO, REG_YEAR : reqData.REG_YEAR, REFERENCE_ID : reqData.REFERENCE_ID}
        const documentQuery = `select a.*, b.sr_name, c.dr_name, (select tran_desc from tran_dir where tran_maj_code = d.tran_maj_code and tran_min_code = d.tran_min_code and rownum =1) as tran_desc 
        from srouser.dr_jobs a, sr_master b, dr_master c, tran_major d where a.sr_code = :SR_CODE and a.book_no = :BOOK_NO and a.doct_no = :DOCT_NO and a.reg_year = :REG_YEAR and a.reference_id = :REFERENCE_ID and b.sr_cd = a.sr_code and b.dr_cd = c.dr_cd
        and a.sr_code = d.sr_code and a.book_no = d.book_no and a.doct_no = d.doct_no and a.reg_year = d.reg_year`
        const documentData = await this.orDao.oDBQueryServiceWithBindParams(documentQuery, bindParams);
        if(documentData.length == 0) {
            throw new Error("No data found");
        }
        const partiesQuery = `select * from srouser.tran_ec_edit where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID and firm_number is null and (party_type = 'N' or party_type is null)`
        const partiesResult = await this.orDao.oDBQueryServiceWithBindParams(partiesQuery, bindParams);
        const propertyQuery = `select * from srouser.tran_sched_edit where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID`
        let propertyResult = await this.orDao.oDBQueryServiceWithBindParams(propertyQuery, bindParams);
        const linkQuery = `select * from srouser.recti_edit where c_srcd = :SR_CODE and c_bno = :BOOK_NO and c_doctno = :DOCT_NO and c_regyear = :REG_YEAR and reference_id = :REFERENCE_ID`
        const linkResult = await this.orDao.oDBQueryServiceWithBindParams(linkQuery, bindParams);
        const representativesQuery = `select * from srouser.tran_ec_edit where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID and (firm_number is not null OR (party_type = 'R' and service_type = 'A')) order by code, ec_number`
        const representativesResult = await this.orDao.oDBQueryServiceWithBindParams(representativesQuery, bindParams);
        if(partiesResult.length == 0 && propertyResult.length == 0 && linkResult.length == 0 && representativesResult.length == 0) {
            throw new Error("No data found");
        }
        if(propertyResult.length > 0 && propertyResult[0].SERVICE_TYPE == 'E') {
            const excludedKeys = [
                'SR_CODE', 'BOOK_NO', 'DOCT_NO', 'REG_YEAR', 'RYEAR', 'RDOCT_NO',
                'STATUS', 'SERVICE_TYPE', 'PROPERTY_NEW_COUNT', 'PROPERTY_TYPE', 'SCHEDULE_NO'
              ];
            propertyResult = propertyResult.map(obj => {
                const keys = Object.entries(obj)
                  .filter(([key, value]) => value === '1' && !excludedKeys.includes(key))
                  .map(([key]) => key)
                  .join(', ');
             
                return {
                  COLUMN_DATA: keys,
                  SERVICE_TYPE: obj.SERVICE_TYPE,
                  SCHEDULE_NO : obj.SCHEDULE_NO
                };
              });
        }
        const assetsPath = path.join(__dirname, `../../assets/`);
        let bitmap = fsone.readFileSync(`${assetsPath}OfficialLogo.png`);
        let logoBase64 = bitmap.toString('base64');
        let dynamicData = {
            logo : logoBase64,
            headerMarginTop : 20,
            DR_NAME: documentData[0].DR_NAME,
            SR_NAME: `${documentData[0].SR_NAME}(${documentData[0].SR_CODE})`,
            documentId : documentData[0].SR_CODE + '-' + documentData[0].BOOK_NO + '-' + documentData[0].RDOCT_NO + '-' + documentData[0].RYEAR,
            referenceId : reqData.REFERENCE_ID,
            rejectReason: documentData[0].REQUEST_REASONS,
            requestTime : moment(documentData[0].REQUEST_TIME).format('DD/M/YYYY, hh:mm:ss a'),
            partiesData : partiesResult,
            propertyData : propertyResult,
            representativeData : representativesResult,
            linkData : linkResult,
            documentType : documentData[0].TRAN_DESC,
        };
        const editIndexHtmlFilesPath = path.join(__dirname, `../reports/editIndex/`);
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        const html = fsone.readFileSync(`${editIndexHtmlFilesPath}editIndexRequest.hbs`, 'utf8');
        page.setOfflineMode(true);
        hbs.registerHelper('inc', function (value) {
            return parseInt(value) + 1;
        });
        hbs.registerHelper('maskNumber', function (value) {
            if (!value || value.length < 4) return '-';
            const visibleDigits = 4;
            const maskedLength = value.length - visibleDigits;
            const maskedPart = 'X'.repeat(maskedLength);
            const lastFour = value.slice(-visibleDigits);
            return maskedPart + lastFour;
        });
        hbs.registerHelper('editValues', function (val1, val2, options) {
            return val1 !== val2 ? options.fn(this) : '';
          });
        hbs.registerHelper('status', function (arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });
        hbs.registerHelper('propertyTypeLabel', function (type) {
            if (type === 'R') return 'Rural';
            if (type === 'U') return 'Urban';
            return type;
        });
        hbs.registerHelper('removeUnderScore', function (value) {
            return value.replace(/_/g, ' ');
        });
        await page.setContent(hbs.compile(html)(dynamicData));
        const pdfBuffer = await page.pdf({
            printBackground: true,
            format: 'A4',
            margin: {
                top: '50px',
                right: '20px',
                bottom: '50px',
                left: '10px',
            },
            displayHeaderFooter: true,
            headerTemplate : `<div></div>`,
            footerTemplate: `
            <div style="font-size:10px; width:100%; padding:0 10px; box-sizing:border-box; font-family:Arial,sans-serif;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            <div>Generated on: ${moment(documentData[0].REQUEST_TIME).format('DD/M/YYYY, hh:mm:ss a')}</div>
            </div>
        </div>
            `
        });
        // <div style="display:flex; justify-content:space-between;text-align:right; margin:4px 70px 50px 70px; font-weight:bold;">
        //         <div>District Registrar</div>
        //         <div>Sub-Registrar</div>
        //     </div>
        await browser.close();
        const base64Pdf = pdfBuffer.toString('base64');
        return base64Pdf;
    }
    catch (ex) {
        Logger.error("UpdateDocumentServices - generateEditIndexPDFSrvc || Error :", ex);
        console.error("Update Document - generateEditIndexPDFSrvc || Error : ", ex );
        throw constructCARDError(ex);
    }
}
getEditIndexSRPDFdetails = async (reqBody) => {
    try {
      const filePath = reqBody.SR_PATH;
  
      if (!filePath || typeof filePath !== 'string') {
        throw new Error("Invalid or missing 'SR_PATH' in request body.");
      }
      if (fsone.existsSync(filePath)) {
        const fileBuffer = fsone.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');
        return base64File;
      } else {
        throw new Error(`File does not exist at path: ${filePath}`);
      }
    } catch (ex) {
      console.error("getEditIndexSRPDFdetails || Error: ", ex.message);
      throw constructCARDError(ex);
    }
  };
  //RP
  generateEditIndexPDFSrvc = async (reqData) => {
    try {
        const bindParams = {SR_CODE : reqData.SR_CODE, BOOK_NO : reqData.BOOK_NO, DOCT_NO : reqData.DOCT_NO, REG_YEAR : reqData.REG_YEAR, REFERENCE_ID : reqData.REFERENCE_ID }
        const documentQuery = `select a.*, b.sr_name, c.dr_name, d.service_type, (select tran_desc from tran_dir where tran_maj_code = e.tran_maj_code and tran_min_code = e.tran_min_code and rownum =1) tran_desc 
        from dr_jobs a, sr_master b, dr_master c, srouser.edit_index_esign_file d, tran_major e where
        a.sr_code = :SR_CODE and a.book_no = :BOOK_NO and a.doct_no = :DOCT_NO and a.reg_year = :REG_YEAR and a.reference_id = :REFERENCE_ID
        and b.sr_cd = a.sr_code and b.dr_cd = c.dr_cd and a.status = 'A' and a.sr_code = d.sr_code and a.doct_no = d.doct_no and a.book_no = d.book_no 
        and a.reg_year = d.reg_year and a.reference_id = d.reference_id and a.sr_code = e.sr_code and a.book_no = e.book_no and a.doct_no = e.doct_no and a.reg_year = e.reg_year`
        const documentData = await this.orDao.oDBQueryServiceWithBindParams(documentQuery, bindParams);
        if(documentData.length == 0) {
            throw new Error("No data found");
        }
        let partiesQuery, propertyQuery, propertyCheckResult, propertyResult, linkQuery, linkResult, representativesQuery, structureQuery, structureResult, leaseQuery, leaseResult;
        if(documentData[0].SERVICE_TYPE == 'E') {
            partiesQuery = `select b.*, a.* from tran_ec b, srouser.tran_ec_temp a where a.sr_code = :SR_CODE and a.book_no = :BOOK_NO and a.doct_no = :DOCT_NO and a.reg_year = :REG_YEAR and
            a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.book_no = b.book_no and a.reg_year = b.reg_year and a.ec_number = b.ec_number and a.code = b.code and a.reference_id = :REFERENCE_ID  order by b.code, b.ec_number`;
            representativesQuery = `select b.*, a.* from tran_ec_firms b, srouser.tran_ec_firms_temp a where a.sr_code = :SR_CODE and a.book_no = :BOOK_NO and a.doct_no = :DOCT_NO and a.reg_year = :REG_YEAR and
            a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.book_no = b.book_no and a.reg_year = b.reg_year and a.ec_number = b.ec_number and a.code = b.code and a.firm_number = b.firm_number and a.reference_id = :REFERENCE_ID and a.firm_number is not null order by b.code, b.ec_number, b.firm_number`;
            const propertyCheckQuery = `select * from srouser.tran_sched_edit where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID order by schedule_no`
            propertyCheckResult = await this.orDao.oDBQueryServiceWithBindParams(propertyCheckQuery, bindParams);
            if(propertyCheckResult.length > 0 && propertyCheckResult[0].SERVICE_TYPE == 'E') {
                const excludedKeys = [
                    'SR_CODE', 'BOOK_NO', 'DOCT_NO', 'REG_YEAR', 'RYEAR', 'RDOCT_NO',
                    'STATUS', 'SERVICE_TYPE', 'PROPERTY_NEW_COUNT', 'PROPERTY_TYPE', 'SCHEDULE_NO'
                  ];
                propertyCheckResult = propertyCheckResult.map(obj => {
                    const keys =  Object.entries(obj)
                      .filter(([key, value]) => value === '1' && !excludedKeys.includes(key))
                      .map(([key]) => key);
                    return {
                      COLUMN_DATA: keys,
                      SCHEDULE_NO : obj.SCHEDULE_NO
                    };
                  });
                  const propertyOldDataQuery = `select a.* from tran_sched a, srouser.tran_sched_temp b where b.sr_code = :SR_CODE and b.book_no = :BOOK_NO and b.doct_no = :DOCT_NO and b.reg_year = :REG_YEAR and b.reference_id = :REFERENCE_ID
                  and a.sr_code = b.sr_code and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.book_no = b.book_no and a.schedule_no = b.schedule_no order by b.schedule_no`
                  const propertyNewDataQuery = `select * from srouser.tran_sched_temp where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID order by schedule_no`;  
                  const propertyOldDataResult = await this.orDao.oDBQueryServiceWithBindParams(propertyOldDataQuery, bindParams);
                  const propertyNewDataResult = await this.orDao.oDBQueryServiceWithBindParams(propertyNewDataQuery, bindParams);
                  propertyResult = propertyCheckResult.map(r1 => {
                      const oldDetails = propertyOldDataResult.filter(r2 => r2.SCHEDULE_NO === r1.SCHEDULE_NO);
                      const newDetails = propertyNewDataResult.filter(r2 => r2.SCHEDULE_NO === r1.SCHEDULE_NO);
                      return {
                        ...r1,
                        existData: oldDetails[0],
                        editData: newDetails[0]
                      };
                    });
            }
        }
        else if(documentData[0].SERVICE_TYPE == 'A') {
            partiesQuery = `select * from srouser.tran_ec_temp where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID order by code, ec_number`;
            propertyQuery = `select  a.*,(SELECT LOCAL_BODY_DESC FROM local_body_dir i where i.LOCAL_BODY_CODE=a.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE , (SELECT LOCAL_BODY_NAME FROM hab_local_body j where j.HAB_CODE=a.HAB_CODE AND ROWNUM = 1 ) AS LOCAL_BODY_NAME,(select village_name from hab_code where hab_code=a.village_code||'01') villagename,(select class_desc from area_class where nature_use=class_code) landuse from srouser.tran_sched_temp a where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID order by schedule_no`;
            linkQuery = `select a.*, (select sr_name from sr_master where sr_cd = a.l_srcd) as sr_name from srouser.recti_temp a where c_srcd = :SR_CODE and c_bno = :BOOK_NO and c_doctno = :DOCT_NO and c_regyear = :REG_YEAR and reference_id = :REFERENCE_ID`;
            representativesQuery = `select * from srouser.tran_ec_firms_temp where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID order by code, ec_number, firm_number`;
            structureQuery = `select * from srouser.stru_det_temp where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID order by schedule_no`;
            structureResult = await this.orDao.oDBQueryServiceWithBindParams(structureQuery, bindParams);
            leaseQuery = `select * from srouser.TRAN_LEASE_TEMP where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID order by schedule_no`;
            leaseResult = await this.orDao.oDBQueryServiceWithBindParams(leaseQuery, bindParams);
        }
        else if(documentData[0].SERVICE_TYPE == 'D') {
            partiesQuery = `select a.* from tran_ec a, srouser.tran_ec_edit b where b.sr_code = :SR_CODE and b.book_no = :BOOK_NO and b.doct_no = :DOCT_NO and b.reg_year = :REG_YEAR and b.reference_id = :REFERENCE_ID
            and a.sr_code = b.sr_code and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.code = b.code and a.ec_number = b.ec_number and b.firm_number is null`;
            propertyQuery = `select  a.*,(SELECT LOCAL_BODY_DESC FROM local_body_dir i where i.LOCAL_BODY_CODE=a.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE , (SELECT LOCAL_BODY_NAME FROM hab_local_body j where j.HAB_CODE=a.HAB_CODE AND ROWNUM = 1 ) AS LOCAL_BODY_NAME,(select village_name from hab_code where hab_code=a.village_code||'01') villagename,(select class_desc from area_class where nature_use=class_code) landuse from tran_sched a where (sr_code, book_no, doct_no, reg_year, schedule_no)
            in (select sr_code, book_no, doct_no, reg_year, schedule_no from srouser.tran_sched_edit where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID) order by a.schedule_no`
            linkQuery = `select a.*, (select sr_name from sr_master where sr_cd = a.l_srcd) as sr_name from srouser.recti a where (c_srcd, c_bno, c_doctno, c_regyear, c_schno, l_srcd, l_bno, l_doctno, l_regyear) in (select c_srcd, c_bno, c_doctno, c_regyear, c_schno, l_srcd, l_bno, l_doctno, l_regyear from srouser.recti_edit where c_srcd = :SR_CODE and c_bno = :BOOK_NO and c_doctno = :DOCT_NO and c_regyear = :REG_YEAR and reference_id = :REFERENCE_ID)`;
            representativesQuery = `select a.* from tran_ec a, srouser.tran_ec_edit b where b.sr_code = :SR_CODE and b.book_no = :BOOK_NO and b.doct_no = :DOCT_NO and b.reg_year = :REG_YEAR and b.reference_id = :REFERENCE_ID
            and a.sr_code = b.sr_code and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.code = b.code and a.ec_number = b.ec_number and b.firm_number is not null order by a.code, a.ec_number, b.firm_number`;
        }
        const partiesResult = await this.orDao.oDBQueryServiceWithBindParams(partiesQuery, bindParams);
        const representativesResult = await this.orDao.oDBQueryServiceWithBindParams(representativesQuery, bindParams);
        if(documentData[0].SERVICE_TYPE != 'E') {
            propertyResult = await this.orDao.oDBQueryServiceWithBindParams(propertyQuery, bindParams);
            linkResult = await this.orDao.oDBQueryServiceWithBindParams(linkQuery, bindParams);
        }
        // const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
        // const data = fsone.readFileSync(imagePath , {encoding : 'base64'});
        const assetsPath = path.join(__dirname, `../../assets/`);
        let bitmap = fsone.readFileSync(`${assetsPath}OfficialLogo.png`);
        let logoBase64 = bitmap.toString('base64');
        let dynamicData = {
            logo : logoBase64,
            headerMarginTop : 20,
            documentType : documentData[0].TRAN_DESC,
            DR_NAME: documentData[0].DR_NAME,
            SR_NAME: `${documentData[0].SR_NAME}(${documentData[0].SR_CODE})`,
            documentId : documentData[0].SR_CODE + '-' + documentData[0].BOOK_NO + '-' + documentData[0].RDOCT_NO + '-' + documentData[0].RYEAR,
            referenceId : reqData.REFERENCE_ID,
            rejectReason: documentData[0].REQUEST_REASONS,
            partiesData : partiesResult,
            propertyData : propertyResult,
            linkData : linkResult,
            representativesData : representativesResult,
            structureData : structureResult ? (structureResult.length > 0 ? structureResult : []) : [],
            leaseData : leaseResult ? (leaseResult.length > 0 ? leaseResult : []):[],
            serviceType : documentData[0].SERVICE_TYPE,
            serviceName : documentData[0].SERVICE_TYPE == 'A' ? 'Add' : documentData[0].SERVICE_TYPE == 'E' ? 'Edit' : documentData[0].SERVICE_TYPE == 'D' ? 'Delete' : ''
        };
        let editIndexDrectory = `/pdfs/uploads/EditIndexESIGN/SrUpload/${reqData.SR_CODE}_${reqData.BOOK_NO}_${reqData.DOCT_NO}_${reqData.REG_YEAR}_${reqData.REFERENCE_ID}/`;
        if (!fsone.existsSync(editIndexDrectory)) {
            fsone.mkdirSync(editIndexDrectory, { recursive: true });
        }
        const editIndexHtmlFilesPath = path.join(__dirname, `../reports/editIndex/`);
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        const html = fsone.readFileSync(`${editIndexHtmlFilesPath}editIndex.hbs`, 'utf8');
        page.setOfflineMode(true);
        hbs.registerHelper('inc', function (value) {
            return parseInt(value) + 1;
        });
        hbs.registerHelper('maskNumber', function (value) {
            if(String(value).length > 8) {
                if (!String(value) || String(value).length < 4) return '-';
                const visibleDigits = 4;       
                const maskedLength = String(value).length - visibleDigits;
                const maskedPart = 'X'.repeat(maskedLength);
                const lastFour = String(value).slice(-visibleDigits);           
                return maskedPart + lastFour;
            }
            else {
                return value;
            }
        });
        hbs.registerHelper('editValues', function (val1, val2, options) {
            return (val1 !== val2 && val2 != null) ? options.fn(this) : '';
        });
        hbs.registerHelper('status', function (arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });
        hbs.registerHelper('eq', function (a, b) {
            return a === b;
        });
        hbs.registerHelper('or', function (a, b) {
            return a || b;
        });
        hbs.registerHelper('splitMonthYear', function (part) {
            return part === 'M' ? 'Month' : 'Year';
          });
        await page.setContent(hbs.compile(html)(dynamicData));
        const pdfBuffer = await page.pdf({
            path: `${editIndexDrectory}editIndex.pdf`,
            printBackground: true,
            format: 'A4',
            margin: {
                top: '50px',
                right: '20px',
                bottom: '250px',
                left: '10px',
            },
            displayHeaderFooter: true,
            headerTemplate : `<div></div>`,
            footerTemplate: `
            <div style="font-size:10px; width:100%; padding:0 10px; box-sizing:border-box; font-family:Arial,sans-serif;">
            <div style="display:flex; justify-content:space-between;text-align:right; margin:4px 70px 50px 70px; font-weight:bold;">
                <div>District Registrar</div>
                <div>Sub-Registrar</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            </div>
        </div>
            `
        });
        await browser.close();
        const base64Pdf = pdfBuffer.toString('base64');
        return base64Pdf;
    }
    catch (ex) {
        Logger.error("UpdateDocumentServices - generateEditIndexPDFSrvc || Error :", ex);
        console.error("Update Document - generateEditIndexPDFSrvc || Error : ", ex );
        throw constructCARDError(ex);
    }
}
editIndexEsignStatusSrvc = async (reqBody) => {
    try {       
      if (reqBody.rrn) {
        const base64String = Buffer.from(reqBody.rrn).toString('base64');
        const eSignConfig = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.IGRS_ESIGN_URL}/downloadSignedDocTransID?transactionId=${base64String}`,
        // url: `https://117.250.201.41:9080/igrs-esign-service/downloadSignedDocTransID?transactionId=${base64String}`,
        httpsAgent: new https.Agent({  
            rejectUnauthorized: false
        }),
          headers: {
            'Content-Type': 'application/json',
          },
        };
 
        const fileResponse = await axios(eSignConfig);
        if (!fileResponse?.data?.data) {
          console.log('Pending Esign was not completed');
          return null;
        } else {
            // const documentData = await this.orDao.oDBQueryServiceWithBindParams(`select * from srouser.edit_index_esign_file where reference_id = :rrn`, {rrn : reqBody.rrn})
          const base64Pdf = fileResponse.data.data;
          const pdfBytes = await convertBase64ToPdf(base64Pdf);
          const pdfPath = path.join(__dirname, `../../../../../pdfs/uploads/EditIndexESIGN/SrUpload/${reqBody.SR_CODE}_${reqBody.BOOK_NO}_${reqBody.DOCT_NO}_${reqBody.REG_YEAR}_${reqBody.REFERENCE_ID}/editIndex.pdf`);
        //   const filename = `../../../../../pdfs/uploads/Notify_Property_Report/${selecteddata[0].SR_CODE}/document_${reportID}-${selecteddata[0].SR_CODE}.pdf`;
        //   const pdfPath = path.join(__dirname, filename);
 
        await savePdfToFile(pdfBytes, pdfPath);
 
        const response = await this.orDao.oDbInsertDocsWithBindParams(`update srouser.edit_index_esign_file set ${reqBody.ROLE == 'DR' ? `dr_esign = 'Y'` : `sr_esign = 'Y'`} where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID`
            , {SR_CODE : reqBody.SR_CODE, BOOK_NO : reqBody.BOOK_NO, DOCT_NO : reqBody.DOCT_NO, REG_YEAR : reqBody.REG_YEAR, REFERENCE_ID : reqBody.REFERENCE_ID});
            if (response > 0) {
              console.log('PDF saved successfully');
            }
            if (reqBody.ROLE == 'DR') {
                const params = {
                  SR_CODE: reqBody.SR_CODE,
                  BOOK_NO: reqBody.BOOK_NO,
                  DOCT_NO: reqBody.DOCT_NO,
                  REG_YEAR: reqBody.REG_YEAR,
                  REFERENCE_ID: reqBody.REFERENCE_ID,
                };
                let RoleSetBeforeProcedureRunquery = `set role edit_indexes identified by r7777`;
                    const RoleResult = await this.orDao.oDBQueryService(RoleSetBeforeProcedureRunquery);
                    const Finalprocedure = `
BEGIN srouser.process_tran_sched(
  :p_reference_id,
  :PA_PROPERTY_rows_inserted,
  :PA_PARTY_rows_inserted,
  :PA_LINK_rows_inserted,
  :PA_PARTY_FIRMS_rows_inserted,
  :PA_STRUCT_rows_inserted,
  :PA_LEASE_ROWS_INSERTED,
  :PE_PROPERTY_rows_updated,
  :PE_PARTY_rows_updated,
  :PE_PARTY_FIRMS_rows_updated,
  :PD_STRUCT_rows_deleted,
  :PD_LEASE_rows_deleted,
  :PD_LINK_rows_deleted,
  :PD_DIRECT_PARTY_FIRMS_rows_deleted,
  :PD_RELATED_PARTY_FIRMS_rows_deleted,
  :PD_PARTY_rows_deleted
); 
END;`;

let obj = {
  p_reference_id: reqBody.REFERENCE_ID,
  PA_PROPERTY_rows_inserted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PA_PARTY_rows_inserted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PA_LINK_rows_inserted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PA_PARTY_FIRMS_rows_inserted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PA_STRUCT_rows_inserted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PA_LEASE_ROWS_INSERTED: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PE_PROPERTY_rows_updated: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PE_PARTY_rows_updated: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PE_PARTY_FIRMS_rows_updated: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PD_STRUCT_rows_deleted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PD_LEASE_rows_deleted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PD_LINK_rows_deleted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PD_DIRECT_PARTY_FIRMS_rows_deleted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PD_RELATED_PARTY_FIRMS_rows_deleted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
  PD_PARTY_rows_deleted: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER }
};

const procedureResult = await this.orDao.getSProcedureODB(Finalprocedure, obj);
console.log('PA_PROPERTY_rows_inserted:', procedureResult.PA_PROPERTY_rows_inserted);
console.log('PA_PARTY_rows_inserted:', procedureResult.PA_PARTY_rows_inserted);
console.log('PA_LINK_rows_inserted:', procedureResult.PA_LINK_rows_inserted);
console.log('PA_PARTY_FIRMS_rows_inserted:', procedureResult.PA_PARTY_FIRMS_rows_inserted);
console.log('PA_STRUCT_rows_inserted:', procedureResult.PA_STRUCT_rows_inserted);
console.log('PA_LEASE_ROWS_INSERTED:', procedureResult.PA_LEASE_ROWS_INSERTED);
console.log('PE_PROPERTY_rows_updated:', procedureResult.PE_PROPERTY_rows_updated);
console.log('PE_PARTY_rows_updated:', procedureResult.PE_PARTY_rows_updated);
console.log('PE_PARTY_FIRMS_rows_updated:', procedureResult.PE_PARTY_FIRMS_rows_updated);
console.log('PD_STRUCT_rows_deleted:', procedureResult.PD_STRUCT_rows_deleted);
console.log('PD_LEASE_rows_deleted:', procedureResult.PD_LEASE_rows_deleted);
console.log('PD_LINK_rows_deleted:', procedureResult.PD_LINK_rows_deleted);
console.log('PD_DIRECT_PARTY_FIRMS_rows_deleted:', procedureResult.PD_DIRECT_PARTY_FIRMS_rows_deleted);
console.log('PD_RELATED_PARTY_FIRMS_rows_deleted:', procedureResult.PD_RELATED_PARTY_FIRMS_rows_deleted);
console.log('PD_PARTY_rows_deleted:', procedureResult.PD_PARTY_rows_deleted);            
                let Updates = [
                  {
                    query: `update srouser.tran_ec_edit set status = 'Y' where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID`,
                    bindParams: params
                  },
                  {
                    query: `update srouser.tran_sched_edit set status = 'Y' where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID`,
                    bindParams: params
                  },
                  {
                    query: `update srouser.recti_edit set status = 'Y' where c_srcd = :SR_CODE and c_bno = :BOOK_NO and c_doctno = :DOCT_NO and c_regyear = :REG_YEAR and reference_id = :REFERENCE_ID`,
                    bindParams: params
                  }
                ];
              
                const results = [];
                if (Updates.length > 0) {
                  const result = await this.orDao.oDbMultipleInsertDocsWithBindParams(Updates);
                  results.push(...result);
                  let getRdoctNo = await this.orDao.oDBQueryServiceWithBindParams(`select rdoct_no,ryear from srouser.edit_index_esign_file where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID`, {SR_CODE : reqBody.SR_CODE, BOOK_NO : reqBody.BOOK_NO, DOCT_NO : reqBody.DOCT_NO, REG_YEAR : reqBody.REG_YEAR, REFERENCE_ID : reqBody.REFERENCE_ID});
                  let rdoctNo = getRdoctNo[0].RDOCT_NO;
                  let RYEAR = getRdoctNo[0].RYEAR;
                  const subIndexQuery = `BEGIN SROUSER.subindex_java(:sroCode, :regYear, :doctNo, :status); END;`;
                  const subIndexParams = {
                    sroCode: { val: parseInt(reqBody.SR_CODE), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
                    regYear: { val: parseInt(RYEAR), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
                    doctNo: { val: parseInt(rdoctNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
                    status: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER },
                  };
            
                  try {
                    const subIndexResult = await this.orDao.getSProcedureODB(subIndexQuery, subIndexParams);
                    const status = subIndexResult.status;
                    const statusMessage = status === 1
                      ? `Sub-Index successfully created for docId: ${rdoctNo}/${RYEAR} of SRO ${reqBody.SR_CODE}`
                      : `Sub-Index creation failed for docId: ${rdoctNo}/${RYEAR} of SRO ${reqBody.SR_CODE}`;
            
                    console.log(statusMessage);
                  } catch (err) {
                    console.error("Error during subindex_java execution:", err);
                    throw constructCARDError(err);
                  }
}
              }
                      // Read the saved PDF file and convert it to base64
          const savedPdf = await fs.readFile(path.resolve(pdfPath));
          const pdfBase64 = savedPdf.toString('base64');
 
          // Return the base64 PDF to the frontend
          return pdfBase64;
           
          }
       
        }
    //   return null;
    } catch (ex) {
      console.error("PPpendingEsignList || Error:", ex);
      throw ex;
    }
  };
 
 
  geteditIndexEsignDoctSrvc = async (reqBody) => {
    try {
          const pdfPath = path.join(__dirname, `../../../../../pdfs/uploads/EditIndexESIGN/SrUpload/${reqBody.SR_CODE}_${reqBody.BOOK_NO}_${reqBody.DOCT_NO}_${reqBody.REG_YEAR}_${reqBody.REFERENCE_ID}/editIndex.pdf`);
          const savedPdf = await fs.readFile(path.resolve(pdfPath));
          const pdfBase64 = savedPdf.toString('base64');
          return pdfBase64;
    } catch (ex) {
      console.error("editIndexEsignStatusSrvc || Error:", ex);
      throw ex;
    }
  };
 
 
 
  editIndexEsignSrvc = async (reqBody, reqParams) => {
    try {
        if(!(reqParams == 'SRO' || reqParams == 'DR')) {
            throw new Error("not authorized to do the E-Sign");
        }
        const srCodeToUse = reqParams === 'DR' ? reqBody.LOGIN_SRCODE : reqBody.SR_CODE;        
        const srData = await this.orDao.oDBQueryServiceWithBindParams(`select a.*, (select sr_name from sr_master where sr_cd = a.sr_code) as sr_name from employee_login_master a where sr_code = :SR_CODE and empl_id = :EMPL_ID`, {SR_CODE : srCodeToUse, EMPL_ID :reqBody.EMPL_ID});
        if(srData.length == 0) {
            throw new Error("No data found");
        }
          const pdfPath = path.join(__dirname, `../../../../../pdfs/uploads/EditIndexESIGN/SrUpload/${reqBody.SR_CODE}_${reqBody.BOOK_NO}_${reqBody.DOCT_NO}_${reqBody.REG_YEAR}_${reqBody.REFERENCE_ID}/editIndex.pdf`);
          console.log(fsone.existsSync(pdfPath));
          if(!fsone.existsSync(pdfPath)) {
            throw new Error("No file to do E-Sign");
          }
          const savedPdf = await fs.readFile(path.resolve(pdfPath));
          const pdfBase64 = savedPdf.toString('base64');
          const textWithPositions = await this.coordinates.extractTextWithPositionsFromPDF(`/pdfs/uploads/EditIndexESIGN/SrUpload/${reqBody.SR_CODE}_${reqBody.BOOK_NO}_${reqBody.DOCT_NO}_${reqBody.REG_YEAR}_${reqBody.REFERENCE_ID}/editIndex.pdf`);
          const totalPages = [...new Set(textWithPositions.map(item => item.page))].length;
          //   const searchText = "District Registrar";
        // const signaturePosition = textWithPositions.find(item => item.text.includes(searchText));
        // let roundedPosition;
        // if (signaturePosition) {
        //   roundedPosition = {
        //      x: Math.round(signaturePosition.position.x),
        //      y: Math.round(signaturePosition.position.y),
        //      pageNo: signaturePosition.page
        //  };
        // }
        let coordinatesData;
        if(reqParams == 'SRO') {
            coordinatesData = Array.from({ length: totalPages }, (_, i) => `${i + 1}-60,80,50,100`).join(';') + ';';
        }
        else if(reqParams == 'DR') {
            coordinatesData = Array.from({ length: totalPages }, (_, i) => `${i + 1}-450,80,50,100`).join(';') + ';';
        }
        const eSignData = {
            rrn: new Date().getTime(),
            coordinates_location: 'Top_Right',
          //   coordinates: `${roundedPosition.pageNo}-50,${roundedPosition.y},50,${roundedPosition.x-218};`,
            coordinates: coordinatesData,
            doctype: 'PDF',
            uid: srData[0].AADHAR,
            signername: srData[0].EMPL_NAME,
            signerlocation: `${srData[0].SR_NAME}(${srData[0].SR_CODE})`,
            filepassword: '',
            signreason: 'eSignForEditIndex',
            authmode: 2,
            // webhookurl: 'http://localhost:5005/card/Manual/PPNotify',
             webhookurl: reqParams == 'SRO' ? process.env.ESIGN_REDIRECTION_EDIT_INDEX : process.env.EDIT_INDEX_REDIRECT_DR_URL,
            file: pdfBase64,
          };
          let esignUrlData = await this.orDao.oDBQueryService(`SELECT * FROM SROUSER.esign_urls`);
          if (!esignUrlData || esignUrlData.length === 0) {
            throw new Error('Esign Urls Not Found');
          }
          const bindParams = {SR_CODE : reqBody.SR_CODE, BOOK_NO : reqBody.BOOK_NO, DOCT_NO : reqBody.DOCT_NO, REG_YEAR : reqBody.REG_YEAR, REFERENCE_ID : reqBody.REFERENCE_ID, RRN : eSignData.rrn, EMPL_ID : reqBody.EMPL_ID}
          await this.orDao.oDbInsertDocsWithBindParams(`update srouser.edit_index_esign_file set ${reqParams == 'SRO' ? `sr_esign = 'P', sr_esign_time_stamp = sysdate, sr_txn_id = :RRN, sr_entry_by = :EMPL_ID` : `dr_esign = 'P', dr_esign_time_stamp = sysdate, dr_txn_id = :RRN, dr_entry_by = :EMPL_ID`} where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID`, bindParams);
          let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
          
          let esignUrl = esignUrlData[0].NSDL_URL;
          console.log("esignUrl", esignUrl);    
        //   let esignUrl = 'http://117.250.201.41:9080/igrs-esign-service';
          let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
          return { result: eSignData, data: eSignReponse};
    } catch (ex) {
      console.error("editIndexEsignStatusSrvc || Error:", ex);
      throw ex;
    }
  };
 
 
 
  addEditIndexDataSrvc = async (reqData) => {
    try {
        let claimantArray = [];
        let executentArray = [];
        let propertyArray = [];
        let PropertyArray1 = [];
        let linkDocumentsArray = [];
        let representativesArray = [];
        let structureArray = [];
        let leaseDetailsArray = [];
        const bindParams = {SR_CODE : reqData.SR_CODE, DOCT_NO : reqData.DOCT_NO, BOOK_NO : reqData.BOOK_NO, REG_YEAR : reqData.REG_YEAR}
        const documentData = await this.orDao.oDBQueryServiceWithBindParams(`select * from tran_major where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR`, bindParams);
        if(documentData.length == 0 ) {
            throw new Error("No data found");  
        }
        if(reqData.addData.documentId != `${documentData[0].SR_CODE}-${documentData[0].BOOK_NO}-${documentData[0].RDOCT_NO}-${documentData[0].RYEAR}`) {
            throw new Error("Document Number mismatch");
        }
        if(reqData.addData.claimant.length > 0 ){
            const noOfClaimants = await this.orDao.oDBQueryServiceWithBindParams(`select COUNT(ec_number) as ec_number
                from tran_ec where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR and
                code like :CODE`,
                {...bindParams, CODE : `${reqData.addData.claimant[0].partyCode}%`}
            );
            const PartyNoResult = await this.orDao.oDBQueryServiceWithBindParams(`select max(party_no) as party_no from tran_ec where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR`,
                {...bindParams}
            );
            let EC_NUMBER = noOfClaimants.length > 0 ? noOfClaimants[0].EC_NUMBER + 1 : 1;
            let PartiionConfirm = documentData[0].TRAN_MAJ_CODE === '04';
            let PARTY_NO = PartyNoResult[0].PARTY_NO ? PartyNoResult[0].PARTY_NO + 1 : 1;
            for(let i of reqData.addData.claimant) {
                if(!i.isExisting) {
                    claimantArray.push({
                        query : `insert into srouser.tran_ec_temp (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,EC_NUMBER,CODE,NAME,R_CODE,R_NAME,AGE,ADDRESS1,ADDRESS2,RYEAR,RDOCT_NO,PAN_NO,PHOTO_TAKEN,GENDER,AADHAR,aadhar_encrpt,DOB,PHONE_NO,EMAIL_ID,PAN_NAME,PASSPORT_NO,PARTY_TYPE,REFERENCE_ID,PARTY_NO)
                    values (:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:EC_NUMBER,:partyCode,upper(:name),substr(:relationType,1,1),upper(:relationName), :age,:address,:currentAddress,:RYEAR,:RDOCT_NO,
                    upper(:panNoOrForm60or61),'','',upper(:aadhaar),:aadhar_encrpt,'',:phone,:email,'','',:partyType,:REFERENCE_ID,:PARTY_NO)`,
                        bindParams : {
                            SR_CODE : reqData.SR_CODE,
                            DOCT_NO : reqData.DOCT_NO,
                            BOOK_NO : reqData.BOOK_NO,
                            REG_YEAR : reqData.REG_YEAR,
                            EC_NUMBER: EC_NUMBER,
                            partyCode: i.partyCode,
                            PARTY_NO : PartiionConfirm ? PARTY_NO : '',
                            name: i.name,
                            relationType: i.relationType,
                            relationName: i.relationName,
                            age: i.age,
                            address: i.address,
                            currentAddress: i.currentAddress,
                            panNoOrForm60or61: i.panNoOrForm60or61 ? i.panNoOrForm60or61 : i.objectType,
                            aadhaar: i.aadhaar ? i.aadhaar : i.panNoOrForm60or61 ? i.panNoOrForm60or61 : i.tan,
                            aadhar_encrpt: i.aadhaar? i.aadhaar.length == 12? AadharencryptData(i.aadhaar) : i.aadhaar : '',
                            phone: i.phone,
                            email: i.email,
                            partyType: i.partyType,
                            REFERENCE_ID: reqData.REFERENCE_ID,
                            RDOCT_NO : documentData[0].RDOCT_NO,
                            RYEAR : documentData[0].RYEAR
                        }})
                    }
                    if(i.represent.length > 0) {
                        let FIRM_NUMBER = 1;
                        if(i.isExisting) {
                            const noOfRepresentatives = await this.orDao.oDBQueryServiceWithBindParams(`select COUNT(firm_number) as firm_number
                                    from tran_ec_firms where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR and
                                    code like :CODE and ec_number = :EC_NUMBER`,
                                    {...bindParams, CODE : `${i.partyCode}%`, EC_NUMBER : i.ecNumber}
                                )
                            FIRM_NUMBER = noOfRepresentatives.length > 0 ? noOfRepresentatives[0].FIRM_NUMBER + 1 : 1;
                        }
                        for(let j of i.represent) {
                            representativesArray.push({
                                query : `insert into srouser.tran_ec_firms_temp 
                                (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,EC_NUMBER,CODE,FIRM_NUMBER,NAME,R_CODE,R_NAME,AGE,ADDRESS1,ADDRESS2,CAPACITY,RYEAR,RDOCT_NO,
                                PAN_NO,PHOTO_TAKEN,AADHAR,aadhar_encrpt,PAN_NAME,PASSPORT_NO,REFERENCE_ID)
                            values (:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:EC_NUMBER,:partyCode,:FIRM_NUMBER,upper(:name),substr(:relationType,1,1),upper(:relationName), :age,:address,:currentAddress,'',:RYEAR,:RDOCT_NO,
                            upper(:panNoOrForm60or61),'',upper(:aadhaar),:aadhar_encrpt,'','',:REFERENCE_ID)`,
                                bindParams : {
                                    SR_CODE : reqData.SR_CODE,
                                    DOCT_NO : reqData.DOCT_NO,
                                    BOOK_NO : reqData.BOOK_NO,
                                    REG_YEAR : reqData.REG_YEAR,
                                    EC_NUMBER: i.isExisting ? i.ecNumber : EC_NUMBER,
                                    partyCode: i.partyCode,
                                    FIRM_NUMBER : FIRM_NUMBER,
                                    name: j.name,
                                    relationType: j.relationType,
                                    relationName: j.relationName,
                                    age: j.age,
                                    address: j.address,
                                    currentAddress: j.currentAddress,
                                    panNoOrForm60or61: j.panNoOrForm60or61 ? j.panNoOrForm60or61 : j.objectType,
                                    aadhaar: j.aadhaar ? j.aadhaar : j.panNoOrForm60or61 ? j.panNoOrForm60or61 : j.tan,
                                    aadhar_encrpt: j.aadhaar? j.aadhaar.length == 12? AadharencryptData(j.aadhaar) : j.aadhaar : '',
                                    REFERENCE_ID: reqData.REFERENCE_ID,
                                    RDOCT_NO : documentData[0].RDOCT_NO,
                                    RYEAR : documentData[0].RYEAR
                                }})
                                FIRM_NUMBER++;
                        }
                    }
                    !i.isExisting && EC_NUMBER++;
            }
        }
        if(reqData.addData.executent.length > 0 ){
            const noOfExecutents = await this.orDao.oDBQueryServiceWithBindParams(`select COUNT(ec_number) as ec_number
                from tran_ec where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR and
                code like :CODE`,
                {...bindParams, CODE : `${reqData.addData.executent[0].partyCode}%`}
            )
            let EC_NUMBER = noOfExecutents.length > 0 ? noOfExecutents[0].EC_NUMBER + 1 : 1;
            for(let i of reqData.addData.executent) {
                if(!i.isExisting) {
                    executentArray.push({
                        query : `insert into srouser.tran_ec_temp (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,EC_NUMBER,CODE,NAME,R_CODE,R_NAME,AGE,ADDRESS1,ADDRESS2,RYEAR,RDOCT_NO,PARTY_NO,PAN_NO,PHOTO_TAKEN,GENDER,AADHAR,aadhar_encrpt,DOB,PHONE_NO,EMAIL_ID,PAN_NAME,PASSPORT_NO,PARTY_TYPE,REFERENCE_ID)
                    values (:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:EC_NUMBER,:partyCode,upper(:name),substr(:relationType,1,1),upper(:relationName), :age,:address,:currentAddress,:RYEAR,:RDOCT_NO,'',
                    upper(:panNoOrForm60or61),'','',upper(:aadhaar),:aadhar_encrpt,'',:phone,:email,'','',:partyType,:REFERENCE_ID)`,
                        bindParams : {
                            SR_CODE : reqData.SR_CODE,
                            DOCT_NO : reqData.DOCT_NO,
                            BOOK_NO : reqData.BOOK_NO,
                            REG_YEAR : reqData.REG_YEAR,
                            EC_NUMBER: EC_NUMBER,
                            partyCode: i.partyCode,
                            name: i.name,
                            relationType: i.relationType,
                            relationName: i.relationName,
                            age: i.age,
                            address: i.address,
                            currentAddress: i.currentAddress,
                            panNoOrForm60or61: i.panNoOrForm60or61 ? i.panNoOrForm60or61 : i.objectType,
                            aadhaar: i.aadhaar ? i.aadhaar : i.panNoOrForm60or61 ? i.panNoOrForm60or61 : i.tan,
                            aadhar_encrpt: i.aadhaar? i.aadhaar.length == 12? AadharencryptData(i.aadhaar) : i.aadhaar : '',
                            phone: i.phone,
                            email: i.email,
                            partyType: i.partyType,
                            REFERENCE_ID: reqData.REFERENCE_ID,
                            RDOCT_NO : documentData[0].RDOCT_NO,
                            RYEAR : documentData[0].RYEAR
                        }})
                    }
                    if(i.represent.length > 0) {
                        let FIRM_NUMBER = 1;
                        if(i.isExisting) {
                            const noOfRepresentatives = await this.orDao.oDBQueryServiceWithBindParams(`select COUNT(firm_number) as firm_number
                                    from tran_ec_firms where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR and
                                    code like :CODE and ec_number = :EC_NUMBER`,
                                    {...bindParams, CODE : `${i.partyCode}%`, EC_NUMBER : i.ecNumber}
                                )
                            FIRM_NUMBER = noOfRepresentatives.length > 0 ? noOfRepresentatives[0].FIRM_NUMBER + 1 : 1;
                        }
                        for(let j of i.represent) {
                            representativesArray.push({
                                query : `insert into srouser.tran_ec_firms_temp 
                                (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,EC_NUMBER,CODE,FIRM_NUMBER,NAME,R_CODE,R_NAME,AGE,ADDRESS1,ADDRESS2,CAPACITY,RYEAR,RDOCT_NO,
                                PAN_NO,PHOTO_TAKEN,AADHAR,aadhar_encrpt,PAN_NAME,PASSPORT_NO,REFERENCE_ID)
                            values (:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:EC_NUMBER,:partyCode,:FIRM_NUMBER,upper(:name),substr(:relationType,1,1),upper(:relationName), :age,:address,:currentAddress,'',:RYEAR,:RDOCT_NO,
                            upper(:panNoOrForm60or61),'',upper(:aadhaar),:aadhar_encrpt,'','',:REFERENCE_ID)`,
                                bindParams : {
                                    SR_CODE : reqData.SR_CODE,
                                    DOCT_NO : reqData.DOCT_NO,
                                    BOOK_NO : reqData.BOOK_NO,
                                    REG_YEAR : reqData.REG_YEAR,
                                    EC_NUMBER: i.isExisting ? i.ecNumber : EC_NUMBER,
                                    partyCode: i.partyCode,
                                    FIRM_NUMBER : FIRM_NUMBER,
                                    name: j.name,
                                    relationType: j.relationType,
                                    relationName: j.relationName,
                                    age: j.age,
                                    address: j.address,
                                    currentAddress: j.currentAddress,
                                    panNoOrForm60or61: j.panNoOrForm60or61 ? j.panNoOrForm60or61 : j.objectType,
                                    aadhaar: j.aadhaar ? j.aadhaar : j.panNoOrForm60or61 ? j.panNoOrForm60or61 : j.tan,
                                    aadhar_encrpt: j.aadhaar? j.aadhaar.length == 12? AadharencryptData(j.aadhaar) : j.aadhaar : '',
                                    REFERENCE_ID: reqData.REFERENCE_ID,
                                    RDOCT_NO : documentData[0].RDOCT_NO,
                                    RYEAR : documentData[0].RYEAR
                                }})
                            FIRM_NUMBER++;
                        }
                    }
                    !i.isExisting && EC_NUMBER++;
                }
        }
        if(reqData.addData.property.length > 0 ) {
            const noOfSchedules = await this.orDao.oDBQueryServiceWithBindParams(`select COUNT(schedule_no) as schedule_no
                from tran_sched where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR`, bindParams);
            let SCHEDULE_NO = noOfSchedules[0].SCHEDULE_NO + 1;
            for(let i of reqData.addData.property) {
                propertyArray.push({
                    query : `INSERT INTO srouser.TRAN_SCHED_TEMP (
                        SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, WARD_NO, BLOCK_NO, LOC_CODE, LOC_HAB_NAME, ROAD_CODE,
                        LOCAL_BODY, VILLAGE_CODE, HAB_CODE, SURVEY_NO, OLD_SURVEY_NO, PLOT_NO, OLD_PLOT_NO, NEW_HOUSE_NO,
                        OLD_HOUSE_NO, EAST, WEST, NORTH, SOUTH, EXTENT, UNIT, EXTENT_RATE, EXTENT_UNIT, NATURE_USE, FLAT_NONFLAT,
                        APT_NAME, FLAT_NO, TOT_FLOOR, PREV_SRCODE, PREV_DOCTNO, PREV_RYEAR, PREV_SCHNO, CON_VALUE, MKT_VALUE,
                        TAXABLE_VALUE, CHARG_ITEM_CD, ANNUAL_RENT, LEASE_DATE, LEASE_PERIOD, LEASE_ADV, TYPE_OF_ADV, LEASE_IMP,
                        LEASE_TAX, PARTY_NO, JURISDICTION, ULC_ACT, MORE_SCH, SVIL, SCOL, SAPN, RYEAR, RDOCT_NO, ADD_VALUE,
                        ADD_DESC, P_P_DESC, NEAR_HNO, TOTAL_PLINTH, PREV_BNO, ADV_AMOUNT, TERRACE_EXTENT, TERRACE_UNIT, MRO_PUSH,
                        APT_NORTH, APT_SOUTH, APT_EAST, APT_WEST, APT_EXTENT, APT_EXTENT_UNIT, VILL_CODE_ALIAS, SURVEY_EXT,
                        SURVEY_EXT_UNIT, TIME_STAMP, MULTI_SURVEY, DOORNO, BI_WARD, BI_BLOCK, LP_NO, PLP_NO, LPM_SURVEYNO,
                        REFERENCE_ID
                    )
                    VALUES (
                        :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :SCHEDULE_NO, :WARD_NO, :BLOCK_NO, :LOC_CODE, :LOC_HAB_NAME, :ROAD_CODE,
                        :LOCAL_BODY, (SELECT SUBSTR(hab_code, 1, 7) FROM hab_match WHERE webland_code = :VILLAGE_CODE || '01' AND ROWNUM = 1), :HAB_CODE,
                        :SURVEY_NO, :OLD_SURVEY_NO, :PLOT_NO, :OLD_PLOT_NO, :NEW_HOUSE_NO,
                        :OLD_HOUSE_NO, :EAST, :WEST, :NORTH, :SOUTH, :EXTENT, :UNIT, :EXTENT_RATE, :EXTENT_UNIT, :NATURE_USE,
                        :FLAT_NONFLAT, :APT_NAME, :FLAT_NO, :TOT_FLOOR, :PREV_SRCODE, :PREV_DOCTNO, :PREV_RYEAR, :PREV_SCHNO,
                        (select final_taxable_value from tran_major where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR),
                        :MKT_VALUE, :TAXABLE_VALUE, :CHARG_ITEM_CD, :ANNUAL_RENT, TO_DATE(:LEASE_DATE,'DD-MM-YYYY'), :LEASE_PERIOD, :LEASE_ADV,
                        :TYPE_OF_ADV, :LEASE_IMP, :LEASE_TAX, :PARTY_NO, :JURISDICTION, :ULC_ACT, :MORE_SCH,
                         (select soundex((select village_name from hab_code where hab_code = :HAB_CODE and rownum =1)) from dual), (select soundex(:LOC_HAB_NAME) from dual), 
                         (select soundex(nvl(:APT_NAME,'')) from dual),
                        :RYEAR, :RDOCT_NO, :ADD_VALUE, :ADD_DESC, :P_P_DESC, :NEAR_HNO, :TOTAL_PLINTH, :PREV_BNO, :ADV_AMOUNT,
                        :TERRACE_EXTENT, :TERRACE_UNIT, :MRO_PUSH, :APT_NORTH, :APT_SOUTH, :APT_EAST, :APT_WEST, :APT_EXTENT,
                        :APT_EXTENT_UNIT, :VILL_CODE_ALIAS, :SURVEY_EXT, :SURVEY_EXT_UNIT, sysdate, :MULTI_SURVEY, :DOORNO,
                        :BI_WARD, :BI_BLOCK, :LP_NO, :PLP_NO, :LPM_SURVEYNO, :REFERENCE_ID
                    )
                    `,
                    bindParams : {
                        SR_CODE : reqData.SR_CODE,
                        DOCT_NO : reqData.DOCT_NO,
                        BOOK_NO : reqData.BOOK_NO,
                        REG_YEAR : reqData.REG_YEAR,
                        SCHEDULE_NO : SCHEDULE_NO,
                        WARD_NO : i.ward || 0, 
                        BLOCK_NO : i.block || 0,
                        LOC_CODE : '',
                        LOC_HAB_NAME : i.habitation,
                        ROAD_CODE : '',
                        LOCAL_BODY : i.localBodyCode,
                        VILLAGE_CODE : i.villageCode,
                        HAB_CODE : i.habitationCode,
                        SURVEY_NO : `,${i.survayNo},`,
                        OLD_SURVEY_NO : '',
                        PLOT_NO : `${i.plotNo}`,
                        OLD_PLOT_NO : '',
                        NEW_HOUSE_NO : '',
                        OLD_HOUSE_NO : `,${i.doorNo},`, 
                        EAST : i.eastBoundry,
                        WEST : i.westBoundry,
                        NORTH : i.northBoundry,
                        SOUTH : i.southBoundry,
                        EXTENT : i.conveyedExtent.length > 0 ? i.conveyedExtent[0].extent : '',
                        UNIT : i.conveyedExtent.length > 0 ? i.conveyedExtent[0].unit : '',
                        EXTENT_RATE : '',
                        EXTENT_UNIT : '',
                        NATURE_USE : i.landUseCode,
                        FLAT_NONFLAT : '', //need clarify
                        APT_NAME: i.appartmentName || '',
                        FLAT_NO : i.flatNo || '',
                        TOT_FLOOR : i.totalFloors || '',
                        PREV_SRCODE : '',
                        PREV_DOCTNO: '',
                        PREV_RYEAR: '',
                        PREV_SCHNO: '',
                        MKT_VALUE: i.marketValue || 0,
                        TAXABLE_VALUE: '',
                        CHARG_ITEM_CD: '',
                        ANNUAL_RENT: 0,
                        LEASE_DATE: moment(i.leaseDetails?.wef).format('DD-MM-YYYY') || '',
                        LEASE_PERIOD: i.leaseDetails?.lPeriod || '',
                        LEASE_ADV: i?.leaseDetails?.advance || '',
                        TYPE_OF_ADV: '',
                        LEASE_IMP: i?.leaseDetails?.valueOfImp || '',
                        LEASE_TAX: 0,
                        PARTY_NO: (i.partyNumber ? (i.partyNumber === '' ? '' : (/^[0-9]+$/.test(i.partyNumber.trim()) ? Number(i.partyNumber.trim()) : 0)) : ''),
                        JURISDICTION: i.sroCode || '',
                        ULC_ACT: i.ulc_act || 'Non AG',
                        MORE_SCH: i.more_sch || 'N',
                        // SAPN: '',
                        RYEAR: documentData[0].RYEAR,
                        RDOCT_NO: documentData[0].RDOCT_NO,
                        ADD_VALUE: i.add_value || 0,
                        ADD_DESC: '',
                        P_P_DESC: '',
                        NEAR_HNO: '',
                        TOTAL_PLINTH: 0, //need clarification   
                        PREV_BNO: '',
                        ADV_AMOUNT: 0,
                        TERRACE_EXTENT: '',
                        TERRACE_UNIT: '',
                        MRO_PUSH: '',
                        APT_NORTH: i.flatNorthBoundry || '',
                        APT_SOUTH: i.flatSouthBoundry || '',
                        APT_EAST: i.flatEastBoundry || '',
                        APT_WEST: i.flatWestBoundry || '',
                        APT_EXTENT: '',
                        APT_EXTENT_UNIT: '',
                        VILL_CODE_ALIAS: '',
                        SURVEY_EXT: ',',
                        SURVEY_EXT_UNIT: '',
                        MULTI_SURVEY: 'Y',
                        DOORNO: '',
                        BI_WARD: '',
                        BI_BLOCK: '',
                        LP_NO: i.lpmNo || '', 
                        PLP_NO: '',
                        LPM_SURVEYNO: '',
                        REFERENCE_ID: reqData.REFERENCE_ID
                    }
                })
                  if(reqData.addData.property.length > 0 && documentData[0].TRAN_MAJ_CODE == '04' ) {
            const noOfSchedules = await this.orDao.oDBQueryServiceWithBindParams(`select COUNT(schedule_no) as schedule_no
                from tran_sched where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR`, bindParams);
            let SCHEDULE_NO = noOfSchedules[0].SCHEDULE_NO + 1;
            for(let i of reqData.addData.property) {
                PropertyArray1.push({
                    query : `INSERT INTO SROUSER.TRAN_SCHED_PARTITION_TEMP (
                        SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO,PARTY_NO, REFERENCE_ID
                    )
                    VALUES (
                        :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :SCHEDULE_NO, :PARTY_NO, :REFERENCE_ID
                    )
                    `,
                    bindParams : {
                        SR_CODE : reqData.SR_CODE,
                        DOCT_NO : reqData.DOCT_NO,
                        BOOK_NO : reqData.BOOK_NO,
                        REG_YEAR : reqData.REG_YEAR,
                        SCHEDULE_NO : SCHEDULE_NO,
                        PARTY_NO: i.partyNumber ? i.partyNumber :'',
                        REFERENCE_ID: reqData.REFERENCE_ID
                    }
                })
            }}
                
                if(i.LinkedDocDetails.length > 0) {
                    for(let j of i.LinkedDocDetails) {
                        linkDocumentsArray.push({
                            query : `Insert into SROUSER.RECTI_TEMP (C_SRCD,C_BNO,C_DOCTNO,C_REGYEAR,L_SRCD,L_BNO,L_DOCTNO,L_REGYEAR,CODE,C_SCHNO,L_SCHNO,R_DOCTNO,R_YEAR,REFERENCE_ID)
                            values (:C_SRCD,:C_BNO,:C_DOCTNO,:C_REGYEAR,:L_SRCD,:L_BNO,:L_DOCTNO,:L_REGYEAR,'LNK',:C_SCHNO,:L_SCHNO,:RDOCT_NO,:RYEAR,:REFERENCE_ID)`,
                            bindParams : {
                                C_SRCD : reqData.SR_CODE,
                                C_BNO : reqData.BOOK_NO,
                                C_DOCTNO : reqData.DOCT_NO,
                                C_REGYEAR : reqData.REG_YEAR,
                                L_SRCD : j.sroCode,
                                L_BNO : j.bookNo,
                                L_DOCTNO : j.linkDocNo,
                                L_REGYEAR : j.regYear,
                                C_SCHNO : SCHEDULE_NO,
                                L_SCHNO : '',
                                RDOCT_NO : documentData[0].RDOCT_NO,
                                RYEAR : documentData[0].RYEAR,
                                REFERENCE_ID : reqData.REFERENCE_ID
                            }
    
                        })
                    }
                }
                if(i.structure.length > 0) {
                    for(let j of i.structure) {
                        structureArray.push({
                            query : `Insert into SROUSER.STRU_DET_TEMP (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,SCHEDULE_NO,FLOOR_NO,STRU_TYPE,PLINTH,UNIT,AGE,RYEAR,RDOCT_NO,REFERENCE_ID, FLOOR_NAME, STRU_TYPE_NAME, STAGE_OF_CONS)
                            values (:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:SCHEDULE_NO,:FLOOR_NO,upper(:STRU_TYPE),:PLINTH,:UNIT,:AGE,:RYEAR,:RDOCT_NO,:REFERENCE_ID, :FLOOR_NAME, :STRU_TYPE_NAME, :STAGE_OF_CONS)`,
                            bindParams : {
                                SR_CODE : reqData.SR_CODE,
                                BOOK_NO : reqData.BOOK_NO,
                                DOCT_NO : reqData.DOCT_NO,
                                REG_YEAR : reqData.REG_YEAR,
                                SCHEDULE_NO : SCHEDULE_NO,
                                FLOOR_NO : j.floorCode,
                                STRU_TYPE : j.structureType.substring(0, 2),
                                PLINTH : j.plinth,
                                UNIT : 'S',
                                AGE : j.age,
                                RDOCT_NO : documentData[0].RDOCT_NO,
                                RYEAR : documentData[0].RYEAR,
                                REFERENCE_ID : reqData.REFERENCE_ID,
                                FLOOR_NAME : j.floorNo.replace(/\s*\[.*?\]\s*/g, '').trim(),
                                STRU_TYPE_NAME : j.structureType.replace(/\s*\[.*?\]\s*/g, '').trim(),
                                STAGE_OF_CONS : j.stageOfCons.replace(/\s*\[.*?\]\s*/g, '').trim()
                            }
                        })
                    }
                }
                if(i.leaseDetails) {
                    for(let j of i.leaseDetails?.rentalDetails) {
                        leaseDetailsArray.push({
                            query : `Insert into SROUSER.TRAN_LEASE_TEMP (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,SCHEDULE_NO,RENT_AMOUNT,MONTH_YEAR,RENT_PERIOD,RYEAR,RDOCT_NO,REFERENCE_ID)
                            values (:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:SCHEDULE_NO,:RENT_AMOUNT,:MONTH_YEAR,:RENT_PERIOD,:RYEAR,:RDOCT_NO,:REFERENCE_ID)`,
                            bindParams : {
                                SR_CODE : reqData.SR_CODE,
                                BOOK_NO : reqData.BOOK_NO,
                                DOCT_NO : reqData.DOCT_NO,
                                REG_YEAR : reqData.REG_YEAR,
                                SCHEDULE_NO : SCHEDULE_NO,
                                RENT_AMOUNT : j.rentalAmount,
                                MONTH_YEAR : j.renatmonthlyOrYearly,
                                RENT_PERIOD : j.rentalPeriod,
                                RDOCT_NO : documentData[0].RDOCT_NO,
                                RYEAR : documentData[0].RYEAR,
                                REFERENCE_ID : reqData.REFERENCE_ID,
                            }
                        })
                    }
                }
                SCHEDULE_NO++;
            }
        }        
        const data = [...executentArray,...claimantArray, ...propertyArray, ...linkDocumentsArray, ...representativesArray, ...structureArray, ...leaseDetailsArray, ...PropertyArray1];        
        data.push(
            {
                query : `update srouser.edit_index_esign_file set add_status = 'Y' where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID`,
                bindParams : {
                    ...bindParams, REFERENCE_ID : reqData.REFERENCE_ID
                }
            }
        )
        let response = await this.orDao.oDbMultipleInsertDocsWithBindParams(data);
        return true;
    } catch (ex) {
      console.error("editIndexEsignStatusSrvc || Error:", ex);
      throw ex;
    }
  };
 //RP END
  // -----------------------Services Related to EditIndex1983--------------------------------------------------------------------------------//
  
  getEIODBASEdetails = async (reqData) => {
    try {
        let query =  `select ROWID,SR_CODE,DOCT_NO,BOOK_NO,REG_YEAR,REQUEST_BY,TO_CHAR(REQUEST_TIME, 'DD-MM-YYYY') AS REQUEST_DATE,STATUS,REQUEST_REASONS,RESPONSE_BY,TO_CHAR(RESPONSE_TIME, 'DD-MM-YYYY') AS RESPONSE_DATE,REJECT_REASONS,DR_PATH from srouser.dr_jobs_ind WHERE SR_CODE=:srcode AND STATUS!='N'`;
        const bindParams = {
            srcode: reqData.SR_CODE,
        };
        let result = await this.orDao.oDBQueryServicereadWithBindParamsed(query, bindParams);
        if (result && result) {
            const processedRows = await Promise.all(
                result.map(async (row) => {                    
                    if (row.DR_FILE) {
                        row.DR_FILE = row.DR_FILE.toString('base64');
                    }
                    return row;
                })
            );
            result = processedRows;
        }
        return result;
    } catch (ex) {
        console.error("UpdateDocumentServices - getEIODBASEdetails || Error : ", ex);
        throw constructCARDError(ex);
    }
}
getEIODBASEONSTATUSdetails = async (reqData) => {
    try {
        let selectFields = `
            ROWID, SR_CODE, DOCT_NO, BOOK_NO, REG_YEAR, REQUEST_BY, 
            TO_CHAR(REQUEST_TIME, 'DD-MM-YYYY') AS REQUEST_DATE, 
            STATUS, REQUEST_REASONS, RESPONSE_BY, 
            TO_CHAR(RESPONSE_TIME, 'DD-MM-YYYY') AS RESPONSE_DATE, 
            REJECT_REASONS
        `;
        if (reqData.STATUS === 'P') {
            selectFields += `, SR_PATH`;
        }
        let query = `
            SELECT ${selectFields}
            FROM srouser.dr_jobs_ind 
            WHERE SR_CODE = :srcode AND STATUS = :status
        `;

        const bindParams = {
            srcode: reqData.SR_CODE,
            status: reqData.STATUS,
        };

        let result = await this.orDao.oDBQueryServicereadWithBindParamsed(query, bindParams);
         // Process the result to remove double backslashes in SR_PATH
         result = result.map(row => {
            if (row.SR_PATH && row.SR_PATH.includes('\\')) {
                row.SR_PATH = row.SR_PATH.replace(/\\/g, '/');
            }
            return row;
        });

        return result; // Returning the modified result

    } catch (ex) {
        console.error("UpdateDocumentServices - getEIODBASEONSTATUSdetails || Error : ", ex);
        throw constructCARDError(ex);
    }
};

// getEIODBASEONSTATUSdetails = async (reqData) => {
//     try {
//         let selectFields = `
//             ROWID, SR_CODE, DOCT_NO, BOOK_NO, REG_YEAR, REQUEST_BY, 
//             TO_CHAR(REQUEST_TIME, 'DD-MM-YYYY') AS REQUEST_DATE, 
//             STATUS, REQUEST_REASONS, RESPONSE_BY, 
//             TO_CHAR(RESPONSE_TIME, 'DD-MM-YYYY') AS RESPONSE_DATE, 
//             REJECT_REASONS
//         `;
//         if (reqData.STATUS === 'P') {
//             selectFields += `, SR_PATH`;
//         }
//         let query = `
//             SELECT ${selectFields}
//             FROM srouser.dr_jobs_ind 
//             WHERE SR_CODE = :srcode AND STATUS = :status
//         `;

//         const bindParams = {
//             srcode: reqData.SR_CODE,
//             status: reqData.STATUS,
//         };
//         let result = await this.orDao.oDBQueryServicereadWithBindParamsed(query, bindParams);
//         // if (result && reqData.STATUS === 'P') {
//         //     const processedRows = await Promise.all(
//         //         result.map(async (row) => {
//         //             if (row.SR_FILE) {
//         //                 row.SR_FILE = row.SR_FILE.toString('base64');
//         //             }
//         //             return row;
//         //         })
//         //     );
//         //     result = processedRows;
//         // }
//         return result;
//     } catch (ex) {
//         console.error("UpdateDocumentServices - getEIODBASEONSTATUSdetails || Error : ", ex);
//         throw constructCARDError(ex);
//     }
// };
  getEIODdetails = async (reqData) => {
    try {
        const queries = {
            Parties: `SELECT A1.ROWID,A1.INDGP_NAME AS NAME,A1.INDGP_CODE AS CODE,A1.SCHEDULE_NO,A1.R_CODE,A1.R_NAME,A1.VOL_NO,A1.PAGE_NO FROM SROUSER.IND1 A1 where A1.sr_code= :srcode and A1.doct_no= :doctno and A1.reg_year= :regyear`,
            Property: `SELECT t1.ROWID as A,t2.ROWID as B,t1.SR_CODE, t1.REG_YEAR, t1.DOCT_NO, t1.SCHEDULE_NO, 
                       t1.JURISDICTION, t1.WARD_NO, t1.BLOCK_NO, t1.SY1 AS SURVEY_NO, t1.PNO1 AS PLOT_NO, t1.HNO AS DOORNO, 
                       t1.FLAT_NO, t1.EXTENT1 AS EXTENT, t1.BUILT1 AS TOTAL_PLINTH,TO_CHAR(t1.REGN_DT, 'YYYY-MM-DD') AS REGN_DT, t1.LINK_DOCT, 
                       t1.P_TYPE AS UNIT, 
                       t1.OPERATOR_NAME AS EMPL_ID, t2.VILLAGE, t2.COLONY AS ADDRESS1, t2.P_P_DESC, 
                       t2.AP_NAME AS APT_NAME,t2.FLOOR_NO, t2.U_D_SHARE, 
                       t2.NORTH, t2.SOUTH, t2.EAST, t2.WEST,TO_CHAR(t2.P_DATE, 'YYYY-MM-DD') AS P_DATE, TO_CHAR(t2.E_DATE, 'YYYY-MM-DD') AS E_DATE,  
                       t2.VOL_NO, t2.PAGE_NO, t2.TRAN_CODE1, t2.MKT_VALUE1 AS MKT_VALUE, t2.CON_VALUE1 AS CON_VALUE, 
                       t2.TRAN_DESC1,TO_CHAR(t2.ENT_DATE, 'YYYY-MM-DD') AS ENTRY_DATE
                       FROM  SROUSER.INDEX2a t1 JOIN  SROUSER.INDEX2b t2 ON t1.SCHEDULE_NO = t2.SCHEDULE_NO AND  t1.DOCT_NO = t2.DOCT_NO AND  t1.REG_YEAR = t2.REG_YEAR AND  t1.SR_CODE = t2.SR_CODE where  t1.DOCT_NO=:doctno and t1.REG_YEAR=:regyear and t1.SR_CODE=:srcode`,
            LinkDoctDetails: `select ROWID, recti_ec.* from SROUSER.recti_ec where c_srcd= :srcode and c_doctno= :doctno and c_regyear= :regyear`,
        };
        const bindParams = {
            srcode: reqData.SR_CODE,
            doctno: reqData.DOCT_NO,
            regyear: reqData.REG_YEAR,
        };
        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            const queryResult = await this.orDao.oDBQueryServicereadWithBindParamsed(query, bindParams);
            results[key] = queryResult;
        }
        return results;
    } catch (ex) {
        console.error("UpdateDocumentServices - getEIODdetails || Error : ", ex);
        throw constructCARDError(ex);
    }
}

requestEditEIODDoctDetails = async (reqBody) => {
    try {
        let checkQuery = `
        SELECT 
            CASE 
                WHEN COUNT(*) > 0 THEN 'Y' 
                ELSE 'N' 
            END AS STATUS
        FROM tran_major
        WHERE sr_code = :SR_CODE 
          AND book_no = :BOOK_NO 
          AND reg_year = :REG_YEAR 
          AND rdoct_no = :RDOCT_NO`;
    let checkBindParams = {
        SR_CODE: reqBody.SR_CODE,
        BOOK_NO: reqBody.BOOK_NO,
        REG_YEAR: reqBody.REG_YEAR,
        RDOCT_NO: reqBody.DOCT_NO,
    };
    console.log(checkQuery,'query1');
    let checkResult = await this.orDao.oDBQueryServicereadWithBindParamsed(checkQuery, checkBindParams);
    let status = checkResult?.[0]?.STATUS;
    if (status === 'Y') {
        throw new Error("Provided Document Details Comes Under General edit index"); 
        }
    let checkQuery2 = `SELECT CASE 
            WHEN COUNT(*) > 0 THEN 'Y'
            ELSE 'N'
        END AS STATUS
    FROM srouser.dr_jobs_ind
    WHERE SR_CODE = :SR_CODE
      AND DOCT_NO = :DOCT_NO
      AND REG_YEAR = :REG_YEAR
      AND BOOK_NO = :BOOK_NO
      AND STATUS IN ('P', 'A')`;
      let check1BindParams = {
        SR_CODE: reqBody.SR_CODE,
        BOOK_NO: reqBody.BOOK_NO,
        REG_YEAR: reqBody.REG_YEAR,
        DOCT_NO: reqBody.DOCT_NO
    };
    let checkResult1 = await this.orDao.oDBQueryServicereadWithBindParamsed(checkQuery2, check1BindParams);
    let status1 = checkResult1?.[0]?.STATUS;
    if (status1 === 'Y') {
        throw new Error("Request Already Raised Please Check"); 
        }
        let EditIndexDirectory = `/pdfs/EditIndexSrUpload/${reqBody.SR_CODE}_${reqBody.REG_YEAR}_${reqBody.DOCT_NO}`;
        if (!fsone.existsSync(EditIndexDirectory)) {
            await fsone.mkdirSync(EditIndexDirectory, { recursive: true });
        }
        
        const filePath = path.join(EditIndexDirectory,`${reqBody.SR_CODE}_${reqBody.REG_YEAR}_${reqBody.DOCT_NO}.pdf`);
        const data = Buffer.from(reqBody.SR_FILE, 'base64');
                 fsone.writeFileSync(filePath, data) 

        let query = `INSERT INTO srouser.dr_jobs_ind (SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, REQUEST_BY, REQUEST_TIME, RESPONSE_BY, RESPONSE_TIME, STATUS, NEW_DOCTNO, REJECT_REASONS, REQUEST_REASONS, SR_PATH) 
                     VALUES (:sr_code, :book_no, :doct_no, :reg_year, :request_by, SYSDATE, :response_by, :response_time, :status, :new_doctno, :reject_reasons, :request_reasons,'${filePath}')`;
         let bindParams = {
            SR_CODE: reqBody.SR_CODE,
            BOOK_NO: reqBody.BOOK_NO,
            DOCT_NO: reqBody.DOCT_NO,
            REG_YEAR: reqBody.REG_YEAR,
            REQUEST_BY: reqBody.REQUEST_BY,
            RESPONSE_BY: reqBody.RESPONSE_BY,
            RESPONSE_TIME: reqBody.RESPONSE_DATE,
            STATUS: reqBody.STATUS,
            NEW_DOCTNO: reqBody.NEW_DOCTNO,
            REJECT_REASONS: reqBody.REJECT_REASONS,
            REQUEST_REASONS: reqBody.REQUEST_REASONS,
            // SR_FILE: {
            //     val: Buffer.from(reqBody.SR_FILE, 'base64'), 
            //     type: oracleDb.BLOB 
            // }       
         };
      
        // let  binaryData = new Buffer(reqBody.SR_FILE, 'base64').toString('binary');
        // await fsone.writeFileSync(filePath, binaryData);


        let result = await this.orDao.oDbInsertDocsWithBindParamsSR1(query,bindParams);
        return result;
    }
    catch (ex) {
        console.error("Update Document - requestEditEIODDoctDetails || Error : ", ex );
        throw constructCARDError(ex);
    }
  }
UpdateDrStatusOnEIODDetails = async (reqBody) => {
    try {

        let EditIndexDirectory = `/pdfs/EditIndexDrUpload/${reqBody.SR_CODE}_${reqBody.REG_YEAR}_${reqBody.DOCT_NO}`;
        if (!fsone.existsSync(EditIndexDirectory)) {
            await fsone.mkdirSync(EditIndexDirectory, { recursive: true });
        }
        
        const filePath = path.join(EditIndexDirectory,`${reqBody.SR_CODE}_${reqBody.REG_YEAR}_${reqBody.DOCT_NO}.pdf`);
        const data = Buffer.from(reqBody.DR_FILE, 'base64');
                 fsone.writeFileSync(filePath, data) 




  let query = ` UPDATE srouser.dr_jobs_ind 
    SET 
        RESPONSE_BY = :RESPONSE_BY,
        RESPONSE_TIME = SYSDATE,
        STATUS = :STATUS,
        REJECT_REASONS = :REJECT_REASONS,
        PROCEEDING_DATE =TO_DATE(:PROCEEDING_DATE, 'DD-MM-YYYY'),
        PROCEEDING_NO =:PROCEEDING_NO,
        DR_PATH='${filePath}'
    WHERE
        SR_CODE = :SR_CODE
        AND BOOK_NO = :BOOK_NO
        AND DOCT_NO = :DOCT_NO
        AND REG_YEAR = :REG_YEAR
        AND ROWID = :ROW_ID`;
   let bindParams = {
        SR_CODE: reqBody.SR_CODE,
        BOOK_NO: reqBody.BOOK_NO,
        DOCT_NO: reqBody.DOCT_NO,
        REG_YEAR: reqBody.REG_YEAR,
        RESPONSE_BY: reqBody.RESPONSE_BY,
        STATUS: reqBody.STATUS,
        REJECT_REASONS: reqBody.REJECT_REASONS,
        PROCEEDING_DATE:reqBody.PROCEEDING_DATE,
        PROCEEDING_NO:reqBody.PROCEEDING_NO,
        // DR_FILE: {
        //     val: Buffer.from(reqBody.DR_FILE, 'base64'), 
        //     type: oracleDb.BLOB 
        // },      
        ROW_ID: reqBody.ROWID,
 
    };
let result = await this.orDao.oDbInsertDocsWithBindParamsSR1(query,bindParams);
return result;
}
catch (ex) {
console.error("Update Document - UpdateDrStatusOnEIODDetails || Error : ", ex );
throw constructCARDError(ex);
}
}
 getEIODSRPDFdetails = async (reqBody) => {
    try {
      const filePath = reqBody.SR_PATH;
  
      if (!filePath || typeof filePath !== 'string') {
        throw new Error("Invalid or missing 'SR_PATH' in request body.");
      }
      if (fsone.existsSync(filePath)) {
        const fileBuffer = fsone.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');
        return base64File;
      } else {
        throw new Error(`File does not exist at path: ${filePath}`);
      }
    } catch (ex) {
      console.error("getEIODSRPDFdetails || Error: ", ex.message);
      throw constructCARDError(ex);
    }
  };

UpdateFreezeEIODDetails = async (reqBody) => {
    try {
        const query1 = ` 
            UPDATE srouser.dr_jobs_ind 
            SET STATUS = :STATUS
            WHERE SR_CODE = :SR_CODE 
              AND DOCT_NO = :DOCT_NO
              AND REG_YEAR = :REG_YEAR`;
        
        const bindParams = {
            SR_CODE: reqBody.SR_CODE,
            DOCT_NO: reqBody.DOCT_NO,
            REG_YEAR: reqBody.REG_YEAR,
            STATUS: reqBody.STATUS
        };

        const result1 = await this.orDao.oDbInsertDocsWithBindParamsSR1(query1, bindParams);
        console.log(result1, 'Update Query Result');

        // For SubIndex Creation//
        const query2 = `BEGIN SROUSER.subindex_java(:sroCode, :regYear, :doctNo, :status); END;`;
        const procedureParams = {
            sroCode: { val: parseInt(reqBody.SR_CODE), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
            regYear: { val: parseInt(reqBody.REG_YEAR), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
            doctNo: { val: parseInt(reqBody.DOCT_NO), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN },
            status: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER }
        };

        try {
            const procedureResult = await this.orDao.getSProcedureODB(query2, procedureParams);
            const status = procedureResult.status;

            let statusMessage;
            if (status === 1) {
                statusMessage = `Sub-Index successfully created for docId: ${reqBody.DOCT_NO}/${reqBody.REG_YEAR} of SRO ${reqBody.SR_CODE}`;
            } else {
                statusMessage = `Sub-Index creation failed for docId: ${reqBody.DOCT_NO}/${reqBody.REG_YEAR} of SRO ${reqBody.SR_CODE}`;
            }

            console.log(procedureResult, statusMessage, 'Procedure Execution Result');
            return { result: procedureResult, message: statusMessage };

        } catch (procedureError) {
            console.error("Error during stored procedure execution: ", procedureError);
            throw constructCARDError(procedureError);
        }
    } catch (ex) {
        console.error("UpdateFreezeEIODDetails || Error: ", ex);
        throw constructCARDError(ex);
    }
};


updateEIODetails = async (reqBody) => {
    try {
        const updates = [];
        const inserts = [];
        if (Array.isArray(reqBody.Property)) {
            for (const property of reqBody.Property) {
                if (property.A) {
                    updates.push({
                        query: `   UPDATE SROUSER.INDEX2a
                                     SET 
                                 SCHEDULE_NO = NVL(:schedule_no, SCHEDULE_NO),
                                 JURISDICTION = NVL(:jurisdiction, JURISDICTION),
                                 WARD_NO = NVL(:ward_no, WARD_NO),
                                 BLOCK_NO = NVL(:block_no, BLOCK_NO),
                                 SY1 = NVL(:survey_no, SY1),
                                 PNO1 = NVL(:plot_no, PNO1),
                                 HNO = NVL(:doorno, HNO),
                                 FLAT_NO = NVL(:flat_no, FLAT_NO),
                                 EXTENT1 = NVL(:extent, EXTENT1),
                                 BUILT1 = NVL(:total_plinth, BUILT1),
                                 REGN_DT = NVL(TO_DATE(:regn_dt, 'YYYY-MM-DD'), REGN_DT),
                                 LINK_DOCT = NVL(:link_doct, LINK_DOCT),
                                 P_TYPE = NVL(:unit, P_TYPE),
                                 OPERATOR_NAME = NVL(:empl_id, OPERATOR_NAME),
                                 SVIL = NVL(SOUNDEX(:village), SVIL),
                                 SCOL = NVL(SOUNDEX(:address1), SCOL),
                                 SAPN = NVL(SOUNDEX(:apt_name), SAPN)

                            WHERE ROWID = :row_id`,
                        params: {
                            schedule_no: property.SCHEDULE_NO || null,
                            jurisdiction: property.JURISDICTION || null,
                            ward_no: property.WARD_NO || null,
                            block_no: property.BLOCK_NO || null,
                            survey_no: property.SURVEY_NO || null,
                            plot_no: property.PLOT_NO || null,
                            doorno: property.DOORNO || null,
                            flat_no: property.FLAT_NO || null,
                            extent: property.EXTENT || null,
                            total_plinth: property.TOTAL_PLINTH || null,
                            regn_dt: property.REGN_DT || null,
                            link_doct: property.LINK_DOCT || null,
                            unit: property.UNIT || null,
                            empl_id: property.EMPL_ID || null,
                            village: property.VILLAGE || null, 
                            address1: property.ADDRESS1 || null,
                            apt_name: property.APT_NAME || null,
                            row_id: property.A,
                        },
                    });
                } else {
                    inserts.push({
                        query: `INSERT INTO SROUSER.INDEX2a (SR_CODE, REG_YEAR, DOCT_NO, SCHEDULE_NO, JURISDICTION, WARD_NO, BLOCK_NO,SY1, PNO1, HNO, FLAT_NO, EXTENT1, BUILT1, REGN_DT, LINK_DOCT, P_TYPE, OPERATOR_NAME,SVIL,SCOL,SAPN,STATUS) 
                                  VALUES (:sr_code, :reg_year, :doct_no, :schedule_no, :jurisdiction, :ward_no, :block_no,:survey_no, :plot_no, :doorno, :flat_no, :extent, :total_plinth, TO_DATE(:regn_dt, 'YYYY-MM-DD'), :link_doct, :unit, :empl_id, SOUNDEX(:village), SOUNDEX(:address1),SOUNDEX(:apt_name),'ORI')`,
                                  bindParams: {
                            schedule_no: property.SCHEDULE_NO || null,
                            jurisdiction: property.JURISDICTION || null,
                            ward_no: property.WARD_NO || null,
                            block_no: property.BLOCK_NO || null,
                            survey_no: property.SURVEY_NO || null,
                            plot_no: property.PLOT_NO || null,
                            doorno: property.DOORNO || null,
                            flat_no: property.FLAT_NO || null,
                            extent: property.EXTENT || null,
                            total_plinth: property.TOTAL_PLINTH || null,
                            regn_dt: property.REGN_DT || null,
                            link_doct: property.LINK_DOCT || null,
                            unit: property.UNIT || null,
                            empl_id: property.EMPL_ID || null,
                            sr_code: property.SR_CODE, 
                            reg_year: property.REG_YEAR,
                            doct_no: property.DOCT_NO,
                            village: property.VILLAGE || null, 
                            address1: property.ADDRESS1 || null,
                            apt_name: property.APT_NAME || null,
                        },
                        
                    });

                }
            }
        }
        if (Array.isArray(reqBody.Property)) {
            for (const property of reqBody.Property) {
                if (property.B) {
                    updates.push({
                        query: `   UPDATE SROUSER.INDEX2b
                                     SET 
                                VILLAGE = NVL(:village, VILLAGE),
                                COLONY = NVL(:address1, COLONY),
                                P_P_DESC = NVL(:p_p_desc, P_P_DESC),
                                AP_NAME = NVL(:apt_name, AP_NAME),
                                FLOOR_NO = NVL(:floor_no, FLOOR_NO),
                                U_D_SHARE = NVL(:u_d_share, U_D_SHARE),
                                NORTH = NVL(:north, NORTH),
                                SOUTH = NVL(:south, SOUTH),
                                EAST = NVL(:east, EAST),
                                WEST = NVL(:west, WEST),
                                P_DATE = NVL(TO_DATE(:p_date, 'YYYY-MM-DD'), P_DATE),
                                E_DATE = NVL(TO_DATE(:e_date, 'YYYY-MM-DD'), E_DATE),
                                VOL_NO = NVL(:vol_no, VOL_NO),
                                PAGE_NO = NVL(:page_no, PAGE_NO),
                                TRAN_CODE1 = NVL(:tran_code1, TRAN_CODE1),
                                MKT_VALUE1 = NVL(:mkt_value, MKT_VALUE1),
                                CON_VALUE1 = NVL(:con_value, CON_VALUE1),
                                TRAN_DESC1 = NVL(:tran_desc1, TRAN_DESC1),
                                ENT_DATE = SYSDATE
                           WHERE ROWID = :row_id`,
                        params: {
                            village: property.VILLAGE || null,
                            address1: property.ADDRESS1 || null,
                            p_p_desc: property.P_P_DESC || null,
                            apt_name: property.APT_NAME || null,
                            floor_no: property.FLOOR_NO || null,
                            u_d_share: property.U_D_SHARE || null,
                            north: property.NORTH || null,
                            south: property.SOUTH || null,
                            east: property.EAST || null,
                            west: property.WEST || null,
                            p_date: property.P_DATE || null,
                            e_date: property.E_DATE || null,
                            vol_no: property.VOL_NO || null,
                            page_no: property.PAGE_NO || null,
                            tran_code1: property.TRAN_CODE1 || null,
                            mkt_value: property.MKT_VALUE || null,
                            con_value: property.CON_VALUE || null,
                            tran_desc1: property.TRAN_DESC1 || null,
                            row_id: property.B,
                        },
                    });
                } else {
                    inserts.push({
                        query: `INSERT INTO SROUSER.INDEX2b (SR_CODE, REG_YEAR, DOCT_NO, SCHEDULE_NO, VILLAGE, COLONY, P_P_DESC, AP_NAME,FLOOR_NO, U_D_SHARE, NORTH, SOUTH, EAST, WEST, P_DATE, E_DATE,VOL_NO, PAGE_NO, TRAN_CODE1, MKT_VALUE1, CON_VALUE1, TRAN_DESC1, ENT_DATE) 
                                  VALUES (:sr_code, :reg_year, :doct_no, :schedule_no, :village, :address1, :p_p_desc, :apt_name,:floor_no, :u_d_share, :north, :south, :east, :west,TO_DATE(:p_date, 'YYYY-MM-DD'), TO_DATE(:e_date, 'YYYY-MM-DD'),:vol_no, :page_no, :tran_code1, :mkt_value, :con_value, :tran_desc1, SYSDATE)`,
                                  bindParams: {
                            village: property.VILLAGE || null,
                            address1: property.ADDRESS1 || null,
                            p_p_desc: property.P_P_DESC || null,
                            apt_name: property.APT_NAME || null,
                            floor_no: property.FLOOR_NO || null,
                            u_d_share: property.U_D_SHARE || null,
                            north: property.NORTH || null,
                            south: property.SOUTH || null,
                            east: property.EAST || null,
                            west: property.WEST || null,
                            p_date: property.P_DATE || null,
                            e_date: property.E_DATE || null,
                            vol_no: property.VOL_NO || null,
                            page_no: property.PAGE_NO || null,
                            tran_code1: property.TRAN_CODE1 || null,
                            mkt_value: property.MKT_VALUE || null,
                            con_value: property.CON_VALUE || null,
                            tran_desc1: property.TRAN_DESC1 || null,
                            sr_code: property.SR_CODE,
                            reg_year: property.REG_YEAR,
                            doct_no: property.DOCT_NO,
                            schedule_no: property.SCHEDULE_NO,
                        },
                        
                    });

                }
            }
        }
        if (Array.isArray(reqBody.Parties)) {
            for (const party of reqBody.Parties) {
                if (party.ROWID) {
                    updates.push({
                        query: `
                            UPDATE SROUSER.IND1
                            SET
                              SCHEDULE_NO = NVL(:schedule_no, SCHEDULE_NO),
                              INDGP_CODE = NVL(:indgp_code, INDGP_CODE),
                              INDGP_NAME = NVL(:indgp_name, INDGP_NAME),
                              R_CODE = NVL(:r_code, R_CODE),
                              R_NAME = NVL(:r_name, R_NAME),
                              VOL_NO = NVL(:vol_no, VOL_NO),
                              PAGE_NO = NVL(:page_no, PAGE_NO),
                              BOOK_NO = NVL(:book_no, BOOK_NO)
                            WHERE ROWID = :row_id`,
                        params: {
                            schedule_no: party.SCHEDULE_NO || null,
                            indgp_code: party.CODE || null,
                            indgp_name: party.NAME || null,
                            r_code: party.R_CODE || null,
                            r_name: party.R_NAME || null,
                            vol_no: party.VOL_NO || null,
                            page_no: party.PAGE_NO || null,
                            book_no: party.BOOK_NO || null,
                            row_id: party.ROWID,
                        },
                    });
                } else {
                    inserts.push({
                        query: `
                            INSERT INTO SROUSER.IND1 (DOCT_NO,REG_YEAR,SR_CODE,SCHEDULE_NO, INDGP_CODE, INDGP_NAME, R_CODE, R_NAME, VOL_NO, PAGE_NO, BOOK_NO) 
                            VALUES (:doctNo, :regYear, :srCode, :schedule_no, :indgp_code, :indgp_name, :r_code, :r_name, :vol_no, :page_no, :book_no)`,
                            bindParams: {
                            doctNo: party.DOCT_NO,
                            regYear: party.REG_YEAR,
                            srCode: party.SR_CODE,
                            schedule_no: party.SCHEDULE_NO || null,
                            indgp_code: party.CODE || null,
                            indgp_name: party.NAME || null,
                            r_code: party.R_CODE || null,
                            r_name: party.R_NAME || null,
                            vol_no: party.VOL_NO || null,
                            page_no: party.PAGE_NO || null,
                            book_no: party.BOOK_NO || null,
                        },
                        
                    });
                }
            }
        }
         const results = [];
        for (const query of [...updates]) {
            const result = await this.orDao.oDbInsertDocsWithBindParamsSR1(query.query, query.params);
            results.push(result);
        }        
        let queries = inserts;
        const Insertresults = await this.orDao.oDbInsertDocsWithBindParamsSR(queries);         
        return results,Insertresults;
    } catch (ex) {
        console.error("Update Document - updateEIODetails || Error: ", ex);
        throw constructCARDError(ex);
    }
};
updateEIODLINKetails = async (reqBody) => {
    try {
        const updates = [];
        const inserts = [];
        if (Array.isArray(reqBody.LinkDoctDetails)) {
            for (const link of reqBody.LinkDoctDetails) {
                if (link.ROWID) {
                    updates.push({
                        query: `
                            UPDATE SROUSER.recti_ec
                            SET
                              C_SCHNO = NVL(:schedule_no, C_SCHNO),
                              L_SRCD = NVL(:l_srcd, L_SRCD),
                              L_BNO = NVL(:l_bno, L_BNO),
                              L_DOCTNO = NVL(:l_doctno, L_DOCTNO),
                              L_REGYEAR = NVL(:l_regyear, L_REGYEAR),
                              L_SCHNO = NVL(:l_schno, L_SCHNO),
                              CODE = NVL(:code, CODE)
                            WHERE ROWID = :row_id`,
                        params: {
                            schedule_no: link.C_SCHNO || null,
                            l_srcd: link.L_SRCD || null,
                            l_bno: link.L_BNO || null,
                            l_doctno: link.L_DOCTNO || null,
                            l_regyear: link.L_REGYEAR || null,
                            l_schno: link.L_SCHNO || null,
                            code: link.CODE || null,
                            row_id: link.ROWID,
                        },
                    });
                } else {
                    inserts.push({
                        query: `
                            INSERT INTO SROUSER.recti_ec (C_SRCD, C_DOCTNO, C_BNO, C_REGYEAR, C_SCHNO, L_SRCD, L_BNO, L_DOCTNO, L_REGYEAR, L_SCHNO, CODE)
                             VALUES (
                                  NVL(:c_srcd, NULL),
                                  NVL(:c_doctno, NULL),
                                  NVL(:c_bno, NULL),
                                  NVL(:c_regyear, NULL),
                                  NVL(:schedule_no, NULL),
                                  NVL(:l_srcd, NULL),
                                  NVL(:l_bno, NULL),
                                  NVL(:l_doctno, NULL),
                                  NVL(:l_regyear, NULL),
                                  NVL(:l_schno, NULL),
                                  NVL(:code, NULL))`,
                        params: {
                            c_srcd: link.SR_CODE,
                            c_doctno: link.DOCT_NO,
                            c_bno: link.C_BNO,
                            c_regyear: link.REG_YEAR,
                            schedule_no: link.C_SCHNO || null,
                            l_srcd: link.L_SRCD || null,
                            l_bno: link.L_BNO || null,
                            l_doctno: link.L_DOCTNO || null,
                            l_regyear: link.L_REGYEAR || null,
                            l_schno: link.L_SCHNO || null,
                            code: link.CODE || null,
                        },
                        
                    });
                }
            }
        }
        const results = [];
        for (const query of [...updates, ...inserts]) {
            const result = await this.orDao.oDbInsertDocsWithBindParamsSR1(query.query, query.params);
            results.push(result);
        }
        return results;
    } catch (ex) {
        console.error("Update Document - updateEIODLINKetails || Error: ", ex);
        throw constructCARDError(ex);
    }
};

deleteEIODPartyDetails = async (reqBody) => {
    try {
        let checkQuery = `
        SELECT 
            CASE 
                WHEN COUNT(*) > 2 THEN 'N' 
                ELSE 'Y' 
            END AS STATUS,
             COUNT(*) AS COUNT
        FROM srouser.ind1
        WHERE sr_code = :SR_CODE 
          AND reg_year = :REG_YEAR 
          AND doct_no = :DOCT_NO`;
    let checkBindParams = {
        SR_CODE: reqBody.SR_CODE,
        REG_YEAR: reqBody.REG_YEAR,
        DOCT_NO: reqBody.DOCT_NO,
    };
    console.log(checkQuery,'query1');
    let checkResult = await this.orDao.oDBQueryServicereadWithBindParamsed(checkQuery, checkBindParams);
    let status = checkResult?.[0]?.STATUS;
    let count = checkResult?.[0]?.COUNT;
    if (status === 'Y') {
        throw new Error( `There ${count === 1 ? 'is' : 'are'} only ${count} ${count === 1 ? 'Party' : 'Parties'} available, you can't delete.`); 
        }
    let selectquery = `SELECT *
    FROM srouser.ind1
    WHERE SR_CODE = :SR_CODE
      AND DOCT_NO = :DOCT_NO
      AND REG_YEAR = :REG_YEAR
      AND ROWID= :ROW_ID`;
      let check1BindParams = {
        SR_CODE: reqBody.SR_CODE,
        REG_YEAR: reqBody.REG_YEAR,
        DOCT_NO: reqBody.DOCT_NO,
        ROW_ID: reqBody.ROWID
    };
    console.log(selectquery,'query.......');
    
    let selectResult1 = await this.orDao.oDBQueryServicereadWithBindParamsed(selectquery, check1BindParams);
    let ins = selectResult1;
        let query = `INSERT INTO srouser.ind1_log (SR_CODE, REG_YEAR, DOCT_NO, SCHEDULE_NO, EC_NUMBER, INDGP_CODE, INDGP_NAME,R_CODE, R_NAME, VOL_NO, PAGE_NO, DELETED_BY, DELETED_ON, EMPL_ID, BOOK_NO) 
                      VALUES (:SR_CODE, :REG_YEAR, :DOCT_NO, :SCHEDULE_NO, :EC_NUMBER, :INDGP_CODE, :INDGP_NAME,:R_CODE, :R_NAME, :VOL_NO, :PAGE_NO, :DELETED_BY, SYSDATE, :EMPL_ID, :BOOK_NO)`;
         let bindParams = {
            SR_CODE: ins[0].SR_CODE,
            REG_YEAR: ins[0].REG_YEAR,
            DOCT_NO: ins[0].DOCT_NO,
            SCHEDULE_NO: ins[0].SCHEDULE_NO,
            EC_NUMBER: ins[0].EC_NUMBER,
            INDGP_CODE: ins[0].INDGP_CODE,
            INDGP_NAME: ins[0].INDGP_NAME,
            R_CODE: ins[0].R_CODE,
            R_NAME: ins[0].R_NAME,
            VOL_NO: ins[0].VOL_NO,
            PAGE_NO: ins[0].PAGE_NO,
            DELETED_BY: reqBody.DELETED_BY,
            EMPL_ID: reqBody.EMPL_ID,
            BOOK_NO: ins[0].BOOK_NO
        };
        let result = await this.orDao.oDbInsertDocsWithBindParamsSR1(query,bindParams);
        let deleteQuery =`delete srouser.ind1 where ROWID= :ROW_ID`;
        let deleteBindparams ={
            ROW_ID: reqBody.ROWID
        }
        let Deleteresult = await this.orDao.oDbInsertDocsWithBindParamsSR1(deleteQuery,deleteBindparams);
        return Deleteresult;
    }
    catch (ex) {
        console.error("Update Document - requestEditEIODDoctDetails || Error : ", ex );
        throw constructCARDError(ex);
    }
  }
  
deleteEIODPropertyDetails = async (reqBody) => {
    try {

    let checkmain =`SELECT 
            CASE 
                WHEN COUNT(*) > 1 THEN 'N' 
                ELSE 'Y' 
            END AS STATUS,
             COUNT(*) AS COUNT
        FROM srouser.index2a
        WHERE sr_code = :SR_CODE 
          AND reg_year = :REG_YEAR 
          AND doct_no = :DOCT_NO`;
      let mainCheckBindParams = {
        SR_CODE: reqBody.SR_CODE,
        REG_YEAR: reqBody.REG_YEAR,
        DOCT_NO: reqBody.DOCT_NO
    };
      let maincheck = await this.orDao.oDBQueryServicereadWithBindParamsed(checkmain, mainCheckBindParams);
      let status = maincheck?.[0]?.STATUS;
      let count = maincheck?.[0]?.COUNT;
      if (status === 'Y') {
          throw new Error(`There ${count === 1 ? 'is' : 'are'} only ${count} ${count === 1 ? 'Schedule' : 'Schedules'} available, you can't delete.`); 
          }

    let selectquery = `SELECT *
    FROM srouser.index2a
    WHERE SR_CODE = :SR_CODE
      AND DOCT_NO = :DOCT_NO
      AND REG_YEAR = :REG_YEAR
      AND ROWID= :ROW_ID`;
      let check1BindParams = {
        SR_CODE: reqBody.SR_CODE,
        REG_YEAR: reqBody.REG_YEAR,
        DOCT_NO: reqBody.DOCT_NO,
        ROW_ID: reqBody.A
    };
    let selectResult = await this.orDao.oDBQueryServicereadWithBindParamsed(selectquery, check1BindParams);
    let ins = selectResult;
    let selectquery2 = `SELECT *
    FROM srouser.index2b
    WHERE SR_CODE = :SR_CODE
      AND DOCT_NO = :DOCT_NO
      AND REG_YEAR = :REG_YEAR
      AND ROWID= :ROW_ID`;
      let check2BindParams = {
        SR_CODE: reqBody.SR_CODE,
        REG_YEAR: reqBody.REG_YEAR,
        DOCT_NO: reqBody.DOCT_NO,
        ROW_ID: reqBody.B
    };
    let selectResult2 = await this.orDao.oDBQueryServicereadWithBindParamsed(selectquery2, check2BindParams);
    let ins2 = selectResult2;
    let query = `INSERT INTO srouser.INDEX2a_log (SR_CODE, REG_YEAR, DOCT_NO, SCHEDULE_NO, JURISDICTION, WARD_NO, BLOCK_NO, SY1, PNO1, HNO, FLAT_NO,EXTENT1, BUILT1, REGN_DT, LINK_DOCT, ERRARRAY, SVIL, SCOL, SAPN, P_TYPE, TIME_STAMP, STATUS,OPERATOR_NAME, DELETED_BY, DELETED_ON, EMPL_ID) 
                    VALUES (:SR_CODE, :REG_YEAR, :DOCT_NO, :SCHEDULE_NO, :JURISDICTION, :WARD_NO, :BLOCK_NO, :SY1, :PNO1, :HNO,:FLAT_NO, :EXTENT1, :BUILT1, :REGN_DT, :LINK_DOCT, :ERRARRAY, :SVIL, :SCOL, :SAPN, :P_TYPE,:TIME_STAMP, :STATUS, :OPERATOR_NAME, :DELETED_BY, SYSDATE, :EMPL_ID)`;
         let bindParams = {
            SR_CODE: ins[0].SR_CODE,
            REG_YEAR: ins[0].REG_YEAR,
            DOCT_NO: ins[0].DOCT_NO,
            SCHEDULE_NO: ins[0].SCHEDULE_NO,
            JURISDICTION: ins[0].JURISDICTION,
            WARD_NO: ins[0].WARD_NO,
            BLOCK_NO: ins[0].BLOCK_NO,
            SY1: ins[0].SY1,
            PNO1: ins[0].PNO1,
            HNO: ins[0].HNO,
            FLAT_NO: ins[0].FLAT_NO,
            EXTENT1: ins[0].EXTENT1,
            BUILT1: ins[0].BUILT1,
            REGN_DT: ins[0].REGN_DT,
            LINK_DOCT: ins[0].LINK_DOCT,
            ERRARRAY: ins[0].ERRARRAY,
            SVIL: ins[0].SVIL,
            SCOL: ins[0].SCOL,
            SAPN: ins[0].SAPN,
            P_TYPE: ins[0].P_TYPE,
            TIME_STAMP: ins[0].TIME_STAMP,
            STATUS: ins[0].STATUS,
            OPERATOR_NAME: ins[0].OPERATOR_NAME,
            DELETED_BY: reqBody.DELETED_BY,
            EMPL_ID: reqBody.EMPL_ID
        };
        let result = await this.orDao.oDbInsertDocsWithBindParamsSR1(query,bindParams);
    let query1 = `INSERT INTO srouser.INDEX2b_log (SR_CODE, REG_YEAR, DOCT_NO, SCHEDULE_NO, VILLAGE, COLONY, P_P_DESC, PROP_DESC1, AP_NAME,BLOCK_NAME, FLOOR_NO, U_D_SHARE, NORTH, SOUTH, EAST, WEST, P_DATE, E_DATE, VOL_NO,PAGE_NO, TRAN_CODE1, MKT_VALUE1, CON_VALUE1, TRAN_DESC1, NO_OF_ECS, OPCODE, ENT_DATE,PAID_F, DELETED_BY, DELETED_ON, EMPL_ID) 
                     VALUES (:SR_CODE, :REG_YEAR, :DOCT_NO, :SCHEDULE_NO, :VILLAGE, :COLONY, :P_P_DESC, :PROP_DESC1, :AP_NAME,:BLOCK_NAME, :FLOOR_NO, :U_D_SHARE, :NORTH, :SOUTH, :EAST, :WEST, :P_DATE, :E_DATE, :VOL_NO,:PAGE_NO, :TRAN_CODE1, :MKT_VALUE1, :CON_VALUE1, :TRAN_DESC1, :NO_OF_ECS, :OPCODE, :ENT_DATE,:PAID_F, :DELETED_BY, SYSDATE, :EMPL_ID)`;
        let bindParams1 = {
            SR_CODE: ins2[0].SR_CODE,
            REG_YEAR: ins2[0].REG_YEAR,
            DOCT_NO: ins2[0].DOCT_NO,
            SCHEDULE_NO: ins2[0].SCHEDULE_NO,
            VILLAGE: ins2[0].VILLAGE,
            COLONY: ins2[0].COLONY,
            P_P_DESC: ins2[0].P_P_DESC,
            PROP_DESC1: ins2[0].PROP_DESC1,
            AP_NAME: ins2[0].AP_NAME,
            BLOCK_NAME: ins2[0].BLOCK_NAME,
            FLOOR_NO: ins2[0].FLOOR_NO,
            U_D_SHARE: ins2[0].U_D_SHARE,
            NORTH: ins2[0].NORTH,
            SOUTH: ins2[0].SOUTH,
            EAST: ins2[0].EAST,
            WEST: ins2[0].WEST,
            P_DATE: ins2[0].P_DATE, 
            E_DATE: ins2[0].E_DATE, 
            VOL_NO: ins2[0].VOL_NO,
            PAGE_NO: ins2[0].PAGE_NO,
            TRAN_CODE1: ins2[0].TRAN_CODE1,
            MKT_VALUE1: ins2[0].MKT_VALUE1,
            CON_VALUE1: ins2[0].CON_VALUE1,
            TRAN_DESC1: ins2[0].TRAN_DESC1,
            NO_OF_ECS: ins2[0].NO_OF_ECS,
            OPCODE: ins2[0].OPCODE,
            ENT_DATE: ins2[0].ENT_DATE, 
            PAID_F: ins2[0].PAID_F,
            DELETED_BY: reqBody.DELETED_BY,
            EMPL_ID: reqBody.EMPL_ID,
        };
         let result1 = await this.orDao.oDbInsertDocsWithBindParamsSR1(query1,bindParams1);

        let deleteQuery =`delete srouser.index2a where ROWID= :ROW_ID`;
        let deleteBindparams ={
            ROW_ID: reqBody.A
        }
        let Deleteresult = await this.orDao.oDbInsertDocsWithBindParamsSR1(deleteQuery,deleteBindparams);
        let deleteQuery1 =`delete srouser.index2b where ROWID= :ROW_ID`;
        let deleteBindparams1 ={
            ROW_ID: reqBody.B
        }
        let Deleteresult1 = await this.orDao.oDbInsertDocsWithBindParamsSR1(deleteQuery1,deleteBindparams1);
        return Deleteresult;
    }
    catch (ex) {
        console.error("Update Document - requestEditEIODDoctDetails || Error : ", ex );
        throw constructCARDError(ex);
    }
  }


deleteEIODLinkDetails = async (reqBody) => {
    try {
    let selectquery = `SELECT *
    FROM srouser.recti_ec
    WHERE ROWID= :ROW_ID`;
      let BindParams = {
        ROW_ID: reqBody.ROWID
    };
    let selectResult = await this.orDao.oDBQueryServicereadWithBindParamsed(selectquery, BindParams);
    let RES = selectResult;
    let insertQuery =`INSERT INTO SROUSER.RECTI_EC_LOG (C_SRCD, C_BNO, C_DOCTNO, C_REGYEAR, C_SCHNO,L_SRCD, L_BNO, L_DOCTNO, L_REGYEAR, L_SCHNO,CODE, DELETED_BY, DELETED_ON, EMPL_ID) 
                         VALUES (:C_SRCD, :C_BNO, :C_DOCTNO, :C_REGYEAR, :C_SCHNO,:L_SRCD, :L_BNO, :L_DOCTNO, :L_REGYEAR, :L_SCHNO,:CODE, :DELETED_BY, SYSDATE, :EMPL_ID)`;
    let insertBindparams = {
        C_SRCD: RES[0].C_SRCD,
        C_BNO: RES[0].C_BNO,
        C_DOCTNO: RES[0].C_DOCTNO,
        C_REGYEAR: RES[0].C_REGYEAR,
        C_SCHNO: RES[0].C_SCHNO,
        L_SRCD: RES[0].L_SRCD,
        L_BNO: RES[0].L_BNO,
        L_DOCTNO: RES[0].L_DOCTNO,
        L_REGYEAR: RES[0].L_REGYEAR,
        L_SCHNO: RES[0].L_SCHNO,
        CODE: RES[0].CODE,
        DELETED_BY: reqBody.DELETED_BY,
        EMPL_ID: reqBody.EMPL_ID,
    }
    let insertResult = await this.orDao.oDbInsertDocsWithBindParamsSR1(insertQuery,insertBindparams);
    console.log(insertResult,'insertrows');
    let deleteQuery1 =`delete srouser.recti_ec where ROWID= :ROW_ID`;
    let deleteBindparams1 ={
        ROW_ID: reqBody.ROWID
    }
    let Deleteresult1 = await this.orDao.oDbInsertDocsWithBindParamsSR1(deleteQuery1,deleteBindparams1);
    return Deleteresult1;
}
catch (ex) {
    console.error("Update Document - deleteEIODLinkDetails || Error : ", ex );
    throw constructCARDError(ex);
}
}

getListVillagesRSrvc = async(reqData) => {	
    try{
        let query = `SELECT distinct a.VILLAGE_CODE, (select village_name  from hab_code b where b.hab_code=a.village_Code||'01') villname from juri_ag a 
                    where sro_Code= :SR_CODE 
                    order by (select village_name  from hab_code b where b.hab_code=a.village_Code||'01')`;
        let response = await this.orDao.oDBQueryServiceWithBindParams(query, {SR_CODE : reqData.srCode});
        return response;
    }catch(ex){
        Logger.error("updateDocumentServices - getListVillagesRSrvc || Error :", ex);
        console.error("updateDocumentServices - getListVillagesRSrvc || Error :", ex);
        throw constructCARDError(ex);
    }
}
getListVillagesUSrvc = async(reqData) => {
    try{
        let query = `select a.village_code, a.villname from (
                    select a.VILLAGE_CODE, (select village_name  from hab_code b where b.hab_code=a.village_Code||'01') villname from juri_HU a 
                    where sro_Code= :SR_CODE 
                    order by (select village_name  from hab_code b where b.hab_code=a.village_Code||'01')) a
                    group by a.village_code, a.villname
                    order by a.villname`;
        let response = await this.orDao.oDBQueryServiceWithBindParams(query, {SR_CODE : reqData.srCode});
        return response;
    }catch(ex){
        Logger.error("updateDocumentServices - getListVillagesUSrvc || Error :", ex);
        console.error("updateDocumentServices - getListVillagesUSrvc || Error :", ex);
        throw constructCARDError(ex);
    }
}


getDocumentStatusDetailsSrvc = async (reqBody) => {
    try {
          const bindParams = {SR_CODE : reqBody.SR_CODE, BOOK_NO : reqBody.BOOK_NO, DOCT_NO : reqBody.DOCT_NO, REG_YEAR : reqBody.REG_YEAR, REFERENCE_ID : reqBody.REFERENCE_ID}
         const documentData =  await this.orDao.oDBQueryServiceWithBindParams(`select * from srouser.edit_index_esign_file where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR and reference_id = :REFERENCE_ID`, bindParams);
         return documentData;
    } catch (ex) {
      console.error("Update Document - getDocumentStatusDetailsSrvc || Error:", ex);
      throw ex;
    }
  };

  fetchTranDir = async (reqData) => {
    try {
        let query = `select * from tran_dir where tran_maj_code = :TRAN_MAJ_CODE and tran_min_code = :TRAN_MIN_CODE`
        let result = await this.orDao.oDBQueryServiceWithBindParams(query, {TRAN_MAJ_CODE : reqData.TRAN_MAJ_CODE, TRAN_MIN_CODE : reqData.TRAN_MIN_CODE});
        return result;
    }
    catch (ex) {
        console.error("Update Document - fetchTranDir || Error : ", ex );
        throw constructCARDError(ex);
    }
}
 
getHabitationsSrvc = async (reqData)=>{
    try{
        let query ;
        if(reqData.villageCode && reqData.villageCode.length === 6){
            reqData.villageCode = '0'+reqData.villageCode;
        };
        let habQuery = `select substr(hab_code,1,7) villcd from hab_match where webland_code='${reqData.villageCode}'||'01' and rownum=1`;
        let details = await this.orDao.oDBQueryService(habQuery);
        let vgCode = details && details.length >0 ? details[0].VILLCD : reqData.villageCode;
        //reqData.villageCode = parseInt(reqData.villageCode);
        if(reqData.type=='rural'){
            query = `select HABITATION,LOCAL_BODY_NAME,HAB_NAME FROM sromstr.mv_rur_hab_rate a,SROMSTR.hab_code b where a.HABITATION = b.HAB_CODE and a.REV_VILL_CODE='${vgCode}'`
        //     query = `SELECT
        //     sro_code,
        //     HABITATION,
        //     LOCAL_BODY_NAME,
        //     HAB_NAME,
        //     EFFECTIVE_DATE
        // FROM
        //     sromstr.mv_rur_hab_rate a
        // JOIN
        //     SROMSTR.hab_code b
        // ON
        //     a.HABITATION = b.HAB_CODE
        // WHERE
        //     (
        //         (a.sro_code NOT IN ('714', '733', '734', '735')
        //         and a.rev_vill_code not in (select village_code from card.crda_village)
        //          AND TRUNC(a.EFFECTIVE_DATE) >= TO_DATE('01-02-2025', 'DD-MM-YYYY'))
        //         OR a.sro_code IN ('714', '733', '734', '735')
        //         or  a.rev_vill_code in (select village_code from card.crda_village)
        //     )
        //     AND a.rev_vill_code = '${vgCode}'
        // ORDER BY
        //     a.sro_code DESC`
            // `select HABITATION,LOCAL_BODY_NAME,HAB_NAME FROM sromstr.mv_rur_hab_rate a,SROMSTR.hab_code b where a.HABITATION = b.HAB_CODE and a.REV_VILL_CODE=${reqData.villageCode}`
        }else if(reqData.type=='urban'){
            query =`select distinct  HABITATION,WARD_NO,BLOCK_NO,LOCALITY_STREET||'('||ward_no||'-'||BLOCK_NO||')'||'*'||nvl2(to_char(a.FR_DOOR_NO),
            RTRIM ('#' || TO_CHAR (a.FR_DOOR_NO) || ' to '|| TO_CHAR (a.TO_DOOR_NO)),'') || '-'|| classification HAB_NAME,a.FR_DOOR_NO,SUBSTR (a.LOCALITY_STREET, 1, 45)|| RTRIM ('-' || TO_CHAR (a.LSR_NO), '-0') || nvl2(to_char(a.FR_DOOR_NO),RTRIM ('#' || TO_CHAR (a.FR_DOOR_NO) || ' to '|| TO_CHAR (a.TO_DOOR_NO)),'') loc, classification FROM sromstr.mv_urb_loc_reg a, srouser.JURI_AG_HU  b where a.SRO_CODE = b.SRO_CODE and b.VILLAGE_CODE='${vgCode}' and substr(habitation,1,7)='${vgCode}' order by WARD_NO,BLOCK_NO`
        //     query = `SELECT DISTINCT  
        //     EFFECTIVE_DATE,
        //     HABITATION,
        //     WARD_NO,
        //     BLOCK_NO,
        //     LOCALITY_STREET || '(' || WARD_NO || '-' || BLOCK_NO || ')' || '*' ||
        //     NVL2(TO_CHAR(a.FR_DOOR_NO), RTRIM('#' || TO_CHAR(a.FR_DOOR_NO) || ' to ' || TO_CHAR(a.TO_DOOR_NO)), '')
        //     || '-' || a.classification AS LOCALITY_STREET,
        //     a.FR_DOOR_NO,
        //     SUBSTR(a.LOCALITY_STREET, 1, 45) || RTRIM('-' || TO_CHAR(a.LSR_NO), '-0') ||
        //     NVL2(TO_CHAR(a.FR_DOOR_NO), RTRIM('#' || TO_CHAR(a.FR_DOOR_NO) || ' to ' || TO_CHAR(a.TO_DOOR_NO)), '')
        //     AS loc,
        //     a.classification
        // FROM
        //     sromstr.mv_urb_loc_reg a
        // JOIN
        //     srouser.JURI_AG_HU b
        // ON
        //     a.SRO_CODE = b.SRO_CODE
        // WHERE
        //     b.VILLAGE_CODE = '${vgCode}'
        //     AND SUBSTR(a.HABITATION, 1, 7) = '${vgCode}'
        //     AND  (
        //         (a.SRO_CODE NOT IN ('714', '733', '734', '735')
        //         and SUBSTR(a.HABITATION, 1, 7) not in (select village_code from card.crda_village)
        //          AND TRUNC(a.EFFECTIVE_DATE) >= TO_DATE('01-02-2025', 'DD-MM-YYYY'))
        //         OR a.SRO_CODE IN ('714', '733', '734', '735')
        //         or SUBSTR(a.HABITATION, 1, 7) in (select village_code from card.crda_village)
        //     )  
        // ORDER BY
        //     a.WARD_NO,
        //     a.BLOCK_NO`
            //  `select distinct  HABITATION,WARD_NO,BLOCK_NO,LOCALITY_STREET||'('||ward_no||'-'||BLOCK_NO||')'  LOCALITY_STREET,SUBSTR (a.LOCALITY_STREET, 1, 45)|| RTRIM ('-' || TO_CHAR (a.LSR_NO), '-0') || RTRIM ('#' || TO_CHAR (a.FR_DOOR_NO) || ' to '|| TO_CHAR (a.TO_DOOR_NO)) loc FROM sromstr.urb_loc_rate_reg a, srouser.JURI_AG_HU  b where a.SRO_CODE = b.SRO_CODE and b.VILLAGE_CODE='${vgCode}' and substr(habitation,1,7)='${vgCode}' order by WARD_NO,BLOCK_NO`
            // `select distinct  HABITATION,WARD_NO,BLOCK_NO,LOCALITY_STREET||'('||ward_no||'-'||BLOCK_NO||')'  LOCALITY_STREET FROM sromstr.urb_loc_rate_reg a, srouser.JURI_AG_HU  b where a.SRO_CODE = b.SRO_CODE and b.VILLAGE_CODE='${vgCode}' and substr(habitation,1,7)='${vgCode}' order by WARD_NO,BLOCK_NO`;
        }
        const habitationData = await this.orDao.oDBQueryService(query);
        let fResults=[]
        habitationData.forEach(x => {
            if(!fResults.some(y => JSON.stringify(y) === JSON.stringify(x))){
                fResults.push(x)
            }
          })
        return fResults;
    }catch(ex){
        Logger.error(ex.message);
        console.error("VillageService - getHabitationsFromODB || Error :", ex.message);
        let pdeError = constructPDEError(ex);
        throw pdeError;
    }
};
  generatePDFFromHTML2 = async (html) => {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
    
        try {
            // Wrap the HTML content with a footer for page numbers
            const htmlWithFooter = `
                <html>
                    <head>
                        <style>
                            @page {
                                @bottom-right {
                                    content: "Page " counter(page);
                                    font-size: 12px; /* Change the font size as needed */
                                    margin: 5px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${html}
                    </body>
                </html>
            `;
    
            await page.setContent(htmlWithFooter, { waitUntil: 'networkidle0' }); // Wait for network to be idle
            const pdfBuffer = await page.pdf({
                landscape: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '30px',
                    left: '10px',
                },
                displayHeaderFooter: true, // Enable headers and footers
                footerTemplate: '<div style="font-size: 12px; width: 100%; text-align: center; margin: -10px 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
                timeout: 90000, // Increase the timeout to 90 seconds
            });
    
            return pdfBuffer;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error; // Rethrow the error to handle it in the calling function
        } finally {
            await browser.close();
        }
    };

    getEditIndexMisReportInitial = async (reqData) => {
        try {
            let baseQuery = `
    SELECT
      dj.SR_CODE,
      sm.SR_NAME,
      COUNT(*) AS TOTAL_REQUESTS,
      COUNT(CASE WHEN dj.STATUS in('P','A','S') THEN 1 END) AS DR_PRIMARY_APPROVAL_PENDING,
      COUNT(CASE WHEN dj.STATUS = 'D' THEN 1 END) AS DR_FREEZED_COUNT,
      COUNT(CASE WHEN dj.STATUS = 'R' THEN 1 END) AS DR_REJECTED_COUNT
    FROM
      dr_jobs dj
    JOIN
      sr_master sm ON sm.SR_CD = dj.SR_CODE
    WHERE
       dj.event = '2' AND
    REFERENCE_ID IS NOT NULL  AND request_time BETWEEN TO_DATE(:FROM_DATE, 'YYYY-MM-DD') AND TO_DATE(:TO_DATE, 'YYYY-MM-DD') + 1 - (1/86400)
   `;
   const bindParams = {
    FROM_DATE: reqData.FROM_DATE,
    TO_DATE: reqData.TO_DATE,
  };
  if (reqData.SR_CODE === 'ALL') {
    baseQuery += ` AND dj.SR_CODE IN (SELECT SR_CD FROM sr_master WHERE dr_cd = :DR_CD)`;
    bindParams.DR_CD = reqData.DR_CODE;
  } else {
    baseQuery += ` AND dj.SR_CODE IN (:SR_CODE)`;
    bindParams.SR_CODE = reqData.SR_CODE;
  }
 
  baseQuery += ` GROUP BY dj.SR_CODE, sm.SR_NAME ORDER BY sm.SR_NAME`;  
            const reportResult = await this.orDao.oDBQueryServicereadWithBindParamsed(baseQuery, bindParams);            
            return reportResult;
        } catch (ex) {
            console.error("Update Document - getEditIndexMisReportInitial || Error : ", ex );
            throw constructCARDError(ex);
        }
    }
    getEditIndexMISPdfReport = async (reqBody) => {
        const { SR_CODE, FROM_DATE, TO_DATE, STATUS, REF_TYPE, SHOW_SUMMARY, DR_CODE } = reqBody;
    
        try {
            let reportQuery = '';
            let bindParams = {
                FROM_DATE,
                TO_DATE
            };
            let response;
            const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
            const Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
            const formattedFromDate = FROM_DATE.split('-').reverse().join('-');
            const formattedToDate = TO_DATE.split('-').reverse().join('-');
    
            // Date formatting
            const currentDate = new Date();
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const formattedDate = currentDate.toLocaleDateString('en-GB', options);
            let hours = currentDate.getHours();
            const minutes = currentDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedDateTime = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
            let DR_NAME = '';
                    if (DR_CODE) {
                 const drNameQuery = `SELECT dr_name FROM dr_master WHERE dr_cd = :DR_CODE`;
                 const drNameRes = await this.orDao.oDBQueryServicereadWithBindParamsed(drNameQuery, { DR_CODE });

                 if (drNameRes && drNameRes.length > 0) {
                        DR_NAME = drNameRes[0].DR_NAME;
                                }
                    }
    
            if (SHOW_SUMMARY === 'Y') {
                // Summary query
                reportQuery = `
                    SELECT
                        dj.SR_CODE,
                        sm.SR_NAME,
                        COUNT(*) AS TOTAL_REQUESTS,
                        COUNT(CASE WHEN dj.STATUS = 'D' THEN 1 END) AS DR_FREEZED_COUNT,
                        COUNT(CASE WHEN dj.STATUS = 'R' THEN 1 END) AS DR_REJECTED_COUNT,
                        COUNT(CASE WHEN dj.STATUS IN ('P','A','S') THEN 1 END) AS DR_PRIMARY_APPROVAL_PENDING
                    FROM dr_jobs dj
                    JOIN sr_master sm ON sm.SR_CD = dj.SR_CODE
                    WHERE dj.event = '2'
                        AND dj.REFERENCE_ID IS NOT NULL
                        AND dj.request_time BETWEEN TO_DATE(:FROM_DATE, 'YYYY-MM-DD') AND TO_DATE(:TO_DATE, 'YYYY-MM-DD') + 1 - (1/86400)
                `;
    
                if (SR_CODE === 'ALL') {
                    reportQuery += ` AND dj.SR_CODE IN (SELECT SR_CD FROM sr_master WHERE dr_cd = :DR_CD)`;
                    bindParams.DR_CD = DR_CODE;
                } else {
                    reportQuery += ` AND dj.SR_CODE IN (:SR_CODE)`;
                    bindParams.SR_CODE = SR_CODE;
                }
                reportQuery += ` GROUP BY dj.SR_CODE, sm.SR_NAME ORDER BY sm.SR_NAME`;
                console.log(reportQuery,'lllllllllllllllllllllllllllllll');
                
                response = await this.orDao.oDBQueryServicereadWithBindParamsed(reportQuery, bindParams);
                // Generate summary table
                const html = `
                    <div style="text-align: center; margin: 20px;">
                        <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
                          <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:30px">
                               <thead>
                               <tr><th colspan='9'><h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - EDIT INDEX MIS SUMMARY REPORT </h3>  Report Period: <span style="color: #007bff;">${formattedFromDate}</span> to <span style="color: #007bff;">${formattedToDate}</span>
                             <h5 style="margin:0px">${DR_NAME ? `<span style="color: blue;">${DR_NAME} </span> District` : ''} || <span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDateTime}</span></h5>                               </h5>
                                <tr style="font-size: 15px;">
                                    <th style="border: 1px solid #000; padding: 4px;">S.No</th>
                                    <th style="border: 1px solid #000; padding: 4px;">SR Code</th>
                                    <th style="border: 1px solid #000; padding: 4px;">SR Name</th>
                                    <th style="border: 1px solid #000; padding: 4px;">Total Requests</th>
                                    <th style="border: 1px solid #000; padding: 4px;">Total Approved</th>
                                    <th style="border: 1px solid #000; padding: 4px;">Total Rejected</th>
                                    <th style="border: 1px solid #000; padding: 4px;">Total Pending</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${response.map((item, index) => `
                                    <tr>
                                        <td style="text-align: center; border: 1px solid #000; padding: 4px;">${index + 1}</td>
                                        <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.SR_CODE}</td>
                                        <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.SR_NAME}</td>
                                        <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.TOTAL_REQUESTS}</td>
                                        <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.DR_FREEZED_COUNT}</td>
                                        <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.DR_REJECTED_COUNT}</td>
                                        <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.DR_PRIMARY_APPROVAL_PENDING}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                const pdfBuffer = await this.generatePDFFromHTML2(html);
                const base64Pdf = pdfBuffer.toString('base64');
                return { pdf: base64Pdf };
            } else {
                let statusCondition = '';
                bindParams = {
                    SR_CODE,
                    FROM_DATE,
                    TO_DATE,
                    REF_TYPE
                };

                if (STATUS === 'P') {
                    statusCondition = "AND a.status IN ('P', 'A', 'S')";
                } else {
                    statusCondition = "AND a.status = :STATUS";
                    bindParams.STATUS = STATUS;
                }
                reportQuery = `SELECT 
                    b.sr_name,
                    a.*,
                    TO_CHAR(a.request_time, 'DD-MON-YYYY HH:MI AM') AS request_date,
                    emp.empl_name || ' (' || emp.designation || ')' AS empl_details
                FROM 
                    dr_jobs a
                JOIN 
                    sr_master b ON b.sr_cd = a.sr_code
                LEFT JOIN (
                    SELECT empl_id, empl_name, designation
                    FROM (
                        SELECT empl_id, empl_name, designation,
                            ROW_NUMBER() OVER (PARTITION BY empl_id ORDER BY empl_id) AS rn
                        FROM employee_login_master
                    )
                    WHERE rn = 1
                ) emp ON emp.empl_id = a.request_by
                WHERE 
                    a.sr_code = :SR_CODE
                    ${statusCondition}
                    AND a.event = '2'
                    AND a.request_time BETWEEN TO_DATE(:FROM_DATE, 'YYYY-MM-DD') AND TO_DATE(:TO_DATE, 'YYYY-MM-DD') + 1 - (1/86400)
                    AND (NVL(:REF_TYPE, 'ALL') = 'ALL' OR SUBSTR(a.REFERENCE_ID, 1, 1) = :REF_TYPE)
                ORDER BY a.doct_no`;
                response = await this.orDao.oDBQueryServicereadWithBindParamsed(reportQuery, bindParams);
    
                const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
                             <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
                             <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:30px">
                               <thead>
                               <tr> ${STATUS ==='R' ?`<th colspan='14'>` : `<th colspan='13'` }<h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - EDIT INDEX MIS REPORT </h3>
                             <h5 style="margin:0px">Report Period: <span style="color: #007bff;">${formattedFromDate}</span> to <span style="color: #007bff;">${formattedToDate} || SRO-OFFICE: ${response[0].SR_NAME}-(${SR_CODE}))  <span style="color: red;">|| Report generated on</span><span style="color: green;"> ${formattedDateTime}</span></h5>
                               </h5>
                                 <tr style="font-size : 15px;">
                                 <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Sl.No.</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Sro Name</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Sro Code</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Book No</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Cs.No.</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Reg.Year</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Reg.Doct.No</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Reg.Year</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Request By</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Requested Date & Time</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Requested Reason</th>
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Status</th>
                                  ${STATUS === 'R' ? `<th style="border: 1px solid #000;  width: 2%; padding: 2px;">Reject Reason</th>` : ''}
                                   <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Reference ID</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 ${response.map(
                                 (item, index) => `
                                       <tr>
                                       <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1 }</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME ? item.SR_NAME : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE ? item.SR_CODE : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.BOOK_NO ? item.BOOK_NO : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCT_NO ? item.DOCT_NO : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REG_YEAR ? item.REG_YEAR : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.RDOCT_NO ? item.RDOCT_NO : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.RYEAR ? item.RYEAR : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.EMPL_DETAILS ? item.EMPL_DETAILS : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REQUEST_DATE ? item.REQUEST_DATE : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REQUEST_REASONS ? item.REQUEST_REASONS : '-'}</td>
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.STATUS ? (item.STATUS === 'P' || item.STATUS === 'A' || item.STATUS === 'S') ? 'Pending': item.STATUS === 'D' ? 'Approved': item.STATUS === 'R' ? 'Rejected': '': '-'}</td>
                                         ${STATUS === 'R' ? `<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REJECT_REASON ? item.REJECT_REASON : '-'}</td>` : ''}
                                         <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REFERENCE_ID ? item.REFERENCE_ID : '-'}</td>
                                          </tr>`)
                                     .join('')}
                               </tbody>
                             </table>
                           </div>
                           <div style="margin : 0; margin-right:20px; margin-left:20px;" >
                             </div>`;
                const pdfBuffer = await this.generatePDFFromHTML2(html);
                const base64Pdf = pdfBuffer.toString('base64');
                return { pdf: base64Pdf };
            }
        } catch (ex) {
            Logger.error("EditIndex MIS PDF Handler || Error :", ex);
            console.error("EditIndex MIS PDF Handler || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    deleteTempLinkDocumentSrvc = async(reqData) => {	
        try{
            let query = `delete srouser.recti_temp where rowid = :ROW_ID`;
            let response = await this.orDao.oDbDeleteDocsWithBindParams(query, {ROW_ID : reqData.ROWID});
            return response;
        }catch(ex){
            Logger.error("updateDocumentServices - deleteTempLinkDocumentSrvc || Error :", ex);
            console.error("updateDocumentServices - deleteTempLinkDocumentSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    


}


module.exports = UpdateDocument;