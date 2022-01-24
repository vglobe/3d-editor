
export const objectToQueryString = (obj: any) => {
  return '?' + Object.keys(obj)
    .map(function (key) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        return '';
      }

      if (obj[key] instanceof Array || Object.prototype.toString.call(obj[key]) === '[object Array]') {
        return obj[key]
          .map(function (item: string) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(item);
          })
          .join('&');
      } else {
        return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
      }
    })
    .join('&');
};