const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const lispCode = fs.readFileSync(
  path.join(__dirname, "../elisp/server.el"),
  "utf8"
);

// Create virtual module for the build
const virtualModule = {
  name: "lisp-code",
  setup(build) {
    build.onResolve({ filter: /^@virtual-lisp-code$/ }, () => {
      return { namespace: "virtual-lisp", path: "@virtual-lisp-code" };
    });
    build.onLoad({ filter: /.*/, namespace: "virtual-lisp" }, () => {
      return {
        contents: `export const serverLispCode = ${JSON.stringify(lispCode)};`,
        loader: "js",
      };
    });
  },
};

esbuild
  .build({
    entryPoints: [path.join(__dirname, "../src/emacsServer.js")],
    bundle: true,
    outfile: path.join(__dirname, "../dist/index.js"),
    format: "esm",
    platform: "node",
    target: "node14",
    plugins: [virtualModule],
    external: ["winston"],
  })
  .catch(() => process.exit(1));
