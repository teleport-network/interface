const hre = require("hardhat");
const ethers = hre.ethers
const BigNumber = ethers.BigNumber

function expandTo18Decimals(n) {
    return BigNumber.from(n).mul(BigNumber.from("10").pow(18))
}

async function main() {
    const routerContract = await ethers.getContractFactory("TeleswapV2Router02")
    const router = routerContract.attach("0xafc6c3DF6737bcC3FDA352fC40BE991f53Cf7D43")

    const factoryContract = await ethers.getContractFactory("TeleswapV2Factory")
    const factory = factoryContract.attach("0x31aEa5B757f87Ea27258E27675348E138e9f4Ffa")

    console.log(router.address, factory.address)

    const args = [
        ["0x005066bd4B1d511904380dFca17C32A20c4BbEF5", "0xb2B31E4FBA8e03bac52D7A164888176001d71f1a"],
        expandTo18Decimals(100),
        expandTo18Decimals(80),
        1,
        1,
        (await ethers.getSigners())[0].address,
        (Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 * 1000)
    ]
    await router.addLiquidity(...args)

    const pair = await factory.getPair("0x005066bd4B1d511904380dFca17C32A20c4BbEF5", "0xb2B31E4FBA8e03bac52D7A164888176001d71f1a", false)
    console.log("pair", pair)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
