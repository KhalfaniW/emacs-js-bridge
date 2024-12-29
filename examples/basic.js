const { EmacsServer } = require("../dist/index.js");


const emacsServer = new EmacsServer();

(async () => {
  try {
    await emacsServer.startServer();
    console.log("CONNECTED");
    let result = await emacsServer.connectAndEvaluate("(+ 2 3)");
    console.log("Evaluation result:", result);

    result = await emacsServer.connectAndEvaluate("(+ 992 3)");
    console.log("Evaluation result:", result);

    await emacsServer.closeEmacs();
  } catch (error) {
    console.error("Error:", error);
  }
})();
