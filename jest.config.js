module.exports = {
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['<rootDir>/tests/**/*.spec.js'],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.env.js'],
  transformIgnorePatterns: [`node_modules/(?!nanoid/)`],
}
