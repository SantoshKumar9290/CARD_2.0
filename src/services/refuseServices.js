const oracleDb = require("oracledb");
const { doRelease, dbConfig } = require("../plugins/database/oracleDbServices");
const odbDao = require("../dao/oracledbDao");
const axios = require('axios')
const https = require('https')
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require("../../services/winston");
const { encryptWithAESPassPhrase } = require('../utils');
const fs = require('fs').promises;
const fsone = require('fs');
const { PDFDocument } = require('pdf-lib')
const path = require('path');
const pdfParse = require('pdf-parse');
const { generatePDFFromHTML } = require("./generatePDFFromHTML");
const { log } = require("console");
const pdfjsLib = require('pdfjs-dist');
const convertBase64ToPdf = async (base64String) => {
  const decodedBuffer = Buffer.from(base64String, 'base64');
  const pdfDoc = await PDFDocument.load(decodedBuffer)
  return pdfDoc.save();
}
const savePdfToFile = async (pdfBytes, filePath) => {
  await fs.writeFile(filePath, pdfBytes);
  console.log(`PDF saved to ${filePath}`);
  return true;
};
const Esign = require('../services/esignService');

let instance = axios.create({
  httpsAgent: new https.Agent({
      rejectUnauthorized: false
  })
});

class RefuseServices {
  constructor() {
    this.odbDao = new odbDao();
    this.esign = new Esign();

  }



  refuseDocument = async (reqData) => {

    try {
      let query = `begin srouser.refuse_doc_cr(:ref_sr_code,:ref_book_no,:ref_doct_no,:ref_reg_year,:ref_schedule_no,:refuse_type,:refuse_by,:reuse_due_to,:rdoctno,:status); end;`;
      let obj = {
        ref_sr_code: {
          val: parseInt(reqData.srCode),
          type: oracleDb.NUMBER,
          dir: oracleDb.BIND_IN,
        },
        ref_book_no: {
          val: parseInt(reqData.bookNo),
          type: oracleDb.NUMBER,
          dir: oracleDb.BIND_IN,
        },
        ref_doct_no: {
          val: parseInt(reqData.doctNo),
          type: oracleDb.NUMBER,
          dir: oracleDb.BIND_IN,
        },
        ref_reg_year: {
          val: parseInt(reqData.regYear),
          type: oracleDb.NUMBER,
          dir: oracleDb.BIND_IN,
        },
        ref_schedule_no: {
          val: reqData.scheduleNo,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },

        refuse_type: {
          val: reqData.refuseType,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },
        refuse_by: {
          val: reqData.refuseBy,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },
        reuse_due_to: {
          val: reqData.refuseDueTo,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },
        rdoctno: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
        status: { type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_OUT },
      };
      let details = await this.odbDao.getSProcedureODB(query, obj);
      return details;
    } catch (ex) {
      console.error("refuseServices - refuseDocument || Error :", ex);
      throw constructCARDError(ex);
    }
  };

    extractTextWithPositionsFromPDF= async(pdfFilePath) =>{
      const data = new Uint8Array(fsone.readFileSync(pdfFilePath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;

    let textWithPositions = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const content = await page.getTextContent();
        content.items.forEach(item => {
            textWithPositions.push({
                text: item.str,
                position: {
                    x: item.transform[4],
                    y: item.transform[5]
                },
                page: i
            });
        });
    }

    return textWithPositions;
}
  generateDocument = async (reqData) => {
    try {
      const pdequery = `select * from srouser.PDE_DOC_STATUS_CR where sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and doct_no = ${reqData.DOCT_NO} and reg_year = ${reqData.REG_YEAR} and DOC_ESIGN='Y' and DOC_ENDORS='Y'`;
      const responsepde = await this.odbDao.oDBQueryService(pdequery);
      if (responsepde.length > 0) {
        const query = `select * from SROUSER.PDE_DOC_REFUSAL_STATUS_CR where sr_code = ${reqData.SR_CODE} AND book_no = ${reqData.BOOK_NO} and doct_no = ${reqData.DOCT_NO} and reg_year = ${reqData.REG_YEAR}`;
        const response = await this.odbDao.oDBQueryService(query);
        if (response.length == 0) {
          const querysro = `select aadhar, empl_name as name,(select sr_name from sr_master where sr_cd = ${reqData.SR_CODE} ) sr_name from employee_login_master where sr_code=${reqData.SR_CODE}  and designation='Sub-Registrar'`;
          let response1 = await this.odbDao.oDBQueryService(querysro);
          if (response1) {
            
            let queries = [
              {
                type: 'docDetails',
                query: `select * from srouser.tran_refuse where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and reg_year=${reqData.REG_YEAR} and DOCT_NO =${reqData.DOCT_NO}`
              },
              {
                type: 'excecutentDetails',
                query: `select * from srouser.refuse_tran_ec where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and reg_year=${reqData.REG_YEAR} and doct_no=${reqData.DOCT_NO} and code in ('DE', 'EX','ME','PL') `


              },
              {
                type: 'claimentpartyDetails',
                query: `select * from srouser.refuse_tran_ec where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and reg_year=${reqData.REG_YEAR} and DOCT_NO =${reqData.DOCT_NO} and code in ('DR', 'CL','MR','AY')`
              },
              {
                type: 'witnessDetails',
                query: `select * from photofp.tran_ec_witness_photos where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and reg_year=${reqData.REG_YEAR} and DOCT_NO =${reqData.DOCT_NO}`
              },
              {
                type: 'schedule',
                query: `select  a.*,(select village_name from hab_code where hab_code=a.village_code||'01') villagename,(select class_desc from area_class where nature_use=class_code) landuse from SROUSER.REFUSE_TRAN_SCHED a where sr_code=${reqData.SR_CODE} and book_no=${reqData.BOOK_NO} and reg_year=${reqData.REG_YEAR} and DOCT_NO = ${reqData.DOCT_NO}`
              }
            ];
            if (reqData.sliceNumer) {
              queries = queries.slice(0, reqData.sliceNumer);
            }
            let response3 = {};
            for (let i = 0; i < queries.length; i++) {
              response3[queries[i].type] = await this.odbDao.oDBQueryService(queries[i].query);


            }
            // let imagePath = 'logos\\ap_logo.jpg'
            const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
            let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });
            const longParagraph = `${response3?.docDetails[0]?.REFUSE_REASONS}`;
            const parts = longParagraph.split('--');
            let firstPart = parts[0];
            let secondPart = parts.slice(1).join('--');
            const html = `
                <div style=" ">
                <div style="text-align: center;">
                  <div style="display: inline-block; text-align: left;">
                   <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:90px; height:90px; display: inline-block; vertical-align: middle;"/>
                  </div>
                  <div style="display: inline-block; text-align: left; vertical-align: middle;">
                     <h3 style="margin-top: 10px; margin-bottom: 0;">REGISTRATIONS AND STAMPS DEPARTMENT</h3>
                     <h5 style="margin-top: 5px;">GOVERNMENT OF ANDHRA PRADESH</h5>
                  </div>
                </div>              
                <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
        <thead>
          <tr>
            <th colSpan="4" >
              BOOK-2 REGISTER
            </th>
          </tr>
          <tr>
            <th style="border: 1px solid #000; padding: 10px;">No.</th>
            <th style="border: 1px solid #000; padding: 10px;">Date of Document</th>
            <th style="border: 1px solid #000; padding: 10px;">Date and Hours of Presentation</th>
          </tr>
        </thead>
        <tbody>
        ${response3?.docDetails?.length > 0 ? `
          <tr>
            <td style="border: 1px solid #000; padding: 10px;">${response3?.docDetails[0]?.RDOCT_NO_2}</td>
            <td style="border: 1px solid #000; padding: 10px;">${new Date(response3?.docDetails[0]?.TIME_STAMP).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
            <td style="border: 1px solid #000; padding: 10px;">${new Date(response3?.docDetails[0]?.TIME_STAMP).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} ${new Date(response3?.docDetails[0]?.TIME_STAMP).toLocaleTimeString('en-US', { hour12: false })}</td>
          </tr>`
           : ''}
          <tr>
          <td style="border: 1px solid #000; padding: 10px;" colSpan="2">
          Names and Additions of Claiments
          <br />
          ${response3.claimentpartyDetails && response3.claimentpartyDetails.map((item, index) => (
            `<span key=${index}>${index + 1}.${item.NAME} <br />
            Address:${item.ADDRESS1}<br /></span>`
          )).join('')}
        </td>
            <td style="border: 1px solid #000; padding: 10px;" >
              Reason for Refusal
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;" colSpan="2">
              Names and Additions of Executant
              <br />
              ${response3.excecutentDetails && response3.excecutentDetails.map((item, index) => (
                `<span key=${index}>${index + 1}.${item.NAME} <br />
                Address:${item.ADDRESS1} <br /></span>`
              )).join('')}
            </td>
            <td style="border: 1px solid #000; vertical-align: top; padding:10px " rowSpan="4" >
            ${firstPart} <br />
            ${secondPart}.
           
          </td>
          </tr>
          <tr>
<td style="border: 1px solid #000; padding: 10px;" colSpan="2">
              Names and Additions of Presenter
              <br />
              ${response3.witnessDetails && response3.witnessDetails.map((item, index) => (
                `<span key=${index}>${index + 1}.${item.WITNESS_NAME} <br />
                Address:${item.ADDRESS} <br/></span>`
              )).join('')}
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px; " colSpan="2">
              Abstract of Document Together with All Claimants and Witnesses
              <br />
              <span>CLAIMENT DETAILS:</span><br/>
              ${response3.claimentpartyDetails && response3.claimentpartyDetails.map((item, index) => (


                `<span key=${index}>${index + 1}.${item.NAME} <br /></span>`
              )).join('')}
        <span>EXECUTANT DETAILS:</span><br/>
        ${response3.excecutentDetails && response3.excecutentDetails.map((item, index) => (
                `<span key=${index}>${index + 1}.${item.NAME} <br />
            </span>`
              )).join('')}
        <span>
        <span>WITNESS DETAILS:</span>
                          ${response3.witnessDetails && response3.witnessDetails.map((item, index) => (
                `<span key=${index}>${index + 1}.${item.WITNESS_NAME} </span> `
              ))} <br />
        </span>
        <span>PROPERTY DETAILS:</span><br/>
              ${response3.schedule && response3.schedule.length > 0 && (
                `
                <span style="display: inline-block; width: 150px;">Village Name</span>: ${response3.schedule[0].VILLAGENAME}<br />
                <span style="display: inline-block; width: 150px;">HAB Name</span> :${response3.schedule[0].LOC_HAB_NAME}<br />
                <span style="display: inline-block; width: 150px;">Schedule No.</span> :${response3.schedule[0].SCHEDULE_NO}<br />
                <span style="display: inline-block; width: 150px;">Survey No.</span> :${response3.schedule[0].SURVEY_NO}<br />
                <span style="display: inline-block; width: 150px;">Ward No.</span> :${response3.schedule[0].WARD_NO}<br />
                <span style="display: inline-block; width: 150px;">Block No.</span> :${response3.schedule[0].BLOCK_NO}<br />
                <span style="display: inline-block; width: 150px;">East</span> :${response3.schedule[0].EAST}<br />
                <span style="display: inline-block; width: 150px;">West</span> :${response3.schedule[0].WEST}<br />
                <span style="display: inline-block; width: 150px;">North</span> :${response3.schedule[0].NORTH}<br />
                <span style="display: inline-block; width: 150px;">South</span> :${response3.schedule[0].SOUTH}<br />
                <span style="display: inline-block; width: 150px;">Extent</span> :${response3.schedule[0].EXTENT}<br />
                `
              )}
              <br />
            </td>
          </tr>
        </tbody>
      </table>
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
      <tbody>
      <tr>
      <td style="font-size: 15px; text-align: right; padding-top: 120px; font-weight: bold; padding-right: 120px;">
        Signature of Sub-Registrar
      </td>
      </tr>
      <tr>
      <td style="font-size: 14px; padding-top: 10px; ">
      <b>Note:</b> The appeal can be made to the District Registrar within 30 days from the date of receipt of the refusal order.
      </td>
      </tr>
      </tbody>
      </table>
      </div>`;

      let refuseCertiDirectiory = path.join(__dirname, `../../../../../pdfs/`);
            // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
            if (!fsone.existsSync(refuseCertiDirectiory)) {
                fsone.mkdirSync(refuseCertiDirectiory, { recursive: true });
            }
            refuseCertiDirectiory = `${refuseCertiDirectiory}/uploads/`;
            if (!fsone.existsSync(refuseCertiDirectiory)) {
                fsone.mkdirSync(refuseCertiDirectiory, { recursive: true });
            }
            refuseCertiDirectiory = `${refuseCertiDirectiory}${reqData.SR_CODE}/`;
            if (!fsone.existsSync(refuseCertiDirectiory)) {
                fsone.mkdirSync(refuseCertiDirectiory, { recursive: true });
            }
            refuseCertiDirectiory = `${refuseCertiDirectiory}${reqData.BOOK_NO}/`;
            if (!fsone.existsSync(refuseCertiDirectiory)) {
                fsone.mkdirSync(refuseCertiDirectiory, { recursive: true });
            }
            refuseCertiDirectiory = `${refuseCertiDirectiory}${reqData.DOCT_NO}/`;
            if (!fsone.existsSync(refuseCertiDirectiory)) {
                fsone.mkdirSync(refuseCertiDirectiory, { recursive: true });
            }
            refuseCertiDirectiory = `${refuseCertiDirectiory}${reqData.REG_YEAR}/`;
            if (!fsone.existsSync(refuseCertiDirectiory)) {
                fsone.mkdirSync(refuseCertiDirectiory, { recursive: true });
            }
            const filename = `${refuseCertiDirectiory}refuseCertificate.pdf`;
            await generatePDFFromHTML(html, filename, response3);
            const pdfBuffer = await require('fs').promises.readFile(filename);
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const pdfFilePath = `${refuseCertiDirectiory}refuseCertificate.pdf`;
            const textWithPositions = await this.extractTextWithPositionsFromPDF(filename);
            const searchText = "Signature ";
            const signaturePosition = textWithPositions.find(item => item.text.includes(searchText));
        
            if (signaturePosition) {
              const roundedPosition = {
                x: Math.round(signaturePosition.position.x),
                y: Math.round(signaturePosition.position.y),
                pageNo: signaturePosition.page
            };
            for (let i = 0; response1.length > i; i++) {
              let insertquery = `insert into SROUSER.PDE_DOC_REFUSAL_STATUS_CR (
    SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,PAGE_NO,COORDINATES,
    TIME_STAMP,
    AADHAR,
    DN_QUALIFIER,
    NAME,
    ESIGN_STATUS) values(${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},${roundedPosition.pageNo},
        '50,${roundedPosition.y},50,${roundedPosition.x-150}','','${response1[i].AADHAR}','','${response1[i].NAME}','P')`
              let responseinsert = await this.odbDao.oDbInsertDocs(insertquery);
            }

                console.log("Signature of Sub-Registrar found at coordinates:", roundedPosition);
                
            } else {
                console.log("Signature of Sub-Registrar not found.");
            }
           


          }
          return response1
        }
        else {
          return response;
        }
      }
      else {
        return responsepde;
      }


    } catch (ex) {
      Logger.error("refuseServices - generateDocument || Error :", ex);
      console.error("refuseServices - generateDocument || Error :", ex);
      throw constructCARDError(ex);
    }
  }

  // encryptData = (data, secretKey) => {
  //   const encryptText = CryptoJS.AES.encrypt(data, secretKey).toString();
  //   return encryptText
  // }


  getcoordinatesdata = async (req) => {

    let srocode = req.SR_CODE;
    let bookno = req.BOOK_NO;
    let doctno = req.DOCT_NO;
    let regyear = req.REG_YEAR;
    let name = req.NAME;

    let result;
    try {
      const query = `
        SELECT t1.*, t2.sr_name
        from SROUSER.PDE_DOC_REFUSAL_STATUS_CR t1
        join sr_master t2 on t1.sr_code = t2.sr_cd
          WHERE sr_code = ${srocode}
            AND book_no = ${bookno}
            AND doct_no = ${doctno}
            AND reg_year = ${regyear}
            AND name = '${name}'
        `;

      result = await this.odbDao.oDBQueryService(query);
      if (result.length > 0) {
        let filePath = `../../../../../pdfs/uploads/${srocode}/${bookno}/${doctno}/${regyear}/refuseCertificate.pdf`;
         filePath = path.join(__dirname, filePath);
        const data = await fs.readFile(filePath);
        let base64Data = data.toString('base64');
        let transactionID = new Date().getTime();
        let eSignData = {
          "rrn": transactionID,
          "coordinates_location": 'Top_Right',
          "coordinates": `${result[0].PAGE_NO}-${result[0].COORDINATES};`,
          "doctype": 'PDF',
          "uid": result[0].AADHAR,
          "signername": result[0].NAME?.substring(0, 50),
          "signerlocation": `${result[0].SR_NAME}`,
          "filepassword": '',
          "signreason": 'RefusalCertificate',
          "authmode": 2,
          "webhookurl": process.env.REFUSALCERTIFICATE_CARD_UI_ESIGN,
          "file": base64Data
        };
        let eSignReponse ;
        // if (eSignData) {
          let esignUrlData = await this.odbDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
                if (!esignUrlData || esignUrlData.length == 0) {
                    throw new Error('Esign Urls Not Found');
                }
          let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
          let esignUrl = parseInt(doctno) % 2 === 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
           eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
          let queryupdate = `update SROUSER.PDE_DOC_REFUSAL_STATUS_CR set DN_QUALIFIER = '${eSignData.rrn}' where sr_code = ${srocode} and doct_no = ${doctno} and reg_year = ${regyear} and book_no = ${bookno} and name = '${eSignData.signername}'`;
          const resultupdate = await this.odbDao.oDbUpdate(queryupdate);
        
        // const encryptedData1 = encryptWithAESPassPhrase(JSON.stringify(
        //   eSignData), "igrsSecretPhrase");
          return { result: eSignData.rrn, data: eSignReponse };
              // }
        // return { result: eSignData, data: encryptedData1 }

      } else {
        Logger.error("refuseServices - getcoordinatesdata || Error :", ex);
        console.error("refuseServices - getcoordinatesdata || Error :", ex);
        throw constructCARDError(ex);
      }
    } catch (ex) {
      Logger.error("refuseServices - getcoordinatesdata || Error :", ex);
      console.error("refuseServices - getcoordinatesdata || Error :", ex);
      throw constructCARDError(ex);
    }

  }

  refuseDocrepresent = async (reqData) => {

    try {

      let query = `begin srouser.refuse_doc_cr_represent(:ref_sr_code,:ref_book_no,:ref_doct_no,:ref_reg_year,:ref_schedule_no,:refuse_type,:refuse_by,:reuse_due_to,:rdoctno,:status, :dr_pr_no,:dr_pr_dt); end;`;
      let obj = {
        ref_sr_code: {
          val: parseInt(reqData.srCode),
          type: oracleDb.NUMBER,
          dir: oracleDb.BIND_IN,
        },
        ref_book_no: {
          val: parseInt(reqData.bookNo),
          type: oracleDb.NUMBER,
          dir: oracleDb.BIND_IN,
        },
        ref_doct_no: {
          val: parseInt(reqData.doctNo),
          type: oracleDb.NUMBER,
          dir: oracleDb.BIND_IN,
        },
        ref_reg_year: {
          val: parseInt(reqData.regYear),
          type: oracleDb.NUMBER,
          dir: oracleDb.BIND_IN,
        },
        ref_schedule_no: {
          val: reqData.scheduleNo,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },

        refuse_type: {
          val: reqData.refuseType,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },
        refuse_by: {
          val: reqData.refuseBy,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },
        reuse_due_to: {
          val: reqData.reuseDueTo,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },
        dr_pr_no: {
          val: reqData.dr_pr_no,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },
        dr_pr_dt: {
          val: reqData.dr_pr_dt,
          type: oracleDb.DB_TYPE_VARCHAR,
          dir: oracleDb.BIND_IN,
        },
        rdoctno: { type: oracleDb.NUMBER, dir: oracleDb.BIND_OUT },
        status: { type: oracleDb.DB_TYPE_VARCHAR, dir: oracleDb.BIND_OUT },
      };
      let details = await this.odbDao.getSProcedureODB(query, obj);
      return details;

    } catch (ex) {

      console.error("refuseServices - refuseDocrepresent || Error :", ex);

      throw constructCARDError(ex);

    }

  };


  pendingEsignList = async (reqBody) => {
    try {
      const { SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, esignstatus } = reqBody;
      if (esignstatus != 'null') {
        const base64String = Buffer.from(esignstatus).toString('base64');

        const eSignConfig = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.IGRS_ESIGN_URL}/downloadSignedDocTransID?transactionId=${base64String}`,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        let fileResponse = await instance.request(eSignConfig);              
        // const fileResponse = await axios(eSignConfig);

        if (fileResponse == null || fileResponse.data == null || fileResponse.data.data == undefined) {
          console.log('Pending Esign was not completed');
        } else {
          let query5;
          let query6;
          const base64Pdf = fileResponse.data.data;
          const pdfBytes = await convertBase64ToPdf(base64Pdf);
          const filename = `../../../../../pdfs/uploads/${SR_CODE}/${BOOK_NO}/${DOCT_NO}/${REG_YEAR}/refuseCertificate.pdf`;
          let pdfPath = path.join(__dirname, filename);
          await savePdfToFile(pdfBytes, pdfPath);
          query5 = `update SROUSER.PDE_DOC_REFUSAL_STATUS_CR set esign_status = 'Y' where sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO}`;
          await this.odbDao.oDbUpdate(query5);
          query6 = `update pde_doc_Status_cr set doc_refuse='Y'  where sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO}`;
          await this.odbDao.oDbUpdate(query6);
          console.log('PDF saved successfully');
        }
      }
      const query = `SELECT * FROM SROUSER.PDE_DOC_REFUSAL_STATUS_CR WHERE sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO} `;
      const result = await this.odbDao.oDBQueryService(query);
      const query2 = `select * from SROUSER.PDE_DOC_REFUSAL_STATUS_CR where sr_code = ${SR_CODE} and doct_no = ${DOCT_NO} and reg_year = ${REG_YEAR} and book_no = ${BOOK_NO}`;
      const result1 = await this.odbDao.oDBQueryService(query2);
      return { data: result, srodata: result1 };
    } catch (ex) {
      console.error("refuseSrervices - pendingEsignList || Error :", ex);
      throw ex; // Handle the error more appropriately
    }
  };

  pdfpreviewSrvc = async (reqData) => {
    try {
      const filename = `../../../../../pdfs/uploads/${reqData.SR_CODE}/${reqData.BOOK_NO}/${reqData.DOCT_NO}/${reqData.REG_YEAR}/refuseCertificate.pdf`;
      const pdfPath = path.join(__dirname, filename);

      return new Promise((resolve, reject) => {
        fsone.readFile(pdfPath, (err, data) => {
          if (err) {
            console.error('Error reading PDF file:', err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    } catch (ex) {
      console.error("Error in PDFPreview:", ex);
      throw ex;
    }
  }
  getrdoctnoPendingNo = async (reqBody) => {
    try {
      const { SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR } = reqBody;
      const query = `SELECT r.RDOCT_NO_2, p.P_NUMBER FROM srouser.tran_refuse r
    LEFT JOIN srouser.tran_pending p ON r.doct_no = p.doct_no
    WHERE r.sr_code = ${SR_CODE} and r.doct_no = ${DOCT_NO} and r.reg_year = ${REG_YEAR} and r.book_no = ${BOOK_NO} `;
      const result = await this.odbDao.oDBQueryService(query);
      return result;
    } catch (ex) {
      console.error("refuseSrervices - getrdoctnoPendingNo || Error :", ex);
      throw ex; // Handle the error more appropriately
    }
  };
  getRdocstatus = async (reqData) => {
    try {
      let query = `select doc_rcorS from pde_doc_status_cr where SR_CODE =${reqData.SR_CODE} and BOOK_NO =${reqData.BOOK_NO} and DOCT_NO =${reqData.DOCT_NO} and REG_YEAR =${reqData.REG_YEAR}`;
      let response = await this.odbDao.oDBQueryService(query)
      return response;
    } catch (ex) {
      Logger.error("refuseservices - getRdocstatus || Error :", ex);
      console.error("refuseservices - getRdocstatus || Error :", ex);
      throw constructCARDError(ex);
    }
  }
  verifyApplicationExistance = async (reqData) =>{
    try {
      const checkQuery = `select * from pde_doc_status_cr where app_id = :appId`;
      const checkReponse = await this.odbDao.oDBQueryServiceWithBindParams(checkQuery, { appId: reqData.ID });
      if (checkReponse.length > 0) {
        throw new Error('Check slip already generated for this application.');
      }
      let query = `
  SELECT 
    CASE 
        WHEN se.LPMNO IS NOT NULL THEN se.LPMNO 
        ELSE pd.S_LP_NO 
    END AS S_LP_NO,
    pd.KHATA_NO,
    pd.VILLAGE_CODE, 
    s_ad.REG_YEAR,
    s_ad.DOCT_NO,
    sm.SR_NAME,
    CASE 
        WHEN se.LPMNO IS NOT NULL THEN 'FALSE'
        WHEN 
          (   
                s_ad.S_LP_NO = pd.S_LP_NO  
            AND s_ad.KHATA_NO = pd.KHATA_NO  
            AND s_ad.VILLAGE_CODE = pd.VILLAGE_CODE  
            AND s_ad.TOTAL_EXTENT != s_ad.SELLING_EXTENT
          )
          AND 
            ts.nature_use IN ('21','26','30','45','46')
          AND
            tm.tran_maj_code IN ('01', '03', '04') 
          AND 
          (
                (tm.tran_maj_code = '01' AND tm.tran_min_code IN ('01','04','05','06','08','14','15','16','17','19','27','28','29'))  
             OR (tm.tran_maj_code = '03' AND tm.tran_min_code IN ('01','02','03','04','05','06','07','08','09'))  
             OR (tm.tran_maj_code = '04' AND tm.tran_min_code IN ('01','02'))
          )
        THEN 'TRUE'
        ELSE 'FALSE'
      END AS IS_PRESENT
    FROM preregistration.pde_adangal_details pd
    JOIN preregistration.presentation pr ON pd.ID = pr.ID
    JOIN preregistration.schedule_entry se ON pd.ID = se.ID
    LEFT JOIN srouser.adangal_details s_ad ON s_ad.S_LP_NO = pd.S_LP_NO AND s_ad.KHATA_NO = pd.KHATA_NO AND s_ad.VILLAGE_CODE = pd.VILLAGE_CODE
    LEFT JOIN SR_MASTER sm ON sm.SR_CD = s_ad.SR_CODE 
    LEFT JOIN srouser.tran_sched ts ON ts.sr_code = s_ad.sr_code AND ts.book_no = s_ad.book_no AND ts.doct_no = s_ad.doct_no AND ts.reg_year = s_ad.reg_year  
    LEFT JOIN srouser.tran_major tm ON tm.sr_code = s_ad.sr_code AND tm.book_no = s_ad.book_no AND tm.doct_no = s_ad.doct_no AND tm.reg_year = s_ad.reg_year  
    WHERE pd.ID = '${reqData.ID}'
      AND se.nature_use IN ('21','26','30','45','46')
      AND 
        (
             (pr.tran_maj_code = '01' AND pr.tran_min_code IN ('01','04', '05', '06', '08', '14', '15', '16', '17', '19', '27' ,'28', '29'))
          OR (pr.tran_maj_code = '03' AND pr.tran_min_code IN ('01', '02', '03', '04', '05', '06', '07', '08', '09'))
          OR (pr.tran_maj_code = '04' AND pr.tran_min_code IN ('01', '02'))
        )`;
      const response = await this.odbDao.oDBQueryService(query)

      // const cancelSlotAndChallana = await instance({ 
      //   method: "POST",
      //   url: `${process.env.SLOT_CHALLANA_CANCEL}/SBAPI/v1/PDE/cancelSlot`,
      //   data:{
      //     "applicationId" : reqData.ID,
      //     "sroCode" : reqData.SR_CODE
      //   },
      // });
      // return response.length < 1 ? "FALSE" : response.some(obj => obj.IS_PRESENT == "TRUE") ? "TRUE" : "FALSE";
      return response.filter(obj => obj.IS_PRESENT == "TRUE") || [];
    } catch (ex) {
      Logger.error("refuseservices - verifyApplicationExistance || Error :", ex);
      console.error("refuseservices - verifyApplicationExistance || Error :", ex);
      throw constructCARDError(ex);
    }
  }
}
module.exports = RefuseServices;