import { useState } from 'react';
import type { MealSlot } from '@/types';
import { TopBar } from '@/components/Layout';
import { Badge, DemoNote, Sheet, useToast } from '@/components/ui';
import { useStore } from '@/state/store';
import { RECIPES } from '@/data/catalog';
import { daysAgo } from '@/engine/metrics';

const SLOTS: { id: MealSlot; label: string }[] = [
  { id: 'kahvalti', label: 'Kahvaltı' }, { id: 'ogle', label: 'Öğle' }, { id: 'aksam', label: 'Akşam' }, { id: 'ara', label: 'Ara' },
];
const DAYS = [0, 1, 2].map((d) => daysAgo(-d));

export default function FoodStudio() {
  const toast = useToast();
  const { state, addMealEntry, buildGrocery, toggleGrocery } = useStore();
  const [pick, setPick] = useState<{ date: string; slot: MealSlot } | null>(null);

  const entryFor = (date: string, slot: MealSlot) => state.mealPlan.find((e) => e.date === date && e.slot === slot);
  const recipe = (id?: string) => RECIPES.find((r) => r.id === id);

  return (
    <div>
      <TopBar title="My Food & Nutrition" back={-1} right={<Badge tone="demo">Demo içerik</Badge>} />
      <div className="pad stack">
        <div className="card tinted small">3 günlük kolay öğün planı kur, alışveriş listeni tek dokunuşla oluştur. Tıbbi/özel diyet için diyetisyen (C02) önerilir.</div>

        <div className="sectiontitle">3 günlük plan</div>
        {DAYS.map((date, i) => (
          <div key={date} className="card">
            <div className="h3">{i + 1}. gün <span className="small faint">({date.slice(8)}.{date.slice(5, 7)})</span></div>
            <div className="stack-sm" style={{ marginTop: 8 }}>
              {SLOTS.map((s) => {
                const e = entryFor(date, s.id);
                return (
                  <button key={s.id} className="opt" onClick={() => setPick({ date, slot: s.id })}>
                    <span style={{ flex: 1 }}><b>{s.label}</b>{e && <span className="small muted"> — {recipe(e.recipeId)?.titleTr}</span>}</span>
                    <span className="lr-chevron">{e ? '✎' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button className="btn btn-primary block" onClick={() => { buildGrocery(); toast.show('Alışveriş listesi oluşturuldu'); }}>Alışveriş listesi oluştur</button>

        {state.grocery.length > 0 && (
          <div className="card">
            <div className="sectiontitle" style={{ marginTop: 0 }}>Alışveriş listem (tekilleştirilmiş)</div>
            {state.grocery.map((g) => (
              <div key={g.id} className="row" style={{ padding: '6px 0', gap: 10 }}>
                <button className="opt-check" style={{ borderWidth: 2, borderStyle: 'solid', borderRadius: '50%', background: g.done ? 'var(--ok)' : '#fff', borderColor: g.done ? 'var(--ok)' : 'var(--border-strong)' }} onClick={() => toggleGrocery(g.id)}>{g.done ? '✓' : ''}</button>
                <span className="small" style={{ flex: 1, textDecoration: g.done ? 'line-through' : 'none' }}>{g.nameTr}</span>
                <span className="tiny faint">{g.qtyTr}</span>
              </div>
            ))}
          </div>
        )}

        <DemoNote>Marketten sipariş/ödeme entegrasyonu yalnızca demodur. Diyetisyen onaylı plan ile kendi seçtiğin tarifler ayrı etiketlenir.</DemoNote>
      </div>

      <Sheet open={!!pick} onClose={() => setPick(null)} title="Tarif seç">
        <div className="stack-sm">
          {RECIPES.map((r) => (
            <button key={r.id} className="opt" onClick={() => { if (pick) { addMealEntry(pick.date, pick.slot, r.id); setPick(null); toast.show('Öğün eklendi'); } }}>
              <span style={{ flex: 1 }}><b>{r.titleTr}</b><span className="small muted"> · {r.minutes} dk</span>
                <span className="row wrap" style={{ gap: 4, marginTop: 4 }}>{r.tagsTr.map((t) => <span key={t} className="tiny faint">#{t}</span>)}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
