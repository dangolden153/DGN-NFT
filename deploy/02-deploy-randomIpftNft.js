const env = require("hardhat");
const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config.");
const { storeImages ,storeTokenMetadata} = require("../utils/uploadToPinata");
const {verify} = require("../utils/verify");


const metadataTemple = {
  name: "",
  description: "",
  image: "",
  attributes: {
    value: 100,
    traits_type: "cuteness",
  },
};
const imageLocation = "./images/randomNft/";

const FUND_AMOUNT = "1000000000000000000000"

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2MockAddress, subscriptionId;
  let tokenUris = [
    'ipfs://QmSdrSFXTuWhktvsJnHu65wpf4UovHjU45ZBoS3ibB7gDi',
    'ipfs://QmTY8sv1zviRtYp3imh4RQ9DGBhbJtjQcoiHF7p8HF2sXP',
    'ipfs://QmWXpiYiwzrMosWyMsNv3HXDWTxe6veBj7Y5Y3n5Gxy7UE'
  ];

  if (process.env.UPLOAD_TO_PANITA === "true") {
    tokenUris = await handleTokenUris();
    // console.log('tokenUris', tokenUris)
  }

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2MockAddress = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
  } else {
    vrfCoordinatorV2MockAddress = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

    const args = [
      vrfCoordinatorV2MockAddress,
      networkConfig[chainId].gasLane,
      subscriptionId,
      networkConfig[chainId].callbackGasLimit,
      tokenUris,
      networkConfig[chainId].mintFee
    ];
  log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    const randomIpfsNft = await deploy("RandomIpfsNft", {
      from: deployer,
      log: true,
      args: args,
      waitConfirmations : network.config.blockConfirmations || 1
    });

  if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
    log("verifying....")
    verify(randomIpfsNft.address, args)
}
log("________________________________")



};

async function handleTokenUris (){
 let tokenUris = [];

  const {responses: imageUploadResponses, files} = await storeImages(imageLocation)
  for (let imageUploadResponseIndex in imageUploadResponses){

    let tokenUriMetadata 

    tokenUriMetadata = {...metadataTemple}
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An Adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`uploading ${tokenUriMetadata.name}`)

    const storeTokenMetadataResponse = await storeTokenMetadata(tokenUriMetadata)
    tokenUris.push(`ipfs://${storeTokenMetadataResponse.IpfsHash}`)
  }

  // console.log(`token uris: ${tokenUris}`)
  return tokenUris;
};


module.exports.tags = ['all', 'randomIpfs', 'main']