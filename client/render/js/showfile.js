const { ipcRenderer } = require('electron');

window.onload = () => {
  ipcRenderer.on('file-info', (event, data) => {
    document.getElementById('file-cid').innerHTML = data.cid;
    document.getElementById('file-name-info').innerHTML = data.name;
    document.getElementById('file-type-info').innerHTML = data.type;
    document.getElementById('file-size-info').innerHTML = `${Math.ceil(data.size / 1024).toLocaleString()} kb`;
    document.getElementById('file-hashkey').innerHTML = data.hash_key;
    document.getElementById('file-previous').innerHTML = data.previous_cid;
    document.getElementById('file-owner').innerHTML = data.owner;
  });
};
