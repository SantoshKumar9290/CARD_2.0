const { SURVEY, LPM } = require("../utils/sysConstanst");

exports.CODES={
    EXECUTANT_CODES: ["EX", "MR", "DR", "RR", "FP", "LR", "PL", "TR", "NP", "DC", "OR", "HS", "PA", "AR", "FP", 'E'],
    CLAIMANT_CODES: ['RE','AY','TE','CL','LE','ME','DE','OE','AP','SP','WI'],
    AGRI_NATURE: ['21', '22', '26', '44', '45','46', '30'],
    AGRI_VILLAGE_TYPES: [SURVEY, LPM]
}


exports.RO_LIST=[627, 715, 511, 515, 612, 720, 731, 818, 413, 428, 
    414, 917, 1117, 1111, 311, 301, 320, 1011, 1022, 
    1321, 115, 212, 208, 1313, 1220, 1201];

// exports.URBAN_MUTATION_ACCEPT_MAJOR_CODES=['01','03','04','05','06']
exports.URBAN_MUTATION_ACCEPT_MAJOR_CODES=['01','03','04','05','06']; // enabling only  for sale ,Gift,Release
exports.URBAN_MUTATION_ACCEPT_MINOR_CODES={
    '01':['01','04','05','06','08','14','15','16','17','19','27'],
    '03':['01','02','03','04','05','06','07','08','09'],
    '04':['01','02'],
    '05':['01','02'],
    '06':['01'],
}