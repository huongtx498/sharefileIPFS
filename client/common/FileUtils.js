const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const properties = require('./properties.js');
const cryptoConst = require('./cryptoConst');
const FileStore = require('../service/FileStore');

module.exports = {
  getPathToZip(currentPath) {
    const parentPath = path.dirname(currentPath);
    if (parentPath === properties.defaultDir) {
      return currentPath;
    }
    return this.getPathToZip(parentPath);
  },

  async encryptFile(filePath, email, fileEncryptPath) {
    const fileName = path.basename(filePath);
    const fileList = FileStore.findFileByNameAndEmail(fileName, email);
    let key;
    if (fileList != null && fileList.length > 0) {
      key = fileList[0].hash_key;
    } else {
      key = Math.random().toString(36).substring(2, 15);
    }

    const encryptKey = crypto.createHash('sha256').update(key).digest();
    const inputFile = fs.createReadStream(filePath);
    const outputFile = fs.createWriteStream(fileEncryptPath);
    try {
      await inputFile
        .pipe(crypto.createCipheriv(cryptoConst.algorithm, encryptKey, cryptoConst.iv))
        .pipe(outputFile);
    } catch (e) {
      console.log(e);
    }
    return key;
  },

  async saveToDB(file) {
    try {
      if (FileStore.findFileByNameAndEmail(file.name, file.owner).length > 0) {
        await FileStore.updateFile(file);
      } else {
        await FileStore.addFile(file);
      }
    } catch (e) {
      console.log(e);
    }
  },

  shareToUser(name, owner, user) {
    // if (FileStore.findFileByNameAndEmail(name, owner).length > 0) {
      console.log(name, owner, user);
      FileStore.shareToEmail(name, owner, user);
      FileStore.shareToEmailServer(name, owner, user);
    // }
  },

  getFileFromIPFS(file, name, saveDir) {
    try {
      const decryptKey = crypto.createHash('sha256').update(file.hash_key).digest();
      const output = fs.createWriteStream(path.format({
        dir: saveDir,
        name: path.basename(name, path.extname(name)),
        ext: path.extname(file.name),
      }));
      try {
        https.get(`https://ipfs.io/ipfs/${file.cid}`, (response) => {
        response
          .pipe(crypto.createDecipheriv(cryptoConst.algorithm, decryptKey, cryptoConst.iv))
          .pipe(output);
        });
      } catch (error) {
        console.log(error);
      }
    } catch (e) {
      console.log(e);
    }
  },
};
