import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../api/settingsApi';

const SettingsContext = createContext();

export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
  const [globalSettings, setGlobalSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await settingsApi.getAllAsMap();
      const data = res.data?.data || res.data || {};
      setGlobalSettings(data);
    } catch (err) {
      console.error("Lỗi khi tải cấu hình chung:", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const refreshSettings = () => {
    fetchGlobalSettings();
  };

  return (
    <SettingsContext.Provider value={{ globalSettings, loadingSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
