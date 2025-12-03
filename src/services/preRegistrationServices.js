const CARDError = require("../errors/customErrorClass");
const oracleDb = require('oracledb');
const {doRelease,dbConfig} = require('../plugins/database/oracleDbServices');
const orDbDao = require('../dao/oracledbDao')
const { Logger } = require('../../services/winston');
const { constructCARDError } = require("../handlers/errorHandler");
const axios = require("axios");
const mongoose = require('mongoose');
const https = require('https');
const {AadhardecryptData,AadharencryptData} = require('../utils/index');
const {URBAN_MUTATION_ACCEPT_MAJOR_CODES,URBAN_MUTATION_ACCEPT_MINOR_CODES} =require('../constants/appConstants');

const instance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false
	})
});

class PreRegistraionServices {
	constructor(){
		this.dbDao = new orDbDao();
	}
	
	getPreRegistrationDocs = async (reqData)=>{
		try{
			let time_data, presentSlotPeriod, pastSlotTime, slotResult, urbanMutableCodes = [], urbanMutableQuery;
			if(reqData.status.toUpperCase() === 'NS') {
				const slotStatus = `select * from srouser.slot_enable_sro where status = 'Y' and sr_code = :SR_CODE` // Slot enable status
				slotResult = await this.dbDao.oDBQueryServiceWithBindParams(slotStatus, {SR_CODE : reqData.srCode})
				reqData.status = (slotResult && slotResult.length > 0) ? reqData.status : 'NSS';
				if(reqData.status.toUpperCase() === 'NS') {
					const currentDate = new Date();
					const hours = currentDate.getHours();
					const minutes = currentDate.getMinutes();
					const currentMinutes = hours * 60 + minutes;
					const startTime = 17 * 60 + 31; // 17 : 31, calculating to minutes 
					const endTime = 10 * 60 + 29;  // 10 : 29, calculating to minutes
					time_data = currentMinutes >= startTime || currentMinutes <= endTime; // checking validation
					pastSlotTime = currentMinutes >= (0 * 60 + 0) && currentMinutes <= (10 * 60 + 29); // only 00:00 AM to 10:29 AM(calculating to minutes) and checking validation
					const availableSlots = [1, 2, 3, 4, 5, 6, 7];
					let slotIndex = hours-10;
					if(minutes <= 30) {
						slotIndex = slotIndex-1;
					}
					presentSlotPeriod = availableSlots[slotIndex];
					for (const majorCode of URBAN_MUTATION_ACCEPT_MAJOR_CODES) {
						const minorCodes = URBAN_MUTATION_ACCEPT_MINOR_CODES[majorCode];
						if (minorCodes && minorCodes.length > 0) {
						  const minorList = minorCodes.filter(code => code !== '').map(code => `'${code}'`).join(', ');
						  const condition = `(cca.trans_major_code = '${majorCode}' AND cca.trans_minor_code IN (${minorList}))`;
						  urbanMutableCodes.push(condition);
						}
					}
					urbanMutableQuery = urbanMutableCodes.join(' OR ');
				}
			}			
			const Status ={
				// N : `SELECT * FROM preregistration.prereg_det_cr WHERE status is null and SR_CODE='${reqData.srCode}' and juri_status ='Y'`,
				// A : `SELECT * FROM preregistration.prereg_det_cr WHERE status = 'A' and SR_CODE='${reqData.srCode}' and juri_status is not null`,
				// P : `SELECT * FROM preregistration.prereg_det_cr WHERE status ='P' and SR_CODE='${reqData.srCode}' and juri_status is not null`
				NS : `select distinct b.*, TO_CHAR(b.date_slot, 'DD-MM-YYYY') AS date_of_slot from (                
				SELECT pdc.*,
					sd.date_of_slot as date_slot,
					sd.time_of_slot, sd.time_stamp,
					sd.status AS slot_status, sd.AUTH_STATUS, sd.remarks, 'Y' as slot_enable,
					CASE 
						WHEN EXISTS (
							select 1 from schedule_entry se
							 join preregistration.pre_registration_cca cca on se.id = cca.id
							 where se.nature_use in ('01', '02', '06', '07', '09', '11') and se.id = pdc.id
							 and 
							 (
								${urbanMutableQuery}
							 )
							 and exists (
                                select 1 from srouser.slot_enable_sro where sr_code = se.jurisdiction and urban_mutation_status = 'Y'
                             )
						)
						THEN 'TRUE'
						ELSE 'FALSE'
					END AS IS_URBAN
				FROM preregistration.prereg_det_cr pdc
				LEFT JOIN preregistration.slot_details sd
					ON pdc.id = sd.id
					${time_data ? '' : `and ((trunc(sd.date_of_slot) = TRUNC(SYSDATE) AND slot = ${presentSlotPeriod}) or sd.auth_status = 'Y')`}
				WHERE pdc.status IS NULL
					AND pdc.SR_CODE = :CODE
					AND pdc.juri_status IN ('Y', 'N')
					) b
				${time_data ? `where ((trunc(b.date_slot) ${pastSlotTime ? '<' : '<='} TRUNC(SYSDATE)) OR (b.date_slot is null and b.IS_URBAN = 'FALSE'))` : 'where b.date_slot is not null'} 
				ORDER BY b.slot_status`,
				NSS : `SELECT a.*, 'N' as slot_enable FROM preregistration.prereg_det_cr a WHERE a.status is null and a.SR_CODE= :CODE and a.juri_status in ('Y', 'N')`,
				AS: `SELECT * FROM preregistration.prereg_det_cr WHERE status = 'A' and SR_CODE=:CODE and juri_status is not null`,
				PS: `SELECT * FROM preregistration.prereg_det_cr WHERE status ='P' and SR_CODE=:CODE and juri_status is not null`, 
			};
			let bindParam={
				CODE: reqData.srCode
			}
			let query = Status[reqData.status.toUpperCase()] ?? ''
			if(query ===""){
				throw new Error("Bad Request");
			}	
			let result = await this.dbDao.oDBQueryServiceWithBindParams(query, bindParam);
			 for (const row of result) {
                try {
					const { AADHAR_ENCRPT, PRESENTER } = row;
						if (AADHAR_ENCRPT && AADHAR_ENCRPT.length > 12) {
							const decryptedAadhar = AadhardecryptData(AADHAR_ENCRPT);
							row.AADHAR = decryptedAadhar;

							const last4 = decryptedAadhar.slice(-4);
							const Presenter = PRESENTER?.trim() || '';

							row.PNAME = `${Presenter}-XXXX XXXX ${last4}`;
						} else {
							row.PNAME = row.PNAME?.trim() || '';
						}
				} catch (err) {
					console.error('AADHAR decryption failed:', err);
					row.PNAME = row.PNAME?.trim() || '';
				}
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - getPreRegistrationDocs || Error : ", ex);
			console.error("PreRegistraionServices - getPreRegistrationDocs || Error : ", ex);
			throw constructCARDError(ex);
		}
	}

	postPdeService = async (reqData) => {
		try {
			let details;
			let flagsData = await instance.request({ method: "GET", url: `${process.env.PDE_HOST}/pdeapi/v1/documents/flags/${reqData.pres_id}`, headers: { 'Content-Type': 'application/json' } });
			if (flagsData.data.status) {
				flagsData = flagsData.data.data;
				if (flagsData) {
					try {
						let checkslipQuery = `begin srouser.post_pde_cr(:pres_id,:stat,:sr_code,:book_no,:doct_no,:reg_year); end;`;
						let obj = {
							pres_id: reqData.pres_id,
							stat: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
							sr_code: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
							book_no: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
							doct_no: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
							reg_year: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT }
						}
						details = await this.dbDao.getSProcedureODB(checkslipQuery, obj);
						if (flagsData.docProcessType == "PDEWD" || (flagsData.docProcessType == "PDE" && flagsData.documentsLength)) {
							let q = `UPDATE tran_major set E_DATE=sysdate where sr_code=${details.sr_code} and doct_no=${details.doct_no} and book_no=${details.book_no} and reg_year=${details.reg_year}`;
		
							let result = await this.dbDao.oDbUpdate(q);
						}
						// let chalanDetails = await instance.request({ method: "GET", url: `${process.env.PDE_HOST}/pdeapi/v1/documents/cfms/chalanDetails/${reqData.pres_id}`, headers: { 'Content-Type': 'application/json' } });
						// const chData = chalanDetails.data.data;
						// let [deptTransId, rest] = chData.departmentTransactionId.split("_");
						// let regYr = `${chData.paymentDate}`.substring(0, 4);
						// let query = `Insert into scanuser.echallan_trans (ID,CHALLANNO,DEPTCODE,DEPTTRANSID,BANKTRANSID,BANKDATE,BANKAMOUNT,BANKSTATUS,STATUSDESC,IPADDRESS,TIME_STAMP,USERID,SR_CODE,CHALLAN_YEAR,CON_STATUS,REMARKS,PAYMENT_TYPE,MULTI_HOA,PE_ID,EC_REQNO,SIGNED) values (null,'${chData.cfmsTransactionId}',null,'${deptTransId}','${chData.bankReferenceId}','${chData.paymentDate}',${chData.totalAmount},'Success','success Desc-CFMS',null,SYSDATE,'${chData.remitterName}',${details.sr_code},${regYr},'N','Registration Purpose','documentreg','${chData?.challans[0].challanHOACode}',null,null,null)`;
						// await this.dbDao.oDbInsertDocs(query);
						// console.log("POST PDE ::: Echalan Trans Inserted")
						// if (chData && chData.challans && chData.challans.length > 0) {
						// 	for (let i of chData.challans) {
						// 		let query2 = `Insert into scanuser.echallan_acc_trans (DEPTTRANSID,SR_CODE,CHALLAN_YEAR,ACC_CODE,BANKAMOUNT,BANKSTATUS,TIME_STAMP,DENOMINATION,NO_STAMPS,RDOCT_NO,RYEAR) values ('${deptTransId}',${details.sr_code},${regYr},'${i.challanHOACode}',${i.challanAmount},'Success',SYSDATE,null,null,null,null)`
						// 		await this.dbDao.oDbInsertDocs(query2);
						// 	}
						// 	console.log("POST PDE ::: echallan_acc_trans")
						// }
					} catch (err) {
						Logger.error("Failure in CFMS challan block ====>", err.message);
						console.log("Failure in CFMS challan block ====>", err.message);
					}
				}
			} else {
				return "pde api failed"
			}

			return details;
		}catch(ex){
			Logger.error("PreRegistraionServices - postPdeService || Error : ", ex);
			console.error("PreRegistraionServices - postPdeService || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	amendmentSrvc = async (reqData)=>{
		console.log(reqData)
		try{			
			let query = `SELECT STATUS FROM PREREGISTRATION.PRE_REGISTRATION_CCA WHERE ID = '${reqData.id}'`;
			let preRegistrationDbData = await this.dbDao.oDBQueryService(query);
			if(preRegistrationDbData.length > 0 && preRegistrationDbData[0].STATUS != null){
				throw new Error('InValid Status Change');
			}
			query = `UPDATE PREREGISTRATION.PRE_REGISTRATION_CCA SET STATUS= 'P', REASONS= '${reqData.reason}',ammend_by='${reqData.ammend_by}' WHERE ID = '${reqData.id}'`;
			let result = await this.dbDao.oDbUpdate(query);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - amendmentSrvc || Error : ", ex);
			console.error("PreRegistraionServices - amendmentSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	getAmmendSrvc = async(reqData) => {
		try{
			let query = `SELECT * From PREREGISTRATION.PRE_REGISTRATION_CCA WHERE ID = '${reqData.id}'`;
			let response = await this.dbDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("PreRegistraionServices - getAmmendSrvc || Error :", ex);
			console.error("PreRegistraionServices - getAmmendSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	saveNominee = async (reqData) => {
		try {
			const encryptedAadhar = reqData.NOMINE_AADHAR? reqData.NOMINE_AADHAR.length == 12 ? AadharencryptData(reqData.NOMINE_AADHAR) : reqData.NOMINE_AADHAR :'';
			let query = `Insert into SROUSER.TRAN_NOMINE (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,NOMINE_NAME,NOMINE_AADHAR,No_Pages,AADHAR_ENCRPT) values (:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:NOMINE_NAME,:NOMINE_AADHAR,:No_Pages,:AADHAR_ENCRPT)`;
			const bindParams = {
				SR_CODE : reqData.SR_CODE,
				BOOK_NO : reqData.BOOK_NO,
				DOCT_NO : reqData.DOCT_NO,
				REG_YEAR : reqData.REG_YEAR,
				NOMINE_NAME : reqData.NOMINE_NAME,
				NOMINE_AADHAR : reqData.NOMINE_AADHAR,
				AADHAR_ENCRPT : encryptedAadhar,
				No_Pages : reqData.No_Pages
			};
			let result = await this.dbDao.oDbInsertDocsWithBindParams(query, bindParams);
			if (result < 0) {
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - saveNominee || Error : ", ex);
			console.error("PreRegistraionServices - saveNominee || Error : ", ex);
			throw constructCARDError(ex);
		}
	}

	postPdeByAccept = async (reqData)=>{
		try{			
			let query = `Insert into srouser.pde_doc_Status_cr (APP_ID,SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,DOC_ACC,DOC_RESUBMIT,DOC_EKYC,DOC_CASH,DOC_ASSIGN,DOC_ESIGN,DOC_DIGI_SIGN,
				DOC_HANDOVER,DOC_ENDORS,DOC_BUNDLE,DOC_SUBDIV,DOC_MUTATION,DOC_TYPE,DOC_URBAN_MUTATION,EXEMPTION_ID,EXEMPTION_REASON,DOC_COR) values (:APP_ID,:SR_CODE,:BOOK_NO,:DOCT_NO,:REG_YEAR,:DOC_ACC,:DOC_RESUBMIT,:DOC_EKYC,'N','N','N','N','N','N','N','N','N',:DOC_TYPE,'N',:EXEMPTION_ID, '','N')`;
			const bindParams = {
				APP_ID : reqData.APP_ID,
				SR_CODE : reqData.SR_CODE,
				BOOK_NO : reqData.BOOK_NO,
				DOCT_NO : reqData.DOCT_NO,
				REG_YEAR : reqData.REG_YEAR,
				DOC_ACC : reqData.DOC_ACC,
				DOC_RESUBMIT : reqData.DOC_RESUBMIT,
				DOC_EKYC : reqData.DOC_EKYC,
				DOC_TYPE : reqData.DOC_TYPE,
				EXEMPTION_ID : reqData.EXEMPTION_ID ? reqData.EXEMPTION_ID : '',
			}
			let result = await this.dbDao.oDbInsertDocsWithBindParams(query, bindParams);
			if (result < 0) {
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - postPdeByAccept || Error : ", ex);
			console.error("PreRegistraionServices - postPdeByAccept || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	updateDocVerifySvc = async (reqData) => {
		try {
			let base64 = Buffer.from(reqData.PP_DOC,'base64');
			let base642 = Buffer.from(reqData.MV_DOC, 'base64');
			let base643 = Buffer.from(reqData.OTHER_DOC, 'base64');
			let query = `UPDATE PREREGISTRATION.PDE_VERIFY set DOC_VERIFY='${reqData.DOC_VERIFY}',VERIFY_BY='${reqData.VERIFY_BY}',VERIFY_ON=TO_DATE('${reqData.VERIFY_ON}','dd-mm-yyyy'), verify_comment='${reqData.VERIFY_COMMENT}',pp_check='${reqData.PP_CHECK}',mv_check='${reqData.MV_CHECK}',pp_comments='${reqData.PP_COMMENT}',mv_comments='${reqData.MV_COMMENT}',juri_check_on=sysdate,pp_doc=:blobData,mv_doc=:blobData2,other_doc=:blobData3 where id='${reqData.ID}'`;
			let result = await this.dbDao.oDbInsertBlobDocs(query,base64,base642,base643);
			if (result < 0) {
				throw new Error('Bad Request');
			}
			return result;
		} catch (ex) {
			Logger.error("PreRegistrationHandler - updateDocVerifySvc || Error: ", ex);
			console.error("PreRegistrationHandler - updateDocVerifySvc || Error: ", ex);
			throw new CARDError({ err: ex });
		}
	}
	anyWhereAcceptSvc = async (reqData)=>{
		try{			
			let query = `SELECT a.ID,LOC_HAB_NAME,SCHEDULE_NO,a.sURVEY_NO,a.RESUBMITTED,a.RESUBMIT_CHALLANS,a.PP_RESUBMIT_REASON, (SELECT VILLAGE_NAME FROM HAB_CODE WHERE a.VILLAGE_cODE||'01'=HAB_cODE and rownum=1)VILLNAME,TOTAL_EXTENT,TOTAL_EXT_UNIT,b.entry_date FROM PREREGISTRATION.schedule_entry a, preregistration.presentation b WHERE a.JURISDICTION= :SR_CODE AND JURI_STATUS ='N' and a.id=b.id`;
			const values={
				SR_CODE : reqData.SR_CODE
			}
			let result = await this.dbDao.oDBQueryServiceWithBindParams(query, values);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - anyWhereAcceptSvc || Error : ", ex);
			console.error("PreRegistraionServices - anyWhereAcceptSvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	anyWhereSaveSvc = async (reqData, userData)=>{
		try{
			let base64 = Buffer.from(reqData.PP_DOC,'base64');
			let base642 = Buffer.from(reqData.MV_DOC, 'base64');
			let base643 = Buffer.from(reqData.OTHER_DOC, 'base64');
			let query = `UPDATE PREREGISTRATION.schedule_entry set JURI_STATUS=:STATUS,reject_reason=:REJECT_REASON, pp_check=:PP_CHECK,mv_check=:MV_CHECK,pp_comments=:PP_COMMENT,mv_comments=:MV_COMMENT, juri_sd=:STAMP_DUTY, juri_rf=:REGISTRATION_FEE, juri_uc=:USER_CHARGES, juri_fc=:FINAL_CHARGEABLE_VALUE,juri_check_by=:JURI_CHECK_BY,juri_check_on=sysdate,pp_doc=:blobData,mv_doc=:blobData2,other_doc=:blobData3 WHERE  ID=:ID and jurisdiction=:SR_CODE and schedule_no=:SCHEDULE_NO`;
			let values = {
				STATUS: reqData.STATUS,
				REJECT_REASON: reqData.REJECT_REASON ? reqData.REJECT_REASON : "",
				PP_CHECK: reqData.PP_CHECK,
				MV_CHECK: reqData.MV_CHECK,
				PP_COMMENT: reqData.PP_COMMENT,
				MV_COMMENT: reqData.MV_COMMENT,
				STAMP_DUTY: reqData.STAMP_DUTY,
				REGISTRATION_FEE: reqData.REGISTRATION_FEE,
				USER_CHARGES: reqData.USER_CHARGES,
				FINAL_CHARGEABLE_VALUE: reqData.FINAL_CHARGEABLE_VALUE,
				ID: reqData.ID,
				SR_CODE: reqData.SR_CODE,
				SCHEDULE_NO: reqData.SCHEDULE_NO,
				JURI_CHECK_BY: userData.EMPL_ID || ''
			}
			let result = await this.dbDao.oDbInsertBlobDocsWithBindParams(query,values,base64,base642,base643);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - anyWhereSaveSvc || Error : ", ex);
			console.error("PreRegistraionServices - anyWhereSaveSvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	anyWhereStatusSrvc = async (reqData)=>{
		try{			
			let query = `SELECT a.*,(select sr_name from sr_master where sr_Cd=a.jurisdiction) juriname from PREREGISTRATION.schedule_entry a where id='${reqData.ID}'`;
			let result = await this.dbDao.oDBQueryService(query);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - anyWhereStatusSrvc || Error : ", ex);
			console.error("PreRegistraionServices - anyWhereStatusSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	anyWherePendingSrvc = async (reqData)=>{
		try{			
			let query = `select * from preregistration.pre_registration_cca where sro_location = ${reqData.sro_location} and juri_status='N'`;
			let result = await this.dbDao.oDBQueryService(query);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - anyWherePendingSrvc || Error : ", ex);
			console.error("PreRegistraionServices - anyWherePendingSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	savePendingSrvc = async (reqData) => {
        try {
            let sQuery = `select * from srouser.tran_pending where sr_code = ${reqData.SR_CODE} and reg_year = ${reqData.REG_YEAR} and book_no = ${reqData.BOOK_NO} and p_number = ${reqData.P_NUMBER}`;
            let r = await this.dbDao.oDBQueryService(sQuery);
            if (r.length) {
                throw new Error('Number already used')
            } else {
                let query = `Insert into SROUSER.TRAN_PENDING (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,KEPT_BY,KEPT_ON,P_NUMBER,PENDING_REMARKS) values (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.KEPT_BY}',TO_DATE('${reqData.KEPT_ON}','DD-MM-YYYY'),${reqData.P_NUMBER},'${reqData.PENDING_REMARKS}')`;
                let result = await this.dbDao.oDbInsertDocs(query);
                if (result < 0) {
                    throw new Error('Bad Request')
                }
                const checkQuery = `select count(*) as count
                                    from pde_doc_status_cr a
                                    join preregistration.Section47A_Dutyfee cca on a.app_id = cca.app_id
                                    where a.sr_code = ${reqData.SR_CODE} and a.reg_year = ${reqData.REG_YEAR} and a.book_no = ${reqData.BOOK_NO} and a.doct_no = ${reqData.DOCT_NO} and cca.section_47 = 'Y'`
                const checkResult = await this.dbDao.oDBQueryService(checkQuery);
                if(checkResult[0].COUNT > 0) {
                    const Insertquery = `Insert into srouser.tran_section_47a (sr_code, doct_no, book_no, reg_year, time_stamp, form1_status, form2_status, entry_by, sr_status, dr_status)
                                values (:SR_CODE, :DOCT_NO, :BOOK_NO, :REG_YEAR, sysdate, 'N', 'N', :EMPL_ID, 'N', 'N')`;
                    const bindParams = {
                        SR_CODE : reqData.SR_CODE,
                        DOCT_NO : reqData.DOCT_NO,
                        BOOK_NO : reqData.BOOK_NO,
                        REG_YEAR : reqData.REG_YEAR,
                        EMPL_ID : reqData.KEPT_BY
                    }
                    const Insertresult = await this.dbDao.oDbInsertDocsWithBindParams(Insertquery, bindParams);
                }
                return result
            }
        } catch (ex) {
            Logger.error("PreRegistraionServices - savePendingSrvc || Error : ", ex);
            console.error("PreRegistraionServices - savePendingSrvc || Error : ", ex);
            throw constructCARDError(ex);
        }
    }
	getDocVerifySrvc = async(reqData) => {
		try{
			let query = `SELECT * From PREREGISTRATION.PDE_VERIFY WHERE ID = '${reqData.id}'`;
			let response = await this.dbDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("PreRegistraionServices - getDocVerifySrvc || Error :", ex);
			console.error("PreRegistraionServices - getDocVerifySrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	saveProbAuditSrvc = async (reqData)=>{
		try{			
			let query = `Insert into srouser.prohb_audit (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,VILLAGE_CD,SURVEY_NO,WARD_NO,BLOCK_NO,DOOR_NO,ERROR_TYPE,JURISDICTION,OPERATOR,TIMESTAMP) values (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.VILLAGE_CD}','${reqData.SURVEY_NO}','${reqData.WARD_NO}','${reqData.BLOCK_NO}','${reqData.DOOR_NO}','${reqData.ERROR_TYPE}','${reqData.JURISDICTION}','${reqData.OPERATOR}',SYSDATE)`;
			let result = await this.dbDao.oDbInsertDocs(query);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - saveProbAuditSrvc || Error : ", ex);
			console.error("PreRegistraionServices - saveProbAuditSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	grantApprovalSrvc = async (reqData)=>{
		try{			
			let query = `Insert into SROUSER.PROHB_AUDIT_CR (APP_ID,SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,SCHEDULE_NO,VILLAGE_CD,SURVEY_NO,WARD_NO,BLOCK_NO,DOOR_NO,ERROR_TYPE,JURISDICTION,OPERATOR,TIMESTAMP,COMMENTS) values ('${reqData.APP_ID}',${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.SCHEDULE_NO}','${reqData.VILLAGE_CD}','${reqData.SURVEY_NO}',${reqData.WARD_NO},${reqData.BLOCK_NO},'${reqData.DOOR_NO}','${reqData.ERROR_TYPE}',${reqData.JURISDICTION},'${reqData.OPERATOR}',SYSDATE,'${reqData.COMMENTS}')`;
			let result = await this.dbDao.oDbInsertDocs(query);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - grantApprovalSrvc || Error : ", ex);
			console.error("PreRegistraionServices - grantApprovalSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	ProhibitedstatusSrvc = async (reqData)=>{
		try{			
			let query = `select * from preregistration.schedule_entry where ID= '${reqData.ID}'`;
			let result = await this.dbDao.oDBQueryService(query);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - ProhibitedstatusSrvc || Error : ", ex);
			console.error("PreRegistraionServices - ProhibitedstatusSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	PPGrantSrvc = async (reqData)=>{
		try{
			let query = `UPDATE PREREGISTRATION.schedule_entry set PROBH_CHECK='${reqData.PROBH_CHECK}' WHERE  ID='${reqData.ID}' and schedule_no=${reqData.SCHEDULE_NO}`;
			let result = await this.dbDao.oDbUpdate(query);
			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - PPGrantSrvc || Error : ", ex);
			console.error("PreRegistraionServices - PPGrantSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	saveRejectreasonPA = async (reqData)=>{
		try{			
			let query = `INSERT INTO preregistration.pre_registration_pa_reject (APP_ID, reject_BY, reject_reason, TIME_STAMP)
			SELECT '${reqData.APP_ID}', '${reqData.REJECT_BY}', '${reqData.REJECT_REASON}', TRUNC(SYSDATE)
			FROM dual
			WHERE NOT EXISTS (SELECT 1 FROM preregistration.pre_registration_pa_reject
			WHERE APP_ID = '${reqData.APP_ID}')`;
			console.log(query);
			let result = await this.dbDao.oDbInsertDocs(query);
			if(result <= 0){
				if(result === 0){
					throw new Error(`APP_ID: ${reqData.APP_ID} has been already Rejected`)
				}
				else{
				throw new Error('Bad Request')}
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - saveRejectreasonPA || Error : ", ex);
			console.error("PreRegistraionServices - saveRejectreasonPA || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	getPendinglist = async (reqData)=>{
		try{			
			let query = `select * from srouser.tran_pending where sr_code = ${reqData.SR_CODE} and reg_year = ${reqData.REG_YEAR} and book_no = ${reqData.BOOK_NO} and doct_no= ${reqData.DOCT_NO} `;
			let result = await this.dbDao.oDBQueryService(query);
			if(result < 0){
				throw new Error('Bad Request')}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - getPendinglist || Error : ", ex);
			console.error("PreRegistraionServices - getPendinglist || Error : ", ex);
            throw constructCARDError(ex);
        }
    }

	getPreviewAnywhereDocumentSrvc = async (reqData) => {
		try {
			const headers = {
                'Authorization': 'Basic SUdSU0FQSVVTRVI6SUdSJFVTRVJANTIyIw==',
                'api-key': 'bb216cbc-c987-4073-b5dc-4a49fd0a7ad0'
            };
			let response = await instance({ method: "GET", url: `${process.env.PDE_HOST}/pdeapi/v1/documents/documentPreviewCARD/${reqData.APP_ID}/anywheredocument.pdf`, headers: headers });
			if (response.status === 200) {
				// const pdfBase64 = Buffer.from(response.data, "binary").toString("base64");
				return response.data; 
			} else {
				throw new Error(`Failed to fetch document: ${response.status}`);
			}
		} catch (ex) {
			console.log(ex.response && ex.response.status === 404, ex.response);
			if (ex.response?.data?.message?.includes("ENOENT")) {
				console.error(`Document not found for APP_ID: ${reqData.APP_ID}`);
				return '';
			}
			Logger.error("PreRegistraionServices - getPreviewAnywhereDocumentSrvc || Error : ", ex);
			console.error("PreRegistraionServices - getPreviewAnywhereDocumentSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	};

	getSlotEnableStatusSrvc = async (reqData) => {
        try {
        //    let bindparam ={
        //     SR_CODE : reqData.SR_CODE
        //    }
        //     let query = `select count(*) as count from srouser.slot_enable_sro where status = 'Y' and sr_code = :SR_CODE`;            
        //     let response = await this.dbDao.oDBQueryServiceWithBindParams(query, bindparam)
        //     return response[0].COUNT;

			let bindparam ={
				SR_CODE : reqData.SR_CODE
			   }
				let query = `select * from srouser.slot_enable_sro where sr_code = :SR_CODE`;  
				console.log('before')          			
				let response = await this.dbDao.oDBQueryServiceWithBindParams(query, bindparam)
				console.log(response,"ressssssss");
				return response;
        } catch (ex) {
            Logger.error("PreRegistraionServices - getSlotEnableStatusSrvc || Error :", ex);
            console.error("PreRegistraionServices - getSlotEnableStatusSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


	getVerifyOTPSrvc = async (reqData) => {
        try {
           let bindparam ={
            APP_ID : reqData.APP_ID,
			OTP : reqData.OTP,
			// SR_CODE : reqData.SR_CODE
           }
            let query = `select count(*) as count from preregistration.slot_details where otp = :OTP and id = :APP_ID`;            
            let response = await this.dbDao.oDBQueryServiceWithBindParams(query, bindparam)
            return response[0].COUNT > 0 ? 'OTP Verified' : 'Invalid OTP';
        } catch (ex) {
            Logger.error("PreRegistraionServices - getVerifyOTPSrvc || Error :", ex);
            console.error("PreRegistraionServices - getVerifyOTPSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

	rejectDuplicateSurveyNoDoc = async(ID) =>{
		try {
            let query = `update preregistration.pre_registration_cca set doc_lock ='C', juri_status='C' where id=:ID`;
			let value = {
				ID: ID
			}            
            let response = await this.dbDao.oDBQueryServiceWithBindParams(query, value)
            return response;
        } catch (ex) {
            Logger.error("PreRegistraionServices - rejectDuplicateSurveyNoDoc || Error :", ex);
            console.error("PreRegistraionServices - rejectDuplicateSurveyNoDoc || Error :", ex);
            throw constructCARDError(ex);
        }
	}

	reSubmitAnywhereDocument = async(reqData) =>{
		try {
			let existanceQuery = `SELECT * FROM preregistration.anywhere_resubmit_log WHERE ID=:ID and SCHEDULE=:SCHEDULE`
			let values = {ID: reqData.ID, SCHEDULE: reqData.SCHEDULE};
			let existance = await this.dbDao.oDBQueryServiceWithBindParams(existanceQuery, values)
			if(existance.length > 0){
				throw new Error(`${reqData.ID} application is already submitted.`);
			}

            let query = `UPDATE PREREGISTRATION.schedule_entry set JURI_STATUS= 'N', RESUBMITTED= 1 where id=:ID and SCHEDULE_NO=:SCHEDULE`;          
			let response = await this.dbDao.oDBQueryServiceWithBindParams(query, values)

			let backlog = `select PP_CHECK, MV_CHECK, PP_COMMENTS, MV_COMMENTS, JURI_SD, JURI_RF, JURI_FC, JURI_UC, SCHEDULE_NO, JURI_CHECK_BY, JURI_CHECK_ON from PREREGISTRATION.schedule_entry where id=:ID and SCHEDULE_NO=:SCHEDULE`;
			let backlogResponse = await this.dbDao.oDBQueryServiceWithBindParams(backlog, values)

			let backupQuery = `INSERT INTO preregistration.anywhere_resubmit_log (id, pp_check, mv_check, pp_comments, mv_comments, juri_rf, juri_sd, juri_fc, juri_uc, schedule, juri_check_by, juri_check_on) VALUES (:ID, :PP_CHECK, :MV_CHECK, :PP_COMMENTS, :MV_COMMENTS, :JURI_RF, :JURI_SD, :JURI_FC, :JURI_UC, :SCHEDULE, :JURI_CHECK_BY, :JURI_CHECK_ON)`;
			values = {
				ID: reqData.ID,
				PP_CHECK: backlogResponse[0].PP_CHECK,
				MV_CHECK: backlogResponse[0].MV_CHECK,
				PP_COMMENTS: backlogResponse[0].PP_COMMENTS,
				MV_COMMENTS: backlogResponse[0].MV_COMMENTS,
				JURI_RF: backlogResponse[0].JURI_RF,
				JURI_SD: backlogResponse[0].JURI_SD,
				JURI_FC: backlogResponse[0].JURI_FC,
				JURI_UC: backlogResponse[0].JURI_UC,
				SCHEDULE: backlogResponse[0].SCHEDULE_NO,
				JURI_CHECK_BY: backlogResponse[0].JURI_CHECK_BY,
				JURI_CHECK_ON: backlogResponse[0].JURI_CHECK_ON	
			}			
			await this.dbDao.oDBQueryServiceWithBindParams(backupQuery, values)

            return response;
        } catch (ex) {
            Logger.error("PreRegistraionServices - reSubmitAnywhereDocument || Error :", ex);
            console.error("PreRegistraionServices - reSubmitAnywhereDocument || Error :", ex);
            throw constructCARDError(ex);
        }
	}

	getClaimantDetails = async(reqData) => {
		try{		
			let query = `SELECT ec.NAME, ec.AADHAR_ENCRPT
				FROM preregistration.executants_claimant ec
				JOIN preregistration.presentation p ON ec.ID = p.ID
				WHERE ec.ID = :ID
				AND ec.CODE IN ('CL', 'DE', 'SP', 'RE', 'ME', 'LE', 'AY')
				AND LENGTH(ec.AADHAR_ENCRPT) > 12
				AND NOT (
					(p.tran_maj_code = '01' AND p.tran_min_code IN ('19','20')) OR
					(p.tran_maj_code = '02' AND p.tran_min_code IN ('02','05','06','08')) OR
					(p.tran_maj_code = '04' AND p.tran_min_code = '03') OR
					(p.tran_maj_code = '05' AND p.tran_min_code IN ('04','05')) OR
					(p.tran_maj_code = '08' AND p.tran_min_code = '06')
				)

				UNION ALL

				SELECT ef.NAME, ef.AADHAR_ENCRPT
				FROM preregistration.executants_claimant_firms ef
				JOIN preregistration.presentation p ON ef.ID = p.ID
				WHERE ef.ID = :ID
				AND ef.CODE IN ('CL', 'DE', 'SP', 'RE', 'ME', 'LE', 'AY')
				AND LENGTH(ef.AADHAR_ENCRPT) > 12
				AND NOT (
					(p.tran_maj_code = '01' AND p.tran_min_code IN ('19','20')) OR
					(p.tran_maj_code = '02' AND p.tran_min_code IN ('02','05','06','08')) OR
					(p.tran_maj_code = '04' AND p.tran_min_code = '03') OR
					(p.tran_maj_code = '05' AND p.tran_min_code IN ('04','05')) OR
					(p.tran_maj_code = '08' AND p.tran_min_code = '06')
				)`;
			let value = {
				ID: reqData.ID,
			}
			let result = await this.dbDao.oDBQueryServiceWithBindParams(query, value);
			result = result.map(item => ({...item, AADHAR : AadhardecryptData(item.AADHAR_ENCRPT)}));

			if(result < 0){
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - getClaimantDetails || Error : ", ex);
			console.error("PreRegistraionServices - getClaimantDetails || Error : ", ex);
			throw constructCARDError(ex);
		}
	}

	SaveEkycClaimantDetails = async (reqData) => {
		try {
			let query = `Insert into srouser.claimant_ekyc_details (ID, CLAIMANT_NAME, CLAIMANT_AADHAR, EKYC_TYPE, TIME_STAMP) values (:ID, :CLAIMANT_NAME, :CLAIMANT_AADHAR, :EKYC_TYPE, sysdate)`;
			const bindParams = {
				ID: reqData.id,
				CLAIMANT_NAME: reqData.claimant_name,
				CLAIMANT_AADHAR: reqData.claimant_aadhar,
				EKYC_TYPE: reqData.ekyc_type
			};
			let result = await this.dbDao.oDbInsertDocsWithBindParams(query, bindParams);
			if (result < 0) {
				throw new Error('Bad Request')
			}
			return result
		}catch(ex){
			Logger.error("PreRegistraionServices - SaveEkycClaimantDetails || Error : ", ex);
			console.error("PreRegistraionServices - SaveEkycClaimantDetails || Error : ", ex);
			throw constructCARDError(ex);
		}
	}
	rejectDuplicateStampsDoc = async(ID) =>{
		try {
            let query = `update preregistration.pre_registration_cca set doc_lock ='S', juri_status='S' where id=:ID`;
			let value = {
				ID: ID
			}            
            let response = await this.dbDao.oDBQueryServiceWithBindParams(query, value)
            return response;
        } catch (ex) {
            Logger.error("PreRegistraionServices - rejectDuplicateSurveyNoDoc || Error :", ex);
            console.error("PreRegistraionServices - rejectDuplicateSurveyNoDoc || Error :", ex);
            throw constructCARDError(ex);
        }
	}

	getOCIParties = async(reqData) =>{
		try{
			let query =`SELECT party_code, party_number, party_file FROM preregistration.oci_details WHERE id=:ID`,
			value = {
				ID : reqData.ID
			}
			let result = await this.dbDao.oDBQueryServiceWithBindParams(query, value);
			return result;
		}catch(ex){
			Logger.error("PreRegistraionServices - getOCIParties || Error :", ex);
			console.error("PreRegistraionServices - getOCIParties || Error :", ex);
			throw constructCARDError(ex);
		}
	}

};


module.exports = PreRegistraionServices;