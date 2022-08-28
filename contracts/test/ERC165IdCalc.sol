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

import '../facets/reaction/ILikable.sol';
import '../facets/message/IMessage.sol';
import '../facets/message/cost/IMessageCost.sol';
import '../facets/reaction/IReactable.sol';

contract ERC165IdCalc {
  function calcLikableInterfaceId() external pure returns (bytes4) {
    return type(ILikable).interfaceId;
  }

  function calcMessageInterfaceId() external pure returns (bytes4) {
    return type(IMessage).interfaceId;
  }

  function calcMessageCostInterfaceId() external pure returns (bytes4) {
    return type(IMessageCost).interfaceId;
  }

  function calcReactableInterfaceId() external pure returns (bytes4) {
    return type(IReactable).interfaceId;
  }
}
