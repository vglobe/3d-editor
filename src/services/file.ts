import axios from 'axios';

export async function upload(
  blob: Blob,
  shared = false,
  filename = '/topology/thumb.png'
) {
  const form = new FormData();
  form.append('path', filename);
  form.append('randomName', '1');
  form.append('public', shared + '');
  form.append('file', blob);
  const ret: any = await axios.post('/api/image', form);
  if (ret.error) {
    return null;
  }

  return ret;
}

export async function delImage(image: string) {
  const ret: any = await axios.delete('/api' + image);
  if (ret.error) {
    return false;
  }

  return true;
}

export async function addImage(image: string) {
  const ret: any = await axios.post('/api/user/image', { image });
  if (ret.error) {
    return '';
  }

  return ret.id;
}

export async function addImageUrl(image: string, folder?: string) {
  const ret: any = await axios.post('/api/user/component/image/', {
    image,
    folder
  });
  if (ret.error) {
    return false;
  }

  return true;
}

export function filename(str: string) {
  const i = str.lastIndexOf('.');
  return str.substring(0, i);
}
