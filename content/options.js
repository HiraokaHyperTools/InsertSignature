var OABEprefs = Components.classes["@mozilla.org/preferences-service;1"]
  .getService(Components.interfaces.nsIPrefBranch);
var OABEstr = Components.classes["@mozilla.org/supports-string;1"]
  .createInstance(Components.interfaces.nsISupportsString);

function onLoad() {
  var prefsService = Components.classes["@mozilla.org/preferences-service;1"].
    getService(Components.interfaces.nsIPrefService);
  var prefs = prefsService.getBranch("openattachment.extension.");
  var children = prefs.getChildList("", {});

  for (var i = 0; i < children.length; i++) {
    AppendNewItem(children[i], prefs.getStringPref(children[i]));
  }
  document.getElementById("CTDcheck").checked = OABEprefs.getBoolPref("openattachment.use_custom_temp_dir");
  try {
    document.getElementById("customTempDirPath").value = OABEprefs
      .getStringPref("openattachment.custom_temp_dir");
  }
  catch (e) { }
  document.getElementById("charset").value = OABEprefs.getCharPref("openattachment.charset");
  document.getElementById("charsetBox").checked = OABEprefs.getBoolPref("openattachment.use_charset");
}

function onClose() {
  OABEprefs.setCharPref("openattachment.system_charset", document.getElementById("charset").value);
  OABEprefs.setBoolPref("openattachment.use_custom_temp_dir", document.getElementById("CTDcheck").checked);
  OABEprefs.setBoolPref("openattachment.use_charset", document.getElementById("charsetBox").checked);

  var custDir = document.getElementById("customTempDirPath").value;
  if (custDir) {
    OABEstr = document.getElementById("customTempDirPath").value;
    OABEprefs.setStringPref("openattachment.custom_temp_dir", OABEstr);
  }
  else
    OABEprefs.deleteBranch("openattachment.custom_temp_dir");
}

function pickDir(el) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"]
    .createInstance(nsIFilePicker);
  fp.init(window, "OpenAttachmentByExtension", nsIFilePicker.modeGetFolder);
  fp.appendFilters(nsIFilePicker.filterAll);
  fp.open(function (rv) {
    if (rv == nsIFilePicker.returnOK)
      el.previousSibling.value = fp.file.path;
  });
}

function AddItem() {
  window.openDialog("newActionDialog.xul", "", "chrome,modal,centerscreen", null);
}

function AddPref(ext, com) {
  OABEstr = com;
  OABEprefs.setStringPref("openattachment.extension." + ext, OABEstr);
  AppendNewItem(ext, com);
}

function EditItem() {
  var tree = document.getElementById("tree");
  var col2 = tree.columns.getLastColumn();
  var col1 = tree.columns.getFirstColumn();
  window.openDialog("newActionDialog.xul", "", "chrome,modal,centerscreen",
    tree.view.getCellText(tree.currentIndex, col1),
    tree.view.getCellText(tree.currentIndex, col2));
}

function EditPref(ext, com) {
  OABEstr = com;
  OABEprefs.setStringPref("openattachment.extension." + ext, OABEstr);
  var tree = document.getElementById("tree");
  var col = tree.columns.getLastColumn();
  tree.view.setCellText(tree.currentIndex, col, com);
}

function RemoveItem() {
  var tree = document.getElementById("tree");
  var selItem = null;
  var items = tree.getElementsByTagName('treeitem');
  for (var i = 0; i < items.length; i++) {
    if (tree.view.getIndexOfItem(items[i]) == tree.currentIndex) {
      selItem = items[i];
      break;
    }
  }
  if (selItem) {
    var ext = tree.view.getCellText(tree.currentIndex, tree.columns.getFirstColumn());
    OABEprefs.deleteBranch("openattachment.extension." + ext);
    document.getElementById("list").removeChild(selItem);
  }
}

function AppendNewItem(label1, label2) {
  var list = document.getElementById("list");
  var item = document.createXULElement("treeitem");
  var row = document.createXULElement("treerow");
  var cell1 = document.createXULElement("treecell");
  var cell2 = document.createXULElement("treecell");
  cell1.setAttribute("label", label1);
  cell2.setAttribute("label", label2);
  row.appendChild(cell1);
  row.appendChild(cell2);
  item.appendChild(row);
  list.appendChild(item);
}

window.addEventListener("DOMContentLoaded", function () {
  onLoad();
});

document.addEventListener("dialogaccept", function (event) {
  onClose();
});
