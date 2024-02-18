import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {Image, Pressable, SafeAreaView, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Renders from '../../assets/logo.png';
import GlobalStyles, {footer, header, main} from '../../styles/styles';
import ContextModule from '../../utils/contextModule';

// Tabs
import Tab1 from './tabs/tab1';
import Tab2 from './tabs/tab2';
import Tab3 from './tabs/tab3';

const BaseStateMain = {
  tab: 0, // 0
  mainHeight: main,
};

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = BaseStateMain;
    reactAutobind(this);
    this.once = true;
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      await this.context.setValueAsync({
        page: this.props.route.name,
      });
      console.log(this.props.route.name);
    });
  }

  render() {
    return (
      <SafeAreaView
        style={[GlobalStyles.container]}
        onLayout={e =>
          this.once &&
          this.setState(
            {mainHeight: e.nativeEvent.layout.height - header - footer},
            () => {
              this.once = false;
            },
          )
        }>
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
              alt="Logo"
              style={{width: 304 / 6, height: 342 / 6, marginLeft: 20}}
            />
          </View>
          <View style={GlobalStyles.headerItem} />
          <View style={GlobalStyles.headerItem}>
            <Pressable
              style={GlobalStyles.buttonLogoutStyle}
              onPress={() => {
                this.props.navigation.navigate('Lock');
              }}>
              <Text style={GlobalStyles.headerTextButton}>Lock</Text>
            </Pressable>
          </View>
        </View>
        <View style={[GlobalStyles.mainSend, {height: this.state.mainHeight}]}>
          {this.state.tab === 0 && <Tab1 {...this.props} />}
          {this.state.tab === 1 && <Tab2 navigation={this.props.navigation} />}
          {this.state.tab === 2 && <Tab3 navigation={this.props.navigation} />}
        </View>
        <View style={[GlobalStyles.footerMain]}>
          <Pressable
            style={[
              this.state.tab === 0
                ? GlobalStyles.selectorSelected
                : GlobalStyles.selector,
            ]}
            onPress={() =>
              this.setState({
                tab: 0,
              })
            }>
            <Icon
              name="account-balance-wallet"
              size={26}
              color={this.state.tab === 0 ? 'black' : 'white'}
            />
            <Text
              style={
                this.state.tab === 0
                  ? GlobalStyles.selectorSelectedText
                  : GlobalStyles.selectorText
              }>
              Wallet
            </Text>
          </Pressable>
          <Pressable
            style={[
              this.state.tab === 1
                ? GlobalStyles.selectorSelected
                : GlobalStyles.selector,
            ]}
            onPress={() =>
              this.setState({
                tab: 1,
              })
            }>
            <Icon
              name="attach-money"
              size={26}
              color={this.state.tab === 1 ? 'black' : 'white'}
            />
            <Text
              style={
                this.state.tab === 1
                  ? GlobalStyles.selectorSelectedText
                  : GlobalStyles.selectorText
              }>
              ZKwallet
            </Text>
          </Pressable>
          <Pressable
            style={[
              this.state.tab === 2
                ? GlobalStyles.selectorSelected
                : GlobalStyles.selector,
            ]}
            onPress={() =>
              this.setState({
                tab: 2,
              })
            }>
            <Icon
              name="image"
              size={26}
              color={this.state.tab === 2 ? 'black' : 'white'}
            />
            <Text
              style={
                this.state.tab === 2
                  ? GlobalStyles.selectorSelectedText
                  : GlobalStyles.selectorText
              }>
              NFTs
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

export default Main;
