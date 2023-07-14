const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes,hexToBytes,bytesToUtf8 } = require("ethereum-cryptography/utils");


const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x130291b882a9006d7fdc0d254badfdbacb1176da": {balance: 100}, 
  "0x1a6affc0884452927776c718783af6a761171cb": {balance: 50}, 
  "0x5a2f931dbc313e78e1cb758459be62498c0291bc": {balance: 75}
};


function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address]["balance"] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, signature, publickey } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient); 
  try {
    const s = secp256k1.Signature.fromDER(signature); //reinstantiate a Signature object from the signature object received from the frontend
    const isValid = await secp256k1.verify(s, hashMessage(sender+recipient+amount), hexToBytes(publickey));
  }
  catch (e) {
    console.log(e);
    res.status(400).send({ message: "Invalid signature!" });
  }
  if (balances[sender]["balance"] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender]["balance"] -= amount;
    balances[recipient]["balance"] += amount;
    res.send({ balance: balances[sender]["balance"] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]["balance"]) {
    balances[address]["balance"] = 0;
  }
}


