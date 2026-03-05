const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

const keyPairA = nacl.box.keyPair();
const keyPairB = nacl.box.keyPair();

const msg = "Hola mundo";
const nonce = nacl.randomBytes(nacl.box.nonceLength);

// A encrypts for B
const box = nacl.box(naclUtil.decodeUTF8(msg), nonce, keyPairB.publicKey, keyPairA.secretKey);

// B decrypts from A
const decryptedB = nacl.box.open(box, nonce, keyPairA.publicKey, keyPairB.secretKey);
console.log("B decrypted:", decryptedB ? naclUtil.encodeUTF8(decryptedB) : "null");

// A decrypts its own sent message, sent to B
const decryptedA = nacl.box.open(box, nonce, keyPairB.publicKey, keyPairA.secretKey);
console.log("A decrypted:", decryptedA ? naclUtil.encodeUTF8(decryptedA) : "null");
