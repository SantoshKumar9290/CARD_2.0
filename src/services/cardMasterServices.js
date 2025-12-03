const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');

class CardMasterServices {
	constructor() {
		this.orDao = new OrDao();
	}

	landingPagesSrvc = async (reqData, reqParams) => {
		try {
			const reqQuery = {
				"landingDR"     : "SELECT * FROM CARD.DR_MASTER ORDER BY 1",
				"localBody"		: "SELECT * FROM CARD.LOCAL_BODY_DIR ORDER BY 1",
				"jobsCR"		: "SELECT * FROM CARD.JOBS_CR ORDER BY 1",
				"prohibition"	: "SELECT * FROM CARD.PROB_CLASS ORDER BY 1",
				"landuse"		: "SELECT * FROM AREA_CLASS ORDER BY 1",
				"srMasters"		: "SELECT * FROM SR_MASTER ORDER BY 1",
				"tranMajor"		: "SELECT * FROM CARD.TRAN_DIR WHERE TRAN_MIN_CODE='00'",
				"tranMinor"		: `SELECT * FROM CARD.TRAN_DIR WHERE TRAN_MAJ_CODE='${reqData.TRAN_MAJ_CODE}'`
			};
			const query = reqQuery[reqData, reqParams.type];
			if (!query) {
				console.log("Invalid reqParams value");
			}
			const response = await this.orDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - landingPagesSrvc || Error :", ex);
			console.error("CardMasterServices - landingPagesSrvc || Error :", ex);
			throw new CARDError(ex);
		}
	}
	selectDigSrvc = async () => {
		try {
			let query = `SELECT DIG_CD,DIG_NAME From card.dig_master where rownum <= 12 ORDER BY 1`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - selectDigSrvc || Error :", ex);
			console.error("CardMasterServices - selectDigSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	selectDRSrvc = async (reqData) => {
		try {
			let query = `SELECT * From dr_master where dig_cd=${reqData.DIG_CD}`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - selectDRSrvc || Error :", ex);
			console.error("CardMasterServices - selectDRSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	saveMasterSrvc = async (reqData, reqParams) => {
		try {
			let Query;
			switch (reqParams.type) {
				case "saveDR":
					Query = `INSERT INTO card.dr_master (DIG_CD, DR_CD, DR_NAME, DR_EMAIL, PHONE_NO) VALUES (CASE WHEN LENGTH('${reqData.DIG_CD}') = 1 THEN CONCAT('0', '${reqData.DIG_CD}')ELSE '${reqData.DIG_CD}'END,'${reqData.DR_CD}','${reqData.DR_NAME}','${reqData.DR_EMAIL}',${reqData.PHONE_NO})`;
					break;
				case "localBodyCreation":
					Query = `INSERT INTO card.local_body_dir (LOCAL_BODY_CODE, LOCAL_BODY_DESC, DISCOUNT) values ('${reqData.LOCAL_BODY_CODE}', '${reqData.LOCAL_BODY_DESC}', ${null})`;
					break;
				case "saveJobs":
					Query = `INSERT INTO CARD.JOBS_CR (JOB_NO, JOB_DESC,JOB_CODE) VALUES ('${reqData.JOB_NO1}','${reqData.JOB_DESC2}',(select max(job_code)+1 from CARD.JOBS_CR))`;
					break;
				case "saveLanduse":
					Query = `INSERT INTO card.area_class (CLASS_CODE, CLASS_DESC, CLASS_TYPE, GO_CODE) VALUES('${reqData.CLASS_CODE}', '${reqData.CLASS_DESC}', '${reqData.CLASS_TYPE}', '${reqData.GO_CODE}')`;
					break;
				case "saveProhibition":
					Query = `Insert into CARD.PROB_CLASS (CLASS_CODE,CLASS_DESC) values ((select max(CLASS_CODE)+1 from CARD.PROB_CLASS),'${reqData.CLASS_DESC}')`;
					break;
				case "saveSRmasters":
					Query = `Insert into SR_MASTER (SR_CD,SR_NAME,SR_EMAIL,DR_CD,DIG_CD,IP_ADDRESS,IP_FROM,IP_TO,SUBINDEX_CREATE,STATE_CD,ADR_CD,STAMP_VERIFY,PHONE_NO) values ('${reqData.SR_CD}','${reqData.SR_NAME}','${reqData.SR_EMAIL}','${reqData.DR_CD}','${reqData.DIG_CD}','${reqData.IP_ADDRESS}','${reqData.IP_FROM}','${reqData.IP_TO}','Y','01','2','Y','${reqData.PHONE_NO}')`;
					break;
				case "saveMajor":
					Query = `INSERT INTO  CARD.TRAN_DIR (TRAN_MAJ_CODE,TRAN_MIN_CODE,TRAN_DESC,PARTY1,PARTY1_CODE,PARTY2,PARTY2_CODE,POST_MANUAL,AB_DESC,DUTY_TYPE,MV_APP,PHOTO_APP,WEBLAND_EXMP,AADHAR_EXMP,AUTO_MUTATE) values ((select max(TRAN_MAJ_CODE)+1 from card.tran_dir),'00','${reqData.TRAN_DESC}',null,null,null,null,null,null,null,null,null,null,null,null)`;
					const checkQuery = `SELECT COUNT(*) AS count FROM CARD.TRAN_DIR WHERE TRAN_MAJ_CODE =${reqData.TRAN_MAJ_CODE} AND TRAN_MIN_CODE IS NULL`;
					break;
				case "saveMinor":
					Query = `INSERT INTO  CARD.TRAN_DIR (TRAN_MAJ_CODE,TRAN_MIN_CODE,TRAN_DESC,PARTY1,PARTY1_CODE,PARTY2,PARTY2_CODE,POST_MANUAL,AB_DESC,DUTY_TYPE,MV_APP,PHOTO_APP,WEBLAND_EXMP,AADHAR_EXMP,AUTO_MUTATE) values ('${reqData.TRAN_MAJ_CODE}',(select case when length(min_plus1)<2 then '0'||to_char(min_plus1)when length(min_plus1)>1 then to_char(min_plus1) end as final_min_plus1 from (select max(TRAN_MIN_CODE)+1 as min_plus1 from card.tran_dir where tran_maj_code='${reqData.TRAN_MAJ_CODE}')),'${reqData.TRAN_DESC}',null,null,null,null,null,null,null,null,null,null,null,null)`;
					break;
			}
			let response = await this.orDao.oDbInsertDocs(Query);
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - saveMasterSrvc || Error :", ex);
			console.error("CardMasterServices - saveMasterSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteDR = async (reqData) => {
		try {
			let query = `DELETE From dr_master where DR_CD='${reqData.DR_CD}'`;
			let response = await this.orDao.oDbDelete(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - deleteDR || Error :", ex);
			console.error("CardMasterServices - deleteDR || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteLocalBodySrvc = async (reqData) => {
		try {
			let query = `DELETE From local_body_dir where LOCAL_BODY_CODE='${reqData.LOCAL_BODY_CODE}'`;
			let response = await this.orDao.oDbDelete(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - deleteLocalBodySrvc || Error :", ex);
			console.error("CardMasterServices - deleteLocalBodySrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteJobsSrvc = async (reqData) => {
		try {
			let query = `DELETE From card.jobs_cr where JOB_CODE='${reqData.JOB_CODE}'`;
			let response = await this.orDao.oDbDelete(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - deleteJobSrvc || Error :", ex);
			console.error("CardMasterServices - deleteJobSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	landuseSrvc = async (reqData) => {
		try {
			let query = `DELETE From card.area_class where CLASS_CODE='${reqData.CLASS_CODE}'`;
			let response = await this.orDao.oDbDelete(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - landuseSrvc || Error :", ex);
			console.error("CardMasterServices - landuseSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteProhibition = async (reqData) => {
		try {
			let query = `DELETE From CARD.PROB_CLASS where CLASS_CODE=${reqData.CLASS_CODE}`;
			let response = await this.orDao.oDbDelete(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - deleteProhibition || Error :", ex);
			console.error("CardMasterServices - deleteProhibition || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	srMSrvc = async (reqData) => {
		try {
			let query = `SELECT * From sr_master where dig_cd='${reqData.DIG_CD}, '`;
			let response = await this.orDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - srMSrvc || Error:", ex);
			console.error("CardMasterServices - srMSrvc || Error:", ex);
			throw constructCARDError(ex);
		}
	}
	deleteSRMSrvc = async (reqData) => {
		try {
			let query = `DELETE FROM sr_master WHERE "SR_CD"=${reqData.SR_CD}`;
			let response = await this.orDao.oDbDelete(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - deleteSRMSrvc || Error :", ex);
			console.error("CardMasterServices - deleteSRMSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteMinorSrvc = async (reqData) => {
		try {
			let query = `DELETE  FROM CARD.TRAN_DIR where tran_maj_code='${reqData.TRAN_MAJ_CODE}' and tran_min_code='${reqData.TRAN_MIN_CODE}'`;
			let response = await this.orDao.oDbDelete(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - deleteMinorSrvc || Error :", ex);
			console.error("CardMasterServices - deleteMinorSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	lenghtSRSrvc = async () => {
		try
		{
			let query = `SELECT max(sr_cd)+1 as sr_cd from sr_master where sr_cd not in (9999,8888) and state_cd = '01'`;
			let response = await this.orDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("CardMasterServices - lenghtSRSrvc || Error :", ex);
			console.error("CardMasterServices - lenghtSRSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
}

module.exports = CardMasterServices;