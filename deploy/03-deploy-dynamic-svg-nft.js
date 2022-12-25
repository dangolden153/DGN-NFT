const {network, ethers} = require("hardhat");
const fs = require("fs");
const {developmentChains, networkConfig} = require("../helper-hardhat-config.");
const { verify } = require("../utils/verify");

module.exports = async function ({deployments, getNamedAccounts}) {
    const {deploy, log} = deployments;
    const {deployer } =await  getNamedAccounts();
    const chainId = network.config.chainId
    let priceFeedAddress
    

    if (developmentChains.includes(network.name)){
        const aggregatorV3Mock = await ethers.getContract("MockV3Aggregator")
        priceFeedAddress = aggregatorV3Mock.address
    } else {
        priceFeedAddress = networkConfig[chainId].ethToUsdPrice
    }

    const lowSvgImagePath =  fs.readFileSync("./images/dynamicImageSvgs/frown.svg", {encoding:"utf8"})
    const highSvgImagePath =  fs.readFileSync("./images/dynamicImageSvgs/happy.svg", {encoding:"utf8"})
    const args = [priceFeedAddress, lowSvgImagePath, highSvgImagePath]
    log("-------------------------------------------")
    const DynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log:true,
        args: args,
        waitConfirmations:  network.config.blockConfirmations || 1
    })
    log("-------------------------------------------")


    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        console.log("verifying...")
        verify(DynamicSvgNft.address, args)
    }

}

module.exports.tags = ["all", "dynamicSvgNft", "main"]

