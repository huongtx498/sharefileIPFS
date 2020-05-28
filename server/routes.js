const express = require('express');
const {
  addFile, getFileByCidAndEmail, getFileByNameAndEmail,
  getAllNewestFile, getFileVersionList,
  deleteFileByName, getAllDeletedFile,
  recoverDeletedFile, removeDeletedFileByName,
  removeAllDeletedFile, shareFile,
} = require('./controllers/fileController');

const router = express.Router();

router.route('/file/cid')
  .get(getFileByCidAndEmail);

router.route('/file/name')
  .get(getFileByNameAndEmail);

router.route('/file/newest')
  .get(getAllNewestFile);

router.route('/file/version')
  .get(getFileVersionList);

router.route('/file')
  .post(addFile);

router.route('/file/share')
  .post(shareFile);

router.route('/file/delete')
  .get(getAllDeletedFile)
  .post(deleteFileByName);

router.route('/file/recover')
  .post(recoverDeletedFile);

router.route('/file/remove')
  .post(removeDeletedFileByName);

router.route('/file/remove-all')
  .post(removeAllDeletedFile);

module.exports = router;
