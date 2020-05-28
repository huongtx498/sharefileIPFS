/* eslint-disable no-param-reassign */
const Store = require('electron-store');
const validator = require('../common/jsonValidator');

const userSchema = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'The Root Schema',
  required: [
    'id',
    'email',
    'verified_email',
    'name',
    'given_name',
    'family_name',
    'picture',
    'locale',
  ],
  properties: {
    id: {
      $id: '#/properties/id',
      type: 'string',
      title: 'The Id Schema',
      default: '',
      examples: [
        '109453103937703390590',
      ],
      pattern: '^(.*)$',
    },
    email: {
      $id: '#/properties/email',
      type: 'string',
      title: 'The Email Schema',
      default: '',
      examples: [
        'nqhung291@gmail.com',
      ],
      pattern: '^(.*)$',
    },
    verified_email: {
      $id: '#/properties/verified_email',
      type: 'boolean',
      title: 'The Verified_email Schema',
      default: false,
      examples: [
        true,
      ],
    },
    name: {
      $id: '#/properties/name',
      type: 'string',
      title: 'The Name Schema',
      default: '',
      examples: [
        'Hưng Nguyễn Quang',
      ],
      pattern: '^(.*)$',
    },
    given_name: {
      $id: '#/properties/given_name',
      type: 'string',
      title: 'The Given_name Schema',
      default: '',
      examples: [
        'Hưng',
      ],
      pattern: '^(.*)$',
    },
    family_name: {
      $id: '#/properties/family_name',
      type: 'string',
      title: 'The Family_name Schema',
      default: '',
      examples: [
        'Nguyễn Quang',
      ],
      pattern: '^(.*)$',
    },
    picture: {
      $id: '#/properties/picture',
      type: 'string',
      title: 'The Picture Schema',
      default: '',
      examples: [
        'https://lh3.googleusercontent.com/a-/AAuE7mBnYvdcbKN4a4-4g4dIAzqsScYmKaYNMPAnU68lBA',
      ],
      pattern: '^(.*)$',
    },
    locale: {
      $id: '#/properties/locale',
      type: 'string',
      title: 'The Locale Schema',
      default: '',
      examples: [
        'vi',
      ],
      pattern: '^(.*)$',
    },
  },
};

class UserStore extends Store {
  constructor(settings) {
    super(settings);
    this.users = this.get('users') || [];
  }

  saveUsers() {
    this.set('users', this.users);
    return this;
  }

  getUsers() {
    return this.get('users') || [];
  }

  findUserByEmail(email) {
    const userList = this.getUsers();
    return userList.filter((e) => e.email === email);
  }

  addUser(user) {
    if (!validator.validate(user, userSchema)) {
      console.log('Error validator');
      return null;
    }
    if (this.getUsers().filter((e) => (e.email === user.email)).length > 0) {
      console.log('Email existed');
      return null;
    }
    user.created_date = new Date().toJSON();
    user.updated_date = new Date().toJSON();
    this.users = [...this.users, user];
    return this.saveUsers();
  }

  deleteUser(user) {
    this.users = this.users.filter((t) => t !== user);
    return this.saveUsers();
  }

  setActiveUser(email) {
    this.set('activeEmail', email);
    return this.saveUsers();
  }

  getActiveUser() {
    return this.get('activeEmail');
  }
  deleteActiveUser() {
    this.set('activeEmail', '');
    return this.saveUsers();
  }
}

const usersData = new UserStore({
  name: 'users'
});

module.exports = usersData;