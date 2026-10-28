import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export type AppLanguage = 'pt' | 'en';

type LanguageSwitcherProps = {
  language: AppLanguage;
  onChangeLanguage: (nextLanguage: AppLanguage) => void;
};

export function LanguageSwitcher({
  language,
  onChangeLanguage,
}: LanguageSwitcherProps) {
  const nextLanguage = language === 'en' ? 'pt' : 'en';
  const buttonLabel = nextLanguage === 'en' ? 'English' : 'Português';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onChangeLanguage(nextLanguage)}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{buttonLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f6feb',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
