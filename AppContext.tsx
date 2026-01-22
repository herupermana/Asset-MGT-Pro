
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Asset, SPK, Technician, AssetStatus, SPKStatus } from './types';
import { MOCK_ASSETS, MOCK_SPKS, MOCK_TECHNICIANS, DEFAULT_CATEGORIES } from './constants';

interface AppContextType {
  assets: Asset[];
  spks: SPK[];
  technicians: Technician[];
  categories: string[];
  globalSearchQuery: string;
  currentTechnician: Technician | null;
  setGlobalSearchQuery: (query: string) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  createSPK: (spk: SPK) => void;
  reassignSPK: (spkId: string, newTechnicianId: string) => void;
  updateSPKStatus: (id: string, status: SPKStatus, note?: string) => void;
  updateAssetStatus: (id: string, status: AssetStatus) => void;
  loginTechnician: (id: string) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [spks, setSpks] = useState<SPK[]>(MOCK_SPKS);
  const [technicians, setTechnicians] = useState<Technician[]>(MOCK_TECHNICIANS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [currentTechnician, setCurrentTechnician] = useState<Technician | null>(null);

  const addAsset = (asset: Asset) => setAssets(prev => [asset, ...prev]);

  const updateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category].sort());
    }
  };

  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const createSPK = (spk: SPK) => {
    setSpks(prev => [spk, ...prev]);
    setTechnicians(prev => prev.map(t => 
      t.id === spk.technicianId ? { ...t, activeTasks: t.activeTasks + 1 } : t
    ));
    updateAssetStatus(spk.assetId, AssetStatus.REPAIR);
  };

  const reassignSPK = (spkId: string, newTechnicianId: string) => {
    const spk = spks.find(s => s.id === spkId);
    if (!spk || spk.status === SPKStatus.COMPLETED || spk.technicianId === newTechnicianId) return;

    const oldTechId = spk.technicianId;
    setTechnicians(prev => prev.map(t => {
      if (t.id === oldTechId) return { ...t, activeTasks: Math.max(0, t.activeTasks - 1) };
      if (t.id === newTechnicianId) return { ...t, activeTasks: t.activeTasks + 1 };
      return t;
    }));
    setSpks(prev => prev.map(s => s.id === spkId ? { ...s, technicianId: newTechnicianId } : s));
  };

  const updateSPKStatus = (id: string, status: SPKStatus, note?: string) => {
    setSpks(prev => prev.map(s => {
      if (s.id === id) {
        if (status === SPKStatus.COMPLETED && s.status !== SPKStatus.COMPLETED) {
           setTechnicians(tPrev => tPrev.map(t => 
             t.id === s.technicianId ? { ...t, activeTasks: Math.max(0, t.activeTasks - 1) } : t
           ));
           updateAssetStatus(s.assetId, AssetStatus.OPERATIONAL);
        }
        return { 
          ...s, 
          status, 
          completionNote: note || s.completionNote,
          completedAt: status === SPKStatus.COMPLETED ? new Date().toISOString() : s.completedAt 
        };
      }
      return s;
    }));
  };

  const updateAssetStatus = (id: string, status: AssetStatus) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const loginTechnician = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tech = technicians.find(t => t.id === id);
        if (tech) {
          setCurrentTechnician(tech);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  const logout = () => setCurrentTechnician(null);

  return (
    <AppContext.Provider value={{ 
      assets, 
      spks, 
      technicians, 
      categories,
      globalSearchQuery,
      currentTechnician,
      setGlobalSearchQuery,
      addAsset, 
      updateAsset,
      deleteAsset,
      addCategory,
      removeCategory,
      createSPK, 
      reassignSPK, 
      updateSPKStatus, 
      updateAssetStatus,
      loginTechnician,
      logout
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
