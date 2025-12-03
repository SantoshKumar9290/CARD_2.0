const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const odbDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const {getPrivateAttendanceStatus,AadhardecryptData,AadharencryptData} = require('../utils/index');

class DocumentHandoverServices {
    constructor() {
        this.odbDao = new odbDao();
    }

    getNominee = async (reqData) => {
        try {
            let query = `select * FROM SROUSER.TRAN_NOMINE where sr_code=:sr_code and book_no=:book_no and doct_no=:doct_no and reg_year=:reg_year`;
            let bindParams = {
                sr_code: reqData.srCode,
                book_no: reqData.bookNo,
                doct_no: reqData.docNo,
                reg_year: reqData.regYear
            }
            let nominees = await this.odbDao.oDBQueryServiceWithBindParams(query,bindParams)
            for (let nominee of nominees) {
                if (nominee.AADHAR_ENCRPT) {
                    try {
                    nominee.NOMINE_AADHAR = nominee.AADHAR_ENCRPT.length > 12 ? AadhardecryptData(nominee.AADHAR_ENCRPT) :nominee.NOMINE_AADHAR;
                    } catch (ex) {
                        nominee.NOMINE_AADHAR = nominee.NOMINE_AADHAR;
                    }
                }
            }
            return nominees;
        } catch (ex) {
            Logger.error("documentHandoverServices - getNominee || Error :", ex);
            console.error("documentHandoverServices - getNominee || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    saveDocHandover = async (reqData) => {
        try {
            let setClause = `doc_handover='Y', doc_handover_time=SYSDATE`;
        if (reqData.NAME && reqData.AADHAR) {
            let encryptedAadhar = reqData.AADHAR.length == 12 ? AadharencryptData(reqData.AADHAR) : reqData.AADHAR;
            setClause += `, nomine_name='${reqData.NAME}', nomine_aadhar='${reqData.AADHAR}', aadhar_encrpt='${encryptedAadhar}'`;
        }
        let query = `
            UPDATE srouser.tran_nomine 
            SET ${setClause}
            WHERE sr_code='${reqData.sr_code}' 
              AND book_no='${reqData.book_no}' 
              AND doct_no='${reqData.doct_no}' 
              AND reg_year='${reqData.reg_year}'`;
        let result = await this.odbDao.oDbUpdate(query)
            if (result < 0) {
                throw new Error('Bad Request')
            }
            return result
        } catch (ex) {
            Logger.error("documentHandoverServices - saveDocHandover || Error : ", ex);
            console.error("documentHandoverServices - saveDocHandover || Error : ", ex);
            throw new CARDError({ err: ex });
        }
    }
    getValidateNomineeQr = async (reqData) => {
		try {
		  let query = `
			SELECT 
	  CASE 
		WHEN COUNT(*) > 0 THEN 'Y' 
		ELSE 'N' 
	  END AS status FROM tran_nomine
			WHERE sr_code = :sr_code
			  AND book_no = :book_no
			  AND reg_year = :reg_year
			  AND doct_no = :doct_no
			  AND NOMINE_AADHAR = :aadhar`;
		  let bindparam = {
			sr_code: reqData.SR_CODE,
			book_no: reqData.BOOK_NO,
			reg_year: reqData.REG_YEAR,
			doct_no: reqData.DOCT_NO,
			aadhar: reqData.AADHAR, 
		  };
		  let result = await this.odbDao.oDBQueryServiceWithBindParams(query, bindparam);
          let ecStatus = result?.[0]?.STATUS || 'N';
          const isPrivate = await getPrivateAttendanceStatus(this.odbDao, {
                sr_code: reqData.SR_CODE,
                doct_no: reqData.DOCT_NO,
                reg_year: reqData.REG_YEAR,
                book_no: reqData.BOOK_NO
              });
          
              return [{ status: ecStatus, isPrivateAttendance: isPrivate }];
		} catch (ex) {
		  Logger.error("documentHandoverServices || ValidateQrData || Error :", ex);
		  throw constructCARDError(ex);
		}
	  };
       partyExemptionCheck = async (reqData) => {
		try {
		  let query = `select b.PARTY_EXEMPTION from preregistration.pre_registration_cca A join tran_dir b on a.TRANS_MAJOR_CODE=b.TRAN_MAJ_CODE and a.TRANS_MINOR_CODE=b.TRAN_MIN_CODE where A.ID=:ID`;
		  let bindparam = {
			ID: reqData.ID
		  };
		  let result = await this.odbDao.oDBQueryServiceWithBindParams(query, bindparam);
              return result;
		} catch (ex) {
		  Logger.error("documentHandoverServices || partyExemptionCheck || Error :", ex);
		  throw constructCARDError(ex);
		}
	  };

}

module.exports = DocumentHandoverServices;

