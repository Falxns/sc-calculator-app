import type { EnergyResource } from '../types/craft';

export const COLD_SYNTHESIS_BATTERY: EnergyResource = {
  id: 'cold-synthesis-battery',
  label: 'Батарея холодного синтеза',
  energyPerUnit: 5000,
  defaultPrice: 4000,
};

export const DEFAULT_ENERGY_RESOURCE = COLD_SYNTHESIS_BATTERY;
