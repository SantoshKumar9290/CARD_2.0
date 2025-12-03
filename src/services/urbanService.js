const { set } = require("lodash");
const { NAMES } = require("../constants/errors");
const CARDError = require("../errors/customErrorClass");
const { constructCARDError } = require("../handlers/errorHandler");
const axios = require('axios');
const { Logger } = require('../../services/winston');
const OrDao = require('../dao/oracledbDao');
const { cdmaAPIs, cdmaHostURL } = require("../constants/CDMAConstants");
class urbanService {
    constructor() {
        this.orDao = new OrDao();
    }

    getUlbCodeOfMuncipality = async (scheduleDetails) => {
        try {
            let query = `select a.* ,b.*, b.ulb_code as muni_code from sromstr.hab_match a
                        join sromstr.hab_ulb b on a.webland_code=b.village_code where a.hab_code=:villageCode and rownum=1`;
            let details = await this.orDao.oDBQueryServiceWithBindParams(query, { villageCode:scheduleDetails.HAB_CODE });
            return details
        } catch (error) {
            Logger.error(error.message);
            console.error("Urban Service - get Ulb Service || Error :", error.message);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    generateUrbanToken = async (ulbCOde) => {
        try {
            let data = new FormData();
            data.append('grant_type', 'password');
            data.append('username', process.env.URBAN_USERNAME);
            data.append('password', process.env.URBAN_PASSWORD);
            const credentials = `${process.env.URBAN_AUTH_USERNAME}:${process.env.URBAN_AUTH_PASSWORD}`;
            const base64Credentials = Buffer.from(credentials).toString('base64');
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: process.env.URBAN_BASE_URL + '/oauth/token?ulbCode=' + ulbCOde,
                headers: {
                    'Referer': `${process.env.URBAN_SERVER_IP}`,
                    'Authorization': `Basic ${base64Credentials}`,
                },
                data: data
            };
            let response = await axios.request(config);
            return response.data

        } catch (ex) {
            return ex.message
        }
    }


    generateAssessment = async (reqData) => {
        try {
            const paramsObj = {
                ulbCode: reqData.ulbCode,
                propertyDetails: {
                    ulbCode: reqData.ulbCode,
                    ownershipCategory: "Private",
                    propertyType: "Residential",
                    apartmentName: "",
                    extensionOfSite: 220
                },
                ownerDetails: [
                    {
                        aadhaarNumber: "",
                        mobileNumber: "9090909090",
                        ownerName: "TestUser",
                        gender: "MALE",
                        emailAddress: "",
                        guardianRelation: "Father",
                        guardian: "Tt"
                    }
                ],
                propertyAddress: {
                    electionWardNo: "441",
                    wardSecretariat: "2",
                    northBoundary: "N",
                    eastBoundary: "E",
                    westBoundary: "W",
                    southBoundary: "S"
                },
                igrsDetails: {
                    sroCode: "",
                    sroName: "",
                    igrsWard: "Ward 0",
                    igrsLocality: "HOUSE SITE",
                    igrsBlock: "Block 0",
                    habitation: "MUTYALAMPADU",
                    igrsDoorNoFrom: "",
                    igrsDoorNoTo: ""
                },
                floorDetails: [
                    {
                        floorNumber: "0",
                        classificationOfBuilding: "RCC",
                        igrsClassification: "RES",
                        firmName: "MS",
                        plinthArea: "160"
                    }
                ],
                vltDetails: {
                    surveyNumber: "",
                    vacantLandArea: "",
                    igrsClassification: "",
                    currentMarketValue: null,
                    registeredDocumentValue: null
                },
                registeredDocumentLink: "https://igrs.gov/sampledoc",
                mutationType: "unassessed_full_mutation"
            };
            console.log('before urban token')
            let token = await this.generateUrbanToken(reqData.ulbCode)
            console.log('after urban token', token)

            if (typeof token !== 'string') {
                token = token.access_token;

                const url = `${cdmaHostURL}${cdmaAPIs.createAssessment}`

                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${cdmaHostURL}${cdmaAPIs.createAssessment}`,
                    headers: {
                        'Referer': `${process.env.URBAN_SERVER_IP}`,
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,

                    },
                    data: paramsObj
                };

                console.log(config, "configuration @@@@@@@@@@")

                const assDetResponse = await axios(config)
                console.log(assDetResponse, "asssss")
                if (assDetResponse.status == 200)
                    return assDetResponse.data;
                else {
                    return {};
                }
            } else {
                throw `CDMA Token Generation Failed. ${token}`
            }
        } catch (error) {
            console.error("Urban service - generateAssessment || Error :", error.message?error.message:error);
            // const cardError = constructCARDError(error);
            throw error;
        }
    }
}
module.exports = urbanService