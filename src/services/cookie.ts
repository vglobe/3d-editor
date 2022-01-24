export function getCookie(name: string): string {
  let arr: RegExpMatchArray | null;
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  if ((arr = document.cookie.match(reg))) {
    return decodeURIComponent(arr[2]);
  } else {
    return '';
  }
}

// options: {
//   expires?:number,
//   path?:string,
//   domain?:string
// }
export function setCookie(name: string, value: string, options?: any) {
  const myWindow: any = window;
  let cookieStr = myWindow.escape(name) + '=' + myWindow.escape(value) + ';';

  if (!options) {
    options = {};
  }
  if (options.expires) {
    const dtExpires = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);
    cookieStr += 'expires=' + dtExpires.toUTCString() + ';';
  }
  if (options.path) {
    cookieStr += 'path=' + options.path + ';';
  }
  if (options.domain) {
    cookieStr += 'domain=' + options.domain + ';';
  }

  document.cookie = cookieStr;
}

// options: {
//   path?:string,
//   domain?:string
// }
export function deleteCookie(name: string, options?: any) {
  if (getCookie(name)) {
    if (!options) {
      options = {};
    }
    options.expires = -1;
    setCookie(name, '', options);
  }
}