const secp = require("ethereum-cryptography/secp256k1");
const {secp256k1} = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

(async () => {
// keys, messages & other inputs can be Uint8Arrays or hex strings
  // Uint8Array.from([0xde, 0xad, 0xbe, 0xef]) === 'deadbeef'
  message = "Hello World";
  const privKey = secp256k1.utils.randomPrivateKey();
  console.log("private key length: "+privKey.length);;
  const pubKey = secp256k1.getPublicKey(privKey);
  const msgHash = await keccak256(utf8ToBytes('hello world'));
  const signature = await secp256k1.sign(msgHash, privKey);
  console.log(signature);
  const isValid = secp256k1.verify(signature, msgHash, pubKey);
  console.log("valid? "+isValid);



})();
