import { create } from 'zustand';
import { Coordenada, COORDENADAS_BUENAVISTA } from '@/types';

interface MapaState {
  centroMapa: Coordenada;
  zoom: number;
  combiSeleccionada: string | null;
  mostrarTrafico: boolean;
  setCentroMapa: (coordenada: Coordenada) => void;
  setZoom: (zoom: number) => void;
  setCombiSeleccionada: (id: string | null) => void;
  toggleTrafico: () => void;
  resetMapa: () => void;
}

export const useMapaStore = create<MapaState>((set) => ({
  centroMapa: COORDENADAS_BUENAVISTA,
  zoom: 14,
  combiSeleccionada: null,
  mostrarTrafico: true,

  setCentroMapa: (coordenada) => set({ centroMapa: coordenada }),
  
  setZoom: (zoom) => set({ zoom }),
  
  setCombiSeleccionada: (id) => set({ combiSeleccionada: id }),
  
  toggleTrafico: () => set((state) => ({ mostrarTrafico: !state.mostrarTrafico })),
  
  resetMapa: () =>
    set({
      centroMapa: COORDENADAS_BUENAVISTA,
      zoom: 14,
      combiSeleccionada: null,
      mostrarTrafico: true,
    }),
}));
