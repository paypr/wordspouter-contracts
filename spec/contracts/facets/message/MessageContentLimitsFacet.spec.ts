import { buildDiamondFacetCut } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { BigNumber, ContractTransaction } from 'ethers';
import { MESSAGE_CONTENT_LIMITS_INTERFACE_ID } from '../../../../src/contracts/interfaces';
import { hashMessageContent, URIType } from '../../../../src/contracts/messages';
import { ACCOUNT1 } from '../../../helpers/Accounts';
import { deployDiamond } from '../../../helpers/DiamondHelper';
import { shouldSupportInterface } from '../../../helpers/ERC165Helper';
import { asErc165, deployErc165Facet } from '../../../helpers/facets/ERC165FacetHelper';
import { asERC721Enumerable } from '../../../helpers/facets/ERC721FacetHelper';
import {
  asMessageContentLimits,
  buildMessageContentLimitsAdditions,
  createMessage,
  deployMessageContentLimitsFacet,
} from '../../../helpers/facets/MessageFacetHelper';

describe('supportsInterface', () => {
  const createDiamondForErc165 = async () =>
    asErc165(
      await deployDiamond([
        buildDiamondFacetCut(await deployErc165Facet()),
        buildDiamondFacetCut(await deployMessageContentLimitsFacet()),
      ]),
    );

  shouldSupportInterface('MessageContentLimitsFacet', createDiamondForErc165, MESSAGE_CONTENT_LIMITS_INTERFACE_ID);
});

describe('messageContentLimits', () => {
  it('should return 0 when no max length set', async () => {
    const message = await createMessage(await buildMessageContentLimitsAdditions(0));
    const messageContentLimits = asMessageContentLimits(message);

    expect<BigNumber>(await messageContentLimits.maxContentLength()).toEqBN(0);
  });

  it('should return the max length', async () => {
    const message = await createMessage(await buildMessageContentLimitsAdditions(1001));
    const messageContentLimits = asMessageContentLimits(message);

    expect<BigNumber>(await messageContentLimits.maxContentLength()).toEqBN(1001);
  });
});

describe('post', () => {
  it('should post when no max length set', async () => {
    const message = await createMessage(await buildMessageContentLimitsAdditions(0));
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(id1).toEqual(hashMessageContent(ACCOUNT1.address, 'the message', 'the uri', URIType.Link, 0));
    expect<string>(await message.text(id1)).toEqual('the message');
    expect<[string, URIType]>(await message.uri(id1)).toEqual(['the uri', URIType.Link]);
    expect<BigNumber>(await message.messageRef(id1)).toEqBN(0);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Image, messageRef: id1 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(id2).toEqual(
      hashMessageContent(ACCOUNT1.address, 'the message 2', 'the uri 2', URIType.Image, id1),
    );
    expect<string>(await message.text(id2)).toEqual('the message 2');
    expect<[string, URIType]>(await message.uri(id2)).toEqual(['the uri 2', URIType.Image]);
    expect<BigNumber>(await message.messageRef(id2)).toEqBN(id1);
  });

  it('should post when enough value provided', async () => {
    const message = await createMessage(await buildMessageContentLimitsAdditions(13));
    const erc721Enumerable = asERC721Enumerable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(id1).toEqual(hashMessageContent(ACCOUNT1.address, 'the message', 'the uri', URIType.Link, 0));
    expect<string>(await message.text(id1)).toEqual('the message');
    expect<[string, URIType]>(await message.uri(id1)).toEqual(['the uri', URIType.Link]);
    expect<BigNumber>(await message.messageRef(id1)).toEqBN(0);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message 2', uri: 'the uri 2 two', uriType: URIType.Image, messageRef: id1 }, { value: 101 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(id2).toEqual(
      hashMessageContent(ACCOUNT1.address, 'the message 2', 'the uri 2 two', URIType.Image, id1),
    );
    expect<string>(await message.text(id2)).toEqual('the message 2');
    expect<[string, URIType]>(await message.uri(id2)).toEqual(['the uri 2 two', URIType.Image]);
    expect<BigNumber>(await message.messageRef(id2)).toEqBN(id1);
  });

  it('should fail if not enough value provided', async () => {
    const message = await createMessage(await buildMessageContentLimitsAdditions(10));

    await expect<Promise<ContractTransaction>>(
      message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 }),
    ).toBeRevertedWith('ContentTooLong');

    await expect<Promise<ContractTransaction>>(
      message.connect(ACCOUNT1).post({ text: 'the msg', uri: 'the uri two', uriType: URIType.Link, messageRef: 0 }),
    ).toBeRevertedWith('ContentTooLong');

    await expect<Promise<ContractTransaction>>(
      message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri two', uriType: URIType.Link, messageRef: 0 }),
    ).toBeRevertedWith('ContentTooLong');

    await expect<Promise<ContractTransaction>>(
      message
        .connect(ACCOUNT1)
        .post({ text: 'the really long message', uri: 'the really long uri', uriType: URIType.Link, messageRef: 0 }),
    ).toBeRevertedWith('ContentTooLong');
  });
});
