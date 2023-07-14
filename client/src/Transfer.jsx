import { useState } from "react";
import server from "./server";
import { toHex, utf8ToBytes,hexToBytes,bytesToUtf8 } from "ethereum-cryptography/utils";
import secp from "ethereum-cryptography/secp256k1";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { scrypt } from "ethereum-cryptography/scrypt.js";
import { decrypt } from "ethereum-cryptography/aes.js";
import { keccak256} from "ethereum-cryptography/keccak.js";

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

async function signMessage(msg,privateKey) {
  let messageHash = hashMessage(msg);
  return secp256k1.sign(messageHash, toHex(privateKey));
}

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [PK, setPK] = useState("");
  const [pkPass, setPkPass] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    try {
      // Try to decrypt private key and sign transaction
      // Decrypt private key
      // decrypt(cypherText: Uint8Array, key: Uint8Array, iv: Uint8Array
      const key = await scrypt(utf8ToBytes(pkPass), utf8ToBytes("coap"), 262144, 8, 2, 16);
      const PKDecrypted = await decrypt(hexToBytes(PK), key, hexToBytes("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff"));
      const publickey = secp256k1.getPublicKey(PKDecrypted);
      // Sign transaction
      const signatured = (await signMessage(address+recipient+sendAmount, PKDecrypted)).toDERHex();
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: signatured,
        publickey: toHex(publickey),
      });
      setBalance(balance);
    } catch (ex) {
      alert("trying to send transaction "+ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Encrypted privateKey: 
        <input placeholder="Type your encrypted private key" value={PK} onChange={setValue(setPK)}></input>
      </label>

      <label>
        private Key Password:
        <input type="password" placeholder="Type your private key password" value={pkPass} onChange={setValue(setPkPass)}></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
