const { ipcRenderer } = require('electron');
const app = require('electron').remote;

const { dialog } = app;
const fs = require('fs');

const onload = () => {
  const btn = document.getElementById('signInBtn');
  btn.addEventListener('click', (event) => {
    btn.setAttribute('disabled', true);
    ipcRenderer.send('auth-start');
  });

  ipcRenderer.on('auth-success', async (tokens) => {});
};

window.onload = onload;
