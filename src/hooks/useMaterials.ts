import useLocalStorage from './useLocalStorage';
import { DEFAULT_MATERIALS } from '../constants/materials';
import type { MaterialsState } from '../types';
import { normalizeMaterialsState } from '../utils/materialsNormalize';

const useMaterials = () =>
  useLocalStorage<MaterialsState>(
    'materialsState',
    { materials: DEFAULT_MATERIALS },
    normalizeMaterialsState,
    400
  );

export default useMaterials;
