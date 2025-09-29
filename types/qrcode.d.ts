declare module 'qrcode' {
  export function toDataURL(text: string, opts?: Record<string, unknown>): Promise<string>;
  const _default: { toDataURL: (text: string, opts?: Record<string, unknown>) => Promise<string> };
  export default _default;
}
