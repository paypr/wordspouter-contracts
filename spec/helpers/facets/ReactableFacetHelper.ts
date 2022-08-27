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
import { ILikable__factory, IReactable__factory, LikableFacet__factory } from '../../../types/contracts';
import { INITIALIZER } from '../Accounts';
import { ExtensibleDiamondOptions } from '../DiamondHelper';

export const asLikable = (contract: Contract, signer: Signer = INITIALIZER) =>
  ILikable__factory.connect(contract.address, signer);

export const asReactable = (contract: Contract, signer: Signer = INITIALIZER) =>
  IReactable__factory.connect(contract.address, signer);

export const buildLikableAdditions = async (): Promise<ExtensibleDiamondOptions> => ({
  additionalCuts: [buildDiamondFacetCut(await deployLikableFacet())],
  additionalInits: [],
});

export const deployLikableFacet = () => new LikableFacet__factory(INITIALIZER).deploy();
