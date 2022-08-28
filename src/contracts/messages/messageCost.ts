import { DiamondInitFunction } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { BigNumberish } from 'ethers';
import { MessageCostInit } from '../../../types/contracts';

export const buildMessageCostInitSetBasicCostFunction = (
  init: MessageCostInit,
  cost: BigNumberish,
): DiamondInitFunction => ({
  initAddress: init.address,
  callData: encodeMessageCostInitSetBasicCostCallData(init, cost),
});

export const encodeMessageCostInitSetBasicCostCallData = (init: MessageCostInit, cost: BigNumberish) =>
  init.interface.encodeFunctionData('setBasicCost', [cost]);
