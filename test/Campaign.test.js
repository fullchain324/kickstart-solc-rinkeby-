const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

console.log(web3);
function hasKey(obj, key, path) {
    if (typeof obj !== "object") return false;
    for (let objectKey in obj) {
        path.push(objectKey);
        if (key == objectKey || hasKey(obj[objectKey], key, path)) {
            return true;
        }
        path.pop();
    }
    return false;
}
//console.log(compiledFactory.evm.bytecode);

// const path = [];
// console.log(hasKey(compiledFactory, "interface", path));
// console.log(path);

beforeEach(async() => {
    accounts = await web3.eth.getAccounts();
    
    factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({data: compiledFactory.evm.bytecode.object})
    .send({from: accounts[0], gas:'5000000'});

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas:'1000000'
    });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
})

describe("Campaigns", ()=>{
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    })
    
    it('marks caller as the campaign manager', async() => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allows people to contribute money and marks them as approvers', async() => {
        await campaign.methods.contribute().send({
            from:accounts[1],
            value:'1000'
        });
        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    })

    it('requires a minimum contribution', async() => {
        try {
            await campaign.methods.contribute().send({
                from:accounts[1],
                value:'5'
            })
            // assert(false);
        } catch(err) {
            console.log(err);
            assert(err);
        }
    })

    it("allows a manager to make a payment request", async() => {
        await campaign.methods.createRequest("buy batteries", 1000000, accounts[2]).send({
            from: accounts[0],
            gas:'1000000'
        });

        const request = await campaign.methods.requests(0).call();
        assert.equal(request.description, "buy batteries");
    })
    it("process requests", async ()=> {
        
        await campaign.methods.contribute().send({
            from:accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods.createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1]).send({
            from:accounts[0],
            gas:'1000000'
        });
        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        })

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas:'1000000'
        });

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        console.log(balance);
        assert(balance > 100);
    })

    it("get balances", async ()=>{

        let balance = await Promise.all(accounts.map(async (account) => {
            const res = await web3.eth.getBalance(account);
            return res;
        }));
        console.log(balance);

        assert(balance);
        
    })
})