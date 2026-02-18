'use client';

import { useState } from 'react';
import { Button } from '@makikibahay/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@makikibahay/ui';
import { Badge } from '@makikibahay/ui';
import { GraduationCap, Briefcase, Home, Wifi, Car, Heart, MapPin } from 'lucide-react';
import type { UserPreferences } from '@makikibahay/types';

interface SurveyData {
  role: 'student' | 'worker';
  accommodationType: 'solo' | 'shared' | 'studio' | 'bed-space';
  priceMin: number;
  priceMax: number;
  amenities: string[];
  rules: string[];
  location?: { lat: number; lng: number };
  proximityMinutes: 5 | 10 | 15;
}

interface SurveyWizardProps {
  onComplete: (data: UserPreferences) => void;
  initialData?: Partial<SurveyData>;
}

const accommodationTypes = [
  { id: 'solo', label: 'Solo Room', icon: Home },
  { id: 'shared', label: 'Shared Room', icon: Heart },
  { id: 'studio', label: 'Studio Unit', icon: Home },
  { id: 'bed-space', label: 'Bed Space', icon: Home }
];

const amenities = [
  { id: 'AC', label: 'Air Conditioning' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'laundry', label: 'Laundry' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'parking', label: 'Parking' },
  { id: 'pets_allowed', label: 'Pets Allowed' }
];

const rules = [
  { id: 'no_curfew', label: 'No Curfew' },
  { id: 'no_smoking', label: 'No Smoking' },
  { id: 'visitors_allowed', label: 'Visitors Allowed' },
  { id: 'quiet_hours', label: 'Quiet Hours' }
];

export default function SurveyWizard({ onComplete, initialData }: SurveyWizardProps) {
  const [step, setStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    role: 'student',
    accommodationType: 'solo',
    priceMin: 3000,
    priceMax: 8000,
    amenities: [],
    rules: [],
    proximityMinutes: 10,
    ...initialData
  }
  );

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const userPreferences: UserPreferences = {
      isStudent: surveyData.role === 'student',
      accommodationType: surveyData.accommodationType,
      priceMin: surveyData.priceMin,
      priceMax: surveyData.priceMax,
      amenities: surveyData.amenities,
      location: surveyData.location ? {
        type: 'Point',
        coordinates: [surveyData.location.lng, surveyData.location.lat]
      } : {
        type: 'Point',
        coordinates: [120.9795, 15.7586] // Cabanatuan City coordinates
      },
      proximityMinutes: surveyData.proximityMinutes
    };

    onComplete(userPreferences);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">What type of renter are you?</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={surveyData.role === 'student' ? 'default' : 'outline'}
                className="p-8 h-24 flex-col"
                onClick={() => setSurveyData({ ...surveyData, role: 'student' })}
              >
                <GraduationCap className="h-8 w-8 mb-2" />
                Student
              </Button>
              <Button
                variant={surveyData.role === 'worker' ? 'default' : 'outline'}
                className="p-8 h-24 flex-col"
                onClick={() => setSurveyData({ ...surveyData, role: 'worker' })}
              >
                <Briefcase className="h-8 w-8 mb-2" />
                Working Professional
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">What's your budget range?</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Price (₱/month)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-border rounded-lg bg-surface text-primary-text"
                  value={surveyData.priceMin}
                  onChange={(e) => setSurveyData({ ...surveyData, priceMin: Number(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maximum Price (₱/month)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-border rounded-lg bg-surface text-primary-text"
                  value={surveyData.priceMax}
                  onChange={(e) => setSurveyData({ ...surveyData, priceMax: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">What type of accommodation do you prefer?</h3>
            <div className="grid grid-cols-2 gap-4">
              {accommodationTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={surveyData.accommodationType === type.id ? 'default' : 'outline'}
                  className="p-6 h-24 flex-col"
                  onClick={() => setSurveyData({ ...surveyData, accommodationType: type.id as any })}
                >
                  <type.icon className="h-8 w-8 mb-2" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">What amenities do you need?</h3>
            <div className="grid grid-cols-3 gap-3">
              {amenities.map((amenity) => (
                <Button
                  key={amenity.id}
                  variant={surveyData.amenities.includes(amenity.id) ? 'default' : 'outline'}
                  className="p-4 h-20 flex-col"
                  onClick={() => {
                    const newAmenities = surveyData.amenities.includes(amenity.id)
                      ? surveyData.amenities.filter(a => a !== amenity.id)
                      : [...surveyData.amenities, amenity.id];
                    setSurveyData({ ...surveyData, amenities: newAmenities });
                  }}
                >
                  <Wifi className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">{amenity.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">House rules preferences?</h3>
            <div className="grid grid-cols-2 gap-3">
              {rules.map((rule) => (
                <Button
                  key={rule.id}
                  variant={surveyData.rules.includes(rule.id) ? 'default' : 'outline'}
                  className="p-4 h-20 flex-col"
                  onClick={() => {
                    const newRules = surveyData.rules.includes(rule.id)
                      ? surveyData.rules.filter(r => r !== rule.id)
                      : [...surveyData.rules, rule.id];
                    setSurveyData({ ...surveyData, rules: newRules });
                  }}
                >
                  <span className="text-xs text-center">{rule.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Preferred Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Maximum walking distance</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((minutes) => (
                    <Button
                      key={minutes}
                      variant={surveyData.proximityMinutes === minutes ? 'default' : 'outline'}
                      onClick={() => setSurveyData({ ...surveyData, proximityMinutes: minutes as any })}
                    >
                      {minutes} min walk
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Click on map to set location (optional)
                </label>
                <div className="w-full h-48 bg-surface border border-border rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Map placeholder - location set to Cabanatuan City by default</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Find Your Perfect Match - Step {step} of 6</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>

          {step < 6 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90">
              Complete Survey
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}