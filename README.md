### Features

- UI interface to mention users

<img src="https://i.imgur.com/3CC6Jth.png" width="30%">.

# react-native-reference-keyboard


#### How install

`$ npm install https://github.com/vncsms/react-native-reference-keyboard`

#### How setUp

Need to create `closeModal()`, `submit()` and `openModal()` functions and bind them to constructor:

```javascript
  openModal() {
    this.setState({
      modalVisible: true,
    })
  }

  closeModal() {
    this.setState({
      modalVisible: false,
    })
  }

  submit(text) {
	console.log(text);
  }
```

And create a state variable `modalVisible` to control the interface visibility. The array friends need three valus: `name, avatar, nickname`, where `name` is the name of user.

```javascript
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      friends: [
      {name: 'Pernalonga', avatar: 'https://http2.mlstatic.com/dvds-todos-os-episodios-do-pernalonga-brindes-gratis-D_NQ_NP_763116-MLB27443951670_052018-F.jpg', nickname: 'perna'},
      {name: 'Julian Casablanca', avatar: 'https://sharegoodvibes.files.wordpress.com/2015/07/e654e-11421988_824703484326900_416923509_n.jpg?w=640', nickname: 'julao'},
      {name: 'Daft Punk', avatar: 'https://ksassets.timeincuk.net/wp/uploads/sites/55/2014/01/2013DaftPunkVoguePress230713.jpg', nickname: 'dafao'},
      {name: 'Fausto Silva', avatar: 'https://odia.ig.com.br/_midias/jpg/2019/07/05/700x470/1_faustao-11925845.jpg', nickname: 'oloco'},
      {name: 'Vitor Corleone', avatar: 'https://www.sideshow.com/photo/903718_sq.jpg', nickname: 'corleone'}]
    }

    this.closeModal = this.closeModal.bind(this);
    this.submit = this.submit.bind(this);
  }
```

How use:


```javascript
  render() {
    return (
      <View style={styles.container}>
        <ModalKeyboard modalVisible={this.state.modalVisible}
                       submit={this.submit}
                       friends={this.state.friends}
                       closeModal={this.closeModal}/>
        <TouchableOpacity
          style={{height: 40, width: '100%', borderColor: 'gray', borderWidth: 1}}
          onPress={() => this.openModal()}>
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
```
