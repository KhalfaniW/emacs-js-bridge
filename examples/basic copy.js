const { EmacsServer } = require("../src/emacsServer");
const path = require("path");

const emacsServer = new EmacsServer(path.join(__dirname, "../elisp/server.el"));

(async () => {
  try {
    await emacsServer.startServer();

    let result = await emacsServer.connectAndEvaluate("(setq xyz 4)");
    console.log("Evaluation result:", result);

    result = await emacsServer.connectAndEvaluate("xyz");
    console.log("Evaluation result:", result);

    await emacsServer.closeEmacs();
  } catch (error) {
    console.error("Error:", error);
  }
})();
