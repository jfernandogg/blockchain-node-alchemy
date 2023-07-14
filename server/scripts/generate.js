const secp = require("ethereum-cryptography/secp256k1");
const {secp256k1} = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { encrypt, decrypt } = require("ethereum-cryptography/aes.js");
const { scrypt } = require("ethereum-cryptography/scrypt");
const { toHex, utf8ToBytes,hexToBytes } = require("ethereum-cryptography/utils");
const readLine = require("readline-sync");

function getAddress(publicKey) {
    let a = publicKey.slice(1,publicKey.len);
    kck = keccak256(a);
    return kck.slice(kck.length-20);
}

function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
}

async function main() {
    const iv = "f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff"; // TODO: Replace with your unique iv, this is very important, server must have the same iv configured.

    //read a password from the user and confirm it
    const password = readLine.question("Enter a password: ", {
        hideEchoBack: true
    });
    const password2 = readLine.question("Confirm password: ", {
        hideEchoBack: true
    });
    if (password !== password2) {
        console.log("Passwords do not match");
        return;
    }
    const key = await scrypt(utf8ToBytes(password), utf8ToBytes("hgts"), 262144, 8, 2, 16); // TODO: Replace coap with your own salt. It's very important
    const privateKey = secp.secp256k1.utils.randomPrivateKey();
    const encryptedPrivateKey = await encrypt(privateKey, key, hexToBytes(iv));
    const publicKey = secp256k1.getPublicKey(privateKey);
    console.log("Encrypted Private Key: "+toHex(encryptedPrivateKey));
    console.log("Public Key: "+toHex(publicKey));
    console.log("Address: 0x"+toHex(getAddress(publicKey)));
}

main();