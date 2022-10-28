// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers")
const hre = require("hardhat")

const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);

// Tokens
const NATIVE_TOKEN = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83';
const USDC = '0x4603cff6498c46583300fc5f1c31f872f5514182';
const DAI = '0x38fA58a6a83d97389Be88752DAa408E2FEA40C8b';
const USDT = '0xec6b24429ab7012afc1b083d4e6763f738047792';
const SUSHI = '0xED59D07e00118b7ab76EE6fB29D738e266aAca02'
/**
 * @dev HEADS UP 🙋
 * First Token in the list will be the base token of the gauge proxy
 */
const allowedVariableToken = [NATIVE_TOKEN, SUSHI]
const allowedStableToken = [USDC, DAI, USDT]

// Contracts
const FACTORY = '0xFa5395FbFb1805c6a1183D0C72f97306663Ae0D1'
const VOTER_ESCROW_TOKEN = '0x02Fd17296f1d5B80f6F292B27b56273b5F89dFc4';
const REWARD_TOKEN = '0xED59D07e00118b7ab76EE6fB29D738e266aAca02';
/**
 * treasury can be anything
 * we shall use multisig contract when in prod
 * for dev, i shall use my wallet
 */
const TREASURY_ADDRESS = '0x9abe960Ce43a314B4CE8AfBe2E7a4B8FE3Ec728e';
/**
 * Deployed by Frank
 * at Oct.27 2022
 */
const FEE_DISTRIBUTOR = '0x48C959815e1a533dC06fC1fDB7f00e8E689B9afA';
const VARIABLE_BRIBE_FACTORY = '0xd8b7d4751509B5a074bc6589b7fE6b899C1d5f26';
const STABLE_BRIBE_FACTORY = '0x1d68BAcFC8162c4E41e0A87b235aB6Eb8AA88a2e';
const VARIABLE_GAUGE_PROXY = '0xDAc4bEd1Bb8f8cfDDbaD6B233596C05dfa502A95';
const STABLE_GAUGE_PROXY = '0xd79Cd14f1CDaca51a1808853ECa716e6c33be932';
const ADMIN_GAUGE_PROXY = '0x9D8C4DA04D9eaFD03e1318801A74c8d30e0c5E78';

// let FEE_DISTRIBUTOR ;
// let VARIABLE_BRIBE_FACTORY;
//let STABLE_BRIBE_FACTORY;
// let VARIABLE_GAUGE_PROXY;
// let STABLE_GAUGE_PROXY;
// let ADMIN_GAUGE_PROXY;
let minSPIRIT_GAUGE_PROXY_VARIABLE;
let minSPIRIT_GAUGE_PROXY_STABLE;
let minSPIRIT_GAUGE_PROXY_ADMIN;

const sleep = (delay) => new Promise (( resolve) => setTimeout (resolve, delay));

async function initFeeDistributor(wallet) {
  console.log('Starting FeeDistributor deployment');

  // initialize feeDistributor
  const feeDistributorArtifact = await ethers.getContractFactory("fee-distributor");
  const feeDistributorContract = await feeDistributorArtifact.deploy(VOTER_ESCROW_TOKEN, "1654128000", REWARD_TOKEN, wallet, wallet, );
  await feeDistributorContract.deployed();
  await sleep(5000);

  const feeDistributor = await ethers.getContractAt("fee-distributor", feeDistributorContract.address);
  console.log("- FeeDistributor Initialized at address: ", feeDistributorContract.address);
  FEE_DISTRIBUTOR = feeDistributorContract.address;
  await feeDistributor.toggle_allow_checkpoint_token();
}

async function initVariableBribeFactory() {
  console.log('Starting Variable BribeFactory deployment');
  // initialize bribeFactory
  const bribeFactoryArtifact = await ethers.getContractFactory("BribeFactory");
  const bribeFactoryContract = await bribeFactoryArtifact.deploy();
  await bribeFactoryContract.deployed();
  await sleep(5000);

  // const bribeFactory = await ethers.getContractAt("BribeFactory", bribeFactoryContract.address);
  console.log("- Variable BribeFactory Initialized at address: ", bribeFactoryContract.address);
  VARIABLE_BRIBE_FACTORY = bribeFactoryContract.address;

  // await hre.run("verify:verify", {
  //   address: VARIABLE_BRIBE_FACTORY,
  //   contract: "contracts/SpiritV2/Bribes.sol:BribeFactory",
  // });

}

async function initStableBribeFactory() {
    console.log('Starting Stable BribeFactory deployment');
    // initialize bribeFactory
    const bribeFactoryArtifact = await ethers.getContractFactory("BribeFactory");
    const bribeFactoryContract = await bribeFactoryArtifact.deploy();
    await bribeFactoryContract.deployed();
    await sleep(5000);
  
    // const bribeFactory = await ethers.getContractAt("BribeFactory", bribeFactoryContract.address);
    console.log("- Stable BribeFactory Initialized at address: ", bribeFactoryContract.address);
    STABLE_BRIBE_FACTORY = bribeFactoryContract.address;
  
    // await hre.run("verify:verify", {
    //   address: STABLE_BRIBE_FACTORY,
    //   contract: "contracts/SpiritV2/Bribes.sol:BribeFactory",
    // });
  
}

async function initVariableGaugeProxy() {
  console.log('Starting Variable GaugeProxy deployment');

  // initialize gaugeProxy
  const gaugeProxyArtifact = await ethers.getContractFactory("VariableGaugeProxy");
  const gaugeProxyContract = await gaugeProxyArtifact.deploy(
    REWARD_TOKEN, 
    VOTER_ESCROW_TOKEN, 
    FEE_DISTRIBUTOR, 
    VARIABLE_BRIBE_FACTORY,
    FACTORY, 
  )
  await gaugeProxyContract.deployed()
  await sleep(5000);

  // const gaugeProxy = await ethers.getContractAt("GaugeProxy", gaugeProxyContract.address);
  console.log("- Variable GaugeProxy Initialized at address: ", gaugeProxyContract.address);
  VARIABLE_GAUGE_PROXY = gaugeProxyContract.address;

  // await hre.run("verify:verify", {
  //     address: gaugeProxyContract.address,
  //     contract: "contracts/SpiritV2/VariableGaugeProxy.sol:VariableGaugeProxy",
  //     constructorArguments: [ 
  //       REWARD_TOKEN, 
  //       VOTER_ESCROW_TOKEN, 
  //       FEE_DISTRIBUTOR, 
  //       VARIABLE_BRIBE_FACTORY,
  //       FACTORY, 
  //     ],
  //   });

}

async function initStableGaugeProxy() {
    console.log('Starting Stable GaugeProxy deployment');
  
    // initialize gaugeProxy
    const gaugeProxyArtifact = await ethers.getContractFactory("StableGaugeProxy");
    const gaugeProxyContract = await gaugeProxyArtifact.deploy(
      REWARD_TOKEN, 
      VOTER_ESCROW_TOKEN, 
      FEE_DISTRIBUTOR, 
      STABLE_BRIBE_FACTORY,
      FACTORY, 
      );
    await gaugeProxyContract.deployed();
    await sleep(5000);
  
    // const gaugeProxy = await ethers.getContractAt("GaugeProxy", gaugeProxyContract.address);
    console.log("- Stable GaugeProxy Initialized at address: ", gaugeProxyContract.address);
    STABLE_GAUGE_PROXY = gaugeProxyContract.address;

    // await hre.run("verify:verify", {
    //     address: gaugeProxyContract.address,
    //     contract: "contracts/SpiritV2/StableGaugeProxy.sol:StableGaugeProxy",
    //     constructorArguments: [ 
    //       SPIRIT, 
    //       inSPIRIT, 
    //       FEE_DISTRIBUTOR, 
    //       STABLE_BRIBE_FACTORY,
    //       FACTORY, 
    //     ],
    //   });
  
}

async function initAdminGaugeProxy() {
    console.log('Starting Admin GaugeProxy deployment');

    // initialize gaugeProxy
    const gaugeProxyArtifact = await ethers.getContractFactory("AdminGaugeProxy");
    const gaugeProxyContract = await gaugeProxyArtifact.deploy(
      REWARD_TOKEN, 
      VOTER_ESCROW_TOKEN, 
      TREASURY_ADDRESS, 
      FEE_DISTRIBUTOR, 
      0, 
      );
    await gaugeProxyContract.deployed();
    await sleep(5000);
  
    // const gaugeProxy = await ethers.getContractAt("GaugeProxy", gaugeProxyContract.address);
    console.log("- Admin GaugeProxy Initialized at address: ", gaugeProxyContract.address);
  
    // await hre.run("verify:verify", {
    //     address: gaugeProxyContract.address,
    //     contract: "contracts/SpiritV2/AdminGaugeProxy.sol:AdminGaugeProxy",
    //     constructorArguments: [ 
    //       SPIRIT, 
    //       inSPIRIT, 
    //       MULTISIG, 
    //       FEE_DISTRIBUTOR, 
    //       0,
    //     ],
    //   });
}

async function verifyTokensVariableGaugeProxy() {

  const gaugeProxy = await ethers.getContractAt("VariableGaugeProxy", VARIABLE_GAUGE_PROXY);

  console.log('Starting token verification');
  const [BaseToken, ...otherTokens] = allowedVariableToken
  const setTxn1 = await gaugeProxy.setBaseToken(BaseToken, true);
  await setTxn1.wait();
  for (const allowedToken of otherTokens) {
    const setTxn = await gaugeProxy.setVerifiedToken(allowedToken, true);
    await setTxn.wait();
  }
}

async function verifyTokensStableGaugeProxy() {

  const gaugeProxy = await ethers.getContractAt("StableGaugeProxy", STABLE_GAUGE_PROXY);

  console.log('Starting token verification');
  const [BaseToken, ...others] = allowedStableToken
  const setTxn1 = await gaugeProxy.setBaseToken(BaseToken, true);
  await setTxn1.wait();
  for (const allowedToken of others) {
    const setTxn = await gaugeProxy.setVerifiedToken(allowedToken, true);
    await setTxn.wait();
  }
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [wallet] = await ethers.getSigners();
  console.log('Using wallet: ', wallet.address);
  
    // await initFeeDistributor(wallet.address);

    // await initVariableBribeFactory();
    // await initStableBribeFactory();

    // await initVariableGaugeProxy();
    // await initStableGaugeProxy();
    // await initAdminGaugeProxy();

    await verifyTokensVariableGaugeProxy();
    await verifyTokensStableGaugeProxy();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });