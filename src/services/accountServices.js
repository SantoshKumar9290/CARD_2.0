const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const moment = require('moment');
const axios = require('axios');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { Console } = require("winston/lib/winston/transports");


class AccountServices {
  constructor() {
    this.orDao = new OrDao();
  }


  getAccountDetailsSrvc = async (srCode, regYear, month) => {
    try {
      let query = `
                SELECT
                    TO_CHAR(TRUNC(time_stamp), 'DD-MM-YYYY') AS truncated_date,
                    COUNT(CASE WHEN book_no = 1 THEN 1 END) AS count_book_no_1,
                    COUNT(CASE WHEN book_no = 2 THEN 1 END) AS count_book_no_2,
                    COUNT(CASE WHEN book_no = 3 THEN 1 END) AS count_book_no_3,
                    COUNT(CASE WHEN book_no = 4 THEN 1 END) AS count_book_no_4
                FROM
                    tran_major
                WHERE
                    sr_code = ${srCode} 
                    AND reg_year = ${regYear} 
                    AND EXTRACT(MONTH FROM time_stamp) = '${month}'
                GROUP BY
                    TRUNC(time_stamp)
                ORDER BY
                    truncated_date
            `;

      console.log("Generated SQL Query:", query);

      let response = await this.orDao.oDBQueryService(query);
            console.log("response",response)
      return response;
    } catch (ex) {
      Logger.error("AccountServices - getAccountDetails || Error :", ex);
      console.error("AccountServices - getAccountDetails || Error :", ex);
      throw constructCARDError(ex);
    }
    }
  accountGSrvc = async (reqData) => {
    try {
    let query=
               `SELECT 
    CASE 
        WHEN GROUPING_ID(TO_CHAR(TRUNC(E.E_DATE), 'DD-MM-YYYY'), TO_CHAR(TRUNC(SYSDATE), 'DD-MM-YYYY')) = 3 THEN 'Total'
        ELSE TO_CHAR(TRUNC(E.E_DATE), 'DD-MM-YYYY')
    END AS ADMITTED_DATE,
    NVL(SUM(T.ADMITTEDTOREGISTRATION), 0) AS ADMITTEDTOREGISTRATION,
    NVL(SUM(T.Total), 0) AS Total,
    NVL(SUM(T.Scanned), 0) AS Scanned,
    NVL(SUM(T.Unscanned), 0) AS Unscanned,
    NVL(SUM(T.Returned), 0) AS Returned,
    NVL(SUM(T.Uncclaimed), 0) AS Uncclaimed,
    NVL(SUM(T.Pending), 0) AS Pending,
    NVL(SUM(U.To_be_Prepared_EC), 0) AS To_be_Prepared_EC,
    NVL(SUM(U.Prepared_EC), 0) AS Prepared_EC,
    NVL(SUM(U.EC_Unclaimed), 0) AS EC_Unclaimed,
    NVL(SUM(V.To_be_Prepared_CC), 0) AS To_be_Prepared_CC,
    NVL(SUM(V.Prepared_CC), 0) AS Prepared_CC,
    NVL(SUM(V.CC_Unclaimed), 0) AS CC_Unclaimed
FROM 
    (SELECT DISTINCT D.E_DATE
     FROM tran_major D
     WHERE D.SR_CODE = ${reqData.SR_CODE} 
       AND TRUNC(D.E_DATE) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY')
    ) E
LEFT JOIN 
    (
    SELECT 
        TRUNC(A.TIME_STAMP) AS TIME_STAMP,
        COUNT(CASE WHEN A.DOC_ACC = 'Y' THEN 1 END) AS ADMITTEDTOREGISTRATION,
        COUNT(CASE WHEN A.DOC_ASSIGN = 'Y' THEN 1 END) AS Total,
        COUNT(CASE WHEN A.DOC_BUNDLE = 'Y' THEN 1 END) AS Scanned,
        COUNT(CASE WHEN A.DOC_BUNDLE = 'N' AND A.DOC_ASSIGN = 'Y' THEN 1 END) AS Unscanned,
        COUNT(CASE WHEN A.DOC_HANDOVER = 'Y' THEN 1 END) AS Returned,
        COUNT(CASE WHEN A.DOC_HANDOVER = 'N' AND A.DOC_BUNDLE = 'Y' THEN 1 END) AS Uncclaimed,
        COUNT(CASE WHEN A.DOC_PEND = 'Y' THEN 1 END) AS Pending
    FROM pde_doc_status_cr A
    WHERE TRUNC(A.TIME_STAMP) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY')
      AND A.SR_CODE = ${reqData.SR_CODE}
    GROUP BY TRUNC(A.TIME_STAMP)
    ) T ON TRUNC(E.E_DATE) = T.TIME_STAMP
LEFT JOIN 
    (
    SELECT 
        TRUNC(C.TIME_STAMP) AS TIME_STAMP,
        SUM(NVL(CASE WHEN C.STATUS IS NOT NULL THEN 1 ELSE 0 END, 0)) AS To_be_Prepared_EC,
        SUM(NVL(CASE WHEN C.STATUS = 'E' AND C.ESIGN_TRANS_ID IS NOT NULL THEN 1 ELSE 0 END, 0)) AS Prepared_EC,
        SUM(NVL(CASE WHEN C.ESIGN_TRANS_ID IS NULL THEN 1 ELSE 0 END, 0)) AS EC_Unclaimed
    FROM srouser.public_ec_status C
    WHERE TRUNC(C.TIME_STAMP) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY')
      AND C.SR_CODE = ${reqData.SR_CODE}
    GROUP BY TRUNC(C.TIME_STAMP)
    ) U ON TRUNC(E.E_DATE) = U.TIME_STAMP
LEFT JOIN 
    (
    SELECT 
        TRUNC(D.TIME_STAMP) AS TIME_STAMP,
        SUM(NVL(CASE WHEN D.STATUS IS NOT NULL THEN 1 ELSE 0 END, 0)) AS To_be_Prepared_CC,
        SUM(NVL(CASE WHEN D.STATUS = 'RD' THEN 1 ELSE 0 END, 0)) AS Prepared_CC,
        SUM(NVL(CASE WHEN D.STATUS != 'RD' THEN 1 ELSE 0 END, 0)) AS CC_Unclaimed
    FROM srouser.public_cc_status D
    WHERE TRUNC(D.TIME_STAMP) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY')
      AND D.SR_CODE = ${reqData.SR_CODE}
    GROUP BY TRUNC(D.TIME_STAMP)
    ) V ON TRUNC(E.E_DATE) = V.TIME_STAMP
GROUP BY GROUPING SETS (
    (TO_CHAR(TRUNC(E.E_DATE), 'DD-MM-YYYY'), TO_CHAR(TRUNC(SYSDATE), 'DD-MM-YYYY')), 
    ()
)
ORDER BY ADMITTED_DATE`;
                    let response = await this.orDao.oDBQueryService(query);
                    return response;
           } catch (ex) {
             Logger.error("AccountServices - accountGSrvc || Error :", ex);
             console.error("AccountServices - accountGSrvc || Error :", ex);
                     throw constructCARDError(ex);
        }
  }

  accountASrvc = async (reqData) => {
    try {
      const bindParam = {
        FROM_DATE : reqData.FROM_DATE,
        TO_DATE : reqData.TO_DATE,
        SR_CODE : reqData.SR_CODE
      }
        let query = `select 
distinct
a.sr_code,
(select sr_name from sr_master where sr_cd = a.sr_code) as sr_name,
a.book_no,
a.doct_no as cs_no,
tm.rdoct_no as doct_no,
a.reg_year,
td.tran_desc,
tm.p_name,
tm.final_taxable_value,
a.stamp_duty as stamp_duty_paid,
a.sd_payable,
a.rf_payable,
a.td_payable,
tm.e_date,
tm.dt_purch_stamp,
CASE 
   WHEN tn.doc_handover_time IS NOT NULL THEN TO_CHAR(tn.doc_handover_time, 'dd-mm-yyyy')
        ELSE 'handover in progress'
   END AS doc_handover_time,
COALESCE(ad.receipt_no, 'No Challan Number') as receipt_no,
COALESCE(t6.local_body_name, 'No Local Body') as local_body,
          tm.time_stamp,
          CASE 
               WHEN t7.class_code IN ('21', '26', '30', '45', '46') THEN 'Agriculture'
               ELSE t7.class_desc
           END AS class_desc
from (
select a.sr_code,a.book_no,a.doct_no,a.reg_year, sum(nvl(a.sd,0)) as sd,sum(nvl(a.td,0))as td_payable,sum(nvl(a.sd2,0))as sd_payable, sum(nvl(a.rf,0))as rf_payable,sum(nvl(a.uc,0))as uc, 
                sum(nvl(b.stamp_duty,0)) as stamp_duty from (
                SELECT
                        time_stamp,
                        SR_CODE,
                        book_no,
                        doct_no,
                        reg_year,
                        NVL(SD, 0) AS SD,
                        NVL(TD, 0) AS TD,
			NVL(SD, 0) - NVL(TD, 0) AS SD2,
                        NVL(RF, 0) AS RF,
                        NVL(UC, 0) AS UC
                    FROM 
                    (
                        SELECT 
                            time_stamp,
                            SR_CODE,
                            doct_no,
                            book_no,
                            reg_year,
                            ACCOUNT_CODE,
                            SUM(TOTAL_AMOUNT) AS TA
                        FROM 
                        (
                            SELECT
                                tm.time_stamp as time_stamp,
                                c.sr_code AS SR_CODE,
                                c.book_no,
                                c.doct_no,
                                c.reg_year,
                                c.account_code,
                                SUM(
                                    NVL(c.amount, 0) + 
                                    NVL(c.amount_by_challan, 0) + 
                                    NVL(c.amount_by_dd, 0) + 
                                    NVL(c.amount_by_online, 0) + 
                                    NVL(c.amount_by_shc, 0)
                                ) AS total_amount  
                            FROM
                                cash_paid c
                            JOIN 
                                tran_major tm 
                            ON 
                                c.sr_code = tm.sr_code 
                                AND c.book_no = tm.book_no 
                                AND c.reg_year = tm.reg_year 
                                AND c.doct_no = tm.doct_no 
                            JOIN 
                                cash_det cd 
                            ON 
                            c.sr_code = cd.sr_code 
                                AND c.book_no = cd.book_no 
                                AND c.reg_year = cd.reg_year 
                                AND c.doct_no = cd.doct_no and c.c_receipt_no = cd.rcptno and TO_CHAR(c.receipt_date, 'YYYY') = cd.rcptyr and cd.acc_canc = 'A'
                            WHERE
                                c.doct_no NOT IN (999999) and trunc(tm.time_Stamp) between TO_DATE(:FROM_DATE,'dd-mm-yyyy') and TO_DATE(:TO_DATE,'dd-mm-yyyy')
                                        AND tm.sr_code = :SR_CODE and tm.rdoct_no is not null
                            GROUP BY
                                c.sr_code,
                                c.book_no,
                                c.doct_no,
                                c.reg_year,
                                c.account_code,
                                tm.time_stamp
                UNION 
                            SELECT 
                                tm.time_stamp as time_stamp,
                                td.SR_CODE,
                                td.BOOK_NO,
                                td.DOCT_NO,
                                td.REG_YEAR,
                                6 AS ACCOUNT_CODE,
                                SUM(td.TD) AS TOTAL_AMOUNT
                            FROM   
                                srouser.tran_td_alloc td
                            JOIN 
                                tran_major tm 
                            ON 
                                td.sr_code = tm.sr_code 
                                AND td.book_no = tm.book_no 
                                AND td.doct_no = tm.doct_no 
                                AND td.reg_year = tm.reg_year 
                            WHERE trunc(tm.time_Stamp) between TO_DATE(:FROM_DATE,'dd-mm-yyyy') and TO_DATE(:TO_DATE,'dd-mm-yyyy')
                                        AND tm.sr_code = :SR_CODE and tm.rdoct_no is not null
                            GROUP BY 
                                td.SR_CODE,
                                td.BOOK_NO,
                                td.DOCT_NO,
                                td.REG_YEAR,
                                tm.time_stamp
                        ) 
                        GROUP BY 
                            SR_CODE, doct_no, book_no, reg_year,           ACCOUNT_CODE, time_stamp
                    )
                    PIVOT 
                    (
                        SUM(TA)
                        FOR ACCOUNT_CODE IN (7 AS SD, 1 AS RF, 59 AS UC, 6 AS TD)
                    )) a 
                join doc_ack b on a.sr_code = b.sr_code and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year
                group by a.sr_code,a.book_no, a.doct_no, a.reg_year) a
                join tran_major tm on a.sr_code = tm.sr_code and a.doct_no = tm.doct_no and a.reg_year = tm.reg_year and a.book_no = tm.book_no
                join tran_dir td on tm.tran_maj_code = td.tran_maj_code
                     AND tm.tran_min_code = td.tran_min_code
                left join tran_nomine tn on tm.sr_code = tn.sr_code and tm.doct_no = tn.doct_no and tm.reg_year = tn.reg_year and tm.book_no = tn.book_no 
                left join (
          SELECT
              t1.sr_code,
              t1.reg_year,
              t1.book_no,
              t1.doct_no,
              LISTAGG(t4.echallan_no, ', ') WITHIN GROUP (ORDER BY t4.echallan_no) as receipt_no
          FROM
              tran_major t1
         LEFT JOIN
              srouser.tran_nomine t3 ON t1.sr_code = t3.sr_code
                        AND t1.book_no = t3.book_no
                        AND t1.doct_no = t3.doct_no
                        AND t1.reg_year = t3.reg_year
          LEFT JOIN
              cash_det t4 ON t1.sr_code = t4.sr_code
                        AND t1.book_no = t4.book_no
                        AND t1.doct_no = t4.doct_no
                        AND t1.reg_year = t4.reg_year
          WHERE
          trunc(t1.time_Stamp) between TO_DATE(:FROM_DATE,'dd-mm-yyyy') and TO_DATE(:TO_DATE,'dd-mm-yyyy')
          AND
              t1.sr_code = :SR_CODE and t1.rdoct_no is not null
          GROUP BY
              t1.book_no,
              t1.doct_no,
              t1.sr_code,
              t1.reg_year
      ) ad on tm.sr_code = ad.sr_code and tm.doct_no = ad.doct_no and tm.reg_year = ad.reg_year and tm.book_no = ad.book_no 
       LEFT JOIN 
          tran_sched t5 ON tm.sr_code = t5.sr_code
                                   AND tm.book_no = t5.book_no
                                   AND tm.doct_no = t5.doct_no
                                   AND tm.reg_year = t5.reg_year
    left join 
            card.hab_local_body t6 on t5.hab_code = t6.hab_code 
    left join
            area_class t7 on t5.nature_use = t7.class_code
            where tm.rdoct_no is not null
            ORDER BY
          tm.time_stamp`;
      let response = await this.orDao.oDBQueryServiceWithBindParams(query,bindParam);
      return response;
    } catch (ex) {
      Logger.error("AccountServices - accountASrvc || Error :", ex);
      console.error("AccountServices - accountASrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  accountDSrvc = async (reqData) => {
    try {
      let query = `select t1.request_no,TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') as time_stamp, t2.name, TO_CHAR(TRUNC(t2.start_date), 'DD-MM-YYYY') as start_date, TO_CHAR(TRUNC(t2.end_date), 'DD-MM-YYYY') as end_date, t3.bankamount, t2.hlp_dn_yr from srouser.public_ec_status t1
      join nec_qry t2 on t1.request_no = t2.slno
      left join scanuser.echallan_trans t3 on t1.request_no = t3.depttransid
      where t1.sr_code =${reqData.SR_CODE} and TRUNC(t1.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'dd-mm-yyyy') AND TO_DATE('${reqData.TO_DATE}', 'dd-mm-yyyy') and t1.status is not null and t1.status != 'S' and t3.bankamount is not null`;
      
      let query1 = `select * from srouser.public_cc_status where sr_code ='${reqData.SR_CODE}' and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and status = 'RD'`;

      let query2 = `SELECT 
      a.*,
      b.party_name
  FROM 
      SROUSER.CASH_PAID a
  JOIN 
      CASH_DET b 
  ON 
      a.sr_code = b.sr_code 
      AND a.book_no = b.book_no 
      AND a.reg_year = b.reg_year 
       and a.c_receipt_no = b.c_receipt_no
  WHERE 
      a.doct_no = 999999 
      AND a.sr_code = ${reqData.SR_CODE}
      AND TRUNC(a.receipt_date) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY')
      and a.account_code = 36`;
      
      
      let response = await this.orDao.oDBQueryService(query);
      let response1 = await this.orDao.oDBQueryService(query1);
      let response2 = await this.orDao.oDBQueryService(query2);
      

      return {EC:response,CC:response1,SS:response2};
    } catch (ex) {
      Logger.error("AccountServices - accountDSrvc || Error :", ex);
      console.error("AccountServices - accounDSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  minitueReportSrvc = async (reqData) => {
    try {
      let query = `select t1.sr_code, t1.book_no, t1.doct_no, t1.reg_year, TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp, t2.p_number, t1.rdoct_no, t2.pending_remarks,t2.release_remarks from tran_major t1
            join srouser.tran_pending t2 on t1.sr_code = t2.sr_code and 
            t1.book_no = t2.book_no and
            t1.reg_year = t2.reg_year and 
            t1.doct_no = t2.doct_no
            WHERE 
            trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
                        AND
                            t1.sr_code = ${reqData.SR_CODE} and t1.rdoct_no is not null order by t1.time_stamp`;
      let response = await this.orDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("AccountServices - minitueReportSrvc || Error :", ex);
      console.error("AccountServices - minitueReportSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
    
    accountBSrvc = async (reqData) => {
        try {
            let responseArray = [];
            let query = `select distinct * from (select t1.sr_code,t1.book_no,t1.doct_no, t1.reg_year,TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp,t4.account_code,(select acc_desc from account_cd where acc_code = t4.account_code) as acc_desc, t4.amount, TO_CHAR(TRUNC(t5.doc_handover_time), 'DD-MM-YYYY') AS doc_handover_time from tran_major t1
            join cash_det t2 on t1.sr_code = t2.sr_code and
           t1.book_no = t2.book_no and
           t1.reg_year = t2.reg_year and 
           t1.doct_no = t2.doct_no
           LEFT JOIN SROUSER.CASH_PAID t4 ON t1.sr_code = t4.sr_code and
           t1.book_no = t4.book_no and
           t1.reg_year = t4.reg_year and 
           t1.doct_no = t4.doct_no
           LEFT JOIN srouser.tran_nomine t5 on t1.sr_code = t5.sr_code and
           t1.book_no = t5.book_no and
           t1.reg_year = t5.reg_year and 
           t1.doct_no = t5.doct_no
           where trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
           AND
               t1.sr_code = ${reqData.SR_CODE} and t1.rdoct_no is not null and t5.doc_handover_time is not null AND t4.account_code IN (12, 18, 19, 15) order by t1.time_stamp)
            `;
            let query1 = `select sr_code, book_no, doct_no, reg_year, TO_CHAR(TRUNC(receipt_date), 'DD-MM-YYYY') as time_stamp, account_code,(select acc_desc from account_cd where acc_code = account_code) as acc_desc, amount, NULL AS doc_handover_time from SROUSER.CASH_PAID where sr_code = ${reqData.SR_CODE} and trunc(receipt_date) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and account_code IN (12, 18, 19, 15)  and doct_no = 999999`;
            let response = await this.orDao.oDBQueryService(query);
            let response1 = await this.orDao.oDBQueryService(query1);
            responseArray = responseArray.concat(response,response1);
            responseArray.sort((a, b) => {
                let dateA = new Date(a.TIME_STAMP.split('-').reverse().join('-'));
                let dateB = new Date(b.TIME_STAMP.split('-').reverse().join('-'));
                return dateA - dateB;
            });
            return responseArray;
        } catch (ex) {
            Logger.error("AccountServices - accountBSrvc || Error :", ex);
            console.error("AccountServices - accountBSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

  accountHSrvc = async (reqData) => {
    try {
      // let query = `SELECT 
      //     TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp,  
      //     t1.sr_code, 
      //     SUM(t1.sd_payable) as sd_payable,
      //     SUM(t1.td_payable) as td_payable,
      //     sum(t1.rf_payable) as rf_payable,
      //     count(*) as count
      // FROM 
      //     tran_major t1
      // WHERE 
      //     trunc(t1.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd')
      //     AND t1.sr_code =${reqData.SR_CODE} and t1.rdoct_no is not null
      // GROUP BY 
      // TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY'),
      //     t1.sr_code`;

      const bindParam = {
        FROM_DATE : reqData.FROM_DATE,
        TO_DATE : reqData.TO_DATE,
        SR_CODE : reqData.SR_CODE 
      }

      let query = `
          select TO_CHAR(TRUNC(a.time_stamp), 'DD-MM-YYYY') as time_stamp,a.sr_code,sum(nvl(a.td,0))as td_payable,sum(nvl(a.sd2,0))as sd_payable, sum(nvl(a.rf,0))as rf_payable, count(*) as count from (
                SELECT
                        time_stamp,
                        SR_CODE,
                        book_no,
                        doct_no,
                        reg_year,
                        NVL(SD, 0) AS SD,
                        NVL(TD, 0) AS TD,
			                  NVL(SD, 0) - NVL(TD, 0) AS SD2,
                        NVL(RF, 0) AS RF,
                        NVL(UC, 0) AS UC
                    FROM 
                    (
                        SELECT 
                            time_stamp,
                            SR_CODE,
                            doct_no,
                            book_no,
                            reg_year,
                            ACCOUNT_CODE,
                            SUM(TOTAL_AMOUNT) AS TA
                        FROM 
                        (
                            SELECT
                                tm.time_stamp as time_stamp,
                                c.sr_code AS SR_CODE,
                                c.book_no,
                                c.doct_no,
                                c.reg_year,
                                c.account_code,
                                SUM(
                                    NVL(c.amount, 0) + 
                                    NVL(c.amount_by_challan, 0) + 
                                    NVL(c.amount_by_dd, 0) + 
                                    NVL(c.amount_by_online, 0) + 
                                    NVL(c.amount_by_shc, 0)
                                ) AS total_amount  
                            FROM
                                cash_paid c
                            JOIN 
                                tran_major tm 
                            ON 
                                c.sr_code = tm.sr_code 
                                AND c.book_no = tm.book_no 
                                AND c.reg_year = tm.reg_year 
                                AND c.doct_no = tm.doct_no 
                            JOIN 
                                cash_det cd 
                            ON 
                            c.sr_code = cd.sr_code 
                                AND c.book_no = cd.book_no 
                                AND c.reg_year = cd.reg_year 
                                AND c.doct_no = cd.doct_no and c.c_receipt_no = cd.rcptno and TO_CHAR(c.receipt_date, 'YYYY') = cd.rcptyr and cd.acc_canc = 'A'
                            WHERE
                                c.doct_no NOT IN (999999) and trunc(tm.time_Stamp) between TO_DATE(:FROM_DATE,'yyyy=mm-dd') and TO_DATE(:TO_DATE,'yyyy=mm-dd')
                                        AND tm.sr_code = :SR_CODE and tm.rdoct_no is not null
                            GROUP BY
                                c.sr_code,
                                c.book_no,
                                c.doct_no,
                                c.reg_year,
                                c.account_code,
                                tm.time_stamp
                      UNION 
                            SELECT 
                                tm.time_stamp as time_stamp,
                                td.SR_CODE,
                                td.BOOK_NO,
                                td.DOCT_NO,
                                td.REG_YEAR,
                                6 AS ACCOUNT_CODE,
                                SUM(td.TD) AS TOTAL_AMOUNT
                            FROM   
                                srouser.tran_td_alloc td
                            JOIN 
                                tran_major tm 
                            ON 
                                td.sr_code = tm.sr_code 
                                AND td.book_no = tm.book_no 
                                AND td.doct_no = tm.doct_no 
                                AND td.reg_year = tm.reg_year 
                            WHERE trunc(tm.time_Stamp) between TO_DATE(:FROM_DATE,'yyyy=mm-dd') and TO_DATE(:TO_DATE,'yyyy=mm-dd')
                                        AND tm.sr_code = :SR_CODE and tm.rdoct_no is not null
                            GROUP BY 
                                td.SR_CODE,
                                td.BOOK_NO,
                                td.DOCT_NO,
                                td.REG_YEAR,
                                tm.time_stamp
                        ) 
                        GROUP BY 
                            SR_CODE, doct_no, book_no, reg_year,           ACCOUNT_CODE, time_stamp
                    )
                    PIVOT 
                    (
                        SUM(TA)
                        FOR ACCOUNT_CODE IN (7 AS SD, 1 AS RF, 59 AS UC, 6 AS TD)
                    )) a 
                group by TO_CHAR(TRUNC(a.time_stamp), 'DD-MM-YYYY'),a.sr_code
                order by TO_CHAR(TRUNC(a.time_stamp), 'DD-MM-YYYY')
      `

      let query1 = `SELECT time_stamp, sum(total_amount) as total_amount
      FROM (
          SELECT  TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp, t4.amount as total_amount
          FROM tran_major t1
          JOIN cash_det t2 ON t1.sr_code = t2.sr_code AND
                               t1.book_no = t2.book_no AND
                               t1.reg_year = t2.reg_year AND 
                               t1.doct_no = t2.doct_no
          LEFT JOIN SROUSER.CASH_PAID t4 ON t1.sr_code = t4.sr_code AND
                                             t1.book_no = t4.book_no AND
                                             t1.reg_year = t4.reg_year AND 
                                             t1.doct_no = t4.doct_no
          LEFT JOIN srouser.tran_nomine t5 ON t1.sr_code = t5.sr_code AND
                                       t1.book_no = t5.book_no AND
                                       t1.reg_year = t5.reg_year AND 
                                       t1.doct_no = t5.doct_no
          WHERE TRUNC(t1.time_Stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}','yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}','yyyy-mm-dd')
                AND t1.sr_code = ${reqData.SR_CODE} AND t1.rdoct_no IS NOT NULL AND t5.doc_handover_time IS NOT NULL AND t4.account_code IN (12, 18, 19, 15)
          UNION ALL
          SELECT TO_CHAR(TRUNC(receipt_date), 'DD-MM-YYYY') AS time_stamp, amount as total_amount
          FROM SROUSER.CASH_PAID 
          WHERE sr_code = ${reqData.SR_CODE} AND 
                TRUNC(receipt_date) BETWEEN TO_DATE('${reqData.FROM_DATE}','yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}','yyyy-mm-dd') AND 
                account_code IN (12, 18, 19, 15) AND 
                doct_no = 999999
      ) 
      GROUP BY          
       time_stamp

      ORDER BY time_stamp`;    

      let query2 =`SELECT time_stamp, SUM(chargeable_value) AS total_chargeable_value
      FROM (
          SELECT b.*, TO_CHAR(TRUNC(a.time_stamp), 'DD-MM-YYYY') AS time_stamp
          FROM tran_major a
          JOIN cash_det b ON a.sr_code = b.sr_code
                          AND a.book_no = b.book_no
                          AND a.reg_year = b.reg_year
                          AND a.doct_no = b.doct_no
          WHERE a.rdoct_no IS NOT NULL 
              AND a.sr_code = ${reqData.SR_CODE}
              AND TRUNC(a.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd')
              AND b.chargeable_value != 0
              AND b.stock_holding_id IS NULL
              AND b.echallan_no IS NULL
      ) 
      GROUP BY time_stamp`;

      let query3=`SELECT 
      time_stamp,
      SUM(bank_amount) AS ec_amount,
      SUM(count) AS cc_amount,
      SUM(amount_1) AS single_search,
      sum(user_charge_ec) as user_charge_ec,
      sum(user_charge_cc) as user_charge_cc,
      sum(user_charge_single) as user_charge_single
  FROM (
   
      SELECT 
          TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp, 
          SUM(t3.bankamount) AS bank_amount,
          NULL AS count,
          NULL AS amount_1,
          count(*) * 20 as user_charge_ec,
          null as user_charge_cc,
          null as user_charge_single
      FROM 
          srouser.public_ec_status t1
      JOIN 
          nec_qry t2 ON t1.request_no = t2.slno 
      LEFT JOIN 
          scanuser.echallan_trans t3 ON t1.request_no = t3.depttransid
      WHERE 
          t1.sr_code = ${reqData.SR_CODE} 
          AND TRUNC(t1.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd') 
          AND t1.status IS NOT NULL
          AND t1.status != 'S' 
          AND t3.bankamount IS NOT NULL
      GROUP BY 
          TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY')
      UNION ALL
      SELECT 
          TO_CHAR(TRUNC(time_stamp), 'DD-MM-YYYY') AS time_stamp, 
          NULL AS bank_amount,
          COUNT(*) * 200 AS count,
          NULL AS amount_1,
          null as user_charge_ec,
          count(*) * 20 as user_charge_cc,
          null as user_charge_single
      FROM 
          srouser.public_cc_status 
      WHERE 
          sr_code = ${reqData.SR_CODE}
          AND TRUNC(time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd') 
          AND status = 'RD'
      GROUP BY 
          TO_CHAR(TRUNC(time_stamp), 'DD-MM-YYYY')
      UNION ALL
      SELECT 
          TO_CHAR(TRUNC(receipt_date), 'DD-MM-YYYY') AS time_stamp, 
          NULL AS bank_amount,
          NULL AS count,
          SUM(amount) AS amount_1,
          null as user_charge_ec,
          null as user_charge_cc,
          count(*) * 20 as user_charge_single
      FROM 
          SROUSER.CASH_PAID 
      WHERE 
          doct_no = 999999 
          AND sr_code = ${reqData.SR_CODE}
          AND TRUNC(receipt_date) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd')
          AND account_code = 36
      GROUP BY 
          TO_CHAR(TRUNC(receipt_date), 'DD-MM-YYYY')
  )
   
  GROUP BY 
      time_stamp
  ORDER BY 
      time_stamp`;

      let response = await this.orDao.oDBQueryServiceWithBindParams(query,bindParam);
      let response1 = await this.orDao.oDBQueryService(query1);
      let response2 = await this.orDao.oDBQueryService(query2);
      let response3 = await this.orDao.oDBQueryService(query3);
      let hmrrevenue = [];
      let smrrevenue = [];
      try {
        let config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `http://10.96.47.103:4000/hmrservice/api/users/GetRevenueDetailsofHMR?sroNumber=${reqData.SR_CODE}&startdate=${reqData.FROM_DATE}&enddate=${reqData.TO_DATE}`,
          headers: { }
        };
        const response = await axios.request(config);
        const data = response.data.data;
        const dateLimit = new Date("2023-12-21");
        const results = data.reduce((acc, { cert_form, updatedAt }) => {
            if (cert_form) {
                const dateStr = updatedAt.split("T")[0];
                const recordDate = new Date(updatedAt);
                const amount = recordDate > dateLimit ? 500 : 200;
                acc[dateStr] = (acc[dateStr] || 0) + amount;
            }
            return acc;
        }, {});

        hmrrevenue = Object.keys(results).map(date => {
          const [year,month,day] = date.split('-');
          return {  
            TIME_STAMP : `${day}-${month}-${year}`,
            HMR_AMOUNT: results[date]
          }
        });
    } catch (error) {
        console.error(error); 
    }



    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `http://10.96.47.103:4001/smr/users/GetRevenueDetailsofSMR?sroNumber=${reqData.SR_CODE}&startdate=${reqData.FROM_DATE}&enddate=${reqData.TO_DATE}`,
        headers: { }
      };
      const response = await axios.request(config);
      const data = response.data.data;
      const results = data.reduce((acc, { cert_form, updatedAt }) => {
        if (cert_form) {
            const dateStr = updatedAt.split("T")[0];
            const amount = 200; // Fixed amount for each valid entry
            acc[dateStr] = (acc[dateStr] || 0) + amount;
        }
        return acc;
    }, {});

      smrrevenue = Object.keys(results).map(date => {
          const [year,month,day] = date.split('-');
          return {  
            TIME_STAMP : `${day}-${month}-${year}`,
            SMR_AMOUNT: results[date]
          }
        });
  } catch (error) {
      console.error(error); 
  }

      const combinedArray = [...response, ...response1, ...response2,...response3, ...hmrrevenue, ...smrrevenue];


const mergedObjectsMap = combinedArray.reduce((acc, curr) => {
  const timeStamp = curr.TIME_STAMP;

  if (!acc[timeStamp]) {
    acc[timeStamp] = { 
      TIME_STAMP: timeStamp,
      SD_PAYABLE: 0, 
      TD_PAYABLE: 0, 
      RF_PAYABLE: 0, 
      COUNT: 0, 
      TOTAL_AMOUNT: 0,
      TOTAL_CHARGEABLE_VALUE:0,
      EC_AMOUNT:0,
      CC_AMOUNT:0,
      SINGLE_SEARCH:0,
      USER_CHARGE_EC:0,
      USER_CHARGE_CC:0,
      USER_CHARGE_SINGLE:0,
      HMR_AMOUNT:0,
      SMR_AMOUNT:0,
    };
  }

  acc[timeStamp] = { ...acc[timeStamp], ...curr };
  if(!('SD_PAYABLE' in acc[timeStamp])) { acc[timeStamp].SD_PAYABLE =0}
  if(!('TD_PAYABLE' in acc[timeStamp])) { acc[timeStamp].TD_PAYABLE =0}
  if(!('RF_PAYABLE' in acc[timeStamp])) { acc[timeStamp].RF_PAYABLE =0}
  if(!('COUNT' in acc[timeStamp]))      { acc[timeStamp].COUNT =0}
  if(!('TOTAL_AMOUNT' in acc[timeStamp])) { acc[timeStamp].TOTAL_AMOUNT =0}
  if(!('TOTAL_CHARGEABLE_VALUE' in acc[timeStamp])) { acc[timeStamp].TOTAL_CHARGEABLE_VALUE =0}
  if(!('EC_AMOUNT' in acc[timeStamp])) { acc[timeStamp].EC_AMOUNT =0}
  if(!('CC_AMOUNT' in acc[timeStamp])) { acc[timeStamp].CC_AMOUNT =0}
  if(!('SINGLE_SEARCH' in acc[timeStamp])) { acc[timeStamp].SINGLE_SEARCH =0}
  if(!('USER_CHARGE_EC' in acc[timeStamp])) { acc[timeStamp].USER_CHARGE_EC =0}
  if(!('USER_CHARGE_CC' in acc[timeStamp])) { acc[timeStamp].USER_CHARGE_CC =0}
  if(!('USER_CHARGE_SINGLE' in acc[timeStamp])) { acc[timeStamp].USER_CHARGE_SINGLE =0}
  if(!('HMR_AMOUNT' in acc[timeStamp])) { acc[timeStamp].HMR_AMOUNT =0}
  if(!('SMR_AMOUNT' in acc[timeStamp])) { acc[timeStamp].SMR_AMOUNT =0}


  return acc;
}, {});

const mergedObjects = Object.values(mergedObjectsMap);

mergedObjects.sort((a, b) => {
  let dateA = new Date(a.TIME_STAMP.split('-').reverse().join('-'));
  let dateB = new Date(b.TIME_STAMP.split('-').reverse().join('-'));
  return dateA - dateB;
});
      return mergedObjects;
    } catch (ex) {
      Logger.error("AccountServices - accountHSrvc || Error :", ex);
      console.error("AccountServices - accountHSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  addCollectionAccountCDataSrvc = async (reqData) => {
    try {
      let query = `insert into srouser.tran_accountc_col (col_date,doc_details, amount, other_receipt, cross_ref, entry_by, entry_on)
                         values (to_date('${reqData.DATE}','DD/MM/YYYY'),'${reqData.DOC_DETAILS}',${reqData.AMOUNT},'${reqData.OTHER_RECEIPT}','${reqData.CROSS_REF}','${reqData.ENTRY_BY}', SYSDATE)`;
      let response = await this.orDao.oDbInsertDocs(query);
      return response;
    } catch (ex) {
      Logger.error(
        "AccountServices - addCollectionAccountCDataSrvc || Error :",
        ex
      );
      console.error(
        "AccountServices - addCollectionAccountCDataSrvc || Error :",
        ex
      );
      throw constructCARDError(ex);
    }
  };
  addDisbursementsAccountCDataSrvc = async (reqData) => {
    try {
      let query = `insert into srouser.tran_accountc_dis (dis_date,doc_details, amount, other_receipt, cross_ref, entry_by, entry_on)
                         values (to_date('${reqData.DATE}','DD/MM/YYYY'),'${reqData.DOC_DETAILS}',${reqData.AMOUNT},'${reqData.OTHER_RECEIPT}','${reqData.CROSS_REF}','${reqData.ENTRY_BY}', SYSDATE)`;
      let response = await this.orDao.oDbInsertDocs(query);
      return response;
    } catch (ex) {
      Logger.error(
        "AccountServices - addDisbursementsAccountCDataSrvc || Error :",
        ex
      );
      console.error(
        "AccountServices - addDisbursementsAccountCDataSrvc || Error :",
        ex
      );
      throw constructCARDError(ex);
    }
  };

  accountCSrvc = async (reqData) => {
    try {
        let query = `
        SELECT b.*,TO_CHAR(TRUNC(a.time_stamp), 'DD-MM-YYYY') AS time_stamp
        FROM tran_major a
        JOIN cash_det b ON a.sr_code = b.sr_code
                        AND a.book_no = b.book_no
                        AND a.reg_year = b.reg_year
                        AND a.doct_no = b.doct_no
        WHERE a.rdoct_no IS NOT NULL and a.sr_code = ${reqData.SR_CODE}
          AND TRUNC(a.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'dd-mm-yyyy') AND TO_DATE('${reqData.TO_DATE}', 'dd-mm-yyyy')
          AND b.chargeable_value != 0
          AND b.stock_holding_id IS NULL
          AND b.echallan_no IS NULL
        `;
        let response = await this.orDao.oDBQueryService(query);
        console.log(query);
        response.sort((a, b) => {
            let dateA = new Date(a.TIME_STAMP.split('-').reverse().join('-'));
            let dateB = new Date(b.TIME_STAMP.split('-').reverse().join('-'));
            return dateA - dateB;
        });
        return response;
    } catch (ex) {
        Logger.error("AccountServices - accountCSrvc || Error :", ex);
        console.error("AccountServices - accountCSrvc || Error :", ex);
        throw constructCARDError(ex);
    }
}

generatePDFFromHTML = async (html,SR_CODE,SR_NAME,FROM_DATE,TO_DATE,Account) => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.setContent(html);
  const totalPages = await page.evaluate(() => {
    const pageHeight = 595; 
    const contentHeight = document.documentElement.scrollWidth;
    return Math.ceil(contentHeight / pageHeight);
  });

  const pdfBuffer = await page.pdf({
    legal: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '30px',
      left: '5px',
    },
    displayHeaderFooter: true,
    footerTemplate: `
    <div style="font-size: 10px; color: #333; text-align: center; margin-left: 30px; margin-top: 2px">
      Page <span class="pageNumber"></span> of ${totalPages - 1}
    </div>
    <div style="font-size: 10px; color: #333; text-align: center; margin-left: 510px; margin-top: 2px">
      Generated on: ${new Date().toLocaleString()}
    </div>`,
    displayHeaderFooter: true,
    headerTemplate: `
    <div style="display: grid; grid-template-columns: 3.5fr 1.2fr;">
    <div>
    <h3 style="margin-left:5px; margin-top : -10px; font-size: 6px">SUB REGISTER OFFICE:${SR_NAME} - (${SR_CODE}) </h3>
    </div>
    <div>
    <h3 style="font-size: 6px;margin-top : -10px;">ACCOUNT REPORT- ${Account} -FROM ${FROM_DATE} TO ${TO_DATE}</h3></div>
</div>
</div>`,
    printBackground: true,
    fontFamily: true,
    landscape: true,
  });
  

  await browser.close();

  return pdfBuffer;
}

// getReport1PdfGenerateA = async (reqData) => {

//   try {
//     let response = reqData.arrayData;
//     if(response.length === 0) {
//       return ;
//     }
//     const imagePath = path.join(__dirname, `../../logos/AP_logo.png`); 
//     const data = fs.readFileSync(imagePath , {encoding : 'base64'});
//     const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
//           <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
//           <h2 style="margin:10px 0;font-family: "Poppins", sans-serif;">REGISTRATIONS & STAMPS DEPARTMENT</h2>
//     <h3 style="margin:10px 0;font-family: "Poppins", sans-serif;">GOVERNMENT OF ANDHRA PRADESH</h3>
//     <div style="display: flex; justify-content: space-between">
//     <div>
//     <h3 style="margin:0px; margin-top : 15px">SUB REGISTER OFFICE:${response[0].SR_NAME}(${reqData.SR_CODE}) </h3>
//     </div>
//     <div>
//     <h3>ACCOUNT REPORT-A -FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h3></div>
// </div>
//     <table style="width: 100%; border: 1px solid #000; margin-top: 10px; margin-bottom:0; font-size: 9px">
//     <thead style="background-colour: blue;">
//     <tr style="background-color: #274C77; color: white;">
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all; padding: 2px">S.No.</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Date:</th>
//         <th colSpan="4" style="text-align: center">Number Of Document</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Doct.No</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all; padding: 2px">Nature Of Document</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Ag.Land, House, Plot, Apartment</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Name Of the Applicant</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Challan No/Stock <br />Holding Certificate No:</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Final Taxable Value</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Stamp Value</th>
//         <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Regn.Fee</th>
//         <th colSpan="1" style="text-align: center"></th>
//         <th colSpan="4" style="text-align: center">Date Of</th>
//         <th colSpan="4" style="text-align: center">Transfer Duty</th>
//     </tr>
//     <tr style="background-color: #274C77; color: white;">
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Book-1</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Book-2</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Book-3</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Book-4</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">User Charges</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Purchase of Stamp</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Execution</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Registration Of Refusal</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Return</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Value of the document<br /> Liable for Transfer Duty</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Amount of transfer<br /> duty collected</th>
//         <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Name of the <br />local authority</th>
//     </tr>
// </thead>
//       <tbody>
//       ${response
//         .map(
//           (items, index) => `
//           <tr key=${items.TIME_STAMP} style="border: 1px solid #000;">
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${index + 1}</td> 
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format('DD-MM-YYYY')}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BOOK_NO===1 ? items.BOOK_NO : '-'}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BOOK_NO===2 ? items.BOOK_NO : '-'}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BOOK_NO===3 ? items.BOOK_NO : '-'}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BOOK_NO===4 ? items.BOOK_NO : '-'}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOCT_NO}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TRAN_DESC}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.CLASS_DESC}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.P_NAME}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.RECEIPT_NO}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.FINAL_TAXABLE_VALUE}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.SD_PAYABLE}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.RF_PAYABLE}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${500}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.DT_PURCH_STAMP).format('DD-MM-YYYY')}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.E_DATE).format('DD-MM-YYYY')}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${0}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOC_HANDOVER_TIME}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.FINAL_TAXABLE_VALUE}</td>
//           <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TD_PAYABLE}</td>
//           <td style="border-bottom: 1px solid #000;">${items.LOCAL_BODY}</td>
//       </tr>
//           `
//         )
//         .join('')}
//       </tbody>
//     </table>
//     </div>
//      <div style="margin : 10px; margin-right:10px; margin-left:10px;" >
//      </div>
//     `;

//     const pdfBuffer = await this.generatePDFFromHTML(html,response[0].SR_CODE,response[0].SR_NAME,reqData.FROM_DATE,reqData.TO_DATE,"A");
//     const base64Pdf = pdfBuffer.toString('base64');

//     return { pdf: base64Pdf };
//   } catch (ex) {
//     Logger.error("accountHandler - getReport1 || Error :", ex);
//     console.error("accountaccountHandler - getReport1 || Error :", ex);
//     throw constructCARDError(ex);
//   }
// }
getReport1PdfGenerateA = async (reqData) => {
  try {
    let response = reqData.arrayData;
    if (response.length === 0) {
      return;
    }

    const imagePath = path.join(__dirname, `../../logos/AP_logo.png`);
    const data = fs.readFileSync(imagePath, { encoding: "base64" });

    let totalFinalTaxableValue = 0;
    let totalStampValue = 0;
    let totalRegnFee = 0;
    let totalUserCharge = 0;
    let totalValueOfDocLiable = 0;
    let totalAmountTransferDuty = 0;

    response.forEach((item) => {
      totalFinalTaxableValue += item.FINAL_TAXABLE_VALUE || 0;
      totalStampValue += item.SD_PAYABLE || 0;
      totalRegnFee += item.RF_PAYABLE || 0;
      totalUserCharge += 500;
      totalValueOfDocLiable += item.FINAL_TAXABLE_VALUE || 0;
      totalAmountTransferDuty += item.TD_PAYABLE || 0;
    });

    const html = `
<div style="text-align: center; margin:20px; margin-top:0">
<div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
<h2 style="margin:10px 0;font-family: 'Poppins', sans-serif;">REGISTRATIONS & STAMPS DEPARTMENT</h2>
<h3 style="margin:10px 0;font-family: 'Poppins', sans-serif;">GOVERNMENT OF ANDHRA PRADESH</h3>
<div style="display: flex; justify-content: space-between">
<div>
<h3 style="margin:0px; margin-top : 15px">SUB REGISTER OFFICE: ${response[0].SR_NAME} (${reqData.SR_CODE})</h3>
</div>
<div>
<h3>ACCOUNT REPORT-A - FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h3>
</div>
</div>
  <table style="width: 100%; border: 1px solid #000; margin-top: 10px; margin-bottom:0; font-size: 9px">
<thead style="background-colour: blue;">
  <tr style="background-color: #274C77; color: white;">
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all; padding: 2px">S.No.</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Date:</th>
      <th colSpan="4" style="text-align: center">Number Of Document</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Doct.No</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all; padding: 2px">Nature Of Document</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Ag.Land, House, Plot, Apartment</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Name Of the Applicant</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Challan No/Stock <br />Holding Certificate No:</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Final Taxable Value</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Stamp Value</th>
      <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Regn.Fee</th>
      <th colSpan="1" style="text-align: center"></th>
      <th colSpan="4" style="text-align: center">Date Of</th>
      <th colSpan="4" style="text-align: center">Transfer Duty</th>
  </tr>
  <tr style="background-color: #274C77; color: white;">
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Book-1</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Book-2</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Book-3</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Book-4</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">User Charges</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Purchase of Stamp</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Execution</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Registration Of Refusal</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Return</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Value of the document<br /> Liable for Transfer Duty</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Amount of transfer<br /> duty collected</th>
      <th style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;padding: 2px">Name of the <br />local authority</th>
  </tr>
</thead>
<tbody>
  ${response
        .map(
          (items, index) => `
<tr key=${items.TIME_STAMP} style="border: 1px solid #000;">
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${index + 1}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format("DD-MM-YYYY")}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BOOK_NO === 1 ? items.BOOK_NO : "-"}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BOOK_NO === 2 ? items.BOOK_NO : "-"}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BOOK_NO === 3 ? items.BOOK_NO : "-"}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BOOK_NO === 4 ? items.BOOK_NO : "-"}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOCT_NO}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TRAN_DESC}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.CLASS_DESC}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.P_NAME}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.RECEIPT_NO}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.FINAL_TAXABLE_VALUE}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.SD_PAYABLE}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.RF_PAYABLE}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">500</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.DT_PURCH_STAMP).format("DD-MM-YYYY")}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.E_DATE).format("DD-MM-YYYY")}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">0</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOC_HANDOVER_TIME}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.FINAL_TAXABLE_VALUE}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TD_PAYABLE}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.LOCAL_BODY}</td>
</tr>`
        )
        .join("")}
<tr style="border-top: 2px solid black; font-weight: bold;">
<td colspan="11" style="border-right: 1px solid #000; border-bottom: 1px solid #000;">Total:</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${totalFinalTaxableValue}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${totalStampValue}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${totalRegnFee}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${totalUserCharge}</td>  
<td colspan="4" style="border-right: 1px solid #000; border-bottom: 1px solid #000;"></td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${totalValueOfDocLiable}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${totalAmountTransferDuty}</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;"></td>
</tr>
</tbody>
</table>
</div>`;

    const pdfBuffer = await this.generatePDFFromHTML(
      html,
      response[0].SR_CODE,
      response[0].SR_NAME,
      reqData.FROM_DATE,
      reqData.TO_DATE,
      "A"
    );
    const base64Pdf = pdfBuffer.toString("base64");

    return { pdf: base64Pdf };
  } catch (ex) {
    Logger.error("accountHandler - getReport1 || Error :", ex);
    console.error("accountaccountHandler - getReport1 || Error :", ex);
    throw constructCARDError(ex);
  }
};

getReport1PdfGenerateB = async (reqData) => {

  try {
    let query = `select distinct * from (select t1.sr_code,t1.book_no,t1.doct_no, t1.reg_year,TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp,t4.account_code,(select acc_desc from account_cd where acc_code = t4.account_code) as acc_desc, t4.amount, TO_CHAR(TRUNC(t5.doc_handover_time), 'DD-MM-YYYY') AS doc_handover_time from tran_major t1
    join cash_det t2 on t1.sr_code = t2.sr_code and
   t1.book_no = t2.book_no and
   t1.reg_year = t2.reg_year and 
   t1.doct_no = t2.doct_no
   LEFT JOIN SROUSER.CASH_PAID t4 ON t1.sr_code = t4.sr_code and
   t1.book_no = t4.book_no and
   t1.reg_year = t4.reg_year and 
   t1.doct_no = t4.doct_no
   LEFT JOIN srouser.tran_nomine t5 on t1.sr_code = t5.sr_code and
   t1.book_no = t5.book_no and
   t1.reg_year = t5.reg_year and 
   t1.doct_no = t5.doct_no
   where trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
   AND
       t1.sr_code = ${reqData.SR_CODE} and t1.rdoct_no is not null and t5.doc_handover_time is not null AND t4.account_code IN (12, 18, 19, 15) order by t1.time_stamp)
    `;
    let query1 = `select sr_code, book_no, doct_no, reg_year, TO_CHAR(TRUNC(receipt_date), 'DD-MM-YYYY') as time_stamp, account_code,(select acc_desc from account_cd where acc_code = account_code) as acc_desc, amount, NULL AS doc_handover_time from SROUSER.CASH_PAID where sr_code = ${reqData.SR_CODE} and trunc(receipt_date) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and account_code IN (12, 18, 19, 15)  and doct_no = 999999`;
    let query2 = `select * from sr_master where sr_cd = ${reqData.SR_CODE}`;

    let responseArray = [];
    let response = await this.orDao.oDBQueryService(query);
    let response1 = await this.orDao.oDBQueryService(query1);
    let response2 = await this.orDao.oDBQueryService(query2);

    responseArray = responseArray.concat(response,response1);
    responseArray.sort((a, b) => {
        let dateA = new Date(a.TIME_STAMP.split('-').reverse().join('-'));
        let dateB = new Date(b.TIME_STAMP.split('-').reverse().join('-'));
        return dateA - dateB;
    });
    const imagePath = path.join(__dirname, `../../logos/AP_logo.png`);
    const data = fs.readFileSync(imagePath , {encoding : 'base64'});
    const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
    <h2 style="margin:10px 0;font-family: "Poppins", sans-serif;">REGISTRATIONS & STAMPS DEPARTMENT</h2>
<h3 style="margin:10px 0;font-family: "Poppins", sans-serif;">GOVERNMENT OF ANDHRA PRADESH</h3>
<div style="display: flex; justify-content: space-between">
<div>
<h3 style="margin:0px; margin-top : 15px">SUB REGISTER OFFICE: ${response2[0].SR_NAME} (${reqData.SR_CODE})</h3>
</div>
<div>
<h3>ACCOUNT REPORT-B -FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h3></div>
</div>
    <table style="font-size: 9px; width: 100%;">
        <thead>
            <tr style="background-color: #274C77; color: white;">
                <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl; display: table-cell; text-align: center; transform: rotate(180deg); word-break: break-all;">S.No.</th>
                <th rowSpan="2" style="text-align: center">Date</th>
                <th rowSpan="2" style="text-align: center">Book</th>
                <th rowSpan="2" style="text-align: center">Year</th>
                <th rowSpan="2" style="text-align: center">Document</th>
                <th rowSpan="2" style="text-align: center">For the Purpose</th>
                <th rowSpan="2" style="text-align: center">Amount</th>
                <th rowSpan="2" style="text-align: center">Date of Completion</th>
                <th rowSpan="2" style="text-align: center">Cross Reference</th>
            </tr>
        </thead>
        <tbody>
            ${responseArray.map((items, index) => `
            <tr key=${items.TIME_STAMP}>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; border-left: 1px solid #000;">${index + 1}</td>
                <td style="width: 100px; border-right: 1px solid #000; border-bottom: 1px solid #000">${items.TIME_STAMP}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOCT_NO === 999999 ? "-" : items.BOOK_NO}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOCT_NO === 999999 ? "-" : items.REG_YEAR}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOCT_NO === 999999 ? "-" : items.DOCT_NO}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.ACC_DESC}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.AMOUNT}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOC_HANDOVER_TIME === null ? '-' : items.DOC_HANDOVER_TIME}</td>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;"></td>
            </tr>`).join('')}
        </tbody>
    </table>
</div>
<div style="margin: 10px; margin-right: 10px; margin-left: 10px;"></div>
    `;

    const pdfBuffer = await this.generatePDFFromHTML(html,response2[0].SR_CD,response2[0].SR_NAME,reqData.FROM_DATE,reqData.TO_DATE,"B");
    const base64Pdf = pdfBuffer.toString('base64');

    return { pdf: base64Pdf };
  } catch (ex) {
    Logger.error("accountHandler - getReport1 || Error :", ex);
    console.error("accountaccountHandler - getReport1 || Error :", ex);
    throw constructCARDError(ex);
  }
}

getReport1PdfGenerateC = async (reqData) => {

  try {
    let query = `
        SELECT b.*,TO_CHAR(TRUNC(a.time_stamp), 'DD-MM-YYYY') AS time_stamp
        FROM tran_major a
        JOIN cash_det b ON a.sr_code = b.sr_code
                        AND a.book_no = b.book_no
                        AND a.reg_year = b.reg_year
                        AND a.doct_no = b.doct_no
        WHERE a.rdoct_no IS NOT NULL and a.sr_code = ${reqData.SR_CODE}
          AND TRUNC(a.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'dd-mm-yyyy') AND TO_DATE('${reqData.TO_DATE}', 'dd-mm-yyyy')
          AND b.chargeable_value != 0
          AND b.stock_holding_id IS NULL
          AND b.echallan_no IS NULL
        `;
        let query1 = `select * from sr_master where sr_cd = ${reqData.SR_CODE}`;
    // let responseArray = [];
    let response = await this.orDao.oDBQueryService(query);
    let response1 = await this.orDao.oDBQueryService(query1);
    // responseArray = responseArray.concat(response,response1);
    // responseArray.sort((a, b) => {
    //     let dateA = new Date(a.TIME_STAMP.split('-').reverse().join('-'));
    //     let dateB = new Date(b.TIME_STAMP.split('-').reverse().join('-'));
    //     return dateA - dateB;
    // });
    const imagePath = path.join(__dirname, `../../logos/AP_logo.png`);
    const data = fs.readFileSync(imagePath , {encoding : 'base64'});
    const html = `<div style="text-align: center; margin:20px; margin-top:0;">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
    <h2 style="margin:10px 0;font-family: "Poppins", sans-serif;">REGISTRATIONS & STAMPS DEPARTMENT</h2>
<h3 style="margin:10px 0;font-family: "Poppins", sans-serif;">GOVERNMENT OF ANDHRA PRADESH</h3>
<div style="display: flex; justify-content: space-between">
<div>
<h3 style="margin:0px; margin-top: 15px;">SUB REGISTER OFFICE: ${response1[0].SR_NAME} (${reqData.SR_CODE})</h3>
</div>
<div>
<h3>ACCOUNT REPORT-C -FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h3></div>
</div>
<table style="font-size: 9px; width: 100% ">
<thead>
    <tr style="background-color: #274C77; color: white;">
    <th rowSpan="2" style="width: 0% !important; writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">S.No.</th>
    <th rowSpan="2" style="text-align: center">Date</th>
    <th rowSpan="2" style="text-align: center">Particulars of Receipts Including No.of applications Document with year etc., </th>
    <th rowSpan="2" style="text-align: center">Amount </th>
    <th rowSpan="2" style="text-align: center">Others Receipts </th>
    <th rowSpan="2" style="text-align: center">Cross Reference </th>
    </tr>
</thead>
      <tbody>
      ${response
        .map(
          (items, index) => `
          <tr key=${items.TIME_STAMP}>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; border-left: 1px soild #000">${index + 1}</td>
          <td style="width: 100px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TIME_STAMP}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;text-align: center">${items.DOCT_NO} / ${items.REG_YEAR}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; text-align:">${items.CHARGEABLE_VALUE}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.RCPTNO}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
          </tr>
          `
        )
        .join('')}
        <tr style="font-weight: ; background-color: #f0f0f0;">
      <td colspan="3" style="text-align: right;">Total:</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${response.reduce((sum, item) => sum + parseFloat(item.CHARGEABLE_VALUE || 0), 0)}</td>
      <td colspan="2" ></td>
    </tr>
      </tbody>
    </table>
    </div>
     <div style="margin : 10px; margin-right:10px; margin-left:10px;" >
     </div>
    `;

    const pdfBuffer = await this.generatePDFFromHTML(html,response[0].SR_CODE,response1[0].SR_NAME,reqData.FROM_DATE,reqData.TO_DATE,"C");
    const base64Pdf = pdfBuffer.toString('base64');

    return { pdf: base64Pdf };
  } catch (ex) {
    Logger.error("accountHandler - getReport1 || Error :", ex);
    console.error("accountaccountHandler - getReport1 || Error :", ex);
    throw constructCARDError(ex);
  }
}

getReport1PdfGenerateD = async (reqData) => {

  try {
    let query = `select t1.request_no,TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') as time_stamp, t2.name, TO_CHAR(TRUNC(t2.start_date), 'DD-MM-YYYY') as start_date, TO_CHAR(TRUNC(t2.end_date), 'DD-MM-YYYY') as end_date, t3.bankamount, t2.hlp_dn_yr from srouser.public_ec_status t1
      join nec_qry t2 on t1.request_no = t2.slno
      left join scanuser.echallan_trans t3 on t1.request_no = t3.depttransid
      where t1.sr_code =${reqData.SR_CODE} and TRUNC(t1.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'dd-mm-yyyy') AND TO_DATE('${reqData.TO_DATE}', 'dd-mm-yyyy') and t1.status is not null and t1.status != 'S' and t3.bankamount is not null`;
      
      let query1 = `select * from srouser.public_cc_status where sr_code ='${reqData.SR_CODE}' and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and status = 'RD'`;

      let query2 = `SELECT 
      a.*,
      b.party_name
  FROM 
      SROUSER.CASH_PAID a
  JOIN 
      CASH_DET b 
  ON 
      a.sr_code = b.sr_code 
      AND a.book_no = b.book_no 
      AND a.reg_year = b.reg_year 
       and a.c_receipt_no = b.c_receipt_no
  WHERE 
      a.doct_no = 999999 
      AND a.sr_code = ${reqData.SR_CODE}
      AND TRUNC(a.receipt_date) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY')
      and a.account_code = 36`;
      let query3 = `select * from sr_master where sr_cd = ${reqData.SR_CODE}`;

    // let responseArray = [];
    let response = await this.orDao.oDBQueryService(query);
    let response1 = await this.orDao.oDBQueryService(query1);
    let response2 = await this.orDao.oDBQueryService(query2);
    let response3 = await this.orDao.oDBQueryService(query3);

    console.log(response3);


    // responseArray = responseArray.concat(response,response1);
    // responseArray = responseArray.concat(responseArray,response2);
    // console.log(responseArray,'*****************************');
    // console.log(response,response1,response2,"****************************************")
    // responseArray.sort((a, b) => {
    //     let dateA = new Date(a.TIME_STAMP.split('-').reverse().join('-'));
    //     let dateB = new Date(b.TIME_STAMP.split('-').reverse().join('-'));
    //     return dateA - dateB;
    // });
    const imagePath = path.join(__dirname, `../../logos/AP_logo.png`);
    const data = fs.readFileSync(imagePath , {encoding : 'base64'});
    const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
    <h2 style="margin:10px 0;font-family: "Poppins", sans-serif;">REGISTRATIONS & STAMPS DEPARTMENT</h2>
<h3 style="margin:10px 0;font-family: "Poppins", sans-serif;">GOVERNMENT OF ANDHRA PRADESH</h3>
<div style="display: flex; justify-content: space-between">
<div>
<h3 style="margin:0px; margin-top: 15px;">SUB REGISTER OFFICE: ${response3[0].SR_NAME} (${reqData.SR_CODE})</h3>
</div>
<div>
<h3>ACCOUNT REPORT-D -FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h3></div>
</div>
<table style="font-size: 9px">
    <thead>
        <tr style="background-color: #274C77; color: white;">
            <th rowspan="2" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all;">S.No.</th>
            <th rowspan="2" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all;">Date:</th>
            <th colspan="3" style="text-align: center">Serial number of Application</th>
            <th rowspan="2" style="text-align: center; padding: 2px; width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all;">Year of which the records<br>are to be searched</th>
            <th rowspan="2" style="text-align: center; padding: 2px; width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all;">Particulars regarding Application</th>
            <th colspan="2" style="text-align: center; padding: 2px;">Fees paid for Application</th>
            <th colspan="2" style="text-align: center; padding: 2px;">Fees paid for</th>
            <th rowspan="2" style="text-align: center; padding: 2px; width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all;">User Charges</th>
            <th rowspan="2" style="text-align: center; padding: 2px; width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all;">Date of dispatch to<br>other Registration Officers</th>
            <th rowspan="2" style="text-align: center; padding: 2px; width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all;">Date of completion of search</th>
            <th colspan="4" style="text-align: center">Date</th>
            <th rowspan="2" style="text-align: center; padding: 2px;">Value of Stamp with<br>the original was Chargeable</th>
            <th rowspan="2" style="text-align: center; padding: 2px;">Value of Stamp Paper Produced</th>
            <th colspan="3" style="text-align: center; padding: 2px;">Date on which copy or<br>encumbrance certificate</th>
            <th rowspan="2" style="text-align: center; padding: 2px;">Reference to Previous<br>or Subsequent Year</th>   

            
        </tr>
       
        <tr style="background-color: #274C77; color: white;">
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">General search</th>
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Single search</th>
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Copy</th>
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Involving searches</th>
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Not involving searches</th>
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Searches</th>
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Copies</th>
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Document book and year to<br>which to search of copy relates<br>or number of encumbrance certificate</th>
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Official for stamp and paper or for<br>additional fees or for reconciliation<br>of discrepancy in ownership for<br>amendment of application</th>     
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Fixed for compliance with<br>the call in column (12)</th>        
            <th rowspan="1" style="width: 0%; writing-mode: tb-rl; text-align: center; transform: rotate(180deg); word-break: break-all; padding: 2px;">Of production of stamp and paper<br>or payment of additional fees or<br>compliance or refusal to comply<br>which call in column (12)</th>        
            <th rowspan="2" style="padding: 2px;">Made Ready-Office Copy</th>
            <th rowspan="2" style="padding: 2px;">Made Ready-Fair or Final Copy</th>   
            <th rowspan="2" style="padding: 2px;">Delivered or despatched by post</th>

            </tr>
            <tr>
            
            </tr>         
    </thead>

    <tbody>

    ${response
      .map(
        (items, index) => `
      <tr key=${items.TIME_STAMP}>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; border-left: 1px soild #000">${index + 1}</td>
        <td style="width: 100px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TIME_STAMP}</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.REQUEST_NO}</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.START_DATE).format('YYYY')}</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.NAME}</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.BANKAMOUNT}</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">20/-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TIME_STAMP}</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">20/-</td> 
        <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TIME_STAMP}</td>
        <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TIME_STAMP}</td>
        <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TIME_STAMP}</td>
            <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TIME_STAMP}</td>
            </tr>
`
)
.join('')}

${response1
  .map(
    (items, index) => `
  <tr key=${moment(items.TIME_STAMP).format('DD-MM-YYYY')}>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; border-left: 1px soild #000">${index + 1}</td>
    <td style="width: 100px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format('DD-MM-YYYY')}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.APP_ID}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format('YYYY')}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.REQUESTED_BY}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">200/-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">20/-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format('DD-MM-YYYY')}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.DOCT_NO}/${items.REG_YEAR}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">20/-</td>
    <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format('DD-MM-YYYY')}</td>
    <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format('DD-MM-YYYY')}</td>
          <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format('DD-MM-YYYY')}</td>
        <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.TIME_STAMP).format('DD-MM-YYYY')}</td>
        </tr>
`
)
.join('')}

${response2
  .map(
    (items, index) => `
  <tr key=${moment(items.TIME_STAMP).format('DD-MM-YYYY')}>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; border-left: 1px soild #000">${index + 1}</td>
    <td style="width: 100px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.RECEIPT_DATE).format('DD-MM-YYYY')}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.C_RECEIPT_NO}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.RECEIPT_DATE).format('YYYY')}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.PARTY_NAME}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.AMOUNT}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">20/-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.RECEIPT_DATE).format('DD-MM-YYYY')}</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">-</td>
    <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">20/-</td>
    <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.RECEIPT_DATE).format('DD-MM-YYYY')}</td>
    <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.RECEIPT_DATE).format('DD-MM-YYYY')}</td>
          <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.RECEIPT_DATE).format('DD-MM-YYYY')}</td>
        <td rowspan="1" style="padding: 2px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${moment(items.RECEIPT_DATE).format('DD-MM-YYYY')}</td>
        </tr>
`
)
.join('')}
<tr style="font-weight: ; background-color: #f0f0f0;">
    <td colspan="7" style="text-align: right;">Total:</td>
    <td>-</td>
     <td>-</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">
  ${response.reduce((sum, item) => sum + parseFloat(item.BANKAMOUNT) || 0, 0) +
    (response1.length > 0 ? 0 : 0) +
      response2.reduce((sum, item) => sum + parseFloat(item.AMOUNT) || 0, 0)}
</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">
  ${(response.length > 0 ? 0 : 0) +
    (response1.length > 0 ? 200 : 0) +
    (response2.length > 0 ? 0 : 0)}
</td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">
  ${(response.length > 0  ? 20 : 0) +
    (response1.length > 0 ? 20 : 0) +
    (response2.length > 0 ? 20 : 0)}
</td>
    <td colspan="7" ></td>
<td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">
  ${(response.length > 0 ? 20 : 0) +
    (response1.length > 0 ? 20 : 0) +
    (response2.length > 0 ? 20 : 0)}
</td>
<td colspan="4" ></td>
  </tr>

    </tbody>
    
</table>

    </div>
     <div style="margin : 10px; margin-right:10px; margin-left:10px;" >
     </div>
    `;
    const pdfBuffer = await this.generatePDFFromHTML(html,response3[0].SR_CD,response3[0].SR_NAME,reqData.FROM_DATE,reqData.TO_DATE,"D");
    const base64Pdf = pdfBuffer.toString('base64');

    return { pdf: base64Pdf };
  } catch (ex) {
    Logger.error("tdAllocationHandler - getReport1 || Error :", ex);
    console.error("tdAllocationtdAllocationHandler - getReport1 || Error :", ex);
    throw constructCARDError(ex);
  }
}

getReport1PdfGenerateMin = async (reqData) => {

  try {
    let query = `select t1.sr_code, t1.book_no, t1.doct_no, t1.reg_year, TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp, t2.p_number, t1.rdoct_no, t2.pending_remarks,t2.release_remarks from tran_major t1
            join srouser.tran_pending t2 on t1.sr_code = t2.sr_code and 
            t1.book_no = t2.book_no and
            t1.reg_year = t2.reg_year and 
            t1.doct_no = t2.doct_no
            WHERE 
            trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
                        AND
                            t1.sr_code = ${reqData.SR_CODE} and t1.rdoct_no is not null order by t1.time_stamp`;
    let query1 = `select * from sr_master where sr_cd = ${reqData.SR_CODE}`;

                            
    let response = await this.orDao.oDBQueryService(query);
    let response1 = await this.orDao.oDBQueryService(query1);
    const imagePath = path.join(__dirname, `../../logos/AP_logo.png`);
    const data = fs.readFileSync(imagePath , {encoding : 'base64'});
    const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
    <h2 style="margin:10px 0;font-family: "Poppins", sans-serif;">REGISTRATIONS & STAMPS DEPARTMENT</h2>
<h3 style="margin:10px 0;font-family: "Poppins", sans-serif;">GOVERNMENT OF ANDHRA PRADESH</h3>
<div style="display: flex; justify-content: space-between">
<div>
<h3 style="margin:0px; margin-top: 15px;">SUB REGISTER OFFICE: ${response1[0].SR_NAME} (${reqData.SR_CODE})</h3>
</div>
<div>
<h3>MINUTE BOOK -FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h3></div>
</div>
<table style="width: 100%;font-size: 9px">
<thead>
    <tr style="background-color: #274C77; color: white;">
      <th rowSpan="2" style="text-align: center">S.No.</th>
      <th rowSpan="2" style="text-align: center">Date</th>             
      <th rowSpan="2" style="text-align: center">Number and <br />Date of presence<br /> Of Doct,</th>
      <th rowSpan="2" style="text-align: center">Pending No</th>
      <th rowSpan="2" style="text-align: center">Assigning No</th>
      <th rowSpan="2" style="text-align: center">Reason for Pending</th>
      <th rowSpan="2" style="text-align: center">Reference to<br />Final disposal</th>
    </tr>
</thead>
      <tbody>
      ${response
        .map(
          (item, index) => `
          <tr key=${item.TIME_STAMP}>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; border-left: 1px soild #000">${index + 1}</td>
              <td style="width: 100px; border-right: 1px solid #000; border-bottom: 1px solid #000;">${item.TIME_STAMP}</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${item.DOCT_NO}</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${item.P_NUMBER}</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${item.RDOCT_NO}</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${item.PENDING_REMARKS === null ? '-' : item.PENDING_REMARKS}</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">${item.RELEASE_REMARKS === null ? '-' : item.RELEASE_REMARKS}</td>
          </tr>
          `
        )
        .join('')}
      </tbody>
    </table>
    </div>
     <div style="margin : 10px; margin-right:10px; margin-left:10px;" >
     </div>
    `;

    const pdfBuffer = await this.generatePDFFromHTML(html,response[0].SR_CODE,response1[0].SR_NAME,reqData.FROM_DATE,reqData.TO_DATE,"MINUTE BOOK");
    const base64Pdf = pdfBuffer.toString('base64');

    return { pdf: base64Pdf };
  } catch (ex) {
    Logger.error("accountHandler - getReport1 || Error :", ex);
    console.error("accountaccountHandler - getReport1 || Error :", ex);
    throw constructCARDError(ex);
  }
}

getReport1PdfGenerateG = async (reqData) => {

  try {
    console.log(reqData);
    const dataArray = JSON.parse(reqData.dataArray)
    console.log(dataArray);
    let query=`SELECT 
           CASE WHEN GROUPING_ID(TO_CHAR(TRUNC(E.E_DATE), 'DD-MM-YYYY'), TO_CHAR(TRUNC(SYSDATE), 'DD-MM-YYYY')) = 3 
           THEN 'Total'
         ELSE TO_CHAR(TRUNC(E.E_DATE), 'DD-MM-YYYY')
           END AS ADMITTED_DATE,
         NVL(SUM(ADMITTEDTOREGISTRATION), 0) AS ADMITTEDTOREGISTRATION,
         NVL(SUM(Total), 0) AS Total,
         NVL(SUM(Scanned), 0) AS Scanned,
         NVL(SUM(Unscanned), 0) AS Unscanned,
         NVL(SUM(Returned), 0) AS Returned,
         NVL(SUM(Uncclaimed), 0) AS Uncclaimed,
         NVL(SUM(Pending), 0) AS Pending,
         NVL(SUM(To_be_Prepared_EC), 0) AS To_be_Prepared_EC,
         NVL(SUM(Prepared_EC), 0) AS Prepared_EC,
         NVL(SUM(EC_Unclaimed), 0) AS EC_Unclaimed,
         NVL(SUM(To_be_Prepared_CC), 0) AS To_be_Prepared_CC,
         NVL(SUM(Prepared_CC), 0) AS Prepared_CC,
         NVL(SUM(CC_Unclaimed), 0) AS CC_Unclaimed
     FROM (SELECT DISTINCT D.E_DATE 
         FROM tran_major D 
         WHERE D.SR_CODE = ${reqData.SR_CODE} AND D.E_DATE BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY')) E
     LEFT JOIN (
           SELECT A.TIME_STAMP,
         COUNT(CASE WHEN A.DOC_ACC='Y' THEN 1 END) AS ADMITTEDTOREGISTRATION,
         COUNT(CASE WHEN A.DOC_ASSIGN='Y' THEN 1 END) AS Total,
         COUNT(CASE WHEN A.DOC_BUNDLE='Y' THEN 1 END) AS Scanned,
         COUNT(CASE WHEN A.DOC_BUNDLE='N' AND A.DOC_ASSIGN='Y'  THEN 1 END) AS Unscanned,
         COUNT(CASE WHEN A.DOC_HANDOVER='Y' THEN 1 END) AS Returned,
         COUNT(CASE WHEN A.DOC_HANDOVER='N' and A.DOC_BUNDLE='Y' THEN 1 END) AS Uncclaimed,
         COUNT(CASE WHEN A.DOC_PEND='Y' THEN 1 END) AS Pending
     FROM pde_doc_status_cr A
         WHERE A.TIME_STAMP BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY') AND A.SR_CODE = ${reqData.SR_CODE}
         GROUP BY A.TIME_STAMP) T ON TRUNC(E.E_DATE) = TRUNC(T.TIME_STAMP)
     LEFT JOIN (
         SELECT C.TIME_STAMP,
          SUM(NVL(CASE WHEN  C.STATUS IS NOT NULL THEN 1 ELSE 0 END, 0)) AS To_be_Prepared_EC,
          SUM(NVL(CASE WHEN C.STATUS='E'  AND C.ESIGN_TRANS_ID IS NOT NULL THEN 1 ELSE 0 END, 0)) AS Prepared_EC,
          SUM(NVL(CASE WHEN C.ESIGN_TRANS_ID IS NULL  THEN 1 ELSE 0 END, 0)) AS EC_Unclaimed
     FROM srouser.public_ec_status C
         WHERE C.TIME_STAMP BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY') AND C.SR_CODE = ${reqData.SR_CODE}
         GROUP BY C.TIME_STAMP) U ON TRUNC(E.E_DATE) = TRUNC(U.TIME_STAMP)
     LEFT JOIN (
         SELECT D.TIME_STAMP,
         SUM(NVL(CASE WHEN D.STATUS IS NOT NULL THEN 1 ELSE 0 END, 0)) AS To_be_Prepared_CC,
         SUM(NVL(CASE WHEN D.STATUS='RD' THEN 1 ELSE 0 END, 0)) AS Prepared_CC,
         SUM(NVL(CASE WHEN D.STATUS!='RD'  THEN 1 ELSE 0 END, 0)) AS CC_Unclaimed
     FROM srouser.public_cc_status D
         WHERE D.TIME_STAMP BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY') AND D.SR_CODE = ${reqData.SR_CODE}
         GROUP BY D.TIME_STAMP) V ON TRUNC(E.E_DATE) = TRUNC(V.TIME_STAMP)
         GROUP BY GROUPING SETS (
         (TO_CHAR(TRUNC(E.E_DATE), 'DD-MM-YYYY'), TO_CHAR(TRUNC(SYSDATE), 'DD-MM-YYYY')),())ORDER BY ADMITTED_DATE`;

         let query1 = `select * from sr_master where sr_cd = ${reqData.SR_CODE}`;


    let response = await this.orDao.oDBQueryService(query);
    let response1 = await this.orDao.oDBQueryService(query1);

    const imagePath = path.join(__dirname, `../../logos/AP_logo.png`); 
    const data = fs.readFileSync(imagePath , {encoding : 'base64'});
    const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
    <h2 style="margin:10px 0;font-family: "Poppins", sans-serif;">REGISTRATIONS & STAMPS DEPARTMENT</h2>
<h3 style="margin:10px 0;font-family: "Poppins", sans-serif;">GOVERNMENT OF ANDHRA PRADESH</h3>
<div style="display: flex; justify-content: space-between">
<div>
<h3 style="margin:0px; margin-top: 15px;">SUB REGISTER OFFICE: ${response1[0].SR_NAME} (${reqData.SR_CODE})</h3>
</div>
<div>
<h3>ACCOUNT REPORT-G -FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h3></div>
</div>
    <table style="width: 100%; border: 1px solid #000; margin-top: 10px; margin-bottom:0; font-size: 9px">
    <thead style="background-colour: blue;">
        <tr style="background-color: #274C77; color: white;">
          <th rowSpan="2" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">S.No.</th>
          <th rowSpan="2" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Date</th>
          <th rowSpan="2" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Admitted to Registration</th>
          <th colSpan="2" style="text-align: center">Scanned and made ready for return</th>
          <th rowSpan="2" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Un Scanned</th>
          <th rowSpan="2" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Returned</th>
          <th rowSpan="2" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Un Claimed</th>
          <th rowSpan="2" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Pending</th>
          <th rowSpan="2" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">power of Attorney attested 
          <br />remaining unclaimed</th>
          <th colSpan="3" style="width: 190px; text-align: center">Certified Copies</th>
          <th colSpan="3" style="text-align: center">Encumbrance Certificates</th>
          <th rowSpan="4" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Record Holding</th>
          <th rowSpan="4" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Non Record Holding</th>
          <th rowSpan="4" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Initial of Registering Officer</th>
          <th rowSpan="4" style="text-align: center;width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Remarks</th>
        </tr>
        <tr style="background-color: #274C77; color: white;">
          <th style="width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Total</th>
          <th style="width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Scanned</th>
          <th style="width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">To be Prepared</th>
          <th style="width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Prepared</th>
          <th style="width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Unclaimed</th>
          <th style="width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">To be Prepared</th>
          <th style="width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Prepared</th>
          <th style="width: 0% !important;writing-mode: tb-rl;display: table-cell;text-align: center;transform: rotate(180deg);word-break: break-all;">Unclaimed</th>
        </tr>
</thead>
      <tbody>
      ${dataArray
        .map(
          (items, index) => `
          <tr key=${items.TIME_STAMP}>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; border-left: 1px soild #000">${items.slNo}</td>
              <td style="width: 100px; verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.second}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.third}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.fourth}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.fifth}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.sixth}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.seventh}</td>                    
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.eighth}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.ninth}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.tenth1}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.slNo1}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.second2}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.third3}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.fourth4}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.fifth5}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.sixth6}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.seventh7}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.eighth8}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.ninth9}</td>
              <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.tenth}</td>
          </tr> 
          `
        )
        .join('')}
      </tbody>
    </table>
    </div>
     <div style="margin : 10px; margin-right:10px; margin-left:10px;" >
     </div>
    `;

    const pdfBuffer = await this.generatePDFFromHTML(html,response1[0].SR_CD,response1[0].SR_NAME,reqData.FROM_DATE,reqData.TO_DATE,"G");
    const base64Pdf = pdfBuffer.toString('base64');

    return { pdf: base64Pdf };
  } catch (ex) {
    Logger.error("accountHandler - getReport1 || Error :", ex);
    console.error("accountaccountHandler - getReport1 || Error :", ex);
    throw constructCARDError(ex);
  }
}

getReport1PdfGenerateH = async (reqData) => {

  try {
    console.log(reqData);
    const dataArray = JSON.parse(reqData.dataArray)
    console.log(dataArray);
    let query = `SELECT 
      
    TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp,  

    t1.sr_code, 

    SUM(t1.sd_payable) as sd_payable,

    SUM(t1.td_payable) as td_payable,

    sum(t1.rf_payable) as rf_payable,

    count(*) as count

FROM 

    tran_major t1

WHERE 

    t1.time_stamp BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd')

    AND t1.sr_code =${reqData.SR_CODE} and t1.rdoct_no is not null

GROUP BY 

TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY'),

    t1.sr_code`;

let query1 = `SELECT time_stamp, sum(total_amount) as total_amount
FROM (
    SELECT  TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp, t4.amount as total_amount
    FROM tran_major t1
    JOIN cash_det t2 ON t1.sr_code = t2.sr_code AND
                         t1.book_no = t2.book_no AND
                         t1.reg_year = t2.reg_year AND 
                         t1.doct_no = t2.doct_no
    LEFT JOIN SROUSER.CASH_PAID t4 ON t1.sr_code = t4.sr_code AND
                                       t1.book_no = t4.book_no AND
                                       t1.reg_year = t4.reg_year AND 
                                       t1.doct_no = t4.doct_no
    LEFT JOIN srouser.tran_nomine t5 ON t1.sr_code = t5.sr_code AND
                                 t1.book_no = t5.book_no AND
                                 t1.reg_year = t5.reg_year AND 
                                 t1.doct_no = t5.doct_no
    WHERE TRUNC(t1.time_Stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}','yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}','yyyy-mm-dd')
          AND t1.sr_code = ${reqData.SR_CODE} AND t1.rdoct_no IS NOT NULL AND t5.doc_handover_time IS NOT NULL AND t4.account_code IN (12, 18, 19, 15)
    UNION ALL
    SELECT TO_CHAR(TRUNC(receipt_date), 'DD-MM-YYYY') AS time_stamp, amount as total_amount
    FROM SROUSER.CASH_PAID 
    WHERE sr_code = ${reqData.SR_CODE} AND 
          TRUNC(receipt_date) BETWEEN TO_DATE('${reqData.FROM_DATE}','yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}','yyyy-mm-dd') AND 
          account_code IN (12, 18, 19, 15) AND 
          doct_no = 999999
) 
GROUP BY          
 time_stamp

ORDER BY time_stamp`;    

let query2 =`SELECT time_stamp, SUM(chargeable_value) AS total_chargeable_value
FROM (
    SELECT b.*, TO_CHAR(TRUNC(a.time_stamp), 'DD-MM-YYYY') AS time_stamp
    FROM tran_major a
    JOIN cash_det b ON a.sr_code = b.sr_code
                    AND a.book_no = b.book_no
                    AND a.reg_year = b.reg_year
                    AND a.doct_no = b.doct_no
    WHERE a.rdoct_no IS NOT NULL 
        AND a.sr_code = ${reqData.SR_CODE}
        AND TRUNC(a.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd')
        AND b.chargeable_value != 0
        AND b.stock_holding_id IS NULL
        AND b.echallan_no IS NULL
) 
GROUP BY time_stamp`;

let query3=`SELECT 
time_stamp,
SUM(bank_amount) AS ec_amount,
SUM(count) AS cc_amount,
SUM(amount_1) AS single_search,
sum(user_charge_ec) as user_charge_ec,
sum(user_charge_cc) as user_charge_cc,
sum(user_charge_single) as user_charge_single
FROM (

SELECT 
    TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY') AS time_stamp, 
    SUM(t3.bankamount) AS bank_amount,
    NULL AS count,
    NULL AS amount_1,
    count(*) * 20 as user_charge_ec,
    null as user_charge_cc,
    null as user_charge_single
FROM 
    srouser.public_ec_status t1
JOIN 
    nec_qry t2 ON t1.request_no = t2.slno 
LEFT JOIN 
    scanuser.echallan_trans t3 ON t1.request_no = t3.depttransid
WHERE 
    t1.sr_code = ${reqData.SR_CODE} 
    AND TRUNC(t1.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd') 
    AND t1.status IS NOT NULL
    AND t1.status != 'S' 
    AND t3.bankamount IS NOT NULL
GROUP BY 
    TO_CHAR(TRUNC(t1.time_stamp), 'DD-MM-YYYY')
UNION ALL
SELECT 
    TO_CHAR(TRUNC(time_stamp), 'DD-MM-YYYY') AS time_stamp, 
    NULL AS bank_amount,
    COUNT(*) * 200 AS count,
    NULL AS amount_1,
    null as user_charge_ec,
    count(*) * 20 as user_charge_cc,
    null as user_charge_single
FROM 
    srouser.public_cc_status 
WHERE 
    sr_code = ${reqData.SR_CODE}
    AND TRUNC(time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd') 
    AND status = 'RD'
GROUP BY 
    TO_CHAR(TRUNC(time_stamp), 'DD-MM-YYYY')
UNION ALL
SELECT 
    TO_CHAR(TRUNC(receipt_date), 'DD-MM-YYYY') AS time_stamp, 
    NULL AS bank_amount,
    NULL AS count,
    SUM(amount) AS amount_1,
    null as user_charge_ec,
    null as user_charge_cc,
    count(*) * 20 as user_charge_single
FROM 
    SROUSER.CASH_PAID 
WHERE 
    doct_no = 999999 
    AND sr_code = ${reqData.SR_CODE}
    AND TRUNC(receipt_date) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'yyyy-mm-dd') AND TO_DATE('${reqData.TO_DATE}', 'yyyy-mm-dd')
    AND account_code = 36
GROUP BY 
    TO_CHAR(TRUNC(receipt_date), 'DD-MM-YYYY')
)

GROUP BY 
time_stamp
ORDER BY 
time_stamp`;

let query4 = `select * from sr_master where sr_cd = ${reqData.SR_CODE}`;


// let response = await this.orDao.oDBQueryService(query);
// let response1 = await this.orDao.oDBQueryService(query1);
// let response2 = await this.orDao.oDBQueryService(query2);
// let response3 = await this.orDao.oDBQueryService(query3);
let response4 = await this.orDao.oDBQueryService(query4);
let hmrrevenue = [];
let smrrevenue = [];
// const combinedArray = [...response, ...response1, ...response2,...response3, ...hmrrevenue, ...smrrevenue];

    const imagePath = path.join(__dirname, `../../logos/AP_logo.png`); 
    const data = fs.readFileSync(imagePath , {encoding : 'base64'});
    const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
    <h2 style="margin:10px 0;font-family: "Poppins", sans-serif;">REGISTRATIONS & STAMPS DEPARTMENT</h2>
<h3 style="margin:10px 0;font-family: "Poppins", sans-serif;">GOVERNMENT OF ANDHRA PRADESH</h3>
<div style="display: flex; justify-content: space-between">
<div>
<h3 style="margin:0px; margin-top: 15px;">SUB REGISTER OFFICE: ${response4[0].SR_NAME} (${reqData.SR_CODE})</h3>
</div>
<div>
<h3>ACCOUNT REPORT-H -FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h3></div>
</div>
    <table style="width: 100%; border: 1px solid #000; margin-top: 10px; margin-bottom:0;font-size: 9px">
    <thead style="background-colour: blue;">
        <tr style="background-color: #274C77; color: white;">
        <th rowSpan="4" style="text-align: center">S.No.</th>
        <th rowSpan="4" style="text-align: center">Date</th>
        <th colSpan="3" style="text-align: center">Account A</th>
        <th rowSpan="4" style="text-align: center">Account B</th>
        <th rowSpan="4" style="text-align: center">Account C</th>
        <th colSpan="2" style="text-align: center"> Account D</th>
        <th rowSpan="4" style="text-align: center">HMR</th>
        <th rowSpan="4" style="text-align: center">SMR</th>
        <th rowSpan="4" style="text-align: center">Non-Judicial Stamps</th>
        <th rowSpan="4" style="text-align: center">Judicial Stamps</th>
        <th rowSpan="4" style="text-align: center">Court Fee Stamps</th>
        <th rowSpan="4" style="text-align: center">Total</th>
        <th rowSpan="4" style="text-align: center">Transfer Duty</th>
        <th rowSpan="4" style="text-align: center">No.of Documents</th>
        <th rowSpan="4" style="text-align: center;">Total Revenue</th>
        </tr>
        <tr style="background-color: #274C77; color: white;">
        <th rowSpan="2" style="text-align: center">SD</th>
        <th rowSpan="2" style="text-align: center">RF</th>
        <th rowSpan="2" style="text-align: center">UC</th>
        <th rowSpan="2" style="text-align: center">Fee</th>
        <th rowSpan="2" style="text-align: center">UC</th>
        </tr>
</thead>
<tbody>
${dataArray
  .map(
    (items, index) => `
          <tr key=${items.TIME_STAMP}>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; border-left: 1px soild #000">${items.sno}</td>
          <td style="width: 100px; verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.date}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.SD}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.RF}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.UC}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.accountB}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.accountC}</td> 
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.fee}</td>                   
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.uc}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.HMR}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.SMR}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.NonJudicialStamps}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.JudicialStamps}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.CourtFeeStamps}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.total}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.TransferDuty}</td>
          <td style="verticalAlign: middle;border-right: 1px solid #000; border-bottom: 1px solid #000;">${items.NoofDocuments}</td>
          <td style="verticalAlign: middle;border-bottom: 1px solid #000;">${items.totalrevenue}</td>
          </tr>
    `
  )
  .join('')}
</tbody>
    </table>
    </div>
     <div style="margin : 10px; margin-right:10px; margin-left:10px;" >
     </div>
    `;

    const pdfBuffer = await this.generatePDFFromHTML(html,reqData.SR_CODE,response4[0].SR_NAME,reqData.FROM_DATE,reqData.TO_DATE,"H");
    const base64Pdf = pdfBuffer.toString('base64');

    return { pdf: base64Pdf };
  } catch (ex) {
    Logger.error("accountHandler - getReport1 || Error :", ex);
    console.error("accountaccountHandler - getReport1 || Error :", ex);
    throw constructCARDError(ex);
  }
}

}

module.exports = AccountServices;
