//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; 

library PriceConverter
{
 /* preis von ETH in DOLLAR*/
    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256)     //  parameter => nicht  mit spez. objekt für contract zu arbeiten => durch parametrisieren des pricefeed-funktion kann ich mit jeder chain testen für meinen mocks ...   //ETH-Preis... interact with outside contract-> need API and ADDRESS
    {
       // beim refactoren der beiden scripte kann ich line 13 rausnehmen , DA ICH NICHT MEHR MIT EINER CHAIN ARBEITE SONDERN durch die PARAMETER möglich ist zw. blockcains zu switchen
       // AggregatorV3Interface priceFeed = AggregatorV3Interface(0x3de1bE9407645533CD0CbeCf88dFE5297E7125e6);
       
        (, int256 answer,,,) = priceFeed.latestRoundData();
        return uint256 (answer* 1e10);                       //typecasting zwischen uint und int für gleichen type
    }

    function Umwandlungsrate(uint256 ethMenge, AggregatorV3Interface priceFeed) internal view returns (uint256) // meine umwandlungsrate soll autom. die jeweilige network mit zugehör. contract. für eth/usd- data feed nehmen... DAHER HIER durch das refactoren den DATAFEED PARAMETRISIERT.
    {
        uint256 ethPrice = getPrice(priceFeed); // GEBEN den PRICEFEED furch refactoren als parameter in die getPrice-funktion
        uint256 ethMengeinUSD = (ethPrice * ethMenge) / 1e18;
        return ethMengeinUSD;
    } 
}