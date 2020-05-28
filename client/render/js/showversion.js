// const Watcher = require("../../watcher/watcher");
const path = require('path');
const fs = require('fs');
const {
  ipcRenderer
} = require('electron');
const properties = require('../common/properties.js');
// const fileData = require('../service/FileStore.js');
const FileUtils = require('../common/FileUtils.js');
const activeUser = require('../service/UserStore.js');

const email = activeUser.get('activeEmail');
// let watcher = new Watcher();
ipcRenderer.on('file-version', (event, file, fileversion) => {
  let version = '';
  let i = 0;
  document.getElementById('filename').innerHTML = file.name;
  fileversion.forEach((ver) => {
    version += '<tr>';
    version += '<th><div';
    version
      += ` title="See File's Information" style="color: blue">${i + 1}</div></th>`;
    version += `<td><div class="w3-center" id="file-${ver.cid}">${ver.cid}</div></td>`;
    version += `<td>${new Date(ver.date).toLocaleString(undefined, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}</td>`;
    version += `<td>${ver.size.toLocaleString()}</td>`;
    version += '</tr>';
    i++;
    document.getElementById('put-list-here').innerHTML = version;
  });
  fileversion.forEach((ver) => {
    document.getElementById(`file-${ver.cid}`).addEventListener('click', async () => {
      const mapFileVer = {
        name: file.name,
        cid: ver.cid,
        hash_key: file.hash_key,
      };
      const downloadDir = path.join(properties.defaultDir, email, 'backup');
      await fs.exists(downloadDir, (exists) => {
        if (!exists) {
          fs.mkdirSync(downloadDir);
        }
      });
      FileUtils.getFileFromIPFS(mapFileVer, mapFileVer.cid, downloadDir);
      // watcher.getFileFromIPFS(mapFileVer);s
      const ver_cid = ver.cid;
      ipcRenderer.send('file-version-content', (event, ver_cid));
    });
  });
});