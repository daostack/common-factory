# CommonFactory
Package with helper scripts to deploy a Common DAO using Arc `DAOFactory`.

# Usage
Run: `npm install --save @daostack/commonfactory`

Import the `commonfactory` methods: `getForgeOrgData, getSetSchemesData` and use them to generate call data to Arc `DAOFactory` methods.
```javascript
const { getForgeOrgData, getSetSchemesData } = require('@daostack/commonfactory');

// ...
const forgeOrg = await daoFactory.methods.forgeOrg(
      ...getForgeOrgData({
        DAOFactoryInstance,
        orgName,
        founderAddresses: [web3.eth.accounts.wallet[0].address],
        tokenDist: [0],
        repDist: [100]
      })
    ).send();

// ...
const setSchemes = await daoFactory.methods.setSchemes(
      ...getSetSchemesData({
        DAOFactoryInstance,
        avatar: avatarAddress,
        votingMachine,
        joinAndQuitVoteParams: "0x1000000000000000000000000000000000000000000000000000000000000000",
        fundingRequestVoteParams: "0x1100000000000000000000000000000000000000000000000000000000000000",
        schemeFactoryVoteParams: "0x1110000000000000000000000000000000000000000000000000000000000000",
        fundingToken: "0x0000000000000000000000000000000000000000",
        minFeeToJoin: 100,
        memberReputation: 100,
        goal: 1000,
        deadline,
        metaData: 'metadata'
    })
  ).send();

//...
```
