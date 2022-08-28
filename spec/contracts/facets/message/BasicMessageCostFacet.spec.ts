import { buildDiamondFacetCut } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { BigNumber, ContractTransaction } from 'ethers';
import { MESSAGE_COST_INTERFACE_ID } from '../../../../src/contracts/interfaces';
import { hashMessageContent, URIType, withMessageContentDefaults } from '../../../../src/contracts/messages';
import { ACCOUNT1 } from '../../../helpers/Accounts';
import { deployDiamond } from '../../../helpers/DiamondHelper';
import { shouldSupportInterface } from '../../../helpers/ERC165Helper';
import { asErc165, deployErc165Facet } from '../../../helpers/facets/ERC165FacetHelper';
import { asERC721Enumerable } from '../../../helpers/facets/ERC721FacetHelper';
import {
  asMessageCost,
  buildMessageCostAdditions,
  createMessage,
  deployBasicMessageCostFacet,
} from '../../../helpers/facets/MessageFacetHelper';

describe('supportsInterface', () => {
  const createDiamondForErc165 = async () =>
    asErc165(
      await deployDiamond([
        buildDiamondFacetCut(await deployErc165Facet()),
        buildDiamondFacetCut(await deployBasicMessageCostFacet()),
      ]),
    );

  shouldSupportInterface('MessageCostFacet', createDiamondForErc165, MESSAGE_COST_INTERFACE_ID);
});

describe('messageCost', () => {
  it('should return 0 when no basic cost set', async () => {
    const message = await createMessage(await buildMessageCostAdditions(0));
    const messageCost = asMessageCost(message);

    expect<BigNumber>(await messageCost.messageCost(withMessageContentDefaults({}))).toEqBN(0);
  });

  it('should return the basic message cost', async () => {
    const message = await createMessage(await buildMessageCostAdditions(1001));
    const messageCost = asMessageCost(message);

    expect<BigNumber>(await messageCost.messageCost(withMessageContentDefaults({}))).toEqBN(1001);
  });
});

describe('post', () => {
  it('should post when no basic cost set', async () => {
    const message = await createMessage(await buildMessageCostAdditions(0));
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
    const message = await createMessage(await buildMessageCostAdditions(100));
    const erc721Enumerable = asERC721Enumerable(message);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 }, { value: 100 });
    const id1 = await erc721Enumerable.tokenByIndex(0);

    expect<BigNumber>(id1).toEqual(hashMessageContent(ACCOUNT1.address, 'the message', 'the uri', URIType.Link, 0));
    expect<string>(await message.text(id1)).toEqual('the message');
    expect<[string, URIType]>(await message.uri(id1)).toEqual(['the uri', URIType.Link]);
    expect<BigNumber>(await message.messageRef(id1)).toEqBN(0);

    await message
      .connect(ACCOUNT1)
      .post({ text: 'the message 2', uri: 'the uri 2', uriType: URIType.Image, messageRef: id1 }, { value: 101 });
    const id2 = await erc721Enumerable.tokenByIndex(1);

    expect<BigNumber>(id2).toEqual(
      hashMessageContent(ACCOUNT1.address, 'the message 2', 'the uri 2', URIType.Image, id1),
    );
    expect<string>(await message.text(id2)).toEqual('the message 2');
    expect<[string, URIType]>(await message.uri(id2)).toEqual(['the uri 2', URIType.Image]);
    expect<BigNumber>(await message.messageRef(id2)).toEqBN(id1);
  });

  it('should fail if not enough value provided', async () => {
    const message = await createMessage(await buildMessageCostAdditions(100));

    await expect<Promise<ContractTransaction>>(
      message.connect(ACCOUNT1).post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 }),
    ).toBeRevertedWith('ValueDoesNotMeetCost');

    await expect<Promise<ContractTransaction>>(
      message
        .connect(ACCOUNT1)
        .post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 }, { value: 1 }),
    ).toBeRevertedWith('ValueDoesNotMeetCost');

    await expect<Promise<ContractTransaction>>(
      message
        .connect(ACCOUNT1)
        .post({ text: 'the message', uri: 'the uri', uriType: URIType.Link, messageRef: 0 }, { value: 99 }),
    ).toBeRevertedWith('ValueDoesNotMeetCost');
  });
});
