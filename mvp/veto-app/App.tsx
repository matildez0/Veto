import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  LanguageSwitcher,
  type AppLanguage,
} from './src/components/LanguageSwitcher';

const translations: Record<AppLanguage, { title: string; description: string }> = {
  pt: {
    title: 'Bem-vindo ao Veto',
    description: 'A sua aplicação para gerir o dia a dia.',
  },
  en: {
    title: 'Welcome to Veto',
    description: 'Your app for managing everyday life.',
  },
};

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>('pt');
  const content = translations[language];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.description}>{content.description}</Text>

      <LanguageSwitcher language={language} onChangeLanguage={setLanguage} />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1b1f',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8,
  },
});
