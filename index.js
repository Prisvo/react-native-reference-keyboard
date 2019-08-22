import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  Keyboard,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';

import Touchable from 'react-native-platform-touchable';

export default class modalKeyboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      openFriends: false,
      friends: [],
      textInput: 0,
    }
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => this._keyboardDidShow(),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => this._keyboardDidHide(),
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {

  }

  _submit() {
    this.props.submit(this.state.text);
    this.setState({text: ''});
    if(this.textInput){this.textInput.clear();}
  }

  _keyboardDidHide() {
    this.setState({text: ''});
    if(this.textInput){this.textInput.clear();}
    this.props.closeModal();
  }

  _levenshteinDistance(a, b) {
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i += 1) {
      distanceMatrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j += 1) {
      distanceMatrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        distanceMatrix[j][i] = Math.min(
          distanceMatrix[j][i - 1] + 1,
          distanceMatrix[j - 1][i] + 1,
          distanceMatrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return distanceMatrix[b.length][a.length];
  }

  _setFriend(item) {
    let words = this.state.text.split(' ');
    let lastWord = words[words.length -1];
    let body = '';

    for(var i = 0 ; i < words.length -1 ; i++) {
      body += words[i] + ' ';
    }

    body += '@' + item.nickname + ' ';

    this.setState({
      text: body,
      friendsVisible: false,
    })
  }

  _renderItem = ({item, index}) => (
    <Touchable onPress={() => this._setFriend(item)}>
      <View style={[styles.userFriendContainer,
                              index == 0 ? {backgroundColor: '#E0E0E0'} :  {backgroundColor: '#FFF'}]}>
        <Image source={{uri: item.avatar}}
               style={[styles.userFriendImage, this.props.userFriendImage]}/>
        <View style={[styles.userFriendName, this.props.userFriendName]}>
          <Text style={[styles.userFriendNameText, this.props.userFriendNameText]}>{ item.name }</Text>
          <Text style={[styles.userFriendNickname, this.props.userFriendNickname]}>{ item.nickname }</Text>
        </View>
      </View>
    </Touchable>
  );

  _filterFriends(lastWord) {
    var friends = [],
        listIn = [],
        listOut = [],
        everyWord = [];

    for (var i = 0; i < this.props.friends.length ; i++) {
      everyWord.push({key: this.props.friends[i].nickname, friend: this.props.friends[i]});
      everyWord.push({key: this.props.friends[i].name, friend: this.props.friends[i]});
    }

    for (var i = 0; i < everyWord.length ; i++) {
      if(everyWord[i].key.toLowerCase().startsWith(lastWord.slice(1))) {
        listIn.push(everyWord[i]);
      } else {
        listOut.push(everyWord[i]);
      }
    }

    listIn.sort(function(a, b){
      return a.key > b.key;
    })

    for(var i = 0 ; i < listOut.length; i++) {
      listOut[i].valor = this._levenshteinDistance(lastWord, '@' + listOut[i].key);
    }

    listOut.sort(function(a, b){
      return a.valor - b.valor;
    })

    var tempList = {};

    for (var i = 0 ; i < listIn.length ; i++) {
      tempList[listIn[i].friend.nickname] = listIn[i].friend;
    }

    for (var i = 0 ; i < listOut.length ; i++) {
      tempList[listOut[i].friend.nickname] = listOut[i].friend;
    }

    for (var key in tempList) {
      friends.push(tempList[key]);
    }

    return friends;
  }

  _processText(text) {
    let words = text.split(' ');
    let lastWord = words[words.length -1];
    let pattern = /^@[A-Za-z0-9._]+$/;

    let valid = pattern.test(lastWord);

    if(valid){

      friends = this._filterFriends(lastWord);


      this.setState({
        friends: friends,
        friendsVisible: true,
      })
    } else {
      this.setState({
        friendsVisible: false,
      })
    }

    this.setState({text});

  }

  render() {
    return (
      <Modal
          transparent={true}
          visible={this.props.modalVisible}
          style={[styles.container, this.props.container]}
          onRequestClose={() => {
            this.props.closeModal();
          }}>
          { this.state.friendsVisible ?
            <View style={[styles.flatContainer, this.props.flatContainer, {marginBottom: this.state.textInput}]}>
              <FlatList
                style={[styles.flat, this.props.flat]}
                ref={(ref) => { this.flatList = ref; }}
                data={this.state.friends}
                extraData={this.state}
                keyboardShouldPersistTaps={'always'}
                keyExtractor={(item, index) => index.toString()}
                renderItem={this._renderItem}/>
            </View>
             : null }
          <TextInput
            onLayout={(event) => {var {x, y, width, height} = event.nativeEvent.layout; this.setState({textInput: height})}}
            autoFocus={true}
            onChangeText={(text) => this._processText(text)}
            onSubmitEditing= {() => { this._submit(); }}
            value={this.state.text}
            blurOnSubmit={true}
            ref={input => { this.textInput = input }}
            enablesReturnKeyAutomatically={true}
            multiline={true}
            style={[styles.input, this.props.input]}/>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  userFriendNameText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 15,
  },
  input: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderColor: 'gray',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 2,
  },
  userFriendContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: 'center',
    flexDirection: 'row',
  },
  userFriendImage: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  flat: {
    width: '100%',
  },
  flatContainer: {
    width: '100%',
    borderRadius: 2,
    marginTop: 5,
  },
  userFriendName: {
    justifyContent: 'center',
    height: 30,
    paddingHorizontal: 18,
  },
  userFriendNickname: {
    fontSize: 12,
    color: 'gray'
  },
});
