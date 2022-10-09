import { buildDiamondFacetCut } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { BigNumber } from 'ethers';
import { MESSAGE_REPLIES_INTERFACE_ID } from '../../../../src/contracts/interfaces';
import { URIType } from '../../../../src/contracts/messages';
import { ACCOUNT1, ACCOUNT2, ACCOUNT3 } from '../../../helpers/Accounts';
import { deployDiamond } from '../../../helpers/DiamondHelper';
import { shouldSupportInterface } from '../../../helpers/ERC165Helper';
import { asErc165, deployErc165Facet } from '../../../helpers/facets/ERC165FacetHelper';
import { asERC721Enumerable } from '../../../helpers/facets/ERC721FacetHelper';
import {
  asMessageReplies,
  createMessageWithReplies,
  deployMessageRepliesFacet,
} from '../../../helpers/facets/MessageFacetHelper';

describe('supportsInterface', () => {
  const createDiamondForErc165 = async () =>
    asErc165(
      await deployDiamond([
        buildDiamondFacetCut(await deployErc165Facet()),
        buildDiamondFacetCut(await deployMessageRepliesFacet()),
      ]),
    );

  shouldSupportInterface('MessageRepliesFacet', createDiamondForErc165, MESSAGE_REPLIES_INTERFACE_ID);
});

describe('replyCount', () => {
  it('should return 0 with no replies', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Link, messageRef: 0 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);
    expect<BigNumber>(await messageReplies.replyCount(id2)).toEqBN(0);
  });

  it('should increase on reply', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(1);
    expect<BigNumber>(await messageReplies.replyCount(id2)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 3', uri: '', uriType: URIType.None, messageRef: id2 });
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(1);
    expect<BigNumber>(await messageReplies.replyCount(id2)).toEqBN(1);

    await message.connect(ACCOUNT1).post({ text: 'the message 4', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(2);
    expect<BigNumber>(await messageReplies.replyCount(id2)).toEqBN(1);
  });

  it('should not increase on repost', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);

    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(1);
    expect<BigNumber>(await messageReplies.replyCount(id2)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(1);
    expect<BigNumber>(await messageReplies.replyCount(id2)).toEqBN(0);
  });
});

describe('replyByIndex', () => {
  it('should return the correct message id', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT2).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 0)).toEqBN(id2);

    // repost
    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 0)).toEqBN(id2);

    await message.connect(ACCOUNT1).post({ text: 'the message 3', uri: '', uriType: URIType.None, messageRef: id1 });
    const id4 = await erc721Enumerable.tokenByIndex(3);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 1)).toEqBN(id4);

    // repost
    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 1)).toEqBN(id4);

    await message.connect(ACCOUNT1).post({ text: 'the message 4', uri: '', uriType: URIType.None, messageRef: id1 });
    const id6 = await erc721Enumerable.tokenByIndex(5);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 1)).toEqBN(id4);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 2)).toEqBN(id6);

    await message.connect(ACCOUNT1).post({ text: 'the message 5', uri: '', uriType: URIType.None, messageRef: id6 });
    const id7 = await erc721Enumerable.tokenByIndex(6);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 1)).toEqBN(id4);
    expect<BigNumber>(await messageReplies.replyByIndex(id1, 2)).toEqBN(id6);
    expect<BigNumber>(await messageReplies.replyByIndex(id6, 0)).toEqBN(id7);
  });
});

describe('repostCount', () => {
  it('should return 0 with no repost', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Link, messageRef: 0 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(0);
    expect<BigNumber>(await messageReplies.repostCount(id2)).toEqBN(0);
  });

  it('should increase on repost', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(1);
    expect<BigNumber>(await messageReplies.repostCount(id2)).toEqBN(0);

    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(2);
    expect<BigNumber>(await messageReplies.repostCount(id2)).toEqBN(0);

    await message.connect(ACCOUNT3).post({ text: '', uri: '', uriType: URIType.None, messageRef: id2 });
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(3);
    expect<BigNumber>(await messageReplies.repostCount(id2)).toEqBN(0);
  });

  it('should not increase on reply', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(0);
    expect<BigNumber>(await messageReplies.repostCount(id2)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 3', uri: '', uriType: URIType.None, messageRef: id2 });
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(0);
    expect<BigNumber>(await messageReplies.repostCount(id2)).toEqBN(0);
  });
});

describe('repostByIndex', () => {
  it('should return the correct message id', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await messageReplies.repostByIndex(id1, 0)).toEqBN(id2);

    // reply
    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    const id3 = await erc721Enumerable.tokenByIndex(2);
    expect<BigNumber>(await messageReplies.repostByIndex(id1, 0)).toEqBN(id2);

    await message.connect(ACCOUNT1).post({ text: '', uri: '', uriType: URIType.None, messageRef: id3 });
    const id4 = await erc721Enumerable.tokenByIndex(3);
    expect<BigNumber>(await messageReplies.repostByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await messageReplies.repostByIndex(id3, 0)).toEqBN(id4);

    // reply
    await message.connect(ACCOUNT1).post({ text: 'the message 3', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await messageReplies.repostByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await messageReplies.repostByIndex(id3, 0)).toEqBN(id4);

    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    const id6 = await erc721Enumerable.tokenByIndex(5);
    expect<BigNumber>(await messageReplies.repostByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await messageReplies.repostByIndex(id1, 1)).toEqBN(id6);
    expect<BigNumber>(await messageReplies.repostByIndex(id3, 0)).toEqBN(id4);
  });
});

describe('post', () => {
  it('should increase reply and repost counts', async () => {
    const message = await createMessageWithReplies();
    const messageReplies = asMessageReplies(message);
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(1);

    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(0);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(2);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(1);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(2);
    expect<BigNumber>(await messageReplies.replyCount(id2)).toEqBN(0);
    expect<BigNumber>(await messageReplies.repostCount(id2)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 3', uri: '', uriType: URIType.None, messageRef: id2 });
    expect<BigNumber>(await messageReplies.replyCount(id1)).toEqBN(2);
    expect<BigNumber>(await messageReplies.repostCount(id1)).toEqBN(2);
    expect<BigNumber>(await messageReplies.replyCount(id2)).toEqBN(0);
    expect<BigNumber>(await messageReplies.repostCount(id2)).toEqBN(0);
  });
});
