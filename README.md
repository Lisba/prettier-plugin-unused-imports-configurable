# prettier-plugin-unused-imports-configurable

![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/prettier-plugin-unused-imports-configurable)
![GitHub last commit](https://img.shields.io/github/last-commit/Lisba/prettier-plugin-unused-imports-configurable)
![npm](https://img.shields.io/npm/dm/@lisba/prettier-plugin-unused-imports-configurable)
![NPM License](https://img.shields.io/npm/l/prettier-plugin-unused-imports-configurable)

A Prettier plugin configurable to remove unused imports from JavaScript and TypeScript files specifying the folder to ignored. Useful for monorepos where different rules specifications are needed.

- [Content]()
  - [Installation](#installation)
  - [Usage](#usage)
  - [Collaborate](#collaborate)
  - [License](#license)

## Installation

npm: `npm install --save-dev prettier-plugin-unused-imports-configurable`

pnpm: `pnpm add -D prettier-plugin-unused-imports-configurable`

yarn: `yarn add -D prettier-plugin-unused-imports-configurable`

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

In order to collaborate with the project you should:

1. Fork the repo.
2. Clone the repo to work locally with `git clone repo-url`.
3. Install dependencies with `pnpm install`.
4. Develop suggested changes in a new branch (make sure you are using the prettier config, you can run `pnpm format` or install the prettier extension if you are using vsc editor to format on save).
5. Run `pnpm test` to verify your changes doesn't has main errors.
6. Push your changes to your repo `git push [remote-repo-alias] [branch-name]`.
7. Make a pull request to the original repo.

NOTE: To make sure your changes behave as expected it is recommended to install the plugin in another project throught pmpn link. With pnpm you only need to `pnpm add -D local/path-to/your-folder/prettier-plugin-unused-imports-configurable` and that would be enought to use your local version of the plugin in your consumer project. You can check it looking inside the node_modules folder as any other package or running the commnad `ls -l node_modules/prettier-plugin-unused-imports-configurable` with a response similar yo `prettier-plugin-unused-imports-configurable -> ~/Path-to/your-local-folder/prettier-plugin-unused-imports-configurable`.

## License

The MIT License. Full License [here](https://github.com/Lisba/prettier-plugin-unused-imports-configurable/blob/master/LICENSE)
