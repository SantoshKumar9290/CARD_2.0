const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const fsone = require("fs");
const path = require("path");
const fs = require("fs").promises;
const { generatePDFFromHTML } = require("./generatePDFFromHTML");
const { extractTextWithPositionsFromPDF } = require("../common/extractPDFtext");
const { encryptWithAESPassPhrase, encryptData, decryptData } = require("../utils/index");
const Esign = require('../services/esignService');
const { log } = require("util");
const axios = require("axios");
const https = require('https');
const { PDFDocument } = require('pdf-lib');
const handlebars = require('handlebars');
const { query } = require("../schemas/apiValidationSchemas/sqlQueryValidationSchema");


let instance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false
	})
  });
class DrJobServices {
	constructor() {
		this.orDao = new OrDao();
		this.esign = new Esign();
	}
	getDocumentsSroSrvc = async (reqData) => {
		try {
			let query = `SELECT * From tran_major where rdoct_no is not null and SR_CD=${reqData.SR_CD}`;
			let response = await this.orDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("DrServices - getDocumentsDrSrvc || Error :", ex);
			console.error("DrServices - getDocumentsDrSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	// getDocumentsDrSrvc = async (reqData) => {
	// 	try {
	// 		let query = `SELECT * From tran_major where rdoct_no is not null and sr_code=${reqData.srCode} AND REG_YEAR=${reqData.regYear} event=${reqData.EVENT}`;
	// 		let response = await this.orDao.oDBQueryService(query);
	// 		return response;
	// 	} catch (ex) {
	// 		Logger.error("DrServices - getDocumentsDrSrvc || Error :", ex);
	// 		console.error("DrServices - getDocumentsDrSrvc || Error :", ex);
	// 		throw constructCARDError(ex);
	// 	}
	// }
	saveDrJobSrvc = async (reqData) => {
		try {
			let query = `INSERT INTO srouser.dr_jobs (sr_code, book_no,doct_no, reg_year,rdoct_no, ryear, request_by,request_time, request_reasons, status,event)VALUES
			(${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.REQUEST_BY}',sysdate,'${reqData.REQUEST_REASONS}','${reqData.STATUS}',${reqData.EVENT})`;
			
			// let query = `INSERT INTO srouser.dr_jobs (sr_code, book_no,doct_no, reg_year,rdoct_no, ryear, request_by,request_time,response_by,response_time, request_reasons, event, status,new_doctno,reject_reasons,req_no)VALUES(${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.REQUEST_BY}',SYSDATE,'${reqData.RESPONSE_BY}',TO_DATE('${reqData.RESPONSE_TIME}','DD-MM-YYYY'),${reqData.REQUEST_REASONS},${reqData.EVENT},'${reqData.STATUS}',${reqData.NEW_DOCTNO},'${reqData.REJECT_REASONS}',${reqData.REQ_NO})`;
			console.log(query)
			let response = await this.orDao.oDbInsertDocs(query)
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - saveDrJobSrvc || Error :", ex);
			console.error("DrJobServices - saveDrJobSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	saveDrJobSrvcdoct = async (reqData) => {
		try {
			let query = `INSERT INTO srouser.dr_jobs (sr_code, book_no,doct_no, reg_year,rdoct_no, ryear, request_by,request_time, request_reasons, status,new_doctno,event)VALUES
			(${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.REQUEST_BY}',TO_DATE('${reqData.REQUEST_TIME}','DD-MM-YYYY'),'${reqData.REQUEST_REASONS}','${reqData.STATUS}',${reqData.NEW_DOCTNO},${reqData.EVENT})`;			
			// let query = `INSERT INTO srouser.dr_jobs (sr_code, book_no,doct_no, reg_year,rdoct_no, ryear, request_by,request_time,response_by,response_time, request_reasons, event, status,new_doctno,reject_reasons,req_no)VALUES(${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.REQUEST_BY}',SYSDATE,'${reqData.RESPONSE_BY}',TO_DATE('${reqData.RESPONSE_TIME}','DD-MM-YYYY'),${reqData.REQUEST_REASONS},${reqData.EVENT},'${reqData.STATUS}',${reqData.NEW_DOCTNO},'${reqData.REJECT_REASONS}',${reqData.REQ_NO})`;
			console.log(query)
			let response = await this.orDao.oDbInsertDocs(query)
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - saveDrJobSrvc || Error :", ex);
			console.error("DrJobServices - saveDrJobSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	getSroJobRequestStatus = async (reqData) => {
		try {
			let response= [];
			let query;
		if(reqData.EVENT && reqData.EVENT==='3'){	
			query= `SELECT * FROM tran_major b WHERE b.sr_code = ${reqData.SR_CODE} AND b.rdoct_no = ${reqData.RDOCT_NO} AND b.reg_year = ${reqData.REG_YEAR} AND b.book_no = ${reqData.BOOK_NO}`;
			response = await this.orDao.oDBQueryService(query);			
        if(response.length==0){
			query=` SELECT A.doct_no as RDOCT_NO, A.* FROM ind1 a WHERE a.sr_code = ${reqData.SR_CODE} AND a.doct_no = ${reqData.RDOCT_NO} AND a.reg_year = ${reqData.REG_YEAR} AND a.book_no = ${reqData.BOOK_NO}`;
			}
			}
		else{			
			// let query=`SELECT a.*, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId FROM srouser.dr_jobs a WHERE a.sr_code = ${reqData.SR_CODE} AND a.book_no = ${reqData.BOOK_NO} AND a.rdoct_no = ${reqData.RDOCT_NO} AND a.reg_year = ${reqData.REG_YEAR}`;
			// let query = `SELECT * FROM srouser.dr_jobs WHERE sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} AND rdoct_no = ${reqData.RDOCT_NO} AND reg_year = ${reqData.REG_YEAR}`;
			query=`SELECT a.*, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId FROM tran_major a WHERE a.sr_code = ${reqData.SR_CODE} AND a.book_no = ${reqData.BOOK_NO} AND a.rdoct_no = ${reqData.RDOCT_NO} AND a.ryear = ${reqData.REG_YEAR}`;
		}
		response = await this.orDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("SroJobServices - getSroJobStatus || Error :", ex);
			console.error("SroJobServices - getSroJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}	
	getSroJobStatus = async (reqData) => {
		console.log('drJobServices:: Inside of getSroJobStatus method ::::');
		try {
		    let query;
			if(reqData.EVENT && reqData.EVENT === '3'){	
			 query = `select a.*,b.app_id, r.REQ_ID from 
			srouser.dr_jobs a
			left join srouser.pde_doc_status_cr b on b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year
            join SROUSER.RESCAN_ESIGN_STATUS  r on r.sr_code = a.sr_code and r.book_no = a.book_no and r.doct_no = a.doct_no and r.reg_year = a.reg_year 
			where a.sr_code = :SR_CODE and a.event= :EVENT`
			}
			else{ 
				query = `select a.*,b.app_id as appId from 
			srouser.dr_jobs a
			left join srouser.pde_doc_status_cr b on b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year
			where a.sr_code = :SR_CODE and a.event= :EVENT`
			}
			let bindParams = {
				SR_CODE : reqData.SR_CODE,
				EVENT : reqData.EVENT
			}
			// let query=`SELECT a.*, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId FROM srouser.dr_jobs a WHERE a.sr_code = ${reqData.SR_CODE} and a.event=${reqData.EVENT}`;
			// let query = `SELECT * FROM srouser.dr_jobs WHERE sr_code = ${reqData.SR_CODE}`;

			// let query = `SELECT * FROM srouser.dr_jobs WHERE sr_code = ${reqData.SR_CODE} AND book_no =  ${reqData.BOOK_NO} AND event=${reqData.EVENT} `;
			let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindParams);
			console.log('drJobServices:: End of getSroJobStatus method ::::');
			return response;
		} catch (ex) {
			Logger.error("SroJobServices - getSroJobStatus || Error :", ex);
			console.error("SroJobServices - getSroJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getSroCode= async (reqData) => {
		try {
			let query=`SELECT * from card.sr_master where sr_name=${reqData.SR_NAME}`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("SroJobServices - getSroJobStatus || Error :", ex);
			console.error("SroJobServices - getSroJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	getRegDocDetails = async (reqData) => {
		try {
			let query = `SELECT * FROM srouser.dr_jobs WHERE sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} AND doct_no = ${reqData.DOCT_NO} AND new_doctno = ${reqData.NEW_DOCTNO} AND reg_year = ${reqData.REG_YEAR} AND event = ${reqData.EVENT} AND response_by='${reqData.RESPONSE_BY}`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("srojob - getDrJobStatus || Error :", ex);
			console.error("srojobs - getDrJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	swapRNoProcSvc = async (reqData)=>{
		try{
			let query = `begin srouser.swap_rdno(:srcode,:bookno,:doctno,:regyear,:rdoctno1,:rdoctno2,:mess); end;`;
			let obj ={
				srcode: {val:parseInt(reqData.srCode), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				bookno: {val:parseInt(reqData.bookNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				doctno:{val:parseInt(reqData.docNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				regyear: {val:parseInt(reqData.regYear), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				rdoctno1:{val:parseInt(reqData.redoctNo1), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				rdoctno2:{val:parseInt(reqData.redoctNo2), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				mess:{ type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_OUT}
			}
			console.log(query); 
			if(reqData.EXEMPTION_REASON){
				let q = `update srouser.pde_doc_status_cr set EXEMPTION_REASON='${reqData.EXEMPTION_REASON}', EXEMPTION_ID='${reqData.EXEMPTION_ID ? reqData.EXEMPTION_ID : ''}' WHERE SR_CODE=${reqData.srCode} AND BOOK_NO=${reqData.bookNo} AND DOCT_NO=${reqData.docNo} AND REG_YEAR=${reqData.regYear}`;
				await this.odbDao.oDbUpdate(q);
			}
			let details = await this.odbDao.getSProcedureODB(query,obj);
			return details;
		}catch(ex){
			Logger.error("AssignServices - asingRNoProcSvc || Error :", ex);
			console.error("AssignServices - asingRNoProcSvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	verifyDetailsStatus = async (reqData) => {
		try {
			let response = [];
			let query;
			let bindParams = {
				SR_CODE: reqData.SR_CODE,
				BOOK_NO: reqData.BOOK_NO,
				REG_YEAR: reqData.REG_YEAR,
				RDOCT_NO: reqData.RDOCT_NO,
			};
			if (reqData.EVENT && reqData.EVENT === '3') {
				query= `SELECT * FROM tran_major b WHERE b.sr_code = :SR_CODE AND b.rdoct_no = :RDOCT_NO AND b.reg_year = :REG_YEAR AND b.book_no = :BOOK_NO`;
				response = await this.orDao.oDBQueryServiceWithBindParams(query, bindParams);			
        if(response.length==0){
				query = `SELECT * FROM ind1 a WHERE a.sr_code = :SR_CODE AND a.doct_no = :RDOCT_NO AND a.reg_year = :REG_YEAR AND a.book_no = :BOOK_NO`;
				response = await this.orDao.oDBQueryServiceWithBindParams(query, bindParams);
			}
		if (response.length > 0) {
					bindParams.STATUS = reqData.STATUS;
					let drjobquery = `SELECT * FROM SROUSER.DR_JOBS D WHERE D.SR_CODE = :SR_CODE AND D.STATUS = :STATUS AND D.BOOK_NO = :BOOK_NO AND D.RDOCT_NO = :RDOCT_NO AND D.REG_YEAR = :REG_YEAR AND D.STATUS='P'`;
					response = await this.orDao.oDBQueryServiceWithBindParams(drjobquery, bindParams);
				}
			}
			else {
				bindParams.STATUS = reqData.STATUS;
				let drjobquery = `SELECT * FROM SROUSER.DR_JOBS D WHERE D.SR_CODE = :SR_CODE AND D.STATUS = :STATUS AND D.BOOK_NO = :BOOK_NO AND D.RDOCT_NO = :RDOCT_NO AND D.REG_YEAR = :REG_YEAR AND D.STATUS='P'`;
				response = await this.orDao.oDBQueryServiceWithBindParams(drjobquery, bindParams);
			}
			return response
		} catch (ex) {
			Logger.error("srojob - getDrJobStatus || Error :", ex);
			console.error("srojobs - getDrJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getDrJobStatusbySroName = async (reqData) => {
		try {
			let response;
			let query;
			if(reqData.EVENT && reqData.EVENT ==='3'){
				query = `SELECT r.req_id,a.*, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId  FROM srouser.dr_jobs a 
                        join  SROUSER.RESCAN_ESIGN_STATUS r on r.sr_code = a.sr_code and r.book_no = a.book_no and r.doct_no = a.doct_no and r.reg_year = a.reg_year
                        WHERE a.sr_code in (select sr_cd from sr_master where dr_cd= :DR_CD and sr_name=:SR_NAME) and a.status=:STATUS and a.event=:EVENT and r.SR_ESIGN_STATUS ='Y'`;
			// let query = `SELECT * FROM card.sr_master a, srouser.dr_jobs b WHERE dr_cd = ${reqData.DR_CD} AND a.sr_cd=b.sr_code and sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and event=${reqData.EVENT}`;
			// let response = await this.orDao.oDBQueryService(query);
			let bindParam = {
				DR_CD: reqData.DR_CD,
				SR_NAME: reqData.SR_NAME,
				STATUS: reqData.STATUS,
				EVENT: reqData.EVENT
			  }
			 response = await this.orDao.oDBQueryServiceWithBindParams(query, bindParam);
			}
			else{
			let query = `SELECT a.*, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId  FROM srouser.dr_jobs a WHERE a.sr_code=(select sr_cd from sr_master where dr_cd= '${reqData.DR_CD}' and sr_name='${reqData.SR_NAME}') and a.status='${reqData.STATUS}' and a.event=${reqData.EVENT}`;			// let query = `SELECT * FROM card.sr_master a, srouser.dr_jobs b WHERE dr_cd = ${reqData.DR_CD} AND a.sr_cd=b.sr_code and sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and event=${reqData.EVENT}`;
			 response = await this.orDao.oDBQueryService(query)
			}
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - getDrJobStatus || Error :", ex);
			console.error("DrJobServices - getDrJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	getDrJobStatus = async (reqData) => {
		try {
			let query = `SELECT a.*,(select sr_name from sr_master where sr_cd=a.sr_code) sr_name, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId  FROM srouser.dr_jobs a WHERE a.sr_code = ${reqData.SR_CODE} and a.status='${reqData.STATUS}' and a.event=${reqData.EVENT} and a.sr_code in (select sr_cd from sr_master where dr_cd= '${reqData.DR_CD}')`;
			// let query = `SELECT * FROM card.sr_master a, srouser.dr_jobs b WHERE dr_cd = ${reqData.DR_CD} AND a.sr_cd=b.sr_code and sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and event=${reqData.EVENT}`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - getDrJobStatus || Error :", ex);
			console.error("DrJobServices - getDrJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getsrname = async (reqData) => {
		try {
			let query = `select sr_name from sr_master where sr_cd=${reqData.SR_CD}`;
			// let query = `SELECT * FROM card.sr_master a, srouser.dr_jobs b WHERE dr_cd = ${reqData.DR_CD} AND a.sr_cd=b.sr_code and sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and event=${reqData.EVENT}`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - getsroname || Error :", ex);
			console.error("DrJobServices - getsroname || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getDrJobStatusdata = async (reqData) => {
		try {
			let query = `SELECT a.*,(select sr_name from sr_master where sr_cd=a.sr_code) sr_name,(select proceeding_date from srouser.dr_jobs_proceeding where sr_cd=a.sr_code) proceeding_date,(select reject_proceeding_date from srouser.dr_jobs_proceeding where sr_cd=a.sr_code) reject_proceeding_date, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId  FROM srouser.dr_jobs a WHERE a.sr_code = ${reqData.SR_CODE} and a.status='${reqData.STATUS}' and a.sr_code in (select sr_cd from sr_master where dr_cd= '${reqData.DR_CD}')`;
			// let query = `SELECT * FROM card.sr_master a, srouser.dr_jobs b WHERE dr_cd = ${reqData.DR_CD} AND a.sr_cd=b.sr_code and sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and event=${reqData.EVENT}`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - getDrJobStatus || Error :", ex);
			console.error("DrJobServices - getDrJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	editIndexDREnableSrvc = async (reqData) => {
		try {
			let query = `UPDATE srouser.dr_jobs set response_by='${reqData.RESPONSE_BY}',response_time=sysdate,status='${reqData.STATUS}' where sr_code=${reqData.SR_CODE} and book_no='${reqData.BOOK_NO}' and reg_year='${reqData.REG_YEAR}' and doct_no='${reqData.DOCT_NO}' and event='${reqData.EVENT}' and status='R'`;
			let response = await this.orDao.oDbUpdate(query)
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - editIndexDREnableSrvc || Error :", ex);
			console.error("DrJobServices - editIndexDREnableSrvc || Error :", ex);
			throw new CARDError({ err: ex });
		}
	}
	getSrCode = async (reqData) => {
		try {
			let query = `select * from pde_doc_status_cr where sr_code=${reqData.SR_CODE} and doc_rescan='${reqData.DOC_RESCAN}'`;
			// let query = `SELECT * FROM card.sr_master a, srouser.dr_jobs b WHERE dr_cd = ${reqData.DR_CD} AND a.sr_cd=b.sr_code and sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and event=${reqData.EVENT}`;
			console.log(query)
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - getsroname || Error :", ex);
			console.error("DrJobServices - getsroname || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	InsertrescanData = async (reqData) => {
		try {
			let insertquery = `Insert into PDE_DOC_STATUS_CR (APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, DOC_ACC, DOC_RESUBMIT, DOC_EKYC, DOC_CASH, DOC_ASSIGN, DOC_ESIGN, DOC_DIGI_SIGN, DOC_HANDOVER, DOC_ENDORS, DOC_BUNDLE, DOC_PEND, DOC_VERIFY, DOC_VERIFIED_BY, DOC_SUBDIV, DOC_MUTATION, DOC_TYPE, TIME_STAMP, EXEMPTION_REASON, EXEMPTION_ID, DOC_URBAN_MUTATION, DOC_COR, GS_SRCODE, BENEFICIARY_ID, BENEFICIARY_NAME, PUSH_STATUS, PUSH_ON,DOC_REFUSE,DOC_RESCAN) 
			values (SUBSTR(${reqData.REG_YEAR}, 3, 2) || LPAD(${reqData.SR_CODE},4,'0') || ${reqData.BOOK_NO} || LPAD(${reqData.DOCT_NO},6,'0') || SUBSTR(${reqData.REG_YEAR}, 2, 3), ${reqData.SR_CODE}, ${reqData.BOOK_NO}, ${reqData.DOCT_NO}, ${reqData.REG_YEAR}, 'Y', 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'N', null, null, null, null, null, 'P', trunc(SYSDATE), null, null, 'Y', 'Y', null, null, null, null, null,null,'R')`
			console.log(insertquery);			
			let response = await this.orDao.oDbInsertDocs(insertquery)
			return response;
		} catch (ex) {
			Logger.error("InsertProceedingDetails - drjobs || Error :", ex);
			console.error("InsertProceedingDetails - drjobs || Error :", ex);
			throw new CARDError({ err: ex });
		}
	}
	UpdatestatusByrescan = async (reqData) => {
		try {
			// let query = `UPDATE srouser.dr_jobs set response_by='${reqData.RESPONSE_BY}',response_time=sysdate,status='${reqData.STATUS}' where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and reg_year=${reqData.REG_YEAR} and event=${reqData.EVENT} and sr_code in (select sr_cd from sr_master where dr_cd='${reqData.DR_CD}')`;
			let query =`UPDATE PDE_DOC_STATUS_CR p
			SET p.DOC_RESCAN = 'A'
			WHERE p.SR_CODE =${reqData.SR_CODE}
			AND p.BOOK_NO =${reqData.BOOK_NO}
			AND p.REG_YEAR = ${reqData.REG_YEAR}
			AND EXISTS (
			SELECT 1
			FROM TRAN_MAJOR t
			WHERE p.SR_CODE = t.SR_CODE
			AND p.BOOK_NO = t.BOOK_NO
			AND p.REG_YEAR = t.REG_YEAR
			AND p.DOCT_NO = t.DOCT_NO
			AND t.RDOCT_NO =${reqData.RDOCT_NO})`;

			
			// let insertquery=`INSERT INTO srouser.dr_jobs_proceeding(SR_CD, BOOK_NO,RDOCT_NO, REG_YEAR,PROCEEDING_NO, PROCEEDING_DATE,REQUEST_TIME) VALUES (${reqData.SR_CD}, ${reqData.BOOK_NO},${reqData.RDOCT_NO}, ${reqData.REG_YEAR},${reqData.PROCEEDING_NO}, ${reqData.PROCEEDING_DATE},sysdate)`
			let response = await this.orDao.oDbUpdate(query)
			return response;
		} catch (ex) {
			Logger.error("UpdatestatusByDr - editIndexDREnableSrvc || Error :", ex);
			console.error("UpdatestatusByDr - editIndexDREnableSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	UpdatestatusBySro = async (reqData) => {
		try {
			let updatedFieldsQuery = `response_by='${reqData.RESPONSE_BY}' ,response_time=sysdate,status='${reqData.STATUS}'`;
			if(reqData.REQUEST_REASONS){
				updatedFieldsQuery = updatedFieldsQuery + `, request_reasons='${reqData.REQUEST_REASONS}'`
			}
			let query = `UPDATE srouser.dr_jobs set ${updatedFieldsQuery} where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and reg_year=${reqData.REG_YEAR} and event=${reqData.EVENT} ${String(reqData.EVENT) == '2' ? `and reference_id = '${reqData.REFERENCE_ID}'` : ''}`;
			let response = await this.orDao.oDbUpdate(query)
			return response;
		} catch (ex) {
			Logger.error("UpdatestatusBySro - editIndexDREnableSrvc || Error :", ex);
			console.error("UpdatestatusBySro - editIndexDREnableSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	UpdatestatusregdocBySro = async (reqData) => {
		try {
			let query = `UPDATE srouser.dr_jobs set response_by='${reqData.RESPONSE_BY}',new_doctno=${reqData.NEW_DOCTNO} ,response_time=sysdate,status='${reqData.STATUS}', request_reasons='${reqData.REQUEST_REASONS}' where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and reg_year=${reqData.REG_YEAR}`;
			let response = await this.orDao.oDbUpdate(query)
			return response;
		} catch (ex) {
			Logger.error("UpdatestatusBySro - editIndexDREnableSrvc || Error :", ex);
			console.error("UpdatestatusBySro - editIndexDREnableSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	InsertProceedingDetailsreject = async (reqData) => {
		try {
			let insertquery = `INSERT INTO srouser.dr_jobs_proceeding(SR_CD, BOOK_NO,RDOCT_NO,DOCT_NO, REG_YEAR,REJECT_PROCEEDING_DATE) VALUES (${reqData.SR_CD}, ${reqData.BOOK_NO},${reqData.RDOCT_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},TO_DATE('${reqData.REJECT_PROCEEDING_DATE}','DD-MM-YYYY'))`
			console.log(insertquery);
			let response = await this.orDao.oDbInsertDocs(insertquery)
			return response;
		} catch (ex) {
			Logger.error("InsertProceedingDetails - drjobs || Error :", ex);
			console.error("InsertProceedingDetails - drjobs || Error :", ex);
			throw new CARDError({ err: ex });
		}
	}
	// InsertProceedingDetails = async (reqData) => {
	// 	try {
	// 		let insertquery = `INSERT INTO srouser.dr_jobs_proceeding(SR_CD, BOOK_NO,RDOCT_NO,DOCT_NO, REG_YEAR,PROCEEDING_NO, PROCEEDING_DATE) VALUES (${reqData.SR_CD}, ${reqData.BOOK_NO},${reqData.RDOCT_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.PROCEEDING_NO},TO_DATE('${reqData.PROCEEDING_DATE}','DD-MM-YYYY'))`
	// 		console.log(insertquery);			
	// 		let response = await this.orDao.oDbInsertDocs(insertquery)
	// 		return response;
	// 	} catch (ex) {
	// 		Logger.error("InsertProceedingDetails - drjobs || Error :", ex);
	// 		console.error("InsertProceedingDetails - drjobs || Error :", ex);
	// 		throw new CARDError({ err: ex });
	// 	}
	// }














	InsertProceedingDetails = async (reqData) => {
		try {
			let insertquery = `INSERT INTO srouser.dr_jobs_proceeding(SR_CD, BOOK_NO, RDOCT_NO, DOCT_NO, REG_YEAR, PROCEEDING_NO, PROCEEDING_DATE) VALUES (${reqData.SR_CD}, ${reqData.BOOK_NO}, ${reqData.RDOCT_NO}, ${reqData.DOCT_NO}, ${reqData.REG_YEAR}, ${reqData.PROCEEDING_NO}, TO_DATE('${reqData.PROCEEDING_DATE}', 'DD-MM-YYYY'))`;
			console.log(insertquery);
			let response = await this.orDao.oDbInsertDocs(insertquery);
			if(!reqData.EVENT) {
				let query = `SELECT * FROM srouser.pde_doc_status_cr WHERE sr_code=${reqData.SR_CD} AND doct_no=${reqData.DOCT_NO} AND REG_YEAR=${reqData.REG_YEAR} AND BOOK_NO=${reqData.BOOK_NO}`;
				let result = await this.orDao.oDBQueryService(query);
				if (result.length > 0) {
					let query2 = `UPDATE srouser.pde_doc_status_cr SET doc_rescan='R', DOC_DIGI_SIGN = 'N' WHERE sr_code=${reqData.SR_CD} AND doct_no=${reqData.DOCT_NO} AND REG_YEAR=${reqData.REG_YEAR} AND BOOK_NO=${reqData.BOOK_NO}`;
					response = await this.orDao.oDbUpdate(query2);
				} else {
					let insertquery2 = `INSERT INTO PDE_DOC_STATUS_CR (APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, DOC_ACC, DOC_RESUBMIT, DOC_EKYC, DOC_CASH, DOC_ASSIGN, DOC_ESIGN, DOC_DIGI_SIGN, DOC_HANDOVER, DOC_ENDORS, DOC_BUNDLE, DOC_PEND, DOC_VERIFY, DOC_VERIFIED_BY, DOC_SUBDIV, DOC_MUTATION, DOC_TYPE, TIME_STAMP, EXEMPTION_REASON, EXEMPTION_ID, DOC_URBAN_MUTATION, DOC_COR, GS_SRCODE, BENEFICIARY_ID, BENEFICIARY_NAME, PUSH_STATUS, PUSH_ON, DOC_REFUSE, DOC_RESCAN) 
					VALUES (SUBSTR(${reqData.REG_YEAR}, 3, 2) || LPAD(${reqData.SR_CD}, 4, '0') || ${reqData.BOOK_NO} || LPAD(${reqData.DOCT_NO}, 6, '0') || SUBSTR(${reqData.REG_YEAR}, 2, 3), ${reqData.SR_CD}, ${reqData.BOOK_NO}, ${reqData.DOCT_NO}, ${reqData.REG_YEAR}, 'Y', 'N', 'Y', 'Y', 'Y', 'Y', 'N', 'Y', 'Y', 'Y', null, null, null, null, null, 'P', TRUNC(SYSDATE), null, null, 'Y', 'Y', null, null, null, null, null, null, 'R')`;
					console.log(insertquery2);
					response = await this.orDao.oDbInsertDocs(insertquery2);
				}
			}
			return response;
		} catch (ex) {
			Logger.error("InsertProceedingDetails - drjobs || Error :", ex);
			console.error("InsertProceedingDetails - drjobs || Error :", ex);
			throw new CARDError({ err: ex });
		}
	}
	
	// UpdatestatusByDr = async (reqData) => {
	// 	try {
	// 		let query = `UPDATE srouser.dr_jobs set response_by='${reqData.RESPONSE_BY}',response_time=sysdate,status='${reqData.STATUS}',reject_reasons='${reqData.REJECT_REASONS}', where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and reg_year=${reqData.REG_YEAR} and sr_code in (select sr_cd from sr_master where dr_cd='${reqData.DR_CD}')`;
			
	// 		// let query = `UPDATE srouser.dr_jobs set response_by='${reqData.RESPONSE_BY}',reject_reasons='${REJECT_REASONS}',response_time=sysdate,status='${reqData.STATUS}' where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and reg_year=${reqData.REG_YEAR} and sr_code in (select sr_cd from sr_master where dr_cd='${reqData.DR_CD}')`;
	// 		// let insertquery=`INSERT INTO srouser.dr_jobs_proceeding(SR_CD, BOOK_NO,RDOCT_NO, REG_YEAR,PROCEEDING_NO, PROCEEDING_DATE,REQUEST_TIME) VALUES (${reqData.SR_CD}, ${reqData.BOOK_NO},${reqData.RDOCT_NO}, ${reqData.REG_YEAR},${reqData.PROCEEDING_NO}, ${reqData.PROCEEDING_DATE},sysdate)`
	// 		let response = await this.orDao.oDbUpdate(query)
	// 		return response;
	// 	} catch (ex) {
	// 		Logger.error("UpdatestatusByDr - editIndexDREnableSrvc || Error :", ex);
	// 		console.error("UpdatestatusByDr - editIndexDREnableSrvc || Error :", ex);
	// 		throw new CARDError({ err: ex });
	// 	}
	// }
	UpdatestatusByDr = async (reqData) => {

        try {

            let query = `UPDATE srouser.dr_jobs set response_by='${reqData.RESPONSE_BY}',response_time=sysdate,status='${reqData.STATUS}',reject_reasons='${reqData.REJECT_REASONS}' where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and reg_year=${reqData.REG_YEAR} AND STATUS in ('P','S') and event=${reqData.EVENT} and sr_code in (select sr_cd from sr_master where dr_cd='${reqData.DR_CD}')`;

           

            // let query = `UPDATE srouser.dr_jobs set response_by='${reqData.RESPONSE_BY}',reject_reasons='${REJECT_REASONS}',response_time=sysdate,status='${reqData.STATUS}' where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and reg_year=${reqData.REG_YEAR} and sr_code in (select sr_cd from sr_master where dr_cd='${reqData.DR_CD}')`;

            // let insertquery=`INSERT INTO srouser.dr_jobs_proceeding(SR_CD, BOOK_NO,RDOCT_NO, REG_YEAR,PROCEEDING_NO, PROCEEDING_DATE,REQUEST_TIME) VALUES (${reqData.SR_CD}, ${reqData.BOOK_NO},${reqData.RDOCT_NO}, ${reqData.REG_YEAR},${reqData.PROCEEDING_NO}, ${reqData.PROCEEDING_DATE},sysdate)`

            let response = await this.orDao.oDbUpdate(query)

            return response;

        } catch (ex) {

            Logger.error("UpdatestatusByDr - editIndexDREnableSrvc || Error :", ex);

            console.error("UpdatestatusByDr - editIndexDREnableSrvc || Error :", ex);

            throw new CARDError({ err: ex });

        }

    }
	UpdatestatusByDraccept = async (reqData) => {
		try {
			let query = `UPDATE srouser.dr_jobs set response_by='${reqData.RESPONSE_BY}',response_time=sysdate,status='${reqData.STATUS}' where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and reg_year=${reqData.REG_YEAR} and event=${reqData.EVENT} AND STATUS='P' and sr_code in (select sr_cd from sr_master where dr_cd='${reqData.DR_CD}')`;
			// let insertquery=`INSERT INTO srouser.dr_jobs_proceeding(SR_CD, BOOK_NO,RDOCT_NO, REG_YEAR,PROCEEDING_NO, PROCEEDING_DATE,REQUEST_TIME) VALUES (${reqData.SR_CD}, ${reqData.BOOK_NO},${reqData.RDOCT_NO}, ${reqData.REG_YEAR},${reqData.PROCEEDING_NO}, ${reqData.PROCEEDING_DATE},sysdate)`
			let response = await this.orDao.oDbUpdate(query)
			return response;
		} catch (ex) {
			Logger.error("UpdatestatusByDr - editIndexDREnableSrvc || Error :", ex);
			console.error("UpdatestatusByDr - editIndexDREnableSrvc || Error :", ex);
			throw new CARDError({ err: ex });
		}
	}
	getFilePath = async (data) => {
		let loc = `select  Location from scanuser.img_base_cca where sro_code = ${data.SR_CODE} and book_no = ${data.BOOK_NO} and reg_year = ${data.REG_YEAR} and doct_no = ${data.DOC_NO}`;
		let result = await this.orDao.oDBQueryService(query);
		if (result) {
			result = result.split('.pdf')[0].split('');
			return result.reverse().join('').replaceAll('/', '@');
		} else {
			return 'test link';
		}
	}


//----Edit Index New Functionality-Esign Integration API'S------------------------//


	
	getSroJobStatusEditIndex = async (reqData) => {
		console.log('drJobServices:: Inside of getSroJobStatusEditIndex method ::::');
		try {
			let query = `select a.*,(select sr_path from srouser.EDIT_INDEX_ESIGN_FILE t where t.sr_code=a.sr_code and t.doct_no=a.doct_no and t.reg_year=a.reg_year and t.book_no=a.book_no and t.reference_id=a.reference_id and rownum=1) as sr_path,
			(select SERVICE_TYPE from srouser.EDIT_INDEX_ESIGN_FILE t where t.sr_code=a.sr_code and t.doct_no=a.doct_no and t.reg_year=a.reg_year and t.book_no=a.book_no and t.reference_id=a.reference_id and rownum=1) as SERVICE_TYPE,
			b.app_id as appId from 
			srouser.dr_jobs a
			left join srouser.pde_doc_status_cr b on b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year
			where a.sr_code = :SR_CODE and a.event= :EVENT`
			let bindParams = {
				SR_CODE : reqData.SR_CODE,
				EVENT : reqData.EVENT
			}
			// let query=`SELECT a.*, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId FROM srouser.dr_jobs a WHERE a.sr_code = ${reqData.SR_CODE} and a.event=${reqData.EVENT}`;
			// let query = `SELECT * FROM srouser.dr_jobs WHERE sr_code = ${reqData.SR_CODE}`;

			// let query = `SELECT * FROM srouser.dr_jobs WHERE sr_code = ${reqData.SR_CODE} AND book_no =  ${reqData.BOOK_NO} AND event=${reqData.EVENT} `;
			let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindParams);
			console.log('drJobServices:: End of getSroJobStatusEditIndex method ::::');
			return response;
		} catch (ex) {
			Logger.error("SroJobServices - getSroJobStatusEditIndex || Error :", ex);
			console.error("SroJobServices - getSroJobStatusEditIndex || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	getDrJobStatusbySroNameForEditIdex = async (reqData) => {
		try {
			let query = `SELECT a.*,(select sr_path from srouser.EDIT_INDEX_ESIGN_FILE t where t.sr_code=a.sr_code and t.doct_no=a.doct_no and t.reg_year=a.reg_year and t.book_no=a.book_no and rownum=1) as sr_path,(select FILE_COUNT from srouser.EDIT_INDEX_ESIGN_FILE t where t.sr_code=a.sr_code and t.doct_no=a.doct_no and t.reg_year=a.reg_year and t.book_no=a.book_no and rownum=1) as FILE_COUNT, (select b.app_id from srouser.pde_doc_status_cr b where b.sr_code = a.sr_code and b.book_no = a.book_no and b.doct_no = a.doct_no and b.reg_year = a.reg_year) as appId  FROM srouser.dr_jobs a WHERE a.sr_code=(select sr_cd from sr_master where dr_cd= '${reqData.DR_CD}' and sr_name='${reqData.SR_NAME}') and a.status='${reqData.STATUS}' and a.event=${reqData.EVENT}`;
			// let query = `SELECT * FROM card.sr_master a, srouser.dr_jobs b WHERE dr_cd = ${reqData.DR_CD} AND a.sr_cd=b.sr_code and sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and event=${reqData.EVENT}`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("DrJobServices - getDrJobStatus || Error :", ex);
			console.error("DrJobServices - getDrJobStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	rescanpdfpreviewSrvc = async (reqData) => {
		try {
			const filePath = `${process.env.file_path}/${reqData.SR_CODE}/${reqData.BOOK_NO}/${reqData.REG_YEAR}/${reqData.DOCT_NO}/RescanRequest${reqData.REQ_NO}.pdf`;
			const pdfPath = path.join(__dirname, filePath);
			return new Promise((resolve, reject) => {
				fsone.readFile(pdfPath, (err, data) => {
					if (err) {
						console.error('Error reading PDF file:', err);
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		} catch (ex) {
			console.error("Error in PDFPreview:", ex);
			throw ex;
		}
	};

	convertBase64ToPdf = async (base64String) => {
		const decodedBuffer = Buffer.from(base64String, 'base64');
		const pdfDoc = await PDFDocument.load(decodedBuffer);
		return pdfDoc.save();
	}
	savePdfToFile = async (pdfBytes, filePath) => {
		await fs.writeFile(filePath, pdfBytes);
		console.log(`PDF saved to ${filePath}`);
		return true;
	}

	pendingEsignListSRVC = async (reqData) => {
		try {

			let bindparam = {};
			const { SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, esignstatus } = reqData;
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

				// const fileResponse = await axios(eSignConfig);
				let fileResponse = await instance.request(eSignConfig);
				if (fileResponse == null || fileResponse.data == null || fileResponse.data.data == undefined) {
					console.log('Pending Esign was not completed');
					esign_status = 0
					return esign_status

				} else {
					let query5;
					const base64Pdf = fileResponse.data.data;
					const pdfBytes = await this.convertBase64ToPdf(base64Pdf);
					const filePath = `${process.env.file_path}/${reqData.SR_CODE}/${reqData.BOOK_NO}/${reqData.REG_YEAR}/${reqData.DOCT_NO}/RescanRequest${reqData.REQ_NO}.pdf`;
					const pdfPath = path.join(__dirname, filePath);
					await this.savePdfToFile(pdfBytes, pdfPath);
					let esignstat = reqData.esignfor === 'SRO' ? ` SR_esign_status = 'Y', SR_TIME_STAMP = SYSDATE ` : ` DR_esign_status = 'Y', DR_TIME_STAMP = SYSDATE `
					query5 = `UPDATE SROUSER.RESCAN_ESIGN_STATUS SET ${esignstat}  WHERE sr_code = :SR_CODE  AND book_no = :BOOK_NO  AND DOCT_NO = :DOCT_NO AND REG_YEAR = :REG_YEAR and req_id=:REQ_NO`;

					let binds = {
						SR_CODE: reqData.SR_CODE,
						BOOK_NO: reqData.BOOK_NO,
						DOCT_NO: reqData.DOCT_NO,
						REG_YEAR: reqData.REG_YEAR,
						REQ_NO: reqData.REQ_NO
					};
					esign_status = await this.orDao.oDbInsertDocsWithBindParams(query5, binds);
					console.log('PDF saved successfully');
					if (esign_status > 0) {
						if (reqData.esignfor === 'SRO') {
							let query = `INSERT INTO SROUSER.DR_JOBS (SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, RDOCT_NO, RYEAR, REQUEST_BY, REQUEST_TIME, REQUEST_REASONS, STATUS, EVENT,REQ_NO ) VALUES (
					                    :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :RDOCT_NO, :RYEAR, :REQUEST_BY, SYSDATE, :REQUEST_REASONS, :STATUS, :EVENT, :REQ_NO )`;
							let bindParam = {
								SR_CODE: reqData.SR_CODE,
								BOOK_NO: reqData.BOOK_NO,
								DOCT_NO: reqData.DOCT_NO,
								REG_YEAR: reqData.REG_YEAR,
								RDOCT_NO: reqData.RDOCT_NO,
								RYEAR: reqData.RYEAR,
								REQUEST_BY: reqData.REQUEST_BY,
								REQUEST_REASONS: reqData.REQUEST_REASONS,
								STATUS: reqData.STATUS,
								EVENT: reqData.EVENT,
								REQ_NO: reqData.REQ_NO
							};

							let drresult = await this.orDao.oDbInsertDocsWithBindParams(query, bindParam);
						}
						else {
							let query = `UPDATE SROUSER.DR_JOBS SET RESPONSE_BY = :RESPONSE_BY, RESPONSE_TIME = SYSDATE, STATUS = :STATUS WHERE SR_CODE = :SR_CODE   AND BOOK_NO = :BOOK_NO  AND RDOCT_NO = :RDOCT_NO  AND REG_YEAR = :REG_YEAR AND EVENT = :EVENT AND STATUS = 'P' AND SR_CODE IN (SELECT SR_CD FROM SR_MASTER WHERE DR_CD = :DR_CD)`;
							let bindParams = {
								RESPONSE_BY: reqData.RESPONSE_BY,
								STATUS: reqData.STATUS,
								SR_CODE: reqData.SR_CODE,
								BOOK_NO: reqData.BOOK_NO,
								RDOCT_NO: reqData.RDOCT_NO,
								REG_YEAR: reqData.REG_YEAR,
								EVENT: reqData.EVENT,
								DR_CD: reqData.DR_CD
							};
							let TRANbinds = {
								SR_CODE: reqData.SR_CODE,
								BOOK_NO: reqData.BOOK_NO,
								DOCT_NO: reqData.RDOCT_NO,
								REG_YEAR: reqData.REG_YEAR,
							};
							let doctypeQuery = `select * from tran_major where sr_code=:SR_CODE AND book_no = :BOOK_NO  AND RDOCT_NO = :DOCT_NO AND REG_YEAR = :REG_YEAR`
							let docttype = await this.orDao.oDBQueryServiceWithBindParams(doctypeQuery, TRANbinds);
							let response = await this.orDao.oDbInsertDocsWithBindParams(query, bindParams);
							let bindParams2 = {
								SR_CODE: reqData.SR_CODE,
								DOCT_NO: docttype.length > 0 ? reqData.DOCT_NO : reqData.RDOCT_NO,
								REG_YEAR: reqData.REG_YEAR,
								BOOK_NO: reqData.BOOK_NO
							};
							let PDEquery = `MERGE INTO SROUSER.PDE_DOC_STATUS_CR dst
							               USING( SELECT  : SR_CODE AS SR_CODE, : DOCT_NO AS DOCT_NO, : REG_YEAR AS REG_YEAR, : BOOK_NO AS BOOK_NO FROM DUAL ) src	ON(
								           dst.SR_CODE = src.SR_CODE AND dst.DOCT_NO = src.DOCT_NO AND dst.REG_YEAR = src.REG_YEAR AND dst.BOOK_NO = src.BOOK_NO ) WHEN MATCHED THEN 
                                           UPDATE SET DOC_RESCAN = 'R', DOC_DIGI_SIGN = 'N' 
                                           WHEN NOT MATCHED THEN INSERT(APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, DOC_ACC, DOC_RESUBMIT,	DOC_EKYC, DOC_CASH, DOC_ASSIGN, DOC_ESIGN, DOC_DIGI_SIGN, DOC_HANDOVER,
								           DOC_ENDORS, DOC_BUNDLE, DOC_PEND, DOC_VERIFY, DOC_VERIFIED_BY, DOC_SUBDIV, DOC_MUTATION, DOC_TYPE, TIME_STAMP, EXEMPTION_REASON, EXEMPTION_ID,
								           DOC_URBAN_MUTATION, DOC_COR, GS_SRCODE, BENEFICIARY_ID, BENEFICIARY_NAME,
								           PUSH_STATUS, PUSH_ON, DOC_REFUSE, DOC_RESCAN )							
										   VALUES( SUBSTR(:REG_YEAR, 3, 2) || LPAD(:SR_CODE, 4, '0') || :BOOK_NO || LPAD(:DOCT_NO, 6, '0') || SUBSTR(:REG_YEAR, 2, 3), :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR,'Y', 'N', 'Y', 'Y', 'Y', 'Y', 'N', 'Y',
                                           'Y', 'Y', NULL, NULL, NULL, 'Y', 'Y', 'P', TRUNC(SYSDATE), NULL, NULL, 'Y', 'Y', NULL, NULL, NULL, NULL, NULL,NULL, 'R')`;
							const PDEresponse = await this.orDao.oDbInsertDocsWithBindParams(PDEquery, bindParams2);
							let proceedingquery = `INSERT INTO srouser.dr_jobs_proceeding ( SR_CD, BOOK_NO, RDOCT_NO, REG_YEAR, PROCEEDING_NO, PROCEEDING_DATE, REQUEST_TIME, DOCT_NO) VALUES (:SR_CODE, :BOOK_NO, :RDOCT_NO, :REG_YEAR, :PROCEEDING_NO, TO_DATE(:PROCEEDING_DATE, 'YYYY-MM-DD'), sysdate, :DOCT_NO) `;
							let proceedingParams = {
								SR_CODE: reqData.SR_CODE,
								BOOK_NO: reqData.BOOK_NO,
								RDOCT_NO: reqData.RDOCT_NO,
								REG_YEAR: reqData.REG_YEAR,
								PROCEEDING_NO: reqData.PROCEEDING_NO,
								PROCEEDING_DATE: reqData.PROCEEDING_DATE,
								DOCT_NO: reqData.DOCT_NO
							};
							const prodeedingresult = await this.orDao.oDbInsertDocsWithBindParams(proceedingquery, proceedingParams);
						}

					}
					return esign_status

				}
			}
		} catch (ex) {
			console.error("drjobServices - pendingEsignList || Error :", ex);
			throw ex;
		}
	};

	rescanDrJobSrvc = async (reqData) => {
		try {
			// let query = `INSERT INTO srouser.dr_jobs (sr_code, book_no,doct_no, reg_year,rdoct_no, ryear, request_by,request_time, request_reasons, status,event)VALUES
			// (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.REQUEST_BY}',sysdate,'${reqData.REQUEST_REASONS}','${reqData.STATUS}',${reqData.EVENT})`;

			// let query = `INSERT INTO srouser.dr_jobs (sr_code, book_no,doct_no, reg_year,rdoct_no, ryear, request_by,request_time,response_by,response_time, request_reasons, event, status,new_doctno,reject_reasons,req_no)VALUES(${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.REQUEST_BY}',SYSDATE,'${reqData.RESPONSE_BY}',TO_DATE('${reqData.RESPONSE_TIME}','DD-MM-YYYY'),${reqData.REQUEST_REASONS},${reqData.EVENT},'${reqData.STATUS}',${reqData.NEW_DOCTNO},'${reqData.REJECT_REASONS}',${reqData.REQ_NO})`;
			// let response = await this.orDao.oDbInsertDocs(query);
			let bindParam = {
				SR_CODE: reqData.SR_CODE
			}
			// let masterquery = `SELECT a.sr_cd, a.sr_name, c.DR_NAME
			// FROM sr_master a
			// JOIN CARD.MST_REVREGDIST c ON a.dr_cd = c.dr_code
			// WHERE a.sr_cd = :SR_CODE`;
			// 	  let mastreresponse = await this.orDao.oDBQueryServiceWithBindParams(masterquery, bindParam);

			const filePath = `${process.env.file_path}/${reqData.SR_CODE}/${reqData.BOOK_NO}/${reqData.REG_YEAR}/${reqData.DOCT_NO}/RescanRequest${reqData.REQ_NO}.pdf`;
			const pdfPath = path.join(__dirname, filePath);
			const textWithPositions = await extractTextWithPositionsFromPDF(pdfPath);
			const searchText = "District Registrar";
			const signaturePosition = textWithPositions.find((item) =>
				item.text.includes(searchText)
			);
			let roundedPosition;
			if (signaturePosition) {
				roundedPosition = {
					x: Math.round(signaturePosition.position.x),
					y: Math.round(signaturePosition.position.y),
					pageNo: signaturePosition.page,
				};
			}

			// for (let i = 0; response1.length > i; i++) {
			let emplparam = {
				SR_CODE: reqData.EMPL_SRCD,
				EMPL_ID: reqData.EMPL_ID
			}
			let emplquery = ` select elm.*,(select DR_NAME from dr_master where dr_cd =(select dr_cd from sr_master where sr_cd= :SR_CODE)) as Dr_name from employee_login_master elm WHERE sr_code = :SR_CODE and EMPL_ID=:EMPL_ID and ROWNUM=1`;
			let emplresponse = await this.orDao.oDBQueryServiceWithBindParams(emplquery, emplparam);
			const pdfBuffer = await require("fs").promises.readFile(pdfPath);
			const base64Pdf = pdfBuffer.toString("base64");
			let transactionID = new Date().getTime();
			let eSignData = JSON.stringify({
				"rrn": transactionID,
				"coordinates_location": 'Top_Right',
				"coordinates": `${roundedPosition.pageNo}-100,${roundedPosition.y},50,130;`,
				"doctype": 'PDF',
				"uid": emplresponse[0]?.AADHAR.length > 12 ? decryptData(emplresponse[0].AADHAR) : emplresponse[0].AADHAR,
				"signername": emplresponse[0].EMPL_NAME?.substring(0, 50),
				"signerlocation": `${emplresponse[0].DR_NAME}`,
				"filepassword": '',
				"signreason": 'Rescan eSign',
				"authmode": 2,
				"webhookurl": process.env.DR_RESCAN_URL,
				"file": base64Pdf
			});
			let esignUrlData = await this.orDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
			if (esignUrlData == null || esignUrlData.length == 0) {
				throw Error('Esign Urls Not Found');
			}
			if (eSignData) {
				eSignData = JSON.parse(eSignData);
				let queryupdate = `UPDATE SROUSER.RESCAN_ESIGN_STATUS T
SET 
    T.PAGE_NO = :PAGE_NO,
    T.DR_COORDINATES = :DR_COORDINATES,
    T.DR_AADHAR = :DR_AADHAR,
    T.DR_ESIGN_STATUS = 'P',
    T.DR_ID = :DR_ID,
    T.DR_DN_QUALIFIER = :DR_DN_QUALIFIER,
    T.DR_NAME = :DR_NAME,
    T.DR_TIME_STAMP = SYSDATE
WHERE 
    T.SR_CODE = :SR_CODE 
    AND T.BOOK_NO = :BOOK_NO 
    AND T.DOCT_NO = :DOCT_NO 
    AND T.REG_YEAR = :REG_YEAR`;

				let insertParams = {
					SR_CODE: reqData.SR_CODE,
					BOOK_NO: reqData.BOOK_NO,
					DOCT_NO: reqData.DOCT_NO,
					REG_YEAR: reqData.REG_YEAR,
					PAGE_NO: roundedPosition.pageNo,
					DR_COORDINATES: `50,${roundedPosition.y},50,${roundedPosition.x - 230}`,
					DR_AADHAR: emplresponse[0]?.AADHAR,
					DR_NAME: emplresponse[0]?.EMPL_NAME,
					DR_ID: emplresponse[0]?.EMPL_ID,
					DR_DN_QUALIFIER: transactionID,
				};
				//   let queryupdate = `update SROUSER.RESCAN_ESIGN_STATUS set SR_DN_QUALIFIER = '${eSignData.rrn}' where sr_code = ${reqData.SR_CODE}  and DOCT_NO = ${reqData.DOCT_NO} and book_no = 1 and name = '${eSignData.signername}'`;
				const resultupdate = await this.orDao.oDbInsertDocsWithBindParams(queryupdate, insertParams);
			}
			let encryptedData1 = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
			let esignUrl = parseInt(reqData.SR_CODE) % 2 == 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
			let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, encryptedData1);
			return { result: eSignData, data: eSignReponse }
		} catch (ex) {
			Logger.error("DrJobServices - saveDrJobSrvc || Error :", ex);
			console.error("DrJobServices - saveDrJobSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	saveScanDrJobSrvc = async (reqData) => {
		try {
				// let query = `INSERT INTO srouser.dr_jobs (sr_code, book_no,doct_no, reg_year,rdoct_no, ryear, request_by,request_time, request_reasons, status,event)VALUES
				// (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.REQUEST_BY}',sysdate,'${reqData.REQUEST_REASONS}','${reqData.STATUS}',${reqData.EVENT})`;

				// let query = `INSERT INTO srouser.dr_jobs (sr_code, book_no,doct_no, reg_year,rdoct_no, ryear, request_by,request_time,response_by,response_time, request_reasons, event, status,new_doctno,reject_reasons,req_no)VALUES(${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.REQUEST_BY}',SYSDATE,'${reqData.RESPONSE_BY}',TO_DATE('${reqData.RESPONSE_TIME}','DD-MM-YYYY'),${reqData.REQUEST_REASONS},${reqData.EVENT},'${reqData.STATUS}',${reqData.NEW_DOCTNO},'${reqData.REJECT_REASONS}',${reqData.REQ_NO})`;
				// let response = await this.orDao.oDbInsertDocs(query);

				const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
				let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
				let bindParam = {
					SR_CODE: reqData.SR_CODE
				}
				let masterquery = `SELECT a.sr_cd, a.sr_name, c.DR_NAME ,(select DR_NAME from dr_master where dr_cd =(select dr_cd from sr_master where sr_cd= :SR_CODE)) as DRO_name
			FROM sr_master a
			JOIN CARD.MST_REVREGDIST c ON a.dr_cd = c.dr_code
			WHERE a.sr_cd = :SR_CODE`;
				let mastreresponse = await this.orDao.oDBQueryServiceWithBindParams(masterquery, bindParam);
				const templatePath = path.join(__dirname, '../reports/rescanReq/rescanReqform.hbs');
				const templateSource = fsone.readFileSync(templatePath, 'utf8');
				const template = handlebars.compile(templateSource);

				const html = template({
					Imagedatapath,
					SR_NAME: mastreresponse[0].SR_NAME,
					DR_NAME: mastreresponse[0].DR_NAME,
					DRO_NAME: mastreresponse[0].DRO_NAME,
					DATE: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
					RDOCT_NO: reqData.RDOCT_NO,
					REQUEST_REASONS: reqData.REQUEST_REASONS
				});

				let REQNOQuery = `select (NVL(MAX(Req_id), 0)+1) as REQ_NO from SROUSER.RESCAN_ESIGN_STATUS where sr_code=:SR_CODE and reg_year=:REG_YEAR`;
				let reqbinds = {
					SR_CODE: reqData.SR_CODE,
					REG_YEAR: reqData.REG_YEAR
				}
				let REQNores = await this.orDao.oDBQueryServiceWithBindParams(REQNOQuery, reqbinds);

				let documentsFolderPath = path.join(__dirname, `${process.env.file_path}/${reqData.SR_CODE}/${reqData.BOOK_NO}/${reqData.REG_YEAR}/${reqData.DOCT_NO}/`);

				if (!fsone.existsSync(documentsFolderPath)) {
					fsone.mkdirSync(documentsFolderPath, { recursive: true });
				}
				const filename = `${documentsFolderPath}RescanRequest${REQNores[0].REQ_NO}.pdf`;
				await generatePDFFromHTML(html, filename, '');

				const textWithPositions = await extractTextWithPositionsFromPDF(filename);
				const searchText = "Sub-Registrar";
				const signaturePosition = textWithPositions.find((item) =>
					item.text.includes(searchText)
				);
				let roundedPosition;
				if (signaturePosition) {
					roundedPosition = {
						x: Math.round(signaturePosition.position.x),
						y: Math.round(signaturePosition.position.y),
						pageNo: signaturePosition.page,
					};
				}
				let emplparam = {
					SR_CODE: reqData.SR_CODE,
					EMPL_ID: reqData.REQUEST_BY
				}
				let emplquery = ` select elm.*,(select sr_name from sr_master where sr_cd=elm.sr_code) as sr_name from employee_login_master elm WHERE sr_code = :SR_CODE and EMPL_ID=:EMPL_ID and ROWNUM=1`;
				let emplresponse = await this.orDao.oDBQueryServiceWithBindParams(emplquery, emplparam);
				let insertquery = ` MERGE INTO SROUSER.RESCAN_ESIGN_STATUS tgt  USING ( SELECT :SR_CODE AS SR_CODE, :BOOK_NO AS BOOK_NO, :DOCT_NO AS DOCT_NO, :REG_YEAR AS REG_YEAR FROM DUAL ) src
                                   ON ( tgt.SR_CODE = src.SR_CODE AND tgt.BOOK_NO = src.BOOK_NO AND tgt.DOCT_NO = src.DOCT_NO AND tgt.REG_YEAR = src.REG_YEAR )
                                   WHEN MATCHED THEN  UPDATE SET PAGE_NO = :PAGE_NO, COORDINATES = :COORDINATES, SR_TIME_STAMP = SYSDATE, AADHAR = :AADHAR, SR_DN_QUALIFIER = :SR_DN_QUALIFIER, NAME = :NAME, SR_ESIGN_STATUS = :SR_ESIGN_STATUS, SR_ID = :SR_ID, DR_ESIGN_STATUS = :DR_ESIGN_STATUS,
                                   DR_ID = :DR_ID, DR_DN_QUALIFIER = :DR_DN_QUALIFIER, DR_NAME = :DR_NAME,DR_TIME_STAMP = NULL, REQ_ID = :REQ_NO WHEN NOT MATCHED THEN INSERT (
                                   SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, PAGE_NO, COORDINATES, SR_TIME_STAMP, AADHAR, SR_DN_QUALIFIER, NAME, SR_ESIGN_STATUS, SR_ID, DR_ESIGN_STATUS, DR_ID, DR_DN_QUALIFIER, DR_NAME, DR_TIME_STAMP, REQ_ID, RDOCT_NO) VALUES (
                                   :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :PAGE_NO, :COORDINATES, SYSDATE, :AADHAR, :SR_DN_QUALIFIER, :NAME, :SR_ESIGN_STATUS, :SR_ID, :DR_ESIGN_STATUS, :DR_ID, :DR_DN_QUALIFIER, :DR_NAME, NULL, :REQ_NO, :RDOCT_NO )`;
				let transactionID = new Date().getTime();
				let insertParams = {
					SR_CODE: reqData.SR_CODE,
					BOOK_NO: reqData.BOOK_NO,
					DOCT_NO: reqData.DOCT_NO,
					REG_YEAR: reqData.REG_YEAR,
					PAGE_NO: `${roundedPosition.pageNo}`,
					COORDINATES: `50,${roundedPosition.x},50,100`,
					AADHAR: emplresponse[0]?.AADHAR,
					SR_DN_QUALIFIER: transactionID,
					NAME: emplresponse[0]?.EMPL_NAME,
					SR_ESIGN_STATUS: 'P',
					SR_ID: emplresponse[0]?.EMPL_ID,
					DR_ESIGN_STATUS: 'P',
					DR_ID: '',
					DR_DN_QUALIFIER: '',
					DR_NAME: '',
					REQ_NO: REQNores[0].REQ_NO,
					RDOCT_NO: reqData.RDOCT_NO,
				};
				let insertresponse = await this.orDao.oDbInsertDocsWithBindParams(insertquery, insertParams);
				let bitmap = fsone.readFileSync(filename);
				let convertBase64 = bitmap.toString('base64');
				let base64Pdf = convertBase64
				let eSignData = JSON.stringify({
					"rrn": transactionID,
					"coordinates_location": 'Top_Right',
					"coordinates": `${roundedPosition.pageNo}-${roundedPosition.x + 270},${roundedPosition.y},50,130;`,
					"doctype": 'PDF',
					"uid": emplresponse[0]?.AADHAR.length > 12 ? decryptData(emplresponse[0].AADHAR) : emplresponse[0].AADHAR,
					"signername": emplresponse[0].EMPL_NAME?.substring(0, 50),
					"signerlocation": `${emplresponse[0].SR_NAME}`,
					"filepassword": '',
					"signreason": 'Rescan eSign',
					"authmode": 2,
					"webhookurl": process.env.SRO_RESCAN_URL,
					"file": base64Pdf
				});
				let esignUrlData = await this.orDao.oDBQueryService(`Select * from SROUSER.esign_urls`);

				if (esignUrlData == null || esignUrlData.length == 0) {
					throw Error('Esign Urls Not Found');
				}
				let esignRequestData = encryptWithAESPassPhrase(eSignData, "igrsSecretPhrase");
				let esignUrl = parseInt(reqData.SR_CODE) % 2 == 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
				let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
				let respdata = {
					"rrn": transactionID,
					"REQ_NO": REQNores[0].REQ_NO

				}
				return { result: respdata, data: eSignReponse }
			
			
		} catch (ex) {
			Logger.error("DrJobServices - saveScanDrJobSrvc || Error :", ex);
			console.error("DrJobServices - saveScanDrJobSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getSRFromAppId = (APP_ID) =>{
		let cashReceiptSro = APP_ID.slice(2, 6); 
        if (cashReceiptSro.startsWith('0')) {
          cashReceiptSro = cashReceiptSro.slice(1);
        }
		return cashReceiptSro
	}

	getResubmitSignedDocument = async (reqData) => {
		try {
			const { SR_CODE,APP_ID, esignstatus,ESIGN_FOR, SCHEDULE } = reqData; 
			let esign_status, REG_YEAR= '20'+APP_ID.slice(0,2);
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
					const base64Pdf = fileResponse.data.data;
					const pdfBytes = await this.convertBase64ToPdf(base64Pdf);
					const filePath = `${process.env.file_path}/${this.getSRFromAppId(APP_ID)}/${REG_YEAR}/${APP_ID}/${SCHEDULE}/ResubmitRequest.pdf`;
					const pdfPath = path.join(__dirname, filePath)
					await this.savePdfToFile(pdfBytes, pdfPath);
					let esignstat = ESIGN_FOR == 'SRO' ? ` SR_esign_status = 'Y', SR_TIME_STAMP = SYSDATE ` : ` DR_esign_status = 'Y', DR_TIME_STAMP = SYSDATE `
					let query5 = `UPDATE SROUSER.ESIGN_DOC_RESUBMISSIONS SET ${esignstat}  WHERE sr_code = :SR_CODE  AND APP_ID =:APP_ID AND REG_YEAR = :REG_YEAR AND SCHEDULE=:SCHEDULE`;

					let binds = {
						SR_CODE: this.getSRFromAppId(APP_ID),
						APP_ID: reqData.APP_ID,
						REG_YEAR: REG_YEAR,
						SCHEDULE: reqData.SCHEDULE
					};
					
					esign_status = await this.orDao.oDbInsertDocsWithBindParams(query5, binds);
					console.log('PDF saved successfully');
					return esign_status
				}
			}
		} catch (ex) {
			console.error("drjobServices - getResubmitSignedDocument || Error :", ex);
			throw ex;
		}
	};

	sroSignDocument = async (reqData) => {
		try {
				
				const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
				let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
				let bindParam = {
					SR_CODE: reqData.SR_CODE
				}
				let masterquery = `SELECT a.sr_cd, a.sr_name, c.DR_NAME ,(select DR_NAME from dr_master where dr_cd =(select dr_cd from sr_master where sr_cd= :SR_CODE)) as DRO_name
									FROM sr_master a
									JOIN CARD.MST_REVREGDIST c ON a.dr_cd = c.dr_code
									WHERE a.sr_cd = :SR_CODE`;
				let mastreresponse = await this.orDao.oDBQueryServiceWithBindParams(masterquery, bindParam);
				const templatePath = path.join(__dirname, '../reports/resubmitAnywhereDoc/resubmitAnywhereDoc.hbs');
				const templateSource = fsone.readFileSync(templatePath, 'utf8');
				const template = handlebars.compile(templateSource);

				const html = template({
					Imagedatapath,
					SR_NAME: mastreresponse[0].SR_NAME,
					DR_NAME: mastreresponse[0].DR_NAME,
					DRO_NAME: mastreresponse[0].DRO_NAME,
					DATE: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
					APP_ID: reqData.APP_ID,
					RESUBMIT_REASON: reqData.RESUBMIT_REASON,
					SCHEDULE: reqData.SCHEDULE
				});
				
				let REG_YEAR= '20'+reqData.APP_ID.slice(0,2);
				let REQNOQuery = `select (NVL(MAX(Req_id), 0)+1) as REQ_NO from SROUSER.ESIGN_DOC_RESUBMISSIONS where sr_code=:SR_CODE and reg_year=:REG_YEAR AND APP_ID=:APP_ID AND SCHEDULE=:SCHEDULE`;
				let reqbinds = {
					SR_CODE: reqData.SR_CODE,
					REG_YEAR: REG_YEAR,
					APP_ID: reqData.APP_ID,
					SCHEDULE: reqData.SCHEDULE
				}
				let REQNores = await this.orDao.oDBQueryServiceWithBindParams(REQNOQuery, reqbinds);
				
 
				let documentsFolderPath = path.join(__dirname, `${process.env.file_path}/${this.getSRFromAppId(reqData.APP_ID)}/${REG_YEAR}/${reqData.APP_ID}/${reqData.SCHEDULE}`);

				if (!fsone.existsSync(documentsFolderPath)) {
					fsone.mkdirSync(documentsFolderPath, { recursive: true });
				}
				const filename = `${documentsFolderPath}ResubmitRequest.pdf`;
				await generatePDFFromHTML(html, filename, '');

				const textWithPositions = await extractTextWithPositionsFromPDF(filename);
				const searchText = "Registration-SRO";
				const signaturePosition = textWithPositions.find((item) =>
					item.text.includes(searchText)
				);
				let roundedPosition;
				if (signaturePosition) {
					roundedPosition = {
						x: Math.round(signaturePosition.position.x),
						y: Math.round(signaturePosition.position.y),
						pageNo: signaturePosition.page,
					};
				}
				let emplparam = {
					SR_CODE: reqData.SR_CODE,
					EMPL_ID: reqData.EMPL_ID
				}
				let emplquery = ` select elm.*,(select sr_name from sr_master where sr_cd=elm.sr_code) as sr_name from employee_login_master elm WHERE sr_code= :SR_CODE and EMPL_ID= :EMPL_ID and ROWNUM=1`;
				let emplresponse = await this.orDao.oDBQueryServiceWithBindParams(emplquery, emplparam);
				let insertquery = `MERGE INTO SROUSER.ESIGN_DOC_RESUBMISSIONS tgt  USING ( SELECT :APP_ID AS APP_ID, :SR_CODE AS SR_CODE, :REG_YEAR AS REG_YEAR FROM DUAL ) src
                                   ON ( tgt.APP_ID = src.APP_ID AND tgt.SR_CODE = src.SR_CODE AND tgt.REG_YEAR = src.REG_YEAR )
                                   WHEN MATCHED THEN  UPDATE SET PAGE_NO = :PAGE_NO, COORDINATES = :COORDINATES, SR_TIME_STAMP = SYSDATE, AADHAR = :AADHAR, SR_DN_QUALIFIER = :SR_DN_QUALIFIER, NAME = :NAME, SR_ESIGN_STATUS = :SR_ESIGN_STATUS, SR_ID = :SR_ID, DR_ESIGN_STATUS = :DR_ESIGN_STATUS,
                                   DR_ID = :DR_ID, DR_DN_QUALIFIER = :DR_DN_QUALIFIER, DR_NAME = :DR_NAME,DR_TIME_STAMP = NULL, REQ_ID = :REQ_NO WHEN NOT MATCHED THEN INSERT (
                                   APP_ID,SR_CODE, REG_YEAR, PAGE_NO, COORDINATES, SR_TIME_STAMP, AADHAR, SR_DN_QUALIFIER, NAME, SR_ESIGN_STATUS, SR_ID, DR_ESIGN_STATUS, DR_ID, DR_DN_QUALIFIER, DR_NAME, DR_TIME_STAMP, REQ_ID, SCHEDULE) 
								   VALUES 
								   (:APP_ID, :SR_CODE, :REG_YEAR, :PAGE_NO, :COORDINATES, SYSDATE, :AADHAR, :SR_DN_QUALIFIER, :NAME, :SR_ESIGN_STATUS, :SR_ID, :DR_ESIGN_STATUS, :DR_ID, :DR_DN_QUALIFIER, :DR_NAME, NULL, :REQ_NO, :SCHEDULE)`;
				let transactionID = new Date().getTime();
				let insertParams = {
					SR_CODE: this.getSRFromAppId(reqData.APP_ID),
					REG_YEAR: REG_YEAR,
					PAGE_NO: `${roundedPosition.pageNo}`,
					COORDINATES: `50,${roundedPosition.x},50,100`,
					AADHAR: emplresponse[0]?.AADHAR,
					SR_DN_QUALIFIER: transactionID,
					NAME: emplresponse[0]?.EMPL_NAME,
					SR_ESIGN_STATUS: 'P',
					SR_ID: emplresponse[0]?.EMPL_ID,
					DR_ESIGN_STATUS: 'P',
					DR_ID: '',
					DR_DN_QUALIFIER: '',
					DR_NAME: '',
					REQ_NO: REQNores[0].REQ_NO,
					APP_ID: reqData.APP_ID,
					SCHEDULE: reqData.SCHEDULE
				};
				let insertresponse = await this.orDao.oDbInsertDocsWithBindParams(insertquery, insertParams);
				
				let bitmap = fsone.readFileSync(filename);
				let convertBase64 = bitmap.toString('base64');
				let base64Pdf = convertBase64
				
				let eSignData = JSON.stringify({
					"rrn": transactionID,
					"coordinates_location": 'Top_Right',
					"coordinates": `${roundedPosition.pageNo}-${roundedPosition.x + 270},${roundedPosition.y},50,130;`,
					"doctype": 'PDF',
					"uid": emplresponse[0]?.AADHAR.length > 12 ? decryptData(emplresponse[0].AADHAR) : emplresponse[0].AADHAR,
					"signername": emplresponse[0].EMPL_NAME?.substring(0, 50),
					"signerlocation": `${emplresponse[0].SR_NAME}`,
					"filepassword": '',
					"signreason": 'Resubmit eSign',
					"authmode": reqData.AUTH_MODE,
					"webhookurl": reqData.REDIRECT_URL,
					"file": base64Pdf
				});
				let esignUrlData = await this.orDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
				if (esignUrlData == null || esignUrlData.length == 0) {
					throw Error('Esign Urls Not Found');
				}
				let esignRequestData = encryptWithAESPassPhrase(eSignData, "igrsSecretPhrase");
				let esignUrl = parseInt(reqData.SR_CODE) % 2 == 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
				// let eSignReponse = await this.esign.igrsEsignAxiosCall('http://117.250.201.41:9080/igrs-esign-service', esignRequestData);
				let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
				let respdata = {
					"rrn": transactionID,
					"REQ_NO": REQNores[0].REQ_NO
				}

				let query = `UPDATE PREREGISTRATION.schedule_entry set RESUBMIT_CHALLANS=:CHALLANS, PP_RESUBMIT_REASON=:RESUBMIT_REASON where id=:APP_ID`;  
				let values = {
					APP_ID: reqData.APP_ID,
					CHALLANS: reqData.CHALLANS,
					RESUBMIT_REASON: reqData.RESUBMIT_REASON
				}          
				await this.orDao.oDBQueryServiceWithBindParams(query, values)

				return { result: respdata, data: eSignReponse }
		} catch (ex) {
			Logger.error("DrJobServices - sroSignDocument || Error :", ex);
			console.error("DrJobServices - sroSignDocument || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	drSignDocument = async (reqData) => {
		try {
			let existanceQuery = `select DR_ESIGN_STATUS from SROUSER.ESIGN_DOC_RESUBMISSIONS where APP_ID = :ID and SCHEDULE=:SCHEDULE`
			let existanceResponse = await this.orDao.oDBQueryServiceWithBindParams(existanceQuery, {ID: reqData.APP_ID, SCHEDULE: reqData.SCHEDULE})
			if( existanceResponse.lenght > 0 && existanceResponse[0].DR_ESIGN_STATUS == 'Y'){
				return { message: 'The document has already been signed. Please click on Preview to view the signed PDF' }
			}

			let REG_YEAR='20'+reqData.APP_ID.slice(0,2);
			let reqSro =this.getSRFromAppId(reqData.APP_ID);
			const filePath = `${process.env.file_path}/${reqSro}/${REG_YEAR}/${reqData.APP_ID}/${reqData.SCHEDULE}/ResubmitRequest.pdf`;			
			const pdfPath = path.join(__dirname, filePath);
			const textWithPositions = await extractTextWithPositionsFromPDF(pdfPath);
			const searchText = "Juridiction-SRO";
			const signaturePosition = textWithPositions.find((item) =>
				item.text.includes(searchText)
			);
			let roundedPosition;
			if (signaturePosition) {
				roundedPosition = {
					x: Math.round(signaturePosition.position.x),
					y: Math.round(signaturePosition.position.y),
					pageNo: signaturePosition.page,
				};
			}
			let emplparam = {
				SR_CODE: reqData.SR_CODE,
				EMPL_ID: reqData.EMPL_ID
			}
			let emplquery = ` select elm.*,(select DR_NAME from dr_master where dr_cd =(select dr_cd from sr_master where sr_cd= :SR_CODE)) as Dr_name from employee_login_master elm WHERE sr_code = :SR_CODE and EMPL_ID=:EMPL_ID and ROWNUM=1`;
			let emplresponse = await this.orDao.oDBQueryServiceWithBindParams(emplquery, emplparam);
			const pdfBuffer = await require("fs").promises.readFile(pdfPath);
			const base64Pdf = pdfBuffer.toString("base64");
			let transactionID = new Date().getTime();
			let eSignData ={
				"rrn": transactionID,
				"coordinates_location": 'Top_Right',
				"coordinates": `${roundedPosition.pageNo}-100,${roundedPosition.y},50,130;`,
				"doctype": 'PDF',
				"uid": emplresponse[0]?.AADHAR.length > 12 ? decryptData(emplresponse[0].AADHAR) : emplresponse[0].AADHAR,
				"signername": emplresponse[0].EMPL_NAME?.substring(0, 50),
				"signerlocation": `${emplresponse[0].DR_NAME}`,
				"filepassword": '',
				"signreason": 'Resubmit eSign',
				"authmode": reqData.AUTH_MODE,
				"webhookurl": reqData.REDIRECT_URL,
				"file": base64Pdf
			};
			let esignUrlData = await this.orDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
			if (esignUrlData == null || esignUrlData.length == 0) {
				throw Error('Esign Urls Not Found');
			}
			if (eSignData) {
				let queryupdate = `UPDATE SROUSER.ESIGN_DOC_RESUBMISSIONS T
									SET 
										T.PAGE_NO = :PAGE_NO,
										T.DR_COORDINATES = :DR_COORDINATES,
										T.DR_AADHAR = :DR_AADHAR,
										T.DR_ESIGN_STATUS = 'P',
										T.DR_ID = :DR_ID,
										T.DR_DN_QUALIFIER = :DR_DN_QUALIFIER,
										T.DR_NAME = :DR_NAME,
										T.DR_TIME_STAMP = SYSDATE
									WHERE 
										T.SR_CODE = :SR_CODE 
										AND T.APP_ID = :APP_ID
										AND T.REG_YEAR = :REG_YEAR
										AND T.SCHEDULE = :SCHEDULE`;

				let insertParams = {
					SR_CODE: reqSro,
					APP_ID:reqData.APP_ID,
					REG_YEAR: REG_YEAR,
					SCHEDULE: reqData.SCHEDULE,
					PAGE_NO: roundedPosition.pageNo,
					DR_COORDINATES: `50,${roundedPosition.y},50,${roundedPosition.x - 230}`,
					DR_AADHAR: emplresponse[0]?.AADHAR,
					DR_NAME: emplresponse[0]?.EMPL_NAME,
					DR_ID: emplresponse[0]?.EMPL_ID,
					DR_DN_QUALIFIER: transactionID,
				};
				const resultupdate = await this.orDao.oDbInsertDocsWithBindParams(queryupdate, insertParams);
			}
			let encryptedData1 = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
			let esignUrl = parseInt(reqData.SR_CODE) % 2 == 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
			let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, encryptedData1);
			// let eSignReponse = await this.esign.igrsEsignAxiosCall('http://117.250.201.41:9080/igrs-esign-service', encryptedData1);
			return { result: eSignData, data: eSignReponse }
		} catch (ex) {
			Logger.error("DrJobServices - drSignDocument || Error :", ex);
			console.error("DrJobServices - drSignDocument || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	resubmitPdfPreview = async (reqData) => {
		try {
			let REG_YEAR ='20'+reqData.APP_ID.slice(0,2)
			const filePath = `${process.env.file_path}/${this.getSRFromAppId(reqData.APP_ID)}/${REG_YEAR}/${reqData.APP_ID}/${reqData.SCHEDULE}/ResubmitRequest.pdf`;
			const pdfPath = path.join(__dirname, filePath);
			return new Promise((resolve, reject) => {
				fsone.readFile(pdfPath, (err, data) => {
					if (err) {
						console.error('Error reading PDF file:', err);
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		} catch (ex) {
			console.error("Error in PDFPreview:", ex);
			throw ex;
		}
	};

	getAnywhereeSignStatus = async (reqData) => {
		try {
			let existanceQuery = `select DR_ESIGN_STATUS, SR_ESIGN_STATUS from SROUSER.ESIGN_DOC_RESUBMISSIONS where APP_ID = :ID and SCHEDULE = :SCHEDULE`
			let values = {ID: reqData.ID, SCHEDULE: reqData.SCHEDULE};
			let existanceResponse = await this.orDao.oDBQueryServiceWithBindParams(existanceQuery, values)

			let resubmitStatusQuery = `select RESUBMITTED from PREREGISTRATION.schedule_entry where id= :ID and schedule_no= :SCHEDULE`
			let resubmitStatusResponse = await this.orDao.oDBQueryServiceWithBindParams(resubmitStatusQuery, values)

			return {...existanceResponse[0], ...resubmitStatusResponse[0]};
        } catch (ex) {
            Logger.error("DrJobServices - getAnywhereeSignStatus || Error :", ex);
			console.error("DrJobServices - getAnywhereeSignStatus || Error :", ex);
			throw constructCARDError(ex);
        }
	}
}

module.exports = DrJobServices;