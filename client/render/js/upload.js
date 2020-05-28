const { dialog } = require('electron').remote;
const path = require('path');
const userStore = require('../service/UserStore.js');
const properties = require('../common/properties.js');
const FileUtils = require('../common/FileUtils.js');
const ipfs = require('../watcher/ipfs');
const os = require('os');

// upload file
document.getElementById('upload-file').addEventListener('click', () => {
  dialog.showOpenDialog((fileNames) => {
    if (fileNames === undefined) {
      console.log('No file selected');
    } else {
      console.log(fileNames[0]); // chosen file path( file upload) = fileNames[0]
      // const file_name = fileNames[0].substring(
      //   fileNames[0].lastIndexOf('/'),
      //   fileNames[0].length,
      // );
      const fileName = path.basename(fileNames[0]);
      console.log(fileName);
      const filePath = `${os.homedir()}/ipfsbox/${userStore.getActiveUser()}/${fileName}`;
      // destination will be created or overwritten by default.
      fs.copyFile(fileNames[0], filePath, async (err) => {
        if (err) throw err;
        ipcRenderer.send('new-file', filePath);
        Swal.fire({
          icon: 'success',
          title: 'Upload File Successful !',
        }).then((result) => {
          if (result.value) {
            setTimeout(() => {
              location.reload();
            }, 1000);
          }
        });
      });
    }
  });
});
