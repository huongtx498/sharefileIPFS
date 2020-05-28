const IPFS = require('ipfs');
const multiaddr = require('multiaddr');
const path = require('path');
const properties = require('../common/properties.js');
const FileUtils = require('../common/FileUtils');
const UserStore = require('../service/UserStore');
const FileStore = require('../service/FileStore');

class Ipfs {
  constructor() {
    this.node = null;
  }

  async start() {
    try {
      this.node = await IPFS.create();
      await properties.ipfsPeers.map((address) => multiaddr(address)).forEach(async (multiAddr) => {
        try {
          await this.node.swarm.connect(multiAddr);
          await this.node.bootstrap.add(multiAddr);
          console.log('Successfully connected: ', multiAddr.toString());
        } catch (e) {
          console.log(`Cannot connect address: ${multiAddr.toString()}`);
        }
      });
      console.log('Connected successful');
    } catch (e) {
      console.log(e);
    }
  }

  async pushFileToIPFS(filePath) {
    try {
      const fileEncryptPath = path.format({
        dir: properties.saveZipFolder,
        name: path.basename(filePath),
        ext: '.enc',
      });
      FileUtils.encryptFile(filePath, UserStore.getActiveUser(), fileEncryptPath)
        .then(async (key) => {
          try {
            const result = await this.node.addFromFs(fileEncryptPath); // push to ipfs
            const mapFile = {
              cid: result[0].hash,
              name: path.basename(result[0].path, '.enc'),
              type: path.extname(path.basename(result[0].path, '.enc')),
              size: result[0].size,
              hash_key: key,
              owner: UserStore.getActiveUser(),
              user: [],
              isDeleted: false,
            };
            FileUtils.saveToDB(mapFile); // save file to local db
            FileStore.createFileServer(mapFile);
          } catch (e) {
            console.log(e);
          }
        });
    } catch (e) {
      console.log(e);
    }
  }

  stop() {
    if (this.node) {
      this.node.stop();
      console.log('Stopped IPFS node');
    }
  }
}
const ipfs = new Ipfs();
module.exports = ipfs;
