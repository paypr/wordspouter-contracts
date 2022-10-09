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

import { Erc165InterfaceId } from '@paypr/ethereum-contracts/dist/src/contracts/erc165';
import {
  LIKABLE_INTERFACE_ID,
  MESSAGE_CONTENT_LIMITS_INTERFACE_ID,
  MESSAGE_COST_INTERFACE_ID,
  MESSAGE_INTERFACE_ID,
  MESSAGE_REPLIES_INTERFACE_ID,
} from '../../../src/contracts/interfaces';
import { ERC165IdCalc, ERC165IdCalc__factory } from '../../../types/contracts';
import { INITIALIZER } from '../../helpers/Accounts';

export const deployERC165IdCalcContract = () => new ERC165IdCalc__factory(INITIALIZER).deploy();

type InterfaceTest = [string, Erc165InterfaceId, (ERC165IdCalc) => Promise<Erc165InterfaceId>];

const interfaceTests: InterfaceTest[] = [
  ['Likable', LIKABLE_INTERFACE_ID, (idCalc) => idCalc.calcLikableInterfaceId()],
  ['Message', MESSAGE_INTERFACE_ID, (idCalc) => idCalc.calcMessageInterfaceId()],
  [
    'MessageContentLimits',
    MESSAGE_CONTENT_LIMITS_INTERFACE_ID,
    (idCalc) => idCalc.calcMessageContentLimitsInterfaceId(),
  ],
  ['MessageCost', MESSAGE_COST_INTERFACE_ID, (idCalc) => idCalc.calcMessageCostInterfaceId()],
  ['MessageReplies', MESSAGE_REPLIES_INTERFACE_ID, (idCalc) => idCalc.calcMessageRepliesInterfaceId()],
];

describe('calculations', () => {
  test.each(interfaceTests)(
    'should match %s interface id',
    async (
      interfaceName: string,
      interfaceId: Erc165InterfaceId,
      calcInterfaceId: (idCalc: ERC165IdCalc) => Promise<Erc165InterfaceId>,
    ) => {
      const idCalc = await deployERC165IdCalcContract();

      expect<string>(await calcInterfaceId(idCalc)).toEqual(interfaceId);
    },
  );

  it('should not have any duplicates', () => {
    const interfaceIds = interfaceTests.map((it) => it[1]);
    const interfaceSet = new Set(interfaceIds);

    expect<number>(interfaceIds.length).toEqual(interfaceSet.size);
  });
});
