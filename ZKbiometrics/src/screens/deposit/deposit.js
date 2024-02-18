import Clipboard from '@react-native-clipboard/clipboard';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import Renders from '../../assets/logo.png';
import GlobalStyles, {ratio} from '../../styles/styles';
import ContextModule from '../../utils/contextModule';

class Deposit extends Component {
  constructor(props) {
    super(props);
    reactAutobind(this);
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      console.log(this.props.route.name);
      await this.context.setValueAsync({
        page: this.props.route.name,
      });
    });
  }

  render() {
    return (
      <View style={GlobalStyles.container}>
        <View
          style={[
            GlobalStyles.headerMain,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
            },
          ]}>
          <View style={GlobalStyles.headerItem}>
            <Image
              source={Renders}
              alt="Cat"
              style={{width: 304 / 6, height: 342 / 6, marginLeft: 20}}
            />
          </View>
          <View style={GlobalStyles.headerItem} />
          <View style={GlobalStyles.headerItem}>
            <Pressable
              style={GlobalStyles.buttonLogoutStyle}
              onPress={() => {
                this.props.navigation.goBack();
              }}>
              <Text style={GlobalStyles.headerTextButton}>Return</Text>
            </Pressable>
          </View>
        </View>
        <View
          style={[
            GlobalStyles.mainSend,
            {justifyContent: 'space-around', alignItems: 'center'},
          ]}>
          <View>
            <Text style={GlobalStyles.exoTitle}>
              Receive Scroll native{'\n'}or ERC-20 Tokens
            </Text>
          </View>
          <QRCodeStyled
            maxSize={Dimensions.get('screen').width * (ratio > 1.7 ? 0.8 : 0.5)}
            data={this.context.value.publicKey}
            style={[
              {
                backgroundColor: 'white',
                borderRadius: 10,
              },
            ]}
            errorCorrectionLevel="H"
            padding={16}
            //pieceSize={10}
            pieceBorderRadius={4}
            isPiecesGlued
            color={'black'}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: ratio > 1.7 ? 24 : 20,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                width: '85%',
              }}>
              {this.context.value.publicKey.substring(0, 21) +
                '\n' +
                this.context.value.publicKey.substring(21)}
            </Text>
            <Pressable
              onPress={() => {
                Clipboard.setString(this.context.value.publicKey);
                ToastAndroid.show(
                  'Address copied to clipboard',
                  ToastAndroid.LONG,
                );
              }}
              style={{
                width: '15%',
                alignItems: 'flex-start',
              }}>
              <IconIonicons name="copy" size={30} color={'white'} />
            </Pressable>
          </View>
          <Pressable
            style={GlobalStyles.buttonStyle}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

export default Deposit;
