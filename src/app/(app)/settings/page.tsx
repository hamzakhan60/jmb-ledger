'use client';

import { useState } from 'react';
import { useProfile } from '@/lib/query/profile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your JMB Card Ledger preferences
        </p>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6 border-border rounded-xl space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={generalSettings.businessName}
                onChange={(e) => {
                  setGeneralSettings({
                    ...generalSettings,
                    businessName: e.target.value,
                  });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Your business name"
                className="bg-input-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultGame">Default Game</Label>
              <select
                id="defaultGame"
                value={generalSettings.defaultGame}
                onChange={(e) => {
                  setGeneralSettings({
                    ...generalSettings,
                    defaultGame: e.target.value,
                  });
                  setHasUnsavedChanges(true);
                }}
                className="w-full p-2 rounded-lg border border-input bg-input-background"
              >
                <option value="pokemon">Pokémon</option>
                <option value="yugioh">Yu-Gi-Oh!</option>
                <option value="riftbound">Riftbound</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCondition">Default Condition</Label>
              <select
                id="defaultCondition"
                value={generalSettings.defaultCondition}
                onChange={(e) => {
                  setGeneralSettings({
                    ...generalSettings,
                    defaultCondition: e.target.value,
                  });
                  setHasUnsavedChanges(true);
                }}
                className="w-full p-2 rounded-lg border border-input bg-input-background"
              >
                <option value="NM">Near Mint (NM)</option>
                <option value="LP">Lightly Played (LP)</option>
                <option value="MP">Moderately Played (MP)</option>
                <option value="HP">Heavily Played (HP)</option>
                <option value="DMG">Damaged (DMG)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={generalSettings.timezone}
                onChange={(e) => {
                  setGeneralSettings({
                    ...generalSettings,
                    timezone: e.target.value,
                  });
                  setHasUnsavedChanges(true);
                }}
                className="w-full p-2 rounded-lg border border-input bg-input-background"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={generalSettings.currency}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                USD only for now. More currencies coming soon.
              </p>
            </div>
            <Button
              onClick={handleSaveGeneral}
              disabled={!hasUnsavedChanges}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-6 border-border rounded-xl space-y-6">
            <div className="space-y-3">
              <Label>Game Accent Color</Label>
              <p className="text-sm text-muted-foreground">
                Choose which game&apos;s color accent to use throughout the app
              </p>
              <div className="grid grid-cols-3 gap-4">
                {(['pokemon', 'yugioh', 'riftbound'] as const).map((game) => (
                  <button
                    key={game}
                    type="button"
                    onClick={() =>
                      setAppearance({ ...appearance, gameAccent: game })
                    }
                    className={`p-4 rounded-xl border-2 transition-all ${
                      appearance.gameAccent === game
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className="w-full h-2 rounded-full mb-3"
                      style={{ backgroundColor: getGameColor(game) }}
                    />
                    <p className="text-sm capitalize">{game}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Preview</Label>
              <div className="p-4 bg-muted rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-12 rounded-full"
                    style={{
                      backgroundColor: getGameColor(appearance.gameAccent),
                    }}
                  />
                  <div>
                    <p className="text-sm">Sample Card Name</p>
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
