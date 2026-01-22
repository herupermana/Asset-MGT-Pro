
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

  // --- ASSETS ---
  async fetchAssets(): Promise<Asset[]> {
    if (this.mode === 'local') {
      const saved = localStorage.getItem('ap_assets');
      return saved ? JSON.parse(saved) : [];
    }
    const response = await fetch(`${this.apiBaseUrl}/assets`);
    if (!response.ok) throw new Error('Persistence Node Unreachable');
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

  async updateAsset(asset: Asset): Promise<void> {
    if (this.mode === 'local') {
      const assets = await this.fetchAssets();
      const updated = assets.map(a => a.id === asset.id ? asset : a);
      localStorage.setItem('ap_assets', JSON.stringify(updated));
      return;
    }
    await fetch(`${this.apiBaseUrl}/assets/${asset.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
  }

  async deleteAsset(id: string): Promise<void> {
    if (this.mode === 'local') {
      const assets = await this.fetchAssets();
      localStorage.setItem('ap_assets', JSON.stringify(assets.filter(a => a.id !== id)));
      return;
    }
    await fetch(`${this.apiBaseUrl}/assets/${id}`, { method: 'DELETE' });
  }

  // --- SPK (WORK ORDERS) ---
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

  async updateSPK(spk: SPK): Promise<void> {
    if (this.mode === 'local') {
      const spks = await this.fetchSPKs();
      const updated = spks.map(s => s.id === spk.id ? spk : s);
      localStorage.setItem('ap_spks', JSON.stringify(updated));
      return;
    }
    await fetch(`${this.apiBaseUrl}/spks/${spk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spk),
    });
  }

  // --- TECHNICIANS ---
  async fetchTechnicians(): Promise<Technician[]> {
    if (this.mode === 'local') {
      const saved = localStorage.getItem('ap_technicians');
      return saved ? JSON.parse(saved) : [];
    }
    const response = await fetch(`${this.apiBaseUrl}/technicians`);
    return response.json();
  }

  async updateTechnician(tech: Technician): Promise<void> {
    if (this.mode === 'local') {
      const techs = await this.fetchTechnicians();
      const updated = techs.map(t => t.id === tech.id ? tech : t);
      localStorage.setItem('ap_technicians', JSON.stringify(updated));
      return;
    }
    await fetch(`${this.apiBaseUrl}/technicians/${tech.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tech),
    });
  }

  async deleteTechnician(id: string): Promise<void> {
    if (this.mode === 'local') {
      const techs = await this.fetchTechnicians();
      localStorage.setItem('ap_technicians', JSON.stringify(techs.filter(t => t.id !== id)));
      return;
    }
    await fetch(`${this.apiBaseUrl}/technicians/${id}`, { method: 'DELETE' });
  }

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
