// Basic Imports
import React, {Component} from 'react';
import {Dimensions, Image, Pressable, Text, View} from 'react-native';
// Styles
import GlobalStyles from '../../../styles/styles';
// Utils
import {ethers} from 'ethers';
import reactAutobind from 'react-autobind';
import ReactNativeBiometrics from 'react-native-biometrics';
import Icon from 'react-native-vector-icons/Entypo';
import ContextModule from '../../../utils/contextModule';
import {getEncryptedStorageValue} from '../../../utils/utils';
import logoNative from '../../../assets/logoNative.png';

const baseStateCryptoSign = {
  biometrics: false,
  clear: false,
  pin: '',
};

class CryptoSignBT extends Component {
  constructor(props) {
    super(props);
    this.state = baseStateCryptoSign;
    reactAutobind(this);
  }

  static contextType = ContextModule;

  async signTransaction() {
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      const wallet = new ethers.Wallet(privateKey);
      const serializedSignedTx = await wallet.signTransaction(
        this.props.transaction,
      );
      this.props.signEthereum(serializedSignedTx);
    } catch (e) {
      console.log(e);
      this.props.cancelTrans();
    }
  }

  async checkPin(pin) {
    return new Promise(async resolve => {
      const myPin = await getEncryptedStorageValue('pin');
      if (myPin) {
        if (myPin === pin) {
          resolve(true);
        }
        resolve(false);
      } else {
        resolve(false);
      }
    });
  }

  async checkBiometrics() {
    return new Promise(async resolve => {
      const rnBiometrics = new ReactNativeBiometrics();
      rnBiometrics
        .simplePrompt({promptMessage: 'Confirm fingerprint'})
        .then(resultObject => {
          const {success} = resultObject;
          if (success) {
            console.log('successful biometrics provided');
            this.signTransaction();
            resolve(true);
          } else {
            console.log('user cancelled biometric prompt');
            resolve(false);
          }
        })
        .catch(() => {
          console.log('biometrics failed');
          resolve(false);
        });
    });
  }

  async changeText(val) {
    if (val.length < 4) {
      this.setState({
        pin: val,
      });
    }
    if (val.length === 4) {
      const flag = await this.checkPin(val);
      flag ? this.signTransaction() : await this.resetKeyboard();
    }
  }

  resetKeyboard() {
    return new Promise((resolve, reject) => {
      this.setState(
        {
          clear: true,
        },
        () =>
          this.setState(
            {
              clear: false,
              pin: '',
            },
            () => resolve('ok'),
          ),
      );
    });
  }

  render() {
    return (
      <React.Fragment>
        <Text style={GlobalStyles.title}>Sign with{"\n"}Native Module</Text>
        <Pressable
          onPress={() => {
            this.checkBiometrics();
          }}>
          <Image
            resizeMode="contain"
            source={logoNative}
            alt="Main Logo"
            style={{
              width: Dimensions.get('window').width / 2,
              height: Dimensions.get('window').width / 2,
              marginVertical: 0,
            }}
          />
        </Pressable>
      </React.Fragment>
    );
  }
}

export default CryptoSignBT;
