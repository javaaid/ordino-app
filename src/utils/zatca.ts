export function generateZatcaQr(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  invoiceTotal: string,
  vatTotal: string
): string {
  const toHex = (num: number) => {
    const hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const getTlv = (tag: number, value: string) => {
    const encoder = new TextEncoder();
    const valueBytes = encoder.encode(value);
    const tagHex = toHex(tag);
    const lengthHex = toHex(valueBytes.length);
    
    const valueHex = Array.from(valueBytes)
      .map(b => toHex(b))
      .join('');
      
    return tagHex + lengthHex + valueHex;
  };

  const tlv1 = getTlv(1, sellerName);
  const tlv2 = getTlv(2, vatNumber);
  const tlv3 = getTlv(3, timestamp);
  const tlv4 = getTlv(4, invoiceTotal);
  const tlv5 = getTlv(5, vatTotal);

  const hexString = tlv1 + tlv2 + tlv3 + tlv4 + tlv5;
  
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }

  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
