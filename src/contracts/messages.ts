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

import { BigNumber } from 'ethers';
import { defaultAbiCoder, keccak256, ParamType } from 'ethers/lib/utils';
// noinspection ES6PreferShortImport
import { IMessage } from '../../types/contracts/contracts/facets/message/IMessage';
import MessageContentStruct = IMessage.MessageContentStruct;

export enum URIType {
  None,
  Link,
  Image,
}

export type PostMessageContent = Partial<MessageContentStruct>;

export const withMessageContentDefaults = ({
  text,
  uri,
  uriType,
  messageRef,
}: PostMessageContent): MessageContentStruct => ({
  text: text || '',
  uri: uri || '',
  uriType: uriType || URIType.None,
  messageRef: messageRef || 0,
});

export const isMessageRepost = ({ text, uri, messageRef }: MessageContentStruct) =>
  !BigNumber.from(messageRef).eq(BigNumber.from(0)) && text === '' && uri === '';

export const hashMessageContent = (sender: string, content: PostMessageContent) => {
  const { text, uri, uriType, messageRef } = withMessageContentDefaults(content);
  if (isMessageRepost({ text, uri, uriType, messageRef })) {
    return BigNumber.from(
      keccak256(defaultAbiCoder.encode(['address', messageContentType], [sender, { text, uri, uriType, messageRef }])),
    );
  }

  return BigNumber.from(keccak256(defaultAbiCoder.encode([messageContentType], [{ text, uri, uriType, messageRef }])));
};

const messageContentType = ParamType.fromObject({
  name: 'MessageContent',
  type: 'struct',
  components: [
    ParamType.fromObject({ name: 'text', type: 'string', indexed: true }),
    ParamType.fromObject({ name: 'uri', type: 'string', indexed: true }),
    ParamType.fromObject({ name: 'uriType', type: 'uint8', indexed: true }),
    ParamType.fromObject({ name: 'messageRef', type: 'uint256', indexed: true }),
  ],
});
