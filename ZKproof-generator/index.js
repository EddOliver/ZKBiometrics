import { initialize } from "zokrates-js";
import fs from "fs";
import solc from "solc";

function uint8ArrayToHex(uint8Array) {
  return Buffer.from(uint8Array).toString("hex");
}

function hexToUint8Array(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

function keypairToString(keypair) {
  return JSON.stringify({
    pk: uint8ArrayToHex(keypair.pk),
    vk: JSON.stringify(keypair.vk),
  });
}

function stringToKeypair(keypairString) {
  const keypair = JSON.parse(keypairString);
  return {
    pk: hexToUint8Array(keypair.pk),
    vk: JSON.parse(keypair.vk),
  };
}

// Proof
const hash = "0x651192EF40CAEd1D858AA11C173a8323843A8D41";    // EXAMPLE Biometric Hashed Data or any sensitive data
const address = "0xBf194eBEB11cDAe7eC8C17CF8CF934785857cE66"; // Public Address

initialize().then((zokratesProvider) => {
  // Program compilation
  let keypair;

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

  if (!fs.existsSync("keypair.txt")) { // Create keypair if not exists
    keypair = zokratesProvider.setup(artifacts.program);
    fs.writeFileSync("keypair.txt", keypairToString(keypair));
    const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
    fs.writeFileSync("verifier.sol", verifier);
  } else { // Read keypair if exists
    keypair = stringToKeypair(fs.readFileSync("keypair.txt", "utf8"));
  }

  const { witness } = zokratesProvider.computeWitness(artifacts, [
    hash,
    address,
  ]);

  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    keypair.pk
  );

  const tupleProof = JSON.stringify([
    proof.proof.a,
    proof.proof.b,
    proof.proof.c,
  ]);

  const input = JSON.stringify(proof.inputs);

  console.log({ tupleProof, input }); // Generate proof and input for the verifier on Solidity

  const contract = fs.readFileSync("verifier.sol", "utf8");

  var options = {
    language: "Solidity",
    sources: {
      "verifier.sol": {
        content: contract,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  var output = JSON.parse(solc.compile(JSON.stringify(options)));

  console.log(output.contracts["verifier.sol"]["Verifier"].evm.bytecode.object);
  // Export bytecode for deployment
});
