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

import '@paypr/ethereum-contracts/contracts/facets/erc721/ERC721HooksBase.sol';
import './IMessageContentLimits.sol';
import '../IMessage.sol';

contract MessageContentLimitsERC721Hooks is ERC721HooksBase {
  function beforeMint(
    address, /*account*/
    uint256 tokenId
  ) external payable virtual override {
    uint256 maxLength = IMessageContentLimits(address(this)).maxContentLength();
    if (maxLength == 0) {
      return;
    }

    IMessage message = IMessage(address(this));

    if (bytes(message.text(tokenId)).length > maxLength) {
      revert IMessageContentLimits.MessageContentTooLong('text', maxLength);
    }

    (string memory uri, ) = message.uri(tokenId);
    if (bytes(uri).length > maxLength) {
      revert IMessageContentLimits.MessageContentTooLong('uri', maxLength);
    }
  }
}
