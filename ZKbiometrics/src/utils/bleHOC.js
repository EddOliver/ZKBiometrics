// Basic Imports
import React from 'react';

import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

// Utils
import autoBind from 'react-autobind';

// BLE

import {Alert} from 'react-native';

import BleManager, {BleEventType} from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const useBLE = (WrappedComponent, serviceUUID) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        scanning: false,
        peripheral: null,
        response: null,
        fail: null,
        available: false,
      };
      autoBind(this);
      this.emitterStop = null;
      this.emitterUpdate = null;
      this.emitterDiscover = null;
      this.connected = false;
      this.counter = 0;
      this.value = [];
    }

    startScan() {
      this.setState(
        {
          scanning: false,
          peripheral: null,
          available: false,
        },
        () => {
          console.log('startScan');
          if (!this.state.scanning) {
            BleManager.scan([], 20, true)
              .then(() => {
                console.log('Scanning...');
                this.setState({
                  scanning: true,
                });
              })
              .catch(err => {
                console.error(err);
              });
          }
        },
      );
    }

    handleDiscoverPeripheral(peripheral) {
      if (!peripheral.name) {
        peripheral.name = 'NO NAME';
      }
      peripheral.advertising.serviceUUIDs.forEach(uuid => {
        if (uuid === serviceUUID) {
          console.log('OK');
          this.setState(
            {
              peripheral,
              scanning: false,
              available: true,
            },
            () => BleManager.stopScan(),
          );
        }
      });
    }

    handleStopScan() {
      console.log('Scan is stopped');
    }

    rebootBuffer() {
      this.emitterUpdate.remove();
      bleManagerEmitter.removeAllListeners(
        'BleManagerDidUpdateValueForCharacteristic',
      );
      this.emitterUpdate = bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        this.handleUpdateValueForCharacteristic,
      );
    }

    async handleUpdateValueForCharacteristic({value}) {
      this.setState({
        response: value[0],
      });
    }

    async ckeckFingerprint() {
      if (this.state.peripheral) {
        BleManager.connect(this.state.peripheral.id)
          .then(() => {
            setTimeout(async () => {
              this.connected = true;
              await BleManager.retrieveServices(this.state.peripheral.id);
              await BleManager.startNotification(
                this.state.peripheral.id,
                serviceUUID,
                '0001',
              ).then(() => console.log('Notification Start'));
              let data = [1];
              BleManager.write(
                this.state.peripheral.id,
                serviceUUID,
                '0000',
                [1],
                data.length,
              )
                .then(() => {
                  console.log('Write OK');
                })
                .catch(e => {
                  console.log(e);
                });
            }, 1000);
          })
          .catch(error => {
            console.log('Connection error', error);
            this.setState(
              {
                fail: true,
              },
              () =>
                setTimeout(
                  () =>
                    this.setState({
                      fail: null,
                    }),
                  1000,
                ),
            );
          });
      }
    }

    componentDidMount() {
      BleManager.enableBluetooth()
        .then(async () => {
          await BleManager.start({showAlert: false});
          this.emitterStop = bleManagerEmitter.addListener(
            BleEventType.BleManagerStopScan,
            this.handleStopScan,
          );
          this.emitterUpdate = bleManagerEmitter.addListener(
            BleEventType.BleManagerDidUpdateValueForCharacteristic,
            this.handleUpdateValueForCharacteristic,
          );
          this.emitterDiscover = bleManagerEmitter.addListener(
            BleEventType.BleManagerDiscoverPeripheral,
            this.handleDiscoverPeripheral,
          );
          if (Platform.OS === 'android' && Platform.Version >= 23) {
            let checkFine = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            );
            let checkBLE = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            );
            let checkBT = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            );
            if (!checkFine || !checkBLE || !checkBT) {
              PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
              ]).then(result => {
                if (
                  (result['android.permission.ACCESS_COARSE_LOCATION'] ===
                    'granted' ||
                    result['android.permission.ACCESS_COARSE_LOCATION'] ===
                      'never_ask_again') &&
                  (result['android.permission.BLUETOOTH_SCAN'] === 'granted' ||
                    result['android.permission.BLUETOOTH_SCAN'] ===
                      'never_ask_again') &&
                  (result['android.permission.BLUETOOTH_CONNECT'] ===
                    'granted' ||
                    result['android.permission.BLUETOOTH_CONNECT'] ===
                      'never_ask_again')
                ) {
                  this.startScan();
                } else {
                  Alert.alert(
                    'Permissions denied!',
                    'You need to give permissions',
                  );
                }
              });
            } else {
              this.startScan();
            }
          }
        })
        .catch(error => {
          // Failure code
          console.log('The user refuse to enable bluetooth');
        });
    }

    componentWillUnmount() {
      console.log('unmount');
      this.emitterStop && this.emitterStop.remove();
      this.emitterUpdate && this.emitterUpdate.remove();
      this.emitterDiscover && this.emitterDiscover.remove();
      this.connected &&
        BleManager.disconnect(this.state.peripheral.id)
          .then(() => {
            this.connected = false;
            console.log('Device Disconnected');
          })
          .catch(e => console.log(e));
    }

    render() {
      return (
        <WrappedComponent
          startScan={this.startScan}
          clearResponse={() =>
            this.setState({
              response: null,
            })
          }
          ckeckFingerprint={this.ckeckFingerprint}
          response={this.state.response}
          peripheral={this.state.peripheral}
          scanning={this.state.scanning}
          fail={this.state.fail}
          available={this.state.available}
          {...this.props}>
          {this.props.children}
        </WrappedComponent>
      );
    }
  };
};
