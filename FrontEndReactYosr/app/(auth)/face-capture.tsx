import React, { useRef } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import GradientButton from "../../components/GradientButtonCreateAcc";
import { registerFace } from "../../services/face";

export default function FaceCaptureScreen() {
 console.log("FACE CAPTURE SCREEN OPENED");
  const router = useRouter();

  const { userId } = useLocalSearchParams();

  const [permission, requestPermission] = useCameraPermissions();
    console.log("CAMERA PERMISSION:", permission);

  const cameraRef = useRef<CameraView>(null);

if (!permission) {
 return (
  <View style={styles.container}>
    <Text style={{color:"white"}}>
      Loading camera...
    </Text>
  </View>
 );
}

 if (!permission.granted) {

  return (
    <View style={styles.container}>
      <Text style={{color:"white", marginBottom:20}}>
        Camera permission required
      </Text>

      <GradientButton
        title="Autoriser la caméra"
        onPress={async()=>{
          const result = await requestPermission();
          console.log("PERMISSION RESULT:", result);
        }}
      />
    </View>
  );

}

  const takePicture = async () => {

    if (!cameraRef.current) return;

    try {

      const photo = await cameraRef.current.takePictureAsync();

      if (!photo) return;

      await registerFace(Number(userId), photo.uri);

      Alert.alert(
        "Succès",
        "Visage enregistré",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/login");
            },
          },
        ]
      );

    } catch (e) {

      console.log(e);

      Alert.alert("Erreur", "Impossible d'envoyer la photo");

    }

  };

  return (
    <View style={styles.container}>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      />

      <View style={styles.buttonContainer}>

        <GradientButton
          title="Prendre la photo"
          onPress={takePicture}
        />

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  camera: {
    flex: 1,
  },

  buttonContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    paddingHorizontal: 20,
  },

});