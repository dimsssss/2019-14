const debug = require("debug")("boost:api:ssh");
const Ssh = require("ssh2");

const SIGNAL = {
  SIGINT: "\x03",
};

class SshConnection {
  constructor() {
    this.connection = new Ssh();
    this.channel = null;

    this.isFirstMessage = true;

    this.resolvedOptions = {};
  }

  async connect(options) {
    const defaultOptions = {
      tryKeyboard: true,
      keepaliveInterval: 100 * 1000,
      keepaliveCountMax: 100,
    };

    this.resolvedOptions = { ...defaultOptions, ...options };

    this.connection.on(
      "keyboard-interactive",
      (name, instructions, lang, prompts, finish) => {
        finish([this.resolvedOptions.password]);
      }
    );

    const makeConnection = () => {
      return new Promise((resolve, reject) => {
        this.connection.on("ready", () => {
          debug(`ssh connection ready!`);

          const channel = this.makeShellChannel();

          resolve(channel);
        });

        this.connection.on("error", (err) => {
          debug(`ssh connection error : ${err}`);

          reject(err);
        });

        debug(`ssh connection start`, this.connection, this.resolvedOptions);
        this.connection.connect(this.resolvedOptions);
      });
    };

    this.channel = await makeConnection();
    return this.channel;
  }

  disconnect() {
    if (!this.channel) {
      return false;
    }
    this.channel.end();
    return true;
  }

  async makeShellChannel() {
    const makeShell = () => {
      return new Promise((resolve, reject) => {
        this.connection.shell((err, channel) => {
          if (err) {
            debug("Fail to create shell", err);
            reject(err);
          } else {
            resolve(channel);
          }
        });
      });
    };

    const channel = await makeShell();
    return channel;
  }

  sendSignal(signal) {
    const trimmed = signal.trim();

    debug(`Send signal ${trimmed}`);

    this.channel.write(trimmed);
  }

  write(str) {
    const trimmed = str.trim();
    const line = trimmed.endsWith("\n") ? trimmed : `${trimmed}\n`;

    debug(`Send shell command ${line}`);

    this.channel.write(line);
  }
}

module.exports = SshConnection;
