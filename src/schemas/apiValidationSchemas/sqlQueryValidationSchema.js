
module.exports = {
    description: "sql query schema",
    entity: "oracledb",
    storeValidationErrorInDB: false,
    query: {
        type: "object",
        properties: {
			SR_CODE: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			DOCT_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			BOOK_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			DOCT_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            sro_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			sr_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			doct_no:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			book_no:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			doct_no:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            reg_year:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            srCode: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]+$"
					},
				  ]
				
            },
			regYear:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			bookNo:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			docNo:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			dptId:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			certificateId:{
				type: "string",
                pattern: "^[A-Z0-9 -]*$"
			},
			rowId:{
				type: "string",
                pattern: "^[A-Za-z0-9]*$"
			},
			certIssueDate:{
				type: "string",
                pattern: "^[0-9 -]*$"
			},
			recptno:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			vill_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },

        },
        additionalProperties: true
    },
	params: {
        type: "object",
        properties: {
			SR_CODE: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			DOCT_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			BOOK_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			DOCT_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			sro_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            sr_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			doct_no:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			book_no:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			doct_no:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            reg_year:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            srCode: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			regYear:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			bookNo:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			docNo:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			dptId:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			certificateId:{
				type: "string",
                pattern: "^[A-Z0-9 -]*$"
			},
			certIssueDate:{
				type: "string",
                pattern: "^[0-9 -]*$"
			},
			recptno:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			vill_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },

        },
        additionalProperties: true
    },
    body: {
		anyOf: [
            {
                type: "object"
            },
            {
                type: "array"
            }
        ],
        properties: {
			SR_CODE: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			DOCT_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			BOOK_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			DOCT_NO:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			sro_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            sr_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			doct_no:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			book_no:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            reg_year:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            districtCode: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            mandalCode: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			mandalId:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            villageCode: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			vill_code: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            sroCode: {
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			documentNo:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			bookNo:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
            registedYear:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			habCode:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			districtId:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			linkDoc_No:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            },
			regYear:{
                anyOf: [
					{
					  type: "number",
					  nullable: false
					},
					{
					  type: "string",
					  pattern: "^[0-9]*$"
					},
				  ]
				
            }
        },
        additionalProperties: true
    }
};
  