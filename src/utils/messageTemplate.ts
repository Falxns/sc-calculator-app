import type { Calculator, Material } from '../types';
import { findMaterial } from './materialImage';

/** `{1}`, `{2}`, … — 1-based calculator row index */
export const formatRowToken = (rowIndex: number) => `{${rowIndex}}`;

export const TOTAL_TOKEN = '{total}';

/** In-game format: [MaterialName]price (brackets trigger item highlight) */
export const formatRowValue = (row: Calculator, materials: Material[]): string => {
  const material = findMaterial(materials, row.materialId);
  const label = material?.label ?? row.materialId;
  return `[${label}]${row.price}`;
};

export interface ResolveMessageResult {
  text: string;
  warnings: string[];
}

export const resolveMessageTemplate = (
  content: string,
  rows: Calculator[],
  materials: Material[],
  total: number
): ResolveMessageResult => {
  const warnings: string[] = [];

  let text = content.replace(/\{total\}/gi, () => String(total));

  text = text.replace(/\{(\d+)\}/g, (match, numStr: string) => {
    const rowIndex = Number(numStr);
    if (!Number.isInteger(rowIndex) || rowIndex < 1) {
      warnings.push(`Invalid placeholder ${match}`);
      return match;
    }

    const row = rows[rowIndex - 1];
    if (!row) {
      warnings.push(`Row ${rowIndex} not found`);
      return match;
    }

    return formatRowValue(row, materials);
  });

  return { text, warnings };
};

export interface RowInsertOption {
  rowIndex: number;
  label: string;
  price: number;
}

export const buildRowInsertOptions = (
  rows: Calculator[],
  materials: Material[]
): RowInsertOption[] =>
  rows.map((row, index) => {
    const material = findMaterial(materials, row.materialId);
    return {
      rowIndex: index + 1,
      label: material?.label ?? row.materialId,
      price: row.price,
    };
  });
