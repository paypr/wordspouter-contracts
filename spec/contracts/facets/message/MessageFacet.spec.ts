import { ZERO_ADDRESS } from '@paypr/ethereum-contracts/dist/src/contracts/accounts';
import { buildDiamondFacetCut } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { BigNumber, ContractTransaction } from 'ethers';
import { ethers } from 'hardhat';
import { MESSAGE_INTERFACE_ID } from '../../../../src/contracts/interfaces';
import { hashMessageContent, URIType } from '../../../../src/contracts/messages';
import { ACCOUNT1, ACCOUNT2, ACCOUNT3 } from '../../../helpers/Accounts';
import { deployDiamond } from '../../../helpers/DiamondHelper';
import { shouldSupportInterface } from '../../../helpers/ERC165Helper';
import { asErc165, deployErc165Facet } from '../../../helpers/facets/ERC165FacetHelper';
import { asERC721, asERC721Enumerable } from '../../../helpers/facets/ERC721FacetHelper';
import { createMessage, deployMessageFacet } from '../../../helpers/facets/MessageFacetHelper';

describe('supportsInterface', () => {
  const createDiamondForErc165 = async () =>
    asErc165(
      await deployDiamond([
        buildDiamondFacetCut(await deployErc165Facet()),
        buildDiamondFacetCut(await deployMessageFacet()),
      ]),
    );

  shouldSupportInterface('MessageFacet', createDiamondForErc165, MESSAGE_INTERFACE_ID);
});

describe('text', () => {
  it('should return the correct text', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<string>(await message.text(id1)).toEqual('the message');

    await message.post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Image, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<string>(await message.text(id2)).toEqual('the message 2');
  });

  it('should return empty when no text', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.post({ text: '', uri: '', uriType: URIType.None, messageRef: 0 });
    const id = await erc721Enumerable.tokenByIndex(0);

    expect<string>(await message.text(id)).toEqual('');
  });
});

describe('uri', () => {
  it('should return the correct uri details', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<[string, URIType]>(await message.uri(id1)).toEqual(['the uri', URIType.Link]);

    await message.post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Image, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<[string, URIType]>(await message.uri(id2)).toEqual(['the uri 2', URIType.Image]);
  });

  it('should return empty when no uri', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.post({ text: '', uri: '', uriType: URIType.None, messageRef: 0 });
    const id = await erc721Enumerable.tokenByIndex(0);

    expect<[string, URIType]>(await message.uri(id)).toEqual(['', URIType.None]);
  });
});

describe('messageRef', () => {
  it('should return the correct messageRef', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(await message.messageRef(id1)).toEqBN(0);

    await message.post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Image, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(await message.messageRef(id2)).toEqBN(id1);
  });

  it('should return 0 when no messageRef', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.post({ text: '', uri: '', uriType: URIType.None, messageRef: 0 });
    const id = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(await message.messageRef(id)).toEqBN(0);
  });
});

describe('createdAt', () => {
  it('should return a valid timestamp', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.post({ text: '', uri: '', uriType: URIType.None, messageRef: 0 });
    const latestBlock = await ethers.provider.getBlock('latest');
    const id = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(await message.createdAt(id)).toEqBN(latestBlock.timestamp);
  });
});

describe('replyCount', () => {
  it('should return 0 with no replies', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(await message.replyCount(id1)).toEqBN(0);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Link, messageRef: 0 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(await message.replyCount(id1)).toEqBN(0);
    expect<BigNumber>(await message.replyCount(id2)).toEqBN(0);
  });

  it('should increase on repost or reply', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    expect<BigNumber>(await message.replyCount(id1)).toEqBN(1);

    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await message.replyCount(id1)).toEqBN(2);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await message.replyCount(id1)).toEqBN(3);

    await message.connect(ACCOUNT1).post({ text: 'the message 3', uri: '', uriType: URIType.None, messageRef: id2 });
    expect<BigNumber>(await message.replyCount(id1)).toEqBN(3);
    expect<BigNumber>(await message.replyCount(id2)).toEqBN(1);
  });
});

describe('replyByIndex', () => {
  it('should return the correct message id', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await message.replyByIndex(id1, 0)).toEqBN(id2);

    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    const id3 = await erc721Enumerable.tokenByIndex(2);
    expect<BigNumber>(await message.replyByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await message.replyByIndex(id1, 1)).toEqBN(id3);

    await message.connect(ACCOUNT2).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id3 });
    const id4 = await erc721Enumerable.tokenByIndex(3);
    expect<BigNumber>(await message.replyByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await message.replyByIndex(id1, 1)).toEqBN(id3);
    expect<BigNumber>(await message.replyByIndex(id3, 0)).toEqBN(id4);

    await message.connect(ACCOUNT1).post({ text: 'the message 3', uri: '', uriType: URIType.None, messageRef: id1 });
    const id5 = await erc721Enumerable.tokenByIndex(4);
    expect<BigNumber>(await message.replyByIndex(id1, 0)).toEqBN(id2);
    expect<BigNumber>(await message.replyByIndex(id1, 1)).toEqBN(id3);
    expect<BigNumber>(await message.replyByIndex(id3, 0)).toEqBN(id4);
    expect<BigNumber>(await message.replyByIndex(id1, 2)).toEqBN(id5);
  });
});

describe('post', () => {
  it('should post the message with valid content', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(id1).toEqual(
      hashMessageContent(ACCOUNT1.address, {
        text: 'the message',
        uri: 'the uri',
        uriType: URIType.Link,
        messageRef: 0,
      }),
    );
    expect<string>(await message.text(id1)).toEqual('the message');
    expect<[string, URIType]>(await message.uri(id1)).toEqual(['the uri', URIType.Link]);
    expect<BigNumber>(await message.messageRef(id1)).toEqBN(0);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Image, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(id2).toEqual(
      hashMessageContent(ACCOUNT1.address, {
        text: 'the message 2',
        uri: 'the uri 2',
        uriType: URIType.Image,
        messageRef: id1,
      }),
    );
    expect<string>(await message.text(id2)).toEqual('the message 2');
    expect<[string, URIType]>(await message.uri(id2)).toEqual(['the uri 2', URIType.Image]);
    expect<BigNumber>(await message.messageRef(id2)).toEqBN(id1);

    await message.connect(ACCOUNT1).post({ text: '', uri: '', uriType: URIType.None, messageRef: 0 });
    const id3 = await erc721Enumerable.tokenByIndex(2);

    expect<BigNumber>(id3).toEqual(
      hashMessageContent(ACCOUNT1.address, { text: '', uri: '', uriType: URIType.None, messageRef: 0 }),
    );
    expect<string>(await message.text(id3)).toEqual('');
    expect<[string, URIType]>(await message.uri(id3)).toEqual(['', URIType.None]);
    expect<BigNumber>(await message.messageRef(id3)).toEqBN(0);

    await message.connect(ACCOUNT1).post({ text: '', uri: '', uriType: URIType.None, messageRef: id2 });
    const id4 = await erc721Enumerable.tokenByIndex(3);

    expect<BigNumber>(id4).toEqual(
      hashMessageContent(ACCOUNT1.address, { text: '', uri: '', uriType: URIType.None, messageRef: id2 }),
    );
    expect<string>(await message.text(id4)).toEqual('');
    expect<[string, URIType]>(await message.uri(id4)).toEqual(['', URIType.None]);
    expect<BigNumber>(await message.messageRef(id4)).toEqBN(id2);
  });

  it('should allow repost from different accounts', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(id2).toEqual(
      hashMessageContent(ACCOUNT2.address, { text: '', uri: '', uriType: URIType.None, messageRef: id1 }),
    );
    expect<string>(await message.text(id2)).toEqual('');
    expect<[string, URIType]>(await message.uri(id2)).toEqual(['', URIType.None]);
    expect<BigNumber>(await message.messageRef(id2)).toEqBN(id1);

    await message.connect(ACCOUNT3).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    const id3 = await erc721Enumerable.tokenByIndex(2);

    expect<BigNumber>(id3).toEqual(
      hashMessageContent(ACCOUNT3.address, { text: '', uri: '', uriType: URIType.None, messageRef: id1 }),
    );
    expect<string>(await message.text(id3)).toEqual('');
    expect<[string, URIType]>(await message.uri(id3)).toEqual(['', URIType.None]);
    expect<BigNumber>(await message.messageRef(id3)).toEqBN(id1);
  });

  it('should post the same message as a repost', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(id2).toEqual(
      hashMessageContent(ACCOUNT1.address, { text: '', uri: '', uriType: URIType.None, messageRef: id1 }),
    );
    expect<string>(await message.text(id2)).toEqual('');
    expect<[string, URIType]>(await message.uri(id2)).toEqual(['', URIType.None]);
    expect<BigNumber>(await message.messageRef(id2)).toEqBN(id1);
  });

  it('should repost the root post if a post to a repost', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Link, messageRef: id2 });
    const id3 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(id3).toEqual(
      hashMessageContent(ACCOUNT1.address, { text: '', uri: '', uriType: URIType.None, messageRef: id1 }),
    );
    expect<string>(await message.text(id3)).toEqual('');
    expect<[string, URIType]>(await message.uri(id3)).toEqual(['', URIType.None]);
    expect<BigNumber>(await message.messageRef(id3)).toEqBN(id1);
  });

  it('should increase reply count when replies', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    expect<BigNumber>(await message.replyCount(id1)).toEqBN(1);

    await message.connect(ACCOUNT2).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });
    expect<BigNumber>(await message.replyCount(id1)).toEqBN(2);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);
    expect<BigNumber>(await message.replyCount(id1)).toEqBN(3);

    await message.connect(ACCOUNT1).post({ text: 'the message 3', uri: '', uriType: URIType.None, messageRef: id2 });
    expect<BigNumber>(await message.replyCount(id1)).toEqBN(3);
    expect<BigNumber>(await message.replyCount(id2)).toEqBN(1);
  });

  it('should fail if same repost for a single account', async () => {
    const message = await createMessage();
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: '', uri: '', uriType: URIType.None, messageRef: id1 });

    await expect<Promise<ContractTransaction>>(
      message.connect(ACCOUNT1).post({
        text: '',
        uri: '',
        uriType: URIType.None,
        messageRef: id1,
      }),
    ).toBeRevertedWith('token already minted');
  });

  it('should fail if url provided with None url type', async () => {
    const message = await createMessage();

    await expect<Promise<ContractTransaction>>(
      message.connect(ACCOUNT1).post({
        text: '',
        uri: 'the url',
        uriType: URIType.None,
        messageRef: 0,
      }),
    ).toBeRevertedWith('InvalidURI');
  });

  it('should fail if url not provided with non-None url type', async () => {
    const message = await createMessage();

    await expect<Promise<ContractTransaction>>(
      message.connect(ACCOUNT1).post({
        text: '',
        uri: '',
        uriType: URIType.Link,
        messageRef: 0,
      }),
    ).toBeRevertedWith('InvalidURI');
  });

  it('should fail if invalid messageRef', async () => {
    const message = await createMessage();

    await expect<Promise<ContractTransaction>>(
      message.connect(ACCOUNT1).post({
        text: '',
        uri: '',
        uriType: URIType.None,
        messageRef: 1,
      }),
    ).toBeRevertedWith('MessageNotFound');
  });

  it('should emit Transfer event', async () => {
    const message = await createMessage();
    const erc721 = asERC721(message);

    await expect<ContractTransaction>(
      await message
        .connect(ACCOUNT1)
        .post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 }),
    ).toHaveEmittedWith(erc721, 'Transfer', [
      ZERO_ADDRESS,
      ACCOUNT1.address,
      hashMessageContent(ACCOUNT1.address, {
        text: 'the message',
        uri: 'the uri',
        uriType: URIType.Link,
        messageRef: 0,
      }),
    ]);
  });
});
