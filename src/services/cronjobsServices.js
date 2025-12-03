const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const OrDaoRead = require('../dao/oracledbReadDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const fsone = require("fs");
const path = require("path");
const fs = require("fs").promises;
const { log } = require("util");
const axios = require("axios");
const https = require('https');
const moment = require("moment");


let instance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false
	})
  });
class CronJobServices {
	constructor() {
		this.orDao = new OrDao();
		this.orDaoRead = new OrDaoRead();
	}
	

    fileTimestampfinderSrvc = async (reqData) => {
		const results = [];
		
		// const fromDate = new Date('2023-08-23');
		// const toDate = new Date();
        // const formattedDate = toDate.toISOString().split('T')[0];
		const fromDate = new Date(reqData.FROM_DATE);
		const toDate = new Date(reqData.TO_DATE);
		const types = ['signedEndorsementDocument', 'endorsement','signedCertificateOfRegistration']; 
		for (const type of types) {
            let conditionField = '';
            let timestampField = '';
			console.log(type,'12345');
			
            if (type === 'endorsement') {
                conditionField = "DOC_ENDORS = 'Y'";
                timestampField = 'ENDORS_TIME_STAMP';

			} else if (type === 'signedEndorsementDocument') {
                conditionField = "DOC_ESIGN = 'Y'";
                timestampField = 'DOC_ESIGN_TIME_STAMP';

			} else if (type === 'signedCertificateOfRegistration') {
                conditionField = "DOC_COR = 'Y'";
                timestampField = 'DOC_COR_ESIGN_TIME_STAMP';
            }
			console.log(conditionField,'*****************');
			// /pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/

		  let query = `SELECT sr_code, book_no, doct_no, reg_year FROM pde_doc_status_cr WHERE ${conditionField} and TRUNC(time_stamp) BETWEEN TO_DATE(:FROM_DATE, 'YYYY-MM-DD') AND TO_DATE(:TO_DATE, 'YYYY-MM-DD') `;
		  console.log(query, 'query');

		  let bindparam = {
			FROM_DATE: moment(fromDate).format("YYYY-MM-DD"),
			TO_DATE: moment(toDate).format("YYYY-MM-DD")
		  }

		  console.log(JSON.stringify(bindparam), 'bindparam');
		  
		  let documents = await this.orDaoRead.oDBQueryService(query, bindparam);		  
	  
		  for (const doc of documents) {
			const { SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR } = doc;
			const remoteFileUrl = `${process.env.FILE_PATH_TIME}/${SR_CODE}/${BOOK_NO}/${DOCT_NO}/${REG_YEAR}/${type}.pdf`;
	  
			try {
			  const response = await axios.head(remoteFileUrl);
			  const lastModified = new Date(response.headers['last-modified']);
	  
			  if (lastModified >= fromDate && lastModified <= toDate) {
				const updateQuery = `
				  UPDATE PDE_DOC_STATUS_CR 
				  SET ${timestampField} = :TIME_STAMP 
				  WHERE SR_CODE = :SR_CODE 
					AND DOCT_NO = :DOCT_NO 
					AND REG_YEAR = :REG_YEAR 
					AND BOOK_NO = :BOOK_NO
				`;
	  
				const bindParams = {
				  SR_CODE: SR_CODE,
				  BOOK_NO: BOOK_NO,
				  DOCT_NO: DOCT_NO,
				  REG_YEAR: REG_YEAR,
				  TIME_STAMP: lastModified
				};
	  
				await this.orDao.oDbInsertDocsWithBindParams(updateQuery, bindParams);
	  
				results.push({
				  TYPE: type,
				  SR_CODE,
				  BOOK_NO,
				  DOCT_NO,
				  REG_YEAR,
				  lastModified: lastModified.toISOString()
				});
			  }
			} catch (error) {
			  if (error.response && error.response.status === 404) {
				console.log(`File not found: ${remoteFileUrl}`);
			  } else {
				console.error(`Error accessing file ${remoteFileUrl}:`, error.message);
			  }
			}
		  }
		}
	  
		// console.log('Processed Files:', results);
		return results;
	  };
	  

}

module.exports = CronJobServices;