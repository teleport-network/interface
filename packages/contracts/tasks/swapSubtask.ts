import "@nomiclabs/hardhat-web3"
import {subtask, task, types} from "hardhat/config"
import {BigNumber, ethers, utils} from "ethers";
import TeleswapV2Pair from '../abi/TeleswapV2Pair.json'
import {asArray, getMessage, TypedData} from "eip-712";
import type = Mocha.utils.type;
require('dotenv').config()

export const Sleep = (ms: number | undefined)=> {
    return new Promise(resolve=>setTimeout(resolve, ms))
}

/**
 * hh swapTokenAndToken --amountin 10 --to 0x68949B0eF5dE6087c64947bcA6c749e89B6a8bD9 --stable false --network opg
 */
task("swapTokenAndToken", "erc20->erc20")
    .addParam("amountin", "swap 金额")
    .addParam("to", "to，钱包地址和Approve钱包地址一样")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        console.log("Go ➡")
        console.log("...🚀")
        console.log("1 👈 start Balances")
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDC, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDT, wallet: taskArgs.to})

        console.log("2 👈 approve token1 token2 start")
        // @ts-ignore
        await  run("rApproveERC201", {token: process.env.USDC, router02: process.env.ROUTER, amount: "1000000000000000000000"})
        // @ts-ignore
        await  run("rApproveERC201", {token: process.env.USDT, router02: process.env.ROUTER, amount: "1000000000000000000000"})
        console.log("approve token1 token2 end")

        console.log("3 👈 get qAllowance")
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDC, router02: process.env.ROUTER, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDT, router02: process.env.ROUTER, wallet: taskArgs.to})

        console.log("4 👈 if addLiquidity")
        // @ts-ignore
        let pairaddre=await run("getPair1", {factoryaddress: process.env.FACTORY, token1: process.env.USDC, token2: process.env.USDT,stable:taskArgs.stable})
        // @ts-ignore
        if (pairaddre=="0x0000000000000000000000000000000000000000"){
            console.log("4.1 👈 addLiquidity")
            // @ts-ignore
            await run("addLiquidity1",{token1:process.env.USDC,token2:process.env.USDT,amount1desired:"1000000000000000000",amount2desired:"500000000000000000",amount1min:"0",amount2min:"0",to:taskArgs.to,router02address:process.env.ROUTER,stable:taskArgs.stable})
        }

        console.log("5 👈 getPair->getReserves")
        // @ts-ignore
        let pairaddre=await run("getPair1", {factoryaddress: process.env.FACTORY, token1: process.env.USDC, token2: process.env.USDT,stable:taskArgs.stable})
        console.log("pairaddre->",pairaddre)
        // @ts-ignore
        await run("getReserves1", {pairaddress: pairaddre})

        await Sleep(4500)
        console.log("6 👈 swapExactTokensForTokens")
        // @ts-ignore
        let hash =await run("swapExactTokensForTokens1",{token1:process.env.USDC,token2:process.env.USDT,amountin:taskArgs.amountin,amountoutmin:"0",to:taskArgs.to,router02address:process.env.ROUTER,stable:taskArgs.stable})
        // @ts-ignore
        await run("getHash1",{hash:hash})

        console.log("7 👈 getPair->getReserves")
        // @ts-ignore
        await run("getReserves1", {pairaddress: pairaddre})

        console.log("8 👈 get qAllowance")
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDC, router02: process.env.ROUTER, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDT, router02: process.env.ROUTER, wallet: taskArgs.to})

        console.log("9 👈 get Balances")
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDC, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDT, wallet: taskArgs.to})

        console.log("✨ swapTokenAndToken OK 👌")
    });


task("swapEthAndToken","eth->erc20")
    .addParam("amountin","swap 金额")
    .addParam("to","to, 钱包地址和Approve钱包地址一致")
    .addParam("stable","兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        console.log("Go ➡")
        console.log("...🚀")
        console.log("1 👈 start Balances")
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDC, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDT, wallet: taskArgs.to})

        console.log("2 👈 approve token1 token2 start")
        // @ts-ignore
        await  run("rApproveERC201", {token: process.env.USDC, router02: process.env.ROUTER, amount: "1000000000000000000000"})
        // @ts-ignore
        await  run("rApproveERC201", {token: process.env.USDT, router02: process.env.ROUTER, amount: "1000000000000000000000"})
        console.log("approve token1 token2 end")

        console.log("3 👈 get qAllowance")
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDC, router02: process.env.ROUTER, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDT, router02: process.env.ROUTER, wallet: taskArgs.to})

        console.log("4 👈 if addLiquidity")
        // @ts-ignore
        let pairaddre=await run("getPair1", {factoryaddress: process.env.FACTORY, token1: process.env.USDC, token2: process.env.USDT,stable:taskArgs.stable})
        // @ts-ignore
        if (pairaddre=="0x0000000000000000000000000000000000000000"){
            console.log("4.1 👈 addLiquidity")
            // @ts-ignore
            await run("addLiquidity1",{token1:process.env.USDC,token2:process.env.USDT,amount1desired:"1000000000000000000",amount2desired:"500000000000000000",amount1min:"0",amount2min:"0",to:taskArgs.to,router02address:process.env.ROUTER,stable:taskArgs.stable})
        }

        console.log("5 👈 getPair->getReserves")
        // @ts-ignore
        let pairaddre=await run("getPair1", {factoryaddress: process.env.FACTORY, token1: process.env.USDC, token2: process.env.USDT,stable:taskArgs.stable})
        console.log("pairaddre->",pairaddre)
        // @ts-ignore
        await run("getReserves1", {pairaddress: pairaddre})

        await Sleep(4500)
        console.log("6 👈 swapExactTokensForTokens")
        // @ts-ignore
        let hash =await run("swapExactTokensForTokens1",{token1:process.env.USDC,token2:process.env.USDT,amountin:taskArgs.amountin,amountoutmin:"0",to:taskArgs.to,router02address:process.env.ROUTER,stable:taskArgs.stable})
        // @ts-ignore
        await run("getHash1",{hash:hash})

        console.log("7 👈 getPair->getReserves")
        // @ts-ignore
        await run("getReserves1", {pairaddress: pairaddre})

        console.log("8 👈 get qAllowance")
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDC, router02: process.env.ROUTER, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDT, router02: process.env.ROUTER, wallet: taskArgs.to})

        console.log("9 👈 get Balances")
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDC, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDT, wallet: taskArgs.to})

        console.log("✨ swapTokenAndToken OK 👌")
        console.log("Go ➡")
        console.log("...🚀")
        console.log("1 👈 start Balances")
        // @ts-ignore
        await  run("qBalancesWETH1", {token: process.env.USDT, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDC, wallet: taskArgs.to})

        console.log("2 👈 approve token2 start")
        // @ts-ignore
        await  run("rApproveERC201", {token: process.env.USDC, router02: process.env.ROUTER, amount: "1000000000000000000000"})
        console.log("approve token2 end")

        console.log("3 👈 get qAllowance")
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDT, router02: process.env.ROUTER, wallet: taskArgs.to})

        console.log("4 👈 if addLiquidity")
        // @ts-ignore
        let pairaddre=await run("getPair1", {factoryaddress: process.env.FACTORY, token1: process.env.USDC, token2: process.env.USDT,stable:taskArgs.stable})
        // @ts-ignore
        if (pairaddre=="0x0000000000000000000000000000000000000000"){
            console.log("4.1 👈 addLiquidity")
            // @ts-ignore
            await run("addLiquidityEth1",{token1:process.env.ETH,token2:process.env.USDT,amount1desired:"1000000000000000000",amount2desired:"1340000000000000000000",amount1min:"0",amount2min:"0",to:taskArgs.to,router02address:process.env.ROUTER,stable:taskArgs.stable})
        }

        console.log("5 👈 getPair->getReserves")
        // @ts-ignore
        let pairaddre=await run("getPair1", {factoryaddress: process.env.FACTORY, token1: process.env.USDC, token2: process.env.USDT,stable:taskArgs.stable})
        console.log("pairaddre->",pairaddre)
        // @ts-ignore
        await run("getReserves1", {pairaddress: pairaddre})

        await Sleep(4500)
        console.log("6 👈 swapExactTokensForTokens")
        // @ts-ignore
        let hash =await run("swapExactETHForTokens1",{token1:process.env.USDC,token2:process.env.USDT,amountin:taskArgs.amountin,amountoutmin:"0",to:taskArgs.to,router02address:process.env.ROUTER,stable:taskArgs.stable})
        // @ts-ignore
        await run("getHash1",{hash:hash})

        console.log("7 👈 getPair->getReserves")
        // @ts-ignore
        await run("getReserves1", {pairaddress: pairaddre})

        console.log("8 👈 get qAllowance")
        // @ts-ignore
        await  run("qAllowanceERC201", {token: process.env.USDT, router02: process.env.ROUTER, wallet: taskArgs.to})

        console.log("9 👈 get Balances")
        // @ts-ignore
        await  run("qBalancesWETH1", {token: process.env.USDC, wallet: taskArgs.to})
        // @ts-ignore
        await  run("qBalancesERC201", {token: process.env.USDT, wallet: taskArgs.to})

        console.log("✨ swapEthAndToken OK 👌")
        });


/**
 *
 * hh deployToken --network opg
 * export ERC20_TOKEN_01=0x960203b9c264823b1d520418b78ff18325444305 tt
 * export WETH9_TOKEN_02=0x33e831a5cb918a72065854e6085bdbd7ea5c2c45 WETH9
 * ERC20_TOKEN_01=0x61a8a9eb8af20(18efdd3a861db60f16758cb5078 AA
 * ERC20_TOKEN_01=0x99f9641ac02c0c8a1206698e9f9e08618cb7477b BB
 * hh deployToken --network opg
 * 部署合约并获取token对
 */
subtask("deployToken", "Deploy Token")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('TT')
        const token = await tokenFactory.deploy()
        await token.deployed();
        console.log("export ERC20_TOKEN_01=%s", token.address.toLocaleLowerCase())
        // const tokenFactory01 = await hre.ethers.getContractFactory('WETH9')
        // const token01 = await tokenFactory01.deploy()
        // await token01.deployed();
        // console.log("export WETH9_TOKEN_02=%s", token01.address.toLocaleLowerCase())
    });


/**
 * 部署task新的网络需要部署，部署好后直接使用就好
 * hh deploySwapAll --factoryaddress 0x91ca2eeead12c7de23461d49f1dd1b9e7bd61506 --wethaddress 0x33e831a5cb918a72065854e6085bdbd7ea5c2c45 --network bitnetwork
 */
subtask("deploySwapAll1", "Deploy Token")
    .addParam("factoryaddress", "factoryaddress合约地址")
    .addParam("wethaddress", "wethaddress合约地址")
    .setAction(async (taskArgs, hre) => {
        const uniswapV2Router02 = await hre.ethers.getContractFactory('UniswapV2Router02')
        const contractsAddress = await uniswapV2Router02.deploy(taskArgs.factoryaddress,taskArgs.wethaddress)
        await contractsAddress.deployed();
        console.log("export uniswapV2Router02Address=%s", contractsAddress.address.toLocaleLowerCase())
    });

/**
 * hh deploySlidingWindowOracle --windowsize 24 --granularity 24 --factoryaddress 0x75866fdc1fe08cc5c6742b2f447a3a87007e5c7d --network rinkeby
 * export exampleSlidingWindowOracle=0x298ef379936eecf0e4027b4fbd0b1e50fffeccbf
 */
subtask("deploySlidingWindowOracle1", "滑动窗口预言机部署")
    .addParam("windowsize", "windowSize窗口数量")
    .addParam("factoryaddress", "factoryaddress合约地址")
    .addParam("granularity", "granularity分片大小")
    .setAction(async (taskArgs, hre) => {
        const exampleSlidingWindowOracle = await hre.ethers.getContractFactory('ExampleSlidingWindowOracle')
        const contractsAddress = await exampleSlidingWindowOracle.deploy(taskArgs.factoryaddress,taskArgs.windowsize,taskArgs.granularity)
        await contractsAddress.deployed();
        console.log("export exampleSlidingWindowOracle=%s", contractsAddress.address.toLocaleLowerCase())
    });


/**
 *
 * hh deployMulticall --network bitnetwork
 */
subtask("deployMulticall1", "deployMulticall")
    .setAction(async (taskArgs, hre) => {
        const multicall = await hre.ethers.getContractFactory('Multicall')
        const contractsAddress = await multicall.deploy()
        await contractsAddress.deployed();
        console.log("export multicall=%s", contractsAddress.address.toLocaleLowerCase())
    });


/**
 * hh updateWindow --token01 0xf5e5b77dd4040f5f4c2c1ac8ab18968ef79fd6fe --token02 0xd7c3cc3bcbac0679eae85b40d985ac5a8d4b0092 --slidingwindoworacle 0x298ef379936eecf0e4027b4fbd0b1e50fffeccbf --network rinkeby
 */
subtask("updateWindow1", "updateWindow")
    .addParam("token01", "token01")
    .addParam("token02", "token01")
    .addParam("slidingwindoworacle", "slidingWindowOracle合约地址")
    .setAction(async (taskArgs, hre) => {
        const exampleSlidingWindowOracle = await hre.ethers.getContractFactory('ExampleSlidingWindowOracle')
        const slidingWindowOracleContracts = await exampleSlidingWindowOracle.attach(taskArgs.slidingwindoworacle)
        const updateWindowOracleData: [string,string] = [
            taskArgs.token01,
            taskArgs.token02
        ]
        console.log("updateWindowOracleData=%s", updateWindowOracleData)
        let updateWindowOracleDataRes= await slidingWindowOracleContracts.update(...updateWindowOracleData)
        console.log("export updateWindowOracleDataRes=%s", updateWindowOracleDataRes)
    });


/**
 * hh getConsult --tokenin 0x5444548282666a1Cf54698445cc98CB9b6B73831 --tokenout 0xd5f61c8786c71a2A0C80F6fC405814952AEE7696 --amountin 4000000 --slidingwindoworacle 0x298ef379936eecf0e4027b4fbd0b1e50fffeccbf --network rinkeby
 */
subtask("getConsult1", "获取Consult")
    .addParam("tokenin", "输入token")
    .addParam("tokenout", "输出token")
    .addParam("slidingwindoworacle", "slidingWindowOracle合约地址")
    .addParam("amountin", "输入金额")
    .setAction(async (taskArgs, hre) => {
        const exampleSlidingWindowOracle = await hre.ethers.getContractFactory('ExampleSlidingWindowOracle')
        const slidingWindowOracleContracts = await exampleSlidingWindowOracle.attach(taskArgs.slidingwindoworacle)
        const slidingWindowOracleData: [string,bigint,string] = [
            taskArgs.tokenin,
            taskArgs.amountin,
            taskArgs.tokenout
        ]
        console.log("slidingWindowOracleData=%s", slidingWindowOracleData)
        let  slidingWindowOracleDataRes= await slidingWindowOracleContracts.consult(...slidingWindowOracleData)
        console.log("export slidingWindowOracleDataRes=%s", slidingWindowOracleDataRes)
    });


/**
 * getAmountsOut
 * 查询任意金额可兑换额度
 */
subtask("getAmountsOut1", "getAmountsOut")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("router02address", "TeleswapV2Router02.sol合约地址")
    .addParam("amountin", "输入金额")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let amountIn = taskArgs.amountin
        let routes = [{
            from   :   taskArgs.token1,
            to:       taskArgs.token2,
            stable:   taskArgs.stable
        }]
        console.log("export route=%s", JSON.stringify(routes))
        let getAmountsOutRes= await router02address.getAmountsOut(amountIn,routes)
        console.log("volatile getAmountsOutRes:", getAmountsOutRes.map((item: ethers.BigNumberish) => ethers.utils.formatEther(item)))
    });


subtask("getAmountsIn1", "getAmountsIn")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("router02address", "TeleswapV2Router02.sol合约地址")
    .addParam("amountout", "amountout")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let amountOut = taskArgs.amountout
        let routes = [{
            from   :   taskArgs.token1,
            to:       taskArgs.token2,
            stable:   taskArgs.stable
        }]
        console.log("export route=%s", JSON.stringify(routes))
        let getAmountsOutRes= await router02address.getAmountsOut(amountOut,routes)
        console.log("volatile getAmountsIn:", getAmountsOutRes.map((item: ethers.BigNumberish) => ethers.utils.formatEther(item)))
    });

/**
 * 使用的token及私钥地址可在.env文件中进行配置
 * 查询ERC20合约 token的余额
 */
subtask("qBalancesERC201", "查询余额或者代币余额")
    .addParam("token", "代币地址", "")
    .addParam("wallet", "待查询的钱包地址")
    .setAction(async (taskArgs, hre) => {
        let balances: string

        // 若果是address(0)，则直接查询余额
        if (taskArgs.token === "" ||
            taskArgs.token === "0x0000000000000000000000000000000000000000") {
            balances = await hre.web3.eth.getBalance(taskArgs.wallet)
        } else {
            // 查询代币余额
            const tokenFactory = await hre.ethers.getContractFactory('TT')
            const token = await tokenFactory.attach(taskArgs.token)

            balances = (await token.balanceOf(taskArgs.wallet)).toString()
        }

        console.log("balance: ", balances)
        console.log("time: ", (new Date()).valueOf())
    });


/**
 * 查询WETH合约 token的余额
 */
subtask("qBalancesWETH1", "查询余额或者代币余额")
    .addParam("token", "代币地址", "")
    .addParam("wallet", "待查询的钱包地址")
    .setAction(async (taskArgs, hre) => {
        let balances: string

        // 若果是address(0)，则直接查询余额
        if (taskArgs.token === "" ||
            taskArgs.token === "0x0000000000000000000000000000000000000000") {
            balances = await hre.web3.eth.getBalance(taskArgs.wallet)
        } else {
            // 查询代币余额
            const tokenFactory = await hre.ethers.getContractFactory('WETH9')
            const token = await tokenFactory.attach(taskArgs.token)

            balances = (await token.balanceOf(taskArgs.wallet)).toString()
        }

        console.log("balance: ", balances)
        console.log("time: ", (new Date()).valueOf())
    });


/**
 * 查询收费合约 token的余额
 */
subtask("qBalancesSETH1", "查询余额或者代币余额")
    .addParam("token", "代币地址", "")
    .addParam("wallet", "待查询的钱包地址")
    .setAction(async (taskArgs, hre) => {
        let balances: string

        // 若果是address(0)，则直接查询余额
        if (taskArgs.token === "" ||
            taskArgs.token === "0x0000000000000000000000000000000000000000") {
            balances = await hre.web3.eth.getBalance(taskArgs.wallet)
        } else {
            // 查询代币余额
            const tokenFactory = await hre.ethers.getContractFactory('TetherToken')
            const token = await tokenFactory.attach(taskArgs.token)

            balances = (await token.balanceOf(taskArgs.wallet)).toString()
        }

        console.log("balance: ", balances)
        console.log("time: ", (new Date()).valueOf())
    });


/**
 * 查询 ERC20合约token的Allowance
 */
subtask("qAllowanceERC201", "查询允许调用的额度")
    .addParam("token", "代币地址")
    .addParam("router02", "被授权的router02合约地址")
    .addParam("wallet", "授权的钱包地址")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('TT')
        const token = await tokenFactory.attach(taskArgs.token)

        let allowances = (await token.allowance(taskArgs.wallet, taskArgs.router02))

        console.log("allowances: ", allowances)
        console.log("time: ", (new Date()).valueOf())
    });

/**
 * 查询 WETH合约token的Allowance
 */
subtask("qAllowanceWETH1", "查询允许调用的额度")
    .addParam("token", "代币地址")
    .addParam("router02", "被授权的router02合约地址")
    .addParam("wallet", "授权的钱包地址")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('WETH9')
        const token = await tokenFactory.attach(taskArgs.token)

        let allowances = (await token.allowance(taskArgs.wallet, taskArgs.router02))

        console.log("allowances: ", allowances)
        console.log("time: ", (new Date()).valueOf())
    });


/**
 * 查询 收费合约token的Allowance
 */
subtask("qAllowanceSETH1", "查询允许调用的额度")
    .addParam("token", "代币地址")
    .addParam("router02", "被授权的router02合约地址")
    .addParam("wallet", "授权的钱包地址")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('TetherToken')
        const token = await tokenFactory.attach(taskArgs.token)

        let allowances = (await token.allowance(taskArgs.wallet, taskArgs.router02))

        console.log("allowances: ", allowances)
        console.log("time: ", (new Date()).valueOf())
    });


/**
 * yarn hardhat rApproveERC20 --token 0x99f9641ac02c0c8a1206698e9f9e08618cb7477b --router02 0x971a96fe8597fd7a042b5894600ba5e20EBB39ee --amount 200000000000000000000 --network opg
 * ERC20 授权额度查询
 */
subtask("rApproveERC201", "授权调用额度")
    .addParam("token", "代币地址")
    .addParam("router02", "被授权的router02合约地址")
    .addParam("amount", "金额")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('TT')
        const token = await tokenFactory.attach(taskArgs.token)

        let transaction = await token.approve(taskArgs.router02, taskArgs.amount)

        console.log("approve txHash: ", transaction.hash)
        console.log("time: ", (new Date()).valueOf())
    });

/**
 * WETH 授权额度查询
 */
subtask("rApproveWETH1", "授权调用额度")
    .addParam("token", "代币地址")
    .addParam("router02", "被授权的router02合约地址")
    .addParam("amount", "金额")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('WETH9')
        const token = await tokenFactory.attach(taskArgs.token)

        let transaction = await token.approve(taskArgs.router02, taskArgs.amount)

        console.log("approve txHash: ", transaction.hash)
        console.log("time: ", (new Date()).valueOf())
    });


/**
 * 收费合约token 授权额度查询
 */
subtask("rApproveSETH1", "授权调用额度")
    .addParam("token", "代币地址")
    .addParam("router02", "被授权的router02合约地址")
    .addParam("amount", "金额")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('TetherToken')
        const token = await tokenFactory.attach(taskArgs.token)

        let transaction = await token.approve(taskArgs.router02, taskArgs.amount)

        console.log("approve txHash: ", transaction.hash)
        console.log("time: ", (new Date()).valueOf())
    });

/**
 * 5000000000,2000000000
 * yarn hardhat addLiquidity --token1 0x61a8a9eb8af2018efdd3a861db60f16758cb5078 --token2 0x99f9641ac02c0c8a1206698e9f9e08618cb7477b --amount1desired 50000000000000000000 --amount2desired 100000000000000000000 --amount1min 0 --amount2min 0 --to 0x68949B0eF5dE6087c64947bcA6c749e89B6a8bD9 --router02address 0x971a96fe8597fd7a042b5894600ba5e20EBB39ee --stable false --network opg
 * 部署task新的网络需要部署，部署好后直接使用就好,注意token的精读
 * ERC20 添加liquidity
 * 操作过程中Allowance中需要始终保持有额度，否则将影响后续操作
 */
subtask("addLiquidity1", "增加流通性")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("amount1desired", "amount1desired")
    .addParam("amount2desired", "amount2desired")
    .addParam("amount1min", "amount1min")
    .addParam("amount2min", "amount2min")
    .addParam("to", "to，一般为调用者钱包地址")
    .addParam("router02address", "TeleswapV2Router02合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        let route= {
            from:  taskArgs.token1,
            to: taskArgs.token2,
            stable:taskArgs.stable
        }
        let addLiquidityRes= await router02address.addLiquidity(route,
            taskArgs.amount1desired,
            taskArgs.amount2desired,
            taskArgs.amount1min,
            taskArgs.amount2min,
            taskArgs.to,
            date1.valueOf())
        console.log("addLiquidityRes->hash=%s", addLiquidityRes.hash)
    });


/**
 * 5000000000,2000000000
 * 部署task新的网络需要部署，部署好后直接使用就好,注意token的精读
 * WETH 增加liquidity
 */
subtask("addLiquidityEth1", "增加流通性")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("amount1desired", "amount1desired")
    .addParam("amount2desired", "amount2desired")
    .addParam("to", "to，一般为调用者钱包地址")
    .addParam("router02address", "TeleswapV2Router02合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        let route= {
            from:  taskArgs.token1,
            to: taskArgs.token2,
            stable:taskArgs.stable
        }
        let addLiquidityRes= await router02address.addLiquidityETH(route,
            taskArgs.amount1desired,
            0,
            0,
            taskArgs.to,
            date1.valueOf(),{value: taskArgs.amount2desired})
        console.log("addLiquidityEth->hash=%s", addLiquidityRes.hash)
    });


/**
 * 50,00000000,20,00000000
 * 注意token的精读 代币替换代币
 * 执行swap
 * amountin 是有增加系数的，若需要支持小数则需要更新task，hardhat不支持输入小数
 */
subtask("swapExactTokensForTokens1", "swapExactTokensForTokens")
    .addParam("amountin", "使用金额")
    .addParam("amountoutmin", "最低到账金额")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let route= [
            taskArgs.token1,
            taskArgs.token2,
            taskArgs.stable
        ]
        let amountIn = expandTo18Decimals(taskArgs.amountin)
        const swapExactTokensForTokensData: [BigNumber,bigint,any[],string,number] = [
            amountIn,
            taskArgs.amountoutmin,
            new Array(route),
            taskArgs.to,
            date1.valueOf(),
        ]
        let swapExactTokensForTokensRes= await router02address.swapExactTokensForTokens(...swapExactTokensForTokensData)
        console.log("swapExactTokensForTokens->hash=%s", swapExactTokensForTokensRes.hash)
        return swapExactTokensForTokensRes.hash
    });

/**
 * eth --> tokens
 */
subtask("swapExactETHForTokens1", "swapExactETHForTokens")
    .addParam("amountin", "使用金额")
    .addParam("amountoutmin", "最低到账金额")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let route= [
            taskArgs.token1,
            taskArgs.token2,
            taskArgs.stable
        ]
        let amountIn = taskArgs.amountin
        const swapExactETHForTokensData: [BigNumber,any[],string,number] = [
            taskArgs.amountoutmin,
            new Array(route),
            taskArgs.to,
            date1.valueOf(),
        ]
        let swapExactETHForTokensRes= await router02address.swapExactETHForTokens(...swapExactETHForTokensData,{value:amountIn})
        console.log("swapExactETHForTokensRes->hash=%s", swapExactETHForTokensRes.hash)
    });

/**
 * tokens -> eth
 */
subtask("swapTokensForExactETH1", "swapTokensForExactETH")
    .addParam("amountout", "使用金额")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let route= [
            taskArgs.token1,
            taskArgs.token2,
            taskArgs.stable
        ]
        let amountOut = taskArgs.amountout
        const swapTokensForExactETHData: [BigNumber,string,any[],string,number] = [
            amountOut, '100000000000000000000',
            new Array(route),
            taskArgs.to,
            date1.valueOf(),
        ]
        //console.log("swapTokensForExactETHData->%s", swapTokensForExactETHData)
        let swapTokensForExactETHRes= await router02address.swapTokensForExactETH(...swapTokensForExactETHData)
        console.log("swapTokensForExactETHRes->hash=%s", swapTokensForExactETHRes.hash)
    });


/**
 * tokens -> 扣费合约token
 */
subtask("swapExactTokensForTokensSupportingFeeOnTransferTokens1", "swapExactTokensForTokensSupportingFeeOnTransferTokens")
    .addParam("amountin", "使用金额")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let route= [
            taskArgs.token1,
            taskArgs.token2,
            taskArgs.stable
        ]
        let amountIn = expandTo18Decimals(taskArgs.amountin)
        const swapExactTokensForTokensSupportingFeeOnTransferTokensData: [BigNumber,string,any[],string,number] = [
            amountIn,
            "0",
            new Array(route),
            taskArgs.to,
            date1.valueOf(),
        ]
        //console.log("swapTokensForExactETHData->%s", swapTokensForExactETHData)
        let swapExactTokensForTokensSupportingFeeOnTransferTokensDataRes= await router02address.swapExactTokensForTokensSupportingFeeOnTransferTokens(...swapExactTokensForTokensSupportingFeeOnTransferTokensData)
        console.log("swapExactTokensForTokensSupportingFeeOnTransferTokensDataRes->hash=%s", swapExactTokensForTokensSupportingFeeOnTransferTokensDataRes.hash)
    });


/**
 * eth --> 扣费合约token
 */
subtask("swapExactETHForTokensSupportingFeeOnTransferTokens1", "swapExactETHForTokensSupportingFeeOnTransferTokens")
    .addParam("amountin", "使用金额")
    .addParam("amountoutmin", "最低到账金额")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let route= [
            taskArgs.token1,
            taskArgs.token2,
            taskArgs.stable
        ]
        let amountIn = taskArgs.amountin
        const swapExactETHForTokensSupportingFeeOnTransferTokensData: [BigNumber,any[],string,number] = [
            taskArgs.amountoutmin,
            new Array(route),
            taskArgs.to,
            date1.valueOf(),
        ]
        let swapExactETHForTokensSupportingFeeOnTransferTokensRes= await router02address.swapExactETHForTokensSupportingFeeOnTransferTokens(...swapExactETHForTokensSupportingFeeOnTransferTokensData,{value:amountIn})
        console.log("swapExactETHForTokensSupportingFeeOnTransferTokensRes->hash=%s", swapExactETHForTokensSupportingFeeOnTransferTokensRes.hash)
    });

/**
 * 扣费合约token -> eth
 */
subtask("swapExactTokensForETHSupportingFeeOnTransferTokens1", "swapExactTokensForETHSupportingFeeOnTransferTokens")
    .addParam("amountout", "使用金额")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)
        let route= [
            taskArgs.token1,
            taskArgs.token2,
            taskArgs.stable
        ]
        let amountOut = taskArgs.amountout
        const swapExactTokensForETHSupportingFeeOnTransferTokensData: [BigNumber,string,any[],string,number] = [
            amountOut,
            '0',
            new Array(route),
            taskArgs.to,
            date1.valueOf(),
        ]
        //console.log("swapTokensForExactETHData->%s", swapTokensForExactETHData)
        let swapExactTokensForETHSupportingFeeOnTransferTokensRes= await router02address.swapExactTokensForETHSupportingFeeOnTransferTokens(...swapExactTokensForETHSupportingFeeOnTransferTokensData)
        console.log("swapExactTokensForETHSupportingFeeOnTransferTokensRes->hash=%s", swapExactTokensForETHSupportingFeeOnTransferTokensRes.hash)
    });


// ---------分-----------割-----------线------下----

/**
 * 删除liquidity（ETH）
 */
subtask("removeLiquidityETH1", "removeLiquidityETH 取消消除流动性")
    .addParam("liquidity", "流动性")
    .addParam("erc20addr", "erc20地址")
    .addParam("wethaddr", "weth地址")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)

        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        let route= {
            from:  taskArgs.erc20addr,
            to: taskArgs.wethaddr,
            stable:taskArgs.stable
        }
        let removeLiquidityETHRes= await router02address.removeLiquidityETH(
            route,
            taskArgs.liquidity,
            0,
            0,
            taskArgs.to,
            date1.valueOf()
        )
        console.log("removeLiquidityETH->hash=%s", removeLiquidityETHRes.hash)
    });

/**
 * 50,00000000,20,00000000
 * 注意token的精度 removeLiquidityWithPermit 取消消除流动性
 * remove liqudity
 * task中有url/chainId 必须与执行的网络保持一致
 */
subtask("removeLiquidityWithPermit1", "removeLiquidityWithPermit 取消消除流动性")
    .addParam("liquidity", "流动性")
    .addParam("amountamin", "amountamin")
    .addParam("amountbmin", "amountbmin")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("privatekey", "签名私钥")
    .addParam("pairaddress", "token对应的pairaddress合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)

        let url = "https://goerli.optimism.io";
        let customHttpProvider = new ethers.providers.JsonRpcProvider(url);
        let wallet = new hre.ethers.Wallet(taskArgs.privatekey, customHttpProvider);
        const pair =new hre.ethers.Contract(taskArgs.pairaddress, TeleswapV2Pair, wallet)
        let  nonce =await pair.nonces(wallet.address)
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const typedData: TypedData = {
            types :{
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                Permit: [
                    {name: 'owner', type: 'address'},
                    {name: 'spender', type: 'address'},
                    {name: 'value', type: 'uint256'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'}
                ]
            },
            primaryType: 'Permit',
            domain : {
                name:  'Teleswap V2',
                version: '1',
                chainId: 420,
                verifyingContract: taskArgs.pairaddress
            },
            message : {
                owner: wallet.address,
                spender: taskArgs.router02address,
                value: taskArgs.liquidity,
                nonce: nonce.toNumber(),
                deadline: date1.valueOf()
            }
        };
        const signingKey = new utils.SigningKey(wallet.privateKey);
        console.info(`typedData-data:`,typedData)
        // Get a signable message from the typed data
        const message = getMessage(typedData, true);
        console.info(`typedData-data:`,typedData)
        let route= {
            from:  taskArgs.token1,
            to: taskArgs.token2,
            stable:taskArgs.stable
        }
        let removeLiquidityWithPermitRes= await router02address.removeLiquidityWithPermit(
            route,
            taskArgs.liquidity,
            taskArgs.amountamin.toString(),
            taskArgs.amountbmin.toString(),
            taskArgs.to,
            date1.valueOf(),
            false,
            signingKey.signDigest(message))
        console.log("removeLiquidityWithPermitRes->hash=%s", removeLiquidityWithPermitRes.hash)
    });

/**
 * task中有url/chainId 必须与执行的网络保持一致
 */
subtask("removeLiquidityETHWithPermit1", "removeLiquidityETHWithPermit 取消消除流动性")
    .addParam("liquidity", "流动性")
    .addParam("erc20addr", "erc20地址")
    .addParam("wethaddr", "weth地址")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("privatekey", "签名私钥")
    .addParam("pairaddress", "token对应的pairaddress合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)

        let url = "https://rinkeby.infura.io/v3/023f2af0f670457d9c4ea9cb524f0810";
        let customHttpProvider = new ethers.providers.JsonRpcProvider(url);
        let wallet = new hre.ethers.Wallet(taskArgs.privatekey, customHttpProvider);
        const pair =new hre.ethers.Contract(taskArgs.pairaddress, TeleswapV2Pair, wallet)
        let  nonce =await pair.nonces(wallet.address)
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const typedData: TypedData = {
            types :{
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                Permit: [
                    {name: 'owner', type: 'address'},
                    {name: 'spender', type: 'address'},
                    {name: 'value', type: 'uint256'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'}
                ]
            },
            primaryType: 'Permit',
            domain : {
                name:  'Teleswap V2',
                version: '1',
                chainId: 4,
                verifyingContract: taskArgs.pairaddress
            },
            message : {
                owner: wallet.address,
                spender: taskArgs.router02address,
                value: taskArgs.liquidity,
                nonce: nonce.toNumber(),
                deadline: date1.valueOf()
            }
        };
        const signingKey = new utils.SigningKey(wallet.privateKey);
        // Get a signable message from the typed data
        const message = getMessage(typedData, true);
        console.info(`typedData-data:`,typedData)
        let route= {
            from:  taskArgs.wethaddr,
            to: taskArgs.erc20addr,
            stable:taskArgs.stable
        }
        let removeLiquidityETHWithPermitRes= await router02address.removeLiquidityETHWithPermit(
            route,
            taskArgs.liquidity,
            0,
            0,
            taskArgs.to,
            date1.valueOf(),
            false,
            signingKey.signDigest(message))
        console.log("removeLiquidityETHWithPermit->hash=%s", removeLiquidityETHWithPermitRes.hash)
    });


/**
 * remove liquidity 收费合约
 * task中有url/chainId 必须与执行的网络保持一致
 */
subtask("removeLiquidityETHSupportingFeeOnTransferTokens1", "removeLiquidityETHSupportingFeeOnTransferTokens 取消消除流动性")
    .addParam("liquidity", "流动性")
    .addParam("erc20addr", "erc20地址")
    .addParam("wethaddr", "weth地址")
    .addParam("to", "to，钱包地址")
    .addParam("router02address", "uniswapV2Router02Address合约地址")
    .addParam("privatekey", "签名私钥")
    .addParam("pairaddress", "token对应的pairaddress合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Router02 = await hre.ethers.getContractFactory('TeleswapV2Router02')
        const router02address = await teleswapV2Router02.attach(taskArgs.router02address)

        let url = "https://rinkeby.infura.io/v3/023f2af0f670457d9c4ea9cb524f0810";
        let customHttpProvider = new ethers.providers.JsonRpcProvider(url);
        let wallet = new hre.ethers.Wallet(taskArgs.privatekey, customHttpProvider);
        const pair =new hre.ethers.Contract(taskArgs.pairaddress, TeleswapV2Pair, wallet)
        let  nonce =await pair.nonces(wallet.address)
        let date1 =Math.round((new Date().getTime()+3600000)/1000)
        const typedData: TypedData = {
            types :{
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                Permit: [
                    {name: 'owner', type: 'address'},
                    {name: 'spender', type: 'address'},
                    {name: 'value', type: 'uint256'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'}
                ]
            },
            primaryType: 'Permit',
            domain : {
                name:  'Teleswap V2',
                version: '1',
                chainId: 4,
                verifyingContract: taskArgs.pairaddress
            },
            message : {
                owner: wallet.address,
                spender: taskArgs.router02address,
                value: taskArgs.liquidity,
                nonce: nonce.toNumber(),
                deadline: date1.valueOf()
            }
        };
        const signingKey = new utils.SigningKey(wallet.privateKey);
        // Get a signable message from the typed data
        const message = getMessage(typedData, true);
        console.info(`typedData-data:`,typedData)
        let route= {
            from:  taskArgs.erc20addr,
            to: taskArgs.wethaddr,
            stable:taskArgs.stable
        }
        let removeLiquidityETHSupportingFeeOnTransferTokensRes= await router02address.removeLiquidityETHSupportingFeeOnTransferTokens(
            route,
            taskArgs.liquidity,
            0,
            0,
            taskArgs.to,
            date1.valueOf())
        console.log("removeLiquidityETHSupportingFeeOnTransferTokensRes->hash=%s", removeLiquidityETHSupportingFeeOnTransferTokensRes.hash)
    });


/**
 * yarn hardhat mint --erc20address 0x99f9641ac02c0c8a1206698e9f9e08618cb7477b --network opg
 * hh mint --erc20address 0x960203b9c264823b1d520418b78ff18325444305 --network rinkeby
 * mint操作不需要指定to及金额，合约中写死了
 */
subtask("mint1", "mint 初始化")
    .addParam("erc20address", "erc20address合约地址")
    .setAction(async (taskArgs, hre) => {
        const erc20 = await hre.ethers.getContractFactory('TT')
        const uniswapV2 = await erc20.attach(taskArgs.erc20address)
        let mintRes =await uniswapV2.mint()
        console.log("mintRes:",mintRes)
    });


/**
 * yarn hardhat deployTetherToken --network opg
 */
subtask("deployTetherToken1", "deployTetherToken")
    .setAction(async (taskArgs, hre) => {
        const tetherToken = await hre.ethers.getContractFactory('TetherToken')
        let deployRes =await tetherToken.deploy("10000000000000000000000","ser","SETH",18)
        await deployRes.deployed();
        console.log("deployRes:",deployRes.address.toLocaleLowerCase())
    });

/**
 * hh mintWETH --wethaddress 0x4E283927E35b7118eA546Ef58Ea60bfF59E857DB --network opg
 * hh mintWETH --wethaddress 0x33e831a5cb918a72065854e6085bdbd7ea5c2c45 --network rinkeby
 */
subtask("mintWETH1", "mint 初始化")
    .addParam("wethaddress", "wethaddress合约地址")
    .setAction(async (taskArgs, hre) => {
        const erc20 = await hre.ethers.getContractFactory('WETH9')
        const uniswapV2 = await erc20.attach(taskArgs.wethaddress)
        let mintRes =await uniswapV2.mint()
        console.log("mintRes:",mintRes)
    });

/**
 * export pairInitCodeHash=0x1ee787dd500ff0ddafab339d616b981c1711abc5a7bd7f187bd82c15ec518258
 * hh getFactoryInitCode --factoryaddress 0x4f9cfa00a70489f80162960b06908538ea1dffd2 --network rinkeby
 * export pairInitCodeHash=0x0849561beeae80e10e387edae371fa9302e24cdefac26d4c95a570928c4b32c6
 * hh getFactoryInitCode --factoryaddress 0x91ca2eeead12c7de23461d49f1dd1b9e7bd61506 --network bitnetwork
 */
subtask("getFactoryInitCode1", "getFactoryInitCode")
    .addParam("factoryaddress", "uniswapV2Factory合约地址")
    .setAction(async (taskArgs, hre) => {
        const uniswapV2Factory = await hre.ethers.getContractFactory('UniswapV2Factory')
        const uniswapV2 = await uniswapV2Factory.attach(taskArgs.factoryaddress)
        console.log("export pairInitCodeHash=%s",await uniswapV2.pairInitCodeHash())
    });

/**
 * 查询token对相应的pair地址
 * yarn hardhat getPair --factoryaddress 0xc58E0590015aeF1b28B69213808Adf2e21A4dAe5 --token1 0x61a8a9eb8af2018efdd3a861db60f16758cb5078 --token2 0x99f9641ac02c0c8a1206698e9f9e08618cb7477b --stable false --network opg
 * export getPair=0x395E10137bA69D941E5acC5A287398f949Cc7109
 * */
subtask("getPair1", "getPair")
    .addParam("token1", "token1")
    .addParam("token2", "token2")
    .addParam("factoryaddress", "uniswapV2Factory合约地址")
    .addParam("stable", "# 兑换方式 false->volatile true->stableswap",false,types.boolean)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Factory = await hre.ethers.getContractFactory('TeleswapV2Factory')
        const uniswapV2 = await teleswapV2Factory.attach(taskArgs.factoryaddress)
        const getPairData: [string,string,boolean] = [
            taskArgs.token1,
            taskArgs.token2,
            taskArgs.stable
        ]
       const pairaddress=await uniswapV2.getPair(...getPairData)
       //console.log("export getPair=%s",pairaddress)
       return pairaddress
    });


/**
 * pair比例值查询
 * */
subtask("getPairBalanceOf1", "getPair")
    .addParam("teleswapv2pairaddress", "teleswapV2Pairaddress合约地址")
    .addParam("to", "taddress")
    .addParam("proportion", "%比例" ,1 ,types.int)
    .setAction(async (taskArgs, hre) => {
        const teleswapV2Pair = await hre.ethers.getContractFactory('TeleswapV2Pair')
        const uniswapV2 = await teleswapV2Pair.attach(taskArgs.teleswapv2pairaddress)
        const balanceOf=await uniswapV2.balanceOf(taskArgs.to)
        console.log("export balanceOf=%s",balanceOf.mul(taskArgs.proportion).div(100))
    });


/**
 * export ERC20_TOKEN_02=0xdb15d02b15918e0a0bdbfde45857b096e7c36a61 tw
 * export ERC20_TOKEN_02=0x74203043c8191893579fe0f797694364a791df65 cf
 * hh qDecimals --token 0xf5e5b77dd4040f5f4c2c1ac8ab18968ef79fd6fe --network rinkeby
 */
subtask("qDecimals1", "查询ERC20合约的decimal")
    .addParam("token", "代币地址")
    .setAction(async (taskArgs, hre) => {
        // 链接合约
        const tokenFactory = await hre.ethers.getContractFactory('TT')
        const token = await tokenFactory.attach(taskArgs.token)

        const name = await token.name()
        const decimals = await token.decimals()
        const symbol = await token.symbol()
        const totalSupply = await token.totalSupply()

        console.log("token name: ", name)
        console.log("token decimals: ", decimals)
        console.log("token symbol: ", symbol)
        console.log("token totalSupply: ", totalSupply.toString())
        console.log("time: ", (new Date()).valueOf())
    });

/**
 * getReserves
 * hh getReserves --pairaddress 0x395E10137bA69D941E5acC5A287398f949Cc7109 --network opg
 */
subtask("getReserves1", "allPairs")
    .addParam("pairaddress", "pairaddress合约地址")
    .setAction(async (taskArgs, hre) => {
        const uniswapV2Factory = await hre.ethers.getContractFactory('TeleswapV2Pair')
        const uniswapV2 = await uniswapV2Factory.attach(taskArgs.pairaddress)
        let reserves= await uniswapV2.getReserves()
        console.log("getReserves->",reserves)
    });


/**
 * hh getHash --hash 0x6ee8ae7c6a0f4a54fa8f6d5736c16ec5d8206c37a51f84f0b6fdf034ee35192c --network opg
 * 可查询交易hash详情
 */
subtask("getHash1","获取交易凭证信息")
    .addParam("hash", "交易hash")
    .setAction(async(taskArgs,hre)=>{
        let transaction = await hre.web3.eth.getTransaction(taskArgs.hash)

        if (transaction.blockNumber!) {
            let transactionReceipt = await hre.web3.eth.getTransactionReceipt(taskArgs.hash)
            let block = await hre.web3.eth.getBlock(transaction.blockNumber!)
            console.log("block timestamp: ", block.timestamp)
            console.log("blockHash: ", transaction.blockHash)
            console.log("blockNumber: ", transaction.blockNumber)
            console.log("status: ", transactionReceipt.status)
            console.log("cumulativeGasUsed: ", transactionReceipt.cumulativeGasUsed)
            console.log("contractAddress: ", transactionReceipt.contractAddress)
            // console.log("transactionReceipt: ",transactionReceipt)
        }
        console.log("time: ", (new Date()).valueOf())
    });

function expandTo18Decimals(n: string) {
    return BigNumber.from(n).mul(BigNumber.from("10").pow(18))
}
module.exports = {}




