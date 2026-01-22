
import { Asset, SPK, Technician } from '../types';

export type StorageMode = 'local' | 'sql_remote';

class ApiService {
  private mode: StorageMode = (localStorage.getItem('ap_storage_mode') as StorageMode) || 'local';
  private apiBaseUrl: string = localStorage.getItem('ap_sql_endpoint') || 'http://localhost:3000/api';

  setMode(mode: StorageMode) {
    this.mode = mode;
    localStorage.setItem('ap_storage_mode', mode);
  }

  setEndpoint(url: string) {
    this.apiBaseUrl = url;
    localStorage.setItem('ap_sql_endpoint', url);
  }

  getMode(): StorageMode {
    return this.mode;
  }

  async fetchAssets(): Promise<Asset[]> {
    if (this.mode === 'local') {
      const saved = localStorage.getItem('ap_assets');
      return saved ? JSON.parse(saved) : [];
    }
    const response = await fetch(`${this.apiBaseUrl}/assets`);
    if (!response.ok) throw new Error('Failed to fetch from SQL Node');
    return response.json();
  }

  async createAsset(asset: Asset): Promise<void> {
    if (this.mode === 'local') {
      const assets = await this.fetchAssets();
      localStorage.setItem('ap_assets', JSON.stringify([asset, ...assets]));
      return;
    }
    await fetch(`${this.apiBaseUrl}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
  }

  async fetchSPKs(): Promise<SPK[]> {
    if (this.mode === 'local') {
      const saved = localStorage.getItem('ap_spks');
      return saved ? JSON.parse(saved) : [];
    }
    const response = await fetch(`${this.apiBaseUrl}/spks`);
    return response.json();
  }

  async createSPK(spk: SPK): Promise<void> {
    if (this.mode === 'local') {
      const spks = await this.fetchSPKs();
      localStorage.setItem('ap_spks', JSON.stringify([spk, ...spks]));
      return;
    }
    await fetch(`${this.apiBaseUrl}/spks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spk),
    });
  }

  async fetchTechnicians(): Promise<Technician[]> {
    if (this.mode === 'local') {
      const saved = localStorage.getItem('ap_technicians');
      return saved ? JSON.parse(saved) : [];
    }
    const response = await fetch(`${this.apiBaseUrl}/technicians`);
    return response.json();
  }

  // Helper to simulate a health check
  async checkConnection(): Promise<boolean> {
    if (this.mode === 'local') return true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${this.apiBaseUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      return false;
    }
  }
}

export const api = new ApiService();
