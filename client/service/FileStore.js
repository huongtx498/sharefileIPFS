/* eslint-disable no-param-reassign */
const Store = require('electron-store');
const axios = require('axios');
const validator = require('../common/jsonValidator');

const fileSchema = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'The Root Schema',
  required: [
    'cid',
    'name',
    'type',
    'hash_key',
    'owner',
    'user',
  ],
  properties: {
    name: {
      $id: '#/properties/name',
      type: 'string',
      title: 'The Name Schema',
      default: '',
      examples: [''],
      pattern: '^|(.*)$',
    },
    type: {
      $id: '#/properties/type',
      type: 'string',
      title: 'The Type Schema',
      default: '',
      examples: [''],
      pattern: '^|(.*)$',
    },
    parent_folder: {
      $id: '#/properties/parent_folder',
      type: 'string',
      title: 'The Parent_folder Schema',
      default: '',
      examples: [''],
      pattern: '^|(.*)$',
    },
    hash_key: {
      $id: '#/properties/hash_key',
      type: 'string',
      title: 'The Hash_key Schema',
      default: '',
      examples: [''],
      pattern: '^|(.*)$',
    },
    owner: {
      $id: '#/properties/owner',
      type: 'string',
      title: 'The Owner Schema',
      default: '',
      examples: ['nqhung291@gmail.com'],
      pattern: '^|(.*)$',
    },
    user: {
      $id: '#/properties/user',
      type: 'array',
      title: 'The User Schema',
      items: {
        $id: '#/properties/user/items',
        type: 'object',
        title: 'The Items Schema',
        required: ['email', 'permission'],
        properties: {
          email: {
            $id: '#/properties/user/items/properties/email',
            type: 'string',
            title: 'The Email Schema',
            default: '',
            examples: [''],
            pattern: '^|(.*)$',
          },
          permission: {
            $id: '#/properties/user/items/properties/permission',
            type: 'array',
            title: 'The Permission Schema',
            items: {
              $id: '#/properties/user/items/properties/permission/items',
              type: 'string',
              title: 'The Items Schema',
              default: '',
              examples: ['read', 'write'],
              pattern: '^|(.*)$',
            },
          },
        },
      },
    },
    isDeleted: {
      $id: '#/properties/isDeleted',
      type: 'boolean',
      title: 'The Isdeleted Schema',
      default: false,
      examples: [false],
    },
  },
};

class FileStore extends Store {
  constructor(settings) {
    super(settings);
    this.files = this.get('files') || [];
  }

  saveFiles() {
    this.set('files', this.files);
    return this;
  }

  findAllFiles() {
    return this.get('files') || [];
  }

  findAllAvailableFiles(email) {
    return this.findAllFiles().filter((e) => e.owner === email && e.isDeleted === false);
  }

  findFileByNameAndEmail(name, email) {
    return this.findAllAvailableFiles(email).filter((e) => e.name === name);
  }

  findAllNewestFile(email) {
    return this.findAllAvailableFiles(email);
  }

  getFileVersionList(name, email) {
    return this.findAllAvailableFiles(email).filter((e) => e.name === name)[0].version;
  }

  findAllDeletedFile(email) {
    return this.files.filter((e) => e.owner === email && e.isDeleted === true);
  }

  findAllShareFile(email) {
    return this.files.filter(e => e.user.includes(email))
  }

  addFile(file) {
    const newFile = {
      name: file.name,
      type: file.type,
      hash_key: file.hash_key,
      version: [
        {
          cid: file.cid,
          size: file.size,
          date: new Date().toJSON(),
        },
      ],
      owner: file.owner,
      user: file.user,
      isDeleted: file.isDeleted,
    };
    this.files = [...this.files, newFile];
    console.log('New file: ', newFile);
    return this.saveFiles();
  }

  addFileSync(file) {
    file.version.map((e) => {
      e.date = new Date(e.date).toJSON();
      return e;
    });
    console.log(file);
    if (this.findFileByNameAndEmail(file.name, file.owner).length > 0) {
      this.files.forEach((element) => {
        if (element.name === file.name && element.owner === file.owner) {
          const index = this.files.indexOf(element);
          this.files[index] = file;
        }
      });
    } else {
      this.files = [...this.files, file];
    }
    return this.saveFiles();
  }

  updateFile(file) {
    const newVersion = {
      cid: file.cid,
      size: file.size,
      date: new Date().toJSON(),
    };

    this.files = this.findAllFiles().map((e) => {
      if (e.name === file.name && e.owner === file.owner) {
        e.version.push(newVersion);
      }
      return e;
    });
    console.log('Update successful');
    return this.saveFiles();
  }

  shareToEmail(name, owner, user) {
    this.files = this.findAllFiles().map((e) => {
      if (e.name === name && e.owner === owner) {
        e.user.push(user);
      }
      return e;
    });
    console.log('Update file successful');
    return this.saveFiles();
  }

  shareToEmailServer(name, owner, user) {
    try {
      return axios({
        method: 'POST',
        url: 'http://localhost:3000/api/file/share',
        params: {
          name,
          owner,
          user,
        },
      }).then((response) => response);
    } catch (e) {
      console.log(e);
      return this;
    }
  }

  deleteFile(name, email) {
    this.files = this.findAllFiles().map((e) => {
      if (e.name === name && e.owner === email) {
        e.isDeleted = true;
      }
      return e;
    });
    console.log('Deleted successful');
    return this.saveFiles();
  }

  restoreFile(name, email) {
    this.files = this.findAllFiles().map((e) => {
      if (e.name === name && e.owner === email && e.isDeleted) {
        e.isDeleted = false;
      }
      return e;
    });
    return this.saveFiles();
  }

  deleteInRB(name, email) {
    const deleteFile = this.findAllDeletedFile(email).filter((e) => e.name === name)[0];

    const position = this.files.indexOf(deleteFile);
    this.files.splice(position, 1);

    return this.saveFiles();
  }

  deleteAllRB(email) {
    const listDeletedFile = this.findAllDeletedFile(email);

    if (Array.isArray(listDeletedFile)) {
      listDeletedFile.forEach((e) => {
        const pos = this.files.indexOf(e);
        this.files.splice(pos, 1);
      });
    }
    return this.saveFiles();
  }

  isCidExist(cid) {
    console.log(this.files.some((file) => file.version.some((version) => version.cid === cid)));
    return this.files.some((file) => file.version.some((version) => version.cid === cid));
  }
  shareFile(sharedFile, sharedEmail, sharingEmail){
    this.files = this.findAllFiles().map((e) => {
      if (e.name === sharedFile.name && e.owner === sharingEmail) {
        e.user.push(sharedEmail);
        console.log(e.user);
      }
      return e;
    });
    // console.log(e.user);
    console.log('Add sharedEmail: ', sharedEmail, 'on file: ', sharedFile.name);
    return this.saveFiles();
  };

  // shareFileServer(file, userEmail, ownerEmail) {
  //   try {
  //     return axios({
  //       method: 'POST',
  //       url: 'http://localhost:3000/api/file/share',
  //       headers: { 'Content-Type': 'application/json' },
  //       data: {
  //         name: `${file.name}`,
  //         owner: ownerEmail,
  //         user: userEmail,
  //         isDeleted: false,
  //       },
  //     })
  //       .then((response) => console.log(response.statusText));
  //   } catch (error) {
  //     console.error(error);
  //     return this;
  //   }
  // }

  // request to server
  findFileByCidServer(email, cid) {
    try {
      return axios({
        method: 'GET',
        url: 'http://localhost:3000/api/file/cid',
        params: {
          email,
          cid,
        },
      })
        .then((response) => { console.log("Status: " + response.statusText); return response; });
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  findFileByNameServer(email, name) {
    try {
      return axios({
        method: 'GET',
        url: 'http://localhost:3000/api/file/name',
        params: {
          email,
          name,
        },
      })
        .then((response) => { console.log("Status: " + response.statusText); return response; });
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  getFileVersionListServer(email, name) {
    try {
      return axios({
        method: 'GET',
        url: 'http://localhost:3000/api/file/version',
        headers: { 'Content-Type': 'application/json' },
        params: {
          email,
          name,
        },
      })
        .then((response) => { console.log("Status: " + response.statusText); return response; });
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  recycleBinServer(email) {
    try {
      return axios({
        method: 'GET',
        url: 'http://localhost:3000/api/file/delete',
        params: {
          email,
        },
      })
        .then((response) => { console.log("Status: " + response.statusText); return response; });
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  fileListServer(email) {
    try {
      return axios({
        method: 'GET',
        url: 'http://localhost:3000/api/file/newest',
        params: {
          email,
        },
      })
        .then((response) => { console.log("Status: " + response.statusText); return response; });
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  createFileServer(file) {
    try {
      return axios({
        method: 'POST',
        url: 'http://localhost:3000/api/file',
        headers: { 'Content-Type': 'application/json' },
        data: {
          cid: `${file.cid}`,
          name: `${file.name}`,
          type: `${file.type}`,
          size: file.size,
          hash_key: `${file.hash_key}`,
          owner: `${file.owner}`,
          user: [],
          isDeleted: false,
        },
      })
        .then((response) => console.log(response.statusText));
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  deleteFileServer(name, email) {
    try {
      return axios({
        method: 'POST',
        url: 'http://localhost:3000/api/file/delete',
        params: {
          name,
          email,
        },
      })
        .then((response) => console.log("Status: " + response.statusText));
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  restoreFileServer(name, email) {
    try {
      return axios({
        method: 'POST',
        url: 'http://localhost:3000/api/file/recover',
        params: {
          name,
          email,
        },
      })
        .then((response) => console.log("Status: " + response.statusText));
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  deleteInRBServer(name, email) {
    try {
      return axios({
        method: 'POST',
        url: 'http://localhost:3000/api/file/remove',
        params: {
          name,
          email,
        },
      })
        .then((response) => console.log("Status: " + response.statusText));
    } catch (error) {
      console.error(error);
      return this;
    }
  }

  deleteAllRBServer(email) {
    try {
      return axios({
        method: 'POST',
        url: 'http://localhost:3000/api/file/remove-all',
        params: {
          email,
        },
      })
        .then((response) => console.log("Status: " + response.statusText));
    } catch (error) {
      console.error(error);
      return this;
    }
  }
}

const filesData = new FileStore({ name: 'files' });

module.exports = filesData;
