const { constructCARDError } = require("../handlers/errorHandler");
const odbDao = require("../dao/oracledbDao");
const gAuth = require("../plugins/auth/authService");
const { Logger } = require("../../services/winston");
const { encryptWithAESPassPhrase } = require("../utils");
const { transportEmail } = require("../utils/index");
const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$";
const oracleDb = require('oracledb');
const moment = require('moment');


class EmployeeServices {
  constructor() {
    this.odbDao = new odbDao();
  }

  getEmpSrvc = async (reqData) => {
    try {
      let query = `SELECT * FROM employee_login_master WHERE SR_CODE=${reqData.srCode}`;
      let response = await this.odbDao.oDBQueryService(query);
      if (response != null) {
        response.map((element) => {
          if (element.AADHAR != null)
            element.AADHAR = encryptWithAESPassPhrase(
              element.AADHAR.toString(),
              process.env.adhar_Secret_key
            );
          if (element.PASSWRD) {
            element.PASSWRD = encryptWithAESPassPhrase(
              element.PASSWRD,
              process.env.adhar_Secret_key
            );
          }
        });
      }
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getEmployees || Error :", ex);
      console.error("EmployeeHandler - getEmployees || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getAvailableSros = async (reqData) => {
    try {
      let query =
        `SELECT * FROM employee_login_master WHERE SR_CODE=${reqData.srCode} and empl_id not in (select nvl(empl_id, -123) from subregistrar_det where sr_code=${reqData.srCode} ` +
        `and (to_date('${reqData.fromDate}', 'dd-mm-yyyy') between trunc(from_date) and trunc(to_date)  or to_date('${reqData.toDate}', 'dd-mm-yyyy') between trunc(from_date) and trunc(to_date) ))`;
      let response = await this.odbDao.oDBQueryService(query);
      if (response != null) {
        response.map((element) => {
          if (element.AADHAR != null)
            element.AADHAR = encryptWithAESPassPhrase(
              element.AADHAR.toString(),
              process.env.adhar_Secret_key
            );
        });
      }
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getAvailableSros || Error :", ex);
      console.error("EmployeeHandler - getAvailableSros || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  // getAssignedSros = async (reqData) => {
  //  try {
  //      let query = `SELECT * FROM SUBREGISTRAR_DET where sr_code=${reqData.srCode} AND  UPPER(DESIGNATION) NOT LIKE '%SUB%REGISTRAR%' OR  UPPER(DESIGNATION) NOT LIKE '%JOINT%REGISTRAR%';
  //      UNION
  //      select * from subregistrar_det where sr_code=${reqData.srCode}
  //                  and (to_date('${reqData.fromDate}', 'dd-mm-yyyy') between trunc(from_date) and trunc(To_date)  or to_date('${reqData.toDate}', 'dd-mm-yyyy')
  //                  between trunc(from_date) and trunc(to_date) ) AND UPPER(DESIGNATION) NOT LIKE '%SUB%REGISTRAR%'`;
  //      let response = await this.odbDao.oDBQueryService(query);
  //      return response;
  //  } catch (ex) {
  //      Logger.error("EmployeeHandler - getAssignedSros || Error :", ex);
  //      console.error("EmployeeHandler - getAssignedSros || Error :", ex);
  //      throw constructCARDError(ex);
  //  }
  // }
  getAssignedSros = async (reqData) => {
    try {
      let query = `SELECT * FROM SUBREGISTRAR_DET where sr_code=${reqData.srCode} AND  (UPPER(DESIGNATION) LIKE '%SUB%REGISTRAR%' OR  UPPER(DESIGNATION) LIKE '%JOINT%REGISTRAR%')
            UNION
            select * from subregistrar_det where sr_code=${reqData.srCode}
                        and (to_date('${reqData.fromDate}', 'dd-mm-yyyy') between trunc(from_date) and trunc(To_date)  
                            or to_date('${reqData.toDate}', 'dd-mm-yyyy') between trunc(from_date) and trunc(to_date)) AND UPPER(DESIGNATION) NOT LIKE '%SUB%REGISTRAR%'`;

      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getAssignedSros || Error :", ex);
      console.error("EmployeeHandler - getAssignedSros || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getDRSrvc = async (reqData) => {
    try {
      let query = `SELECT * From card.dr_master`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getDRSrvc || Error :", ex);
      console.error("EmployeeHandler - getDRSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getEmployeesCIGSrvc = async () => {
    try {
      let query = `SELECT * From card.employee_login_master where designation='CIG'`;
      let response = await this.odbDao.oDBQueryService(query);
      if (response != null) {
        response.map((element) => {
          if (element.AADHAR != null)
            element.AADHAR = encryptWithAESPassPhrase(
              element.AADHAR.toString(),
              process.env.adhar_Secret_key
            );
          if (element.PASSWRD) {
            element.PASSWRD = encryptWithAESPassPhrase(
              element.PASSWRD,
              process.env.adhar_Secret_key
            );
          }
        });
      }
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getEmployeesCIGSrvc || Error :", ex);
      console.error("EmployeeHandler - getEmployeesCIGSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getEmployeesDRSrvc = async (reqData) => {
    try {
      let query = `SELECT * From card.employee_login_master where designation='District Registrar' and sr_code in (select sr_cd from sr_master where dr_cd='${reqData.dR}')`;
      let response = await this.odbDao.oDBQueryService(query);
      if (response != null) {
        response.map((element) => {
          if (element.AADHAR != null)
            element.AADHAR = encryptWithAESPassPhrase(
              element.AADHAR.toString(),
              process.env.adhar_Secret_key
            );
          if (element.PASSWRD) {
            element.PASSWRD = encryptWithAESPassPhrase(
              element.PASSWRD,
              process.env.adhar_Secret_key
            );
          }
        });
      }
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getEmployeesDRSrvc || Error :", ex);
      console.error("EmployeeHandler - getEmployeesDRSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  getEmployeesSRSrvc = async (reqData) => {
    try {
      let query = `select * from sr_master where dr_cd='${reqData.dR}'`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getEmployeesSRSrvc || Error :", ex);
      console.error("EmployeeHandler - getEmployeesSRSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getVSWSSrvc = async (reqData) => {
    try {
      let query = `select * from card.gs_srcode where bifurcated_srcd='${reqData.srCode}'`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getVSWSSrvc || Error :", ex);
      console.error("EmployeeHandler - getVSWSSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  getVSWSMListSrvc = async (reqData) => {
    try {
      let query = `select * from card.employee_login_master where vill_code='${reqData.vill_code}'`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getVSWSMListSrvc || Error :", ex);
      console.error("EmployeeHandler - getVSWSMListSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  getVSWSAssignSrvc = async (reqData) => {
    try {
      let query = `SELECT a.*,b.*,(select tran_desc from tran_dir c where c.tran_maj_code=b.tran_maj_code and c.tran_min_code=b.tran_min_code) trandesc From SROUSER.ASSIGN_RDOCT_VSWS a,TRan_major b where a.sr_code =${reqData.SR_CODE} and vsws_code='${reqData.VSWS_CODE}' and a.rdoct_no is null and a.sr_code=b.sr_code and a.book_no=b.book_no and a.reg_year=b.reg_year and a.doct_no=b.doct_no`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getVSWSAssignSrvc || Error :", ex);
      console.error("EmployeeHandler - getVSWSAssignSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  saveVSWSAssignSrvc = async (reqData) => {
    try {
      let query = `Insert into SROUSER.ASSIGN_RDOCT_VSWS (SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,RYEAR,RDOCT_NO,REQUESTED_BY,REQUESTED_ON,VSWS_CODE) values (${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${reqData.RYEAR},${reqData.RDOCT_NO},'${reqData.REQUESTED_BY}',TO_DATE('${reqData.REQUESTED_ON}','DD-MM-YYYY'),'${reqData.VSWS_CODE}')`;
      let response = await this.odbDao.oDbInsertDocs(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - saveVSWSAssignSrvc || Error :", ex);
      console.error("EmployeeHandler - saveVSWSAssignSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  vswsSroAssignSrvc = async (reqData) => {
    try {
      let query = `update srouser.assign_rdoct_vsws set rdoct_no=${reqData.RDOCT_NO} where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and reg_year=${reqData.REG_YEAR} and doct_no=${reqData.DOCT_NO}`;
      let response = await this.odbDao.oDbUpdate(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - saveVSWSAssignSrvc || Error :", ex);
      console.error("EmployeeHandler - saveVSWSAssignSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  empTransactionSrvc = async (reqData) => {
    try {
      let query = `Insert into SROUSER.EMPLOYEE_LOGIN_MASTER_TRANS (SR_CODE,EMPL_ID,CFMS_ID,AADHAR,MOBILE_NO,EMPL_NAME,DESIGNATION,LOG_REASON,LOG_DATE) values (${reqData.SR_CODE},${reqData.EMPL_ID},${reqData.CFMS_ID},${reqData.AADHAR},${reqData.MOBILE_NO},'${reqData.EMPL_NAME}','${reqData.DESIGNATION}','${reqData.LOG_REASON}',TO_DATE('${reqData.LOG_DATE}','DD-MM-YYYY'))`;
      let result = await this.odbDao.oDbInsertDocs(query);
      return result;
    } catch (ex) {
      Logger.error("EmployeeHandler - empTransactionSrvc || Error : ", ex);
      console.error("EmployeeHandler - empTransactionSrvc || Error : ", ex);
      throw constructCARDError(ex);
    }
  };
  getEmpUserSrvc = async (reqData) => {
    try {
      let query = `SELECT * FROM card.employee_login_master  where empl_id=${reqData.EMPL_ID} and sr_code=${reqData.SR_CODE}`;
      let response = await this.odbDao.oDBQueryService(query);
      if (response != null) {
        response.map((element) => {
          if (element.AADHAR != null)
            element.AADHAR = encryptWithAESPassPhrase(
              element.AADHAR.toString(),
              process.env.adhar_Secret_key
            );
        });
      }
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getEmpUserSrvc || Error :", ex);
      console.error("EmployeeHandler - getEmpUserSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  getEmpRolesSrvc = async (reqData) => {
    try {
      let query = `select * from srouser.job_priv_audit where login_name='${reqData.LOGIN_NAME}'`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getEmpRolesSrvc || Error :", ex);
      console.error("EmployeeHandler - getEmpRolesSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  getSRMasterSrvc = async (reqData) => {
    try {
      let query = `select * from sr_master where sr_cd='${reqData.sr_cd}'`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getSRMasterSrvc || Error :", ex);
      console.error("EmployeeHandler - getSRMasterSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  empCreationSrvc = async (reqData) => {
    try {
      
      if (!reqData.SR_CODE || !reqData.EMPL_ID) {
        throw new Error('SR_CODE or EMPL_ID is missing');
      }
      let query1 = `SELECT * FROM card.employee_login_master WHERE empl_id=${reqData.EMPL_ID} AND sr_code=${reqData.SR_CODE}`;

      let selectResults = await this.odbDao.oDBQueryService(query1);
      
      if (selectResults.length === 0) {
        let query2 = `INSERT INTO CARD.EMPLOYEE_LOGIN_MASTER(SR_CODE, EMPL_ID, CFMS_ID, AADHAR, MOBILE_NO, EMPL_NAME, DESIGNATION, PROCEEDING_NO, PROCEEDING_DATE, FROM_DATE, EMP_STATUS, PASSWRD) 
        VALUES (${reqData.SR_CODE}, ${reqData.EMPL_ID}, ${reqData.CFMS_ID}, ${reqData.AADHAR}, ${reqData.MOBILE_NO}, '${reqData.EMPL_NAME}', '${reqData.DESIGNATION}', 
          ${reqData.PROCEEDING_NO}, TO_DATE('${reqData.PROCEEDING_DATE}', 'DD-MM-YYYY'), TO_DATE('${reqData.FROM_DATE}', 'DD-MM-YYYY'), '${reqData.EMP_STATUS}', '${reqData.PASSWRD}')`;

        let result = await this.odbDao.oDbInsertDocs(query2);

        if (reqData.DESIGNATION === 'Sub-Registrar') {
          let query3 = `INSERT INTO CARD.SUBREGISTRAR_DET 
                (SR_CODE, SR_NAME, SUBREGISTRAR_NAME, designation, from_date, entry_by, to_date, empl_id) 
                VALUES (${reqData.SR_CODE}, '${reqData.SR_NAME}', '${reqData.EMPL_NAME}', '${reqData.DESIGNATION}',
                TO_DATE('${reqData.PROCEEDING_DATE}', 'DD-MM-YYYY'), 'DISTRICTREGISTRAR${reqData.DR_CD}', NULL, ${reqData.EMPL_ID})`;

          let result1 = await this.odbDao.oDbInsertDocs(query3);
          return result && result1;
        }
        return result;

      } else {
        let updateQuery = `UPDATE card.employee_login_master SET 
              PROCEEDING_NO = ${reqData.PROCEEDING_NO ? `'${reqData.PROCEEDING_NO}'` : 'NULL'}, 
              PROCEEDING_DATE = TO_DATE('${reqData.PROCEEDING_DATE}', 'DD-MM-YYYY'), 
              emp_status = RTRIM('${reqData.EMP_STATUS}') 
          WHERE EMPL_ID = ${reqData.EMPL_ID} AND SR_CODE = ${reqData.SR_CODE}`;

        let result3 = await this.odbDao.oDbUpdate(updateQuery);

        if (updateResult === 0) {
          console.log("No rows updated. Employee may not exist or data is unchanged.");
        }

        if (reqData.DESIGNATION === 'Sub-Registrar') {
          let esignQuery = `INSERT INTO CARD.SUBREGISTRAR_DET 
                (SR_CODE, SR_NAME, SUBREGISTRAR_NAME, designation, from_date, entry_by, to_date, empl_id) 
                VALUES (${reqData.SR_CODE}, '${reqData.SR_NAME}', '${reqData.EMPL_NAME}', '${reqData.DESIGNATION}',
                TO_DATE('${reqData.PROCEEDING_DATE}', 'DD-MM-YYYY'), 'DISTRICTREGISTRAR${reqData.DR_CD}', NULL, ${reqData.EMPL_ID})`;
              
          let result4 = await this.odbDao.oDbInsertDocs(esignQuery);
          return result3 && result4;
        }
        return result3;
      }
    } catch (ex) {
      Logger.error("EmployeeHandler - empCreationSrvc || Error: ", ex);
      console.error("EmployeeHandler - empCreationSrvc || Error: ", ex);
      throw constructCARDError(ex);
    }
  };


  updCreationSrvc = async (reqData) => {
    try {
      let query = `UPDATE card.employee_login_master 
        SET TO_DATE=TO_DATE('${reqData.TO_DATE}', 'DD-MM-YYYY'), PROCEEDING_NO=${reqData.PROCEEDING_NO}, 
        PROCEEDING_DATE=TO_DATE('${reqData.PROCEEDING_DATE}', 'DD-MM-YYYY'), emp_status=RTRIM('${reqData.EMP_STATUS}') 
        WHERE EMPL_ID=${reqData.EMPL_ID} AND SR_CODE=${reqData.SR_CODE}`;
      let result = await this.odbDao.oDbUpdate(query)
      if (result < 0) {
        throw new Error("Bad Request");
      }
      return result;
    } catch (ex) {
      Logger.error("EmployeeHandler - updCreationSrvc || Error: ", ex);
      console.error("EmployeeHandler - updCreationSrvc || Error: ", ex);
      throw constructCARDError(ex);
    }
  };


  empUserSaveSrvc = async (reqData) => {
    try {
      if (reqData.EMPL_ID) {
        const deleteQuery = `DELETE FROM srouser.job_priv_audit WHERE LOGIN_NAME = '${reqData.EMPL_ID}'`;
        const deleteResult = await this.odbDao.oDbDelete(deleteQuery);
        console.log(deleteResult);
        const insertQuery = `INSERT INTO srouser.job_audit (LOGIN_NAME, EMP_NAME, CREATED_ON, PWD_CHANGE)  SELECT '${reqData.LOGIN_NAME}', '${reqData.EMPL_ID}',  SYSDATE, 'Y'
                FROM dual WHERE NOT EXISTS ( SELECT 1 FROM srouser.job_audit WHERE LOGIN_NAME = '${reqData.LOGIN_NAME}')`;
        const insertResult = await this.odbDao.oDbInsertDocs(insertQuery);
        const prLength = reqData.PRIVELEGE;
        for (let i of reqData.PRIVELEGE) {
          const insertQuery = `INSERT INTO SROUSER.JOB_PRIV_AUDIT(LOGIN_NAME, PRIVELEGE, ALLOCATED_ON, DEALLOCATE, SRO_CODE)  VALUES ('${reqData.LOGIN_NAME}', '${i}', SYSDATE, SYSDATE, ${reqData.SR_CODE})`;
          const insertResult = await this.odbDao.oDbInsertDocs(insertQuery);
          console.log(i);
          if (prLength == i) {
            return insertResult;
          }
        }
      }
    } catch (ex) {
      Logger.error("EmployeeHandler - empUserSaveSrvc || Error :", ex);
      console.error("EmployeeHandler - empUserSaveSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  deleteAGT = async (reqData) => {
    try {
      const deleteQuery = `DELETE FROM AGENCY_TABLE WHERE AGENCY_NAME = '${reqData.AGENCY_NAME}'`;
      const deleteResult = await this.odbDao.oDbDelete(deleteQuery);
      console.log(deleteResult);
      return deleteResult;
    } catch (ex) {
      Logger.error("EmployeeHandler - deleteAGT || Error :", ex);
      console.error("EmployeeHandler - deleteAGT || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  saveAssignSRSrvc = async (reqData) => {
    try {
      let selectQuery =
        `select sr_code, to_char(from_date, 'dd-mm-yyyy') as from_date, to_char(to_date, 'dd-mm-yyyy') as to_date, empl_id from subregistrar_det where sr_code=${reqData.srCode} and empl_id = ${reqData.empId} ` +
        `and (to_date('${reqData.fromDate}', 'dd-mm-yyyy') between trunc(from_date) and trunc(to_date)  or to_date('${reqData.toDate}', 'dd-mm-yyyy') between trunc(from_date) and trunc(to_date) )`;
      let assignedEmployeeDetails = await this.odbDao.oDBQueryService(
        selectQuery
      );
      console.log("ASSIGNED EMPLOYEE DETIALS", assignedEmployeeDetails);
      let result;
      if (
        assignedEmployeeDetails != null &&
        assignedEmployeeDetails.length > 0
      ) {
        assignedEmployeeDetails = assignedEmployeeDetails[0];
        console.log("EXISTING ENTRY", assignedEmployeeDetails);
        let query =
          `Update card.subregistrar_det set SR_NAME = '${reqData.srName}', SUBREGISTRAR_NAME = '${reqData.subregistrarName}', DESIGNATION = '${reqData.designation}',FROM_DATE = TO_DATE('${reqData.fromDate}','dd-mm-yyyy'),ENTRY_BY = '${reqData.entryBy}',TO_DATE = TO_DATE('${reqData.toDate}', 'dd-mm-yyyy') ` +
          `WHERE sr_code=${reqData.srCode} and empl_id = ${reqData.empId} and from_date = to_date('${assignedEmployeeDetails.FROM_DATE}', 'dd-mm-yyyy') and to_date = to_date('${assignedEmployeeDetails.TO_DATE}', 'dd-mm-yyyy') `;
        result = await this.odbDao.oDbUpdate(query);
      } else {
        let query = `Insert into card.subregistrar_det (SR_CODE,SR_NAME,SUBREGISTRAR_NAME,DESIGNATION,FROM_DATE,ENTRY_BY,TO_DATE,EMPL_ID) values (${reqData.srCode},'${reqData.srName}','${reqData.subregistrarName}','${reqData.designation}',TO_DATE('${reqData.fromDate}','dd-mm-yyyy'),'${reqData.entryBy}',TO_DATE('${reqData.toDate}','dd-mm-yyyy'),${reqData.empId})`;
        result = await this.odbDao.oDbInsertDocs(query);
      }
      return result;
    } catch (ex) {
      Logger.error("EmployeeHandler - saveAssignSRSrvc || Error : ", ex);
      console.error("EmployeeHandler - saveAssignSRSrvc || Error : ", ex);
      throw constructCARDError(ex);
    }
  };

  getDRCode = async (srcode) => {
    try {
      let query = `select dr_cd from sr_master sro where sr_cd=${srcode}`;
      let selectResults = await this.odbDao.oDBQueryService(query);
      if (selectResults.length) {
        return selectResults[0].DR_CD;
      } else {
        return null;
      }
    } catch (err) {
      Logger.error("DR Code fetch failed ===>", err.message);
      return null;
    }
  };
  updateSRO = async (reqData) => {
    try {
      let emplquery = `select * from CARD.EMPLOYEE_LOGIN_MASTER_MAIN where empl_id='${reqData.empId}'`
      let empldata = await this.odbDao.oDBQueryService(emplquery);
      let empltempquery = `INSERT INTO card.sro_of_day (
    SR_CODE,
    EMPL_ID,
    CFMS_ID,
    AADHAR,
    MOBILE_NO,
    EMPL_NAME,
    DESIGNATION,
    PROCEEDING_NO,
    PROCEEDING_DATE,
    FROM_DATE,
    TO_DATE,
    EMP_STATUS,
    PASSWRD,
    VILL_CODE,
    sro_status
) VALUES (
    ${empldata[0].SR_CODE},
    ${empldata[0].EMPL_ID},
    ${empldata[0].CFMS_ID},
    ${empldata[0].AADHAR},
    ${empldata[0].MOBILE_NO},
    '${empldata[0].EMPL_NAME}',
    '${empldata[0].DESIGNATION}',
    '${empldata[0].PROCEEDING_NO === null ? '' : empldata[0].PROCEEDING_NO}',
    ${empldata[0].PROCEEDING_DATE === null ? `''` : `TO_DATE('${moment(`${empldata[0].PROCEEDING_DATE}`).format('DD-MM-YYYY')}','DD-MM-YYYY')`},
     TO_DATE('${reqData.fromDate}', 'DD-MM-YYYY'),
     TO_DATE('${reqData.toDate}', 'DD-MM-YYYY'),
    '${empldata[0].EMP_STATUS === null ? '' : empldata[0].EMP_STATUS}',
    '${empldata[0].PASSWRD}',
    '${empldata[0].VILL_CODE === null ? '' : empldata[0].VILL_CODE}',
    'S'
)`;
      let tempempldata = await this.odbDao.oDbInsertDocs(empltempquery);
      if (tempempldata > 0) {
        let query = `update CARD.EMPLOYEE_LOGIN_MASTER set designation='Sub-Registrar' where empl_id='${reqData.empId}'`;
        let result = await this.odbDao.oDbUpdate(query);
        if (result < 0) {
          throw new Error("Bad Request");
        }
      }
      return tempempldata;
    } catch (ex) {
      Logger.error("EmployeeHandler - updateSRO || Error: ", ex);
      console.error("EmployeeHandler - updateSRO || Error: ", ex);
      throw constructCARDError(ex);
    }
  };

  generatePassword = () => {
    const length = 12;
    let password = '';
    const charsetLength = charset.length;

    for (let i = 0, n = charsetLength; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }

    return password;
  };

  deptLoginSrvc = async (reqData) => {
    try {
      let dynamicPassword = this.generatePassword();
      let query = `INSERT INTO AGENCY_TABLE ( AGENCY_NAME, PASSWD, AGENCY_DESC, ADDRESS, PHONE,
      EMAIL, CONTACT_PERSON, INTRA_DEPT, GENERATED_PASSWORD, TIME_STAMP, ISPWDCHANGED, PDF_FILE
      ) VALUES ( :agencyName, :password, :agencyDesc, :address, :phone, :email,
       :contactPer, 'N', 'Y', SYSDATE, 'N', :blob)`;

      let base64 = Buffer.from(reqData.PDF_FILE, 'base64');

      let bindParam = {
        "agencyName": reqData.AGENCY_NAME, "password": dynamicPassword,
        "agencyDesc": reqData.AGENCY_DESC, "address": reqData.ADDRESS,
        "phone": reqData.PHONE, "email": reqData.EMAIL,
        "contactPer": reqData.CONTACT_PERSON, "blob": { type: oracleDb.BLOB, val: base64, dir: oracleDb.BIND_IN }
      };
      console.log(query, "data");
      let result = await this.odbDao.oDbInsertDocsWithBindParams(query, bindParam);
      if (result > 0) {
        const mailOptions = {
          from: `"IGRS" <${process.env.SMTP_EMAIL}>`,
          to: reqData.EMAIL,
          subject: "IGRS Login Credentials",
          text:
            `Dear Sir/Madam,` +
            "\n" +
            "\n" +
            ` As requested, the credentials for your esteemed department have been created, as seen below.` +
            "\n" +
            "\n" +
            "\n" +
            "User Name: " +
            reqData.AGENCY_NAME +
            "\n" +
            "Password: " +
            dynamicPassword +
            "\n" +
            "\n" +
            "NOTE: PLEASE RESET PASSWORD AFTER LOGIN" +
            "\n" +
            "\n" +
            `Best Regards` +
            "\n" +
            `IGRS -AP`,
        };
        const mail = await transportEmail.sendMail(mailOptions);
      }
      return result;
    } catch (ex) {
      Logger.error("EmployeeHandler - deptLoginSrvc || Error: ", ex);
      console.error("EmployeeHandler - deptLoginSrvc || Error: ", ex);
      throw constructCARDError(ex);
    }
  };


  getDeptSrvc = async () => {
    try {
      let query = `select * from AGENCY_TABLE`;
      let result = await this.odbDao.oDBQueryService(query);
      return result;
    } catch (err) {
      Logger.error("EmployeeHandler - getDeptSrvc || Error: ", ex);
      console.error("EmployeeHandler - getDeptSrvc || Error: ", ex);
      throw constructCARDError(ex);
    }
  };


  login = async (userData) => {
    try {
      const token = await gAuth.createToken(userData, "");
      let updateLogin = `UPDATE card.employee_login_master set last_login=SYSDATE where sr_code=${userData.SRO_CODE} and empl_id=${userData.EMPL_ID}`;
      let result = await this.odbDao.oDbUpdate(updateLogin);
      let drCode;
      //const refreshToken = jwt.sign(userData, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife });
      if (userData.role === "SRO") {
        drCode = await this.getDRCode(userData.SRO_CODE);
      }
      const response = {
        role: userData.role,
        SR_NAME: userData.SR_NAME,
        EMPL_ID: userData.EMPL_ID,
        EMPL_NAME: userData.EMPL_NAME,
        SR_CODE: userData.SRO_CODE,
        CFMS_ID: userData.EMPL_Data.CFMS_ID,
        access_token: token,
        UpdateLogin: result,
        Status : userData.EMPL_Data.STATUS
        //"refresh_token": refreshToken,
      };
      if (drCode) {
        response.DR_CD = drCode;
      }
      return response;
    } catch (ex) {
      Logger.error("AuthHandler - login || Error :", ex);
      console.error("AuthHandler - login || Error :", ex);
      throw constructCARDError(ex);
    }
  };
  getEmployeesNODALSrvc = async () => {
    try {
      let query = `SELECT * From card.employee_login_master where designation='NODAL'`;
      let response = await this.odbDao.oDBQueryService(query);
      if (response != null) {
        response.map((element) => {
          if (element.AADHAR != null)
            element.AADHAR = encryptWithAESPassPhrase(
              element.AADHAR.toString(),
              process.env.adhar_Secret_key
            );
          if (element.PASSWRD) {
            element.PASSWRD = encryptWithAESPassPhrase(
              element.PASSWRD,
              process.env.adhar_Secret_key
            );
          }
        });
      }
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getEmployeesCIGSrvc || Error :", ex);
      console.error("EmployeeHandler - getEmployeesCIGSrvc || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getEmployeesAllSro = async () => {
    try {
      let query = `select * from sr_master where sr_cd between 101 and 1399`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getEmployeesAllSro || Error :", ex);
      console.error("EmployeeHandler - getEmployeesAllSro || Error :", ex);
      throw constructCARDError(ex);
    }
  };

  getSroDR = async (reqData) => {
    try {
      let query = `select * from card.ddo_sro_table where district_code='${reqData.dR}'`;
      let response = await this.odbDao.oDBQueryService(query);
      return response;
    } catch (ex) {
      Logger.error("EmployeeHandler - getSroDR || Error :", ex);
      console.error("EmployeeHandler - getSroDR || Error :", ex);
      throw constructCARDError(ex);
    }
  };

}

module.exports = EmployeeServices;