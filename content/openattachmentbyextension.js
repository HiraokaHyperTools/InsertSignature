var OABEtb8;

function getCustomDir() {
  var prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefBranch);
  var customTmpDir = false;
  var tmp = false;
  var useCustomTmpDir = prefs.getBoolPref("openattachment.use_custom_temp_dir");
  if (useCustomTmpDir) {
    try {
      customTmpDir = prefs.getStringPref("openattachment.custom_temp_dir");
    }
    catch (e) { }
    if (customTmpDir) {
      if (customTmpDir.indexOf(".") != 0) {
        tmp = Components.classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsIFile);
        tmp.initWithPath(customTmpDir);
      }
      else
        tmp = returnAbsolutePath(customTmpDir);
    }
  }
  if (!tmp || !tmp.exists())
    tmp = Components.classes["@mozilla.org/file/directory_service;1"]
      .getService(Components.interfaces.nsIProperties)
      .get("TmpD", Components.interfaces.nsIFile);
  return tmp;
}

if (window.location.href == "chrome://messenger/content/messengercompose/messengercompose.xul") {
  var OpenSelectedAttachmentORIG_20110105 = OpenSelectedAttachment;
  OpenSelectedAttachment = function () {
    var bucket = document.getElementById("attachmentBucket");
    if (bucket.selectedItems.length == 1) {
      var aAttachment = bucket.getSelectedItem(0).attachment;
      var messagePrefix = /^mailbox-message:|^imap-message:|^news-message:/i;
      if (messagePrefix.test(aAttachment.url))
        var skipdefaultaction = null;
      else
        var skipdefaultaction = OABEcheckAttExt(aAttachment, null, true);
      if (!skipdefaultaction)
        OpenSelectedAttachmentORIG_20110105.apply(this, arguments);
    }
  };
}

if (window.location.href == "chrome://messenger/content/messenger.xul" || window.location.href == "chrome://messenger/content/messageWindow.xul") {
  // Overwrites the original openAttachment function
  if (typeof AttachmentInfo != "undefined") {
    var openAttachmentORIG_20090521 = AttachmentInfo.prototype.open;
    OABEtb8 = true;
  }
  else {
    OABEtb8 = false;
    var openAttachmentORIG_20090521 = openAttachment;
  }
  openAttachment = function (aAttachment) {
    if (OABEtb8)
      aAttachment = this;
    var tmp = getCustomDir();
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    var useCustomTmpDir = prefs.getBoolPref("openattachment.use_custom_temp_dir");
    var skipdefaultaction = OABEcheckAttExt(aAttachment, tmp, false);
    if (!skipdefaultaction && useCustomTmpDir && aAttachment.contentType != "message/rfc822")
      OABEopenWithCustTmp(aAttachment, tmp);
    else if (!skipdefaultaction)
      openAttachmentORIG_20090521.apply(this, arguments);
  };
  if (OABEtb8)
    AttachmentInfo.prototype.open = openAttachment;
}

function returnAbsolutePath(relative) {
  // Relative path (relative to thunedbird executable)
  var file = Components.classes["@mozilla.org/file/directory_service;1"]
    .getService(Components.interfaces.nsIProperties)
    .get("CurProcD", Components.interfaces.nsIFile);
  var absPath = relative.replace(/\\/g, "/");
  var parts = absPath.split("/");
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] == "..")
      file = file.parent;
    if (parts[i] == ".")
      continue;
    else
      file.append(parts[i]);
  }
  return file;
}

function OABEopenWithCustTmp(aAttachment, tmp) {
  var aUri = aAttachment.uri ? aAttachment.uri : aAttachment.messageUri;
  var attName = aAttachment.displayName ? aAttachment.displayName : aAttachment.name;
  var tempfile = messenger.saveAttachmentToFolder(aAttachment.contentType, aAttachment.url, encodeURIComponent(attName), aUri, tmp);
  setTimeout(OABEopenWithCustTmpDelayed, 500, tempfile, 0, false, aAttachment);
}

function OABEopenWithCustTmpDelayed(file, fileSize, checking, aAttachment) {
  if (file.fileSize != fileSize) {
    setTimeout(OABEopenWithCustTmpDelayed, 500, file, file.fileSize, false, aAttachment);
    return;
  }
  else if (!checking) {
    setTimeout(OABEopenWithCustTmpDelayed, 500, file, file.fileSize, true, aAttachment);
    return;
  }
  var io = Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var channel = io.newChannelFromURI(io.newFileURI(file));
  var loader = Components.classes["@mozilla.org/uriloader;1"]
    .getService(Components.interfaces.nsIURILoader);
  var docShell = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem);

  if (!String.trim)
    // TB2 code
    loader.openURI(channel, true, docShell);
  else {
    // TB3 code
    var OABElistener = {
      QueryInterface: function (iid) {
        if (iid.equals(Components.interfaces.nsIURIContentListener) ||
          iid.equals(Components.interfaces.nsIInterfaceRequestor) ||
          iid.equals(Components.interfaces.nsISupports))
          return this;
        throw Components.results.NS_NOINTERFACE;
      },

      onStartURIOpen: function (uri) { return; },
      doContent: function (ctype, preferred, request, handler) { return; },
      isPreferred: function (ctype, desired) { return; },
      canHandleContent: function (ctype, preferred, desired) { return false; },
      loadCookie: null,
      parentContentListener: null,
      getInterface: function (iid) {
        if (iid.equals(Components.interfaces.nsIDOMWindowInternal))
          return window;
        else
          return this.QueryInterface(iid);
      }
    }
    if (OABEtb8)
      messenger.openAttachment(aAttachment.contentType, aAttachment.url,
        encodeURIComponent(aAttachment.name),
        aAttachment.uri, aAttachment.isExternalAttachment);
    else
      loader.openURI(channel, true, OABElistener);
  }

  var delOnExit = OABEgetOnExitPref();
  if (delOnExit) {
    var extService = Components.classes['@mozilla.org/uriloader/external-helper-app-service;1']
      .getService(Components.interfaces.nsPIExternalAppLauncher)
    extService.deleteTemporaryFileOnExit(file);
  }
}

function OABEgetOnExitPref() {
  // For default values of this pref, see 
  // http://mxr.mozilla.org/comm-1.9.1/source/mozilla/toolkit/components/downloads/src/nsDownloadManager.cpp#2919
  // and http://mxr.mozilla.org/mozilla1.8/source/uriloader/exthandler/nsExternalHelperAppService.cpp#2452
  var prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefBranch);
  var os = navigator.platform.toLowerCase();
  if (os.indexOf("mac") > -1)
    var delOnExit = false;
  else
    var delOnExit = true;
  try {
    delOnExit = prefs.getBoolPref("browser.helperApps.deleteTempFileOnExit");
  }
  catch (e) { }
  return delOnExit;
}

function OABEcheckAttExt(aAttachment, temp, compose) {
  if (compose)
    var attName = aAttachment.url;
  else
    var attName = aAttachment.displayName ? aAttachment.displayName : aAttachment.name;

  if (attName == "winmail.dat")
    var ext = ".winmaildat";
  else {
    var dotpos = attName.lastIndexOf(".");
    if (dotpos > -1) {
      var ext = attName.substring(attName.lastIndexOf("."));
      ext = ext.toLowerCase();
    }
    else // If the file has no extension, we use the fake extension .@@@
      var ext = ".@@@";
  }

  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  var extpref = "openattachment.extension" + ext;
  var universal = "openattachment.extension.***";


  if (isNaN(ext) && prefs.getPrefType(extpref) == 0 && prefs.getPrefType(universal) == 0)
    return false;
  else if (!isNaN(ext)) {
    // If the the file has numeric extension, we must check also the special fake extension .###
    if (prefs.getPrefType(extpref) == 0 && prefs.getPrefType("openattachment.extension.###") == 0)
      return false;
    else if (prefs.getPrefType(extpref) == 0 && prefs.getPrefType("openattachment.extension.###") != 0)
      extpref = "openattachment.extension.###";
  }

  if (prefs.getPrefType(extpref) == 0 && prefs.getPrefType(universal) > 0)
    extpref = universal;

  try {
    var program = prefs.getStringPref(extpref);
  }
  catch (e) {
    return false;
  }

  if (compose) {
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
      .getService(Components.interfaces.nsIIOService);
    var URL = ios.newURI(aAttachment.url, null, null);
    var tempfile = URL.QueryInterface(Components.interfaces.nsIFileURL).file;
  }
  else {
    var aUri = aAttachment.uri ? aAttachment.uri : aAttachment.messageUri;
    // Remove blanks from attachment name, because it can break the function on Windows
    attName = attName.replace(/ /g, "_");
    var tempfile = messenger.saveAttachmentToFolder(aAttachment.contentType, aAttachment.url, encodeURIComponent(attName), aUri, temp);
  }


  var pr = Components.classes["@mozilla.org/process/util;1"].
    createInstance(Components.interfaces.nsIProcess);
  var args = [];
  if (compose)
    var delOnExit = false;
  else
    var delOnExit = OABEgetOnExitPref();

  try {
    // Separator for arguments of the program to run == "%%"
    var elements = program.split("%%");
    if (elements[0].indexOf(".") != 0) {
      // Absolute path
      var execFile = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsIFile);
      execFile.initWithPath(elements[0]);
    }
    else {
      var execFile = returnAbsolutePath(elements[0]);
    }

    pr.init(execFile);
    for (i = 1; i < elements.length; i++)
      args[i - 1] = elements[i];

    var tempfilepath = tempfile.path;
    if (prefs.getBoolPref("openattachment.use_charset")) {
      var uConv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
        .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      var charset = prefs.getCharPref("openattachment.charset");
      if (charset != "") {
        uConv.charset = charset;
        try {
          tempfilepath = uConv.ConvertFromUnicode(tempfilepath);
        }
        catch (e) { }
      }
    }

    args.push(tempfilepath);
    window.setTimeout(OABEdelayedActions, 500, pr, args, delOnExit, tempfile, 0, false);
  }
  catch (e) {
    alert("OpenAttachmentByExtension: Internal error\n\n" + e);
  }

  return true;
}

// messenger.saveAttachmentToFolder has no listener to check if the download is ended, so we call
// this function every half second, to see if the file size is changing or not.
// Yes, it's true, now exist saveAttachmentToFile that supports a listener, but this method is not
// available for older version of Thunderbird

function OABEdelayedActions(pr, args, delOnExit, file, fileSize, checking) {
  if (file.exists() && file.fileSize != fileSize) {
    window.setTimeout(OABEdelayedActions, 500, pr, args, delOnExit, file, file.fileSize, false);
    return;
  }
  // File size is not changed, but to be sure we check a second time
  else if (!checking) {
    window.setTimeout(OABEdelayedActions, 500, pr, args, delOnExit, file, file.fileSize, true);
    return;
  }

  pr.run(false, args, args.length);

  if (delOnExit) {
    var extService = Components.classes['@mozilla.org/uriloader/external-helper-app-service;1']
      .getService(Components.interfaces.nsPIExternalAppLauncher)
    extService.deleteTemporaryFileOnExit(file);
  }
}



