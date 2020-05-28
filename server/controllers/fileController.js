const File = require('../models/file');
const producer = require('../amqp/producer');

exports.addFile = async function (req, res) {
  const fileList = await File.findFileByNameAndEmail(req.body.name, req.body.owner);
  // todo: add amqp here
  // if file is existed, update
  if (Array.isArray(fileList) && fileList.length) {
    const newVersion = {
      cid: req.body.cid,
      size: req.body.size,
    };
    const updatedFile = await File.updateFile(req.body.name, req.body.owner, newVersion);
    res.send(updatedFile);
    producer.syncFile(req.body.owner, updatedFile);
    // add to queue
    return;
  }
  // create new file
  const newFile = {
    name: req.body.name,
    type: req.body.type,
    hash_key: req.body.hash_key,
    version: [
      {
        cid: req.body.cid,
        size: req.body.size,
        date: Date.now(),
      },
    ],
    owner: req.body.owner,
    user: req.body.user,
    isDeleted: false,
  };
  const file = new File(newFile);
  file
    .save()
    .then(() => {
      res.status(200).send({ message: 'Success' });
      producer.syncFile(req.body.owner, newFile);
    })
    .catch((e) => {
      console.log(e);
      res.send(e);
    });
};

exports.getFileByEmail = async function (req, res) {
  try {
    const result = await File.findFileByEmail(req.query.email);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

exports.getFileByCidAndEmail = async function (req, res) {
  try {
    const result = await File.findFileByCidAndEmail(req.query.cid, req.query.email);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

exports.getFileByNameAndEmail = async function (req, res) {
  try {
    const result = await File.findFileByNameAndEmail(req.query.name, req.query.email);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

exports.getAllNewestFile = async function (req, res) {
  try {
    const availableFile = await File.findAllAvailableFile(req.query.email);
    res.send(availableFile);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

exports.getFileVersionList = async function (req, res) {
  try {
    const file = await File.findFileByNameAndEmail(req.query.name, req.query.email);
    console.log(file);
    if (file) {
      res.send(file[0].version);
    }
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

exports.getAllDeletedFile = async function (req, res) {
  try {
    const result = await File.getAllDeletedFile(req.query.email);
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

exports.deleteFileByName = async function (req, res) {
  try {
    const result = await File.deleteFileByName(req.query.name, req.query.email);
    res.status(200).send(result);
    // console.log(req.query);
    const fileJSON = findFileByNameAndEmail(req.query.name, req.query.email);
    producer.syncDelFile(req.query.email, fileJSON);
  } catch (e) {
    console.log(e);
  }
};

exports.shareFile = async function (req, res) {
  try {
    const result = await File.shareFile(req.query.name, req.query.user, req.query.owner);
    res.status(200).send(result);
    // console.log(req.query);
    // const fileJSON = findFileByNameAndEmail(req.query.name, req.query.owner);
    producer.syncFile(req.query.email, result);
  } catch (e) {
    console.log(e);
  }
};

exports.recoverDeletedFile = async function (req, res) {
  try {
    const result = await File.restoreDeleteFile(req.query.name, req.query.email);
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
  }
};

exports.removeDeletedFileByName = async function (req, res) {
  try {
    await File.removeDeletedFile(req.query.name, req.query.email);
    res.status(200).send({ message: 'Success' });
  } catch (e) {
    console.log(e);
  }
};

exports.removeAllDeletedFile = async function (req, res) {
  try {
    await File.removeAllDeletedFile(req.query.email);
    res.status(200).send({ message: 'Success' });
  } catch (e) {
    console.log(e);
  }
};
