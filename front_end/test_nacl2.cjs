const naclUtil = require('tweetnacl-util');

const base64Str = "yhUnxdmVlpk/e1gw3gygBmeuCQh6scNZblcgfN/1PaLPuVbi/VPO07w3soYeU+cDAL4=";
const decoded = naclUtil.decodeBase64(base64Str);
console.log("Length:", decoded.length);
console.log("Nonce length:", 24);
console.log("Ciphertext length:", decoded.length - 24);
