/*
 * Copyright (c) 2022 The Paypr Company, LLC
 *
 * This file is part of Paypr Contracts.
 *
 * Paypr Contracts is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Paypr Contracts is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Paypr Contracts.  If not, see <https://www.gnu.org/licenses/>.
 */

// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

library MessageCostImpl {
  bytes32 private constant MESSAGE_COST_STORAGE_POSITION = keccak256('paypr.messageCost.storage');

  struct MessageCostStorage {
    uint256 basicCost;
  }

  //noinspection NoReturn
  function _messageCostStorage() private pure returns (MessageCostStorage storage ds) {
    bytes32 position = MESSAGE_COST_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
      ds.slot := position
    }
  }

  function basicCost() internal view returns (uint256) {
    return _messageCostStorage().basicCost;
  }

  function setBasicCost(uint256 cost) internal {
    _messageCostStorage().basicCost = cost;
  }
}
