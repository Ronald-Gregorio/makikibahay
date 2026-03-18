'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Badge } from "@/components/ui/index";
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Setting {
    key: string;
    value: string[];
    description: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [newItems, setNewItems] = useState<Record<string, string>>({});
    const { toast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await api.get<Record<string, string[]>>('/settings');
            setSettings(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (key: string) => {
        const value = newItems[key]?.trim();
        if (!value) return;
        if (settings[key].includes(value)) {
            toast({ title: 'Already exists', description: `"${value}" is already in the list.` });
            return;
        }

        setSettings(prev => ({
            ...prev,
            [key]: [...prev[key], value]
        }));
        setNewItems(prev => ({ ...prev, [key]: '' }));
    };

    const handleRemoveItem = (key: string, item: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: prev[key].filter(i => i !== item)
        }));
    };

    const handleSave = async (key: string) => {
        try {
            await api.post('/settings', { key, value: settings[key] });
            toast({ title: 'Success', description: `${key} updated successfully.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to update ${key}.` });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    const sections = [
        { key: 'propertyTypes', title: 'Property Types', description: 'Manage the types of properties users can list.' },
        { key: 'amenities', title: 'Amenities', description: 'Global list of amenities available for selection.' },
        { key: 'houseRules', title: 'House Rules', description: 'Standard rules owners can include in their listings.' }
    ];

    return (
        <div className="space-y-8 pb-10">
            <header>
                <h1 className="text-4xl font-bold font-headline">Global Settings</h1>
                <p className="text-muted-foreground mt-2">Manage the dynamic options used throughout the platform.</p>
            </header>

            <div className="grid gap-6">
                {sections.map(section => (
                    <Card key={section.key}>
                        <CardHeader>
                            <CardTitle>{section.title}</CardTitle>
                            <CardDescription>{section.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-lg bg-secondary/20">
                                {settings[section.key]?.map(item => (
                                    <Badge key={item} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                                        {item}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-4 w-4 rounded-full hover:bg-destructive hover:text-white p-0"
                                            onClick={() => handleRemoveItem(section.key, item)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                                {settings[section.key]?.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic">No items added yet.</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <div className="grid gap-2 flex-grow">
                                    <Input 
                                        placeholder={`Add new ${section.title.toLowerCase().slice(0, -1)}...`}
                                        value={newItems[section.key] || ''}
                                        onChange={(e) => setNewItems(prev => ({ ...prev, [section.key]: e.target.value }))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(section.key)}
                                    />
                                </div>
                                <Button variant="outline" onClick={() => handleAddItem(section.key)}>
                                    <Plus className="h-4 w-4 mr-2" /> Add
                                </Button>
                                <Button onClick={() => handleSave(section.key)}>
                                    <Save className="h-4 w-4 mr-2" /> Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
