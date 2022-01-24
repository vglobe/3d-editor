export function isMobile() {
  return /Android|webOS|iPad|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
}

export function getElement (target: string | HTMLElement) {
  if (typeof target === 'string') {
    return document.getElementById(target);
  }
  return target;
}