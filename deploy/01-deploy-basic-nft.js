const {network} = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config.');
const { verify } = require('../utils/verify');


module.exports = async function ({getNamedAccounts, deployments}){
    const {deploy, log} = deployments;
    const {deployer } = await getNamedAccounts();


    log("________________________________")
    const args = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        blockConfirmations: network.config.blockConfirmations || 1
    })
    log("________________________________")


    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("verifying....")
        verify(basicNft.address, args)
    }


    log("________________________________")

}

module.exports.tags = ['all', 'basicNft', 'main']