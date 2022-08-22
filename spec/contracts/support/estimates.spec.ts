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

import {
  DiamondConstructorParams,
  emptyDiamondInitFunction,
} from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { Diamond__factory } from '@paypr/ethereum-contracts/dist/types/contracts';
import { BigNumber } from 'ethers';
import { INITIALIZER } from '../../helpers/Accounts';
import { baseDiamondEstimate, EstimateTest } from '../../helpers/EstimateHelper';
import { messageEstimateTests } from '../facets/message/MessageEstimates';
import { likeableEstimateTests } from '../facets/reaction/LikableEstimates';

const estimateTests: EstimateTest[] = [...likeableEstimateTests, ...messageEstimateTests];

describe('estimates', () => {
  it('base diamond without cuts', async () => {
    const deployTransaction = new Diamond__factory(INITIALIZER).getDeployTransaction({
      diamondCuts: [],
      initFunction: emptyDiamondInitFunction,
    });

    const estimate = await INITIALIZER.estimateGas(deployTransaction);
    expect<BigNumber>(estimate).toEqBN(baseDiamondEstimate);
  });

  test.each(estimateTests)(
    '%s estimate',
    async (
      name: string,
      buildConstructorParams: () => Promise<DiamondConstructorParams> | DiamondConstructorParams,
      differenceFromBase: number,
    ) => {
      const deployTransaction = new Diamond__factory(INITIALIZER).getDeployTransaction(await buildConstructorParams());

      const estimate = await INITIALIZER.estimateGas(deployTransaction);
      console.log(`Total estimate for ${name}: ${estimate.toNumber()}`);
      const estimateDiff = estimate.sub(baseDiamondEstimate);
      expect<BigNumber>(estimateDiff).toBeLteBN(1000 + differenceFromBase);
      expect<BigNumber>(estimateDiff).toBeGteBN(differenceFromBase - 1000);
    },
  );
});
