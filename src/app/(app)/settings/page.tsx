'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProfile } from '@/lib/query/profile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { getGameColor } from '@/lib/utils';

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    businessName: '',
    defaultGame: 'pokemon',
    defaultCondition: 'NM',
    timezone: 'America/New_York',
    currency: 'USD',
  });
  const [appearance, setAppearance] = useState({ gameAccent: 'pokemon' });

  const handleSaveGeneral = () => {
    setHasUnsavedChanges(false);
    toast.success('Settings saved successfully');
  };

  const isPro = profile?.role === 'pro' || profile?.role === 'dealer';

  const selectClass =
    'w-full p-2 rounded-lg border border-input bg-input-background text-sm h-8 sm:h-9';

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Configure your JMB Card Ledger preferences
        </p>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
        <TabsList className="h-8 sm:h-9 w-full sm:w-auto">
          <TabsTrigger value="general" className="text-xs sm:text-sm flex-1 sm:flex-none">General</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm flex-1 sm:flex-none">Appearance</TabsTrigger>
          <TabsTrigger value="plan" className="text-xs sm:text-sm flex-1 sm:flex-none" asChild>
            <Link href="/settings/plan">Plan & Billing</Link>
          </TabsTrigger>
        </TabsList>

        {/* ── General tab ── */}
        <TabsContent value="general">
          <Card className="p-4 sm:p-5 md:p-6 border-border rounded-xl space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="businessName" className="text-xs sm:text-sm">Business Name</Label>
              <Input
                id="businessName"
                value={generalSettings.businessName}
                onChange={(e) => {
                  setGeneralSettings({ ...generalSettings, businessName: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Your business name"
                className="bg-input-background h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>

            {/* Default game + condition side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="defaultGame" className="text-xs sm:text-sm">Default Game</Label>
                <select
                  id="defaultGame"
                  value={generalSettings.defaultGame}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, defaultGame: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className={selectClass}
                >
                  <option value="pokemon">Pokémon</option>
                  <option value="yugioh">Yu-Gi-Oh!</option>
                  <option value="riftbound">Riftbound</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="defaultCondition" className="text-xs sm:text-sm">Default Condition</Label>
                <select
                  id="defaultCondition"
                  value={generalSettings.defaultCondition}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, defaultCondition: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className={selectClass}
                >
                  <option value="NM">Near Mint (NM)</option>
                  <option value="LP">Lightly Played (LP)</option>
                  <option value="MP">Moderately Played (MP)</option>
                  <option value="HP">Heavily Played (HP)</option>
                  <option value="DMG">Damaged (DMG)</option>
                </select>
              </div>
            </div>

            {/* Timezone + currency side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="timezone" className="text-xs sm:text-sm">Timezone</Label>
                <select
                  id="timezone"
                  value={generalSettings.timezone}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, timezone: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className={selectClass}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="currency" className="text-xs sm:text-sm">Currency</Label>
                <Input
                  id="currency"
                  value={generalSettings.currency}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed h-8 sm:h-9 text-xs sm:text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  USD only for now. More coming soon.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSaveGeneral}
              disabled={!hasUnsavedChanges}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </Card>
        </TabsContent>

        {/* ── Appearance tab ── */}
        <TabsContent value="appearance">
          <Card className="p-4 sm:p-5 md:p-6 border-border rounded-xl space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm">Game Accent Color</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Choose which game&apos;s color accent to use throughout the app
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {(['pokemon', 'yugioh', 'riftbound'] as const).map((game) => (
                  <button
                    key={game}
                    type="button"
                    onClick={() => setAppearance({ ...appearance, gameAccent: game })}
                    className={`p-2.5 sm:p-4 rounded-xl border-2 transition-all ${
                      appearance.gameAccent === game
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className="w-full h-1.5 sm:h-2 rounded-full mb-2 sm:mb-3"
                      style={{ backgroundColor: getGameColor(game) }}
                    />
                    <p className="text-xs sm:text-sm capitalize">{game}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm">Preview</Label>
              <div className="p-3 sm:p-4 bg-muted rounded-xl space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-2.5 sm:w-3 h-10 sm:h-12 rounded-full shrink-0"
                    style={{ backgroundColor: getGameColor(appearance.gameAccent) }}
                  />
                  <div>
                    <p className="text-xs sm:text-sm">Sample Card Name</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {appearance.gameAccent}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}