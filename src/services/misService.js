const OrDao = require("../dao/oracledbReadDao");
const OdbDao = require("../dao/oracledbDao");
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require("../../services/winston");
const fsone = require("fs");
const path = require("path");
const fs = require("fs").promises;
const { PDFDocument } = require("pdf-lib");
const pdfjsLib = require("pdfjs-dist");
const { encryptWithAESPassPhrase, encryptData, decryptData } = require("../utils/index");
const xl = require("excel4node");
const axios = require("axios");
const Esign = require('../services/esignService');
const { generatePDFFromHTML } = require("./generatePDFFromHTML");
const puppeteer = require("puppeteer");
const https = require('https');
const handlebars = require('handlebars');

let instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
  });
class MISServices {
  constructor() {
    this.orDao = new OrDao();
    this.odbDao = new OdbDao();
    this.esign = new Esign();
  }
  getMisDetailsSrvc = async (reqData) => {
    try {
      let query = `SELECT s.SR_NAME, c.sr_code AS sro_code FROM srouser.pde_doc_status_cr c JOIN CARD.sr_master s ON c.sr_code = s.sr_cd WHERE s.STATE_CD = '01' GROUP BY s.SR_NAME, c.sr_code`;
      const bindParams = {};
      let response = await this.odbDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error :", ex);
      console.error("MISServices - getMISDetails || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  getMisOracleSrvc(District, srocode, fromdate, todate, parameter) {
    try {
      const date = new Date(fromdate);
      const day = date.getDate();
      const month = date
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year = date.getFullYear().toString().slice(-2);
      const fromformattedDate = `${day}-${month}-${year}`;
      const date1 = new Date(todate);
      const day1 = date1.getDate();
      const month1 = date1
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year1 = date1.getFullYear().toString().slice(-2);
      const toformattedDate = `${day1}-${month1}-${year1}`;
      const bindParams = {
        fromdate: fromformattedDate,
        todate: toformattedDate,
        drcode: District
      };
      if (srocode === "") {
        const query = `
        SELECT tm.sr_code, sm.sr_name, COUNT(1) AS count FROM tran_major tm JOIN sr_master sm ON tm.sr_code = sm.sr_cd JOIN card.dr_master dm ON sm.dr_cd = dm.dr_cd WHERE dm.dr_cd= :drcode AND (tm.sr_code, tm.book_no, tm.doct_no, tm.reG_year) IN (SELECT sr_code, book_no, doct_no, reG_year FROM srouser.pde_doc_status_cr WHERE ${parameter} = 'Y') AND TRUNC(tm.time_stamp) BETWEEN :fromdate AND :todate GROUP BY tm.sr_code, sm.sr_name ORDER BY 2 DESC
        `;
        console.log("SQL Query:", query);
        let response = this.orDao.oDBQueryService(query, bindParams);
        return response;
      } else {
        const query = `
        SELECT tm.sr_code, sm.sr_name, COUNT(1) AS count FROM tran_major tm JOIN sr_master sm ON tm.sr_code = sm.sr_cd JOIN card.dr_master dm ON sm.dr_cd = dm.dr_cd WHERE dm.dr_cd = :drcode AND (tm.sr_code, tm.book_no, tm.doct_no, tm.reG_year) IN (SELECT sr_code, book_no, doct_no, reG_year FROM srouser.pde_doc_status_cr WHERE sr_code = :srocode AND ${parameter} = 'Y') AND TRUNC(tm.time_Stamp) BETWEEN :fromdate AND :todate GROUP BY tm.sr_code, sm.sr_name ORDER BY 2 DESC`;
        console.log("SQL Query:", query);
        const bindParamsWithSrocode = { ...bindParams, srocode: srocode, drcode: District};
        const response = this.orDao.oDBQueryService(
          query,
          bindParamsWithSrocode
        );
        return response;
      }
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  }

  getDrillDataSrvc(srocode, fromdate, todate, parameter) {
    try {
      const date = new Date(fromdate);
      const day = date.getDate();
      const month = date
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year = date.getFullYear().toString().slice(-2);
      const fromformattedDate = `${day}-${month}-${year}`;
      const date1 = new Date(todate);
      const day1 = date1.getDate();
      const month1 = date1
        .toLocaleString("default", { month: "short" })
        .toUpperCase();

      const year1 = date1.getFullYear().toString().slice(-2);
      const toformattedDate = `${day1}-${month1}-${year1}`;
      const bindParams = {
        fromdate: fromformattedDate,
        todate: toformattedDate,
        srocode: srocode,
      };
      const query = `SELECT sr_code,(select sr_name from sr_master where sr_cd=sr_code) as sr_name, book_no, doct_no, reg_year, rdoct_no, ryear FROM tran_major WHERE (sr_code, book_no, doct_no, reG_year) IN (
                SELECT sr_code, book_no, doct_no, reG_year
               FROM srouser.pde_doc_status_cr
                WHERE sr_code = :srocode AND ${parameter} = 'Y'
)
AND trunc(time_Stamp) BETWEEN :fromdate AND :todate
ORDER BY 1, 2, 3, 4 DESC`;

      const response = this.orDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  }

  getDrListDataSrvc() {
    try {
      let query = `SELECT DR_NAME, DR_CODE AS DR_CD From card.MST_REVREGDIST`;
      const bindParams = {};
      const response = this.orDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  }
  getanywhere = async (reqData) => {
    try {
      let query = ` SELECT
      p.sro_location,
      sm.sr_name,
      COUNT(se.id) AS count
      FROM
      PREREGISTRATION.pre_registration_cca p
      JOIN
      PREREGISTRATION.schedule_entry se ON p.id = se.id
      LEFT JOIN
      sr_master sm ON p.sro_location = sm.sr_cd
      JOIN
      card.dr_master pv ON sm.dr_cd = pv.dr_cd
      WHERE
      pv.dr_cd = NVL(:drcode, pv.dr_cd) AND p.sro_location = nvl(:srcode, p.sro_location)and (p.sro_location!=se.jurisdiction) and TRUNC(p.ENTRY_DATE) BETWEEN TO_DATE(:FDT,'YYYY-MM-DD') AND TO_DATE(:TDT,'YYYY-MM-DD')
      GROUP BY
      p.sro_location, sm.sr_name`;
      const bindParams = {
        drcode: reqData.District,
        srcode: reqData.srocode,
        FDT: reqData.fromdate,
        TDT: reqData.todate,
      };
      console.log(query, bindParams);
      const response = this.orDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  };

  getProhb = async (reqData) => {
    try {
      let query = `SELECT
      es.sr_code,
      ms.sr_name,
      COUNT(DISTINCT r.id) AS COUNT
      FROM
      srouser.prohb_audit_cr es
      JOIN
      pde_doc_status_cr d ON es.sr_code = d.sr_code
      AND es.app_id = d.app_id
      LEFT JOIN
      sr_master ms ON es.sr_code = ms.sr_cd
      RIGHT JOIN
      PREREGISTRATION.pre_registration_cca r ON d.app_id = r.id
      JOIN
      card.dr_master je ON ms.dr_cd = je.dr_cd  
      WHERE
      je.dr_cd = NVL(:drcode, je.dr_cd)
      AND NVL(es.sr_code, ms.sr_cd) = NVL(:srcode, NVL(es.sr_code, ms.sr_cd))
      AND TRUNC(es.TIMESTAMP) BETWEEN TO_DATE(:FDT, 'YYYY-MM-DD') AND TO_DATE(:TDT, 'YYYY-MM-DD')
      GROUP BY
      es.sr_code,
      ms.sr_name`;
      const bindParams = {
        drcode: reqData.District,
        srcode: reqData.srocode,
        FDT: reqData.fromdate,
        TDT: reqData.todate,
      };
      console.log(query, bindParams);
      const response = this.orDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  };
  getanyDrilDown = async (reqData) => {
    try {
      let query = `SELECT schedule.ID,schedule.pp_comments,schedule.mv_comments, (select sr_name from sr_master where sr_cd = schedule.jurisdiction) as jurisdiction_name,schedule.jurisdiction, sro_table.sr_name
      FROM PREREGISTRATION.schedule_entry schedule
      JOIN PREREGISTRATION.pre_registration_cca pre ON schedule.ID = pre.ID
      LEFT JOIN sr_master sro_table ON pre.SRO_LOCATION = sro_table.SR_CD
      WHERE pre.SRO_LOCATION = NVL(:SR_CODE, pre.sro_location)
      AND TRUNC(pre.ENTRY_DATE) BETWEEN TO_DATE(:FDT,'YYYY-MM-DD') AND TO_DATE(:TDT,'YYYY-MM-DD')and schedule.JURISDICTION != :SR_CODE`;
      const bindParams = {
        SR_CODE: reqData.srocode,
        FDT: reqData.fromdate,
        TDT: reqData.todate,
      };
      const response = this.orDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  };
  getProhbData = async (reqData) => {
    try {
      let query = `SELECT
      es.app_id,
      es.sr_code,
      ms.sr_name,
      es.JURISDICTION,
      es.reg_year,
      es.village_cd,
      MAX(p.HAB_NAME) AS village_name,
      es.survey_no,
      MAX(es.timestamp) AS timestamp,
      es.comments
      FROM
      srouser.prohb_audit_cr es
      JOIN
      pde_doc_status_cr d
      ON es.sr_code = d.sr_code
      AND es.app_id = d.app_id
      LEFT JOIN
      sr_master ms
      ON es.sr_code = ms.sr_cd
      LEFT JOIN
      hab_code p
      ON p.HAB_CODE = es.village_cd || '01'
      RIGHT JOIN
      PREREGISTRATION.pre_registration_cca r
      ON d.app_id = r.id
      WHERE
      es.sr_code = NVL(:srcode, es.sr_code)
      AND TRUNC(es.TIMESTAMP) BETWEEN TO_DATE(:FDT,'YYYY-MM-DD') AND TO_DATE(:TDT,'YYYY-MM-DD')
      GROUP BY
      es.sr_code,
      ms.sr_name,
      es.JURISDICTION,
      es.reg_year,
      es.village_cd,
      es.survey_no,
      es.comments,
      es.app_id`;
      const bindParams = {
        srcode: reqData.srocode,
        FDT: reqData.fromdate,
        TDT: reqData.todate,
      };
      const response = this.orDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  };
  getSROcodeListDataSrvc = async (parameter) => {
    try {
      let query = `select SR_CD, SR_NAME from sr_master where dr_cd='${parameter}'`;
      const bindParams = {};
      const response = this.orDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  }
  getMutationStatusSrvc = async (srocode, fromdate, todate, parameter) => {
    try {
      const date = new Date(fromdate);
      const day = date.getDate();
      const month = date
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year = date.getFullYear().toString().slice(-2);
      const fromformattedDate = `${day}-${month}-${year}`;
      const date1 = new Date(todate);
      const day1 = date1.getDate();
      const month1 = date1
        .toLocaleString("default", { month: "short" })
        .toUpperCase();
      const year1 = date1.getFullYear().toString().slice(-2);

      const toformattedDate = `${day1}-${month1}-${year1}`;
      let bindParams;
      let query;
      if (srocode === "") {
        bindParams = {
          fromdate: fromformattedDate,
          todate: toformattedDate,
        };
        query = `   select a.sr_code,sum(case when doc_mutation='N' then 1
      when doc_mutation='Y' then 0 end) as mut_pend_count,sum(case when doc_mutation='N' then 0
      when doc_mutation='Y' then 1 end) as mut_compl_count,count(1)  as count1
      from srouser.pde_doc_status_cr a where (sr_code,book_no,doct_no,reg_year) in
    (select distinct sr_code,book_no,doct_no,reg_year from SROUSER.WEBLAND_STATUS_SURV_CR  b
    where trunc(REG_TIMESTAMP) between :fromdate AND :todate
    union all
    select distinct sr_code,book_no,doct_no,reg_year from SROUSER.WEBLAND_STATUS_LPM_CR
    where trunc(REG_TIMESTAMP) between :fromdate AND :todate
    )
    group by a.sr_code
    order by a.sr_code`;
      } else {
        bindParams = {
          fromdate: fromformattedDate,
          todate: toformattedDate,
          srocode: srocode,
        };
        query = `   select a.sr_code,sum(case when doc_mutation='N' then 1
  when doc_mutation='Y' then 0 end) as mut_pend_count,sum(case when doc_mutation='N' then 0
  when doc_mutation='Y' then 1 end) as mut_compl_count,count(1)  as count1
  from srouser.pde_doc_status_cr a where (sr_code,book_no,doct_no,reg_year) in
(select distinct sr_code,book_no,doct_no,reg_year from SROUSER.WEBLAND_STATUS_SURV_CR  b
where trunc(REG_TIMESTAMP) between :fromdate AND :todate
union all
select distinct sr_code,book_no,doct_no,reg_year from SROUSER.WEBLAND_STATUS_LPM_CR
where trunc(REG_TIMESTAMP) between :fromdate AND :todate
) and a.sr_code=:srocode
group by a.sr_code
order by a.sr_code`;
      }
      const response = this.orDao.oDBQueryService(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  }
  documentdetailsReport = async (reqData) => {
    try {
      let orderQuery;
      if (reqData.orderBy) {
        orderQuery = `ORDER BY ${reqData.orderBy}`;
      } else {
        orderQuery = ``;
      }
      let entryModeQuery;
      let naturequery;
      let valuequery;
      let regTypequery;
      {
        reqData.docNature
          ? (naturequery = `and MAJ='${reqData.docNature}'`)
          : (naturequery = "");
      }
      {
        reqData.feevalue && reqData.amount
          ? (valuequery = `and ${reqData.feevalue} > '${reqData.amount}'`)
          : (valuequery = "");
      }
      {
        reqData.entryMode
          ? (entryModeQuery = `and ENTRY_MODE=${reqData.entryMode}`)
          : (entryModeQuery = "");
      }
      {
        reqData.regn_type
          ? (regTypequery = `and REGN_TYPE=${reqData.regn_type}`)
          : (regTypequery = "");
      }
      let query = `SELECT DOC_DET_REP.*, (SD_BORN + DSD + TD + RF) AS TOTAL
      FROM srouser.DOC_DET_REP
      WHERE sr_code = ${reqData.SR_CODE} ${naturequery} ${valuequery}
      AND trunc(time_Stamp) BETWEEN TO_DATE('${reqData.fromDate}', 'yyyy-mm-dd') AND TO_DATE('${reqData.toDate}', 'yyyy-mm-dd')
      ${orderQuery} `;
      let query2 = `SELECT SUM(SD_BORN + DSD + TD + RF) AS TOTAL_GRAND
      FROM srouser.DOC_DET_REP
      WHERE sr_code = ${reqData.SR_CODE} ${naturequery} ${valuequery}
      AND trunc(time_Stamp) BETWEEN TO_DATE('${reqData.fromDate}', 'yyyy-mm-dd') AND TO_DATE('${reqData.toDate}', 'yyyy-mm-dd')
      ${orderQuery}`;
      let bindparam = {};
      let response = await this.orDao.oDBQueryService(query, bindparam);
      let response2 = await this.orDao.oDBQueryService(query2, bindparam);
      // let imagePath = 'logos\\ap_logo.jpg';
      const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
      let Imagedatapath = fsone.readFileSync(imagePath, { encoding: "base64" });
      let html = `
      <div>
      <div style="text-align: center;">
      <div style="display: inline-block; text-align: end; vertical-align: middle;">
      <h3 style="margin-top: 10px; margin-bottom: 0;">రిజిస్ట్రేషన్ & స్టాంప్స్ శాఖ</h3>
      <h5 style="margin-top: 5px;">ఆంధ్రప్రదేశ్ రాష్ట్ర ప్రభుత్వం</h5>
   </div>
      <div style="display: inline-block; text-align: left;">
       <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:95px; height:100px; display: inline-block; vertical-align: middle;"/>
      </div>
      <div style="display: inline-block; text-align: left; vertical-align: middle;">
         <h3 style="margin-top: 10px; margin-bottom: 0;">REGISTRATIONS AND STAMPS DEPARTMENT</h3>
         <h5 style="margin-top: 5px;">GOVERNMENT OF ANDHRA PRADESH</h5>
      </div>
    </div>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0; textAlign: 'center' ">
    <thead>
          <tr>
              <th style="border: 1px solid black; font-size: 14px;">Book No</th>
              <th style="border: 1px solid black; font-size: 14px;">Cs No</th>
              <th style="border: 1px solid black; font-size: 14px;">Doct No</th>
              <th style="border: 1px solid black; font-size: 14px;">Year</th>
              <th style="border: 1px solid black; font-size: 14px;">Nature</th>
              <th style="border: 1px solid black; font-size: 14px;">SCH-Property Type-Village</th>
              <th style="border: 1px solid black; font-size: 14px;">Regn Type</th>
              <th style="border: 1px solid black; font-size: 14px;">Entry Mode</th>
              <th style="border: 1px solid black; font-size: 14px;">Mkt val</th>
              <th style="border: 1px solid black; font-size: 14px;">Con Val</th>
              <th style="border: 1px solid black; font-size: 14px;">FTV</th>
              <th style="border: 1px solid black; font-size: 14px;">SD BORN</th>
              <th style="border: 1px solid black; font-size: 14px;">DSD</th>
              <th style="border: 1px solid black; font-size: 14px;">TD</th>
              <th style="border: 1px solid black; font-size: 14px;">RF</th>
              <th style="border: 1px solid black; font-size: 14px;">Usr chgs</th>
              <th style="border: 1px solid black; font-size: 14px;">Others Paid</th>
              <th style="border: 1px solid black; font-size: 14px;">Exempted</th>
              <th style="border: 1px solid black; font-size: 14px;">Total</th>
          </tr>
      </thead>
     
            <tbody style="text-align:center; ">
              ${response
          .map(
            (row, index) =>
              `<tr key=${index}>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.BOOK_NO}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.DOCT_NO}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.RDOCT_NO}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.RYEAR}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.NATURE_OF_DOC}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.PROP_VILL}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.REGN_TYPE}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.ENTRY_MODE}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.MKT_VAL}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.CON_VAL}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.FTV}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.SD_BORN}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.DSD}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.TD}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.RF}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.UC}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.OTHERS_PAID}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.EXEMPTED}</td>
                   <td style="border: 1px solid black; font-size: 14px; ">${row.TOTAL}</td>
                                   </tr>`
          )
          .join("")}
      ${reqData.docType === "pdf"
          ? `<tr><td colspan="19" style="text-align:right; "> Grand Total : ${response2.length > 0
            ? response2[0].TOTAL_GRAND !== null
              ? response2[0].TOTAL_GRAND
              : 0
            : 0
          }</td></tr>`
          : 0
        }
     
     
            </tbody>
          </table>
      </div>`;
      let formatparam = true;
      let pdfBuffer = await generatePDFFromHTML(html, formatparam);
      const base64Pdf = pdfBuffer.toString("base64");
      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet("Sheet 1");
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: "center" },
        border: { bottom: { style: "thin" } },
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split("</th>");
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, "");
        worksheet
          .cell(1, cellIndex + 1)
          .string(content)
          .style(headerCellStyle);
      });
      const rows = html.split("</tr>").slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: "center" },
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: "right" },
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split("</td>");
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, "");
            worksheet
              .cell(rowIndex + 2, cellIndex + 1)
              .string(content)
              .style(cellStyle);
          });
        }
      });
      worksheet
        .cell(rows.length + 2, 1, rows.length + 2, 19, true)
        .string(`Grand Total :${response2[0].TOTAL_GRAND} `)
        .style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString("base64");
      return { pdf: base64Pdf, excel: base64excel };
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  };
  containsUnwantedContent = (row) => {
    return (
      row.includes('<div style="text-align: center;">') ||
      row.includes(
        '<h3 style="margin-top: 10px; margin-bottom: 0;">రిజిస్ట్రేషన్ & స్టాంప్స్ శాఖ</h3>'
      ) ||
      row.includes(
        '<h5 style="margin-top: 5px;">ఆంధ్రప్రదేశ్ రాష్ట్ర ప్రభుత్వం</h5>'
      ) ||
      row.includes(
        '<h3 style="margin-top: 10px; margin-bottom: 0;">REGISTRATIONS AND STAMPS DEPARTMENT</h3>'
      ) ||
      row.includes(
        '<h5 style="margin-top: 5px;">GOVERNMENT OF ANDHRA PRADESH</h5>'
      )
    );
  };
  getnatureofdoclist = async () => {
    try {
      let query = `select TRAN_DESC, TRAN_MAJ_CODE from tran_dir where tran_min_code=00`;
      let bindparam = {};
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getMISDetails || Error:", ex);
      console.error("MISServices - getMISDetails || Error:", ex);
      throw constructCARDError(ex);
    }
  };
  getTopNDocumentsSrvc = async (reqData) => {
    try {
      let query;
      console.log(reqData);
      if (reqData.SR_CODE) {
        query = `SELECT tm.sr_code, sm.sr_name, COUNT(*) AS count
        FROM tran_major tm
        JOIN sr_master sm ON tm.sr_code = sm.sr_cd
        WHERE TRUNC(tm.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD/MM/YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD/MM/YYYY') and tm.rdoct_no is not null and tm.FINAL_TAXABLE_VALUE is not null
       and tm.book_no = 1
        AND SR_CODE=${reqData.SR_CODE}
        GROUP BY tm.sr_code, sm.sr_name`;
        console.log(query);
      } else {
        query = `SELECT tm.sr_code, sm.sr_name, COUNT(*) AS count, dm.dr_name
        FROM tran_major tm
        JOIN sr_master sm ON tm.sr_code = sm.sr_cd
        JOIN dr_master dm ON dm.dr_cd = '${reqData.DR_CD}'
        WHERE TRUNC(tm.time_stamp) BETWEEN TO_DATE('${reqData.FROM_DATE}', 'DD/MM/YYYY') AND TO_DATE('${reqData.TO_DATE}', 'DD/MM/YYYY') and tm.rdoct_no is not null
        and tm.final_taxable_value is not null and tm.others_desc is not null and tm.book_no = 1
        AND sm.dr_cd = '${reqData.DR_CD}'
        GROUP BY tm.sr_code, sm.sr_name, dm.dr_name order by tm.sr_code`;
        const bindParams = {};
        console.log(query);
      }
      let response = await this.odbDao.oDBQueryServiceread(query);

      return response;
    } catch (ex) {
      Logger.error("MISServices - getTopNDocumentsSrvc || Error :", ex);
      console.error("MISServices - getTopNDocumentsSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getTopNDocumentsDetailsSrvc = async (reqData) => {
    let query = `update  srouser.audit_remarks  set dig_mis_remark= '${reqData.DIG_MIS_REMARK}' where sr_code =${reqData.SR_CODE} and iar_number = '${reqData.IAR_NUMBER}'and doct_no=(select RDOCT_NO from  tran_major where DOCT_NO =${reqData.DOCT_NO} and sr_code =${reqData.SR_CODE}  and REG_YEAR = ${reqData.REG_YEAR})`;

    try {
      let query = `select SR_CODE,(SELECT SR_NAME from sr_master WHERE SR_CD = SR_CODE) AS SR_NAME, RDOCT_NO, RYEAR, BOOK_NO, OTHERS_DESC, FINAL_TAXABLE_VALUE from tran_major where
        trunc(time_stamp) between TO_DATE('${reqData.FROM_DATE}','DD-MM-YYYY') and TO_DATE('${reqData.TO_DATE}','DD-MM-YYYY') and RDOCT_NO is not null and FINAL_TAXABLE_VALUE is not null and OTHERS_DESC is not null
        and sr_code =${reqData.SR_CODE} order by final_taxable_value DESC FETCH FIRST ${reqData.ROWS} ROWS ONLY`;
      const bindParams = {};
      console.log(query);
      let response = await this.odbDao.oDBQueryServiceread(query, bindParams);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getTopNDocumentsDetailsSrvc || Error :", ex);
      console.error("MISServices - getTopNDocumentsDetailsSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getSelectedDocumentDetails = async (reqData) => {
    try {
      let responseArray = [];
      let query = `select sr_code,(select sr_name from sr_master where sr_cd = sr_code) as sr_name,rdoct_no,ryear,others_desc,final_taxable_value,TIME_STAMP,TRAN_MAJ_CODE,TRAN_MIN_CODE from tran_major where sr_code = ${reqData.SR_CODE} AND rdoct_no = ${reqData.RDOCT_NO} AND ryear = ${reqData.REG_YEAR} AND book_no  =${reqData.BOOK_NO}`;
      const bindParams = {};
      let response = await this.odbDao.oDBQueryServiceread(query, bindParams);
      if (response.length > 0) {
        for (let item of response) {
          responseArray.push({
            ...item,
            parties: [],
            properties: [],
          });
        }
        let queryParties = `SELECT code,name,address1 FROM tran_ec WHERE sr_code = ${reqData.SR_CODE} AND rdoct_no = ${reqData.RDOCT_NO} AND ryear = ${reqData.REG_YEAR} AND book_no  =${reqData.BOOK_NO} order by code`;
        let tranData = await this.odbDao.oDBQueryServiceread(
          queryParties,
          bindParams
        );
        for (let item of responseArray) {
          item.parties = tranData;
        }
        let queryProperties = `SELECT * FROM tran_sched WHERE sr_code = ${reqData.SR_CODE} AND rdoct_no = ${reqData.RDOCT_NO} AND ryear = ${reqData.REG_YEAR} AND book_no  =${reqData.BOOK_NO}`;
        let tranSchedData = await this.orDao.oDBQueryService(
          queryProperties,
          bindParams
        );
        for (let item of responseArray) {
          item.properties = tranSchedData;
        }
      }
      return responseArray;
    } catch (ex) {
      Logger.error("MISServices - getSelectedDocumentDetails || Error :", ex);
      console.error("MISServices - getSelectedDocumentDetails || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  extractTextWithPositionsFromPDF = async (pdfBuffer) => {
    const uint8Array = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    let textWithPositions = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      content.items.forEach((item) => {
        textWithPositions.push({
          text: item.str,
          position: {
            x: item.transform[4],
            y: item.transform[5],
          },
          page: i,
        });
      });
    }

    return textWithPositions;
  };

  convertBase64ToPdf = async (base64String) => {
    const decodedBuffer = Buffer.from(base64String, "base64");
    const pdfDoc = await PDFDocument.load(decodedBuffer);
    return pdfDoc.save();
  };
  getHTML =async(reqData) =>{
      let bindparam = {};
      const currentYear = new Date().getFullYear();
      try{

const query = `SELECT A.*,(SELECT TRAN_DESC FROM tran_dir b WHERE b.TRAN_MAJ_CODE = A.TRAN_MAJ_CODE AND b.TRAN_MIN_CODE = A.TRAN_MIN_CODE AND ROWNUM = 1) AS TRAN_DESC
               FROM srouser.mva_rur A WHERE REQ_NO   = :reqNo AND SR_CODE  = :srCode AND mva_year = :mvaYear`;
      const bindParams = {
        reqNo:  reqData.REQ_NO,
        srCode: reqData.SR_CODE,
        mvaYear: currentYear
        };        
        let response = await this.odbDao.oDBQueryServiceWithBindParams(query, bindParams);
       let UNIT_TYPE;
      if (response[0]?.UNIT === 'F') {
        UNIT_TYPE = "Sq. Feet";
      }
      if (response[0]?.UNIT === 'Y') {
        UNIT_TYPE = "Sq. Yards";
      }
      if (response[0]?.UNIT === 'A') {
        UNIT_TYPE = "Acres";

      }

      let masterquery = `SELECT a.sr_cd, a.sr_name, c.DR_NAME FROM sr_master a
      JOIN CARD.MST_REVREGDIST c ON a.dr_cd = c.dr_code WHERE a.sr_cd = :SR_CODE`;
      bindparam={SR_CODE:reqData.SR_CODE}
      let mastreresponse = await this.odbDao.oDBQueryServiceWithBindParams(masterquery, bindparam);
      let proptypequery = `select * from area_class where CLASS_CODE=:NATURE_USE and CLASS_TYPE=:PROPERTY_TYPE`;
      bindparam={
        NATURE_USE:response[0].NATURE_USE,
        PROPERTY_TYPE:response[0].PROPERTY_TYPE
      }
      let proptyperesult = await this.odbDao.oDBQueryServiceWithBindParams(
        proptypequery,
        bindparam
      );      
      if (response.length > 0) {
        const querysro = `select aadhar, empl_name as name,(select sr_name from sr_master where sr_cd = :SR_CODE ) sr_name from employee_login_master where sr_code=:SR_CODE  and designation='Sub-Registrar'`;
        bindparam={SR_CODE:reqData.SR_CODE}

        let response1 = await this.odbDao.oDBQueryServiceWithBindParams(querysro, bindparam);
        // if (response1.length > 0) {
        //   response1.forEach(item => {
        //     item.AADHAR = item.AADHAR.length > 12 ? decryptData(item.AADHAR) : item.AADHAR;
        //   });
        // } 
        const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
        let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
        const templatePath = path.join(__dirname, '../reports/mvassistance/mvAssistance.hbs');
        const templateSource = fsone.readFileSync(templatePath, 'utf8');        
        handlebars.registerHelper('gte', function (a, b) {
          return a >= b;
        });
        const template = handlebars.compile(templateSource);
        const html = template({
          Imagedatapath,
          response,
          mastreresponse,
          proptyperesult: proptyperesult,
          reqData,
          DATE: new Date(response[0].ENT_DATE).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          generatedOn: new Date().toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
            hour12: true
          }),
          esignStatus: false,
          UNIT_TYPE,
          STRUCTURE:reqData.STRUCTURE ? JSON.parse(reqData.STRUCTURE) : response[0]?.STRUCTURE ? JSON.parse(response[0]?.STRUCTURE.toString('utf8')) :[]
        });
  

        return { html: html, response1: response1 }
      }
    } catch (ex) {
      Logger.error("MISServices - getHTML || Error :", ex);
      console.error("MISServices - getHTML || Error :", ex);
      throw constructCARDError(ex);
    }
  }

  mvAssitanceReport = async (reqData) => {
    try {
      let htmldata =await this.getHTML(reqData)
      const currentYear = new Date().getFullYear();

        let mvAssitDirectiory = path.join(__dirname, `../../../../../pdfs/`);
        // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
        if (!fsone.existsSync(mvAssitDirectiory)) {
          fsone.mkdirSync(mvAssitDirectiory, { recursive: true });
        }
        mvAssitDirectiory = `${mvAssitDirectiory}/uploads/`;

        if (!fsone.existsSync(mvAssitDirectiory)) {
          fsone.mkdirSync(mvAssitDirectiory, { recursive: true });
        }
        mvAssitDirectiory = `${mvAssitDirectiory}${currentYear}/`;
        if (!fsone.existsSync(mvAssitDirectiory)) {
          fsone.mkdirSync(mvAssitDirectiory, { recursive: true });
        }
        mvAssitDirectiory = `${mvAssitDirectiory}${reqData.SR_CODE}/`;

        if (!fsone.existsSync(mvAssitDirectiory)) {
          fsone.mkdirSync(mvAssitDirectiory, { recursive: true });
        }
        mvAssitDirectiory = `${mvAssitDirectiory}1/`;
        if (!fsone.existsSync(mvAssitDirectiory)) {
          fsone.mkdirSync(mvAssitDirectiory, { recursive: true });
        }
        mvAssitDirectiory = `${mvAssitDirectiory}${reqData.REQ_NO}/`;
        if (!fsone.existsSync(mvAssitDirectiory)) {
          fsone.mkdirSync(mvAssitDirectiory, { recursive: true });
        }
        const filename = `${mvAssitDirectiory}mvAssistanceReport.pdf`;
        const pdfBuffer = await generatePDFFromHTML(htmldata.html, filename, []);
        const base64Pdf = pdfBuffer.toString("base64");
          let response1 =htmldata.response1
          
          for (let i = 0; response1.length > i; i++) {
            let formatparam = "";
            let insertquery = `insert into SROUSER.MV_ASSISTANCE_ESIGN_STATUS_CR (
      SR_CODE,BOOK_NO,REQ_NO,PAGE_NO,COORDINATES,
      TIME_STAMP,
      AADHAR,
      DN_QUALIFIER,
      NAME, MVA_YEAR,
      ESIGN_STATUS) values(${reqData.SR_CODE},1,${reqData.REQ_NO},'','',sysdate,'${response1[i].AADHAR}','','${response1[i].NAME}',${currentYear},'P')`;

            let insertresponse = await this.odbDao.oDbInsertDocsWithOutBreak(insertquery);
        }
        //  const base64Pdf = pdfBuffer.toString('base64');
        return base64Pdf;
    } catch (ex) {
      Logger.error("MISServices - mvAssitanceReport || Error :", ex);
      console.error("MISServices - mvAssitanceReport || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  pdfpreviewSrvc = async (reqData) => {
    try {
      const filePath = `../../../../../pdfs/uploads/${reqData.REG_YEAR}/${reqData.SR_CODE}/1/${reqData.REQ_NO}/mvAssistanceReport.pdf`;
      const pdfPath = path.join(__dirname, filePath);
      const pdfBuffer = await require("fs").promises.readFile(pdfPath);
      // const pdfDoc = await PDFDocument.load(pdfBuffer);
      const base64Pdf = pdfBuffer.toString("base64");
      return base64Pdf;
      //    return new Promise((resolve, reject) => {
      //     fsone.readFile(pdfPath, (err, data) => {
      //       if (err) {
      //         console.error('Error reading PDF file:', err);
      //         reject(err);
      //       } else {
      //         resolve(data);
      //       }
      //     });
      //   });
    } catch (ex) {
      console.error("Error in PDFPreview:", ex);
      throw ex;
    }
  };
  savePdfToFile = async (pdfBytes, filePath) => {
    await fs.writeFile(filePath, pdfBytes);
    console.log(`PDF saved to ${filePath}`);
    return true;
  };
  pendingEsignList = async (reqBody) => {
    try {
      let bindparam = {};
      const { SR_CODE, REQ_NO, REG_YEAR, esignstatus } = reqBody;
      let esign_status;
      if (esignstatus != 'null') {
        const base64String = Buffer.from(esignstatus).toString('base64');
        const eSignConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${process.env.IGRS_ESIGN_URL}/downloadSignedDocTransID?transactionId=${base64String}`,
          headers: {
            "Content-Type": "application/json",
          },
        };

        let fileResponse = await instance.request(eSignConfig);
        if (fileResponse == null || fileResponse.data == null || fileResponse.data.data == undefined) {
          console.log('Pending Esign was not completed');
          esign_status = 0
          return esign_status

        } else {
          let query5;
          const base64Pdf = fileResponse.data.data;
          const pdfBytes = await this.convertBase64ToPdf(base64Pdf);
          const filePath = `../../../../../pdfs/uploads/${REG_YEAR}/${SR_CODE}/1/${REQ_NO}/mvAssistanceReport.pdf`;
          const pdfPath = path.join(__dirname, filePath);
          await this.savePdfToFile(pdfBytes, pdfPath);
          query5 = `update SROUSER.MV_ASSISTANCE_ESIGN_STATUS_CR set esign_status = 'Y' where sr_code = ${SR_CODE} and book_no = 1 and REQ_NO=${REQ_NO}`;
          esign_status = await this.odbDao.oDbUpdate(query5);
          console.log('PDF saved successfully');
          return esign_status

        }
      }
      // const query = `SELECT * FROM SROUSER.MV_ASSISTANCE_ESIGN_STATUS_CR WHERE sr_code = ${SR_CODE} and REQ_NO = ${REQ_NO} and book_no = 1 `;
      // const result = await this.odbDao.oDBQueryService(query, bindparam);
      // const query2 = `select * from SROUSER.MV_ASSISTANCE_ESIGN_STATUS_CR where sr_code = ${SR_CODE} and REQ_NO = ${REQ_NO} and book_no = 1`;
      // const result1 = await this.odbDao.oDBQueryService(query2, bindparam);
    } catch (ex) {
      console.error("refuseSrervices - pendingEsignList || Error :", ex);
      throw ex; // Handle the error more appropriately
    }
  };
  getmvacoordinatesdata = async (reqData) => {
    let srocode = reqData.SR_CODE;
    let reqno = reqData.REQ_NO;
    let name = reqData.NAME;

    let result;
    try {
      const query = `
      SELECT t1.*, t2.sr_name
      from SROUSER.MV_ASSISTANCE_ESIGN_STATUS_CR t1
      join sr_master t2 on t1.sr_code = t2.sr_cd
        WHERE sr_code = ${srocode}
          AND book_no = 1
          AND req_no = ${reqno}
          AND name = '${name}'
      `;

      result = await this.odbDao.oDBQueryService(query);
     let base64Pdf;
      if (result.length > 0) {
        result.forEach(item => {
          item.AADHAR = item.AADHAR.length > 12 ? decryptData(item.AADHAR) : item.AADHAR;
        });
      }
      if (result.length > 0) {
        reqData.esignStatus=true
      let htmldata =await this.getHTML(reqData)
      const currentYear = new Date().getFullYear();
      let pdfBuffer =await generatePDFFromHTML(htmldata.html, true, []);      
        const base64Pdf = pdfBuffer.toString("base64");
        const textWithPositions = await this.extractTextWithPositionsFromPDF(pdfBuffer);        
        const searchText = "Authorized Signatory";
        const signaturePosition = textWithPositions.find((item) =>
          item.text.includes(searchText)
        );

        if (signaturePosition) {
          const roundedPosition = {
            x: Math.round(signaturePosition.position.x),
            y: Math.round(signaturePosition.position.y),
            pageNo: signaturePosition.page,
          };          

        let transactionID = new Date().getTime();
        let eSignData = {
          rrn: transactionID,
          coordinates_location: "Top_Right",
          coordinates: `${roundedPosition.pageNo}-50,${roundedPosition.y},50,${roundedPosition.x-400};`,
          doctype: "PDF",
          uid: result[0].AADHAR.length > 12 ? decryptData(result[0].AADHAR) : result[0].AADHAR,
          signername: result[0].NAME?.substring(0, 50),
          signerlocation: `${result[0].SR_NAME}`,
          filepassword: "",
          signreason: "MVeSignCARD",
          authmode: reqData.AUTH_MODE,
          webhookurl: `${reqData.url}`,
          file: base64Pdf,
        };
        let esignUrlData = await this.odbDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
        if (esignUrlData == null || esignUrlData.length == 0) {
          throw Error('Esign Urls Not Found');
        }
        if (eSignData) {
          let queryupdate = `update SROUSER.MV_ASSISTANCE_ESIGN_STATUS_CR set DN_QUALIFIER = '${eSignData.rrn}' where sr_code = ${srocode}  and req_no = ${reqno} and book_no = 1 and name = '${eSignData.signername}'`;
          const resultupdate = await this.odbDao.oDbUpdate(queryupdate);
        }
        let encryptedData1 = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
        let esignUrl = parseInt(srocode) % 2 == 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
        // let eSignReponse = await this.esign.igrsEsignAxiosCall('http://117.250.201.41:9080/igrs-esign-service', encryptedData1);
        let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, encryptedData1);
        return { result: eSignData, data: eSignReponse }
      } else {
        Logger.error("MISServices - getmvacoordinatesdata || Error:", ex);
        console.error("MISServices - getmvacoordinatesdata || Error:", ex);

        throw constructCARDError(ex);
      }
      }
    } catch (ex) {
      Logger.error("MISServices - getmvacoordinatesdata || Error:", ex);
      console.error("MISServices - getmvacoordinatesdata || Error:", ex);
      throw constructCARDError(ex);
    }
  };


  getTopSelectedDocumentDetails = async (reqData) => {
    try {
      let bindParams = {};
      let doct_no;

      let responseArray = [];
      doct_no = reqData.RDOCT_NO;

      if (reqData.DOCT_NO_2 != undefined) {
        const bindParams = {};
        // let doct_no

        let queryrdcot = `select RDOCT_NO from
      tran_major where sr_code = ${reqData.SR_CODE} AND doct_no = ${reqData.DOCT_NO_2} AND reg_year = ${reqData.REG_YEAR} AND book_no  =${reqData.BOOK_NO}`;
        let redoctresponse = await this.odbDao.oDBQueryServiceread(queryrdcot, bindParams);
        doct_no = redoctresponse[0].RDOCT_NO
        console.log(queryrdcot, redoctresponse[0]);

      }
      bindParams = {};


      let query = `select * from
      tran_major tm
      join tran_sched ts on tm.sr_code = ts.sr_code and
                          tm.doct_no = ts.doct_no and
                          tm.book_no = ts.book_no and
                          tm.reg_year = ts.reg_year
      where tm.sr_code = ${reqData.SR_CODE} AND tm.rdoct_no = ${doct_no} AND tm.ryear = ${reqData.REG_YEAR} AND tm.book_no  =${reqData.BOOK_NO}`;


      let response = await this.odbDao.oDBQueryServiceread(query, bindParams);
      if (response.length > 0) {
        for (let item of response) {
          responseArray.push({
            ...item,
            parties: [],
          });
        }
        let queryparties = `SELECT code,name,address1 FROM tran_ec WHERE sr_code = ${reqData.SR_CODE} AND rdoct_no = ${reqData.RDOCT_NO} AND ryear = ${reqData.REG_YEAR} AND book_no  =${reqData.BOOK_NO} order by code`;
        let tranData = await this.odbDao.oDBQueryServiceread(
          queryparties,
          bindParams
        );
        for (let item of responseArray) {
          item.parties = tranData;
        }
      }
      return responseArray;
    } catch (ex) {
      Logger.error("misServices - getTopSelectedDocumentDetails || Error :", ex);
      console.error("misServices - getTopSelectedDocumentDetails || Error :", ex);
      throw constructCARDError(ex);
    }
  };

	getChallanReportSrvc = async(reqData) => {
		try{
			let query = `select a.*,(select sr_name from sr_master where sr_cd = a.sr_code) as sr_name 
                   from scanuser.echallan_trans a 
                   where a.sr_code = :SR_CODE and 
                   TO_CHAR(a.time_stamp, 'MM-YYYY') = :TIME_STAMP and a.challanno is not null ${reqData.FILTER === 'Defaced' ? `and con_status = 'Y'` : reqData.FILTER === 'Not Defaced' ? `and con_status != 'Y'` : ''} order by a.time_stamp`;
      const bindparam = {
        SR_CODE : reqData.SR_CODE,
        TIME_STAMP : `${reqData.MONTH}-${reqData.YEAR}`
      }    
			let response = await this.orDao.oDBQueryService(query, bindparam);
			return response;
		}catch(ex){
			Logger.error("misServices - getChallanReportSrvc || Error :", ex);
			console.error("misServices - getChallanReportSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
		}

    generatePDFFromHTML = async (html) => {
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
    
      await page.setContent(html);
    
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '30px',
          left: '5px',
        },
        displayHeaderFooter: true,
        footerTemplate: `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; margin: -5px 10px; width: 100%;">
          <div style="flex: 1; text-align: left;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
          <div style="flex: 1; text-align: right; color: #333;">
            Generated on: ${new Date().toLocaleString()}
          </div>
        </div>
        `,
        displayHeaderFooter: true,
        printBackground: true,
        fontFamily: true,
        landscape: false,
      });
      await browser.close();
      return pdfBuffer;
    }

    getChallanReportgeneratePDFSrvc = async(reqData) => {
      try{
        const response = Array.isArray(reqData?.arrayData) ? reqData.arrayData.length > 0 ? reqData.arrayData : [] : []; 
          let query = `select SR_NAME from sr_master where sr_cd = :SR_CODE`;
          const bindparam = {
            SR_CODE : reqData.SR_CODE,
          }
          let sr_response = await this.orDao.oDBQueryService(query, bindparam);
          const months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
          const Month = months[parseInt(reqData.MONTH, 10) - 1];
          let total = 0;
          let Defacetotal = 0;
          let notDefacetotal = 0;
          if(response.length > 0) {
            total = response.reduce((initialValue, currentValue) => {
              return initialValue + currentValue.BANKAMOUNT;
            }, 0);
            Defacetotal = response.reduce((initialValue, currentValue) => {
              if(currentValue.CON_STATUS === 'Y') {
                return initialValue + currentValue.BANKAMOUNT;
              }
              return initialValue;
            }, 0);
            notDefacetotal = response.reduce((initialValue, currentValue) => {
              if(currentValue.CON_STATUS != 'Y') {
                return initialValue + currentValue.BANKAMOUNT;
              }
              return initialValue;
            }, 0);
          }
          const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
          const data = fsone.readFileSync(imagePath , {encoding : 'base64'});
          const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
                <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
                <h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH</h3>
                <h4 style="margin:0px; margin-top : 5px">REGISTRATIONS & STAMPS DEPARTMENT</h4>
                <h5 style="margin:0px; margin-top : 8px; text-decoration : underline;">CHALLAN REPORT</h5>
                <div style="display:flex; justify-content:space-between;margin-top: 10px;">
                <div><span style="font-weight:600">SRO</span> : ${sr_response[0].SR_NAME}(${reqData.SR_CODE})</div>
                  <div><span style="font-weight:600">Period</span> : ${Month} - ${reqData.YEAR}</div>
                </div>
                <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:30px">
                <thead>
                <tr style="font-size : 16px;">
                  <th style="border: 1px solid #000;  width: 2%; padding: 7px;"> S No.</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 7px;">Challan No.</th>
                  <th style="border: 1px solid #000;  width: 3%; padding: 7px;">Head of Account</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 7px;">Amount</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 7px;">Defaced/Not Defaced</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 7px;">Remarks (Remitter Name)</th>
                </tr>
                </thead>
                <tbody>
                ${response.length === 0 ? 
                        `<tr>
                      <td colspan="6" style="text-align: center; padding: 10px; border: 1px solid #000; font-size: 16px; color : red; font-weight: 600;">
                        No data found
                      </td>
                    </tr>`
                  : response.map(
                        (item, index) => `
                    <tr style="font-size : 14px;">
                              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 7px;">${index + 1 }</td>
                              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 7px;">${item.CHALLANNO}</td>
                              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 7px; max-width: 270px;">${item.MULTI_HOA}</td>
                              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 7px; max-width: 270px;">${(item.BANKAMOUNT).toLocaleString("en-IN", {currency: "INR", maximumFractionDigits: 0, })}</td>
                              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 7px; max-width: 270px;">${item.CON_STATUS === 'Y' ? 'Defaced' : 'Not Defaced'}</td>         
                              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 7px;">${item.USERID}</td>
                            </tr>`)
                    .join('')}                   
                </tbody>
              </table>
              <div style="text-align: start;margin-top: 10px; ">
                <div><span style="font-weight:600">Total Amount</span> : ${(total).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0, })}</div>
                <div><span style="font-weight:600">Total Defaced Amount</span> : ${(Defacetotal).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0, })}</div>
                  <div><span style="font-weight:600">Total Not Defaced Amount</span> : ${(notDefacetotal).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0, })}</div>
                </div>
                </div>
            `;
            const pdfBuffer = await this.generatePDFFromHTML(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return base64Pdf;
      }catch(ex){
        Logger.error("misServices - getChallanReportgeneratePDFSrvc || Error :", ex);
        console.error("misServices - getChallanReportgeneratePDFSrvc || Error :", ex);
        throw constructCARDError(ex);
      }
      }

      getAnywhereDocStatusSrvc = async(reqData) => {
        try{
          let srcode= reqData.JURISDICTION
          let query = `SELECT 
    schedule.ID,
    (SELECT sr_name FROM sr_master WHERE sr_cd = pec.SRO_LOCATION) as SR_NAME,
    pec.SRO_LOCATION as SR_CODE,
    (SELECT sr_name FROM sr_master WHERE sr_cd = schedule.jurisdiction) AS jurisdiction_name,
    schedule.jurisdiction,
    schedule.SCHEDULE_NO,
    schedule.juri_check_on,
    schedule.juri_status,
    schedule.PP_CHECK,
    schedule.MV_CHECK,
    schedule.JURI_SD,
    schedule.JURI_RF,
    schedule.JURI_UC,
    schedule.JURI_FC,
    schedule.RESUBMITTED,
    schedule.pp_comments,
    schedule.mv_comments,                    
    schedule.reject_reason,
    CASE 
        WHEN schedule.juri_status = 'N' AND schedule.jurisdiction != 0 THEN 'PENDING'
        WHEN schedule.juri_status = 'Y' AND schedule.juri_check_on IS NOT NULL 
             AND schedule.mv_check = 'Y' 
             AND schedule.pp_check = 'Y' THEN 'ACCEPTED'
        WHEN schedule.juri_status = 'Y' AND schedule.juri_check_on IS NOT NULL 
             AND (schedule.mv_check = 'N' OR schedule.pp_check = 'N') THEN 'REJECTED'
    END AS status
FROM preregistration.schedule_entry schedule
JOIN preregistration.pre_registration_cca pec on pec.ID = schedule.ID
WHERE schedule.ID = :APP_ID and pec.SRO_LOCATION != schedule.jurisdiction and  (schedule.jurisdiction in (${reqData.DR_CODE?`select SR_cd
           from card.mst_revregdist dm
         LEFT JOIN sr_master sm
         ON sm.dr_cd = dm.dr_code
         AND sm.state_cd = 01 and DR_CODE= :DR_CODE`:srcode})
         OR pec.SRO_LOCATION in (${reqData.DR_CODE ? `
          select SR_cd
           from card.mst_revregdist dm
         LEFT JOIN sr_master sm
         ON sm.dr_cd = dm.dr_code
         AND sm.state_cd = 01 and DR_CODE= :DR_CODE` : srcode}))`;        
         
          const bindparam = {
            APP_ID : reqData.APP_ID,
          }    
          if(reqData.DR_CODE){bindparam.DR_CODE =reqData.DR_CODE}
          let response = await this.orDao.oDBQueryService(query, bindparam);
          return response;
        }catch(ex){
          Logger.error("misServices - getAnywhereDocStatusSrvc || Error :", ex);
          console.error("misServices - getAnywhereDocStatusSrvc || Error :", ex);
          throw constructCARDError(ex);
        }
        }

  getUlbNameService = async () => {      
    try {
      let query = `SELECT 
      DISTINCT 
        muni_name, muni_code
      FROM 
        sromstr.municipality_codes
      WHERE 
        muni_code IS NOT NULL AND muni_name IS NOT NULL`;
      let response = await this.odbDao.oDBQueryServiceread(query);
      return response;
    } catch (ex) {
      Logger.error("MISServices - getUlbNameService || Error :", ex);
      console.error("MISServices - getUlbNameService || Error :", ex);
      throw constructCARDError(ex);
    }
  };
}
module.exports = MISServices;