const OrDao = require('../dao/oracledbDao');
// const { constructPDEError } = require("../handlers/errorHandler");
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const puppeteer = require('puppeteer');
const Path = require('path');
const fsone = require('fs');
const { constant } = require('lodash');
const xl = require('excel4node');


class tdAllocatons {
  constructor() {
    this.orDao = new OrDao();
  }

  containsUnwantedContent = (row) => {
    return (
      row.includes('<div style="text-align: center; margin:20px; margin-top:0 ">') ||
      row.includes('<div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>') ||
      row.includes('<h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>') ||
      row.includes('<h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>') ||
      row.includes('<h4>FORM-A</h4>') ||
      row.includes('<h4>FORM-B</h4>') || row.includes('<h4>FORM-C</h4>') || row.includes('<h4>FORM-D</h4>') || row.includes('<h4>FORM-E</h4>') || row.includes('<h4>FORM-F</h4>') || row.includes('<h4>FORM-G</h4>') || row.includes('<h4>FORM-H</h4>') || row.includes('<h4>FORM-I</h4>') || row.includes('<h4>FORM-J</h4>') || row.includes('<h4>FORM-K</h4>') || row.includes('<h4>FORM-L</h4>') || row.includes('<h4>FORM-M</h4>') || row.includes('<h4>FORM-N</h4>') || row.includes('<h4>FORM-O</h4>')
    );
  }

  getTdAllocationReport1 = async (reqData) => {
    try {
      let query = `select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - getTdAllocationReport1 || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // getTdAllocationReport2 = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //           WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //            and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - getTdAllocationReport2 || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  getTdAllocationReport1A = async (reqData) => {
    try {
      let query = `select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - getTdAllocationReport1A || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // getTdAllocationReport2A = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //           WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //            and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - getTdAllocationReport2A || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  getTdAllocationReport1B = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - getTdAllocationReport1B || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // getTdAllocationReport2B = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //           WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //            and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - getTdAllocationReport2B || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormC = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormC || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2C = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //         WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //          and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2C || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormD = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormD || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2D = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //       WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //        and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2D || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormE = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormE || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2E = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2E || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormF = async (reqData) => {
    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormF || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2F = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2F || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormG = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormG || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2G = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2G || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormH = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormH || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2H = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2H || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormI = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormI || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2I = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2I || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormJ = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormJ || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2J = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2J || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormK = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormK || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2K = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2K || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormL = async (reqData) => {
    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormL || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2L = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2L || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormM = async (reqData) => {
    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormM || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2M = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2M || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormN = async (reqData) => {
    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormN || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2N = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2N || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


  tdAllocationReportFormO = async (reqData) => {
    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let result = await this.orDao.oDBQueryService(query);
      return result;
    }
    catch (ex) {
      console.error("TdAllocatons - tdAllocationReportFormO || Error : ", ex);
      throw constructCARDError(ex);
    }
  }
  // tdAllocationReportForm2O = async (reqData) => {
  //   try {
  //     let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT ,count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
  //     WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
  //      and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
  //     let result = await this.orDao.oDBQueryService(query);
  //     return result;
  //   }
  //   catch (ex) {
  //     console.error("TdAllocatons - tdAllocationReportForm2O || Error : ", ex);
  //     throw constructCARDError(ex);
  //   }
  // }


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

  getReport1PdfGenerate1 = async (reqData) => {

    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total3Panchayat = 0
      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        totalTd += item.COUNT;
        total1MPP += item.COUNT / 5;
        total1ZPP += item.COUNT / 5;
        total3Panchayat += item.COUNT * 3 / 5;
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
            <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
			<h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
            <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
            <h4>FORM-A</h4>
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
				    <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO Code</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR Name</th>
				        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of The Authority</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D Collected</th>
				    </tr>
			  </thead>
			  <tbody>
				${response
          .map(
            (item, index) => `
						  <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
							      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
						  </tr>
						`
          )
          .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
		  </div>
			`;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport1 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport1 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  getReport1PdfGenerate2 = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
        JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
        WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
         and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
        <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
        <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
        <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
          <thead>
              <tr style="font-size : 14px;">
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>        
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT CODE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT TYPE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NO OF DOCTS</th>  
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D COLLECTED</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  M.P.P</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  Z.P.P</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Collected to  Panchayat</th>
              </tr>
          </thead>
          <tbody>
            ${response
          .map(
            (item, index) => `
                  <tr key = ${index}>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>              
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_CODE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_TYPE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>              
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
						          <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
						          <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>                    
                  </tr>
                    `
          )
          .join('')}
          </tbody>
        </table>
      </div>
      <div style="margin : 0; margin-right:20px; margin-left:20px;" >
      </div>
        `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport1 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }


  getReport1PdfGenerate1A = async (reqData) => {

    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total3Panchayat = 0
      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        totalTd += item.COUNT;
        total1MPP += item.COUNT / 5;
        total1ZPP += item.COUNT / 5;
        total3Panchayat += item.COUNT * 3 / 5;
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
            <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
			<h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
            <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
             <h4>FORM-A</h4>
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
				    <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Mandal</th>
				        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of The Authority</th>
				        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">No of Docts</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D Collected</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D Collected Panchayats</th>
                <th style="border:  1px solid #000;  width: 2%; padding: 2px;">1/5th T.D Collected To M.P.P</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D Collected To Z.P.P</th>
				    </tr>
			  </thead>
			  <tbody>
				${response
          .map(
            (item, index) => `
						  <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
							      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
	      						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC.toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT.toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(item.COUNT * 3 / 5).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(item.COUNT / 5).toFixed(2)}</td>
							      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(item.COUNT / 5).toFixed(2)}</td>
						  </tr>
						`
          )
          .join('')}
			  </tbody>
        ${reqData.docType === "pdf" ?
          `<tfoot>
            <tr style="font-size: 14px;">
                <td colspan="2" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
                <td></td>
                <td id="total-no-of-docts" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${totalDoc}</td>
                <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${totalTd.toFixed(2)}</td>
                <td id="total-td-panchayat" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${total3Panchayat.toFixed(2)}</td>
                <td id="total-td-mp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${total1MPP.toFixed(2)}</td>
                <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${total1ZPP.toFixed(2)}</td>
            </tr>
        </tfoot>` :
          `<tfoot>
            <tr style="font-size: 14px;">
            <td></td>
                <td style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
                <td></td>
                <td id="total-no-of-docts" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalDoc}</td>
                <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalTd}</td>
                <td id="total-td-panchayat" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat}</td>
                <td id="total-td-mp" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1MPP}</td>
                <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1ZPP}</td>
            </tr>
        </tfoot>`

        }
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
		  </div>
			`;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport1 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport1 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  getReport1PdfGenerate2A = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
        JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
        WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
         and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
        <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
        <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
        <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
        <h4>FORM-A</h4>
        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
          <thead>
              <tr style="font-size : 14px;">
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>        
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT CODE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT TYPE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NO OF DOCTS</th>  
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D COLLECTED</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  M.P.P</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  Z.P.P</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Collected to  Panchayat</th>
              </tr>
          </thead>
          <tbody>
            ${response
          .map(
            (item, index) => `
                  <tr key = ${index}>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>              
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_CODE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_TYPE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>              
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
						          <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
						          <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>                    
                  </tr>
                    `
          )
          .join('')}
          </tbody>
        </table>
      </div>
      <div style="margin : 0; margin-right:20px; margin-left:20px;" >
      </div>
        `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport1 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }


  getReport1PdfGenerate1B = async (reqData) => {

    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total3Panchayat = 0
      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        totalTd += item.COUNT;
        total1MPP += item.COUNT / 5;
        total1ZPP += item.COUNT / 5;
        total3Panchayat += item.COUNT * 3 / 5;
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
            <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
			<h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
            <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
            <h4>FORM-B</h4>
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
				    <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
				        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of The Authority</th>
				        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">No of Docts</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D Collected</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D Collected Panchayats</th>
                <th style="border:  1px solid #000;  width: 2%; padding: 2px;">1/5th T.D Collected To M.P.P</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D Collected To Z.P.P</th>
				    </tr>
			  </thead>
			  <tbody>
				${response
          .map(
            (item, index) => `
						  <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
							      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
	      						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
							      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
						  </tr>
						`
          )
          .join('')}
			  </tbody>
        ${reqData.docType === "pdf" ?
          `<tfoot>
            <tr style="font-size: 14px;">
                <td colspan="2" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
                <td id="total-no-of-docts" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalDoc}</td>
                <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalTd}</td>
                <td id="total-td-panchayat" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat}</td>
                <td id="total-td-mp" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1MPP}</td>
                <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1ZPP}</td>
            </tr>
        </tfoot>`
          :
          `<tfoot>
            <tr style="font-size: 14px;">
            <td></td>
                <td style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
                <td id="total-no-of-docts" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalDoc}</td>
                <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalTd}</td>
                <td id="total-td-panchayat" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat}</td>
                <td id="total-td-mp" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1MPP}</td>
                <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1ZPP}</td>
            </tr>
        </tfoot>`
        }
      </table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
		  </div>
			`;
      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport1 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport1 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  getReport1PdfGenerate2B = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
        JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
        WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
         and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
        <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
        <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
        <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
        <h4>FORM-B</h4>
        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
          <thead>
              <tr style="font-size : 14px;">
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>        
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT CODE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT TYPE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NO OF DOCTS</th>  
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D COLLECTED</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  M.P.P</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  Z.P.P</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Collected to  Panchayat</th>
              </tr>
          </thead>
          <tbody>
            ${response
          .map(
            (item, index) => `
                  <tr key = ${index}>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>              
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_CODE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_TYPE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>              
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
						          <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
						          <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>                    
                  </tr>
                    `
          )
          .join('')}
          </tbody>
        </table>
      </div>
      <div style="margin : 0; margin-right:20px; margin-left:20px;" >
      </div>
        `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport1 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }


  report1PdfGenerateForm1C = async (reqData) => {

    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total3Panchayat = 0
      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        totalTd += item.COUNT;
        total1MPP += item.COUNT / 5;
        total1ZPP += item.COUNT / 5;
        total3Panchayat += item.COUNT * 3 / 5;
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-C</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
        <tr style="font-size : 14px;">
          <th style="border: 1px solid #000;  width: 8%; padding: 2px;">Mandal</th>
          <th style="border: 1px solid #000;  width: 15%; padding: 2px;">Name of Sub Treasury</th>
          <th style="border: 1px solid #000;  width: 8%; padding: 2px;">No of Docts</th>
          <th style="border: 1px solid #000;  width: 8%; padding: 2px;">T.D Collected</th>
        </tr>
      </thead>
      <tbody>
            <tr>
              <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${response[0].SR_NAME}</td>
              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${response[0].TREASURY_NAME_STO}</td>
              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${totalDoc}</td>
              <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${totalTd}</td>
            </tr>
      </tbody>
    </table>
    
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2C = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;

      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-C</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
          <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>        
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT CODE</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT TYPE</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NO OF DOCTS</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D COLLECTED</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  M.P.P</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  Z.P.P</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Collected to  Panchayat</th>
          </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>              
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_TYPE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>              
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>        
                </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1D = async (reqData) => {

    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('01-01-2002','dd-mm-yyyy') and TO_DATE('22-07-2024','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto;`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total3Panchayat = 0
      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        totalTd += item.COUNT;
        total1MPP += item.COUNT / 5;
        total1ZPP += item.COUNT / 5;
        total3Panchayat += item.COUNT * 3 / 5;
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-D</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
          <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of The Local Authority</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D Collected</th>  
          </tr>
      </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
              <tr key = ${index}>
                  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
            </tr>
          `
          )
          .join('')}
      </tbody>
      ${reqData.docType === "pdf" ?
          `<tfoot>
          <tr style="font-size: 14px;">
              <td colspan="2" style="border: 1px solid #000; width: 8%; padding: 2px;text-align: center;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${totalTd}</td>
          </tr>
      </tfoot>`:
          `<tfoot>
          <tr style="font-size: 14px;">
          <td></td>
              <td style="border: 1px solid #000; width: 8%; padding: 2px;text-align: center;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${totalTd}</td>
          </tr>
      </tfoot>`
        }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;
      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2D = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;

      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-D</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>        
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT CODE</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOCUMENT TYPE</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NO OF DOCTS</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D COLLECTED</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  M.P.P</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected to  Z.P.P</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Collected to  Panchayat</th>
          </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                    <tr key = ${index}>
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>              
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_CODE}</td>
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOCUMENT_TYPE}</td>
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC}</td>
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>              
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>
                    </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1E = async (reqData) => {

    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total3Panchayat = 0
      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        totalTd += item.COUNT;
        total1MPP += item.COUNT / 5;
        total1ZPP += item.COUNT / 5;
        total3Panchayat += item.COUNT * 3 / 5;
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-E</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
          <tr style="font-size : 14px;">
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO Code</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR Name</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of Subtreasury</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D Collection on Behalf of Panchayat Shared To Z.P.P</th>  
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D Collection on Behalf of Panchayat Shared To M.P.P</th>  
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Total</th>  
          </tr>
      </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.TREASURY_NAME_STO}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(item.COUNT * 1 / 5).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(item.COUNT * 1 / 5).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT * 1 / 5) + (item.COUNT * 1 / 5)).toFixed(2)}</td>

                </tr>
          `
          )
          .join('')}
      </tbody>
      ${reqData.docType === "pdf" ?
          `<tfoot>
          <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-mp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${total1MPP.toFixed(2)}</td>
              <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${total1ZPP.toFixed(2)}</td>
                   </tr>
      </tfoot>`:
          `<tfoot>
        <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-mp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${total1MPP.toFixed(2)}</td>
              <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${total1ZPP.toFixed(2)}</td>
                   </tr>
      </tfoot>`
        }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2E = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;

      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-E</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
         <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
                <th style="border:  1px solid #000;  width: 2%; padding: 2px;">1/5th T.D COLLECTED ON BEHALF OF PANCHYAT SHARED TO Z.P.P</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th T.D COLLECTED ON BEHALF OF PANCHYAT SHARED TO M.P.P</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Total</th>  
            </tr>
         </thead>
         <tbody>
          ${response
          .map(
            (item, index) => `
                 <tr key = ${index}>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>
                 </tr>
                  `
          )
          .join('')}
         </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1F = async (reqData) => {

    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total3Panchayat = 0
      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        totalTd += item.COUNT;
        total1MPP += item.COUNT / 5;
        total1ZPP += item.COUNT / 5;
        total3Panchayat += item.COUNT * 3 / 5;
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-F</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO Code</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR Name</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of Sub Treasury</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">No.of Docts</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D Collected</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Collected to  Panchayat</th>
            </tr>
        </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.TREASURY_NAME_STO}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>
                </tr>
          `
          )
          .join('')}
      </tbody>
      ${reqData.docType === "pdf" ?
        `<tfoot>
        <tr style="font-size: 14px;">
            <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
            <td id="total-td-mp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${totalDoc}</td>
            <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${totalTd}</td>
            <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${(totalTd * 3 / 5).toFixed(2)}</td>

                 </tr>
    </tfoot>`:
        `<tfoot>
      <tr style="font-size: 14px;">
            <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
            <td id="total-td-mp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${totalDoc}</td>
            <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${totalTd}</td>
            <td id="total-td-zp" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${(totalTd * 3 / 5).toFixed(2)}</td>
 </tr>
    </tfoot>`
      }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2F = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-F</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF SUB TREASURY</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NO OF DOCTS</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">T.D COLLECTED</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Collected to  Panchayat</th>
            </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.TREASURY_NAME_STO}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT_DOC}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>
                </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1G = async (reqData) => {

    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total3Panchayat = 0;
      let total = 0
      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        totalTd += item.COUNT;
        total1MPP += item.COUNT / 5;
        total1ZPP += item.COUNT / 5;
        total3Panchayat += item.COUNT * 3 / 5;
        total=(item.COUNT / 5 + item.COUNT / 5 +item.COUNT *  3/ 5)
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-G</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of The Local Body</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD Collected</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD Credited</th>
            </tr>
        </thead>
        <tbody>
       <tbody>
                                <tr>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">ZILLA PARISHAD ${response[0].SR_NAME}</td>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total1MPP).toFixed(2)}</td>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total1MPP).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">MANDAL ${response[0].SR_NAME}</td>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total1MPP).toFixed(2)}</td>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total1MPP).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">PANCHAYATS ${response[0].SR_NAME}</td>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total3Panchayat).toFixed(2)}</td>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total3Panchayat).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">Total</td>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total).toFixed(2)}</td>
                                    <td style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total).toFixed(2)}</td>
                                </tr>
                            </tbody>
      
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2G = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-G</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF THE LOCAL BODY</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD COLLECTED</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD CREDITED</th>
            </tr>
        </thead>
        <tbody>
                                <tr>
                                    <td className='tdall'>ZILLA PARISHAD ${fetchdata[0].SR_NAME}</td>
                                    <td className='tdall'>${(totalCount * 1 / 5).toFixed(2)}</td>
                                    <td className='tdall'>${(totalCount * 1 / 5).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className='tdall'>MANDAL ${fetchdata[0].SR_NAME}</td>
                                    <td className='tdall'>${(totalCount * 1 / 5).toFixed(2)}</td>
                                    <td className='tdall'>${(totalCount * 1 / 5).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className='tdall'>PANCHAYATS ${fetchdata[0].SR_NAME}</td>
                                    <td className='tdall'>${(totalCount * 3 / 5).toFixed(2)}</td>
                                    <td className='tdall'>${(totalCount * 3 / 5).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style={{fontWeight:'700',textAlign: 'center'}}>Total</td>
                                    <td style={{fontWeight:'700',textAlign: 'center'}}>${(totalCount * 3 / 5 + totalCount * 1 / 5 + totalCount * 1 / 5).toFixed(2)}</td>
                                    <td style={{fontWeight:'700',textAlign: 'center'}}>${(totalCount * 3 / 5 + totalCount * 1 / 5 + totalCount * 1 / 5).toFixed(2)}</td>
                                </tr>
                            </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1H = async (reqData) => {

    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total3Panchayat = 0;
      let total5Charges = 0;
      let totalNetAmount = 0;

      response.forEach(item => {
        totalTd += item.COUNT;
        totalDoc += item.COUNT_DOC;
        total3Panchayat += item.COUNT * 3 / 5;
        total5Charges += item.COUNT * 3 / 5 * 0.05;
        totalNetAmount += item.COUNT * 3 / 5 - item.COUNT * 3 / 5 * 0.05;

      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-H</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
          <tr style="font-size : 14px;">
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO Code</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR Name</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of the Local Authority</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Collected</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% Collection Charges</th>
              <th style="border:  1px solid #000;  width: 2%; padding: 2px;">Net Amount Payable To Panchayats</th>
          </tr>
      </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(item.COUNT * 3 / 5).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(item.COUNT * 3 / 5 * 0.05).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(item.COUNT * 3 / 5 - item.COUNT * 3 / 5 * 0.05).toFixed(2)}</td>
                </tr>
          `
          )
          .join('')}
      </tbody>
      ${reqData.docType === "pdf" ?

          `<tfoot>
          <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${(total3Panchayat).toFixed(2)}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${(total5Charges).toFixed(2)}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${(totalNetAmount).toFixed(2)}</td>
          </tr>
      </tfoot>`:
          `<tfoot>
      <tr style="font-size: 14px;">
      <td></td>
      <td></td>
      <td></td>
              <td style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${(total3Panchayat).toFixed(2)}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${(total5Charges).toFixed(2)}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;text-align: center;">${(totalNetAmount).toFixed(2)}</td>
          </tr>
      </tfoot>`
        }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2H = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-H</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
          <tr style="font-size : 14px;">
          <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF THE LOCAL AUTHORITY</th>
  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. COLLECTED</th>
  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% COLLECTION CHARGES</th>
  <th style="border:  1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYABLE TO PANCHYATS</th>
          </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                    <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
            <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
            <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
            <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
            <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>
            <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5 * 0.05}</td>
            <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5 - item.COUNT * 3 / 5 * 0.05}</td>
                    </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1I = async (reqData) => {

    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total3Panchayat = 0;
      let total5Charges = 0;
      let totalNetAmount = 0;
      let total1Zpp = 0;

      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        total3Panchayat += item.COUNT * 3 / 5;
        total5Charges += item.COUNT * 1 / 5 * 0.05;
        totalNetAmount += item.COUNT * 1 / 5 - item.COUNT * 1 / 5 * 0.05;
        total1Zpp += item.COUNT * 1 / 5;

      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-I</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
        <tr style="font-size : 14px;">
        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO Code</th>
        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR Name</th>
        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of The Sub Treasury</th>
        <th style="border:  1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected</th>
        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% Collection Charges to Regn</th>
        <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Net Amount Payable to ZPP</th>
        </tr>
      </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
            <tr key = ${index}>
            <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.TREASURY_NAME_STO}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)*0.05).toFixed(2)}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)-((item.COUNT*1/5)*0.05)).toFixed(2)}</td>
        
            </tr>
          `
          )
          .join('')}
      </tbody>
      ${reqData.docType === "pdf" ?
          `<tfoot>
    <tr style="font-size: 14px;">
        <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1Zpp.toFixed(2)}</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges.toFixed(2)}</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${(total1Zpp-total5Charges).toFixed(2)}</td>
    </tr>
</tfoot>`:
          `<tfoot>
<tr style="font-size: 14px;">
<td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
<td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1Zpp.toFixed(2)}</td>
<td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges.toFixed(2)}</td>
<td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${(total1Zpp-total5Charges).toFixed(2)}</td>
</tr>
</tfoot>`
        }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2I = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-I</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF THE SUB TREASURY</th>
                  <th style="border:  1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. COLLECTED</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% COLLECTION CHARGES TO REGN</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYABLE TO ZPP</th>
            </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                  <tr key = ${index}>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)*0.05).toFixed(2)}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)-((item.COUNT*1/5)*0.05)).toFixed(2)}</td>
                      </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1J = async (reqData) => {

    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total3Panchayat = 0;
      let total5Charges = 0;
      let totalNetAmount = 0;
      let total1Zpp = 0;

      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        total3Panchayat += item.COUNT * 3 / 5;
        total5Charges += item.COUNT * 1 / 5 * 0.05;
        totalNetAmount += item.COUNT * 3 / 5 - item.COUNT * 3 / 5 * 0.05;
        total1Zpp += item.COUNT * 1 / 5;

      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-J</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
          <tr style="font-size : 14px;">
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO Code</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR Name</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of the Sub Treasury</th>
              <th style="border:  1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. Collected</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% Collection Charges to Regn</th>
              <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Net Amount Payable to MPP</th>
          </tr>
      </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.TREASURY_NAME_STO}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)*0.05).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)-((item.COUNT*1/5)*0.05)).toFixed(2)}</td>
                    </tr>
          `
          )
          .join('')}
      </tbody>
       ${reqData.docType === "pdf" ?
          `<tfoot>
          <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1Zpp.toFixed(2)}</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges.toFixed(2)}</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${(total1Zpp-total5Charges).toFixed(2)}</td>
 </tr>
      </tfoot>`:
          `<tfoot>
          <tr style="font-size: 14px;">
             <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total1Zpp.toFixed(2)}</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges.toFixed(2)}</td>
        <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${(total1Zpp-total5Charges).toFixed(2)}</td>
 </tr>
      </tfoot>`
        }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2J = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-J</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF THE SUB TREASURY</th>
                <th style="border:  1px solid #000;  width: 2%; padding: 2px;">1/5th T.D. COLLECTED</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% COLLECTION CHARGES TO REGN</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYABLE TO MPP</th>
            </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT / 5}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)*0.05).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)-((item.COUNT*1/5)*0.05)).toFixed(2)}</td>
                    </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1K = async (reqData) => {

    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total3Panchayat = 0;
      let total5Charges = 0;
      let totalNetAmount = 0;

      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        total3Panchayat += item.COUNT * 3 / 5;
        total5Charges += item.COUNT * 3 / 5 * 0.05;
        totalNetAmount += item.COUNT * 3 / 5 - item.COUNT * 3 / 5 * 0.05;

      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-K</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
        <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">S.No.</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO Code</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR Name</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of The Sub Treasury</th>
            <th style="border:  1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. Colelcted</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% Charges to Regn Dept</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Net Amount Payable to Panchayats</th>
        </tr>
      </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                     <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                     <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                     <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                     <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.TREASURY_NAME_STO}</td>
                     <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>
                     <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)*0.05).toFixed(2)}</td>
                      <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)-((item.COUNT*1/5)*0.05)).toFixed(2)}</td>
        </tr>
          `
          )
          .join('')}
      </tbody>
       ${reqData.docType === "pdf" ?
          `<tfoot>
          <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat.toFixed(2)}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges.toFixed(2)}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalNetAmount.toFixed(2)}</td>
          </tr>
      </tfoot>`:
          `<tfoot>
      <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat.toFixed(2)}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges.toFixed(2)}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalNetAmount.toFixed(2)}</td>
          </tr>
      </tfoot>`
        }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2K = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-K</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF THE SUB TREASURY</th>
                <th style="border:  1px solid #000;  width: 2%; padding: 2px;">3/5th T.D. COLLECTED</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5%CHARGES TO REGN DEPT</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYABLE TO PANCHYATS</th>
            </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                  <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT * 3 / 5}</td>
                   <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)*0.05).toFixed(2)}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)-((item.COUNT*1/5)*0.05)).toFixed(2)}</td>
        
                  </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1L = async (reqData) => {

    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total3Panchayat = 0;
      let total5Charges = 0;
      let totalNetAmount = 0;
let srname=response[0].SR_NAME;
      response.forEach(item => {
        totalTd += item.COUNT;
        totalDoc += item.COUNT_DOC;
        total3Panchayat += item.COUNT * 3 / 5;
        total5Charges += item.COUNT * 3 / 5 * 0.05;
        totalNetAmount += item.COUNT * 3 / 5 - item.COUNT * 3 / 5 * 0.05;

      });
      console.log(response[0].SR_NAME,'****************************************');
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-L</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
        <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of The Local Authority</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD Collected</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% Collection Charges to Regn Dept</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Net Amount Payable to Local Bodies</th>
        </tr>
      </thead>
      <tbody>
           
                <tr>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${response[0].SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${totalTd}</td>
                   <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(totalTd*0.05).toFixed(2)}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(totalTd-(totalTd*0.05)).toFixed(2)}</td>
        </tr>
          
          
      </tbody>
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2L = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-L</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
          <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF LOCAL AUTHORITY</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD COLLECTED</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% COLLECTION CHARGES TO REGN DEPT</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYBALE TO LOCAL BODIES</th>
          </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)*0.05).toFixed(2)}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)-((item.COUNT*1/5)*0.05)).toFixed(2)}</td>
         </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1M = async (reqData) => {

    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total3Panchayat = 0;
      let total5Charges = 0;
      let totalNetAmount = 0;

      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        total3Panchayat += item.COUNT * 3 / 5;
        total5Charges += item.COUNT * 3 / 5 * 0.05;
        totalNetAmount += item.COUNT * 3 / 5 - item.COUNT * 3 / 5 * 0.05;

      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-M</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
        <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF LOCAL AUTHORITY</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD COLLECTED</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% COLLECTION CHARGES TO REGN DEPT</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYBALE TO LOCAL BODIES</th>
        </tr>
      </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)*0.05).toFixed(2)}</td>
        <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${((item.COUNT*1/5)-((item.COUNT*1/5)*0.05)).toFixed(2)}</td>
         </tr>
          `
          )
          .join('')}
      </tbody>
      ${reqData.docType === "pdf" ?
          `<tfoot>
          <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalNetAmount}</td>
          </tr>
      </tfoot>`:
          `<tfoot>
        <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalNetAmount}</td>
          </tr>
      </tfoot>`
        }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;
      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2M = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-M</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
          <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF LOCAL AUTHORITY</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD COLLECTED</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% COLLECTION CHARGES TO REGN DEPT</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYBALE TO LOCAL BODIES</th>
          </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(totalCount * 0.05).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(totalCount - totalCount * 0.05).toFixed(2)}</td>            
                </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1N = async (reqData) => {

    try {
      let query =`
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let totalTd = 0;
      let total3Panchayat = 0;
      let total5Charges = 0;
      let totalNetAmount = 0;

      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        total3Panchayat += item.COUNT * 3 / 5;
        total5Charges += item.COUNT * 3 / 5 * 0.05;
        totalNetAmount += item.COUNT * 3 / 5 - item.COUNT * 3 / 5 * 0.05;

      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-N</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
        <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF LOCAL AUTHORITY</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD COLLECTED</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% COLLECTION CHARGES TO REGN DEPT</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYBALE TO LOCAL BODIES</th>
        </tr>
      </thead>
      <tbody>
      ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(totalCount * 0.05).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(totalCount - totalCount * 0.05).toFixed(2)}</td>            
              </tr>
          `
          )
          .join('')}
      </tbody>
      ${reqData.docType === "pdf" ?
          `<tfoot>
          <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalNetAmount}</td>
          </tr>
      </tfoot>`:
          `<tfoot>
          <tr style="font-size: 14px;">
              <td colspan="4" style="border: 1px solid #000; width: 8%; padding: 2px;">Total</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total3Panchayat}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${total5Charges}</td>
              <td id="total-td-collected" style="border: 1px solid #000; width: 2%; padding: 2px;">${totalNetAmount}</td>
          </tr>
      </tfoot>`
        }
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;

      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };

    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2N = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;
      //  `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 
      //  JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //        ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //                by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-N</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
          <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SL. NO.</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SRO CODE</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">SR NAME</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF LOCAL AUTHORITY</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">TD COLLECTED</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% COLLECTION CHARGES TO REGN DEPT</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NET AMOUNT PAYBALE TO LOCAL BODIES</th>
          </tr>
        </thead>
        <tbody>
          ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_CODE}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SR_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LOCAL_BODY_NAME}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COUNT}</td>
                   <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(totalCount * 0.05).toFixed(2)}</td>
                    <td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${(totalCount - totalCount * 0.05).toFixed(2)}</td>            
                </tr>
                  `
          )
          .join('')}
        </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }


  report1PdfGenerateForm1O = async (reqData) => {

    try {
      let query = `
select t1.sr_code, t3.sr_name, t6.treasury_name_sto ,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(t1.td) AS COUNT ,count(t1.doct_no) as count_doc from 
srouser.tran_td_alloc t1
join tran_major t2 on t2.sr_code = t1.sr_code AND t2.book_no = t1.book_no AND t2.doct_no = t1.doct_no AND t2.reg_year = t1.reg_year
left join sr_master t3 on t2.sr_code = t3.sr_cd  
left join tran_sched t4 on t4.sr_code = t1.sr_code and t4.book_no = t1.book_no and t4.doct_no = t1.doct_no and t4.reg_year = t1.reg_year
left join hab_code t5 on t4.village_code + '01' = t5.hab_code
left join card.tran_td_alloc_master t6 on t4.village_code = t6.webland_code
where  t1.sr_code = ${reqData.SR_CODE} and
trunc(t1.time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy') and t2.rdoct_no IS not NULL
group by t1.LOCAL_BODY,t1.sr_code, t3.sr_name, t6.treasury_name_sto`;
      // `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.LOCAL_BODY AS LOCAL_BODY_NAME,sum(td) AS COUNT, count(t1.doct_no) as count_doc from srouser.tran_td_alloc t1 JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS not NULL) m
      //     ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year where t1.sr_Code= ${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')  group
      //             by t1.LOCAL_BODY,t1.sr_code `;
      let response = await this.orDao.oDBQueryService(query);
      let totalDoc = 0;
      let total3Panchayat = 0;
      let total5Charges = 0;
      let total1MPP = 0;
      let total1ZPP = 0;
      let total2MPP = 0;
      let total2ZPP = 0;

      response.forEach(item => {
        totalDoc += item.COUNT_DOC;
        total3Panchayat += item.COUNT * 3 / 5;
        total5Charges += item.COUNT * 3 / 5 * 0.05;
        total1MPP += item.COUNT * 1 / 5;
        total1ZPP += item.COUNT * 1 / 5;
        total2MPP += item.COUNT * 1 / 5 * 0.05;
        total2ZPP += item.COUNT * 1 / 5 * 0.05
      });
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
    <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px" /></div>
    <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
    <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS- FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
    <h4>FORM-O</h4>
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
      <thead>
        <tr style="font-size : 14px;">
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Name of Local Body</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Transfer Duty Collected</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% Collection Regn Dept</th>
            <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Net Amount Payable to Local Bodies</th>
        </tr>
      </thead>
      <tbody>
                 <tr>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th Panchayathis of ${response[0].SR_NAME}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total3Panchayat).toFixed(2)}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total5Charges).toFixed(2)}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total3Panchayat - total5Charges).toFixed(2)}</th>
                </tr>
                <tr>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th M.P.PS of ${response[0].SR_NAME}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total1MPP).toFixed(2)}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total2MPP).toFixed(2)}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total1MPP - total2MPP).toFixed(2)}</th>
                </tr>
                <tr>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th Z.P.PS of ${response[0].SR_NAME}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total1ZPP).toFixed(2)}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total2ZPP).toFixed(2)}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total1ZPP - total2ZPP).toFixed(2)}</th>
                </tr> 
                <tr>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Total</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total3Panchayat + total1MPP + total1ZPP).toFixed(2)}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${(total5Charges + total2MPP + total2ZPP).toFixed(2)}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${((total3Panchayat + total1MPP + total1ZPP)-(total5Charges + total2MPP + total2ZPP)).toFixed(2)}</th>
                </tr> 
      </tbody>
    </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
    `;
      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const headerCellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'center' },
        border: { bottom: { style: 'thin' } }
      });
      const headerRow = html.match(/<thead>[\s\S]*?<\/thead>/)[0];
      const headerCells = headerRow.split('</th>');
      headerCells.forEach((cell, cellIndex) => {
        const content = cell.replace(/<[^>]+>/g, '');
        worksheet.cell(1, cellIndex + 1).string(content).style(headerCellStyle);
      });
      const rows = html.split('</tr>').slice(1);
      const cellStyle = workbook.createStyle({
        font: { bold: false },
        alignment: { horizontal: 'center' }
      });
      const grandcellStyle = workbook.createStyle({
        font: { bold: true },
        alignment: { horizontal: 'right' }
      });
      rows.forEach((row, rowIndex) => {
        if (!this.containsUnwantedContent(row)) {
          const cells = row.split('</td>');
          cells.forEach((cell, cellIndex) => {
            const content = cell.replace(/<[^>]+>/g, '');
            worksheet.cell(rowIndex + 2, cellIndex + 1).string(content).style(cellStyle);
          });
        }
      });
      // worksheet.cell(rows.length + 2, 1, rows.length + 2, 19, true).string(`Grand Total :${response2[0].TOTAL_GRAND} `).style(grandcellStyle);
      const buffer = await workbook.writeToBuffer();
      const base64excel = buffer.toString('base64');

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf, excel: base64excel };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  report1PdfGenerateForm2O = async (reqData) => {

    try {
      let query = `select t1.sr_code, (select sr_name from sr_master where sr_cd = t1.sr_code) as sr_name,t1.tran_code AS DOCUMENT_CODE, t2.tran_desc AS DOCUMENT_TYPE,sum(td ) AS COUNT, count(t1.doct_no) as count_doc from  srouser.tran_td_alloc t1 JOIN card.tran_dir t2 ON CONCAT(t2.tran_maj_code, t2.tran_min_code) = t1.tran_code
      JOIN (SELECT DISTINCT sr_code, book_no, doct_no, reg_year FROM tran_major WHERE rdoct_no IS NOT NULL) m ON m.sr_code = t1.sr_code AND m.book_no = t1.book_no AND m.doct_no = t1.doct_no AND m.reg_year = t1.reg_year
      WHERE  t1.sr_Code=${reqData.SR_CODE} and trunc(time_Stamp) between TO_DATE('${reqData.FROM_DATE}','dd-mm-yyyy') and TO_DATE('${reqData.TO_DATE}','dd-mm-yyyy')
       and t1.LOCAL_BODY='${reqData.LOCAL_BODY}' group by t1.sr_code, t1.tran_code,t2.tran_desc`;

      let response = await this.orDao.oDBQueryService(query);
      const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
      const data = fsone.readFileSync(imagePath, { encoding: 'base64' });
      const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
      <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
      <h4 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${reqData.SR_CODE}</h4>
      <h5 style="margin:0px; margin-top : 5px">TD ALLOCATION REPORTS-FROM ${reqData.FROM_DATE} TO ${reqData.TO_DATE}</h5>
      <h4>FORM-O</h4>
      <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
            <tr style="font-size : 14px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">NAME OF LOCAL BODY</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Transfer D Collected</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">5% Collection Regn Dept</th>
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Net Amount Payable to Local Bodies</th>
            </tr>
        </thead>
        <tbody>
      ${response
          .map(
            (item, index) => `
                <tr key = ${index}>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">3/5th Panchayathis of ${item.SR_NAME}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total3Panchayat}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total5Charges}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total3Panchayat - total5Charges}</th>
                </tr>
                <tr key = ${index}>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th M.P.PS of ${item.SR_NAME}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total1MPP}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total2MPP}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total1MPP - total2MPP}</th>
                </tr>
                <tr key = ${index}>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">1/5th Z.P.PS of ${item.SR_NAME}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total1ZPP}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total2ZPP}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total1ZPP - total2ZPP}</th>
                </tr> 
                <tr key = ${index}>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Total</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total3Panchayat + total1MPP + total1ZPP}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total5Charges + total2MPP + total2ZPP}</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">${total1MPP - total2MPP + total1MPP - total2MPP + total1ZPP - total2ZPP}</th>
                </tr> 
               `
          )
          .join('')}
      </tbody>
      </table>
    </div>
    <div style="margin : 0; margin-right:20px; margin-left:20px;" >
    </div>
      `;

      const pdfBuffer = await this.generatePDFFromHTML(html);
      const base64Pdf = pdfBuffer.toString('base64');

      return { pdf: base64Pdf };
    } catch (ex) {
      Logger.error("tdAllocationHandler - getReport2 || Error :", ex);
      console.error("tdAllocationtdAllocationHandler - getReport2 || Error :", ex);
      throw constructCARDError(ex);
    }

  }
}
module.exports = tdAllocatons;