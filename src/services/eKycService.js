const {doRelease,dbConfig} = require('../plugins/database/oracleDbServices');
const odbDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const {encryptData, decryptData, getPrivateAttendanceStatus,AadharencryptData,AadhardecryptData} = require('../utils/index');
class EkycServices {
	constructor(){
		this.odbDao = new odbDao();
	}

	getAadhar = async(reqData) => {
		try{
			let query = `SELECT * From srouser.tran_ec_aadhar_esign where sr_code =${reqData.sr_code} and book_no =${reqData.book_no} and doct_no =${reqData.doct_no} and reg_year =${reqData.reg_year}`;
			let response = await this.odbDao.oDBQueryService(query)
			for (let party of response) {
				if (party.AADHAR_ENCRPT) {
					try {
						party.AADHAR = party.AADHAR_ENCRPT.length >12 ? AadhardecryptData(party.AADHAR_ENCRPT) : party.AADHAR;  					
					} catch (ex) {
						console.error("AADHAR Decryption failed:", ex);
						party.AADHAR = party.AADHAR;
					}
				}
			}
			return response;
		}catch(ex){
			Logger.error("EkycServices - getAadharNo || Error :", ex);
			console.error("EkycServices - getAadharNo || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	getAadharNoRefusal = async(reqData) => {
		try{
			let query = `SELECT * From srouser.tran_ec_aadhar_esign_refusal where sr_code =${reqData.SR_CODE} and book_no =${reqData.BOOK_NO} and doct_no =${reqData.DOCT_NO} and reg_year =${reqData.REG_YEAR}`;
			let response = await this.odbDao.oDBQueryService(query);
			for (let party of response) {
				if (party.AADHAR_ENCRPT) {
					try {
						party.AADHAR = party.AADHAR_ENCRPT.length >12 ? AadhardecryptData(party.AADHAR_ENCRPT) : party.AADHAR;  					
					} catch (ex) {
						console.error("AADHAR Decryption failed:", ex);
						party.AADHAR = party.AADHAR;
					}
				}
			}
			return response;
		}catch(ex){
			Logger.error("EkycServices - getAadharNoRefusal || Error :", ex);
			console.error("EkycServices - getAadharNoRefusal || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getParties = async(reqData) => {
		try{
			let query = `SELECT * FROM srouser.tran_ec_parties_cr where sr_code =${reqData.sr_code} and book_no =${reqData.book_no} and doct_no =${reqData.doct_no} and reg_year =${reqData.reg_year}`;
			let Parties = await this.odbDao.oDBQueryService(query)	
			for (let party of Parties) {
            if (party.AADHAR_ENCRPT) {
                try {
                    party.AADHAR = party.AADHAR_ENCRPT.length >12 ? AadhardecryptData(party.AADHAR_ENCRPT) : party.AADHAR;  					
                } catch (ex) {
                    console.error("AADHAR Decryption failed:", ex);
					party.AADHAR = party.AADHAR;
                }
            }
        }
			return Parties;
		}catch(ex){
			Logger.error("EkycServices - getParties || Error :", ex);
			console.error("EkycServices - getParties || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getPartiesRefusal = async(reqData) => {
		try{
			let query = `SELECT * FROM srouser.tran_ec_aadhar_esign_refusal where sr_code =${reqData.sr_code} and book_no =${reqData.book_no} and doct_no =${reqData.doct_no} and reg_year =${reqData.reg_year}`;
			let response = await this.odbDao.oDBQueryService(query);
			for (let party of response) {
            if (party.AADHAR_ENCRPT) {
                try {
                    party.AADHAR = party.AADHAR_ENCRPT.length >12 ? AadhardecryptData(party.AADHAR_ENCRPT) : party.AADHAR;  					
                } catch (ex) {
                    console.error("AADHAR Decryption failed:", ex);
					party.AADHAR = party.AADHAR;
                }
            }
        }
			return response;
		}catch(ex){
			Logger.error("EkycServices - getPartiesRefusal || Error :", ex);
			console.error("EkycServices - getPartiesRefusal || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getECPhotosDetails = async(reqData) => {
		try {
			let query = `SELECT * FROM photofp.tran_ec_photos where sr_code =${reqData.sr_code} and book_no =${reqData.book_no} and doct_no =${reqData.doct_no} and reg_year =${reqData.reg_year}`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("EkycServices - getECPhotosDetails || Error :", ex);
			console.error("EkycServices - getECPhotosDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getECPhotosDetailsRefusal = async(reqData) => {
		try {
			let query = `SELECT * FROM photofp.tran_ec_photos_refusal where sr_code =${reqData.sr_code} and book_no =${reqData.book_no} and doct_no =${reqData.doct_no} and reg_year =${reqData.reg_year}`;
			let response = await this.odbDao.oDBQueryService(query)
			return response;
		} catch (ex) {
			Logger.error("EkycServices - getECPhotosDetailsRefusal || Error :", ex);
			console.error("EkycServices - getECPhotosDetailsRefusal || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	saveParty = async (reqData)=>{
		try{
			let base64 = Buffer.from(reqData.PHOTO,'base64');
			let [dd,mm,yyyy] =reqData.DOB.split("-");
			let currentDate = dd +"-"+mm+"-"+yyyy;
			const encryptedAadhar = reqData.AADHAR.length == 12 ? AadharencryptData(reqData.AADHAR) : reqData.AADHAR;
			let query =`Insert into SROUSER.TRAN_EC_AADHAR_ESIGN (AADHAR,A_NAME,CARE_OF,GENDER,DOB,PIN_CODE,AGE,ADDRESS,TIME_STAMP,ADDRESS2,ENTRY_BY,PH_NO,ACCESSED_BY,UDC_SERIAL_NO,CONSENT,SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,CODE,EC_NUMBER,ESIGN,PHOTO,AADHAR_ENCRPT) 
			values(${reqData.AADHAR},'${reqData.A_NAME}','${reqData.CARE_OF}','${reqData.GENDER}',to_date('${currentDate}','DD-MM-YYYY'),${reqData.PIN_CODE},${reqData.AGE},'${reqData.ADDRESS}',SYSDATE,'${reqData.ADDRESS2}','${reqData.ENTRY_BY}',${reqData.PH_NO},'${reqData.ACCESSED_BY}',${reqData.UDC_SERIAL_NO},'${reqData.CONSENT}',${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.CODE}',${reqData.EC_NUMBER},'${reqData.ESIGN}',:blobData,'${encryptedAadhar}')`
			let response = await this.odbDao.oDbInsertBlobDocs(query,base64);
			if(response <1){
				throw new Error("Bad Request")
			}
			return response;
		}catch(ex){
			Logger.error("EkycServices - saveParty || Error :", ex);
			console.error("EkycServices - saveParty || Error :", ex);
			throw constructCARDError(ex);
		}

	}

	savePartyRefusal = async (reqData)=>{
		try{
			let base64 = Buffer.from(reqData.PHOTO,'base64');
			let [dd,mm,yyyy] =reqData.DOB.split("-");
			let currentDate = dd +"-"+mm+"-"+yyyy;
			const encryptedAadhar = reqData.AADHAR.length == 12 ? AadharencryptData(reqData.AADHAR) : reqData.AADHAR;
			let query =`Insert into SROUSER.TRAN_EC_AADHAR_ESIGN_REFUSAL (AADHAR,A_NAME,CARE_OF,GENDER,DOB,PIN_CODE,AGE,ADDRESS,TIME_STAMP,ADDRESS2,ENTRY_BY,PH_NO,ACCESSED_BY,UDC_SERIAL_NO,CONSENT,SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,CODE,EC_NUMBER,ESIGN,PHOTO, AADHAR_ENCRPT) 
			values(${reqData.AADHAR},'${reqData.A_NAME}','${reqData.CARE_OF}','${reqData.GENDER}',to_date('${currentDate}','DD-MM-YYYY'),${reqData.PIN_CODE},${reqData.AGE},'${reqData.ADDRESS}',SYSDATE,'${reqData.ADDRESS2}','${reqData.ENTRY_BY}',${reqData.PH_NO},'${reqData.ACCESSED_BY}',${reqData.UDC_SERIAL_NO},'${reqData.CONSENT}',${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.CODE}',${reqData.EC_NUMBER},'${reqData.ESIGN}',:blobData,'${encryptedAadhar}')`
			let response = await this.odbDao.oDbInsertBlobDocs(query,base64);
			if(response <1){
				throw new Error("Bad Request")
			}
			return response;
		}catch(ex){
			Logger.error("EkycServices - savePartyRefusal || Error :", ex);
			console.error("EkycServices - savePartyRefusal || Error :", ex);
			throw constructCARDError(ex);
		}

	}

	savePhotoSvc = async (reqData)=>{
        try{
            let buffer_base64 = null
            if (reqData.CAPTURE !== "PHOTO") {
                buffer_base64 = Buffer.from(reqData.FINGER, 'base64');
            }
            else {
                buffer_base64 = Buffer.from(reqData.PHOTO, 'base64');
            }
            let response, query;
            if (reqData.CAPTURE !== "PHOTO") {
                if(!reqData.RECAPTURE){
                 query =`Insert into PHOTOFP.TRAN_EC_PHOTOS (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,EC_NUMBER,CODE,PHOTO,PHOTO_SIZE,FINGER,FINGER_SIZE,PHOTO_TAKEN_BY,FP_TAKEN,TIME_STAMP,TI_QTY) values (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.EC_NUMBER},'${reqData.CODE}',${reqData.PHOTO},${reqData.PHOTO_SIZE},:blobData,${reqData.FINGER_SIZE},'${reqData.PHOTO_TAKEN_BY}','${reqData.FP_TAKEN}',SYSDATE,${reqData.TI_QTY})`
                } else {
                    query = `UPDATE PHOTOFP.TRAN_EC_PHOTOS set time_stamp = sysdate, FINGER_SIZE = ${reqData.FINGER_SIZE}, FINGER = :blobData where sr_code = ${reqData.SR_CODE} and BOOK_NO = ${reqData.BOOK_NO} and DOCT_NO = ${reqData.DOCT_NO} and REG_YEAR = ${reqData.REG_YEAR} and EC_NUMBER = ${reqData.EC_NUMBER} and CODE = '${reqData.CODE}'`;
                }
            } else {
                query = `UPDATE PHOTOFP.TRAN_EC_PHOTOS set time_stamp = sysdate, PHOTO_SIZE = ${reqData.PHOTO_SIZE}, PHOTO = :blobData where sr_code = ${reqData.SR_CODE} and BOOK_NO = ${reqData.BOOK_NO} and DOCT_NO = ${reqData.DOCT_NO} and REG_YEAR = ${reqData.REG_YEAR} and EC_NUMBER = ${reqData.EC_NUMBER} and CODE = '${reqData.CODE}'`;
            }
            response = await this.odbDao.oDbInsertBlobDocs(query,buffer_base64);
            if(response <1){
                throw new Error("Bad Request")
            }
            return response;
        }catch(ex){
            Logger.error("EkycServices - saveParty || Error :", ex);
            console.error("EkycServices - saveParty || Error :", ex);
            throw constructCARDError(ex);
        }
    }
 
	savePhotoSvcRefusal = async (reqData)=>{
		try{
			let base64 = Buffer.from(reqData.FINGER,'base64');
			let response, query;
			if(!reqData.RECAPTURE){
				 query =`Insert into PHOTOFP.TRAN_EC_PHOTOS_REFUSAL (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,EC_NUMBER,CODE,PHOTO,PHOTO_SIZE,FINGER,FINGER_SIZE,PHOTO_TAKEN_BY,FP_TAKEN,TIME_STAMP,TI_QTY) values (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.EC_NUMBER},'${reqData.CODE}',${reqData.PHOTO},${reqData.PHOTO_SIZE},:blobData,${reqData.FINGER_SIZE},'${reqData.PHOTO_TAKEN_BY}','${reqData.FP_TAKEN}',SYSDATE,${reqData.TI_QTY})`
			} else {
			     query = `UPDATE PHOTOFP.TRAN_EC_PHOTOS_REFUSAL set time_stamp = sysdate, FINGER_SIZE = ${reqData.FINGER_SIZE}, FINGER = :blobData where sr_code = ${reqData.SR_CODE} and BOOK_NO = ${reqData.BOOK_NO} and DOCT_NO = ${reqData.DOCT_NO} and REG_YEAR = ${reqData.REG_YEAR} and EC_NUMBER = ${reqData.EC_NUMBER} and CODE = '${reqData.CODE}'`;
			}
			response = await this.odbDao.oDbInsertBlobDocs(query,base64);
			if(response <1){
				throw new Error("Bad Request")
			}
			return response;
		}catch(ex){
			Logger.error("EkycServices - savePhotoSvcRefusal || Error :", ex);
			console.error("EkycServices - savePhotoSvcRefusal || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	saveWPhotoSvc = async (reqData)=>{
		try{
			let base64 = Buffer.from(reqData.FINGER,'base64');
			let base642 = Buffer.from(reqData.PHOTO, 'base64');
			reqData.ADDRESS = reqData.ADDRESS && typeof reqData.ADDRESS === 'string' ? reqData.ADDRESS.substring(0, reqData.ADDRESS.length > 90 ? 90 : reqData.ADDRESS.length) : ''; 
			const encryptedAadhar = reqData.AADHAR.length == 12 ? AadharencryptData(reqData.AADHAR) : reqData.AADHAR;
			let query =`Insert into PHOTOFP.TRAN_EC_WITNESS_PHOTOS (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,WITNESS_NUMBER,WITNESS_NAME,ADDRESS,AGE,PHOTO,PHOTO_SIZE,FINGER,FINGER_SIZE,PHOTO_TAKEN_BY,FP_TAKEN,TIME_STAMP,TI_QTY,AADHAR,AADHAR_ENCRPT) values (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.WITNESS_NUMBER},'${reqData.WITNESS_NAME}','${reqData.ADDRESS}',${reqData.AGE},:blobData2,${reqData.PHOTO_SIZE},:blobData,${reqData.FINGER_SIZE},'${reqData.PHOTO_TAKEN_BY}','${reqData.FP_TAKEN}',SYSDATE,${reqData.TI_QTY},${reqData.AADHAR},'${encryptedAadhar}')`
			let response = await this.odbDao.oDbInsertBlobDocs(query,base64, base642);
			if(response <1){
				throw new Error("Bad Request")
			}
			return response;
		}catch(ex){
			Logger.error("EkycServices - saveWPhotoSvc || Error :", ex);
			console.error("EkycServices - saveWPhotoSvc || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	saveWPhotoSvcRefusal = async (reqData)=>{
		try{
			let base64 = Buffer.from(reqData.FINGER,'base64');
			let base642 = Buffer.from(reqData.PHOTO, 'base64');
			reqData.ADDRESS = reqData.ADDRESS && typeof reqData.ADDRESS === 'string' ? reqData.ADDRESS.substring(0, reqData.ADDRESS.length > 90 ? 90 : reqData.ADDRESS.length) : ''; 
			const encryptedAadhar = reqData.AADHAR.length == 12 ? AadharencryptData(reqData.AADHAR) : reqData.AADHAR;
			let query =`Insert into PHOTOFP.TRAN_EC_WITNESS_PHOTOS_refusal (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,WITNESS_NUMBER,WITNESS_NAME,ADDRESS,AGE,PHOTO,PHOTO_SIZE,FINGER,FINGER_SIZE,PHOTO_TAKEN_BY,FP_TAKEN,TIME_STAMP,TI_QTY,AADHAR,AADHAR_ENCRPT) values (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.WITNESS_NUMBER},'${reqData.WITNESS_NAME}','${reqData.ADDRESS}',${reqData.AGE},:blobData2,${reqData.PHOTO_SIZE},:blobData,${reqData.FINGER_SIZE},'${reqData.PHOTO_TAKEN_BY}','${reqData.FP_TAKEN}',SYSDATE,${reqData.TI_QTY},${reqData.AADHAR},'${encryptedAadhar}')`
			let response = await this.odbDao.oDbInsertBlobDocs(query,base64, base642);
			if(response <1){
				throw new Error("Bad Request")
			}
			return response;
		}catch(ex){
			Logger.error("EkycServices - saveWPhotoSvcRefusal || Error :", ex);
			console.error("EkycServices - saveWPhotoSvcRefusal || Error :", ex);
			throw constructCARDError(ex);
		}
	}


	getWitnessDetails = async(reqData) => {
		try {
			let query = `select * from photofp.tran_ec_witness_photos where SR_CODE =${reqData.SR_CODE} and BOOK_NO =${reqData.BOOK_NO} and DOCT_NO =${reqData.DOCT_NO} and REG_YEAR =${reqData.REG_YEAR}`;
			let Witnesses = await this.odbDao.oDBQueryService(query);
			for (let witness of Witnesses) {
            if (witness.AADHAR_ENCRPT) {
                try {
                    witness.AADHAR = witness.AADHAR_ENCRPT.length >12 ? AadhardecryptData(witness.AADHAR_ENCRPT) : witness.AADHAR;  					
                } catch (ex) {
                    console.error("AADHAR Decryption failed:", ex);
					witness.AADHAR = witness.AADHAR;
                }
            }
		} 
		return Witnesses;
	} catch (ex) {
			Logger.error("EkycServices - getWitnessDetails || Error :", ex);
			console.error("EkycServices - getWitnessDetails || Error :", ex);
			throw constructCARDError(ex);
		}
	}

	getWitnessDetailsRefusal = async(reqData) => {
		try {
			let query = `select * from photofp.tran_ec_witness_photos_refusal where SR_CODE =${reqData.SR_CODE} and BOOK_NO =${reqData.BOOK_NO} and DOCT_NO =${reqData.DOCT_NO} and REG_YEAR =${reqData.REG_YEAR}`;
			let response = await this.odbDao.oDBQueryService(query)
			for (let refusalwitness of response) {
            if (refusalwitness.AADHAR_ENCRPT) {
                try {
                    refusalwitness.AADHAR = refusalwitness.AADHAR_ENCRPT.length >12 ? AadhardecryptData(refusalwitness.AADHAR_ENCRPT) : refusalwitness.AADHAR;  					
                } catch (ex) {
                    console.error("AADHAR Decryption failed:", ex);
					refusalwitness.AADHAR = refusalwitness.AADHAR;
                }
            }
		} 
		 return response;
		} catch (ex) {
			Logger.error("EkycServices - getWitnessDetailsRefusal || Error :", ex);
			console.error("EkycServices - getWitnessDetailsRefusal || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	b64toBlob = async(b64Data, contentType, sliceSize) =>{
		contentType = contentType || "";
		sliceSize = sliceSize || 512;
		var byteCharacters = Buffer.from(b64Data, 'base64');
		var byteArrays = [];
		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);
		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
			byteNumbers[i] = String(slice).charCodeAt(i);
		}
		var byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
		}
		console.log(byteArrays);
		return byteArrays
	}

	saveParties = async (arr)=>{
        try{
            for(let reqData of arr){
                let buffer_base64 = Buffer.from(reqData.PHOTO,'base64');
                let DATEOFBIRTH = "";
                if (reqData.DOB) {
                    let [dd,mm,yyyy] =reqData.DOB.split("-");
                    DATEOFBIRTH = dd +"-"+mm+"-"+yyyy;
                }
			const encryptedAadhar = reqData.AADHAR.length == 12 ? AadharencryptData(reqData.AADHAR) : reqData.AADHAR;
            let query =`Insert into SROUSER.TRAN_EC_AADHAR_ESIGN (AADHAR,A_NAME,CARE_OF,GENDER,DOB,PIN_CODE,AGE,ADDRESS,TIME_STAMP,ADDRESS2,ENTRY_BY,PH_NO,ACCESSED_BY,UDC_SERIAL_NO,CONSENT,SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,CODE,EC_NUMBER,ESIGN,PHOTO,DN_QUALIFIER,AADHAR_ENCRPT)
                        values('${reqData.AADHAR}','${reqData.A_NAME}','${reqData.CARE_OF}','${reqData.GENDER}',to_date('${DATEOFBIRTH}','DD-MM-YYYY'),${reqData.PIN_CODE},${reqData.AGE},'${reqData.ADDRESS}',SYSDATE,'${reqData.ADDRESS2}','${reqData.ENTRY_BY}',${reqData.PH_NO},'${reqData.ACCESSED_BY}',${reqData.UDC_SERIAL_NO},'${reqData.CONSENT}',${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.CODE}',${reqData.EC_NUMBER},'${reqData.ESIGN}',:blobData,'${reqData.DN_QUALIFIER}','${encryptedAadhar}')`
            let response = await this.odbDao.oDbInsertBlobDocs(query,buffer_base64);
            }
            return true;
        }catch(ex){
            Logger.error("EkycServices - saveParties || Error :", ex);
            console.error("EkycServices - saveParties || Error :", ex);
            throw constructCARDError(ex);
        }
   
    }

	savePartiesRefusal = async (arr)=>{
		try{
			for(let reqData of arr){
				let base64 = Buffer.from(reqData.PHOTO,'base64');
			let [dd,mm,yyyy] =reqData.DOB.split("-");
			let currentDate = dd +"-"+mm+"-"+yyyy;
			const encryptedAadhar = reqData.AADHAR.length == 12 ? AadharencryptData(reqData.AADHAR) : reqData.AADHAR;
			let query =`Insert into SROUSER.TRAN_EC_AADHAR_ESIGN_REFUSAL (AADHAR,A_NAME,CARE_OF,GENDER,DOB,PIN_CODE,AGE,ADDRESS,TIME_STAMP,ADDRESS2,ENTRY_BY,PH_NO,ACCESSED_BY,UDC_SERIAL_NO,CONSENT,SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,CODE,EC_NUMBER,ESIGN,PHOTO,DN_QUALIFIER, AADHAR_ENCRPT) 
			values(${reqData.AADHAR},'${reqData.A_NAME}','${reqData.CARE_OF}','${reqData.GENDER}',to_date('${currentDate}','DD-MM-YYYY'),${reqData.PIN_CODE},${reqData.AGE},'${reqData.ADDRESS}',SYSDATE,'${reqData.ADDRESS2}','${reqData.ENTRY_BY}',${reqData.PH_NO},'${reqData.ACCESSED_BY}',${reqData.UDC_SERIAL_NO},'${reqData.CONSENT}',${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.CODE}',${reqData.EC_NUMBER},'${reqData.ESIGN}',:blobData,'${reqData.DN_QUALIFIER}','${encryptedAadhar}')`
			let response = await this.odbDao.oDbInsertBlobDocs(query,base64);
			}
			return true;
		}catch(ex){
			Logger.error("EkycServices - savePartiesRefusal || Error :", ex);
			console.error("EkycServices - savePartiesRefusal || Error :", ex);
			throw constructCARDError(ex);
		}
	
	}
	getverifyTidcoZeroTwo = async (reqData) => {
		try{
		   let query = `select a.*,b.*from pde_doc_status_cr a  join  preregistration.pre_registration_cca b on a.APP_ID=b.ID where a.SR_CODE =${reqData.SR_CODE} and a.BOOK_NO =${reqData.BOOK_NO} and a.DOCT_NO =${reqData.DOCT_NO} and a.REG_YEAR =${reqData.REG_YEAR}`;
		   let response = await this.odbDao.oDBQueryService(query)
		   return response;
		} catch (ex) {
		  Logger.error("EkycServices - getverifyTidcoZeroTwo || Error :", ex);
		  console.error("EkycServices - getverifyTidcoZeroTwo || Error :", ex);
		  throw constructCARDError(ex);
		}
	  }
	  getTidcoAadharWitness = async (reqData) => {
        try{
		   let decryptedAadhar  = reqData.aadhar && reqData.aadhar.length > 12 ? decryptData(reqData.aadhar) : reqData.aadhar;
           let query = `select * from card.Tidco_witness where aadhar = ${decryptedAadhar}`;
		   let response = await this.odbDao.oDBQueryService(query)
           return response;
        } catch (ex) {
          Logger.error("EkycServices - getTidcoAadharWitness || Error :", ex);
          console.error("EkycServices - getTidcoAadharWitness || Error :", ex);
          throw constructCARDError(ex);
        }
    }

	saveEkycExemptionDetailsService = async (reqData) => {
		try {
			const checkQuery = `SELECT COUNT(1) AS COUNT FROM SROUSER.EKYC_EXEMPTION_STATUS WHERE APP_ID = :applicationId`;
			const bindParams = {
				applicationId: reqData.applicationId,
				executants: reqData.executants ? 'Y' : 'N',
				claimants: reqData.claimants ? 'Y' : 'N',
				witness: reqData.witness ? 'Y' : 'N',
			};

			const checkResult = await this.odbDao.oDBQueryServiceWithBindParams(checkQuery, { applicationId: bindParams.applicationId });

			let query = '';
			if (checkResult[0].COUNT > 0) {
				query = `UPDATE SROUSER.EKYC_EXEMPTION_STATUS 
						SET EXECUTANTS = :executants, CLAIMANTS = :claimants, WITNESS = :witness, TIME_STAMP = SYSDATE 
						WHERE APP_ID = :applicationId`;
			} else {
				query = `INSERT INTO SROUSER.EKYC_EXEMPTION_STATUS (APP_ID, EXECUTANTS, CLAIMANTS, WITNESS) 
						VALUES (:applicationId, :executants, :claimants, :witness)`;
			}

			const response = await this.odbDao.oDBQueryServiceWithBindParams(query, bindParams);
			return response;

		} catch (ex) {
			Logger.error("EkycServices - saveEkycExemptionDetailsService || Error :", ex);
			console.error("EkycServices - saveEkycExemptionDetailsService || Error :", ex);
			throw constructCARDError(ex);
		}
	};

	getExemptionDetailsService = async(reqData) => {
		try {
			let query =`Select * from SROUSER.EKYC_EXEMPTION_STATUS WHERE APP_ID = :applicationId`;
			const bindParams = {
               applicationId: reqData.applicationId
            };
			let response = await this.odbDao.oDBQueryServiceWithBindParams(query, bindParams);
			const responsedata = response.map((item) => ({
				applicationId : item.APP_ID,
				executants : item.EXECUTNATS === 'Y' ? true : false,
				claimants : item.CLAIMANTS === 'Y' ? true : false,
				witness : item.WTITNESS === 'Y' ? true : false
			}))
			return responsedata.length > 0 ? responsedata[0] : {};
		} catch (ex) {
			Logger.error("EkycServices - getExemptionDetailsService || Error :", ex);
			console.error("EkycServices - getExemptionDetailsService || Error :", ex);
			throw constructCARDError(ex);
		}
	}
	
	GetValidateQrData = async (reqData) => {
  try {
    const { CODE, SR_CODE, BOOK_NO, REG_YEAR, DOCT_NO, EC_NUMBER, AADHAR } = reqData;
    let ecStatus = 'N';
    if (CODE && CODE.substring(0, 2) !== 'WT') {
      const ecQuery = `
        SELECT 
          CASE 
            WHEN COUNT(*) > 0 THEN 'Y' 
            ELSE 'N' 
          END AS status 
        FROM srouser.tran_ec
        WHERE sr_code = :sr_code
          AND book_no = :book_no
          AND reg_year = :reg_year
          AND doct_no = :doct_no
          AND code = :code
          AND ec_number = :ec_number
          AND aadhar = :aadhar_number`;

      const bindParams = {
        sr_code: SR_CODE,
        book_no: BOOK_NO,
        reg_year: REG_YEAR,
        doct_no: DOCT_NO,
        code: CODE.substring(0, 2),
        ec_number: EC_NUMBER,
        aadhar_number: AADHAR
      };

      const Result = await this.odbDao.oDBQueryServiceWithBindParams(ecQuery, bindParams);
      ecStatus = Result?.[0]?.STATUS || 'N';
    } else {
      ecStatus = 'Y';
    }
    const isPrivate = await getPrivateAttendanceStatus(this.odbDao, {
      sr_code: SR_CODE,
      doct_no: DOCT_NO,
      reg_year: REG_YEAR,
      book_no: BOOK_NO
    });

    return [{ status: ecStatus, isPrivateAttendance: isPrivate }];

  } catch (ex) {
    Logger.error("EkycServices || ValidateQrData || Error :", ex);
    throw constructCARDError(ex);
  }
};
};


module.exports = EkycServices;