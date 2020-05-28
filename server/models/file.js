const mongoose = require('mongoose');

const { Schema } = mongoose;

// Define file schema
const FileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  hash_key: {
    type: String,
    required: true,
  },
  version: {
    type: [{
      cid: { type: String, required: true },
      size: { type: Number, required: true },
      date: { type: Date, required: true, default: Date.now() },
    }],
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  user: [String],
  isDeleted: {
    type: Boolean,
    required: true,
  },
  created_date: {
    type: Date,
    default: Date.now(),
  },
});

FileSchema.statics = {
  async findFileByCidAndEmail(cid, email) {
    let result;
    try {
      result = await this.find({ 'version.cid': cid, owner: email });
    } catch (e) {
      console.error(e);
    }
    return result;
  },

  async findFileByNameAndEmail(name, email) {
    return this.find({ name, owner: email });
  },

  async findAllVersion(name, email) {
    let result;
    try {
      result = await this.find({ name, owner: email });
    } catch (e) {
      console.error(e);
    }
    return result;
  },

  // async findAllNewestFile(email) {
  //   let result;
  //   try {
  //     result = await this.find({ owner: email });
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   return result;
  // },

  async findAllAvailableFile(email) {
    let result;
    try {
      result = await this.find({ isDeleted: false, owner: email });
    } catch (e) {
      console.log(e);
    }
    return result;
  },

  updateFile(fileName, email, newVersion) {
    return this.findOneAndUpdate(
      { name: fileName, owner: email },
      { $push: { version: newVersion } },
      { new: true },
    );
  },

  deleteFileByName(fileName, email) {
    return this.findOneAndUpdate(
      { name: fileName, owner: email },
      { isDeleted: true },
      { new: true },
    );
  },

  shareFile(fileName, userEmail, ownerEmail) {
    return this.findOneAndUpdate(
      { name: fileName, owner: ownerEmail },
      { $push: { user: userEmail } },
      { new: true },
    );
  },

  deleteFileByCid(cid, email) {
    return this.findOneAndUpdate(
      { cid, owner: email },
      { isDeleted: true },
      { new: true },
    );
  },

  restoreDeleteFile(fileName, email) {
    return this.findOneAndUpdate(
      { name: fileName, owner: email, isDeleted: true },
      { isDeleted: false },
      { new: true },
    );
  },

  findFileByEmail(email) {
    return this.find({ owner: email });
  },
  
  getAllDeletedFile(email) {
    return this.find({ owner: email, isDeleted: true });
  },

  removeDeletedFile(fileName, email) {
    return this.deleteOne({
      name: fileName,
      owner: email,
      isDeleted: true,
    }, (err) => {
      console.log(err);
    });
  },

  removeAllDeletedFile(email) {
    return this.deleteMany({
      owner: email,
      isDeleted: true,
    }, (err) => {
      console.log(err);
    });
  },
};

module.exports = mongoose.model('File', FileSchema);
