const fileData = require('../service/FileStore.js');
const activeUser = require('../service/UserStore.js');

const email = activeUser.get('activeEmail');
const userInfo = activeUser.findUserByEmail(email)[0];
const fileListRB = fileData.findAllDeletedFile(email);

let html = '';

window.onload = () => {
  // get List Files
  let type = '';
  fileListRB.forEach((file) => {
    if (file.type === '.txt') type = 'file';
    else if (file.type === '.pdf') type = 'file-pdf';
    else if (file.type === '.xlsx') type = 'file-excel';
    else if (file.type === '.pptx' || file.type === 'pptm') { type = 'file-powerpoint'; } else if (
      file.type === '.doc'
      || file.type === '.docx'
      || file.type === '.dotx'
    ) { type = 'file-word'; } else if (file.type === '.zip' || file.type === '.tar' || file.type === '.rar') { type = 'file-archive'; } else if (file.type === '.jpg' || file.type === '.jpe' || file.type === '.png') { type = 'file-image'; } else type = 'file-alt';
    html += '<tr>';
    html += '<th><div name="file-name"';
    html += `title="See File's Information" style="color: blue"><i class="far fa-${type} mr-2 blue-text" aria-hidden="true"></i>${file.name}</div></th>`;
    html += `<td>${new Date(file.version[file.version.length - 1].date).toLocaleString(undefined, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}</td>`;
    html += `<td>${file.type}</td>`;
    html += `<td>${Math.ceil(file.version[file.version.length - 1].size / 1024).toLocaleString()}</td>`;
    html += '<td><ul class="navbar-nav align-items-center">';
    html += '<li class="nav-item dropdown">';
    html += '<a href="#" data-toggle="dropdown">';
    html += '<div class="media align-items-center">';
    html += '<span><i class="material-icons">more_vert</i></span>';
    html += '</div></a>';
    html
      += ' <div class="dropdown-menu dropdown-menu-arrow dropdown-menu-center">';
    html += `<a href="#" id="restore-${file.version[file.version.length - 1].cid}" class="dropdown-item">`;
    html
      += '<i class="material-icons" style="font-size:18px">restore_from_trash</i>';
    html += '<span>Restore File</span>';
    html += '</a>';
    html += `<a href="#" id="delete-${file.version[file.version.length - 1].cid}" class="dropdown-item">`;
    html += '<i class="material-icons" style="font-size:18px">delete</i>';
    html += '<span>Delete File</span>';
    html += '</a>';
    html += '</div></li></ul></td>';
    html += '</tr>';
    document.getElementById('put-list-here').innerHTML = html;
  });

  fileListRB.forEach((file) => {
    document
      .getElementById(`restore-${file.version[file.version.length - 1].cid}`)
      .addEventListener('click', () => {
        fileData.restoreFileServer(file.name, email);
        fileData.restoreFile(file.name, email);
        window.location.reload(true);
      });
    document
      .getElementById(`delete-${file.version[file.version.length - 1].cid}`)
      .addEventListener('click', () => {
        fileData.deleteInRBServer(file.name, email);
        fileData.deleteInRB(file.name, email);
        window.location.reload(true);
      });
  });

  // emty trash
  document.getElementById('empty-trash').addEventListener('click', () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.value) {
        fileData.deleteAllRBServer(email);
        fileData.deleteAllRB(email);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your file has been deleted.',
          icon: 'success',
        }).then((result1) => {
          if (result1.value) {
            location.reload();
          }
        });
      }
    });
  });

  // data table
  $(document).ready(() => {
    $('#recycle-table').DataTable({
      dom: '<"toolbar">frtip',
      pagingType: 'full',
      info: false,
      columnDefs: [
        {
          orderable: false,
          targets: 4,
        },
      ],
    });
    $('.dataTables_length').addClass('bs-select');
    $('div.toolbar').html('<div style="margin-bottom:5px; margin-left:20px;"><b>TRASH LIST :</b></div>');
  });
  // search input
  const oTable = $('#recycle-table').DataTable();
  $('#search-recycle').keyup(function () {
    oTable.search($(this).val()).draw();
  });

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
