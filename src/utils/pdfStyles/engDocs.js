let pdeStyle = {
	
	background:  ()=> {
		return [
			{
				canvas: [
					{type: 'rect',x: 9,y: 9,w: 580,h: 827,r: 4,lineColor: 'black'},
					{type: 'rect',x: 12,y: 12,w: 574,h: 821,r: 2,lineColor: 'grey'}
				],

			}
		]
	},
	watermark: {text: 'DRAFT', color: 'grey', opacity: 0.1, italics: false,fontSize: 70},
	content: [],
	styles: {
		f18: {
			fontSize: 14,margin:[0,10,0,0]
		},
		strong: {
			bold: true
		},
		sideHeaderNames:{
			fontSize:13,bold:true,margin:[0,5,0,5]
		},
		sideHeaderNamesright:{
			fontSize:13,bold:true,margin:[0,5,0,5],alignment:"right"
		},
		p1sideHeaders:{
			alignment: 'left',
			fontSize: 12,
			margin: [60, 15, 0, 0]
		},
		p1Text:{
			fontSize:13,
			alignment:'left',
			margin: [5, 10, 10, 0]
		},
		p1Points:{
			fontSize:13,
			alignment:'center',
			margin: [5, 30, 10, 0]
		},
		p3Text1_main1:{
			fontSize:13,
			alignment:'justify',
			margin: [5, 10, 10, 0]
		},
		p2Header_main:{
			alignment: 'center',
			fontSize: 12,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',
			decoration:'underline',
			margin: [10, 50, 0, 0]
		},
		p3Text1_main3:{
			fontSize:12,
			alignment:'justify',
			margin: [10, 10, 0, 0]
		},
		p3text1_pay:{
			fontSize:12,
			alignment:'justify',
			margin: [60, 0, 0, 0]
		},
		covanants:{
			fontSize:12,
			alignment:'justify',
			margin: [10, 5, 0, 0]
		},
		p3Text1_main2:{
			fontSize:12,
			alignment:'justify',
			margin: [10, 10, -10, 0]
		},
		p3Text1_settlor:{
			fontSize:11,
			alignment:'left',
			margin: [20, 10, -10, 0]
		},
		p3Text1_settlor1:{
			fontSize:11,
			alignment:'left',
			margin: [80, 10, -10, 0]
		},
		p3witness:{
			fontSize:12,
			alignment:'left',
			margin: [20, 10, -10, 0]
		},
	},

};
module.exports ={pdeStyle};