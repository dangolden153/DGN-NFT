const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config.");


module.exports = async function ({ getNamedAccounts }) {

  const { deployer } = await getNamedAccounts();


  ////BasicNft
  console.log("minting started!!!!!!!!!!!!!!!!!")
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const mintNftTX = await basicNft.mintNft();
  await mintNftTX.wait(1)
  console.log(`Basic minted NFT at index 0 ${await basicNft.tokenURI(0)}`)



  ////RandomIpfsNft
  const randomNFT = await ethers.getContract("RandomIpfsNft", deployer);
  const getMintFee = await randomNFT.getMintFee();

  const randomNFTMintTx = await randomNFT.requestNft({ value: getMintFee.toString() });

  const randomNFTMintTxResponse = await randomNFTMintTx.wait(1);

  new Promise(async (resolve, reject) => {
    setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 300000) 
    randomNFT.once("NFTMinted", async() => {
        resolve()
    });

      if (developmentChains.includes(network.name)){
      const requestId = randomNFTMintTxResponse.event[1].args.requestId.toString();
      const vrfCoordinatorMock = await ethers.getContract("MockV3Aggregator", deployer);
      await vrfCoordinatorMock.fulfillRandomWords(
        requestId,
        randomNFT.address
      );
      }
  });

console.log(`random IPFS NFT index 0 is: ${await randomNFT.getTokenURI(0)}`)




 ////RandomIpfsNft
 const highValue = ethers.utils.parseEther("4000")
  const dynamicSvgNft =  await ethers.getContract("DynamicSvgNft", deployer)
  const mintNFTTx = await dynamicSvgNft.mintNft(highValue)

  await mintNFTTx.wait(1)

  console.log(`dynamic NFT at index 0 is: ${await dynamicSvgNft.tokenURI(1)}`)
  console.log("done!!!!!!!!!!!")
};



module.exports.tags = ["all", "mintNFT", "mint"]