# [astro-obfuscator](https://npmjs.org/astro-obfuscator)

This [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) allows you to obfuscates JavaScript client files using [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator).

## Installation

```bash
npm install astro-obfuscator
```

## Usage

Add the integration to your `astro.config`:

```js
import obfuscator from "astro-obfuscator";
import { defineConfig } from "astro/config";

export default defineConfig({
    integrations: [
        obfuscator(),
    ],
});
```

You may set your own obfuscator configuration:

```js
obfuscator({
    obfuscator: {
        compact: true,
        // Any javascript-obfuscator options ...
    },
}),
```

## Options

| Option            | Type              | Description                                                                                                 | Default Value                                                                                   |
|-------------------|-------------------|-------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `obfuscator`      | `object`          | Options passed directly to [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator#javascript-obfuscator-options). | [Low obfuscation, High performance](https://github.com/javascript-obfuscator/javascript-obfuscator?tab=readme-ov-file#low-obfuscation-high-performance) |
| `excludes`        | `RegExp[]`        | Array of RegExp patterns to exclude files from obfuscation.                                                 | `[]`                                                                                             |
| `disableFilesLog` | `boolean`         | Whether to disable logging of obfuscated files.                                                             | `false`                                                                                          |


## License

MIT
