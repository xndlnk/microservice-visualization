# lerna cheat sheet

- add dependency to certain package: `lerna add <package-to-add> --scope=<package-where-to-add>`
- add dependency to all packages: `lerna add <package-to-add>`
- update all packages to latest version:
  - delete package in each package.json
  - run add all above
- symlink a local dependency from package B to package A:
  - cd into package A which is the package you want to use in package B
  - run `yarn link`
  - cd into the package B where you want to use package A
  - run `yarn link A`

## resources

- https://medium.com/@jsilvax/a-workflow-guide-for-lerna-with-yarn-workspaces-60f97481149d
- https://medium.com/shopback-engineering/5-tips-about-lerna-4186840093f2
- https://michalzalecki.com/solve-code-sharing-and-setup-project-with-lerna-and-monorepo/