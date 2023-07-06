require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["custom"],
};
