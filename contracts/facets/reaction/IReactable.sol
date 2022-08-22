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

interface IReactable {
  /**
   * @notice Emitted when a reaction to the message is made, such as a like.
   */
  event Reaction(address indexed sender, uint256 indexed tokenId, uint256 indexed reaction);

  /**
   * @notice Emitted when a reaction is removed from the message, such as a like.
   */
  event ReactionRemoved(address indexed sender, uint256 indexed tokenId, uint256 indexed reaction);
}
