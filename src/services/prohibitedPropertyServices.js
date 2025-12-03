const {doRelease,dbConfig} = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const path = require('path');
const fsone = require('fs');
const https = require('https');
const fs = require('fs').promises;
const axios = require('axios')


const puppeteer = require('puppeteer');
const { encryptWithAESPassPhrase } = require('../utils');
const Esign = require('../services/esignService')
const { PDFDocument, rgb } = require('pdf-lib');
const coordinates=require('../services/refuseServices');
const moment = require('moment');






const convertBase64ToPdf = async (base64String) => {
	const decodedBuffer = Buffer.from(base64String, 'base64');
	const pdfDoc = await PDFDocument.load(decodedBuffer);
	return pdfDoc.save();
  }
  const savePdfToFile = async (pdfBytes, filePath) => {
	await fs.writeFile(filePath, pdfBytes);
	console.log(`PDF saved to ${filePath}`);
	return true;
  }

class ProhibitedPropertyServices {
	constructor(){
		this.orDao = new OrDao();
		this.esign = new Esign();
		this.	coordinates=new coordinates()

	}
	getListVillagesRSrvc = async(reqData) => {
		
		try{
			let query = `SELECT a.* , (select village_name  from hab_code b where b.hab_code=a.village_Code||'01') villname from juri_ag a where sro_Code=${reqData.srCode}`;
            let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("ProhibitedPropertyServices - getListVillagesRSrvc || Error :", ex);
			console.error("ProhibitedPropertyServices - getListVillagesRSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
    getListVillagesUSrvc = async(reqData) => {
		
		try{
			let query = `select a.* , (select village_name  from hab_code b where b.hab_code=a.village_Code||'01') villname from juri_HU a where sro_Code=${reqData.srCode}`;
			let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("ProhibitedPropertyServices - getListVillagesUSrvc || Error :", ex);
			console.error("ProhibitedPropertyServices - getListVillagesUSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getListofRolesSrvc = async(reqData) => {
		try{
			let query = `select * from card.jobs_cr`;
            let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("ProhibitedPropertyServices - getListofRolesSrvc || Error :", ex);
			console.error("ProhibitedPropertyServices - getListofRolesSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getPPCodeSrvc = async() => {
		
		try{
			let query = `SELECT * From  card.prob_class`;
            let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("ProhibitedPropertyServices - getPPCodeSrvc || Error :", ex);
			console.error("ProhibitedPropertyServices - getPPCodeSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	getPPSectionSrvc = async() => {
		
		try{
			let query = `SELECT * From card.prob_class_codes`;
            let response = await this.orDao.oDBQueryService(query);
			return response;
		}catch(ex){
			Logger.error("ProhibitedPropertyServices - getPPSectionSrvc || Error :", ex);
			console.error("ProhibitedPropertyServices - getPPSectionSrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	} 
	getDenotifySrvc = async(reqData,reqParams) => {	
		try{
			let Query;
			if(reqParams.type == "urban"){
			Query = `SELECT rowid,a.*,(select  class_desc from card.prob_class where  class_code=prohib_cd ) probdesc From prohb_hu a where sro_code=${reqData.srCode} and village_code='${reqData.villageCode}'`;
		}else if (reqParams.type == "rural"){
			Query = `SELECT rowid,a.*,(select  class_desc from card.prob_class where  class_code=prohib_cd ) probdesc From prohb_ag a where sro_code=${reqData.srCode} and village_code='${reqData.villageCode}'`;
		}
		let response = await this.orDao.oDBQueryService(Query);
		return response;
		}catch(ex){
			Logger.error("ProhibitedPropertyServices - getDenotifySrvc || Error :", ex);
			console.error("ProhibitedPropertyServices - getDenotifySrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	saveNotifySrvc12 = async (reqData,reqParams) => {

		try {
            let Query, response;
			for(let i of reqData){
				if(reqParams.type == "urban" ){
                    Query = `Insert into prohb_hu (SRO_CODE,VILLAGE_CODE,WARD_NO,BLOCK_NO,DOOR_NO,SURVEY_NO,SUB_SURVEY_NO,PLOT_NO,EXTENT,UNIT,PROHIB_CD,NOTI_GAZ_NO,NOTI_GAZ_DT,OTH_REF,DENOTI_GAZ_NO,DENOTI_GAZ_DT,H_NAME,ENTRY_DATE,SHIFTING_DATE,REV_SUB_SURVEY_NO,REV_SURVEY_NO,LOCAL_BODY_CODE,LOCAL_BODY_NAME,HAB_CODE,TOWN_SURVEY_NO,T_WARD_NO,T_BLOCK_NO,NOTIFY_IP,USER_NAME,TIME_STAMP,PP_TYPE,PP_CODE) select ${i.SR_CODE},'${i.VILLAGE_CODE}',${i.WARD_NO},${i.BLOCK_NO},'${i.DOOR_NO}',${i.SURVEY_NO},'${i.SUB_SURVEY_NO}','${i.PLOT_NO}',${i.EXTENT},'${i.UNIT}',${i.PROHIB_CD},'${i.NOTI_GAZ_NO}',TO_DATE('${i.NOTI_GAZ_DT}','DD-MM-YYYY'),'${i.OTH_REF}',${i.DENOTI_GAZ_NO},${i.DENOTI_GAZ_DT},'${i.H_NAME}',${i.ENTRY_DATE},${i.SHIFTING_DATE},COALESCE('${i.REV_SUB_SURVEY_NO}', '/'),'${i.REV_SURVEY_NO}',${i.LOCAL_BODY_CODE},${i.LOCAL_BODY_NAME},${i.HAB_CODE},${i.TOWN_SURVEY_NO},${i.T_WARD_NO},${i.T_BLOCK_NO},${i.NOTIFY_IP},'${i.USER_NAME}',SYSDATE,'${i.PP_TYPE}','${i.PP_CODE}'   FROM dual
					WHERE NOT EXISTS (SELECT 1 FROM prohb_hu WHERE WARD_NO = ${i.WARD_NO} AND BLOCK_NO = ${i.BLOCK_NO} AND DOOR_NO = '${i.DOOR_NO}' AND REV_SURVEY_NO = ${i.REV_SURVEY_NO}   AND COALESCE(REV_SUB_SURVEY_NO, '/') = COALESCE('${i.REV_SUB_SURVEY_NO}', '/') 
					AND SRO_CODE=${i.SR_CODE} AND VILLAGE_CODE='${i.VILLAGE_CODE}')`;

				} else if (reqParams.type === "rural") {
                     Query = `Insert into prohb_ag (SRO_CODE,VILLAGE_CODE,SURVEY_NO,SUB_SURVEY_NO,PLOT_NO,EXTENT,UNIT,PROHIB_CD,NOTI_GAZ_NO,NOTI_GAZ_DT,OTH_REF,DENOTI_GAZ_NO,DENOTI_GAZ_DT,H_NAME,ENTRY_DATE,SHIFTING_DATE,TIME_STAMP,NOTIFY_IP,USER_NAME,PP_TYPE,PP_CODE) select ${i.SR_CODE},'${i.VILLAGE_CODE}',${i.SURVEY_NO},'${i.SUB_SURVEY_NO}','${i.PLOT_NO}',${i.EXTENT},SUBSTR('${i.UNIT}', 1, 1),${i.PROHIB_CD},'${i.NOTI_GAZ_NO}',TO_DATE('${i.NOTI_GAZ_DT}','DD-MM-YYYY'),'${i.OTH_REF}',${i.DENOTI_GAZ_DT},${i.DENOTI_GAZ_NO},'${i.H_NAME}',TO_DATE('${i.ENTRY_DATE}','DD-MM-YYYY'),${i.SHIFTING_DATE},SYSDATE,${i.NOTIFY_IP},'${i.USER_NAME}','${i.PP_TYPE}','${i.PP_CODE}' FROM dual
					 WHERE NOT EXISTS (SELECT 1 FROM prohb_ag WHERE SURVEY_NO = ${i.SURVEY_NO} AND SUB_SURVEY_NO = '${i.SUB_SURVEY_NO}' AND SRO_CODE=${i.SR_CODE} AND VILLAGE_CODE='${i.VILLAGE_CODE}')`;
	 
                    }console.log(Query);
                                    response = await this.orDao.oDbInsertDocs(Query);
			}

                return response;
					
		} catch (ex) {
		Logger.error("ProhibitedPropertyServices - saveNotifySrvc || Error :", ex);
		console.error("ProhibitedPropertyServices - saveNotifySrvc || Error :", ex);
		throw constructCARDError(ex);
		}
	}

	generatePDFFromHTML = async (html, filename, result) => {
		const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
		const page = await browser.newPage();
	
	
		await page.setContent(html);
	
		await page.pdf({
		  path: filename,
		  format: 'A4',
		  margin: {
			top: '20px',
			right: '10px',
			bottom: '15px',
			left: '10px',
		  },
		});
	
		await browser.close();
	  }

	generatePDFFromHTMLD = async (html, filename, result) => {
		const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
		const page = await browser.newPage();
	
	
		await page.setContent(html);
	
		await page.pdf({
		  path: filename,
		  format: 'A4',
		  landscape: true,
		  margin: {
			top: '20px',
			right: '10px',
			bottom: '15px',
			left: '10px',
		  },
		});
	
		await browser.close();
	  }

	  generateDocumentId = (sroCode) => {

		let pri = 'NP';
		let yr = new Date().getFullYear();
		yr = String(yr).substring(2, 4)
		if (String(sroCode).length === 3) {
			let srCode = "0" + String(sroCode);
			return pri + yr + "" + srCode + "" + Math.round(+new Date() / 1000)
		} else {
			return pri + yr + "" + sroCode + "" + Math.round(+new Date() / 1000)
		}
		// return "AP20221668621420609";
	}


	generateDocumentDenotifyId = (sroCode) => {

		let pri = 'DP';
		let yr = new Date().getFullYear();
		yr = String(yr).substring(2, 4)
		if (String(sroCode).length === 3) {
			let srCode = "0" + String(sroCode);
			return pri + yr + "" + srCode + "" + Math.round(+new Date() / 1000)
		} else {
			return pri + yr + "" + sroCode + "" + Math.round(+new Date() / 1000)
		}
		// return "AP20221668621420609";
	}
	
	saveDenotifySrvc1 = async (reqData,reqParams) => {
		try {
			console.log(reqData,reqParams,'1234567');			
			if (reqData.ROWID) {
				let deleteQuery, insertQuery;
				if (reqParams.type == 'urban') {
				  deleteQuery = `DELETE From prohb_hu where rowid='${reqData.ROWID}'`;
				  insertQuery = `Insert into sromstr.prohb_hu_denotify (SRO_CODE,VILLAGE_CODE,WARD_NO,BI_WARD_NO,BLOCK_NO,BI_BLOCK_NO,DOOR_NO,SURVEY_NO,SUB_SURVEY_NO,PLOT_NO,EXTENT,UNIT,PROHIB_CD,NOTI_GAZ_NO,NOTI_GAZ_DT,OTH_REF,DENOTIFY_DATE,DENOTIFY_NUM,H_NAME,ENTRY_DATE,DEL_DATE,SHIFTING_DATE,REV_SURVEY_NO,REV_SUB_SURVEY_NO,LOCAL_BODY_CODE,LOCAL_BODY_NAME,HAB_CODE,TOWN_SURVEY_NO,T_WARD_NO,T_BLOCK_NO,DENOTIFY_IP,USER_NAME) values (${reqData.SR_CODE},'${reqData.VILLAGE_CODE}',${reqData.WARD_NO},'${reqData.BI_WARD_NO}',${reqData.BLOCK_NO},'${reqData.BI_BLOCK_NO}','${reqData.DOOR_NO}',${reqData.SURVEY_NO},'${reqData.SUB_SURVEY_NO}',${reqData.PLOT_NO},${reqData.EXTENT},'${reqData.UNIT}',${reqData.PROHIB_CD},'${reqData.NOTI_GAZ_NO}',TO_DATE('${reqData.NOTI_GAZ_DT}','DD-MM-YYYY'),'${reqData.OTH_REF}',TO_DATE('${reqData.DENOTIFY_DATE}','DD-MM-YYYY'),'${reqData.DENOTIFY_NUM}',${reqData.H_NAME},${reqData.ENTRY_DATE},TO_DATE('${reqData.DEL_DATE}','DD-MM-YYYY'),${reqData.SHIFTING_DATE},'${reqData.REV_SURVEY_NO}','${reqData.REV_SUB_SURVEY_NO}',${reqData.LOCAL_BODY_CODE},${reqData.LOCAL_BODY_NAME},${reqData.HAB_CODE},${reqData.TOWN_SURVEY_NO},${reqData.T_WARD_NO},${reqData.T_BLOCK_NO},${reqData.DENOTIFY_IP},'${reqData.USER_NAME}')`;
				} else if (reqParams.type == 'rural') {
				  deleteQuery = `DELETE From prohb_ag where rowid='${reqData.ROWID}'`;
				  insertQuery = `Insert into sromstr.prohb_ag_denotify (SRO_CODE,VILLAGE_CODE,SURVEY_NO,SUB_SURVEY_NO,PLOT_NO,EXTENT,UNIT,PROHIB_CD,NOTI_GAZ_NO,NOTI_GAZ_DT,OTH_REF,H_NAME,DENOTIFY_DATE,DENOTIFY_NUM,ENTRY_DATE,DEL_DATE,SHIFTING_DATE,DENOTIFY_IP,USER_NAME) values (${reqData.SR_CODE},'${reqData.VILLAGE_CODE}',${reqData.SURVEY_NO},'${reqData.SUB_SURVEY_NO}',${reqData.PLOT_NO},${reqData.EXTENT},'${reqData.UNIT}',${reqData.PROHIB_CD},'${reqData.NOTI_GAZ_NO}',${reqData.NOTI_GAZ_DT},'${reqData.OTH_REF}',${reqData.H_NAME},TO_DATE('${reqData.DENOTIFY_DATE}','DD-MM-YYYY'),'${reqData.DENOTIFY_NUM}',${reqData.ENTRY_DATE},TO_DATE('${reqData.DEL_DATE}','DD-MM-YYYY'),${reqData.SHIFTING_DATE},${reqData.DENOTIFY_IP},'${reqData.USER_NAME}')`;
				}
				console.log(deleteQuery,'1234');
				console.log(insertQuery,'1234');
				const deleteResult = await this.orDao.oDbDelete(deleteQuery);
				const insertResult= await this.orDao.oDbInsertDocs(insertQuery);
				console.log(insertResult)
			}
		} catch (ex) {
			Logger.error("ProhibitedPropertyServices - saveDenotifySrvc || Error :", ex);
			console.error("ProhibitedPropertyServices - saveDenotifySrvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	findSignCoordinates = async (pdfBuffer) => {
		try {
		  const pdfDoc = await PDFDocument.load(pdfBuffer);
	  
		  const textContent = await pdfDoc.getTextContent(); // Get text content from the PDF
		  const textLines = textContent.items.map(item => item.str); // Extract text lines
	  
		  const sroSignIndex = textLines.findIndex(line => line.includes("eSign"));
	  
		  if (sroSignIndex !== -1) {
			const sroSignCoordinates = textLines[sroSignIndex];
			return { sroSignCoordinates };
		  } else {
			console.log('"SRO Sign" not found in the text content.');
			return null;
		  }
		} catch (error) {
		  console.error('Error in findSignCoordinates:', error);
		  throw error;
		}
	  };



	  

	
	  saveNotifySrvc = async (reqBody, reqParams,res) => {
		console.log('inside');
		for (let i of reqBody) {
		let query;
		try {
			
			if (reqParams.type.toLowerCase() === "urban") {
				query = `
				 SELECT * FROM prohb_hu WHERE WARD_NO = ${i.WARD_NO} AND BLOCK_NO = ${i.BLOCK_NO} AND DOOR_NO = '${i.DOOR_NO}' AND REV_SURVEY_NO = ${i.REV_SURVEY_NO}   AND COALESCE(REV_SUB_SURVEY_NO, '/') = COALESCE('${i.REV_SUB_SURVEY_NO}', '/')
				  AND SRO_CODE=${i.SR_CODE} AND VILLAGE_CODE='${i.VILLAGE_CODE}'`;
			  } else if (reqParams.type.toLowerCase() === "rural") {
				query = `
					SELECT * FROM prohb_ag 
         WHERE SURVEY_NO = ${i.SURVEY_NO} 
           AND (${i.SUB_SURVEY_NO ? `SUB_SURVEY_NO = '${i.SUB_SURVEY_NO}'` : '1=1'})
           AND SRO_CODE = ${i.SR_CODE} 
           AND VILLAGE_CODE = '${i.VILLAGE_CODE}'
				  `;
			  }
			  console.log(query);
			  const response = await this.orDao.oDBQueryService(query);
			  console.log(response,'123');
			  
			  const ppTypeCheck = reqBody.some(item => item.PP_TYPE === 'P');

			  if (ppTypeCheck && response.length === 0)
			  {

		  if (reqBody[0].SR_CODE) {
			const querysro = `
			  SELECT aadhar,EMPL_ID, empl_name AS name,DESIGNATION,SR_CODE, 
					 (SELECT sr_name FROM sr_master WHERE sr_cd = ${reqBody[0].DR_CD?reqBody[0].DR_CD:reqBody[0].SR_CODE}) AS sr_name 
			  FROM employee_login_master 
			  WHERE sr_code = ${reqBody[0].DR_CD?reqBody[0].DR_CD:reqBody[0].SR_CODE} AND empl_id = '${reqBody[0].EMPL_ID}'`;
			
			let bindParams = {};
			let result1 = await this.orDao.oDBQueryServiceWithBindParams(querysro, bindParams);
			console.log(result1,'list');
			
			console.log(querysro);

			const villagequery = `select *from hab_code where hab_code='${reqBody[0].VILLAGE_CODE}01'`;
			let result2 = await this.orDao.oDBQueryServiceWithBindParams(villagequery, bindParams);
	  
			let date = new Date();

			let day = String(date.getDate()).padStart(2, '0');
			let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed in JavaScript
			let year = date.getFullYear();

			let formattedDate = `${day}/${month}/${year}`;
	  
			let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
			let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
			let documentId = this.generateDocumentId(reqBody[0].SR_CODE);
	  
			let html;
			const commonHtml = `
			  <div style="text-align: center; margin:20px; margin-top:0">
				<img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
				<h3 style="margin:0px; margin-top : 5px">REGISTRATIONS AND STAMPS DEPARTMENT</h3>
				<h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH</h5>
				<div style="text-align: end;"><span style="font-weight: 600;">ReportID- </span>${documentId}</div>
				<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
				  <thead>
					<tr>
					  <th colspan=${reqParams.type === 'rural' ? '14' : '22'}  style="border: 1px solid #000; padding: 10px; font-size :16px;">Notified Prohibited Property Report - ${result1[0].SR_NAME}(${reqBody[0].SR_CODE})-Village Name: ${result2[0].VILLAGE_NAME}(${reqBody[0].VILLAGE_CODE})</th>
					</tr>
					<tr style="font-size :14px;">
					 `;
	  
			const urbanSpecificHtml = `
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">S.No.</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Ward No</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Bi Ward No</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Block No</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Bi Block No</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Door No.</th>
					<th style="border: 1px solid #000; width: 20%; padding: 10px;">Apartment Name</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Flat No</th>
					 <th style="border: 1px solid #000; width: 20%; padding: 10px;">Plot No</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Revenue Survey No</th>
					   <th style="border: 1px solid #000; width: 15%; padding: 10px;">Revenue Sub Survey No</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Extent</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Unit</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">House No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Name</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Code</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Section</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Gazette No</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Date</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Reference</th>
					    <th style="border: 1px solid #000; width: 20%; padding: 10px;">Holder Name</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Type</th>
					</tr>
				  </thead>
				  <tbody>
					${reqBody.map((item,index) => `
					<tr>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${index + 1 }</td>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.WARD_NO}</td>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BI_WARD_NO}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BLOCK_NO}</td>
					  <td style="text-align: center;  vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BI_BLOCK_NO}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.DOOR_NO}</td>
					 <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.APT_NAME}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.FLAT_NO}</td>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PLOT_NO}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.REV_SURVEY_NO}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.REV_SUB_SURVEY_NO}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.EXTENT}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.UNIT}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.WARD_NO}${item.BI_WARD_NO ? "/" + item.BI_WARD_NO : ""}-${item.BLOCK_NO}${item.BI_BLOCK_NO ? "/" + item.BI_BLOCK_NO : ""}-${item.DOOR_NO}</td>
					   <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.CLASS_DESC}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PROHIB_CD}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_CODE}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_DT}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.OTH_REF}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.H_NAME}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_TYPE ? item.PP_TYPE == "P" ? "Permanent" : "Temporary" : '-'}</td>

					</tr>`).join('')}
				  </tbody>
				</table>
			  </div>`;
	  
			const ruralSpecificHtml = `
			          <th style="border: 1px solid #000; width: 20%; padding: 10px;">S.No.</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Survey No</th>
					   <th style="border: 1px solid #000; width: 15%; padding: 10px;">Sub Survey No</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Plot No</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Extent</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Unit</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Name</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Code</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Section</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Holder Name</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Gazette No</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Date</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Reference</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Type</th>


					</tr>
				  </thead>
				  <tbody>
					${reqBody.map((item,index) => `
					<tr>
						<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${index + 1}</td>
					      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.SURVEY_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.SUB_SURVEY_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PLOT_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.EXTENT}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.UNIT}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.CLASS_DESC}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PROHIB_CD}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_CODE}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.H_NAME}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_DT}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.OTH_REF}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_TYPE ? item.PP_TYPE == "P" ? "Permanent" : "Temporary" : '-'}</td>
						

					</tr>`).join('')}
				  </tbody>
				</table>
			  </div>`;
	  
			const footerHtml = `
			  <div style="margin-top:20px; margin-right:20px; margin-left:20px;">
				<p style="margin-top: 85px; margin-bottom: 0;text-align:justify;">
				  <span style="font-weight: 600">Date:</span> ${formattedDate} 
				  <span style="margin-left: ${reqParams.type === 'rural' ? '480px' : '850px'}; font-weight: 600;">Notified officer eSign (${result1[0].DESIGNATION}).</span>
				</p> 
			  </div>`;
	  
			html = commonHtml + (reqParams.type === "urban" ? urbanSpecificHtml : ruralSpecificHtml) + footerHtml;
	  
			const NotifyPropertyFolder = 'Notify_Property_Report';
			// const srcodeFolder = `../../${NotifyPropertyFolder}/${reqBody[0].SR_CODE}`;
			
			// if (!fsone.existsSync(NotifyPropertyFolder)) {
			//   fsone.mkdirSync(NotifyPropertyFolder);
			// }
			// if (!fsone.existsSync(srcodeFolder)) {
			//   fsone.mkdirSync(srcodeFolder);
			// }
	  
			// const filename = `document_${documentId}-${reqBody[0].SR_CODE}.pdf`;
			// const filepath = `${srcodeFolder}/${filename}`;
			let NotifyDirectory = path.join(__dirname, `../../../../../pdfs/`);
            // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
            if (!fsone.existsSync(NotifyDirectory)) {
                fsone.mkdirSync(NotifyDirectory, { recursive: true });
            }
            NotifyDirectory = `${NotifyDirectory}/uploads/`;
            if (!fsone.existsSync(NotifyDirectory)) {
                fsone.mkdirSync(NotifyDirectory, { recursive: true });
            }
            NotifyDirectory = `${NotifyDirectory}${NotifyPropertyFolder}/`;
            if (!fsone.existsSync(NotifyDirectory)) {
                fsone.mkdirSync(NotifyDirectory, { recursive: true });
            }
            NotifyDirectory = `${NotifyDirectory}${reqBody[0].SR_CODE}/`;
            if (!fsone.existsSync(NotifyDirectory)) {
                fsone.mkdirSync(NotifyDirectory, { recursive: true });
            }
            const filepath = `${NotifyDirectory}document_${documentId}-${reqBody[0].SR_CODE}.pdf`;
			console.log(filepath,'notify filepath');
			
			
			await this.generatePDFFromHTMLD(html, filepath, reqBody);
			const pdfBuffer = await fsone.promises.readFile(filepath);
			let roundedPosition;
	  
			// let buuferresult = this.findSignCoordinates(pdfBuffer);

			const textWithPositions = await this.coordinates.extractTextWithPositionsFromPDF(filepath);
            const searchText = "eSign";
            const signaturePosition = textWithPositions.find(item => item.text.includes(searchText));
        console.log(signaturePosition,'signa');
		
            if (signaturePosition) {
               roundedPosition = {
                x: Math.round(signaturePosition.position.x),
                y: Math.round(signaturePosition.position.y),
                pageNo: signaturePosition.page
            };
		}
		console.log(roundedPosition, 'ooooooooooooooooo');
		
			const base64Data = pdfBuffer.toString("base64");
			const eSignData = {
			  rrn: new Date().getTime(),
			  coordinates_location: 'Top_Right',
			//   coordinates: `${roundedPosition.pageNo}-50,${roundedPosition.y},50,${roundedPosition.x-218};`,
			  coordinates: `${roundedPosition.pageNo}-50,${roundedPosition.y},50,${reqParams.type === 'rural' ? roundedPosition.x - 155 : 190};`,
			  doctype: 'PDF',
			  uid: `${result1[0].AADHAR}`,
			  signername: `${result1[0].NAME}`,
			  signerlocation: `${result1[0].SR_NAME}(${result1[0].SR_CODE})`,
			  filepassword: '',
			  signreason: 'eSignForNotifiedProperty',
			  authmode: 1,
			//   webhookurl: 'http://localhost:5005/card/Manual/PPNotify',
               webhookurl: process.env.ESIGN_REDIRECTION_PP_NOTIFY,
		
			  file: base64Data,
			};
			let esignUrlData = await this.orDao.oDBQueryService(`SELECT * FROM SROUSER.esign_urls`);
			if (!esignUrlData || esignUrlData.length === 0) {
			  throw new Error('Esign Urls Not Found');
			}
	  
			let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
			let esignUrl = esignUrlData[0].NSDL_URL;
			let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
			
			const queryUpdate = `
			  insert into sromstr.pp_notify_esign 
			  (ESIGN_STATUS,SIGNER_NAME,SIGNED_DATE,DN_QUALIFIER,SR_CODE,NOTIFIED_ID,SIGNER_ID) VALUES ('N','${result1[0].NAME}',sysdate,'${eSignData.rrn}','${result1[0].SR_CODE}','${documentId}','${reqBody[0].EMPL_ID}')`;
			  console.log(queryUpdate);

			const update = await this.orDao.oDbInsertDocs(queryUpdate);
			
			return { Result: eSignData, data: eSignReponse, ReportID:documentId,type:reqParams};
		  } else {
			return false;
		  }
		} else if(!ppTypeCheck){
			
			if (reqBody[0].SR_CODE) {
				const querysro = `
				  SELECT aadhar,EMPL_ID, empl_name AS name,DESIGNATION,SR_CODE, 
						 (SELECT sr_name FROM sr_master WHERE sr_cd = ${reqBody[0].DR_CD?reqBody[0].DR_CD:reqBody[0].SR_CODE}) AS sr_name 
				  FROM employee_login_master 
				  WHERE sr_code = ${reqBody[0].DR_CD?reqBody[0].DR_CD:reqBody[0].SR_CODE} AND empl_id = '${reqBody[0].EMPL_ID}'`;
				
				let bindParams = {};
				let result1 = await this.orDao.oDBQueryServiceWithBindParams(querysro, bindParams);
				console.log(result1,'list');
				
				console.log(querysro);
	
				const villagequery = `select *from hab_code where hab_code='${reqBody[0].VILLAGE_CODE}01'`;
				let result2 = await this.orDao.oDBQueryServiceWithBindParams(villagequery, bindParams);
		  
				let date = new Date();
	
				let day = String(date.getDate()).padStart(2, '0');
				let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed in JavaScript
				let year = date.getFullYear();
	
				let formattedDate = `${day}/${month}/${year}`;
		  
				let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
				let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
				let documentId = this.generateDocumentId(reqBody[0].SR_CODE);
		  
				let html;
				const commonHtml = `
				  <div style="text-align: center; margin:20px; margin-top:0">
					<img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
					<h3 style="margin:0px; margin-top : 5px">REGISTRATIONS AND STAMPS DEPARTMENT</h3>
					<h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH</h5>
					<div style="text-align: end;"><span style="font-weight: 600;">ReportID- </span>${documentId}</div>
					<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
					  <thead>
						<tr>
						  <th colspan=${reqParams.type === 'rural' ? '14' : '22'}  style="border: 1px solid #000; padding: 10px; font-size :16px;">Notified Prohibited Property Report - ${result1[0].SR_NAME}(${reqBody[0].SR_CODE})-Village Name: ${result2[0].VILLAGE_NAME}(${reqBody[0].VILLAGE_CODE})</th>
						</tr>
						<tr style="font-size :14px;">
						 `;
		  
				const urbanSpecificHtml = `
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">S.No.</th>
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Ward No</th>
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Bi Ward No</th>
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Block No</th>
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Bi Block No</th>
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Door No.</th>
					<th style="border: 1px solid #000; width: 20%; padding: 10px;">Apartment Name</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Flat No</th>
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Plot No</th>
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Revenue Survey No</th>
						   <th style="border: 1px solid #000; width: 15%; padding: 10px;">Revenue Sub Survey No</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Extent</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Unit</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">House No.</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Name</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Code</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Section</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Gazette No</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Date</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Reference</th>
						    <th style="border: 1px solid #000; width: 20%; padding: 10px;">Holder Name</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Type</th>
						</tr>
					  </thead>
					  <tbody>
						${reqBody.map((item,index) => `
						<tr>
						<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${index + 1 }</td>
						<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.WARD_NO}</td>
						<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BI_WARD_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BLOCK_NO}</td>
						  <td style="text-align: center;  vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BI_BLOCK_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.DOOR_NO}</td>
						   <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.APT_NAME}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.FLAT_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PLOT_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.REV_SURVEY_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.REV_SUB_SURVEY_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.EXTENT}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.UNIT}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.WARD_NO}${item.BI_WARD_NO ? "/" + item.BI_WARD_NO : ""}-${item.BLOCK_NO}${item.BI_BLOCK_NO ? "/" + item.BI_BLOCK_NO : ""}-${item.DOOR_NO}</td>
						   <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.CLASS_DESC}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PROHIB_CD}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_CODE}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_NO}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_DT}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.OTH_REF}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.H_NAME}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_TYPE ? item.PP_TYPE == "P" ? "Permanent" : "Temporary" : '-'}</td>
	
						</tr>`).join('')}
					  </tbody>
					</table>
				  </div>`;
		  
				const ruralSpecificHtml = `
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">S.No.</th>
						  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Survey No</th>
						   <th style="border: 1px solid #000; width: 15%; padding: 10px;">Sub Survey No</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Plot No</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Extent</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Unit</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Name</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Code</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Section</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Holder Name</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Gazette No</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Date</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Reference</th>
							<th style="border: 1px solid #000; width: 20%; padding: 10px;">Type</th>
	
	
						</tr>
					  </thead>
					  <tbody>
						${reqBody.map((item,index) => `
						<tr>
							<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${index + 1}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.SURVEY_NO}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.SUB_SURVEY_NO}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PLOT_NO}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.EXTENT}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.UNIT}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.CLASS_DESC}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PROHIB_CD}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_CODE}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.H_NAME}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_NO}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_DT}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.OTH_REF}</td>
							  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_TYPE ? item.PP_TYPE == "P" ? "Permanent" : "Temporary" : '-'}</td>
							
	
						</tr>`).join('')}
					  </tbody>
					</table>
				  </div>`;
		  
				const footerHtml = `
				  <div style="margin-top:20px; margin-right:20px; margin-left:20px;">
					<p style="margin-top: 85px; margin-bottom: 0;text-align:justify;">
					  <span style="font-weight: 600">Date:</span> ${formattedDate} 
					  <span style="margin-left: ${reqParams.type === 'rural' ? '480px' : '850px'}; font-weight: 600;">Notified officer eSign (${result1[0].DESIGNATION}).</span>
					</p> 
				  </div>`;
		  
				html = commonHtml + (reqParams.type === "urban" ? urbanSpecificHtml : ruralSpecificHtml) + footerHtml;
		  
				const NotifyPropertyFolder = 'Notify_Property_Report';
				// const srcodeFolder = `../../${NotifyPropertyFolder}/${reqBody[0].SR_CODE}`;
				
				// if (!fsone.existsSync(NotifyPropertyFolder)) {
				//   fsone.mkdirSync(NotifyPropertyFolder);
				// }
				// if (!fsone.existsSync(srcodeFolder)) {
				//   fsone.mkdirSync(srcodeFolder);
				// }
		  
				// const filename = `document_${documentId}-${reqBody[0].SR_CODE}.pdf`;
				// const filepath = `${srcodeFolder}/${filename}`;
				let NotifyDirectory = path.join(__dirname, `../../../../../pdfs/`);
				// let endorsementDirectiory = Path.join(__dirname, `../../public/`);
				if (!fsone.existsSync(NotifyDirectory)) {
					fsone.mkdirSync(NotifyDirectory, { recursive: true });
				}
				NotifyDirectory = `${NotifyDirectory}/uploads/`;
				if (!fsone.existsSync(NotifyDirectory)) {
					fsone.mkdirSync(NotifyDirectory, { recursive: true });
				}
				NotifyDirectory = `${NotifyDirectory}${NotifyPropertyFolder}/`;
				if (!fsone.existsSync(NotifyDirectory)) {
					fsone.mkdirSync(NotifyDirectory, { recursive: true });
				}
				NotifyDirectory = `${NotifyDirectory}${reqBody[0].SR_CODE}/`;
				if (!fsone.existsSync(NotifyDirectory)) {
					fsone.mkdirSync(NotifyDirectory, { recursive: true });
				}
				const filepath = `${NotifyDirectory}document_${documentId}-${reqBody[0].SR_CODE}.pdf`;
				console.log(filepath,'notify filepath');
				
				
				await this.generatePDFFromHTMLD(html, filepath, reqBody);
				const pdfBuffer = await fsone.promises.readFile(filepath);
				let roundedPosition;
		  
				// let buuferresult = this.findSignCoordinates(pdfBuffer);
	
				const textWithPositions = await this.coordinates.extractTextWithPositionsFromPDF(filepath);
				const searchText = "eSign";
				const signaturePosition = textWithPositions.find(item => item.text.includes(searchText));
			console.log(signaturePosition,'signa');
			
				if (signaturePosition) {
				   roundedPosition = {
					x: Math.round(signaturePosition.position.x),
					y: Math.round(signaturePosition.position.y),
					pageNo: signaturePosition.page
				};
			}
			console.log(roundedPosition, 'ooooooooooooooooo');
			
				const base64Data = pdfBuffer.toString("base64");
				const eSignData = {
				  rrn: new Date().getTime(),
				  coordinates_location: 'Top_Right',
				//   coordinates: `${roundedPosition.pageNo}-50,${roundedPosition.y},50,${roundedPosition.x-218};`,
				  coordinates: `${roundedPosition.pageNo}-50,${roundedPosition.y},50,${reqParams.type === 'rural' ? roundedPosition.x - 155 : 190};`,
				  doctype: 'PDF',
				  uid: `${result1[0].AADHAR}`,
				  signername: `${result1[0].NAME}`,
				  signerlocation: `${result1[0].SR_NAME}(${result1[0].SR_CODE})`,
				  filepassword: '',
				  signreason: 'eSignForNotifiedProperty',
				  authmode: 2,
				//   webhookurl: 'http://localhost:5005/card/Manual/PPNotify',
				   webhookurl: process.env.ESIGN_REDIRECTION_PP_NOTIFY,
			
				  file: base64Data,
				};
				let esignUrlData = await this.orDao.oDBQueryService(`SELECT * FROM SROUSER.esign_urls`);
				if (!esignUrlData || esignUrlData.length === 0) {
				  throw new Error('Esign Urls Not Found');
				}
		  
				let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
				let esignUrl = esignUrlData[0].NSDL_URL;
				let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
				
				const queryUpdate = `
				  insert into sromstr.pp_notify_esign 
				  (ESIGN_STATUS,SIGNER_NAME,SIGNED_DATE,DN_QUALIFIER,SR_CODE,NOTIFIED_ID,SIGNER_ID) VALUES ('N','${result1[0].NAME}',sysdate,'${eSignData.rrn}','${result1[0].SR_CODE}','${documentId}','${reqBody[0].EMPL_ID}')`;
				  console.log(queryUpdate);
	
				const update = await this.orDao.oDbInsertDocs(queryUpdate);
				
				return { Result: eSignData, data: eSignReponse, ReportID:documentId,type:reqParams};
			  } else {
				return false;
			  }

		}
			
			else {
			// return {status:false,message:'Already Notified'}
			let error = new Error('Records have already been notified.');
			error.statusCode = 200;
			throw error;		}
	
		} catch (err) {
		  console.error("Notify property - generateDocument || Error:", err);
		  throw err;
		}
	}
	  };



	  PPpendingEsignList = async (reqBody) => {
		try {
		  let esignstat;
		  const { selecteddata, reportID, esignstatus, type } = reqBody;
		  console.log(reqBody, 'body');
		  console.log(selecteddata, 'data');
	  
		  if (esignstatus) {
			const base64String = Buffer.from(esignstatus).toString('base64');
			const eSignConfig = {
			  method: 'post',
			  maxBodyLength: Infinity,
			  url: `${process.env.IGRS_ESIGN_URL}/downloadSignedDocTransID?transactionId=${base64String}`,
			  httpsAgent: new https.Agent({  
				rejectUnauthorized: false
			}),
			  headers: {
				'Content-Type': 'application/json',
			  },
			};
	  
			const fileResponse = await axios(eSignConfig);
	  console.log(fileResponse, 'pppppppppp');
	  
			if (!fileResponse?.data?.data) {
			  console.log('Pending Esign was not completed');
			  return null;
			} else {
			  const base64Pdf = fileResponse.data.data;
			  const pdfBytes = await convertBase64ToPdf(base64Pdf);
			  const filename = `../../../../../pdfs/uploads/Notify_Property_Report/${selecteddata[0].SR_CODE}/document_${reportID}-${selecteddata[0].SR_CODE}.pdf`;
			  const pdfPath = path.join(__dirname, filename);

			  await savePdfToFile(pdfBytes, pdfPath);
	  
			  for (let i of selecteddata) {
				let query;
	  
				if (type.toLowerCase() === "urban") {
				  query = `
					Insert into prohb_hu (SRO_CODE,VILLAGE_CODE,WARD_NO,BI_WARD_NO,BLOCK_NO,BI_BLOCK_NO,DOOR_NO,SURVEY_NO,SUB_SURVEY_NO,PLOT_NO,EXTENT,UNIT,PROHIB_CD,NOTI_GAZ_NO,NOTI_GAZ_DT,OTH_REF,DENOTI_GAZ_NO,DENOTI_GAZ_DT,H_NAME,ENTRY_DATE,SHIFTING_DATE,REV_SUB_SURVEY_NO,REV_SURVEY_NO,LOCAL_BODY_CODE,LOCAL_BODY_NAME,HAB_CODE,TOWN_SURVEY_NO,T_WARD_NO,T_BLOCK_NO,NOTIFY_IP,USER_NAME,TIME_STAMP,PP_TYPE,PP_CODE,NOTIFIED_ID,APT_NAME,FLAT_NO) select ${i.SR_CODE},'${i.VILLAGE_CODE}',${i.WARD_NO},'${i.BI_WARD_NO}',${i.BLOCK_NO},'${i.BI_BLOCK_NO}', 
					${i.WARD_NO} || CASE WHEN '${i.BI_WARD_NO}' IS NOT NULL THEN '/' || '${i.BI_WARD_NO}' ELSE '' END || '-' || 
					'${i.BLOCK_NO}' || CASE WHEN '${i.BI_BLOCK_NO}' IS NOT NULL THEN '/' || '${i.BI_BLOCK_NO}' ELSE '' END || '-' || '${i.DOOR_NO}' AS DOOR_NO,
					${i.SURVEY_NO},'${i.SUB_SURVEY_NO}','${i.PLOT_NO}',${i.EXTENT},'${i.UNIT}',${i.PROHIB_CD},'${i.NOTI_GAZ_NO}',TO_DATE('${i.NOTI_GAZ_DT}','DD-MM-YYYY'),'${i.OTH_REF}',${i.DENOTI_GAZ_NO},${i.DENOTI_GAZ_DT},'${i.H_NAME}',${i.ENTRY_DATE},${i.SHIFTING_DATE},COALESCE('${i.REV_SUB_SURVEY_NO}', '/'),'${i.REV_SURVEY_NO}',${i.LOCAL_BODY_CODE},${i.LOCAL_BODY_NAME},${i.HAB_CODE},${i.TOWN_SURVEY_NO},${i.T_WARD_NO},${i.T_BLOCK_NO},${i.NOTIFY_IP},'${i.USER_NAME}',SYSDATE,'${i.PP_TYPE}','${i.PP_CODE}','${reportID}','${i.APT_NAME}' ,'${i.FLAT_NO}'    FROM dual`;
				} else if (type.toLowerCase() === "rural") {
				  query = `
					INSERT INTO prohb_ag (SRO_CODE,VILLAGE_CODE,SURVEY_NO,SUB_SURVEY_NO,PLOT_NO,EXTENT,UNIT,PROHIB_CD,NOTI_GAZ_NO,NOTI_GAZ_DT,OTH_REF,DENOTI_GAZ_NO,DENOTI_GAZ_DT,H_NAME,ENTRY_DATE,SHIFTING_DATE,TIME_STAMP,NOTIFY_IP,USER_NAME,PP_TYPE,PP_CODE,NOTIFIED_ID) 
					SELECT ${i.SR_CODE},'${i.VILLAGE_CODE}',${i.SURVEY_NO},'${i.SUB_SURVEY_NO}','${i.PLOT_NO}',${i.EXTENT},CASE WHEN '${i.UNIT}' = 'Acres' THEN 'A' ELSE 'Y' END, ${i.PROHIB_CD},'${i.NOTI_GAZ_NO}',TO_DATE('${i.NOTI_GAZ_DT}','DD-MM-YYYY'),'${i.OTH_REF}',${i.DENOTI_GAZ_DT},${i.DENOTI_GAZ_NO},'${i.H_NAME}',TO_DATE('${i.ENTRY_DATE}','DD-MM-YYYY'),${i.SHIFTING_DATE},SYSDATE,${i.NOTIFY_IP},'${i.USER_NAME}','${i.PP_TYPE}','${i.PP_CODE}','${reportID}'
					FROM dual`;
				}
	  
				console.log(query);
				const response = await this.orDao.oDbInsertDocs(query);
				if (response > 0) {
				  console.log('PDF saved successfully');
				}
				
			  }
			 

			 const  update =`update sromstr.pp_notify_esign  set ESIGN_STATUS='Y' Where NOTIFIED_ID='${reportID}' and sr_code='${selecteddata[0].DR_CD?selecteddata[0].DR_CD:selecteddata[0].SR_CODE}'`;
			 console.log(update,'hgf');

			  const response = await this.orDao.oDbUpdate(update);
			  
			 
			  // Read the saved PDF file and convert it to base64
			  const savedPdf = await fs.readFile(path.resolve(filename));
			  const pdfBase64 = savedPdf.toString('base64');
	  
			  // Return the base64 PDF to the frontend
			  return pdfBase64;
			}
			
		  }
		  return null;
		} catch (ex) {
		  console.error("PPpendingEsignList || Error:", ex);
		  throw ex;
		}
	  };
	// Market value revision related 
	getListVillagesMakeEffectiveReqR = async(reqData) => {	
		try{
			// let query = `SELECT DISTINCT  h.village_name,j.village_code,j.sro_code,m.sno_dno FROM juri_ag j
			// 			JOIN hab_code h ON h.hab_code = j.village_code || '01'
			// 			LEFT JOIN mv_enable_revision_cr m ON j.village_code = m.village_code
			// 			WHERE 
			// 				j.sro_code = ${reqData.srCode}
			// 				AND j.village_code IN (SELECT village_code FROM mv_enable_revision_cr WHERE status = 'A' AND nature = 'R') 
			// 				AND NOT EXISTS (
			// 					SELECT 1 FROM SROMSTR.MV_REVISION_STATUS_CR WHERE VILL_CODE = j.village_code AND STATUS = 'R')`
			let query = `SELECT DISTINCT
				h.village_name,
				j.rev_vill_code as village_code,
				j.sro_code,
				e.sno_dno
			FROM
				juri_rural j
				JOIN hab_code h ON h.hab_code = j.rev_vill_code || '01'
				LEFT  JOIN (
					SELECT village_code, sno_dno
					FROM (
						SELECT DISTINCT village_code, sno_dno
						FROM mv_enable_revision_cr
						WHERE status = 'A' AND nature = 'R'
					) t
				) e ON j.rev_vill_code = e.village_code
				LEFT  JOIN SROMSTR.MV_REVISION_STATUS_CR r ON  r.VILL_CODE=j.rev_vill_code AND R.NATURE='R' and R.status<>'R'  and r.sr_code = :SR_CODE
			WHERE
				j.sro_code = :SR_CODE
				AND j.rev_vill_code IN (SELECT village_code FROM mv_enable_revision_cr WHERE status = 'A' AND nature = 'R'  and sr_code = :SR_CODE)  AND 
				J.rev_vill_code NOT IN (SELECT VILL_cODE FROM SROMSTR.MV_REVISION_STATUS_CR Z WHERE Z.NATURE='R'  and Z.sr_code = :SR_CODE and (Z.status='R' or Z.status='A'))
                order by h.village_name`;
		let response = await this.orDao.oDBQueryServiceWithBindParams(query, {SR_CODE : reqData.srCode});
		return response;
		}catch(ex){
			Logger.error("ProhibitedPropertyServices - getListVillagesR || Error :", ex);
			console.error("ProhibitedPropertyServices - getListVillagesR || Error :", ex);
			throw constructCARDError(ex);
		}
		}
	

		getListVillagesMakeEffectiveReqU = async(reqData) => {
			try{
				// let query = `
				// SELECT distinct h.village_name,j.village_code,j.sro_code
				// 	 FROM juri_HU j
				// 	 JOIN hab_code h ON h.hab_code = j.village_code || '01'
				// 	 WHERE j.sro_code = ${reqData.srCode}
				// 	 AND j.village_code IN (SELECT village_code FROM mv_enable_revision_cr where status='A' and nature='U')`;
				let query =` SELECT DISTINCT
				h.village_name,
				j.village_code,
				j.sro_code,
				e.sno_dno
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
				LEFT  JOIN SROMSTR.MV_REVISION_STATUS_CR r ON  r.VILL_CODE=j.village_code AND R.NATURE='U' and R.status<>'R' and r.sr_code= ${reqData.srCode} 
			WHERE
				j.sro_code = ${reqData.srCode} 
				AND j.village_code IN (SELECT village_code FROM mv_enable_revision_cr WHERE status = 'A' AND nature = 'U' and sr_code= ${reqData.srCode} )  AND 
				J.VILLAGE_cODE NOT IN (SELECT VILL_cODE FROM SROMSTR.MV_REVISION_STATUS_CR Z WHERE Z.NATURE='U' and Z.sr_code= ${reqData.srCode}  and (Z.status='R' or Z.status='A')  )`;
				let response = await this.orDao.oDBQueryService(query);
				return response;
			}catch(ex){
				Logger.error("ProhibitedPropertyServices - getListVillagesU || Error :", ex);
				console.error("ProhibitedPropertyServices - getListVillagesU || Error :", ex);
				throw constructCARDError(ex);
			}
			}
		
	
	getListVillagesRDRACSrvc = async(reqData) => {
	try{
		let query = `SELECT DISTINCT
				h.village_name,
				j.rev_vill_code as village_code,
				j.sro_code,
				e.sno_dno
			FROM
				juri_rural j
				JOIN hab_code h ON h.hab_code = j.rev_vill_code || '01'
				LEFT  JOIN (
					SELECT village_code, sno_dno
					FROM (
						SELECT DISTINCT village_code, sno_dno
						FROM mv_enable_revision_cr
						WHERE status = 'A' AND nature = 'R'
					) t
				) e ON j.rev_vill_code = e.village_code
				LEFT  JOIN SROMSTR.MV_REVISION_STATUS_CR r ON  r.VILL_CODE=j.rev_vill_code AND R.NATURE='R' and R.status<>'R'  and r.sr_code = :SR_CODE
			WHERE
				j.sro_code = :SR_CODE
				AND j.rev_vill_code IN (SELECT village_code FROM mv_enable_revision_cr WHERE status = 'A' AND nature = 'R' and sr_code = :SR_CODE)  AND 
				J.rev_vill_code NOT IN (SELECT VILL_cODE FROM SROMSTR.MV_REVISION_STATUS_CR Z WHERE Z.sr_code = :SR_CODE and  Z.NATURE='R' and (Z.status='R' or Z.status='A'))
                order by h.village_name`;
		let response = await this.orDao.oDBQueryServiceWithBindParams(query, {SR_CODE : reqData.srCode});
		return response;
	}catch(ex){
		Logger.error("ProhibitedPropertyServices - getListVillagesRDRACSrvc || Error :", ex);
		console.error("ProhibitedPropertyServices - getListVillagesRDRACSrvc || Error :", ex);
		throw constructCARDError(ex);
	}
	}
	
	getListVillagesUDRACSrvc = async(reqData) => {
	try{
		let query = `
		SELECT distinct h.village_name,j.village_code,j.sro_code
			 FROM juri_HU j
			 JOIN hab_code h ON h.hab_code = j.village_code || '01'
			 WHERE j.sro_code = ${reqData.srCode}
			 AND j.village_code IN (SELECT village_code FROM mv_enable_revision_cr where status='A' and nature='U')
			 AND (r.status IS NULL OR r.status not in ('R', 'A'))`;
		let response = await this.orDao.oDBQueryService(query);
		return response;
	}catch(ex){
		Logger.error("ProhibitedPropertyServices - getListVillagesUDRACSrvc || Error :", ex);
		console.error("ProhibitedPropertyServices - getListVillagesUDRACSrvc || Error :", ex);
		throw constructCARDError(ex);
	}
	}

	getNotifyDetailsSrvc = async (reqData,reqParams) => {

		try {
            let Query, response;
			console.log(reqData, reqParams);
			
				if(reqParams.type == "Urban" ){
                    Query = `select a.*,(select class_desc from card.prob_class i where i.class_code=a.prohib_cd and rownum=1) as name, rowid from prohb_hu a where sro_code = ${reqData.SR_CODE} and village_code = ${reqData.VILLAGE_CODE}`;
				} else if (reqParams.type === "Rural") {
                     Query = `select a.*,(select class_desc from card.prob_class i where i.class_code=a.prohib_cd and rownum=1) as name, rowid from prohb_ag a where sro_code = ${reqData.SR_CODE} and village_code = ${reqData.VILLAGE_CODE}`;
                }
				
                 response = await this.orDao.oDBQueryService(Query);
                return response;		
		} catch (ex) {
		Logger.error("ProhibitedPropertyServices - getNotifyDetailsSrvc || Error :", ex);
		console.error("ProhibitedPropertyServices - getNotifyDetailsSrvc || Error :", ex);
		throw constructCARDError(ex);
		}
	}

	updateNotifySrvc = async (reqData,reqParams) => {
 
        try {
            let Query, response;
			let queryArray = [];
            for(let i of reqData){
                if(reqParams.type == "urban" ){
                    Query = `update sromstr.prohb_hu set PP_CODE= NVL(${i.PP_CODE ? `'${i.PP_CODE}'` : `''`}, PP_CODE)  WHERE  SRO_CODE=${i.SRO_CODE} AND VILLAGE_CODE='${i.VILLAGE_CODE}' AND DOOR_NO='${i.DOOR_NO}' and rowid = '${i.ROWID}'`;
 
                } else if (reqParams.type === "rural") {
                     Query = `update sromstr.prohb_ag set PP_CODE= NVL(${i.PP_CODE ? `'${i.PP_CODE}'` : `''`}, PP_CODE)  WHERE SURVEY_NO = '${i.SURVEY_NO}' AND ${i.SUB_SURVEY_NO ? `SUB_SURVEY_NO = '${i.SUB_SURVEY_NO}' AND` : ''} SRO_CODE=${i.SRO_CODE} AND VILLAGE_CODE='${i.VILLAGE_CODE}' and rowid = '${i.ROWID}'`;
					
                    }
					queryArray.push(Query);
            }
			response = await this.orDao.oDbInsertMultipleDocs(queryArray, "Update PP code");
                return response;
                   
        } catch (ex) {
        Logger.error("ProhibitedPropertyServices - saveNotifySrvc || Error :", ex);
        console.error("ProhibitedPropertyServices - saveNotifySrvc || Error :", ex);
        throw constructCARDError(ex);
        }
    }

	updateExtentNotifySrvc = async (reqData,reqParams) => {
 
        try {
            let Query, response;
			let queryArray = [];
            for(let i of reqData){
                if(reqParams.type == "urban" ){
                    Query = `update sromstr.prohb_hu set EXTENT= ${i.EXTENT ? `'${i.EXTENT}'` : `''`},UNIT= ${i.UNIT ? `'${i.UNIT}'` : `''`},NOTI_GAZ_NO= ${i.NOTI_GAZ_NO ? `'${i.NOTI_GAZ_NO}'` : `''`},NOTI_GAZ_DT = TO_DATE(${i.NOTI_GAZ_DT ? `'${i.NOTI_GAZ_DT}'` : `''`}, 'DD-MM-YYYY')  WHERE  SRO_CODE=${i.SRO_CODE} AND VILLAGE_CODE='${i.VILLAGE_CODE}' AND DOOR_NO='${i.DOOR_NO}' and rowid = '${i.ROWID}'`;
 
                } else if (reqParams.type === "rural") {
                     Query = `update sromstr.prohb_ag set EXTENT= ${i.EXTENT ? `'${i.EXTENT}'` : `''`},UNIT= ${i.UNIT ? `'${i.UNIT}'` : `''`},NOTI_GAZ_NO= ${i.NOTI_GAZ_NO ? `'${i.NOTI_GAZ_NO}'` : `''`},NOTI_GAZ_DT = TO_DATE(${i.NOTI_GAZ_DT ? `'${i.NOTI_GAZ_DT}'` : `''`}, 'DD-MM-YYYY') WHERE SURVEY_NO = '${i.SURVEY_NO}' AND ${i.SUB_SURVEY_NO ? `SUB_SURVEY_NO = '${i.SUB_SURVEY_NO}' AND` : ''} SRO_CODE=${i.SRO_CODE} AND VILLAGE_CODE='${i.VILLAGE_CODE}' and rowid = '${i.ROWID}'`;
     
                    }
				queryArray.push(Query);
            }
			response = await this.orDao.oDbInsertMultipleDocs(queryArray,"Update Extent");
                return response;
                   
        } catch (ex) {
        Logger.error("ProhibitedPropertyServices - updateExtentNotifySrvc || Error :", ex);
        console.error("ProhibitedPropertyServices - updateExtentNotifySrvc || Error :", ex);
        throw constructCARDError(ex);
        }
    }

	getExtentNotifyDetailsSrvc = async (reqData,reqParams) => {
 
        try {
            let Query, response;
            console.log(reqData, reqParams);
           
                if(reqParams.type == "Urban" ){
                    Query = `select a.*,(select class_desc from card.prob_class i where i.class_code=a.prohib_cd and rownum=1) as name, rowid from prohb_hu a where sro_code = ${reqData.SR_CODE} and village_code = ${reqData.VILLAGE_CODE} and (extent is null or unit is null or NOTI_GAZ_NO is null or NOTI_GAZ_DT is null)`;
                } else if (reqParams.type === "Rural") {
                     Query = `select a.*,(select class_desc from card.prob_class i where i.class_code=a.prohib_cd and rownum=1) as name, rowid from prohb_ag a where sro_code = ${reqData.SR_CODE} and village_code = ${reqData.VILLAGE_CODE} and (extent is null or unit is null or NOTI_GAZ_NO is null or NOTI_GAZ_DT is null)`;
                }
               
                 response = await this.orDao.oDBQueryService(Query);
                return response;        
        } catch (ex) {
        Logger.error("ProhibitedPropertyServices - getNotifyDetailsSrvc || Error :", ex);
        console.error("ProhibitedPropertyServices - getNotifyDetailsSrvc || Error :", ex);
        throw constructCARDError(ex);
        }
    }


	saveDenotifySrvc = async (reqBody, reqParams) => {
		console.log('inside');
		console.log(reqBody,reqParams);
		try {
		  if (reqBody.DR_CD) {
			const querysro = `
			  SELECT aadhar,EMPL_ID, empl_name AS name,DESIGNATION,SR_CODE, 
					 (SELECT sr_name FROM sr_master WHERE sr_cd = ${reqBody.DR_CD ? reqBody.DR_CD : reqBody.SR_CODE}) AS sr_name 
			  FROM employee_login_master 
			  WHERE sr_code = ${reqBody.DR_CD ? reqBody.DR_CD : reqBody.SR_CODE} AND empl_id = '${reqBody.EMPL_ID}'`;
			let bindParams = {};
			let result1 = await this.orDao.oDBQueryServiceWithBindParams(querysro, bindParams);
			console.log(result1,'list');

			const villagequery = `select *from hab_code where hab_code='${reqBody.VILLAGE_CODE}01'`;
			let result2 = await this.orDao.oDBQueryServiceWithBindParams(villagequery, bindParams);
			console.log(result2,'result');
			
			// let SelectQuery;
			// 	if (reqParams.type == 'urban') {
			// 	  SelectQuery = `select a.*,(select  class_desc from card.prob_class where  class_code=prohib_cd ) probdesc From prohb_hu a where rowid='${reqBody.rowidArray[0]}'`;
			// 	} else if (reqParams.type == 'rural') {
			// 	  SelectQuery = `select a.*,(select  class_desc from card.prob_class where  class_code=prohib_cd ) probdesc From prohb_ag a where rowid='${reqBody.rowidArray[0]}'`;
			// 	}
			// 	console.log(SelectQuery);
			// let dataResult = await this.orDao.oDBQueryServiceWithBindParams(SelectQuery, bindParams);
			console.log(result2,'result');
			let date = new Date();

			let day = String(date.getDate()).padStart(2, '0');
			let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed in JavaScript
			let year = date.getFullYear();

			let formattedDate = `${day}/${month}/${year}`;
	  
			let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
			let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
			let documentId = this.generateDocumentDenotifyId(reqBody.DR_CD);
			let html;
			const commonHtml = `
			  <div style="text-align: center; margin:20px; margin-top:0">
				<img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
				<h3 style="margin:0px; margin-top : 5px">REGISTRATIONS AND STAMPS DEPARTMENT</h3>
				<h5 style="margin:0px">GOVERNMENT OF ANDHRA PRADESH</h5>
				<div style="text-align: end;"><span style="font-weight: 600; margin-bottom:2px">ReportID- </span>${documentId}</div>
				<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
				  <thead>
					<tr>
					  <th colspan="22" style="border: 1px solid #000; padding: 10px; font-size :16px;">Denotified Prohibited Property Report - ${reqBody.SR_NAME}(${reqBody.rowidArray[0].SR_CODE})-Village Name: ${result2[0].VILLAGE_NAME}(${reqBody.VILLAGE_CODE})</th>
					</tr>
					<tr style="font-size :14px;">
					 `;
	  
			const urbanSpecificHtml = `
					  <th style="border: 1px solid #000; padding: 10px;">S.No.</th>
					  <th style="border: 1px solid #000; padding: 10px;">Ward No.</th>
					  <th style="border: 1px solid #000; padding: 10px;">Bi Ward No.</th>
					  <th style="border: 1px solid #000; padding: 10px;">Block No.</th>
					  <th style="border: 1px solid #000; padding: 10px;">Bi Block No.</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Door No.</th>
					<th style="border: 1px solid #000; width: 20%; padding: 10px;">Apartment Name</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Flat No.</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Plot No.</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Revenue Survey No.</th>
					   <th style="border: 1px solid #000; width: 15%; padding: 10px;">Revenue Sub Survey No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Extent</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Unit</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">House No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Name</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Code</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Gazette No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Date</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Denotify Gazette No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Denotify Date</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Reference</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Type</th>

					</tr>
				  </thead>
				  <tbody>
					${reqBody.rowidArray.map((item,index) => `
					<tr>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${index + 1 }</td>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.WARD_NO}</td>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BI_WARD_NO}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BLOCK_NO}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.BI_BLOCK_NO}</td>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">
					    ${
							(() => {
								if (!item.DOOR_NO) return "";
								const parts = item.DOOR_NO.split("-");
								if (parts.length === 2) { // One hyphen → value after 1st hyphen
									return parts[1];
								} else if (parts.length >= 3) { // Two or more hyphens → value after 2nd hyphen
									return parts.slice(2).join("-");
								}
								return item.DOOR_NO; // No hyphen
							})()
				        }
					</td>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.APT_NAME}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.FLAT_NO}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PLOT_NO ? item.PLOT_NO : '-'}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.REV_SURVEY_NO ? item.REV_SURVEY_NO : '-'}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.REV_SUB_SURVEY_NO ? item.REV_SUB_SURVEY_NO : '-'}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.EXTENT ? item.EXTENT : '-'}</td>
					<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.UNIT ? item.UNIT : '-'}</td>
					  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.DOOR_NO}</td>
					   <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PROBDESC ? item.PROBDESC : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PROHIB_CD ? item.PROHIB_CD : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;word-wrap: break-word; white-space: normal;">${item.NOTI_GAZ_NO ? item.NOTI_GAZ_NO : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_DT ? item.NOTI_GAZ_DT : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${reqBody.DENOTIFY_NUM ? reqBody.DENOTIFY_NUM : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${reqBody.DENOTIFY_DATE ? reqBody.DENOTIFY_DATE : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px; text-wrap">${item.OTH_REF ? item.OTH_REF : '-'}</td>
						<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_TYPE ? item.PP_TYPE == "P" ? "Permanent" : "Temporary" : '-'}</td>


					</tr>`).join('')}
				  </tbody>
				</table>
			  </div>`;
	  
			const ruralSpecificHtml = `
			          <th style="border: 1px solid #000; width: 20%; padding: 10px;">S.No</th>
					  <th style="border: 1px solid #000; width: 20%; padding: 10px;">Survey No.</th>
					   <th style="border: 1px solid #000; width: 15%; padding: 10px;">Sub Survey No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Plot No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Extent</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Unit</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Name</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Prohibited Code</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Holder Name</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Gazette No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Notify Date</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Denotify Gazette No.</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Denotify Date</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Reference</th>
						<th style="border: 1px solid #000; width: 20%; padding: 10px;">Type</th>
					</tr>
				  </thead>
				  <tbody>
					${reqBody.rowidArray.map((item,index) => `
					<tr>
						<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${index + 1}</td>
					      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.SURVEY_NO}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.SUB_SURVEY_NO ? item.SUB_SURVEY_NO : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PLOT_NO ? item.PLOT_NO : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.EXTENT ? item.EXTENT : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.UNIT ? item.UNIT : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PROBDESC ? item.PROBDESC : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PROHIB_CD ? item.PROHIB_CD : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.H_NAME ? item.H_NAME : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_NO ? item.NOTI_GAZ_NO : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.NOTI_GAZ_DT ? item.NOTI_GAZ_DT : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${reqBody.DENOTIFY_NUM ? reqBody.DENOTIFY_NUM : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${reqBody.DENOTIFY_DATE ? reqBody.DENOTIFY_DATE : '-'}</td>
						  <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.OTH_REF ? item.OTH_REF : '-'}</td>
						<td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 10px;">${item.PP_TYPE ? item.PP_TYPE == "P" ? "Permanent" : "Temporary" : '-'}</td>

						

					</tr>`).join('')}
				  </tbody>
				</table>
			  </div>`;
	  
			const footerHtml = `
			  <div style="margin-top:20px; margin-right:20px; margin-left:20px;">
				<div style="margin-top: 85px; margin-bottom: 0; display: flex; justify-content: space-between; text-align: justify;">
  <div><span style="font-weight: 600;">Date: </span>${formattedDate}</div>
  <div style="font-weight: 600; margin-right: 50px;">Denotified officer eSign (${result1[0].DESIGNATION}).</div>
</div>

			  </div>`;
	  
			html = commonHtml + (reqParams.type === "urban" ? urbanSpecificHtml : ruralSpecificHtml) + footerHtml;
	  
			const DenotifyPropertyFolder = 'Denotify_Property_Report';
			// const srcodeFolder = `${DenotifyPropertyFolder}/${reqBody.DR_CD}`;
			
			// if (!fsone.existsSync(DenotifyPropertyFolder)) {
			//   fsone.mkdirSync(DenotifyPropertyFolder);
			// }
			// if (!fsone.existsSync(srcodeFolder)) {
			//   fsone.mkdirSync(srcodeFolder);
			// }
	  
			// const filename = `document_${documentId}-${reqBody.DR_CD}.pdf`;
			// const filepath = `${srcodeFolder}/${filename}`;
			let DenotifyDirectory = path.join(__dirname, `../../../../../pdfs/`);
            // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
            if (!fsone.existsSync(DenotifyDirectory)) {
                fsone.mkdirSync(DenotifyDirectory, { recursive: true });
            }
            DenotifyDirectory = `${DenotifyDirectory}/uploads/`;
            if (!fsone.existsSync(DenotifyDirectory)) {
                fsone.mkdirSync(DenotifyDirectory, { recursive: true });
            }
            DenotifyDirectory = `${DenotifyDirectory}${DenotifyPropertyFolder}/`;
            if (!fsone.existsSync(DenotifyDirectory)) {
                fsone.mkdirSync(DenotifyDirectory, { recursive: true });
            }
            DenotifyDirectory = `${DenotifyDirectory}${reqBody.DR_CD}/`;
            if (!fsone.existsSync(DenotifyDirectory)) {
                fsone.mkdirSync(DenotifyDirectory, { recursive: true });
            }
            const filepath = `${DenotifyDirectory}document_${documentId}-${reqBody.DR_CD}.pdf`;

			console.log(filepath,'denotify filepath');
			
			
			await this.generatePDFFromHTMLD(html, filepath, reqBody);
			const pdfBuffer = await fsone.promises.readFile(filepath);
			let roundedPosition;
	  
			// let buuferresult = this.findSignCoordinates(pdfBuffer);

			const textWithPositions = await this.coordinates.extractTextWithPositionsFromPDF(filepath);
            const searchText = "eSign";
            const signaturePosition = textWithPositions.find(item => item.text.includes(searchText));
        console.log(signaturePosition,'signa');
		
            if (signaturePosition) {
               roundedPosition = {
                x: Math.round(signaturePosition.position.x),
                y: Math.round(signaturePosition.position.y),
                pageNo: signaturePosition.page
            };
		}
		console.log(roundedPosition, 'ooooooooooooooooo');
		
			const base64Data = pdfBuffer.toString("base64");
			const eSignData = {
			  rrn: new Date().getTime(),
			  coordinates_location: 'Top_Right',
			//   coordinates: `${roundedPosition.pageNo}-50,${roundedPosition.y},50,${roundedPosition.x-218};`,
			coordinates: `${roundedPosition.pageNo}-50,${roundedPosition.y},50,${reqParams.type === 'rural' ? roundedPosition.x - 400 : 175};`,
			  doctype: 'PDF',
			  uid: `${result1[0].AADHAR}`,
			  signername: `${result1[0].NAME}`,
			  signerlocation: `${result1[0].SR_NAME}(${result1[0].SR_CODE})`,
			  filepassword: '',
			  signreason: 'eSignForDenotifiedProperty',
			  authmode: 2,
			//   webhookurl: 'http://localhost:5005/card/Manual/PPDenotify',
               webhookurl: process.env.ESIGN_REDIRECTION_PP_DENOTIFY,
		
			  file: base64Data,
			};
	  
			let esignUrlData = await this.orDao.oDBQueryService(`SELECT * FROM SROUSER.esign_urls`);
			if (!esignUrlData || esignUrlData.length === 0) {
			  throw new Error('Esign Urls Not Found');
			}
	  
			let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
			let esignUrl = esignUrlData[0].NSDL_URL;
			let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
			
			const queryUpdate = `
			  insert into sromstr.pp_notify_esign 
			  (ESIGN_STATUS,SIGNER_NAME,SIGNED_DATE,DN_QUALIFIER,SR_CODE,NOTIFIED_ID,SIGNER_ID) VALUES ('N','${result1[0].NAME}',sysdate,'${eSignData.rrn}','${result1[0].SR_CODE}','${documentId}','${reqBody.EMPL_ID}')`;
			  console.log(queryUpdate);

			const update = await this.orDao.oDbInsertDocs(queryUpdate);
			
			return { Result: eSignData, data: eSignReponse, ReportID:documentId,type:reqParams};
		  } else {
			return false;
		  }
		} catch (err) {
		  console.error("Notify property - generateDocument || Error:", err);
		  throw err;
		}
	  };


	  PPDenotifypendingEsignListSrvc = async (reqBody) => {
		try {
		  let esignstat;
		  const { selecteddata, reportID, esignstatus, type } = reqBody;
		  console.log(reqBody, 'body');
		  console.log(selecteddata, 'data');
	  
		  if (esignstatus) {
			const base64String = Buffer.from(esignstatus).toString('base64');
			const eSignConfig = {
			  method: 'post',
			  maxBodyLength: Infinity,
			  url: `${process.env.IGRS_ESIGN_URL}/downloadSignedDocTransID?transactionId=${base64String}`,
			  httpsAgent: new https.Agent({  
				rejectUnauthorized: false
			}),
			  headers: {
				'Content-Type': 'application/json',
			  },
			};
	  
			const fileResponse = await axios(eSignConfig);
	  
			if (!fileResponse?.data?.data) {
			  console.log('Pending Esign was not completed');
			  return null;
			} else {
			  const base64Pdf = fileResponse.data.data;
			  const pdfBytes = await convertBase64ToPdf(base64Pdf);
			  const filename = `../../../../../pdfs/uploads/Denotify_Property_Report/${selecteddata.DR_CD}/document_${reportID}-${selecteddata.DR_CD}.pdf`;
			  const pdfPath = path.join(__dirname, filename);

			  await savePdfToFile(pdfBytes, pdfPath);

	  
			  for (let i of selecteddata.rowidArray) {
				let deleteQuery,insertQuery;
				if (type == 'urban') {
					deleteQuery = `DELETE From prohb_hu where rowid='${i.ROWID}'`;
					// insertQuery = `Insert into sromstr.prohb_hu_denotify (SRO_CODE,VILLAGE_CODE,WARD_NO,BLOCK_NO,DOOR_NO,SURVEY_NO,SUB_SURVEY_NO,PLOT_NO,EXTENT,UNIT,PROHIB_CD,NOTI_GAZ_NO,NOTI_GAZ_DT,OTH_REF,DENOTIFY_DATE,DENOTIFY_NUM,H_NAME,ENTRY_DATE,DEL_DATE,SHIFTING_DATE,REV_SURVEY_NO,REV_SUB_SURVEY_NO,LOCAL_BODY_CODE,LOCAL_BODY_NAME,HAB_CODE,TOWN_SURVEY_NO,T_WARD_NO,T_BLOCK_NO,DENOTIFY_IP,USER_NAME) values (${i.SR_CODE},'${i.VILLAGE_CODE}',${i.WARD_NO ? `'${i.WARD_NO}'` : ''},${i.BLOCK_NO ? `'${i.BLOCK_NO}'` : ''},${i.DOOR_NO ? `'${i.DOOR_NO}'` : ''},${i.SURVEY_NO ? i.SURVEY_NO : ''},'${i.SUB_SURVEY_NO ? i.SUB_SURVEY_NO : ''}',${i.PLOT_NO ? i.PLOT_NO : ''},${i.EXTENT ? i.EXTENT : ''},'${i.UNIT ? i.UNIT : ''}',${i.PROHIB_CD ? i.PROHIB_CD : ''},'${i.NOTI_GAZ_NO ? i.NOTI_GAZ_NO : ''}',${i.NOTI_GAZ_DT ? `TO_DATE('${i.NOTI_GAZ_DT}','DD-MM-YYYY')` : ''},'${i.OTH_REF ? i.OTH_REF : ''}',${i.DENOTIFY_DATE ? `TO_DATE('${i.DENOTIFY_DATE}','DD-MM-YYYY')` : ''},'${i.DENOTIFY_NUM ? i.DENOTIFY_NUM : ''}',${i.H_NAME ? i.H_NAME : ''},${i.ENTRY_DATE ? `TO_DATE('${i.ENTRY_DATE}','DD-MM-YYYY')` : ''},sysdate,${i.SHIFTING_DATE ? `TO_DATE('${i.SHIFTING_DATE}','DD-MM-YYYY')` : ''},${i.REV_SURVEY_NO ? `'${i.REV_SURVEY_NO}'` : ''},'${i.REV_SUB_SURVEY_NO ? `'${i.REV_SUB_SURVEY_NO}'` : ''}',${i.LOCAL_BODY_CODE ? `'${i.LOCAL_BODY_CODE}'` : ''},${i.LOCAL_BODY_NAME ? `'${i.LOCAL_BODY_NAME}'` : ''},${i.HAB_CODE ? `'${i.HAB_CODE}'` : ''},${i.TOWN_SURVEY_NO ? `'${i.TOWN_SURVEY_NO}'` : ''},${i.T_WARD_NO ? `'${i.T_WARD_NO}'` : ''},${i.T_BLOCK_NO ? `'${i.T_BLOCK_NO}'` : ''},${i.DENOTIFY_IP ? `'${i.DENOTIFY_IP}'` : ''},'${i.USER_NAME}')`;
				 insertQuery =`INSERT INTO sromstr.prohb_hu_denotify (
    SRO_CODE, VILLAGE_CODE, WARD_NO, BI_WARD_NO, BLOCK_NO, BI_BLOCK_NO, DOOR_NO, SURVEY_NO, SUB_SURVEY_NO, PLOT_NO, 
    EXTENT, UNIT, PROHIB_CD, NOTI_GAZ_NO, NOTI_GAZ_DT, OTH_REF, DENOTIFY_DATE, 
    DENOTIFY_NUM, H_NAME, ENTRY_DATE, DEL_DATE, SHIFTING_DATE, REV_SURVEY_NO, 
    REV_SUB_SURVEY_NO, LOCAL_BODY_CODE, LOCAL_BODY_NAME, HAB_CODE, TOWN_SURVEY_NO, 
    T_WARD_NO, T_BLOCK_NO, DENOTIFY_IP, USER_NAME,APT_NAME,FLAT_NO
  ) VALUES (
    ${i.SR_CODE || "''"},
    '${i.VILLAGE_CODE || ''}',
    ${i.WARD_NO !== null && i.WARD_NO !== '' ? `'${i.WARD_NO}'` : "''"},
    ${i.BI_WARD_NO !== null && i.BI_WARD_NO !== '' ? `'${i.BI_WARD_NO}'` : "''"},
    ${i.BLOCK_NO !== null && i.BLOCK_NO !== '' ? `'${i.BLOCK_NO}'` : "''"},
    ${i.BI_BLOCK_NO !== null && i.BI_BLOCK_NO !== '' ? `'${i.BI_BLOCK_NO}'` : "''"},
    ${i.DOOR_NO !== null && i.DOOR_NO !== '' ? `'${i.DOOR_NO}'` : "''"},
    ${i.SURVEY_NO !== null && i.SURVEY_NO !== '' ? i.SURVEY_NO : "''"},
    '${i.SUB_SURVEY_NO !== null && i.SUB_SURVEY_NO !== '' ? i.SUB_SURVEY_NO : ''}',
    ${i.PLOT_NO !== null && i.PLOT_NO !== '' ? i.PLOT_NO : "''"},
    ${i.EXTENT !== null && i.EXTENT !== '' ? i.EXTENT : "''"},
    '${i.UNIT !== null && i.UNIT !== '' ? i.UNIT : ''}',
    ${i.PROHIB_CD !== null && i.PROHIB_CD !== '' ? i.PROHIB_CD : "''"},
    '${i.NOTI_GAZ_NO !== null && i.NOTI_GAZ_NO !== '' ? i.NOTI_GAZ_NO : ''}',
    ${i.NOTI_GAZ_DT !== null && i.NOTI_GAZ_DT !== '' ? `TO_DATE('${i.NOTI_GAZ_DT}', 'DD-MM-YYYY')` : "''"},
    '${i.OTH_REF !== null && i.OTH_REF !== '' ? i.OTH_REF : ''}',
    ${i.DENOTIFY_DATE !== null && i.DENOTIFY_DATE !== '' ? `TO_DATE('${i.DENOTIFY_DATE}', 'DD-MM-YYYY')` : "''"},
    '${i.DENOTIFY_NUM !== null && i.DENOTIFY_NUM !== '' ? i.DENOTIFY_NUM : ''}',
    ${i.H_NAME !== null && i.H_NAME !== '' ? `'${i.H_NAME}'` : "''"},
    ${i.ENTRY_DATE !== null && i.ENTRY_DATE !== '' ? `TO_DATE('${i.ENTRY_DATE}', 'DD-MM-YYYY')` : "''"},
    sysdate,
    ${i.SHIFTING_DATE !== null && i.SHIFTING_DATE !== '' ? `TO_DATE('${i.SHIFTING_DATE}', 'DD-MM-YYYY')` : "''"},
    ${i.REV_SURVEY_NO !== null && i.REV_SURVEY_NO !== '' ? `'${i.REV_SURVEY_NO}'` : "''"},
    '${i.REV_SUB_SURVEY_NO !== null && i.REV_SUB_SURVEY_NO !== '' ? i.REV_SUB_SURVEY_NO : ''}',
    ${i.LOCAL_BODY_CODE !== null && i.LOCAL_BODY_CODE !== '' ? `'${i.LOCAL_BODY_CODE}'` : "''"},
    '${i.LOCAL_BODY_NAME !== null && i.LOCAL_BODY_NAME !== '' ? i.LOCAL_BODY_NAME : ''}',
    ${i.HAB_CODE !== null && i.HAB_CODE !== '' ? `'${i.HAB_CODE}'` : "''"},
    ${i.TOWN_SURVEY_NO !== null && i.TOWN_SURVEY_NO !== '' ? `'${i.TOWN_SURVEY_NO}'` : "''"},
    ${i.T_WARD_NO !== null && i.T_WARD_NO !== '' ? `'${i.T_WARD_NO}'` : "''"},
    ${i.T_BLOCK_NO !== null && i.T_BLOCK_NO !== '' ? `'${i.T_BLOCK_NO}'` : "''"},
    ${i.DENOTIFY_IP !== null && i.DENOTIFY_IP !== '' ? `'${i.DENOTIFY_IP}'` : "''"},
    '${i.USER_NAME || ''}',
	${i.APT_NAME !== null && i.APT_NAME !== '' ? `'${i.APT_NAME}'` : "''"},
    ${i.FLAT_NO !== null && i.FLAT_NO !== '' ? `'${i.FLAT_NO}'` : "''"}

  )`;
				} else if (type == 'rural') {
					deleteQuery = `DELETE From prohb_ag where rowid='${i.ROWID}'`;
					// insertQuery = `Insert into sromstr.prohb_ag_denotify (SRO_CODE,VILLAGE_CODE,SURVEY_NO,SUB_SURVEY_NO,PLOT_NO,EXTENT,UNIT,PROHIB_CD,NOTI_GAZ_NO,NOTI_GAZ_DT,OTH_REF,H_NAME,DENOTIFY_DATE,DENOTIFY_NUM,ENTRY_DATE,DEL_DATE,SHIFTING_DATE,DENOTIFY_IP,USER_NAME) values (${i.SR_CODE},'${i.VILLAGE_CODE}',${i.SURVEY_NO},${i.SUB_SURVEY_NO ? `'${i.SUB_SURVEY_NO}'` : ''},${i.PLOT_NO ? `'${i.PLOT_NO}'` : ''},${i.EXTENT ? `'${i.EXTENT}'` : ''},${i.UNIT ? `'${i.UNIT}'` : ''},${i.PROHIB_CD ? `'${i.PROHIB_CD}'` : ''},${i.NOTI_GAZ_NO ? `'${i.NOTI_GAZ_NO}'` : ''},${i.NOTI_GAZ_DT ? `TO_DATE('${i.NOTI_GAZ_DT}','DD-MM-YYYY')` : ''},${i.OTH_REF ? `'${i.OTH_REF}'` : ''},${i.H_NAME ? `'${i.H_NAME}'` : ''},TO_DATE('${i.DENOTIFY_DATE}','DD-MM-YYYY'),'${i.DENOTIFY_NUM}','${i.ENTRY_DATE ? `TO_DATE('${i.ENTRY_DATE}','DD-MM-YYYY')` : ''}',sysdate,'${i.SHIFTING_DATE ? `TO_DATE('${i.SHIFTING_DATE}','DD-MM-YYYY')` : ''}','${i.DENOTIFY_IP ? `'${i.DENOTIFY_IP}'` : ''}','${i.USER_NAME}')`;
				 insertQuery =`INSERT INTO sromstr.prohb_ag_denotify (
    SRO_CODE, VILLAGE_CODE, SURVEY_NO, SUB_SURVEY_NO, PLOT_NO, EXTENT, UNIT, PROHIB_CD, 
    NOTI_GAZ_NO, NOTI_GAZ_DT, OTH_REF, H_NAME, DENOTIFY_DATE, DENOTIFY_NUM, 
    ENTRY_DATE, DEL_DATE, SHIFTING_DATE, DENOTIFY_IP, USER_NAME
  ) VALUES (
    ${i.SR_CODE},
    '${i.VILLAGE_CODE}',
    '${i.SURVEY_NO}',
     ${i.SUB_SURVEY_NO !== null && i.SUB_SURVEY_NO !== '' ? `'${i.SUB_SURVEY_NO}'` : "''"},
    ${i.PLOT_NO !== null && i.PLOT_NO !== '' ? `'${i.PLOT_NO}'` : "''"},
    ${i.EXTENT !== null && i.EXTENT !== '' ? `'${i.EXTENT}'` : "''"},
    ${i.UNIT !== null && i.UNIT !== '' ? `'${i.UNIT}'` : "''"},
    ${i.PROHIB_CD !== null && i.PROHIB_CD !== '' ? `'${i.PROHIB_CD}'` : "''"},
    ${i.NOTI_GAZ_NO !== null && i.NOTI_GAZ_NO !== '' ? `'${i.NOTI_GAZ_NO}'` : "''"},
    ${i.NOTI_GAZ_DT !== null && i.NOTI_GAZ_DT !== '' ? `TO_DATE('${i.NOTI_GAZ_DT}','DD-MM-YYYY')` : "''"},
    ${i.OTH_REF !== null && i.OTH_REF !== '' ? `'${i.OTH_REF}'` : "''"},
    ${i.H_NAME !== null && i.H_NAME !== '' ? `'${i.H_NAME}'` : "''"},
    TO_DATE('${i.DENOTIFY_DATE}', 'DD-MM-YYYY'),
    '${i.DENOTIFY_NUM || ''}',
    ${i.ENTRY_DATE !== null && i.ENTRY_DATE !== '' ? `TO_DATE('${i.ENTRY_DATE}', 'DD-MM-YYYY')` : "''"},
    sysdate,
    ${i.SHIFTING_DATE !== null && i.SHIFTING_DATE !== '' ? `TO_DATE('${i.SHIFTING_DATE}', 'DD-MM-YYYY')` : "''"},
    ${i.DENOTIFY_IP !== null && i.DENOTIFY_IP !== '' ? `'${i.DENOTIFY_IP}'` : "''"},
    '${i.USER_NAME || ''}'
  )`;
				}
				  console.log(deleteQuery,'del');
				  console.log(insertQuery,'insert');
				  
				//   console.log(insertQuery);
	
				const response1 = await this.orDao.oDbInsertDocs(deleteQuery);
				const response2 = await this.orDao.oDbInsertDocs(insertQuery);
				if (response1 > 0) {
				  console.log('PDF saved successfully');
				}
				
			  }
			 

			 const  update =`update sromstr.pp_notify_esign  set ESIGN_STATUS='Y' Where NOTIFIED_ID='${reportID}' and sr_code='${selecteddata.DR_CD}'`;
			 console.log(update,'6jhg');
			 
			  const response = await this.orDao.oDbUpdate(update);
			 
			  // Read the saved PDF file and convert it to base64
			  const savedPdf = await fs.readFile(path.resolve(filename));
			  const pdfBase64 = savedPdf.toString('base64');
	  
			  // Return the base64 PDF to the frontend
			  return pdfBase64;
			}
			
		  }
		  return null;
		} catch (ex) {
		  console.error("PPDenotifypendingEsignListSrvc -- prohibitedpropertyServices || Error:", ex);
		  throw ex;
		}
	  };
}


module.exports = ProhibitedPropertyServices;