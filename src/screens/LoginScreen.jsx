/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {authenticate} from '../api/api';

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    const user = await authenticate();
    console.log('User:', user);
    console.log('Email:', email);
    if (user) {
      navigation.navigate('Chat', {
        displayName: user.displayName,
        selfLink: user.self,
      });
    } else {
      alert('Authentication failed');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#4a90e2',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(45deg, #4a90e2, #63b8ff)',
      }}>
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 10,
          padding: 20,
          width: '80%',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <Text style={{fontSize: 24, color: '#4a90e2', marginBottom: 20}}>
          Jira Login
        </Text>
        <TextInput
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderBottomColor: '#4a90e2',
            marginBottom: 20,
            paddingVertical: 5,
          }}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#4a90e2',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
          }}
          onPress={handleLogin}>
          <Text style={{color: 'white', fontSize: 16}}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
