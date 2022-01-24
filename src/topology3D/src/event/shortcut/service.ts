import { ButtonInfo, ShortcutInfo, Shortcuts } from './data';

function compare(evt: Required<ButtonInfo>, info: ButtonInfo | ButtonInfo[]) {
  if (info instanceof Array) {
    for (const item of info) {
      const matched = compare(evt, item);
      if (matched) {
        return true;
      }
    }
    return false;
  }
  const { code, ctrlKey = false, altKey = false, shiftKey = false, spaceKey = false, keyDown = true } = info;
  if (
    code === evt.code &&
    ctrlKey === evt.ctrlKey &&
    altKey === evt.altKey &&
    shiftKey === evt.shiftKey &&
    spaceKey === evt.spaceKey &&
    keyDown === evt.keyDown
  ) {
    return true;
  }
  return false;
}

function getShortcut(evt: Required<ButtonInfo>): { name: string; info: ShortcutInfo } {
  for (const name in Shortcuts) {
    if (compare(evt, Shortcuts[name].buttons)) {
      return { name, info: Shortcuts[name] };
    }
  }
}

function registerShortcut(name: string, info: ShortcutInfo) {
  Shortcuts[name] = info;
}

export { registerShortcut, getShortcut };
