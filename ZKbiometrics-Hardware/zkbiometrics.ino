#include <ArduinoBLE.h>
#include <Adafruit_Fingerprint.h>

// Defines
#define mySerial Serial1

// Classes

// BLE Services and Chars Class
BLEService ZKbiometricsService("1101");
// Control
BLEBooleanCharacteristic flagCharacteristic("0000", BLEWrite);  // Flag State Channel
// ZK Proof
BLEStringCharacteristic zkCharacteristic("0001", BLERead | BLENotify, 42);
// Fingerprint Reader
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void setup() {
  // put your setup code here, to run once:
  // Serial Setup
  Serial.begin(9600);
  while (!Serial)
    ;
  Serial.println("Serial OK");
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("LED OK");
  if (!BLE.begin()) {
    Serial.println("failed to initialize BLE!");
    while (1)
      ;
  }
  // General Setup
  BLE.setLocalName("ZKbiometrics Module");
  BLE.setAdvertisedService(ZKbiometricsService);
  // Characteristics
  ZKbiometricsService.addCharacteristic(flagCharacteristic);
  ZKbiometricsService.addCharacteristic(zkCharacteristic);
  // Initial Values
  flagCharacteristic.setValue(false);
  // Services Callbacks
  BLE.addService(ZKbiometricsService);
  BLE.setEventHandler(BLEConnected, blePeripheralConnectHandler);
  BLE.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);
  flagCharacteristic.setEventHandler(BLEWritten, flagCharacteristicFunction);
  Serial.println("BLE OK");

  // Setup fingerprint
  finger.begin(57600);
  delay(5);
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) { delay(1); }
  }

  // Start Service
  BLE.advertise();
}

void loop() {
  BLE.poll();
}

// Connect Handler
void blePeripheralConnectHandler(BLEDevice central) {
  Serial.print("Connected event, central: ");
  Serial.println(central.address());
  digitalWrite(LED_BUILTIN, LOW);
}

// Disconnect Handler
void blePeripheralDisconnectHandler(BLEDevice central) {
  Serial.print("Disconnected event, central: ");
  Serial.println(central.address());
  digitalWrite(LED_BUILTIN, HIGH);
}

void flagCharacteristicFunction(BLEDevice central, BLECharacteristic characteristic) {
  if (flagCharacteristic.value()) {
    Serial.println("true");
    int res;
    while (1) {
      res = (int)getFingerprintID();
      if (res != 2) {
        Serial.println(res);
        break;
      }
      delay(50);
    }
    if (res == 1) {
      zkCharacteristic.setValue(String(1));
      delay(10 * 1000);
      zkCharacteristic.setValue(String(0));
    } else {
      zkCharacteristic.setValue(String(2));
      delay(10 * 1000);
      zkCharacteristic.setValue(String(0));
    }
    Serial.println(res);
  }
}

// Fingerprint Utils
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