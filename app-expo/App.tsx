import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import html from './src/appHtml';

// Captura erros de dentro da página e manda para o app, para aparecer na tela
const DIAGNOSTICO = `
(function(){
  function enviar(t){ try{ window.ReactNativeWebView.postMessage(JSON.stringify({erro:String(t)})); }catch(e){} }
  window.addEventListener('error', function(e){ enviar((e.message||'erro') + ' @' + (e.lineno||'?')); });
  window.addEventListener('unhandledrejection', function(e){ enviar('promise: ' + (e.reason && e.reason.message || e.reason)); });
  document.addEventListener('DOMContentLoaded', function(){ window.ReactNativeWebView.postMessage(JSON.stringify({ok:1})); });
})();
true;
`;

export default function App() {
  const [carregando, setCarregando] = useState(true);
  const [erros, setErros] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Pede o microfone sem travar a abertura do app
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).catch(() => {});
    }
    // Se em 15 s a página não avisar que abriu, mostra o aviso
    timer.current = setTimeout(() => {
      setErros(e => (e.length ? e : ['A página não terminou de abrir em 15 s.']));
    }, 15000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const pronto = () => {
    setCarregando(false);
    if (timer.current) clearTimeout(timer.current);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <WebView
          style={styles.web}
          originWhitelist={['*']}
          source={{ html, baseUrl: 'https://dedilhado.vivo/' }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grant"
          setSupportMultipleWindows={false}
          injectedJavaScriptBeforeContentLoaded={DIAGNOSTICO}
          onMessage={ev => {
            try {
              const m = JSON.parse(ev.nativeEvent.data);
              if (m.ok) pronto();
              if (m.erro) setErros(e => [...e, m.erro].slice(-5));
            } catch {}
          }}
          onLoadEnd={pronto}
          onError={ev => setErros(e => [...e, 'Erro ao carregar: ' + ev.nativeEvent.description])}
          onRenderProcessGone={() => setErros(e => [...e, 'O WebView fechou sozinho (memória).'])}
        />
        {carregando && (
          <View style={styles.capa} pointerEvents="none">
            <ActivityIndicator size="large" color="#7dd3c0" />
            <Text style={styles.txt}>Abrindo o Dedilhado Vivo…</Text>
          </View>
        )}
        {erros.length > 0 && (
          <View style={styles.erros}>
            {erros.map((t, i) => <Text key={i} style={styles.erroTxt}>{t}</Text>)}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#172033' },
  web: { flex: 1, backgroundColor: '#172033' },
  capa: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#172033' },
  txt: { color: '#e6edf7', marginTop: 12, fontSize: 16 },
  erros: { position: 'absolute', left: 8, right: 8, bottom: 8, backgroundColor: '#7f1d1d', padding: 10, borderRadius: 8 },
  erroTxt: { color: '#fff', fontSize: 12 },
});
