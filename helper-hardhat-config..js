const { ethers } = require("hardhat")

 const networkConfig = {
    default: {
        name: "hardhat",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        subscriptionId: "588",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
        keepersUpdateInterval: "30",
        raffleEntranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
        mintFee:"10000000000000000" ,
        ethToUsdPrice:"0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"

    },
    5: {
        name: "goerli",
        subscriptionId: "7455",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
        keepersUpdateInterval: "30",
        raffleEntranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
        callbackGasLimit: "500000", // 500,000 gas
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        mintFee:"10000000000000000" ,
        ethToUsdPrice:"0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    },
    1: {
        name: "mainnet",
        keepersUpdateInterval: "30",
    },

 }

 const developmentChains = ["hardhat", "localhost"]
 const FRONTEND_ABI= "../web/web3/constants/contractAbi.json"
 const FRONTEND_ADDRESSES_FILE = "../web/web3/constants/constractAddress.json"
 
 module.exports = {
    networkConfig,
    developmentChains,
    FRONTEND_ABI,
    FRONTEND_ADDRESSES_FILE
 }