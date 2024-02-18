import {POLYGON_DATA_FEED_CONTRACT} from '@env';
import {ethers} from 'ethers';
import React, {Component} from 'react';
import {Pressable, RefreshControl, ScrollView, Text, View} from 'react-native';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import {abiDataFeeds} from '../../../contracts/dataFeeds';
import IERC20 from '@openzeppelin/contracts/build/contracts/IERC20Metadata.json';
import GlobalStyles, {baseColor} from '../../../styles/styles';
import {EVM} from '../../../utils/constants';
import ContextModule from '../../../utils/contextModule';
import {
  arraySum,
  epsilonRound,
  getAsyncStorageValue,
  setAsyncStorageValue,
} from '../../../utils/utils';

import NfcManager from 'react-native-nfc-manager';

class Tab1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: Math.random(),
      refreshing: false,
      heliport: false,
      publicKey: '0x0000000000000000000000000000000000000000',
      balances: [0, 0, 0, 0],
      usdConversion: [1, 1, 1, 1],
    };
    this.provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
  }
  static contextType = ContextModule;

  async componentDidMount() {
    const balances = await getAsyncStorageValue('balances');
    const usdConversion = await getAsyncStorageValue('usdConversion');
    await this.setStateAsync({
      balances: balances ?? [0, 0, 0, 0],
      usdConversion: usdConversion ?? [1, 1, 1, 1],
    });
    const refreshCheck = Date.now();
    const lastRefresh = await this.getLastRefresh();
    if (refreshCheck - lastRefresh >= 1000 * 60 * 2.5) {
      await setAsyncStorageValue({lastRefresh: Date.now().toString()});
      this.refresh();
    } else {
      console.log(
        `Next refresh Available: ${Math.round(
          (1000 * 60 * 2.5 - (refreshCheck - lastRefresh)) / 1000,
        )} Seconds`,
      );
    }
  }

  async setStateAsync(value) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () => resolve(),
      );
    });
  }

  async refresh() {
    await this.setStateAsync({refreshing: true});
    await this.getBalances();
    await this.getUSD();
    await this.setStateAsync({refreshing: false});
  }

  async getBalances() {
    let balanceETH = await this.provider.getBalance(
      this.context.value.publicKey,
    );
    balanceETH = parseFloat(ethers.utils.formatEther(balanceETH));
    let tokenBalances = await Promise.all(
      EVM.tokens.slice(1).map(
        token =>
          new Promise(async resolve => {
            const contract = new ethers.Contract(
              token.address,
              IERC20.abi,
              this.provider,
            );
            let balance = await contract.balanceOf(
              this.context.value.publicKey,
            );
            balance = parseFloat(
              ethers.utils.formatUnits(balance, token.decimals),
            );
            resolve(balance);
          }),
      ),
    );
    this.setState({balances: [balanceETH, ...tokenBalances]});
    await setAsyncStorageValue({balances: this.state.balances});
  }

  async getUSD() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://polygon-mainnet.g.alchemy.com/v2/bKQTjG-gPiywyFe748IzezZI9bH8We7z',
      );
      const dataFeeds = new ethers.Contract(
        POLYGON_DATA_FEED_CONTRACT,
        abiDataFeeds,
        provider,
      );
      const feedsUSD = await dataFeeds.getLatestPrices();
      const usdPrices = feedsUSD[0].map(
        (item, index) => parseFloat(item) * Math.pow(10, -feedsUSD[1][index]),
      );
      const res = {
        ETH: usdPrices[8],
        USDT: usdPrices[13],
        USDC: usdPrices[12],
        WBTC: usdPrices[4],
      };
      this.setState({
        usdConversion: [res.ETH, res.USDC, res.USDT, res.WBTC, res.ETH],
      });
      await setAsyncStorageValue({usdConversion: this.state.usdConversion});
    } catch (err) {
      console.log(err);
    }
  }

  async getLastRefresh() {
    try {
      const lastRefresh = await getAsyncStorageValue('lastRefresh');
      if (lastRefresh === null) throw 'Set First Date';
      return lastRefresh;
    } catch (err) {
      await setAsyncStorageValue({lastRefresh: '0'.toString()});
      return 0;
    }
  }

  render() {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
        }}
        key={this.state.refresh}>
        <View style={GlobalStyles.tab1Container1}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 30,
                fontFamily: 'Exo2-Regular',
                color: 'white',
              }}>
              Balance
            </Text>
            <Text
              style={{
                fontSize: 38,
                color: 'white',
                fontFamily: 'Exo2-Regular',
              }}>
              {`$ ${epsilonRound(
                arraySum(
                  this.state.balances.map(
                    (x, i) => x * this.state.usdConversion[i],
                  ),
                ),
                2,
              )} USD`}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '100%',
            }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Pressable
                onPress={() => this.props.navigation.navigate('Send')}
                style={GlobalStyles.singleButton}>
                <IconIonicons
                  name="arrow-up-outline"
                  size={30}
                  color={'white'}
                />
              </Pressable>
              <Text style={GlobalStyles.singleButtonText}>Send</Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Pressable
                onPress={() => this.props.navigation.navigate('Deposit')}
                style={GlobalStyles.singleButton}>
                <IconIonicons
                  name="arrow-down-outline"
                  size={30}
                  color={'white'}
                />
              </Pressable>
              <Text style={GlobalStyles.singleButtonText}>Receive</Text>
            </View>
          </View>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              progressBackgroundColor={baseColor}
              refreshing={this.state.refreshing}
              onRefresh={async () => {
                await setAsyncStorageValue({
                  lastRefresh: Date.now().toString(),
                });
                await this.refresh();
              }}
            />
          }
          showsVerticalScrollIndicator={false}
          style={GlobalStyles.tab1Container2}
          contentContainerStyle={{
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          {EVM.tokens.map((token, index) => (
            <View key={index} style={GlobalStyles.network}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                <View style={{marginHorizontal: 20}}>
                  <View>{token.icon}</View>
                </View>
                <View style={{justifyContent: 'center'}}>
                  <Text style={{fontSize: 18, color: 'white'}}>
                    {token.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    <Text style={{fontSize: 12, color: 'white'}}>
                      {this.state.balances[index] === 0
                        ? '0'
                        : this.state.balances[index] < 0.001
                        ? '<0.001'
                        : epsilonRound(this.state.balances[index], 3)}{' '}
                      {token.symbol}
                    </Text>
                    <Text style={{fontSize: 12, color: 'white'}}>
                      {`  -  ($${epsilonRound(
                        this.state.usdConversion[index],
                        0,
                      )} USD)`}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{marginHorizontal: 20}}>
                <Text style={{color: 'white'}}>
                  $
                  {epsilonRound(
                    this.state.balances[index] *
                      this.state.usdConversion[index],
                    2,
                  )}{' '}
                  USD
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

export default Tab1;
