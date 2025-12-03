const CARDError = require("../errors/customErrorClass");
const oracleDb = require('oracledb');
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const orDbDao = require('../dao/oracledbDao')
const { Logger } = require('../../services/winston');
const { constructCARDError } = require("../handlers/errorHandler");
const axios = require("axios");
const mongoose = require('mongoose');
const https = require('https');
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");
const fs = require('fs').promises;
const { encryptWithAESPassPhrase } = require('../utils');
const Esign = require('../services/esignService');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fsone = require('fs');
const {encryptData, decryptData} = require('../utils/index');



const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

class grantapprovesrvc {
    constructor() {
        this.dbDao = new orDbDao();
        this.esign = new Esign();

    }

//     getDrgrantaprroveDocssrvc = async (reqData) => {
//         try {
//             const Status = {
//                 // N: `SELECT se.* FROM preregistration.prereg_det_cr se
//                 //         JOIN preregistration.schedule_entry pdc ON se.ID = pdc.ID
//                 //     WHERE se.status IS NULL AND se.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = '${reqData.DR_CODE}')
//                 //     AND se.juri_status = 'Y' AND pdc.probh_check='N'`,
//                 N: `SELECT *
// FROM preregistration.prereg_det_cr pd
// JOIN preregistration.schedule_entry pdc ON pd.ID = pdc.ID
// WHERE pd.status IS NULL 
//   AND pd.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = '${reqData.DR_CODE}')
//   AND pd.juri_status = 'Y' 
//   AND pdc.probh_check = 'N'
//   AND (
//     NOT EXISTS (
//       SELECT 1 
//       FROM srouser.GrantApproval_esign_status es 
//       WHERE es.APP_ID = pd.ID
//     )
//     OR EXISTS (
//       SELECT 1 
//       FROM srouser.GrantApproval_esign_status es 
//       WHERE es.APP_ID = pd.ID 
//         AND (es.DR_ESIGN_STATUS != 'Y' OR es.DR_ESIGN_STATUS IS NULL)
//     )
//   )
//   AND NOT EXISTS (
//     SELECT 1 
//     FROM srouser.prohb_audit_cr pac 
//     WHERE pac.reject_status = 'R' 
//       AND pac.APP_ID = pd.ID
//   )`,
//                 A: `SELECT * FROM srouser.GrantApproval_esign_status  ges
//                 join preregistration.prereg_det_cr  ppd on ges.APP_ID=ppd.id where ges.SR_CODE in (select sr_cd from Sr_master where DR_CD='${reqData.DR_CODE}') and ges.DR_ESIGN_STATUS='Y'`,
//                 // P: `SELECT * FROM preregistration.prereg_det_cr WHERE status ='P' and SR_CODE in (select sr_cd from Sr_master where DR_CD='${reqData.DR_CODE}') and juri_status is not null`,
//                 P: `SELECT DISTINCT ppd.* 
// FROM srouser.prohb_audit_cr pbc 
// JOIN preregistration.prereg_det_cr ppd ON pbc.APP_ID = ppd.id 
// WHERE pbc.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = '${reqData.DR_CODE}')
//   AND pbc.REJECT_STATUS = 'R'`,

//                 // NS:`select * from (SELECT * FROM preregistration.prereg_det_cr a where a.juri_status='Y' and a.status is null and id not in (SELECT se.ID FROM preregistration.prereg_det_cr se
//                 //         JOIN preregistration.schedule_entry pdc ON se.ID = pdc.ID
//                 //         join srouser.GrantApproval_esign_status ges on ges.APP_ID= pdc.ID
//                 //     WHERE se.status IS NULL AND se.SR_CODE IN (623)
//                 //     AND se.juri_status = 'Y' AND pdc.probh_check='N' and ges.dr_esign_status !='Y'))`
                    
// 				NS :`SELECT * FROM preregistration.prereg_det_cr WHERE status is null and SR_CODE='${reqData.srCode}' and juri_status ='Y'`,
//                 AS: `SELECT * FROM preregistration.prereg_det_cr WHERE status = 'A' and SR_CODE in (select sr_cd from Sr_master where DR_CD='${reqData.DR_CODE}') and juri_status is not null`,
//                 PS: `SELECT * FROM preregistration.prereg_det_cr WHERE status ='P' and SR_CODE in (select sr_cd from Sr_master where DR_CD='${reqData.DR_CODE}') and juri_status is not null`,

//             };
//             let query = Status[reqData.status.toUpperCase()] ?? ''
//             if (query === "") {
//                 throw new Error("Bad Request");
//             }
//             let result = await this.dbDao.oDBQueryService(query);
//             return result
//         } catch (ex) {
//             Logger.error("PreRegistraionServices - getPreRegistrationDocs || Error : ", ex);
//             console.error("PreRegistraionServices - getPreRegistrationDocs || Error : ", ex);
//             throw constructCARDError(ex);
//         }
//     }


// getDrgrantaprroveDocssrvc = async (reqData) => {
//     try {
//         const Status = {
//             // N: `SELECT se.* FROM preregistration.prereg_det_cr se
//             //         JOIN preregistration.schedule_entry pdc ON se.ID = pdc.ID
//             //     WHERE se.status IS NULL AND se.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = '${reqData.DR_CODE}')
//             //     AND se.juri_status = 'Y' AND pdc.probh_check='N'`,
//             N: `SELECT *
// FROM preregistration.prereg_det_cr pd
// JOIN preregistration.schedule_entry pdc ON pd.ID = pdc.ID
// WHERE pd.status IS NULL
// AND pd.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = '${reqData.DR_CODE}')
// AND pd.juri_status = 'Y'
// AND pdc.probh_check = 'N'
// AND (
// NOT EXISTS (
//   SELECT 1
//   FROM srouser.GrantApproval_esign_status es
//   WHERE es.APP_ID = pd.ID
// )
// OR EXISTS (
//   SELECT 1
//   FROM srouser.GrantApproval_esign_status es
//   WHERE es.APP_ID = pd.ID
//     AND (es.DR_ESIGN_STATUS != 'Y' OR es.DR_ESIGN_STATUS IS NULL)
// )
// )
// AND NOT EXISTS (
// SELECT 1
// FROM srouser.prohb_audit_cr pac
// WHERE pac.reject_status = 'R'
//   AND pac.APP_ID = pd.ID
// )`,
//             A: `SELECT * FROM srouser.GrantApproval_esign_status  ges
//             join preregistration.prereg_det_cr  ppd on ges.APP_ID=ppd.id where ges.SR_CODE in (select sr_cd from Sr_master where DR_CD='${reqData.DR_CODE}') and ges.DR_ESIGN_STATUS='Y'`,
//             // P: `SELECT * FROM preregistration.prereg_det_cr WHERE status ='P' and SR_CODE in (select sr_cd from Sr_master where DR_CD='${reqData.DR_CODE}') and juri_status is not null`,
//             P: `SELECT DISTINCT ppd.*
// FROM srouser.prohb_audit_cr pbc
// JOIN preregistration.prereg_det_cr ppd ON pbc.APP_ID = ppd.id
// WHERE pbc.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = '${reqData.DR_CODE}')
// AND pbc.REJECT_STATUS = 'R'`,

//             // NS:`select * from (SELECT * FROM preregistration.prereg_det_cr a where a.juri_status='Y' and a.status is null and id not in (SELECT se.ID FROM preregistration.prereg_det_cr se
//             //         JOIN preregistration.schedule_entry pdc ON se.ID = pdc.ID
//             //         join srouser.GrantApproval_esign_status ges on ges.APP_ID= pdc.ID
//             //     WHERE se.status IS NULL AND se.SR_CODE IN (623)
//             //     AND se.juri_status = 'Y' AND pdc.probh_check='N' and ges.dr_esign_status !='Y'))`
               
//             // NS :`SELECT * FROM preregistration.prereg_det_cr WHERE status is null and SR_CODE='${reqData.srCode}' and juri_status ='Y'`,
//             NS : `SELECT pdc.*, to_char(sd.date_of_slot, 'dd-mm-yyyy') date_of_slot, sd.time_of_slot, sd.time_stamp, sd.status as slot_status, sd.remarks FROM preregistration.prereg_det_cr pdc
//                 left join preregistration.slot_details sd on pdc.id = sd.id and pdc.sr_code = sd.sr_code
//                 WHERE pdc.status is null and pdc.SR_CODE='${reqData.srCode}' and pdc.juri_status ='Y'
//                 order by slot_status`,
//             AS: `SELECT * FROM preregistration.prereg_det_cr WHERE status = 'A' and SR_CODE='${reqData.srCode}' and juri_status is not null`,
//             PS: `SELECT * FROM preregistration.prereg_det_cr WHERE status ='P' and SR_CODE='${reqData.srCode}' and juri_status is not null`,

//         };
//         let query = Status[reqData.status.toUpperCase()] ?? '';
//         if (query === "") {
//             throw new Error("Bad Request");
//         }
//         let result = await this.dbDao.oDBQueryService(query);
//         return result
//     } catch (ex) {
//         Logger.error("PreRegistraionServices - getPreRegistrationDocs || Error : ", ex);
//         console.error("PreRegistraionServices - getPreRegistrationDocs || Error : ", ex);
//         throw constructCARDError(ex);
//     }
// }

getDrgrantaprroveDocssrvc = async (reqData) => {
    try {
let bindParam={
    CODE:reqData.status.toUpperCase() === 'N' || reqData.status.toUpperCase() === 'A' || reqData.status.toUpperCase() === 'P' ? reqData.DR_CODE : reqData.srCode
}
        let time_data, presentSlotPeriod, pastSlotTime;
        if(reqData.status.toUpperCase() === 'NS') {
            const slotStatus = `select count(*) as count from srouser.slot_enable_sro where status = 'Y' and sr_code = :SR_CODE` // Slot enable status
            const slotResult = await this.dbDao.oDBQueryServiceWithBindParams(slotStatus, {SR_CODE : reqData.srCode})
            reqData.status = slotResult[0].COUNT > 0 ? reqData.status : 'NSS';
            if(reqData.status.toUpperCase() === 'NS') {
                const currentDate = new Date();
                const hours = currentDate.getHours();
                const minutes = currentDate.getMinutes();
                const currentMinutes = hours * 60 + minutes;
                const startTime = 17 * 60 + 31; // 17 : 31, calculating to minutes 
                const endTime = 10 * 60 + 29;  // 10 : 29, calculating to minutes
                time_data = currentMinutes >= startTime || currentMinutes <= endTime; // checking validation
                pastSlotTime = currentMinutes >= (0 * 60 + 0) && currentMinutes <= (10 * 60 + 29); // only 00:00 AM to 10:29 AM(calculating to minutes) and checking validation
                const availableSlots = [10, 11, 12, 13, 14, 15, 16];
                let slotIndex = hours-10;
                if(minutes<30) {
                    slotIndex = slotIndex-1;
                }
                presentSlotPeriod = availableSlots[slotIndex];
            }
        }
        const Status = {
            // N: `SELECT se.* FROM preregistration.prereg_det_cr se
            //         JOIN preregistration.schedule_entry pdc ON se.ID = pdc.ID
            //     WHERE se.status IS NULL AND se.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = '${reqData.DR_CODE}')
            //     AND se.juri_status = 'Y' AND pdc.probh_check='N'`,
            N: `SELECT DISTINCT pd.*
FROM preregistration.prereg_det_cr pd
JOIN preregistration.schedule_entry pdc ON pd.ID = pdc.ID
WHERE pd.status IS NULL
AND pd.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = :CODE)
AND pd.juri_status = 'Y'
AND pdc.probh_check = 'N'
AND (
NOT EXISTS (
  SELECT 1
  FROM srouser.GrantApproval_esign_status es
  WHERE es.APP_ID = pd.ID
)
OR EXISTS (
  SELECT 1
  FROM srouser.GrantApproval_esign_status es
  WHERE es.APP_ID = pd.ID
    AND (es.DR_ESIGN_STATUS != 'Y' OR es.DR_ESIGN_STATUS IS NULL)
)
)
AND NOT EXISTS (
SELECT 1
FROM srouser.prohb_audit_cr pac
WHERE pac.reject_status = 'R'
  AND pac.APP_ID = pd.ID
)`,
            A: `SELECT * FROM srouser.GrantApproval_esign_status  ges
            join preregistration.prereg_det_cr  ppd on ges.APP_ID=ppd.id where ges.SR_CODE in (select sr_cd from Sr_master where DR_CD= :CODE) and ges.DR_ESIGN_STATUS='Y'`,
            // P: `SELECT * FROM preregistration.prereg_det_cr WHERE status ='P' and SR_CODE in (select sr_cd from Sr_master where DR_CD='${reqData.DR_CODE}') and juri_status is not null`,
            P: `SELECT DISTINCT ppd.*
FROM srouser.prohb_audit_cr pbc
JOIN preregistration.prereg_det_cr ppd ON pbc.APP_ID = ppd.id
WHERE pbc.SR_CODE IN (SELECT sr_cd FROM Sr_master WHERE DR_CD = :CODE)
AND pbc.REJECT_STATUS = 'R'`,
            // NS:`select * from (SELECT * FROM preregistration.prereg_det_cr a where a.juri_status='Y' and a.status is null and id not in (SELECT se.ID FROM preregistration.prereg_det_cr se
            //         JOIN preregistration.schedule_entry pdc ON se.ID = pdc.ID
            //         join srouser.GrantApproval_esign_status ges on ges.APP_ID= pdc.ID
            //     WHERE se.status IS NULL AND se.SR_CODE IN (623)
            //     AND se.juri_status = 'Y' AND pdc.probh_check='N' and ges.dr_esign_status !='Y'))`
               
            // NS :`SELECT * FROM preregistration.prereg_det_cr WHERE status is null and SR_CODE='${reqData.srCode}' and juri_status ='Y'`,
            NS : `select b.*, TO_CHAR(b.date_slot, 'DD-MM-YYYY') AS date_of_slot from (                
                SELECT pdc.*,
                    sd.date_of_slot as date_slot,
                    sd.time_of_slot, sd.time_stamp,
                    sd.status AS slot_status, sd.AUTH_STATUS, sd.remarks, 'Y' as slot_enable
                FROM preregistration.prereg_det_cr pdc
                LEFT JOIN preregistration.slot_details sd
                    ON pdc.id = sd.id
                    AND pdc.sr_code = sd.sr_code AND sd.date_of_slot IS NOT NULL AND trunc(sd.date_of_slot) ${time_data ? (pastSlotTime ? '<=' : '<') : '='} TRUNC(SYSDATE)
                    ${time_data ? '' : `AND (
                        sd.time_of_slot LIKE '${presentSlotPeriod}:3%'
                        OR sd.time_of_slot LIKE '${presentSlotPeriod}:4%'
                        OR sd.time_of_slot LIKE '${presentSlotPeriod}:5%'
                        OR sd.time_of_slot LIKE '${presentSlotPeriod + 1}:0%'
                        OR sd.time_of_slot LIKE '${presentSlotPeriod + 1}:1%'
                        OR sd.time_of_slot LIKE '${presentSlotPeriod + 1}:2%'
                    )`}
                WHERE pdc.status IS NULL
                    AND pdc.SR_CODE = :CODE
                    AND pdc.juri_status IN ('Y', 'N')
                    ) b
                        ${time_data ? '' : 'where b.date_slot is not null'}
                        ${(time_data && pastSlotTime) ? 'where (trunc(b.date_slot) < TRUNC(SYSDATE) OR b.date_slot is null)' : ''}
                ORDER BY b.slot_status`,
            NSS : `SELECT a.*, 'N' as slot_enable FROM preregistration.prereg_det_cr a WHERE a.status is null and a.SR_CODE= :CODE and a.juri_status ='Y'`,
            AS: `SELECT * FROM preregistration.prereg_det_cr WHERE status = 'A' and SR_CODE=:CODE and juri_status is not null`,
            PS: `SELECT * FROM preregistration.prereg_det_cr WHERE status ='P' and SR_CODE=:CODE and juri_status is not null`,

        };
        let query = Status[reqData.status.toUpperCase()] ?? '';
        if (query === "") {
            throw new Error("Bad Request");
        }       
        let result = await this.dbDao.oDBQueryServiceWithBindParams(query, bindParam);
        return result
    } catch (ex) {
        Logger.error("grantapproveServices - getDrgrantaprroveDocssrvc || Error : ", ex);
        console.error("grantapproveServices - getDrgrantaprroveDocssrvc || Error : ", ex);
        throw constructCARDError(ex);
    }
}

GetRejectListsrvc = async (reqData) => {
    try {
        let bindparam={
            // APP_ID: reqData.APP_ID
        }
       
        let query = `select * from srouser.prohb_audit_cr where reject_status ='R' and app_id = '${reqData.APP_ID}' `;
        let response = await this.dbDao.oDBQueryServiceWithBindParams(query,bindparam); 
        return response
    }
    catch (ex) {
        console.error("grantapproveServices - GetRejectListsrvc || Error :", ex);
        throw ex;
    }
}
    extractTextWithPositionsFromPDF = async (base64Data) => {
        // Convert Base64 to binary data
        const binaryData = Uint8Array.from(atob(base64Data), char => char.charCodeAt(0));

        // Load the PDF document from binary data
        const loadingTask = pdfjsLib.getDocument({ data: binaryData });
        const pdfDocument = await loadingTask.promise;

        let textWithPositions = [];

        // Loop through all the pages
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const content = await page.getTextContent();

            // Extract text and positions
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
    };
    grantapprovalcoordinatessrvc = async (reqData) => {
        let aadharresult;
        try {
            const query = `SELECT e.*, s.sr_name
                       FROM employee_login_master e
                       JOIN Sr_master s ON s.sr_cd = e.sr_code
                       WHERE e.empl_id=${reqData.EMPL_ID}`;

            aadharresult = await this.dbDao.oDBQueryService(query);
            if (aadharresult.length > 0) {
                let base64Data = reqData.PDF;
                const pdfData = new Uint8Array(Buffer.from(base64Data, 'base64'));
                const pdf = await pdfjsLib.getDocument({ data: pdfData });
                const pdfDocument = await pdf.promise;
                const totalPages = pdfDocument.numPages;
                const lastPage = await pdfDocument.getPage(totalPages);
                const content = await lastPage.getTextContent(); let textWithPositions = [];
                content.items.forEach(item => {
                    textWithPositions.push({
                        text: item.str,
                        position: {
                            x: item.transform[4],
                            y: item.transform[5]
                        },
                        page: totalPages
                    });
                });
                const searchText = reqData.eSignFor === 'DR' ? 'DR_eSign' : 'SR_eSign';
                const signaturePosition = textWithPositions.find(item => item.text.trim().toLowerCase().includes(searchText.toLowerCase().trim()));
                let roundedPosition;
                if (signaturePosition) {
                    roundedPosition = {
                        x: Math.round(signaturePosition.position.x),
                        y: Math.round(signaturePosition.position.y),
                        pageNo: signaturePosition.page
                    };
                    // console.log(roundedPosition, 'Coordinates of "DR eSign" on the last page');
                } else {
                    console.log(`Text "${searchText}" not found on the last page.`);
                }
                let transactionID = new Date().getTime();
                let eSignData = {
                    "rrn": transactionID,
                    "coordinates_location": 'Top_Right',
                    "coordinates": `${roundedPosition.pageNo}-65,${roundedPosition.y},50,${reqData.eSignFor === 'DR' ? roundedPosition.x - 320 : roundedPosition.x + 240};`,
                    // "DRcoordinates": `${roundedPosition.pageNo}-65,${roundedPosition.y},50,${roundedPosition.x-320};`,
                    // "coordinates":'2-65,480,50,100;',
                    "doctype": 'PDF',
                    "uid": aadharresult[0].AADHAR,
                    "signername": aadharresult[0].EMPL_NAME?.substring(0, 50),
                    "signerlocation": `${aadharresult[0].SR_NAME}`,
                    "filepassword": '',
                    "signreason": 'GrantApproval',
                    "authmode": 1,
                    "webhookurl": `${process.env.GRANT_APPROVE_ESIGN_URL}`,
                    "file": base64Data
                };

                let esignUrlData = await this.dbDao.oDBQueryService(`Select * from SROUSER.esign_urls`);
                if (!esignUrlData || esignUrlData.length == 0) {
                    throw new Error('Esign Urls Not Found');
                }

                let esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
                let esignUrl = parseInt(reqData.ID) % 2 === 0 ? esignUrlData[0].NSDL_URL : esignUrlData[0].EMUDHRA;
        // let eSignReponse = await this.esign.igrsEsignAxiosCall('http://117.250.201.41:9080/igrs-esign-service', esignRequestData);
                let eSignReponse = await this.esign.igrsEsignAxiosCall(esignUrl, esignRequestData);
                let esignquailfier = reqData.eSignFor === 'DR' ? 'AADHAR = :AADHAR, DN_QUALIFIER = :DN_QUALIFIER, NAME = :NAME' : 'SR_AADHAR = :AADHAR,SR_DN_QUALIFIER = :DN_QUALIFIER,SR_NAME = :NAME';
                const queryUpdate = `MERGE INTO srouser.GrantApproval_esign_status tgt
USING dual
ON (tgt.APP_ID = :APP_ID)
WHEN MATCHED THEN
    UPDATE SET
        SR_CODE = :SR_CODE,
        Designation = :DESIGNATION,
        PAGE_NO = :PAGE_NO,
        COORDINATES = :COORDINATES,
        ${esignquailfier}
WHEN NOT MATCHED THEN
    INSERT (
        SR_CODE,
        APP_ID,
        Designation,
        PAGE_NO,
        COORDINATES,
        
        ${reqData.eSignFor === 'DR' ? 'AADHAR,DN_QUALIFIER,NAME' : 'SR_AADHAR,SR_DN_QUALIFIER,SR_NAME'}
        
    ) VALUES (
        :SR_CODE,
        :APP_ID,
        :DESIGNATION,
        :PAGE_NO,
        :COORDINATES,
        :AADHAR,
        :DN_QUALIFIER,
        :NAME
    )`;

                let bindParam = {
                    SR_CODE: reqData.SR_CODE,
                    APP_ID: reqData.APP_ID,
                    DESIGNATION: reqData.DESIGNATION,
                    PAGE_NO: roundedPosition.pageNo,
                    COORDINATES: `65,${roundedPosition.y},50,${reqData.eSignFor === 'DR' ? roundedPosition.x - 320 : roundedPosition.x + 280}`,
                    AADHAR: aadharresult[0].AADHAR,
                    DN_QUALIFIER: transactionID,
                    NAME: aadharresult[0].EMPL_NAME
                };
                // let commentsquery;
                // let grantesign= await this.dbDao.oDbInsertDocsWithBindParams(queryUpdate, bindParam);
                // if(grantesign>0 && eSignReponse){                    
                // for(let i=0; reqData.COMMENTS.length>i; i++){
                //     let commentparams ={
                //         SR_CODE: reqData.SR_CODE,
                //         APP_ID:reqData.APP_ID,
                //         SCHEDULE_NO:reqData.COMMENTS[i].SCHEDULE_NO
                //     }
                //     commentsquery=`${reqData.eSignFor === 'DR' ? `DR_COMMENTS='${reqData.COMMENTS[i].COMMENTS}' , DR_COMMENT_BY= '${reqData.EMPL_ID}'`:`SR_COMMENTS='${reqData.COMMENTS[i].COMMENTS}' , SR_COMMENT_BY= '${reqData.EMPL_ID}'`}`;
                //     let commentquery = `update preregistration.schedule_entry set ${commentsquery} where JURISDICTION = :SR_CODE and ID= :APP_ID and SCHEDULE_NO= :SCHEDULE_NO`;
                //     console.log(commentquery,"commentquery");
                    
                //     let update = await this.dbDao.oDbInsertDocsWithBindParams(commentquery, commentparams);
                // }
                // }

                let commentsQueries = [];

let grantesign = await this.dbDao.oDbInsertDocsWithBindParams(queryUpdate, bindParam);
if (grantesign > 0 && eSignReponse) {
    // Collect all queries in an array
    for (let i = 0; i < reqData.COMMENTS.length; i++) {
        let commentparams = {
            SR_CODE: reqData.COMMENTS[i].JURISDICTION,
            APP_ID: reqData.APP_ID,
            SCHEDULE_NO: reqData.COMMENTS[i].SCHEDULE_NO
        };
        let commentsquery = `${reqData.eSignFor === 'DR' 
            ? `DR_COMMENTS='${reqData.COMMENTS[i].COMMENTS}', DR_COMMENT_BY='${reqData.EMPL_ID}'` 
            : `SR_COMMENTS='${reqData.COMMENTS[i].COMMENTS}', SR_COMMENT_BY='${reqData.EMPL_ID}'`}`;

          

        let commentquery = `update preregistration.schedule_entry 
                            set ${commentsquery} 
                            where JURISDICTION =:SR_CODE  and ID = :APP_ID and SCHEDULE_NO = :SCHEDULE_NO`;

        commentsQueries.push({ query: commentquery, params: commentparams });
    }

    
    for (const { query, params } of commentsQueries) {
        try {
            let update = await this.dbDao.oDbInsertDocsWithBindParams(query, params);
            console.log(`Query executed successfully: ${query}`);
        } catch (error) {
            console.error(`Error executing query: ${query}`, error);
        }
    }
       }
                return { rrn: transactionID, data: eSignReponse };
            }
        } catch (err) {
            console.error("grantapproveServices - grantapprovalcoordinatessrvc || Error :", err);
            throw err;
        }
    };
    savePdfToFile = async (pdfBytes, filename) => {
        // const directory = path.dirname(filePath);
        // await fs.mkdir(directory, { recursive: true });

        await fs.writeFile(filename, pdfBytes);
        console.log(`PDF saved to ${filename}`);
        return true;
    };

    convertBase64ToPdf = async (base64String) => {
        const decodedBuffer = Buffer.from(base64String, 'base64');
        const pdfDoc = await PDFDocument.load(decodedBuffer);
        return pdfDoc.save();
    }
    pendingEsignList = async (reqBody) => {
        try {
            const { SR_CODE, esignstatus, CODE } = reqBody;
            let esignstat;
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
                const fileResponse = await instance.request(eSignConfig);

                if (fileResponse == null || fileResponse.data == null || fileResponse.data.data == undefined) {
                    console.log('Pending Esign was not completed');
                    console.error("No file found");

                } else {
                    let query5
                    const base64Pdf = fileResponse.data.data;
                    const pdfBytes = await this.convertBase64ToPdf(base64Pdf);

                    let grantApprovedir = '/pdfs/uploads/';
                    if (!fsone.existsSync(grantApprovedir)) {
                        fsone.mkdirSync(grantApprovedir, { recursive: true });
                    }
                    const filename = path.join(grantApprovedir, `GrantApproval_${reqBody.APP_ID}.pdf`);        
                    // const filename = path.join(grantApprovedir,`${reqBody.SR_CODE}_${reqBody.APP_ID}.pdf`);
                    // let grantApprovedir = path.join(__dirname, `../../../pdfs/`);
                    // let endorsementDirectiory = Path.join(__dirname, `../../public/`);
                    // if (!fsone.existsSync(grantApprovedir)) {
                    //     fsone.mkdirSync(grantApprovedir, { recursive: true });
                    // }
                    // grantApprovedir = `${grantApprovedir}/uploads/`;
                    // if (!fsone.existsSync(grantApprovedir)) {
                    //     fsone.mkdirSync(grantApprovedir, { recursive: true });
                    // }
                    // grantApprovedir = `${grantApprovedir}${reqBody.SR_CODE}/`;
                    // if (!fsone.existsSync(grantApprovedir)) {
                    //     fsone.mkdirSync(grantApprovedir, { recursive: true });
                    // }
                    // grantApprovedir = `${grantApprovedir}${reqBody.APP_ID}/`;
                    // if (!fsone.existsSync(grantApprovedir)) {
                    //     fsone.mkdirSync(grantApprovedir, { recursive: true });
                    // }
                    // const filename = `${grantApprovedir}GrantApproval_${reqBody.APP_ID}.pdf`;

                    let esignforcond = reqBody.eSignFor === 'DR' ? `DR_Esign_status = 'Y', time_stamp=SYSDATE ` : `SR_Esign_status = 'Y', sr_esign_time_stamp=SYSDATE `
                    let esigndnquali = reqBody.eSignFor === 'DR' ? `dn_qualifier = '${esignstatus}'` : `sr_dn_qualifier = '${esignstatus}' `

                    await this.savePdfToFile(pdfBytes, filename);
                    query5 = `update srouser.GrantApproval_esign_status set ${esignforcond} where sr_code = ${SR_CODE} and APP_ID=${reqBody.APP_ID} and ${esigndnquali}`;
                    let update = await this.dbDao.oDbUpdate(query5);
                    // let esignstat;

                    if (update > 0) {
                        esignstat = 'success';
                        console.log('PDF saved successfully');
                    }
                }
            }
            return { esignstat: esignstat };
        } catch (ex) {
            console.error("grantapproveServices - pendingEsignList || Error :", ex);
            throw ex;
        }
    };
    CheckPPstatsrvc = async (reqData) => {
        try {
            let query = ''
            query = `select * from preregistration.schedule_entry pse 
           left join srouser.GrantApproval_esign_status ges on pse.ID=ges.APP_ID where pse.id='${reqData.docNo}' and pse.probh_check='N'`;
            if (reqData.GA_Flag) {
                query = `select * from srouser.GrantApproval_esign_status where app_id='${reqData.docNo}' and sr_esign_status='Y'`;

            }
            let response = await this.dbDao.oDBQueryService(query);            return response
        }
        catch (ex) {
            console.error("grantapproveServices - CheckPPstatsrvc || Error :", ex);
            throw ex;
        }
    }
    grantpdfpreviewSrvc = async (reqBody) => {
        try {
            let grantApprovedir = '/pdfs/uploads/';
            if (!fsone.existsSync(grantApprovedir)) {
                fsone.mkdirSync(grantApprovedir, { recursive: true });
            }
            const filePath = path.join(grantApprovedir, `GrantApproval_${reqBody.APP_ID}.pdf`);
            const pdfBuffer = await require("fs").promises.readFile(filePath);
            const base64Pdf = pdfBuffer.toString("base64");
            return base64Pdf;
        } catch (ex) {
            console.error("grantapproveServices - grantpdfpreviewSrvc || Error :", "Error in PDFPreview:", ex);
            throw ex;
        }
      };
      grantApprovalRejectSrvc = async (reqData)=>{
		try{		

// 			let query = `INSERT INTO srouser.prohb_audit_cr (
//     APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, VILLAGE_CD, 
//     SURVEY_NO, WARD_NO, BLOCK_NO, DOOR_NO, ERROR_TYPE, JURISDICTION, 
//     OPERATOR, TIMESTAMP, COMMENTS, DR_COMMENTS, REJECT_STATUS
// ) VALUES (
//     :APP_ID, :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :SCHEDULE_NO, :VILLAGE_CD, 
//     :SURVEY_NO, :WARD_NO, :BLOCK_NO, :DOOR_NO, :ERROR_TYPE, :JURISDICTION, 
//     :OPERATOR, SYSDATE, :COMMENTS, :DR_COMMENTS, :REJECT_STATUS
// )`
let result;
for(let i=0; reqData.DR_COMMENTS.length>i; i++){
//     let query =`MERGE INTO srouser.prohb_audit_cr target
// USING (
//     SELECT :APP_ID AS APP_ID, :SR_CODE AS SR_CODE, :BOOK_NO AS BOOK_NO, :DOCT_NO AS DOCT_NO, 
//            :REG_YEAR AS REG_YEAR, :SCHEDULE_NO AS SCHEDULE_NO, :VILLAGE_CD AS VILLAGE_CD, 
//            :SURVEY_NO AS SURVEY_NO, :WARD_NO AS WARD_NO, :BLOCK_NO AS BLOCK_NO, 
//            :DOOR_NO AS DOOR_NO, :ERROR_TYPE AS ERROR_TYPE, :JURISDICTION AS JURISDICTION, 
//            :OPERATOR AS OPERATOR, :COMMENTS AS COMMENTS, :DR_COMMENTS AS DR_COMMENTS, 
//            :REJECT_STATUS AS REJECT_STATUS
//     FROM dual
// ) source
// ON (target.APP_ID = source.APP_ID)
// WHEN MATCHED THEN
//     UPDATE SET 
//         SR_CODE = source.SR_CODE,
//         BOOK_NO = source.BOOK_NO,
//         DOCT_NO = source.DOCT_NO,
//         REG_YEAR = source.REG_YEAR,
//         SCHEDULE_NO = source.SCHEDULE_NO,
//         VILLAGE_CD = source.VILLAGE_CD,
//         SURVEY_NO = source.SURVEY_NO,
//         WARD_NO = source.WARD_NO,
//         BLOCK_NO = source.BLOCK_NO,
//         DOOR_NO = source.DOOR_NO,
//         ERROR_TYPE = source.ERROR_TYPE,
//         JURISDICTION = source.JURISDICTION,
//         OPERATOR = source.OPERATOR,
//         TIMESTAMP = SYSDATE,
//         COMMENTS = NVL(NULLIF(source.COMMENTS, ''), target.COMMENTS),
//         DR_COMMENTS = NVL(NULLIF(source.DR_COMMENTS, ''), target.DR_COMMENTS),
//         REJECT_STATUS = source.REJECT_STATUS
// WHEN NOT MATCHED THEN
//     INSERT (
//         APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, VILLAGE_CD, 
//         SURVEY_NO, WARD_NO, BLOCK_NO, DOOR_NO, ERROR_TYPE, JURISDICTION, 
//         OPERATOR, TIMESTAMP, COMMENTS, DR_COMMENTS, REJECT_STATUS
//     )
//     VALUES (
//         source.APP_ID, source.SR_CODE, source.BOOK_NO, source.DOCT_NO, source.REG_YEAR, 
//         source.SCHEDULE_NO, source.VILLAGE_CD, source.SURVEY_NO, source.WARD_NO, 
//         source.BLOCK_NO, source.DOOR_NO, source.ERROR_TYPE, source.JURISDICTION, 
//         source.OPERATOR, SYSDATE, source.COMMENTS, source.DR_COMMENTS, source.REJECT_STATUS
//     )`
// APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, VILLAGE_CD, SURVEY_NO, WARD_NO, BLOCK_NO, DOOR_NO, ERROR_TYPE, JURISDICTION, OPERATOR, TIMESTAMP, COMMENTS, DR_COMMENTS, REJECT_STATUS
            let query= `INSERT INTO SROUSER.PROHB_AUDIT_CR 
    (APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, VILLAGE_CD, SURVEY_NO, WARD_NO, BLOCK_NO, DOOR_NO, ERROR_TYPE, JURISDICTION, OPERATOR, TIMESTAMP, COMMENTS, DR_COMMENTS, REJECT_STATUS) 
VALUES 
    (:APP_ID, :SR_CODE, :BOOK_NO, :DOCT_NO, :REG_YEAR, :SCHEDULE_NO, :VILLAGE_CD, :SURVEY_NO, :WARD_NO, :BLOCK_NO, :DOOR_NO, :ERROR_TYPE, :JURISDICTION, :OPERATOR, SYSDATE, :COMMENTS, :DR_COMMENTS, :REJECT_STATUS)`;
            let bindParam = {
                "APP_ID": reqData.DR_COMMENTS[i].ID,
                "SR_CODE": reqData.DR_COMMENTS[i].JURISDICTION?parseInt(reqData.DR_COMMENTS[i].JURISDICTION):null,        // Ensure it's a number
                "BOOK_NO": reqData.BOOK_NO ? parseInt(reqData.BOOK_NO) : null,  // Optional field handling
                "DOCT_NO": reqData.DOCT_NO ? parseInt(reqData.DOCT_NO) : null,
                "REG_YEAR": reqData.REG_YEAR ? parseInt(reqData.REG_YEAR) : null,
                // "SCHEDULE_NO": reqData.SCHEDULE_NO,
                "SCHEDULE_NO":reqData.DR_COMMENTS[i].SCHEDULE_NO,

                "VILLAGE_CD": reqData.DR_COMMENTS[i].VILLAGE_CODE,
                "SURVEY_NO": reqData.DR_COMMENTS[i].SURVEY_NO,
                "WARD_NO": reqData.DR_COMMENTS[i].WARD_NO ? parseInt(reqData.DR_COMMENTS[i].WARD_NO) : null,
                "BLOCK_NO": reqData.DR_COMMENTS[i].BLOCK_NO ? parseInt(reqData.DR_COMMENTS[i].BLOCK_NO) : null,
                "DOOR_NO": reqData.DR_COMMENTS[i].DOOR_NO,
                "ERROR_TYPE": reqData.ERROR_TYPE,
                "JURISDICTION": reqData.DR_COMMENTS[i].JURISDICTION?parseInt(reqData.DR_COMMENTS[i].JURISDICTION) :null,
                "OPERATOR": reqData.OPERATOR,
                "COMMENTS":  reqData.ROLE ==='SR'?reqData.DR_COMMENTS[i].COMMENTS:'',
                "DR_COMMENTS": reqData.ROLE ==='SR'?'':reqData.DR_COMMENTS[i].COMMENTS,
                "REJECT_STATUS": reqData.REJECT_STATUS
            };
            result = await this.dbDao.oDbInsertDocsWithBindParams(query, bindParam);
			if(result < 0){
				throw new Error('Bad Request')
			}
}

// let query =`MERGE INTO srouser.prohb_audit_cr target
// USING (
//     SELECT :APP_ID AS APP_ID, :SR_CODE AS SR_CODE, :BOOK_NO AS BOOK_NO, :DOCT_NO AS DOCT_NO, 
//            :REG_YEAR AS REG_YEAR, :SCHEDULE_NO AS SCHEDULE_NO, :VILLAGE_CD AS VILLAGE_CD, 
//            :SURVEY_NO AS SURVEY_NO, :WARD_NO AS WARD_NO, :BLOCK_NO AS BLOCK_NO, 
//            :DOOR_NO AS DOOR_NO, :ERROR_TYPE AS ERROR_TYPE, :JURISDICTION AS JURISDICTION, 
//            :OPERATOR AS OPERATOR, :COMMENTS AS COMMENTS, :DR_COMMENTS AS DR_COMMENTS, 
//            :REJECT_STATUS AS REJECT_STATUS
//     FROM dual
// ) source
// ON (target.APP_ID = source.APP_ID)
// WHEN MATCHED THEN
//     UPDATE SET 
//         SR_CODE = source.SR_CODE,
//         BOOK_NO = source.BOOK_NO,
//         DOCT_NO = source.DOCT_NO,
//         REG_YEAR = source.REG_YEAR,
//         SCHEDULE_NO = source.SCHEDULE_NO,
//         VILLAGE_CD = source.VILLAGE_CD,
//         SURVEY_NO = source.SURVEY_NO,
//         WARD_NO = source.WARD_NO,
//         BLOCK_NO = source.BLOCK_NO,
//         DOOR_NO = source.DOOR_NO,
//         ERROR_TYPE = source.ERROR_TYPE,
//         JURISDICTION = source.JURISDICTION,
//         OPERATOR = source.OPERATOR,
//         TIMESTAMP = SYSDATE,
//         COMMENTS = NVL(NULLIF(source.COMMENTS, ''), target.COMMENTS),
//         DR_COMMENTS = NVL(NULLIF(source.DR_COMMENTS, ''), target.DR_COMMENTS),
//         REJECT_STATUS = source.REJECT_STATUS
// WHEN NOT MATCHED THEN
//     INSERT (
//         APP_ID, SR_CODE, BOOK_NO, DOCT_NO, REG_YEAR, SCHEDULE_NO, VILLAGE_CD, 
//         SURVEY_NO, WARD_NO, BLOCK_NO, DOOR_NO, ERROR_TYPE, JURISDICTION, 
//         OPERATOR, TIMESTAMP, COMMENTS, DR_COMMENTS, REJECT_STATUS
//     )
//     VALUES (
//         source.APP_ID, source.SR_CODE, source.BOOK_NO, source.DOCT_NO, source.REG_YEAR, 
//         source.SCHEDULE_NO, source.VILLAGE_CD, source.SURVEY_NO, source.WARD_NO, 
//         source.BLOCK_NO, source.DOOR_NO, source.ERROR_TYPE, source.JURISDICTION, 
//         source.OPERATOR, SYSDATE, source.COMMENTS, source.DR_COMMENTS, source.REJECT_STATUS
//     )`
//             // Insert into SROUSER.PROHB_AUDIT_CR (APP_ID,SR_CODE,BOOK_NO,DOCT_NO,REG_YEAR,SCHEDULE_NO,VILLAGE_CD,SURVEY_NO,WARD_NO,BLOCK_NO,DOOR_NO,ERROR_TYPE,JURISDICTION,OPERATOR,TIMESTAMP,COMMENTS) values ('${reqData.APP_ID}',${reqData.SR_CODE},${reqData.BOOK_NO},${reqData.DOCT_NO},${reqData.REG_YEAR},'${reqData.SCHEDULE_NO}','${reqData.VILLAGE_CD}','${reqData.SURVEY_NO}',${reqData.WARD_NO},${reqData.BLOCK_NO},'${reqData.DOOR_NO}','${reqData.ERROR_TYPE}',${reqData.JURISDICTION},'${reqData.OPERATOR}',SYSDATE,'${reqData.COMMENTS}')`;
//             let bindParam = {
//                 "APP_ID": reqData.APP_ID,
//                 "SR_CODE": parseInt(reqData.SR_CODE),        // Ensure it's a number
//                 "BOOK_NO": reqData.BOOK_NO ? parseInt(reqData.BOOK_NO) : null,  // Optional field handling
//                 "DOCT_NO": reqData.DOCT_NO ? parseInt(reqData.DOCT_NO) : null,
//                 "REG_YEAR": reqData.REG_YEAR ? parseInt(reqData.REG_YEAR) : null,
//                 "SCHEDULE_NO": reqData.SCHEDULE_NO,
//                 "VILLAGE_CD": reqData.VILLAGE_CD,
//                 "SURVEY_NO": reqData.SURVEY_NO,
//                 "WARD_NO": reqData.WARD_NO ? parseInt(reqData.WARD_NO) : null,
//                 "BLOCK_NO": reqData.BLOCK_NO ? parseInt(reqData.BLOCK_NO) : null,
//                 "DOOR_NO": reqData.DOOR_NO,
//                 "ERROR_TYPE": reqData.ERROR_TYPE,
//                 "JURISDICTION": parseInt(reqData.JURISDICTION),
//                 "OPERATOR": reqData.OPERATOR,
//                 "COMMENTS": reqData.COMMENTS,
//                 "DR_COMMENTS": reqData.DR_COMMENTS,
//                 "REJECT_STATUS": reqData.REJECT_STATUS
//             };
// 			let result = await this.dbDao.oDbInsertDocsWithBindParams(query, bindParam);
// 			if(result < 0){
// 				throw new Error('Bad Request')
// 			}
			return result
		}catch(ex){
			Logger.error("grantapproveServices - grantApprovalRejectSrvc || Error : ", ex);
			console.error("grantapproveServices - grantApprovalRejectSrvc || Error : ", ex);
            throw constructCARDError(ex);
		}
	}
    getgrantProhibDetailsSrvc = async (reqData) => {
        try {
            let query = `select * from preregistration.schedule_entry where id='${reqData.APP_NO}' and PROBH_CHECK='N' `;            
            let response = await this.dbDao.oDBQueryService(query)
            return response;
        } catch (ex) {
            Logger.error("grantapproveServices - getgrantProhibDetailsSrvc || Error :", ex);
            console.error("grantapproveServices - getgrantProhibDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    GetRejectcommentssrvc = async (reqData) => {
        try {
           let bindparam ={
            APP_ID:reqData.APP_ID
           }
            let query = `select * from srouser.prohb_audit_cr where app_id= :APP_ID`;            
            let response = await this.dbDao.oDBQueryServiceWithBindParams(query, bindparam)
            return response;
        } catch (ex) {
            Logger.error("grantapproveServices - GetRejectcommentssrvc || Error :", ex);
            console.error("grantapproveServices - GetRejectcommentssrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }
};


module.exports = grantapprovesrvc;