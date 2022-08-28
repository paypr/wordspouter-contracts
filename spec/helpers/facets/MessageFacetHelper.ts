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

import { buildERC721AddHooksInitFunction } from '@paypr/ethereum-contracts/dist/src/contracts/artifacts';
import { buildDiamondFacetCut } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { BigNumberish, Contract, Signer } from 'ethers';
import { buildMessageCostInitSetBasicCostFunction } from '../../../src/contracts/messages/messageCost';
import {
  BasicMessageCostERC721Hooks__factory,
  BasicMessageCostFacet__factory,
  IMessage__factory,
  IMessageCost__factory,
  MessageCostInit__factory,
  MessageFacet__factory,
} from '../../../types/contracts';
import { INITIALIZER } from '../Accounts';
import { combineExtensibleDiamondOptions, createDiamond, ExtensibleDiamondOptions } from '../DiamondHelper';
import { buildERC721Additions, deployERC721Init } from './ERC721FacetHelper';

export const asMessage = (contract: Contract, signer: Signer = INITIALIZER) =>
  IMessage__factory.connect(contract.address, signer);

export const asMessageCost = (contract: Contract, signer: Signer = INITIALIZER) =>
  IMessageCost__factory.connect(contract.address, signer);

export const createMessage = async (options: ExtensibleDiamondOptions = {}) =>
  asMessage(
    await createDiamond(
      combineExtensibleDiamondOptions(
        {
          additionalCuts: [buildDiamondFacetCut(await deployMessageFacet())],
          additionalInits: [],
        },
        combineExtensibleDiamondOptions(await buildERC721Additions(), options),
      ),
    ),
  );

export const buildMessageCostAdditions = async (cost: BigNumberish): Promise<ExtensibleDiamondOptions> => ({
  additionalCuts: [buildDiamondFacetCut(await deployBasicMessageCostFacet())],
  additionalInits: [
    buildMessageCostInitSetBasicCostFunction(await deployMessageCostInit(), cost),
    buildERC721AddHooksInitFunction(await deployERC721Init(), await deployBasicMessageCostERC721Hooks()),
  ],
});

export const deployBasicMessageCostFacet = () => new BasicMessageCostFacet__factory(INITIALIZER).deploy();
export const deployBasicMessageCostERC721Hooks = () => new BasicMessageCostERC721Hooks__factory(INITIALIZER).deploy();
export const deployMessageCostInit = () => new MessageCostInit__factory(INITIALIZER).deploy();
export const deployMessageFacet = () => new MessageFacet__factory(INITIALIZER).deploy();
