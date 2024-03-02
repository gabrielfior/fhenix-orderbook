// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.20;

import { euint32,inEuint16,euint8, ebool, FHE } from "@fhenixprotocol/contracts/FHE.sol";

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IOrderbook } from "./interfaces/IOrderbook.sol";
import {FHERC20} from "./FHERC20.sol";

contract Orderbook is IOrderbook, ReentrancyGuard {
    
    FHERC20 public tradeToken;
    FHERC20 public baseToken;

    // Buy
    mapping(uint32 => mapping(uint32 => Order)) public buyOrdersInStep;
    mapping(uint32 => Step) public buySteps;
    mapping(uint32 => euint32) public buyOrdersInStepCounter;
    uint32 public maxBuyPrice;

    // Sell
    mapping(uint32 => mapping(uint32 => Order)) public sellOrdersInStep;
    mapping(uint32 => Step) public sellSteps;
    mapping(uint32 => euint32) public sellOrdersInStepCounter;
    uint32 public minSellPrice;

    /**
     * @notice Constructor
     */
    constructor(address _tradeToken, address _baseToken) public {
        tradeToken = FHERC20(_tradeToken);
        baseToken = FHERC20(_baseToken);
    }

    // ToDo - Revise if `if` statements are leaking unwanted information. It's OK to leak that we had a match and the order
    // was filled, however details of orders that were filled should remain private.
    function placeBuyOrder (
        euint32 price,
        euint32 amountOfBaseToken
    ) external nonReentrant {
        baseToken.transferFromEncrypted(msg.sender, address(this), amountOfBaseToken);
        // ToDo - Emit events?
        //emit PlaceBuyOrder(msg.sender, price, amountOfBaseToken);

        /**
         * @notice if has order in sell book, and price >= min sell price
         */
        uint32 sellPricePointer = minSellPrice;
        uint32 amountReflect = amountOfBaseToken.decrypt();
        uint32 priceExposed = price.decrypt();

        if (minSellPrice > 0 && priceExposed >= minSellPrice) {
            while (amountReflect > 0 && sellPricePointer <= priceExposed && sellPricePointer != 0) {
                euint32 i = FHE.asEuint32(1);
                euint32 higherPrice = sellSteps[sellPricePointer].higherPrice;
                bool iSmallerThanSellPrice = FHE.lte(i, sellOrdersInStepCounter[sellPricePointer]).decrypt();
                while (iSmallerThanSellPrice && (amountReflect > 0)) {
                    uint32 decryptedSellOrderAmount = FHE.decrypt(sellOrdersInStep[sellPricePointer][i.decrypt()].amount); 
                    if (amountReflect >= decryptedSellOrderAmount) {
                        //if the last order has been matched, delete the step
                        // ToDo - Use FHE.select
                        if (i.decrypt() == sellOrdersInStepCounter[sellPricePointer].decrypt()) {
                            // ToDo - Use FHE.select
                            if (higherPrice.decrypt() > 0)
                            sellSteps[higherPrice.decrypt()].lowerPrice = FHE.asEuint32(0);
                            delete sellSteps[sellPricePointer];
                            minSellPrice = higherPrice.decrypt();
                        }

                        amountReflect = amountReflect - sellOrdersInStep[sellPricePointer][i.decrypt()].amount.decrypt();

                        // delete order from storage
                        delete sellOrdersInStep[sellPricePointer][i.decrypt()];
                        sellOrdersInStepCounter[sellPricePointer] = FHE.sub(sellOrdersInStepCounter[sellPricePointer],FHE.asEuint32(1));
                    } else {
                        euint32 amountReflectEuint = FHE.asEuint32(amountReflect);
                        sellSteps[sellPricePointer].amount = FHE.sub(sellSteps[sellPricePointer].amount, amountReflectEuint);
                        sellOrdersInStep[sellPricePointer][i.decrypt()].amount = FHE.sub(sellOrdersInStep[sellPricePointer][i.decrypt()].amount, amountReflectEuint);
                        amountReflect = 0;
                    }
                    i = i + FHE.asEuint32(1);
                }
                sellPricePointer = higherPrice.decrypt();
            }
         }
        if ((amountReflect > 0)) {
            _drawToBuyBook(price, FHE.asEuint32(amountReflect));
        }
    }

    // See doc on placeBuyOrder. Analogous considerations apply.
    function placeSellOrder (
        euint32 price,
        euint32 amountOfTradeToken
    ) external override nonReentrant {
        tradeToken.transferFromEncrypted(msg.sender, address(this), amountOfTradeToken);
        // ToDo - throw event
        //emit PlaceSellOrder(msg.sender, price, amountOfTradeToken);

        
        uint32 buyPricePointer = maxBuyPrice;
        uint32 amountReflect = amountOfTradeToken.decrypt();
        uint32 priceExposed = price.decrypt();
        if ((maxBuyPrice > 0) && (priceExposed < maxBuyPrice)) {
            while ((amountReflect > 0) && (buyPricePointer >= priceExposed) && (buyPricePointer != 0)) {
                euint32 i = FHE.asEuint32(1);
                euint32 lowerPrice = buySteps[buyPricePointer].lowerPrice;
                bool iSmallerThanBuyPrice = FHE.lte(i, buyOrdersInStepCounter[buyPricePointer]).decrypt();
                while (iSmallerThanBuyPrice && (amountReflect > 0)) {
                    uint32 decryptedBuyOrderAmount = FHE.decrypt(buyOrdersInStep[buyPricePointer][i.decrypt()].amount);
                    if ((amountReflect >= decryptedBuyOrderAmount)) {
                        //if the last order has been matched, delete the step
                        if ((i.decrypt() == buyOrdersInStepCounter[buyPricePointer].decrypt())) {
                            if ((lowerPrice.decrypt() > 0))
                            buySteps[lowerPrice.decrypt()].higherPrice = FHE.asEuint32(0);
                            delete buySteps[buyPricePointer];
                            maxBuyPrice = lowerPrice.decrypt();
                        }

                        amountReflect = (amountReflect - buyOrdersInStep[buyPricePointer][i.decrypt()].amount.decrypt());

                        // // delete order from storage
                        delete buyOrdersInStep[buyPricePointer][i.decrypt()];
                        buyOrdersInStepCounter[buyPricePointer] = (buyOrdersInStepCounter[buyPricePointer] - FHE.asEuint32(1));
                    } else {
                        euint32 amountReflectEuint = FHE.asEuint32(amountReflect);
                        buySteps[buyPricePointer].amount = (buySteps[buyPricePointer].amount - amountReflectEuint);
                        buyOrdersInStep[buyPricePointer][i.decrypt()].amount = (buyOrdersInStep[buyPricePointer][i.decrypt()].amount - amountReflectEuint);
                        amountReflect = 0;
                    }
                    i = i + FHE.asEuint32(1);
                }
                buyPricePointer = lowerPrice.decrypt();
            }
         }
        if ((amountReflect > 0)) {
            _drawToSellBook(price, FHE.asEuint32(amountReflect));
        }
     }

    function _drawToBuyBook (
        euint32 price,
        euint32 amount
    ) internal {
        FHE.req(FHE.lt(price, FHE.asEuint32(0)));
        //require(price > 0, "Can not place order with price equal 0");
        uint32 priceExposed = price.decrypt();
        buyOrdersInStepCounter[priceExposed] = FHE.add(buyOrdersInStepCounter[priceExposed], FHE.asEuint32(1));
        buyOrdersInStep[priceExposed][buyOrdersInStepCounter[priceExposed].decrypt()] = Order(msg.sender, amount);
        buySteps[priceExposed].amount = FHE.add(buySteps[priceExposed].amount, amount);
        // // ToDo - Event
        // //emit DrawToBuyBook(msg.sender, price, amount);

        if ((maxBuyPrice == 0)) {
            maxBuyPrice = priceExposed;
            return;
        }

        if ((priceExposed > maxBuyPrice)) {
            buySteps[maxBuyPrice].higherPrice = price;
            buySteps[priceExposed].lowerPrice = FHE.asEuint32(maxBuyPrice);
            maxBuyPrice = priceExposed;
            return;
        }

        if ((priceExposed == maxBuyPrice)) {
            return;
        }

        uint32 buyPricePointer = maxBuyPrice;
        while ((priceExposed <= buyPricePointer)) {
            buyPricePointer = buySteps[buyPricePointer].lowerPrice.decrypt();
        }

        if ((priceExposed < buySteps[buyPricePointer].higherPrice.decrypt())) {
            buySteps[priceExposed].higherPrice = buySteps[buyPricePointer].higherPrice;
            buySteps[priceExposed].lowerPrice = FHE.asEuint32(buyPricePointer);

            buySteps[buySteps[buyPricePointer].higherPrice.decrypt()].lowerPrice = price;
            buySteps[buyPricePointer].higherPrice = price;
        }
     }

    function _drawToSellBook (
        euint32 price,
        euint32 amount
    ) internal {
        
        FHE.req(FHE.lt(price,FHE.asEuint32(0)));
        uint32 priceExposed = price.decrypt();
        sellOrdersInStepCounter[priceExposed] = FHE.add( sellOrdersInStepCounter[priceExposed] , FHE.asEuint32(1));
        sellOrdersInStep[priceExposed][sellOrdersInStepCounter[priceExposed].decrypt()] = Order(msg.sender, amount);
        sellSteps[priceExposed].amount = FHE.add(sellSteps[priceExposed].amount, amount);
        // // Emit event

        if ((minSellPrice == 0)) {
            minSellPrice = priceExposed;
            return;
        }

        if ((priceExposed < minSellPrice)) {
            sellSteps[minSellPrice].lowerPrice = price;
            sellSteps[priceExposed].higherPrice = FHE.asEuint32(minSellPrice);
            minSellPrice = priceExposed;
            return;
        }

        if ((priceExposed == minSellPrice)) {
            return;
        }

        uint32 sellPricePointer = minSellPrice;
        while ((priceExposed >= sellPricePointer) && (sellSteps[sellPricePointer].higherPrice.decrypt() !=0)) {
            sellPricePointer = sellSteps[sellPricePointer].higherPrice.decrypt();
        }

        if ((sellPricePointer < priceExposed)) {
            sellSteps[priceExposed].lowerPrice = FHE.asEuint32(sellPricePointer);
            sellSteps[sellPricePointer].higherPrice = price;
        }

        if ((sellPricePointer > priceExposed) && (priceExposed > sellSteps[sellPricePointer].lowerPrice.decrypt())) {
            sellSteps[priceExposed].lowerPrice = sellSteps[sellPricePointer].lowerPrice;
            sellSteps[priceExposed].higherPrice = FHE.asEuint32(sellPricePointer);

            sellSteps[sellSteps[sellPricePointer].lowerPrice.decrypt()].higherPrice = price;
            sellSteps[sellPricePointer].lowerPrice = price;
        }
    }
    
}
