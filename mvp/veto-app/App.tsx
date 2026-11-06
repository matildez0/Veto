import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  createDemoScanner,
  disableMonitoring,
  enableMonitoring,
  getLastSnapshot,
  getMonitoringSettings,
  runMonitoringScan,
  setMailboxScanner,
} from './src/monitoring/monitoring';
import { MonitoringFrequency, MonitoringResult, MonitoringSettings } from './src/types';
import { AppLanguage, LanguageSwitcher } from './src/components/LanguageSwitcher';

const copy = {
  pt: {
    frequencyLabels: { daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal' },
    title: 'Monitorização contínua',
    description: 'Depois da primeira análise, o Veto verifica novas empresas e notícias no próprio dispositivo. Os tokens e resultados não são enviados para um servidor.',
    frequency: 'Com que frequência?',
    permission: 'Ao ativar, o Veto pede permissão para notificações e pode verificar em segundo plano quando o sistema operativo o permitir. Podes revogar isto em Definições do dispositivo ou desligando abaixo.',
    enable: 'Ativar monitorização',
    disable: 'Desligar monitorização',
    scan: 'Verificar agora',
    latest: 'Última verificação',
    never: 'Ainda não foi feita nenhuma verificação.',
    newCompanies: 'empresas novas',
    newNews: 'notícias novas',
  },
  en: {
    frequencyLabels: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
    title: 'Continuous monitoring',
    description: 'After the first analysis, Veto checks for new companies and news on the device. Tokens and results are not sent to a server.',
    frequency: 'How often?',
    permission: 'When enabled, Veto asks for notification permission and may check in the background when the operating system allows it. You can revoke this in the device settings or by switching it off below.',
    enable: 'Enable monitoring',
    disable: 'Disable monitoring',
    scan: 'Check now',
    latest: 'Last check',
    never: 'No check has been made yet.',
    newCompanies: 'new companies',
    newNews: 'new news items',
  },
} as const;

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>('pt');
  const [settings, setSettings] = useState<MonitoringSettings>();
  const [lastResult, setLastResult] = useState<MonitoringResult>();
  const [busy, setBusy] = useState(false);
  const text = copy[language];

  useEffect(() => {
    setMailboxScanner(createDemoScanner());
    Promise.all([getMonitoringSettings(), getLastSnapshot()])
      .then(([savedSettings, snapshot]) => {
        setSettings(savedSettings);
        if (snapshot) {
          setLastResult({ scannedAt: snapshot.scannedAt, newCompanies: [], newNews: [] });
        }
        if (savedSettings.enabled) {
          return runMonitoringScan().then(setLastResult);
        }
        return undefined;
      })
      .catch(() => Alert.alert('Veto+', 'Não foi possível carregar a monitorização local.'));
  }, []);

  async function toggleMonitoring(): Promise<void> {
    setBusy(true);
    try {
      const next = settings?.enabled
        ? await disableMonitoring()
        : await enableMonitoring(settings?.frequency ?? 'weekly');
      setSettings(next);
    } catch (error) {
      Alert.alert('Permissão necessária', error instanceof Error ? error.message : 'Ativa as notificações para continuar.');
    } finally {
      setBusy(false);
    }
  }

  async function scanNow(): Promise<void> {
    setBusy(true);
    try {
      setLastResult(await runMonitoringScan());
    } catch {
      Alert.alert('Veto+', 'Não foi possível verificar novas empresas.');
    } finally {
      setBusy(false);
    }
  }

  async function chooseFrequency(frequency: MonitoringFrequency): Promise<void> {
    if (!settings?.enabled) {
      setSettings({ ...(settings ?? { notificationPermissionGranted: false }), frequency, enabled: false, updatedAt: new Date().toISOString() });
      return;
    }
    setBusy(true);
    try {
      setSettings(await enableMonitoring(frequency));
    } catch {
      Alert.alert('Veto+', 'Não foi possível atualizar a frequência.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.eyebrow}>VETO+</Text>
      <LanguageSwitcher language={language} onChangeLanguage={setLanguage} />
      <Text style={styles.title}>{text.title}</Text>
      <Text style={styles.description}>{text.description}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{text.frequency}</Text>
        <View style={styles.frequencyRow}>
          {(Object.keys(text.frequencyLabels) as MonitoringFrequency[]).map((frequency) => (
            <Pressable
              key={frequency}
              onPress={() => chooseFrequency(frequency)}
              style={[styles.frequency, settings?.frequency === frequency && styles.frequencySelected]}
            >
              <Text style={settings?.frequency === frequency ? styles.frequencyTextSelected : styles.frequencyText}>
                {text.frequencyLabels[frequency]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.permission}>{text.permission}</Text>
        <Pressable disabled={busy} onPress={toggleMonitoring} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{settings?.enabled ? text.disable : text.enable}</Text>
        </Pressable>
        <Pressable disabled={busy} onPress={scanNow} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{text.scan}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{text.latest}</Text>
        <Text style={styles.resultText}>
          {lastResult ? new Date(lastResult.scannedAt).toLocaleString(language === 'en' ? 'en-GB' : 'pt-PT') : text.never}
        </Text>
        {lastResult && <Text style={styles.resultText}>{lastResult.newCompanies.length} {text.newCompanies} · {lastResult.newNews.length} {text.newNews}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#211923', padding: 24, paddingTop: 72 },
  eyebrow: { color: '#C2EA5D', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#F3F1F4', fontSize: 30, fontWeight: '700', marginTop: 12 },
  description: { color: '#C9C4CC', fontSize: 16, lineHeight: 24, marginTop: 14 },
  card: { backgroundColor: '#2C2330', borderRadius: 18, marginTop: 24, padding: 18 },
  cardTitle: { color: '#F3F1F4', fontSize: 18, fontWeight: '700' },
  frequencyRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  frequency: { borderColor: '#655B6C', borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 },
  frequencySelected: { backgroundColor: '#C2EA5D', borderColor: '#C2EA5D' },
  frequencyText: { color: '#C9C4CC', fontSize: 13 },
  frequencyTextSelected: { color: '#211923', fontSize: 13, fontWeight: '700' },
  permission: { color: '#A39CA7', fontSize: 12, lineHeight: 18, marginTop: 16 },
  primaryButton: { backgroundColor: '#C2EA5D', borderRadius: 12, marginTop: 18, padding: 14 },
  primaryButtonText: { color: '#211923', fontWeight: '700', textAlign: 'center' },
  secondaryButton: { borderColor: '#655B6C', borderRadius: 12, borderWidth: 1, marginTop: 10, padding: 14 },
  secondaryButtonText: { color: '#F3F1F4', fontWeight: '700', textAlign: 'center' },
  resultText: { color: '#C9C4CC', marginTop: 10 },
});
