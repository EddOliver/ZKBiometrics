# ZKBiometrics

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) [<img src="https://img.shields.io/badge/View-Video-red">](pending...)

<img src="https://i.ibb.co/9q1K18s/logo-2.png">

ZK powered biometrics SDK and Wallet.

## Android Dapp:

APK: https://github.com/EddOliver/ZKBiometrics/releases/tag/v1.0.0

## Main demo video: 

[![Demo](https://i.ibb.co/g4W3ypx/image.png)](pending...)

# Introduction



# Solution

For our solution, more than a project, we made an entire mini SDK that practically implements ZKproofs to protect one of the most precious assets of human beings, their biometrics.

<img src="https://i.ibb.co/wLxL358/image.png">

Biometric sensors are intended to convert our biometric readings into data that a device can verify, however using them as a verification method in blockchain is dangerous due to the possibility of exposing them, that is why today we present ZKbiometrics.

### System's Architecture:

<img src="https://i.ibb.co/6N5dxsZ/scheme-drawio-4.png">

- All ZKproofs were made with the [ZoKrates](https://zokrates.github.io/) toolbox.

- All EVMs transactions are controlled through [EthersJS](https://docs.ethers.org/v5/) on the [Scroll Sepolia](https://sepolia.scroll.io/) testnet.

By running an offline NodeJS server in our React native DApp we can safely obtain ZKproofs of our biometrics in order to be able to use them in signing transactions on the Scroll network. These biometric data can come from a FaceID, reading Iris, Fingerprint or any sensor.

# ZKproof Generator SDK:

The implementation of the ZKproof-Generator SDK is intended to carry out all the keypair, contract, proofs and bytecode creation processes necessary to implement ZK proofs in any existing contract in solidity. However, this project is focused on its use in biometrics.

[ZKproof Generator CODE](./ZKproof-generator/index.js)

The generator uses two input data to generate the circuit necessary to operate.

- A hash or data generated from the biometric data read, in the case of our wallet the fingerprint.
- The public address, which will help us "link" the proof with our public key in the verifier.

    // Proof
    const hash = "0x651192EF40CAEd1D858AA11C173a8323843A8D41";    // EXAMPLE Biometric Hashed Data or any sensitive data
    const address = "0xBf194eBEB11cDAe7eC8C17CF8CF934785857cE66"; // Public Address

    ...

    const program = `
    const field biometricHashA = ${BigInt(hash)};
    const field addressA = ${BigInt(address)};

    def main(private field biometricHashB, field address) {
        assert(biometricHashA == biometricHashB);
        assert(addressA == address);
        return;
    }
    `

Once the circuit is ready, the generator generates all the files for deployment.

    ...
    keypair = zokratesProvider.setup(artifacts.program);
    fs.writeFileSync("keypair.txt", keypairToString(keypair));
    const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
    fs.writeFileSync("verifier.sol", verifier);
    ...
    var output = JSON.parse(solc.compile(JSON.stringify(options)));
    console.log(output.contracts["verifier.sol"]["Verifier"].evm.bytecode.object);

In addition to giving us all the files, it provides us with a proof generator based on the circuit provided, in order to use them.

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

    console.log({ tupleProof, input });

Finally, the technical implementation of the SDK in the Wallet is in the following route.

[ZK Biometrics Wallet - ZKproof Generator CODE](./ZKbiometrics/nodejs-assets/nodejs-project/main.js)

# ZK Biometrics Wallet:

In order to practically see the SDK working, we made a fully functional wallet that provides us, in addition to the basic functions of a wallet, the ability to create a ZKaccount, with which we can only sign by providing the necessary ZKproofs.

[CONTRACT](./Contracts/ZKaccount.sol)

## ZKAccount:

This account is similar to a SmartContact Wallet, as it has the ability to receive Native, ERC20 and ERC721 tokens.

    // Receiver and Fallback Functions

    receive() external payable {} // Recieve Deposits

    fallback() external payable {} // Recieve Deposits if recieve doesn't work

    // Tokens Transfers

    function transferNative(
        uint256 value,
        address payable to,
        Proof memory proof,
        uint256[1] memory input
    ) public {
        require(
            zokratesVerifier.verifyTx(proof, input) == true,
            "Incorrect Proof"
        );
        to.transfer(value);
    }

    function transferECR20(
        uint256 value,
        address _to,
        address _tokenContract,
        Proof memory proof,
        uint256[1] memory input
    ) public {
        IERC20 ERC20Contract = IERC20(_tokenContract);
        require(
            zokratesVerifier.verifyTx(proof, input) == true,
            "Incorrect Proof"
        );
        ERC20Contract.transfer(_to, value);
    }

    function transferECR721(
        address _to,
        address _tokenContract,
        Proof memory proof,
        uint256[1] memory input
    ) public {
        require(
            zokratesVerifier.verifyTx(proof, input) == true,
            "Incorrect Proof"
        );
        IERC721 ERC721Contract = IERC721(_tokenContract);
        ERC721Contract.transferFrom(address(this), _to, 0);
    }

The most important section of this contract is the use of ZKproofs as a verification method.

    library Pairing {
        struct G1Point {
            uint256 X;
            uint256 Y;
        }
        struct G2Point {
            uint256[2] X;
            uint256[2] Y;
        }
    }

    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }

    interface IZokratesVerifier {
        function verifyTx(Proof memory proof, uint256[1] memory input)
            external
            view
            returns (bool r);
    }
    ...
    IZokratesVerifier zokratesVerifier;
    ...
    zokratesVerifier = IZokratesVerifier(_zokratesVeriferAddress);
    ...
    require( zokratesVerifier.verifyTx(proof, input) == true, "Incorrect Proof" );

## UI/UX:

These types of technologies always give great advantages to users to improve their security when interacting with the blockchain, however this has to be invisible to the user in order to maintain a good user experience.

<img src="https://i.ibb.co/1vWGhMq/vlcsnap-2024-02-18-01h17m47s237.png" width="32%">
<img src="https://i.ibb.co/FYWrQ7Y/vlcsnap-2024-02-18-01h17m56s748.png" width="32%">
<img src="https://i.ibb.co/BcHy2Gd/vlcsnap-2024-02-18-01h18m30s082.png" width="32%">

In addition, the wallet provides an interface capable of gradually increasing the sensors with which we can pay, since we can use the internal sensors of the smartphone or external sensors as in this POC.

<img src="https://i.ibb.co/1rx6wgj/vlcsnap-2024-02-18-01h18m39s644.png" width="32%">
<img src="https://i.ibb.co/Zhbc3nm/vlcsnap-2024-02-18-01h18m42s677.png" width="32%">
<img src="https://i.ibb.co/6DHcmnR/vlcsnap-2024-02-18-01h19m20s267.png" width="32%">

## Fingerprint Hardware Module:

The external fingerprint module works through BLE communication between the cell phone and the ESP32.

<img src="https://i.ibb.co/bKRc7xX/Fingerprint.png">

The entire module works thanks to BLE communication, which provides us with good energy efficiency and better compatibility with React Native.

    // BLE Services and Chars Class
    BLEService ZKbiometricsService("1101");
    // Control
    BLEBooleanCharacteristic flagCharacteristic("0000", BLEWrite);  // Flag State Channel
    // ZK Proof
    BLEStringCharacteristic zkCharacteristic("0001", BLERead | BLENotify, 42);
    // Fingerprint Reader
    Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

The sensor provides us with a reading of the HASH of the fingerprint, which in the cell phone's NodeJS sever provides us with the ZKproof necessary to perform the signature.

    uint8_t getFingerprintID() {
    uint8_t p = finger.getImage();
    switch (p) {
        case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
        case FINGERPRINT_NOFINGER:
        Serial.println("No finger detected");
        return p;
        case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        return p;
        case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        return p;
        default:
        Serial.println("Unknown error");
        return p;
    }

    // OK success!

    p = finger.image2Tz();
    switch (p) {
        case FINGERPRINT_OK:
        Serial.println("Image converted");
        break;
        case FINGERPRINT_IMAGEMESS:
        Serial.println("Image too messy");
        return p;
        case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        return p;
        case FINGERPRINT_FEATUREFAIL:
        Serial.println("Could not find fingerprint features");
        return p;
        case FINGERPRINT_INVALIDIMAGE:
        Serial.println("Could not find fingerprint features");
        return p;
        default:
        Serial.println("Unknown error");
        return p;
    }

    // OK converted!
    p = finger.fingerSearch();
    if (p == FINGERPRINT_OK) {
        Serial.println("Found a print match!");
    } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
        Serial.println("Communication error");
        return p;
    } else if (p == FINGERPRINT_NOTFOUND) {
        Serial.println("Did not find a match");
        return p;
    } else {
        Serial.println("Unknown error");
        return p;
    }

    // found a match!
    Serial.print("Found ID #");
    Serial.print(finger.fingerID);
    Serial.print(" with confidence of ");
    Serial.println(finger.confidence);

    return finger.fingerID;
    }
