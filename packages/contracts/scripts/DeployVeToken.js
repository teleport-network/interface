const hre = require("hardhat");


async function main() {
    const ethers = hre.ethers;

    const VeTokenFactory = await ethers.getContractFactory("ve");
    const tokenThatNeedToBeEscrowed = '0xED59D07e00118b7ab76EE6fB29D738e266aAca02'
    const vetoken = await VeTokenFactory.deploy(tokenThatNeedToBeEscrowed, 'vxTele', 'vxTele', '1');
    await vetoken.deployed();

    console.log("vetoken", vetoken.address);
}
/**
 * deployed at 0x02Fd17296f1d5B80f6F292B27b56273b5F89dFc4
 * Oct.26 2022 by Frank
 */
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
