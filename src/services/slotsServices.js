const CARDError = require("../errors/customErrorClass");
const OrDao = require('../dao/oracledbDao');
const { Logger } = require('../../services/winston');
const axios = require('axios');
const https = require('https');

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

class SlotsServices {
	constructor(){
		this.orDao = new OrDao();
	}
    getSlotsDataOfSROService  = async(paramsObj) =>{
        try{
            let query='';
            const bindParamObj={
                selectedDate:paramsObj.selectedDate
            }
            if(paramsObj.role==='SRO'){
                bindParamObj.sroCode=paramsObj.sroCode;
                query = `SELECT sm.sr_cd,sd.date_of_slot,sd.status,sd.slot,sm.sr_name From preregistration.slot_details sd join sr_master sm on sm.sr_cd=sd.sr_code where sr_code=:sroCode and date_of_slot=TO_DATE(:selectedDate, 'DD-MM-YY')`
            }
            if(paramsObj.role==='DR'){
                bindParamObj.drCode=paramsObj.drCode;
                query=` SELECT 
                dm.dr_name,
                sm.sr_cd, 
                sm.sr_name, 
                sd.date_of_slot, 
                sd.status, 
                sd.slot 
                FROM dr_master dm
                JOIN sr_master sm ON dm.dr_cd = sm.dr_cd
                LEFT JOIN preregistration.slot_details sd 
                ON sm.sr_cd = sd.sr_code 
                AND TO_CHAR(sd.date_of_slot, 'DD-MM-YY') = :selectedDate
                WHERE dm.dr_cd = :drCode`
            }
            if(paramsObj.role==='DIG'){
                bindParamObj.digCode=paramsObj.digCode;
                query=`SELECT 
                dm.dig_name,
                sm.sr_cd, 
                sm.sr_name, 
                sd.date_of_slot, 
                sd.status, 
                sd.slot 
                FROM dig_master dm
                JOIN sr_master sm ON dm.dig_cd = sm.dig_cd
                LEFT JOIN preregistration.slot_details sd 
                ON sm.sr_cd = sd.sr_code 
                AND TO_CHAR(sd.date_of_slot, 'DD-MM-YY') =:selectedDate
                WHERE dm.dig_cd = :digCode`
            }
            const response = this.orDao.oDBQueryServiceWithBindParams(query,bindParamObj)           
			return response;
		}catch(ex){
			Logger.error("SlotsHandler - getDashboardData || Error :", ex);
			console.error("SlotsHandler - getDashboardData || Error :", ex);
			throw new CARDError(ex);
		}
    }
	
	setIncreaseSlotSize = async (reqBody) => {
        try {
            let config = {
            method: 'post',
            url: `${process.env.SB_HOST}/CARD/slotSizeUpdate`,
            headers: {'Content-Type': 'application/json'},
            data: reqBody
            };
            const response = await instance.request(config);
            console.log('response::::WEB', response)
            return response.data;
        } catch (error) {
            Logger.error("slotServices - setIncreaseSlotSize || Error:", error?.response?.data?.message);
            throw new Error(error?.response?.data?.message);
        }
    };

    getSRSlotDetails= async (reqBody) => {
        try {
            let config = {
                method: 'post',
                url: `${process.env.SB_HOST}/CARD/srSlotDetails`,
                headers: {'Content-Type': 'application/json'},
                data: reqBody
            };
            const response = await instance.request(config);
            return response.data;
        } catch(err){
            console.log('err', err);
            Logger.error(err.message)
            console.error("SlotService - getSRSlotDetails || Error : ", err.message);
            throw constructCARDError(err);
        }
    }

};


module.exports = SlotsServices;