import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Profile</Text>
      {user && (
        <View style={styles.userInfo}>
          <Text>Username: {user.username}</Text>
          <Text>Role: {user.role}</Text>
          <Text>Email: {user.email}</Text>
        </View>
      )}
      <Button mode="contained" onPress={handleLogout} style={styles.button}>
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  userInfo: {
    marginVertical: 20,
  },
  button: {
    marginTop: 20,
  },
});
