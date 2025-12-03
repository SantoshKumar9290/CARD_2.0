exports.cdmaAPIs={
    createAssessment:`/v1.0/property/automutation/unassessed/mutation`,
    searchByDoorNumber:`/v1.0/property/search/doorno`,
    tokenGeneration:`/oauth/token?ulbCode=`,
    autoMutationAPIForFullTransferWithPTIN:`/v1.0/property/automutation/assessed/approve?ulbCode=`,
    autoMutationAPIForPartTransferWithPTIN:`/v1.0/property/automutation/assessed/partial-mutation`,
    getFloorMasterData:`/property/floornumbers`
}
exports.cdmaHostURL=process.env.URBAN_BASE_URL || `https://kurnool-uat.allvy.com/restapi`
