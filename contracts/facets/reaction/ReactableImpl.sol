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

import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

pragma solidity ^0.8.9;

library ReactableImpl {
  using EnumerableSet for EnumerableSet.AddressSet;
  using EnumerableSet for EnumerableSet.Bytes32Set;

  bytes32 private constant REACTABLE_STORAGE_POSITION = keccak256('paypr.reactable.storage');

  struct ReactableStorage {
    mapping(uint256 => TokenReactions) tokenReactions;
    mapping(address => EnumerableSet.Bytes32Set) accountReactions;
  }

  struct TokenReactions {
    mapping(uint256 => EnumerableSet.AddressSet) reactions;
    EnumerableSet.Bytes32Set reactionIds;
  }

  //noinspection NoReturn
  function _reactableStorage() private pure returns (ReactableStorage storage ds) {
    bytes32 position = REACTABLE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
      ds.slot := position
    }
  }

  function _tokenReactions(uint256 tokenId) private view returns (TokenReactions storage) {
    return _reactableStorage().tokenReactions[tokenId];
  }

  function tokenReactionIdCount(uint256 tokenId) internal view returns (uint256) {
    return _tokenReactions(tokenId).reactionIds.length();
  }

  function tokenReactionIdByIndex(uint256 tokenId, uint256 index) internal view returns (uint256) {
    return uint256(_tokenReactions(tokenId).reactionIds.at(index));
  }

  function tokenReactionCount(uint256 tokenId, uint256 reactionId) internal view returns (uint256) {
    return _tokenReactions(tokenId).reactions[reactionId].length();
  }

  function tokenReactionByIndex(
    uint256 tokenId,
    uint256 reactionId,
    uint256 index
  ) internal view returns (address) {
    return _tokenReactions(tokenId).reactions[reactionId].at(index);
  }

  function accountReactionCount(address account) internal view returns (uint256) {
    return _reactableStorage().accountReactions[account].length();
  }

  function accountReactionByIndex(address account, uint256 index) internal view returns (uint256) {
    return uint256(_reactableStorage().accountReactions[account].at(index));
  }

  function addReaction(
    address sender,
    uint256 tokenId,
    uint256 reactionId
  ) internal {
    ReactableStorage storage ds = _reactableStorage();
    TokenReactions storage tr = ds.tokenReactions[tokenId];

    if (!tr.reactions[reactionId].add(sender)) {
      return;
    }

    tr.reactionIds.add(bytes32(reactionId));
    ds.accountReactions[sender].add(bytes32(tokenId));

    emit Reaction(sender, tokenId, reactionId);
  }

  function removeReaction(
    address sender,
    uint256 tokenId,
    uint256 reactionId
  ) internal {
    ReactableStorage storage ds = _reactableStorage();
    if (!ds.tokenReactions[tokenId].reactions[reactionId].remove(sender)) {
      return;
    }

    emit ReactionRemoved(sender, tokenId, reactionId);
  }

  // have to redeclare here even though they are already declared in interface
  event Reaction(address indexed sender, uint256 indexed tokenId, uint256 indexed reaction);
  event ReactionRemoved(address indexed sender, uint256 indexed tokenId, uint256 indexed reaction);
}
