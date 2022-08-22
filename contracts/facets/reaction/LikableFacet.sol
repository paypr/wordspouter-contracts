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

import '@paypr/ethereum-contracts/contracts/facets/context/ContextSupport.sol';
import './ILikable.sol';
import './ReactableImpl.sol';

contract LikableFacet is ILikable {
  uint256 private constant LIKE_EMOJI = 0x1f44d;

  function likeCount(uint256 tokenId) external view returns (uint256) {
    return ReactableImpl.tokenReactionCount(tokenId, LIKE_EMOJI);
  }

  function likeByIndex(uint256 tokenId, uint256 index) external view returns (address) {
    return ReactableImpl.tokenReactionByIndex(tokenId, LIKE_EMOJI, index);
  }

  function like(uint256 tokenId) external payable {
    address sender = ContextSupport.msgSender();
    ReactableImpl.addReaction(sender, tokenId, LIKE_EMOJI);
  }

  function unlike(uint256 tokenId) external payable {
    address sender = ContextSupport.msgSender();
    ReactableImpl.removeReaction(sender, tokenId, LIKE_EMOJI);
  }
}
