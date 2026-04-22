import { Platform, StyleSheet, View } from 'react-native';

interface HtmlPreviewProps {
  html: string;
}

export function HtmlPreview({ html }: HtmlPreviewProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={html}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          sandbox="allow-same-origin"
        />
      </View>
    );
  }

  // Lazy import so web bundle never pulls react-native-webview
  const { WebView } = require('react-native-webview');
  return (
    <WebView
      source={{ html }}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
