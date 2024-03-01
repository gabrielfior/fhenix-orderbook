// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import { FHE, euint32, inEuint32 } from "@fhenixprotocol/contracts/FHE.sol";

/**
 * @title Interface for OrderBook
 */
interface IOrderbook {
    struct Order {
        address maker;
        euint32 amount;
    }

    struct Step {
        euint32 higherPrice;
        euint32 lowerPrice;
        euint32 amount;
    }

    function placeBuyOrder (
        euint32 price,
        euint32 amountOfBaseToken
    ) external;

    function placeSellOrder (
        euint32 price,
        euint32 amountOfTradeToken
    ) external;

    event PlaceBuyOrder(address sender, uint256 price, uint256 amountOfBaseToken);
    event PlaceSellOrder(address sender, uint256 price, uint256 amountOfTradeToken);
    event DrawToBuyBook(address sender, uint256 price, uint256 amountOfBaseToken);
    event DrawToSellBook(address sender, uint256 price, uint256 amountOfTradeToken);

}