const EmployeeServices = require('../services/employeeServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const jwt = require('jsonwebtoken')
const config = require('../config/config.json');
const {encryptWithAESPassPhrase, decryptWithAESPassPhrase} = require('../utils/index');
const odbDao = require('../dao/oracledbDao');
const {Logger} = require('../../services/winston');
 
class EmployeeHandlder {
    constructor() {
        this.employeeServices = new EmployeeServices();
        this.odbDao = new odbDao();
    };
    getEmployees = async (req, res) => {
        const qParams = req.query;
        if (qParams.srCode == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getEmpSrvc(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmployees || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getAvailableSros = async (req, res) => {
        const qParams = req.query;
        if (qParams.srCode == null || qParams.fromDate == null || qParams.toDate == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getAvailableSros(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getAvailableSros || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getAssignedSros = async (req, res) => {
        const qParams = req.query;
        if (qParams.srCode == null || qParams.fromDate == null || qParams.toDate == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getAssignedSros(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getAssignedSros || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getDRList = async (req, res) => {
        try {
            let response = await this.employeeServices.getDRSrvc();
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getDRList || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getEmployeesDR = async (req, res) => {
        const qParams = req.query;
        if (qParams.dR == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getEmployeesDRSrvc(qParams);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "DR Not Found",
                    code: "404"
                })
                return;
            }
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmployeesDR || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getEmployeesCIG = async (req, res) => {
        try {
            let response = await this.employeeServices.getEmployeesCIGSrvc();
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "CIG Not Found",
                    code: "404"
                })
                return;
            }
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmployeesCIG || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getEmployeesSR = async (req, res) => {
        const qParams = req.query;
        if (qParams.dR == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getEmployeesSRSrvc(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmployees || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getVSWSList = async (req, res) => {
        const qParams = req.query;
        if (qParams.srCode == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getVSWSSrvc(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmployees || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getVSWSMList = async (req, res) => {
        const qParams = req.query;
        if (qParams.vill_code == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getVSWSMListSrvc(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmployees || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    empTransaction = async (req, res) => {
        const reqBody = req.body;
        try {
            await this.employeeServices.empTransactionSrvc(reqBody);
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EmployeeHandler - empTransaction || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getEmpUser = async (req, res) => {
        const qParams = req.query;
        if (qParams.EMPL_ID == null || qParams.SR_CODE == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getEmpUserSrvc(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmpUser || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    getEmpRoles = async (req, res) => {
        const qParams = req.query;
        if (qParams.LOGIN_NAME == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getEmpRolesSrvc(qParams);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "Login Name Not Found",
                    code: "404"
                })
                return;
            }
                let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EmployeeHandler - getEmpRoles || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    empCreation = async (req, res) => {
        const reqBody = req.body;
        try {
            let result = await this.employeeServices.empCreationSrvc(reqBody);
            if(result === false){
                return res.status(403).send({
                    status: false,
                    message: "Employee already present with this employee id. Please provide new employee id"
                })
            } else {
                let responseData =  {
                    status: true,
                    message: "Success",
                    code: "200",
                };
                // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
                // responseData.hash = hash;
                res.status(200).send({...responseData});
                return result;
            }
        } catch (ex) {
            console.error("EmployeeHandler - empCreation || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    updCreation = async (req, res) => {
        const reqBody = req.body;
        try {
            if(!reqBody.SR_CODE){
                return res.status(400).send({
                    status: false,
                    message: "Invalid request"
                })
            }
            let result = await this.employeeServices.updCreationSrvc(reqBody);
            let responseData ={
                status: true,
                message: "Success",
                code: "200",
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
            return result;
        } catch (ex) {
            console.error("EmployeeHandler - updCreation || Error :", ex);
            let cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getVSWSAssign = async (req, res) => {
        const qParams = req.query;
        if (qParams.SR_CODE == null || qParams.VSWS_CODE == null ) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getVSWSAssignSrvc(qParams);
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "Data Not Found",
                    code: "404"
                })
                return;
            }
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getVSWSAssign || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    saveVSWSAssign = async (req, res) => {
        const reqQuery = req.body;
        try {
            let response = await this.employeeServices.saveVSWSAssignSrvc(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
return response;
        } catch (ex) {
            console.error("EmployeeHandler - saveVSWSAssign || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    vswsSroAssignNo = async (req, res) => {
        const reqQuery = req.body;
        try {
            let response = await this.employeeServices.vswsSroAssignSrvc(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
return response;
        } catch (ex) {
            console.error("EmployeeHandler - vswsSroAssignNo || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    empUserSave = async (req, res) => {
        const reqQuery = req.body;
        try {
            let response = await this.employeeServices.empUserSaveSrvc(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - empUserSave || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    deleteAT = async (req, res) => {
        const reqQuery = req.query;
        if (reqQuery?.AGENCY_NAME == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }    
        try {
            
            let response = await this.employeeServices.deleteAGT(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - empUserSave || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getSRMaster = async (req, res) => {
        const qParams = req.query;
        if (qParams.sr_cd == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getSRMasterSrvc(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmpAccess || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    saveAssignSR = async (req, res) => {
        const reqBody = req.body;
        try {
            let response = await this.employeeServices.saveAssignSRSrvc(reqBody);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EmployeeHandler - saveAssignSR || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    login = async (req, res) => {
        const userData = req.body;
        if (!userData.EMPL_Data || !userData.EMPL_ID || !userData.EMPL_NAME || !userData.SR_NAME || !userData.role) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.BAD_REQUEST]).send(
                {
                    status: false,
                    message: NAMES.BAD_REQUEST
                }
            );
            return;
        }
        try {
            let resp = await this.employeeServices.login(userData);
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: resp
                }
            );
 
        } catch (ex) {
            console.error("AuthHandler - login || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    generateToken = async (req, res) => {
        const body = req.body;
        if (!body.refresh_token) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.BAD_REQUEST]).send(
                {
                    status: false,
                    message: NAMES.BAD_REQUEST
                }
            );
            return;
        } else if (!(body.refresh_token in refreshTokensList)) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.UNAUTHORIZED]).send(
                {
                    status: false,
                    message: NAMES.UNAUTHORIZED
                }
            );
            return;
        }
 
        try {
            let userData = jwt.verify(body.refresh_token, config.refreshTokenSecret);
            delete userData.iat;
            delete userData.exp;
 
            const token = jwt.sign(userData, config.secret, { expiresIn: config.tokenLife });
            const refreshToken = jwt.sign(userData, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife });
            const response = {
                "access_token": token,
                "refresh_token": refreshToken,
            }
            refreshTokensList[refreshToken] = response;
            res.status(200).send(
                {
                    status: true,
                    message: "Success",
                    code: "200",
                    data: response
                }
            );
        } catch (ex) {
            console.error("AuthHandler - login || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    loginWithPassword = async (req, res) => {
        try {
            let body = req.body;
            Logger.info(`login req body ===> ${JSON.stringify(body)}`);
            if(!body.EMPL_ID || !body.PASSWRD || !body.SRO_CODE){
                res.status(NAMES_STATUS_MAPPINGS[NAMES.BAD_REQUEST]).send(
                    {
                        status: false,
                        message: NAMES.BAD_REQUEST
                    }
                );
                return;
            } else {
                body.PASSWRD = decryptWithAESPassPhrase(body.PASSWRD, process.env.HASH_ENCRYPTION_KEY);
                let query = `SELECT * FROM employee_login_master WHERE PASSWRD='${body.PASSWRD}' and SR_CODE = ${body.SRO_CODE} and EMPL_ID = ${body.EMPL_ID}`;
                let result = await this.odbDao.oDBQueryService(query);
                if(result.length && result[0].PASSWRD == body.PASSWRD){
                    let response = await this.employeeServices.login(req.body);
                    res.status(200).send(
                        {
                            status: true,
                            message: "Success",
                            code: "200",
                            data: response
                        }
                    );
                    return;
                } else {
                    Logger.error(`login failed for req body  with this error ===>`, req.body);
                    return res.status(404).send({
                        status: false,
                        message: "Invalid User/Password. Please try again."
                    })
                }
            }
        } catch (ex) {
            console.error("AuthHandler - loginWithPassword || Error :", ex);
            Logger.error("AuthHandler - loginWithPassword || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 
    updatePassword = async(req, res) => {
        try {
            let body = req.body;
            if(!body.PASSWRD){
                res.status(NAMES_STATUS_MAPPINGS[NAMES.BAD_REQUEST]).send(
                    {
                        status: false,
                        message: NAMES.BAD_REQUEST
                    }
                );
                return;
            } else {
                body.PASSWRD = decryptWithAESPassPhrase(body.PASSWRD, process.env.HASH_ENCRYPTION_KEY);
                let query = `SELECT * FROM employee_login_master WHERE SR_CODE = ${body.SRO_CODE} and EMPL_ID = ${body.EMPL_ID}`;
                let result = await this.odbDao.oDBQueryService(query);
                if(result.length){
                    if(result[0].PASSWRD == body.PASSWRD){
                        return res.status(400).send({
                            status: false,
                            message: "New password should not be same as old password. Please try another."
                        })
                    } else if(!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(body.PASSWRD))){
                        return res.status(400).send({
                            status: false,
                            message: "Please enter a valid and strong password"
                        })
                    } else {
                        let q = `UPDATE card.employee_login_master set PASSWRD='${body.PASSWRD}' WHERE SR_CODE = ${body.SRO_CODE} and EMPL_ID = ${body.EMPL_ID}`;
                        let response = await this.odbDao.oDbUpdate(q);
                        return res.status(200).send({
                            status: true,
                            message: "Password Updated Successfully. Please login again."
                        })
                    }
                } else {
                    return res.status(404).send({
                        status: false,
                        message: "Employee not found"
                    })
                }
            }
        } catch (ex) {
            console.error("AuthHandler - UpdatePassword || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    updateSRO = async (req, res) => {
        const reqQuery = req.body;
        if(reqQuery?.empId == null ){
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        };    
        try {
            let response = await this.employeeServices.updateSRO(reqQuery);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
          

            res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EmployeeHandler - updateSRO || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    deptLogin = async (req, res) => {
        const reqBody = req.body;
        try {
            let response = await this.employeeServices.deptLoginSrvc(reqBody);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
			responseData.hash = hash;
            res.status(200).send({...responseData});
        } catch (ex) {
            console.error("EmployeeHandler - deptLogin || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
 

    getDeptLogin = async (req, res) => {
        const qParams = req.query;
        try {
            let response = await this.employeeServices.getDeptSrvc(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getDeptLogin || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }
    getEmployeesNODAL = async (req, res) => {
        try {
            let response = await this.employeeServices.getEmployeesNODALSrvc();
            if (response.length === 0) {
                res.status(404).send({
                    status: false,
                    message: "CIG Not Found",
                    code: "404"
                })
                return;
            }
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            // let hash = encryptWithAESPassPhrase(JSON.stringify(responseData), process.env.HASH_ENCRYPTION_KEY);
            // responseData.hash = hash;
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmployeesCIG || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getEmployeesAll = async (req, res) => {
        try {
            let response = await this.employeeServices.getEmployeesAllSro();
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getEmployeesAll || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    getSrosDR = async (req, res) => {
        const qParams = req.query;
        if (qParams.dR == null) {
            res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
                {
                    status: false,
                    message: NAMES.VALIDATION_ERROR
                }
            );
            return;
        }
        try {
            let response = await this.employeeServices.getSroDR(qParams);
            let responseData = {
                status:true,
                message: "Success",
                code: "200",
                data: response
            };
            res.status(200).send({...responseData});
 
        } catch (ex) {
            console.error("EmployeeHandler - getSrosDR || Error :", ex);
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
module.exports = EmployeeHandlder;
 
 
 
 
 
 