import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />

      <Pressable
        style = {styles.button}
        onPress={() => console.log("Login pressed")}
      >
        <Text style = {styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 'auto',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 80%)',
    borderRadius: 10,
    padding: 20,
  },
  header: {
    fontSize: 30,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 80%)',
    borderRadius: 10,
    width: 250,
    padding: 10,
    marginBottom: 10,
  },
  button:{
    backgroundColor: 'hsl(247, 83%, 66%)',
    borderWidth: 2,
    borderColor: 'hsl(247, 83%, 33%)',
    borderRadius: 10,

    width: 250,
    padding: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText:{
    color: 'white',
  }
});