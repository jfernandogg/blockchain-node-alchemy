const secp = require("ethereum-cryptography/secp256k1");
const {secp256k1} = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { encrypt } = require("ethereum-cryptography/aes.js");
const { scrypt } = require("ethereum-cryptography/scrypt");
const { toHex, utf8ToBytes,hexToBytes,bytesToUtf8 } = require("ethereum-cryptography/utils");
const readLine = require("readline-sync");

function getAddress(publicKey) {
    let a = publicKey.slice(1,publicKey.len);
    kck = keccak256(a);
    return kck.slice(kck.length-20);
}

async function recoverKey(message, signature, recoveryBit) {
    return secp.recoverPublicKey(hashMessage(message), signature, recoveryBit);
}

function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
}

async function signMessage(msg,privateKey) {
    let messageHash = hashMessage(msg);
    return secp.sign(messageHash, privateKey, { recovered: true });
}

async function main() {
    const iv = "f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff"; // TODO: Replace with your unique iv, this is very important.

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
    const key = await scrypt(utf8ToBytes(password), utf8ToBytes("coap"), 262144, 8, 2, 16); // TODO: Replace coap with your own salt. It's very important
    console.log("key:"+toHex(key));
    
    const privateKey = secp.secp256k1.utils.randomPrivateKey();
    const encryptedPrivateKey = await encrypt(privateKey, key, hexToBytes(iv));
    console.log("Encrypted Private Key: "+toHex(encryptedPrivateKey));
    
    const publicKey = secp256k1.getPublicKey(privateKey);
    console.log("Public Key: "+toHex(publicKey));
    console.log("Address: "+toHex(getAddress(publicKey)));
    
}

main();