//SPDX-License-Identifier: MIT


//mint nft
// save the SVG file somewhere else
// some logic to conditionally display the images
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";


pragma solidity ^0.8.7;


error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    string  private s_lowSvgImageURI;
    string  private s_highSvgImageURI;
    uint256 private s_counter;
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    constructor(address aggregatorAddress, string memory lowSvg, string memory highSvg) ERC721("Dangolden", "DNG") {
        s_counter = 0;
        s_lowSvgImageURI = svgImageToUri(lowSvg);
        s_highSvgImageURI = svgImageToUri(highSvg);
        i_priceFeed = AggregatorV3Interface(aggregatorAddress);
    }


   

    function _baseURI() internal pure override returns (string memory){
        return "data:application/json;base64," ;
    }


    function svgImageToUri (string memory svg) public pure returns(string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded =  Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(baseURL,svgBase64Encoded ));
    }

 function mintNft (int256 highValue) public {
    s_counter = s_counter + 1;
    s_tokenIdToHighValue[s_counter] = highValue;
    _safeMint(msg.sender, s_counter);
    emit CreatedNFT(s_counter, highValue);
 }

    function tokenURI(uint256 tokenId) public view override  returns(string memory){
        // require(_exists(tokenId), "cannot querry token id");
         if (!_exists(tokenId)) {
            revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        }
        string memory imageURI = s_lowSvgImageURI;
        (, int256 price, , ,) = i_priceFeed.latestRoundData();
        if( price > s_tokenIdToHighValue[tokenId]){
            imageURI = s_highSvgImageURI ;
        }
         return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }



     function getLowSVG() public view returns (string memory) {
        return s_lowSvgImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highSvgImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_counter;
    }
}


