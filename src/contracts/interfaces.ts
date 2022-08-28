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

import { toErc165InterfaceId } from '@paypr/ethereum-contracts/dist/src/contracts/erc165InterfaceIds';

export const LIKABLE_INTERFACE_ID = toErc165InterfaceId(0x8e5048a1);
export const MESSAGE_INTERFACE_ID = toErc165InterfaceId(0xbeda7a76);
export const MESSAGE_CONTENT_LIMITS_INTERFACE_ID = toErc165InterfaceId(0x3a8397fe);
export const MESSAGE_COST_INTERFACE_ID = toErc165InterfaceId(0xa4bc4be7);
