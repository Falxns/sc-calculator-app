import useLocalStorage from './useLocalStorage';
import { DEFAULT_MATERIALS } from '../constants/materials';
import type { MaterialsState } from '../types';

const useMaterials = () =>
  useLocalStorage<MaterialsState>('materialsState', { materials: DEFAULT_MATERIALS });

export default useMaterials;
