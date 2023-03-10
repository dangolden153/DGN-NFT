const { network, ethers } = require("hardhat");
// const { developmentChains } = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25") // 0.2
const INITIAL_PRICE = ethers.utils.parseEther("2000") 
const GAS_PRICE_LINK = 1e9 
const DECIMALS = "18" 


module.exports = async function ({getNamedAccounts, deployments}){
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts();
    const args = [BASE_FEE,GAS_PRICE_LINK]
    const chainId = network.config.chainId
     
    
    if(chainId == 31337){
        log("local network detected! deploying mock.")
        await deploy("VRFCoordinatorV2Mock", {
            from:deployer,
            log:true,
            args:args,
        })

        await deploy("MockV3Aggregator", {
            from:deployer,
            log:true,
            args:[DECIMALS, INITIAL_PRICE],
        })
    }
    
    log("Mock deployed")
    log("___________________________________________")
    
}

module.exports.tags = ["all", "mocks"]