// ==========================================
// 1. ENTIDADES BASE (O que guardamos no SQLite)
// ==========================================

export interface UserPreferences {
  hasCompletedOnboarding: boolean;
  appLockEnabled: boolean;
}

export interface CatalogCompany {
  id: string;
  name: string;
  domains: string[];
  privacyEmail: string;
  privacyUrl?: string;
  verifiedAt: string; // ISO Date
} 

export interface DetectedService {
  id: string;
  catalogCompanyId?: string; // Nulo se o utilizador adicionou à mão
  customName?: string;
  category: 'conta_provavel' | 'compra' | 'newsletter' | 'desconhecido';
  userReviewStatus: 'pendente' | 'confirmado' | 'descartado';
  evidence: {
    senderEmail: string;
    emailSubject: string;
    receivedDate: string; // ISO Date
  };
}

export interface PrivacyRequest {
  id: string;
  detectedServiceId: string; // Liga ao serviço encontrado acima
  requestType: 'acesso' | 'portabilidade' | 'apagamento';
  status: 'rascunho' | 'enviado' | 'resposta_recebida' | 'fechado';
  createdAt: string; // ISO Date
  expectedResponseDate?: string; // ISO Date (Data de envio + 30 dias)
  companyContactUsed: string; // O email para onde foi enviado
}

// ==========================================
// 2. FUNÇÕES DA CAMADA LÓGICA (Endpoints Locais)
// ==========================================

export interface VetoDataService {
  // Discovery
  scanMailbox: (mode: 'gmail' | 'demo') => Promise<DetectedService[]>;
  getDetectedServices: () => Promise<DetectedService[]>;
  reviewService: (serviceId: string, status: 'confirmado' | 'descartado') => Promise<void>;

  // Requests
  generateDraftText: (serviceId: string, type: PrivacyRequest['requestType']) => Promise<{ draftText: string, contactEmail: string }>;
  saveRequestAsDraft: (serviceId: string, type: PrivacyRequest['requestType']) => Promise<PrivacyRequest>;
  markRequestAsSent: (requestId: string) => Promise<PrivacyRequest>;
  updateRequestStatus: (requestId: string, newStatus: PrivacyRequest['status']) => Promise<void>;
}