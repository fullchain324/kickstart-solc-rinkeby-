const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const compiledFactory = require('./build/CampaignFactory.json');

const provider = new HDWalletProvider(
    'evoke muffin awesome merit cool magnet fence fetch capable figure expect raccoon',
    'https://rinkeby.infura.io/v3/3040491c81044721b2170a2d88a89b7f'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);
   
    const result = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({data:compiledFactory.evm.bytecode.object})
    .send({from:accounts[0], gas:'15000000'});  
   console.log(result.options.address);
    // console.log(accounts[0]);
}

deploy();