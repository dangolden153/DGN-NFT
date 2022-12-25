// minting nft
// when a nft is minted, the chainlink VRF should be triggered to return a verified random number,
// using this number to get/determine an nft.
// nft like: Pug, Shiba Inu, St. Bernard
// Pug rare
// Shiba Inu --sort of rare
// St. Bernard --common

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandonIpftNft_outOfBounds();
error RandonIpftNft_notEnoughEth();
error RandomIpfsNft_TransferFailed();

contract RandomIpfsNft is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    // type declaration
    enum Bread {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    //event
    event NFTMinted(Bread indexed dogBread, address minter);
    event NftRequested(uint256 indexed requestId, address requester);
    // Vrf variable
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subcriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant requestConfirmations = 3;
    uint16 private constant numWords = 1;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    //VRF helper
    mapping(uint256 => address) private s_requestAddress;

    //Nft variable
    uint256 private s_counter;
    uint256 private immutable i_mintFee;
    string[] internal s_NftTokenUris;
    uint256 internal constant MAX_CHANCE_VAL = 100;

    constructor(
        address vrfCoordinator,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        string[3] memory NftTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinator) ERC721("Dangolden", "DGN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_gasLane = gasLane;
        i_subcriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_NftTokenUris = NftTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft()
        public payable
        returns (
            // onlyOwner
            uint256 requestId
        ) 
    {
        // Will revert if the mint fee is not enough
        if (msg.value < i_mintFee) {
            revert RandonIpftNft_notEnoughEth();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subcriptionId,
            requestConfirmations,
            i_callbackGasLimit,
            numWords
        );

        s_requestAddress[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
        //
        // emit RequestSent(requestId, numWords);
        // return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        address dogOwner = s_requestAddress[_requestId];
        uint256 newTokenId = s_counter;
        uint256 modedRng = _randomWords[0] % MAX_CHANCE_VAL;

        Bread dogBread = getBreadFromModedng(modedRng);
        s_counter +=s_counter;
        _mint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, s_NftTokenUris[uint256(dogBread)]);

        emit NFTMinted(dogBread, dogOwner);
    }

    function getArrayChance() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VAL];
    }


    function getBreadFromModedng(uint256 modedRng) public pure returns (Bread) {
        uint256 cumulative = 0;
        uint256[3] memory chanceArray = getArrayChance();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                modedRng >= cumulative && modedRng < cumulative + chanceArray[i]
            ) {
                return Bread(i);
            }

            cumulative += chanceArray[i];
        }

        revert RandonIpftNft_outOfBounds();
    }


    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft_TransferFailed();
        }
    }

    function getMintFee() public view returns (uint256){
        return i_mintFee;
    }

    function getTokenURI(uint256 index) public view returns (string memory){
        return s_NftTokenUris[index];
    }
}
