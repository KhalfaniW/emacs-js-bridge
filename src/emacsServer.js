const net = require("net");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const path = require("path");
const fs = require("fs");
const os = require("os");
const logger = require("./logger");
const { serverLispCode } = require("@virtual-lisp-code");

export class EmacsServer {
  constructor(port = 5999) {
    this.port = port;
    this.isConnected = false;
    this.client = new net.Socket();

    this.tempFilePath = null;
  }

  async startServer() {

    this.tempFilePath = path.join(os.tmpdir(), `emacs_server_${Date.now()}.el`);
    fs.writeFileSync(this.tempFilePath, serverLispCode);
    logger.debug(`Starting Emacs server with temp file: ${this.tempFilePath}`);
    execAsync(`emacs -Q -l ${this.tempFilePath}`);


    if (this.isConnected) {
      logger.warn("Already connected to Emacs server when starting server");
      return new Promise((resolve) => resolve());
    }
    return new Promise((resolve, reject) => {
      const retryInterval = 500;
      const timeout = 3000;
      let elapsedTime = 0;

      const intervalId = setInterval(() => {
        if (elapsedTime >= timeout) {
          clearInterval(intervalId);
          logger.error("Connection attempt timed out");
          reject(new Error("Connection timed out"));
          return;
        }

        logger.debug(
          `Attempting to connect to Emacs server on port ${this.port}`,
        );
        this.client.connect(this.port, "localhost", () => {
          clearInterval(intervalId);
          if (this.isConnected) {
            logger.debug("Already connected to Emacs server trying to restart");
            return;
          }
          this.isConnected = true;
          logger.info("Connected to Emacs server");

          fs.unlinkSync(this.tempFilePath);
          resolve();
        });

        this.client.on("error", (error) => {
          if (!error.message.includes("Failed to connect")) {
            logger.error(`Connection error: ${error.message}`);
          }
        });

        elapsedTime += retryInterval;
        logger.debug(`Elapsed time: ${elapsedTime}ms`);
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
