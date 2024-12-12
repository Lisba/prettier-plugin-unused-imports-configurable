# prettier-plugin-unused-imports-configurable

A Prettier plugin configurable to remove unused imports from JavaScript and TypeScript files specifying the folder to ignored. Useful for monorepos where different rules specifications are needed.

## Instalation

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
