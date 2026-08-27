---
name: DeFi Protocols
description: AMM math (x*y=k) and Lending pool architectures.
---

# DeFi Protocols

## AMM Math (Constant Product)
The fundamental formula for DEXes like Uniswap V2 is $x \times y = k$.

```solidity
contract SimpleAMM {
    uint public reserve0;
    uint public reserve1;

    function swap(uint amountIn, bool isToken0) external returns (uint amountOut) {
        require(amountIn > 0, "Invalid amount");
        (uint reserveIn, uint reserveOut) = isToken0 ? (reserve0, reserve1) : (reserve1, reserve0);
        
        // amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
        uint amountInWithFee = amountIn * 997;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);
        
        // Update reserves...
    }
}
```

## Lending Pool Architecture
Overcollateralized lending requires robust liquidation mechanisms when Health Factor < 1.

## Protocol Interactions
```[mermaid](../../Product_and_Business/mermaid/SKILL.md)
%%{init: {"theme": "default", "flowchart": {"useMaxWidth": false}}}%%
flowchart TD
    User[User] -->|Deposit Asset| LendingPool[Lending Pool]
    LendingPool -->|Mint aToken| User
    User -->|Borrow| [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)[Collateral Vault]
    [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) -->|Check Price| Oracle[Price Oracle]
    Oracle -->|Price Update| Liquidator[Liquidator Bot]
    Liquidator -->|Liquidate Undercollateralized| [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)
```
