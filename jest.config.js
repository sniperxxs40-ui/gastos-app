/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    moduleDirectories: ['node_modules', '<rootDir>/'],

    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
    ],

    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
    ],

    coverageProvider: 'v8',
}

module.exports = config
