const CARDError = require("../errors/customErrorClass");
const oracleDb = require('oracledb');
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const ObDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const soap = require('soap');
const xml2json = require('xml-js');
const { Logger } = require('../../services/winston');
const checkSlipReportServices = require('../services/checkSlipReportServices');
const autoMutationServices = require('./autoMutationService');
const ccServices = require('./ccServices');
const { get } = require('lodash');
const puppeteer = require('puppeteer');
const Path = require('path');
const fsone = require('fs');
const { statusCheck, sendSMSNotification ,whatsAppNotificationForEC, smsAfterCompleteDigitalSign} = require('../common/smsCommon');
const {CODES, URBAN_MUTATION_ACCEPT_MAJOR_CODES,URBAN_MUTATION_ACCEPT_MINOR_CODES } =require('../constants/appConstants')
class ObService {
	constructor() {
		this.obDao = new ObDao();
		this.checkslipsrvc = new checkSlipReportServices();
		this.autoService = new autoMutationServices();
		this.ccService = new ccServices();
	}
	getAllcash = async (reqData) => {
		try {
			let urbanMutableCodes = [], urbanMutableQuery;
			if(reqData.status == 'D') {
				for (const majorCode of URBAN_MUTATION_ACCEPT_MAJOR_CODES) {
					const minorCodes = URBAN_MUTATION_ACCEPT_MINOR_CODES[majorCode];
					if (minorCodes && minorCodes.length > 0) {
						const minorList = minorCodes.filter(code => code !== '').map(code => `'${code}'`).join(', ');
						const condition = `(tm.tran_maj_code = '${majorCode}' AND tm.tran_min_code IN (${minorList}))`;
						urbanMutableCodes.push(condition);
					}
				}
				urbanMutableQuery = urbanMutableCodes.join(' OR ');
			}
			const Status = {
				C: `DOC_ASSIGN = 'N' and DOC_EKYC = 'Y'`,
				E: `DOC_EKYC = 'N'`,
				// G : `DOC_ESIGN = 'Y' and DOC_ASSIGN = 'N' and DOC_CASH = 'Y'`,
				// and DOC_SUBDIV = 'Y'`,
				L: `DOC_ASSIGN = 'N' and DOC_EKYC = 'Y' and (DOC_PEND = 'N' OR DOC_PEND IS NULL)`,
				R: `DOC_ASSIGN = 'N' and DOC_CASH = 'Y' and (DOC_PEND = 'N' OR DOC_PEND IS NULL OR (DOC_PEND = 'Y' AND DOC_ENDORS = 'Y'))`,
				//  and DOC_SUBDIV = 'Y'`,
				// R: `DOC_ASSIGN = 'N' and DOC_CASH = 'Y' and (DOC_PEND = 'N' OR DOC_PEND IS NULL OR (DOC_PEND = 'Y' AND (DOC_RCORS = 'Y' OR  DOC_ENDORS = 'Y')))`,
				Y: `DOC_EKYC = 'Y' and DOC_ESIGN = 'N' and (DOC_ASSIGN = 'Y' OR DOC_PEND = 'Y')`,
				B: `DOC_BUNDLE = 'N' and DOC_ASSIGN = 'Y' and DOC_ESIGN = 'Y'  and (
						(
							EXISTS (
								SELECT 1 
								FROM tran_pending
								WHERE sr_code = a.sr_code 
								AND book_no = a.book_no 
								AND doct_no = a.doct_no 
								AND reg_year = a.reg_year
							)
							AND b.DOC_COR = 'Y'
						)
						OR
        				NOT EXISTS (
            				SELECT 1 
							FROM tran_pending 
							WHERE sr_code = a.sr_code 
							AND book_no = a.book_no 
							AND doct_no = a.doct_no 
							AND reg_year = a.reg_year
						)
					)`,
				S: `(DOC_ESIGN = 'N' OR DOC_ESIGN = 'P') and DOC_ENDORS = 'Y'`,
				D: `DOC_DIGI_SIGN = 'N' and DOC_ESIGN = 'Y' AND DOC_BUNDLE = 'Y'  AND 
					((DOC_MUTATION = 'Y' and not exists (
					select ts.*
					FROM tran_sched ts
					JOIN tran_major tm 
						ON ts.sr_code   = tm.sr_code
						AND ts.book_no   = tm.book_no
						AND ts.doct_no   = tm.doct_no
						AND ts.reg_year  = tm.reg_year
					where ts.SR_CODE = b.SR_CODE AND ts.DOCT_NO = b.DOCT_NO
					AND ts.REG_YEAR = b.REG_YEAR AND ts.BOOK_NO = b.BOOK_NO and ts.nature_use in ('01', '02', '06', '07', '09', '11')
					and (${urbanMutableQuery})
				)) OR DOC_URBAN_MUTATION = 'Y' OR (DOC_URBAN_MUTATION = 'N' AND EXISTS (
				SELECT 1
				FROM srouser.Mutation_status_record m
				WHERE m.SR_CODE = b.SR_CODE
				AND m.DOCT_NO = b.DOCT_NO
				AND m.REG_YEAR = b.REG_YEAR
				AND m.BOOK_NO = b.BOOK_NO
				AND m.mutation_status = 'N' and m.property_type = 'U')))`, //Digital sign
				DP: `DOC_DIGI_SIGN = 'N' and DOC_ESIGN = 'Y'`,
				// H : `DOC_HANDOVER = 'N' and DOC_DIGI_SIGN = 'Y'`
				H: `DOC_HANDOVER = 'N' and DOC_DIGI_SIGN = 'Y'`, // Document handover  
				W: `DOC_CASH = 'Y' and DOC_SUBDIV = 'N'`,
				// F: `DOC_DIGI_SIGN = 'Y' and DOC_MUTATION = 'N' and DOC_HANDOVER = 'N'`,
				F: `DOC_MUTATION = 'N' and DOC_SUBDIV = 'Y' and DOC_ESIGN = 'Y' and DOC_BUNDLE = 'Y' AND t.nature_use IN ('21','26','30','44','45','46') and (DOC_MUTATION = 'N'  AND NOT EXISTS (
				SELECT 1
				FROM srouser.Mutation_status_record m
				WHERE m.SR_CODE = b.SR_CODE
				AND m.DOCT_NO = b.DOCT_NO
				AND m.REG_YEAR = b.REG_YEAR
				AND m.BOOK_NO = b.BOOK_NO
				AND m.mutation_status = 'N' ))`, //Rural Mutation
				U: `DOC_URBAN_MUTATION = 'N' and DOC_BUNDLE = 'Y' and DOC_ESIGN = 'Y' AND t.nature_use NOT IN ('21','26','30','44','45','46')
				 AND (DOC_URBAN_MUTATION = 'N' AND NOT EXISTS (
				SELECT 1
				FROM srouser.Mutation_status_record m
				WHERE m.SR_CODE = b.SR_CODE
				AND m.DOCT_NO = b.DOCT_NO
				AND m.REG_YEAR = b.REG_YEAR
				AND m.BOOK_NO = b.BOOK_NO
				AND m.mutation_status = 'N' and m.property_type = 'U'))`, //Urban Mutation
				O: `DOC_ASSIGN = 'Y' and DOC_ESIGN = 'Y' and DOC_PEND = 'Y' and (DOC_COR = 'N' or DOC_COR IS NULL)`,
				P : `DOC_ASSIGN = 'N' and DOC_refuse = 'Y'`,
				Z: `DOC_ACC = 'Y' AND DOC_ASSIGN = 'N'  AND (doc_refuse <> 'Y' OR doc_refuse IS NULL) and doc_pend='Y'`,
				RR:`DOC_ASSIGN = 'N' and DOC_refuse = 'Y'`,
				RES: `DOC_RESIGN IS NULL AND DOC_REFUSE='Y' AND DOC_REKYC='Y' and DOC_ASSIGN='Y'`,
                RS:`B.DOC_ESIGN='Y' AND B.DOC_BUNDLE='Y' AND B.DOC_RESCAN='R'`,

			}
			if (Status[reqData.status] == null) {
				throw new Error("Bad Request");
			}
			let query = `SELECT a.*,(select tran_desc from tran_dir b where a.tran_maj_code=b.tran_maj_code and a.tran_min_code=b.tran_min_code) trandesc, b.*,
			to_char(p_date,'dd/mm/yyyy') p_date1,to_char(e_date,'dd/mm/yyyy') e_date1 From tran_major a , srouser.pde_doc_status_cr b where b.GS_SRCODE is null and a.sr_code=${reqData.srCode} and a.reg_year=${reqData.regYear} and a.sr_code=b.sr_code and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year and ${Status[reqData.status.toUpperCase()]}`;
			if(reqData.status == 'R'){
				query = `select d.*, pde.*, cca.juri_status, pdc.anywherecnt, cca.doc_lock from (
					SELECT a.*,(select tran_desc from tran_dir b where a.tran_maj_code=b.tran_maj_code and a.tran_min_code=b.tran_min_code) trandesc, b.app_id,
					to_char(p_date,'dd/mm/yyyy') p_date1,to_char(e_date,'dd/mm/yyyy') e_date1 
					From tran_major a , srouser.pde_doc_status_cr b 
					where b.GS_SRCODE is null and a.sr_code= ${reqData.srCode} and a.reg_year= ${reqData.regYear}
					and a.sr_code=b.sr_code 
					and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year and ${Status[reqData.status.toUpperCase()]}) d
					left join preregistration.prereg_det_cr pdc on d.app_id = pdc.id
					left join preregistration.pre_registration_cca cca on d.app_id = cca.id
					join pde_doc_status_cr pde on d.app_id = pde.app_id`
            }
			if(reqData.status == 'B'){
				query = `SELECT a.*,(select tran_desc from tran_dir b where a.tran_maj_code=b.tran_maj_code and a.tran_min_code=b.tran_min_code) trandesc, b.*,
			to_char(p_date,'dd/mm/yyyy') p_date1,to_char(e_date,'dd/mm/yyyy') e_date1, 
				CASE 
				WHEN EXISTS (
					SELECT 1
					FROM srouser.tran_sched 
					WHERE sr_code = a.sr_code AND book_no = a.book_no AND doct_no = a.doct_no AND reg_year=a.reg_year
					AND nature_use in ('21','26','30','45','46') 
					)
				THEN 'R'
				ELSE 'U'
			END AS PROPERTY_TYPE
			From tran_major a , srouser.pde_doc_status_cr b where b.GS_SRCODE is null and a.sr_code=${reqData.srCode} and a.reg_year=${reqData.regYear} and a.sr_code=b.sr_code and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year and ${Status[reqData.status.toUpperCase()]}`
            }
			if(reqData.status == 'DP'){
				query = `SELECT a.*,(select tran_desc from tran_dir b where a.tran_maj_code=b.tran_maj_code and a.tran_min_code=b.tran_min_code) trandesc, b.*,
				to_char(p_date,'dd/mm/yyyy') p_date1,to_char(e_date,'dd/mm/yyyy') e_date1 From tran_major a , srouser.pde_doc_status_cr b where a.sr_code=${reqData.srCode} and a.reg_year=${reqData.regYear} and a.sr_code=b.sr_code and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year and ${Status[reqData.status.toUpperCase()]}`;
			}
			if (reqData.status == 'P' || reqData.status == 'RES'){
                query = `SELECT a.*, (SELECT tran_desc FROM tran_dir b WHERE a.tran_maj_code=b.tran_maj_code 
					AND a.tran_min_code=b.tran_min_code) AS trandesc, 
					b.*,TO_CHAR(p_date, 'dd/mm/yyyy') AS p_date1, TO_CHAR(e_date, 'dd/mm/yyyy') AS e_date1 ,C.PR_NO,C.PR_DT
					FROM  srouser.refuse_tran_major a JOIN     srouser.pde_doc_status_cr b 
					ON a.sr_code = b.sr_code AND a.book_no = b.book_no AND a.doct_no = b.doct_no 
					AND a.reg_year = b.reg_year 
					LEFT JOIN srouser.tran_refuse c ON a.sr_code = c.sr_code AND a.book_no = c.book_no 
					AND a.doct_no = c.doct_no AND a.reg_year = c.reg_year 
					WHERE b.GS_SRCODE IS NULL AND a.sr_code=${reqData.srCode} and a.reg_year=${reqData.regYear} 
					AND  ${Status[reqData.status.toUpperCase()]}`;
                } // For refusal module
				if (reqData.status == 'F' || reqData.status == 'U'){
					query = `SELECT distinct a.*, (SELECT tran_desc FROM tran_dir b WHERE a.tran_maj_code = b.tran_maj_code AND a.tran_min_code = b.tran_min_code) AS trandesc, b.*,
                    TO_CHAR(p_date, 'dd/mm/yyyy') AS p_date1, TO_CHAR(e_date, 'dd/mm/yyyy') AS e_date1 FROM tran_major a
                    JOIN srouser.pde_doc_status_cr b ON a.sr_code = b.sr_code AND a.book_no = b.book_no AND a.doct_no = b.doct_no AND a.reg_year = b.reg_year
                    JOIN tran_sched t ON a.sr_code = t.sr_code AND a.book_no = t.book_no AND a.doct_no = t.doct_no AND a.reg_year = t.reg_year 
					WHERE b.GS_SRCODE IS NULL AND a.sr_code=${reqData.srCode} and a.reg_year=${reqData.regYear} AND  ${Status[reqData.status.toUpperCase()]}`;
					}
					if(reqData.status == 'RS'){
						query = `SELECT * from srouser.pde_doc_status_cr b 
						JOIN SROUSER.RESCAN_ESIGN_STATUS A ON A.SR_CODE=B.SR_cODE AND A.DOCT_NO=B.DOCT_NO AND A.REG_YEAR=B.REG_YEAR AND A.BOOK_NO=B.BOOK_NO where b.GS_SRCODE is null and b.sr_code=${reqData.srCode} and b.reg_year=${reqData.regYear}  and ${Status[reqData.status.toUpperCase()]}`;
					}
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getAllcashDataBySro || Error :", ex);
			console.error("CashPayableHandler - getAllcashDataBySro || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getVSWSReqAssignSvc = async (reqData) => {
		try {
			let query = `SELECT a.*,(select tran_desc from tran_dir b where a.tran_maj_code=b.tran_maj_code and a.tran_min_code=b.tran_min_code) trandesc, b.* From tran_major a , srouser.pde_doc_status_cr b where a.sr_code=${reqData.SR_CODE} and a.reg_year=${reqData.REG_YEAR} and a.sr_code=b.sr_code and a.book_no = b.book_no and a.doct_no = b.doct_no and a.reg_year = b.reg_year and DOC_ASSIGN = 'N' and DOC_CASH = 'Y' and (a. sr_code ,a. book_no,a. doct_no,a. reg_year) not in (select sr_code,book_no,doct_no,reg_year from SROUSER.ASSIGN_RDOCT_VSWS)`;
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getVSWSReqAssignSvc || Error :", ex);
			console.error("CashPayableHandler - getVSWSReqAssignSvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getCashPayableSvc = async (reqData) => {
		try {
			let query = `select 111 sr_Code,1 book_no,111 doct_no,1111 reg_year,'c' reg_type,'01' tran_maj_code,'01' tran_min_code,4 account_code,0 amount from dual union
			SELECT * From cash_payable where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and doct_no=${reqData.docNo} and reg_year=${reqData.regYear}
			`;
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getCashPayableSvc || Error :", ex);
			console.error("CashPayableHandler - getCashPayableSvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getPendingPdeSvc = async (reqData) => {
		try {
			let query = `SELECT * From doc_ack where prereg_id is null and sr_code=${reqData.srCode} and reg_year= ${reqData.regYear}`;
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getPendingPdeSvc || Error :", ex);
			console.error("CashPayableHandler - getPendingPdeSvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getAmountPaidSrvc = async (reqData, reqParams) => {
		try {
			if (reqParams.type === "online") {
				let year = parseInt(reqData.year);
				let bindparms = {
					SR_CODE:reqData.srCode,
					YEAR:year,
					DEPT_ID:`${reqData.dptId}`
				}
				let query3 = `select * from scanuser.echallan_acc_trans where sr_code=:SR_CODE and challan_year = :YEAR and depttransid=:DEPT_ID`;
				let response = await this.obDao.oDBQueryServiceWithBindParams(query3,bindparms);
				return response;
			} else if (reqParams.type === "stock") {
				const url = `${process.env.STOCKHOLDING_API}/lightCommonWeb/LightCommonWebService?WSDL`;
				const params = {}
				params.arg0 = {
					'userId': process.env.SHCIL_USER_ID,
					'password': process.env.SHCIL_PASSWORD,
					'certificateId': reqData.certificateId,
					'certIssueDate': reqData.certIssueDate
				}
				const funcName = 'getSingleCertificateDetails';
				let client = await soap.createClientAsync(url);
				let dataResponse = await client.getSingleCertificateDetailsAsync(params)

				if (!dataResponse || dataResponse.length == 0 || Object.keys(dataResponse[0].return.result).length <= 0) {
					throw new CARDError({ name: NAMES.NOT_FOUND, err: "Single Certificate Details Not Found" });
				}
				console.log("stock holding api response ============> ", dataResponse[0].return.result);
				const certificateResponse = JSON.parse(xml2json.xml2json(dataResponse[0].return.result, { spaces: 4, compact: true }));
				console.log("certficate json response", certificateResponse);
				let certRes = {}
				for (let [key, value] of Object.entries(certificateResponse.eStampCertificate.CertificatesDetails)) {
					certRes[key] = value._text;
				}
				let certificateResults = {
					"StateName": certificateResponse.eStampCertificate.StateName._text,
					"CertStatus": certificateResponse.eStampCertificate.CertStatus._text,
					"LinkedCertificates": Object.keys(certificateResponse.eStampCertificate.LinkedCertificates).length <= 0 ? '' : certificateResponse.eStampCertificate.LinkedCertificates,
					"CertificatesDetails": {
						"CertificateNo": certRes.CertificateNo,
						"CertificateIssuedDate": certRes.CertificateIssuedDate,
						"AccountReference": certRes.AccountReference,
						"UniqueDocReference": certRes.UniqueDocReference,
						"Purchasedby": certRes.Purchasedby,
						"DescriptionofDocument": certRes.DescriptionofDocument,
						"PropertyDescription": certRes.PropertyDescription,
						"ConsiderationPriceRs": certRes.ConsiderationPriceRs,
						"FirstParty": certRes.FirstParty,
						"SecondParty": certRes.SecondParty,
						"PaidByForWhom": certRes.PaidByForWhom,
						"StampDutyAmountRs": certRes.StampDutyAmountRs,
						"DeficitStampDutyRs": certRes.DeficitStampDutyRs,
						"DDOCode": certRes.DDOCode,
					}
				};
				return certificateResults;
			}
		} catch (ex) {
			Logger.error("CashPayableHandler - getAmountPaidSrvc || Error :", ex);
			console.error("CashPayableHandler - getAmountPaidSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	stockLockCertificateSrvc = async (reqData)=>{
		try{
			const url = `${process.env.STOCKHOLDING_API}/lightCommonWeb/LightCommonWebService?WSDL`;
			const params = {}
			params.arg0 = {
				'userId': process.env.SHCIL_USER_ID,
				'password': process.env.SHCIL_PASSWORD,
				'certId': reqData.certificateId,
				'certIssuedDate': reqData.certIssueDate,
				'lockedByUserId':'AP-Govt',
				'regNo':reqData.certificateId
			}
			let client = await soap.createClientAsync(url);
			let dataResponse = await client.lockEStampCertificateAsync(params);
			if (!dataResponse || dataResponse.length == 0 || dataResponse[0].return.responseCode =="1") {
				throw new CARDError({  err:  dataResponse[0].return.result});
			}
			
			console.log("stock holding api response ============> ", dataResponse[0].return.result);
			const certificateResponse = JSON.parse(xml2json.xml2json(dataResponse[0].return.result, { spaces: 4, compact: true }));
			console.log("certficate json response", certificateResponse);
			let certRes = {}
			for (let [key, value] of Object.entries(certificateResponse.LockedeStampCertificate)) {
				certRes[key] = value._text;
			}
			let certificateResults = {
				"CertStatus": dataResponse.responseDesc,
				"LinkedCertificates": Object.keys(certificateResponse.LockedeStampCertificate.LinkedCertificates).length <= 0 ? '' : certificateResponse.LockedeStampCertificate.LinkedCertificates,
				"CertificatesDetails": {
					"CertStatus": certRes.CertStatus,
					"CertificateNo": certRes.CertificateNo,
					"LockedDateTime": certRes.LockedDateTime,
					"LockedByUserId": certRes.LockedByUserId,
				}
			};
			return certificateResults
		}catch(ex){
			Logger.error("CashPayableHandler - stockLockCertificateSrvc || Error :", ex);
			console.error("CashPayableHandler - stockLockCertificateSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getChallanSvc = async (reqData) => {
		try {
			let query = `select * from (select challanno,depttransid,userid,challan_year,challanno||'-'||userid chuid from scanuser.echallan_trans where upper(bankstatus)='SUCCESS' and Statusdesc='success Desc-CFMS' and con_status='N' and sr_code=${reqData.srCode} and trunc(time_stamp) >= trunc(sysdate)-${reqData.days} order by time_Stamp desc)`;
			let response = await this.obDao.oDBQueryService(query);
			return response
		} catch (ex) {
			Logger.error("CashPayableHandler - getChallanSvc || Error :", ex);
			console.error("CashPayableHandler - getChallanSvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getChallanStatus = async (reqData) => {
		try {
			let query = `select * from srouser.CFMS_CHALLANS where cfms_challan='${reqData.cfmsChallan}'`;
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getChallanStatus || Error :", ex);
			console.error("CashPayableHandler - getChallanStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	updateApplicationStatus = async (reqData, flag = false) => {
		try {
			let query2;
			const Status ={
				C : `DOC_CASH`,
				E : `DOC_EKYC`,
				R : `DOC_ASSIGN`,
				B : `DOC_BUNDLE`,
				N : `DOC_ENDORS`,
				S : `DOC_ESIGN`,
				D : `DOC_DIGI_SIGN`,
				H : `DOC_HANDOVER`,
				P : `DOC_PEND`,
				W : `DOC_SUBDIV`,
				F : `DOC_MUTATION`,
				U : `DOC_URBAN_MUTATION`,
				G: `DOC_ESIGN`,
				O: `DOC_COR`,
				RB:`DOC_RESCAN`,
				RE:`DOC_REKYC`,
			};
			//statuc check start
			const StatusNames = {
				C: "Cash Payment",
				E: "EKYC",
				R: "Assigning",
				B: "Scanning",
				N: "Endorsement",
				S: "E-Sign",
				D: "Digital Signature",
				H: "Handover",
				P: "Pending",
				W: "Subdivision",
				F: "Mutation",
				U: "Urban Mutation",
				G: "E-Sign",
				O: "Correction",
				RB: "Rescan",
				RE: "Re-KYC"
			};
			let statusKey = reqData.status.toUpperCase();
			let statusName = StatusNames[statusKey] || "Unknown Process";

			let currentStatusQuery = `SELECT DOC_EKYC, DOC_CASH, DOC_ASSIGN, DOC_BUNDLE, DOC_ENDORS, DOC_ESIGN,DOC_DIGI_SIGN, DOC_HANDOVER, DOC_PEND, DOC_SUBDIV, DOC_MUTATION,DOC_URBAN_MUTATION, DOC_COR, DOC_RESCAN, DOC_REKYC
            						  FROM SROUSER.pde_doc_status_cr 
            						  WHERE SR_CODE=${reqData.srCode} AND BOOK_NO=${reqData.bookNo} AND DOCT_NO=${reqData.doctNo} AND REG_YEAR=${reqData.regYear}`;
        	let currentStatusResult = await this.obDao.oDBQueryService(currentStatusQuery);
        	let previousStatus = currentStatusResult.length > 0 ? currentStatusResult[0] : {};			
			//end
			if(reqData.subDiv && reqData.status.toUpperCase() ==='W'){
				query2=`${Status['W']} = 'N', ${Status['F']} = 'N',${Status['U']} = 'N'`
			}
			else if (reqData.status.toUpperCase() === 'C') {
				let result = await this.checkslipsrvc.getCheckSlipReportsSrvc({
					...reqData, docNo: reqData.doctNo, sliceNumer: 1
				});
				// if (!['01', '03'].includes(get(result, 'docDetails.0.TRAN_MAJ_CODE', ''))) {
				if(!await this.autoService.isMutationNeeded(result)){
					query2 = `${Status['C']}='Y', CASH_TIME_STAMP = SYSDATE, ${Status['W']}='Y', ${Status['F']}='Y'`;
				} else {
					query2 = `${Status['C']}='Y', CASH_TIME_STAMP = SYSDATE`;
				}
			} else if (reqData.status.toUpperCase() === 'G') {
				query2 = `DOC_ESIGN='Y', DOC_ESIGN_TIME_STAMP = SYSDATE`;
			} else if (reqData.status.toUpperCase() === 'S') {    // 350 - 358 line No
				query2 = `DOC_ESIGN = 'Y', DOC_ESIGN_TIME_STAMP = SYSDATE`;
			} else if (reqData.status.toUpperCase() === 'O') {
				query2 = `DOC_COR = 'Y', DOC_COR_ESIGN_TIME_STAMP = SYSDATE`;
			} else if (reqData.status.toUpperCase() === 'C') {
				query2 = `DOC_CASH = 'Y', CASH_TIME_STAMP = SYSDATE`;
			} else if (reqData.status.toUpperCase() === 'R') {
				query2 = `DOC_ASSIGN = 'Y', ASSIGN_TIME_STAMP = SYSDATE`;
			} else if (reqData.status.toUpperCase() === 'P') {
				query2 = `DOC_PEND = 'Y', PENDING_TIME_STAMP = SYSDATE`;
			} else if (reqData.status.toUpperCase() === 'RE') {
				query2 = `DOC_REKYC='Y'`;
			}  
			else if (reqData.status.toUpperCase() === 'RE') {
				query2 = `DOC_REKYC='Y'`;
			} 
			else {	
				query2 = `${Status[reqData.status.toUpperCase()]}='Y'`;
			}

			if(reqData.status.toUpperCase() === 'E') {
				let witnessCheckQuery = ` SELECT * FROM srouser.tran_ec_aadhar_esign where SR_CODE=${reqData.srCode} AND BOOK_NO=${reqData.bookNo} AND DOCT_NO=${reqData.doctNo} AND REG_YEAR=${reqData.regYear} and CODE = 'WT'`;
				let wtinessResponse =  await this.obDao.oDBQueryService(witnessCheckQuery);
				if(wtinessResponse.length != 2){
					throw new Error("Witness information is not saved properly");
				}
				let witnessPhotosCheckQuery = ` Select * from PHOTOFP.TRAN_EC_WITNESS_PHOTOS where sr_code = ${reqData.srCode} and doct_no = ${reqData.doctNo} and reg_year = ${reqData.regYear} and book_no = ${reqData.bookNo} order by WITNESS_NUMBER `;
				let witnessPhotosResponse = await this.obDao.oDBQueryService(witnessPhotosCheckQuery);
				if(witnessPhotosResponse.length != 2){
					throw new Error("Witness photos are not saved properly");
				}
			}
			
			let query = `UPDATE SROUSER.pde_doc_status_cr SET ${query2} WHERE SR_CODE=${reqData.srCode} AND BOOK_NO=${reqData.bookNo} AND DOCT_NO=${reqData.doctNo} AND REG_YEAR=${reqData.regYear}` ?? "";
			if (query === "") {
				throw new Error("Bad Request");
			}
			let response = await this.obDao.oDbUpdate(query);
			//start
		if(response > 0){
			//Common sms code start
		const statusCheckResult = await statusCheck({
            srCode: reqData.srCode,
            doctNo: reqData.doctNo,
            bookNo: reqData.bookNo,
            regYear: reqData.regYear
        });
		if (reqData.status.toUpperCase() === 'D' && reqData.bookNo == 1) {
			const majorParams={
				srCode: reqData.srCode,
				bookNo: reqData.bookNo,
				regYear: reqData.regYear, 
				docNo: reqData.doctNo
			};
			const scannedCopy = await this.autoService.getFilePath({...majorParams});
			const query = `select a.*, (select sr_name from sr_master where sr_cd = a.sr_code) srname from srouser.tran_ec a where sr_code=:srCode and book_no=:bookNo and doct_no=:docNo and reg_year=:regYear`
			const partiesData = await this.obDao.oDBQueryServiceWithBindParams(query, {...majorParams});
			const dataParam = scannedCopy.split("?data=")[1];
			const claimantDetails = partiesData.filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
			for (let key of claimantDetails) {
				if (key.PHONE_NO) {
					whatsAppNotificationForEC({
						docNo: claimantDetails[0].RDOCT_NO,
						templateId: 'apigrs_document',
						regYear: reqData.regYear,
						mobileNumber: key.PHONE_NO,
						sroName: claimantDetails[0].SRNAME,
						bookNo: reqData.bookNo,
						fileLink: `${dataParam}`,
					});
				}
			}
		};
        // console.log("Status Check Results:", statusCheckResult);
		if (statusCheckResult && statusCheckResult.status) {            
            if (statusCheckResult.contactInfo && statusCheckResult.contactInfo.PHONE_NO) {
                const enhancedReqData = {
                    srCode: reqData.srCode,
                    doctNo: reqData.doctNo,
                    bookNo: reqData.bookNo,
                    regYear: reqData.regYear,
                    NAME: statusCheckResult.contactInfo.NAME || "User",
                    PHONE_NO: statusCheckResult.contactInfo.PHONE_NO,
                    APP_ID: statusCheckResult.contactInfo.APP_ID
                };
                                
				const currentStatusColumn = Status[statusKey];		
				previousStatus[currentStatusColumn] === 'Y';
                statusCheckResult.status[currentStatusColumn] === 'Y';
                if (reqData.status.toUpperCase() === 'D' && statusCheckResult.contactInfo.SCANNED !== 'T') {
					const data = {
						srCode: reqData.srCode,
						doctNo: reqData.doctNo,
						bookNo: reqData.bookNo,
						regYear: reqData.regYear,
						NAME: statusCheckResult.contactInfo.NAME || "User",
						PHONE_NO: statusCheckResult.contactInfo.PHONE_NO,
						APP_ID: statusCheckResult.contactInfo.APP_ID
					};
					await smsAfterCompleteDigitalSign(data);          
				} else {
                    await sendSMSNotification(enhancedReqData, statusName);           
				}
				
            } else {
                console.log("Contact data not found");
            }
        } 
		}	
		//end
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - updateApplicationStatus || Error :", ex);
			console.error("CashPayableHandler - updateApplicationStatus || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	updateVerifyBySrvc = async (reqData) => {
		try {
			let query = `UPDATE SROUSER.pde_doc_status_cr SET DOC_VERIFIED_BY = '${reqData.DOC_VERIFIED_BY}', DOC_VERIFY = '${reqData.DOC_VERIFY}' WHERE APP_ID = '${reqData.APP_ID}'`;
			let response = await this.obDao.oDbUpdate(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - updateVerifyBySrvc || Error :", ex);
			console.error("CashPayableHandler - updateVerifyBySrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getCashPaid = async (reqData) => {
		try {
			let query = `SELECT c_receipt_no, receipt_date, SUM (NVL (amount, 0)) + SUM (NVL (amount_by_challan, 0)) + SUM (NVL (amount_by_dd, 0))+ SUM (NVL (amount_by_online, 0))+ SUM (NVL (AMOUNT_BY_SHC, 0)) tot_amou,account_code  FROM cash_paid WHERE (sr_code, book_no, doct_no, reg_year, regn_type, c_receipt_no, TRUNC(receipt_date)) IN (SELECT sr_code, book_no, doct_no, reg_year, regn_type, c_receipt_no, TRUNC(receipt_date) FROM cash_det WHERE sr_code =${reqData.srCode} AND book_no =${reqData.bookNo} AND doct_no = ${reqData.doctNo} AND reg_year = ${reqData.regYear} AND acc_canc = 'A')GROUP BY c_receipt_no, receipt_date,account_code`;
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getCashPaid || Error :", ex);
			console.error("CashPayableHandler - getCashPaid || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getCashReceiptSrvc = async (reqData) => {
		try {
			let query = `SELECT a.*,(select acc_desc from account_cd where acc_code=account_code) accdesc FROM cash_paid a WHERE sr_code=${reqData.srCode} AND c_receipt_no=${reqData.receipt_no} AND receipt_date=TO_DATE('${reqData.receipt_date}', 'DD-MM-YYYY')`;
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getCashReceiptSrvc || Error :", ex);
			console.error("CashPayableHandler - getCashReceiptSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getCashSrvc = async (reqData) => {
		try {
			let query = `SELECT * FROM cash_det WHERE sr_code=${reqData.srCode} AND c_receipt_no=${reqData.receipt_no} AND receipt_date=TO_DATE('${reqData.receipt_date}', 'DD-MM-YYYY')`;
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getCashSrvc || Error :", ex);
			console.error("CashPayableHandler - getCashSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	deleteCashDetLogic = async (query) => {
		try {
			await this.obDao.oDbDelete(query);
		} catch (ex) {
			Logger.error(query + ' ' + ex.message, '');
			console.log(ex.message);
		}
	}

	saveLogic = async (reqData) => {
		let rcnos = [], del_cash_det_query = '';
		try {
			// iterate through each transaction
			for (let el of reqData) {
				let recptQuery = `BEGIN srouser.receiptno_next(:SR_CODE, TO_NUMBER(to_char(sysdate,'yyyy')), :rcptno, :err);END;`
				let obj = {
					SR_CODE: el.SR_CODE,
					rcptno: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
					err: { type: oracleDb.STRING, dir: oracleDb.BIND_OUT },
				}
				let rcptResp = await this.obDao.getSProcedureODB(recptQuery, obj);
				if (!rcptResp) {
					throw new Error("Something went wrong with receiptno_next at getSProcedureODB")
				} else {
					rcnos.push(rcptResp.rcptno);
				}
				let tAmount = 0;
				el.cashPaid?.forEach((dt) => {
					tAmount = tAmount + (el.type === 'Online' ? Number(dt.AMOUNT_BY_ONLINE) : el.type === 'Cash' ? Number(dt.AMOUNT) : el.type === 'Sh' ? Number(dt.AMOUNT_BY_SHC) : 0);
				});
				let party_name = el.PARTY_NAME != null ? `'${el.PARTY_NAME}'`:null;
				let acc_canc = el.ACC_CANC != null ? `'${el.ACC_CANC}'`:null;
				let acc_closed = el.ACC_CLOSED != null ? `'${el.ACC_CLOSED}'`:null;
				let ent_user = el.ENT_USER != null ? `'${el.ENT_USER}'`:null;
				let local_body_name = el.LOCAL_BODY_NAME != null ? `'${el.LOCAL_BODY_NAME}'`:null;
				let status = el.STATUS != null ? `'${el.STATUS}'`:null;
				
				let dt = el.STOCK_HOLDING_DT ? `to_date('${el.STOCK_HOLDING_DT}','DD-MM-YYYY')` : el.STOCK_HOLDING_DT;
				let cashdtQuery =`Insert into cash_det(SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,REGN_TYPE,TRAN_MAJ_CODE,TRAN_MIN_CODE,PARTY_NAME,CHARGEABLE_VALUE,RDOCT_NO,RYEAR,C_RECEIPT_NO,RECEIPT_DATE,M_RECEIPT_NO,ENTRY_DATE,ACC_CANC,FROM_YEAR,TO_YEAR,ACC_CLOSED,ENT_USER,BANK_CHALLAN_NO,BANK_CHALLAN_DT,BANK_DD_NO,BANK_DD_DT,BANK_NAME,BANK_BRANCH,PROPERTY_TYPE,LOCAL_BODY_NAME,TD,DSD,CHK_DT,STATUS,RCPTNO,RCPTYR,ECHALLAN_ID,ECHALLAN_NO,STOCK_HOLDING_ID,STOCK_HOLDING_DT) values 
				(${el.SR_CODE},${el.BOOK_NO},${el.DOCT_NO},${el.REG_YEAR},'${el.REGN_TYPE}','${el.TRAN_MAJ_CODE}','${el.TRAN_MIN_CODE}',${party_name},${tAmount},${el.RDOCT_NO},${el.RYEAR},${rcptResp.rcptno},SYSDATE,${rcptResp.rcptno},SYSDATE,${acc_canc},${el.FROM_YEAR},${el.TO_YEAR},${acc_closed},${ent_user},${el.BANK_CHALLAN_NO},SYSDATE,${el.BANK_DD_NO},null,${el.BANK_NAME},${el.BANK_BRANCH},${el.PROPERTY_TYPE},${local_body_name},${el.TD},${el.DSD},SYSDATE,${status},${rcptResp.rcptno},${el.RCPTYR},${el.ECHALLAN_ID},${el.ECHALLAN_NO},'${el.STOCK_HOLDING_ID}',${dt})`;
				
				// preparing delete query for cash_det
				del_cash_det_query = `Delete from cash_det where sr_code = ${el.SR_CODE} and book_no = ${el.BOOK_NO} and doct_no = ${el.DOCT_NO} and reg_year = ${el.REG_YEAR} and REGN_TYPE = '${el.REGN_TYPE}' and TRAN_MAJ_CODE = '${el.TRAN_MAJ_CODE}' and TRAN_MIN_CODE = '${el.TRAN_MIN_CODE}' and RYEAR = ${el.RYEAR} and C_RECEIPT_NO = ${rcptResp.rcptno}`;

				let updateDt = await this.obDao.oDbInsertDocs(cashdtQuery, "cash_det");
				if (!updateDt) {
					throw new Error("Something went wrong with cash_det")
				}
				let cpQuery = [];
				for (let cp of el.cashPaid) {
					cpQuery.push(`Insert into SROUSER.CASH_PAID(SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,REGN_TYPE,C_RECEIPT_NO,RECEIPT_DATE,
					ACCOUNT_CODE,AMOUNT,AMOUNT_BY_CHALLAN,AMOUNT_BY_DD,AMOUNT_BY_ONLINE,AMOUNT_BY_SHC) values(${el.SR_CODE},${el.BOOK_NO},${el.DOCT_NO},${el.REG_YEAR},'${el.REGN_TYPE}',${rcptResp.rcptno},SYSDATE,${cp.ACCOUNT_CODE},${cp.AMOUNT},${cp.AMOUNT_BY_CHALLAN},${cp.AMOUNT_BY_DD},${cp.AMOUNT_BY_ONLINE},${cp.AMOUNT_BY_SHC})`);
				}
				let cashInsertCounts = await this.obDao.oDbInsertMultipleDocs(cpQuery, 'CASH_PAID');
				if (cashInsertCounts !== el.cashPaid.length) {
					throw new Error("Something went wrong with CASH_PAID")
				}
				try {
					if (el.type === "Online" || el.type === "Sh") {
						console.log("cfmsQuery Start :::")
						let cfmsQuery = `Insert into CFMS_CHALLANS (SR_CODE,BOOK_NO,REG_YEAR,DOCT_NO,RCPTNO,RCPTYR,CFMS_CHALLAN,TIME_STAMP,ENTRY_BY) values (${el.SR_CODE},${el.BOOK_NO},${el.REG_YEAR},${el.DOCT_NO},${rcptResp.rcptno},${el.RCPTYR},'${el.CFMS_CHALLAN}',SYSDATE,'${el.ENTRY_BY}')`;
						console.log("1111111111111111111111111", cfmsQuery);
						let cfms = await this.obDao.oDbInsertDocs(cfmsQuery);
						if (!cfms) {
							Logger.error(`Insert into cfms challans failed, ${el.SR_CODE}-${el.BOOK_NO}-${el.DOCT_NO}-${el.REG_YEAR}-${rcptResp.rcptno}-${el.CFMS_CHALLAN}`, '');
							console.log(`Insert into cfms challans failed, ${el.SR_CODE}-${el.BOOK_NO}-${el.DOCT_NO}-${el.REG_YEAR}-${rcptResp.rcptno}-${el.CFMS_CHALLAN}`);
						}
					}
				} catch (err) {
					Logger.error(`Insert into cfms challans failed, ${el.SR_CODE}-${el.BOOK_NO}-${el.DOCT_NO}-${el.REG_YEAR}-${rcptResp.rcptno}-${el.CFMS_CHALLAN} || ${err.message}`, '');
					console.log(`Insert into cfms challans failed, ${el.SR_CODE}-${el.BOOK_NO}-${el.DOCT_NO}-${el.REG_YEAR}-${rcptResp.rcptno}-${el.CFMS_CHALLAN}`);
				}
				if (el.type === "Online") {
					let ctQuery = `update SCANUSER.ECHALLAN_TRANS set con_status='Y' WHERE DEPTTRANSID='${el.ONLINE_ID}' and sr_code=${el.SR_CODE}`;
					let updateQuery = await this.obDao.oDbUpdate(ctQuery);
					if (!updateQuery) {
						throw new Error("Something went wrong with ECHALLAN_TRANS")
					}
				}
			}
			return {
				"status": 2,
				"rcnos": rcnos
			}
		} catch (ex) {
			// status  0 - complete failure  1 - partial success 2 - success

			if (typeof ex.message === 'string') {
				if (ex.message.includes('getSProcedureODB')) {
					return {
						"status": 1,
						"message": "Store Procedure Failure",
						"rcnos": rcnos
					}
				} else if (ex.message.includes('cash_det')) {
					return {
						'status': 1,
						'message': ex.message,
						'rcnos': rcnos.slice(0, rcnos.length - 1)
					}
				} else if (ex.message.includes('CASH_PAID')) {
					this.deleteCashDetLogic(del_cash_det_query);
					return {
						'status': 1,
						'message': ex.message,
						'rcnos': rcnos.slice(0, rcnos.length - 1)
					}
				} else if (ex.message.includes('ECHALLAN_TRANS')) {
					return {
						"status": 1,
						"message": "update Echallan transaction Failure",
						"rcnos": rcnos
					}
				} else {
					return {
						"status": 0,
						"message": ex.message
					}
				}
			} else {
				throw constructCARDError(ex);
			}
		}
	}

	savingCash = async (reqData) => {
		try {
			let rcnos = [];
			for (let el of reqData) {
				console.log("recptQuery Start :::");
				let recptQuery = `BEGIN srouser.receiptno_next(:SR_CODE, TO_NUMBER(to_char(sysdate,'yyyy')), :rcptno, :err);END;`
				let obj = {
					SR_CODE: el.SR_CODE,
					rcptno: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
					err: { type: oracleDb.STRING, dir: oracleDb.BIND_OUT },
				}
				let rcptResp = await this.obDao.getSProcedureODB(recptQuery, obj);
				if (!rcptResp) {
					throw new Error("Something went wrong with receiptno_next")
				} else {
					rcnos.push(rcptResp.rcptno);
				}
				console.log("recptQuery End :::");
				if (el.type === "Online") {
					console.log("ctQuery Start :::");
					let ctQuery = `update SCANUSER.ECHALLAN_TRANS set con_status='Y' WHERE DEPTTRANSID=${el.ONLINE_ID}`;
					let updateQuery = await this.obDao.oDbUpdate(ctQuery);
					if (!updateQuery) {
						throw new Error("Something went wrong with ECHALLAN_TRANS")
					}
					console.log("ctQuery End :::");
				}
				let tAmount = 0;
				el.cashPaid?.forEach((dt) => {
					tAmount = tAmount + (el.type === 'Online' ? Number(dt.AMOUNT_BY_ONLINE) : el.type === 'Cash' ? Number(dt.AMOUNT) : el.type === 'Sh' ? Number(dt.AMOUNT_BY_SHC) : 0);
				})
				console.log("cashdtQuery Start :::");
				let party_name = el.PARTY_NAME != null ? `'${el.PARTY_NAME}'` : null;
				let acc_canc = el.ACC_CANC != null ? `'${el.ACC_CANC}'` : null;
				let acc_closed = el.ACC_CLOSED != null ? `'${el.ACC_CLOSED}'` : null;
				let ent_user = el.ENT_USER != null ? `'${el.ENT_USER}'` : null;
				let local_body_name = el.LOCAL_BODY_NAME != null ? `'${el.LOCAL_BODY_NAME}'` : null;
				let status = el.STATUS != null ? `'${el.STATUS}'` : null;
				let cashdtQuery = `Insert into cash_det(SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,REGN_TYPE,TRAN_MAJ_CODE,TRAN_MIN_CODE,PARTY_NAME,CHARGEABLE_VALUE,RDOCT_NO,RYEAR,C_RECEIPT_NO,RECEIPT_DATE,M_RECEIPT_NO,ENTRY_DATE,ACC_CANC,FROM_YEAR,TO_YEAR,ACC_CLOSED,ENT_USER,BANK_CHALLAN_NO,BANK_CHALLAN_DT,BANK_DD_NO,BANK_DD_DT,BANK_NAME,BANK_BRANCH,PROPERTY_TYPE,LOCAL_BODY_NAME,TD,DSD,CHK_DT,STATUS,RCPTNO,RCPTYR,ECHALLAN_ID,ECHALLAN_NO,STOCK_HOLDING_ID,STOCK_HOLDING_DT) values (${el.SR_CODE},${el.BOOK_NO},${el.DOCT_NO},${el.REG_YEAR},'${el.REGN_TYPE}','${el.TRAN_MAJ_CODE}','${el.TRAN_MIN_CODE}',${party_name},${tAmount},${el.RDOCT_NO},${el.RYEAR},${rcptResp.rcptno},SYSDATE,${rcptResp.rcptno},SYSDATE,${acc_canc},${el.FROM_YEAR},${el.TO_YEAR},${acc_closed},${ent_user},${el.BANK_CHALLAN_NO},SYSDATE,${el.BANK_DD_NO},null,${el.BANK_NAME},${el.BANK_BRANCH},${el.PROPERTY_TYPE},${local_body_name},${el.TD},${el.DSD},SYSDATE,${status},${rcptResp.rcptno},${el.RCPTYR},${el.ECHALLAN_ID},${el.ECHALLAN_NO},'${el.STOCK_HOLDING_ID}',${el.STOCK_HOLDING_DT})`;
				let updateDt = await this.obDao.oDbInsertDocs(cashdtQuery);
				if (!updateDt) {
					throw new Error("Something went wrong with cash_det")
				}
				console.log("cashdtQuery END :::");
				for (let cp of el.cashPaid) {
					console.log("cpQuery Start :::");
					let cpQuery = `Insert into SROUSER.CASH_PAID(SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,REGN_TYPE,C_RECEIPT_NO,RECEIPT_DATE,
					ACCOUNT_CODE,AMOUNT,AMOUNT_BY_CHALLAN,AMOUNT_BY_DD,AMOUNT_BY_ONLINE,AMOUNT_BY_SHC) values(${el.SR_CODE},${el.BOOK_NO},${el.DOCT_NO},${el.REG_YEAR},'${el.REGN_TYPE}',${rcptResp.rcptno},SYSDATE,${cp.ACCOUNT_CODE},${cp.AMOUNT},${cp.AMOUNT_BY_CHALLAN},${cp.AMOUNT_BY_DD},${cp.AMOUNT_BY_ONLINE},${cp.AMOUNT_BY_SHC})`;
					let updateQuery1 = await this.obDao.oDbInsertDocs(cpQuery);

					if (!updateQuery1) {
						throw new Error("Something went wrong with  CASH_PAID")
					}
					console.log("cpQuery END :::");
				}
				if (el.type === "Online" || el.type === "Sh") {
					console.log("cfmsQuery Start :::")
					let cfmsQuery = `Insert into CFMS_CHALLANS (SR_CODE,BOOK_NO,REG_YEAR,DOCT_NO,RCPTNO,RCPTYR,CFMS_CHALLAN,TIME_STAMP,ENTRY_BY) values (${el.SR_CODE},${el.BOOK_NO},${el.REG_YEAR},${el.DOCT_NO},${rcptResp.rcptno},${el.RCPTYR},'${el.CFMS_CHALLAN}',SYSDATE,'${el.ENTRY_BY}')`;
					console.log("1111111111111111111111111", cfmsQuery);
					let cfms = await this.obDao.oDbInsertDocs(cfmsQuery);
					if (!cfms) {
						throw new Error("Something went wrong with cfms")
					}
					console.log("cfmsQuery END :::")
				}
			}
			return rcnos;
		} catch (ex) {
			Logger.error("CashPayableHandler - savingCash || Error :", ex);
			console.error("CashPayableHandler - savingCash || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getDocStatusSrvc = async (reqData) => {
		try {
			let query = `select * from pde_doc_status_cr where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and doct_no=${reqData.doctNo} and reg_year=${reqData.regYear}`;
			let response = await this.obDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getDocStatusSrvc || Error :", ex);
			console.error("CashPayableHandler - getDocStatusSrvc || Error :", ex);
			throw new CARDError({ err: ex });
		}
	}
	getChallanDetailsSrvc = async (reqData) => {
        try {
            let query = `select * from scanuser.echallan_trans where challanno=${reqData.challanno}`;
            let response = await this.obDao.oDBQueryService(query);
            return response;
        } catch (ex) {
            Logger.error("CashPayableHandler - getChallanDetailsSrvc || Error :", ex);
            console.error("CashPayableHandler - getChallanDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
	getDeficitDetailsSrv = async (reqData) => {
		try{
			let query = `SELECT * from deficit_amount where sr_code= :SR_CODE  and ryear = :REG_YEAR and book_no = 1 order by rdoct_no`;
			const bindParams = {
				SR_CODE : reqData.SR_CODE,
				REG_YEAR : reqData.REG_YEAR
			}
			let response = await this.obDao.oDBQueryServiceWithBindParams(query, bindParams)
			return response;
		}catch(ex){
			Logger.error("CashPayableHandler - getDeficitDetailsSrv || Error :", ex);
			console.error("CashPayableHandler - getDeficitDetailsSrv || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	addDeficitDetailsSrv = async (reqData) => {
		try{
			let query = `insert into deficit_amount (SR_CODE, BOOK_NO, RDOCT_NO, RYEAR, AMOUNT_DUE, SECTION_NO, ENTRY_DATE, ENTERED_BY, DR_PROCEED_NO, PROCEED_DATE, FLAG, JURISDICTION, CSNO, REG_YEAR) VALUES
						(
							:SR_CODE,:BOOK_NO,:RDOCT_NO,:RYEAR,:AMOUNT_DUE,:SECTION_NO,
							trunc(sysdate),:ENTERED_BY,:DR_PROCEED_NO,TO_DATE(:PROCEED_DATE,'dd-mm-yyyy'), :FLAG, :JURISDICTION, :CSNO, :REG_YEAR
						)`;
			const bindParams = {
				SR_CODE : reqData.SR_CODE,
				BOOK_NO : reqData.BOOK_NO,
				RDOCT_NO : reqData.RDOCT_NO,
				RYEAR : reqData.RYEAR,
				AMOUNT_DUE : reqData.AMOUNT_DUE ? reqData.AMOUNT_DUE : null,
				SECTION_NO : reqData.SECTION_NO,
				ENTERED_BY : reqData.ENTERED_BY,
				DR_PROCEED_NO : reqData.DR_PROCEED_NO,
				PROCEED_DATE : reqData.PROCEED_DATE,
				FLAG : reqData.FLAG,
				JURISDICTION : reqData.JURISDICTION,
				CSNO : reqData.CSNO ? reqData.CSNO : null,
				REG_YEAR : reqData.REG_YEAR ? reqData.REG_YEAR : null
			}
			let response = await this.obDao.oDbInsertDocsWithBindParams(query, bindParams)
			return response;
		}catch(ex){
			Logger.error("CashPayableHandler - addDeficitDetailsSrv || Error :", ex);
			console.error("CashPayableHandler - addDeficitDetailsSrv || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteDeficitDetailsSrv = async (reqData) => {
		try{
			let query = `delete from deficit_amount where sr_code= :SR_CODE  and ryear = :RYEAR and rdoct_no = :RDOCT_NO and book_no = 1 and flag = :FLAG`;
			const bindParams = {
				SR_CODE : reqData.SR_CODE,
				RYEAR : reqData.RYEAR,
				RDOCT_NO : reqData.RDOCT_NO,
				FLAG : reqData.FLAG
			}
			let response = await this.obDao.oDbInsertDocsWithBindParams(query,bindParams)
			return response  
		}catch(ex){
			Logger.error("CashPayableHandler - deleteDeficitDetailsSrv || Error :", ex);
			console.error("CashPayableHandler - deleteDeficitDetailsSrv || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getDocsDetailsSrv = async (reqData) => {
		try{
			// let query = `SELECT reg_year, doct_no, jurisdiction from tran_sched where sr_code=${reqData.SR_CODE}  and ryear = ${reqData.RYEAR} and rdoct_no = ${reqData.RDOCT_NO} and book_no = ${reqData.BOOK_NO}`;
			let query = `
				select ind.jurisdiction, tm.doct_no, tm.reg_year from 
				srouser.index2vu ind
				left join tran_major tm on ind.sr_code = tm.sr_code and ind.reg_year = tm.ryear and ind.doct_no = tm.rdoct_no and tm.book_no = 1
				where ind.sr_code = :SR_CODE and ind.doct_no = :RDOCT_NO and ind.reg_year = :RYEAR
			`
			const bindParams = {
				SR_CODE : reqData.SR_CODE,
				RYEAR : reqData.RYEAR,
				RDOCT_NO : reqData.RDOCT_NO,
			}
			let response = await this.obDao.oDBQueryServiceWithBindParams(query, bindParams);
			return response;
		}catch(ex){
			Logger.error("CashPayableHandler - getDocsDetailsSrv || Error :", ex);
			console.error("CashPayableHandler - getDocsDetailsSrv || Error :", ex);
			throw constructCARDError(ex);
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


	getPdfreceiptSrvc = async (reqData) => {
        try {
            let query = `SELECT cash_det.*, sr_master.sr_name, (select acc_desc from card.account_cd where acc_code = SROUSER.CASH_PAID.account_code) as account_name
            FROM cash_det
            JOIN sr_master ON cash_det.sr_code = sr_master.sr_cd
            JOIN SROUSER.CASH_PAID ON cash_det.sr_code = SROUSER.CASH_PAID.sr_code and cash_det.doct_no = SROUSER.CASH_PAID.doct_no and cash_det.book_no = SROUSER.CASH_PAID.book_no and cash_det.reg_year = SROUSER.CASH_PAID.reg_year and cash_det.c_receipt_no = SROUSER.CASH_PAID.c_receipt_no
            WHERE SROUSER.CASH_PAID.sr_code = ${reqData.SR_CODE}
			AND to_number(to_char(SROUSER.CASH_PAID.receipt_date,'yyyy')) = TO_NUMBER(to_char(sysdate,'yyyy'))
            AND SROUSER.CASH_PAID.C_RECEIPT_NO in (${reqData.C_RECEIPT_NO})`;
            let response = await this.obDao.oDBQueryService(query);
            let StampQuery = `select 
								b.sr_code,b.STAMP_CATEGORY,b.STAMP_TYPE,b.DENOMINATION,b.NO_STAMPS,b.AMOUNT,
									CASE 
										WHEN  REGEXP_LIKE(b.purchaser_name,'^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')
										THEN sv.ven_name
										ELSE b.PURCHASER_NAME
									END AS PURCHASER_NAME,
									b.purchaser_name as vender_id,
									b.PUR_RELATION,
									b.PUR_ADDRESS,
									b.RM_NAME,
									b.RM_RELATION,
									b.RM_ADDRESS,
									b.TIME_STAMP,
									b.REQUEST_ID,
									b.PAYMENT_STATUS,
									b.STAMP_CODE
								from 
								srouser.stamp_indent b
								LEFT JOIN 
								card.stamp_venlist sv 
								ON b.purchaser_name = sv.ven_id
								where b.sr_code = ${reqData.SR_CODE} and b.purchase_year = TO_NUMBER(to_char(sysdate,'yyyy')) and b.mis_receipt_no in (${reqData.C_RECEIPT_NO}) and b.payment_status = 'Y'`
            let Stampresponse = await this.obDao.oDBQueryService(StampQuery);
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
            const imagePath = Path.join(__dirname, `../../logos/ap_logo.jpg`);
            const receiptNumbers = response.map(item => item.C_RECEIPT_NO).join(', ');
            const challanNumbers = response.map(item => item.ECHALLAN_NO).filter(challanNo => challanNo !== null).join(', ');
            const data = fsone.readFileSync(imagePath , {encoding : 'base64'});
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
                    Date : ${formattedDate}
                </div>
                <div style = "margin-left : 50px">
                    SRO Name : ${response[0].SR_NAME}
                </div>
                <div></div>
            </div>
            <hr style="margin: 5px 0;">
            <hr style="margin: 5px 0;">
            <table style="width: 100%;">
                <tr>
                    ${response[0].DOCT_NO !== 999999 ? `<td style="width : 20%;padding: 5px">Receipt No: ${receiptNumbers}</td>` : `<td style="width : 50%;padding: 5px">RECEIPT NO: ${receiptNumbers}</td>`}
                    ${response[0].DOCT_NO !== 999999 ? `<td style="width : 20%;padding: 5px">Check Slip No: ${response[0].DOCT_NO}</td>` : `<td style="width : 10%;padding: 5px"></td>`}
                    ${response[0].DOCT_NO !== 999999 ? `<td style="width : 15%;padding: 5px">Book No: ${response[0].BOOK_NO}</td>` : `<td style="width : 10%;padding: 5px"></td>`}
                    ${response[0].DOCT_NO !== 999999 ? `<td style="width : 20%;padding: 5px">Register Year: ${response[0].REG_YEAR}</td>` : `<td style="width : 10%;padding: 5px"></td>`}
                    <td style="width : 15%;padding: 5px">Year: ${response[0].RCPTYR}</td>
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
            <td style="font-weight: bold;border-bottom: 1px solid black;">Account Description</td>
            <td style = "border-bottom: 1px solid black;"></td>
            <td style="font-weight: bold;border-bottom: 1px solid black;">Amount by Cash</td>
            <td style="font-weight: bold;border-bottom: 1px solid black;">Amount by Challan</td>
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
                    <td style="width : 50%;padding: 8px">Prepared by : ${reqData.EMPL_NAME}</td>
                    <td style="width : 10%;padding: 8px">Total</td>
                    <td style="width : 20%;padding: 8px;align-items:center;border-bottom: 1px solid black;border-top: 1px solid black;">${totalChargeableValue}</td>
                    <td style="width : 20%;padding: 8px;align-items:center;border-bottom: 1px solid black;border-top: 1px solid black;">${totalChallans}</td>
                </tr>
            </table>
            ${Stampresponse.length > 0 ?
                `
                  <table style="border: 1px solid black; border-collapse: collapse; width: 100%; margin-top : 20px;">
                    <tr>
                      <th style="border: 1px solid black; padding: 8px;">S. No.</th>    
                      <th style="border: 1px solid black; padding: 8px;">STAMP CATEGORY</th>
                      <th style="border: 1px solid black; padding: 8px;">STAMP TYPE</th>
                      <th style="border: 1px solid black; padding: 8px;">DENOMINATIONS</th>
                      <th style="border: 1px solid black; padding: 8px;">NO. OF STAMPS</th>
                      <th style="border: 1px solid black; padding: 8px;">AMOUNT</th>
                    </tr>
                ` : ``
              }
              ${Stampresponse.length > 0 ?
                Stampresponse.map((item, index) =>
                  `
                    <tr key=${index}>
                      <td style="border: 1px solid black; padding: 8px;">${index + 1}</td>
                      <td style="border: 1px solid black; padding: 8px;">${item.STAMP_CATEGORY}</td>
                      <td style="border: 1px solid black; padding: 8px;">${item.STAMP_TYPE}</td>
                      <td style="border: 1px solid black; padding: 8px;">${item.DENOMINATION}</td>
                      <td style="border: 1px solid black; padding: 8px;">${item.NO_STAMPS}</td>
                      <td style="border: 1px solid black; padding: 8px;">${item.AMOUNT}</td>
                    </tr>
                  `
                ).join('') : ``
              }
              </table>
              ${Stampresponse.length > 0 ?
                `
                  <table style="width: 100%; margin-top : 20px;">
						<tbody>
							<tr>
								<td style="padding: 8px;width: 50%;">Purchaser Name : ${Stampresponse[0].PURCHASER_NAME}</td>    
								<td style="padding: 8px;">Purchase For : ${Stampresponse[0].RM_NAME}</td>
							</tr>
							<tr>
								<td style="padding: 8px;width: 50%;">Relation Name : ${Stampresponse[0].PUR_RELATION}</td>
								<td style="padding: 8px;">Purchase For Relation Name : ${Stampresponse[0].RM_RELATION ?? "-"}</td>
							</tr>
							<tr>
								<td style="padding: 8px;width: 50%;">Purchaser Address : ${Stampresponse[0].PUR_ADDRESS}</td>  
								<td style="padding: 8px;">Purchase For Address: ${Stampresponse[0].RM_ADDRESS ?? "-"}</td>
							</tr>
						</tbody>
					</table>
                ` : ``
              }
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

	postAuditCashDetailsSrvc = async (reqData) => {
		try{
			const receiptnos = reqData.RECEIPT_NO;
			let queryArray = [];
			for(let i= 0; i< receiptnos.length; i++) {
				let query = `insert into srouser.mis_cash_audit (sr_code, book_no, reg_year, doct_no, receipt_no, time_stamp, audit_type, entry_by) values (${reqData.SR_CODE}, ${reqData.BOOK_NO}, ${reqData.REG_YEAR}, ${reqData.DOCT_NO}, ${receiptnos[i]}, SYSDATE, '${reqData.AUDIT_TYPE}', ${reqData.ENTRY_BY})`;
				queryArray.push(query);
			}
			let response = await this.obDao.oDbInsertMultipleDocs(queryArray,'Insert Mis audit receipt Data');
			const Sec47aQuery = `select * from srouser.tran_section_47a where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR`
            const bindParams = {
                SR_CODE : reqData.SR_CODE,
                DOCT_NO : reqData.DOCT_NO,
                REG_YEAR : reqData.REG_YEAR,
                BOOK_NO : reqData.BOOK_NO
            }
            const sec47aResult = await this.obDao.oDBQueryServiceWithBindParams(Sec47aQuery, bindParams);
            if(sec47aResult.length > 0) {
                let receipt_no = receiptnos;
                if(sec47aResult[0].MIS_RECEIPT_NO) {
                    let misReceiptValues = sec47aResult[0].MIS_RECEIPT_NO.split(",");
                    receipt_no.push(...misReceiptValues.map(Number));
                }  
                let receipt_no_join;
                if(receipt_no.length > 1) {
                    receipt_no_join = receipt_no.join(',');
                }
                else {
                    receipt_no_join = receiptnos[0]
                }
                const updateSec47a = `update srouser.tran_section_47a set mis_receipt_no = :RECEIPT_NO, mis_receipt_date = sysdate where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR`
                const updateSec47aResult = await this.obDao.oDbInsertDocsWithBindParams(updateSec47a, {...bindParams, RECEIPT_NO : receipt_no_join});
            }
			return response;
		}catch(ex){
			Logger.error("CashPayableHandler - postAuditCashDetailsSrvc || Error :", ex);
			console.error("CashPayableHandler - postAuditCashDetailsSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getMajorDetailsSrvc = async (reqData) => {
		try{
			let query = `select * from tran_major where sr_code=${reqData.SR_CODE}  and reg_year = ${reqData.REG_YEAR} and doct_no = ${reqData.DOCT_NO} and book_no = ${reqData.BOOK_NO}`;
			let response = await this.obDao.oDBQueryService(query)
			return response;
		}catch(ex){
			Logger.error("CashPayableHandler - getMajorDetailsSrvc || Error :", ex);
			console.error("CashPayableHandler - getMajorDetailsSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	updateDeficitDetailsSrv = async (reqData) => {
		try{
			let query = `
				update deficit_amount set amount_due = :AMOUNT_DUE, section_no = :SECTION_NO, DR_PROCEED_NO = :DR_PROCEED_NO, ENTRY_DATE = SYSDATE, 
				ENTERED_BY = :ENTERED_BY, PROCEED_DATE = TO_DATE(:PROCEED_DATE,'dd-mm-yyyy') where SR_CODE = :SR_CODE AND BOOK_NO = 1 AND RYEAR = :RYEAR
				AND RDOCT_NO = :RDOCT_NO AND FLAG = :FLAG
			`;
			const bindParams = {
				AMOUNT_DUE : reqData.AMOUNT_DUE,
				SECTION_NO : reqData.SECTION_NO,
				DR_PROCEED_NO : reqData.DR_PROCEED_NO,
				ENTERED_BY : reqData.ENTERED_BY,
				PROCEED_DATE : reqData.PROCEED_DATE,
				SR_CODE : reqData.SR_CODE,
				RYEAR : reqData.RYEAR,
				RDOCT_NO : reqData.RDOCT_NO,
				FLAG : reqData.FLAG
			}
			let response = await this.obDao.oDbInsertDocsWithBindParams(query, bindParams)
			return response;
		}catch(ex){
			Logger.error("CashPayableHandler - updateDeficitDetailsSrv || Error :", ex);
			console.error("CashPayableHandler - updateDeficitDetailsSrv || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getStampindentDetailsSrvc = async (reqData) => {
        try{
            let query = `select 
						b.sr_code,b.STAMP_CATEGORY,b.STAMP_TYPE,b.DENOMINATION,b.NO_STAMPS,b.AMOUNT,
						CASE 
							WHEN  REGEXP_LIKE(b.purchaser_name,'^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')
							THEN sv.ven_name
							ELSE b.PURCHASER_NAME
						END AS PURCHASER_NAME,
						b.purchaser_name as vender_id,
						b.PUR_RELATION,
						b.PUR_ADDRESS,
						b.RM_NAME,
						b.RM_RELATION,
						b.RM_ADDRESS,
						b.TIME_STAMP,
						b.REQUEST_ID,
						b.PAYMENT_STATUS,
						b.STAMP_CODE
					from
					scanuser.echallan_trans a
					join srouser.stamp_indent b on a.depttransid = b.request_id
					LEFT JOIN 
					card.stamp_venlist sv 
					ON b.purchaser_name = sv.ven_id
					where a.challanno = :cfmsChallan and a.payment_type = 'stampfee' and a.remarks = 'Stamp Purpose' and b.payment_status = 'Y'`;
            const bindparms = {
                cfmsChallan : reqData.cfmsChallan
            }
            let response = await this.obDao.oDBQueryServiceWithBindParams(query, bindparms)
            return response;
        }catch(ex){
            Logger.error("CashPayableHandler - getStampindentDetailsSrvc || Error :", ex);
            console.error("CashPayableHandler - getStampindentDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
 
    updateStampIndentSrvc = async (reqData) => {
        try{
            let query = `update srouser.stamp_indent set mis_receipt_no = ${reqData.RECEIPT_NO}, purchase_year = ${reqData.PURCHASE_YEAR} where request_id = '${reqData.REQUEST_ID}' and payment_status = 'Y'`;
            let response = await this.obDao.oDbUpdate(query)
            return response;
        }catch(ex){
            Logger.error("CashPayableHandler - updateStampIndentSrvc || Error :", ex);
            console.error("CashPayableHandler - updateStampIndentSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
 
    getStampDetailswithAppSrvc = async (reqData) => {
        try{
            let query = `SELECT 
						si.sr_code,si.STAMP_CATEGORY,si.STAMP_TYPE,si.DENOMINATION,si.NO_STAMPS,si.AMOUNT,
						CASE 
							WHEN  REGEXP_LIKE(si.purchaser_name,'^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$')
							THEN sv.ven_name
							ELSE si.PURCHASER_NAME
						END AS PURCHASER_NAME,
						si.purchaser_name as vender_id,
						si.PUR_RELATION,
						si.PUR_ADDRESS,
						si.RM_NAME,
						si.RM_RELATION,
						si.RM_ADDRESS,
						si.TIME_STAMP,
						si.REQUEST_ID,
						si.PAYMENT_STATUS,
						si.STAMP_CODE,
						si.MAIN_STATUS
					FROM 
						srouser.stamp_indent si
					LEFT JOIN 
						card.stamp_venlist sv 
						ON si.purchaser_name = sv.ven_id
					WHERE 
						si.request_id = :REQUEST_ID 
						AND si.sr_code = :SR_CODE and si.payment_status = 'N'`;
            const bindparms = {
                REQUEST_ID : reqData.REQUEST_ID,
				SR_CODE : reqData.SR_CODE
            }
            let response = await this.obDao.oDBQueryServiceWithBindParams(query, bindparms);
			if(response.length > 0 && /^[0-9]{2}-[0-9]{2}-[0-9]{3}-[0-9]{4}$/.test(response[0].VENDER_ID) && response[0].MAIN_STATUS === 'P') {
				response = 'SRO Verify'
			}
            return response;
        }catch(ex){
            Logger.error("CashPayableHandler - getStampDetailswithAppSrvc || Error :", ex);
            console.error("CashPayableHandler - getStampDetailswithAppSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
 
    insertStampDataSrvc = async (reqData) => {
        try{
            const ArrayData = reqData.data;
            let queryArray = [];
            let response;
            if(!ArrayData[0].REQUEST_ID) {
                for(let i =0; ArrayData.length > i ;i++) {
                    let query = `INSERT INTO srouser.stamp_indent (SR_CODE,STAMP_CATEGORY,STAMP_TYPE,STAMP_CODE,DENOMINATION,NO_STAMPS,AMOUNT,PURCHASER_NAME,PUR_RELATION,PUR_ADDRESS,RM_NAME,RM_RELATION,RM_ADDRESS,REQUEST_ID,PAYMENT_STATUS,TIME_STAMP, MIS_RECEIPT_NO, PURCHASE_YEAR, LOGIN_ID) VALUES (${ArrayData[i].SR_CODE}, '${ArrayData[i].STAMP_CATEGORY}','${ArrayData[i].STAMP_TYPE}',(select distinct code from stamp_name where category='${ArrayData[i].STAMP_CATEGORY}' and name='${ArrayData[i].STAMP_TYPE}'), ${ArrayData[i].DENOMINATION}, ${ArrayData[i].NO_STAMPS},${ArrayData[i].AMOUNT},'${ArrayData[i].PURCHASER_NAME}','${ArrayData[i].PUR_RELATION}','${ArrayData[i].PUR_ADDRESS}','${ArrayData[i].RM_NAME}','${ArrayData[i].RM_RELATION}', '${ArrayData[i].RM_ADDRESS}','','Y',SYSDATE, ${ArrayData[i].RECEIPT_NO},${ArrayData[i].PURCHASE_YEAR},${ArrayData[i].LOGIN_ID})`;
                    queryArray.push(query)
                }
                response = await this.obDao.oDbInsertMultipleDocs(queryArray)
            }
            else {
                const query = `update srouser.stamp_indent set payment_status = 'Y', mis_receipt_no = ${reqData.RECEIPT_NO}, purchase_year = ${reqData.PURCHASE_YEAR} where request_id = '${ArrayData[0].REQUEST_ID}'`
				response = await this.obDao.oDbUpdate(query)
            }
            for(let i=0; ArrayData.length > i; i++){
                let Stampcode;
                const stampCodequery = `select distinct code, type from stamp_name where category='${ArrayData[i].STAMP_CATEGORY}' and name='${ArrayData[i].STAMP_TYPE}'`;
                Stampcode = await this.obDao.oDBQueryService(stampCodequery)
                const paidQuery = `
                MERGE INTO srouser.cca_stock_reg_paid_block target
                USING (SELECT '${ArrayData[i].SR_CODE.toString().length == 3 ? '0' + ArrayData[i].SR_CODE : ArrayData[i].SR_CODE}' AS SR_CODE,
                              ${ArrayData[i].STAMP_CATEGORY === 'JUDICIAL STAMPS' ? 1 : 2} AS CATEGORY,
                              ${Stampcode[0].TYPE === 'ADHESIVE' ? 1 : 2} AS TYPE,
                              ${ArrayData[i].DENOMINATION} AS DENOMINATION,
                              ${ArrayData[i].NO_STAMPS} AS STAMPNO,
                              ${Stampcode[0].CODE} as stampcode
                         FROM dual) reqdata
                ON (target.SR_CODE = reqdata.SR_CODE
                    AND target.CATEGORY = reqdata.CATEGORY
                    AND target.TYPE = reqdata.TYPE
                    AND target.DENOMINATION = reqdata.DENOMINATION)
                WHEN MATCHED THEN
                    UPDATE SET target.BALANCE = target.balance + ${ArrayData[i].NO_STAMPS}
                WHEN NOT MATCHED THEN
                    INSERT (SR_CODE, CATEGORY, TYPE, DENOMINATION, BALANCE, AS_ON, STAMP_CODE)
                    VALUES (reqdata.SR_CODE, reqdata.CATEGORY, reqdata.TYPE, reqdata.DENOMINATION,reqdata.STAMPNO, SYSDATE, reqdata.stampcode)
                `
                const balanceQuery = `
									UPDATE srouser.cca_stock_reg
				SET BALANCE = BALANCE - ${ArrayData[i].NO_STAMPS}
				WHERE SR_CODE = '${ArrayData[i].SR_CODE.toString().length == 3 ? '0' + ArrayData[i].SR_CODE : ArrayData[i].SR_CODE}'
					AND CATEGORY = ${ArrayData[i].STAMP_CATEGORY === 'JUDICIAL STAMPS' ? 1 : 2}
					AND TYPE = (  SELECT DISTINCT 
						CASE 
								WHEN type = 'IMPRESSIVE' THEN '2' 
								ELSE '1' 
							END 
						FROM stamp_name
						WHERE name = '${ArrayData[i].STAMP_TYPE}'
						AND code = '${Stampcode[0].CODE}'
					)
					AND DENOMINATION = ${ArrayData[i].DENOMINATION}
					AND STAMP_CODE = '${Stampcode[0].CODE}'
                `
				// MERGE INTO srouser.cca_stock_reg target
                // USING (SELECT '${ArrayData[i].SR_CODE.toString().length == 3 ? '0' + ArrayData[i].SR_CODE : ArrayData[i].SR_CODE}' AS SR_CODE,
                // ${ArrayData[i].STAMP_CATEGORY === 'JUDICIAL STAMPS' ? 1 : 2} AS CATEGORY,
                // ${Stampcode[0].TYPE === 'ADHESIVE' ? 1 : 2} AS TYPE,
                // ${ArrayData[i].DENOMINATION} AS DENOMINATION,
                // ${ArrayData[i].NO_STAMPS} AS STAMPNO,
                // ${Stampcode[0].CODE} as stampcode
                //          FROM dual) reqdata
                // ON (target.SR_CODE = reqdata.SR_CODE
                //     AND target.CATEGORY = reqdata.CATEGORY
                //     AND target.TYPE = reqdata.TYPE
                //     AND target.DENOMINATION = reqdata.DENOMINATION)
                // WHEN MATCHED THEN
                //     UPDATE SET target.BALANCE = target.BALANCE - ${ArrayData[i].NO_STAMPS}
                // WHEN NOT MATCHED THEN
                //     INSERT (SR_CODE, CATEGORY, TYPE, DENOMINATION, BALANCE, AS_ON, STAMP_CODE)
                //     VALUES (reqdata.SR_CODE, reqdata.CATEGORY, reqdata.TYPE, reqdata.DENOMINATION,reqdata.STAMPNO, SYSDATE, reqdata.stampcode)
                const paidResponse = await this.obDao.oDbInsertDocs(paidQuery);
                const balanceResponse = await this.obDao.oDbInsertDocs(balanceQuery);
            }
            return response;
        }catch(ex){
            Logger.error("CashPayableHandler - insertStampDataSrvc || Error :", ex);
            console.error("CashPayableHandler - insertStampDataSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

	getVendorDetailsSrvc = async (reqData) => {
        try{
            let query = `SELECT count(*) as count FROM CARD.STAMP_VENLIST where ven_id = :VENDOR_ID and (status is null or status='N' ) and sr_cd = :SR_CODE`;
            const bindparms = {
                VENDOR_ID : reqData.VENDOR_ID,
				SR_CODE : reqData.SR_CODE
            }
            let response = await this.obDao.oDBQueryServiceWithBindParams(query, bindparms)
            return response;
        }catch(ex){
            Logger.error("CashPayableHandler - getVendorDetailsSrvc || Error :", ex);
            console.error("CashPayableHandler - getVendorDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

	getCashPaidDetailsSrvc = async (reqData) => {
		try {
			let response = [];
			let verifyLinkQuery = `select count(*) as count from recti where l_srcd = :SR_CODE AND l_bno = :BOOK_NO AND l_doctno = :RDOCT_NO AND l_regyear = :RYEAR and c_srcd = :C_SR_CODE AND c_bno = :C_BOOK_NO AND c_doctno = :C_DOCT_NO AND c_regyear = :C_REG_YEAR`
			let VerifyQuery = `select * from tran_major where sr_code = :SR_CODE AND book_no = :BOOK_NO AND rdoct_no = :RDOCT_NO AND ryear = :RYEAR AND tran_maj_code = '01' and tran_min_code in ('02','11')`;
            const bindparms = {
				SR_CODE : reqData.SR_CODE,
				BOOK_NO : reqData.BOOK_NO,
				RDOCT_NO : reqData.RDOCT_NO,
				RYEAR : reqData.RYEAR
			}
			const LinkbindParms = {
				...bindparms,
				C_SR_CODE : reqData.C_SR_CODE,
				C_BOOK_NO : reqData.C_BOOK_NO,
				C_DOCT_NO : reqData.C_DOCT_NO,
				C_REG_YEAR : reqData.C_REG_YEAR
			}
			let LinkResult = await this.obDao.oDBQueryServiceWithBindParams(verifyLinkQuery, LinkbindParms);
			if(LinkResult && LinkResult[0].COUNT > 0) {
				let tranMajResult = await this.obDao.oDBQueryServiceWithBindParams(VerifyQuery, bindparms);
				if(tranMajResult.length > 0) {
					let checkbalanceQuery = `select using_sr_code as sr_code, using_doct_no as doct_no, using_book_no as book_no, using_reg_year as reg_year, min(balance) as tot_amou from srouser.sec_16_cash where using_sr_code =:SR_CODE AND using_book_no =:BOOK_NO AND using_doct_no = :DOCT_NO AND using_reg_year = :REG_YEAR group by using_sr_code, using_doct_no, using_book_no, using_reg_year`;
					let bindparms1 = {
						SR_CODE : tranMajResult[0].SR_CODE,
						BOOK_NO : tranMajResult[0].BOOK_NO,
						DOCT_NO : tranMajResult[0].DOCT_NO,
						REG_YEAR : tranMajResult[0].REG_YEAR
					}
					let checkbalance = await this.obDao.oDBQueryServiceWithBindParams(checkbalanceQuery,bindparms1);
					if(checkbalance.length === 0) {
						// let cadhPaidQuery = `select sr_code, book_no, doct_no, reg_year, SUM (NVL (amount, 0)) + SUM (NVL (amount_by_challan, 0)) + SUM (NVL (amount_by_dd, 0))+ SUM (NVL (amount_by_online, 0))+ SUM (NVL (AMOUNT_BY_SHC, 0)) tot_amou from cash_paid where sr_code = :SR_CODE AND book_no = :BOOK_NO AND doct_no =  :DOCT_NO AND reg_year =  :REG_YEAR and account_code = 7 GROUP BY sr_code, book_no, doct_no, reg_year`;
						let cashPaidQuery = `
							SELECT sr_code, book_no, doct_no, reg_year, SUM (NVL (amount, 0)) + SUM (NVL (amount_by_challan, 0)) + SUM (NVL (amount_by_dd, 0))+ SUM (NVL (amount_by_online, 0))+ SUM (NVL (AMOUNT_BY_SHC, 0)) tot_amou 
							FROM cash_paid 
							WHERE (sr_code, book_no, doct_no, reg_year, regn_type, c_receipt_no, TRUNC(receipt_date)) IN 
							(SELECT sr_code, book_no, doct_no, reg_year, regn_type, c_receipt_no, TRUNC(receipt_date) 
							FROM cash_det 
							WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND doct_no =  :DOCT_NO AND reg_year =  :REG_YEAR AND acc_canc = 'A') 
							and account_code = 7
							GROUP BY sr_code, book_no, doct_no, reg_year
						`
						let cashPaidResult = await this.obDao.oDBQueryServiceWithBindParams(cashPaidQuery, bindparms1);
						if(cashPaidResult.length > 0) {
							if(tranMajResult[0].TRAN_MAJ_CODE === '01' && tranMajResult[0].TRAN_MIN_CODE === '11') {
								if(((tranMajResult[0].FINAL_TAXABLE_VALUE * 5) / 100) <= (cashPaidResult[0].TOT_AMOU + tranMajResult[0].STAMP_DUTY_PAID)) {
									const dsd_value = (tranMajResult[0].FINAL_TAXABLE_VALUE * 4) / 100;
									response = cashPaidResult;
									response[0].TOT_AMOU = dsd_value
								}
							}
							else if (tranMajResult[0].TRAN_MAJ_CODE === '01' && tranMajResult[0].TRAN_MIN_CODE === '02') {
								if(((tranMajResult[0].FINAL_TAXABLE_VALUE * 4) / 100) <= (cashPaidResult[0].TOT_AMOU + tranMajResult[0].STAMP_DUTY_PAID)) {
									const dsd_value = (tranMajResult[0].FINAL_TAXABLE_VALUE * 4) / 100;
									response = cashPaidResult;
									response[0].TOT_AMOU = dsd_value
								}
							}
						}
					}
					else {
						response = checkbalance;
					}
				}
			}
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getCashPaidDetailsSrvc || Error :", ex);
			console.error("CashPayableHandler - getCashPaidDetailsSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	insertSec16DataSrvc = async (reqData) => {
		try {
			let query = `insert into srouser.sec_16_cash (SR_CODE, BOOK_NO,DOCT_NO,REG_YEAR, using_sr_code, using_book_no, using_doct_no, using_reg_year, time_stamp, total_amount, balance, paid_amount)
					values (${reqData.SR_CODE},${reqData.BOOK_NO}, ${reqData.DOCT_NO}, ${reqData.REG_YEAR}, ${reqData.USING_SR_CODE},${reqData.USING_BOOK_NO}, ${reqData.USING_DOCT_NO}, ${reqData.USING_REG_YEAR}, sysdate, ${reqData.TOTAL_AMOUNT}, ${reqData.BALANCE}, ${reqData.PAID_AMOUNT})`;
			console.log(query);
					let response = await this.obDao.oDbInsertDocs(query);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - insertSec16DataSrvc || Error :", ex);
			console.error("CashPayableHandler - insertSec16DataSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	VerifySec16Srvc = async (reqData) => {
        try{
            let query = `select count(*) as count from srouser.sec_16_cash where sr_code = :SR_CODE AND book_no = :BOOK_NO AND doct_no =  :DOCT_NO AND reg_year =  :REG_YEAR`;
            const bindparms = {
				SR_CODE : reqData.SR_CODE,
				BOOK_NO : reqData.BOOK_NO,
				DOCT_NO : reqData.DOCT_NO,
				REG_YEAR : reqData.REG_YEAR
			}
            let response = await this.obDao.oDBQueryServiceWithBindParams(query, bindparms)
            return response;
        }catch(ex){
            Logger.error("CashPayableHandler - VerifySec16Srvc || Error :", ex);
            console.error("CashPayableHandler - VerifySec16Srvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
	getFrankChallanSvc = async (reqData) => {
		try {
			let query = `select * from (select challanno,bankamount,bankdate,depttransid,sr_code,userid,challan_year,challanno||'-'||userid chuid from scanuser.echallan_trans where upper(bankstatus)='SUCCESS' and Statusdesc='success Desc-CFMS' and con_status='N' and trunc(time_stamp) >= trunc(sysdate)-${reqData.days} order by time_Stamp desc)`;
			let response = await this.obDao.oDBQueryService(query);
			return response
		} catch (ex) {
			Logger.error("CashPayableHandler - getFrankChallanSvc || Error :", ex);
			console.error("CashPayableHandler - getFrankChallanSvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getChallansByDoctSrvc = async (reqData) => {
		try{
		  let query = `select b.challanno, b.depttransid, b.sr_code, b.CHALLAN_YEAR from
	   pde_doc_status_cr a
	   join scanuser.echallan_trans b on b.depttransid = a.app_id
	   where a.sr_code = :SR_CODE AND a.book_no = :BOOK_NO AND a.doct_no = :DOCT_NO AND a.reg_year = :REG_YEAR and b.con_status = 'N'`;
		  const bindparms = {
	  SR_CODE : reqData.SR_CODE,
	  BOOK_NO : reqData.BOOK_NO,
	  DOCT_NO : reqData.DOCT_NO,
	  REG_YEAR : reqData.REG_YEAR
	  }
		  let response = await this.obDao.oDBQueryServiceWithBindParams(query, bindparms)
		  return response;
		}catch(ex){
		  Logger.error("CashPayableHandler - getChallansByDoctSrvc || Error :", ex);
		  console.error("CashPayableHandler - getChallansByDoctSrvc || Error :", ex);
		  throw constructCARDError(ex);
		}
	  }
	
	getCashReceiptNumberWithAppId = async(reqData) =>{
		try {
			let query = `SELECT 
							p.sr_code, p.book_no, p.doct_no, c.c_receipt_no, c.reg_year 
							FROM 
								pde_doc_status_cr p
							JOIN
								cash_paid c
							ON
								p.sr_code = c.sr_code
								AND p.book_no = c.book_no
								AND p.reg_year = c.reg_year
								AND p.doct_no = c.doct_no
							WHERE
								p.app_id = :ID`;
			let values = {
				ID: reqData.id
			}
			let response = await this.obDao.oDBQueryServiceWithBindParams(query, values);
			return response;
		} catch (ex) {
			Logger.error("CashPayableHandler - getCashReceiptNumberWithAppId || Error :", ex);
			console.error("CashPayableHandler - getCashReceiptNumberWithAppId || Error :", ex);
			throw constructCARDError(ex);
		}
	}
}
module.exports = ObService;


