/* eslint-disable import/no-extraneous-dependencies */
// Modules to control application life and create native browser window
const {
  OAuth2Client,
} = require('google-auth-library');
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
} = require('electron');
const path = require('path');
const fs = require('fs');
const {
  google,
} = require('googleapis');
const electron = require('electron');
const {
  OAUTH_CLIENT,
} = require('./render/js/secrets.js');
const properties = require('./common/properties');
const ipfs = require('./watcher/ipfs');
const userStore = require('./service/UserStore');
const consumer = require('./amqp/consumer');

// Enable live reload for all the files inside your project directory
// require('electron-reload')(__dirname);
// Enable live reload for Electron too
// require('electron-reload')(__dirname, {
//   electron: require(`${__dirname}/node_modules/electron`),
// });
require('dotenv').config({
  path: `./.env.${process.env.NODE_ENV}`,
});

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let trayWindow;
let tray;
let win = null;
let winShowContent = null;
let winShowText = null;
let winEdit = null;
let winShowVer = null;
let winLogout = null;
let winShare = null;
let winShowContentVer = null;
let watcher;

/**
 * Initialize OAuth client with secret values.
 */
const initOAuthClient = () => new OAuth2Client({
  clientId: OAUTH_CLIENT.client_id,
  clientSecret: OAUTH_CLIENT.client_secret,
  redirectUri: 'urn:ietf:wg:oauth:2.0:oob',
});

/**
 * This method opens a new window to let users log-in the OAuth provider service,
 * grant permissions to OAuth client service (this application),
 * and returns OAuth code which can be exchanged for the real API access keys.
 *
 * @param {*} interactionWindow a window in which the user will have interaction with OAuth provider service.
 * @param {*} authPageURL an URL of OAuth provider service, which will ask the user grants permission to us.
 * @returns {Promise<string>}
 */
const getOAuthCodeByInteraction = (interactionWindow, authPageURL) => {
  interactionWindow.loadURL(authPageURL);
  return new Promise((resolve, reject) => {
    const onclosed = () => {
      reject('Interaction ended intentionally ;(');
    };
    interactionWindow.on('closed', onclosed);
    interactionWindow.on('page-title-updated', (ev) => {
      const url = new URL(ev.sender.getURL());
      if (url.searchParams.get('approvalCode')) {
        interactionWindow.removeListener('closed', onclosed);
        interactionWindow.close();
        return resolve(url.searchParams.get('approvalCode'));
      }
      if ((url.searchParams.get('response') || '').startsWith('error=')) {
        interactionWindow.removeListener('closed', onclosed);
        interactionWindow.close();
        return reject(url.searchParams.get('response'));
      }
    });
  });
};

function createWindow() {
  // init main window
  mainWindow = new BrowserWindow({
    title: 'Login with Google',
    width: 1400,
    height: 1100,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('./render/index.html');

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // create window show file's info
  win = new BrowserWindow({
    title: "File's Information",
    width: 500,
    height: 200,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile('./render/fileinfo.html');

  // create window to show file content
  winShowContent = new BrowserWindow({
    title: ' File',
    width: 800,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  winShowContent.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      winShowContent.hide();
      winShowContent.reload();
    }
  });
  winShowContent.loadFile('./showpdf/index.html');
  // create window to show text
  winShowText = new BrowserWindow({
    title: "Text File's Content",
    width: 800,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  winShowText.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      winShowText.hide();
      winShowText.reload();
    }
  });
  // winShowText.setMenuBarVisibility(false);
  winShowText.loadFile('./render/filetext.html');
  // create window to edit file
  winEdit = new BrowserWindow({
    title: 'Edit File',
    width: 800,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  winEdit.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      winEdit.hide();
      winEdit.reload();
    }
  });
  // winEdit.setMenuBarVisibility(false);
  winEdit.loadFile('./render/editfile.html');

  // create window to share
  winShare = new BrowserWindow({
    title: 'Share File',
    width: 700,
    height: 400,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  winShare.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      winShare.hide();
      winShare.reload();
    }
  });
  // winEdit.setMenuBarVisibility(false);
  winShare.loadFile('./render/sharefile.html');

  winShowVer = new BrowserWindow({
    title: " File's Version",
    width: 800,
    height: 500,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  winShowVer.loadFile('./render/showversion.html');
  winShowVer.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      winShowVer.hide();
      winShowVer.reload();
    }
    return false;
  });

  // create window to show file ver
  winShowContentVer = new BrowserWindow({
    title: "File's Content  Pre-Version",
    width: 800,
    height: 400,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  winShowContentVer.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      winShowContentVer.hide();
      winShowContentVer.reload();
    }
  });
  // winShowText.setMenuBarVisibility(false);
  winShowContentVer.loadFile('./render/filetextversion.html');

  // log out window
  winLogout = new BrowserWindow({
    title: 'Logout',
    width: 800,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // winLogout.setMenuBarVisibility(false);
  winLogout.loadFile('./render/logout.html');
  winLogout.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      winLogout.hide();
      winLogout.reload();
    }
  });


  // ipcMain login
  ipcMain.on('auth-start', async () => {
    // 0) Initialize OAuth Client
    const client = initOAuthClient();
    const url = client.generateAuthUrl({
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
    // 1) Create another window and get code.
    const auth = new BrowserWindow({
      x: 60,
      y: 60,
      useContentSize: true,
    });
    auth.on('close', (event) => {
      if (!app.isQuiting) {
        event.preventDefault();
        auth.hide();
        mainWindow.reload();
      }
    });
    const code = await getOAuthCodeByInteraction(auth, url);
    // 2) Exchange OAuth code for tokens.
    const response = await client.getToken(code);
    // console.log(response.tokens.access_token);
    // 3) Notify top window auth-success with tokens.
    mainWindow.send('auth-success', response.tokens);
    // 4) Get userprofile from google
    const {
      OAuth2,
    } = google.auth;
    const oauth2Client = new OAuth2();
    oauth2Client.setCredentials(response.tokens);
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    oauth2.userinfo.get(async (err, res) => {
      if (err) {
        console.log(err);
      } else {
        userStore.addUser(res.data);
        await userStore.setActiveUser(res.data.email);
        mainWindow.loadFile('./render/homepage.html');
        // can use session storage
        // await sessionStorage.setItem('activeEmail', res.data.email);
        // create user folder
        const userFolder = path.join(properties.defaultDir, res.data.email);
        await fs.exists(userFolder, (isExist) => {
          if (!isExist) {
            fs.mkdirSync(userFolder);
          }
        });
        await ipfs.start();
        consumer.amqpStart();
      }
    });
  });
}

ipcMain.on('new-file', (event, arg) => {
  console.log('IPC Main: ', arg);
  ipfs.pushFileToIPFS(arg);
});

// ipcmain on function from ipc render
ipcMain.on('makeWindow', (event, arg) => {
  win.webContents.send('file-info', arg);
  win.show();
});

ipcMain.on('show-other-file', (event, arg, arg2) => {
  winShowContent.webContents.send('other-file', arg, arg2);
  winShowContent.show();
});
ipcMain.on('make-text-window', (event, arg, arg2) => {
  winShowText.webContents.send('file-data2', arg, arg2);
  winShowText.show();
});

ipcMain.on('get-edit-file', (event, filestring, filename) => {
  winEdit.webContents.send('send-file-content', filestring, filename);
  winShowText.close();
  winEdit.show();
});

ipcMain.on('show-file-version', (event, file, fileversion) => {
  winShowVer.webContents.send('file-version', file, fileversion);
  winShowVer.show();
});
ipcMain.on('file-version-content', (event, ver_cid) => {
  winShowContentVer.webContents.send('show-file-version', (event, ver_cid));
  winShowContentVer.show();
});

ipcMain.on('show-share-file', (event, file) => {
  winShare.webContents.send('share-file', file);
  winShare.show();
});
ipcMain.on('reload-page', () => {
  setTimeout(() => {
    mainWindow.reload();
  }, 1000);
});
ipcMain.on('close-share-window', () => {
  winShare.close();
});
ipcMain.on('log-out', () => {
  winLogout.webContents.send('log-out-noti');
  // cach 1 : khi dang xuat phai ctrl+c no moi thoat app =))
  userStore.deleteActiveUser();

  console.log('logout');
  app.relaunch();
  // if (watcher) {
  //   watcher.stop();
  // }
  // TODO: delete user file
  // fs.unlinkSync(path.join(properties.saveZipFolder, 'users.json'));
  app.quit();
  setTimeout(() => {
    app.isQuiting = true;
    // if (watcher) {
    //   watcher.stop();
    // }
    if (ipfs) {
      ipfs.stop();
    }
    // TODO: delete user file
    // fs.unlinkSync(path.join(properties.saveZipFolder, 'users.json'));
    app.quit();
  }, 3000);


  // cach 3 :
  // mainWindow.close();
  // createWindow();
});

const createTrayWindow = () => {
  trayWindow = new BrowserWindow({
    width: 350,
    height: 550,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: false,
    webPreferences: {
      backgroundThrottling: false,
    },
  });

  trayWindow.loadFile('./render/traywindow.html');

  // Hide the window when it loses focus
  trayWindow.on('blur', () => {
    if (!trayWindow.webContents.isDevToolsOpened()) {
      trayWindow.hide();
    }
  });
};

// Get location of trayicon
const getWindowPosition = () => {
  const windowBounds = trayWindow.getBounds();
  const trayBounds = tray.getBounds();
  // Center window horizontally above the tray icon
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2 - 15,
  );
  // Position window (560-550) pixels vertically above the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height - 560);
  return {
    x,
    y,
  };
};

const showWindow = () => {
  const position = getWindowPosition();
  trayWindow.setPosition(position.x, position.y, false);
  trayWindow.show();
};

const toggleWindow = () => (trayWindow.isVisible() ? trayWindow.hide() : showWindow());

const createTray = () => {
  tray = new Tray(path.join('./render/assets/images/icons/appicon1.png'));
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Show App',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        // if (watcher) {
        //   watcher.stop();
        // }
        if (ipfs) {
          ipfs.stop();
        }
        // TODO: delete user file
        // fs.unlinkSync(path.join(properties.saveZipFolder, 'users.json'));
        app.quit();
      },
    },
  ]);
  tray.on('click', () => {
    toggleWindow();
  });
  tray.setToolTip('Electron.js App');
  tray.setContextMenu(contextMenu);
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createTray();
  createWindow();
  createTrayWindow();
  fs.exists(properties.defaultDir, (isExist) => {
    if (!isExist) {
      fs.mkdirSync(properties.defaultDir);
    }
  });
  fs.exists(properties.saveZipFolder, (isExist) => {
    if (!isExist) {
      fs.mkdirSync(properties.saveZipFolder);
    }
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // userStore.delete('activeEmail');
  sessionStorage.clear();
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('show-window', () => {
  showWindow();
});