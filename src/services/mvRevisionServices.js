const { constructCARDError } = require("../handlers/errorHandler");
const odbDao = require('../dao/oracledbDao');
const oracleDb = require('oracledb');
const {Logger} = require('../../services/winston')
const puppeteer = require('puppeteer');
const { response } = require("express");



class MvRevisionServices {
	constructor() {
		this.odbDao = new odbDao();
	   	}
		   testAPI = async (reqData) => {
			try {
				 let query = `select * from sromstr.rur_hab_rate`;
				//let query = `DELETE FROM SROMSTR.MV_ENABLE_REVISION_CR WHERE SR_CODE='1112'`;
				let response = await this.odbDao.oDBQueryService(query)
				return response;
			} catch (ex) {
				Logger.error("MvRevisionHandler - Test Api || Error :", ex);
				console.error("MvRevisionHandler - Test Api || Error :", ex);
				throw constructCARDError(ex);
			}
		}
	getAreaClass = async () => {
		try {
			let query = `select * from Area_class where go_code is not null`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			console.error("MvRevisionHandler - getAreaClass || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getLocalBodyDir = async () => {
		try {
			let query = `select * from Local_body_dir`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - getLocalBodyDir || Error :", ex);
			console.error("MvRevisionHandler - getLocalBodyDir || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getForm4Data = async (reqData) => {
		try {
			let SurveyNodata = `select sno_dno from SROMSTR.MV_ENABLE_REVISION_CR where village_code = ${reqData.rev_vill_code} and status = 'A' and sr_code = ${reqData.sro_code}`
			let response = await this.odbDao.oDBQueryService(SurveyNodata)
			let nonNullFound = response.some(item => item.SNO_DNO !== null);
			if(response.length > 0 && nonNullFound) {
				let query = `    select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rural_basic_reg a 
				where sro_code='${reqData.sro_code}' and rev_vill_code='${reqData.rev_vill_code}' and (SURVEY_NO || '-' || SUB_SURVEY_NO) in  (${SurveyNodata})`
				let response = await this.odbDao.oDBQueryService(query)
				return response;
			}
			else {
		let query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
		(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
		rowid from sromstr.rural_basic_reg a 
		where sro_code='${reqData.sro_code}'
		and rev_vill_code='${reqData.rev_vill_code}' and classification = nvl('${reqData.classification}',classification)`;
		console.log(query)
			let response = await this.odbDao.oDBQueryService(query)
			return response;
			}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm4Data || Error :", ex);
			console.error("MvRevisionHandler - getForm4Data || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	updateForm4 = async (reqData) => {
		try {
			let responseArray = [];
			const form4Data = reqData.form4Data;
			for(let i=0;i< form4Data.length; i++) {
				responseArray.push(`update  sromstr.rural_basic_reg set rev_rate='${form4Data[i].rev_rate}' where rowid='${form4Data[i].rowid}'`);
				
			}
			// for(let i=0;i< form4Data.length; i++) {
			// 	let query = `update  sromstr.rural_basic_reg set rev_rate='${form4Data[i].rev_rate}' where rowid='${form4Data[i].rowid}'`;
			// 	const response = await this.odbDao.oDbUpdate(query)
			// 	if(response.error){
			// 		return;
			// 	}
			// 	responseArray.push(response);
			// }
			// let response = {};
			// this.asyncForEach(reqData.form4Data, async (from4)=>{
			// 	let query = `update sromstr.rural_basic_reg set rev_rate='${from4.rev_rate}' where rowid='${from4.rowid}'`;
			// 	response = await this.odbDao.oDbUpdateWithOutBreak(query);
			// 	if(response.error){
			// 		return;
			// 	}
			// })
			const response = await this.odbDao.oDbInsertMultipleDocs(responseArray, 'Update Form 4')
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - updateForm4Data || Error :", ex);
			console.error("MvRevisionHandler - updateForm4Data || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	// deleteForm4 = async (reqData) => {
	// 	try {
	// 	let query = `delete from   sromstr.rural_basic_reg where rowid='${reqData.rowid}'`;
	// 		let response = await this.odbDao.oDBQueryService(query)
	// 		return response;
	// 	} catch (ex) {
	// 		Logger.error("MvRevisionHandler - deleteForm4Data || Error :", ex);
	// 		console.error("MvRevisionHandler - deleteForm4Data || Error :", ex);
	// 		throw constructCARDError(ex);
	// 	}
	// }

	deleteForm4 = async (reqData) => {
		try {
			// Insert into sromstr.rural_basic_reg_del
			let insertQuery = `INSERT INTO sromstr.rural_basic_reg_del
            SELECT a.*, '${reqData.DELETE_BY}' AS DELETE_BY, SYSDATE AS DELETE_ON,'D' AS STATUS
            FROM sromstr.rural_basic_reg a
            WHERE rowid='${reqData.rowid}'`;
			await this.odbDao.oDbInsertDocs(insertQuery);
	
			// Delete from sromstr.rural_basic_reg
			let deleteQuery = `DELETE FROM sromstr.rural_basic_reg WHERE rowid='${reqData.rowid}'`;

			let response = await this.odbDao.oDBQueryService(deleteQuery);
	
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - deleteForm4Data || Error :", ex);
			console.error("MvRevisionHandler - deleteForm4Data || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	
	// addForm4 = async (reqData) => {
	// 	try {
	// 	let response = {};
	// 	this.asyncForEach(reqData.form4Data, async (form4Data)=>{
	// 	let query = `Insert into sromstr.rural_basic_reg (SRO_CODE,REV_VILL_CODE,SURVEY_NO,SUB_SURVEY_NO,CLASSIFICATION,UNITS,UNIT_RATE,REV_RATE,USERNAME) 
	// 		values (
	// 		'${form4Data.SRO_CODE}',
	// 		'${form4Data.REV_VILL_CODE}',
	// 		'${form4Data.SURVEY_NO}',
	// 		'${form4Data.SUB_SURVEY_NO}',			
	// 		'${form4Data.CLASSIFICATION}',
	// 		'${form4Data.UNITS}',
	// 		'${form4Data.UNIT_RATE}',
	// 		'${form4Data.REV_RATE}',
	// 		'${form4Data.USERNAME}'
	// 		)`;
	// 		response = await this.odbDao.oDbInsertDocsWithOutBreak(query);
	// 		if(response.error){
	// 			return;
	// 		}
	// 	})
	// 		return response;
	// 	} catch (ex) {
	// 		console.error("MvRevisionHandler - addForm4Data || Error :", ex);
	// 		throw constructCARDError(ex);
	// 	}
	// }
	addForm4 = async (reqData) => {
		try {
			let response;
			let responseArray = [];
			let arrayData = reqData.form4Data; // Corrected variable name
		
			for (let i = 0; i < arrayData.length; i++) {
				const subSurveyNo = arrayData[i].SUB_SURVEY_NO && arrayData[i].SUB_SURVEY_NO.trim() !== "" 
				? arrayData[i].SUB_SURVEY_NO 
				: "/";
				let villquery = `select*from hab_code where hab_code=:VILLAGECODE`;
				const bindparam ={
					VILLAGECODE: reqData.form4Data[0].REV_VILL_CODE +'01'
				};
				console.log(bindparam,'bbbbbbbbbbb');
				const modifiedVillageCode = arrayData[i].REV_VILL_CODE.substring(1) + "01";
				
				const villqueryRes = await this.odbDao.oDBQueryServiceWithBindParams(villquery,bindparam);

				let query = `Insert into sromstr.rural_basic_reg (SRO_CODE,REV_VILL_CODE,LOCAL_BODY_NAME,LOCAL_BODY_CODE,SURVEY_NO,SUB_SURVEY_NO,CLASSIFICATION,UNITS,UNIT_RATE,USERNAME) 
				values (
				'${arrayData[i].SRO_CODE}',
				'${arrayData[i].REV_VILL_CODE}',
				'${villqueryRes[0].VILLAGE_NAME}',
				'${modifiedVillageCode}',
				'${arrayData[i].SURVEY_NO}',
                '${subSurveyNo}',
 				'${arrayData[i].CLASSIFICATION}',
				'${arrayData[i].UNITS}',
				'${arrayData[i].UNIT_RATE}',
			
				'${arrayData[i].USERNAME}'
				)`;
				// response = await this.odbDao.oDbInsertDocsWithOutBreak(query);
				responseArray.push(query);
	
			}
			response = await this.odbDao.oDbInsertMultipleDocs(responseArray,'Insert New Form 4 Data');
			return response;
		} catch (ex) {
			console.error("MvRevisionHandler - addForm4Data || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	// enableRequest = async (reqData) => {
	// 	try {
	// 		// To get dr code form sr code
	// 		let getDR_CD =await this.getDR_CD(reqData.SR_CODE);
	// 		let response = {};
	// 		this.asyncForEach(reqData.VILLAGE_CODE, async (vc)=>{
	// 		let query = `Insert into SROMSTR.MV_ENABLE_REVISION_CR (SR_CODE,VILLAGE_CODE,REVISION_TYPE,STATUS,NATURE,REQUEST_DT,REQUEST_BY,REQUEST_REASONS,DR_CD)
	// 		values (
	// 			'${reqData.SR_CODE}',
	// 			'${vc}',
	// 			'${reqData.REVISION_TYPE}',
	// 			'${reqData.STATUS}',
	// 			'${reqData.NATURE}',				
	// 			sysdate,
	// 			'${reqData.REQUEST_BY}',
	// 			'${reqData.REQUEST_REASONS}',
	// 			'${getDR_CD[0].DR_CD}'
	// 			)`;
	// 		response = await this.odbDao.oDbInsertDocsWithOutBreak(query);
	// 		if(response.error){
	// 			return;
	// 		}
	// 		})
	// 		return response;
	// 	} catch (ex) {
	// 		Logger.error("MvRevisionHandler - sendEnableRequest || Error :", ex);
	// 		console.error("MvRevisionHandler - sendEnableRequest || Error :", ex);
	// 		throw constructCARDError(ex);
	// 	}
	// }
	enableRequest = async (reqData) => {
		try {
			// To get dr code form sr code
			let getDR_CD = await this.getDR_CD(reqData.SR_CODE);
			let responseArray = [];
			let response;
			let village_Code = reqData.VILLAGE_CODE;
			for(let i=0;i< village_Code.length;i++) {
				// let query = `select REVISION_TYPE from SROMSTR.MV_ENABLE_REVISION_CR where SR_CODE = '${reqData.SR_CODE}' and VILLAGE_CODE = '${village_Code[i]}' and NATURE = '${reqData.NATURE}' and STATUS = 'R' ${reqData.SNO_DNO ? `AND SNO_DNO = '${reqData.SNO_DNO}'` : 'AND SNO_DNO is null'}`
                let query = `select REVISION_TYPE from SROMSTR.MV_ENABLE_REVISION_CR where SR_CODE = '${reqData.SR_CODE}' and VILLAGE_CODE = '${village_Code[i]}' and NATURE = '${reqData.NATURE}' and STATUS IN ('R', 'A') AND SNO_DNO is null`
                response = await this.odbDao.oDBQueryService(query)
				if(response.length == 0) {
					let query = `select REVISION_TYPE from SROMSTR.MV_ENABLE_REVISION_CR where SR_CODE = '${reqData.SR_CODE}' and VILLAGE_CODE = '${village_Code[i]}' and NATURE = '${reqData.NATURE}' and STATUS IN ('R', 'A') AND SNO_DNO = '${reqData.SNO_DNO}'`
                	response = await this.odbDao.oDBQueryService(query)
				}
                if(response.length == 0) {
				let query = `Insert into SROMSTR.MV_ENABLE_REVISION_CR (SR_CODE,VILLAGE_CODE,REVISION_TYPE,STATUS,NATURE,REQUEST_DT,REQUEST_BY,REQUEST_REASONS,DR_CD, SNO_DNO)
                select '${reqData.SR_CODE}',
                    '${village_Code[i]}',
                    '${reqData.REVISION_TYPE}',
                    '${reqData.STATUS}',
                    '${reqData.NATURE}',                
                    sysdate,
                    '${reqData.REQUEST_BY}',
                    '${reqData.REQUEST_REASONS}',
                    '${getDR_CD[0].DR_CD}',
                    ${reqData.SNO_DNO ? `'${reqData.SNO_DNO}'` : null}
                from dual
                where not exists (
                    select 1
                    from SROMSTR.MV_ENABLE_REVISION_CR
                    where SR_CODE = '${reqData.SR_CODE}'
                    and VILLAGE_CODE = '${village_Code[i]}'
					and NATURE = '${reqData.NATURE}'
                    and STATUS IN ('R', 'A')  ${reqData.SNO_DNO ? `AND SNO_DNO = '${reqData.SNO_DNO}'` : 'AND SNO_DNO is null'}
                )`;
				responseArray.push(query);
			}
		}
				if(responseArray.length > 0){
				response = await this.odbDao.oDbInsertMultipleDocs(responseArray, 'Insert Enable Request')
				// response = await this.odbDao.oDbInsertDocsWithOutBreak(query);
				}
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - sendEnableRequest || Error :", ex);
			console.error("MvRevisionHandler - sendEnableRequest || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	getHabitation = async (reqData) => {
		try {
			let query = ``;
			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - getHabitationList || Error :", ex);
			console.error("MvRevisionHandler - getHabitationList || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	updateMvRevision = async (reqData) => {
		try {
			const sysdate = new Date();
				let query = `update SROMSTR.MV_ENABLE_REVISION_CR set
				STATUS='${reqData.STATUS}',
				RESPONSE_BY ='${reqData.RESPONSE_BY}', 
				RESPONSE_DT=sysdate,
				REJECT_REASONS='${reqData.REJECT_REASONS}',
				PROCEEDING_NO='${reqData.PROCEEDING_NO}', 
				PROCEEDING_DATE=to_date('${reqData.PROCEEDING_DATE}','DD-MM-YYYY')
			where SR_CODE='${reqData.SR_CODE}' and VILLAGE_CODE='${reqData.VILLAGE_CODE}' and NATURE='${reqData.NATURE}' and status = 'R' ${reqData.SNO_DNO ? `AND SNO_DNO = '${reqData.SNO_DNO}'` : 'AND SNO_DNO is null'}`;
			// AND TO_DATE(REQUEST_DT, 'DD-MON-YY') = '${reqData.REQUEST_DATE}'
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - updateMvRevision || Error :", ex);
			console.error("MvRevisionHandler - updateMvRevision || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getMvRequests = async (reqData) => {
		try {
			let query= `select mv.*,emp_m.sr_name,vil.village_name from sromstr.mv_enable_revision_cr mv, card.sr_master emp_m, hab_code vil where mv.sr_code=emp_m.sr_cd and mv.village_code||'01'=vil.hab_code and mv.sr_code = '${reqData.SR_CODE}'`;
			let response = await this.odbDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - getMvRequestList || Error :", ex);
			console.error("MvRevisionHandler - getMvRequestList || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	// Form 3 services
	getForm3 = async (reqData) => {
		try {
			let SurveyNodata = `select sno_dno from SROMSTR.MV_ENABLE_REVISION_CR where village_code = ${reqData.rev_vill_code} and status = 'A' and sr_code = ${reqData.sro_code}`
			let response = await this.odbDao.oDBQueryService(SurveyNodata)
			let nonNullFound = response.some(item => item.SNO_DNO !== null);
			if(response.length > 0 && nonNullFound) {
				return [];
			}
			else {
		let query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
		(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
		rowid from sromstr.rur_hab_rate a 
		where sro_code='${reqData.sro_code}'
		and rev_vill_code='${reqData.rev_vill_code}' and classification = nvl('${reqData.classification}',classification)`;
			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm3 || Error :", ex);
			console.error("MvRevisionHandler - getForm3 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	updateForm3 = async (reqData) => {
		try {
			// let responseArray = [];
			// const form3Data = reqData.form3Data;
			// for(let i=0;i< form3Data.length; i++) {
			// 	let query = `update  sromstr.rur_hab_rate set rev_rate='${form3Data[i].rev_rate}' where rowid='${form3Data[i].rowid}'`;
			// 	const response = await this.odbDao.oDbUpdate(query)
			// 	if(response.error){
			// 		return;
			// 	}
			// 	responseArray.push(response);
			// }
			let responseArray = [];
			const form3Data = reqData.form3Data;
			for(let i=0;i< form3Data.length; i++) {
				responseArray.push(`update  sromstr.rur_hab_rate set rev_rate='${form3Data[i].rev_rate}' where rowid='${form3Data[i].rowid}'`);
				
			}
		// 	this.asyncForEach(reqData.form3Data, async (form3)=>{
		// let query = `update  sromstr.rur_hab_rate set rev_rate='${form3.rev_rate}' where rowid='${form3.rowid}'`;
		// 	response = await this.odbDao.oDbUpdateWithOutBreak(query)
		// 	if(response.error){
		// 		return;
		// 	}
		// 	})
			// return responseArray;
			const response = await this.odbDao.oDbInsertMultipleDocs(responseArray, 'Update Form 3')
			return response;
		} catch (ex) {
			console.error("MvRevisionHandler - updateForm3 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteForm3 = async (reqData) => {
		try {
			let insertQuery = `INSERT INTO sromstr.rur_hab_rate_del
            SELECT a.*, '${reqData.DELETE_BY}' AS DELETE_BY, SYSDATE AS DELETE_ON, 'D' AS STATUS
            FROM sromstr.rur_hab_rate a
            WHERE rowid='${reqData.rowid}'`;
			await this.odbDao.oDbInsertDocs(insertQuery);
		let query = `delete from sromstr.rur_hab_rate where rowid='${reqData.rowid}'`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - deleteForm3 || Error :", ex)
			console.error("MvRevisionHandler - deleteForm3 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	addForm3 = async (reqData) => {
		try {
			let response;
			let responseArray = [];
			let arrayData = reqData.form3Data;
			for (let i = 0; i < arrayData.length; i++) {
				let query = `Insert into sromstr.rur_hab_rate (SRO_CODE,REV_VILL_CODE,HABITATION,LOCAL_BODY_CODE,LOCAL_BODY_NAME,UNIT_RATE,GRADE_OF_LOCAL_BODY,CLASSIFICATION,UNITS,REV_RATE,USERNAME) values ('${arrayData[i].SRO_CODE}','${arrayData[i].REV_VILL_CODE}','${arrayData[i].HABITATION}','${arrayData[i].LOCAL_BODY_CODE}','${arrayData[i].LOCAL_BODY_NAME}','${arrayData[i].UNIT_RATE}','${arrayData[i].GRADE_OF_LOCAL_BODY}','${arrayData[i].CLASSIFICATION}','${arrayData[i].UNITS}',${arrayData[i].REV_RATE ? `'${arrayData[i].REV_RATE}'` : null },'${arrayData[i].USERNAME}')`;
			// response = await this.odbDao.oDbInsertDocsWithOutBreak(query);
				responseArray.push(query);
					
			}
			response = await this.odbDao.oDbInsertMultipleDocs(responseArray,'Insert New Form 3 Data');
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - addForm3 || Error :", ex);
			console.error("MvRevisionHandler - addForm3 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	// Form 1 services
	getHabitations = async (reqData) => {
		try {
			// let query=`SELECT DISTINCT j.habitation, h.hab_name AS habname
			// FROM juri_urban j
			// JOIN hab_code h ON j.habitation = h.hab_code
			// JOIN MV_ENABLE_REVISION_CR m ON j.habitation = CONCAT(m.village_code, '01')
			// WHERE j.sro_code = ${reqData.sro_code}
			// AND m.status = 'A' AND NATURE='U'`;
		// 	let query = `SELECT DISTINCT
		// 	j.habitation,
		// 	h.hab_name AS habname
		// FROM
		// 	juri_urban j
		// 	JOIN hab_code h ON j.habitation = h.hab_code
		// 	JOIN MV_ENABLE_REVISION_CR m ON j.habitation = CONCAT(m.village_code, '01')
		// 	LEFT JOIN SROMSTR.MV_REVISION_STATUS_CR r ON j.habitation = r.vill_code || '01'
		// WHERE
		// 	j.sro_code =  ${reqData.sro_code}
		// 	AND m.status = 'A'
		// 	AND m.NATURE = 'U'
		// 	AND (r.status IS NULL OR r.status != 'R')`;
			let query =` SELECT DISTINCT
				h.village_name as habname,
				j.village_code,
				j.sro_code,
				e.sno_dno,
                h.hab_code as habitation
			FROM
				juri_HU j
				JOIN hab_code h ON h.hab_code = j.village_code || '01'
				LEFT  JOIN (
					SELECT village_code, sno_dno
					FROM (
						SELECT DISTINCT village_code, sno_dno
						FROM mv_enable_revision_cr
						WHERE status = 'A' AND nature = 'U'
					) t
				) e ON j.village_code = e.village_code
				LEFT  JOIN SROMSTR.MV_REVISION_STATUS_CR r ON  r.VILL_CODE=j.village_code AND R.NATURE='U' and R.status<>'R' and r.sr_code= ${reqData.sro_code} 
			WHERE
				j.sro_code =  ${reqData.sro_code}
				AND j.village_code IN (SELECT village_code FROM mv_enable_revision_cr WHERE status = 'A' AND nature = 'U' and sr_code= ${reqData.sro_code} )  AND 
				J.VILLAGE_cODE NOT IN (SELECT VILL_cODE FROM SROMSTR.MV_REVISION_STATUS_CR Z WHERE Z.NATURE='U' and Z.sr_code= ${reqData.sro_code}  and (Z.status='R' or Z.status='A')  )`;

		
			// let query = `select distinct habitation,(select hab_name from hab_code where hab_code=habitation) habname from juri_urban where sro_code=${reqData.sro_code}`;			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - getHabitations || Error :", ex);
			console.error("MvRevisionHandler - getHabitations || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getForm1 = async (reqData) => {
		try {
			let habitation;
			let wardno = reqData.ward_no === 'All' ? '' : reqData.ward_no;
			if (reqData.habitation.length === 9) {
				habitation = reqData.habitation.slice(0, -2); // Remove the last two characters
			}
			else {
				habitation = reqData.habitation
			}
		let SurveyNodata = `select sno_dno from SROMSTR.MV_ENABLE_REVISION_CR where village_code = ${habitation} and status = 'A' and sr_code = ${reqData.sro_code}`
		let response = await this.odbDao.oDBQueryService(SurveyNodata)
		let nonNullFound = response.some(item => item.SNO_DNO !== null);
		if(response.length > 0 && nonNullFound) {
			return [];
		}
		else {
			let query = `select a.*,(select class_desc from area_class where class_code=classification) clas,rowid from sromstr.urb_loc_rate_reg a where sro_code=${reqData.sro_code} and habitation=${reqData.habitation} and ward_no = nvl('${wardno}',ward_no)`;
		
			let response = await this.odbDao.oDBQueryService(query)
			return response;
			}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm1 || Error :", ex);
			console.error("MvRevisionHandler - getForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	getForm1Ward = async (reqData) => {
		try {
			let query = `
			select ward_no from juri_urban 	
			where habitation = :habitation and sro_code = :sr_code
			group by ward_no
			order by ward_no`;
		const bindParms = {
			habitation : reqData.habitation,
			sr_code : reqData.sro_code
		}
		let response = await this.odbDao.oDBQueryServiceWithBindParams(query, bindParms);
		return response
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm1 || Error :", ex);
			console.error("MvRevisionHandler - getForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	updateForm1 = async (reqData) => {
		try {
			// let responseArray = [];
			// const form1Data = reqData.form1Data;
			// for(let i=0;i< form1Data.length; i++) {
			// 	let query = `update  sromstr.urb_loc_rate_reg set rev_unit_rate_res=${form1Data[i].rev_unit_rate_res},rev_unit_rate_com=${form1Data[i].rev_unit_rate_com},rev_comp_floor1=${form1Data[i].rev_comp_floor1},rev_comp_floor_oth=${form1Data[i].rev_comp_floor_oth} where rowid='${form1Data[i].rowid}'`;
			// 	const response = await this.odbDao.oDbUpdate(query)
			// 	if(response.error){
			// 		return;
			// 	}
			// 	responseArray.push(response);
			let responseArray = [];
			const form1Data = reqData.form1Data;
			for(let i=0;i< form1Data.length; i++) {
				responseArray.push(`update  sromstr.urb_loc_rate_reg set rev_unit_rate_res=${form1Data[i].rev_unit_rate_res},rev_unit_rate_com=${form1Data[i].rev_unit_rate_com},rev_comp_floor1=${form1Data[i].rev_comp_floor1},rev_comp_floor_oth=${form1Data[i].rev_comp_floor_oth} where rowid='${form1Data[i].rowid}'`);
			}
		// 	let response={};
		// this.asyncForEach(reqData.form1Data, async (form1)=>{
		// let query = `update  sromstr.urb_loc_rate_reg set rev_unit_rate_res=${form1.rev_unit_rate_res},rev_unit_rate_com=${form1.rev_unit_rate_com},rev_comp_floor1=${form1.rev_comp_floor1},rev_comp_floor_oth=${form1.rev_comp_floor_oth} where rowid='${form1.rowid}'`;
		// 	response = await this.odbDao.oDbUpdateWithOutBreak(query)
		// 	if(response.error){
		// 		return;
		// 	}
		// 	})
			// return responseArray
			const response = await this.odbDao.oDbInsertMultipleDocs(responseArray, 'Update Form 1')
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - updateForm1 || Error :", ex);
			console.error("MvRevisionHandler - updateForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteForm1 = async (reqData) => {
		try {
			let insertQuery = `INSERT INTO sromstr.urb_loc_rate_reg_del
            SELECT a.*, '${reqData.DELETE_BY}' AS DELETE_BY, SYSDATE AS DELETE_ON,'D' AS STATUS
            FROM sromstr.urb_loc_rate_reg a
            WHERE rowid='${reqData.rowid}'`;
			await this.odbDao.oDbInsertDocs(insertQuery);
		let query = `delete from sromstr.urb_loc_rate_reg where rowid='${reqData.rowid}'`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - deleteForm1 || Error :", ex);
			console.error("MvRevisionHandler - deleteForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	addForm1 = async (reqData) => {
		try {
			let response;
			let responseArray = [];
			let arrayData = reqData.form1Data;
			for (let i = 0; i < arrayData.length; i++) {
			let query = `Insert into sromstr.urb_loc_rate_reg (SRO_CODE,HABITATION,WARD_NO,BLOCK_NO,LOCALITY_STREET,UNIT_RATE_RES,UNIT_RATE_COM,REV_UNIT_RATE_RES,REV_UNIT_RATE_COM,PRE_REV_UNIT_RATE_RES,PRE_REV_UNIT_RATE_COM,EFFECTIVE_DATE,EX_EFFECTIVE_DATE,TIME_STAMP,REMARKS,USERNAME,LSR_NO,FR_DOOR_NO,TO_DOOR_NO,SIN_DEL,REV_COMP_FLOOR1,REV_COMP_FLOOR_OTH,COMP_FLOOR1,COMP_FLOOR_OTH,PRE_COMP_FLOOR1,PRE_COMP_FLOOR_OTH,CLASSIFICATION,REV_TIMESTAMP,BI_WARD,BI_BLOCK) values (
			'${arrayData[i].SRO_CODE?arrayData[i].SRO_CODE:''}',
			'${arrayData[i].HABITATION?arrayData[i].HABITATION:''}',
			'${arrayData[i].WARD_NO?arrayData[i].WARD_NO:''}',
			'${arrayData[i].BLOCK_NO?arrayData[i].BLOCK_NO:''}',
			'${arrayData[i].LOCALITY_STREET?arrayData[i].LOCALITY_STREET:null}',
			'${arrayData[i].UNIT_RATE_RES?arrayData[i].UNIT_RATE_RES:''}',
			'${arrayData[i].UNIT_RATE_COM?arrayData[i].UNIT_RATE_COM:''}',
			'${arrayData[i].REV_UNIT_RATE_RES?arrayData[i].REV_UNIT_RATE_RES:''}',
			'${arrayData[i].REV_UNIT_RATE_COM?arrayData[i].REV_UNIT_RATE_COM:''}',
			'${arrayData[i].PRE_REV_UNIT_RATE_RES?arrayData[i].PRE_REV_UNIT_RATE_RES:''}',
			'${arrayData[i].PRE_REV_UNIT_RATE_COM?arrayData[i].PRE_REV_UNIT_RATE_COM:''}',
			to_date('${arrayData[i].EFFECTIVE_DATE?arrayData[i].EFFECTIVE_DATE:''}','DD-MM-YYYY'),
			to_date('${arrayData[i].EX_EFFECTIVE_DATE?arrayData[i].EX_EFFECTIVE_DATE:''}','DD-MM-YYYY'),
			to_date('${arrayData[i].TIME_STAMP?arrayData[i].TIME_STAMP:''}','DD-MM-YYYY'),
			'${arrayData[i].REMARKS?arrayData[i].REMARKS:''}',
			'${arrayData[i].USERNAME?arrayData[i].USERNAME:''}',
			'${arrayData[i].LSR_NO?arrayData[i].LSR_NO:null}',
			'${arrayData[i].FR_DOOR_NO?arrayData[i].FR_DOOR_NO:''}',
			'${arrayData[i].TO_DOOR_NO?arrayData[i].TO_DOOR_NO:''}',
			'${arrayData[i].SIN_DEL?arrayData[i].SIN_DEL:''}',
			'${arrayData[i].REV_COMP_FLOOR1?arrayData[i].REV_COMP_FLOOR1:''}',
			'${arrayData[i].REV_COMP_FLOOR_OTH?arrayData[i].REV_COMP_FLOOR_OTH:''}',
			'${arrayData[i].COMP_FLOOR1?arrayData[i].COMP_FLOOR1:''}',
			'${arrayData[i].COMP_FLOOR_OTH?arrayData[i].COMP_FLOOR_OTH:''}',
			'${arrayData[i].PRE_COMP_FLOOR1?arrayData[i].PRE_COMP_FLOOR1:''}',
			'${arrayData[i].PRE_COMP_FLOOR_OTH?arrayData[i].PRE_COMP_FLOOR_OTH:''}',
			'${arrayData[i].CLASSIFICATION?arrayData[i].CLASSIFICATION:''}',
			to_date('${arrayData[i].REV_TIMESTAMP?arrayData[i].REV_TIMESTAMP:''}','DD-MM-YYYY'),
			'${arrayData[i].BI_WARD?arrayData[i].BI_WARD:''}',
			'${arrayData[i].BI_BLOCK?arrayData[i].BI_BLOCK:''}')`;
			// response = await this.odbDao.oDbInsertDocsWithOutBreak(query);
				responseArray.push(query);
				
			}
			response = await this.odbDao.oDbInsertMultipleDocs(responseArray,'Insert New Form 1 Data');
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - addForm1 || Error :", ex);
			console.error("MvRevisionHandler - addForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	// Form 2 Services

	getForm2 = async (reqData) => {
		try {
			let habitation;
			let wardno = reqData.ward_no === 'All' ? '' : reqData.ward_no;
			if (reqData.habitation.length === 9) {
				habitation = reqData.habitation.slice(0, -2); // Remove the last two characters
			}
			else {
				habitation = reqData.habitation
			}
		let SurveyNodata = `select sno_dno from SROMSTR.MV_ENABLE_REVISION_CR where village_code = ${habitation} and status = 'A' and sr_code = ${reqData.sro_code}`
		let response = await this.odbDao.oDBQueryService(SurveyNodata)
		let nonNullFound = response.some(item => item.SNO_DNO !== null);
		if(response.length > 0 && nonNullFound) {
			let query = `select a.*,rowid from sromstr.urb_basic_reg a where sro_code='${reqData.sro_code}' and habitation='${reqData.habitation}' and door_no in (${SurveyNodata})`;			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}
		else {
		let query = `select a.*,rowid from sromstr.urb_basic_reg a where sro_code='${reqData.sro_code}' and habitation='${reqData.habitation}' and ward_no = nvl('${wardno}',ward_no)`;			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm2 || Error :", ex);
			console.error("MvRevisionHandler - getForm2 || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getForm2WardList = async (reqData) => {
		try {
			let habitation;
			if (reqData.habitation.length === 9) {
				habitation = reqData.habitation.slice(0, -2); // Remove the last two characters
			}
			else {
				habitation = reqData.habitation
			}
		let SurveyNodata = `select sno_dno from SROMSTR.MV_ENABLE_REVISION_CR where village_code = ${habitation} and status = 'A' and sr_code = ${reqData.sro_code}`
		let response = await this.odbDao.oDBQueryService(SurveyNodata)
		let nonNullFound = response.some(item => item.SNO_DNO !== null);
		if(response.length > 0 && nonNullFound) {
			let query = `select a.*,rowid from sromstr.urb_basic_reg a where sro_code='${reqData.sro_code}' and habitation='${reqData.habitation}' and door_no in (${SurveyNodata})`;			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}
		else {
		let query = `select distinct ward_no from sromstr.urb_basic_reg where sro_code='${reqData.sro_code}' and habitation='${reqData.habitation}' order by ward_no`;			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm2 || Error :", ex);
			console.error("MvRevisionHandler - getForm2 || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	updateForm2 = async (reqData) => {
		try {
			let responseArray = [];
			const form2Data = reqData.form2Data;
			for(let i=0;i< form2Data.length; i++) {
				let query = `update  sromstr.urb_basic_reg set rev_unit_rate='${form2Data[i].rev_unit_rate}',
				rev_comm_rate='${form2Data[i].rev_comm_rate}',rev_comp_floor1='${form2Data[i].rev_comp_floor1}',rev_comp_floor_oth='${form2Data[i].rev_comp_floor_oth}' where rowid='${form2Data[i].rowid}'`;
								const response = await this.odbDao.oDbUpdate(query)
				if(response.error){
					return;
				}
				responseArray.push(response);
			}
			return responseArray;
		} catch (ex) {
			Logger.error("MvRevisionHandler - updateForm2 || Error :", ex);
			console.error("MvRevisionHandler - updateForm2 || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	deleteForm2 = async (reqData) => {
		try {
			let insertQuery = `INSERT INTO sromstr.urb_basic_reg_del
            SELECT a.*, '${reqData.DELETE_BY}' AS DELETE_BY, SYSDATE AS DELETE_ON, 'D' AS STATUS
            FROM sromstr.urb_basic_reg a
            WHERE rowid='${reqData.rowid}'`;
			await this.odbDao.oDbInsertDocs(insertQuery);
		let query = `delete from sromstr.urb_basic_reg a where rowid='${reqData.rowid}'`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - deleteForm2 || Error :", ex);
			console.error("MvRevisionHandler - deleteForm2 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	addForm2 = async (reqData) => {
		try {
			let response;
			let responseArray = [];
			let arrayData = reqData.form2Data;
			for (let i = 0; i < arrayData.length; i++) {
				// const ward = arrayData[i].WARD_NO && arrayData[i].WARD_NO !== "0" ? arrayData[i].WARD_NO : null;
                // const block = arrayData[i].BLOCK_NO && arrayData[i].BLOCK_NO !== "0" ? arrayData[i].BLOCK_NO : null;
                // const door = arrayData[i].DOOR_NO && arrayData[i].DOOR_NO !== "0" ? arrayData[i].DOOR_NO : null;
                // const addressParts = [ward, block, door].filter(Boolean).join("-");
                // const biNumber = arrayData[i].BI_NUMBER && arrayData[i].BI_NUMBER !== "0" ? `/${arrayData[i].BI_NUMBER}` : "";
                // const finalTRDoorNo = addressParts.length ? addressParts + biNumber : biNumber.replace("/", "");
				const ward = arrayData[i].WARD_NO && arrayData[i].WARD_NO !== "0" 
				? arrayData[i].WARD_NO + (arrayData[i].BI_WARD && arrayData[i].BI_WARD !== "0" ? `/${arrayData[i].BI_WARD}` : "") 
				: null;
			    const block = arrayData[i].BLOCK_NO && arrayData[i].BLOCK_NO !== "0" 
				? arrayData[i].BLOCK_NO + (arrayData[i].BI_BLOCK && arrayData[i].BI_BLOCK !== "0" ? `/${arrayData[i].BI_BLOCK}` : "") 
				: null;
			    const door = arrayData[i].DOOR_NO && arrayData[i].DOOR_NO !== "0" ? arrayData[i].DOOR_NO : null;
			    const addressParts = [ward, block, door].filter(Boolean).join("-");
			    const biNumber = arrayData[i].BI_NUMBER && arrayData[i].BI_NUMBER !== "0" ? `/${arrayData[i].BI_NUMBER}` : "";
			    const finalTRDoorNo = addressParts.length ? addressParts + biNumber : biNumber.replace("/", "");

		let query = `Insert into sromstr.urb_basic_reg (SRO_CODE,HABITATION,WARD_NO,BLOCK_NO,DOOR_NO,BI_NUMBER,TR_DOOR_NO,UNIT_RATE,REV_UNIT_RATE,PRE_REV_UNIT_RATE,EFFECTIVE_DATE,EX_EFFECTIVE_DATE,TIME_STAMP,REMARKS,USERNAME,COMM_RATE,REV_COMM_RATE,PRE_REV_COMM_RATE,SIN_DEL,REV_COMP_FLOOR1,REV_COMP_FLOOR_OTH,COMP_FLOOR1,COMP_FLOOR_OTH,PRE_COMP_FLOOR1,PRE_COMP_FLOOR_OTH,REV_TIMESTAMP,BI_WARD,BI_BLOCK) values (
			'${arrayData[i].SRO_CODE?arrayData[i].SRO_CODE:''}',
			'${arrayData[i].HABITATION?arrayData[i].HABITATION:''}',
			'${arrayData[i].WARD_NO?arrayData[i].WARD_NO:''}',
			'${arrayData[i].BLOCK_NO?arrayData[i].BLOCK_NO:''}',
			'${arrayData[i].DOOR_NO?arrayData[i].DOOR_NO:''}',
			'${arrayData[i].BI_NUMBER?arrayData[i].BI_NUMBER:''}',
			'${finalTRDoorNo}',
			'${arrayData[i].UNIT_RATE?arrayData[i].UNIT_RATE:''}',
			'${arrayData[i].REV_UNIT_RATE?arrayData[i].REV_UNIT_RATE:''}',
			'${arrayData[i].PRE_REV_UNIT_RATE?arrayData[i].PRE_REV_UNIT_RATE:''}',
			to_date('${arrayData[i].EFFECTIVE_DATE?arrayData[i].EFFECTIVE_DATE:''}','DD-MM-YYYY'),
			to_date('${arrayData[i].EX_EFFECTIVE_DATE?arrayData[i].EX_EFFECTIVE_DATE:''}','DD-MM-YYYY'),
			to_date('${arrayData[i].TIME_STAMP?arrayData[i].TIME_STAMP:''}','DD-MM-YYYY'),
			'${arrayData[i].REMARKS?arrayData[i].REMARKS:''}',
			'${arrayData[i].USERNAME?arrayData[i].USERNAME:''}',
			'${arrayData[i].COMM_RATE?arrayData[i].COMM_RATE:''}',
			'${arrayData[i].REV_COMM_RATE?arrayData[i].REV_COMM_RATE:''}',
			'${arrayData[i].PRE_REV_COMM_RATE?arrayData[i].PRE_REV_COMM_RATE:''}',
			'${arrayData[i].SIN_DEL?arrayData[i].SIN_DEL:''}',
			'${arrayData[i].REV_COMP_FLOOR1?arrayData[i].REV_COMP_FLOOR1:''}',
			'${arrayData[i].REV_COMP_FLOOR_OTH?arrayData[i].REV_COMP_FLOOR_OTH:''}',
			'${arrayData[i].COMP_FLOOR1?arrayData[i].COMP_FLOOR1:''}',
			'${arrayData[i].COMP_FLOOR_OTH?arrayData[i].COMP_FLOOR_OTH:''}',
			'${arrayData[i].PRE_COMP_FLOOR1?arrayData[i].PRE_COMP_FLOOR1:''}',
			'${arrayData[i].PRE_COMP_FLOOR_OTH?arrayData[i].PRE_COMP_FLOOR_OTH:''}',
			to_date('${arrayData[i].REV_TIMESTAMP?arrayData[i].REV_TIMESTAMP:''}','DD-MM-YYYY'),
			'${arrayData[i].BI_WARD?arrayData[i].BI_WARD:''}',
			'${arrayData[i].BI_BLOCK?arrayData[i].BI_BLOCK:''}'
			)`;
			// response = await this.odbDao.oDbInsertDocsWithOutBreak(query);
				responseArray.push(query);
	
			}
			response = await this.odbDao.oDbInsertMultipleDocs(responseArray,'Insert New Form 2 Data');
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - addForm2 || Error :", ex);
			console.error("MvRevisionHandler - addForm2 || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	getServeyNo = async (reqData)=>{
		try{
            let query = `begin sromstr.SP_GET_MV_SURVNO(:sr_code,:vill_code,:v_surv_list); end;`
			let obj ={
				sr_code: {val:parseInt(reqData.sro_code), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				vill_code: {val:parseInt(reqData.vill_code), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				v_surv_list: { type: oracleDb.STRING, dir: oracleDb.BIND_OUT,maxSize : 4000}
			}
			let details = await this.odbDao.getSProcedureODB(query,obj);
			return details;
		}catch(ex){
			Logger.error("AssignServices - getServeyNo || Error :", ex);
			console.error("AssignServices - getServeyNo || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	insertServeyNo = async (reqData)=>{
		try{
            let query = `begin sromstr.sp_ins_mv_survno(:sr_code,:vill_code,:survey_no_from_to,:ret_count); end;`
			let obj ={
				sr_code: {val:parseInt(reqData.sro_code), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				vill_code: {val:parseInt(reqData.vill_code), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				survey_no_from_to: {val: reqData.survey_no_from_to, type: oracleDb.STRING, dir: oracleDb.BIND_IN},
				ret_count: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT}
			}
			let details = await this.odbDao.getSProcedureODB(query,obj);
			return details;
		}catch(ex){
			Logger.error("AssignServices - insertServeyNo || Error :", ex);
			console.error("AssignServices - insertServeyNo || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	deleteServeyNo = async (reqData)=>{
		try{
            let query = `begin sromstr.sp_del_mv_survno(:sr_code,:vill_code,:survey_no_from_to,:ret_count); end;`
			let obj ={
				sr_code: {val:parseInt(reqData.sro_code), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				vill_code: {val:parseInt(reqData.vill_code), type: oracleDb.NUMBER, dir: oracleDb.BIND_IN},
				survey_no_from_to: {val: reqData.survey_no_from_to, type: oracleDb.STRING, dir: oracleDb.BIND_IN},
				ret_count: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT}
			}
			let details = await this.odbDao.getSProcedureODB(query,obj);
			return details;
		}catch(ex){
			Logger.error("AssignServices - deleteServeyNo || Error :", ex);
			console.error("AssignServices - deleteServeyNo || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	// Internal Async loop function
	async asyncForEach(array, callback) {
		for (let index = 0; index < array.length; index++) {
		  await callback(array[index], index, array);
		}
	  }
	async getDR_CD(sr_cd){
		try {
			let query = `select dr_cd from sr_master where sr_cd='${sr_cd}'`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - getDR_CD || Error :", ex);
			console.error("MvRevisionHandler - getDR_CD || Error :", ex);
			throw constructCARDError(ex);
		}
	  }




	  getMakeEffectiveRequestBy = async (reqData) => {
		try {
			let query= ` SELECT 
			mv.*, 
			emp_m.sr_name, 
			vil.village_name,
			temp.STATUS
		FROM 
			sromstr.mv_enable_revision_cr mv
			INNER JOIN card.sr_master emp_m ON mv.sr_code = emp_m.sr_cd
			INNER JOIN hab_code vil ON mv.village_code || '01' = vil.hab_code
			INNER JOIN (
				SELECT STATUS, HABITATION, SRO_CODE
				FROM sromstr.urb_loc_rate_reg_temp
				WHERE STATUS = 'R'
			) temp ON mv.village_code || '01' = temp.HABITATION AND mv.sr_code = temp.SRO_CODE
		WHERE 
			mv.STATUS = 'R' 
			AND mv.sr_code IN (SELECT sr_cd FROM sr_master WHERE dr_cd = '${reqData.DR_CD}')
		`;
			let response = await this.odbDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - getMakeEffectiveRequestListBySro || Error :", ex);
			console.error("MvRevisionHandler - getMakeEffectiveRequestListBySro || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	makeEffectiveFinalDRApprove = async (reqData) => {
		try {
			let response={};
		// this.asyncForEach(reqData.form1Data, async (form1)=>{
		let query = `
		UPDATE sromstr.mv_revision_status_cr SET STATUS='${reqData.STATUS}', APPROVE_DT = SYSDATE, REJECT_REASON = ${reqData.REJECT_REASON ? `'${reqData.REJECT_REASON}'` : null} where dr_cd='${reqData.DR_CD}' and NATURE='${reqData.NATURE}' and sr_code='${reqData.SR_CODE}' and status='R' and vill_code='${reqData.VILLAGE_CODE}' ${reqData.SNO_DNO ? `AND SNO_DNO = '${reqData.SNO_DNO}'` : 'AND SNO_DNO is null'}
		`;
			response = await this.odbDao.oDbUpdate(query)
			if(response.error){
				return;
			}
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - makeEffectiveFinalDRApprove || Error :", ex);
			console.error("MvRevisionHandler - makeEffectiveFinalDRApprove || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getMakeEffectiveRequestBySro = async (reqData) => {
        try {
        let query = `SELECT mv.vill_code,
        hab.village_name,
        mv.sr_code,
        mv.status,
        mv.REJECT_REASON,
        TO_CHAR(mv.EFFECTIVE_DT,'DD-MM-YYYY') AS EFFECTIVE_DT,
        TO_CHAR(mv.approve_dt, 'dd/mm/yyyy hh:mi AM') AS approve_date,
        TO_CHAR(mv.request_dt,'dd/mm/yyyy hh:mi AM')AS request_date,
        mv.nature,
        mv.sno_dno,
        (SELECT sr_name FROM sr_master WHERE sr_cd = mv.sr_code) AS sr_name
        FROM sromstr.mv_revision_status_cr mv
        JOIN hab_code hab ON mv.vill_code || '01' = hab.hab_code
        WHERE mv.dr_cd = '${reqData.DR_CD}'`;
 
            let response = await this.odbDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("MvRevisionHandler - getMakeEffectRequestList || Error :", ex);
            console.error("MvRevisionHandler - getMakeEffectRequestList || Error :", ex);
            throw constructCARDError(ex);
        }
    }


	makeEffectiveRequest = async (reqData) => {
		try {
				const drquery = `select dr_cd from sr_master where sr_cd = '${reqData.SR_CODE}'`;
				const countfb =`WITH data AS (
					SELECT
						   '${reqData.VILL_CODE}'|| '01' AS HABITATION,
						   '${reqData.SR_CODE}' AS sro_code
					FROM DUAL
				),
				formatted_data AS (
					SELECT
						HABITATION,
						SUBSTR(HABITATION, 1,7) AS REV_VILL_CODE  
					FROM data
				)
				SELECT
					(SELECT COUNT(*) FROM sromstr.urb_loc_rate_reg WHERE sro_code = (SELECT sro_code FROM data) AND HABITATION = (SELECT HABITATION FROM data)) AS AFT_F1_CNT,
					(SELECT COUNT(*) FROM sromstr.urb_basic_reg WHERE sro_code = (SELECT sro_code FROM data) AND HABITATION = (SELECT HABITATION FROM data)) AS AFT_F2_CNT,
					(SELECT COUNT(*) FROM sromstr.rur_hab_rate WHERE sro_code = (SELECT sro_code FROM data) AND HABITATION = (SELECT HABITATION FROM data)) AS AFT_F3_CNT,
					(SELECT COUNT(*) FROM sromstr.rural_basic_reg WHERE sro_code = (SELECT sro_code FROM data) AND REV_VILL_CODE = (SELECT REV_VILL_CODE FROM formatted_data)) AS AFT_F4_CNT,
					(SELECT COUNT(*) FROM sromstr.mv_urb_loc_reg WHERE sro_code = (SELECT sro_code FROM data) AND HABITATION = (SELECT HABITATION FROM data)) AS BEF_F1_CNT,
					(SELECT COUNT(*) FROM sromstr.mv_basic_urb_reg WHERE sro_code = (SELECT sro_code FROM data) AND HABITATION = (SELECT HABITATION FROM data)) AS BEF_F2_CNT,
					(SELECT COUNT(*) FROM sromstr.mv_rur_hab_rate WHERE sro_code = (SELECT sro_code FROM data) AND HABITATION = (SELECT HABITATION FROM data)) AS BEF_F3_CNT,
					(SELECT COUNT(*) FROM sromstr.mv_basic_rur_reg WHERE sro_code = (SELECT sro_code FROM data) AND REV_VILL_CODE = (SELECT REV_VILL_CODE FROM formatted_data)) AS BEF_F4_CNT
				FROM data`;
				let response = await this.odbDao.oDBQueryService(drquery);
				let response1 = await this.odbDao.oDBQueryService(countfb);
				const query =`INSERT INTO SROMSTR.MV_REVISION_STATUS_CR (
					SR_CODE,
					DR_CD,
					REQUEST_DT,
					STATUS,
					BEF_F1_CNT,
					BEF_F2_CNT,
					BEF_F3_CNT,
					BEF_F4_CNT,
					AFT_F1_CNT,
					AFT_F2_CNT,
					AFT_F3_CNT,
					AFT_F4_CNT,
					NATURE,
					VILL_CODE,
					EFFECTIVE_DT,
					SNO_DNO
				)
				SELECT
					'${reqData.SR_CODE}',
					'${response[0].DR_CD}',
					 SYSDATE,
					'${reqData.STATUS}',
					CASE
						WHEN '${reqData.NATURE}' = 'R' THEN NULL
						ELSE '${response1[0].BEF_F3_CNT}'
					END,
					CASE
						WHEN '${reqData.NATURE}' = 'R' THEN NULL
						ELSE '${response1[0].BEF_F4_CNT}'
					END,
					CASE
						WHEN '${reqData.NATURE}' = 'U' THEN NULL
						ELSE '${response1[0].BEF_F1_CNT}'
					END,
					CASE
						WHEN '${reqData.NATURE}' = 'U' THEN NULL
						ELSE '${response1[0].BEF_F2_CNT}'
					END,
					CASE
						WHEN '${reqData.NATURE}' = 'R' THEN NULL
						ELSE '${response1[0].AFT_F1_CNT}'
					END,
					CASE
						WHEN '${reqData.NATURE}' = 'R' THEN NULL
						ELSE '${response1[0].AFT_F2_CNT}'
					END,
					CASE
						WHEN '${reqData.NATURE}' = 'U' THEN NULL
						ELSE '${response1[0].AFT_F3_CNT}'
					END,
					CASE
						WHEN '${reqData.NATURE}' = 'U' THEN NULL
						ELSE '${response1[0].AFT_F4_CNT}'
					END,
					'${reqData.NATURE}',
					'${reqData.VILL_CODE}',
					TO_DATE('${reqData.EFFECTIVE_DATE}', 'DD-MM-YYYY'),
					${reqData.SNO_DNO ? `'${reqData.SNO_DNO}'` : null}
				FROM
					DUAL
				WHERE
					NOT EXISTS (
						SELECT
							1
						FROM
							SROMSTR.MV_REVISION_STATUS_CR
						WHERE
							VILL_CODE = '${reqData.VILL_CODE}' AND  SR_CODE='${reqData.SR_CODE}' AND STATUS= 'R' and nature = '${reqData.NATURE}' ${reqData.SNO_DNO ? `AND SNO_DNO = '${reqData.SNO_DNO}'` : 'AND SNO_DNO is null'} 
					)`;
			response = await this.odbDao.oDbInsertDocs(query)
			if(response.error){
				return;
			}
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - makeEffectiveRequest || Error :", ex);
			console.error("MvRevisionHandler - makeEffectiveRequest || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	
	generatePDFFromHTML = async (html) => {
		const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
		const page = await browser.newPage();
		await page.setDefaultTimeout(100000);
		await page.setContent(html);
	
		const pdfBuffer = await page.pdf({
			// format: 'Legal',
			timeout: 0,
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

	

	getForm1PdfGenerate = async (reqBody) => {
		const { SRO_CODE, VILLAGE_CODE } = reqBody;
		try {
			let query;
			let response;
			if(reqBody.FILTER === 'GREATER'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name, (select class_desc from area_class where class_code = a.CLASSIFICATION) as class_desc FROM sromstr.urb_loc_rate_reg a where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE_RES > UNIT_RATE_RES OR REV_UNIT_RATE_COM > UNIT_RATE_COM OR REV_COMP_FLOOR1 > COMP_FLOOR1  OR REV_COMP_FLOOR_OTH > COMP_FLOOR_OTH)`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'ALL'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name, (select class_desc from area_class where class_code = a.CLASSIFICATION) as class_desc FROM sromstr.urb_loc_rate_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01'`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'LESS'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name, (select class_desc from area_class where class_code = a.CLASSIFICATION) as class_desc FROM sromstr.urb_loc_rate_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE_RES < UNIT_RATE_RES OR REV_UNIT_RATE_COM < UNIT_RATE_COM OR REV_COMP_FLOOR1 < COMP_FLOOR1  OR REV_COMP_FLOOR_OTH < COMP_FLOOR_OTH)`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'NOTUPDATED'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name, (select class_desc from area_class where class_code = a.CLASSIFICATION) as class_desc FROM sromstr.urb_loc_rate_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE_RES = UNIT_RATE_RES OR REV_UNIT_RATE_COM = UNIT_RATE_COM OR REV_COMP_FLOOR1 = COMP_FLOOR1  OR REV_COMP_FLOOR_OTH = COMP_FLOOR_OTH)`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'delete'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name, (select class_desc from area_class where class_code = a.CLASSIFICATION) as class_desc FROM sromstr.urb_loc_rate_reg_del a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01'`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'ALL VILLAGES' && reqBody.VILLAGE_CODE === 'ALL VILLAGES'){
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name, (select class_desc from area_class where class_code = a.CLASSIFICATION) as class_desc FROM sromstr.urb_loc_rate_reg a  where sro_code=${SRO_CODE} and habitation in (
				select a.village_code || '01' from juri_HU a where sro_Code=${SRO_CODE}
				) order by hab_name, a.ward_no, a.block_no, a.FR_DOOR_NO`;
				response = await this.odbDao.oDBQueryService(query);
			}
			const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
			<h3 style="margin:0px; margin-top : 5px">MARKET VALUE REVISION </h3>
			<h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${SRO_CODE},${reqBody.VILLAGE_CODE === 'ALL VILLAGES' ? 'All Villages' : `HABITATION: ${response[0].HAB_NAME}-${response[0].HABITATION}`}</h5>
			<h5 style="margin:0px; margin-top : 5px">FORM - 1</h5>
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
				<tr style="font-size : 10px;">
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">HABITATION</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">WARD NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">BLOCK NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">LOCALITY/ STREET/ ROAD</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOOR NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">BI WARD NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">BI BLOCK NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">LSR NUMBER</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">CLASSIFICATION</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">HOUSE NUMBER</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">UNIT RATE</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">GROUND FLOOR</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">FIRST FLOOR</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">OTHER FLOOR</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">UNIT RATE NEW</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">GROUND FLOOR NEW </th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">FIRST FLOOR NEW</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">OTHER FLOOR NEW</th>
				</tr>
			  </thead>
			  <tbody>
				${response
					.map(
						(item, index) => `
						  <tr key = ${index}>
						  	<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.HAB_NAME}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.WARD_NO}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.BLOCK_NO}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; max-width : 200px;">${item.LOCALITY_STREET}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.FR_DOOR_NO}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.BI_WARD}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.BI_BLOCK}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.LSR_NO}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.CLASS_DESC}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.TO_DOOR_NO}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.UNIT_RATE_RES}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.UNIT_RATE_COM}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMP_FLOOR1}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMP_FLOOR_OTH}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_UNIT_RATE_RES}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_UNIT_RATE_COM}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_COMP_FLOOR1}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_COMP_FLOOR_OTH}</td>
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
			Logger.error("MvRevisionHandler - getForm1 || Error :", ex);
			console.error("MvRevisionHandler - getForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	
	
	getForm2PdfGenerate = async (reqBody) => {
		const { SRO_CODE, VILLAGE_CODE } = reqBody;
		try {
			let query;
			let response;
			if(reqBody.FILTER === 'GREATER'){
				if(reqBody.SNO_DNO !=='null') {
					query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name FROM sromstr.urb_loc_rate_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE > UNIT_RATE OR REV_COMM_RATE > COMM_RATE OR REV_COMP_FLOOR1 > COMP_FLOOR1  OR REV_COMP_FLOOR_OTH > COMP_FLOOR_OTH) and door_no = '${reqBody.SNO_DNO}'`;
					response = await this.odbDao.oDBQueryService(query);	
				}
				else {
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name FROM sromstr.urb_loc_rate_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE > UNIT_RATE OR REV_COMM_RATE > COMM_RATE OR REV_COMP_FLOOR1 > COMP_FLOOR1  OR REV_COMP_FLOOR_OTH > COMP_FLOOR_OTH)`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'ALL'){
				if(reqBody.SNO_DNO !=='null') {
					query = `SELECT a.*,rowid, (select village_name from hab_code where hab_code = a.habitation) as hab_name from sromstr.urb_basic_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and door_no = '${reqBody.SNO_DNO}'`;
					response = await this.odbDao.oDBQueryService(query);
				}
				else {
					query = `SELECT a.*,rowid, (select village_name from hab_code where hab_code = a.habitation) as hab_name from sromstr.urb_basic_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01'`;
					response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'LESS'){
				if(reqBody.SNO_DNO !=='null') {
					query = `SELECT a.*,rowid, (select village_name from hab_code where hab_code = a.habitation) as hab_name from sromstr.urb_basic_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE < UNIT_RATE OR REV_COMM_RATE < COMM_RATE OR REV_COMP_FLOOR1 < COMP_FLOOR1  OR REV_COMP_FLOOR_OTH < COMP_FLOOR_OTH) and door_no = '${reqBody.SNO_DNO}'`;
				response = await this.odbDao.oDBQueryService(query);
				}
				else {
				query = `SELECT a.*,rowid, (select village_name from hab_code where hab_code = a.habitation) as hab_name from sromstr.urb_basic_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE < UNIT_RATE OR REV_COMM_RATE < COMM_RATE OR REV_COMP_FLOOR1 < COMP_FLOOR1  OR REV_COMP_FLOOR_OTH < COMP_FLOOR_OTH)`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'NOTUPDATED'){
				if(reqBody.SNO_DNO !=='null') {
					query = `SELECT a.*,rowid, (select village_name from hab_code where hab_code = a.habitation) as hab_name from sromstr.urb_basic_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE = UNIT_RATE OR REV_COMM_RATE = COMM_RATE OR REV_COMP_FLOOR1 = COMP_FLOOR1  OR REV_COMP_FLOOR_OTH = COMP_FLOOR_OTH) and door_no = '${reqBody.SNO_DNO}'`;
				response = await this.odbDao.oDBQueryService(query);
				}
				else {
				query = `SELECT a.*,rowid, (select village_name from hab_code where hab_code = a.habitation) as hab_name from sromstr.urb_basic_reg a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and (REV_UNIT_RATE = UNIT_RATE OR REV_COMM_RATE = COMM_RATE OR REV_COMP_FLOOR1 = COMP_FLOOR1  OR REV_COMP_FLOOR_OTH = COMP_FLOOR_OTH)`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'delete'){
				if(reqBody.SNO_DNO !=='null') {
					query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name from sromstr.urb_basic_reg_del a  where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01' and door_no = '${reqBody.SNO_DNO}'`;
					response = await this.odbDao.oDBQueryService(query);
				}
				else {
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name from sromstr.urb_basic_reg_del a where sro_code=${SRO_CODE} and habitation='${VILLAGE_CODE}' || '01'`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'ALL VILLAGES' && reqBody.VILLAGE_CODE === 'ALL VILLAGES'){
				query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name FROM sromstr.urb_basic_reg a  where sro_code=${SRO_CODE} and habitation in (
				select a.village_code || '01' from juri_HU a where sro_Code=${SRO_CODE}
				) order by hab_name, a.ward_no, a.block_no, a.DOOR_NO`;
				response = await this.odbDao.oDBQueryService(query);
			}			
			// Define the HTML content inline
			const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
			<h3 style="margin:0px; margin-top : 5px">MARKET VALUE REVISION </h3>
			<h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${SRO_CODE}, ${reqBody.VILLAGE_CODE === 'ALL VILLAGES' ? 'All Villages' : `HABITATION: ${response[0].HAB_NAME}-${response[0].HABITATION}`}</h5>
			<h5 style="margin:0px; margin-top : 5px">FORM - 2</h5>
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
				<tr style="font-size : 10px;">
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">HABITATION</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">WARD NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">BLOCK NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">BI WARD NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">BI BLOCK NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">DOOR NO</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">BI NUMBER</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">HOUSE NUMBER</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">UNIT RATE</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">GROUND FLOOR</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">FIRST FLOOR</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">OTHER FLOOR</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">UNIT RATE NEW</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">GROUND FLOOR NEW</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">FIRST FLOOR NEW</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">OTHER FLOOR NEW</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
					(item, index) => `
					  <tr>
					  	<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.HAB_NAME}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.WARD_NO}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.BLOCK_NO}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOOR_NO}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.BI_WARD}</td>
							<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.BI_BLOCK}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.BI_NUMBER}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.TR_DOOR_NO}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.UNIT_RATE}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMM_RATE}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMP_FLOOR1}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMP_FLOOR_OTH}</td>

						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_UNIT_RATE}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_COMM_RATE}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_COMP_FLOOR1}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_COMP_FLOOR_OTH}</td>

						
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
			Logger.error("MvRevisionHandler - getForm1 || Error :", ex);
			console.error("MvRevisionHandler - getForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	

	
	getForm3PdfGenerate = async (reqBody) => {

		const { SRO_CODE, VILLAGE_CODE } = reqBody;
		try {
			let query;
			let response;
			if(reqBody.FILTER === 'GREATER'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rur_hab_rate a 
				where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE > UNIT_RATE`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'ALL'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
			query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
			(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
			rowid from sromstr.rur_hab_rate a 
			where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE}`;
			response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'LESS'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rur_hab_rate a 
				where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE < UNIT_RATE`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'NOTUPDATED'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rur_hab_rate a 
				where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE = UNIT_RATE`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'delete'){
				if(reqBody.SNO_DNO !=='null') {
					return []
				}
				else {
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rur_hab_rate_del a 
				where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE}`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}	
			if(reqBody.FILTER === 'ALL VILLAGES' && reqBody.VILLAGE_CODE === 'ALL VILLAGES'){
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
			(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
			rowid from sromstr.rur_hab_rate a 
			where  sro_code=${SRO_CODE} and rev_vill_code in (SELECT distinct village_code from juri_ag where sro_Code=${SRO_CODE})
			order by villname, a.CLASSIFICATION`;
				response = await this.odbDao.oDBQueryService(query);
			}	
			// const rowColors = response.map((item) => {
			// 	if (item.REV_RATE > item.UNIT_RATE) {
			// 		return 'green';
			// 	} else if (item.REV_RATE < item.UNIT_RATE) {
			// 		return 'orange';
			// 	} else {
			// 		return 'black';
			// 	}
			// });
			
			// Sort the response array based on row colors
			// response.sort((a, b) => {
			// 	const colorA = rowColors[response.indexOf(a)];
			// 	const colorB = rowColors[response.indexOf(b)];
			// 	if (colorA < colorB) return -1;
			// 	if (colorA > colorB) return 1;
			// 	return 0;
			// });

			// Define the HTML content inline
			if (response.length > 0){
			const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
			
			<h3 style="margin:0px; margin-top : 5px">MARKET VALUE REVISION </h3>
			<h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${SRO_CODE},${reqBody.VILLAGE_CODE === 'ALL VILLAGES' ? 'ALL VILLAGES' : `VILLAGE CODE:${VILLAGE_CODE}-${response[0].VILLNAME}`}</h5>
			<h5 style="margin:0px; margin-top : 5px">FORM - 3</h5>
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
				
				<tr style="font-size : 10px;">
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">VILLAGE NAME</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">LOCAL BODY NAME</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">GRADE OF LOCAL BODY</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">CLASSIFICATION</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">VALUE OF ACRE</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> NEW VALUE PER ACRE</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">UNITS</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
					(item, index) => `
					  <tr>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.VILLNAME}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.LOCAL_BODY_NAME}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.GRADE_OF_LOCAL_BODY}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.CLAS}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.UNIT_RATE}</td>
						<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;  color: ${item.REV_RATE > item.UNIT_RATE ? 'green' : item.REV_RATE < item.UNIT_RATE ? 'orange' : 'black'}; font-weight: ${item.REV_RATE > item.UNIT_RATE ? 'bold' : item.REV_RATE < item.UNIT_RATE ? 'bold' : ''};">${item.REV_RATE}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.UNITS=='A' ? 'Acres': ''}</td>
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
				}
				else
				return([])
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm1 || Error :", ex);
			console.error("MvRevisionHandler - getForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	getForm4PdfGenerate = async (reqBody) => {

		const { SRO_CODE, VILLAGE_CODE } = reqBody;
		try {
			let query, response;
			if(reqBody.FILTER === 'GREATER'){
				if(reqBody.SNO_DNO !=='null') {
					query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
					(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
					rowid from sromstr.rural_basic_reg a 
					where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE > UNIT_RATE and (SURVEY_NO || '-' || SUB_SURVEY_NO) =  '${reqBody.SNO_DNO}'`;
					response = await this.odbDao.oDBQueryService(query);
				}
				else {
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rural_basic_reg a 
				where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE > UNIT_RATE`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'ALL'){
				if(reqBody.SNO_DNO !=='null') {
					query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
					(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
					rowid from sromstr.rural_basic_reg a 
					where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and (SURVEY_NO || '-' || SUB_SURVEY_NO) =  '${reqBody.SNO_DNO}'`;
					response = await this.odbDao.oDBQueryService(query);
				}
				else {
			query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
			(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
			rowid from sromstr.rural_basic_reg a 
			where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE}`;
			response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'LESS'){
				if(reqBody.SNO_DNO !=='null') {
					query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
					(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
					rowid from sromstr.rural_basic_reg a 
					where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE < UNIT_RATE and (SURVEY_NO || '-' || SUB_SURVEY_NO) =  '${reqBody.SNO_DNO}'`;
					response = await this.odbDao.oDBQueryService(query);
				}
				else {
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rural_basic_reg a 
				where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE < UNIT_RATE`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'NOTUPDATED'){
				if(reqBody.SNO_DNO !=='null') {
					query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
					(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
					rowid from sromstr.rural_basic_reg a 
					where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE = UNIT_RATE and (SURVEY_NO || '-' || SUB_SURVEY_NO) =  '${reqBody.SNO_DNO}'`;
					response = await this.odbDao.oDBQueryService(query);
				}
				else {
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rural_basic_reg a 
				where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and REV_RATE = UNIT_RATE`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'delete'){
				if(reqBody.SNO_DNO !=='null') {
					query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
					(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
					rowid from sromstr.rural_basic_reg_del a 
					where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE} and (SURVEY_NO || '-' || SUB_SURVEY_NO) =  '${reqBody.SNO_DNO}'`;
					response = await this.odbDao.oDBQueryService(query);
				}
				else {
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rural_basic_reg_del a 
				where  sro_code=${SRO_CODE} and rev_vill_code=${VILLAGE_CODE}`;
				response = await this.odbDao.oDBQueryService(query);
				}
			}
			if(reqBody.FILTER === 'ALL VILLAGES' && reqBody.VILLAGE_CODE === 'ALL VILLAGES'){
				query = `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
			(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
			rowid from sromstr.rural_basic_reg a 
			where  sro_code=${SRO_CODE} and rev_vill_code in (SELECT distinct village_code from juri_ag where sro_Code=${SRO_CODE})
			order by villname, a.survey_no, a.sub_survey_no`;
				response = await this.odbDao.oDBQueryService(query);
			}	
			

			// Define the HTML content inline
			const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
			
			<h3 style="margin:0px; margin-top : 5px">MARKET VALUE REVISION </h3>
			<h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH SR-OFFICE-CODE: ${SRO_CODE},${reqBody.VILLAGE_CODE === 'ALL VILLAGES' ? 'ALL VILLAGES' : `VILLAGE CODE:${VILLAGE_CODE}-${response[0].VILLNAME}`}</h5>
			<h5 style="margin:0px; margin-top : 5px">FORM - 4</h5>
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
				
				<tr style="font-size : 10px;">
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">VILLAGE NAME</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Survey/LPM No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Sub Survey No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Classification</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Value/Acre</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> New Value per Acre</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Units</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
					(item, index) => `
					  <tr>
					  	<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.VILLNAME}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SURVEY_NO}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.SUB_SURVEY_NO}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.CLAS}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.UNIT_RATE}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.REV_RATE}</td>
						<td  style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.UNITS=='A' ? 'Acres': ''}</td>
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
			Logger.error("MvRevisionHandler - getForm1 || Error :", ex);
			console.error("MvRevisionHandler - getForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	getSurveyNoListSrvc = async (reqData) => {
		try {
		if(reqData.NATURE === 'R') {
		let query = `select survey_no, sub_survey_no from sromstr.rural_basic_reg where rev_vill_code=${reqData.VILL_CODE} group by survey_no, sub_survey_no`;			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}
		else {
			let query = `select DOOR_NO from sromstr.urb_basic_reg where habitation= '${reqData.VILL_CODE}' || '01' group by DOOR_NO`;			
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm1 || Error :", ex);
			console.error("MvRevisionHandler - getForm1 || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getForm1PdfGenerateData = async (reqBody) => {
		try {
			if(reqBody.SNO_DNO !=='null') {
				return {data : [], deletedData : []};
			}
			else {
			let query = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name, (select class_desc from area_class where class_code = a.CLASSIFICATION) as class_desc FROM sromstr.urb_loc_rate_reg a  where sro_code=${reqBody.SRO_CODE} and habitation='${reqBody.VILLAGE_CODE}' || '01'`;
			let response = await this.odbDao.oDBQueryService(query);
			let query1 = `SELECT a.*, (select village_name from hab_code where hab_code = a.habitation) as hab_name, (select class_desc from area_class where class_code = a.CLASSIFICATION) as class_desc FROM sromstr.urb_loc_rate_reg_del a  where sro_code=${reqBody.SRO_CODE} and habitation='${reqBody.VILLAGE_CODE}' || '01'`;
			let response1 = await this.odbDao.oDBQueryService(query1);
			return {data : response, deletedData : response1};
			}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm1PdfGenerateData || Error :", ex);
			console.error("MvRevisionHandler - getForm1PdfGenerateData || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	getForm2PdfGenerateData = async (reqBody) => {
		try {
			if(reqBody.SNO_DNO !='null') {
				let query = `select WARD_NO,BLOCK_NO,DOOR_NO as FR_DOOR_NO,BI_NUMBER as LSR_NO,TR_DOOR_NO as TO_DOOR_NO,UNIT_RATE as UNIT_RATE_RES,COMM_RATE as UNIT_RATE_COM,COMP_FLOOR1 ,COMP_FLOOR_OTH,REV_UNIT_RATE as REV_UNIT_RATE_RES,REV_COMM_RATE as REV_UNIT_RATE_COM, REV_COMP_FLOOR1, REV_COMP_FLOOR_OTH from sromstr.urb_basic_reg where sro_code=${reqBody.SRO_CODE} and habitation='${reqBody.VILLAGE_CODE}' || '01' and door_no = '${reqBody.SNO_DNO}'`;			
				let response = await this.odbDao.oDBQueryService(query);
				let query1 = `select WARD_NO,BLOCK_NO,DOOR_NO as FR_DOOR_NO,BI_NUMBER as LSR_NO,TR_DOOR_NO as TO_DOOR_NO,UNIT_RATE as UNIT_RATE_RES,COMM_RATE as UNIT_RATE_COM,COMP_FLOOR1 ,COMP_FLOOR_OTH,REV_UNIT_RATE as REV_UNIT_RATE_RES,REV_COMM_RATE as REV_UNIT_RATE_COM, REV_COMP_FLOOR1, REV_COMP_FLOOR_OTH from sromstr.urb_basic_reg_del where sro_code=${reqBody.SRO_CODE} and habitation='${reqBody.VILLAGE_CODE}' || '01' and door_no = '${reqBody.SNO_DNO}'`;			
				let response1 = await this.odbDao.oDBQueryService(query1);
				return {data : response, deletedData : response1};
			}
			else {
			let query = `select HABITATION,WARD_NO,BLOCK_NO,DOOR_NO as FR_DOOR_NO,BI_NUMBER as LSR_NO,TR_DOOR_NO as TO_DOOR_NO,UNIT_RATE as UNIT_RATE_RES,COMM_RATE as UNIT_RATE_COM,COMP_FLOOR1 ,COMP_FLOOR_OTH,REV_UNIT_RATE as REV_UNIT_RATE_RES,REV_COMM_RATE as REV_UNIT_RATE_COM, REV_COMP_FLOOR1, REV_COMP_FLOOR_OTH, (select village_name from hab_code where hab_code = habitation) as hab_name, bi_ward, bi_block from sromstr.urb_basic_reg where sro_code=${reqBody.SRO_CODE} and habitation='${reqBody.VILLAGE_CODE}' || '01'`;			
			let response = await this.odbDao.oDBQueryService(query);
			let query2 = `select HABITATION,WARD_NO,BLOCK_NO,DOOR_NO as FR_DOOR_NO,BI_NUMBER as LSR_NO,TR_DOOR_NO as TO_DOOR_NO,UNIT_RATE as UNIT_RATE_RES,COMM_RATE as UNIT_RATE_COM,COMP_FLOOR1 ,COMP_FLOOR_OTH,REV_UNIT_RATE as REV_UNIT_RATE_RES,REV_COMM_RATE as REV_UNIT_RATE_COM, REV_COMP_FLOOR1, REV_COMP_FLOOR_OTH, (select village_name from hab_code where hab_code = habitation) as hab_name, bi_ward, bi_block from sromstr.urb_basic_reg_del where sro_code=${reqBody.SRO_CODE} and habitation='${reqBody.VILLAGE_CODE}' || '01'`;			
			let response1 = await this.odbDao.oDBQueryService(query2);
			return {data : response, deletedData : response1};
			}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm2PdfGenerateData || Error :", ex);
			console.error("MvRevisionHandler - getForm2PdfGenerateData || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	getForm3PdfGenerateData = async (reqBody) => {
		try {
			if(reqBody.SNO_DNO !='null') {
				return {data : [], deletedData : []};
			}
			else {
				let query1=`select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
				(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
				rowid from sromstr.rur_hab_rate_del a 
				where  sro_code=${reqBody.SRO_CODE} and rev_vill_code=${reqBody.VILLAGE_CODE}`
				let response1 = await this.odbDao.oDBQueryService(query1);
			let query = `
			select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
		(select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
		rowid from sromstr.rur_hab_rate a 
		where  sro_code=${reqBody.SRO_CODE} and rev_vill_code=${reqBody.VILLAGE_CODE}`;
			let response = await this.odbDao.oDBQueryService(query);
			return {data : response, deletedData : response1};
			}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm3PdfGenerateData || Error :", ex);
			console.error("MvRevisionHandler - getForm3PdfGenerateData || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	getForm4PdfGenerateData = async (reqBody) => {
		try {
			if(reqBody.SNO_DNO !='null') {
				let query = `
			select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
		(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
		rowid from sromstr.rural_basic_reg a 
		where  sro_code=${reqBody.SRO_CODE} and rev_vill_code=${reqBody.VILLAGE_CODE} and (SURVEY_NO || '-' || SUB_SURVEY_NO) =  '${reqBody.SNO_DNO}'`;
			let response = await this.odbDao.oDBQueryService(query);
			let query2 = `
			select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
		(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
		rowid from sromstr.rural_basic_reg_del a 
		where  sro_code=${reqBody.SRO_CODE} and rev_vill_code=${reqBody.VILLAGE_CODE} and (SURVEY_NO || '-' || SUB_SURVEY_NO) =  '${reqBody.SNO_DNO}'`;
			let response1 = await this.odbDao.oDBQueryService(query2);
			return {data:response,deletedData:response1};
			}
			else {
			let query = `
			select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
		(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
		rowid from sromstr.rural_basic_reg a 
		where  sro_code=${reqBody.SRO_CODE} and rev_vill_code=${reqBody.VILLAGE_CODE}`;
			let response = await this.odbDao.oDBQueryService(query);
			let query2 = `
			select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
		(select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
		rowid from sromstr.rural_basic_reg_del a 
		where  sro_code=${reqBody.SRO_CODE} and rev_vill_code=${reqBody.VILLAGE_CODE}`;
			let response1 = await this.odbDao.oDBQueryService(query2);
			return {data:response,deletedData:response1};
			}
		} catch (ex) {
			Logger.error("MvRevisionHandler - getForm4PdfGenerateData || Error :", ex);
			console.error("MvRevisionHandler - getForm4PdfGenerateData || Error :", ex);
			throw constructCARDError(ex);
		}
	}

     	getMvRequestsStatus = async (reqData) => {
		try {
			let query= `select mv.*,emp_m.sr_name,vil.village_name from sromstr.mv_enable_revision_cr mv, card.sr_master emp_m, hab_code vil where mv.sr_code=emp_m.sr_cd and mv.village_code||'01'=vil.hab_code and mv.sr_code=${reqData.SR_CODE}`;
			let response = await this.odbDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - getMvRequestStatusList || Error :", ex);
			console.error("MvRevisionHandler - getMvRequestStatusList || Error :", ex);
			throw constructCARDError(ex);
		}
	}
		getMakeEffectiveRequestBySroStatus = async (reqData) => {
		try {
		let query = `SELECT mv.vill_code,
		hab.village_name,
		mv.sr_code,
		mv.status,
		mv.REJECT_REASON,
		TO_CHAR(mv.approve_dt, 'dd/mm/yyyy hh:mi AM') AS approve_date,
		TO_CHAR(mv.request_dt,'dd/mm/yyyy hh:mi AM')AS request_date,
		mv.nature,
		mv.sno_dno,
		(SELECT sr_name FROM sr_master WHERE sr_cd = mv.sr_code) AS sr_name
        FROM sromstr.mv_revision_status_cr mv
        JOIN hab_code hab ON mv.vill_code || '01' = hab.hab_code
		WHERE mv.SR_CODE = '${reqData.SR_CODE}'`;	

			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("MvRevisionHandler - getMakeEffectRequesStatustList || Error :", ex);
			console.error("MvRevisionHandler - getMakeEffectRequesStatustList || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getSurveyNoAccordtoJuriAdded = async (reqData) => {
		try {
		let query = `
		select DISTINCT main_sur_no from sromstr.juri_rural where sro_code=${reqData.SR_CODE} and REV_VILL_CODE='${reqData.VILL_CODE}'`;
		// minus
        // select DISTINCT survey_no from sromstr.mv_basic_rur_reg  where sro_code=${reqData.SR_CODE} and REV_VILL_CODE='${reqData.VILL_CODE}'`;            
			let response = await this.odbDao.oDBQueryService(query)
			return response;
	     	}
		 catch (ex) {
			Logger.error("MvRevisionHandler - getSurveyNoAccordtoJuriAdded || Error :", ex);
			console.error("MvRevisionHandler - getSurveyNoAccordtoJuriAdded || Error :", ex);
			throw constructCARDError(ex);
		}
	}
       
	getLpmCheck = async(reqData) => {
		try{
			let query = `
			select*from card.gs_srcode where village_code='${reqData.VILL_CODE}'`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		}catch(ex){
			Logger.error("MvRevisionHandler - getLpmCheck || Error :", ex);
			console.error("MvRevisionHandler - getLpmCheck || Error :", ex);
			throw constructCARDError(ex);
		}
		}

		getUrbanJurisdictionSrvc = async(reqData) => {
			try{
				let query = `
					select ju.*, lbd.local_body_desc from juri_urban ju
					left join card.local_body_dir lbd on ju.grade_of_local_body = lbd.local_body_code
					where ju.habitation = :habitation and ju.sro_code = :sr_code
					order by ju.ward_no, ju.block_no`;
				const bindParms = {
					habitation : reqData.habitation,
					sr_code : reqData.sr_code
				}
				let response = await this.odbDao.oDBQueryServiceWithBindParams(query, bindParms);
				return response;
			}catch(ex){
				Logger.error("MvRevisionHandler - getUrbanJurisdictionSrvc || Error :", ex);
				console.error("MvRevisionHandler - getUrbanJurisdictionSrvc || Error :", ex);
				throw constructCARDError(ex);
			}
			}

			insertUrbanJurisdictionSrvc = async(reqData) => {
				try{
					let query = `insert into juri_urban (SRO_CODE, HABITATION,LOCAL_BODY_CODE, LOCAL_BODY_NAME, GRADE_OF_LOCAL_BODY,WARD_NO, BLOCK_NO, TIME_STAMP, USERNAME, BI_WARD, BI_BLOCK)
								VALUES (
								:SR_CODE,
								:HABITATION,
								:LOCAL_BODY_CODE,
								:LOCAL_BODY_NAME,
								:GRADE_OF_LOCAL_BODY,
								:WARD_NO,
								:BLOCK_NO,
								sysdate,
								:USERNAME, :BI_WARD_NO, :BI_BLOCK_NO)`;
					const bindParms = {
						HABITATION : reqData.HABITATION,
						SR_CODE : reqData.SR_CODE,
						LOCAL_BODY_CODE : reqData.HABITATION,
						LOCAL_BODY_NAME : reqData.LOCAL_BODY_NAME,
						GRADE_OF_LOCAL_BODY : reqData.LOCAL_BODY_CODE,
						WARD_NO	: reqData.WARD_NO,
						BLOCK_NO : reqData.BLOCK_NO,
						USERNAME : reqData.USERNAME,
						BI_WARD_NO : reqData.BI_WARD_NO,
						BI_BLOCK_NO : reqData.BI_BLOCK_NO
					}
					let response = await this.odbDao.oDbInsertDocsWithBindParams(query, bindParms);
					return response;
				}catch(ex){
					Logger.error("MvRevisionHandler - insertUrbanJurisdictionSrvc || Error :", ex);
					console.error("MvRevisionHandler - insertUrbanJurisdictionSrvc || Error :", ex);
					throw constructCARDError(ex);
				}
				}

	
}

module.exports = MvRevisionServices;