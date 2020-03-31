test('deploy common', async () => {
    // Import Script
    const { getForgeOrgData, getSetSchemesData } = require('../index.js');
    // Web3 setup
    const Web3 = require('web3');
    const web3 = new Web3('http://localhost:8545', null, {
      transactionConfirmationBlocks: 1
    });
    web3.eth.accounts.wallet.clear();
    let privateKeys = [
        '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
        '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1',
        '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c',
        '0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913',
        '0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743',
        '0x395df67f0c2d2d9fe1ad08d1bc8b6627011959b79c53d7dd6a3536a33ab8a4fd',
        '0xe485d098507f54e7733a205420dfddbe58db035fa577fc294ebd14db90767a52',
        '0xa453611d9419d0e56f499079478fd72c37b251a94bfde4d19872c44cf65386e3',
        '0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4',
        '0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773'
    ];
    for (let i = 0; i < privateKeys.length; i++) {
        web3.eth.accounts.wallet.add(web3.eth.accounts.privateKeyToAccount(privateKeys[i]));
    }
    let opts = {
      from: web3.eth.accounts.wallet[0].address,
      gas: 6000000,
      gasPrice: 10
    };
    // End Web3 setup

    // Test Common Setup 
    const DAOstackMigration = require('@daostack/migration-experimental');
    
    const DAOFactoryInstance = DAOstackMigration.migration('private').package['0.1.1-rc.11'].DAOFactoryInstance;

    const daoFactory = new web3.eth.Contract(
      require('../abis/DAOFactory.json'),
      DAOFactoryInstance,
      opts
    );
    
    const orgName = 'My Common';
    const forgeOrg = await daoFactory.methods.forgeOrg(
      ...getForgeOrgData({
        DAOFactoryInstance,
        orgName,
        founderAddresses: [web3.eth.accounts.wallet[0].address],
        repDist: [100]
      })
    ).send();

    let newOrg = forgeOrg.events.NewOrg.returnValues;

    let avatarAddress = newOrg._avatar;
    let reputationAddress = newOrg._reputation;

    const avatar = new web3.eth.Contract(
      require('@daostack/migration-experimental/contracts/0.1.1-rc.11/Avatar.json').abi,
      avatarAddress,
      opts
    );

    const reputation = new web3.eth.Contract(
      require('@daostack/migration-experimental/contracts/0.1.1-rc.11/Reputation.json').abi,
      reputationAddress,
      opts
    );

    expect(await avatar.methods.orgName().call()).toBe(orgName);
    expect(await reputation.methods.balanceOf(web3.eth.accounts.wallet[0].address).call()).toBe('100');
    expect(await reputation.methods.totalSupply().call()).toBe('100');
    
    const votingMachine = DAOstackMigration.migration('private').package['0.1.1-rc.11'].GenesisProtocol;
    const deadline = (await web3.eth.getBlock("latest")).timestamp + 3000;
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

  let schemesEvents = setSchemes.events.SchemeInstance;

  const joinAndQuit = new web3.eth.Contract(
    require('../abis/JoinAndQuit.json'),
    schemesEvents[0].returnValues._scheme,
    opts
  );

  const fundingRequest = new web3.eth.Contract(
    require('../abis/FundingRequest.json'),
    schemesEvents[1].returnValues._scheme,
    opts
  );

  const schemeFactory = new web3.eth.Contract(
    require('../abis/SchemeFactory.json'),
    schemesEvents[2].returnValues._scheme,
    opts
  );

  expect(await joinAndQuit.methods.avatar().call()).toBe(avatarAddress);
  expect(await joinAndQuit.methods.votingMachine().call()).toBe(votingMachine);
  expect(await joinAndQuit.methods.voteParams().call()).toBe("0x1000000000000000000000000000000000000000000000000000000000000000");
  expect(await joinAndQuit.methods.fundingToken().call()).toBe("0x0000000000000000000000000000000000000000");
  expect(await joinAndQuit.methods.minFeeToJoin().call()).toBe("100");
  expect(await joinAndQuit.methods.memberReputation().call()).toBe("100");
  expect(await joinAndQuit.methods.fundingGoal().call()).toBe("1000");
  expect(await joinAndQuit.methods.fundingGoalDeadLine().call()).toBe(deadline.toString());
  
  expect(await fundingRequest.methods.avatar().call()).toBe(avatarAddress);
  expect(await fundingRequest.methods.votingMachine().call()).toBe(votingMachine);
  expect(await fundingRequest.methods.voteParams().call()).toBe("0x1100000000000000000000000000000000000000000000000000000000000000");
  expect(await fundingRequest.methods.fundingToken().call()).toBe("0x0000000000000000000000000000000000000000"); 


  expect(await schemeFactory.methods.avatar().call()).toBe(avatarAddress);
  expect(await schemeFactory.methods.votingMachine().call()).toBe(votingMachine);
  expect(await schemeFactory.methods.voteParams().call()).toBe("0x1110000000000000000000000000000000000000000000000000000000000000");
  expect(await schemeFactory.methods.daoFactory().call()).toBe(DAOFactoryInstance); 
}, 500000);
