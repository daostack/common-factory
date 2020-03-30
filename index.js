const ethers = require('ethers')
// Is the voteParams same for all/some schemes of a common?

// TODO: Edit constants/ Make them function params
const DAOFactoryInstance = "0x332280007303d5942dd60A945169b2b303320686"
const arcVersion = "0.1.1-rc.11"

function getForgeOrgData({
    orgName,
    founderAddresses,
    tokenDist,
    repDist
}) {
    let daoTokenABI = require('./abis/DAOToken.json');

    let daoToken = new ethers.utils.Interface(daoTokenABI)
    const daoTokenArgs = Object.values({
        tokenName: '',
        tokenSymbol: '',
        tokenCap: 0,
        DAOFactoryInstance
    });
    var daoTokenCallData = daoToken.functions.initialize.encode(daoTokenArgs);
    return [
        orgName,
        daoTokenCallData,
        founderAddresses,
        tokenDist,
        repDist,
        [0, 0, getArcVersionNumber(arcVersion)]
    ]
}

function getSetSchemesData({
    avatar,
    votingMachine,
    joinAndQuitVoteParams,
    fundingRequestVoteParams,
    schemeFactoryVoteParams,
    fundingToken,
    minFeeToJoin,
    memberReputation,
    goal,
    deadline,
    metaData
}) {
    let joinAndQuitABI = require('./abis/JoinAndQuit.json');
    let fundingRequestABI = require('./abis/FundingRequest.json');
    let schemeFactoryABI = require('./abis/SchemeFactory.json');

    let joinAndQuit = new ethers.utils.Interface(joinAndQuitABI)
    let fundingRequest = new ethers.utils.Interface(fundingRequestABI)
    let schemeFactory = new ethers.utils.Interface(schemeFactoryABI)

    const joinAndQuitArgs = Object.values({
        avatar,
        votingMachine,
        joinAndQuitVoteParams,
        fundingToken,
        minFeeToJoin,
        memberReputation,
        goal,
        deadline
    });

    const fundingRequestArgs = Object.values({
        avatar,
        votingMachine,
        fundingRequestVoteParams,
        fundingToken,
    });

    const schemeFactoryArgs = Object.values({
        avatar,
        votingMachine,
        schemeFactoryVoteParams,
        DAOFactoryInstance,
    });
    
    var joinAndQuitCallData = joinAndQuit.functions.initialize.encode(joinAndQuitArgs);
    var fundingRequestCallData = fundingRequest.functions.initialize.encode(fundingRequestArgs);
    var schemeFactoryCallData = schemeFactory.functions.initialize.encode(schemeFactoryArgs);

    return [
        avatar,
        ['JoinAndQuit', 'FundingRequest', 'SchemeFactory'],
        concatBytes(concatBytes(joinAndQuitCallData, fundingRequestCallData),schemeFactoryCallData),
        [
            getBytesLength(joinAndQuitCallData),
            getBytesLength(fundingRequestCallData),
            getBytesLength(schemeFactoryCallData)
        ],
        ['0x00000000', '0x00000000', '0x0000001F'],
        metaData
    ]
}

// Helpers

function concatBytes(bytes1, bytes2) {
    return bytes1 + (bytes2.slice(2))
}
  
function getBytesLength(bytes) {
    return Number(bytes.slice(2).length) / 2
}

function getArcVersionNumber(arcVersion) {
    return Number(arcVersion.split('rc.')[1])
}

module.exports = {
    getForgeOrgData,
    getSetSchemesData
}
