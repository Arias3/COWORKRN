import React, { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Snackbar, Surface, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/authContext";

export default function SignupScreen({ navigation }: { navigation: any }) {

  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("estudiante");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    // Reset status
    setError(null);
    setSuccess(false);

    // Basic validation: ensure email and password are present
    if (!email.trim() || !password) {
      setError("Completa tu email y contraseña");
      return;
    }

    try {
      setLoading(true);
      // Call the auth layer with the exact parameters it expects (email, password)
      await signup(email, password);

      // Show success snackbar first
      setSuccess(true);
      // Clear sensitive fields
      setPassword("");

        // Open verification dialog so user can enter 6-digit code
        setDialogVisible(true);
    } catch (err: any) {
      console.error("Signup failed:", err);
      // Prefer backend error message when available
      const message = err?.message || String(err) || "No se pudo crear la cuenta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Keep ref for timeout so we can clear on unmount to avoid setting state on unmounted component
  const timeoutRef = useRef<any>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 40}
    >
      <ImageBackground
        source={require("../../../../../assets/images/login_bg.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Floating top-right button similar to Login */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Surface style={styles.registerSurface}>
            <Text style={styles.registerText}>Ingresa</Text>
          </Surface>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.bottomWrapper}>
            <Surface style={styles.surface}>
              <Text style={styles.title}>Regístrate</Text>

              <TextInput
                label="Nombre"
                value={name}
                onChangeText={setName}
                left={<TextInput.Icon icon="account-outline" color="#3B3576" />}
                style={styles.input}
                mode="flat"
              />

              <TextInput
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email-outline" color="#3B3576" />}
                style={styles.input}
                mode="flat"
              />

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="key-outline" color="#3B3576" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off-outline" : "eye-outline"}
                    color="#3B3576"
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                mode="flat"
              />

              <TextInput
                label="Tipo de cuenta"
                value={role === "estudiante" ? "Estudiante" : "Profesor"}
                left={<TextInput.Icon icon="school-outline" color="#3B3576" />}
                style={styles.input}
                editable={false}
                right={
                  <TextInput.Icon
                    icon="swap-vertical"
                    color="#3B3576"
                    onPress={() =>
                      setRole(role === "estudiante" ? "profesor" : "estudiante")
                    }
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleSignup}
                loading={loading}
                disabled={loading}
                buttonColor="#F7D86A"
                textColor="#3B3576"
                style={styles.submitButton}
              >
                Registrarse
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate("Login")}
                textColor="white"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            </Surface>
          </View>
        </ScrollView>

        {/* Snackbar de mensajes */}
        <Snackbar
          visible={!!error || success}
          onDismiss={() => {
            setError(null);
            setSuccess(false);
          }}
          duration={3000}
          style={{
            backgroundColor: error ? "red" : "green",
          }}
        >
          {error || "Cuenta creada exitosamente. Ahora puedes iniciar sesión."}
        </Snackbar>

        <Modal visible={dialogVisible} transparent animationType="fade" onRequestClose={() => setDialogVisible(false)}>
          <View style={modalStyles.overlay}>
            <View style={modalStyles.dialog}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Verificar correo</Text>
              <Text style={{ color: "#666", marginBottom: 8 }}>Ingresa el código de 6 dígitos enviado a tu correo.</Text>
              <TextInput
                label="Código"
                value={verificationCode}
                onChangeText={(t) => setVerificationCode(t.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                maxLength={6}
                style={{ marginBottom: 12, width: "100%" }}
              />

              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
                <Button
                  onPress={() => {
                    console.log("Verificar código:", verificationCode);
                    setDialogVisible(false);
                    setSuccess(true);
                    timeoutRef.current = setTimeout(() => {
                      navigation.replace("Login");
                    }, 1000);
                  }}
                >
                  Verificar
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1C22",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    alignItems: "flex-end",
    marginTop: 40,
    marginRight: 10,
  },
  topButton: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingVertical: 6,
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#3B3576",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  registerButton: {
    position: "absolute",
    top: 52,
    right: 0,
    zIndex: 10,
  },
  registerSurface: {
    backgroundColor: "#3B3576",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 24,
    paddingVertical: 9,
    elevation: 6,
  },
  registerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
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
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    marginBottom: 12,
    borderRadius: 16,
    width: 260,
    alignSelf: "center",
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 8,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
});
