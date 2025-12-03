const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const { LPM } = require('../utils/sysConstanst');
const { get } = require('lodash');
const { encryptData } = require('../utils');
const { transportEmail } = require("../utils/index");
const { CODES } = require('../constants/appConstants');
const {whatsAppNotificationForEC} = require('../common/smsCommon')
const {URBAN_MUTATION_ACCEPT_MAJOR_CODES,URBAN_MUTATION_ACCEPT_MINOR_CODES} =require('../constants/appConstants');

class AutoMutationServices {
	constructor() {
		this.orDao = new OrDao();
	}

	getDocumentsSrvc = async (reqData) => {
		try {
			let query = `SELECT * From tran_major where rdoct_no is not null and sr_code=${reqData.srCode} and scanned_by is null AND REG_YEAR=${reqData.regYear}`;
			let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("AutoMutationServices - getDocumentsSrvc || Error :", ex);
			console.error("AutoMutationServices - getDocumentsSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getPropertyDetailsSrvc = async (reqData) => {
		try {
			let query = `SELECT * From tran_sched where sr_Code=${reqData.srCode} and book_no=${reqData.bookNo} and reg_year=${reqData.regYear} and doct_no=${reqData.doctNo}`;
			let response = await this.orDao.oDBQueryService(query);
			return response;
		} catch (ex) {
			Logger.error("AutoMutationServices - getPropertyDetailsSrvc || Error :", ex);
			console.error("AutoMutationServices - getPropertyDetailsSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getSurveyDetails = async(reqData) => {
		try{
			let query = `SELECT * From pahani_details_post where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and reg_year=${reqData.regYear} and doct_no=${reqData.doctNo} and sur_no='${reqData.surNo}' and schedule_no='${reqData.scheduleNo}'`;
			console.log(query)
			let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("AutoMutationServices - getSurveyDetails || Error :", ex);
			console.error("AutoMutationServices - getSurveyDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	saveSubDivSrvc = async (reqData, flag=false) => {
		console.log(reqData);
		try {
			if(reqData.IS_PARTITION){
				let query = `Insert into SROUSER.SUB_DIV_SURVEY (SR_CODE,DOCT_NO,REG_YEAR,SCHEDULE_NO,WEBLAND_TRAN_ID,VILLAGE_CODE,SURVEY_NO,SUB_DIV_SURVEY,TIME_STAMP,JOINT_PATTA,KATA_NO,SRO_PID) values (${reqData.SR_CODE},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.SCHEDULE_NO}','${reqData.WEBLAND_TRAN_ID}','${reqData.VILLAGE_CODE}','${reqData.SURVEY_NO}','${reqData.SUB_DIV_SURVEY}',SYSDATE,'${reqData.JOINT_PATTA}','${reqData.KATA_NO}','${reqData.SRO_PID}')`;
				await this.orDao.oDbInsertDocs(query);
			}
			else{
			for(let i of reqData){
				let query = `Insert into SROUSER.SUB_DIV_SURVEY (SR_CODE,DOCT_NO,REG_YEAR,SCHEDULE_NO,WEBLAND_TRAN_ID,VILLAGE_CODE,SURVEY_NO,SUB_DIV_SURVEY,TIME_STAMP,JOINT_PATTA,KATA_NO,SRO_PID) values (${i.SR_CODE},${i.DOCT_NO},${i.REG_YEAR},'${i.SCHEDULE_NO}','${i.WEBLAND_TRAN_ID}','${i.VILLAGE_CODE}','${i.SURVEY_NO}','${i.SUB_DIV_SURVEY}',SYSDATE,'${i.JOINT_PATTA}','${i.KATA_NO}','${i.SRO_PID}')`;
				await this.orDao.oDbInsertDocs(query);
			}
		}
			return true;
		
		} catch (ex) {
			Logger.error("AutoMutationServices - saveSubDivSrvc || Error : ", ex.message);
			console.log("AutoMutationServices - saveSubDivSrvc || Error : ", ex.message);
			
			if(flag){return false;} else{ throw constructCARDError(ex);}
		}
	}

	deleteSubDivSrvc=async(reqData)=>{
		console.log(reqData);
		try{
			let data=await this.orDao.oDbDelete(reqData)
			return data;
		}
		catch(ex){
			Logger.error("AutoMutationServices - deleteSubDivSrvc || Error : ", ex.message);
			console.log("AutoMutationServices - deleteSubDivSrvc || Error : ", ex.message);
			throw constructCARDError(ex);
		}

	}

	getSubDivSrvc= async(reqData) => {
		try {
			let query = `Select * from SROUSER.SUB_DIV_SURVEY where SR_CODE=${reqData.srCode} and DOCT_NO=${reqData.docNo} and REG_YEAR=${reqData.regYear}` + (reqData.flag ? '' : ` and SCHEDULE_NO=${reqData.scheduleNo} and SURVEY_NO='${reqData.surNo}'`);
			let result = await this.orDao.oDBQueryService(query);
			return result;
		} catch (err) {
			throw constructCARDError(err);
		}
	}
	getMutationSrvc= async(reqData) => {
		try {
			let query = `Select * from mutation_sent_cr where SR_CODE=${reqData.srCode} and DOCT_NO=${reqData.docNo} and REG_YEAR=${reqData.regYear}`;
			let result = await this.orDao.oDBQueryService(query);
			return result;
		} catch (err) {
			throw constructCARDError(err);
		}
	}

	collectStatus = async (reqData) => {
		try {
			let v_k_no = reqData.V_KHATA_NO && reqData.V_KHATA_NO.length ? reqData.V_KHATA_NO.map(v => v.join('_')).join(',') : '';
			let query = reqData.TYPE === LPM ? `Insert into SROUSER.WEBLAND_STATUS_LPM_CR (SR_CODE,DOCT_NO,BOOK_NO,REG_YEAR,STATUS,REG_TIMESTAMP,V_KHATA_NO) values (${reqData.SR_CODE},${reqData.DOCT_NO},1,${reqData.REG_YEAR},'${reqData.STATUS}',SYSDATE,'${v_k_no}')` : `Insert into SROUSER.WEBLAND_STATUS_SURV_CR (SR_CODE,DOCT_NO,BOOK_NO,REG_YEAR,SRO_PID,STATUS,REG_TIMESTAMP,V_KHATA_NO) values (${reqData.SR_CODE},${reqData.DOCT_NO},1,${reqData.REG_YEAR},'${reqData.SRO_PID}','${reqData.STATUS}',SYSDATE,'${v_k_no}')`;
			let result = await this.orDao.oDbInsertDocs(query);
			return result;
		} catch (ex){
			Logger.error("AutoMutationServices - collectStatus || Error : ", ex);
			console.log("AutoMutationServices - collectStatus || Error : ", ex);

			throw constructCARDError(ex);
		}
	}

	getRevenueNameSrvc = async (reqData) => {
		try {
			let query = `SELECT DISTINCT UPPER(REG_DISTRICTNAME) FROM CARD.MST_DISTRICTS_MANDALS WHERE OLD_REVDISTRICTCODE='${reqData.OLD_REVDISTRICTCODE}' AND OLD_MANDAL_CODE='${reqData.OLD_MANDAL_CODE}'`;
			let result = await this.orDao.oDBQueryService(query);
			return result;
		} catch (ex) {
			Logger.error("AutoMutationServices - getRevenueNameSrvc || Error : ", ex);
			console.log("AutoMutationServices - getRevenueNameSrvc || Error : ", ex);
			throw constructCARDError(ex);
		}
	}

	isMutationNeeded = async(data) => {
        let major_code = get(data, 'docDetails.0.TRAN_MAJ_CODE', '');
        let minor_code = get(data, 'docDetails.0.TRAN_MIN_CODE', '');
		const requiredParams = {
            SR_CODE: data.docDetails[0]?.SR_CODE,
            BOOK_NO: data.docDetails[0]?.BOOK_NO,
            REG_YEAR: data.docDetails[0]?.REG_YEAR,
            DOCT_NO: data.docDetails[0]?.DOCT_NO
		}
		const query = `select * from srouser.tran_oci where sr_code=:SR_CODE and book_no=:BOOK_NO and reg_year=:REG_YEAR and doct_no=:DOCT_NO`
		const isDocumentOCI = await this.orDao.oDBQueryServiceWithBindParams(query,requiredParams);
		let claimants = isDocumentOCI?.filter(C => CODES.CLAIMANT_CODES.includes(C.PARTY_CODE));
		if(claimants.length > 0){
			const result = await this.handleOCIDocumentsMovedtoScan(requiredParams);
			return false;
		}
		console.log(major_code, minor_code);
        if(claimants.length < 1 && major_code == '01' && ['01','04', '05', '06', '08', '14', '15', '16', '17', '19', '27' ,'28', '29'].includes(minor_code)){
            return true;
        } else if(claimants.length < 1 && major_code == '03' && ['01', '02', '03', '04','05','06', '07', '08', '09'].includes(minor_code)){
            return true;
        }
		else if(claimants.length < 1 && major_code=='04' &&['01','02'].includes(minor_code)){
			return true;
		}
		else {
            return false;
        }
    }

	isUrbanMutationNeeded = async(data)=>{
        let major_code = get(data, 'docDetails.0.TRAN_MAJ_CODE', '');
        let minor_code = get(data, 'docDetails.0.TRAN_MIN_CODE', '');
		const requiredParams = {
			bookNo:data.basicDetails[0]?.BOOK_NO,
			doctNo:data.basicDetails[0]?.DOCT_NO,
			regYear:data.basicDetails[0]?.REG_YEAR,
			sroCode:data.basicDetails[0]?.SR_CODE,
		}
		const query = `select * from srouser.tran_oci where sr_code=:sroCode and book_no=:bookNo and reg_year=:regYear and doct_no=:doctNo`
		const isDocumentOCI = await this.orDao.oDBQueryServiceWithBindParams(query,requiredParams);
		let claimants = isDocumentOCI?.filter(C => CODES.CLAIMANT_CODES.includes(C.PARTY_CODE));
        const isMutationNeedMajor= URBAN_MUTATION_ACCEPT_MAJOR_CODES.includes(major_code);
        if(claimants.length < 1 && isMutationNeedMajor){
            return URBAN_MUTATION_ACCEPT_MINOR_CODES[major_code].includes(minor_code)
        }
        return false
    };

	// isUrbanMutationNeeded = (data) => {
	// 	let major_code = get(data, 'docDetails.0.TRAN_MAJ_CODE', '');
    //     let minor_code = get(data, 'docDetails.0.TRAN_MIN_CODE', '');
    //     console.log(major_code, minor_code);
    //     if(major_code == '01' && ['01', '04', '05', '06', '08', '14', '15', '16', '19', '20', '22'].includes(minor_code)){
    //         return true;
    //     } else if(major_code == '03' && ['01', '02', '03', '04', '07', '08', '09'].includes(minor_code)){
    //         return true;
    //     } else {
    //         return false;
    //     }
	// }

	// getFilePath = async (data) => {
	// 	let loc = `select  Location from scanuser.img_base_cca where sro_code = ${data.srCode} and book_no = ${data.bookNo} and reg_year = ${data.regYear} and doct_no = ${data.docNo}`;
	// 	let result = await this.orDao.oDBQueryService(loc);
	// 	if(result && result.length && result[0].LOCATION){
	// 		result = result[0].LOCATION.split('.pdf')[0].split('');
	// 		return 'http://rs.ap.gov.in/ReportsPdfView/CDMAPDFLink?url=' + result.reverse().join('').replaceAll('/', '@');
	// 	} else {
	// 		return '';
	// 	}
	// }

	getFilePath = async (reqData) => {
		try {
			let fetchDoctQuery = `SELECT rdoct_no, reg_year FROM tran_major 
								   WHERE SR_CODE = :SR_CODE 
								   AND BOOK_NO = :BOOK_NO 
								   AND ryear = :REG_YEAR 
								   AND DOCT_NO = :DOCT_NO`;
	
			let bindParamsFetch = {
				'SR_CODE': reqData.srCode,
				'BOOK_NO': reqData.bookNo,
				'REG_YEAR': reqData.regYear,
				'DOCT_NO': reqData.docNo
			};
	
			let result = await this.orDao.oDBQueryServiceWithBindParams(fetchDoctQuery, bindParamsFetch);

			if (!result.length || !result[0]?.RDOCT_NO) {
				return "We couldn't locate the document details. Please verify the document details and try again.";
			}
	
			let regularDoctNo = result[0]?.RDOCT_NO; 
	
			let bindParams = {
				'SR_CODE': reqData.srCode,
				'BOOK_NO': reqData.bookNo,
				'DOCT_NO': regularDoctNo,
				'REG_YEAR': reqData.regYear
			}; 
	
			let pdfvalquery = `SELECT COUNT(*) as COUNT FROM img_base_cca 
							   WHERE sro_code = :SR_CODE 
							   AND book_no = :BOOK_NO 
							   AND reg_year = :REG_YEAR 
							   AND rdoct_no = :DOCT_NO`;
	
			let pdfvalresponse = await this.orDao.oDBQueryServiceWithBindParams(pdfvalquery, bindParams);
	
			if (pdfvalresponse[0]?.COUNT <= 0) {
				return "We couldn't locate the document details. Please verify the document details and try again.";
			} else {
				let ccData = encodeURIComponent(JSON.stringify(bindParams));
				ccData = encryptData(ccData);
				let docLink = `${process.env.PDE_HOST}/PDE/CCdownloadPage?data=${ccData}`;
				return docLink;
			}
		} catch (ex) {
			Logger.error("AutoMutationServices - doctdetailsSrvc || Error :", ex);
			console.error("AutoMutationServices - doctdetailsSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	};
	filterUrbanMutationSchedules = async(scheduleDetails) =>{
		// const isSroEnabledForMutationDataquery = `Select * from srouser.slot_enable_sro where sr_code=${scheduleDetails.JURISDICTION}`;
		const isSroEnabledForMutationDataquery = `select a.*,b.jurisdiction,b.hab_code,b.village_code ,hl.village_code as webland_code,se.urban_mutation_status from SROUSER.PTIN_DETAILS_CR a
                            join tran_sched b on a.reg_year=b.reg_year and a.book_no=b.book_no and  a.sr_code=b.sr_code and a.doct_no=b.doct_no and a.schedule_no=b.schedule_no
                            join srouser.slot_enable_sro se on b.jurisdiction=se.sr_code
                            left join hab_match hb on b.hab_code= hb.hab_code and rownum=1
                            left join sromstr.hab_ulb hl on hb.webland_code=hl.village_code
                            where a.sr_code =${scheduleDetails.SR_CODE} and a.book_no =${scheduleDetails.BOOK_NO} and a.reg_year =${scheduleDetails.REG_YEAR} and a.doct_no =${scheduleDetails.DOCT_NO} and se.urban_mutation_status='Y' and hl.village_code is not null`;
		const isSroEnabledForMutationData = await this.orDao.oDBQueryService(isSroEnabledForMutationDataquery);
        if (isSroEnabledForMutationData.length > 0) 
			{
			return true;
		}
		return false;
	}
	sendWhatsAppNotificationService = async(params)=>{
		const majorParams={
				srCode: +params.srCode,
				bookNo: +params.bookNo,
				regYear: +params.regYear, 
				docNo: +params.doctNo
			};
			try{
				const scannedCopy = await this.getFilePath({...majorParams});
			const query = `select a.*, (select sr_name from sr_master where sr_cd = a.sr_code) srname from srouser.tran_ec a where sr_code=:srCode and book_no=:bookNo and doct_no=:docNo and reg_year=:regYear`
			const partiesData = await this.orDao.oDBQueryServiceWithBindParams(query, {...majorParams});
			const dataParam = scannedCopy.split("?data=")[1];
			const claimantDetails = partiesData.filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
			for (let key of claimantDetails) {
				if (key.PHONE_NO) {
					whatsAppNotificationForEC({
						docNo: claimantDetails[0].RDOCT_NO,
						templateId: 'apigrs_document',
						regYear: params.regYear,
						mobileNumber: key.PHONE_NO,
						sroName: claimantDetails[0].SRNAME,
						bookNo: params.bookNo,
						fileLink: `${dataParam}`,
					});
				}
			};
			return 'Success'
			}catch(er){
				console.log('Whats app notification sent Error : ||',er)
			}
			
	}

 MutationStatusMailsrvc = async (reqData) => {
    try {
		let query = `Select EMAIL from card.dept_mail where purpose='EODB'`;
		let emails = await this.orDao.oDBQueryService(query);
		let deptemailist = emails.map(item => item.EMAIL).filter(email => email).join(',');		
        // let deptemailist = "premkumar.mamidi@criticalriver.com, vamshi.kappagala@criticalriver.com";
        let fResult = {};
        let identify;
		let bindParams ={
			SR_CODE:reqData.SR_CODE,
			DOCT_NO: reqData.DOCT_NO,
			REG_YEAR : reqData.REG_YEAR,
			BOOK_NO : reqData.BOOK_NO
		}		
		let Query =
		`select tm.*,te.*,ts.*, (select sr_name from sr_master i where i.sr_cd=te.sr_code and rownum=1) as sr_name, TO_CHAR(tm.R_DATE, 'YYYY-MM-DD') as REG_DATE,td.TRAN_DESC  from tran_ec te 
		join tran_sched ts on te.SR_CODE = ts.SR_CODE AND te.DOCT_NO= ts.DOCT_NO AND te.REG_YEAR= ts.REG_YEAR AND te.BOOK_NO= ts.BOOK_NO
		join tran_major tm on tm.SR_CODE = ts.SR_CODE AND tm.DOCT_NO= ts.DOCT_NO AND tm.REG_YEAR= ts.REG_YEAR AND tm.BOOK_NO= ts.BOOK_NO
		join tran_dir td on tm.tran_maj_code =td.tran_maj_code and tm.tran_min_code=td.tran_min_code
		where te.SR_CODE = :SR_CODE AND te.DOCT_NO= :DOCT_NO AND te.REG_YEAR= :REG_YEAR AND te.BOOK_NO= :BOOK_NO`
		let Response= await this.orDao.oDBQueryServiceWithBindParams(Query, bindParams);
		const groupedData = {};
			Response.forEach(item => {
				let key = `${item.SR_CODE}-${item.DOCT_NO}-${item.REG_YEAR}-${item.SCHEDULE_NO}-(${reqData.SR_CODE}-${reqData.BOOK_NO}-${reqData.DOCT_NO}-${reqData.REG_YEAR})-${item.TRAN_DESC}-${item.FINAL_TAXABLE_VALUE}-${item.REG_DATE}`;
				
				if (!groupedData[key]) {
					groupedData[key] = { ...item, NAMES: [], ADDRESSES: [] };
				}
	
				let nameEntry = `(${item.CODE}) - ${item.NAME}`;
				if (item.R_CODE || item.R_NAME) {
					nameEntry += `<br>(Relation: ${item.R_CODE || ''} - ${item.R_NAME || ''})`;
				}
	
				groupedData[key].NAMES.push(nameEntry);
				groupedData[key].ADDRESSES.push(item.ADDRESS1 || '');
			});
	
			const finalData = Object.values(groupedData);
			
        const mailOptions = {
            from: `"IGRS" <${process.env.SMTP_EMAIL}>`,
            to: deptemailist,
            subject: `Details of the properties registered via Document ID ${reqData.SR_CODE}-${reqData.BOOK_NO}-${reqData.DOCT_NO}-${reqData.REG_YEAR}`,
            // text: `Dear Sir / Madam,\n\nAuto mutation for the APP ID: ${APP_ID} has been completed.\n\nThanks,\nIGRS -AP`,
			html: `
<p>Dear Sir / Madam,</p>
<p>Below are the Details of the Properties registered Via Document ID: <strong>${reqData.SR_CODE}-${reqData.BOOK_NO}-${reqData.DOCT_NO}-${reqData.REG_YEAR}</strong> </p>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: left; font-family: Arial, sans-serif;">
  <thead>
    <tr style="background-color: #004080; color: #ffffff;">
      <th style="width: 5%;">S No.</th>
      <th style="width: 20%;">Property Details</th>
      <th style="width: 20%;">SR Code / DOCT No. /<br>Reg Year / Schedule No. /<br> (Document ID)</th>
      <th style="width: 20%;">Nature / Chargeable Value /<br>Registration Date</th>
      <th style="width: 20%;">Name of Parties</th>
      <th style="width: 15%;">Address</th>
    </tr>
  </thead>
  <tbody>
    ${finalData.map((item, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#f2f2f2' : '#ffffff'};">
        <td style="text-align: center;">${index + 1}</td>
        <td>
          ${item.WARD_NO && item.BLOCK_NO ? `<strong>W/B:</strong> ${item.WARD_NO}-${item.BLOCK_NO}<br>` : ''}
          ${item.SURVEY_NO ? `<strong>Survey No:</strong> ${item.SURVEY_NO}<br>` : ''}
          ${item.NEW_HOUSE_NO ? `<strong>House:</strong> ${item.NEW_HOUSE_NO}<br>` : ''}
          ${item.EXTENT ? `<strong>Extent:</strong> ${item.EXTENT} ${item.UNIT || ''}<br>` : ''}
          ${item.EAST || item.WEST || item.NORTH || item.SOUTH ? '<strong>Boundaries:</strong><br>' : ''}
          ${item.EAST ? `[E] ${item.EAST}<br>` : ''}
          ${item.WEST ? `[W] ${item.WEST}<br>` : ''}
          ${item.NORTH ? `[N] ${item.NORTH}<br>` : ''}
          ${item.SOUTH ? `[S] ${item.SOUTH}<br>` : ''}
        </td>
        <td>
          ${[item.SR_NAME + ' ' + `(${item.SR_CODE})`, item.DOCT_NO, item.REG_YEAR, item.SCHEDULE_NO, `(${reqData.SR_CODE}-${reqData.BOOK_NO}-${reqData.DOCT_NO}-${reqData.REG_YEAR})`]
            .filter(val => val)
            .join(',<br>')}
        </td>
        <td>
          ${[
            item.TRAN_DESC ? `<strong>${item.TRAN_DESC} (${item.TRAN_MAJ_CODE + item.TRAN_MIN_CODE})</strong>` : '',
            item.FINAL_TAXABLE_VALUE ? `₹${item.FINAL_TAXABLE_VALUE}` : '',
            item.REG_DATE ? `Reg Date: ${item.REG_DATE}` : ''
          ].filter(val => val).join('<br>')}
        </td>
        <td style="line-height: 1;">
         ${item.NAMES.join('<br><br>')}
        </td>
        <td style="line-height: 1;">${item.ADDRESSES.join('<br><br>')}</td>
      </tr>
    `).join('')}
  </tbody>
</table>

<p>Regards,<br>IGRS Support.<br>Registrations and Stamps Department.<br>Tadepalli, Andhra Pradesh.</p>`,
        };

        const mail = await transportEmail.sendMail(mailOptions);
        console.log("MAIL Sent Successfully:", mail);
        identify = { loginEmail: process.env.SMTP_EMAIL };
        reqData.otpFrom = "EMAIL";
        reqData.Purpose = "Mutation success";
        reqData.TStamp = new Date().toISOString();
        reqData.Status = true;
        fResult.uQuery = reqData;
        fResult.identify= identify;
        return fResult;
    } catch (ex) {
        console.error("AutoMutationServices - MutationStatusMailsrvc || Error :", ex);
        throw new Error(ex);
    }
}
Mutationerrorstoresrvc = async (reqData, isSubdiverror) => {
    try {
		let bindParams ={
			SR_CODE:reqData.srCode,
			DOCT_NO: reqData.docNo,
			REG_YEAR : reqData.regYear,
			BOOK_NO : reqData.bookNo,
			MUTATION_ERROR_LOG: reqData.mutation_error_log,
			MUTATION_STATUS: reqData.mutation_status,
			SCHEDULE_NO :reqData.SCHEDULE_NO,
			MUTATION_VALUE: reqData.MUTATION_VALUE,
			PROPERTY_TYPE : reqData.PROPERTY_TYPE
		}	
		let TableName ;
		if(isSubdiverror==true){
			TableName='srouser.Mutation_status_record_log'
		}	
		else{
			TableName='srouser.Mutation_status_record'
		}
		let Query =`INSERT INTO ${TableName} (
    SR_CODE,
    BOOK_NO,
    DOCT_NO,
    REG_YEAR,
    MUTATION_ERROR_LOG,
    MUTATION_STATUS,
    SCHEDULE_NO,
    PROPERTY_TYPE,
    MUTATION_VALUE,
	REQ_BODY,
	RESPONSE
) 
VALUES (
    :SR_CODE,
    :BOOK_NO,
    :DOCT_NO,
    :REG_YEAR,
    :MUTATION_ERROR_LOG,
    :MUTATION_STATUS,
    :SCHEDULE_NO,
    :PROPERTY_TYPE,
    :MUTATION_VALUE,
	:blobdata,
	:blobData2
)`;

let REQ_BODY = Buffer.from(reqData.REQ_BODY, 'utf8');
let RESPONSE = Buffer.from(reqData.RESPONSE, 'utf8');
		let Response= await this.orDao.oDbInsertBlobDocsWithBindParams(Query, bindParams, REQ_BODY,RESPONSE );		
		return Response;
    } catch (ex) {
        console.error("AutoMutationServices - MutationStatusMailsrvc || Error :", ex);
        throw new Error(ex);
    }
}

Mutationcountsrvc = async (reqData) => {
    try {
		let bindParams ={
			SR_CODE:reqData.srCode			
		}		
		let Query = `SELECT COUNT(*) AS MUTATION_COUNT FROM PDE_DOC_STATUS_CR p
                   WHERE p.SR_CODE = :SR_CODE AND p.DOC_MUTATION = 'N' AND p.DOC_URBAN_MUTATION = 'N' AND p.DOC_ESIGN = 'Y' AND p.DOC_SUBDIV = 'Y' AND p.DOC_BUNDLE = 'Y'
                   AND EXISTS ( SELECT 1 FROM TRAN_MAJOR tm
                   WHERE tm.SR_CODE = p.SR_CODE AND tm.DOCT_NO = p.DOCT_NO AND tm.REG_YEAR = p.REG_YEAR AND tm.BOOK_NO = p.BOOK_NO
                   AND (
                   (tm.TRAN_MAJ_CODE = '01' AND tm.TRAN_MIN_CODE IN ('01','05','06','08','14','15','16','19','20','22','26'))
                   OR (tm.TRAN_MAJ_CODE = '03' AND tm.TRAN_MIN_CODE IN ('01','02','03','04','07','08','09'))
				   OR (tm.TRAN_MAJ_CODE = '04' AND tm.TRAN_MIN_CODE IN ('01','02'))))
                   AND NOT EXISTS (
                   SELECT 1 FROM srouser.MUTATION_STATUS_RECORD msr
                   WHERE msr.SR_CODE = p.SR_CODE AND msr.DOCT_NO = p.DOCT_NO AND msr.REG_YEAR = p.REG_YEAR AND msr.BOOK_NO = p.BOOK_NO)`;
			if(reqData.mutated == 1){
				Query = ` SELECT DISTINCT DOCT_NO,REG_YEAR,BOOK_NO,SR_CODE FROM srouser.MUTATION_STATUS_RECORD 
                   WHERE SR_CODE = :SR_CODE `
			}
		let Response= await this.orDao.oDBQueryServiceWithBindParams(Query, bindParams);
		return Response;
    } catch (ex) {
        console.error("AutoMutationServices - Mutationcountsrvc || Error :", ex);
        throw new Error(ex);
    }
}
	SubDivErrorSrvc = async (reqData, flag = false) => {
		try {
			let query = `INSERT INTO SROUSER.SUBDIV_STATUS_RECORD (
                         SR_CODE, DOCT_NO, REG_YEAR, SCHEDULE_NO, WEBLAND_TRAN_ID, VILLAGE_CODE,
                         SURVEY_NO, SUB_DIV_SURVEY, JOINT_PATTA, KATA_NO, SRO_PID, ERROR_LOG, REQ_DATA, RESPONSE
                        ) VALUES (
                        :sr_code, :doct_no, :reg_year, :schedule_no, :webland_tran_id, :village_code,
                        :survey_no, :sub_div_survey, :joint_patta, :kata_no, :sro_pid, :error_log, :blobdata, :blobData2 )`;

			let bindParams = {
				sr_code: reqData.SR_CODE,
				doct_no: reqData.DOCT_NO,
				reg_year: reqData.REG_YEAR,
				schedule_no: reqData.SCHEDULE_NO,
				webland_tran_id: reqData.WEBLAND_TRAN_ID,
				village_code: reqData.VILLAGE_CODE,
				survey_no: reqData.SURVEY_NO,
				sub_div_survey: reqData.SUB_DIV_SURVEY,
				joint_patta: reqData.JOINT_PATTA,
				kata_no: reqData.KATA_NO,
				sro_pid: reqData.SRO_PID,
				error_log: reqData.subDiv_error_log
			};

			let errorResponse = await this.orDao.oDbInsertBlobDocsWithBindParams(query,bindParams, reqData.REQ_BODY,reqData.RESPONSE );
			return errorResponse;

		} catch (ex) {
			Logger.error("AutoMutationServices - SubDivErrorSrvc || Error : ", ex);
			console.log("AutoMutationServices - SubDivErrorSrvc || Error : ", ex);
			throw new Error(ex);
		}
	}

	  getRuralDocumentsSrvc = async (reqData) => {
        try{
            let query = `select * from pde_doc_status_cr pde
                        left join tran_sched ts on ts.sr_code = pde.sr_code and
                                            ts.doct_no = pde.doct_no and
                                            ts.reg_year = pde.reg_year and
                                            ts.book_no = pde.book_no
                        join tran_major tm on tm.sr_code = pde.sr_code and
                                            tm.doct_no = pde.doct_no and
                                            tm.reg_year = pde.reg_year and
                                            tm.book_no = pde.book_no
                        left join adangal_details ad on ad.sr_code = ts.sr_code and
                                            ad.doct_no = ts.doct_no and
                                            ad.reg_year = ts.reg_year and
                                            ad.book_no = ts.book_no and ts.schedule_no = ad.schedule_no
                where pde.sr_code = :SR_CODE and pde.doct_no = :DOCT_NO and pde.reg_year = :REG_YEAR and pde.book_no = :BOOK_NO`;
            const bindparms = {
                SR_CODE : reqData.SR_CODE,
                BOOK_NO : reqData.BOOK_NO,
                DOCT_NO : reqData.DOCT_NO,
                REG_YEAR : reqData.REG_YEAR
            }
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            if(!response || !response.length) {
                throw new Error("No data found.");
            }
            if(!await this.isMutationNeeded({docDetails : response})){
				await this.orDao.oDbInsertDocsWithBindParams(`UPDATE SROUSER.pde_doc_status_cr set doc_mutation = 'Y', doc_subdiv = 'Y' where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR`, bindparms);
                throw new Error("Mutation is not needed for this document.");
            }
            let lpmSchedules = response.filter(s => s.LP_NO);
            let filteredSchedules = response.filter(s => !s.LP_NO);
            let AdangalSchedules = filteredSchedules.filter(f => f.S_LP_NO && CODES.AGRI_NATURE.includes(`${f.NATURE_USE}`));
			const notionalSchedules = AdangalSchedules.filter((item) => Number(item.KHATA_NO) > 20000000 || (Number(item.KHATA_NO) > 300001 && Number(item.KHATA_NO) < 399999));
			if(notionalSchedules.length && notionalSchedules.length == (AdangalSchedules.length + lpmSchedules.length)) {
				if(notionalSchedules.length && notionalSchedules[0].DOC_MUTATION === 'N'){
					await this.handleMovetoScan(bindparms);
				}
				throw new Error("Mutation is not needed for this document.");
			}
            if(AdangalSchedules.length || lpmSchedules.length){
                return {AdangalSchedules : AdangalSchedules,lpmSchedules : lpmSchedules}
            } else {
                throw new Error("No rural schedules found in the document.");
            }
        }catch(ex){
            Logger.error("AutoMutationServices - getRuralDocumentsSrvc || Error :", ex);
            console.error("AutoMutationServices - getRuralDocumentsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

	handleMovetoScan = async (bindparam) => {
		try {
			let result = [];
			const documentData = await this.orDao.oDBQueryServiceWithBindParams(`SELECT * FROM SROUSER.PDE_DOC_STATUS_CR WHERE SR_CODE = :SR_CODE AND BOOK_NO = :BOOK_NO AND REG_YEAR = :REG_YEAR AND DOCT_NO = :DOCT_NO`, bindparam);    
			if(!documentData || !documentData.length) {
				throw new Error("No data found.");
			}           
			let queries = [
				{
					query : `UPDATE srouser.pde_doc_status_cr SET doc_mutation = 'Y', doc_subdiv = 'Y' WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND reg_year = :REG_YEAR AND doct_no = :DOCT_NO`,
					bindParams : bindparam
				},
				{
					query : `insert into srouser.adangal_details_del_log select a.*, sysdate from adangal_details a WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND reg_year = :REG_YEAR AND doct_no = :DOCT_NO`,
					bindParams : bindparam
				},
				{
					query : `delete from adangal_details WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND reg_year = :REG_YEAR AND doct_no = :DOCT_NO`,
					bindParams : bindparam
				}
			];
			if(documentData[0].DOC_MUTATION === 'N'){
				result = await this.orDao.oDbMultipleInsertDocsWithBindParams(queries);
			}		
			if(result.reduce((acc, r) => acc + r, 0) > 0 || (documentData.length && documentData[0].DOC_MUTATION === 'Y')) {
				return {status : true, message: "No Mutation needed. Status Changed Successfully"};
			}
			else {
				return {status : false, message : "Status Changed Failed"}
			}
    	} catch (ex) {
			Logger.error("AutoMutationServices - handleMovetoScan || Error :", ex);
			console.error("AutoMutationServices - handleMovetoScan || Error :", ex);
			throw constructCARDError(ex);	
		}
	}

	handleOCIDocumentsMovedtoScan = async (bindparam) => {
		try {
			let result = [];
			const documentData = await this.orDao.oDBQueryServiceWithBindParams(`SELECT * FROM SROUSER.PDE_DOC_STATUS_CR WHERE SR_CODE = :SR_CODE AND BOOK_NO = :BOOK_NO AND REG_YEAR = :REG_YEAR AND DOCT_NO = :DOCT_NO`, bindparam);    
			if(!documentData || !documentData.length) {
				throw new Error("No data found.");
			}           
			let queries = [
				{
					query : `insert into srouser.adangal_details_del_log select a.*, sysdate from adangal_details a WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND reg_year = :REG_YEAR AND doct_no = :DOCT_NO`,
					bindParams : bindparam
				},
				{
					query : `delete from adangal_details WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND reg_year = :REG_YEAR AND doct_no = :DOCT_NO`,
					bindParams : bindparam
				}
			];
			if(documentData[0].DOC_MUTATION === 'N'){
				result = await this.orDao.oDbMultipleInsertDocsWithBindParams(queries);
			}		
			if(result.reduce((acc, r) => acc + r, 0) > 0 || (documentData.length && documentData[0].DOC_MUTATION === 'Y')) {
				return {status : true, message: "No Mutation needed. Status Changed Successfully"};
			}
			else {
				return {status : false, message : "Status Changed Failed"}
			}
    	} catch (ex) {
			Logger.error("AutoMutationServices - handleOCIDocumentsMovedtoScan || Error :", ex);
			console.error("AutoMutationServices - handleOCIDocumentsMovedtoScan || Error :", ex);
			throw constructCARDError(ex);	
		}
	}
	
}


module.exports = AutoMutationServices;
