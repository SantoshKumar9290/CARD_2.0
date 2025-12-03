const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const axios=require('axios');
const UrbanService = require("../services/urbanService");
const CARDError = require("../errors/customErrorClass");
const { constructCARDError } = require("./errorHandler");
const  {cdmaAPIs,cdmaHostURL}= require('../constants/CDMAConstants')

class urbanHandler {

    constructor(){
        this.urbanService = new UrbanService();
    }

    // generateNewAssessment = async (req, res) => {
    //     const requiredParams = {
    //         sroCode: 'string',
    //         ulbCode: 'string',
    //         ownershipCategory: 'Private',
    //         propertyType: 'string',
    //         extensionOfSite: 'number',
    //         ownerDetails: 'object',
    //         northBoundary: 'string',
    //         eastBoundary: 'string',
    //         southBoundary: 'string',
    //         westBoundary: 'string',
    //         igrsWard: 'string',
    //         igrsLocality: 'string',
    //         igrsBlock: 'string',
    //         habitation: 'string',
    //         floorDetails: 'object',
    //         vltDetails: 'object',
    //         vacantLandArea: 'string',
    //         currentMarketValue: 'number',
    //         registeredDocumentLink: 'string',
    //     }
    //     const params={
    //         sroCode:627,
    //     }
    //     for(let key in params){
    //         if(!req.body[key]){
    //             return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
    //                 {
    //                     status: false,
    //                     message: `${NAMES.VALIDATION_ERROR} ${key}`
    //                 }
    //             )
    //         }
    //     }
    //     try {
    //         const ulbData = await this.urbanService.getUlbCodeOfMuncipality(req.body.sroCode)
    //         console.log(ulbData);
    //         if (ulbData.length < 1) {
    //             return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
    //                 {
    //                     status: false,
    //                     message: `Ulb Code not available`
    //                 }
    //             );
    //         }
           
    //     const cdmaResponse = await this.urbanService.generateAssessment({...req.body,ulbCode:ulbData[0].MUNI_CODE});
    //     if(cdmaResponse){

    //     }else{
    //         return res.status(NAMES_STATUS_MAPPINGS[NAMES.EXTERNAL_REQUEST_ERROR]).json({
    //             status:false,
    //             message:NAMES.EXTERNAL_REQUEST_ERROR
    //         })
    //     }
    //     } catch (error) {
    //         console.error("UrbanHandler - generate New Assessment || Error :", error?.message);
    //         // const cardError = constructCARDError(error);
    //         return res.status(NAMES_STATUS_MAPPINGS[NAMES.EXTERNAL_REQUEST_ERROR]).send(
    //             {
    //                 status: false,
    //                 message: error.message?error.message:error
    //             }
    //         );
    //     }


    // }

    // searchAssessmentNumberByDoorNumber = async (req,res) =>{
    //     const requiredParams = {
    //         sroCode:req.query.sroCode,
    //         doorNo:req.query.doorNo
    //     }       
    //     for(let key in requiredParams){
    //         if(!requiredParams[key]){
    //             return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).send(
    //                 {
    //                     status: false,
    //                     message: NAMES.VALIDATION_ERROR
    //                 }
    //             );
    //         }
    //     }
    //     const ulbData = await this.urbanService.getUlbCodeOfMuncipality(req.query.sroCode)
    //     if (ulbData.length < 1 || !(ulbData[0].MUNI_CODE)) {
    //         return res.status(NAMES_STATUS_MAPPINGS[NAMES.VALIDATION_ERROR]).json(
    //             {
    //                 status: false,
    //                 message: `Ulb Code not available`
    //             }
    //         );
    //     }
    //     requiredParams['ulbCode'] = (ulbData[0].MUNI_CODE)
    //     const data=JSON.stringify(requiredParams)       
    //     try{
    //         let token = await this.VillageServices.UrbanTokenGeneration({flag:1, ulbCode:requiredParams.ulbCode})
    //         console.log("token after call", token)
    //         if(typeof token !== 'string'){
    //             token = token.access_token
    //             let config = {
    //                 method: 'post',
    //                 maxBodyLength: Infinity,
    //                 url: `${cdmaHostURL}${cdmaAPIs.searchByDoorNumber}`,
    //                 headers: {
    //                     'Referer': `${process.env.URBAN_SERVER_IP}`,
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`,
    //                 },
    //                 data: data
    //             };
    //             let response = await axios.request(config);
    //             if (response?.data) {
    //                 let finalResponse = [];
    //                 if (response?.data.length > 0) {
    //                     finalResponse = response.data.filter(obj=>obj.houseNo && obj.houseNo!="N/A")
    //                 }
    //                 return res.status(200).send({
    //                     status: true,
    //                     message: "Success",
    //                     code: "200",
    //                     data: finalResponse, // This will be an array or object — your frontend must handle it accordingly
    //                 });
    //         }else {
    //             return res.status(404).json({
    //                 status: true,
    //                 message: "No data found",
    //                 data: [],
    //             });
    //         }
    //         }else{
    //             return res.status(400).json(`Token Generation failed, ${token}`)
    //         }
    //     }catch(ex) {
    //         if (req.flag) {
    //             return ex.message
    //         } else {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: ex.message
    //             })
    //         }
    //     }
    // }

}

module.exports = urbanHandler;