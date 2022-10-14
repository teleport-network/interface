// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.6.6;
pragma experimental ABIEncoderV2;

/// @title Multicall
/// @notice Enables calling multiple methods in a single call to the contract
abstract contract Multicall {
    function multicall(uint256 deadline, bytes[] memory data) public payable checkDeadline(deadline) returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);

            if (!success) {
                // Next 5 lines from https://ethereum.stackexchange.com/a/83577
                if (result.length < 68) revert();
                assembly {
                    result := add(result, 0x04)
                }
                revert(abi.decode(result, (string)));
            }

            results[i] = result;
        }
    }

    modifier checkDeadline(uint256 deadline) {
        require(block.timestamp <= deadline, 'Transaction too old');
        _;
    }
}

