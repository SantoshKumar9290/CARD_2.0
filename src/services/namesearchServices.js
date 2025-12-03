const CARDError = require("../errors/customErrorClass");
const oracleDb = require('oracledb');
const odbDao = require('../dao/oracledbDao');
const { constructCARDError } = require("../handlers/errorHandler");
const { Logger } = require('../../services/winston');


class namesearchServices {
    constructor() {
        this.odbDao = new odbDao();
    }

    getdistrictDetailsSrvc = async (loginUser) => {
        try {
            let query = `SELECT DR_CD, DR_NAME FROM CARD.dr_master`;
            let bindParams = {};
            if(loginUser.role=='SRO'){
                query = query+" where DR_CD in (SELECT dr_cd FROM CARD.sr_master where SR_CD = :srcd)";
                bindParams = {srcd:loginUser.SRO_CODE};
            }else if(loginUser.role=='DR'){
                query = query+" where DR_CD = :drcd";
                bindParams = {drcd:loginUser.DR_CD};
            }
            let response = await this.odbDao.oDBQueryServiceWithBindParams(query, bindParams);
            return response;
        } catch (ex) {
            Logger.error("namesearchServices - getdistrictDetailsSrvc || Error :", ex);
            console.error("namesearchServices - getdistrictDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }

    getsroDetailsSrvc = async (reqData, loginUser) => {
        try {
            let query = `SELECT SR_CD, SR_NAME FROM CARD.sr_master where dr_cd = :drcd`;
            let bindParams = {drcd:reqData.DR_CD};
            if(loginUser.role=='SRO'){
                query = query+" and SR_CD = :srcd";
                bindParams["srcd"] = loginUser.SRO_CODE;
            }
            let response = await this.odbDao.oDBQueryServiceWithBindParams(query, bindParams)
            return response;
        } catch (ex) {
            Logger.error("namesearchServices - getsroDetailsSrvc || Error :", ex);
            console.error("namesearchServices - getsroDetailsSrvc || Error :", ex);
            throw constructCARDError(ex);
        }
    }


    getNameSearchCountByData = async (reqData, loggedInUser) => {
        console.log("namesearchServices :: Inside of getNameSearchCountByData method :::: ");
        try {
            let caseno = reqData.caseno;
            let firno = reqData.firno;
            let surname = reqData.surname;
            let middlename = reqData.middlename;
            let lastname = reqData.lastname;

            let surnameSpell = reqData.surnameSpell;
            let middlenameSpell = reqData.middlenameSpell;
            let lastnameSpell = reqData.lastnameSpell;
            let radio1 = reqData.middlenameSpellCheck;
            let radio2 = reqData.lastnameSpellCheck;
            
            let surname_wrd = "";
            let lastname_wrd = "";
            let middlename_wrd = "";

            if (surname != "" && surname.length > 0 && surnameSpell != "" && surnameSpell.length > 0) {
                surname_wrd = "(" + surname + "   or   " + surnameSpell + ")";
            } else if (surname != "" && surname.length > 0 && surnameSpell == "") {
                surname_wrd = "(" + surname + ")";
            }

            if(surname_wrd.length==0)
            {
                throw new CARDError({err:"Bad request."});
            }

            if (radio1 == 1 && middlename != "" && middlename.length>0 ) {
                middlename = middlename + "%";
            }

            if (radio1 == 1 && middlenameSpell != "" && middlenameSpell.length>0 ) {
                middlenameSpell = middlenameSpell + "%";
            }

            if (radio2 == 1 && lastname != "" && lastname.length>0 ) {
                lastname = lastname + "%";
            }

            if (radio2 == 1 && lastnameSpell != "" && lastnameSpell.length>0 ) {
                lastnameSpell = lastnameSpell + "%";
            }

            if (middlename != "" && middlename.length>0 && middlenameSpell != "" && middlenameSpell.length>0) {
                middlename_wrd = "(" + middlename + "   or   " + middlenameSpell + ")";
            } else if (middlename != "" && middlename.length>0 && middlenameSpell == "") {
                middlename_wrd = "(" + middlename + ")";
            }

            if (lastname != "" && lastnameSpell != "") {
                lastname_wrd = "(" + lastname + "   or   " + lastnameSpell + ")";
            } else if (lastname != "" && lastnameSpell == "") {
                lastname_wrd = "(" + lastname + ")";
            }

            if (middlename_wrd != "")
                surname_wrd = surname_wrd + " AND " + middlename_wrd;
            if (lastname_wrd != "")
                surname_wrd = surname_wrd + " AND " + lastname_wrd;

            let wrd = surname_wrd;
            console.log("wrd ::::: ", wrd);

            let username = "Public";
            if (reqData.searchType == "GEN" ) {
                if(loggedInUser!=null && loggedInUser!=undefined && loggedInUser.SR_NAME!=undefined)
                    username = loggedInUser.SR_NAME;
                else
                    username = "General";
            }

            let newDate = new Date();
            let loghrs = newDate.getHours();
            loghrs = (loghrs+"").loghrs==1?("0"+loghrs):loghrs;
            let logminuts = newDate.getMinutes();
            logminuts = (logminuts+"").logminuts==1?("0"+logminuts):logminuts;
            let logseconds = newDate.getSeconds();
            logseconds = (logseconds+"").logseconds==1?("0"+logseconds):logseconds;

            let logyear = newDate.getFullYear();
            let logmonth = newDate.getMonth()+1;
            logmonth = (logmonth+"").logmonth==1?("0"+logmonth):logmonth;
            let logday = newDate.getDate();
            logday = (logday+"").length==1?("0"+logday):logday;

            let log_date = logday+"/"+logmonth+"/"+logyear+" "+loghrs+":"+logminuts+":"+logseconds;           

            let insertQuery = "insert into srouser.namesearchec_log_table (agency_name, log_time, "
                                +"word, applicant_name, search_type, FIR_NO, CASE_NO) "
                                +"values(: username, to_date(:logdate,'dd/mm/yyyy hh24:mi:ss'),"
                                +" '', :searchMadeBy, :searchType, :firno, :caseno)";

            let bindParams = {"username":username, "searchMadeBy":reqData.searchMadeBy, 
                        "logdate":log_date, "searchType":reqData.searchType, "firno":firno, "caseno":caseno};

            let insertResponse = await this.odbDao.oDbInsertDocsWithBindParams(insertQuery, bindParams);
            let startTime = Math.floor(new Date().getTime()/1000);
            let count=0;

            //  let wrd1 = reqData.middlename_wrd;
            if (reqData.searchType == "GPA") {
                let sqlQuery = "SELECT ctx_query.count_hits(:index_name,:text_query,:exact)  from dual";
                let bindParams1 = { "index_name": "SROUSER.gpa_ec_mv_idx", "text_query": wrd, "exact": true }
                let response = await this.odbDao.oDBQueryServiceWithBindParams(sqlQuery, bindParams1);
                let values = Object.values(response[0]);
                count = values[0];
            } else if (reqData.searchType == "GEN") {
                /*let qry = "SELECT SUBSTR(r.dr_code,0,2) as district_code FROM CARD.mst_revregdist r"
                            +" where r.district_code=:drcode";
                let bindParams1 = {drcode:reqData.districtCode};
                let response = await this.odbDao.oDBQueryServiceWithBindParams(qry,bindParams1);
                let districtCode = reqData.districtCode;
                */
                let indexStr = "SROUSER.namesearch_mv_idx_" + reqData.districtCode;
                let sqlQuery = "SELECT ctx_query.count_hits(:index_name,:text_query,:exact)  from dual";
                let bindParams = { "index_name": indexStr, "text_query": wrd, "exact": true }
                let response1 = await this.odbDao.oDBQueryServiceWithBindParams(sqlQuery, bindParams);
                let values = Object.values(response1[0]);
                count = values[0];
            }else{
                throw new CARDError({err:"Data search not found."});
            }

            let endTime = Math.floor(new Date().getTime()/1000);
            let execTime = endTime-startTime;

            let updateQuery = "update SROUSER.namesearchec_log_table set documents_obtained=:count, "
                            +"response_time=:execTime where to_char(log_time,'dd/mm/yyyy hh24:mi:ss') = "
                            +":logdate and agency_name=:username and word=:wrd";

            let updateBindParams = {"count":count, "execTime":execTime, "logdate":log_date, "username":username, "wrd":wrd};
            await this.odbDao.oDbInsertDocsWithBindParams(updateQuery, updateBindParams);
            let responseData = {"sdate": new Date(), "wrd" : wrd, "searchMadeBy" : reqData.searchMadeBy, 
                	"takenTime": execTime, "districtCode": reqData.districtCode, "sroCode":reqData.sroCode,
                     "count":count};
            
            console.log("namesearchServices :: End of getNameSearchCountByData method :::: ");
            return {data: responseData, status:true, message:"Data fetched successfully."};
        } catch (ex) {
            Logger.error("CCServices - getNameSearchCountByData || Error :", ex);
            console.error("CCServices - getNameSearchCountByData || Error :", ex);
            throw new CARDError({err:ex.message});
        }
    }

    getNameSearchSROCountByData = async (reqData, loggedInUser) => {
        try {
            console.log("namesearchServices :: Inside of getNameSearchSROCountByData method :::: ");
            let districtCode = reqData.districtCode
            let sroCode = reqData.sroCode;
            let districtMin = districtCode + "01";
            let districtMax = districtCode + "99";
            let searchType = reqData.searchType;
            let wrd = reqData.wrd;
            wrd = wrd.replace("$", "%");
            let searchMadeBy = reqData.searchMadeBy; 
            let exc = "E";
            let username = "Public";
            if (reqData.searchType == "GEN" ) {
                if(loggedInUser!=null && loggedInUser.SR_NAME!=undefined)
                    username = loggedInUser.SR_NAME;
                else
                    username = "General";
            }

            let str_1 = "select SROUSER.namesearch_req.nextval req, sysdate sys from dual";
            let response1 = await this.odbDao.oDBQueryServiceWithBindParams(str_1, {})
            let req_no = response1[0].REQ;
            let t_stamp = response1[0].SYS; 

            let startTime = Math.floor(new Date().getTime()/1000);

            let msg = "SELECT SUBSTR(r.dr_code,0,2) drcode FROM CARD.mst_revregdist r where "
                        +"r.district_code=:drcode";
            let response10 = await this.odbDao.oDBQueryServiceWithBindParams(msg, {drcode:reqData.districtCode});
            
            if(response10!=null && response10.length>0)
                districtCode = response10[0].DRCODE;

            let str_3;
            let insertBindParams = {"wrd":wrd, "reqNo":req_no, "exc":exc};
            if (searchType == "GPA") {
                if (districtCode == "0") {
                    str_3 = " INSERT INTO SROUSER.namesearch_temp3(select :reqNo,ROWNUM,name,code,r_name,r_code, sr_code, rdoct_no doct_no, ryear reg_year,'*' schedule_no, RPAD((address1 ||','|| address2),100) address, sysdate,:exc,book_no from SROUSER.gpa_names_mv where contains(name,:wrd)>0 and sr_code between 101 and 1399)";
                } else if (sroCode == "0") {
                    str_3 = " INSERT INTO SROUSER.namesearch_temp3(select :reqNo,ROWNUM,name,code,r_name,r_code,sr_code, rdoct_no doct_no, ryear reg_year,'*' schedule_no, RPAD((address1 ||','|| address2),100) address, sysdate,:exc,book_no from SROUSER.gpa_names_mv where sr_code between :districtMin and :districtMax and contains(name,:wrd)>0)";
                    insertBindParams["districtMin"]=districtMin;
                    insertBindParams["districtMax"]=districtMax;
                } else {
                    str_3 = " INSERT INTO SROUSER.namesearch_temp3(select :reqNo,ROWNUM,name,code,r_name,r_code,sr_code, rdoct_no doct_no, ryear reg_year,'*' schedule_no, RPAD((address1 ||','|| address2),100) address, sysdate,:exc,book_no from SROUSER.gpa_names_mv where sr_code=:sroCode and contains(name,:wrd)>0)";
                    insertBindParams["sroCode"]=sroCode;
                }
            } else if (searchType !== "GPA") {
                if (districtCode == "0") {
                    str_3 = "INSERT INTO SROUSER.namesearch_temp3(select :reqNo, ROWNUM,indgp_name,indgp_code,r_name,r_code, sr_code, doct_no, reg_year,schedule_no, substr(address,1,100),sysdate,:exc,book_no from SROUSER.ind1v_n_all where contains(indgp_name,:wrd)>0 and sr_code between 101 and 1399)";
                } else if (sroCode == "0") {
                    str_3 = "INSERT INTO SROUSER.namesearch_temp3(select :reqNo, ROWNUM, indgp_name, indgp_code, r_name, r_code, sr_code, doct_no, reg_year, schedule_no, substr(address,1,100),sysdate,:exc,book_no from SROUSER.namesearch_mv_" + districtCode + " where  contains(indgp_name,:wrd)>0)";
                } else {
                    str_3 = "INSERT INTO SROUSER.namesearch_temp3(select :reqNo, ROWNUM, indgp_name, indgp_code, r_name, r_code, sr_code, doct_no, reg_year, schedule_no, substr(address,1,100),sysdate,:exc,book_no from SROUSER.ind1v_n_all where sr_code=:sroCode and contains(indgp_name,:wrd)>0)";
                    insertBindParams["sroCode"]=sroCode;
                }
            }
            console.log("insert query ::::: ", str_3);
            let response2 = await this.odbDao.oDbInsertDocsWithBindParams(str_3, insertBindParams);
            console.log("Insert response ::: ", response2);

            let endTime = Math.floor(new Date().getTime()/1000);
            let breakTime = endTime - startTime;

            let newDate = new Date();
            let loghrs = newDate.getHours();
            loghrs = (loghrs+"").loghrs==1?("0"+loghrs):loghrs;
            let logminuts = newDate.getMinutes();
            logminuts = (logminuts+"").logminuts==1?("0"+logminuts):logminuts;
            let logseconds = newDate.getSeconds();
            logseconds = (logseconds+"").logseconds==1?("0"+logseconds):logseconds;

            let logyear = newDate.getFullYear();
            let logmonth = newDate.getMonth()+1;
            logmonth = (logmonth+"").logmonth==1?("0"+logmonth):logmonth;
            let logday = newDate.getDate();
            logday = (logday+"").length==1?("0"+logday):logday;

            let sys_date = logday+"/"+logmonth+"/"+logyear+" "+loghrs+":"+logminuts+":"+logseconds;  

            console.log(breakTime,'Break Timeeee');
            let str = "select count(*) cnt from SROUSER.namesearch_temp3 where reqno=:reqno and sr_code is not null";
            let response3 = await this.odbDao.oDBQueryServiceWithBindParams(str,{"reqno":req_no})
            let noOfDocs = response3[0].CNT;//Execute above query and assign result count value to it

            str = "select count(*) cnt from SROUSER.namesearch_temp3 where reqno=:reqno and sr_code is not null and exact='E'";
            let response4 = await this.odbDao.oDBQueryServiceWithBindParams(str,{"reqno":req_no})
            let cnt_init = response4[0].CNT;//Execute above query and assign result count value to it

            let st_min = "select min(sr_code) minsrocode, max(sr_code) maxsrocode from SROUSER.namesearch_temp3 where reqno=:reqno";
            let response5 = await this.odbDao.oDBQueryServiceWithBindParams(st_min,{"reqno":req_no})
            let sro1 = response5[0].MINSROCODE;
            let sro2 = response5[0].MAXSROCODE;

            startTime = Math.floor(new Date().getTime()/1000);
            let sroList = [];

            let mainqry = "select a.sr_code,count(*) ct, b.srname,c.mandal_name from SROUSER.namesearch_temp3 a, "
                        +"srcode b,dist_code c  where a.reqno=:reqno and a.sr_code=b.sr_code and "
                        +"a.sr_code is not null  and c.district_code=floor(a.sr_code/100)  and c.mandal_code='00' "
                        +"group by a.sr_code,b.srname,c.mandal_name order by sr_code";

            let response6 = await this.odbDao.oDBQueryServiceWithBindParams(mainqry,{"reqno":req_no})
            for(const resDataObj of response6){
                let sroData = { "srocode": resDataObj.SR_CODE,
                                "doccount": resDataObj.CT,
                                "sroname": resDataObj.SRNAME,
                                "mandalname": resDataObj.MANDAL_NAME }
                                
                sroList.push(sroData);
            }

            endTime = Math.floor(new Date().getTime()/1000);
            let execTime = endTime - startTime;

            let resultData = {
                "districtCode": districtCode, "breakNoOfdoc": 0, "breakTime": breakTime, "wrd": wrd, "searchMadeBy": searchMadeBy,
                "takenTime": execTime, "req_no": req_no, "sys_date": sys_date, "totDocCount": noOfDocs, "sroList": sroList,
                "noOfDocuments": noOfDocs, "cnt_init": cnt_init, "cnt_par": 0, "sroMax": sro2, "sroMin": sro1
            };
            console.log("namesearchServices :: End of getNameSearchSROCountByData method :::: ");
            return resultData;
        } catch (ex) {
            Logger.error("CCServices - getNameSearchSROCountByData || Error :", ex);
            console.error("CCServices - getNameSearchSROCountByData || Error :", ex);
            throw new CARDError({err:ex.message});
        };
    }

    getNameSearchPartiesDataListByData = async (reqData, loggedInUser) => {
        try {
            console.log("namesearchServices :: Inside of getNameSearchPartiesDataListByData method :::: ");
            let wrd = reqData.wrd;
            wrd = wrd.replace("$", "%");
            let districtCode =  reqData.districtCode;
            let searchMadeBy = reqData.searchMadeBy;
            let req_no = reqData.req_no;
            let flag_var = parseInt(reqData.flag);
            let flg = reqData.flg;
            let sroCode = reqData.sroCode;
            let flg1 = "E";
            let flg2 = "I";
            if (flg == "E") {
                flg1 = "E";
                flg2 = "E";
            } else if (flg == "I") {
                flg1 = "I";
                flg2 = "I";
            } else if (flg == "B") {
                flg1 = "E";
                flg2 = "I";
            }

            let count;
            if (flag_var == 4) {
                count = reqData.doccount;
            } else {
                count =  reqData.noOfDocuments;
            }

            let cnt_init = reqData.cnt_init;
            let sr1 = "";
            let sr2 = "";
            if (flag_var == 3) {
                sr1 = reqData.sroMin;
                sr2 = reqData.sroMax;
            } else if (flag_var == 4) {
                sr1 = sroCode;
                sr2 = sroCode;
            }
            let startTime = Math.floor(new Date().getTime()/1000);
           
            let mainQry = "select b.srname, indgp_name, indgp_code, address, rel_code, rel_name, a.sr_code, "
                        +"doct_no, reg_year, schedule_no, book_no from SROUSER.namesearch_temp3 a,srcode b "
                        +"where reqno=:reqno and A.SR_CODE=b.sr_code  and a.sr_code between :sr1 and :sr2 "
                        +"and exact in (:flg1, :flg2)  order by  exact,reg_year,doct_no";
            let bindParams = {"reqno":req_no, "sr1":sr1, "sr2":sr2, "flg1":flg1,"flg2":flg2}

            let partyList = [];
            let resultDataArray = await this.odbDao.oDBQueryServiceWithBindParams(mainQry,bindParams);
            for(let resultData of resultDataArray){
                let partyData = {"srocode": resultData.SR_CODE,
                                "sroname": resultData.SRNAME, "partynames": resultData.INDGP_NAME,
                                "code": resultData.INDGP_CODE, "address": resultData.ADDRESS,
                                "relcode": resultData.REL_CODE, "relname": resultData.REL_NAME,
                                "docno": resultData.DOCT_NO, "regyear": resultData.REG_YEAR,
                                "scno": resultData.SCHEDULE_NO, "book_no": resultData.BOOK_NO,
                                }
                partyList.push(partyData);
            }
	
            let endTime = Math.floor(new Date().getTime()/1000);
            let execTime = endTime-startTime;
            let totDocCount = reqData.totDocCount;

            let newDate = new Date();
            let loghrs = newDate.getHours();
            loghrs = (loghrs+"").loghrs==1?("0"+loghrs):loghrs;
            let logminuts = newDate.getMinutes();
            logminuts = (logminuts+"").logminuts==1?("0"+logminuts):logminuts;
            let logseconds = newDate.getSeconds();
            logseconds = (logseconds+"").logseconds==1?("0"+logseconds):logseconds;

            let logyear = newDate.getFullYear();
            let logmonth = newDate.getMonth()+1;
            logmonth = (logmonth+"").logmonth==1?("0"+logmonth):logmonth;
            let logday = newDate.getDate();
            logday = (logday+"").length==1?("0"+logday):logday;

            let sys_date = logday+"/"+logmonth+"/"+logyear+" "+loghrs+":"+logminuts+":"+logseconds;

            wrd = wrd.replace("%", " ");
	        let resultData = {"wrd":wrd, "searchMadeBy":searchMadeBy, "execTime":execTime, "count":count, 
                            "req_no":req_no, "sys_date":sys_date, "searchType":reqData.searchType, "cnt_init":cnt_init, 
					        "cnt_par":0, "totDocCount":totDocCount, "flg": flg, "partyList":partyList};
            console.log("namesearchServices :: End of getNameSearchPartiesDataListByData method :::: ");
            return resultData;
        } catch (ex) {
            Logger.error("CCServices - getNameSearchPartiesDataListByData || Error :", ex);
            console.error("CCServices - getNameSearchPartiesDataListByData || Error :", ex);
            throw new CARDError({err:ex.message});
        };
    }


    getNameSearchStatementBySelectedData = async (reqData, loggedInUser) => {
        try {
            console.log("namesearchServices :: Inside of getNameSearchStatementBySelectedData method :::: ");
            let selectedArray = reqData.selectedList;
            let searchType = reqData.searchType;
            let searchMadeBy = reqData.searchMadeBy;
            let wrd = reqData.wrd;

            let sroCode = "";
            let docIdArr = "";
            for(let docString of selectedArray) {
                let selectedDetails = docString.split("~");
                if(sroCode==""){
                    sroCode = selectedDetails[0];
                }
                docIdArr = docIdArr+"(" + selectedDetails[0] + "," + selectedDetails[1] + "," + selectedDetails[2] + "," + selectedDetails[4] + "),";
            }

            if(docIdArr != "")
                docIdArr = docIdArr.substring(0, docIdArr.length-1);

            let startTime = Math.floor(new Date().getTime()/1000);
            let stQry = "select srname from card.srcode where sr_code = :srcode";
            let sroNameResponse = await this.odbDao.oDBQueryServiceWithBindParams(stQry,{"srcode":sroCode});
	        let sroName = sroNameResponse[0].SRNAME;
           
            let sqlQuery = "select  ec.sr_code sr_code, doct_no, schedule_no, reg_year, replace(property,',',', ') property, "
                            + "link_doct, e_date, r_date, p_date, tran_code1, mkt_val, con_val,  vol_pag, cd_no, book_no, village "
                            + "from srouser.ec_tran_all ec where (ec.sr_code,ec.doct_no,ec.reg_year,ec.book_no) in (" + docIdArr + ")"
                            + " union select  ec.sr_code sr_code, doct_no, schedule_no, reg_year, replace(property,',',', ') "
                            + "property, link_doct,e_date,r_date,p_date,tran_code1, mkt_val, con_val, vol_pag, cd_no, book_no, "
                            + "village from srouser.ec_idx_all ec where (ec.sr_code,ec.doct_no,ec.reg_year,ec.book_no) in "
                            + "(" + docIdArr + ") order by reg_year desc, doct_no desc";

            let docResponseList = await this.odbDao.oDBQueryServiceWithBindParams(sqlQuery,{});
            
            let partyList = [];
            for(const rowData of docResponseList) {
                let t_sro = rowData.SR_CODE;
                let t_doct = rowData.DOCT_NO;
                let t_sch = rowData.SCHEDULE_NO;
                let t_regyr = rowData.REG_YEAR;
                let prop = rowData.PROPERTY;
                let lnk_dct = rowData.LINK_DOCT;
                let e_date = rowData.E_DATE;
                let r_date = rowData.R_DATE;
                let p_date = rowData.P_DATE;
                let tr_cd = rowData.TRAN_CODE1;
                let mkt_val = rowData.MKT_VAL;
                let con_val = rowData.CON_VAL;
                let vol = rowData.VOL_PAG;
                let cd = rowData.CD_NO;
                let t_book_no = rowData.BOOK_NO;
                let village = rowData.VILLAGE;

                let str3 = "select l_SRCD, l_doctno, l_regyear, code from srouser.recti "
                            +"where c_srcd=:srcode and c_bno=:bookno and r_doctno=:docno and "
                            +"r_year=:ryear group by l_SRCD, l_doctno, l_regyear, code";

                let l_doctno = "";
                let l_regyear = "";
                let note = "";
                let docBindParams = {"srcode":t_sro, "bookno":t_book_no, "docno":t_doct, "ryear":t_regyr};
                let docDataList = await this.odbDao.oDBQueryServiceWithBindParams(str3,docBindParams);
                if(docDataList.length>0)
                {
                    let docRowData = docDataList[0];
                    l_regyear = docRowData.L_REGYEAR;
                    let code = docRowData.CODE;
                    if (code != null && (code == "RAS" || code == "RCS" || code == "RES" || code == "CNS"
                        || code == "RAB" || code == "RCB" || code == "REB" || code == "CNB")) {
                        if (code == "RAS") {
                            note = "Ratifies";
                        }
                        if (code == "RCS") {
                            note = "Rectifies";
                        }
                        if (code == "RES") {
                            note = "Revokes";
                        }
                        if (code == "CNS") {
                            note = "Cancels";
                        }
                        if (code == "RAB") {
                            note = "is Ratified by";
                        }
                        if (code == "RCB") {
                            note = "is Rectified by ";
                        }
                        if (code == "REB") {
                            note = "is Revoked by ";
                        }
                        if (code == "CNB") {
                            note = "Cancelled by ";
                        }
                    }
                    l_doctno = docRowData.L_DOCTNO;
                }
                let strs5 = "select tran_desc from card.nature_all where tran_code1=:trcd";
                let transDescResp = await this.odbDao.oDBQueryServiceWithBindParams(strs5,{"trcd":tr_cd});
		        let trandesc = transDescResp[0].TRAN_DESC;

                let strrs6 = "";
                let indvBindParams = {"srcode":t_sro, "bookno":t_book_no, "docno":t_doct, "ryear":t_regyr};
                if (!searchType == "GEN") {
                    if (searchType == "ALL") {
                        strrs6 = "select indgp_code, indgp_name, r_code, r_name from srouser.ind1v_n_all where sr_code=:srcode and reg_year=:ryear and doct_no=:docno and book_no=:bookno and indgp_code in ('EX','CL') and schedule_no in ('*')";
                    } else if (searchType == "GPA") {
                        strrs6 = " select code,name,r_code,r_name from srouser.gpa_doc_v where sr_code=:srcode and ryear=:ryear and rdoct_no=:docno and book_no=:bookno";
                    }
                } else {
                    strrs6 = "select indgp_code, indgp_name, r_code, r_name from srouser.ind1v_n_all where sr_code=:srcode and reg_year=:ryear and doct_no=:docno and book_no=:bookno and schedule_no in (:tsch,'*')";
                    indvBindParams["tsch"] = t_sch;
                }

                let indgpDataList = await this.odbDao.oDBQueryServiceWithBindParams(strrs6, indvBindParams);
                let partyNames = "";
                let indexCnt = 1;
                if(indgpDataList.length>0) {
                    for(const indgpRowData of indgpDataList) {
                        partyNames = partyNames + indexCnt + ".(" + indgpRowData.INDGP_CODE+ ")" + indgpRowData.INDGP_NAME+"<br/>";
                        indexCnt++;
                    }
                }
                let endTime = Math.floor(new Date().getTime()/1000);
                let execTime = endTime-startTime;
    
                if(execTime>297)
                    break;
    
                let partyDetails = { "prop":prop, "lnk_dct":lnk_dct, "e_date":e_date, "regdate":r_date, "p_date":p_date,
                                "tr_cd":tr_cd, "mkt_val":mkt_val, "con_val":con_val, "vol":vol, "cd":cd, "sroName":sroName,
                                "note":note, "partyNames":partyNames, "trandesc":trandesc, "l_doctno":l_doctno, 
                                "l_regyear":l_regyear, "t_sro":t_sro, "t_doct":t_doct, "t_sch":t_sch, "t_regyr":t_regyr,
                                "t_book_no":t_book_no, "village":village  }
            
                partyList.push(partyDetails);
            }
            let resultData = {"partyList":partyList, "selectedArray":selectedArray, "searchMadeBy":searchMadeBy,"sroName":sroName, "wrd":wrd};
            console.log("namesearchServices :: End of getNameSearchStatementBySelectedData method :::: ");
            return resultData;
        } catch (ex) {
            Logger.error("CCServices - getNameSearchStatementBySelectedData || Error :", ex);
            console.error("CCServices - getNameSearchStatementBySelectedData || Error :", ex);
            throw new CARDError({err:ex.message});
        };
    }

 }

 module.exports = namesearchServices;
