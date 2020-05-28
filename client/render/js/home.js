document.getElementById("logout").addEventListener("click", function() {
  window.location = "https://mail.google.com/mail/u/0/?logout&hl=en";
  window.open("./logout.html");
  var homewin = window.parent;
  module.exports = { homewin };
});
