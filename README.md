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

Para nuestra solucion mas que un proyecto, realizamos todo un mini SDK que implementa de forma practica los ZKproofs para proteger uno de los bienes mas preciados del ser humano, sus biometricos.

<img src="https://i.ibb.co/wLxL358/image.png">

Los sensores de biometricos tienen como fin convertir nuestras lecturas biometricas en datos que un device puede comprobar, sin embargo utilizarlos como metodo de verificacion en blockchain es peligroso debido a la posibilidad de exponerlos, por eso hoy presentamos ZKbiometrics.

### System's Architecture:

<img src="https://i.ibb.co/6N5dxsZ/scheme-drawio-4.png">

- Todas las ZKproofs fueron realizadas con la toolbox de [ZoKrates](https://zokrates.github.io/).

- All EVMs transactions are controlled through [EthersJS](https://docs.ethers.org/v5/) en la testnet de [Scroll Sepolia](https://sepolia.scroll.io/).

A travez de correr un offline NodeJS server en nuestra React native DApp podemos obtener de forma segura ZKproofs de nuestros biometricos con el fin de poder utilizarlos en la firma de transacciones en la red de Scroll, estos datos biometricos pueden provenir de un FaceID, lectura de Iris, Fingerprint o de cualquier sensor.

# ZKproof Generator SDK:

La implementacion del ZKproof-Generator SDK tiene como fin realizar todos los procesos de creacion de keypair, contrato, proofs y bytecode necesarios para implementar ZK proofs en cualquier contrato existente en solidity. Sin embargo en este proyecto esta enfocado a su uso en biometricos.

[ZKproof Generator CODE](./ZKproof-generator/index.js)

El generador utiliza dos datos de entrada para generar el circuito necesario para funcionar.

- Un hash o datos generado a partir del dato biometrico leido, en el caso de nuestra wallet el fingerprint.
- El address publico, el cual nos servira para "ligar" la proof con nuestra public key en el verificador.

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

Una vez teniendo el circuito listo, el generador genera todos los archivos para deployment.

    ...
    keypair = zokratesProvider.setup(artifacts.program);
    fs.writeFileSync("keypair.txt", keypairToString(keypair));
    const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
    fs.writeFileSync("verifier.sol", verifier);
    ...
    var output = JSON.parse(solc.compile(JSON.stringify(options)));
    console.log(output.contracts["verifier.sol"]["Verifier"].evm.bytecode.object);

Ademas de darnos todos los archivos, nos provee de un generador de proofs basados en el circuito proporcionado, con el fin de usarlos.

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

Por ultimo la implementacion tecnica del SDK en la Wallet esta en la siguiente ruta.

[ZK Biometrics Wallet - ZKproof Generator CODE](./ZKbiometrics/nodejs-assets/nodejs-project/main.js)

# ZK Biometrics Wallet:

Para poder ver de forma practica el SDK funcionando, realizamos una wallet completamente funcional que nos provee, ademas de las funciones basicas de una wallet, el poder crear una ZKaccount, con la cual solo podremos firmar a travez de proporcionar las ZKproofs necesarias.

[CONTRACT](./Contracts/ZKaccount.sol)

## ZKAccount:

Esta cuenta es parecida a una SmartConrtact Wallet, ya que tiene la capacidad de recbir tokens Nativos, ERC20 y ERC721.

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

La seccion mas importante de este contrato es el uso de la ZKproofs como metodo de verificacion.

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

Siempre este tipo de tecnologias dan grandes ventajas a los usuarios para mejorar su seguridad al interactuar con la blockchain, sin embargo esto tiene que ser invisible al usuario con el fin de mantener un buen user experience.

<img src="https://i.ibb.co/1vWGhMq/vlcsnap-2024-02-18-01h17m47s237.png" width="32%">
<img src="https://i.ibb.co/FYWrQ7Y/vlcsnap-2024-02-18-01h17m56s748.png" width="32%">
<img src="https://i.ibb.co/BcHy2Gd/vlcsnap-2024-02-18-01h18m30s082.png" width="32%">

Ademas la wallet provee una interfaz capaz de poco a poco ir aumentando los sensores con los cuales podremos pagar, ya que podemos usar los sensores internos del smartphone o sensores externos como en este POC.

<img src="https://i.ibb.co/1rx6wgj/vlcsnap-2024-02-18-01h18m39s644.png" width="32%">
<img src="https://i.ibb.co/Zhbc3nm/vlcsnap-2024-02-18-01h18m42s677.png" width="32%">
<img src="https://i.ibb.co/6DHcmnR/vlcsnap-2024-02-18-01h19m20s267.png" width="32%">

## Fingerprint Hardware Module:

El modulo de fingerprint externo, funciona mediante la comunicacion BLE entre el celular y el ESP32.

<img src="https://i.ibb.co/bKRc7xX/Fingerprint.png">

Todo el modulo funciona gracias a la comunicacion BLE lo cual nos provee buena eficiencia energetica y mejor compatibilidad con React Native.

    // BLE Services and Chars Class
    BLEService ZKbiometricsService("1101");
    // Control
    BLEBooleanCharacteristic flagCharacteristic("0000", BLEWrite);  // Flag State Channel
    // ZK Proof
    BLEStringCharacteristic zkCharacteristic("0001", BLERead | BLENotify, 42);
    // Fingerprint Reader
    Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

El sensor nos provee una lectura del HASH de la huella, el cual en el NodeJS sever del celular nos provee la ZKproof necesaria para realizar la firma.

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