module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/__tests__/**/*.test.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@reduxjs/toolkit|immer|react-redux|redux|redux-persist|reselect|msw|@mswjs|rettime|until-async|sonner-native))',
  ],
  collectCoverageFrom: ['src/features/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
