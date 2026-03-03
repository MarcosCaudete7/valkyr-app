const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

const alice = nacl.box.keyPair();
const bob = nacl.box.keyPair();

const nonce = nacl.randomBytes(nacl.box.nonceLength);
const msg = util.decodeUTF8("Hello World");

// Alice encrypts to Bob
const box = nacl.box(msg, nonce, bob.publicKey, alice.secretKey);

// Bob decrypts from Alice
const bobDecrypted = nacl.box.open(box, nonce, alice.publicKey, bob.secretKey);
console.log("Bob decrypted:", bobDecrypted ? util.encodeUTF8(bobDecrypted) : "FAILED");

// Alice tries to decrypt her own sent message
const aliceDecrypted = nacl.box.open(box, nonce, bob.publicKey, alice.secretKey);
console.log("Alice decrypted:", aliceDecrypted ? util.encodeUTF8(aliceDecrypted) : "FAILED");
