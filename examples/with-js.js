const { EmacsServer } = require("../dist/index.js");

const path = require("path");

const emacsServer = new EmacsServer();

async function e(strings) {
  return await emacsServer.connectAndEvaluate(strings);
}

(async () => {
  try {
    await emacsServer.startServer();
    const xyz= '0.99'
    let result = await e(`(setq xyz ${xyz})`);

    console.log(await e("(+ 100 xyz)"));
    console.log(await e(" xyz"));

    await emacsServer.closeEmacs();
  } catch (error) {
    console.error("Error:", error);
  }
})();
