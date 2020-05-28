const activeUser = require('../service/UserStore.js');

const html = '';

window.onload = function () {
  // get Name and ava

  const email = activeUser.get('activeEmail');
  const userInfo = activeUser.findUserByEmail(email)[0];
  // name and ava first bar
  let html_user = '<span class="avatar avatar-sm rounded-circle">';
  html_user += '<img alt="Image placeholder" src="';
  html_user += userInfo.picture;
  html_user += '"></span>';
  html_user += '<div class="media-body ml-2 d-none d-lg-block">';
  html_user += '<span class="mb-0 text-sm  font-weight-bold">';
  html_user += userInfo.name;
  html_user += '</span></div>';
  const userIden = (this.document.getElementById(
    'name-and-avatar',
  ).innerHTML = html_user);

  // name at profile - right bar
  let html_user2 = '<h1>';
  html_user2 += userInfo.name;
  html_user2 += '</h1>';
  html_user2 += '<div class="h4 font-weight-300">';
  html_user2 += '<i class="ni location_pin mr-2"></i>';
  html_user2 += userInfo.email;
  html_user2 += '</div>';
  html_user2 += '<hr class="my-4" />';
  html_user2 += ' <h4>User Profile </h4>';
  const userIden2 = (this.document.getElementById(
    'user-profile',
  ).innerHTML = html_user2);
  // img profile
  let html_user3 = '<img src="';
  html_user3 += userInfo.picture;
  html_user3
    += '" class="rounded-circle" style="width : 120px ; height:120px">';
  html_user3 += '</a>';
  const userIden3 = (this.document.getElementById(
    'ava2',
  ).innerHTML = html_user3);

  // name profile left bar
  let html_user4 = ' <label class="form-control-label" for="input-username">Username</label>';
  html_user4
    += ' <input type="text" class="form-control form-control-alternative" placeholder="Username" value="';
  html_user4 += userInfo.name;
  html_user4 += '">';
  const userIden4 = (this.document.getElementById(
    'input-username',
  ).innerHTML = html_user4);

  // email profile left bar
  let html_user5 = '<label class="form-control-label" for="input-email">Email address</label>';
  html_user5
    += '<input type="text" class="form-control form-control-alternative" placeholder="Email address" value="';
  html_user5 += userInfo.email;
  html_user5 += '">';
  const userIden5 = (this.document.getElementById(
    'input-email',
  ).innerHTML = html_user5);

  // 1st name profile left bar
  let html_user6 = '<label class="form-control-label" for="input-first-name">First name</label>';
  html_user6
    += '<input type="text"  class="form-control form-control-alternative" placeholder="First name" value="';
  html_user6 += userInfo.given_name;
  html_user6 += '">';
  const userIden6 = (this.document.getElementById(
    'input-first-name',
  ).innerHTML = html_user6);

  // 1ast name profile left bar
  let html_user7 = '  <label class="form-control-label" for="input-last-name">Last name</label>';
  html_user7
    += '<input type="text"  class="form-control form-control-alternative" placeholder="Last name" value="';
  html_user7 += userInfo.family_name;
  html_user7 += '">';
  const userIden7 = (this.document.getElementById(
    'input-last-name',
  ).innerHTML = html_user7);
};
