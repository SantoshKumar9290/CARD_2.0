const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const odbDao = require('../dao/oracledbDao');
const { Logger } = require('../../services/winston');
const fs = require('fs');
class ScanningServices {
	constructor() {
		this.odbDao = new odbDao();
	}

	saveScannedImgSrvc = async (reqData) => {
		try {
            let base64 = Buffer.from(reqData.IMAGE,'base64');
            let query = `Insert into scanuser.img_base_cca (SRO_CODE,BOOK_NO,DOCT_NO,REG_YEAR,DOCT_ID,IMAGE,FILE_SIZE,CD_VOL_NO,RDOCT_NO,RYEAR,SIGNED,SIGNEDBY,SIGNEDDATE,PAGECNT,SCAN_DATE,SCAN_BY,LOCATION,RESIGN_CNT,SIGN_TYPE,SIGN_DEVICE,BIO_AUTH_BY) values (${reqData.SRO_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.DOCT_ID},:blobData,${reqData.FILE_SIZE},${reqData.CD_VOL_NO},${reqData.RDOCT_NO},${reqData.RYEAR},'${reqData.SIGNED}',${reqData.SIGNEDBY},${reqData.SIGNEDDATE},${reqData.PAGECNT},TO_DATE('${reqData.SCAN_DATE}','DD-MM-YYYY'),${reqData.SCAN_BY},${reqData.LOCATION},${reqData.RESIGN_CNT},${reqData.SIGN_TYPE},${reqData.SIGN_DEVICE},${reqData.BIO_AUTH_BY})`;
            let result = await this.odbDao.oDbInsertBlobDocs(query,base64);
			return result;
		} catch (ex) {
			Logger.error("ScanningHandler - saveScannedImgSrvc || Error : ", ex);
			console.error("ScanningHandler - saveScannedImgSrvc || Error : ", ex);
			throw new CARDError({ err: ex });
		}
	}
	getScannedImgSrvc = async (reqData) => {
		try {
            let query = `SELECT * From scanuser.img_base_cca where sro_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and doct_no=${reqData.DOCT_NO} and reg_year=${reqData.REG_YEAR}`;
            let result = await this.odbDao.oDBQueryService(query);
			return result;
		} catch (ex) {
			Logger.error("ScanningHandler - getScannedImgSrvc || Error : ", ex);
			console.error("ScanningHandler - getScannedImgSrvc || Error : ", ex);
			throw new CARDError({ err: ex });
		}
	}
updateStatusSrvc = async (reqData) => {
		try {
            let query = `UPDATE scanuser.img_base_cca set signed='Y', signedby=:signBy, signeddate=SYSDATE, location=:location where sro_code=:srCode and book_no=:booNo and doct_no=:doctNo and reg_year=:regYear`;
			let bind = { signBy: reqData.SIGNEDBY, location: reqData.LOCATION, srCode: reqData.SR_CODE,  booNo: reqData.BOOK_NO, doctNo: reqData.DOCT_NO, regYear: reqData.REG_YEAR }
            let result = await this.odbDao.oDbInsertDocsWithBindParams(query,bind);
			if (result>0){
			const selectQuery = `SELECT pr.*, rp.*  
                                 FROM tran_major pr
                                 JOIN tran_ec rp ON pr.sr_code = rp.sr_code AND pr.book_no = rp.book_no AND pr.doct_no = rp.doct_no AND pr.p_code = rp.code and upper(pr.p_name) = upper(rp.name) 
			                     WHERE pr.sr_code=:srCode and pr.book_no=:booNo and pr.doct_no=:doctNo and pr.reg_year=:regYear`;
            const binds = { srCode: reqData.SR_CODE, booNo: reqData.BOOK_NO, doctNo: reqData.DOCT_NO, regYear: reqData.REG_YEAR};	
			console.log("kumart",binds);
			console.log("kumart11",selectQuery);
			const result1 = await this.odbDao.oDBQueryServiceWithBindParams(selectQuery, binds);

			if (result1.length > 0) {
				let templateId = '1007413280044925001';
				let message= `APIGRS - Your document is registered as No. ${result1[0].RDOCT_NO}/${result1[0].REG_YEAR}  at SRO-${result1[0].SR_CODE} and ready for delivery.`;				
				let phoneNo = result1[0].PHONE_NO + "";
				let data = {
					"phoneNos": phoneNo,
					"templateId": templateId,
					"smsMessage" : message
				  }
				  const headers = {
					'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJ1c2VySWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJsb2dpbkVtYWlsIjoiIiwibG9naW5OYW1lIjoiU1VESEFLQVIiLCJsb2dpbk1vYmlsZSI6IjkxNjAwNjE4MDAiLCJsb2dpblR5cGUiOiJVU0VSIiwiYWFkaGFyIjowLCJpYXQiOjE2ODQ4NDQ5MjUsImV4cCI6MTY4NDg0NjcyNX0.ZOe8d6YV32aF-Dr6n9DJesWVhU4tEf2tRHUUHVnHkQcnZ1kbhJLrwah7xe79GWSdQDUb7B0N3ZHKSW43U8QdbCLCYnA7ntqWkIxjdu6TbK8z8tDL_naTSFs5CRBXovlYAqNzxhHNXAhk-5xkgdwa0h8XnNZD-R3wfzYYgfSuyz28XMaUbywdxvvuo-CMTqcYeelFE7CVxA97yca9jikIGCn-w6yz4_r194TJcwuJ45SJrI9UoKVWJGl41NV5UI_--DzHyz4caZUcOTGzhD5uRQm-y1ZVtYo_ncR8UkPR4N9GuOzT8meYg2jr8g53cbi4X9gveZwNmYdSuGTrpqdn9cjt4FtFi1kMrENxqVnSGWlaUI2FJi9EDOXD7Pg2yTmStYLhXwKTr5GNct3ZbS74oHfpkX_Fz0IdLNx0_EXyAHvKSoucy8n6A7kabQVD5f5xhmOa8Z5ejNEjl7jBj67FN7i0xavXy4gTy28MeLU-u0Hgo8RisQ66CnbB8GAymwpkU3CYe6p5l6cYvdXPvr90ovz1e6Zsj92r2n8ycihU67UVLZSmaBXUQAhXHrJg5gGlw3_x6IzPr-mre_Cj8oVgU5i9NMKFmn_hBVzA82hcsKC2PYuEL6yAIpATlFVEISrwOypNcB2oiENbZXi64_GLt-ROfK1NWgaERFARo_61kH0',
					'Content-Type': 'application/json'
				};  
				let smsResponse = await instance({ method: "POST", url: `${process.env.PDE_HOST}/pdeapi/v1/users/sendSMS`, headers: headers, data:data });				
			} else {
				const selectQuerys = `SELECT tf.*,cf.*,da.* FROM tran_ec_firms tf 
				                      JOIN preregistration.executants_claimant_firms cf ON tf.code = cf.code and tf.name = cf.name and tf.r_code = cf.r_code
									  JOIN doc_ack da ON da.sr_code=tf.sr_code and da.book_no=tf.book_no and da.doct_no=tf.doct_no and da.reg_year=tf.reg_year
				                      WHERE tf.sr_code=:srCode and tf.book_no=:booNo and tf.doct_no=:doctNo and tf.reg_year=:regYear`;
                const bindps = { srCode: reqData.SR_CODE, booNo: reqData.BOOK_NO, doctNo: reqData.DOCT_NO, regYear: reqData.REG_YEAR};	
				const result2 = await this.odbDao.oDBQueryServiceWithBindParams(selectQuerys, bindps);

				if (result2.length > 0){
				   let templateId = '1007413280044925001';
				   let message= `APIGRS - Your document is registered as No. ${result2[0].RDOCT_NO}/${result2[0].REG_YEAR}  at SRO-${result2[0].SR_CODE} and ready for delivery.`;
				   let phoneNo = result2[0].PHONE_NO + "";
				   let data = {
					 "phoneNos": phoneNo,
					 "templateId": templateId,
					 "smsMessage" : message
				    }
				  const headers = {
					'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJ1c2VySWQiOiI2NDQ4MTMwMTk4N2Y0OGUzNGQ1MTMxYTciLCJsb2dpbkVtYWlsIjoiIiwibG9naW5OYW1lIjoiU1VESEFLQVIiLCJsb2dpbk1vYmlsZSI6IjkxNjAwNjE4MDAiLCJsb2dpblR5cGUiOiJVU0VSIiwiYWFkaGFyIjowLCJpYXQiOjE2ODQ4NDQ5MjUsImV4cCI6MTY4NDg0NjcyNX0.ZOe8d6YV32aF-Dr6n9DJesWVhU4tEf2tRHUUHVnHkQcnZ1kbhJLrwah7xe79GWSdQDUb7B0N3ZHKSW43U8QdbCLCYnA7ntqWkIxjdu6TbK8z8tDL_naTSFs5CRBXovlYAqNzxhHNXAhk-5xkgdwa0h8XnNZD-R3wfzYYgfSuyz28XMaUbywdxvvuo-CMTqcYeelFE7CVxA97yca9jikIGCn-w6yz4_r194TJcwuJ45SJrI9UoKVWJGl41NV5UI_--DzHyz4caZUcOTGzhD5uRQm-y1ZVtYo_ncR8UkPR4N9GuOzT8meYg2jr8g53cbi4X9gveZwNmYdSuGTrpqdn9cjt4FtFi1kMrENxqVnSGWlaUI2FJi9EDOXD7Pg2yTmStYLhXwKTr5GNct3ZbS74oHfpkX_Fz0IdLNx0_EXyAHvKSoucy8n6A7kabQVD5f5xhmOa8Z5ejNEjl7jBj67FN7i0xavXy4gTy28MeLU-u0Hgo8RisQ66CnbB8GAymwpkU3CYe6p5l6cYvdXPvr90ovz1e6Zsj92r2n8ycihU67UVLZSmaBXUQAhXHrJg5gGlw3_x6IzPr-mre_Cj8oVgU5i9NMKFmn_hBVzA82hcsKC2PYuEL6yAIpATlFVEISrwOypNcB2oiENbZXi64_GLt-ROfK1NWgaERFARo_61kH0',
					'Content-Type': 'application/json'
				  };  
				  let smsResponse = await instance({ method: "POST", url: `${process.env.PDE_HOST}/pdeapi/v1/users/sendSMS`, headers: headers, data:data });
  			    } 
			}
		}
			return result;
		} catch (ex) {
			Logger.error("ScanningHandler - updateStatusSrvc || Error : ", ex);
			console.error("ScanningHandler - updateStatusSrvc || Error : ", ex);
			throw new CARDError({ err: ex });
		}
	}

	scannedSchedulerSrvc = async () =>{
		try {
			let query = `select sro_code,book_no,doct_no,reg_year from scanuser.img_base_cca where trunc(signeddate) <=  trunc(sysdate) - 10 and location is not null and  rownum <= 20000`;
			let result = await this.odbDao.oDBQueryService(query);
			for(let data of result){
				let filePath = process.env.FILE_DELETE_PATH + `uploads/${data.SRO_CODE}/${data.BOOK_NO}/${data.DOCT_NO}/${data.REG_YEAR}/originalScannedDocument.pdf`;
				let scanFilePath = process.env.FILE_DELETE_PATH + `uploads/${data.SRO_CODE}/${data.BOOK_NO}/${data.DOCT_NO}/${data.REG_YEAR}/scannedFinalDocument.pdf`;
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath)
				}
				if (fs.existsSync(scanFilePath)) {
					fs.unlinkSync(scanFilePath)
				}
			}
			return "Success"
		} catch (error) {
			console.error("ScanningServices - scannedSchedulerSrvc || Error:", error);
			return "Failed"
		}
	}
};


module.exports = ScanningServices;