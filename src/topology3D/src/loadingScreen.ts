/*
 * @Description:
 * @Author: G
 * @Date: 2021-11-09 11:19:10
 * @LastEditTime: 2021-11-09 14:12:29
 */

interface LoadingScreenOptions {
  text?: string;
  backgroundColor?: string;
}

const svgStr = `<svg t="1642659519421" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10313" width="100%" height="100%"><path d="M843.307 742.24c0 3.217 2.607 5.824 5.824 5.824s5.824-2.607 5.824-5.824c0 0 0 0 0 0 0-3.217-2.607-5.824-5.824-5.824-3.217 0-5.824 2.607-5.824 5.824 0 0 0 0 0 0zM714.731 874.912c0 0 0 0 0 0 0 6.398 5.186 11.584 11.584 11.584 6.398 0 11.584-5.186 11.584-11.584 0 0 0 0 0 0 0 0 0 0 0 0 0-6.398-5.186-11.584-11.584-11.584-6.398 0-11.584 5.186-11.584 11.584s0 0 0 0zM541.419 943.2c0 9.614 7.794 17.408 17.408 17.408s17.408-7.794 17.408-17.408c0-9.614-7.794-17.408-17.408-17.408-9.614 0-17.408 7.794-17.408 17.408zM354.859 934.048c0 0 0 0 0 0 0 12.795 10.373 23.168 23.168 23.168 12.795 0 23.168-10.373 23.168-23.168 0 0 0 0 0 0 0 0 0 0 0 0 0-12.795-10.373-23.168-23.168-23.168-12.795 0-23.168 10.373-23.168 23.168s0 0 0 0zM189.355 849.12c0 16.012 12.98 28.992 28.992 28.992s28.992-12.98 28.992-28.992c0 0 0 0 0 0 0-16.012-12.98-28.992-28.992-28.992-16.012 0-28.992 12.98-28.992 28.992 0 0 0 0 0 0zM74.731 704.736c0 19.228 15.588 34.816 34.816 34.816s34.816-15.588 34.816-34.816c0-19.228-15.588-34.816-34.816-34.816-19.228 0-34.816 15.588-34.816 34.816zM31.723 527.456c0 22.41 18.166 40.576 40.576 40.576s40.576-18.166 40.576-40.576c0-22.41-18.166-40.576-40.576-40.576-22.41 0-40.576 18.166-40.576 40.576zM67.115 351.328c0 25.626 20.774 46.4 46.4 46.4s46.4-20.774 46.4-46.4c0-25.626-20.774-46.4-46.4-46.4-25.626 0-46.4 20.774-46.4 46.4zM173.291 209.312c0 28.843 23.381 52.224 52.224 52.224s52.224-23.381 52.224-52.224c0 0 0 0 0 0 0-28.843-23.381-52.224-52.224-52.224-28.843 0-52.224 23.381-52.224 52.224 0 0 0 0 0 0zM329.195 127.968c0 32.024 25.96 57.984 57.984 57.984s57.984-25.96 57.984-57.984c0-32.024-25.96-57.984-57.984-57.984-32.024 0-57.984 25.96-57.984 57.984zM504.299 122.912c0 35.24 28.568 63.808 63.808 63.808s63.808-28.568 63.808-63.808c0 0 0 0 0 0 0-35.24-28.568-63.808-63.808-63.808-35.24 0-63.808 28.568-63.808 63.808 0 0 0 0 0 0zM664.619 195.04c0 38.421 31.147 69.568 69.568 69.568s69.568-31.147 69.568-69.568c0-38.421-31.147-69.568-69.568-69.568-38.421 0-69.568 31.147-69.568 69.568zM778.539 330.528c0 41.638 33.754 75.392 75.392 75.392s75.392-33.754 75.392-75.392c0-41.638-33.754-75.392-75.392-75.392-41.638 0-75.392 33.754-75.392 75.392zM823.851 506.016c0 44.854 36.362 81.216 81.216 81.216s81.216-36.362 81.216-81.216c0-44.854-36.362-81.216-81.216-81.216-44.854 0-81.216 36.362-81.216 81.216z" p-id="10314"></path></svg>`;

export class LoadingScreen {
  public loadingTitle: string;
  public loadingSubtitle: string;
  public loadingDiv: HTMLDivElement;
  public titleDiv: HTMLDivElement;
  public subtitleDiv: HTMLDivElement;
  private renderingCanvas: HTMLCanvasElement;
  private id = 'le5le-loading-div';

  constructor(canvas: HTMLCanvasElement, options: LoadingScreenOptions = {}) {
    this.renderingCanvas = canvas;
    this.setLoadingDIV();
  }

  setLoadingDIV() {
    const div = document.createElement('div');
    div.className = 'topology3d-loading-div';
    div.id = this.id;
    div.style.display = 'none';
    const container = document.createElement('div');
    container.className = 'loading-div-container';
    const iconDiv = document.createElement('div');
    iconDiv.className = 'loading-icon';
    iconDiv.innerHTML = svgStr;
    const titleDiv = document.createElement('div');
    titleDiv.className = 'loading-title';
    const subtitleDiv = document.createElement('div');
    subtitleDiv.className = 'loading-subtitle';
    container.appendChild(iconDiv);
    container.appendChild(titleDiv);
    container.appendChild(subtitleDiv);
    div.appendChild(container);
    this.loadingDiv = div;
    this.titleDiv = titleDiv;
    this.subtitleDiv = subtitleDiv;
  }

  show(title?: string, subtitle?: string) {
    const { left, top, width, height } =
      this.renderingCanvas.getBoundingClientRect();
    const { scrollTop, scrollLeft } = document.body;
    this.loadingDiv.style.left = left + scrollLeft + 'px';
    this.loadingDiv.style.top = top + scrollTop + 'px';
    this.loadingDiv.style.width = width + 'px';
    this.loadingDiv.style.height = height + 'px';
    this.titleDiv.innerText = title || '';
    this.subtitleDiv.innerText = subtitle || '';
    this.loadingDiv.style.display = 'block';
    if (!document.getElementById(this.id)) {
      document.body.appendChild(this.loadingDiv);
    }
  }

  hide() {
    this.loadingDiv.style.display = 'none';
  }
}
