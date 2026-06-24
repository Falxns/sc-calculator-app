import { memo, useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import ResetIcon from '../icons/ResetIcon';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import type { Material } from '../../types';
import type { CraftCostSource, CraftRecipe } from '../../types/craft';
import { getMaterialKind } from '../../utils/craftCatalog';
import { craftInputKey, type CraftCostContext, resolveInputUnitCost } from '../../utils/craftCost';
import { formatCraftMoney } from '../../utils/craftProfit';
import { findMaterial } from '../../utils/materialImage';
import CraftBreakdownPanel from './CraftBreakdownPanel';

interface CraftInputRowProps {
  craft: CraftRecipe;
  materialId: string;
  qty: number;
  runs: number;
  materials: Material[];
  ctx: CraftCostContext;
  onCostSourceChange: (source: CraftCostSource) => void;
  onPriceOverride: (value: number | undefined) => void;
}

const costSourceLabelKey = (source: CraftCostSource) => {
  switch (source) {
    case 'buy':
      return 'craft.buy' as const;
    case 'craft':
      return 'craft.craft' as const;
    case 'manual':
      return 'craft.manual' as const;
  }
};

const CraftInputRow = ({
  craft,
  materialId,
  qty,
  runs,
  materials,
  ctx,
  onCostSourceChange,
  onPriceOverride,
}: CraftInputRowProps) => {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const material = findMaterial(materials, materialId);
  const kind = getMaterialKind(materialId);
  const resolved = resolveInputUnitCost(craft.id, materialId, ctx);
  const source = resolved.source;
  const totalQty = qty * runs;

  const manualKey = craftInputKey(craft.id, materialId);
  const manualValue = ctx.session.priceOverrides[manualKey];

  const craftDelta =
    resolved.craftUnitCost !== null ? resolved.buyPrice - resolved.craftUnitCost : null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E')) return;
    onPriceOverride(raw === '' ? undefined : Number(raw));
    if (raw !== '') {
      onCostSourceChange('manual');
    }
  };

  return (
    <div className="flex flex-col gap-1.5 py-2 border-b border-white/5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        {material ? (
          <MaterialIcon
            material={material}
            className="w-8 h-8 shrink-0"
            placeholderClassName="w-8 h-8 shrink-0 rounded bg-white/10"
          />
        ) : (
          <span className="w-8 h-8 shrink-0 rounded bg-white/10" aria-hidden />
        )}
        <span className="text-sm font-medium flex-1 min-w-[6rem] truncate">
          {material?.label ?? materialId}
        </span>
        <span className="text-sm text-white/60 tabular-nums">×{totalQty}</span>

        {kind === 'basic' ? (
          <>
            <span className="text-xs text-white/50">{t('craft.buy')}</span>
            <input
              className="calc-control py-1.5 px-2 text-sm w-24 text-center"
              type="number"
              value={
                source === 'manual' && manualValue !== undefined
                  ? manualValue || ''
                  : resolved.buyPrice || ''
              }
              placeholder={t('common.price')}
              aria-label={t('craft.priceFor', { name: material?.label ?? materialId })}
              onChange={handlePriceChange}
              onKeyDown={(e) => {
                if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
              }}
            />
            <button
              type="button"
              className="calc-btn w-auto p-1.5"
              aria-label={t('craft.resetPrice')}
              onClick={() => {
                onPriceOverride(undefined);
                onCostSourceChange('buy');
              }}
            >
              <ResetIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <span className="text-xs text-white/60">
              {t('craft.buy')}: {formatCraftMoney(resolved.buyPrice)} ₽
            </span>
            {resolved.craftUnitCost !== null ? (
              <span className="text-xs text-white/60">
                {t('craft.craft')}: {formatCraftMoney(resolved.craftUnitCost)} ₽
                {craftDelta !== null && craftDelta !== 0 ? (
                  <span className={craftDelta > 0 ? ' text-emerald-400' : ' text-amber-400'}>
                    {' '}
                    ({craftDelta > 0 ? '−' : '+'}
                    {formatCraftMoney(Math.abs(craftDelta))})
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-xs text-amber-400/80">{t('craft.cycleWarning')}</span>
            )}
          </div>
        )}
      </div>

      {kind === 'craftable' ? (
        <div className="flex flex-wrap items-center gap-2 pl-10">
          {craftDelta !== null && craftDelta > 0 ? (
            <span className="text-xs text-emerald-400/90">
              {t('craft.craftSaves', { amount: formatCraftMoney(craftDelta) })}
            </span>
          ) : craftDelta !== null && craftDelta < 0 ? (
            <span className="text-xs text-amber-400/90">{t('craft.buyingCheaper')}</span>
          ) : null}

          <span className="text-xs text-white/50">{t('craft.using')}</span>
          <DropdownMenu
            ariaLabel={t('craft.using')}
            className="w-max"
            menuAlign="left"
            portaled
            trigger={({ isOpen, toggle, listId }) => (
              <button
                type="button"
                className="calc-control py-1 px-2 text-xs select-dropdown-trigger"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listId}
                onClick={toggle}
              >
                {t(costSourceLabelKey(source))}
              </button>
            )}
          >
            {({ close }) =>
              (['buy', 'craft', 'manual'] as CraftCostSource[]).map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={source === option}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${
                      source === option ? 'bg-white/10' : ''
                    }`}
                    onClick={() => {
                      onCostSourceChange(option);
                      close();
                    }}
                  >
                    {t(costSourceLabelKey(option))}
                  </button>
                </li>
              ))
            }
          </DropdownMenu>

          {source === 'manual' ? (
            <input
              className="calc-control py-1 px-2 text-xs w-24 text-center"
              type="number"
              value={manualValue ?? ''}
              placeholder={t('common.price')}
              aria-label={t('craft.priceFor', { name: material?.label ?? materialId })}
              onChange={handlePriceChange}
              onKeyDown={(e) => {
                if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
              }}
            />
          ) : null}

          {resolved.breakdown ? (
            <button
              type="button"
              className="text-xs text-white/50 hover:text-white/80 px-1"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? '▾' : '▸'} {t('craft.breakdown')}
            </button>
          ) : null}
        </div>
      ) : null}

      {expanded && resolved.breakdown ? (
        <CraftBreakdownPanel breakdown={resolved.breakdown} materials={materials} />
      ) : null}
    </div>
  );
};

export default memo(CraftInputRow);
