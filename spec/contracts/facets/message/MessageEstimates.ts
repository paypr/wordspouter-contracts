import { buildDiamondFacetCut, emptyDiamondInitFunction } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { EstimateTest } from '../../../helpers/EstimateHelper';
import { deployMessageFacet } from '../../../helpers/facets/MessageFacetHelper';

export const messageEstimateTests: EstimateTest[] = [
  [
    'MessageFacet',
    async () => ({
      diamondCuts: [buildDiamondFacetCut(await deployMessageFacet())],
      initFunction: emptyDiamondInitFunction,
    }),
    243371,
  ],
];
