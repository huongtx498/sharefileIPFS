const {
  ipcRenderer,
} = require('electron');
const fs = require('fs');
const activeUser = require('../service/UserStore.js');

const email = activeUser.get('activeEmail');
const userInfo = activeUser.findUserByEmail(email)[0];
const fileData = require('../service/FileStore.js');

const fileList = fileData.findAllNewestFile(email);
let html = '';
const user = process.env.USER || '';

window.onload = () => {
  // get List Files
  let type = '';
  let file_type = '';
  fileList.forEach((file) => {
    if (file.type === '.txt') {
      type = 'file';
      file_type = ' text';
    } else if (file.type === '.pdf') {
      type = 'file-pdf';
      file_type = 'pdf';
    } else if (file.type === '.xlsx') {
      type = 'file-excel';
      file_type = 'excel';
    } else if (file.type === '.pptx' || file.type === 'pptm') {
      type = 'file-powerpoint';
      file_type = 'powerpoint';
    } else if (
      file.type === '.doc' ||
      file.type === '.docx' ||
      file.type === '.dotx'
    ) {
      type = 'file-word';
      file_type = 'word';
    } else if (
      file.type === '.zip' ||
      file.type === '.tar' ||
      file.type === '.rar'
    ) {
      type = 'file-archive';
      file_type = 'archive';
    } else if (
      file.type === '.jpg' ||
      file.type === '.jpe' ||
      file.type === '.png'
    ) {
      type = 'file-image';
      file_type = 'image';
    } else {
      type = 'file-alt';
      file_type = 'other';
    }
    // size file
    const size = Math.ceil(file.version[file.version.length - 1].size / 1024);

    html += '<tr class="item">';
    html += `<th><div id="file-name-${file.version[file.version.length - 1].cid}"`;
    html += ` title="See File's Information" style="color: blue">
  <i class="far fa-${type} mr-2 blue-text" aria-hidden="true"></i>${file.name}</div></th>`;
    html += `<td>${new Date(file.version[file.version.length - 1].date).toLocaleString(undefined, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}</td>`;
    html += `<td>${file_type}</td>`;
    html += `<td>${size.toLocaleString()}</td>`;
    html += '<td><ul class="navbar-nav align-items-center">';
    html += '<li class="nav-item dropdown ">';
    html += '<a href="#" data-toggle="dropdown">';
    html += '<div class="media align-items-center">';
    html += '<span><i class="material-icons">more_vert</i></span>';
    html += '</div></a>';
    html
      += ' <div class="dropdown-menu dropdown-menu-arrow dropdown-menu-center ">';
    html += '<a href="#" class="dropdown-item" id="';
    html += `${file.version[file.version.length - 1].cid}">`;
    html
      += '<i class="material-icons" style="font-size:18px">info</i>';
    html += '<span>Information</span>';
    html += '</a>';
    html += `<a href="#" id="recent-${file.version[file.version.length - 1].cid}" class="dropdown-item">`;
    html += '<i class="material-icons" style="font-size:18px">restore</i>';
    html += '<span>See Recent</span>';
    html += '</a>';
    html += `<a href="#" id="delete-${file.version[file.version.length - 1].cid}" class="dropdown-item">`;
    html += '<i class="material-icons" style="font-size:18px">delete</i>';
    html += '<span>Move to Trash</span></a>';
    html += `<a href="#" id="share-${file.version[file.version.length - 1].cid}" class="dropdown-item">`;
    html += '<i class="material-icons" style="font-size:18px">share</i>';
    html += '<span>Share</span></a>';
    html += '</div></li></ul></td>';
    html += '</tr>';
    document.getElementById('put-list-here').innerHTML = html;
  });


  fileList.forEach((file) => {
    // get and send image/text-file's path to main
    document
      .getElementById(`file-name-${file.version[file.version.length - 1].cid}`)
      .addEventListener('click', () => {
        const filePath = `/home/${user}/ipfsbox/${userStore.getActiveUser()}/${file.name}`;
        if (file.type === '.txt') {
          fs.readFile(filePath, (error, data) => {
            if (error) throw error;
            const filestring = data.toString();
            ipcRenderer.send('make-text-window', filestring, file.name);
          });
        } else {
          ipcRenderer.send('show-other-file', filePath, file.name);
        }
      });
    // send file's info from database to list file
    document.getElementById(file.version[file.version.length - 1].cid).addEventListener('click', () => {
      let precid = null;
      if (file.version.length > 1) precid = file.version[file.version.length - 2].cid;
      const data = {
        cid: file.version[file.version.length - 1].cid,
        name: file.name,
        type: file.type,
        size: file.version[file.version.length - 1].size,
        hash_key: file.hash_key,
        previous_cid: precid,
        owner: file.owner,
      };
      ipcRenderer.send('makeWindow', data);
    });

    // share file
    document
      .getElementById(`share-${file.version[file.version.length - 1].cid}`)
      .addEventListener('click', () => {
        ipcRenderer.send('show-share-file', file);
      });

    // see version of file
    document
      .getElementById(`recent-${file.version[file.version.length - 1].cid}`)
      .addEventListener('click', () => {
        const fileversion = fileData.getFileVersionList(file.name, email);
        ipcRenderer.send('show-file-version', file, fileversion);
      });
    // move file to trash
    document
      .getElementById(`delete-${file.version[file.version.length - 1].cid}`)
      .addEventListener('click', () => {
        Swal.fire({
          title: 'Are you sure?',
          text: 'You can be able to revert this!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes',
        }).then((result) => {
          if (result.value) {
            fileData.deleteFile(file.name, email);
            fileData.deleteFileServer(file.name, email);
            Swal.fire({
              title: 'Move successfully!',
              icon: 'success',
            }).then((result2) => {
              if (result2.value) {
                location.reload();
              }
            });
          }
        });
      });
  });

  // data table
  $(document).ready(() => {
    $('#my-table').DataTable({
      dom: '<"toolbar">frtip',
      pagingType: 'full',
      info: false,
      columnDefs: [{
        orderable: false,
        targets: 4,
      }],
    });
    $('.dataTables_length').addClass('bs-select');
    $('div.toolbar').html('<div style="margin-bottom:5px; margin-left:20px;"><b>LIST FILE :</b></div>');
  });

  // search input
  const oTable = $('#my-table').DataTable();
  $('#myInputTextField').keyup(function search() {
    oTable.search($(this).val()).draw();
  });
  // get Name and ava

  // console.log(userInfo);

  let htmlUser = '<span class="avatar avatar-sm rounded-circle">';
  htmlUser += '<img alt="Image placeholder" src="';
  htmlUser += userInfo.picture;
  htmlUser += '"></span>';
  htmlUser += '<div class="media-body ml-2 d-none d-lg-block">';
  htmlUser += '<span class="mb-0 text-sm  font-weight-bold">';
  htmlUser += userInfo.name;
  htmlUser += '</span></div>';
  this.document.getElementById('name-and-avatar').innerHTML = htmlUser;
  console.log(htmlUser);
};