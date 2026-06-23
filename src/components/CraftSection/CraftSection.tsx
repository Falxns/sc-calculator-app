import { useEffect, useMemo } from 'react';
import { useLocale } from '../../context/LocaleContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import type { Calculator, Material } from '../../types';
import type { CraftCostSource, CraftSession } from '../../types/craft';
import {
  CRAFT_RECIPES,
  getCraftRecipe,
  getPopularCrafts,
} from '../../constants/crafts';
import { DEFAULT_ENERGY_RESOURCE } from '../../constants/energy';
import { sectionGlassClass, sectionWrapperClass } from '../../constants/layout';
import { buildCalculatorPriceMap, mergeCraftMaterials } from '../../utils/craftCatalog';
import {
  computeEnergyCost,
  craftEnergyKey,
  craftInputKey,
  craftOutputKey,
  type CraftCostContext,
  resolveBatteryPrice,
  resolveOutputPrice,
} from '../../utils/craftCost';
import { computeCraftProfit, formatCraftMoney, formatCraftPercent } from '../../utils/craftProfit';
import {
  CRAFT_SESSION_STORAGE_KEY,
  createDefaultCraftSession,
  normalizeCraftSession,
} from '../../utils/craftSession';
import { findMaterial } from '../../utils/materialImage';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import ResetIcon from '../icons/ResetIcon';
import CraftInputRow from './CraftInputRow';

interface CraftSectionProps {
  materials: Material[];
  calculatorRows: Calculator[];
  onImportRef?: React.MutableRefObject<(session: CraftSession) => void>;
}

const CraftSection = ({ materials, calculatorRows, onImportRef }: CraftSectionProps) => {
  const { t } = useLocale();
  const mergedMaterials = useMemo(() => mergeCraftMaterials(materials), [materials]);
  const calculatorPrices = useMemo(
    () => buildCalculatorPriceMap(calculatorRows),
    [calculatorRows]
  );

  const [session, setSession] = useLocalStorage<CraftSession>(
    CRAFT_SESSION_STORAGE_KEY,
    createDefaultCraftSession(),
    normalizeCraftSession,
    400
  );

  useEffect(() => {
    if (onImportRef) onImportRef.current = setSession;
  });

  const recipe = getCraftRecipe(session.selectedCraftId) ?? CRAFT_RECIPES[0];
  const batteryMaterial = findMaterial(mergedMaterials, DEFAULT_ENERGY_RESOURCE.id);

  const ctx: CraftCostContext = useMemo(
    () => ({
      recipes: CRAFT_RECIPES,
      materials: mergedMaterials,
      session,
      calculatorPrices,
      batteryPrice: DEFAULT_ENERGY_RESOURCE.defaultPrice,
    }),
    [mergedMaterials, session, calculatorPrices]
  );

  const profit = useMemo(
    () => (recipe ? computeCraftProfit(recipe, ctx) : null),
    [recipe, ctx]
  );

  const batteryPrice = resolveBatteryPrice(ctx);
  const energyInfo = recipe
    ? computeEnergyCost(recipe.energyRequired, session.efficiencyPercent, batteryPrice)
    : null;
  const energyUnitsTotal = energyInfo ? energyInfo.unitsNeeded * Math.max(1, session.runs) : 0;

  const setCostSource = (materialId: string, source: CraftCostSource) => {
    const key = craftInputKey(recipe.id, materialId);
    setSession((prev) => ({
      ...prev,
      costSourceByInput: { ...prev.costSourceByInput, [key]: source },
    }));
  };

  const setPriceOverride = (key: string, value: number | undefined) => {
    setSession((prev) => {
      const next = { ...prev.priceOverrides };
      if (value === undefined) delete next[key];
      else next[key] = value;
      return { ...prev, priceOverrides: next };
    });
  };

  const handleRunsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E')) return;
    const runs = raw === '' ? 1 : Math.max(1, Math.floor(Number(raw)));
    setSession((prev) => ({ ...prev, runs }));
  };

  const handleEfficiencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E')) return;
    const efficiencyPercent = raw === '' ? 100 : Math.max(1, Number(raw));
    setSession((prev) => ({ ...prev, efficiencyPercent }));
  };

  if (!recipe) return null;

  return (
    <div className={sectionWrapperClass}>
      <section className={sectionGlassClass}>
        <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white/90 w-full sm:w-auto">
            {t('craft.sectionTitle')}
          </h2>

          <DropdownMenu
            ariaLabel={t('craft.selectCraft')}
            className="min-w-[10rem] flex-1 sm:flex-none"
            menuAlign="left"
            portaled
            trigger={({ isOpen, toggle, listId }) => (
              <button
                type="button"
                className="calc-control py-1.5 px-3 text-sm select-dropdown-trigger w-full text-left"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listId}
                onClick={toggle}
              >
                <span className="truncate block">{t(recipe.nameKey)}</span>
              </button>
            )}
          >
            {({ close }) =>
              CRAFT_RECIPES.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={item.id === recipe.id}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${
                      item.id === recipe.id ? 'bg-white/10' : ''
                    }`}
                    onClick={() => {
                      setSession((prev) => ({ ...prev, selectedCraftId: item.id }));
                      close();
                    }}
                  >
                    {t(item.nameKey)}
                  </button>
                </li>
              ))
            }
          </DropdownMenu>

          <div className="flex flex-wrap gap-1.5">
            {getPopularCrafts().map((item) => (
              <button
                key={item.id}
                type="button"
                className={`calc-btn py-1 px-2 text-xs ${
                  item.id === recipe.id ? 'bg-white/15' : ''
                }`}
                onClick={() => setSession((prev) => ({ ...prev, selectedCraftId: item.id }))}
              >
                {t(item.nameKey)}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs text-white/70 ml-auto">
            {t('craft.efficiency')}
            <input
              className="calc-control py-1 px-2 text-xs w-16 text-center"
              type="number"
              min={1}
              max={500}
              value={session.efficiencyPercent}
              aria-label={t('craft.efficiency')}
              onChange={handleEfficiencyChange}
              onKeyDown={(e) => {
                if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
              }}
            />
            %
          </label>

          <label className="flex items-center gap-1.5 text-xs text-white/70">
            {t('craft.runs')}
            <input
              className="calc-control py-1 px-2 text-xs w-14 text-center"
              type="number"
              min={1}
              value={session.runs}
              aria-label={t('craft.runs')}
              onChange={handleRunsChange}
              onKeyDown={(e) => {
                if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
              }}
            />
          </label>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide pt-2 pb-1">
            {t('craft.inputs')}
          </h3>
          {recipe.inputs.map((input) => (
            <CraftInputRow
              key={input.materialId}
              craft={recipe}
              materialId={input.materialId}
              qty={input.qty}
              runs={session.runs}
              materials={mergedMaterials}
              ctx={ctx}
              onCostSourceChange={(source) => setCostSource(input.materialId, source)}
              onPriceOverride={(value) =>
                setPriceOverride(craftInputKey(recipe.id, input.materialId), value)
              }
            />
          ))}
        </div>

        <div className="pt-2">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide pb-1">
            {t('craft.energy')}
          </h3>
          <div className="flex flex-wrap items-center gap-2 py-2">
            {batteryMaterial ? (
              <MaterialIcon
                material={batteryMaterial}
                className="w-8 h-8 shrink-0"
                placeholderClassName="w-8 h-8 shrink-0 rounded bg-white/10"
              />
            ) : (
              <span className="w-8 h-8 shrink-0 rounded bg-white/10" aria-hidden />
            )}
            <span className="text-sm font-medium flex-1 min-w-[8rem]">
              {DEFAULT_ENERGY_RESOURCE.label}
            </span>
            <span className="text-sm text-white/60 tabular-nums">
              ×{energyUnitsTotal < 1 ? energyUnitsTotal.toFixed(2) : energyUnitsTotal.toFixed(1)}
            </span>
            <input
              className="calc-control py-1.5 px-2 text-sm w-24 text-center"
              type="number"
              value={
                craftEnergyKey() in session.priceOverrides
                  ? session.priceOverrides[craftEnergyKey()]
                  : batteryPrice || ''
              }
              placeholder={t('common.price')}
              aria-label={t('craft.priceFor', { name: DEFAULT_ENERGY_RESOURCE.label })}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E'))
                  return;
                setPriceOverride(craftEnergyKey(), raw === '' ? undefined : Number(raw));
              }}
              onKeyDown={(e) => {
                if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
              }}
            />
            <button
              type="button"
              className="calc-btn w-auto p-1.5"
              aria-label={t('craft.resetPrice')}
              onClick={() => setPriceOverride(craftEnergyKey(), undefined)}
            >
              <ResetIcon className="w-4 h-4" />
            </button>
          </div>
          {energyInfo ? (
            <p className="text-xs text-white/50 pl-10 pb-1">
              {t('craft.requiredEnergy', { pts: recipe.energyRequired * Math.max(1, session.runs) })}{' '}
              →{' '}
              {t('craft.effectiveEnergyPerBattery', {
                pts: Math.round(energyInfo.effectiveEnergyPerBattery),
                efficiency: session.efficiencyPercent,
              })}
            </p>
          ) : null}
        </div>

        <div className="pt-2">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide pb-1">
            {t('craft.output')}
          </h3>
          {recipe.outputs.map((output) => {
            const material = findMaterial(mergedMaterials, output.materialId);
            const price = resolveOutputPrice(recipe.id, output.materialId, ctx);
            const outputKey = craftOutputKey(recipe.id, output.materialId);
            const totalQty = output.qty * Math.max(1, session.runs);
            return (
              <div
                key={output.materialId}
                className="flex flex-wrap items-center gap-2 py-2 border-b border-white/5 last:border-b-0"
              >
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
                  {material?.label ?? output.materialId}
                </span>
                <span className="text-sm text-white/60 tabular-nums">×{totalQty}</span>
                <input
                  className="calc-control py-1.5 px-2 text-sm w-24 text-center"
                  type="number"
                  value={outputKey in session.priceOverrides ? session.priceOverrides[outputKey] : price || ''}
                  placeholder={t('common.price')}
                  aria-label={t('craft.sellPriceFor', { name: material?.label ?? output.materialId })}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw.includes('-') || raw.includes('+') || raw.includes('e') || raw.includes('E'))
                      return;
                    setPriceOverride(outputKey, raw === '' ? undefined : Number(raw));
                  }}
                  onKeyDown={(e) => {
                    if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
                  }}
                />
                <button
                  type="button"
                  className="calc-btn w-auto p-1.5"
                  aria-label={t('craft.resetPrice')}
                  onClick={() => setPriceOverride(outputKey, undefined)}
                >
                  <ResetIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {profit ? (
          <div className="pt-3 mt-1 border-t border-white/10 space-y-1 text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/70">
              <span>
                {t('craft.totalInputs')}: {formatCraftMoney(profit.totalInputCost)} ₽
              </span>
              <span>
                {t('craft.totalEnergy')}: {formatCraftMoney(profit.totalEnergyCost)} ₽
              </span>
              <span>
                {t('craft.totalOutput')}: {formatCraftMoney(profit.totalOutputValue)} ₽
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 items-baseline">
              <span
                className={`font-semibold ${
                  profit.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {t('craft.profit')}: {profit.profit >= 0 ? '+' : ''}
                {formatCraftMoney(profit.profit)} ₽
              </span>
              <span className="text-white/60">
                {t('craft.margin')}: {formatCraftPercent(profit.margin)}
              </span>
            </div>
            <p className="text-xs text-white/50">
              {t('craft.sellInputsInstead')}: {formatCraftMoney(profit.sellInputsInstead)} ₽
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default CraftSection;
