import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CaptureIssueScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const { API_URL } = useAuth();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to report issues');
        return;
      }

      // Request camera permission
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to capture issues');
        return;
      }

      // Get current location
      await getCurrentLocation();
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to get permissions');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const captureImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image');
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
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const submitIssue = async () => {
    if (!image) {
      Alert.alert('Error', 'Please capture an image first');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available. Please try again.');
      await getCurrentLocation();
      return;
    }

    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: `issue-${Date.now()}.jpg`
      });
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());

      // Submit to API
      const response = await axios.post(`${API_URL}/issues`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert(
        'Success',
        `Issue reported successfully!\nType: ${response.data.issueType}\nPriority: ${response.data.priority}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setImage(null);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to submit issue. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Location Status */}
        <View style={styles.locationCard}>
          <Icon name="location-on" size={24} color="#2563eb" />
          <View style={styles.locationInfo}>
            {locationLoading ? (
              <Text style={styles.locationText}>Getting location...</Text>
            ) : location ? (
              <>
                <Text style={styles.locationText}>Location Captured</Text>
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </>
            ) : (
              <Text style={styles.locationText}>Location unavailable</Text>
            )}
          </View>
          <TouchableOpacity onPress={getCurrentLocation}>
            <Icon name="refresh" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            >
              <Icon name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="image" size={64} color="#9ca3af" />
            <Text style={styles.placeholderText}>No image captured yet</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cameraButton]}
            onPress={captureImage}
            disabled={uploading}
          >
            <Icon name="camera-alt" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.galleryButton]}
            onPress={pickImage}
            disabled={uploading}
          >
            <Icon name="photo-library" size={24} color="#2563eb" />
            <Text style={[styles.buttonText, styles.galleryButtonText]}>
              Choose from Gallery
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!image || !location || uploading) && styles.submitButtonDisabled
          ]}
          onPress={submitIssue}
          disabled={!image || !location || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="send" size={24} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Issue Report</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="info" size={20} color="#2563eb" />
          <Text style={styles.infoText}>
            The AI will automatically detect and classify the issue type from your photo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 10,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  locationCoords: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444',
    borderRadius: 20,
    padding: 8,
  },
  placeholderContainer: {
    height: 300,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 10,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  cameraButton: {
    backgroundColor: '#2563eb',
  },
  galleryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  galleryButtonText: {
    color: '#2563eb',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 10,
    lineHeight: 20,
  },
});
