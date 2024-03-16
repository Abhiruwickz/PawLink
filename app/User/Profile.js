import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { getDatabase, ref as dbRef, get } from "firebase/database";
import { FIREBASE_APP, FIREBASE_AUTH } from "../../FirebaseConfig";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system"; // Import FileSystem]
import { update } from "firebase/database";
import { updateProfile } from "firebase/auth";

const dbStorage = getStorage(FIREBASE_APP);
const dbRealtime = getDatabase(FIREBASE_APP);

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const user = FIREBASE_AUTH.currentUser;

  // Pick an image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const UploadMedia = async () => {
    try {
      if (!image) {
        throw new Error("No image selected. Click on the photo to select one.");
      }

      // Check if the image is empty
      const { uri } = await FileSystem.getInfoAsync(image); // Get the image info
      const response = await fetch(uri); // Fetch the image
      const blob = await response.blob(); // Convert the image to a blob

      const filename = image.substring(image.lastIndexOf("/") + 1); // Get the filename
      const storageRef = ref(dbStorage, "ProfilePictures/" + filename); // Create a storage reference
      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(storageRef);

      // Update the user's photoURL in Firebase Authentication
      const user = FIREBASE_AUTH.currentUser;
      await updateProfile(user, {
        photoURL: `${url}`,
      });

      // Reload the user
      user.reload();

      // Save data to Realtime Database
      const databaseRef = dbRef(dbRealtime, `Users/${user.uid}`);
      await update(databaseRef, {
        profilePicture: url,
      });

      // Show an alert and reset the state
      console.log("Photo Uploaded Successfully! ");
      setUploading(false);
      Alert.alert("Photo Uploaded!!!");

      // Reset the state
      setImage(null);
    } catch (error) {
      setUploading(false);
      alert(error.message);
    }
  };

  // Fetch the user's data from the Realtime Database
  useEffect(() => {
    const fetchUserData = async () => {
      const user = FIREBASE_AUTH.currentUser;
      const databaseRef = dbRef(dbRealtime, `Users/${user.uid}`);
      const snapshot = await get(databaseRef);
      setUserData(snapshot.val());
    };
    fetchUserData();
  }, []);

  // Fetch the Veterinarian's data from the Realtime Database
  useEffect(() => {
    const fetchVetData = async () => {
      const user = FIREBASE_AUTH.currentUser;
      const databaseRef = dbRef(dbRealtime, `Veterinarians/${user.uid}`);
      const snapshot = await get(databaseRef);

      // Merge the user data if the user is a Veterinarian
      if (snapshot.exists()) {
        setUserData((prevData) => ({
          ...prevData,
          ...snapshot.val(),
          UserType: "Veterinarian",
        }));
      }
    };
    fetchVetData();
  }, []);

  // Log out the user
  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Yes", onPress: () => logout() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // If the user is a Veterinarian, show the "Vet Bookings" button
  const VetBookings = userData?.UserType === "Veterinarian" && (
    <TouchableOpacity
      onPress={() => router.navigate("../../Veterinarian")}
      className="bg-green-500 px-4 py-2 rounded-xl"
    >
      <Text className="text-white text-center">Vet Bookings</Text>
    </TouchableOpacity>
  );

  // Take them back to sign up page by routing method
  const logout = () => {
    router.replace("../User/SignIn");
  };

  return (
    <View style={styles.container}>
      {/* If the user has a profile picture, show it */}
      <TouchableOpacity onPress={pickImage}>
        {user?.photoURL && (
          <Image source={{ uri: user.photoURL }} style={styles.selectedImage} />
        )}

        {/* If the user does not have a profile picture, show the placeholder */}
        {!user?.photoURL && <View style={styles.placeholderImage} />}
      </TouchableOpacity>

      {/* If the user has a profile picture, show the "Update Profile Picture" button */}
      <View className="gap-3 mb-8">
        <TouchableOpacity
          onPress={UploadMedia}
          className="items-center bg-blue-600 rounded-xl px-4 py-2"
        >
          <Text className="text-white"> Update Profile Picture </Text>
        </TouchableOpacity>

        {/* Display the Vet Booking button */}
        {VetBookings}
      </View>

      <View style={styles.profileBox}>
        <Text style={styles.label}>Your Account Name:</Text>
        <Text style={styles.userData}>{user.displayName}</Text>

        <Text style={styles.label}>Your Email:</Text>
        <Text style={styles.userData}>{user.email}</Text>

        <View style={styles.userTypeContainer}>
          <View style={styles.userTypeBox}>
            <Text style={styles.userType}>
              {" "}
              {userData?.UserType ? userData.UserType : "Veterinarian"}{" "}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  selectedImage: {
    top: -40,
    width: 150,
    height: 150,
    resizeMode: "cover",
    borderRadius: 100,
  },
  placeholderImage: {
    top: -70,
    width: 150,
    height: 150,
    backgroundColor: "#ccc", // Placeholder color
    borderRadius: 100,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileBox: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333", // Dark gray text color
  },
  userData: {
    fontSize: 16,
    marginTop: 5,
    color: "#666", // Medium gray text color
  },
  userTypeContainer: {
    marginTop: 20,
  },
  userTypeBox: {
    backgroundColor: "#FFD700", // Gold color
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  userType: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#333", // Dark gray text color
  },
  logoutButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    position: "absolute",
    bottom: 20,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ProfileScreen;

//Rochana Godigamuwa
//Start Date : 2024-02-18
