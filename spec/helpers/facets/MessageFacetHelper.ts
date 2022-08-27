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

import { buildDiamondFacetCut } from '@paypr/ethereum-contracts/dist/src/contracts/diamonds';
import { Contract, Signer } from 'ethers';
import { IMessage__factory, MessageFacet__factory } from '../../../types/contracts';
import { INITIALIZER } from '../Accounts';
import { combineExtensibleDiamondOptions, createDiamond, ExtensibleDiamondOptions } from '../DiamondHelper';
import { buildERC721Additions } from './ERC721FacetHelper';

export const asMessage = (contract: Contract, signer: Signer = INITIALIZER) =>
  IMessage__factory.connect(contract.address, signer);

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

export const deployMessageFacet = () => new MessageFacet__factory(INITIALIZER).deploy();
