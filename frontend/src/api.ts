import { VerifyResponse, HistoryItem, FeedbackData } from './types';

const API_BASE = '/api';

export async function verifyNews(payload: {
  text?: string;
  url?: string;
  language?: string;
  country?: string;
  as_of_date?: string | null;
  api_key?: string | null;
}): Promise<VerifyResponse> {
  const response = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server responded with error ${response.status}`);
  }

  return response.json();
}

export async function getReport(reportId: string): Promise<VerifyResponse> {
  const response = await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}`);
  if (!response.ok) {
    throw new Error('Verification report not found.');
  }
  return response.json();
}

export async function getExamples(): Promise<VerifyResponse[]> {
  const response = await fetch(`${API_BASE}/examples`);
  if (!response.ok) {
    throw new Error('Failed to load example reports.');
  }
  return response.json();
}

export async function getHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function clearHistory(): Promise<void> {
  await fetch(`${API_BASE}/history`, { method: 'DELETE' });
}

export async function submitFeedback(data: FeedbackData): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to record feedback.');
  }
  return response.json();
}

export async function checkHealth(): Promise<{ status: string; live_search_ready: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return { status: 'down', live_search_ready: false };
    return response.json();
  } catch {
    return { status: 'down', live_search_ready: false };
  }
}
