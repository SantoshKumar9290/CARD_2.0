const CARDError = require("../errors/customErrorClass");
const OrDao = require('../dao/oracledbDao');
const Esign = require('../services/esignService');
const Coordinates=require('../services/refuseServices')
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const axios = require('axios')
// const { generatePDFFromHTML } = require('./pdfGenerator');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const fsone = require('fs')
// const wordwrap = require('word-wrap');
const crypto = require('crypto');
const CryptoJS = require('crypto-js')
const https = require('https');
const puppeteer = require('puppeteer');
const { log } = require("console");
const { encryptWithAESPassPhrase } = require('../utils');
const {AadhardecryptData,AadharencryptData} = require('../utils/index');
const path = require('path');
function encryptData(data, secretKey) {
  const cipher = crypto.createCipher('aes-256-cbc', secretKey);
  let encryptedData = cipher.update(data, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
}

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

class thumbImprressionServices {
  constructor() {
    this.orDao = new OrDao();
    this.esign = new Esign();
    this.coordinates=new Coordinates()
  }

  instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });

  encryptData = function (data, secretKey) {
    const encryptText = CryptoJS.AES.encrypt(data, secretKey).toString();
    return encryptText
  }

  insertTableService = async (reqBody) => {
    const {
      partylength, matched, i, CODE, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR,
      EC_NUMBER, NAME, AADHAR, remarks,
    } = reqBody;

    let srocoordinates = ['80,755,50,100', '80,460,50,100', '80,360,50,100', '80,260,50,100', '80,160,50,100', '80,60,50,100'];
    let srosecondpagecoordinates = ['80,755,50,100', '80,560,50,100', '80,460,50,100', '80,360,50,100', '80,260,50,100', '80,160,50,100', '80,60,50,100'];
    let finalsroposition;
    let flattenedDeepArray;
    let sroposition;
    let sropagenumber;
    let sroquoe;

    if (partylength <= 5) {
      sropagenumber = 1;
      sroposition = partylength % 5;

      if (sroposition === 4) {
        finalsroposition = srocoordinates[4];
      } else if (sroposition === 3) {
        finalsroposition = srocoordinates[3];
      } else if (sroposition === 2) {
        finalsroposition = srocoordinates[2];
      } else if (sroposition === 1) {
        finalsroposition = srocoordinates[1];
      } else {
        finalsroposition = srocoordinates[0];
        sropagenumber = 2;
      }
    } else {
      sroposition = partylength % 6;
      sroquoe = partylength / 6;

      if (sroposition > 0) {
        sropagenumber = parseInt(Math.ceil(sroquoe));
      } else {
        sropagenumber = sroquoe;
      }

      if (sroposition === 5) {
        finalsroposition = srosecondpagecoordinates[0];
      } else if (sroposition === 0) {
        finalsroposition = srosecondpagecoordinates[1];
        sropagenumber = sroquoe + 1;
      } else if (sroposition === 1) {
        finalsroposition = srosecondpagecoordinates[2];
      } else if (sroposition === 2) {
        finalsroposition = srosecondpagecoordinates[3];
      } else if (sroposition === 3) {
        finalsroposition = srosecondpagecoordinates[4];
      } else if (sroposition === 4) {
        finalsroposition = srosecondpagecoordinates[5];
      }
    }
    let remarksString = remarks;
    if (remarksString) {
      flattenedDeepArray = remarksString.flat(2);
    } else {
      flattenedDeepArray = '';
    }

    let pushcoordinates;
    const firstPagecoordinates = ['70,525,70,286', '70,405,70,286', '70,285,70,286', '70,165,70,286', '70,45,70,286'];
    const SecondPageCoordinates = ['70,625,70,286', '70,505,70,286', '70,375,70,286', '70,255,70,286', '70,135,70,286'];

    let finalpage;

    if (i < 5) {
      finalpage = 1;
      pushcoordinates = firstPagecoordinates[i];
    } else {
      const repeatIndex = (i - 5) % SecondPageCoordinates.length;
      const positiveIndex = repeatIndex >= 0 ? repeatIndex : SecondPageCoordinates.length + repeatIndex;
      pushcoordinates = SecondPageCoordinates[positiveIndex];
    }

    if (i >= 5) {
      let pageNumber = Math.ceil((i - 4) / 5);
      finalpage = pageNumber + 1;
    }
    let result;
    const maxRetries = 3;
    let retries = 0;
    let success = false;
    while (retries < maxRetries && !success) {
      if (matched === false) {
        try {
          const query = `
              INSERT INTO srouser.thumb_ec_esign
                (sr_code, book_no, doct_no, reg_year, code, ec_num, page_no, coordinates, time_stamp, aadhar, dn_qualifier, name, remarks, Esign_status)
              SELECT ${SR_CODE}, ${BOOK_NO}, ${DOCT_NO}, ${REG_YEAR}, '${CODE}', ${EC_NUMBER}, ${finalpage}, '${pushcoordinates}', '', ${AADHAR}, '', '${NAME}', '${flattenedDeepArray[i]}', 'P'
              FROM dual
              WHERE NOT EXISTS (
                SELECT 1
                FROM srouser.thumb_ec_esign
                WHERE
                  sr_code = ${SR_CODE} AND book_no = ${BOOK_NO} AND doct_no = ${DOCT_NO} AND reg_year = ${REG_YEAR} AND coordinates = '${pushcoordinates}' AND page_no=${finalpage} AND Esign_status in ('P', 'Y')
              )`;
          result = await this.orDao.oDbInsertDocs(query);
          if (result) {
            success = true;
            return result;

          } else {
            retries++;
          }


        } catch (err) {
          Logger.error("thumbImprressionServices - insertTableService || Error :", err);
          console.error("thumbImprressionServices - insertTableService || Error :", err);
          throw constructCARDError(err);
        }
      } else {
        try {
          const query = `
              INSERT INTO srouser.thumb_ec_esign
                (sr_code, book_no, doct_no, reg_year, code, page_no, coordinates, time_stamp, aadhar, dn_qualifier, name, remarks, Esign_status)
              SELECT ${SR_CODE}, ${BOOK_NO}, ${DOCT_NO}, ${REG_YEAR}, 'SRO','', '', '', '${AADHAR}', '', '${NAME}', '', 'P'
              FROM dual
              WHERE NOT EXISTS (
                SELECT 1
                FROM srouser.thumb_ec_esign
                WHERE
                  sr_code = ${SR_CODE} AND book_no = ${BOOK_NO} AND doct_no = ${DOCT_NO} AND reg_year = ${REG_YEAR} AND name = '${NAME}'
              )`;
          result = await this.orDao.oDbInsertDocs(query);
          if (result) {
            success = true;
            return result;

          } else {
            retries++;
          }
        } catch (err) {
          Logger.error("thumbImprressionServices - insertTableService || Error :", err);
          console.error("thumbImprressionServices - insertTableService || Error :", err);
          throw constructCARDError(err);
        }
      }
    }
  }


  generatePDFFromHTML = async (html, filename, result) => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
 

    await page.setContent(html);

    let pdfBuffer= await page.pdf({
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
    return pdfBuffer;

  }



  generateDocumentService = async (reqBody) => {
    const { ind, SR_CODE, DOCT_NO, REG_YEAR, BOOK_NO, remarks1 } = reqBody;
    let result = [];

    try {
      let pdequery=`select * from srouser.pde_doc_status_cr WHERE 
      sr_code = ${SR_CODE}
AND doct_no = ${DOCT_NO}
AND reg_year = ${REG_YEAR}
AND book_no = ${BOOK_NO} and DOC_ESIGN='Y'`
let pderesult = await this.orDao.oDBQueryService(pdequery);
if(pderesult.length>0){
    //   const query = `
    //           WITH RankedRows AS (
    //           SELECT
    //             photofp.tran_ec_photos.sr_code,
    //             photofp.tran_ec_photos.book_no,
    //             photofp.tran_ec_photos.FINGER,
    //             photofp.tran_ec_photos.doct_no,
    //             photofp.tran_ec_photos.reg_year,
    //             photofp.tran_ec_photos.ec_number,
    //             photofp.tran_ec_photos.code,
    //             photofp.tran_ec_photos.TIME_STAMP,
    //             SROUSER.TRAN_EC_PARTIES_CR.Aadhar,
    //             SROUSER.TRAN_EC_PARTIES_CR.CODE as Party_code,               
    //             SROUSER.TRAN_EC_PARTIES_CR.NAME,
    //             ROW_NUMBER() OVER (PARTITION BY SROUSER.TRAN_EC_PARTIES_CR.Aadhar ORDER BY photofp.tran_ec_photos.TIME_STAMP) AS rn
    //           FROM
    //             PHOTOFP.TRAN_EC_PHOTOS
    //           INNER JOIN
    //             SROUSER.TRAN_EC_PARTIES_CR
    //           ON
    //             photofp.tran_ec_photos.CODE = SROUSER.TRAN_EC_PARTIES_CR.CODE
    //             AND photofp.tran_ec_photos.EC_NUMBER = SROUSER.TRAN_EC_PARTIES_CR.EC_NUMBER
    //             AND photofp.tran_ec_photos.BOOK_NO = SROUSER.TRAN_EC_PARTIES_CR.BOOK_NO
    //             AND photofp.tran_ec_photos.DOCT_NO = SROUSER.TRAN_EC_PARTIES_CR.DOCT_NO
    //             AND photofp.tran_ec_photos.REG_YEAR = SROUSER.TRAN_EC_PARTIES_CR.REG_YEAR
    //             AND photofp.tran_ec_photos.SR_CODE = SROUSER.TRAN_EC_PARTIES_CR.SR_CODE
    //           WHERE
    //            PHOTOFP.TRAN_EC_PHOTOS.sr_code = ${SR_CODE}
    // AND PHOTOFP.TRAN_EC_PHOTOS.doct_no = ${DOCT_NO}
    // AND PHOTOFP.TRAN_EC_PHOTOS.reg_year = ${REG_YEAR}
    // AND PHOTOFP.TRAN_EC_PHOTOS.book_no = ${BOOK_NO}
    //         )
    //         SELECT
    //           sr_code,
    //           (SELECT sr_name FROM sr_master WHERE sr_cd = ${SR_CODE}) AS sr_name,
    //           book_no,
    //           FINGER,
    //           doct_no,
    //           reg_year,
    //           ec_number,
    //           code,
    //           TO_CHAR(TIME_STAMP, 'DD/MM/YYYY HH:MI:SS AM') CAPTURE_TIME,
    //           Aadhar,
    //           NAME, 
    //           party_code
    //         FROM
    //           RankedRows
    //         WHERE
    //           rn = 1 order by EC_NUMBER asc`;

    let query = ` SELECT  
  tp.sr_code,
  tp.book_no,
  tp.FINGER,
  tp.doct_no,
  tp.reg_year,
  tp.ec_number,
  tp.code,
  tp.TIME_STAMP,
  pcr.Aadhar,
  pcr.CODE as Party_code,               
  pcr.NAME,
    tae.A_NAME
FROM 
    SROUSER.TRAN_EC_PARTIES_CR pcr
JOIN 
    photofp.tran_ec_photos tp ON pcr.doct_no = tp.doct_no 
                              AND pcr.sr_code = tp.sr_code 
                              AND pcr.reg_year = tp.reg_year
                              and pcr.code = tp.code
                              and pcr.book_no=tp.book_no
JOIN 
    srouser.tran_ec_aadhar_esign tae ON pcr.doct_no = tae.doct_no 
                                     AND pcr.sr_code = tae.sr_code 
                                     AND pcr.reg_year = tae.reg_year
                                     AND pcr.code = tae.code 
                                     AND pcr.book_no=tae.book_no
WHERE 
                pcr.sr_code = ${SR_CODE}
     AND pcr.doct_no = ${DOCT_NO}
    AND pcr.reg_year = ${REG_YEAR}
     AND pcr.book_no = ${BOOK_NO}
     order by pcr.EC_NUMBER asc`
      result = await this.orDao.oDBQueryService(query);
      if (result.length > 0) {
        const querysro = `select aadhar, empl_name as name,(select sr_name from sr_master where sr_cd = ${SR_CODE} ) sr_name from employee_login_master where sr_code=${SR_CODE}  and designation='Sub-Registrar'`;
        let result1 = []
        result1 = await this.orDao.oDBQueryService(querysro);

        let formattedDate = "_________";
        let data;
        let imagePath;

        if (result) {
          const dateObject = new Date();
          const day = dateObject.getDate();
          const month = dateObject.getMonth() + 1;
          const year = dateObject.getFullYear();
          const formattedDay = day < 10 ? `0${day}` : day;
          const formattedMonth = month < 10 ? `0${month}` : month;
          formattedDate = `${formattedMonth}/${formattedDay}/${year}`;

        }
        let resultArray = [];
        for (let i = 0; i < result.length; i++) {
          let resultArrayObject = {
            "AADHAR": result[i].AADHAR,
            "BOOK_NO": result[i].BOOK_NO,
            "CODE": result[i].CODE,
            "DOCT_NO": result[i].DOCT_NO,
            "EC_NUMBER": result[i].EC_NUMBER,
            "NAME": result[i].NAME,
            "REG_YEAR": result[i].REG_YEAR,
            "SR_CODE": result[i].SR_CODE,
            "SR_NAME": result[i].SR_NAME,
            "PARTY_CODE": result[i].PARTY_CODE
          }
          resultArray.push(resultArrayObject);
        }
        return { status: true, data: result, srodata: result1 };
      } else {
        return false;
      }
    }
    else{
      return { status: false, data: [], srodata: [] };

    }
    } catch (err) {
      console.error("thumbImprressionServices - generateDocument || Error :", err);
      throw err;
    }
  }


  findSignCoordinates = async (pdfBuffer) => {
    const pdfData = await PDFDocument(pdfBuffer);

    if (pdfData.textLines) {
      const exSignIndex = pdfData.textLines.findIndex(line => line.includes("EX Sign"));
      const sroSignIndex = pdfData.textLines.findIndex(line => line.includes("SRO sign"));

      if (exSignIndex !== -1 && sroSignIndex !== -1) {
        const exSignCoordinates = pdfData.textLines[exSignIndex];
        const sroSignCoordinates = pdfData.textLines[sroSignIndex];

        return { exSignCoordinates, sroSignCoordinates };
      } else {
        console.log('"EX Sign" or "SRO Sign" not found in the text content.');
        return null;
      }
    } else {
      console.log('textLines property is undefined or null in pdfData.');
      return null;
    }
  }
  getCoordinatesData = async (reqBody) => {
    try {
      const { SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR,  AADHAR, code } = reqBody;
      const query = `
      SELECT 
    t1.*, 
    t2.sr_name, 
    t3.a_NAME
FROM 
    srouser.thumb_ec_esign t1
JOIN 
    sr_master t2 ON t1.sr_code = t2.sr_cd
JOIN 
    srouser.tran_ec_aadhar_esign t3 ON t1.sr_code = t3.sr_code 
                                   AND t1.book_no = t3.book_no 
                                   AND t1.doct_no = t3.doct_no 
                                   AND t1.reg_year = t3.reg_year 
                                   AND t1.aadhar = t3.aadhar 
                                   AND t1.code = t3.code
                                   WHERE 
    t1.sr_code = ${SR_CODE} 
    AND t1.book_no =  ${BOOK_NO} 
    AND t1.doct_no = ${DOCT_NO} 
    AND t1.reg_year = ${REG_YEAR}
    AND t1.aadhar = ${AADHAR}
    AND t1.code = '${code}'`;

    const result = await this.orDao.oDBQueryService(query);
    for(let i  of result){
      if(i.AADHAR_ENCRPT){
        try {
          i.AADHAR = i.AADHAR_ENCRPT.length > 12 ? AadhardecryptData(i.AADHAR_ENCRPT) : i.AADHAR;
        } catch (ex) {
          i.AADHAR = i.AADHAR;
        }
      }
    }

    let srresult=[];
    if(code==='SRO'){
    let srquery=` SELECT 
    t1.*, 
    t2.sr_name
FROM 
    srouser.thumb_ec_esign t1
JOIN 
    sr_master t2 ON t1.sr_code = t2.sr_cd
         WHERE sr_code = ${SR_CODE} 
           AND book_no = ${BOOK_NO} 
           AND doct_no = ${DOCT_NO} 
           AND reg_year = ${REG_YEAR} 
           AND aadhar = ${AADHAR}
      and code='${code}'`;

      srresult= await this.orDao.oDBQueryService(srquery);
    }
      if (result || srresult) {
        const filename = `../../../../../pdfs/uploads/thumb_impression_documents/${REG_YEAR}/${SR_CODE}/${BOOK_NO}/document_${SR_CODE}_${DOCT_NO}_${REG_YEAR}_${BOOK_NO}.pdf`;
        const pdfPath = path.join(__dirname, filename);
        const pdfBuffer = await require("fs").promises.readFile(pdfPath);
        const base64Data = pdfBuffer.toString("base64");
        const eSignData = {
          "rrn": new Date().getTime(),
          "coordinates_location": 'Top_Right',
          "coordinates": code==='SRO'?`${srresult[0].PAGE_NO}-${srresult[0].COORDINATES};`:`${result[0].PAGE_NO}-${result[0].COORDINATES};`,
          "doctype": 'PDF',
          "uid": code==='SRO'?srresult[0].AADHAR:result[0].AADHAR,
            // signername: result.NAME?.substring(0, 50),
          "signername": code==='SRO'?`${srresult[0].NAME?.substring(0, 50)}`:`${result[0].A_NAME?.substring(0, 50)}`,
          "signerlocation": code==='SRO'?`${srresult[0].SR_NAME}`: `${result[0].SR_NAME}`,
          "filepassword": '',
          "signreason": 'Attendenceregister',
          "authmode": 2,
          // "webhookurl": 'http://localhost:5005/card/ThumbImpression',
          "webhookurl": process.env.ESIGN_REDIRECTION_THUMB_URL,
          "file": base64Data,
        };
console.log(eSignData, 'eSignData');

        let esignUrlData = await this.orDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
        if (esignUrlData == null || esignUrlData.length == 0) {
          throw Error('Esign Urls Not Found');
        }


        let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
        let esignUrl = parseInt(DOCT_NO) % 2 == 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
        let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
        // let eSignReponse = await this.esign.igrsEsignAxiosCall('http://117.250.201.41:9080/igrs-esign-service', esignRequestData);

        const queryUpdate = `UPDATE srouser.thumb_ec_esign SET DN_QUALIFIER = '${eSignData.rrn}' WHERE sr_code = ${SR_CODE} AND doct_no = ${DOCT_NO} AND reg_year = ${REG_YEAR} AND book_no = ${BOOK_NO} AND aadhar = '${AADHAR}' and code='${code}'`;
        await this.orDao.oDbUpdate(queryUpdate);
        let esignrrn={"rrn": eSignData.rrn, }
        return { Result: esignrrn, data: eSignReponse };
      } else {
        return { status: false, data: 'NO DATA AVAILABLE' };
      }
    } catch (err) {
      console.error("thumbImprressionServices - generateDocument || Error :", err);
      throw err;
    }
  };
   textwrap=(flattenedDeepArray)=>{
    const text1 = flattenedDeepArray;
    let noOfChars = 30;
    let k = Math.floor(text1.length / noOfChars);
    let finalText = "";
    let from;
    for (let n = 0; n < k; n++) {
      from = (n * noOfChars);
      let to = ((n + 1) * noOfChars);
      finalText = finalText + text1.substring(from, to) + " ";
    }
    from = (k * noOfChars);
    finalText = finalText + text1.substring(from, text1.length);
    return finalText
  }
  updatePdf = async (reqBody) => {
    let { remarks, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, totallength } = reqBody;
    let remarksString = remarks;
    let remarkshtml;
    let imagePath;
    let result;
    let result1;
    let formattedDate;
    let flattenedDeepArray;
    let remarksresult ;
    if (remarksString) {
      flattenedDeepArray = remarksString.split(',');
    } else {
      flattenedDeepArray = '';
    }
    let index = 0;
    let arrlength = flattenedDeepArray.length;
    for (index; index < arrlength; index++) {
      // let filename = `../../thumb_impression_documents/${REG_YEAR}/${SR_CODE}/${BOOK_NO}/document_${SR_CODE}_${DOCT_NO}_${REG_YEAR}_${BOOK_NO}.pdf`;
      const firstPageCoordinates = ['400,610,50,100', '400,510,50,100', '400,412,50,100', '400,313,50,100', '400,214,50,100', '400,116,50,100'];
      const secondPageCoordinates = ['400,730,50,100', '400,610,50,100', '400,510,50,100', '400,412,50,100', '400,313,50,100', '400,214,50,100', '400,106,50,100'];
      let finalPage;
      let x;
      let y;

      if (index < 6) {
        finalPage = 1;
        const [tempX, tempY, width, height] = firstPageCoordinates[index].split(',').map(Number);
        x = tempX;
        y = tempY;
      } else {
        const repeatIndex = (index - 6) % secondPageCoordinates.length;
        const positiveIndex = repeatIndex >= 0 ? repeatIndex : secondPageCoordinates.length + repeatIndex;
        const [tempX, tempY, width, height] = secondPageCoordinates[positiveIndex].split(',').map(Number);
        x = tempX;
        y = tempY;
      }

      if (index >= 6) {
        finalPage = Math.ceil((index - 5) / 6) + 1;
      }


      try {
        const query = `
SELECT  
  tp.sr_code,
  tp.book_no,
  tp.FINGER,
  tp.doct_no,
  tp.reg_year,
  tp.ec_number,
  tp.code,
  tp.TIME_STAMP,
  pcr.Aadhar,
  pcr.CODE as Party_code,               
  pcr.NAME,
    tae.A_NAME
FROM 
    SROUSER.TRAN_EC_PARTIES_CR pcr
JOIN 
    photofp.tran_ec_photos tp ON pcr.doct_no = tp.doct_no 
                              AND pcr.sr_code = tp.sr_code 
                              AND pcr.reg_year = tp.reg_year
                              and pcr.code = tp.code
                              and pcr.book_no=tp.book_no
JOIN 
    srouser.tran_ec_aadhar_esign tae ON pcr.doct_no = tae.doct_no 
                                     AND pcr.sr_code = tae.sr_code 
                                     AND pcr.reg_year = tae.reg_year
                                     AND pcr.code = tae.code 
                                     AND pcr.book_no=tae.book_no
WHERE 
                pcr.sr_code = ${SR_CODE}
     AND pcr.doct_no = ${DOCT_NO}
    AND pcr.reg_year = ${REG_YEAR}
     AND pcr.book_no = ${BOOK_NO}
     order by pcr.EC_NUMBER asc`;


      //          ` WITH RankedRows AS (
      //           SELECT
      //             photofp.tran_ec_photos.sr_code,
      //             photofp.tran_ec_photos.book_no,
      //             photofp.tran_ec_photos.FINGER,
      //             photofp.tran_ec_photos.doct_no,
      //             photofp.tran_ec_photos.reg_year,
      //             photofp.tran_ec_photos.ec_number,
      //             photofp.tran_ec_photos.code,
      //             photofp.tran_ec_photos.TIME_STAMP,
      //             SROUSER.TRAN_EC_PARTIES_CR.Aadhar,
      //             SROUSER.TRAN_EC_PARTIES_CR.CODE as Party_code,               
      //             SROUSER.TRAN_EC_PARTIES_CR.NAME,
      //             ROW_NUMBER() OVER (PARTITION BY SROUSER.TRAN_EC_PARTIES_CR.Aadhar ORDER BY photofp.tran_ec_photos.TIME_STAMP) AS rn
      //           FROM
      //             PHOTOFP.TRAN_EC_PHOTOS
      //           INNER JOIN
      //             SROUSER.TRAN_EC_PARTIES_CR
      //           ON
      //             photofp.tran_ec_photos.CODE = SROUSER.TRAN_EC_PARTIES_CR.CODE
      //             AND photofp.tran_ec_photos.EC_NUMBER = SROUSER.TRAN_EC_PARTIES_CR.EC_NUMBER
      //             AND photofp.tran_ec_photos.BOOK_NO = SROUSER.TRAN_EC_PARTIES_CR.BOOK_NO
      //             AND photofp.tran_ec_photos.DOCT_NO = SROUSER.TRAN_EC_PARTIES_CR.DOCT_NO
      //             AND photofp.tran_ec_photos.REG_YEAR = SROUSER.TRAN_EC_PARTIES_CR.REG_YEAR
      //             AND photofp.tran_ec_photos.SR_CODE = SROUSER.TRAN_EC_PARTIES_CR.SR_CODE
      //           WHERE
      //            PHOTOFP.TRAN_EC_PHOTOS.sr_code = ${SR_CODE}
      // AND PHOTOFP.TRAN_EC_PHOTOS.doct_no = ${DOCT_NO}
      // AND PHOTOFP.TRAN_EC_PHOTOS.reg_year = ${REG_YEAR}
      // AND PHOTOFP.TRAN_EC_PHOTOS.book_no = ${BOOK_NO}
      //         )
      //         SELECT
      //           sr_code,
      //           (SELECT sr_name FROM sr_master WHERE sr_cd = ${SR_CODE}) AS sr_name,
      //           book_no,
      //           FINGER,
      //           doct_no,
      //           reg_year,
      //           ec_number,
      //           code,
      //           TO_CHAR(TIME_STAMP, 'DD/MM/YYYY HH:MI:SS AM') CAPTURE_TIME,
      //           Aadhar,
      //           NAME, 
      //           party_code
      //         FROM
      //           RankedRows
      //         WHERE
      //           rn = 1 order by EC_NUMBER asc`;
  
        result = await this.orDao.oDBQueryService(query);
        if (result.length > 0) {
          const querysro = `select aadhar, empl_name as name,(select sr_name from sr_master where sr_cd = ${SR_CODE} ) sr_name from employee_login_master where sr_code=${SR_CODE}  and designation='Sub-Registrar'`;
         result1 = await this.orDao.oDBQueryService(querysro);
  
          let data;
          let imagePath;
  
          if (result) {
            const dateObject = new Date();
            const day = dateObject.getDate();
            const month = dateObject.getMonth() + 1;
            const year = dateObject.getFullYear();
            const formattedDay = day < 10 ? `0${day}` : day;
            const formattedMonth = month < 10 ? `0${month}` : month;
            formattedDate = `${formattedMonth}/${formattedDay}/${year}`;
  
          }
          const esignquery = `SELECT * FROM srouser.thumb_ec_esign WHERE sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO} and code not in ('SRO') order by EC_NUM asc`;
           remarksresult = await this.orDao.oDBQueryService(esignquery);
          }
           imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
          let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
          const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* General Styles */
        .container {
            text-align: center;
            margin: 20px;
            margin-top: 0;
        }

        .header-image {
            max-width: 75px;
        }

        h3 {
            margin: 0;
            margin-top: 5px;
        }

        h5 {
            margin: 0;
        }

        /* Table Styles */
        table {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 0;
            table-layout: fixed; /* Force fixed layout */
        }

         td {
            border: 1px solid #000;
            padding: 10px;
            text-overflow: ellipsis; /* Add ellipsis for overflowing text */
            height: 150px; /* Set fixed height */
            width:150px;
            vertical-align: top; /* Align content to the top */
        }

        th {
         border: 1px solid #000;
            padding: 10px;
            text-overflow: ellipsis; /* Add ellipsis for overflowing text */
            vertical-align: top; /* Align content to the top */
            font-size: 14px;
        }


        .finger-image {
            max-width: 90%;
            display: block;
            margin: auto;
        }

        /* Footer Styles */
        .footer {
            margin: 0;
            margin-right: 20px;
            margin-left: 20px;
        }

        .footer-text, .footer-date, .footer-note {
            margin: 0;
            text-align: justify;
        }
            .footer-note{
            margin-top:10px;
            }

        .footer-date {
            margin-top: 35px;
            margin-bottom: 0;
        }

        .bold {
            font-weight: 600;
        }

        .footer-signature {
            margin-left: 350px;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" class="header-image"/>
        <h3>REGISTRATIONS AND STAMPS DEPARTMENT</h3>
        <h5>GOVERNMENT OF ANDHRA PRADESH</h5>
        <table>
            <thead>
                <tr>
                    <th colspan="5">THUMB IMPRESSION REGISTER RELATING TO OFFICE ATTENDANCE - ${result1[0].SR_NAME}(${SR_CODE})</th>
                </tr>
                <tr>
                    <th>Document and year of registration</th>
                    <th>Name of the party</th>
                    <th>eSign of the Party</th>
                    <th>Impression of bulb of a Finger</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                ${result.map(
                    (item, index) => `
                        <tr>
                            <td>${item.BOOK_NO}-${item.DOCT_NO}-${item.REG_YEAR}</td>
                            <td>${item.NAME}<br>${item.CODE}</td>
                            <td></td>
                            <td><img src="data:image/jpeg;base64,${item.FINGER.toString('base64')}" alt="Fetched img" class="finger-image" /></td>
                            <td style="word-wrap: break-word; white-space: normal;">${flattenedDeepArray[index]}</td>                            
                        </tr>`
                ).join('')}
            </tbody>
        </table>
    </div>
    <div class="footer">
        <p class="footer-text">Each impression on this page has been affixed in my presence and under my supervision by the person whose name is entered next to it.</p><br>
        <p class="footer-date"> <span class="bold">Date:</span> ${formattedDate}. <span class="bold footer-signature">eSign of the Registering officer.</span></p>
        <p class="footer-note"><span class="bold">Note:</span> When an impression has been obtained from a person other than the executant or when all fingers other than the left thumb have been used in affixing the impression. The fact should be noted under the impression.</p>
    </div>
</body>
</html>
`;

let thumbimpressionDirectiory = path.join(__dirname, `../../../../../pdfs/`);
            // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
            if (!fsone.existsSync(thumbimpressionDirectiory)) {
                fsone.mkdirSync(thumbimpressionDirectiory, { recursive: true });
            }
            thumbimpressionDirectiory = `${thumbimpressionDirectiory}/uploads/`;
            if (!fsone.existsSync(thumbimpressionDirectiory)) {
              fsone.mkdirSync(thumbimpressionDirectiory, { recursive: true });
          }
          thumbimpressionDirectiory = `${thumbimpressionDirectiory}/thumb_impression_documents/`;
            if (!fsone.existsSync(thumbimpressionDirectiory)) {
              fsone.mkdirSync(thumbimpressionDirectiory, { recursive: true });
          }
          thumbimpressionDirectiory = `${thumbimpressionDirectiory}${REG_YEAR}/`;
         
            if (!fsone.existsSync(thumbimpressionDirectiory)) {
                fsone.mkdirSync(thumbimpressionDirectiory, { recursive: true });
            }
            thumbimpressionDirectiory = `${thumbimpressionDirectiory}${SR_CODE}/`;
            if (!fsone.existsSync(thumbimpressionDirectiory)) {
                fsone.mkdirSync(thumbimpressionDirectiory, { recursive: true });
            }
            thumbimpressionDirectiory = `${thumbimpressionDirectiory}${BOOK_NO}/`;
            if (!fsone.existsSync(thumbimpressionDirectiory)) {
                fsone.mkdirSync(thumbimpressionDirectiory, { recursive: true });
            }

            const filename = `${thumbimpressionDirectiory}document_${SR_CODE}_${DOCT_NO}_${REG_YEAR}_${BOOK_NO}.pdf`;
            // await generatePDFFromHTML(html, filename, response3);


          // const filename = `document_${SR_CODE}_${DOCT_NO}_${REG_YEAR}_${BOOK_NO}.pdf`;
          // const thumbImpressionFolder = 'thumb_impression_documents';
          // const regYearFolder = `thumb_impression_documents/${REG_YEAR}`;
          // const srcodeFolder = `thumb_impression_documents/${REG_YEAR}/${SR_CODE}`;
          // const bookNoFolder = `thumb_impression_documents/${REG_YEAR}/${SR_CODE}/${BOOK_NO}`;
  
          // if (!fsone.existsSync(thumbImpressionFolder)) {
          //   fsone.mkdirSync(thumbImpressionFolder);
          // }
  
          // // Create reg_year folder within thumb_impression_documents folder if it doesn't exist
          // if (!fsone.existsSync(regYearFolder)) {
          //   fsone.mkdirSync(regYearFolder);
          // }
          // // Create book_no folder within reg_year folder if it doesn't exist
          // if (!fsone.existsSync(srcodeFolder)) {
          //   fsone.mkdirSync(srcodeFolder);
          // }
          // if (!fsone.existsSync(bookNoFolder)) {
          //   fsone.mkdirSync(bookNoFolder);
          // }
          // const filepath = `${bookNoFolder}/${filename}`
          const pdfdata=await this.generatePDFFromHTML(html, filename, result);
          const pdfBuffer = await require('fs').promises.readFile(filename);

              
let roundedPosition;

  // const filename1 = `../../thumb_impression_documents/${REG_YEAR}/${SR_CODE}/${BOOK_NO}/document_${SR_CODE}_${DOCT_NO}_${REG_YEAR}_${BOOK_NO}.pdf`;
  // const pdfPath = path.join(__dirname, filename1);
          const textWithPositions = await this.coordinates.extractTextWithPositionsFromPDF(filename);
            const searchText = "eSign of the Registering officer";
            const signaturePosition = textWithPositions.find(item => item.text.includes(searchText));
            if (signaturePosition) {
               roundedPosition = {
                x: Math.round(signaturePosition.position.x),
                y: Math.round(signaturePosition.position.y),
                pageNo: signaturePosition.page
            };
          } 

          
          let  updatequery = `update srouser.thumb_ec_esign set COORDINATES = '70,${roundedPosition.y-8},70,${roundedPosition.x-255}', PAGE_NO=${roundedPosition.pageNo} where sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO} and code = 'SRO'`;
         let update = await this.orDao.oDbUpdate(updatequery);
          

          return { status: true, data: result, srodata: result1 };
        } 
        catch (err) {
          console.error("thumbImprressionServices - generateDocument || Error :", err);
          throw err;
        }}
      }
    pendingEsignList = async (reqBody) => {
    try {
      let esignstat;
      const { SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, esignstatus, code } = reqBody;
      if (esignstatus) {
        const base64String = Buffer.from(esignstatus).toString('base64');

        const eSignConfig = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.IGRS_ESIGN_URL}/downloadSignedDocTransID?transactionId=${base64String}`,
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const fileResponse = await axios(eSignConfig);
        if (fileResponse == null || fileResponse.data == null || fileResponse.data.data == undefined) {
          console.log('Pending Esign was not completed');
        } else {
          let query5
          const base64Pdf = fileResponse.data.data;
          const pdfBytes = await convertBase64ToPdf(base64Pdf);
          const filename = `../../../../../pdfs/uploads/thumb_impression_documents/${REG_YEAR}/${SR_CODE}/${BOOK_NO}/document_${SR_CODE}_${DOCT_NO}_${REG_YEAR}_${BOOK_NO}.pdf`;
          const pdfPath = path.join(__dirname, filename);
          await savePdfToFile(pdfBytes, pdfPath);

          // await savePdfToFile(pdfBytes, `thumb_impression_documents/${REG_YEAR}/${SR_CODE}/${BOOK_NO}/document_${SR_CODE}_${DOCT_NO}_${REG_YEAR}_${BOOK_NO}.pdf`);
          // let codequery=`select code from srouser.thumb_ec_esign where dn_qualifier = '${esignstatus}'`;
          // const result = await this.orDao.oDBQueryService(codequery);

          if (code == 'SRO') {   
           let querydn = `update srouser.thumb_ec_esign set dn_qualifier ='' where sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO} and code = 'SRO' and dn_qualifier != '${esignstatus}'`;
           let updatedn = await this.orDao.oDbUpdate(querydn);

            query5 = `update srouser.thumb_ec_esign set esign_status = 'Y', time_stamp=SYSDATE where sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO} and code = 'SRO'`;
          }
          else {
            query5 = `update srouser.thumb_ec_esign set esign_status = 'Y', time_stamp=SYSDATE where sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO} and dn_qualifier = '${esignstatus}'`;
          }
          let update = await this.orDao.oDbUpdate(query5);
          if (update > 0) {
            esignstat = 'success';
            console.log('PDF saved successfully');
          }
        }
      }

      const query = `SELECT * FROM srouser.thumb_ec_esign WHERE sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO} and code not in ('SRO') order by EC_NUM asc`;
      const result = await this.orDao.oDBQueryService(query);
      const query2 = `select * from srouser.thumb_ec_esign where sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO}  and code = 'SRO'`;
      const result1 = await this.orDao.oDBQueryService(query2);
      return { data: result, srodata: result1, esignstat: esignstat };
    } catch (ex) {
      console.error("PendingEsignListService - pendingEsignList || Error :", ex);
      throw ex;
    }
  };

  PDFPreview = async (reqData) => {
    const filename = `../../../../../pdfs/uploads/thumb_impression_documents/${reqData.REG_YEAR}/${reqData.SR_CODE}/${reqData.BOOK_NO}/document_${reqData.SR_CODE}_${reqData.DOCT_NO}_${reqData.REG_YEAR}_${reqData.BOOK_NO}.pdf`;
    const pdfPath = path.join(__dirname, filename);
    const pdfBuffer = await require("fs").promises.readFile(pdfPath);
    const base64Pdf = pdfBuffer.toString("base64");
    return base64Pdf;
  }







}
module.exports = thumbImprressionServices;