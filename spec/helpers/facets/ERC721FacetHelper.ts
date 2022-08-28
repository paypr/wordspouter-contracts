import { buildERC721AddHooksInitFunction } from '@paypr/ethereum-contracts/dist/src/contracts/artifacts';
import { buildDiamondFacetCut } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import {
  ERC721EnumerableFacet__factory,
  ERC721EnumerableHooks__factory,
  ERC721Facet__factory,
  ERC721Init__factory,
  IERC721__factory,
  IERC721Enumerable__factory,
} from '@paypr/ethereum-contracts/dist/types/contracts';
import { Contract, Signer } from 'ethers';
import { INITIALIZER } from '../Accounts';
import { ExtensibleDiamondOptions } from '../DiamondHelper';

export const asERC721 = (contract: Contract, signer: Signer = INITIALIZER) =>
  IERC721__factory.connect(contract.address, signer);

export const asERC721Enumerable = (contract: Contract, signer: Signer = INITIALIZER) =>
  IERC721Enumerable__factory.connect(contract.address, signer);

export const buildERC721Additions = async (): Promise<ExtensibleDiamondOptions> => {
  return {
    additionalCuts: [
      buildDiamondFacetCut(await deployERC721Facet()),
      buildDiamondFacetCut(await deployERC721EnumerableFacet()),
    ],
    additionalInits: [buildERC721AddHooksInitFunction(await deployERC721Init(), await deployERC721EnumerableHooks())],
  };
};

export const deployERC721Facet = () => new ERC721Facet__factory(INITIALIZER).deploy();
export const deployERC721EnumerableFacet = () => new ERC721EnumerableFacet__factory(INITIALIZER).deploy();
export const deployERC721EnumerableHooks = () => new ERC721EnumerableHooks__factory(INITIALIZER).deploy();
export const deployERC721Init = () => new ERC721Init__factory(INITIALIZER).deploy();
