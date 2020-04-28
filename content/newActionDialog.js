function onLoad() {
  if (window.arguments[0]) {
    document.getElementById("extNotes").setAttribute("collapsed", "true");
    document.getElementById("ext").value = window.arguments[0];
    document.getElementById("ext").setAttribute("readonly", "true");
    document.getElementById("com").value = window.arguments[1];
    document.getElementById("com").focus();
  }
}

function Callback() {
  if (window.arguments[0])
    opener.EditPref(document.getElementById("ext").value, document.getElementById("com").value);
  else
    opener.AddPref(document.getElementById("ext").value, document.getElementById("com").value);
}

function pickFile(el) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"]
    .createInstance(nsIFilePicker);
  fp.init(window, "OpenAttachmentByExtension", nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterAll);
  fp.open(function (rv) {
    if (rv == nsIFilePicker.returnOK)
      el.previousSibling.value = fp.file.path;
  });
}

window.addEventListener("DOMContentLoaded", function () {
  onLoad();
});

document.addEventListener("dialogaccept", function (event) {
  Callback();
});
