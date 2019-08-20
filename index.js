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

  submit() {
    this.props.submit(this.state.text);
    this.setState({text: ''});
    if(this.textInput){this.textInput.clear();}
  }

  _keyboardDidHide() {
    this.setState({text: ''});
    if(this.textInput){this.textInput.clear();}
    this.props.closeModal();
  }

  levenshteinDistance(a, b) {
    // Create empty edit distance matrix for all possible modifications of
    // substrings of a to substrings of b.
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    // Fill the first row of the matrix.
    // If this is first row then we're transforming empty string to a.
    // In this case the number of transformations equals to size of a substring.
    for (let i = 0; i <= a.length; i += 1) {
      distanceMatrix[0][i] = i;
    }

    // Fill the first column of the matrix.
    // If this is first column then we're transforming empty string to b.
    // In this case the number of transformations equals to size of b substring.
    for (let j = 0; j <= b.length; j += 1) {
      distanceMatrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        distanceMatrix[j][i] = Math.min(
          distanceMatrix[j][i - 1] + 1, // deletion
          distanceMatrix[j - 1][i] + 1, // insertion
          distanceMatrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return distanceMatrix[b.length][a.length];
  } // code from https://github.com/trekhleb/javascript-algorithms/tree/master/src/algorithms/string/levenshtein-distance

  setFriend(item) {
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
    <TouchableOpacity onPress={() => this.setFriend(item)}
                      style={[styles.userFriendContainer,
                              this.props.userFriendContainer,
                              index == this.props.friends.length - 1 ? {backgroundColor: '#E0E0E0'} :  {backgroundColor: '#FFF'}]}>
      <Image source={{uri: item.avatar}}
             style={[styles.userFriendImage, this.props.userFriendImage]}/>
      <View style={[styles.userFriendName, this.props.userFriendName]}>
        <Text style={[styles.userFriendNameText, this.props.userFriendNameText]}>{ item.name }</Text>
        <Text style={[styles.userFriendNickname, this.props.userFriendNickname]}>{ item.nickname }</Text>
      </View>
    </TouchableOpacity>
  );

  filterFriends(lastWord) {
    var elements = [];
    var friends = [];

    for(var i = 0 ; i < this.props.friends.length; i++) {
      elements.push({'valor': this.levenshteinDistance(lastWord, '@' + this.props.friends[i].nickname) , 'friend': this.props.friends[i]});
    }

    elements.sort(function(a, b){
      return a.valor - b.valor;
    })

    for(var i = 0 ; i < elements.length ; i++) {
      friends.push(elements[i].friend);
    }

    return friends;
  }

  processText(text) {
    let words = text.split(' ');
    let lastWord = words[words.length -1];
    let pattern = /^@[A-Za-z0-9._]+$/;

    let valid = pattern.test(lastWord);

    if(valid){

      friends = this.filterFriends(lastWord);


      this.setState({
        friends: friends,
        friendsVisible: true,
      }, () => {
        this.flatList.scrollToEnd();
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
                data={this.state.friends.reverse()}
                extraData={this.state}
                keyboardShouldPersistTaps={'always'}
                keyExtractor={(item, index) => index.toString()}
                renderItem={this._renderItem}/>
            </View>
             : null
          }
          {this.props.modalVisible ?
            <TextInput
              onLayout={(event) => {var {x, y, width, height} = event.nativeEvent.layout; this.setState({textInput: height})}}
              autoFocus={true}
              onChangeText={(text) => this.processText(text)}
              onSubmitEditing= {() => { this.submit(); }}
              value={this.state.text}
              blurOnSubmit={true}
              ref={input => { this.textInput = input }}
              enablesReturnKeyAutomatically={true}
              multiline={true}
              style={[styles.input, this.props.input]}/> : null}
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
    color: 'black'
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
  },
  userFriendName: {
    justifyContent: 'center',
    height: 30,
    paddingHorizontal: 20,
  },
  userFriendNickname: {
    fontSize: 11,
    color: 'gray'
  },
});
