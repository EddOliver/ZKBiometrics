import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {AppState} from 'react-native';
import ContextModule from './contextModule';
import {navigationHOC} from './navigationHOC';

const disabledScreens = ['Lock', 'Setup', 'CardPayment', 'SendZK'];

class AppStateListener extends Component {
  constructor(props) {
    super(props);
    this.listener = AppState.addEventListener(
      'change',
      this._handleAppStateChange,
    );
    reactAutobind(this);
  }

  static contextType = ContextModule;

  componentWillUnmount() {
    this.listener.remove();
  }

  _handleAppStateChange = nextAppState => {
    console.log('nextAppState', nextAppState);
    if (
      nextAppState === 'background' &&
      !disabledScreens.includes(this.context.value.page)
    ) {
      this.props.navigation.navigate('Lock');
    }
  };

  render() {
    return <></>;
  }
}

export default navigationHOC(AppStateListener);
