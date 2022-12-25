const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
require('dotenv').config()

const pinataSecret = process.env.PINATA_SECRET_KEY;
const pinataApi = process.env.PINATA_API_KEY;
const pinata = new pinataSDK(pinataApi, pinataSecret);

 async function storeImages (imageLocation){
  const fullImagePath = path.resolve(imageLocation);
  const files = fs.readdirSync(fullImagePath).filter((file) => file.includes(".png"));

console.log('files', files)
  let responses = [];
  console.log("uploading to pinata...");
 for (const fileIndex in files) {
    console.log(`working on file:${fileIndex}`);
    const readableStreamForFile = fs.createReadStream(
      `${fullImagePath}/${files[fileIndex]}`);
    const options = {
        pinataMetadata: {
            name: files[fileIndex],
        },
    }
    try {
        await pinata
        .pinFileToIPFS(readableStreamForFile, options)
        .then((result) => {
            // console.log('pinFileToIPFS result', result)
            responses.push(result)
        })
        .catch((err) => {
            console.log('pinFileToIPFS',err)
        })
    } catch (error) {
        console.log('error pinata' , error) 
    }
  }

  return { responses, files };
};

async function storeTokenMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log('storeTokenMetadata error', error)
    
  }
}

module.exports = {
  storeImages,
  storeTokenMetadata,
};
