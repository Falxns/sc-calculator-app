import type { Material } from '../types';
import type { MaterialKind } from '../types/craft';

export interface CraftMaterialDef extends Material {
  kind: MaterialKind;
}

export const CRAFT_CHAIN_MATERIALS: CraftMaterialDef[] = [
  {
    id: 'kopoto-silnogo-kabana',
    label: 'Копыто сильного кабана',
    defaultPrice: 0,
    kind: 'basic',
  },
  {
    id: 'polimery',
    label: 'Полимеры',
    defaultPrice: 0,
    kind: 'craftable',
  },
  {
    id: 'plastikovaya-butylka',
    label: 'Пластиковая бутылка',
    defaultPrice: 0,
    kind: 'craftable',
  },
  {
    id: 'butylka-chistoy-vody',
    label: 'Бутылка чистой воды',
    defaultPrice: 0,
    kind: 'craftable',
  },
  {
    id: 'cold-synthesis-battery',
    label: 'Батарея холодного синтеза',
    defaultPrice: 4000,
    kind: 'craftable',
  },
];

export const CRAFT_MATERIAL_KINDS: Record<string, MaterialKind> = Object.fromEntries(
  CRAFT_CHAIN_MATERIALS.map((m) => [m.id, m.kind])
);

export const getMaterialKind = (materialId: string): MaterialKind =>
  CRAFT_MATERIAL_KINDS[materialId] ?? 'craftable';
