import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import { useRef } from 'react';

export default function App() {
  const webViewRef = useRef(null);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SPEAK') {
        Speech.stop();
        Speech.speak(data.text, {
          language: 'en-US',
          pitch: 0.95,
          rate: 0.72,
          voice: 'com.apple.ttsbundle.Samantha-compact',
        });
      } else if (data.type === 'STOP') {
        Speech.stop();
      }
    } catch (e) {}
  };

  const injectedJS = `
    window.nativeSpeech = {
      speak: function(text) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SPEAK', text: text }));
      },
      stop: function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STOP' }));
      }
    };

    // Override speakTeacher to use native speech
    window.addEventListener('load', function() {
      if (typeof speakTeacher !== 'undefined') {
        window.speakTeacher = function(text) {
          window.nativeSpeech.speak(text);
        };
        window.speak = function(text) {
          window.nativeSpeech.speak(text);
        };
      }
    });
    true;
  `;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <WebView
        ref={webViewRef}
        source={require('./assets/index.html')}
        style={styles.webview}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        mixedContentMode="always"
        domStorageEnabled={true}
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  webview: { flex: 1 },
});
