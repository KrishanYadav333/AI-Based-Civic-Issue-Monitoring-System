import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Card, Chip, Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ISSUE_TYPES } from '../../config/constants';
import LocationService from '../../services/LocationService';
import databaseService from '../../services/DatabaseService';
import { Formik } from 'formik';
import * as Yup from 'yup';

const IssueSchema = Yup.object().shape({
  issueType: Yup.string().required('Please select an issue type'),
  description: Yup.string().min(10, 'Description must be at least 10 characters'),
});

import * as Notifications from 'expo-notifications';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ReportIssueScreen({ navigation, route }) {
  const [imageUri, setImageUri] = useState(route.params?.imageUri || null);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isOnline = useSelector(state => state.offline.isOnline);

  useEffect(() => {
    getLocation();

    // Register for push notifications
    registerForPushNotificationsAsync();

    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      if (data && data.issueId) {
        Alert.alert(
          notification.request.content.title,
          notification.request.content.body,
          [
            { text: 'View', onPress: () => navigation.navigate('IssueDetails', { id: data.issueId }) },
            { text: 'Close' }
          ]
        );
      }
    });

    return () => subscription.remove();
  }, []);

  async function registerForPushNotificationsAsync() {
    // In a real app, successful registration would send token to backend
    // user.update({ fcmToken: token });
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
    }
  }

  const getLocation = async () => {
    try {
      setLoadingLocation(true);
      const loc = await LocationService.getCurrentLocation();
      setLocation(loc);

      // Get address
      const address = await LocationService.reverseGeocode(
        loc.coords.latitude,
        loc.coords.longitude
      );
      setLocation({ ...loc, address });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Could not get current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSubmit = async (values) => {
    if (!imageUri) {
      Alert.alert('Error', 'Please capture or select an image');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      setSubmitting(true);

      // Save to local database (offline-first approach)
      const issueData = {
        imageUri,
        issueType: values.issueType,
        description: values.description,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: location.address || '',
      };

      const result = await databaseService.saveIssue(issueData);

      // Show success message
      const message = isOnline
        ? 'Issue submitted successfully! Syncing with server...'
        : 'Issue saved locally. Will sync when online.';

      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('History'),
        },
      ]);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit issue: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Formik
        initialValues={{ issueType: '', description: '' }}
        validationSchema={IssueSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
          <>
            {/* Image Section */}
            <Card style={styles.card}>
              <Card.Title title="Captured Image" />
              <Card.Content>
                {imageUri ? (
                  <View>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    <View style={styles.imageActions}>
                      <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('Camera')}
                        icon="camera"
                      >
                        Retake
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={pickImage}
                        icon="image"
                      >
                        Gallery
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noImage}>
                    <Ionicons name="image-outline" size={64} color="#ccc" />
                    <Text style={styles.noImageText}>No image captured</Text>
                    <View style={styles.imageActions}>
                      <Button
                        mode="contained"
                        onPress={() => navigation.navigate('Camera')}
                        icon="camera"
                      >
                        Take Photo
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={pickImage}
                        icon="image"
                      >
                        Gallery
                      </Button>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Issue Type Selection */}
            <Card style={styles.card}>
              <Card.Title title="Issue Type *" />
              <Card.Content>
                <View style={styles.chipsContainer}>
                  {ISSUE_TYPES.map((type) => (
                    <Chip
                      key={type.id}
                      selected={values.issueType === type.id}
                      onPress={() => setFieldValue('issueType', type.id)}
                      style={styles.chip}
                      mode="outlined"
                    >
                      {`${type.label} (${type.department})`}
                    </Chip>
                  ))}
                </View>
                {errors.issueType && touched.issueType && (
                  <Text style={styles.errorText}>{errors.issueType}</Text>
                )}
              </Card.Content>
            </Card>

            {/* Description */}
            <Card style={styles.card}>
              <Card.Title title="Description (Optional)" />
              <Card.Content>
                <TextInput
                  mode="outlined"
                  placeholder="Describe the issue in detail..."
                  value={values.description}
                  onChangeText={handleChange('description')}
                  multiline
                  numberOfLines={4}
                  error={errors.description && touched.description}
                />
                {errors.description && touched.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </Card.Content>
            </Card>

            {/* Location */}
            <Card style={styles.card}>
              <Card.Title title="Location" />
              <Card.Content>
                {loadingLocation ? (
                  <ActivityIndicator />
                ) : location ? (
                  <View>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={20} color="#2196F3" />
                      <Text style={styles.locationText}>
                        {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                      </Text>
                    </View>
                    {location.address && (
                      <Text style={styles.addressText}>{location.address}</Text>
                    )}
                    <Button
                      mode="text"
                      onPress={getLocation}
                      icon="refresh"
                    >
                      Refresh Location
                    </Button>
                  </View>
                ) : (
                  <View>
                    <Text>Location not available</Text>
                    <Button mode="contained" onPress={getLocation}>
                      Get Location
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Offline Indicator */}
            {!isOnline && (
              <Card style={[styles.card, styles.offlineCard]}>
                <Card.Content>
                  <View style={styles.offlineIndicator}>
                    <Ionicons name="cloud-offline" size={24} color="#FF9800" />
                    <Text style={styles.offlineText}>
                      You're offline. Issue will be synced when connection is restored.
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={submitting || !imageUri || !location}
              loading={submitting}
              style={styles.submitButton}
              icon="send"
            >
              Submit Issue
            </Button>
          </>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  noImage: {
    alignItems: 'center',
    padding: 20,
  },
  noImageText: {
    marginTop: 10,
    marginBottom: 20,
    color: '#999',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  addressText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  offlineCard: {
    backgroundColor: '#FFF3E0',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineText: {
    marginLeft: 10,
    flex: 1,
    color: '#E65100',
  },
  submitButton: {
    margin: 20,
    paddingVertical: 8,
  },
});
