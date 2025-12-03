const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const fs = require("fs");
const path = require("path");
const moment = require('moment');
const { CODES } = require('../constants/appConstants');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');

class Section47AServices {
    constructor() {
        this.orDao = new OrDao();
    }

    generatePDFFromHTML = async (html, time_stamp) => {
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html);
      const pdfBuffer = await page.pdf({
        // path: filename,
        format: 'A4',
        margin: {
          top: '50px',
          right: '20px',
          bottom: '100px',
          left: '10px',
        },
        displayHeaderFooter: true,
        headerTemplate : `<div></div>`,
        footerTemplate: `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; margin: -5px 10px; width: 100%;">
          <div style="flex: 1; text-align: left;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
          <div style="flex: 1; text-align: right; color: #333;">
            Generated on: ${time_stamp == '' ? new Date().toLocaleString() : moment(time_stamp).format('DD/M/YYYY, hh:mm:ss a')}
          </div>
        </div>
        `,
        printBackground: true,
        fontFamily: true,
        landscape: false,
      });
      await browser.close();
      return pdfBuffer;
    }

    generateForm1PDF47ASrvc = async (reqData) => {
        try {
            const query = `SELECT tm.sr_code, (select sr_name from sr_master where sr_cd = tm.sr_code) as sr_name, tm.doct_no, tm.book_no, tm.reg_year, tm.p_date, tm.p_name, tc.address1 as address,
                            e_date, tm.tran_maj_code, tm.tran_min_code, (select tran_desc from tran_dir where tran_maj_code = tm.tran_maj_code and tran_min_code = tm.tran_min_code) as tran_desc,
                            tm.final_taxable_value, tm.stamp_duty_paid, (tm.sd_payable + tm.td_payable) - tm.stamp_duty_paid as dsd_payable,
                            tp.p_number, to_char(tp.kept_on,'YYYY') as p_year
                        FROM tran_major tm
                        join tran_ec tc on tm.sr_code = tc.sr_code and tm.doct_no = tc.doct_no and tm.book_no = tc.book_no 
                                                    and tm.reg_year = tc.reg_year and tm.p_code = tc.code and upper(tm.p_name) = upper(tc.name)
                        join tran_pending tp on tm.sr_code = tp.sr_code and tm.doct_no = tp.doct_no and tm.book_no = tp.book_no 
                                                    and tm.reg_year = tp.reg_year                        
                        WHERE 
                        tm.SR_CODE = :SR_CODE AND tm.DOCT_NO = :DOCT_NO AND tm.BOOK_NO = :BOOK_NO AND tm.REG_YEAR = :REG_YEAR and rownum = 1`;
            const tranECQuery = `SELECT code, name, address1
                        FROM tran_ec
                        WHERE 
                        SR_CODE = :SR_CODE AND DOCT_NO = :DOCT_NO AND BOOK_NO = :BOOK_NO AND REG_YEAR = :REG_YEAR`;
            // const cashPaidQuery = `
            //             SELECT sr_code, book_no, doct_no, reg_year, SUM (NVL (amount, 0)) + SUM (NVL (amount_by_challan, 0)) + SUM (NVL (amount_by_dd, 0))+ SUM (NVL (amount_by_online, 0))+ SUM (NVL (AMOUNT_BY_SHC, 0)) tot_amou 
            //             FROM cash_paid 
            //             WHERE (sr_code, book_no, doct_no, reg_year, regn_type, c_receipt_no, TRUNC(receipt_date)) IN 
            //             (SELECT sr_code, book_no, doct_no, reg_year, regn_type, c_receipt_no, TRUNC(receipt_date) 
            //             FROM cash_det 
            //             WHERE sr_code = :SR_CODE AND book_no = :BOOK_NO AND doct_no =  :DOCT_NO AND reg_year =  :REG_YEAR AND acc_canc = 'A') 
            //             and account_code = 7
            //             GROUP BY sr_code, book_no, doct_no, reg_year`;
            const propertyQuery = `
                SELECT sum(mkt_value) as mkt_value
                        FROM tran_sched
                        WHERE 
                        SR_CODE = :SR_CODE AND DOCT_NO = :DOCT_NO AND BOOK_NO = :BOOK_NO AND REG_YEAR = :REG_YEAR`;
            // const verifyQuery = `select count(*) as count from employee_login_master where sr_code = :SR_CODE AND EMPL_ID = :EMPL_NAME`
            const Sec47aQuery = `select form1_time_stamp, form1_status, sr_remarks from srouser.tran_section_47a where SR_CODE = :SR_CODE AND DOCT_NO = :DOCT_NO AND BOOK_NO = :BOOK_NO AND REG_YEAR = :REG_YEAR AND form1_status = 'Y'`
            let bindParams = {
                SR_CODE : reqData.SR_CODE,
                DOCT_NO : reqData.DOCT_NO,
                BOOK_NO : reqData.BOOK_NO,
                REG_YEAR : reqData.REG_YEAR
            }
            let sec47aResult = await this.orDao.oDBQueryServiceWithBindParams(Sec47aQuery, bindParams);
            // if(sec47aResult.length > 0 && sec47aResult[0].COUNT > 0) {
            //   throw new Error("Form 1 already generated"); 
            // }
            // const verifyResult = await this.orDao.oDBQueryServiceWithBindParams(verifyQuery, { SR_CODE : reqData.SR_CODE, EMPL_NAME : reqData.EMPL_NAME });
            // if(verifyResult.length > 0 && verifyResult[0].COUNT === 0) {
            //   throw new Error("Not authorized to generate the form 1"); 
            // }
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindParams);
            let Ecresponse = await this.orDao.oDBQueryServiceWithBindParams(tranECQuery, bindParams);
            // let cashPaidResult = await this.orDao.oDBQueryServiceWithBindParams(cashPaidQuery, bindParams);
            let propertyResult = await this.orDao.oDBQueryServiceWithBindParams(propertyQuery, bindParams);
            if(response.length === 0 || Ecresponse.length === 0 || propertyResult.length === 0) {
              throw new Error("No data found"); 
            }
            let executantsDetails = Ecresponse.filter(C => CODES.EXECUTANT_CODES.includes(C.CODE));
            let claimantDetails = Ecresponse.filter(C => CODES.CLAIMANT_CODES.includes(C.CODE));
            const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
            const data = fs.readFileSync(imagePath , {encoding : 'base64'});
            const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
                <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
                <h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH</h3>
                <h4 style="margin:0px; margin-top : 5px">REGISTRATIONS & STAMPS DEPARTMENT</h4>
                <h5 style="margin:0px; margin-top : 8px; text-decoration : underline;">FORM - 1(vide Rule 4(i))</h5>
                <div style="display:flex; justify-content:space-between;margin-top: 10px; font-size : 14px;">
                    <div><span style="font-weight:600">SR Name : </span>${response[0].SR_NAME}(${response[0].SR_CODE})</div>
                    <div><span style="font-weight:600">CS No. / Year : </span>${response[0].DOCT_NO}/${response[0].REG_YEAR}</div>
                    <div><span style="font-weight:600">Pending No. / Year : </span>${response[0].P_NUMBER}/${response[0].P_YEAR}</div>
                    <div><span style="font-weight:600">Book No. : </span>${response[0].BOOK_NO}</div>
                </div>
                <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:30px">
                  <tbody>
                    <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Date of Presentation and Name and address of presentant</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">${moment(response[0].P_DATE).format('DD-MM-YYYY')}, ${response[0].P_NAME}, ${response[0].ADDRESS}</td>
                            </tr>
                            <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Date of execution</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">${moment(response[0].E_DATE).format('DD-MM-YYYY')}</td>
                            </tr>
                            <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Name and address of executants</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">
                                    ${executantsDetails.length > 0 && executantsDetails.map((item,index) => `
                                        <div key=${index}>${item.NAME}, ${item.ADDRESS1}</div>
                                    `).join('')}
                              </td>
                            </tr>
                            <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Name and address of claimants</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">
                                    ${claimantDetails.length > 0 && claimantDetails.map((item,index) => `
                                        <div key=${index}>${item.NAME}, ${item.ADDRESS1}</div>
                                    `).join('')}
                              </td>
                            </tr>
                            <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Nature, market value (or consideration) as mentioned in the document</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">${response[0].TRAN_DESC}, ${response[0].FINAL_TAXABLE_VALUE}</td>
                            </tr>
                            <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Stamp borne by the document</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">${response[0].STAMP_DUTY_PAID}</td>
                            </tr>
                            <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Nature, market value (or consideration) of the subject matter of the document as in the opinion of the registering officer together with the stamp duty with which it has to be charged</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">${response[0].TRAN_DESC}, ${response[0].FINAL_TAXABLE_VALUE}</td>
                            </tr>
                            <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Deficit Stamp duty</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">${(response[0].DSD_PAYABLE) ? response[0].DSD_PAYABLE  : 0}</td>
                            </tr>
                            <tr style="font-size : 14px;">
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%; font-weight : 600;">Remarks (Explain how the details in column 8 are arrived at)</td>
                              <td style="text-align: start; vertical-align: middle; border: 1px solid #000; padding: 7px; width : 50%">${(sec47aResult.length > 0 && sec47aResult[0].FORM1_STATUS == 'Y') ? sec47aResult[0].SR_REMARKS : reqData.COMMENT}, ${propertyResult[0].MKT_VALUE}</td>
                            </tr>                   
                </tbody>
              </table>
              <div style="font-size : 14px; text-align: start;>
                <div style="margin-top: 5px;">
                    <span style = "font-weight : 600;">Enclosure .. </span>Copy of the document
                </div>
                <div style="display:flex; justify-content:space-between; margin-top: 15px;">
                    <div><span style = "font-weight : 600;">Office : </span>${response[0].SR_NAME}</div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top: 5px;">
                    <div><span style = "font-weight : 600;">Date : </span>${moment().format('DD-MM-YYYY')}</div>
                    <div><span style = "font-weight : 600;">Signature</span></div>
                </div>
                </div>
                </div>
            `;
            // let section47aDirectory = `/pdfs/uploads/Section47A/${reqData.SR_CODE}/${reqData.BOOK_NO}/${reqData.DOCT_NO}/${reqData.REG_YEAR}/`;
            // if (!fs.existsSync(section47aDirectory)) {
            //   fs.mkdirSync(section47aDirectory, { recursive: true });
            // }
            // const filename = `${section47aDirectory}document_${reqData.SR_CODE}_${reqData.BOOK_NO}_${reqData.DOCT_NO}_${reqData.REG_YEAR}_form1.pdf`;
            // await this.generatePDFFromHTML(html,filename);
            // let pdfBuffer = await fs.promises.readFile(filename);
            // const isFileSaved = fs.existsSync(filename);
            const generate_stamp = (sec47aResult.length > 0 && sec47aResult[0].FORM1_STATUS == 'Y') ? sec47aResult[0].FORM1_TIME_STAMP : '';
            const pdfBuffer = await this.generatePDFFromHTML(html, generate_stamp);
            if(pdfBuffer && pdfBuffer.length > 0) {
              if(sec47aResult.length === 0) {
                  const query = `update srouser.tran_section_47a set form1_status = 'Y', form1_time_stamp = sysdate, form1_entry_by = :EMPL_NAME, sr_remarks = :SR_COMMENT where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR`;
                  const bindParams1 = {
                    ...bindParams,
                    EMPL_NAME : reqData.EMPL_NAME,
                    SR_COMMENT : reqData.COMMENT
                  }
                  const updateResult = await this.orDao.oDbInsertDocsWithBindParams(query, bindParams1);
                  if(updateResult > 0) {
                    const base64Pdf = pdfBuffer.toString('base64');
                    return base64Pdf;
                  }
                  else {
                    throw new Error("Update failed, Re-generate the Form - 1"); 
                  }
              }
              else {
                const base64Pdf = pdfBuffer.toString('base64');
                return base64Pdf;
              }
            }
            else {
              throw new Error("Failed to generate the Form - 1"); 
            }
        } catch (ex) {
            Logger.error("Section47AServices - generateForm1PDF47ASrvc || Error :", ex);
            console.error("Section47AServices - generateForm1PDF47ASrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    generateForm2PDF47ASrvc = async (reqData) => {
      try {
          const Sec47aQuery = `select tp.p_number, TO_CHAR(tp.kept_on, 'DD-MM-YYYY') as year, sec.form2_status, sec.form2_time_stamp, sec.form2_entry_by from srouser.tran_section_47a sec
                              join tran_pending tp on sec.sr_code = tp.sr_code and sec.doct_no = tp.doct_no and sec.reg_year = tp.reg_year and sec.book_no = tp.book_no
                              where sec.SR_CODE = :SR_CODE AND sec.DOCT_NO = :DOCT_NO AND sec.BOOK_NO = :BOOK_NO AND sec.REG_YEAR = :REG_YEAR AND sec.form1_status = 'Y' and rownum =1`
          const verifyQuery = `
                  select b.sr_cd, dr.dr_name  from (           
                  select sr.dr_cd from employee_login_master a
                  join sr_master sr on a.sr_code = sr.sr_cd
                  where a.empl_id = :EMPL_ID and a.designation = 'District Registrar') a
                  join sr_master b on a.dr_cd = b.dr_cd 
                  join dr_master dr on b.dr_cd = dr.dr_cd
                  where b.sr_cd = :SR_CODE`;
          const query = `select sr_cd, sr_name from sr_master where sr_cd = :SR_CODE`;
          const bindParams = {
              SR_CODE : reqData.SR_CODE
          }
          const bindParams2 = {
            SR_CODE : reqData.SR_CODE,
            DOCT_NO : reqData.DOCT_NO,
            BOOK_NO : reqData.BOOK_NO,
            REG_YEAR : reqData.REG_YEAR
          }
          let sec47aResult = await this.orDao.oDBQueryServiceWithBindParams(Sec47aQuery, bindParams2);
          const bindParams1 = {
            EMPL_ID : (sec47aResult.length > 0 && sec47aResult[0].FORM2_STATUS == 'Y') ? sec47aResult[0].FORM2_ENTRY_BY : reqData.EMPL_NAME
          }
          // if(sec47aResult.length > 0 && sec47aResult[0].FORM2_STATUS === 'Y') {
          //   throw new Error("Form 2 already generated"); 
          // }
          let verifyResult = await this.orDao.oDBQueryServiceWithBindParams(verifyQuery, {...bindParams,...bindParams1});
          if(verifyResult.length === 0) {
            throw new Error("Not authorized to generate the form 2"); 
          }
          const drQuery = `select dr.dr_name from employee_login_master a
                          join sr_master sr on a.sr_code = sr.sr_cd
                          join dr_master dr on sr.dr_cd = dr.dr_cd
                          where a.empl_id = :EMPL_ID and a.designation = 'District Registrar'`;
          let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindParams);
          let drResult = await this.orDao.oDBQueryServiceWithBindParams(drQuery, bindParams1);
          if(response.length === 0 || drResult.length === 0) {
            throw new Error("No data found"); 
          }
          const imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
          const data = fs.readFileSync(imagePath , {encoding : 'base64'});
          const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
              <div><img src="data:image/jpeg;base64,${data}" alt="Header image" style="max-width:75px"/></div>
              <h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH</h3>
              <h4 style="margin:0px; margin-top : 5px">REGISTRATIONS & STAMPS DEPARTMENT</h4>
              <h5 style="margin:0px; margin-top : 8px; text-decoration : underline;">FORM - 2(vide Rule 4(i))</h5>
              <div style="font-weight: 600; text-align: center; margin-top: 10px; font-size : 14px;">
                  [Form of notice prescribed under Rule 4 of the Andhra Pradesh Stamp (Presentation of Undervaluation of instruments) Rules, 1975]
              </div>
              <div style="margin-top: 10px; font-size : 14px; line-height: 1.8;">
                  <div>To</div>
                  <div style="text-align : justify;">
                    Please take notice that under sub-section(1) of Section 47-A of the Indian Stamp (Andhra Pradesh Amendment) Act, 
                    1971 (Act No.22 of 1971), a reference has been received from the registering officer 
                    <span style="font-weight : 600;">${response[0].SR_NAME}(${response[0].SR_CD})</span> for determination of the market
                    value of the perperties/ the consideration covered by the instrument registered as pending No. <span style="font-weight : 600;">${sec47aResult[0].P_NUMBER}</span>
                    dated the <span style="font-weight : 600;">${sec47aResult[0].YEAR}</span> and the duty payable on the above instrument.
                  </div>
                  <div>
                    (A copy of the reference is enclosed)
                  </div>
                  <div style="text-align : justify;">
                    2. You are hereby required to submit your representation, if any in writing. to the undersigned within twenty-one days 
                    from the date of service of this notice, to show that the market value of the properties/the consideration has been truly
                    and correctly setforth in the instrument. You may also produce all evidence in support of your representation within the time allowed.
                  </div>
                  <div style="text-align : justify;">
                    3. If no representation is received within the time allowed, the matter will be disposed of on the basis of material available. 
                  </div>
              </div>
              <div style = "font-size : 14px;">
                <div style="display:flex; justify-content:space-between; margin-top: 15px;">
                    <div><span style = "font-weight : 600;">Office :</span> ${drResult[0].DR_NAME}</div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top: 5px;">
                    <div><span style = "font-weight : 600;">Date :</span> ${(sec47aResult.length > 0 && sec47aResult[0].FORM2_STATUS == 'Y') ? moment(sec47aResult[0].FORM2_TIME_STAMP).format('DD-MM-YYYY') : moment().format('DD-MM-YYYY')}</div>
                    <div><span style = "font-weight : 600;">Signature</span></div>
                </div>
              </div>
              </div>
          `;
          // let section47aDirectory = `/pdfs/uploads/Section47A/${reqData.SR_CODE}/${reqData.BOOK_NO}/${reqData.DOCT_NO}/${reqData.REG_YEAR}/`;
          // if (!fs.existsSync(section47aDirectory)) {
          //   fs.mkdirSync(section47aDirectory, { recursive: true });
          // }
          // const filename = `${section47aDirectory}document_${reqData.SR_CODE}_${reqData.BOOK_NO}_${reqData.DOCT_NO}_${reqData.REG_YEAR}_form2.pdf`;
          // await this.generatePDFFromHTML(html,filename);
          // let pdfBuffer = await fs.promises.readFile(filename);
          // const isFileSaved = fs.existsSync(filename);
          const generate_stamp = (sec47aResult.length > 0 && sec47aResult[0].FORM2_STATUS == 'Y') ? sec47aResult[0].FORM2_TIME_STAMP : '';
          const pdfBuffer = await this.generatePDFFromHTML(html, generate_stamp);
          if(pdfBuffer && pdfBuffer.length > 0) {
            if(sec47aResult.length > 0 && sec47aResult[0].FORM2_STATUS == 'N') {
                const query = `update srouser.tran_section_47a set form2_status = 'Y', form2_time_stamp = sysdate, form2_entry_by = :EMPL_ID where sr_code = :SR_CODE and doct_no = :DOCT_NO and book_no = :BOOK_NO and reg_year = :REG_YEAR`;
                const updateResult = await this.orDao.oDbInsertDocsWithBindParams(query, {...bindParams1, ...bindParams2});
                if(updateResult > 0) {
                  const base64Pdf = pdfBuffer.toString('base64');
                  return base64Pdf;
                }
                else {
                  throw new Error("Update failed, Re-generate the Form - 2"); 
                }
            }
            else {
              const base64Pdf = pdfBuffer.toString('base64');
              return base64Pdf;
            }
          }
          else {
            throw new Error("Failed to generate the Form - 2"); 
          }
      } catch (ex) {
          Logger.error("Section47AServices - generateForm2PDF47ASrvc || Error :", ex);
          console.error("Section47AServices - generateForm2PDF47ASrvc || Error :", ex);
          throw constructCARDError(ex);
      }
    }

    getSRDoctDetailsSrvc = async (reqData, type) => {
      try {
        let query;
        const bindParams = {
            SR_CODE : reqData.SR_CODE,
            REG_YEAR : reqData.REG_YEAR
        }
        if(type === 'SRO' || type === 'STAFF') {
            query = `SELECT a.sr_code, a.doct_no, a.reg_year, a.book_no, a.ack_year, a.p_name, (select tran_desc from tran_dir b where a.tran_maj_code=b.tran_maj_code and a.tran_min_code=b.tran_min_code) trandesc, c.app_id
                    From tran_major a , srouser.tran_section_47a b, pde_doc_status_cr c 
                    where a.sr_code= :SR_CODE and a.reg_year= :REG_YEAR and a.sr_code=b.sr_code and a.book_no = b.book_no 
                    and a.doct_no = b.doct_no and a.reg_year = b.reg_year and a.sr_code = c.sr_code and a.doct_no = c.doct_no and
                    a.book_no = c.book_no and a.reg_year = c.reg_year and c.doc_esign = 'Y' and c.doc_pend = 'Y'
                    and sr_status = 'N'`;
        }
        else if(type === 'DR') {
            query = `SELECT a.sr_code, a.doct_no, a.reg_year, a.book_no, a.ack_year, a.p_name, (select tran_desc from tran_dir b where a.tran_maj_code=b.tran_maj_code and a.tran_min_code=b.tran_min_code) trandesc, c.app_id
                    From tran_major a , srouser.tran_section_47a b, pde_doc_status_cr c  
                    where a.sr_code= :SR_CODE and a.reg_year= :REG_YEAR and a.sr_code=b.sr_code and a.book_no = b.book_no 
                    and a.doct_no = b.doct_no and a.reg_year = b.reg_year  and a.sr_code = c.sr_code and a.doct_no = c.doct_no and
                    a.book_no = c.book_no and a.reg_year = c.reg_year and c.doc_esign = 'Y' and c.doc_pend = 'Y'
                    and dr_status = 'N' and form1_status = 'Y'`;
        }
        else {
          throw new Error("No Authorized to access");
        }
        let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindParams);
        return response;
      } catch (ex) {
          Logger.error("Section47AServices - getSRDoctDetailsSrvc || Error :", ex);
          console.error("Section47AServices - getSRDoctDetailsSrvc || Error :", ex);
          throw constructCARDError(ex);
      }
    } 

    getSection47APDFSrvc = async (reqData, params) => {
      try {
        if(params.form === '1' || params.form === '2') {
          if(params.type === 'SRO' || params.type === 'DR') {
            let section47aDirectory = `/pdfs/uploads/Section47A/${reqData.SR_CODE}/${reqData.BOOK_NO}/${reqData.DOCT_NO}/${reqData.REG_YEAR}/`;
            const filename = `${section47aDirectory}document_${reqData.SR_CODE}_${reqData.BOOK_NO}_${reqData.DOCT_NO}_${reqData.REG_YEAR}_form${params.form}.pdf`;
            const isFileSaved = fs.existsSync(filename); 
            if(isFileSaved) {
              const pdfBuffer = await fs.promises.readFile(filename);
              const base64Pdf = pdfBuffer.toString('base64');
              return base64Pdf;
            }
            else {
              throw new Error("No data generated file"); 
            }
          }
          else {
            throw new Error("No Authorized to access"); 
          }
        }
        else {
          throw new Error("No data generated file"); 
        }
      } catch (ex) {
          Logger.error("Section47AServices - getSection47APDFSrvc || Error :", ex);
          console.error("Section47AServices - getSection47APDFSrvc || Error :", ex);
          throw constructCARDError(ex);
      }
    }

    getSec47aStatusSrvc = async (reqData) => {
      try {
            const statusQuery = `select cca.app_id,s.sr_code,s.doct_no, s.reg_year, s.book_no, cca.section_47 as section_47a,
                s.form1_status, s.form2_status, s.dr_status, s.sr_status
            from 
            pde_doc_status_cr a 
            left join srouser.tran_section_47a s on a.sr_code = s.sr_code and a.doct_no = s.doct_no and a.book_no = s.book_no and a.reg_year = s.reg_year
            join preregistration.Section47A_Dutyfee cca on a.app_id = cca.app_id
            where a.sr_code = :SR_CODE and a.book_no = :BOOK_NO and a.doct_no = :DOCT_NO and a.reg_year = :REG_YEAR`;
            let bindParams = {
                SR_CODE : reqData.SR_CODE,
                DOCT_NO : reqData.DOCT_NO,
                BOOK_NO : reqData.BOOK_NO,
                REG_YEAR : reqData.REG_YEAR
            }
            let response = await this.orDao.oDBQueryServiceWithBindParams(statusQuery, bindParams);
            return response;
        }
      catch (ex) {
          Logger.error("Section47AServices - getSec47aStatusSrvc || Error :", ex);
          console.error("Section47AServices - getSec47aStatusSrvc || Error :", ex);
          throw constructCARDError(ex);
      }
    }

    drAcceptSrvc = async (reqData) => {
      try {
        console.log(reqData);
        
            const updateQuery = `update srouser.tran_section_47a set dr_proceed_date = to_date(:PROCEED_DATE,'DD-MM-YYYY'), DR_PROCEED_NO = :DR_PROCEED_NO, dr_status = 'Y', dr_entry_by = :EMPL_NAME, dr_time_stamp = sysdate where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR`;
            let bindParams = {
                SR_CODE : reqData.SR_CODE,
                DOCT_NO : reqData.DOCT_NO,
                BOOK_NO : reqData.BOOK_NO,
                REG_YEAR : reqData.REG_YEAR,
                DR_PROCEED_NO : reqData.DR_PROCEED_NO,
                PROCEED_DATE : reqData.PROCEED_DATE,
                EMPL_NAME : reqData.EMPL_NAME
            }
            let response = await this.orDao.oDbInsertDocsWithBindParams(updateQuery, bindParams);
            if(response === 0) {
              throw new Error("Accept failed");
            }
            return response;
          }
      catch (ex) {
          Logger.error("Section47AServices - drAcceptSrvc || Error :", ex);
          console.error("Section47AServices - drAcceptSrvc || Error :", ex);
          throw constructCARDError(ex);
      }
    }
 
    srAcceptSrvc = async (reqData) => {
      try {
            const updateQuery = `update srouser.tran_section_47a set sr_mis_status = :MIS_STATUS, sr_status = 'Y', sr_entry_by = :EMPL_NAME, sr_time_stamp = sysdate where sr_code = :SR_CODE and book_no = :BOOK_NO and doct_no = :DOCT_NO and reg_year = :REG_YEAR`;
            let bindParams = {
                SR_CODE : reqData.SR_CODE,
                DOCT_NO : reqData.DOCT_NO,
                BOOK_NO : reqData.BOOK_NO,
                REG_YEAR : reqData.REG_YEAR,
                EMPL_NAME : reqData.EMPL_NAME,
                MIS_STATUS : reqData.MIS_STATUS
            }
            let response = await this.orDao.oDbInsertDocsWithBindParams(updateQuery, bindParams);
            if(response === 0) {
              throw new Error("Accept failed");
            }
            return response;
          }
      catch (ex) {
          Logger.error("Section47AServices - srAcceptSrvc || Error :", ex);
          console.error("Section47AServices - srAcceptSrvc || Error :", ex);
          throw constructCARDError(ex);
      }
    }
 
    VerifySec47aSrvc = async (reqData) => {
      try {
            const statusQuery = `select count(*) as count from preregistration.Section47A_Dutyfee where app_id = :APP_ID and section_47 = 'Y'`;
            let bindParams = {
                APP_ID : reqData.APP_ID
            }
            let response = await this.orDao.oDBQueryServiceWithBindParams(statusQuery, bindParams);
            return response;
        }
      catch (ex) {
          Logger.error("Section47AServices - VerifySec47aSrvc || Error :", ex);
          console.error("Section47AServices - VerifySec47aSrvc || Error :", ex);
          throw constructCARDError(ex);
      }
    }

}

module.exports = Section47AServices;