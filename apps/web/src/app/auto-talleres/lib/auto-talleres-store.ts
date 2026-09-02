// Simple state management without zustand dependency
interface AutoTalleresState {
  activeOrderStatus: string | null;
  activeVehicleStatus: string | null;
  selectedOrderId: string | null;
  selectedVehicleId: string | null;
  selectedEstimateId: string | null;
  showNewOrderModal: boolean;
  showNewVehicleModal: boolean;
  showNewEstimateModal: boolean;
}

const initialState: AutoTalleresState = {
  activeOrderStatus: null,
  activeVehicleStatus: null,
  selectedOrderId: null,
  selectedVehicleId: null,
  selectedEstimateId: null,
  showNewOrderModal: false,
  showNewVehicleModal: false,
  showNewEstimateModal: false,
};

let state = { ...initialState };
const listeners = new Set<() => void>();

export const useAutoTalleresStore = {
  getState: () => state,
  setState: (partial: Partial<AutoTalleresState>) => {
    state = { ...state, ...partial };
    listeners.forEach(listener => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
