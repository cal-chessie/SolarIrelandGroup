'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Realistic 2026 estimates for Ireland
// Average generation in Ireland: ~850 kWh per kWp per year
// Average electricity price in 2026: ~€0.40/kWh
// System costs (after €1,800 grant): approximate ranges
const SYSTEM_CONFIGS = {
  '2': { kWp: 2, annualKWh: 1700, installCost: 4500, label: '2 kWp (~6 panels)' },
  '3': { kWp: 3, annualKWh: 2550, installCost: 5500, label: '3 kWp (~8 panels)' },
  '4': { kWp: 4, annualKWh: 3400, installCost: 6500, label: '4 kWp (~10 panels)' },
  '5': { kWp: 5, annualKWh: 4250, installCost: 7500, label: '5 kWp (~13 panels)' },
};

const GRANT = 1800;
const ELECTRICITY_PRICE = 0.40; // €/kWh estimate for 2026
const SELF_CONSUMPTION_RATE = 0.5; // Roughly 50% self-consumed, rest exported

export default function SavingsCalculator() {
  const [systemSize, setSystemSize] = useState<string>('4');
  const [billAmount, setBillAmount] = useState<string>('200');

  const config = SYSTEM_CONFIGS[systemSize as keyof typeof SYSTEM_CONFIGS];
  const monthlyBill = parseFloat(billAmount) || 0;

  const results = useMemo(() => {
    if (!config || monthlyBill <= 0) return null;

    const annualGeneration = config.annualKWh;
    const selfConsumed = annualGeneration * SELF_CONSUMPTION_RATE;
    const exported = annualGeneration - selfConsumed;

    // Annual savings: self-consumed electricity at retail price
    // Export payments vary; being conservative, not including export income
    const annualSavings = selfConsumed * ELECTRICITY_PRICE;

    // Payback: cost after grant / annual savings
    const costAfterGrant = config.installCost - GRANT;
    const paybackYears = annualSavings > 0 ? costAfterGrant / annualSavings : Infinity;

    // 25-year lifetime savings (conservative - panels degrade ~0.5%/year)
    let totalSavings = 0;
    let remaining = 25;
    let yearlyOutput = annualGeneration;
    for (let i = 0; i < 25; i++) {
      const consumed = yearlyOutput * SELF_CONSUMPTION_RATE;
      totalSavings += consumed * ELECTRICITY_PRICE;
      yearlyOutput *= 0.995; // 0.5% annual degradation
    }

    return {
      annualGeneration: Math.round(annualGeneration),
      annualSavings: Math.round(annualSavings),
      costAfterGrant,
      paybackYears: Math.round(paybackYears * 10) / 10,
      lifetimeSavings: Math.round(totalSavings),
    };
  }, [config, monthlyBill]);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <Calculator className="inline-block w-9 h-9 text-amber-400 mr-2 -mt-1" />
            Savings <span className="text-gradient">Estimator</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get a rough idea of what solar panels could save you. These are
            estimates only &mdash; actual savings depend on your home and usage.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            {/* System Size */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                System Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SYSTEM_CONFIGS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setSystemSize(key)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      systemSize === key
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.08]'
                    }`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Bill */}
            <div>
              <label
                htmlFor="bill-input"
                className="block text-sm font-medium text-gray-300 mb-3"
              >
                Monthly Electricity Bill
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  &euro;
                </span>
                <input
                  id="bill-input"
                  type="number"
                  min="50"
                  max="500"
                  step="10"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full mt-3 accent-amber-400"
              />
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="border-t border-white/[0.06] pt-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400">
                    {results.annualGeneration.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">kWh per year</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400">
                    &euro;{results.annualSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">est. annual savings</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400">
                    {results.paybackYears}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">year payback</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-400">
                    &euro;{results.lifetimeSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">25-year est. savings</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Estimates based on {config.kWp} kWp system, &euro;{config.installCost.toLocaleString()} installation
                  cost (before &euro;{GRANT} SEAI grant), ~850 kWh/kWp annual yield in Ireland,
                  {ELECTRICITY_PRICE * 100}c/kWh electricity price, and 50% self-consumption rate.
                  Actual results vary based on roof orientation, shading, and usage patterns.
                  Export payments are not included in this estimate.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            size="lg"
            className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-8 py-6 rounded-xl"
            asChild
          >
            <a href="https://wa.me/353873958424?text=Hi%2C%20I%27d%20like%20a%20detailed%20quote%20for%20solar%20panels." target="_blank" rel="noopener noreferrer">
              Get a Detailed Quote
            </a>
          </Button>
          <p className="mt-3 text-sm text-gray-500">
            Exact savings require a site survey &mdash; it&apos;s free and no-obligation
          </p>
        </motion.div>
      </div>
    </section>
  );
}
