import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Settings } from '../App';

interface SettingsPageProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export default function SettingsPage({ settings, onSettingsChange }: SettingsPageProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    toast.success('Settings saved successfully', {
      description: 'Your configuration has been updated',
    });
  };

  const updateSetting = (key: keyof Settings, value: number) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#3B82F6]" />
            System Configuration
          </CardTitle>
          <CardDescription>Configure load balancing and AI parameters</CardDescription>
        </CardHeader>
      </Card>

      {/* Load Balancing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Load Balancing Settings</CardTitle>
          <CardDescription>Configure server scaling and request limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxRequests">Max Requests per Second</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="maxRequests"
                min={100}
                max={5000}
                step={100}
                value={[localSettings.maxRequestsPerSecond]}
                onValueChange={(value) => updateSetting('maxRequestsPerSecond', value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={localSettings.maxRequestsPerSecond}
                onChange={(e) => updateSetting('maxRequestsPerSecond', parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <p className="text-gray-400">Threshold for triggering scaling decisions</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minServers">Minimum Servers</Label>
              <Input
                id="minServers"
                type="number"
                min={1}
                max={10}
                value={localSettings.minServers}
                onChange={(e) => updateSetting('minServers', parseInt(e.target.value) || 1)}
              />
              <p className="text-gray-400">Minimum active servers</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxServers">Maximum Servers</Label>
              <Input
                id="maxServers"
                type="number"
                min={1}
                max={20}
                value={localSettings.maxServers}
                onChange={(e) => updateSetting('maxServers', parseInt(e.target.value) || 1)}
              />
              <p className="text-gray-400">Maximum scalable servers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting Settings</CardTitle>
          <CardDescription>Configure request limits and blocking policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rateLimit">Requests Limit per IP</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="rateLimit"
                min={10}
                max={500}
                step={10}
                value={[localSettings.rateLimit]}
                onValueChange={(value) => updateSetting('rateLimit', value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={localSettings.rateLimit}
                onChange={(e) => updateSetting('rateLimit', parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <p className="text-gray-400">Maximum requests per minute from a single IP</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooldown">Cooldown Period (seconds)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="cooldown"
                min={10}
                max={300}
                step={10}
                value={[localSettings.cooldownPeriod]}
                onValueChange={(value) => updateSetting('cooldownPeriod', value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={localSettings.cooldownPeriod}
                onChange={(e) => updateSetting('cooldownPeriod', parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <p className="text-gray-400">Time before blocked IP can retry</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>AI Model Parameters</CardTitle>
          <CardDescription>Configure artificial intelligence decision-making</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="learningRate">Learning Rate</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="learningRate"
                min={0.001}
                max={0.1}
                step={0.001}
                value={[localSettings.learningRate]}
                onValueChange={(value) => updateSetting('learningRate', value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                step="0.001"
                value={localSettings.learningRate}
                onChange={(e) => updateSetting('learningRate', parseFloat(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <p className="text-gray-400">Model learning rate (lower = more stable)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decisionInterval">Decision Interval (seconds)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="decisionInterval"
                min={1}
                max={30}
                step={1}
                value={[localSettings.decisionInterval]}
                onValueChange={(value) => updateSetting('decisionInterval', value[0])}
                className="flex-1"
              />
              <Input
                type="number"
                value={localSettings.decisionInterval}
                onChange={(e) => updateSetting('decisionInterval', parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <p className="text-gray-400">Time between AI decision evaluations</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSave} className="bg-[#3B82F6] hover:bg-blue-600">
          <Save className="w-4 h-4 mr-2" />
          Save & Apply
        </Button>
        <Button
          variant="outline"
          onClick={() => setLocalSettings(settings)}
        >
          Reset Changes
        </Button>
      </div>
    </div>
  );
}
