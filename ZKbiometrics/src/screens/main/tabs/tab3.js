import IERC721 from '@openzeppelin/contracts/build/contracts/IERC721Metadata.json';
import {ethers} from 'ethers';
import React, {Component} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import GlobalStyles, {footer, header} from '../../../styles/styles';
import {EVM} from '../../../utils/constants';
import ContextModule from '../../../utils/contextModule';
import {
  getAsyncStorageValue,
  getNFTS,
  ipfsToHttpV0,
  ipfsToHttpV1,
  setAsyncStorageValue,
} from '../../../utils/utils';

export default class Tab3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publicKey: '0x0000000000000000000000000000000000000000',
      loading: true,
      NFTs: [],
      open: false,
      nftSelected: 0,
    };
    this.provider = new ethers.providers.JsonRpcProvider(EVM.rpc);
  }

  static contextType = ContextModule;
  async componentDidMount() {
    let balance = await getAsyncStorageValue('nfts');
    await this.setStateAsync({
      NFTs: balance ?? [],
      loading: balance.length > 0 ? false : true,
    });
    let balanceMain = await getNFTS(this.context.value.publicKey);
    balanceMain = balanceMain.filter(token => token.type === 'ERC-721');
    let balanceZK = await getNFTS(this.context.value.zkPublicKey);
    balanceZK = balanceZK.filter(token => token.type === 'ERC-721');
    balance = [...balanceMain, ...balanceZK];
    let metadata = await Promise.all(
      balance.map(token => {
        return new Promise(async resolve => {
          const contract = new ethers.Contract(
            token.contractAddress,
            IERC721.abi,
            this.provider,
          );
          let uri = await contract.tokenURI(1);
          uri = ipfsToHttpV1(uri);
          uri = await fetch(uri);
          uri = await uri.json();
          resolve({
            ...uri,
            image: ipfsToHttpV0(uri.image),
          });
        });
      }),
    );
    balance = balance.map((token, index) => {
      return {
        ...token,
        ...metadata[index],
      };
    });
    await setAsyncStorageValue({nfts: balance});
    await this.setStateAsync({
      loading: false,
      NFTs: balance,
    });
  }

  // Utils
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

  render() {
    return (
      <View
        style={{
          width: Dimensions.get('window').width,
        }}>
        <ScrollView
          style={{height: '100%'}}
          contentContainerStyle={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
          {this.state.loading && (
            <Text
              style={[
                GlobalStyles.title,
                {
                  marginTop:
                    Dimensions.get('screen').height * 0.5 - header - footer,
                },
              ]}>
              Loading...
            </Text>
          )}
          {!this.state.loading && this.state.NFTs.length === 0 && (
            <Text
              style={[
                GlobalStyles.title,
                {
                  marginTop:
                    Dimensions.get('screen').height * 0.5 - header - footer,
                },
              ]}>
              No NFTs
            </Text>
          )}
          {this.state.open ? (
            <React.Fragment>
              <View
                style={{
                  width: '80%',
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Pressable
                  style={{
                    width: '100%',
                    height: Dimensions.get('window').width * 0.8,
                    margin: Dimensions.get('window').width * 0.1,
                  }}
                  onPress={() => this.setState({open: false})}>
                  <Image
                    source={{
                      uri: this.state.NFTs[this.state.nftSelected].image,
                    }}
                    style={{
                      borderRadius: 10,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </Pressable>
                <Text style={[GlobalStyles.title, {alignSelf: 'flex-start'}]}>
                  Name:
                </Text>
                <Text
                  style={[
                    GlobalStyles.description,
                    {
                      alignSelf: 'flex-start',
                      marginBottom: 10,
                      fontSize: 24,
                    },
                  ]}>
                  {this.state.NFTs[this.state.nftSelected].name}
                </Text>
                <Text
                  style={[
                    GlobalStyles.title,
                    {alignSelf: 'flex-start', fontSize: 24},
                  ]}>
                  Description:
                </Text>
                <Text
                  style={[
                    GlobalStyles.description,
                    {alignSelf: 'flex-start', textAlign: 'justify'},
                  ]}>
                  {this.state.NFTs[this.state.nftSelected].description}
                </Text>
              </View>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {this.state.NFTs.map((item, index) => {
                if (this.state.NFTs.length % 2 === 0) {
                  return (
                    <View
                      key={index}
                      style={{
                        width: Dimensions.get('window').width * 0.45,
                        height: Dimensions.get('window').width * 0.45,
                        margin: Dimensions.get('window').width * 0.025,
                        borderRadius: 10,
                        overflow: 'hidden',
                      }}>
                      <Pressable
                        onPress={() =>
                          this.setState({open: true, nftSelected: index})
                        }>
                        <Image
                          source={{uri: item.image}}
                          style={{width: '100%', height: '100%'}}
                        />
                      </Pressable>
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          padding: 10,
                        }}>
                        <Text style={{color: 'white'}}>{item.name}</Text>
                      </View>
                    </View>
                  );
                } else {
                  if (index === this.state.NFTs.length - 1) {
                    return (
                      <React.Fragment key={index}>
                        <View
                          key={index}
                          style={{
                            width: Dimensions.get('window').width * 0.45,
                            height: Dimensions.get('window').width * 0.45,
                            margin: Dimensions.get('window').width * 0.025,
                            borderRadius: 10,
                            overflow: 'hidden',
                          }}>
                          <Pressable
                            onPress={() =>
                              this.setState({open: true, nftSelected: index})
                            }>
                            <Image
                              source={{uri: item.image}}
                              style={{width: '100%', height: '100%'}}
                            />
                          </Pressable>
                          <View
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              padding: 10,
                            }}>
                            <Text style={{color: 'white'}}>{item.name}</Text>
                          </View>
                        </View>
                        <View
                          style={{
                            width: Dimensions.get('window').width * 0.45,
                            height: Dimensions.get('window').width * 0.45,
                            margin: Dimensions.get('window').width * 0.025,
                          }}
                        />
                      </React.Fragment>
                    );
                  } else {
                    return (
                      <View
                        key={index}
                        style={{
                          width: Dimensions.get('window').width * 0.45,
                          height: Dimensions.get('window').width * 0.45,
                          margin: Dimensions.get('window').width * 0.025,
                          borderRadius: 10,
                          overflow: 'hidden',
                        }}>
                        <Pressable
                          onPress={() =>
                            this.setState({open: true, nftSelected: index})
                          }>
                          <Image
                            source={{uri: item.image}}
                            style={{width: '100%', height: '100%'}}
                          />
                        </Pressable>
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            padding: 10,
                          }}>
                          <Text style={{color: 'white'}}>{item.name}</Text>
                        </View>
                      </View>
                    );
                  }
                }
              })}
            </React.Fragment>
          )}
        </ScrollView>
      </View>
    );
  }
}
