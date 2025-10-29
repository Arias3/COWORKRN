
import { useState } from "react";
import { View } from "react-native";
import { Button, Checkbox, Surface, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/authContext";


export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      if (!email || !password) {
        setError("Por favor ingresa tu email y contraseña");
        return;
      }

      const success = await login(email, password, rememberMe);

      if (!success) {
        setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      }
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 20, textAlign: "center" }}>
        Bienvenido! Inicia sesión
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Checkbox
          status={rememberMe ? 'checked' : 'unchecked'}
          onPress={() => setRememberMe(!rememberMe)}
        />
        <Text onPress={() => setRememberMe(!rememberMe)}>Recordarme</Text>
      </View>

      {error ? (
        <Text style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading || isLoading}
        disabled={loading || isLoading}
        style={{ marginBottom: 10 }}
      >
        Iniciar Sesión
      </Button>

      <Button mode="text" onPress={() => navigation.navigate('Signup')}>
        ¿No tienes cuenta? Regístrate
      </Button>

    </Surface>
  );
}
