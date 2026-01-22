
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Asset, SPK, Technician, AssetStatus, SPKStatus } from './types';
import { MOCK_ASSETS, MOCK_SPKS, MOCK_TECHNICIANS, DEFAULT_CATEGORIES, DEFAULT_LOCATIONS } from './constants';
import { gemini } from './services/geminiService';
import { api, StorageMode } from './services/apiService';

type Theme = 'light' | 'dark';
type Language = 'en' | 'id';

interface AppContextType {
  assets: Asset[];
  spks: SPK[];
  technicians: Technician[];
  categories: string[];
  locations: string[];
  globalSearchQuery: string;
  currentTechnician: Technician | null;
  isAdminLoggedIn: boolean;
  theme: Theme;
  language: Language;
  isAutoTranslateEnabled: boolean;
  storageMode: StorageMode;
  isDbConnected: boolean;
  setStorageMode: (mode: StorageMode) => void;
  setDbEndpoint: (url: string) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setAutoTranslate: (enabled: boolean) => void;
  setGlobalSearchQuery: (query: string) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  createSPK: (spk: SPK) => void;
  updateSPK: (spk: SPK) => void;
  reassignSPK: (spkId: string, newTechnicianId: string) => void;
  updateSPKStatus: (id: string, status: SPKStatus, note?: string, evidence?: string[]) => void;
  updateAssetStatus: (id: string, status: AssetStatus) => void;
  loginTechnician: (id: string, password: string) => Promise<boolean>;
  loginAdmin: (password: string) => Promise<boolean>;
  logout: () => void;
  logoutAdmin: () => void;
  addTechnician: (tech: Technician) => void;
  deleteTechnician: (id: string) => void;
  updateTechnicianRank: (id: string, rank: string) => void;
  bulkRestoreData: (data: any) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    assets: "Assets",
    spk: "SPK & Repair",
    personnel: "Personnel",
    reports: "Reports",
    settings: "Settings",
    image_ai: "Image AI",
    voice_ai: "Voice AI",
    total_assets: "Total Assets",
    active_tasks: "Active Tasks",
    system_uptime: "System Uptime",
    critical_faults: "Critical Faults",
    register_asset: "Register Asset",
    exit_terminal: "Exit Terminal",
    search_ledger: "Search global ledger...",
    operational: "Operational",
    maintenance: "Maintenance",
    repair: "Under Repair",
    broken: "Broken"
  },
  id: {
    dashboard: "Dasbor",
    assets: "Aset",
    spk: "SPK & Perbaikan",
    personnel: "Personel",
    reports: "Laporan",
    settings: "Pengaturan",
    image_ai: "AI Gambar",
    voice_ai: "AI Suara",
    total_assets: "Total Aset",
    active_tasks: "Tugas Aktif",
    system_uptime: "Waktu Aktif",
    critical_faults: "Gangguan Kritis",
    register_asset: "Daftar Aset",
    exit_terminal: "Keluar Terminal",
    search_ledger: "Cari data ledger...",
    operational: "Operasional",
    maintenance: "Perawatan",
    repair: "Dalam Perbaikan",
    broken: "Rusak"
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [spks, setSpks] = useState<SPK[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('ap_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [locations, setLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem('ap_locations');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATIONS;
  });

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [currentTechnician, setCurrentTechnician] = useState<Technician | null>(() => {
    const saved = localStorage.getItem('ap_current_tech');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('ap_admin_auth') === 'true');
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('ap_theme') as Theme) || 'dark');
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('ap_lang') as Language) || 'en');
  const [isAutoTranslateEnabled, setAutoTranslateState] = useState(() => localStorage.getItem('ap_auto_translate') === 'true');
  const [storageMode, setStorageModeState] = useState<StorageMode>(api.getMode());
  const [isDbConnected, setIsDbConnected] = useState(true);

  // Initial Data Fetch with Seed Protection
  useEffect(() => {
    const loadData = async () => {
      try {
        const [a, s, t] = await Promise.all([api.fetchAssets(), api.fetchSPKs(), api.fetchTechnicians()]);
        
        const hasSeededBefore = localStorage.getItem('ap_system_seeded') === 'true';
        
        if (api.getMode() === 'local' && a.length === 0 && !hasSeededBefore) {
          // One-time demo seed
          setAssets(MOCK_ASSETS);
          setSpks(MOCK_SPKS);
          setTechnicians(MOCK_TECHNICIANS);
          localStorage.setItem('ap_assets', JSON.stringify(MOCK_ASSETS));
          localStorage.setItem('ap_spks', JSON.stringify(MOCK_SPKS));
          localStorage.setItem('ap_technicians', JSON.stringify(MOCK_TECHNICIANS));
          localStorage.setItem('ap_system_seeded', 'true');
        } else {
          setAssets(a);
          setSpks(s);
          setTechnicians(t);
        }
      } catch (err) {
        setIsDbConnected(false);
      }
    };
    loadData();
    
    const interval = setInterval(async () => {
      const ok = await api.checkConnection();
      setIsDbConnected(ok);
    }, 10000);
    return () => clearInterval(interval);
  }, [storageMode]);

  const t = (key: string) => DICTIONARY[language][key] || key;

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('ap_theme', t);
  };

  const setLanguage = async (l: Language) => {
    const oldLang = language;
    setLanguageState(l);
    localStorage.setItem('ap_lang', l);
    if (isAutoTranslateEnabled && oldLang !== l) {
      handleFullLedgerTranslation(l);
    }
  };

  const setAutoTranslate = (enabled: boolean) => {
    setAutoTranslateState(enabled);
    localStorage.setItem('ap_auto_translate', enabled.toString());
  };

  const setStorageMode = (mode: StorageMode) => {
    api.setMode(mode);
    setStorageModeState(mode);
  };

  const setDbEndpoint = (url: string) => {
    api.setEndpoint(url);
  };

  const handleFullLedgerTranslation = async (targetLang: Language) => {
    const langName = targetLang === 'id' ? 'Indonesian' : 'English';
    const translatedSpks = await Promise.all(spks.map(async (s) => {
      try {
        const title = await gemini.translateText(s.title, langName);
        const description = await gemini.translateText(s.description, langName);
        return { ...s, title: title || s.title, description: description || s.description };
      } catch (e) { return s; }
    }));
    setSpks(translatedSpks);

    const translatedAssets = await Promise.all(assets.map(async (a) => {
      try {
        const name = await gemini.translateText(a.name, langName);
        return { ...a, name: name || a.name };
      } catch (e) { return a; }
    }));
    setAssets(translatedAssets);
  };

  // Explicit persistence for all activities
  const addAsset = (asset: Asset) => {
    setAssets(prev => [asset, ...prev]);
    api.createAsset(asset);
  };
  
  const updateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    api.updateAsset(updatedAsset);
  };
  
  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    api.deleteAsset(id);
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      const updated = [...categories, category].sort();
      setCategories(updated);
      localStorage.setItem('ap_categories', JSON.stringify(updated));
    }
  };

  const removeCategory = (category: string) => {
    const updated = categories.filter(c => c !== category);
    setCategories(updated);
    localStorage.setItem('ap_categories', JSON.stringify(updated));
  };

  const addLocation = (location: string) => {
    if (!locations.includes(location)) {
      const updated = [...locations, location].sort();
      setLocations(updated);
      localStorage.setItem('ap_locations', JSON.stringify(updated));
    }
  };

  const removeLocation = (location: string) => {
    const updated = locations.filter(l => l !== location);
    setLocations(updated);
    localStorage.setItem('ap_locations', JSON.stringify(updated));
  };

  const createSPK = (spk: SPK) => {
    setSpks(prev => [spk, ...prev]);
    api.createSPK(spk);
    
    const tech = technicians.find(t => t.id === spk.technicianId);
    if (tech) {
      const updatedTech = { ...tech, activeTasks: tech.activeTasks + 1 };
      setTechnicians(prev => prev.map(t => t.id === tech.id ? updatedTech : t));
      api.updateTechnician(updatedTech);
    }
    
    updateAssetStatus(spk.assetId, AssetStatus.REPAIR);
  };

  const updateSPK = (updatedSpk: SPK) => {
    const originalSpk = spks.find(s => s.id === updatedSpk.id);
    setSpks(prev => prev.map(s => s.id === updatedSpk.id ? updatedSpk : s));
    api.updateSPK(updatedSpk);

    if (originalSpk && originalSpk.technicianId !== updatedSpk.technicianId) {
       // Handover logic
       const oldTech = technicians.find(t => t.id === originalSpk.technicianId);
       const newTech = technicians.find(t => t.id === updatedSpk.technicianId);
       
       if (oldTech) {
         const uOld = { ...oldTech, activeTasks: Math.max(0, oldTech.activeTasks - 1) };
         api.updateTechnician(uOld);
         setTechnicians(p => p.map(t => t.id === uOld.id ? uOld : t));
       }
       if (newTech) {
         const uNew = { ...newTech, activeTasks: newTech.activeTasks + 1 };
         api.updateTechnician(uNew);
         setTechnicians(p => p.map(t => t.id === uNew.id ? uNew : t));
       }
    }
  };

  const reassignSPK = (spkId: string, newTechnicianId: string) => {
    const spk = spks.find(s => s.id === spkId);
    if (!spk || spk.status === SPKStatus.COMPLETED) return;
    updateSPK({ ...spk, technicianId: newTechnicianId });
  };

  const updateSPKStatus = (id: string, status: SPKStatus, note?: string, evidence?: string[]) => {
    const spk = spks.find(s => s.id === id);
    if (!spk) return;

    const updatedSpk = { 
      ...spk, 
      status, 
      completionNote: note || spk.completionNote,
      evidence: evidence || spk.evidence,
      completedAt: status === SPKStatus.COMPLETED ? new Date().toISOString() : spk.completedAt 
    };

    setSpks(prev => prev.map(s => s.id === id ? updatedSpk : s));
    api.updateSPK(updatedSpk);

    if (status === SPKStatus.COMPLETED && spk.status !== SPKStatus.COMPLETED) {
       const tech = technicians.find(t => t.id === spk.technicianId);
       if (tech) {
         const uTech = { ...tech, activeTasks: Math.max(0, tech.activeTasks - 1) };
         api.updateTechnician(uTech);
         setTechnicians(p => p.map(t => t.id === uTech.id ? uTech : t));
       }
       updateAssetStatus(spk.assetId, AssetStatus.OPERATIONAL);
    }
  };

  const updateAssetStatus = (id: string, status: AssetStatus) => {
    const asset = assets.find(a => a.id === id);
    if (asset) {
      const updated = { ...asset, status };
      setAssets(prev => prev.map(a => a.id === id ? updated : a));
      api.updateAsset(updated);
    }
  };

  const bulkRestoreData = (data: any) => {
    if (data.assets) setAssets(data.assets);
    if (data.spks) setSpks(data.spks);
    if (data.technicians) setTechnicians(data.technicians);
    // Persist bulk restore
    localStorage.setItem('ap_assets', JSON.stringify(data.assets));
    localStorage.setItem('ap_spks', JSON.stringify(data.spks));
    localStorage.setItem('ap_technicians', JSON.stringify(data.technicians));
  };

  const loginTechnician = async (id: string, password: string): Promise<boolean> => {
    const tech = technicians.find(t => t.id === id && t.password === password);
    if (tech) { 
      setCurrentTechnician(tech); 
      localStorage.setItem('ap_current_tech', JSON.stringify(tech));
      return true; 
    }
    return false;
  };

  const loginAdmin = async (password: string): Promise<boolean> => {
    if (password === 'admin123') { 
      setIsAdminLoggedIn(true); 
      localStorage.setItem('ap_admin_auth', 'true');
      return true; 
    }
    return false;
  };

  const logout = () => {
    setCurrentTechnician(null);
    localStorage.removeItem('ap_current_tech');
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.setItem('ap_admin_auth', 'false');
  };

  const addTechnician = (tech: Technician) => {
    setTechnicians(prev => [tech, ...prev]);
    // Note: api service would ideally have createTechnician too
    localStorage.setItem('ap_technicians', JSON.stringify([tech, ...technicians]));
  };

  const deleteTechnician = (id: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
    api.deleteTechnician(id);
  };

  const updateTechnicianRank = (id: string, rank: string) => {
    const tech = technicians.find(t => t.id === id);
    if (tech) {
      const uTech = { ...tech, rank };
      setTechnicians(prev => prev.map(t => t.id === id ? uTech : t));
      api.updateTechnician(uTech);
    }
  };

  return (
    <AppContext.Provider value={{ 
      assets, spks, technicians, categories, locations, globalSearchQuery, currentTechnician, isAdminLoggedIn, 
      theme, language, isAutoTranslateEnabled, storageMode, isDbConnected,
      setTheme, setLanguage, setAutoTranslate, setStorageMode, setDbEndpoint, setGlobalSearchQuery, addAsset, updateAsset, deleteAsset, 
      addCategory, removeCategory, addLocation, removeLocation, createSPK, updateSPK, reassignSPK, updateSPKStatus, updateAssetStatus,
      loginTechnician, loginAdmin, logout, logoutAdmin, addTechnician, deleteTechnician, updateTechnicianRank, bulkRestoreData, t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
