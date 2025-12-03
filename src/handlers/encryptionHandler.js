const { decryptData, encryptData,encryptWithAESPassPhrase } = require('../utils/index');
const { constructCARDError } = require("./errorHandler");
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const CryptoJs = require('crypto-js');

class EncryptionHandler {

     constructor() { };

    decryptGivenValue = async (req, res) => {
        try {
            if(req.params.id == undefined || req.params.id == null || req.params.id.trim().length == 0 ){
                return res.status(400).send(
                {
                    status: false,
                    message: "Bad Request"
                });
            }
            
            console.log("before decryption ::::: ", req.params.id);
            let decryptedData = Buffer.from(req.params.id, 'base64').toString('utf-8');
            decryptedData = decryptData(decryptedData);
            console.log("after decryption ::::: ", decryptedData);
           
            return res.status(200).send(
            {
                status: false,
                message: "Success",
                data: decryptedData
            });

        } catch (ex) {
            console.error("EncryptionHandler - decryptGivenValue || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    encryptGivenValue = async (req, res) => {
        try {
            if(req.params.id == undefined || req.params.id == null || req.params.id.trim().length == 0 ){
                return res.status(400).send(
                {
                    status: false,
                    message: "Bad Request"
                });
            }

            console.log("before encryption ::::: ", req.params.id);
            let encryptedData = encryptData(req.params.id);
            encryptedData = Buffer.from(encryptedData).toString('base64');
            console.log("after encryption ::::: ", encryptedData);
            return res.status(200).send(
            {
                status: false,
                message: "Success",
                data: encryptedData
            });

        } catch (ex) {
            console.error("EncryptionHandler - encryptGivenValue || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }


       encryptPasswordValue = async (req, res) => {
        try {
            if(req.params.password == undefined || req.params.password == null || req.params.password.trim().length == 0 ){
                return res.status(400).send(
                {
                    status: false,
                    message: "Bad Request"
                });
            }

            console.log("before encryption ::::: ", req.params.password);
            let encryptedData = encryptWithAESPassPhrase(req.params.password, process.env.HASH_ENCRYPTION_KEY);
            console.log("after encryption ::::: ", encryptedData);
            return res.status(200).send(
            {
                status: false,
                message: "Success",
                data: encryptedData
            });

        } catch (ex) {
            console.error("EncryptionHandler - encryptGivenValue || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

}

module.exports = EncryptionHandler;