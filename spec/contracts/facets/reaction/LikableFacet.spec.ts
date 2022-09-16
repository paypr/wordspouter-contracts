import { buildDiamondFacetCut } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { BigNumber, ContractTransaction } from 'ethers';
import { LIKABLE_INTERFACE_ID } from '../../../../src/contracts/interfaces';
import { URIType } from '../../../../src/contracts/messages';
import { LIKE_EMOJI_ID } from '../../../../src/contracts/reactions';
import { ACCOUNT1, ACCOUNT2, ACCOUNT3 } from '../../../helpers/Accounts';
import { deployDiamond } from '../../../helpers/DiamondHelper';
import { shouldSupportInterface } from '../../../helpers/ERC165Helper';
import { asErc165, deployErc165Facet } from '../../../helpers/facets/ERC165FacetHelper';
import { asERC721Enumerable } from '../../../helpers/facets/ERC721FacetHelper';
import { createMessage } from '../../../helpers/facets/MessageFacetHelper';
import {
  asLikable,
  asReactable,
  buildLikableAdditions,
  deployLikableFacet,
} from '../../../helpers/facets/ReactableFacetHelper';

describe('supportsInterface', () => {
  const createDiamondForErc165 = async () =>
    asErc165(
      await deployDiamond([
        buildDiamondFacetCut(await deployErc165Facet()),
        buildDiamondFacetCut(await deployLikableFacet()),
      ]),
    );

  shouldSupportInterface('LikableFacet', createDiamondForErc165, LIKABLE_INTERFACE_ID);
});

describe('likeCount', () => {
  it('should increase when liked', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId2 = await erc721Enumerable.tokenByIndex(1);

    await likable.connect(ACCOUNT1).like(messageId1);
    expect<BigNumber>(await likable.likeCount(messageId1)).toEqBN(1);

    await likable.connect(ACCOUNT1).like(messageId2);
    expect<BigNumber>(await likable.likeCount(messageId1)).toEqBN(1);
    expect<BigNumber>(await likable.likeCount(messageId2)).toEqBN(1);

    await likable.connect(ACCOUNT2).like(messageId1);
    expect<BigNumber>(await likable.likeCount(messageId1)).toEqBN(2);
    expect<BigNumber>(await likable.likeCount(messageId2)).toEqBN(1);

    await likable.connect(ACCOUNT3).like(messageId1);
    expect<BigNumber>(await likable.likeCount(messageId1)).toEqBN(3);
    expect<BigNumber>(await likable.likeCount(messageId2)).toEqBN(1);
  });

  it('should not increase when liked by the same account', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT2).like(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(1);

    await likable.connect(ACCOUNT2).like(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(1);
  });

  it('should decrease when unliked', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: 'the message 2', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId2 = await erc721Enumerable.tokenByIndex(1);

    await likable.connect(ACCOUNT2).like(messageId1);
    await likable.connect(ACCOUNT3).like(messageId1);

    await likable.connect(ACCOUNT2).like(messageId2);
    await likable.connect(ACCOUNT3).like(messageId2);

    await likable.connect(ACCOUNT2).unlike(messageId1);
    expect<BigNumber>(await likable.likeCount(messageId1)).toEqBN(1);
    expect<BigNumber>(await likable.likeCount(messageId2)).toEqBN(2);

    await likable.connect(ACCOUNT3).unlike(messageId1);
    expect<BigNumber>(await likable.likeCount(messageId1)).toEqBN(0);
    expect<BigNumber>(await likable.likeCount(messageId2)).toEqBN(2);
  });

  it('should not decrease when unliked by an account that has not liked', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT2).like(messageId);

    await likable.connect(ACCOUNT3).unlike(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(1);
  });
});

describe('likeByIndex', () => {
  it('should return the correct address', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId1 = await erc721Enumerable.tokenByIndex(0);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId2 = await erc721Enumerable.tokenByIndex(1);

    await likable.connect(ACCOUNT1).like(messageId1);
    expect<string>(await likable.likeByIndex(messageId1, 0)).toEqBN(ACCOUNT1.address);

    await likable.connect(ACCOUNT1).like(messageId2);
    expect<string>(await likable.likeByIndex(messageId1, 0)).toEqBN(ACCOUNT1.address);
    expect<string>(await likable.likeByIndex(messageId2, 0)).toEqBN(ACCOUNT1.address);

    await likable.connect(ACCOUNT2).like(messageId1);
    expect<string>(await likable.likeByIndex(messageId1, 0)).toEqBN(ACCOUNT1.address);
    expect<string>(await likable.likeByIndex(messageId1, 1)).toEqBN(ACCOUNT2.address);
    expect<string>(await likable.likeByIndex(messageId2, 0)).toEqBN(ACCOUNT1.address);

    await likable.connect(ACCOUNT3).like(messageId1);
    expect<BigNumber>(await likable.likeCount(messageId1)).toEqBN(3);
    expect<string>(await likable.likeByIndex(messageId1, 0)).toEqBN(ACCOUNT1.address);
    expect<string>(await likable.likeByIndex(messageId1, 1)).toEqBN(ACCOUNT2.address);
    expect<string>(await likable.likeByIndex(messageId1, 2)).toEqBN(ACCOUNT3.address);
    expect<string>(await likable.likeByIndex(messageId2, 0)).toEqBN(ACCOUNT1.address);
  });
});

describe('hasLiked', () => {
  it('should return false when no one has liked', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId1 = await erc721Enumerable.tokenByIndex(0);

    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT1.address)).toBe(false);
    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT2.address)).toBe(false);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId2 = await erc721Enumerable.tokenByIndex(1);

    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT1.address)).toBe(false);
    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT2.address)).toBe(false);
  });

  it('should return false when the sender has not liked', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId1 = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT1).like(messageId1);

    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT2.address)).toBe(false);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId2 = await erc721Enumerable.tokenByIndex(1);

    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT1.address)).toBe(false);

    await likable.connect(ACCOUNT1).like(messageId2);

    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT2.address)).toBe(false);
  });

  it('shoudl return true when the sender has liked', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId1 = await erc721Enumerable.tokenByIndex(0);

    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT1.address)).toBe(false);
    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT2.address)).toBe(false);

    await likable.connect(ACCOUNT1).like(messageId1);

    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT1.address)).toBe(true);
    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT2.address)).toBe(false);

    await likable.connect(ACCOUNT2).like(messageId1);

    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT1.address)).toBe(true);
    expect<boolean>(await likable.hasLiked(messageId1, ACCOUNT2.address)).toBe(true);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId2 = await erc721Enumerable.tokenByIndex(1);

    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT1.address)).toBe(false);
    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT2.address)).toBe(false);

    await likable.connect(ACCOUNT1).like(messageId2);

    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT1.address)).toBe(true);
    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT2.address)).toBe(false);

    await likable.connect(ACCOUNT2).like(messageId2);

    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT1.address)).toBe(true);
    expect<boolean>(await likable.hasLiked(messageId2, ACCOUNT2.address)).toBe(true);
  });
});

describe('like', () => {
  it('should increase like count', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT1).like(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(1);

    await likable.connect(ACCOUNT2).like(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(2);

    await likable.connect(ACCOUNT3).like(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(3);
  });

  it('should not add like to post when already liked by account', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT2).like(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(1);

    await likable.connect(ACCOUNT2).like(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(1);
  });

  it('should emit Reaction event', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await expect<ContractTransaction>(await likable.connect(ACCOUNT2).like(messageId)).toHaveEmittedWith(
      asReactable(message),
      'Reaction',
      [ACCOUNT2.address, messageId, BigNumber.from(LIKE_EMOJI_ID)],
    );
  });

  it('should not emit Reaction event for like from same account', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT2).like(messageId);

    await expect<ContractTransaction>(await likable.connect(ACCOUNT2).like(messageId)).not.toHaveEmitted(
      asReactable(message),
      'Reaction',
    );
  });
});

describe('unlike', () => {
  it('should decrease like count', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT2).like(messageId);
    await likable.connect(ACCOUNT3).like(messageId);

    await likable.connect(ACCOUNT2).unlike(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(1);

    await likable.connect(ACCOUNT3).unlike(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(0);
  });

  it('should not remove like from post when not already liked by account', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT2).like(messageId);

    await likable.connect(ACCOUNT3).unlike(messageId);
    expect<BigNumber>(await likable.likeCount(messageId)).toEqBN(1);
  });

  it('should emit ReactionRemoved event', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await likable.connect(ACCOUNT2).like(messageId);

    await expect<ContractTransaction>(await likable.connect(ACCOUNT2).unlike(messageId)).toHaveEmittedWith(
      asReactable(message),
      'ReactionRemoved',
      [ACCOUNT2.address, messageId, BigNumber.from(LIKE_EMOJI_ID)],
    );
  });

  it('should not emit ReactionRemoved event when not liked by account', async () => {
    const message = await createMessage(await buildLikableAdditions());
    const erc721Enumerable = asERC721Enumerable(message);
    const likable = asLikable(message);

    await message.connect(ACCOUNT1).post({ text: 'the message', uri: '', uriType: URIType.None, messageRef: 0 });
    const messageId = await erc721Enumerable.tokenByIndex(0);

    await expect<ContractTransaction>(await likable.connect(ACCOUNT2).unlike(messageId)).not.toHaveEmitted(
      asReactable(message),
      'ReactionRemoved',
    );
  });
});
