import type { AstroIntegration } from "astro";
import fs from "fs/promises";
import JSObfuscator from "javascript-obfuscator";
import { extname, join } from "path";
import { fileURLToPath } from "url";

export type AstroObfuscatorOptions = {
  obfuscator?: JSObfuscator.ObfuscatorOptions;
  excludes?: RegExp[];
  disableFilesLog?: boolean;
};

/**
 * Astro integration to obfuscate JavaScript client files using javascript-obfuscator.
 *
 * @param opts - Options for the obfuscator and file exclusions.
 * @property `opts.obfuscator` - Options for the javascript-obfuscator.
 * @property `opts.excludes` - Array of regular expressions to exclude files from obfuscation.
 * @property `opts.log` - Boolean whether to log the files being obfuscated.
 * @returns An Astro integration object.
 */
export default function obfuscator(opts?: AstroObfuscatorOptions): AstroIntegration {
  const obfuscatorOptions: JSObfuscator.ObfuscatorOptions = {
    ...JSObfuscator.getOptionsByPreset("low-obfuscation"),
    ...opts?.obfuscator,
  };

  const excludes = opts?.excludes || [];

  async function walk(dir: string, out: string[] = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) await walk(p, out);
      else if (extname(ent.name) === ".js") out.push(p);
    }
    return out;
  }

  return {
    name: "astro-obfuscator",
    hooks: {
      "astro:build:done": async ({ logger, dir }) => {
        const root = fileURLToPath(dir);

        let files = await walk(root);

        if (excludes.length > 0) {
          files = files.filter((f) => !excludes.some((re) => re.test(f)));
        }

        await Promise.all(
          files.map(async (f) => {
            const code = await fs.readFile(f, "utf8");
            const obf = JSObfuscator.obfuscate(code, obfuscatorOptions).getObfuscatedCode();
            await fs.writeFile(f, obf);

            if (!opts?.disableFilesLog) {
              const originalSize = Buffer.byteLength(code, "utf8");
              const obfuscatedSize = Buffer.byteLength(obf, "utf8");
              let sizeDiff = ((obfuscatedSize - originalSize) / obfuscatedSize) * 100;
              if (isNaN(sizeDiff) || !isFinite(sizeDiff)) {
                sizeDiff = 0;
              }

              logger.info(`\x1b[90m${f.replace(root, "")}\x1b[0m \x1b[1m\x1b[97m${sizeDiff.toFixed(1)}%\x1b[0m`);
            }
          })
        );

        logger.info(`\x1b[32m✓ ${files.length} files obfuscated.\x1b[0m`);
      },
    },
  };
}
