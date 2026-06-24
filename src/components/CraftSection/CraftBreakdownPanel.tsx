import { memo } from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { Material } from '../../types';
import type { CraftCostBreakdownNode } from '../../types/craft';
import { formatCraftMoney } from '../../utils/craftProfit';
import { findMaterial } from '../../utils/materialImage';

interface CraftBreakdownPanelProps {
  breakdown: CraftCostBreakdownNode;
  materials: Material[];
}

const CraftBreakdownPanel = ({ breakdown, materials }: CraftBreakdownPanelProps) => {
  const { t } = useLocale();

  return (
    <div className="ml-10 pl-3 border-l border-white/10 text-xs text-white/60 space-y-1">
      {breakdown.inputs.map((line) => {
        const label = findMaterial(materials, line.materialId)?.label ?? line.materialId;
        return (
          <div key={line.materialId}>
            {line.qty}× {label} @ {formatCraftMoney(line.unitCost)} ₽ ={' '}
            {formatCraftMoney(line.lineCost)} ₽
          </div>
        );
      })}
      <div>
        {t('craft.energy')}: {formatCraftMoney(breakdown.energyCost)} ₽
      </div>
      <div className="text-white/80">
        → {breakdown.outputQty}× @ {formatCraftMoney(breakdown.unitCost)} ₽/{t('common.qty')}
      </div>
    </div>
  );
};

export default memo(CraftBreakdownPanel);
