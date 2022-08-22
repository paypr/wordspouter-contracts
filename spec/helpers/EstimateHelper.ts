import { DiamondConstructorParams } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { Diamond__factory } from '@paypr/ethereum-contracts/dist/types/contracts';
import { BigNumber } from 'ethers';
import { INITIALIZER } from './Accounts';

export const baseDiamondEstimate = 1282807;
export const singleFunctionFacetEstimate = 97847;

export type EstimateTest = [string, () => Promise<DiamondConstructorParams> | DiamondConstructorParams, number];

export const shouldProduceEstimate = (
  name: string,
  buildConstructorParams: () => Promise<DiamondConstructorParams> | DiamondConstructorParams,
  differenceFromBase: number,
) => {
  it(`should return correct estimate for ${name}`, async () => {
    const deployTransaction = new Diamond__factory(INITIALIZER).getDeployTransaction(await buildConstructorParams());

    const estimate = await INITIALIZER.estimateGas(deployTransaction);
    console.log(`Total estimate for ${name}: ${estimate.toNumber()}`);
    const estimateDiff = estimate.sub(baseDiamondEstimate);
    expect<BigNumber>(estimateDiff).toBeLteBN(1000 + differenceFromBase);
    expect<BigNumber>(estimateDiff).toBeGteBN(differenceFromBase - 1000);
  });
};
