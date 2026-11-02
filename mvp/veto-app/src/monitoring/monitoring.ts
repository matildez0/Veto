import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import {
  MonitoringCompany,
  MonitoringFrequency,
  MonitoringNews,
  MonitoringResult,
  MonitoringSettings,
  MonitoringSnapshot,
} from '../types';

export const MONITORING_TASK = 'veto-plus-monitoring';

const SETTINGS_KEY = 'veto.plus.monitoring.settings';
const SNAPSHOT_KEY = 'veto.plus.monitoring.snapshot';
const INTERVALS: Record<MonitoringFrequency, number> = {
  daily: 24 * 60,
  weekly: 7 * 24 * 60,
  monthly: 30 * 24 * 60,
};

const defaultSettings: MonitoringSettings = {
  enabled: false,
  frequency: 'weekly',
  notificationPermissionGranted: false,
  updatedAt: new Date(0).toISOString(),
};

type MailboxScanner = () => Promise<MonitoringSnapshot>;

let mailboxScanner: MailboxScanner = async () => ({
  scannedAt: new Date().toISOString(),
  companies: [],
  news: [],
});

export function setMailboxScanner(scanner: MailboxScanner): void {
  mailboxScanner = scanner;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const value = await SecureStore.getItemAsync(key);
  return value ? JSON.parse(value) as T : fallback;
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export async function getMonitoringSettings(): Promise<MonitoringSettings> {
  return readJson(SETTINGS_KEY, defaultSettings);
}

export async function getLastSnapshot(): Promise<MonitoringSnapshot | null> {
  return readJson<MonitoringSnapshot | null>(SNAPSHOT_KEY, null);
}

async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function notifyResult(result: MonitoringResult): Promise<void> {
  if (!result.newCompanies.length && !result.newNews.length) return;
  const parts: string[] = [];
  if (result.newCompanies.length) {
    parts.push(`${result.newCompanies.length} nova${result.newCompanies.length === 1 ? '' : 's'} empresa${result.newCompanies.length === 1 ? '' : 's'}`);
  }
  if (result.newNews.length) {
    parts.push(`${result.newNews.length} notícia${result.newNews.length === 1 ? '' : 's'} nova${result.newNews.length === 1 ? '' : 's'}`);
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Atualização do Veto+',
      body: `${parts.join(' e ')} desde a última análise.`,
      data: { screen: 'monitoring' },
    },
    trigger: null,
  });
}

export async function runMonitoringScan(): Promise<MonitoringResult> {
  const previous = await getLastSnapshot();
  const current = await mailboxScanner();
  const oldCompanyIds = new Set(previous?.companies.map((company) => company.id) ?? []);
  const oldNewsIds = new Set(previous?.news.map((news) => news.id) ?? []);
  const result: MonitoringResult = {
    scannedAt: current.scannedAt,
    newCompanies: current.companies.filter((company) => !oldCompanyIds.has(company.id)),
    newNews: current.news.filter((news) => !oldNewsIds.has(news.id)),
  };
  await writeJson(SNAPSHOT_KEY, current);
  const settings = await getMonitoringSettings();
  if (settings.enabled && settings.notificationPermissionGranted) await notifyResult(result);
  return result;
}

export async function enableMonitoring(frequency: MonitoringFrequency): Promise<MonitoringSettings> {
  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    throw new Error('É necessária permissão para mostrar notificações do monitoramento.');
  }
  await Notifications.setNotificationChannelAsync('veto-plus-monitoring', {
    name: 'Monitorização Veto+',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  const settings: MonitoringSettings = {
    enabled: true,
    frequency,
    notificationPermissionGranted: true,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(SETTINGS_KEY, settings);
  await BackgroundTask.registerTaskAsync(MONITORING_TASK, {
    minimumInterval: INTERVALS[frequency],
  });
  return settings;
}

export async function disableMonitoring(): Promise<MonitoringSettings> {
  const registered = await TaskManager.isTaskRegisteredAsync(MONITORING_TASK);
  if (registered) await BackgroundTask.unregisterTaskAsync(MONITORING_TASK);
  const settings: MonitoringSettings = {
    ...await getMonitoringSettings(),
    enabled: false,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(SETTINGS_KEY, settings);
  return settings;
}

export async function isMonitoringRegistered(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(MONITORING_TASK);
}

TaskManager.defineTask(MONITORING_TASK, async () => {
  try {
    await runMonitoringScan();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.warn('Veto+ monitoring task failed', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export function createDemoScanner(): MailboxScanner {
  let run = 0;
  return async () => {
    run += 1;
    const now = new Date().toISOString();
    const companies: MonitoringCompany[] = [
      { id: 'demo-shop', name: 'Loja Demo', domain: 'loja-demo.pt', detectedAt: now },
    ];
    if (run > 1) {
      companies.push({ id: 'demo-travel', name: 'Viagem Demo', domain: 'viagem-demo.pt', detectedAt: now });
    }
    const news: MonitoringNews[] = run > 1
      ? [{ id: `demo-news-${run}`, companyId: 'demo-shop', companyName: 'Loja Demo', title: 'Nova notícia sobre Loja Demo', publishedAt: now }]
      : [];
    return { scannedAt: now, companies, news };
  };
}
