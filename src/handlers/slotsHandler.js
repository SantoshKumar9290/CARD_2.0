const SlotServices = require('../services/slotsServices');
const { NAMES_STATUS_MAPPINGS, NAMES } = require("../constants/errors");
const { constructCARDError } = require("./errorHandler");
const { encryptWithAESPassPhrase, decryptWithAESPassPhrase } = require('../utils/index');
const os = require("os");
const moment = require('moment')
const {RO_LIST} = require('../constants/appConstants')

class SlotsHandler {
    constructor() {
        this.slotServices = new SlotServices();
    };


    getCheckSlotsDataHandler = async (req, res) => {
        try {
            let selectedDate = req.query.selectedDate ? moment(req.query.selectedDate, "YYYY-MM-DD").format("DD-MM-YY") : moment(new Date, "YYYY-MM-DD").format("DD-MM-YY");
            const requiredParams = {
                role: req.user.role,
                selectedDate: selectedDate,
            }
            switch (req.user.role) {
                case 'SRO':
                    requiredParams.sroCode = req.user.SRO_CODE;
                    break;
                case 'DR':
                    requiredParams.drCode = req.user.DR_CD;
                    break;
                case 'DIG':
                    requiredParams.digCode = req.query.digCode;
                    break;
            }
            const dataBaseResponse = await this.slotServices.getSlotsDataOfSROService({ ...requiredParams });
            const finalResponseArr = [];
                dataBaseResponse.map((slotObj) => {
                    const index = finalResponseArr.findIndex(sro => sro.sroCode === slotObj.SR_CD);
                    if (index === -1) {
                      const responseObj = {
                        sroCode: slotObj.SR_CD,
                        sroName: slotObj.SR_NAME,
                        totalSlots: [731].includes(slotObj.SR_CD) ? 156 : (RO_LIST.includes(slotObj.SR_CD) ? 78 : 39),
                        bookedSlots:  slotObj.STATUS?1:0 ,
                        verifiedSlots: slotObj.STATUS === 'VERIFIED' ? 1 : 0,
                        availbleSlots: [731].includes(slotObj.SR_CD) ? (slotObj.STATUS ? 155 : 156) : (RO_LIST.includes(slotObj.SR_CD) ?
                          (slotObj.STATUS ? 77 : 78) : (slotObj.STATUS ? 38 : 39)),
                      }
                      responseObj.verifiacationMissedSlots = responseObj.bookedSlots - responseObj.verifiedSlots
                      finalResponseArr.push(responseObj);
                    }
                    else {
                      finalResponseArr[index].bookedSlots += 1;
                      finalResponseArr[index].availbleSlots -= 1;
                      finalResponseArr[index].verifiacationMissedSlots+=1
                      if (slotObj.STATUS === 'VERIFIED') {
                        finalResponseArr[index].verifiedSlots += 1;
                        finalResponseArr[index].verifiacationMissedSlots -= 1;
                      }
                    }
                })
            let responseData = {
                status: true,
                message: "Success",
                code: "200",
                data: finalResponseArr
            };
            res.status(200).send({ ...responseData });
        } catch (ex) {
            console.error("Slots Dashboard Data  || Error :", ex);
            const cardError = constructCARDError(ex);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send(
                {
                    status: false,
                    message: cardError.message
                }
            );
        }
    }

    increaseSlotSize = async (req, res) => {
        const reqData = req.body;
        try {
            if (!Array.isArray(reqData) || reqData.length === 0) {
                throw new Error("Bad request.");
            }

            reqData.forEach((item, index) => {
                if (
                    !item.sroName ||
                    !item.sroCode ||
                    !item.slotSize ||
                    !item.fromDate ||
                    !item.toDate
                ) {
                    throw new Error("Bad request.");
                }

                const fromDate = new Date(item.fromDate);
                const toDate = new Date(item.toDate);

                const tomorrow = new Date();
                tomorrow.setHours(0, 0, 0, 0);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const maxToDate = new Date(fromDate);
                maxToDate.setMonth(maxToDate.getMonth() + 3);
                
                if (fromDate < tomorrow || toDate < fromDate || toDate > maxToDate || Number(item.slotSize) > 99) {
                    throw new Error("Bad request.");
                }
            });
            const response = await this.slotServices.setIncreaseSlotSize(reqData);
            res.send(response);
        } catch (err) {
            console.error("slotHandler - increaseSlotSize || Error :", err?.message);
            const cardError = constructCARDError(err);
            return res.status(NAMES_STATUS_MAPPINGS[cardError.name]).send({
                status: false,
                message: cardError.message,
            });
        }
    };

    srSlotDetails = async (req, res)=>{
		const reqBody = req.body;
		if (!reqBody || !reqBody.distCode) {
			throw new Error("Provide Correct Data");
		}
		try {
			const response = await this.slotServices.getSRSlotDetails(reqBody);
			res.send(response);
		} catch(err){
			console.error("SlotHandler - srSlotDetails || Error :", err.message);
            var pdeError = constructCARDError(err);
            return res.status(NAMES_STATUS_MAPPINGS[pdeError.name]).send(
                {
                    status: false,
                    message: NAMES.INTERNAL_SERVER_ERROR
                }
            );
		}
	}

}
module.exports = SlotsHandler;