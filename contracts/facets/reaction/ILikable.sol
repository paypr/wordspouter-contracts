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

interface ILikable {
  /**
   * @notice Returns the number of likes for the given token
   */
  function likeCount(uint256 tokenId) external view returns (uint256);

  /**
   * @notice Returns the sender address for the like at the given index
   */
  function likeByIndex(uint256 tokenId, uint256 index) external view returns (address);

  /**
   * @notice Returns whether or not the given sender has liked the given token
   */
  function hasLiked(uint256 tokenId, address sender) external view returns (bool);

  /**
   * @notice Likes a message
   *
   * Emits {Reaction} event
   */
  function like(uint256 tokenId) external payable;

  /**
   * @notice Unlike a liked message
   *
   * Emits {ReactionRemoved} event
   */
  function unlike(uint256 tokenId) external payable;
}
