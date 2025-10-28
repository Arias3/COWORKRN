import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import {
  Button,
  Checkbox,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { useAuth } from "../context/authContext";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // Text color variables — cambia estos valores para ajustar el color del texto ingresado
  const emailTextColor = "#222222"; // color para el texto del input 'Usuario'
  const passwordTextColor = "#222222"; // color para el texto del input 'Contraseña'

  // Precargar credenciales guardadas (equivalente a precargarCredenciales())
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("email");
        const savedPassword = await AsyncStorage.getItem("password");
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRemember(true);
        }
      } catch (err) {
        console.error("Error al cargar credenciales guardadas:", err);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Completa tu email y contraseña");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);

      console.log("✅ Login exitoso");

      if (remember) {
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("password");
      }

      navigation.replace("Home");
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // Use 'padding' for both platforms to avoid a large empty area when keyboard opens
      behavior={"padding"}
      // Reduced offset so the view doesn't leave a large gap above the keyboard
      keyboardVerticalOffset={30}
    >
      <ImageBackground
        source={require("../../../../../assets/images/login_bg.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Botón superior "Regístrate" */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("Signup")}
          >
            <Surface style={styles.registerSurface}>
              <Text style={styles.registerText}>Regístrate</Text>
            </Surface>
          </TouchableOpacity>

          {/* Contenedor inferior (ahora dentro del ScrollView para subir con el teclado) */}
          <View style={styles.bottomWrapper}>
            <Surface style={styles.surface}>
              <Text style={styles.title}>Iniciar sesión</Text>

              <TextInput
                label="Usuario"
                value={email}
                onChangeText={setEmail}
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
                theme={{
                  colors: {
                    text: emailTextColor,
                    placeholder: "#666666",
                    primary: "#3B3576",
                  },
                }}
              />

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={hidePassword}
                left={<TextInput.Icon icon="key" />}
                right={
                  <TextInput.Icon
                    icon={hidePassword ? "eye-off" : "eye"}
                    onPress={() => setHidePassword(!hidePassword)}
                  />
                }
                style={styles.input}
                theme={{
                  colors: {
                    text: passwordTextColor,
                    placeholder: "#666666",
                    primary: "#3B3576",
                  },
                }}
              />

              {/* Checkbox recordar credenciales */}
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={remember ? "checked" : "unchecked"}
                  onPress={() => setRemember(!remember)}
                  color="#F7D86A"
                />
                <Text style={styles.checkboxText}>Recordarme</Text>
              </View>

              {/* Olvidaste contraseña */}
              <TouchableOpacity
                onPress={() => alert("🔄 Recuperación de contraseña en desarrollo")}
              >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {/* Botón de login */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                textColor="#3B3576"
                buttonColor="#F7D86A"
              >
                Iniciar sesión
              </Button>
            </Surface>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#1D1C22",
  },
  registerButton: {
    position: "absolute",
    top: 52, // moved a bit further down as requested
    right: 0, // flush to the right edge
    zIndex: 10,
  },
  registerSurface: {
    backgroundColor: "#3B3576",
    // Only left corners rounded
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 24,
    paddingVertical: 9,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  registerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  scrollView: {
    flex: 1,
  },
  bottomWrapper: {
    width: "100%",
  },
  surface: {
    backgroundColor: "#3B3576",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
  },
  title: {
    color: "#F7D86A",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    color: "#273151ff",
    width: 260,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxText: {
    color: "#FFFFFF",
  },
  forgotText: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  loginButton: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 4,
  },
});
