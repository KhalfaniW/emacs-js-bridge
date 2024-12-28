const net = require("net");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const path = require("path");
const fs = require("fs");
const os = require("os");
const logger = require("./logger");

export class EmacsServer {
  constructor(port = 5999) {
    this.lispCode = fs.readFileSync(
      path.join(__dirname, "../elisp/server.el"),
      "utf8",
    );
    this.port = port;
    this.client = new net.Socket();
    this.tempFilePath = null;
  }

  async writeTempFile() {
    this.tempFilePath = path.join(os.tmpdir(), `emacs-server-${Date.now()}.el`);
    await fs.promises.writeFile(this.tempFilePath, this.lispCode, "utf8");
    logger.debug(`Written temp file: ${this.tempFilePath}`);
  }

  async startServer() {
    await this.writeTempFile();
    logger.info(`Starting Emacs server with temp file: ${this.tempFilePath}`);
    execAsync(`emacs -Q -l ${this.tempFilePath}`);

    return new Promise((resolve, reject) => {
      const retryInterval = 500;
      const timeout = 5000;
      let elapsedTime = 0;

      const intervalId = setInterval(() => {
        if (elapsedTime >= timeout) {
          clearInterval(intervalId);
          logger.error("Connection attempt timed out");
          reject(new Error("Connection timed out"));
          return;
        }

        this.client.connect(this.port, "localhost", async () => {
          logger.info("Connected to Emacs server");
          await fs.promises.unlink(this.tempFilePath);
          logger.debug(`Removed temp file: ${this.tempFilePath}`);
          clearInterval(intervalId);
          resolve();
        });

        this.client.on("error", (error) => {
          logger.error(`Connection error: ${error.message}`);
        });

        elapsedTime += retryInterval;
      }, retryInterval);
    });
  }

  connectAndEvaluate(lispFunction) {
    return new Promise((resolve, reject) => {
      this.client.on("data", (data) => {
        logger.debug(`Received data from Emacs: ${data.toString()}`);
        resolve(data.toString());
      });

      this.client.on("close", () => {
        logger.info("Connection closed");
        reject(new Error("Connection closed prematurely"));
      });

      this.client.on("error", (error) => {
        logger.error(`Client error: ${error.message}`);
        reject(error);
      });

      logger.debug(`Sending to Emacs: ${lispFunction}`);
      this.client.write(lispFunction);
    });
  }

  closeEmacs() {
    return new Promise((resolve) => {
      logger.info("Closing Emacs connection");
      this.client.write("(kill-emacs)");
      this.client.destroy();
      resolve();
    });
  }
}
