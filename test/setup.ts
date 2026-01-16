import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
    store: {} as Record<string, string>,
    getItem: function (key: string) {
        return this.store[key] || null;
    },
    setItem: function (key: string, value: string) {
        this.store[key] = value;
    },
    removeItem: function (key: string) {
        delete this.store[key];
    },
    clear: function () {
        this.store = {};
    },
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Reset localStorage before each test
beforeEach(() => {
    localStorageMock.clear();
});
