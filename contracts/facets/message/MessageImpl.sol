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

import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@paypr/ethereum-contracts/contracts/facets/erc721/ERC721Impl.sol';
import './IMessage.sol';

library MessageImpl {
  using EnumerableSet for EnumerableSet.AddressSet;
  using EnumerableSet for EnumerableSet.Bytes32Set;

  bytes32 private constant MESSAGE_STORAGE_POSITION = keccak256('paypr.message.storage');

  struct MessageStorage {
    mapping(uint256 => MessageCore) core;
    mapping(uint256 => IMessage.MessageContent) content;
    mapping(uint256 => EnumerableSet.Bytes32Set) replies;
  }

  struct MessageCore {
    uint256 createdAt;
  }

  //noinspection NoReturn
  function _messageStorage() private pure returns (MessageStorage storage ds) {
    bytes32 position = MESSAGE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
      ds.slot := position
    }
  }

  function _core(uint256 id) private view returns (MessageCore storage) {
    return _messageStorage().core[id];
  }

  function _content(uint256 id) private view returns (IMessage.MessageContent storage) {
    return _messageStorage().content[id];
  }

  function _replies(uint256 id) private view returns (EnumerableSet.Bytes32Set storage) {
    return _messageStorage().replies[id];
  }

  function _exists(uint256 id) private view returns (bool) {
    return _core(id).createdAt != 0;
  }

  function text(uint256 id) internal view returns (string memory) {
    return _content(id).text;
  }

  function uri(uint256 id) internal view returns (string memory, IMessage.URIType) {
    IMessage.MessageContent storage content = _content(id);
    return (content.uri, content.uriType);
  }

  function messageRef(uint256 id) internal view returns (uint256) {
    return _content(id).messageRef;
  }

  function createdAt(uint256 id) internal view returns (uint256) {
    return _core(id).createdAt;
  }

  function replyCount(uint256 id) internal view returns (uint256) {
    return _replies(id).length();
  }

  function replyByIndex(uint256 id, uint256 index) internal view returns (uint256) {
    return uint256(_replies(id).at(index));
  }

  function post(address sender, IMessage.MessageContent memory content) internal {
    uint256 id = hashContent(sender, content);

    if (content.messageRef != 0) {
      if (!_exists(content.messageRef)) {
        revert IMessage.MessageNotFound(content.messageRef);
      }

      if (isRepost(content)) {
        uint256 otherMessageRef = messageRef(content.messageRef);
        if (otherMessageRef != 0) {
          if (isRepost(_content(otherMessageRef))) {
            content.messageRef = otherMessageRef;
            id = hashContent(sender, content);
          }
        }
      }
    }

    if (bytes(content.uri).length != 0) {
      if (content.uriType == IMessage.URIType.None) {
        revert IMessage.InvalidURI(content.uri, content.uriType);
      }
    } else if (content.uriType != IMessage.URIType.None) {
      revert IMessage.InvalidURI(content.uri, content.uriType);
    }

    if (!isRepost(content) && _exists(id)) {
      content = IMessage.MessageContent({ text: '', uri: '', uriType: IMessage.URIType.None, messageRef: id });
      id = hashContent(sender, content);
    }

    _postMessage(sender, id, content);

    if (content.messageRef != 0) {
      _replies(content.messageRef).add(bytes32(id));
    }
  }

  function _postMessage(
    address sender,
    uint256 id,
    IMessage.MessageContent memory content
  ) private {
    MessageStorage storage ds = _messageStorage();
    ERC721Impl.mint(sender, id);

    // solhint-disable-next-line not-rely-on-time
    ds.core[id] = MessageCore({ createdAt: block.timestamp });
    ds.content[id] = content;
  }

  function isRepost(IMessage.MessageContent memory content) internal pure returns (bool) {
    return content.messageRef != 0 && bytes(content.text).length == 0 && bytes(content.uri).length == 0;
  }

  function hashContent(address sender, IMessage.MessageContent memory content) internal pure returns (uint256) {
    if (isRepost(content)) {
      return uint256(keccak256(abi.encode(sender, content)));
    }

    return uint256(keccak256(abi.encode(content)));
  }
}
