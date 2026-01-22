
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Asset, SPK, Technician, AssetStatus, SPKStatus } from './types';
import { MOCK_ASSETS, MOCK_SPKS, MOCK_TECHNICIANS, DEFAULT_CATEGORIES, DEFAULT_LOCATIONS } from './constants';

interface AppContextType {
  assets: Asset[];
  spks: SPK[];
  technicians: Technician[];
  categories: string[];
  locations: string[];
  globalSearchQuery: string;
  currentTechnician: Technician | null;
  isAdminLoggedIn: boolean;
  setGlobalSearchQuery: (query: string) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  createSPK: (spk: SPK) => void;
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
  bulkRestoreData: (data: { assets: Asset[], spks: SPK[], technicians: Technician[], categories: string[], locations: string[] }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or Defaults
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('ap_assets');
    return saved ? JSON.parse(saved) : MOCK_ASSETS;
  });
  const [spks, setSpks] = useState<SPK[]>(() => {
    const saved = localStorage.getItem('ap_spks');
    return saved ? JSON.parse(saved) : MOCK_SPKS;
  });
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('ap_technicians');
    return saved ? JSON.parse(saved) : MOCK_TECHNICIANS;
  });
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('ap_admin_auth') === 'true';
  });

  // Persistence Sync
  useEffect(() => { localStorage.setItem('ap_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('ap_spks', JSON.stringify(spks)); }, [spks]);
  useEffect(() => { localStorage.setItem('ap_technicians', JSON.stringify(technicians)); }, [technicians]);
  useEffect(() => { localStorage.setItem('ap_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('ap_locations', JSON.stringify(locations)); }, [locations]);
  useEffect(() => { 
    if (currentTechnician) localStorage.setItem('ap_current_tech', JSON.stringify(currentTechnician));
    else localStorage.removeItem('ap_current_tech');
  }, [currentTechnician]);
  useEffect(() => { localStorage.setItem('ap_admin_auth', isAdminLoggedIn.toString()); }, [isAdminLoggedIn]);

  const addAsset = (asset: Asset) => setAssets(prev => [asset, ...prev]);

  const updateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    // Also cleanup SPKs for this asset
    setSpks(prev => prev.filter(s => s.assetId !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category].sort());
    }
  };

  const removeCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const addLocation = (location: string) => {
    if (!locations.includes(location)) {
      setLocations(prev => [...prev, location].sort());
    }
  };

  const removeLocation = (location: string) => {
    setLocations(prev => prev.filter(l => l !== location));
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

  const updateSPKStatus = (id: string, status: SPKStatus, note?: string, evidence?: string[]) => {
    setSpks(prev => prev.map(s => {
      if (s.id === id) {
        // If transitioning TO completed, decrement tech workload and restore asset status
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
          evidence: evidence || s.evidence,
          completedAt: status === SPKStatus.COMPLETED ? new Date().toISOString() : s.completedAt 
        };
      }
      return s;
    }));
  };

  const updateAssetStatus = (id: string, status: AssetStatus) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const bulkRestoreData = (data: { assets: Asset[], spks: SPK[], technicians: Technician[], categories: string[], locations: string[] }) => {
    if (data.assets) setAssets(data.assets);
    if (data.spks) setSpks(data.spks);
    if (data.technicians) setTechnicians(data.technicians);
    if (data.categories) setCategories(data.categories);
    if (data.locations) setLocations(data.locations);
  };

  const loginTechnician = async (id: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tech = technicians.find(t => t.id === id && t.password === password);
        if (tech) {
          setCurrentTechnician(tech);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  const loginAdmin = async (password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (password === 'admin123') {
          setIsAdminLoggedIn(true);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  const logout = () => setCurrentTechnician(null);
  const logoutAdmin = () => setIsAdminLoggedIn(false);

  const addTechnician = (tech: Technician) => {
    setTechnicians(prev => [tech, ...prev]);
  };

  const deleteTechnician = (id: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
  };

  const updateTechnicianRank = (id: string, rank: string) => {
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, rank } : t));
  };

  return (
    <AppContext.Provider value={{ 
      assets, 
      spks, 
      technicians, 
      categories,
      locations,
      globalSearchQuery,
      currentTechnician,
      isAdminLoggedIn,
      setGlobalSearchQuery,
      addAsset, 
      updateAsset,
      deleteAsset,
      addCategory,
      removeCategory,
      addLocation,
      removeLocation,
      createSPK, 
      reassignSPK, 
      updateSPKStatus, 
      updateAssetStatus,
      loginTechnician,
      loginAdmin,
      logout,
      logoutAdmin,
      addTechnician,
      deleteTechnician,
      updateTechnicianRank,
      bulkRestoreData
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
