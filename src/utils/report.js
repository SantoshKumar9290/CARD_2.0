const Path = require('path');
const {ackAndSlotStyles} = require('./pdfStyles/ackAndSlot');
const {checkSlip}  =require('./pdfStyles/checkSlip');
const {formSixtyStyles} = require('./pdfStyles/formSixty');
const {pdeStyle} = require('./pdfStyles/engDocs')
const {rentsDocs}= require('./pdfStyles/telugu/rentDocs');
const {saleDeedDocs}= require('./pdfStyles/telugu/saleDeed');
const {mortagageDocs}= require('./pdfStyles/telugu/mortagage');
const {giftDocs}= require('./pdfStyles/telugu/gift');
const {familyPropDocs} = require('./pdfStyles/telugu/familyProperty');
const pdfDoc = require('pdfkit');
const fs = require('fs');
const { fontSize } = require('pdfkit');
const CARDError = require('../errors/customErrorClass');
const generatReport = async (data,reportType)=>{
	try{
		let [naturetype ,rest]= data.registrationType.TRAN_DESC.split(" ");
		if(naturetype == "Gift"){
			naturetype = "SETTLEMENT";
		}
		let partyType1 = naturetype == "SETTLEMENT" ? "SETTLOR" :naturetype == "Mortgage"?"MORTGAGOR":"VENDOR";
		let partyType2 = naturetype == "SETTLEMENT" ? "SETTLEE" :naturetype == "Mortgage"?"MORTGAGEE(S)S":"VENDEE";
		let covenantArr=[];
		if(data?.covanants){
			let sNo =2;
			data?.covanants?.covanants.map((covn)=>{
				let val = sNo ===2 ? `${sNo}.${covn.value}` : `\n${sNo}.${covn.value}`
				covenantArr = [...covenantArr,val];
				sNo =sNo+1;
			})
		};
		var [dd,m,yyyy] = data.executionDate.split("/");
		// var dd = String(exDate.getDate()).padStart(2, '0');
		var mm = new Date(`${yyyy}-${m}-${dd}`).toLocaleDateString('en-US',{month:'long'})
		// exDate.toLocaleDateString('en-US',{month:'long'})
		//String(date.getMonth() + 1).padStart(2, '0').tolo; //January is 0!
		// var yyyy = exDate.getFullYear();
		if(reportType == "checkSlip"){
			// 		// [{text:'Structure Details',alignment:'center',fillColor: '#50c4eb',
			// 		// color: '#343f42',}],
			// 		// [
			// 		// 	{
			// 		// 		style:'insideTable6',
			// 		// 		table:{
			// 		// 			widths:[36,36,60,60,70,36],
			// 		// 			body:[
			// 		// 				[
			// 		// 					{text:'SL No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					 {text:'Floor No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					 {text:'Structure Type',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					{text:'Plinth(sq. feets)',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					 {text:'Stage of Cons.',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					{text:'Age',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'}
			// 		// 				],
			// 		// 				// [
			// 		// 				// 	{text:`${fData.stSNo}`,fontSize:8},{text:`${fData.stFloorNo}`,fontSize:8},{text:`${fData.stStructuretype}`,fontSize:8},{text:`${fData.stPlinth}`,fontSize:8},{text:`${fData.stStage}`,fontSize:8},{text:`${fData.stAge}`,fontSize:8}
			// 		// 				// ]
			// 		// 			]
			// 		// 		}
			// 		// 	}
			// 		// ],
			// 		// [{text:'Link Document Details',alignment:'center',fillColor: '#50c4eb',
			// 		// color: '#343f42',}],
			// 		// [
			// 		// 	{
			// 		// 		style:'insideTable9',
			// 		// 		table:{
			// 		// 			widths:[36,57,100,50,50,50,50],
			// 		// 			body:[
			// 		// 				[
			// 		// 					{text:'Sl No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					{text:'Sch No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					{text:'Link SRO Name',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					{text:'Link Doc No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					{text:'Link Book No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					{text:'Link Reg Year',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 					{text:'Link Sch No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 		// 				],
			// 		// 			]
			// 		// 		}
			// 		// 	}
			// 		// ],

			checkSlip.content =[];
			checkSlip.content.push({columns:[
				{		
				image:  Path.resolve(__dirname,'','../../logos/ap_logo.jpg'),
				height: 70,
				width: 70,
				style:['header']},
				{text:'Government of Andhra Pradesh'+'\n'+'Registration and Stamps Department',style :['title']}
			]})
			checkSlip.content.push({table:{
				body:[
					[{text:`Public Data Entry (PDE)`,alignment:'center',fillColor: '#50c4eb',
					color: '#343f42',}],
					[
						{
							style:'insideTable1',
							table:{
								widths:[110,'*','*'],
								body:[
									[
										{
											columns:[{text:`Type of Registration`,fontSize:8,bold:true,margin:[10,5,-100,0]},
											{text:'\n'+`${data.registrationType.TRAN_DESC ? data.registrationType.TRAN_DESC : data.registrationType}`,fontSize:8,margin:[-20,6,0,0]}
										]
										},
										{	columns:[
												{
													text:'Government Of AndhraPradesh',fontSize:8,bold:true,decoration:'underline',margin:[20,5,-100,0]
												},
												{
													text:`Registration And Stamps Department`,fontSize:8,margin:[-67,18,10,0]
												}
											]
	
										},
										{ 
	
											columns:[
												{text:`Sro Code :`+'\n'+`Sro Name :`+'\n'+`District Name :`,fontSize:8,bold:true,alignment:'left'},
												{text:`${data.sroCode}`+'\n'+`${data.sroOffice}`+'\n'+`${data.district}`,fontSize:8},
											],
										}
	
									]
								]
							}
						}
					],
					[
						{text:'Document Details',alignment:'center',fillColor: '#50c4eb',
						color: '#343f42',}
					],
					[
						{
							style:'insideTable1',
							table:{
								widths:[130,70,110,110],
								body:[
									[	
										{
											text: [
												{text: 'Trans. ID:', fontSize: 8, bold: true},{text:` ${data.applicationId}`,fontSize:8,margin:[20,5,20,0]},
												{text: '\nDocument Nature: ', fontSize: 8, bold: true},{text:` ${data?.documentNature?.TRAN_DESC}`,fontSize:8}
											]
										},
										{
											text:[
												{text:'               '},
												{text:'Year : ',bold:true,fontSize:8,alignment:'center',margin:[20,45,10,0]},{text:`${"2022"}`,fontSize:8,alignment:'center'},
											]
										},
										{
											text:[
												{text:'               '},
												{text:'Date of Stamp purchaged : ',bold:true,fontSize:8,alignment:'left'},{text:`${data?.stampPurchaseDate}`,fontSize:8,},
											]
										},
										{
											text:[
												{text:'               '},
												{text:'Date of Excution : ',bold:true,fontSize:8,alignment:'left'},{text:`${data?.executionDate}`,fontSize:8,},
											]
										}
									]
								]
							}
						}
					],
					[{text:'Seller Details',alignment:'center',fillColor: '#50c4eb',
			 		color: '#343f42',}],
				]
				
			},style:["tableExample2"]});
		
			let exArry = [
				{
					style:'insideTable2',
					table:{
						widths:[36,100,35,120,120],
						body:[
							[
								{text:'SL.No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Name',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Age',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Relation Name',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Address',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'}
							],
								
						]
					}
				}
			];
			let clArry = [
				{
					style:'insideTable2',
					table:{
						widths:[36,100,35,120,120],
						body:[
							[
								{text:'SL.No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Name',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Age',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Relation Name',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Address',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'}
							],
								
						]
					}
				}
			];
			let repArry = [
				{
					style:'insideTable2',
					table:{
						widths:[36,100,35,120,120],
						body:[
							[
								{text:'SL.No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Name',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Age',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Relation Name',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Address',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'}
							],
								
						]
					}
				}
			];
			if(data?.executent && data?.executent?.length >0){
				let sNo =0;
				for(let i in data.executent){
					let a;
					if(sNo === 0){
						a =[
							{text:sNo+1,fontSize:8},
							{text:data.executent[i].name,fontSize:8},
							{text:data.executent[i].age,fontSize:8},
							{text:data.executent[i].relationName,fontSize:8},
							{text:data.executent[i].address,fontSize:8},
						]
						sNo = sNo +1;
					}else{
						a =[
							{text:sNo+1,fontSize:8},
							{text:data.executent[i].name,fontSize:8},
							{text:data.executent[i].age,fontSize:8},
							{text:data.executent[i].relationName,fontSize:8},
							{text:data.executent[i].address,fontSize:8},
						]
						sNo = sNo +1;
					}
					// const a = [i+1,data.executent[i].name,data.executent[i].age,data.executent[i].relationName,data.executent[i].address];
					exArry[0].table.body.push(a);
				}
				checkSlip.content[1].table.body.push(exArry);
				// checkSlip.content[1].table.body[5]=[...checkSlip.content[1].table.body[5],];
			}else{
				const a = ["","","","",""];
				exArry[0].table.body.push(a);
				checkSlip.content[1].table.body.push(exArry)
			};
			checkSlip.content[1].table.body.push([{text:'Buyer Details',alignment:'center',fillColor: '#50c4eb',
			color: '#343f42',}]);




			if(data?.claimant && data?.claimant?.length >0){
				let sNo =0;
				for(let i in data.claimant){
					let a;
					if(sNo === 0){
						a =[
							{text:sNo+1,fontSize:8},
							{text:data.claimant[i].name,fontSize:8},
							{text:data.claimant[i].age,fontSize:8},
							{text:data.claimant[i].relationName,fontSize:8},
							{text:data.claimant[i].address,fontSize:8},
						]
						sNo = sNo +1;
					}else{
						a =[
							{text:sNo+1,fontSize:8},
							{text:data.claimant[i].name,fontSize:8},
							{text:data.claimant[i].age,fontSize:8},
							{text:data.claimant[i].relationName,fontSize:8},
							{text:data.claimant[i].address,fontSize:8},
						]
						sNo = sNo +1;
					}
					// const a = [i+1,data.claimant[i].name,data.claimant[i].age,data.claimant[i].relationName,data.claimant[i].address];
					clArry[0].table.body.push(a);
				}
				
				checkSlip.content[1].table.body.push(clArry);
				// checkSlip.content[1].table.body[5]=[...checkSlip.content[1].table.body[5],];
			}else{
				const a = ["","","","",""];
				clArry[0].table.body.push(a);
				checkSlip.content[1].table.body.push(clArry)
			};
			checkSlip.content[1].table.body.push([{text:'Representative Details',alignment:'center',fillColor: '#50c4eb',
			color: '#343f42',}]);
			if(data?.executent && data?.executent?.length >0 || data?.claimant && data?.claimant?.length >0){
				let seNo=0;
				for(let i in data.executent){
					if(data.executent[i].represent && data.executent[i].represent.length >0){
						for(let j in data.executent[i].represent){
							let a;
							if(seNo === 0){
								a  = [
									{text:seNo+1,fontSize:8},
									{text:data.executent[i].represent[j].name,fontSize:8},
									{text:data.executent[i].represent[j].age,fontSize:8},
									{text:data.executent[i].represent[j].relationName,fontSize:8},
									{text:data.executent[i].represent[j].address,fontSize:8},
								]
								seNo = seNo +1;
							}else{
								a  = [
									{text:seNo+1,fontSize:8},
									{text:data.executent[i].represent[j].name,fontSize:8},
									{text:data.executent[i].represent[j].age,fontSize:8},
									{text:data.executent[i].represent[j].relationName,fontSize:8},
									{text:data.executent[i].represent[j].address,fontSize:8},
								]
								seNo = seNo +1;
							}
							repArry[0].table.body.push(a);
						}
					}
				}
				for(let i in data.claimant){
					if(data.claimant[i].represent && data.claimant[i].represent.length >0){
						for(let j in data.claimant[i].represent){
							let a;
							if(seNo === 0){
								a  = [
									{text:seNo+1,fontSize:8},
									{text:data.claimant[i].represent[j].name,fontSize:8},
									{text:data.claimant[i].represent[j].age,fontSize:8},
									{text:data.claimant[i].represent[j].relationName,fontSize:8},
									{text:data.claimant[i].represent[j].address,fontSize:8},
								]
								seNo = seNo +1;
							}else{
								a  = [
									{text:seNo+1,fontSize:8},
									{text:data.claimant[i].represent[j].name,fontSize:8},
									{text:data.claimant[i].represent[j].age,fontSize:8},
									{text:data.claimant[i].represent[j].relationName,fontSize:8},
									{text:data.claimant[i].represent[j].address,fontSize:8},
								]
								seNo = seNo +1;
							}
							// const a = [i+1,data.claimant[i].represent[j].name,data.claimant[i].represent[j].age,data.claimant[i].represent[j].relationName,data.claimant[i].represent[j].address];
							repArry[0].table.body.push(a);
						}
					}
				}
				checkSlip.content[1].table.body.push(repArry);
				// checkSlip.content[1].table.body[5]=[...checkSlip.content[1].table.body[5],];
			}else{
				const a = ["","","","",""];
				repArry[0].table.body.push(a);
				checkSlip.content[1].table.body.push(repArry)
			};
			checkSlip.content[1].table.body.push([{text:'Details of the Property',alignment:'center',fillColor: '#50c4eb',
			color: '#343f42',}]);

			let propArry =[
				{
					style:'insideTable5',
					table:{
						widths:[36,100,120,50,50,46],
						body:[
							[
								{text:'SL No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Village/Town/Boundaries',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Door/flat/Plot/Survey No./Extent',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Land Use',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Market Value',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
							],
							// [
							// 	{text:`${fData.propDNo}`,fontSize:8},{text:`${fData.propVillage}`,fontSize:8},{text:`${fData.propDNo}`,fontSize:8},{text:`${fData.propLandType}`,fontSize:8},{text:`${fData.PropMarkValue}`,fontSize:8},{text:`${fData.propUnitCost}`,fontSize:8}
							// ]
						]
					}
				}

			]
			
			if(data && data?.property && data.property.length > 0){
				let sNo =0;
				for(let i of data.property){
					let [landUse,rest] = i.landUse.split("[");
					let village = i.village ? i.village :"";
					let surveyNo =i.survayNo? i.survayNo:"";
					let mv = i.marketValue ? i.marketValue:0;
					let a;
					if(sNo ===0){
						a =  [{text:sNo+1,fontSize:8},{text:village,fontSize:8},{text:surveyNo,fontSize:8},{text:landUse,fontSize:8},{text:mv,fontSize:8},];
						sNo = sNo+1;
					}else{
						a =  [{text:sNo+1,fontSize:8},{text:village,fontSize:8},{text:surveyNo,fontSize:8},{text:landUse,fontSize:8},{text:mv,fontSize:8}];
						sNo = sNo+1;
					}
					propArry[0].table.body.push(a);
				}
				checkSlip.content[1].table.body.push(propArry);
			}else{
				const a = ["","","","","",""];
				propArry[0].table.body.push(a);
				checkSlip.content[1].table.body.push(propArry)
			};
			checkSlip.content[1].table.body.push([{text:'Structure Details',alignment:'center',fillColor: '#50c4eb',color: '#343f42',}])
			let strArray = [
				{
					style:'insideTable6',
					table:{
						widths:[36,36,60,60,70,36],
						body:[
							[
								{text:'SL No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								 {text:'Floor No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								 {text:'Structure Type',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Plinth(sq. feets)',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								 {text:'Stage of Cons.',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Age',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'}
							],
						]
					}
				}
			]
			
			if(data?.property && data?.property?.length >0){
				for(let i in data.property){
					let propType = data.property[i].propertyType.includes('RURAL') ? 'RURAL':'URBAN';
					if(propType === "URBAN"){
						for(let j in data?.property[i]?.structure){
							let sNo =0;
							let [strType,reststr] = data?.property[i]?.structure[j]?.structureType.split("[");
							let [stageOfCons,restcons] = data?.property[i]?.structure[j]?.stageOfCons.split("[");
							let a;
							if(sNo ===0){
								a =  [{text:sNo+1,fontSize:8},{text:data.property[i]?.structure[j].floorNo,fontSize:8},{text:strType,fontSize:8},{text:"",fontSize:8},{text:stageOfCons,fontSize:8},{text:data?.property[i]?.structure[j].age,fontSize:8}];
								sNo = sNo+1;
							}else{
								a =  [{text:sNo+1,fontSize:8},{text:data.property[i]?.structure[j].floorNo,fontSize:8},{text:strType,fontSize:8},{text:"",fontSize:8},{text:stageOfCons,fontSize:8},{text:data?.property[i]?.structure[j].age,fontSize:8}];
								sNo = sNo+1;
							}
							strArray[0].table.body.push(a);
						}
						checkSlip.content[1].table.body.push(strArray);
					}
				}
			}else{
				const a = ["","","","","",""];
				strArray[0].table.body.push(a);
				checkSlip.content[1].table.body.push(strArray)
			};
			checkSlip.content[1].table.body.push([{text:'Chargeable Value Details',alignment:'center',fillColor: '#50c4eb',color: '#343f42'}])
			let chargeArry =  [
				{
					style:'insideTable7',
					table:{
						widths:[100,129,200],
						body:[
							[
								{text:'Market Value',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Considaration Value',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
								{text:'Chargeable value(Rounded to next Rs.500/-)',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
							],
							// [{text:`${data?.property[0]?.amount}`,fontSize:8,alignment:'center'},{text:`${data?.property[0]?.amount}`,fontSize:8,alignment:'center'},{text:'',fontSize:8,alignment:'center'}]
						]
					}
				}
			]
			if(data?.property){
				for(let i in data?.property){
					let mv = data.property[i].marketValue ? data.property[i].marketValue:0;
					let chargeValue = mv > data.amount ? mv :data.amount;
					const a = [{text:mv,fontSize:8},{text:data.amount,fontSize:8},{text:chargeValue,fontSize:8}];
					chargeArry[0].table.body.push(a);
				}
				checkSlip.content[1].table.body.push(chargeArry);
			}else{
				const a = ["","",""];
				chargeArry[0].table.body.push(a);
				checkSlip.content[1].table.body.push(chargeArry)
			};
			checkSlip.content[1].table.body.push([{text:'payable Amount Details',alignment:'center',fillColor: '#50c4eb',color: '#343f42',}])
						// 		// [{text:'payable Amount Details',alignment:'center',fillColor: '#50c4eb',
			// 		// color: '#343f42',}],
			
			// let payArry = 	[
			// 	{
			// 		style:'insideTable10',
			// 		table:{
			// 			widths:[100,100,70,70,71],
			// 			body:[
			// 				[
			// 					{text:'Total Amount Paid',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 					 {text:'Stamp Duty borne by document',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 					{text:'Challan Date',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 					{text:'Challan No',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 					{text:'Bank',fillColor: '#ede8fa',fontSize:8,bold:true,alignment:'center'},
			// 				],
			// 			]
			// 		}
			// 	}
			// ]
			// if(data?.payment){
			// 	for(let i in data?.payment){
			// 		let totalAmount = data?.payment[i]?.totalAmount ? data?.property[i]?.totalAmount:0;
			// 		let bankTimeStamp  = data?.payment[i]?.bankTimeStamp ? data?.payment[i]?.bankTimeStamp :""
			// 		const a = [{text:totalAmount,fontSize:8},{text:"",fontSize:8},{text:bankTimeStamp,fontSize:8},{text:"",fontSize:8}]
			// 		//[totalAmount,"",bankTimeStamp,"",""];
			// 		payArry[0].table.body.push(a);
			// 	}
			// 	checkSlip.content[1].table.body.push(payArry);
			// }else{
			// 	const a = ["","","","",""];
			// 	payArry[0].table.body.push(a);
			// 	checkSlip.content[1].table.body.push(payArry)
			// };
			checkSlip.content[1].table.body.push([{text:'Disclaimer : Sellers and buyers are responsible for verifying the entered document particulars especially schedule of the property before proceeding to pay the required charges through Online Payment System',alignment:'left',color: 'red',fontSize:8,width:200}])
			
			return checkSlip;
		}
		if(reportType == "acknowledgement"){
			if(data.status == "DRAFT"){
				ackAndSlotStyles.watermark.text ="DRAFT"
			}
			let ackTable ={
				widths:[200,200],
				body:[
					[{text:"Application ID:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${data.applicationId}`,fontSize:12,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Entry Date:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${data.date}`,fontSize:12,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Document By:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${data?.executent[0]?.name}`,fontSize:12,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Document Status:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${data.status}`,fontSize:13,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Document Type:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${naturetype.toUpperCase()}`,fontSize:13,alignment:'left',margin:[0,10,0,0]}],
					// [{text:"Slot Booked Status:",fontSize:12,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${"Not Booked"}`,fontSize:12,alignment:'left',margin:[0,10,0,0]}]
				]
			}
			ackAndSlotStyles.content.map((ac)=>{
				if(ac.style ==="table1")
					ac.table = ackTable;
			})
			return ackAndSlotStyles;
		}
		if(reportType == "slotBookingSlip"){
			if(data.status == "DRAFT"){
				ackAndSlotStyles.watermark.text ="DRAFT"
			}
			let ackTable ={
				widths:[200,200],
				body:[
					[{text:"Application ID:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${data.applicationId}`,fontSize:12,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Slot Booked At:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${data.sroOffice}`,fontSize:12,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Slot Booked On:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`15/03/2023`,fontSize:12,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Slot Time:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${"11:30AM"}`,fontSize:13,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Slot Booked by:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${"SELF"}`,fontSize:13,alignment:'left',margin:[0,10,0,0]}],
					[{text:"Slot Booked from IP:",fontSize:12,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${"XX.XX.XXX.XXX"}`,fontSize:12,alignment:'left',margin:[0,10,0,0]}]
				]
			}
			ackAndSlotStyles.content.map((ac)=>{
				if(ac.style ==="table1")
					ac.table = ackTable;
			})
			return ackAndSlotStyles;
		}
		if(reportType == "formSixty"){
			return formSixtyStyles
		};
		if(reportType == "engDocs"){
			pdeStyle.content =[];
			let [TRAN_DESC,rest] = data.registrationType.TRAN_DESC ? data.registrationType.TRAN_DESC.split("[") :["",""];
			pdeStyle.content.push({text:`${naturetype} DEED`.toUpperCase(),alignment: 'center',bold:true,decoration:'underline',margin:[10,250,0,5]});
			pdeStyle.content.push(' ');
			pdeStyle.content.push({text:`This ${naturetype.toUpperCase()} DEED is made and executed on this ${dd} day of ${mm} , ${yyyy}, by :`, style:['p1sideHeaders']});
			if(data?.executent && data?.executent.length >0){
				for(var i=0;i<data.executent.length;i++){
					let address =data?.executent[i]?.address.replace(/\n/g, '');
					let name = data?.executent[i]?.name ? data?.executent[i]?.name.toUpperCase():"............";
					let relationType = data?.executent[i]?.relationType ? data?.executent[i]?.relationType:"............";
					let relationName = data?.executent[i]?.relationName ? data?.executent[i]?.relationName.toUpperCase():"............";
					let age = data?.executent[i]?.age ? data?.executent[i]?.age:"............";
					pdeStyle.content.push({
						text:`\nMr/Mrs. ${name}, ${relationType}.${relationName} , aged about ${age} years,Presently residing at ${address.toUpperCase()}`,style:["p1Text"]
					})
				}
				pdeStyle.content.push({text: `Herein after called the '${partyType1}' of the first part`,style:["p1Points"]});
			}else{
				pdeStyle.content.push({
					text:`\nMr/Mrs. ..............., ......................... , aged about ............ years,Presently residing at ...................`,style:["p1Text"]
				});
				pdeStyle.content.push({text: `Herein after called the '${partyType1}' of the first part`,style:["p1Points"]});
			}
			pdeStyle.content.push({text:'AND',alignment: 'center',bold:true,decoration:'underline',margin:[10,10,0,0]})
			if(data?.claimant && data?.claimant.length >0){
				for(var i=0;i<data.claimant.length;i++){
					let address =data?.claimant[i]?.address.replace(/\n/g, '');
					let name = data?.claimant[i]?.name ? data?.claimant[i]?.name.toUpperCase():"............";
					let relationType = data?.claimant[i]?.relationType ? data?.claimant[i]?.relationType:"............";
					let relationName = data?.claimant[i]?.relationName ? data?.claimant[i]?.relationName.toUpperCase():"............";
					let age = data?.claimant[i]?.age ? data?.claimant[i]?.age:"............";
					pdeStyle.content.push({
						text:`\nMr/Mrs. ${name}, ${relationType} ${relationName} , aged about ${age}  years, Presently residing at ${address.toUpperCase()}`,style:["p1Text"]
					})
				}
				pdeStyle.content.push({text: `Herein after called the '${partyType2}' of the second part`,style:["p1Points"]});
			}else{
				pdeStyle.content.push({
					text:`\nMr/Mrs. ................, ......................... , aged about ............ years,Presently residing at ....................`,style:["p1Text"]
				});
				pdeStyle.content.push({text: `Herein after called the '${partyType2}' of the second part`,style:["p1Points"]});
			}
			// if(TRAN_DESC === "Sale"){

			// }
			if(TRAN_DESC ){
				//pdeStyle.content.push({text:`PDE ID : ${data.applicationId}`,alignment:"right"});

				let amountInWords =await NumToWord(data.amount);
				if(data?.property && data.property.length >0){
					for(let i in data?.property){
						let [landUse,rest] = data.property[i].landUse ? data.property[i].landUse.split("[") :["............",""];
						let [acr,cent] = data?.property[i]?.tExtent ? data.property[i].tExtent.split("."):["............","............"];
						let linkedText ;
						if(data?.property[i]?.LinkedDocDetails && data?.property[i]?.LinkedDocDetails?.length > 0){
							for(let i in data?.property[i]?.LinkedDocDetails){
								let linkDocNo = data.property[i].LinkedDocDetails.linkDocNo ? data.property[i].LinkedDocDetails.linkDocNo : "............"
								let year = data.property[i].LinkedDocDetails.year ? data.property[i].LinkedDocDetails.year : "............"
								let bookNo = data.property[i].LinkedDocDetails.bookNo ? data.property[i].LinkedDocDetails.bookNo : "............"
								linkedText =`virtue of registered document bearing the number ${linkDocNo} of ${year} of book ${bookNo}`
							}
						}else{
							linkedText = `inheritance`
						}
						if(naturetype =="Sale"){
							let survayNo = data.property[i].survayNo ? data.property[i].survayNo :"............";
							let habitation = data.property[i].habitation ? data.property[i].habitation :"............";
							let district = data.property[i].district ? data.property[i].district :"............";
							let sroOffice = data.property[i].sroOffice ? data.property[i].sroOffice :"............";
							let amount = data.amount ? data.amount :"............";
							let am = amountInWords ? amountInWords :"............";

							pdeStyle.content.push({text:`(the terms 'THE VENDOR' and the 'THE VENDEE' herein used shall wherever the context so admit mean and include all their respective heirs, executors, successors, legal representatives,partners, directors,administrators and assignees etc..., thereof) Whereas the Vendor is the absolute owner and possessor of ${landUse} measuring ${acr}Acres ${cent}Cents forming part of Survey No ${survayNo}, situated at ${habitation} , ${district} District Whereas VENDOR has acquired the schedule property by ${linkedText} registered at SRO ${sroOffice} and since from the date of acquisition, the VENDOR is in peaceful possession of the same.Whereas the vendor herein offered to sell the schedule property, which is free from all kinds ofencumbrances for a total sale consideration of Rs.${amount}/ (Rupees ${am} only) to the vendee and the vendee has agreed to purchase the same for the said consideration`,style:["p3Text1_main1"]});
						}
						
					}
				}else{
					pdeStyle.content.push({text:`(the terms 'THE VENDOR' and the 'THE VENDEE' herein used shall wherever the context so admit mean and include all their respective heirs, executors, successors, legal representatives,partners, directors,administrators and assignees etc..., thereof) Whereas the Vendor is the absolute owner and possessor of ............ measuring ............Acres ............Cents forming part of Survey No ............, situated at ............ , ............ District Whereas VENDOR has acquired the schedule property by ............ registered at SRO ............ and since from the date of acquisition, the VENDOR is in peaceful possession of the same.Whereas the vendor herein offered to sell the schedule property, which is free from all kinds ofencumbrances for a total sale consideration of Rs............./ (Rupees ............ only) to the vendee and the vendee has agreed to purchase the same for the said consideration`,style:["p3Text1_main1"]});
				}

				// pdeStyle.content.push({text:`PDE ID : ${data.applicationId}`,alignment:"right"});

				if(naturetype == "Sale"){
					pdeStyle.content.push({text:`NOW THEREFORE THIS DEED OF ABSOLUTE ${naturetype.toUpperCase()} WITNESSETH AS HERE UNDER:`,style:["p2Header_main"]});
					
					

					pdeStyle.content.push({text:`1.In pursuance of the said offer and acceptance the ${partyType2} has paid the entire consideration a sum of Rs.${data.amount}/- (Rupees ${amountInWords} Only) to the ${partyType1} in the following manner.`,style:["p3Text1_main3"]});
					if(data?.payment && data?.payment.length >0){
						
						let payNo = 0;
						for(let i in data?.payment){
							let payinword = await NumToWord(data?.payment[i]?.payAmount);
							let payDate = new Date(data?.payment[i]?.dateOfPayment).toLocaleDateString();
							payNo = payNo +1;
							if(payNo ==1){
								pdeStyle.content.push({text:`${payNo}. Rs ${data.payment[i].payAmount}/- (${payinword}) paid by ${data.payment[i].paymentMode} Dated ${payDate}.`,style:["p3text1_pay"]})
							}else{
								pdeStyle.content.push({text:`${payNo}. Rs ${data.payment[i].payAmount}/- (${payinword}) paid by ${data.payment[i].paymentMode} Dated ${payDate}.`,style:["p3text1_pay"]})
							}
						}
						pdeStyle.content.push({text:`\n\nAnd the VENDOR hereby admits and acknowledges the same.`,style:["p3text1_pay"]});
						
					};
				}else if(naturetype =="SETTLEMENT"){
					pdeStyle.content.push({text:`NOW THIS ${naturetype} DEED WITNESSES AS FOLLOWS:`,style:["p2Header_main"]});
					pdeStyle.content.push({text:`1.The ${partyType1} hereby declare that the ${partyType1} is the rightful owner, and is having full right and absolute authority to settle the schedule property to the ${partyType2} and that the schedule property is free from all kinds of encumbrances, charges, lien, claims and demands of whatsoever nature and that the ${partyType1} has paid all taxes etc., payable on the schedule property up to date and there are no dues of any kind against the said property.`,style:["p3Text1_main3"]})
				}
				pdeStyle.content.push({text:covenantArr,style:["covanants"]});
				// pdeStyle.content.push({text:`PDE ID : ${data.applicationId}`,alignment:"right"});

				//PropertyDetails**
				pdeStyle.content.push({text:'SCHEDULE OF PROPERTY',alignment: 'center',bold:true,decoration:'underline',margin:[10,10,0,5]});
				if(data.property && data.property.length >0){
					for(var i=0;i<data.property.length;i++) {
						let [landUse,rest] = data.property[i].landUse.split("[");
						let propType = data.property[i].propertyType.includes('RURAL') ? 'RURAL':'URBAN';
						pdeStyle.content.push({text: [{text:`Schedule ${data.property[i].seqNumber}:`, style: ['f18']},{text:` ${landUse}`,fontSize:'12'}] });
	
						pdeStyle.content.push({text:'Location of the Property',style:['sideHeaderNames']});
						pdeStyle.content.push({ table:{
							widths:[120,120,120,120],
							body:[
								[{text: 'Registration District', alignment: 'center',bold:true,width:'*', margin:[10,1,27,0]}, {text: 'Sub Registrar Office', bold:true, alignment: 'center',width:'*', margin:[10,1,27,0]}, {text: 'Village', bold:true, alignment: 'center',width:'*', margin:[20,1,27,0]},{text: 'Mandal', bold:true, alignment: 'center',width:'*', margin:[20,1,27,0]}],
								[{text:`${data?.property[i].district}`,alignment:'center'}, {text:`${data?.property[i].sroOffice}`,alignment:'center'}, {text:`${data?.property[i]?.village}`,alignment:'center'}, {text: `${data?.property[i]?.village}`, alignment:'center'}]
							]
						}});
						pdeStyle.content.push(' ');
						pdeStyle.content.push({ table:{
							widths:[250,249],
							body:[
								[{text: 'Revenue District', alignment: 'center',bold:true }, {text: 'Local Body', bold:true, alignment: 'center', }],
								[{text:`${data?.property[i]?.district}`,alignment:'center'}, {text:`${data?.property[i]?.sroOffice}`,alignment:'center'}]
							]
						}});
						pdeStyle.content.push({text:'Land Details',style:['sideHeaderNames']});
						const locality = data?.property[i].locality !=""  ? data?.property[i].locality :data?.property[i].habitation;	
						if(propType === "URBAN"){
							pdeStyle.content.push({ table:{
								widths:[90,30,35,40,50,50,70,80],
								body:[
									[{text: 'Locality/Habitation', alignment: 'center',bold:true }, 
									{text: 'Ward', bold:true, alignment: 'center'}, 
									{text: 'Block', bold:true, alignment: 'center'},
									{text: 'Door\nNo', bold:true, alignment: 'center'},
									{text: 'Survey/\nTSurvey Number', bold:true, alignment: 'center'},
									{text: 'Total Extent\n(Sq.Yards)', alignment: 'center',bold:true},
									{text: 'Undivided \nShare(Sq.Yards)', alignment: 'center',bold:true},
									{text: 'Market value', alignment: 'center',bold:true}],
									[
										{text:`${locality}`,alignment:'center'},
										{text:`${data?.property[i].ward}`,alignment:'center'}, 
										{text:`${data?.property[i].block}`,alignment:'center'}, 
										{text: `${data?.property[i].doorNo}`, alignment:'center'},
										{text: `${data?.property[i].survayNo}`, alignment:'center'},
										{text: `${data?.property[i].extent}`, alignment:'center'}, //totalext
										{text: `${data?.property[i].undividedShare}`, alignment:'center'},
										{text:`${data?.property[i].marketValue}`, alignment:'center'}
									]
								]
								
							}});
							pdeStyle.content.push({columns:[
								{text:'Structure Details',style:['sideHeaderNames']},
								{text:`Apartment Name :  ${data?.property[i].appartmentName.toUpperCase()}`,style:['sideHeaderNames']},
								{text:`No of Floors : ${data?.property[i].totalFloors}`,style:['sideHeaderNamesright']}
							]
							});
							if(data?.property[i]?.structure?.length > 0){
								for(var j=0;j<data?.property[i]?.structure.length;j++){
									pdeStyle.content.push({
										table:{
											body:[
												[
													{text: 'Floor No', alignment: 'center',bold:true,width:'*', margin:[10,1,25,0]}, {text: 'Structure type', bold:true, alignment: 'center',width:'*', margin:[0,0,25,0]},{text: 'Plinth(sq feets) ', bold:true, alignment: 'center',width:'*', margin:[0,0,27,0]},{text: 'Stage of Cons.', bold:true, alignment: 'center',width:'*', margin:[0,0,25,0]},{text: 'Age', bold:true, alignment: 'center',width:'*', margin:[0,0,30,0]}],
													
												[
													{text:`${data?.property[i]?.structure[j].floorNo}`,alignment:'center'},{text:`${data?.property[i]?.structure[j].structureType}`,alignment:'center'}, {text:`${data?.property[i]?.structure[j].plinth}`,alignment:'center'},{text: `${data?.property[i]?.structure[j].stageOfCons}`, alignment:'center'},{text: `${data?.property[i]?.structure[j].age}`, alignment:'center'}
												]
											]
										}
									})
								}
	
							}
							pdeStyle.content.push({text:'Flat Boundary Details',style:['sideHeaderNames']});
							pdeStyle.content.push({table:{
								widths:[208,290],
								body:[
									[{text: 'East', alignment: 'left',width:'*', margin:[10,0,165,0]}, {text: `${data?.property[i]?.flatEastBoundry.slice(0,20)}`,  alignment: 'left', margin:[10,0,200,0]}],
									[{text: 'West', alignment: 'left',width:'*', margin:[10,0,154,0]}, {text: `${data?.property[i]?.flatWestBoundry}`,  alignment: 'left', margin:[10,0,100,0]}],
									[{text: 'North', alignment: 'left',width:'*', margin:[10,0,154,0]}, {text: `${data?.property[i]?.flatNorthBoundry}`, alignment: 'left', margin:[10,0,100,0]}],
									[{text: 'South', alignment: 'left',width:'*', margin:[10,0,154,0]}, {text: `${data?.property[i]?.flatSouthBoundry}`,  alignment: 'left', margin:[10,0,100,0]}],
								]
							}})
							pdeStyle.content.push({text:'Apartment Boundary Details',style:['sideHeaderNames']});
							pdeStyle.content.push({table:{
								widths:[208,290],
								body:[
									[{text: 'East', alignment: 'left',width:'*', margin:[10,0,165,0]}, {text: `${data?.property[i]?.eastBoundry.slice(0,20)}`,  alignment: 'left', margin:[10,0,200,0]}],
									[{text: 'West', alignment: 'left',width:'*', margin:[10,0,154,0]}, {text: `${data?.property[i]?.westBoundry}`,  alignment: 'left', margin:[10,0,100,0]}],
									[{text: 'North', alignment: 'left',width:'*', margin:[10,0,154,0]}, {text: `${data?.property[i]?.northBoundry}`, alignment: 'left', margin:[10,0,100,0]}],
									[{text: 'South', alignment: 'left',width:'*', margin:[10,0,154,0]}, {text: `${data?.property[i]?.southBoundry}`,  alignment: 'left', margin:[10,0,100,0]}],
								]
							},pageBreak:"after"})
						};
						if(propType === "RURAL"){
							pdeStyle.content.push({ table:{
								widths:[120,200,170],
								body:[
									[{text: 'Locality/Habitation', alignment: 'center',bold:true },
									{text: 'Survey/\nTSurvey Number', bold:true, alignment: 'center'},
									{text: 'Market value', alignment: 'center',bold:true}],
									[
										{text:`${locality}`,alignment:'center'},
										{text: `${data?.property[i].survayNo}`, alignment:'center'},
										{text:`${data?.property[i].marketValue}`, alignment:'center'}
									]
								]
								
							}});
						}
						pdeStyle.content.push(' ');
					}
				}else{
					pdeStyle.content.push({text: [{text:`Schedule ....:`, style: ['f18']},{text:`.........`,fontSize:'12'}] });
					pdeStyle.content.push({text:'Location of the Property',style:['sideHeaderNames']});
					pdeStyle.content.push({ table:{
						widths:[120,120,120,120],
						body:[
							[{text: 'Registration District', alignment: 'center',bold:true,width:'*', margin:[10,1,27,0]}, {text: 'Sub Registrar Office', bold:true, alignment: 'center',width:'*', margin:[10,1,27,0]}, {text: 'Village', bold:true, alignment: 'center',width:'*', margin:[20,1,27,0]},{text: 'Mandal', bold:true, alignment: 'center',width:'*', margin:[20,1,27,0]}],
							[{text:` `,alignment:'center'}, {text:` `,alignment:'center'}, {text:` `,alignment:'center'}, {text: ` `, alignment:'center'}]
						]
					}});
					pdeStyle.content.push(' ');
					pdeStyle.content.push({ table:{
						widths:[250,249],
						body:[
							[{text: 'Revenue District', alignment: 'center',bold:true }, {text: 'Local Body', bold:true, alignment: 'center', }],
							[{text:` `,alignment:'center'}, {text:` `,alignment:'center'}]
						]
					}});
					pdeStyle.content.push({text:'Land Details',style:['sideHeaderNames']});

					// if(propType === "RURAL"){
						pdeStyle.content.push({ table:{
							widths:[120,200,170],
							body:[
								[{text: 'Locality/Habitation', alignment: 'center',bold:true },
								{text: 'Survey/\nTSurvey Number', bold:true, alignment: 'center'},
								{text: 'Market value', alignment: 'center',bold:true}],
								[
									{text:`    `,alignment:'center'},
									{text: `     `, alignment:'center'},
									{text:`      `, alignment:'center'}
								]
							]
							
						}});
					// }
					pdeStyle.content.push(' ');
				}


				pdeStyle.content.push({ table:{
					widths:[250,249],
					body:[
						[{text: 'Chargeable Value(Round to next 500/-)', alignment: 'left',width:'*', margin:[10,0,0,0]}, {text: `${data.amount}`,  alignment: 'left',width:'*', margin:[10,5,188,0]}]
					]
				}})
				pdeStyle.content.push({text:`PDE ID : ${data.applicationId}`,alignment:"right",pageBreak:'before'});
				pdeStyle.content.push({text:'Execution Details',alignment: 'center',bold:true,decoration:'underline',margin:[10,20,0,5]})
				pdeStyle.content.push({text:`In witness whereof,  the ${partyType1.toUpperCase()} herein has signed on this  Settlement  Deed  with free will and on the day, month and year first above mentioned in the presence of the following witnesses.`,style:["p3Text1_main2"]});

				pdeStyle.content.push({text:partyType1,style:"p3Text1_settlor"});
				if(data?.executent && data?.executent.length >0){
					let excount = 1;
					for(let i in data?.executent){
						pdeStyle.content.push({text:`${excount}`,margin:[50,20,0,0]})
						pdeStyle.content.push({text:`Signature:        `+'\n'+'\n'+
						`Name:   ${data?.executent[i]?.name}`
						+'\n'+'\n'+
						`Aadhar Number: ${data?.executent[i]?.aadhaar}`+'\n'+'\n'+
						`FORM60`
						,style:"p3Text1_settlor1"});
						excount = excount+1;
						if(data?.executent[i]?.represent.length >0){
							pdeStyle.content.push({text:`Reprentated By :`,style:"p3Text1_settlor"});
							let repCount =1;
							for(let j in data?.executent[i].represent){
								pdeStyle.content.push({text:`${repCount}`,margin:[50,20,0,0]})
								pdeStyle.content.push({text:`Signature:        `+'\n'+'\n'+
								`Name:   ${data?.executent[i]?.represent[j].name}`
								+'\n'+'\n'+
								`Aadhar Number: ${data?.executent[i]?.represent[j].aadhaar}`+'\n'+'\n'+
								`FORM60`,style:"p3Text1_settlor1"})
								repCount = repCount+1;
							}
						}
					}
				}else{
					pdeStyle.content.push({text:`${1}`,margin:[50,20,0,0]})
					pdeStyle.content.push({text:`Signature:        `+'\n'+'\n'+
					`Name:   XXXXXXXX XXX`
					+'\n'+'\n'+
					`Aadhar Number: XXXX XXXX XXXX XXXX`+'\n'+'\n'+
					`FORM60`
					,style:"p3Text1_settlor1"});
				}

				pdeStyle.content.push({text:partyType2,style:"p3Text1_settlor"});
				if(data?.claimant && data?.claimant.length >0){
					let excount = 1;
					for(let i in data?.claimant){
						pdeStyle.content.push({text:`${excount}`,margin:[50,20,0,0]})
						pdeStyle.content.push({text:`Signature:        `+'\n'+'\n'+
						`Name:   ${data?.claimant[i]?.name}`
						+'\n'+'\n'+
						`Aadhar Number: ${data?.claimant[i]?.aadhaar}`+'\n'+'\n'+
						`FORM60`
						,style:"p3Text1_settlor1"});
						excount = excount+1;
						if(data?.claimant[i]?.represent.length >0){
							pdeStyle.content.push({text:`Reprentated By :`,style:"p3Text1_settlor"});
							let repCount =1;
							for(let j in data?.claimant[i].represent){
								pdeStyle.content.push({text:`${repCount}`,margin:[50,20,0,0]})
								pdeStyle.content.push({text:`Signature:        `+'\n'+'\n'+
								`Name:   ${data?.claimant[i]?.represent[j].name}`
								+'\n'+'\n'+
								`Aadhar Number: ${data?.claimant[i]?.represent[j].aadhaar}`+'\n'+'\n'+
								`FORM60`,style:"p3Text1_settlor1"})
								repCount = repCount+1;
							}
						}
					}
				}else{
					pdeStyle.content.push({text:`${1}`,margin:[50,20,0,0]})
					pdeStyle.content.push({text:`Signature:        `+'\n'+'\n'+
					`Name:   XXXXXXXX XXX`
					+'\n'+'\n'+
					`Aadhar Number: XXXX XXXX XXXX XXXX`+'\n'+'\n'+
					`FORM60`
					,style:"p3Text1_settlor1"});
				}
				pdeStyle.content.push({text:" ",pageBreak:"after"});
				let rect = {
					type: 'rect',x: 0,y: 1,w: 240,h: 97,lineColor: 'black'
				};
				let rect1 = {
					type: 'rect',x: 0,y: 1,w: 240,h: 97,lineColor: 'black'
				};

				pdeStyle.content.push({table:{
					body:[
						[{text: 'WITNESS 1', alignment: 'center',width:'*', margin:[10,0,160,0]}, {text: `WITNESS 2`,  alignment: 'center',width:'*', margin:[10,0,140,0]}],
						[	
							{
								stack:[
									{canvas: [rect]},  {columns: [
										{
										width: rect.w,
										noWrap: false,
										maxHeight: rect.h,
										text: `(                                                                )`,
										color: 'black'
										}],
										relativePosition: {
										x: 1,
										y: - rect.h
										}
										}
								]
								
							},
							{
								stack:[
									{canvas: [rect1]},  {columns: [
										{
										width: rect1.w,
										noWrap: false,
										maxHeight: rect1.h,
										text: `(                                                                )`,
										color: 'black'
										}],
										relativePosition: {
										x: 1,
										y: - rect1.h
										}
									}
								]
			
							}
						]
					
					]
				}});
				// pdeStyle.content.push({text:"Prepared By :",margin:[10,30,0,0],decoration:"underline",bold:true});
				// if(data?.presenter){
				// 	for(let i in data?.presenter){
				// 		pdeStyle.content.push({text:`Signature`+'\n'+'\n'+`Full Name : ${data.presenter[i].name}`+'\n'+'\n'+`Aadhar No : ${data?.presenter[i]?.aadhaar}`+'\n'+'\n'+'\n'+'Photos',style:["p3witness"]});
				// 	}
				// };
				return pdeStyle;
			}
		}
	}catch(ex){
		console.log("error ::",ex)
		throw new CARDError({status:false,message:"Internal Server"});
	}
};

const genTeluguReports = async(data,path,type)=>{
	try{
		let pdfDocs = new pdfDoc();
		pdfDocs.pipe(fs.createWriteStream(path));
		pdfDocs.font(Path.join(__dirname,'../../fonts','telugu.ttf'));
		if(type == 'rent'){
			pdfDocs.fontSize('18').text(rentsDocs.page1Header,50,10,{align:'center'});
			pdfDocs.fontSize('15').text(rentsDocs.sideHeader1,40,50,{align: 'center'});
			pdfDocs.fontSize('15').text(rentsDocs.sideHeader2,40,70,{align: 'center'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeader3,30,90,{align: 'center'});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,120,{align:'justify',lineGap:0});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeader4,90,190,{align: 'left'});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,220,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,350,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text4,50,420,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text5,50,500,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text6,50,620,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(rentsDocs.page2Header,50,20,{align:'center'});
			pdfDocs.fontSize('11').text(rentsDocs.text7,50,70,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text8,50,130,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text9,50,230,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text10,50,350,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text11,50,470,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text12,50,550,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text13,70,620,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(rentsDocs.page3Header,50,20,{align:'center'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeaderLeft,40,60,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderLeft1,40,90,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderLeft2,40,120,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderRight1,40,90,{align: 'right'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderRight2,40,120,{align: 'right'});
			pdfDocs.fontSize('15').text(rentsDocs.sideHeader1,50,180,{align:'center'});

			pdfDocs.fontSize('14').text(rentsDocs.sideHeader1,50,210,{align:'center'});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,260,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,360,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,450,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,480,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,550,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,640,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(rentsDocs.page1Header,50,20,{align:'center'});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,70,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,180,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,290,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,360,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,430,{align:'justify',lineGap:0});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeader1,70,530,{align:'left'});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,570,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(rentsDocs.page1Header,50,20,{align:'center'});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,70,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,200,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text2,80,420,{align:'justify',lineGap:0});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeaderLeft,40,460,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderLeft,40,500,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderLeft,40,530,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderRight1,40,500,{align: 'right'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderRight1,40,530,{align: 'right'});
			pdfDocs.fontSize('15').text(rentsDocs.sideHeader1,50,600,{align:'center'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeader1,50,630,{align:'center'});
			pdfDocs.fontSize('11').text(rentsDocs.text2,90,660,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(rentsDocs.page1Header,50,20,{align:'center'});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,70,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,160,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,210,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text3,60,250,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,290,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,420,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,510,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,580,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,610,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(rentsDocs.page1Header,50,20,{align:'center'});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,70,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text4,50,120,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text1,50,210,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text2,50,280,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text3,50,380,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(rentsDocs.text4,70,620,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(rentsDocs.page1Header,50,20,{align:'center'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeaderLeft,40,60,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderLeft,40,90,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderLeft,40,120,{align: 'left'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderRight1,40,90,{align: 'right'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderRight1,40,120,{align: 'right'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeader1,40,180,{align: 'center'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeaderLeft,30,240,{align: 'left'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeaderLeft1,100,240,{align: 'left'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeaderLeft1,190,240,{align: 'left'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeaderLeft1,350,240,{align: 'left'});
			pdfDocs.fontSize('14').text(rentsDocs.sideHeaderRight1,20,240,{align: 'right'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderRight1,40,350,{align: 'right'});
			pdfDocs.fontSize('13').text(rentsDocs.sideHeaderRight1,40,400,{align: 'right'});

		}else if(type =='saleDeed'){

			pdfDocs.fontSize('15').text(saleDeedDocs.page1Header,50,10,{align:'center'})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,50,{align:'center'})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader2,40,70,{align:'center'})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader3,40,90,{align:'center'})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,120,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,220,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,310,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text5,40,370,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text6,40,450,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text7,40,580,{align:'justify',lineGap:0})
			pdfDocs.addPage()
			pdfDocs.fontSize('15').text(saleDeedDocs.page2Header,50,10,{align:'center'})
			pdfDocs.fontSize('12').text(saleDeedDocs.text8,40,50,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text9,40,120,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text10,40,180,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text11,40,320,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text12,40,400,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheaderRight1,40,470,{align:'right',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheaderRight2,40,500,{align:'right',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader4,40,540,{align:'center',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,570,{align:'center',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,600,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,660,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,700,{align:'justify',lineGap:0})
			pdfDocs.fontSize('16').text(saleDeedDocs.page1Header,40,10,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,160,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,240,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,320,{align:'justify',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,410,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,450,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,590,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,655,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,695,{align:'justify',lineGap:0})
			pdfDocs.addPage()
			pdfDocs.fontSize('15').text(saleDeedDocs.page1Header,40,10,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,50,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,170,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,250,{align:'justify',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,330,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,370,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,420,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,440,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,460,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,480,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheader1,40,530,{align:'left',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,580,{align:'justify',lineGap:0})
			pdfDocs.addPage()
			pdfDocs.fontSize('15').text(saleDeedDocs.page1Header,40,10,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,50,{align:'justify',lineGap:0})
			pdfDocs.fontSize('14').text(saleDeedDocs.sideheader1,40,100,{align:'left',lineGap:0})
			pdfDocs.fontSize('14').text(saleDeedDocs.sideheader2,40,130,{align:'left',lineGap:0})
			pdfDocs.fontSize('14').text(saleDeedDocs.sideheader3,40,160,{align:'left',lineGap:0})
			pdfDocs.fontSize('14').text(saleDeedDocs.sideheaderRight1,40,130,{align:'right',lineGap:0})
			pdfDocs.fontSize('14').text(saleDeedDocs.sideheaderRight2,40,160,{align:'right',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,200,{align:'center',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,230,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,260,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,360,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,430,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,460,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,530,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,580,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,630,{align:'justify',lineGap:0})
			pdfDocs.addPage()
			pdfDocs.fontSize('15').text(saleDeedDocs.page1Header,40,10,{align:'center',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,40,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,90,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheader1,40,180,{align:'left',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheader1,40,210,{align:'left',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheader1,40,240,{align:'left',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheader1,40,270,{align:'left',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text4,40,300,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text1,40,320,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text2,40,360,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text3,40,400,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text4,40,440,{align:'justify',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text4,40,560,{align:'justify',lineGap:0})
			pdfDocs.addPage()
			pdfDocs.fontSize('15').text(saleDeedDocs.page1Header,40,10,{align:'center',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.text4,40,50,{align:'justify',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,100,{align:'left',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,120,{align:'left',lineGap:0})
			pdfDocs.fontSize('15').text(saleDeedDocs.sideheader1,40,150,{align:'left',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheader4,40,120,{align:'right',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheader1,40,140,{align:'right',lineGap:0})
			pdfDocs.fontSize('12').text(saleDeedDocs.sideheader1,40,160,{align:'right',lineGap:0})
		}else if(type == 'mortagage'){
			// pdfDocs.fontSize('18').text(mortagageDocs.page1Header,50,10,{align:'center'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader1,40,50,{align: 'center'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader2,40,80,{align: 'center'});
			pdfDocs.fontSize('18').text(mortagageDocs.sideHeader3,30,100,{align: 'center'});
			pdfDocs.fontSize('11').text(mortagageDocs.text1,50,130,{align:'justify',lineGap:0});
			pdfDocs.fontSize('14').text(mortagageDocs.sideHeader4,90,190,{align: 'left'});
			pdfDocs.fontSize('11').text(mortagageDocs.text2,50,220,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(mortagageDocs.text3,50,330,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(mortagageDocs.text4,50,480,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(mortagageDocs.text5,50,530,{align:'justify',lineGap:0});
			pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft,40,560,{align: 'left'});
			pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft1,40,590,{align: 'left'});
			pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft2,40,620,{align: 'left'});
			pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight1,40,590,{align: 'right'});
			pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight2,40,620,{align: 'right'});
			// pdfDocs.addPage();
			// pdfDocs.fontSize('18').text(mortagageDocs.page2Header,50,10,{align:'center'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader5,40,50,{align: 'center'});

			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader6,40,80,{align: 'center'});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader7,30,100,{align: 'center'});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader7a,30,120,{align: 'center'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text6,50,150,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader8,90,180,{align: 'left'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text7,50,220,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text8,50,350,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text9,50,420,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text10,50,470,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text11,50,520,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text12,50,610,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text13,50,660,{align:'justify',lineGap:0});
			// pdfDocs.addPage();
			// pdfDocs.fontSize('18').text(mortagageDocs.page3Header,50,10,{align:'center'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text14,50,70,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft3,40,120,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft4,40,150,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft5,40,180,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight3,40,150,{align: 'right'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight4,40,180,{align: 'right'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader9,40,220,{align: 'center'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader10,40,250,{align: 'center'});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader11,40,280,{align: 'center'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text15,50,310,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text16,50,420,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text17,50,470,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text18,50,600,{align:'justify',lineGap:0});
			// pdfDocs.addPage();
			// pdfDocs.fontSize('18').text(mortagageDocs.page4Header,50,10,{align:'center'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text19,50,70,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text20,50,240,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text21,50,300,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text22,50,410,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text23,50,460,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text24,50,610,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('18').text(mortagageDocs.page5Header,50,10,{align:'center'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text25,50,140,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text26,80,190,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft6,40,220,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft7,40,250,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft8,40,280,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight5,40,250,{align: 'right'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight6,40,280,{align: 'right'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader12,40,340,{align: 'center'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader13,40,370,{align: 'center'});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader14,40,390,{align: 'center'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text27,50,420,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text28,50,490,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text29,50,550,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text30,50,600,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text31,50,650,{align:'justify',lineGap:0});
			// pdfDocs.addPage();
			// pdfDocs.fontSize('18').text(mortagageDocs.page6Header,50,10,{align:'center'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text32,50,60,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text33,50,170,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text34,50,220,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text35,50,270,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text36,50,320,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text37,50,370,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text38,50,420,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text39,50,470,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text40,50,560,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft6,40,600,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft7,40,630,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft8,40,670,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight7,40,630,{align: 'right'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight8,40,670,{align: 'right'});
			// pdfDocs.addPage();
			// pdfDocs.fontSize('18').text(mortagageDocs.page7Header,50,10,{align:'center'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader15,40,50,{align: 'center'});
			// pdfDocs.fontSize('15').text(mortagageDocs.sideHeader16,40,80,{align: 'center'});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader17,30,100,{align: 'center'});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader18,30,120,{align: 'center'});
			// pdfDocs.fontSize('11').text(mortagageDocs.text41,50,150,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text42,50,320,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text43,50,390,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text44,50,460,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text45,50,510,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text46,50,600,{align:'justify',lineGap:0});
			// pdfDocs.fontSize('11').text(mortagageDocs.text47,50,670,{align:'justify',lineGap:0});
			// pdfDocs.addPage();
			// pdfDocs.fontSize('18').text(mortagageDocs.page8Header,50,10,{align:'center'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft12,40,70,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft13,40,100,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderLeft14,40,130,{align: 'left'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight9,40,100,{align: 'right'});
			// pdfDocs.fontSize('13').text(mortagageDocs.sideHeaderRight10,40,130,{align: 'right'});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader19,50,180,{align: 'center'});
			// pdfDocs.fontSize('14').text(mortagageDocs.sideHeader20,50,210,{align: 'center'});
		}else if(type == "gift"){
			pdfDocs.fontSize("15").text(giftDocs.page1Header,50,10, { align: "center" });
			pdfDocs.fontSize("15").text(giftDocs.sideheader1,40,50, { align: "center" });
		  pdfDocs.fontSize("15").text(giftDocs.sideheader2,40,70, { align: "center" });
		  pdfDocs.fontSize("15").text(giftDocs.sideheader3,40,90, { align: "center" });
		  pdfDocs.fontSize("12").text(giftDocs.text1,40,130,{align:'justify',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.text2,40,230,{align:'justify',lineGap:0 })
		  pdfDocs.fontSize("12").text(giftDocs.text3,40,320,{align:'justify',lineGap:0 });
		  pdfDocs.fontSize("16").text(giftDocs.page2Header,40,410,{align:'center',lineGap:0 });
		  pdfDocs.fontSize("15").text(giftDocs.sideheader4,40,440,{align:'center',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.text4,40,480,{align:'justify',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.text5,40,620,{align:'justify',lineGap:0 });
		  pdfDocs.addPage()
		  pdfDocs.fontSize("12").text(giftDocs.text6,40,30,{align:'justify',lineGap:0 });
		  pdfDocs.fontSize("15").text(giftDocs.sideheader5,40,90,{align:'left',lineGap:0 });
		  pdfDocs.fontSize("15").text(giftDocs.sideheaderLeft1,40,120,{align:'left',lineGap:0 });
		  pdfDocs.fontSize("15").text(giftDocs.sideheaderLeft2,40,150,{align:'left',lineGap:0 })
		  pdfDocs.fontSize("12").text(giftDocs.sideheaderRight1,40,120,{align:'right',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.sideheaderRight2,40,140,{align:'right',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.sideheaderRight3,40,160,{align:'right',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.sideheaderRight4,40,180,{align:'right',lineGap:0 })
		  pdfDocs.fontSize("15").text(giftDocs.sideheader6,40,220,{align:'center',lineGap:0 })
		  pdfDocs.fontSize("15").text(giftDocs.sideheader1,40,250,{align:'center',lineGap:0 });
		  pdfDocs.fontSize("15").text(giftDocs.sideheader1,40,280,{align:'center',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.text1,40,320,{align:'justify',lineGap:0 })
		  pdfDocs.fontSize("15").text(giftDocs.page1Header,40,360,{align:'center',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.text1,40,400,{align:'justify',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.text1,40,470,{align:'justify',lineGap:0 })
		  pdfDocs.fontSize("15").text(giftDocs.sideheader1,40,540,{align:'center',lineGap:0 })
		  pdfDocs.fontSize("12").text(giftDocs.text1,40,570,{align:'justify',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.text1,40,100,{align:'justify',lineGap:0 });
		  pdfDocs.fontSize("15").text(giftDocs.sideheaderLeft1,40,150,{align:'left',lineGap:0 })
		  pdfDocs.fontSize("15").text(giftDocs.sideheaderLeft1,40,170,{align:'left',lineGap:0 });
		  pdfDocs.fontSize("15").text(giftDocs.sideheaderLeft1,40,190,{align:'left',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.sideheaderRight1,40,150,{align:'right',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.sideheaderRight1,40,170,{align:'right',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.sideheaderRight1,40,190,{align:'right',lineGap:0 });
		  pdfDocs.fontSize("12").text(giftDocs.sideheaderRight1,40,210,{align:'right',lineGap:0 });
		  pdfDocs.fontSize("15").text(giftDocs.sideheader1,40,260,{align:'center',lineGap:0 });
		}else if(type == 'familyProperty'){
			pdfDocs.fontSize('18').text(familyPropDocs.page1Header,50,10,{align:'center'});
			pdfDocs.fontSize('15').text(familyPropDocs.sideHeader1,40,50,{align: 'center'});
			pdfDocs.fontSize('15').text(familyPropDocs.sideHeader2,40,80,{align: 'center'});
			pdfDocs.fontSize('14').text(familyPropDocs.sideHeader3,30,100,{align: 'center'});
			pdfDocs.fontSize('14').text(familyPropDocs.sideHeader4,50,130,{align: 'left'});
			pdfDocs.fontSize('11').text(familyPropDocs.text1,120,130,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,80,200,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text3,50,290,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text4,50,340,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text5,50,370,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text6,50,400,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text7,50,430,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text8,50,460,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text9,50,490,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text10,50,520,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text11,50,630,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text12,50,660,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(familyPropDocs.page2Header,50,10,{align:'center'});
			pdfDocs.fontSize('11').text(familyPropDocs.text13,50,60,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text14,50,130,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text15,50,160,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text16,50,210,{align:'justify',lineGap:0});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderLeft1,40,240,{align: 'left'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderLeft2,40,270,{align: 'left'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderLeft3,40,300,{align: 'left'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderRight1,40,270,{align: 'right'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderRight2,40,300,{align: 'right'});
			pdfDocs.fontSize('11').text(familyPropDocs.text17,70,340,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text18,70,360,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text19,70,380,{align:'justify',lineGap:0});
			pdfDocs.fontSize('15').text(familyPropDocs.sideHeader1,50,420,{align: 'center'});
			pdfDocs.fontSize('14').text(familyPropDocs.sideHeader1,50,450,{align: 'center'});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,50,490,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text1,50,540,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,50,590,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,50,640,{align:'justify',lineGap:0});
			pdfDocs.addPage();
			pdfDocs.fontSize('18').text(familyPropDocs.page1Header,50,10,{align:'center'});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,50,60,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,50,130,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,50,160,{align:'justify',lineGap:0});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderRight1,40,210,{align: 'right'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderRight1,40,240,{align: 'right'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderRight1,40,270,{align: 'right'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderLeft1,40,300,{align: 'left'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderLeft1,40,330,{align: 'left'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderLeft1,40,370,{align: 'left'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderRight1,40,330,{align: 'right'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderRight1,40,370,{align: 'right'});
			pdfDocs.fontSize('13').text(familyPropDocs.sideHeaderLeft1,40,420,{align: 'left'});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,80,450,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,80,480,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text2,80,510,{align:'justify',lineGap:0});
			pdfDocs.fontSize('11').text(familyPropDocs.text3,80,540,{align:'justify',lineGap:0});
		}
		pdfDocs.end();
		return ;
	}catch(ex){

	}
}

async function NumToWord(amount) {
    var str = new String(amount)
    var splt = str.split("");
    var rev = splt.reverse();
    var once = ['Zero', ' One', ' Two', ' Three', ' Four', ' Five', ' Six', ' Seven', ' Eight', ' Nine'];
    var twos = ['Ten', ' Eleven', ' Twelve', ' Thirteen', ' Fourteen', ' Fifteen', ' Sixteen', ' Seventeen', ' Eighteen', ' Nineteen'];
    var tens = ['', 'Ten', ' Twenty', ' Thirty', ' Forty', ' Fifty', ' Sixty', ' Seventy', ' Eighty', ' Ninety'];

    numLength = rev.length;
    var word = new Array();
    var j = 0;

    for (i = 0; i < numLength; i++) {
        switch (i) {

            case 0:
                if ((rev[i] == 0) || (rev[i + 1] == 1)) {
                    word[j] = '';
                }
                else {
                    word[j] = '' + once[rev[i]];
                }
                word[j] = word[j];
                break;

            case 1:
                aboveTens();
                break;

            case 2:
                if (rev[i] == 0) {
                    word[j] = '';
                }
                else if ((rev[i - 1] == 0) || (rev[i - 2] == 0)) {
                    word[j] = once[rev[i]] + " Hundred ";
                }
                else {
                    word[j] = once[rev[i]] + " Hundred and";
                }
                break;

            case 3:
                if (rev[i] == 0 || rev[i + 1] == 1) {
                    word[j] = '';
                }
                else {
                    word[j] = once[rev[i]];
                }
                if ((rev[i + 1] != 0) || (rev[i] > 0)) {
                    word[j] = word[j] + " Thousand";
                }
                break;

                
            case 4:
                aboveTens();
                break;

            case 5:
                if ((rev[i] == 0) || (rev[i + 1] == 1)) {
                    word[j] = '';
                }
                else {
                    word[j] = once[rev[i]];
                }
                if (rev[i + 1] !== '0' || rev[i] > '0') {
                    word[j] = word[j] + " Lakh";
                }
                 
                break;

            case 6:
                aboveTens();
                break;

            case 7:
                if ((rev[i] == 0) || (rev[i + 1] == 1)) {
                    word[j] = '';
                }
                else {
                    word[j] = once[rev[i]];
                }
                if (rev[i + 1] !== '0' || rev[i] > '0') {
                    word[j] = word[j] + " Crore";
                }                
                break;

            case 8:
                aboveTens();
                break;

            default: break;
        }
        j++;
    }

    function aboveTens() {
        if (rev[i] == 0) { word[j] = ''; }
        else if (rev[i] == 1) { word[j] = twos[rev[i - 1]]; }
        else { word[j] = tens[rev[i]]; }
    }

    word.reverse();
    var finalOutput = '';
    for (i = 0; i < numLength; i++) {
        finalOutput = finalOutput + word[i];
    }
	return finalOutput;
}

async function fieldValueCheck(value){
	let fieldVal = value == null || value == "" ? "________________" : value;
	return fieldVal;
}

module.exports ={generatReport,genTeluguReports};