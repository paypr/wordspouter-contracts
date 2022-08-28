import { buildERC721AddHooksInitFunction } from '@paypr/ethereum-contracts/dist/src/contracts/artifacts';
import { buildDiamondFacetCut, emptyDiamondInitFunction } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { buildMessageCostInitSetBasicCostFunction } from '../../../../src/contracts/messages/messageCost';
import { combineDiamondInitFunctions } from '../../../helpers/DiamondHelper';
import { EstimateTest } from '../../../helpers/EstimateHelper';
import { deployERC721Init } from '../../../helpers/facets/ERC721FacetHelper';
import {
  deployBasicMessageCostERC721Hooks,
  deployBasicMessageCostFacet,
  deployMessageCostInit,
  deployMessageFacet,
} from '../../../helpers/facets/MessageFacetHelper';

export const messageEstimateTests: EstimateTest[] = [
  [
    'BasicMessageCostFacet',
    async () => ({
      diamondCuts: [buildDiamondFacetCut(await deployBasicMessageCostFacet())],
      initFunction: emptyDiamondInitFunction,
    }),
    97847,
  ],
  [
    'BasicMessageCostFacet with init',
    async () => ({
      diamondCuts: [buildDiamondFacetCut(await deployBasicMessageCostFacet())],
      initFunction: buildMessageCostInitSetBasicCostFunction(await deployMessageCostInit(), 1),
    }),
    124838,
  ],
  [
    'BasicMessageCostFacet with init and hooks',
    async () => ({
      diamondCuts: [buildDiamondFacetCut(await deployBasicMessageCostFacet())],
      initFunction: await combineDiamondInitFunctions([
        buildMessageCostInitSetBasicCostFunction(await deployMessageCostInit(), 1),
        buildERC721AddHooksInitFunction(await deployERC721Init(), await deployBasicMessageCostERC721Hooks()),
      ]),
    }),
    209600,
  ],
  [
    'MessageFacet',
    async () => ({
      diamondCuts: [buildDiamondFacetCut(await deployMessageFacet())],
      initFunction: emptyDiamondInitFunction,
    }),
    243371,
  ],
];
