declare module 'html2canvas' {
  interface Html2CanvasOptions {
    [key: string]: unknown;
  }
  interface Html2CanvasResult extends HTMLCanvasElement {}
  function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<Html2CanvasResult>;
  export default html2canvas;
  export { Html2CanvasOptions };
}
