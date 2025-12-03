const CARDError = require("../errors/customErrorClass");
const {doRelease,dbConfig} = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const cashService = require('./cashServices');
class SroListServices {
	constructor(){
		this.orDao = new OrDao();
		this.cashservices = new cashService();
	}
	getSroList = async() => {
		
		try{
			let query = `SELECT * From sr_master where state_cd='01'`;
            let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("SroListHandler - getSroList || Error :", ex);
			console.error("SroListHandler - getSroList || Error :", ex);
			throw new CARDError(ex);
		}
	} 
	updDeclarationSrvc = async (reqData) => {
		try {
			let query = `UPDATE tran_major set scanned='T',sec41_2='T',VOL_NO=${reqData.VOL_NO},PAGE_NO=${reqData.PAGE_NO}  where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and doct_no=${reqData.docNo} and reg_year=${reqData.regYear}`;
			let result = await this.orDao.oDbUpdate(query);
			if (result < 0) {
				throw new Error('Bad Request');
			} else {
				// await this.cashservices.updateApplicationStatus({
				// 	'status': 'B',
				// 	'doctNo': reqData.docNo,
				// 	...reqData
				// });
				for (const status of ['B', 'D']) {    // B: DOC_BUNDLE, D: DOC_DIGI_SIGN
					await this.cashservices.updateApplicationStatus({
						'status': status,
						'doctNo': reqData.docNo,
						...reqData
					});
				}
			}
			return result;
		} catch (ex) {
			Logger.error("EmployeeHandler - updCreationSrvc || Error: ", ex);
			console.error("EmployeeHandler - updCreationSrvc || Error: ", ex);
			throw new CARDError({ err: ex });
		}
	}
	getCheckcs = async(reqData) => {
		
		try{
			let query = `select*from pde_doc_status_cr where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and doct_no=${reqData.DOCT_NO} and reg_year=${reqData.REG_YEAR}`;
            let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("SroListServices - getCheckcs || Error :", ex);
			console.error("SroListServices - getCheckcs || Error :", ex);
			throw new CARDError(ex);
		}
	} 

	generateNewAppid = async (reqData) => {
		const {SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR} = reqData;
		const appId = `${REG_YEAR.toString().slice(2, 4)}${SR_CODE.toString().padStart(4, '0')}${BOOK_NO}${DOCT_NO.toString().padStart(6, '0')}${REG_YEAR.toString().slice(1, 4)}`;
		try {
		  const tranMajorCheckQuery = `SELECT RDOCT_NO FROM tran_major WHERE sr_code = :sr_code  AND book_no = :book_no  AND doct_no = :doct_no AND reg_year = :reg_year`;
		  let bindParams = {
			sr_code: SR_CODE,
			book_no: BOOK_NO,
			doct_no: DOCT_NO,
			reg_year: REG_YEAR
		  };
		  const tranMajorCheckResponse = await this.orDao.oDBQueryServiceWithBindParams(tranMajorCheckQuery, bindParams);	  
		  if (!tranMajorCheckResponse || tranMajorCheckResponse.length === 0) {
			throw new Error("Checkslip details not found for this document.");
		  }
		  const isAssigned = tranMajorCheckResponse.some(row => row.RDOCT_NO !== null);
		  if (isAssigned) {
			throw new Error("Application already assigned a regular number. Cannot proceed with Move to Assign.");
		  }
		  const insertQuery = `
			INSERT INTO PDE_DOC_STATUS_CR (
			  APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR,
			  DOC_ACC, DOC_RESUBMIT, DOC_EKYC, DOC_CASH, DOC_ASSIGN,
			  DOC_ESIGN, DOC_DIGI_SIGN, DOC_HANDOVER, DOC_ENDORS, DOC_BUNDLE,
			  DOC_PEND, DOC_VERIFY, DOC_VERIFIED_BY, DOC_SUBDIV, DOC_MUTATION,
			  DOC_TYPE, TIME_STAMP, EXEMPTION_REASON, EXEMPTION_ID, DOC_URBAN_MUTATION,
			  DOC_COR, GS_SRCODE, BENEFICIARY_ID, BENEFICIARY_NAME, PUSH_STATUS, PUSH_ON
			) VALUES (
			  :app_id, :sr_code, :book_no, :doct_no, :reg_year,
			  'Y', 'N', 'Y', 'Y', 'N',
			  'Y', 'N', 'Y', 'Y', 'N',
			  NULL, NULL, NULL, NULL, NULL,
			  'P', TRUNC(SYSDATE), NULL, NULL, 'Y',
			  'Y', NULL, NULL, NULL, NULL, NULL
			)`;
		  const insertBindParams = {
			app_id: appId,
			...bindParams
		  };
		  const insertResult = await this.orDao.oDbInsertDocsWithBindParams(insertQuery, insertBindParams);
		  if (insertResult < 1) {
			throw new Error("Failed to insert application details.");
		  }
		  return insertResult;
		}catch(ex){
		  Logger.error("EkycServices - generateNewAppid || Error :", ex);
		  console.error("EkycServices - generateNewAppid || Error :", ex);
		  throw constructCARDError(ex);
		}

	  }

	getLanDataSrvc = async(reqData) => {
		try{
			let query = `SELECT sr_cd,ip_address,ip_from,ip_to FROM SR_MASTER WHERE SR_CD=${reqData.SR_CODE}`;
            let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("SroListServices - getLanDataSrvc || Error :", ex);
			console.error("SroListServices - getLanDataSrvc || Error :", ex);
			throw new CARDError(ex);
		}
	} 
	
	scrollSrvc = async (reqData)=>{
		try{
			let query =`UPDATE SROUSER.LOGIN_NOTE_CR set NOTE='${reqData.NOTE}' WHERE SERIAL_NO=1`;
			let response = await this.orDao.oDBQueryService(query);
			if(response <1){
				throw new Error("Bad Request")
			}
			return response;
		}catch(ex){
			Logger.error("SroListServices - scrollSrvc || Error :", ex);
			console.error("SroListServices - scrollSrvc || Error :", ex);
			throw constructCARDError(ex);
		}

	}

	getScrollSrvc = async ()=>{
		try{
			let query =`SELECT NOTE FROM SROUSER.LOGIN_NOTE_CR WHERE SERIAL_NO=1`;
			let response = await this.orDao.oDBQueryService(query);
			if(response <1){
				throw new Error("Bad Request")
			}
			return response;
		}catch(ex){
			Logger.error("SroListServices - getScrollSrvc || Error :", ex);
			console.error("SroListServices - getScrollSrvc || Error :", ex);
			throw constructCARDError(ex);
		}

	}


};


module.exports = SroListServices;