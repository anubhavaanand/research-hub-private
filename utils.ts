/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Paper } from './types';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(timestamp));
};

export const MOCK_PAPERS: Paper[] = [];
