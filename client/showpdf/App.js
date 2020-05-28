(() => {
  const viewerElement = document.getElementById("viewer");
  const { ipcRenderer } = require("electron");
  ipcRenderer.on("other-file", function(event, filePath, file_name) {
    console.log(filePath);
    document.getElementById("pdf-name").innerHTML = file_name;
    window
      .WebViewer(
        {
          path: "../showpdf/lib",
          initialDoc: filePath
        },
        viewerElement
      )
      .then(instance => {
        // Interact with APIs here.
        // See https://www.pdftron.com/documentation/web/guides/basic-functionality for more info/
      });
  });
})();
