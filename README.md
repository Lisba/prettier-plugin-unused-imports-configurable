# prettier-plugin-unused-imports-configurable

![npm](https://img.shields.io/npm/v/@lisba/prettier-plugin-unused-imports-configurable)
![GitHub last commit](https://img.shields.io/github/last-commit/Lisba/prettier-plugin-unused-imports-configurable)
![npm](https://img.shields.io/npm/dm/@lisba/prettier-plugin-unused-imports-configurable)
![NPM](https://img.shields.io/npm/l/@lisba/prettier-plugin-unused-imports-configurable)

A Prettier plugin configurable to remove unused imports from JavaScript and TypeScript files specifying the folder to ignored. Useful for monorepos where different rules specifications are needed.

- #### [Contents](#contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Collaborate](#collaborate)
  - [License](#license)

## Installation

npm: ```npm install --save-dev prettier-plugin-unused-imports-configurable```

pnpm: ```pnpm add -D prettier-plugin-unused-imports-configurable```

yarn: ```yarn add -D prettier-plugin-unused-imports-configurable```

## Usage

In your .prettierrc config file add the following replacing the ignoredDirectories to your needs:

```
{
  // ...other rules,
  "plugins": ["prettier-plugin-unused-imports-configurable"],
  "ignoreDirectories": ["src/specific-folder"]
}
```

## Collaborate

In order to collaborate with the proyect you need to:

1. Fork the repo.
2. Clone the repo to work locally with `git clone repo-url`.
3. Install dependencies with `yarn install`.
4. Develop suggested changes in a new branch (make sure you are using the prettier config, you can run `yarn format` or install the prettier extension if you are using vsc editor to format on save).
5. Run `yarn build` and `yarn start` to verify your changes doesn't has errors.
6. Push your changes to your repo `git push remote-repo branch-name`.
7. Make the pull request.

## License

The MIT License. Full License [here](https://github.com/Lisba/prettier-plugin-unused-imports-configurable/blob/master/LICENSE)

