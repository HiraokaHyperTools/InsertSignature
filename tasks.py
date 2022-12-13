#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Runs great on Python 3.9.7

from invoke import task
import os

XPI = "InsertSignature-${version}.xpi"


base_dir = os.path.dirname(os.path.realpath(__file__))


def getManifestVersion() -> str:
    with open(os.path.join(base_dir, "manifest.json")) as f:
        import json
        manifest = json.loads(f.read())
        return manifest["version"]


@task
def pack(c):
    """
    Package project artifacts to a release-able xpi
    """
    from string import Template

    os.environ["PATH"] += os.pathsep + 'C:\\Program Files\\7-Zip'

    version = getManifestVersion()

    xpi_name = Template(XPI).substitute(version=version)
    xpi_path = os.path.join(base_dir, xpi_name)

    if os.path.exists(xpi_path):
        os.unlink(xpi_path)

    t = Template(
        "7z.exe a \"${xpi_path}\" *.* -x!*.py -x!*.xpi -x!.git -x!*.pxf -x!*.dxf -x!screenshots -x!.vscode -x!.editorconfig -x!.gitignore -x!dev.md -x!.gitattributes -r"
    )

    c.run(t.substitute(xpi_path=xpi_path))

@task
def pub(c):
    """
    Open ATN developer center to upload xpi
    """
    c.run("start https://addons.thunderbird.net/ja/developers/addon/insertsignature/versions/submit/")
