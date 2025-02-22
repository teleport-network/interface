// Tokens
const NATIVE_TOKEN = '0x4200000000000000000000000000000000000006';
const USDC = '0x4603cff6498c46583300fc5f1c31f872f5514182';
const DAI = '0x38fA58a6a83d97389Be88752DAa408E2FEA40C8b';
const USDT = '0xec6b24429ab7012afc1b083d4e6763f738047792';
const SUSHI = '0xED59D07e00118b7ab76EE6fB29D738e266aAca02'
/**
 * @dev HEADS UP 🙋
 * First Token in the list will be the base token of the gauge proxy
 */
const allowedVariableToken = [NATIVE_TOKEN, SUSHI, USDC, USDT]
const allowedStableToken = [USDC, DAI, USDT]

// Contracts
const FACTORY = '0xFa5395FbFb1805c6a1183D0C72f97306663Ae0D1'
const ROUTER = '0x560974501B899208222758F31677bC6aBF92b86e'
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
const VARIABLE_GAUGE_PROXY = '0xF995Aa1549BB19AC295aD7479A15a55624865975';
const STABLE_GAUGE_PROXY = '0xEb6Ed145E2B924fA4456421419f36892c97d27FC';
const ADMIN_GAUGE_PROXY = '0xe6FC2983e8BFF3a643e8a1dEC3016DB4eea26622';

module.exports = Object.freeze({ 
     NATIVE_TOKEN, USDC, DAI, USDT, SUSHI, 
    allowedVariableToken, allowedStableToken,
    FACTORY, ROUTER, VOTER_ESCROW_TOKEN, REWARD_TOKEN,
    TREASURY_ADDRESS, FEE_DISTRIBUTOR,
    VARIABLE_BRIBE_FACTORY, STABLE_BRIBE_FACTORY,
    VARIABLE_GAUGE_PROXY, STABLE_GAUGE_PROXY, ADMIN_GAUGE_PROXY
})