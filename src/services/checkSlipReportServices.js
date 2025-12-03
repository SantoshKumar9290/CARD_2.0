const { doRelease, dbConfig } = require('../plugins/database/oracleDbServices');
const odbDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');
const axios = require('axios');
const https = require('https');

const instance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false
	})
});

class checkSlipReportServices {
    constructor() {
        this.odbDao = new odbDao();
    }

    getCheckSlipReportsSrvc =   async (reqData) => {
        try {      
            const isRdoc = reqData.rDoc ? `rdoct_no=${reqData.rDoc}` : `doct_no=${reqData.docNo}`;
            const linkRDoc = reqData.rDoc ? `r_doctno=${reqData.rDoc}` : `c_doctno=${reqData.docNo}`;
            let docqurie = reqData.rDoc ? `and doct_no=(select doct_no from srouser.tran_major where sr_code=${reqData.srCode} and RDOCT_NO=${reqData.rDoc} and book_no=${reqData.bookNo} and reg_year=${reqData.regYear})`: `and doct_no=${reqData.docNo}`
            let queries = [
                {
                    type: 'docDetails',
                    query: `select a.*,(select sr_name from sr_master where sr_cd = a.sr_code) srname,
                    to_char(p_date,'dd/mm/yyyy') p_date1,to_char(e_date,'dd/mm/yyyy') e_date1, (select tran_desc from tran_dir where tran_maj_code = a.tran_maj_code and tran_min_code = a.tran_min_code and rownum = 1) as tran_desc from srouser.tran_major a where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear}`
                },
                {
                    type: 'partyDetails',
                    query: reqData.flag ? `select a.*,b.* from srouser.tran_ec a,srouser.tran_ec_aadhar_esign b where a.sr_code=${reqData.srCode} and a.book_no=${reqData.bookNo} and a.reg_year=${reqData.regYear} and a.doct_no=${reqData.docNo}
                    and a.sr_code=b.sr_code and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.book_no=b.book_no and a.code=substr(b.code,1,2) and 
                    a.ec_number=b.ec_number`: `select * from srouser.tran_ec  a 
                    left join srouser.tran_ec_aadhar_esign b on  a.sr_code=b.sr_code and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.book_no=b.book_no and a.code=substr(b.code,1,2) and
                    a.ec_number=b.ec_number where a.sr_code=${reqData.srCode} and a.book_no=${reqData.bookNo} and a.reg_year=${reqData.regYear} and a.${isRdoc}`
                },
                {
                    type: 'representative',
                    query: `select * from srouser.tran_ec_firms  a 
                    left join srouser.tran_ec_aadhar_esign b on  a.sr_code=b.sr_code and a.doct_no=b.doct_no and a.reg_year=b.reg_year and a.book_no=b.book_no and a.code=substr(b.code,1,2) and
                    a.ec_number=b.ec_number  where a.sr_code=${reqData.srCode} and a.book_no=${reqData.bookNo} and a.${isRdoc} and a.reg_year=${reqData.regYear}`
                },
                // {
                //     type: 'schedule',
                //     query: reqData.flag ? `SELECT  A.*,B.*,(SELECT LOCAL_BODY_DESC FROM local_body_dir i where i.LOCAL_BODY_CODE=A.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE , (SELECT LOCAL_BODY_NAME FROM hab_local_body j where j.HAB_CODE=A.HAB_CODE AND ROWNUM = 1 ) AS LOCAL_BODY_NAME,(SELECT VILLAGE_NAME FROM HAB_CODE WHERE HAB_CODE=A.VILLAGE_CODE||'01') VILLAGENAME,
                //     (SELECT CLASS_DESC FROM AREA_CLASS WHERE NATURE_USE=CLASS_CODE) LANDUSE FROM SROUSER.TRAN_SCHED A,  
                //     SROUSER.ADANGAL_DETAILS  B
                //     WHERE A.SR_CODE=B.SR_CODE(+)
                //     AND A.BOOK_NO=B.BOOK_NO(+)
                //     AND A.DOCT_NO=B.DOCT_NO(+)
                //     AND A.REG_YEAR=B.REG_YEAR(+)
                //     AND A.schedule_no=B.schedule_no(+)
                //     AND A.SR_CODE=${reqData.srCode} AND A.BOOK_NO=${reqData.bookNo} AND A.${isRdoc} AND A.REG_YEAR=${reqData.regYear} and B.S_LP_NO is not null` : `select  a.*,(SELECT LOCAL_BODY_DESC FROM local_body_dir i where i.LOCAL_BODY_CODE=a.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE , (SELECT LOCAL_BODY_NAME FROM hab_local_body j where j.HAB_CODE=a.HAB_CODE AND ROWNUM = 1 ) AS LOCAL_BODY_NAME,(select village_name from hab_code where hab_code=a.village_code||'01') villagename,(select class_desc from area_class where nature_use=class_code) landuse from srouser.tran_sched a where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear}`
                // },
                {
                    type: 'structure',
                    query: `select * from srouser.stru_det where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear}`
                },
                {
                    type: 'linkDocuments',
                    query: `select a.*,b.sr_name from srouser.recti a,sr_master b where a.l_srcd=b.sr_cd and c_srcd=${reqData.srCode} and c_bno=${reqData.bookNo} and ${linkRDoc} and c_regyear=${reqData.regYear}`
                },
                {
                    type: 'basicDetails',
                    query: `select * from srouser.doc_ack where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} ${docqurie}  and reg_year=${reqData.regYear}`
                },
                {
                    type: 'docStatus',
                    query: `select * from srouser.pde_doc_status_cr where sr_code=${reqData.srCode} and book_no=${reqData.bookNo} ${docqurie} and reg_year=${reqData.regYear}`
                },
            ];
            switch(reqData.flag){
                case 1:
                    queries.push({
                        type: 'schedule',
                    //     query:`SELECT  A.*,B.*,(SELECT LOCAL_BODY_DESC FROM local_body_dir i where i.LOCAL_BODY_CODE=A.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE , (SELECT LOCAL_BODY_NAME FROM hab_local_body j where j.HAB_CODE=A.HAB_CODE AND ROWNUM = 1 ) AS LOCAL_BODY_NAME,(SELECT VILLAGE_NAME FROM HAB_CODE WHERE HAB_CODE=A.VILLAGE_CODE||'01') VILLAGENAME,
                    // (SELECT CLASS_DESC FROM AREA_CLASS WHERE NATURE_USE=CLASS_CODE) LANDUSE FROM SROUSER.TRAN_SCHED A,  
                    // SROUSER.ADANGAL_DETAILS  B
                    // WHERE A.SR_CODE=B.SR_CODE(+)
                    // AND A.BOOK_NO=B.BOOK_NO(+)
                    // AND A.DOCT_NO=B.DOCT_NO(+)
                    // AND A.REG_YEAR=B.REG_YEAR(+)
                    // AND A.schedule_no=B.schedule_no(+)
                    // AND A.SR_CODE=${reqData.srCode} AND A.BOOK_NO=${reqData.bookNo} AND A.${isRdoc} AND A.REG_YEAR=${reqData.regYear} and B.S_LP_NO is not null`
                    query:`SELECT A.*, B.*, NVL(P.PARTY_NO, A.PARTY_NO) AS P_PARTY_NO, (SELECT LOCAL_BODY_DESC FROM local_body_dir i WHERE i.LOCAL_BODY_CODE = A.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE,(SELECT LOCAL_BODY_NAME FROM hab_local_body j WHERE j.HAB_CODE = A.HAB_CODE AND ROWNUM = 1) AS LOCAL_BODY_NAME,(SELECT VILLAGE_NAME FROM HAB_CODE WHERE HAB_CODE = A.VILLAGE_CODE || '01') AS VILLAGENAME,
                    (SELECT CLASS_DESC FROM AREA_CLASS WHERE NATURE_USE = CLASS_CODE) AS LANDUSE
                            FROM
                                SROUSER.TRAN_SCHED A
                                LEFT JOIN SROUSER.ADANGAL_DETAILS B
                                    ON A.SR_CODE = B.SR_CODE
                                AND A.BOOK_NO = B.BOOK_NO
                                AND A.DOCT_NO = B.DOCT_NO
                                AND A.REG_YEAR = B.REG_YEAR
                                AND A.SCHEDULE_NO = B.SCHEDULE_NO
                                LEFT JOIN SROUSER.TRAN_SCHED_PARTITION P
                                    ON A.SR_CODE = P.SR_CODE
                                AND A.BOOK_NO = P.BOOK_NO
                                AND A.DOCT_NO = P.DOCT_NO
                                AND A.REG_YEAR = P.REG_YEAR
                                AND A.SCHEDULE_NO = P.SCHEDULE_NO
                            WHERE
                                A.SR_CODE = ${reqData.srCode}
                                AND A.BOOK_NO = ${reqData.bookNo}
                                AND A.${isRdoc}
                                AND A.REG_YEAR = ${reqData.regYear}
                                AND B.S_LP_NO IS NOT NULL 
                                AND B.KHATA_NO NOT BETWEEN 300001 AND 399999 and B.KHATA_NO < 20000000`
                    });
                    break;
                case 2:
                    queries.push({
                        type: 'schedule',
                        query:`select a.*,to_char(a.party_no) AS sched_party_no,(select party_no from srouser.tran_sched_partition p where a.sr_code=p.sr_code and a.schedule_no=p.schedule_no and a.book_no=p.book_no and a.doct_no=p.doct_no and a.reg_year=p.reg_year and rownum = 1)as partition_party_no,(SELECT HAB_NAME FROM HAB_CODE J WHERE J.HAB_CODE=a.HAB_CODE and rownum=1) as village_name from srouser.tran_sched a where sr_code=${reqData.srCode} 
                        and book_no=${reqData.bookNo} and ${isRdoc} and reg_year=${reqData.regYear} and  nature_use in ('01','02','06','07','09','11')`      
                    });
                    break;
                default:
                    queries.push({
                        type: 'schedule',
                            query:`select a.*,(SELECT LOCAL_BODY_DESC FROM local_body_dir i where i.LOCAL_BODY_CODE=a.LOCAL_BODY AND ROWNUM = 1) AS LOCAL_BODY_TYPE,(SELECT LOCAL_BODY_NAME FROM hab_local_body j where j.HAB_CODE=a.HAB_CODE AND ROWNUM = 1) AS LOCAL_BODY_NAME,(select village_name from hab_code where hab_code=a.village_code||'01') villagename,(select class_desc from area_class where a.nature_use=class_code) landuse,se.layout_no,se.layout_name from srouser.tran_sched a join pde_doc_status_cr pde on a.sr_code = pde.sr_code and a.doct_no = pde.doct_no and a.reg_year = pde.reg_year and a.book_no = pde.book_no join schedule_entry se on pde.app_id = se.id and a.schedule_no = se.schedule_no where a.sr_code=${reqData.srCode} and a.book_no=${reqData.bookNo} and a.${isRdoc} and a.reg_year=${reqData.regYear}`          
                    })

            }

            if(reqData.sliceNumer){
                queries = queries.slice(0, reqData.sliceNumer);
            }
            let response = {};
            for(let i=0; i<queries.length; i++){
                response[queries[i].type] = await this.odbDao.oDBQueryService(queries[i].query)
            }
            let PDEQuery = `Select * from tran_major tm 
            join pde_doc_status_cr pd on tm.sr_code=pd.sr_code and tm.book_no=pd.book_no and tm.reg_year=pd.reg_year and tm.doct_no=pd.doct_no where   tm.SR_CODE = ${reqData.srCode}
                                AND tm.BOOK_NO = ${reqData.bookNo}
                                AND tm.${isRdoc}
                                AND tm.REG_YEAR = ${reqData.regYear} and pd.DOC_EKYC='N'`                                
            let PDEResponse = await this.odbDao.oDBQueryService(PDEQuery);                        
            if (PDEResponse.length > 0) {
                const headers = {
                    'api-key': `${process.env.PDE_API_KEY}`
                };
                let PartyData = await instance({ method: "GET", url: `${process.env.PDE_HOST}/pdeapi/v1/reports/${PDEResponse[0].APP_ID}`, headers: headers });
                response["partyDetails"] = PartyData.data.Data
                let allRepresentatives = [];
                for (let party of PartyData.data.Data) {
                    if (party.represents && Array.isArray(party.represents)) {
                        allRepresentatives.push(...party.represents);
                    }
                }
                response["representative"] = allRepresentatives;
            }
            return response;

        } catch (ex) {
            Logger.error("checkSlipReportServices - getCheckSlipReportsSrvc || Error :", ex);
            console.error("checkSlipReportServices - getCheckSlipReportsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


};

module.exports = checkSlipReportServices;
