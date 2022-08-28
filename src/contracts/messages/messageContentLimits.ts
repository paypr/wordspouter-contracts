import { DiamondInitFunction } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { BigNumberish } from 'ethers';
import { MessageContentLimitsInit } from '../../../types/contracts';

export const buildMessageContentLimitsInitSetMaxContentLengthFunction = (
  init: MessageContentLimitsInit,
  maxLength: BigNumberish,
): DiamondInitFunction => ({
  initAddress: init.address,
  callData: encodeMessageCostInitSetBasicCostCallData(init, maxLength),
});

export const encodeMessageCostInitSetBasicCostCallData = (init: MessageContentLimitsInit, maxLength: BigNumberish) =>
  init.interface.encodeFunctionData('setMaxContentLength', [maxLength]);
