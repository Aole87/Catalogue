/**
 * Electron Preload Script
 * System bridge for desktop packaging (Pure Web/PostgreSQL Architecture)
 */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
});
