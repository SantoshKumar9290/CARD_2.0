const oracleDb = require('oracledb');
const {doRelease,dbConfig} = require('../plugins/database/oracleDbServices');
const odbDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');


class AssignServices {
	constructor(){
		this.odbDao = new odbDao();
	}

	getBasicDetails = async(reqData) => {
		try{
			let query = `SELECT * From tran_major where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and doct_no=${reqData.docNo} and reg_year=${reqData.regYear}`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}catch(ex){
			Logger.error("AssignServices - getBasicDetails || Error :", ex);
			console.error("AssignServices - getBasicDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	} 
	swapRNoProcSvc = async (reqData)=>{
        try{
            let query = `begin srouser.swap_rdno(:srocode,:ryr,:bookno,:rdoctno1,:rdoctno2,:mess); end;`;
            let obj ={
                srocode: {val:parseInt(reqData.srCode), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
                bookno: {val:parseInt(reqData.bookNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
                // doctno:{val:parseInt(reqData.docNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
                ryr: {val:parseInt(reqData.ryr), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
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
    getPartyDetails = async(reqData) => {
		try{
			let query = `SELECT * From srouser.TRAN_EC_PARTIES_CR a,srouser.aadhar_ec_details b where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and doct_no=${reqData.docNo} and reg_year=${reqData.regYear} and a.aadhar=b.aadhar(+) and rownum<=200`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}catch(ex){
			Logger.error("AssignServices - getPartyDetails || Error :", ex);
			console.error("AssignServices - getPartyDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	}
    getPropertyDetails = async(reqData) => {
		try{
			let query = `SELECT a.*,(select sr_name from sr_master where sr_cd=a.sr_Code) srname, (select village_name from card.hab_code where village_Code||'01'=hab_code ) villname,(select class_desc from area_class where class_code =nature_use) nature_use from tran_sched a where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and doct_no=${reqData.docNo} and reg_year=${reqData.regYear}`;
			let response = await this.odbDao.oDBQueryService(query)
			console.log(query);
			return response;
		}catch(ex){
			Logger.error("AssignServices - getPropertyDetails || Error :", ex);
			console.error("AssignServices - getPropertyDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getRepresentativeDetails = async() => {
		try{
			let query = `SELECT * From srouser.tran_ec_firms where rownum<=10`;
			let response = await this.odbDao.oDBQueryService(query)
			console.log(query);
			return response;
		}catch(ex){
			Logger.error("AssignServices - getRepresentativeDetails || Error :", ex);
			console.error("AssignServices - getRepresentativeDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	};
	asingRNoProcSvc = async (reqData)=>{
		try{
			let query = `begin srouser.assign_rdoct(:srcode1,:bookno1,:doctno1,:regyear1,:rdoctno1,:rdoctno2,TO_DATE('${reqData.rDate}','DD/MM/YYYY'),:msg1); end;`;
			let obj ={
				srcode1: {val:parseInt(reqData.srCode), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				bookno1: {val:parseInt(reqData.bookNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				doctno1:{val:parseInt(reqData.docNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				regyear1: {val:parseInt(reqData.regYear), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				rdoctno1:{val:parseInt(reqData.redoctNo1), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				rdoctno2:{val:parseInt(reqData.redoctNo2), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				msg1:{ type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_OUT}
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
	getVerifyRDocSvc = async(reqData) => {
		try{
			let query = `SELECT count(1) rdoct_cnt from tran_major where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and rdoct_no=${reqData.RDOCT_NO} and ryear=${reqData.RYEAR}`;
			let response = await this.odbDao.oDBQueryService(query)
			console.log(query);
			return response;
		}catch(ex){
			Logger.error("AssignServices - getVerifyRDocSvc || Error :", ex);
			console.error("AssignServices - getVerifyRDocSvc || Error :", ex);
			throw constructCARDError(ex);
		}
	};
	getDocAckDetails = async(reqData) => {
		try {
			let query = `select * from doc_ack where sr_code = ${reqData.SR_CODE} and DOCT_NO = ${reqData.DOCT_NO} and BOOK_NO = ${reqData.BOOK_NO} and reg_year = ${reqData.REG_YEAR}`;
			let response = await this.odbDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("AssignServices - getDocAckDetails || Error :", ex);
			console.error("AssignServices - getDocAckDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	validateNumberSrvc = async(reqData) => {
		try {
			let query = `SELECT MAX(RDOCT_NO) FROM TRAN_MAJOR WHERE SR_CODE=${reqData.SR_CODE} AND REG_YEAR=${reqData.REG_YEAR} AND BOOK_NO=${reqData.BOOK_NO}`;
			let response = await this.odbDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("AssignServices - validateNumberSrvc || Error :", ex);
			console.error("AssignServices - validateNumberSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}



	assignRegularNumberSrvc = async (reqData)=>{
		try{
			let query = `begin srouser.rdoct_next(:srcode,:bookno,:regyear,:doctno,:err); end;`;
			let obj ={
				srcode: {val:parseInt(reqData.srCode), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				bookno: {val:parseInt(reqData.bookNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				regyear: {val:parseInt(reqData.regYear), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				doctno:{type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT},
				err:{ type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_OUT}
			}
			console.log(query);
			let details = await this.odbDao.getSProcedureODB(query,obj);
			return details;
		}catch(ex){
			console.error("AssignServices - assignRegularNumberSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	assignNegativeNumberSrvc = async (reqData)=>{
		try{
			let query = `begin srouser.rdoct_next_negative(:srcode,:bookno,:regyear,:doctno,:err); end;`;
			let obj ={
				srcode: {val:parseInt(reqData.srCode), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				bookno: {val:parseInt(reqData.bookNo), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				regyear: {val:parseInt(reqData.regYear), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				doctno:{type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT},
				err:{ type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_OUT}
			}
			console.log(query);
			let details = await this.odbDao.getSProcedureODB(query,obj);
			return details;
		}catch(ex){
			// Logger.error("AssignServices - assignNegativeNumberSrvc || Error :", ex);
			console.error("AssignServices - assignNegativeNumberSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	checkFreeholdSrvc = async(reqData) => {
		try {
			let query = `SELECT * FROM pde_adangal_details WHERE id= '${reqData.APP_ID}' AND free_hold = 'Y'`;
			let response = await this.odbDao.oDBQueryService(query);
			return response.length;
		} catch (ex) {
			Logger.error("AssignServices - checkFreeholdSrvc || Error :", ex);
			console.error("AssignServices - checkFreeholdSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	// addSection89Details= async (qParams) => {
	// 	try {
	//    let query = `INSERT INTO srouser.tran_section89 (sr_code, book_no, doct_no, reg_year, time_stamp, court_id) VALUES (:SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, SYSDATE, :COURT_ID)`;
	// 		 const bindParams = {
	// 			SR_CODE: qParams.SR_CODE,
	// 			BOOK_NO: qParams.BOOK_NO,
	// 			DOCT_NO: qParams.DOCT_NO,
	// 			REG_YEAR: qParams.REG_YEAR,
	// 			COURT_ID: qParams.COURT_ID
	// 		};
	// 	  let response = await this.odbDao.oDbInsertDocsWithBindParams(query,bindParams);
	// 	  return response;
	// 	} catch (ex) {
	// 		Logger.error("AssignServices - addSection89 || Error :", ex);
	// 		console.error("AssignServices - addSection89 || Error :", ex);
	// 		throw constructCARDError(ex);
	// 	}
	//   };
	 
	
	addSection89Details = async (qParams) => {
		try {
			let insertQuery = `INSERT INTO srouser.tran_section89 
				(sr_code, book_no, doct_no, reg_year, time_stamp, court_id) 
				VALUES (:SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, SYSDATE, :COURT_ID)`;
	 
			let insertParams = {
				SR_CODE: qParams.SR_CODE,
				BOOK_NO: qParams.BOOK_NO,
				DOCT_NO: qParams.DOCT_NO,
				REG_YEAR: qParams.REG_YEAR,
				COURT_ID: qParams.COURT_ID
			};
	 
			let insertResponse = await this.odbDao.oDbInsertDocsWithBindParams(insertQuery, insertParams);
			if (insertResponse < 1) {
				throw new Error("Something went wrong: No rows inserted.");
			}
			let updateQuery = `UPDATE srouser.cash_payable 
				SET amount = CASE WHEN ACCOUNT_CODE = 59 THEN amount ELSE 0 END
				WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO 
				AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR`;
			let updateParams = {
				SR_CODE: qParams.SR_CODE,
				BOOK_NO: qParams.BOOK_NO,
				DOCT_NO: qParams.DOCT_NO,
				REG_YEAR: qParams.REG_YEAR
			};
	 
			let updateResponse = 0;
			if (insertResponse > 0) {
				updateResponse = await this.odbDao.oDbInsertDocsWithBindParams(updateQuery, updateParams);
			}
	 
			return { insertResponse, updateResponse };
		} catch (ex) {
			Logger.error("AssignServices - addSection89 || Error :", ex);
			console.error("AssignServices - addSection89 || Error :", ex);
			throw constructCARDError(ex);
		}
	};
	
	getSection89Details = async(reqData) => {
		try {
			let query = `SELECT sr_code, book_no, doct_no, reg_year, time_stamp, court_id FROM srouser.tran_section89 WHERE sr_code = :SR_CODE  AND book_no = :BOOK_NO  AND doct_no = :DOCT_NO AND reg_year = :REG_YEAR`;
			const bindParams = {
							SR_CODE: reqData.SR_CODE,
							BOOK_NO: reqData.BOOK_NO,
							DOCT_NO: reqData.DOCT_NO,
							REG_YEAR: reqData.REG_YEAR
						};
		   let response = await this.odbDao.oDBQueryServiceWithBindParams(query,bindParams);
			return response;
		} catch (ex) {
			Logger.error("AssignServices - getSection89Details || Error :", ex);
			console.error("AssignServices - getSection89Details || Error :", ex);
			throw constructCARDError(ex);
		}
	}

};


module.exports = AssignServices;