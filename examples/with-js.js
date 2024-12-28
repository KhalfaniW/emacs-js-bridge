const { EmacsServer } = require("../src/emacsServer");
const path = require("path");

const emacsServer = new EmacsServer(path.join(__dirname, "../elisp/server.el"));

async function e(strings) {
  return await emacsServer.connectAndEvaluate(strings);
}

const xyz = 4;
const result1 = e(`(setq xyz ${xyz})`);
console.log(result1); // Output: (setq xyz 4)

(async () => {
  try {
    await emacsServer.startServer();

    let result = await e(`(setq xyz ${xyz})`);

    console.log(await e("(+ 100 xyz)"));
    console.log(await e(" xyz"));

    await emacsServer.closeEmacs();
  } catch (error) {
    console.error("Error:", error);
  }
})();
