const CARDError = require("../errors/customErrorClass");
const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const OrDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const { default: axios } = require("axios");
const Path = require('path');
const fs = require('fs');
const { exec } = require("child_process");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require("../utils");
const { getDataFromCache, addDataToCache } = require("../plugins/nodeCache/myCache");
const https = require('https');
const FTPClient = require('ftp');

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});


class DscServices {
    constructor() {
        this.orDao = new OrDao();

    }
    getDscToken = async () => {
        try {
            let token = await getDataFromCache("DSIGN_TOKEN");
            if (token != null) {
                return {
                    "isSuccess": true,
                    "errorCode": null,
                    "txnOutcome": token
                }
            }
            let data = {
                "UserName": "Admin",
                "Password": "*88taxpro"
            }
            let postResponse = await instance.post(`${process.env.SIGNER_DIGIRAL_URL}/AuthTokenV1/AuthToken`, data);
            await addDataToCache("DSIGN_TOKEN", postResponse.data.TxnOutcome, 36000);
            // return postResponse.data;
            return {
                "isSuccess": postResponse.data.IsSuccess,
                "errorCode": postResponse.data.ErrorCode,
                "txnOutcome": postResponse.data.TxnOutcome
            }
        } catch (ex) {
            console.error("DscServices - getDscToken || Error :", ex);

        }
    }


    signPdfSrvc = async (reqBody) => {
        try {

            let scannedDocumentFilePath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/scannedFinalDocument.pdf`);
            if (!fs.existsSync(scannedDocumentFilePath)) {
                throw new Error("Scanned File does not exit");
            }
            let fileDataBase64 = fs.readFileSync(scannedDocumentFilePath).toString('base64');

            // console.log("REQ DATA IS ", reqBody);
            // let seletFileData = `SELECT * from SCANUSER.IMG_BASE_CCA WHERE SRO_CODE=${reqBody.sroCode} AND BOOK_NO=${reqBody.bookNo} AND DOCT_NO=${reqBody.documentNo} AND REG_YEAR=${reqBody.registedYear}`;
            // let filDataResponse = await this.orDao.oDBQueryService(seletFileData);
            // if(filDataResponse.length == 0 || filDataResponse[0].IMAGE == null ) {
            //     throw new Error('Scanned File not exit')
            // }

            let signDigitalReqBody = {
                AppProfileName: "MySigningApp1",
                PdfData: fileDataBase64,
                SignSettingName: "Invoice Sign Token",
                SDHubConnectionIdFromBrowser: reqBody.connectionId,
                CertificateFromBrowser: JSON.parse(reqBody.CERTIFICATE).Cert.toString(),
                signatureSetting: {
                    "SignatureSource": "FromBrowser",
                    "ApplyCustomSignatureSize": true,
                    "CustomSignatureWidth": 100.0,
                    "CustomSignatureHeight": 37.0,
                    "PositionSettings": {
                        "SignOnPage": "AllPages",
                        "SignaturePosition": "BottomRight",
                        //"SignaturePosition": "AboveSearchText",
                        //"SearchText": "IGRSAPCR",
                        //"SearchText": "IGRSAPSIGN",
			"CustomPageNos": null,
                        "SignatureOffsetRight": 20.0,
                        "SignatureOffsetBottom": 50.0,
                        "SignatureOffsetLeft": 0.0,
                        "SignatureOffsetTop": 0.0,
                        "CustomPositionUpperX": 145.22244,
                        "CustomPositionUpperY": 61.68994,
                        "CustomPositionWidth": 0.0,
                        "CustomPositionHeight": 0.0
                    },
                    "ImageSettings": {
                        "CustomImagePosition": "BottomRight",
                        "CustomImage": null,
                        "CustomImageOffsetRight": 0.0,
                        "CustomImageOffsetBottom": 0.0,
                        "CustomImageOffsetLeft": 0.0,
                        "CustomImageOffsetTop": 0.0,
                        "ImageAsSignatureWatermark": false
                    },
                    "SignPageImageSettings": null,
                    "TextAppearenceSettings": {
                        "SignTextCNOnNewLine": false,
                        "OrganizationPrefix": "O: \\n",
                        "ShowOrganizationAsPerCertificate": false,
                        "StatePrefix": "S: ",
                        "ShowStateAsPerCertificate": false,
                        "PostalCodePrefix": "PostalCode: ",
                        "ShowPostalCodeAsPerCertificate": false,
                        "CountryPrefix": "C: ",
                        "ShowCountry": false,
                        "ReasonPrefix": "Reason: ",
                        "Reason": null,
                        "ShowReason": false,
                        "LocationPrefix": "Location: ",
                        "Location": null,
                        "ShowLocation": false,
                        "ContactPrefix": "Contact: ",
                        "Contact": null,
                        "ShowContact": false,
                        "DesignationPrefix": "Designation: ",
                        "Designation": null,
                        "ShowDesignation": false,
                        "SerialNoPrefix": "SERIALNUMBER: ",
                        "ShowCertificateSerialNo": false,
                        "CertificateIDPrefix": "Cid: ",
                        "ShowCertificateIDAsPerCertificate": false
                    },
                    "EnableValidationAppearance": true,
                    "DoNotDisplaySignatureText": false
                },
            }

            let tokenData = await this.getDscToken();

            let headers = {
                "Authorization": "Bearer " + tokenData.txnOutcome,
                "TxnId": "MyApp" + (Math.floor(Math.random() * 10000000000)).toString(),
                "AppVer": "1",
                "Content-Type": "application/json-patch+json"
            }

            console.log("CALLING SIGNER DIGITAL", new Date().toISOString());
            let signerDigtalResponse = await this.signerDigitalSignPdf(signDigitalReqBody, headers);

            console.log("DIGIRAL RESPONSE", new Date().toISOString());

            reqBody.signedFile = signerDigtalResponse.SignedFile;
            let fileOutputPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/${reqBody.sroCode}-${reqBody.bookNo}-${reqBody.registedYear}-${reqBody.documentNo}.pdf`);
            await fs.writeFileSync(fileOutputPath, signerDigtalResponse.SignedFile, { encoding: 'base64' });
            await this.uploadFile(reqBody);
            //await fs.unlinkSync(fileOutputPath);
            return "Success";

        } catch (ex) {
            console.error("DscServices - signPdfSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    uploadFile = async (reqBody) => {
        try {
            console.log("Before Uoloading top FileServer 1", new Date().toISOString());
            let filePath = await this.uploadFileToLinuxServer(reqBody, process.env.FILE_STORAGE_PATH);
            console.log("Before Uoloading top FileServer 2", new Date().toISOString());
            await this.uploadFileToLinuxServer(reqBody, process.env.BACKUP_FILE_STORAGE_PATH);
            console.log("After Uoloading top FileServer 2", new Date().toISOString());
            // ADD SIGNED DATE
            let updateFileDataQuery = `UPDATE SCANUSER.IMG_BASE_CCA SET SIGNEDBY = '${reqBody.signedBy}', LOCATION = '${filePath}', SIGNED = 'Y' WHERE SRO_CODE=${reqBody.sroCode} AND BOOK_NO=${reqBody.bookNo} AND DOCT_NO=${reqBody.documentNo} AND REG_YEAR=${reqBody.registedYear}`;
            console.log("QUERY IS ", updateFileDataQuery);
            await this.orDao.oDbUpdate(updateFileDataQuery);
            return "SUCCESS";
        } catch (error) {
            Logger.error("DscServices - uploadFile || Error :", error);
            console.error("DscServices - uploadFile || Error :", error);
            throw constructCARDError(error);
        }
    }

    // async uploadFileToLinuxServer(reqBody, filePath) {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let decrptedPassword = decryptWithAESPassPhrase(process.env.FILE_STORAGE_PASSWORD, process.env.FILE_STORAGE_ENCRYPTION_KEY);
    //             console.log("INSIDE REQBODY");
    //             let documentsFolderPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/`);
    //             await fs.writeFileSync(`${documentsFolderPath}${reqBody.sroCode}-${reqBody.bookNo}-${reqBody.registedYear}-${reqBody.documentNo}.pdf`, reqBody.signedfile, {encoding: 'base64'});
    //             exec(`sshpass -p ${decrptedPassword} ssh ${process.env.FILE_STORAGE_USERNAME}@${process.env.FILE_STORAGE_IP_ADDRESS} "mkdir -p ${filePath}${reqBody.sroCode}/BOOK${reqBody.bookNo}/${reqBody.registedYear}"`,  (error, stdout, stderr) => { 
    //                 if (error) {
    //                     console.log(`error: ${error.message}`);
    //                     throw error;
    //                 }
    //                 if (stderr) {
    //                     console.log(`stderr: ${stderr}`);
    //                     throw stderr
    //                 }
    //                 console.log("Directory Created SuccessFully");
    //                 exec(`sshpass -p ${decrptedPassword} scp ${documentsFolderPath}${reqBody.sroCode}-${reqBody.bookNo}-${reqBody.registedYear}-${reqBody.documentNo}.pdf ${process.env.FILE_STORAGE_USERNAME}@${process.env.FILE_STORAGE_IP_ADDRESS}:${filePath}${reqBody.sroCode}/BOOK${reqBody.bookNo}/${reqBody.registedYear}`, (error, stdout, stderr) => {
    //                     if (error) {
    //                         console.log(`error: ${error.message}`);
    //                         throw error;
    //                     }
    //                     if (stderr) {
    //                         console.log(`stderr: ${stderr}`);
    //                         throw stderr 
    //                     }
    //                     console.log("File Uploaded Succesfully")
    //                     return resolve(`${process.env.FILE_STORAGE_IP_ADDRESS}:${filePath}${reqBody.sroCode}/BOOK${reqBody.bookNo}/${reqBody.registedYear}`);
    //                 });
    //             });
    //         } catch (error) {
    //             Logger.error("DscServices - uploadFile || Error :", error);
    //             console.error("DscServices - uploadFile || Error :", error);
    //             return reject(error);
    //         }
    //     })
    // }

    async uploadFileToLinuxServer(reqBody, filePath) {
        return new Promise(async (resolve, reject) => {
            let ftp_client;
            try {
                ftp_client = new FTPClient();
                let decrptedPassword = decryptWithAESPassPhrase(process.env.FILE_STORAGE_PASSWORD, process.env.FILE_STORAGE_ENCRYPTION_KEY);
                let ftpConfig = {
                    host: process.env.FILE_STORAGE_IP_ADDRESS,
                    port: 22,
                    user: process.env.FILE_STORAGE_USERNAME,
                    password: decrptedPassword,
                }
                ftp_client.connect(ftpConfig);
                ftp_client.on('ready', async function () {
                    let fileOutputPath = Path.join(__dirname, `../../../../../pdfs/uploads/${reqBody.sroCode}/${reqBody.bookNo}/${reqBody.documentNo}/${reqBody.registedYear}/${reqBody.sroCode}-${reqBody.bookNo}-${reqBody.registedYear}-${reqBody.documentNo}.pdf`);
                    await ftp_client.mkdir(`${filePath}${reqBody.sroCode}/BOOK${reqBody.bookNo}/${reqBody.registedYear}`, function (err) { });
                    await ftp_client.cwd(`${filePath}${reqBody.sroCode}/BOOK${reqBody.bookNo}/${reqBody.registedYear}`, function (err) { });
                    await ftp_client.put(fileOutputPath, `${reqBody.sroCode}-${reqBody.bookNo}-${reqBody.registedYear}-${reqBody.documentNo}.pdf`, function (err) {
                        if (err) {
                            throw err;
                        }
                        return resolve(`${filePath}${reqBody.sroCode}/BOOK${reqBody.bookNo}/${reqBody.registedYear}/${reqBody.sroCode}-${reqBody.bookNo}-${reqBody.registedYear}-${reqBody.documentNo}.pdf`);
                    });
                });

            } catch (error) {
                console.log(error);
                reject(error);
            } finally {
                if (ftp_client != null)
                    ftp_client.end();
            }
        });
    }

    signerDigitalSignPdf = async (reqData, headers) => {
        try {
            const response = await instance.post(`${process.env.SIGNER_DIGIRAL_URL}/SignPdfV1/SignPdfWithSettingName`, reqData, {
                headers
            });
            return response.data;
        } catch (error) {
            console.log("ERROR WHILE CALLING SD DIGITAL HUB", error);
            throw constructCARDError(error);
        }
    }
}



module.exports = DscServices;
