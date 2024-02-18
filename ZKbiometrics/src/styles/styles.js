import {Dimensions, StatusBar, StyleSheet} from 'react-native';

export const header = 70;
export const footer = 60;

export const main = Dimensions.get('window').height - (header + footer);

const screenHeight = Dimensions.get('screen').height;
const windowHeight = Dimensions.get('window').height;

export const ratio =
  Dimensions.get('window').height / Dimensions.get('window').width;

export const StatusBarHeight = StatusBar.currentHeight;
export const NavigatorBarHeight = screenHeight - windowHeight;

export const baseColor = '#ffaf4d';

const GlobalStyles = StyleSheet.create({
  // Globals Layout
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  containerSafe: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  containerSafe2: {
    backgroundColor: '#000',
  },
  header: {
    height: header,
    width: Dimensions.get('window').width,
  },
  main: {
    height: main,
    width: Dimensions.get('window').width,
  },
  mainSend: {
    height: main,
    width: Dimensions.get('window').width,
    marginTop: header,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainComplete: {
    height: '100%',
  },
  footer: {
    width: Dimensions.get('window').width,
    height: footer,
  },
  // General text
  title: {
    fontSize: ratio > 1.7 ? 32 : 26,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Exo2-Bold',
  },
  description: {
    fontWeight: 'bold',
    fontSize: ratio > 1.7 ? 18 : 14,
    textAlign: 'center',
    color: '#555',
  },
  formTitle: {
    color: 'white',
    textAlign: 'left',
    textAlignVertical: 'center',
    fontFamily: 'Exo2-Bold',
    fontSize: 24,
  },
  exoTitle: {
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Exo2-Bold',
    fontSize: 24,
  },
  // Globals Buttons
  buttonStyle: {
    backgroundColor: baseColor,
    borderRadius: 50,
    padding: 10,
    width: Dimensions.get('window').width * 0.9,
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Exo2-Bold',
  },
  buttonLogoutStyle: {
    backgroundColor: baseColor,
    borderRadius: 50,
    padding: 10,
    width: Dimensions.get('window').width * 0.3,
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 2,
  },
  singleButton: {
    backgroundColor: baseColor,
    borderRadius: 50,
    width: ratio > 1.7 ? 60 : 50,
    height: ratio > 1.7 ? 60 : 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButtonText: {
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Exo2-Regular',
  },
  // Selectors
  selector: {
    borderColor: baseColor + 'aa',
    backgroundColor: baseColor,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    width: Dimensions.get('window').width * (1 / 3),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorSelected: {
    borderColor: baseColor,
    backgroundColor: 'white',
    borderWidth: 1,
    width: Dimensions.get('window').width * (1 / 3),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Exo2-Regular',
  },
  selectorSelectedText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Exo2-Regular',
  },
  // Main Modifiers
  headerMain: {
    height: header,
    width: Dimensions.get('window').width,
    borderBottomWidth: 1,
    borderBottomColor: baseColor,
    position: 'absolute',
    top: 0,
  },
  headerItem: {
    width: Dimensions.get('window').width / 3,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextButton: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Exo2-Bold',
  },
  footerMain: {
    width: Dimensions.get('window').width,
    height: footer,
    flexDirection: 'row',
  },
  tab1Container1: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: ratio > 1.7 ? main * 0.4 : main * 0.45,
  },
  tab1Container2: {
    height: ratio > 1.7 ? main * 0.6 : main * 0.55,
    marginBottom: StatusBarHeight,
  },
  // Tab 2
  tab2Container: {
    width: '100%',
    marginBottom: StatusBarHeight,
  },
  tab2ScrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 'auto',
  },
  // Networks
  network: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    height: 60,
    backgroundColor: '#555555',
    borderRadius: 10,
    marginVertical: 10,
  },
  // Send Styles
  input: {
    borderRadius: 5,
    width: '90%',
    borderColor: baseColor,
    borderWidth: 2,
    color: 'black',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 24,
    height: 50,
    marginBottom: 20,
    marginTop: 20,
  },
  // Modal
  singleModalButton: {
    backgroundColor: baseColor,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleModalButtonText: {
    fontSize: 24,
    color: 'white',
    marginVertical: 10,
  },
  // Savings Styles
  titleSaves: {
    fontSize: 18,
    color: '#fff',
    textAlignVertical: 'center',
    fontFamily: 'Exo2-Bold',
  },
});

export default GlobalStyles;
