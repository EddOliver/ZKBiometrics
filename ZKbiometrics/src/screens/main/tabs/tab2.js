import {POLYGON_DATA_FEED_CONTRACT} from '@env';
import IERC20 from '@openzeppelin/contracts/build/contracts/IERC20.json';
import {ethers} from 'ethers';
import nodejs from 'nodejs-mobile-react-native';
import React, {Component} from 'react';
import {Pressable, RefreshControl, ScrollView, Text, View} from 'react-native';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import {abiDataFeeds} from '../../../contracts/dataFeeds';
import GlobalStyles, {baseColor} from '../../../styles/styles';
import {EVM, VerifierAddress} from '../../../utils/constants';
import ContextModule from '../../../utils/contextModule';
import {
  arraySum,
  base64ToHex,
  epsilonRound,
  getAsyncStorageValue,
  getEncryptedStorageValue,
  setAsyncStorageValue,
  setEncryptedStorageValue,
} from '../../../utils/utils';

import ReactNativeBiometrics from 'react-native-biometrics';
import {zkAccountABI, zkAccountBytecode} from '../../../contracts/zkAccount';

class Tab2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: Math.random(),
      refreshing: false,
      publicKey: '0x0000000000000000000000000000000000000000',
      balances: [0, 0, 0],
      usdConversion: [1, 1, 1, 1],
    };
    this.provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
    this.proof = '';
  }
  static contextType = ContextModule;
  UNSAFE_componentWillMount() {
    nodejs.start('main.js');
    nodejs.channel.addListener(
      'message',
      msg => {
        if (msg.topic === 'init') {
          console.log(msg.message);
        } else if (msg.topic === 'zkProof') {
          this.proof = msg.message;
        }
      },
      this,
    );
  }

  async componentDidMount() {
    const zkPublicKey =
      (await getAsyncStorageValue('zkPublicKey')) ??
      '0x0000000000000000000000000000000000000000';
    const balances = await getAsyncStorageValue('zkBalances');
    const usdConversion = await getAsyncStorageValue('usdConversion');
    await this.setStateAsync({
      balances: balances ?? [0, 0, 0, 0],
      usdConversion: usdConversion ?? [1, 1, 1, 1],
    });
    if (zkPublicKey !== '0x0000000000000000000000000000000000000000') {
      const refreshCheck = Date.now();
      const lastRefresh = await this.getLastRefresh();
      if (refreshCheck - lastRefresh >= 1000 * 60 * 2.5) {
        await setAsyncStorageValue({lastRefreshZK: Date.now().toString()});
        this.refresh();
      } else {
        console.log(
          `Next refresh Available: ${Math.round(
            (1000 * 60 * 2.5 - (refreshCheck - lastRefresh)) / 1000,
          )} Seconds`,
        );
      }
    }
  }

  async createZKaccount() {
    try {
      const privateKey = await getEncryptedStorageValue('privateKey');
      const signer = new ethers.Wallet(privateKey, this.provider);
      const factory = new ethers.ContractFactory(
        zkAccountABI,
        zkAccountBytecode,
        signer,
      );
      const contract = await factory.deploy(VerifierAddress);
      await setAsyncStorageValue({
        zkPublicKey: contract.address,
      });
      await this.context.setValueAsync({
        zkPublicKey: contract.address,
      });
      await contract.deployTransaction.wait();
      await this.setStateAsync({
        publicKey: contract.address,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async checkBiometrics() {
    const rnBiometrics = new ReactNativeBiometrics();
    rnBiometrics
      .simplePrompt({promptMessage: 'Confirm fingerprint'})
      .then(() => {
        rnBiometrics.createKeys().then(async resultObject => {
          const {publicKey} = resultObject;
          const ZK_key = '0x' + base64ToHex(publicKey).slice(0, 42);
          await setEncryptedStorageValue({ZK_key});
          nodejs.channel.send({
            topic: 'zkProof',
            message: {
              hash: ZK_key,
              address: this.context.value.publicKey,
            },
          });
          await new Promise(resolve => {
            const interval = setInterval(() => {
              if (this.proof !== '') {
                clearInterval(interval);
                resolve();
              }
            }, 1000);
          });
          await setEncryptedStorageValue({
            zkProof: this.proof,
          });
          await this.createZKaccount();
          await this.setStateAsync({
            loading: false,
          });
        });
      })
      .catch(() => {
        console.log('biometrics failed');
      });
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
      this.context.value.zkPublicKey,
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
              this.context.value.zkPublicKey,
            );
            balance = parseFloat(
              ethers.utils.formatUnits(balance, token.decimals),
            );
            resolve(balance);
          }),
      ),
    );
    this.setState({balances: [balanceETH, ...tokenBalances]});
    await setAsyncStorageValue({zkBalances: this.state.balances});
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
      const lastRefresh = await getAsyncStorageValue('lastRefreshZK');
      if (lastRefresh === null) throw 'Set First Date';
      return lastRefresh;
    } catch (err) {
      await setAsyncStorageValue({lastRefreshZK: '0'.toString()});
      return 0;
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.context.value.zkPublicKey === null ? (
          <View
            style={[
              GlobalStyles.container,
              {justifyContent: 'center', alignItems: 'center', gap: 20},
            ]}>
            <Text
              style={{
                fontSize: 30,
                fontFamily: 'Exo2-Regular',
                color: 'white',
              }}>
              Create your ZKwallet
            </Text>
            <Pressable
              disabled={this.state.loading}
              style={[
                GlobalStyles.buttonStyle,
                this.state.loading ? {opacity: 0.5} : {},
              ]}
              onPress={async () => {
                await this.setStateAsync({
                  loading: true,
                });
                this.checkBiometrics();
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold',
                }}>
                Create
              </Text>
            </Pressable>
          </View>
        ) : (
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
                    onPress={() => this.props.navigation.navigate('SendZK')}
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
                    onPress={() => this.props.navigation.navigate('DepositZK')}
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
                      lastRefreshZK: Date.now().toString(),
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
        )}
      </React.Fragment>
    );
  }
}

export default Tab2;
