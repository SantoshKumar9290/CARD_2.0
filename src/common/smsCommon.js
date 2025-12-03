const axios = require('axios');
const https = require('https');
const OracleDBDao = require('../dao/oracledbDao');
const odbDao = new OracleDBDao();

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

async function statusCheck(reqData) {
    // console.log("statusCheck function called with:", reqData);
    try {
        let query = `SELECT DOC_EKYC, DOC_CASH, DOC_ASSIGN, DOC_BUNDLE, DOC_ENDORS, DOC_ESIGN, DOC_DIGI_SIGN, DOC_HANDOVER, DOC_PEND, DOC_SUBDIV, DOC_MUTATION, DOC_URBAN_MUTATION, DOC_COR, DOC_RESCAN, DOC_REKYC, APP_ID 
                     FROM SROUSER.pde_doc_status_cr 
                     WHERE sr_code=:srCode AND doct_no=:doctNo AND book_no=:booNo AND reg_year=:regYear`;        
        // console.log("statusCheck query:", query);
        let bind = {
            srCode: reqData?.srCode,
            doctNo: reqData?.doctNo,
            booNo: reqData?.bookNo,
            regYear: reqData?.regYear
        };
        
        // console.log("statusCheck bind parameters:", bind);
        let result = await odbDao.oDBQueryServiceWithBindParams(query, bind);
        // console.log("statusCheck status result:", result);
        
        if (result.length > 0) {            
            let currentStatus = "";
            if (result[0].DOC_EKYC === 'Y') currentStatus = "EKYC";
            else if (result[0].DOC_CASH === 'Y') currentStatus = "Cash Payment";
            else if (result[0].DOC_SUBDIV === 'Y') currentStatus = "Subdivision";
            else if (result[0].DOC_ASSIGN === 'Y') currentStatus = "Assigned";            
            else if (result[0].DOC_ESIGN === 'Y') currentStatus = "E-Sign";
            else if (result[0].DOC_PEND === 'Y') currentStatus = "Pending";         
            else if (result[0].DOC_BUNDLE === 'Y') currentStatus = "Scanning";
            else if (result[0].DOC_DIGI_SIGN === 'Y') currentStatus = "Digital Signature";
            else if (result[0].DOC_MUTATION === 'Y') currentStatus = "Mutation";
            else if (result[0].DOC_URBAN_MUTATION === 'Y') currentStatus = "Urban Mutation";
            else if (result[0].DOC_HANDOVER === 'Y') currentStatus = "Handover";            
            else if (result[0].DOC_COR === 'Y') currentStatus = "Correction";
            else if (result[0].DOC_RESCAN === 'Y') currentStatus = "Rescan";
            else if (result[0].DOC_REKYC === 'Y') currentStatus = "Re-KYC";
            
                        
            const selectQuery = `SELECT pr.P_NAME, rp.NAME, rp.PHONE_NO, pds.app_id, pr.SCANNED 
                                FROM SROUSER.tran_major pr
                                JOIN SROUSER.tran_ec rp ON pr.sr_code = rp.sr_code AND pr.book_no = rp.book_no AND pr.doct_no = rp.doct_no AND pr.p_code = rp.code and pr.reg_year = rp.reg_year and upper(pr.p_name) = upper(rp.name) 
                                JOIN SROUSER.pde_doc_status_cr pds ON pr.sr_code = pds.sr_code and pr.book_no = pds.book_no and pr.doct_no = pds.doct_no and pr.reg_year = pds.reg_year
                                WHERE pr.sr_code=:srCode and pr.book_no=:booNo and pr.doct_no=:doctNo and pr.reg_year=:regYear`;
            
            // console.log("statusCheck selectQuery:", selectQuery);
            let binds = {
                srCode: reqData?.srCode,
                doctNo: reqData?.doctNo,
                booNo: reqData?.bookNo,
                regYear: reqData?.regYear
            };
            
            // console.log("statusCheck binds:", binds);
            const result1 = await odbDao.oDBQueryServiceWithBindParams(selectQuery, binds);
            // console.log("statusCheck result1:", JSON.stringify(result1, null, 2));

            let name = null;
            let phoneNo = null;
            let appId = result[0].APP_ID;
            let scanned = result[0].SCANNED;

            if (result1.length > 0) {                
                name = result1[0].NAME;
                phoneNo = result1[0].PHONE_NO;
                appId = result1[0].APP_ID || appId;                
                scanned = result1[0].SCANNED;                
                // console.log("Fetching details ********** Name:", name, "Phone:", phoneNo, "AppID:", appId);                
                return {
                    status: result[0],
                    contactInfo: {
                        NAME: name,
                        PHONE_NO: phoneNo,
                        APP_ID: appId,
                        SCANNED: scanned
                    }
                };
            } else {
                const selectQuerys = `SELECT DISTINCT
    tf.name AS firm_name,
    cf.name,
    cf.phone_no,
    pds.app_id,
    tr.SCANNED
FROM
    srouser.tran_ec_firms tf
JOIN srouser.tran_major tr
    ON tf.sr_code = tr.sr_code
   AND tf.book_no = tr.book_no
   AND tf.doct_no = tr.doct_no
   AND tf.reg_year = tr.reg_year     
JOIN srouser.pde_doc_status_cr pds
    ON tf.sr_code = pds.sr_code
   AND tf.book_no = pds.book_no
   AND tf.doct_no = pds.doct_no
   AND tf.reg_year = pds.reg_year
JOIN preregistration.executants_claimant_firms cf
    ON tf.code = cf.code
   AND tf.name = cf.name
   AND tf.r_code = cf.r_code
   AND cf.id = pds.app_id
   and cf.EC_NUMBER = tf.EC_NUMBER
   and cf.FIRM_NUMBER = tf.FIRM_NUMBER
   
WHERE
    tf.sr_code = :srCode
  AND tf.book_no = :booNo
  AND tf.doct_no = :doctNo
  AND tf.reg_year = :regYear`;
                
                // console.log("statusCheck selectQuerys (fallback):", selectQuerys);
                const bindps = {
                    srCode: reqData.srCode,
                    booNo: reqData.bookNo,
                    doctNo: reqData.doctNo,
                    regYear: reqData.regYear
                };
                
                // console.log("statusCheck bindps (fallback):", bindps);
                const result2 = await odbDao.oDBQueryServiceWithBindParams(selectQuerys, bindps);
                // console.log("Fetching details ********** Name:", result2);
                if (result2.length > 0) {                    
                    name = result2[0].NAME;
                    phoneNo = result2[0].PHONE_NO;
                    appId = result2[0].APP_ID || appId;
                    scanned = result2[0].SCANNED;
                    
                    // console.log("Contact info found in second query - Name:", name, "Phone:", phoneNo, "AppID:", appId);                    
                    return { status: result[0],
                        contactInfo: {
                            NAME: name,
                            PHONE_NO: phoneNo,
                            APP_ID: appId,
                            SCANNED: scanned
                        }
                    };
                } else {                                                            
                    return { status: result[0],
                        contactInfo: {
                            APP_ID: appId
                        }
                    };
                }
            }
        }
        console.log("No document status found");
        return { status: null, contactInfo: null };
    } catch (ex) {
        console.error("SMSCommon - statusCheck || Error:", ex);
        throw new Error(ex);
    }
}

async function sendSMSNotification(record, statusName) {
    try {
        // console.log("sendSMSNotification called with record:", record);
        // console.log("sendSMSNotification called with statusName:", statusName);                    
        let userName = record.NAME;
        let appId = record.APP_ID;
        let phoneNo = record.PHONE_NO;
        
        let templateId = '1007466539500911136';
        let message = `Dear User ${userName}, Your application for document registration number ${appId} has been completed ${statusName} process successfully. Thank You! APIGRS`;
        
        // console.log("SMS message content:", message);
        // console.log("Phone number for SMS:", phoneNo);
        
        phoneNo = phoneNo.toString();
        let data = { "phoneNos": phoneNo, "templateId": templateId, "smsMessage": message, "statusName" :statusName ,"appId": appId };
        // console.log("SMS API request data:", data);            
        const smsEndpoint = `${process.env.PDE_HOST}/pdeapi/v1/users/sendSMS`;                
        const headers = {
            'Authorization': `Bearer ${process.env.SMS_API_TOKEN}`,
            'Content-Type': 'application/json'
        };        
        const response = await instance({ 
            method: "POST", 
            url: smsEndpoint, 
            headers, 
            data,           
        });
        
        // console.log("SMS API response status:", response.status);
        // console.log("SMS API response data:", response.data);        
        if (response.data && response.status >= 200 && response.status < 300) {            
            return { success: true, data: response.data };
        } else {            
            return { success: false, error: "SMS API returned non-success response", response: response.data };
        }
    } catch (ex) {
        console.error("sendSMSNotification || Error:", ex.message); 
        return { success: false, error: ex.message };
    }
}

const whatsAppNotificationForEC = async (params) => {
    try {
        const config = {
            method: 'post',
            url: `${process.env.RTGS_WHATSAPP_URL}`,
            data: {
                "receiver": `${params.mobileNumber}`,
                "send_template": params.templateId,
                "parameters": {
                    "document": `${params.docNo}`,
                    "year": `${params.regYear}`,
                    "sro_name":params.sroName,
                    "book_number":`${params.bookNo}`
                },
                "filepath": params.fileLink
            }
        };
        const finalResponse = await axios.post(config.url, config.data);
        if (finalResponse.data) {
            console.log(`document send notification - Whatsapp CC Copy || ${finalResponse.data?.status} bookNo=${params.bookNo} sroName=${params.sroName} doctNo=${params.docNo} mobileNumber=${params.mobileNumber}`)
        }

    } catch (ex) {
        console.error("document send notification - Whatsapp CC Copy || Error :", ex);
    }
}

    async function smsAfterCompleteDigitalSign(recorddata) {    
        try {                  
            let userName = recorddata.NAME;
            let appId = recorddata.APP_ID;
            let phoneNo = recorddata.PHONE_NO;
            
            let templateId = '1007397106788538016';
            let message= `Dear ${userName},Your application ${appId} for document registration has been completed with a digital signature and is ready for handover. Thank  You! -APIGRS`;
            
            phoneNo = phoneNo.toString();
            let data = { "phoneNos": phoneNo, "templateId": templateId, "smsMessage": message ,"statusName" :"Digital Sign" ,"appId": appId};
            
            const smsEndpoint = `${process.env.PDE_HOST}/pdeapi/v1/users/sendSMS`;                
            const headers = { 'Authorization': `Bearer ${process.env.SMS_API_TOKEN}`, 'Content-Type': 'application/json' };                    
            const response = await instance({ method: "POST", url: smsEndpoint, headers, data });
                
            if (response.data) {            
                return { success: true, data: response.data };
            } else {            
                return { success: false, error: "SMS API returned non-success response", response: response.data };
            }
        } catch (ex) {
            console.error("smsAfterCompleteDigitalSign || Error:", ex.message); 
            return { success: false, error: ex.message };
        }
    }

module.exports = { statusCheck, sendSMSNotification,whatsAppNotificationForEC, smsAfterCompleteDigitalSign };