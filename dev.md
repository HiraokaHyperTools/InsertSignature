# Thunderbird Add-ons: development notes

## Clear startupCache always

`startupCache` seems to store some code cache from add ons.
We need to clear them after exiting Thunderbird.

```bat
erase "...\Thunderbird\Profiles\*.default\startupCache\*"
```

## onload, ondialogaccept

They are dead. Check: [Adapt to Changes in Thunderbird 61-68](https://developer.thunderbird.net/add-ons/updating/tb68/changes)

```js
window.addEventListener("DOMContentLoaded", function () {
  onLoad();
});

document.addEventListener("dialogaccept", function (event) {
  onClose();
});
```

## Raise debug console

<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>

## tree.contentView

`tree.contentView` is dead. Use `tree.view` instead.
