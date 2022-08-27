import { buildDiamondFacetCut, emptyDiamondInitFunction } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { EstimateTest } from '../../../helpers/EstimateHelper';
import { deployLikableFacet } from '../../../helpers/facets/ReactableFacetHelper';

export const likeableEstimateTests: EstimateTest[] = [
  [
    'LikableFacet',
    async () => ({
      diamondCuts: [buildDiamondFacetCut(await deployLikableFacet())],
      initFunction: emptyDiamondInitFunction,
    }),
    170609,
  ],
];
