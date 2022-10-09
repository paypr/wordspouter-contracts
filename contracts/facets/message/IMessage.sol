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

interface IMessage {
  struct MessageContent {
    string text;
    string uri;
    URIType uriType;
    uint256 messageRef;
  }

  enum URIType {
    None,
    Link,
    Image
  }

  /**
   * @notice Returns the text content of the given message
   */
  function text(uint256 id) external view returns (string memory);

  /**
   * @notice Returns the URI of the given message, if any
   */
  function uri(uint256 id) external view returns (string memory, URIType);

  /**
   * @notice Returns a reference to another message for the given message, if any
   */
  function messageRef(uint256 id) external view returns (uint256);

  /**
   * @notice Returns when the given message was created
   */
  function createdAt(uint256 id) external view returns (uint256);

  /**
   * @notice Posts a message on chain
   *
   * Emits ERC721 Transfer event.
   */
  function post(MessageContent calldata content) external payable;

  /**
   * @notice Thrown when the message is not found
   */
  error MessageNotFound(uint256 id);

  /**
   * @notice Thrown when the uri type does not match the uri
   */
  error InvalidURI(string uri, URIType uriType);

  /**
   * @notice Emitted when a message is posted.
   */
  event MessagePost(
    address indexed sender,
    string text,
    string uri,
    URIType indexed uriType,
    uint256 indexed messageRef
  );
}
