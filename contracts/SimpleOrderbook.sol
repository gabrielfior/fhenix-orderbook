// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.20;

import { euint32,inEuint16,inEuint32,euint8, ebool, FHE } from "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IOrderbook } from "./interfaces/IOrderbook.sol";
import {FHERC20} from "./FHERC20.sol";
import "hardhat/console.sol";

contract SimpleOrderbook is IOrderbook, ReentrancyGuard, Permissioned {

    event RunMatchingEngine();

    struct SimpleOrder {
        address maker;
        euint32 amount;
    }

    FHERC20 public tradeToken;
    FHERC20 public baseToken;
    euint32 public counter;
    mapping(uint32 => SimpleOrder[]) buyOrders;
    uint32 public numberOfBuyOrders;

    constructor(address _tradeToken, address _baseToken) public {
        tradeToken = FHERC20(_tradeToken);
        baseToken = FHERC20(_baseToken);
        console.log("tradeToken %s baseToken %s", _tradeToken, _baseToken);
    }

    function fetchAddressFromPermit(Permission memory permission) internal returns (address){
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Permissioned(bytes32 publicKey)"),
            permission.publicKey
        )));
        address signer = ECDSA.recover(digest, permission.signature);
        return signer;
    }

    function getBuyOrdersFromUserForPrice(uint32 price,  Permission memory permission) public view onlySender(permission)
     returns (bytes[] memory){
        euint32[] storage toReturn;
        address signer = fetchAddressFromPermit(permission);
        SimpleOrder[] memory orders = buyOrders[price];
        for (uint256 index = 0; index < orders.length; index++) {
            SimpleOrder memory order = orders[index];
            
            if (order.maker == signer){
                toReturn.push(order.amount);
            }
        }
        // toReturn.push(FHE.sealoutput(order.amount, permission.publicKey));
        bytes memory bytesReturn = FHE.sealoutput(toReturn, permission.publicKey);
        return toReturn;

    }
    

     function placeBuyOrder (
        inEuint32 calldata price,
        inEuint32 calldata amountOfBaseToken
    ) external nonReentrant {
        
        uint32 priceExposed = FHE.decrypt(FHE.asEuint32(price));
        uint32 amountExposed = FHE.decrypt(FHE.asEuint32(amountOfBaseToken));
        // ToDo - Encrypt sender?
        SimpleOrder[] storage orders = buyOrders[priceExposed];
        orders.push(SimpleOrder(msg.sender, FHE.asEuint32(amountOfBaseToken)));
        numberOfBuyOrders += 1;

        _runMatchingEngine();
    }

    function _runMatchingEngine() internal {
        // ToDo - Implement only full matches
        emit RunMatchingEngine();
    }
}