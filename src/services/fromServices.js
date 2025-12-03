const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const puppeteer = require('puppeteer');
const path = require('path');
const fsone = require('fs');
const fs = require('fs').promises;
const moment = require('moment');




class formServices {
    constructor() {
        this.orDao = new OrDao();
    }
    getdistrictDetailsSrvc = async () => {
        try {
            let query = `SELECT DR_CODE AS DR_CD, DR_NAME 
            FROM CARD.MST_REVREGDIST
            ORDER BY DR_NAME`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("formServices - getdistrictDetailsSrvc || Error :", ex);
            console.error("formServices - getdistrictDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getsroDetailsSrvc = async (reqData) => {
        try {
            let query = `SELECT SR_CD, SR_NAME FROM CARD.sr_master where dr_cd = '${reqData.DR_CD}' ORDER BY SR_NAME`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("formServices - getsroDetailsSrvc || Error :", ex);
            console.error("formServices - getsroDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getForm1DetailsSrvc = async (reqData) => {
        try {
               let query =`select a.*,(select class_desc from area_class where class_code=classification) clas,rowid from sromstr.mv_urb_loc_reg a where habitation= :VILLAGE_CODE and sro_code= :SR_CODE order by a.ward_no, a.block_no`;
               const bindparms = {
                VILLAGE_CODE : `${reqData.VILLAGE_CODE}01`,
                SR_CODE : reqData.SR_CODE
               }
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);           
            return response;
        } catch (ex) {
            Logger.error("formServices - getForm1DetailsSrvc || Error :", ex);
            console.error("formServices - getForm1DetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getForm2DetailsSrvc = async (reqData) => {
        try {
                       let query = `
            select a.*, rowid from sromstr.mv_basic_urb_reg a
            where habitation=:VILLAGE_CODE and sro_code=:SR_CODE order by a.ward_no, a.block_no, a.door_no, a.bi_number`;
            const bindparms = {
                VILLAGE_CODE : `${reqData.VILLAGE_CODE}01`,
                SR_CODE : reqData.SR_CODE
               }
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms); 
            return response;
        } catch (ex) {
            Logger.error("formServices - getForm2DetailsSrvc || Error :", ex);
            console.error("formServices - getForm2DetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getForm3DetailsSrvc = async (reqData) => {
        try {
            let  query = ` select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
            (select hab_name from hab_code where hab_code=habitation) habname,(select class_desc from area_class where class_code=classification) clas,
            rowid from sromstr.mv_rur_hab_rate a 
            where  rev_vill_code=:VILLAGE_CODE and sro_code =:SR_CODE`;
            const bindparms = {
                VILLAGE_CODE : reqData.VILLAGE_CODE,
                SR_CODE : reqData.SR_CODE
               }
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms); 
            return response;
        } catch (ex) {
            Logger.error("formServices - getForm3DetailsSrvc || Error :", ex);
            console.error("formServices - getForm3DetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getForm4DetailsSrvc = async (reqData) => {
        try {
           let query= `select a.*,(select hab_name from hab_code where hab_code=rev_vill_code||'01') villname,
            (select hab_name from hab_code where hab_code=local_body_code) habname,(select class_desc from area_class where class_code=classification) clas,
            rowid from sromstr.mv_basic_rur_reg a 
            where  rev_vill_code=:VILLAGE_CODE and sro_code=:SR_CODE order by a.survey_no, a.sub_survey_no`;
            const bindparms = {
                VILLAGE_CODE : reqData.VILLAGE_CODE,
                SR_CODE : reqData.SR_CODE
            };          
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            return response;
        } catch (ex) {
            Logger.error("formServices - getForm4DetailsSrvc || Error :", ex);
            console.error("formServices - getForm4DetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getRuralProhibDetailsSrvc = async (reqData) => {
        try {
            let query = `SELECT * FROM prohb_ag where sro_code = :SR_CODE and village_code = nvl(:VILLAGE_CODE, village_code) ORDER BY survey_no, sub_survey_no`;
            const bindparms = {
                VILLAGE_CODE : reqData.VILLAGE_CODE,
                SR_CODE : reqData.SR_CODE
            };          
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            return response;
        } catch (ex) {
            Logger.error("formServices - getRuralProhibDetailsSrvc || Error :", ex);
            console.error("formServices - getRuralProhibDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getUrbanProhibDetailsSrvc = async (reqData) => {
        try {
            let query = `SELECT * FROM prohb_hu where sro_code = :SR_CODE and village_code = nvl(:VILLAGE_CODE, village_code) order by CASE 
                            WHEN REGEXP_LIKE(door_no, '^[^A-Za-z0-9]') THEN 0
                            ELSE 1
                        END,
                        TO_NUMBER(REGEXP_SUBSTR(door_no, '^\\d+')), 
                        TO_NUMBER(NULLIF(REGEXP_SUBSTR(door_no, '-\\d+', 1, 1), '-')), 
                        door_no`;
            const bindparms = {
                VILLAGE_CODE : reqData.VILLAGE_CODE,
                SR_CODE : reqData.SR_CODE
            };          
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            return response;
        } catch (ex) {
            Logger.error("formServices - getUrbanProhibDetailsSrvc || Error :", ex);
            console.error("formServices - getUrbanProhibDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getRuralProhibDenotifyDetailsSrvc = async (reqData) => {
        try {
            let query = `SELECT * FROM prohb_ag_denotify where sro_code = :SR_CODE and village_code = nvl(:VILLAGE_CODE, village_code) ORDER BY survey_no, sub_survey_no`;
            const bindparms = {
                VILLAGE_CODE : reqData.VILLAGE_CODE,
                SR_CODE : reqData.SR_CODE
            };          
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            return response;
        } catch (ex) {
            Logger.error("formServices - getRuralProhibDetailsSrvc || Error :", ex);
            console.error("formServices - getRuralProhibDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getUrbanProhibDenotifyDetailsSrvc = async (reqData) => {
        try {
            let query = `SELECT * FROM prohb_hu_denotify where sro_code = :SR_CODE and village_code = nvl(:VILLAGE_CODE, village_code) order by ward_no, block_no,door_no`;
            const bindparms = {
                VILLAGE_CODE : reqData.VILLAGE_CODE,
                SR_CODE : reqData.SR_CODE
            };          
            let response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            return response;
        } catch (ex) {
            Logger.error("formServices - getUrbanProhibDetailsSrvc || Error :", ex);
            console.error("formServices - getUrbanProhibDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getVillagelistSrvc = async (reqData) => {
        try {
            let query = `select a.village_code, h.hab_name as village_name from srouser.juri_ag_hu a 
                            JOIN hab_code h ON h.hab_code= CONCAT(a.village_code, '01')
                            where sro_code = '${reqData.SR_CODE}' ORDER BY village_name`;
            let response = await this.orDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("formServices - getVillagelistSrvc || Error :", ex);
            console.error("formServices - getVillagelistSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    generatePDFFromHTML1 = async (html) => {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
    
        try {
            // Wrap the HTML content with a footer for page numbers
            const htmlWithFooter = `
                <html>
                    <head>
                        <style>
                            @page {
                                @bottom-right {
                                    content: "Page " counter(page);
                                    font-size: 12px; /* Change the font size as needed */
                                    margin: 5px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${html}
                    </body>
                </html>
            `;
    
            await page.setContent(htmlWithFooter, { waitUntil: 'networkidle0' }); // Wait for network to be idle
            const pdfBuffer = await page.pdf({
                landscape: false,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '30px',
                    left: '10px',
                },
                displayHeaderFooter: true, // Enable headers and footers
                footerTemplate: '<div style="font-size: 12px; width: 100%; text-align: center; margin: -10px 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
                timeout: 90000, // Increase the timeout to 90 seconds
            });
    
            return pdfBuffer;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error; // Rethrow the error to handle it in the calling function
        } finally {
            await browser.close();
        }
    };
    generatePDFFromHTML2 = async (html) => {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
    
        try {
            // Wrap the HTML content with a footer for page numbers
            const htmlWithFooter = `
                <html>
                    <head>
                        <style>
                            @page {
                                @bottom-right {
                                    content: "Page " counter(page);
                                    font-size: 12px; /* Change the font size as needed */
                                    margin: 5px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${html}
                    </body>
                </html>
            `;
    
            await page.setContent(htmlWithFooter, { waitUntil: 'networkidle0' }); // Wait for network to be idle
            const pdfBuffer = await page.pdf({
                landscape: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '30px',
                    left: '10px',
                },
                displayHeaderFooter: true, // Enable headers and footers
                footerTemplate: '<div style="font-size: 12px; width: 100%; text-align: center; margin: -10px 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
                timeout: 90000, // Increase the timeout to 90 seconds
            });
    
            return pdfBuffer;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error; // Rethrow the error to handle it in the calling function
        } finally {
            await browser.close();
        }
    };
    


    // generatePDFFromHTML1 = async (html) => {
    //     const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    //     const page = await browser.newPage();
    
    //     try {
    //         await page.setContent(html, { waitUntil: 'networkidle0' }); // Wait for network to be idle
    //         const pdfBuffer = await page.pdf({
    //             landscape: false,
    //             margin: {
    //                 top: '20px',
    //                 right: '20px',
    //                 bottom: '30px',
    //                 left: '10px',
    //             },
    //             timeout: 90000, // Increase the timeout to 90 seconds
    //         });
    
    //         return pdfBuffer;
    //     } catch (error) {
    //         console.error('Error generating PDF:', error);
    //         throw error; // Rethrow the error to handle it in the calling function
    //     } finally {
    //         await browser.close();
    //     }
    // };

    // generatePDFFromHTML = async (html) => {
    //     const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    //     const page = await browser.newPage();
    //     // Set HTML content
    //     await page.setContent(html);
    //     // Set landscape orientation
    //     await page.setViewport({ width: 1200, height: 800 });
    //     // Get page height
    //     const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    //     // Select all table rows
    //     const rows = await page.$$('table tr');
    //     // Array to store PDF buffers
    //     const pdfBuffers = [];
    //     // Initialize variables for current page HTML and height
    //     let currentPageHTML = '';
    //     let currentPageHeight = 0;
    //     for (const row of rows) {
    //         // Get height of current row
    //         const rowHeight = await row.evaluate(row => row.offsetHeight);
    //         // Check if adding current row would exceed page height
    //         if (currentPageHeight + rowHeight > pageHeight) {
    //             // If so, push current page HTML as PDF buffer
    //             const pdfBuffer = await page.pdf({
    //                 // Set page options
    //                 format: 'A4',
    //                 margin: { top: '20px', right: '20px', bottom: '10px', left: '20px' },
    //                 printBackground: true,
    //                 landscape: true, // Switch to landscape orientation
    //             });
    //             pdfBuffers.push(pdfBuffer);
    //             // Reset current page HTML and height
    //             currentPageHTML = '';
    //             currentPageHeight = 0;
    //         }
    //         // Check if row height exceeds page height
    //         if (rowHeight > pageHeight) {
    //             // If so, split row into chunks
    //             const rowChunks = await splitRowIntoChunks(row, pageHeight);
    //             for (const chunk of rowChunks) {
    //                 // Add each chunk to current page HTML
    //                 currentPageHTML += chunk;
    //                 currentPageHeight += pageHeight; // Increment current page height by chunk height
    //             }
    //         } else {
    //             // Add row to current page HTML
    //             currentPageHTML += await row.evaluate(row => row.outerHTML);
    //             currentPageHeight += rowHeight; // Increment current page height by row height
    //         }
    //     }
    //     // Push remaining page content as PDF buffer
    //     if (currentPageHTML !== '') {
    //         const pdfBuffer = await page.pdf({
    //             // Set page options
    //             format: 'A4',
    //             margin: { top: '20px', right: '20px', bottom: '10px', left: '20px' },
    //             printBackground: true,
    //             landscape: true, // Switch to landscape orientation
    //         });
    //         pdfBuffers.push(pdfBuffer);
    //     }
    //     // Close browser
    //     await browser.close();
    //     // Return concatenated PDF buffers
    //     return Buffer.concat(pdfBuffers);
    // }

    generatePDFFromHTML = async (html) => {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        // Set HTML content
        await page.setContent(html);
        // Set landscape orientation
        await page.setViewport({ width: 1200, height: 800 });
        // Get page height
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        // Select all table rows
        const rows = await page.$$('table tr');
        // Array to store PDF buffers
        const pdfBuffers = [];
        // Initialize variables for current page HTML and height
        let currentPageHTML = '';
        let currentPageHeight = 0;
    
        for (const row of rows) {
            // Get height of current row
            const rowHeight = await row.evaluate(row => row.offsetHeight);
            // Check if adding current row would exceed page height
            if (currentPageHeight + rowHeight > pageHeight) {
                // If so, push current page HTML as PDF buffer
                const pdfBuffer = await page.pdf({
                    // Set page options
                    format: 'A4',
                    margin: { top: '20px', right: '20px', bottom: '30px', left: '20px' },
                    printBackground: true,
                    landscape: true, // Switch to landscape orientation
                    displayHeaderFooter: true, // Enable headers and footers
                    footerTemplate: '<div style="font-size: 12px; width: 100%; text-align: right; margin: 0 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
                    headerTemplate: '<div></div>', // Empty header template to prevent default header
                });
                pdfBuffers.push(pdfBuffer);
                // Reset current page HTML and height
                currentPageHTML = '';
                currentPageHeight = 0;
            }
            // Check if row height exceeds page height
            if (rowHeight > pageHeight) {
                // If so, split row into chunks (assuming `splitRowIntoChunks` is implemented elsewhere)
                const rowChunks = await splitRowIntoChunks(row, pageHeight);
                for (const chunk of rowChunks) {
                    // Add each chunk to current page HTML
                    currentPageHTML += chunk;
                    currentPageHeight += pageHeight; // Increment current page height by chunk height
                }
            } else {
                // Add row to current page HTML
                currentPageHTML += await row.evaluate(row => row.outerHTML);
                currentPageHeight += rowHeight; // Increment current page height by row height
            }
        }
    
        // Push remaining page content as PDF buffer
        if (currentPageHTML !== '') {
            const pdfBuffer = await page.pdf({
                // Set page options
                format: 'A4',
                margin: { top: '20px', right: '20px', bottom: '10px', left: '20px' },
                printBackground: true,
                landscape: true, // Switch to landscape orientation
                displayHeaderFooter: true, // Enable headers and footers
                footerTemplate: '<div style="font-size: 12px; width: 100%; text-align: right; margin: 0 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
                headerTemplate: '<div></div>', // Empty header template to prevent default header
            });
            pdfBuffers.push(pdfBuffer);
        }
    
        // Close browser
        await browser.close();
        // Return concatenated PDF buffers
        return Buffer.concat(pdfBuffers);
    };
    
    
    

    getURBANProhbPdfGenerate = async (reqBody) => {
        const { SR_CODE, VILLAGE_CODE } = reqBody;
        try {
            let query, response;
            // query = `SELECT * FROM prohb_hu where sro_code = '${SR_CODE}' and village_code = nvl('${VILLAGE_CODE}', village_code) order by door_no`;
            query = ` SELECT 
                    p.*,
                    m.sr_name,
                    h.hab_name AS village_name
                FROM 
                    prohb_hu p
                LEFT JOIN 
                    sr_master m ON p.sro_code = m.sr_cd
                LEFT JOIN 
                    srouser.juri_ag_hu a ON p.sro_code = a.sro_code AND p.village_code = a.village_code
                LEFT JOIN 
                    hab_code h ON h.hab_code = CONCAT(a.village_code, '01')
                WHERE 
                    p.sro_code = :SR_CODE AND 
                    (p.village_code = NVL(:VILLAGE_CODE, p.village_code))
                ORDER BY 
                    CASE
                        WHEN REGEXP_LIKE(door_no, '^[^A-Za-z0-9]') THEN 0
                            ELSE 1
                        END,
                        TO_NUMBER(REGEXP_SUBSTR(door_no, '^\\d+')), 
                        TO_NUMBER(NULLIF(REGEXP_SUBSTR(door_no, '-\\d+', 1, 1), '-')), 
                        door_no`;
            let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
			let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

// date function start-----//
            const currentDate = new Date();
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const formattedDate = currentDate.toLocaleDateString('en-GB', options);
            let hours = currentDate.getHours();
            const minutes = currentDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; 
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
// date function end-----//


            const bindparms = {
                VILLAGE_CODE : VILLAGE_CODE,
                SR_CODE : SR_CODE
            };          
            response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            // Define the HTML content inline
            const html = `<div style="text-align: center; margin:22px; margin-top:0 ">
            				<img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
				<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 20px; margin-bottom:0;font-size : 12px;">
			  <thead>
              <tr><th colspan='7'>
<h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - URBAN PROHIBITED PROPERTY REPORT </h3>
            <h5 style="margin: 2px;">SR-OFFICE: ${response[0].SR_NAME}-(${SR_CODE}),VILLAGE NAME:${response[0].VILLAGE_NAME ? `-${response[0].VILLAGE_NAME}` : ''} - (${VILLAGE_CODE}) <span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>
		
              </th></tr>
				<tr>
                 <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> S No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Door No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Extent(SqYards/Acres)</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Notification Number</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Notification Date</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Other Reference</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Holder Name</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
                (item, index) => `
					<tr>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1 }</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOOR_NO ? item.DOOR_NO : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000;word-wrap: break-word; max-width: 150px; padding: 2px;">
                     ${item.EXTENT ? parseFloat(item.EXTENT).toFixed(4).replace(/\.?0+$/, '') : '-'}
                 </td>                                               
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.NOTI_GAZ_NO ? item.NOTI_GAZ_NO : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.NOTI_GAZ_DT ? new Date(item.NOTI_GAZ_DT).toLocaleDateString('en-GB') : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; white-space: normal; word-wrap: break-word; max-width: 270px;">${item.OTH_REF ? item.OTH_REF : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; white-space: normal; word-wrap: break-word; max-width: 270px;">${item.H_NAME ? item.H_NAME : '-'}</td>
                    </tr>`)
                  .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
            const pdfBuffer = await this.generatePDFFromHTML2(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("Prohibited property urban Handler - geturban || Error :", ex);
            console.error("Prohibited property urban Handler - geturban || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getRURALProhbPdfGenerate = async (reqBody) => {
        const { SR_CODE, VILLAGE_CODE } = reqBody;
        try {
            let query, response;
            // query = `SELECT * FROM prohb_ag where sro_code = '${SR_CODE}' and village_code = nvl('${VILLAGE_CODE}', village_code) ORDER BY survey_no`;
            query = `
                    SELECT 
                        p.*,
                        m.sr_name,
                        h.hab_name AS village_name
                    FROM 
                        prohb_ag p
                    LEFT JOIN 
                        sr_master m ON p.sro_code = m.sr_cd
                    LEFT JOIN 
                        srouser.juri_ag_hu a ON p.sro_code = a.sro_code AND p.village_code = a.village_code
                    LEFT JOIN 
                        hab_code h ON h.hab_code = CONCAT(a.village_code, '01')
                    WHERE 
                        p.sro_code = :SR_CODE AND 
                        (p.village_code = NVL(:VILLAGE_CODE, p.village_code))
                    ORDER BY 
                        p.survey_no, p.sub_survey_no`;
            let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
			let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

// date function start-----//
            const currentDate = new Date();
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const formattedDate = currentDate.toLocaleDateString('en-GB', options);
            let hours = currentDate.getHours();
            const minutes = currentDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; 
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
// date function end-----//

            const bindparms = {
                VILLAGE_CODE : VILLAGE_CODE,
                SR_CODE : SR_CODE
            };          
            response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            // Define the HTML content inline
            const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
            <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:30px">
			  <thead>
              <tr><th colspan='8'><h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - RURAL PROHIBITED PROPERTY REPORT </h3>
			<h5 style="margin:0px">SRO-OFFICE: ${response[0].SR_NAME}-(${SR_CODE}),VILLAGE NAME:${response[0].VILLAGE_NAME ? `-${response[0].VILLAGE_NAME}` : ''} - (${VILLAGE_CODE})  <span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>

              </th></tr>
				<tr style="font-size : 15px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> S No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Survey No.</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Plot No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Extent(SqYards/Acres)</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Notification Number</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Notification Date</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Other Reference</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Holder Name</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
                (item, index) => `
					  <tr>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1 }</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.SURVEY_NO ? item.SURVEY_NO : ''}${item.SUB_SURVEY_NO ? '/' + item.SUB_SURVEY_NO : ''}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; max-width: 270px;">${item.PLOT_NO ? item.PLOT_NO : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; max-width: 270px;">
                      ${item.EXTENT ? parseFloat(item.EXTENT).toFixed(4).replace(/\.?0+$/, '') : '-'}
                      </td>         
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.NOTI_GAZ_NO ? item.NOTI_GAZ_NO : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.NOTI_GAZ_DT ? new Date(item.NOTI_GAZ_DT).toLocaleDateString('en-GB') : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; white-space: normal; word-wrap: break-word; max-width: 270px;">${item.OTH_REF ? item.OTH_REF : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; white-space: normal; word-wrap: break-word; max-width: 270px;">${item.H_NAME ? item.H_NAME : '-'}</td>
                     </tr>`)
                    .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
            const pdfBuffer = await this.generatePDFFromHTML2(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("Prohibited property urban Handler - geturban || Error :", ex);
            console.error("Prohibited property urban Handler - geturban || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getURBANProhbDenotifyPdfGenerate = async (reqBody) => {
        const { SR_CODE, VILLAGE_CODE } = reqBody;
        let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
        let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

// date function start-----//
        const currentDate = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        let hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
// date function end-----//
        try {
            let query, response;
            // query = `SELECT * FROM prohb_hu where sro_code = '${SR_CODE}' and village_code = nvl('${VILLAGE_CODE}', village_code) order by door_no`;
            query = ` SELECT 
                    p.*,
                    m.sr_name,
                    h.hab_name AS village_name
                FROM 
                    prohb_hu_denotify p
                LEFT JOIN 
                    sr_master m ON p.sro_code = m.sr_cd
                LEFT JOIN 
                    srouser.juri_ag_hu a ON p.sro_code = a.sro_code AND p.village_code = a.village_code
                LEFT JOIN 
                    hab_code h ON h.hab_code = CONCAT(a.village_code, '01')
                WHERE 
                    p.sro_code = :SR_CODE AND 
                    (p.village_code = NVL(:VILLAGE_CODE, p.village_code))
                ORDER BY 
                    p.ward_no, p.block_no, p.door_no`;
            // <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Sl.No</th>
            // <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}</td>


            const bindparms = {
                VILLAGE_CODE : VILLAGE_CODE,
                SR_CODE : SR_CODE
            };          
            response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            // Define the HTML content inline
            const html = `<div style="text-align: center; margin:22px; margin-top:0 ">
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0;font-size : 12px;">
			  <thead>
              <tr> <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
              <th colspan='8'>
              	<h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - URBAN PROHIBITED PROPERTY DENOTIFY REPORT </h3>
            <h5 style="margin: 2px;">SR-OFFICE: ${response[0].SR_NAME}-(${SR_CODE}),VILLAGE NAME:${response[0].VILLAGE_NAME ? `-${response[0].VILLAGE_NAME}` : ''} - (${VILLAGE_CODE})- <span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>

              </th></tr>
				<tr>
            	  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Sl.No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Door No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Extent(SqYards/Acres)</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Notification Number</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Notification Date</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Other Reference</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Holder Name</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Date of Entry Deletion</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
                (item, index) => `
					<tr>
                    <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index+1}</td>\
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DOOR_NO ? item.DOOR_NO : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000;word-wrap: break-word; max-width: 150px; padding: 2px;">
                     ${item.EXTENT ? parseFloat(item.EXTENT).toFixed(4).replace(/\.?0+$/, '') : '-'}
                 </td>                                               
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.NOTI_GAZ_NO ? item.NOTI_GAZ_NO : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.NOTI_GAZ_DT ? new Date(item.NOTI_GAZ_DT).toLocaleDateString('en-GB') : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; white-space: normal; word-wrap: break-word; max-width: 270px;">${item.OTH_REF ? item.OTH_REF : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; white-space: normal; word-wrap: break-word; max-width: 270px;">${item.H_NAME ? item.H_NAME : '-'}</td>
                     <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.DEL_DATE ? item.DEL_DATE : '-'}</td>
                    </tr>`)
                  .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
            const pdfBuffer = await this.generatePDFFromHTML2(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("Prohibited property urban Handler - geturban || Error :", ex);
            console.error("Prohibited property urban Handler - geturban || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getRURALProhbDenotifyPdfGenerate = async (reqBody) => {
        const { SR_CODE, VILLAGE_CODE } = reqBody;
        let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
        let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

// date function start-----//
        const currentDate = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        let hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
// date function end-----//
        try {
            let query, response;
            // query = `SELECT * FROM prohb_ag where sro_code = '${SR_CODE}' and village_code = nvl('${VILLAGE_CODE}', village_code) ORDER BY survey_no`;
            query = `
                    SELECT 
                        p.*,
                        m.sr_name,
                        h.hab_name AS village_name
                    FROM 
                        prohb_ag_denotify p
                    LEFT JOIN 
                        sr_master m ON p.sro_code = m.sr_cd
                    LEFT JOIN 
                        srouser.juri_ag_hu a ON p.sro_code = a.sro_code AND p.village_code = a.village_code
                    LEFT JOIN 
                        hab_code h ON h.hab_code = CONCAT(a.village_code, '01')
                    WHERE 
                        p.sro_code = :SR_CODE AND 
                        (p.village_code = NVL(:VILLAGE_CODE, p.village_code))
                    ORDER BY 
                        p.survey_no,p.sub_survey_no`;
            const bindparms = {
                VILLAGE_CODE : VILLAGE_CODE,
                SR_CODE : SR_CODE
            };          
            response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            // Define the HTML content inline
            const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
				<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
              <tr>  <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
              <th colspan='9'>
            <h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - RURAL PROHIBITED PROPERTY DENOTIFY REPORT </h3>
			<h5 style="margin:0px">SRO-OFFICE: ${response[0].SR_NAME}-(${SR_CODE}),VILLAGE NAME:${response[0].VILLAGE_NAME ? `-${response[0].VILLAGE_NAME}` : ''} - (${VILLAGE_CODE})-<span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>

              </th></tr>
				<tr style="font-size : 15px;">
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Sl.No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Survey No.</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Plot No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Extent<br/>(SqYards/Acres)</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Notification Number</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Notification Date</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;"> Other Reference</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Holder Name</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Date of Entry Deletion</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
                (item, index) => `
					  <tr>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index+1}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.SURVEY_NO ? item.SURVEY_NO : ''}${item.SUB_SURVEY_NO ? '/' + item.SUB_SURVEY_NO : ''}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; max-width: 100px;">${item.PLOT_NO ? item.PLOT_NO : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; max-width: 100px;">
                      ${item.EXTENT ? parseFloat(item.EXTENT).toFixed(4).replace(/\.?0+$/, '') : '-'}
                      </td>         
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.NOTI_GAZ_NO ? item.NOTI_GAZ_NO : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.NOTI_GAZ_DT ? new Date(item.NOTI_GAZ_DT).toLocaleDateString('en-GB') : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; white-space: normal; word-wrap: break-word; max-width: 270px;">${item.OTH_REF ? item.OTH_REF : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;white-space: normal; word-wrap: break-word; max-width: 270px;">${item.H_NAME ? item.H_NAME : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;white-space: normal; word-wrap: break-word; max-width: 270px;">${item.DEL_DATE ? moment(item.DEL_DATE).format('DD-MM-YYYY HH:MM:SS') : '-'}</td>
                     </tr>`)
                    .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
            const pdfBuffer = await this.generatePDFFromHTML2(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("Prohibited property urban Handler - geturban || Error :", ex);
            console.error("Prohibited property urban Handler - geturban || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getMVURBANFORM1PdfGenerate = async (reqBody) => {
        const { SR_CODE, VILLAGE_CODE } = reqBody;
        let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
        let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

        const currentDate = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        let hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
        try {
            let query, response;
                query =`   SELECT 
            a.*,
            (SELECT class_desc FROM area_class WHERE class_code = a.classification) AS clas,
            a.rowid,
            sr.sr_name,
            hc.village_name
        FROM 
            sromstr.mv_urb_loc_reg a
        LEFT JOIN 
            sr_master sr ON sr.sr_cd = a.sro_code
        LEFT JOIN 
            hab_code hc ON hc.hab_code = a.habitation
        WHERE 
            a.habitation = :VILLAGE_CODE 
            AND a.sro_code = :SR_CODE
        order by a.ward_no, a.block_no`;
            const bindparms = {
                VILLAGE_CODE : `${VILLAGE_CODE}01`,
                SR_CODE : SR_CODE
            };          
            response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            // Define the HTML content inline
            const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
				<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
              <tr><img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
              <th colspan="10">
              <h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - <span style="color: red;">FORM1</span> URBAN MARKET VALUE REPORT </h3>
			<h5 style="margin:0px">SRO-OFFICE: ${response[0].SR_NAME}(${SR_CODE}),HABITATION:${response[0].VILLAGE_NAME ? `${response[0].VILLAGE_NAME}` : ''} - (${VILLAGE_CODE})- <span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>
              </th></tr>
				<tr style="font-size : 15px;">
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Sl No.</th>
                    <th style="border: 1px solid #000;  width: 4%; padding: 2px;">Ward No - Block No</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Bi Number</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Bi Ward No</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Bi Block No</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Locality</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Unit Rate</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Ground Floor</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">First Floor</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Other Floor</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Classification</th>
                    <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Effective Date</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
                (item, index) => `
					  <tr>
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                            ${item.WARD_NO !== null && item.WARD_NO !== undefined ? item.WARD_NO : '-'}-${item.BLOCK_NO}
                        </td>
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                            ${item.BI_NUMBER !== null && item.BI_NUMBER !== undefined ? item.BI_NUMBER : '-'}
                        </td> 
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                            ${item.BI_WARD !== null && item.BI_WARD !== undefined ? item.BI_WARD : '-'}
                        </td> 
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                            ${item.BI_BLOCK !== null && item.BI_BLOCK !== undefined ? item.BI_BLOCK : '-'}
                        </td>    
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                            ${item.LOCALITY_STREET ? item.LOCALITY_STREET: '-'}
                        </td>         
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.UNIT_RATE_RES ? item.UNIT_RATE_RES : '-'}</td>
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.UNIT_RATE_COM ? item.UNIT_RATE_COM : '-'}</td>
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMP_FLOOR1 ? item.COMP_FLOOR1 : '-'}</td>
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMP_FLOOR_OTH ? item.COMP_FLOOR_OTH : '-'}</td>
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.CLAS ? item.CLAS : '-'}</td>
                        <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.EFFECTIVE_DATE ? new Date(item.EFFECTIVE_DATE).toLocaleDateString('en-GB') : '-'}</td>
                     </tr>`)
                    .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
            const pdfBuffer = await this.generatePDFFromHTML1(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("Prohibited property urban Handler - geturban || Error :", ex);
            console.error("Prohibited property urban Handler - geturban || Error :", ex);
            throw constructCARDError(ex);
        }
    }
    getMVURBANFORM2PdfGenerate = async (reqBody) => {
        const { SR_CODE, VILLAGE_CODE } = reqBody;


        let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
        let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

        const currentDate = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        let hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;

        try {
            let query, response;
             query=`  SELECT 
            a.*, 
            a.rowid, 
            sr.sr_name, 
            hc.village_name 
        FROM 
            sromstr.mv_basic_urb_reg a
        LEFT JOIN 
            sr_master sr ON sr.sr_cd = a.sro_code
        LEFT JOIN 
            hab_code hc ON hc.hab_code = a.habitation
        WHERE 
            a.habitation = :VILLAGE_CODE
            AND a.sro_code = :SR_CODE order by a.ward_no, a.block_no, a.door_no, a.bi_number`;
            const bindparms = {
                VILLAGE_CODE : `${VILLAGE_CODE}01`,
                SR_CODE : SR_CODE
            };          
            response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            // Define the HTML content inline
            const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
					<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:10px">
			  <thead>
              <tr>  <img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
              <th colspan="9"><h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - <span style="color: red;">FORM2</span> URBAN MARKET VALUE REPORT </h3>
			<h5 style="margin:0px">SRO-OFFICE: ${response[0].SR_NAME}(${SR_CODE}),HABITATION:${response[0].VILLAGE_NAME ? `${response[0].VILLAGE_NAME}` : ''} - (${VILLAGE_CODE})- <span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5></h5>
		
              </th></tr>
				<tr style="font-size : 15px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Sl No.</th>
				  <th style="border: 1px solid #000;  width: 3%; padding: 2px;">Ward No - Block No</th>
                  <th style="border: 1px solid #000;  width: 1%; padding: 1px;">Bi Number</th>
                  <th style="border: 1px solid #000;  width: 1%; padding: 1px;">Bi Ward No</th>
                  <th style="border: 1px solid #000;  width: 1%; padding: 1px;">Bi Block No</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Door No</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Unit Rate</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Ground Floor</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">First Floor</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Other Floor</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Effective Date</th>
				</tr>
			  </thead>
			  <tbody style="margin-bottom:10px">
				${response.map(
                (item, index) => `
					  <tr>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.WARD_NO !== null && item.WARD_NO !== undefined ? item.WARD_NO : '-'}-${item.BLOCK_NO}
                      </td>
                       <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 1px;">
                      ${item.BI_NUMBER !== null && item.BI_NUMBER !== undefined ? item.BI_NUMBER : '-'}
                      </td>  
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 1px;">
                      ${item.BI_WARD !== null && item.BI_WARD !== undefined ? item.BI_WARD : '-'}
                      </td> 
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 1px;">
                      ${item.BI_BLOCK !== null && item.BI_BLOCK !== undefined ? item.BI_BLOCK : '-'}
                      </td>   
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.DOOR_NO ? item.DOOR_NO: '-'}
                      </td>         
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.UNIT_RATE ? item.UNIT_RATE : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.COMM_RATE ? item.COMM_RATE : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMP_FLOOR1 ? item.COMP_FLOOR1 : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.COMP_FLOOR_OTH ? item.COMP_FLOOR_OTH : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.EFFECTIVE_DATE ? new Date(item.EFFECTIVE_DATE).toLocaleDateString('en-GB') : '-'}</td>
                     </tr>`)
                    .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin-bottom:10px; margin-right:20px; margin-left:20px;" >
			</div>`;
            const pdfBuffer = await this.generatePDFFromHTML1(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("Prohibited property urban Handler - geturban || Error :", ex);
            console.error("Prohibited property urban Handler - geturban || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getMVRURALFORM3PdfGenerate = async (reqBody) => {
        const { SR_CODE, VILLAGE_CODE } = reqBody;
        let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
        let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

        const currentDate = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        let hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
        try {
            let query, response;
             query=`  SELECT 
             a.SRO_CODE,
             a.REV_VILL_CODE,
             a.HABITATION,
             a.LOCAL_BODY_CODE,
             a.LOCAL_BODY_NAME,
             a.GRADE_OF_LOCAL_BODY,
             a.CLASSIFICATION,
             a.UNIT_RATE,
             a.UNITS,
             a.EFFECTIVE_DATE,
             a.EX_EFFECTIVE_DATE,
             a.REV_RATE,
             a.PRE_REV_RATE,
             a.TIME_STAMP,
             a.REMARKS,
             a.USERNAME,
             a.SIN_DEL,
             a.REV_TIMESTAMP,
             (SELECT hab_name FROM hab_code WHERE hab_code = a.rev_vill_code || '01') AS villname,
             (SELECT hab_name FROM hab_code WHERE hab_code = a.habitation) AS habname,
             (SELECT class_desc FROM area_class WHERE class_code = a.classification) AS clas,
             a.rowid,
             sr.sr_name
         FROM 
             sromstr.mv_rur_hab_rate a
         LEFT JOIN 
             sr_master sr ON sr.sr_cd = a.sro_code
         WHERE 
             a.rev_vill_code = :VILLAGE_CODE 
             AND a.sro_code = :SR_CODE`;
            const bindparms = {
                VILLAGE_CODE : VILLAGE_CODE,
                SR_CODE : SR_CODE
            };          
            response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            // Define the HTML content inline
            const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
		<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
              <tr><img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
              <th colspan="5">	<h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - <span style="color: red;">FORM3</span> RURAL MARKET VALUE REPORT </h3>
			<h5 style="margin:0px">SRO-OFFICE: ${response[0].SR_NAME}(${SR_CODE}),VILLAGE NAME:${response[0].VILLNAME ? `${response[0].VILLNAME}` : ''} - (${VILLAGE_CODE})- <span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>
			

              </h></tr>
				<tr style="font-size : 15px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Sl No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Habitation</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Land Rate Rs. per Acre</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Nature Of Use</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Effective Date</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
                (item, index) => `
					  <tr>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.LOCAL_BODY_NAME ? item.LOCAL_BODY_NAME : '-'}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.UNIT_RATE ? item.UNIT_RATE: '-'}
                      </td>         
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.CLAS ? item.CLAS : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.EFFECTIVE_DATE ? new Date(item.EFFECTIVE_DATE).toLocaleDateString('en-GB') :'-'}</td>
                      </tr>`)
                    .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
            const pdfBuffer = await this.generatePDFFromHTML1(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("Prohibited property urban Handler - geturban || Error :", ex);
            console.error("Prohibited property urban Handler - geturban || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getMVRURALFORM4PdfGenerate = async (reqBody) => {
        const { SR_CODE, VILLAGE_CODE } = reqBody;
        let imagePath = path.join(__dirname, `../../logos/ap_logo.jpg`);
        let Imagedatapath = fsone.readFileSync(imagePath, { encoding: 'base64' });

        const currentDate = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-GB', options);
        let hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedDate1 = `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
        try {
            let query, response;
             query=`  SELECT 
             a.*, 
             (SELECT hab_name FROM hab_code WHERE hab_code = a.rev_vill_code || '01') AS villname,
             (SELECT hab_name FROM hab_code WHERE hab_code = a.local_body_code) AS habname,
             (SELECT class_desc FROM area_class WHERE class_code = a.classification) AS clas,
             a.rowid,
             sr.sr_name
         FROM 
             sromstr.mv_basic_rur_reg a
         LEFT JOIN 
             sr_master sr ON sr.sr_cd = a.sro_code
         WHERE 
             a.rev_vill_code = :VILLAGE_CODE
             AND a.sro_code = :SR_CODE
             order by a.survey_no, a.sub_survey_no`;
            const bindparms = {
                VILLAGE_CODE : VILLAGE_CODE,
                SR_CODE : SR_CODE
            };          
            response = await this.orDao.oDBQueryServiceWithBindParams(query, bindparms);
            // Define the HTML content inline
            const html = `<div style="text-align: center; margin:20px; margin-top:0 ">
			<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-top: 10px; margin-bottom:0">
			  <thead>
              <tr><img src="data:image/jpeg;base64,${Imagedatapath}" alt="Header image" style="max-width:75px"/>
              <th colspan="6">
<h3 style="margin:0px; margin-top : 5px">GOVERNMENT OF ANDHRA PRADESH - <span style="color: red;">FORM4</span> RURAL MARKET VALUE REPORT </h3>
			<h5 style="margin:0px">SRO-OFFICE: ${response[0].SR_NAME}(${SR_CODE}),VILLAGE NAME:${response[0].VILLNAME ? `${response[0].VILLNAME}` : ''} - (${VILLAGE_CODE})- <span style="color: red;">Report generated on</span><span style="color: green;"> ${formattedDate1}</span></h5>
			
              </th></tr>
				<tr style="font-size : 15px;">
                <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Sl No.</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Habitation</th>
                  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Survey No</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Land Rate Rs. per Acre</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Nature Of Use</th>
				  <th style="border: 1px solid #000;  width: 2%; padding: 2px;">Effective Date</th>
				</tr>
			  </thead>
			  <tbody>
				${response.map(
                (item, index) => `
					  <tr>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${index + 1}
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.LOCAL_BODY_NAME ? item.LOCAL_BODY_NAME : '-'}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.SURVEY_NO ? item.SURVEY_NO : ''}${item.SUB_SURVEY_NO === '/' ? '' : '/'+item.SUB_SURVEY_NO}
                      </td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">
                      ${item.UNIT_RATE ? item.UNIT_RATE: '-'}
                      </td>         
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px;">${item.CLAS ? item.CLAS : '-'}</td>
                      <td style="text-align: center; vertical-align: middle; border: 1px solid #000; padding: 2px; ">${item.EFFECTIVE_DATE ? new Date(item.EFFECTIVE_DATE).toLocaleDateString('en-GB') :'-'}</td>
                      </tr>`)
                    .join('')}
			  </tbody>
			</table>
		  </div>
		  <div style="margin : 0; margin-right:20px; margin-left:20px;" >
			</div>`;
            const pdfBuffer = await this.generatePDFFromHTML1(html);
            const base64Pdf = pdfBuffer.toString('base64');
            return { pdf: base64Pdf };
        } catch (ex) {
            Logger.error("Prohibited property urban Handler - geturban || Error :", ex);
            console.error("Prohibited property urban Handler - geturban || Error :", ex);
            throw constructCARDError(ex);
        }
    }


}

module.exports = formServices;