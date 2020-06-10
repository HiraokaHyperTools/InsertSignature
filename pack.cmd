cd /d %~dp0
set XPI=InsertSignature.xpi
del "%XPI%"
"C:\Program Files\7-Zip\7z.exe" a "%XPI%" *.* -x!pack.cmd -x!*.xpi -x!.git -x!*.pxf -x!*.dxf -x!screenshots -x!.vscode -r
