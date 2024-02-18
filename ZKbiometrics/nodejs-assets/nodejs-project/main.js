var rn_bridge = require('rn-bridge');
var { initialize }  = require("zokrates-js");
var fs = require("fs");

function hexToUint8Array(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

function stringToKeypair(keypairString) {
  const keypair = JSON.parse(keypairString);
  return {
    pk: hexToUint8Array(keypair.pk),
    vk: JSON.parse(keypair.vk),
  };
}

async function zkProof(hash, address) {
  const zokratesProvider = await initialize();

  const program = `
  const field biometricHashA = ${BigInt(hash)};
  const field addressA = ${BigInt(address)};

  def main(private field biometricHashB, field address) {
      assert(biometricHashA == biometricHashB);
      assert(addressA == address);
      return;
  }
`

  const artifacts = zokratesProvider.compile(program);
  const keypair = stringToKeypair(fs.readFileSync("keypair.txt", "utf8"));

  const { witness } = zokratesProvider.computeWitness(artifacts, [
    hash,
    address,
  ]);

  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    keypair.pk
  );

  const tupleProof = [proof.proof.a, proof.proof.b, proof.proof.c];
  const input = proof.inputs;

  return { tupleProof, input };
}

// Echo every message received from react-native.
rn_bridge.channel.on('message', msg => {
  const {topic, message} = msg;
  if (topic === 'init') {
    rn_bridge.channel.send({topic, message});
  } else if (topic === 'msg') {
    // to do
  } else if (topic === 'zkProof') {
    zkProof(message.hash, message.address).then(result => {
      rn_bridge.channel.send({topic, message: result});
    });
  }
});

// Inform react-native node is initialized.
rn_bridge.channel.send({
  topic: 'init',
  message: 'Node was initialized.',
});
