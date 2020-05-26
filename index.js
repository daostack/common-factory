const ethers = require('ethers');
// Is the voteParams same for all/some schemes of a common?

// TODO: Edit constants/ Make them function params
const arcVersion = "0.1.1-rc.21";

function getForgeOrgData({
    DAOFactoryInstance,
    orgName,
    founderAddresses,
    repDist
}) {
    let daoTokenABI = require('./abis/DAOToken.json');

    let daoToken = new ethers.utils.Interface(daoTokenABI);
    const daoTokenArgs = Object.values({
        tokenName: '',
        tokenSymbol: '',
        tokenCap: 0,
        DAOFactoryInstance
    });
    let daoTokenCallData = daoToken.functions.initialize.encode(daoTokenArgs);
    let tokenDist = [];
    for (let i = 0; i < founderAddresses.length; i++) {
        tokenDist.push(0);
    }
    return [
        orgName,
        daoTokenCallData,
        founderAddresses,
        tokenDist,
        repDist,
        [0, 0, getArcVersionNumber(arcVersion)]
    ];
}

function getSetSchemesData({
    DAOFactoryInstance,
    avatar,
    votingMachine,
    fundingToken,
    minFeeToJoin,
    memberReputation,
    goal,
    deadline,
    rageQuitEnabled,
    metaData
}) {
    let joinAndQuitABI = require('./abis/JoinAndQuit.json');
    let fundingRequestABI = require('./abis/FundingRequest.json');
    let schemeFactoryABI = require('./abis/SchemeFactory.json');
    let dictatorABI = require('./abis/Dictator.json');

    let joinAndQuit = new ethers.utils.Interface(joinAndQuitABI);
    let fundingRequest = new ethers.utils.Interface(fundingRequestABI);
    let schemeFactory = new ethers.utils.Interface(schemeFactoryABI);
    let dictator = new ethers.utils.Interface(dictatorABI);

    let joinAndQuitParams = require('./schemesVoteParams/JoinAndQuitParams.json');
    let fundingRequestParams = require('./schemesVoteParams/FundingRequestParams.json');
    let schemeFactoryParams = require('./schemesVoteParams/SchemeFactoryParams.json');

    const joinAndQuitArgs = Object.values({
        avatar,
        votingMachine,
        votingParams: [
            joinAndQuitParams.queuedVoteRequiredPercentage,
            joinAndQuitParams.queuedVotePeriodLimit,
            joinAndQuitParams.boostedVotePeriodLimit,
            joinAndQuitParams.preBoostedVotePeriodLimit,
            joinAndQuitParams.thresholdConst,
            joinAndQuitParams.quietEndingPeriod,
            ethers.utils.parseEther(joinAndQuitParams.proposingRepReward.toString()),
            joinAndQuitParams.votersReputationLossRatio,
            ethers.utils.parseEther(joinAndQuitParams.minimumDaoBounty.toString()),
            joinAndQuitParams.daoBountyConst,
            joinAndQuitParams.activationTime
        ],
        voteOnBehalf: joinAndQuitParams.voteOnBehalf,
        joinAndQuitParamsHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fundingToken,
        minFeeToJoin,
        memberReputation,
        goal,
        deadline,
        rageQuitEnabled
    });

    const fundingRequestArgs = Object.values({
        avatar,
        votingMachine,
        votingParams: [
            fundingRequestParams.queuedVoteRequiredPercentage,
            fundingRequestParams.queuedVotePeriodLimit,
            fundingRequestParams.boostedVotePeriodLimit,
            fundingRequestParams.preBoostedVotePeriodLimit,
            fundingRequestParams.thresholdConst,
            fundingRequestParams.quietEndingPeriod,
            ethers.utils.parseEther(fundingRequestParams.proposingRepReward.toString()),
            fundingRequestParams.votersReputationLossRatio,
            ethers.utils.parseEther(fundingRequestParams.minimumDaoBounty.toString()),
            fundingRequestParams.daoBountyConst,
            fundingRequestParams.activationTime
        ],
        voteOnBehalf: fundingRequestParams.voteOnBehalf,
        fundingRequestParamsHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        fundingToken,
    });

    const schemeFactoryArgs = Object.values({
        avatar,
        votingMachine,
        votingParams: [
            schemeFactoryParams.queuedVoteRequiredPercentage,
            schemeFactoryParams.queuedVotePeriodLimit,
            schemeFactoryParams.boostedVotePeriodLimit,
            schemeFactoryParams.preBoostedVotePeriodLimit,
            schemeFactoryParams.thresholdConst,
            schemeFactoryParams.quietEndingPeriod,
            ethers.utils.parseEther(schemeFactoryParams.proposingRepReward.toString()),
            schemeFactoryParams.votersReputationLossRatio,
            ethers.utils.parseEther(schemeFactoryParams.minimumDaoBounty.toString()),
            schemeFactoryParams.daoBountyConst,
            schemeFactoryParams.activationTime
        ],
        voteOnBehalf: schemeFactoryParams.voteOnBehalf,
        schemeFactoryParamsHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        DAOFactoryInstance,
    });

    const dictatorArgs = Object.values({
        avatar,
        owner: '0xbBb06cD354D7f4e67677f090eCc3f6E5916E2447'
    });
    
    var joinAndQuitCallData = joinAndQuit.functions.initialize.encode(joinAndQuitArgs);
    var fundingRequestCallData = fundingRequest.functions.initialize.encode(fundingRequestArgs);
    var schemeFactoryCallData = schemeFactory.functions.initialize.encode(schemeFactoryArgs);
    var dictatorCallData = dictator.functions.initialize.encode(dictatorArgs);

    return [
        avatar,
        [
            ethers.utils.formatBytes32String('JoinAndQuit'),
            ethers.utils.formatBytes32String('FundingRequest'),
            ethers.utils.formatBytes32String('SchemeFactory'),
            ethers.utils.formatBytes32String('Dictator')
        ],
        concatBytes(concatBytes(concatBytes(joinAndQuitCallData, fundingRequestCallData), schemeFactoryCallData), dictatorCallData),
        [
            getBytesLength(joinAndQuitCallData),
            getBytesLength(fundingRequestCallData),
            getBytesLength(schemeFactoryCallData),
            getBytesLength(dictatorCallData)
        ],
        ['0x00000000', '0x00000000', '0x0000001F', '0x0000001F'],
        metaData
    ];
}

// Helpers

function concatBytes(bytes1, bytes2) {
    return bytes1 + (bytes2.slice(2));
}
  
function getBytesLength(bytes) {
    return Number(bytes.slice(2).length) / 2;
}

function getArcVersionNumber(arcVersion) {
    return Number(arcVersion.split('rc.')[1]);
}

module.exports = {
    getForgeOrgData,
    getSetSchemesData
};
