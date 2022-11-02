// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers")
// import from constant.js
const { 
  USDT, USDC: USDCAddr, FACTORY: FACTORYV2, STABLE_GAUGE_PROXY, ZERO_ADDRESS
} = require('./constant')


const tokensWithUSDC = [
  {
    "symbol": "USDT",
    "address": USDT
  },
 ]

 
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [wallet] = await ethers.getSigners();
  console.log('Using wallet: ', wallet.address);
  // const routerv2 = await ethers.getContractAt("TeleswapV2Router02", ROUTER);
  console.log("here1");
  await Promise.all(tokensWithUSDC.map(async tkn => {
    console.debug('adding token obj', tkn)
    const token = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", tkn.address);
    
    console.debug('init factory start', FACTORYV2)
    // 3. Get LP address from factory
    const factory = await ethers.getContractAt("TeleswapV2Factory", FACTORYV2);
    console.debug('init factory done', USDCAddr, token.address, true)
    const LP = await factory.getPair(USDCAddr, token.address, true);
    console.log('LP address: ', LP);

    // 4. Using that LP create a gauge in GaugeProxy contract
    const gaugeProxy = await ethers.getContractAt("StableGaugeProxy", STABLE_GAUGE_PROXY);

    const DEPLOYED_GAUGE_ADDR = await gaugeProxy.callStatic.gauges(LP);

    if (DEPLOYED_GAUGE_ADDR !== ZERO_ADDRESS) {
      console.log(`skipped for deployed gauge of '${token.address}', gauge addr: '${DEPLOYED_GAUGE_ADDR}'`);
      return;
    }

    const addGaugeTrx = await gaugeProxy.addGauge(LP);
    await addGaugeTrx.wait(5);

    console.log("token done");

    const GAUGE_ADDR = await gaugeProxy.callStatic.gauges(LP);
    console.log('gauge addr: ', GAUGE_ADDR);
    const BRIBE_ADDR = await gaugeProxy.bribes(GAUGE_ADDR);
    console.log('BRIBE_ADDR addr: ', BRIBE_ADDR);

    // await hre.run("verify:verify", {
    //     address: GAUGE_ADDR,
    //     contract: "contracts/SpiritV2/StableGaugeProxy.sol:Gauge",
    //     constructorArguments: [ 
    //     SPIRIT, 
    //     inSPIRIT, 
    //     LP,
    //     STABLE_GAUGE_PROXY
    //     ],
    // });

    // await hre.run("verify:verify", {
    //     address: BRIBE_ADDR,
    //     contract: "contracts/SpiritV2/Bribes.sol:Bribe",
    //     constructorArguments: [ 
    //         await gaugeProxy.governance(), // update to do
    //         STABLE_GAUGE_PROXY,
    //         STABLE_BRIBE_FACTORY
    //     ],
    // });

  }));

}

async function verifyGauge() {
    // await hre.run("verify:verify", {
    //     address: "0x8B8C47f904BF18541f93c7dFcb10F3A8451438a3",
    //     contract: "contracts/SpiritV2/StableGaugeProxy.sol:Gauge",
    //     constructorArguments: [ 
    //     SPIRIT, 
    //     inSPIRIT, 
    //     "0x9692129bb91b4E3942C0f17B0bdCC582Ff22fFB5",
    //     STABLE_GAUGE_PROXY
    //     ],
    // });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  