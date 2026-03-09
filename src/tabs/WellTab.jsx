import { useEffect, useMemo, useState } from 'react';

const AGE_ORDER = [
  '2mo',
  '4mo',
  '6mo',
  '9mo',
  '12mo',
  '15mo',
  '18mo',
  '2yr',
  '3yr',
  '4yr',
  '5yr',
  '6yr',
  '7yr',
  '8yr',
  '9yr',
  '10yr',
  '11yr',
  '12yr',
  '13yr',
  '14yr',
  '15yr',
  '16yr',
  '17yr',
  '18yr'
];

const BMI_BANDS = {
  '2yr': { p5: 14, p85: 18, p95: 19 },
  '5yr': { p5: 13.5, p85: 17.2, p95: 18.8 },
  '11yr': { p5: 14.8, p85: 21.5, p95: 24.5 },
  '16yr': { p5: 17, p85: 25.8, p95: 30 }
};

function nearestBand(age) {
  if (BMI_BANDS[age]) {
    return BMI_BANDS[age];
  }
  if (age.endsWith('mo')) {
    return BMI_BANDS['2yr'];
  }
  const year = Number(age.replace('yr', ''));
  if (Number.isNaN(year)) {
    return BMI_BANDS['5yr'];
  }
  if (year <= 4) return BMI_BANDS['2yr'];
  if (year <= 8) return BMI_BANDS['5yr'];
  if (year <= 13) return BMI_BANDS['11yr'];
  return BMI_BANDS['16yr'];
}

function bmiCategory(age, bmi) {
  const band = nearestBand(age);
  if (bmi < band.p5) return 'below 5th percentile';
  if (bmi < band.p85) return 'between 5th and 85th percentile';
  if (bmi < band.p95) return 'between 85th and 95th percentile';
  return 'above 95th percentile';
}

export default function WellTab({ wellVisit, onSetContribution }) {
  const ages = useMemo(() => {
    const dataAges = Object.keys(wellVisit?.ages || {});
    return AGE_ORDER.filter((age) => dataAges.includes(age));
  }, [wellVisit]);

  const [selectedAge, setSelectedAge] = useState(ages[0] || '2mo');
  const ageContent = wellVisit?.ages?.[selectedAge] || {
    milestones: [],
    guidance: [],
    immunizations: [],
    screenings: [],
    includeHC: false
  };

  const [milestones, setMilestones] = useState({});
  const [guidance, setGuidance] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [vision, setVision] = useState('pass');
  const [hearing, setHearing] = useState('pass');
  const [screeningName, setScreeningName] = useState('');
  const [screeningScore, setScreeningScore] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [headCircCm, setHeadCircCm] = useState('');

  useEffect(() => {
    const nextMilestones = {};
    for (const item of ageContent.milestones || []) {
      nextMilestones[item] = true;
    }
    setMilestones(nextMilestones);
    setGuidance(ageContent.guidance || []);
    setImmunizations(ageContent.immunizations || []);
    setScreeningName(ageContent.screenings?.[0] || '');
    setScreeningScore('');
    setVision('pass');
    setHearing('pass');
  }, [selectedAge]);

  const bmi = useMemo(() => {
    const w = Number(weightKg);
    const h = Number(heightCm);
    if (!w || !h) return null;
    const value = w / ((h / 100) * (h / 100));
    return Number(value.toFixed(1));
  }, [weightKg, heightCm]);

  useEffect(() => {
    const achieved = Object.entries(milestones)
      .filter(([, done]) => done)
      .map(([name]) => name);
    const concerns = Object.entries(milestones)
      .filter(([, done]) => !done)
      .map(([name]) => name);

    const hpi = [`Well child visit at ${selectedAge}.`];
    const assessment = ['Routine child health examination.'];
    const plan = [];

    if (achieved.length) {
      assessment.push(`Developmental milestones achieved: ${achieved.join(', ')}.`);
    }
    if (concerns.length) {
      assessment.push(`Developmental concerns noted: ${concerns.join(', ')}.`);
    }

    if (guidance.length) {
      plan.push(`Anticipatory guidance provided regarding: ${guidance.join(', ')}.`);
    }

    if (immunizations.length) {
      plan.push(`Immunizations addressed today: ${immunizations.join(', ')}.`);
    }

    plan.push(`Vision screen ${vision === 'pass' ? 'passed' : 'referred'}. Hearing screen ${hearing === 'pass' ? 'passed' : 'referred'}.`);

    if (screeningName) {
      const scoreText = screeningScore ? ` score ${screeningScore}` : '';
      plan.push(`${screeningName} completed${scoreText}.`);
    }

    if (bmi !== null) {
      plan.push(`Growth: weight ${weightKg} kg, height ${heightCm} cm, BMI ${bmi} (${bmiCategory(selectedAge, bmi)}).`);
    }

    if (ageContent.includeHC && headCircCm) {
      plan.push(`Head circumference ${headCircCm} cm documented.`);
    }

    onSetContribution('hpi', 'well', hpi);
    onSetContribution('assessment', 'well', assessment);
    onSetContribution('plan', 'well', plan);
  }, [
    selectedAge,
    milestones,
    guidance,
    immunizations,
    vision,
    hearing,
    screeningName,
    screeningScore,
    weightKg,
    heightCm,
    headCircCm,
    bmi,
    ageContent,
    onSetContribution
  ]);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="mb-2 text-sm font-semibold text-slate-900">Age Selector</p>
        <div className="flex flex-wrap gap-2">
          {ages.map((age) => (
            <button
              key={age}
              className={`rounded border px-2 py-1 text-xs ${
                selectedAge === age ? 'border-sea bg-sea text-white' : 'border-slate-300 text-slate-700'
              }`}
              type="button"
              onClick={() => setSelectedAge(age)}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">Developmental milestones</p>
        <div className="mt-2 space-y-1">
          {(ageContent.milestones || []).map((milestone) => (
            <label key={milestone} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!!milestones[milestone]}
                onChange={(event) => setMilestones((prev) => ({ ...prev, [milestone]: event.target.checked }))}
              />
              {milestone}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">Anticipatory guidance</p>
        <div className="mt-2 space-y-1">
          {(ageContent.guidance || []).map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={guidance.includes(item)}
                onChange={(event) => {
                  setGuidance((prev) => {
                    const next = new Set(prev);
                    if (event.target.checked) next.add(item);
                    else next.delete(item);
                    return [...next];
                  });
                }}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">Immunizations due</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(ageContent.immunizations || []).map((shot) => (
            <label key={shot} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={immunizations.includes(shot)}
                onChange={(event) => {
                  setImmunizations((prev) => {
                    const next = new Set(prev);
                    if (event.target.checked) next.add(shot);
                    else next.delete(shot);
                    return [...next];
                  });
                }}
              />{' '}
              {shot}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-900">Vision/Hearing</p>
          <div className="mt-2 space-y-2 text-sm">
            <label className="block">
              Vision
              <select className="ml-2 rounded border border-slate-300" value={vision} onChange={(e) => setVision(e.target.value)}>
                <option value="pass">Pass</option>
                <option value="refer">Refer</option>
              </select>
            </label>
            <label className="block">
              Hearing
              <select className="ml-2 rounded border border-slate-300" value={hearing} onChange={(e) => setHearing(e.target.value)}>
                <option value="pass">Pass</option>
                <option value="refer">Refer</option>
              </select>
            </label>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-900">Developmental screening</p>
          <select
            className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={screeningName}
            onChange={(event) => setScreeningName(event.target.value)}
          >
            {(ageContent.screenings || []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Score"
            value={screeningScore}
            onChange={(event) => setScreeningScore(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">Growth parameters</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <input
            className="rounded border border-slate-300 px-2 py-1"
            placeholder="Weight (kg)"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
          />
          <input
            className="rounded border border-slate-300 px-2 py-1"
            placeholder="Height (cm)"
            value={heightCm}
            onChange={(event) => setHeightCm(event.target.value)}
          />
          {ageContent.includeHC ? (
            <input
              className="rounded border border-slate-300 px-2 py-1"
              placeholder="Head circumference (cm)"
              value={headCircCm}
              onChange={(event) => setHeadCircCm(event.target.value)}
            />
          ) : null}
          <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">BMI: {bmi ?? '--'}</div>
        </div>
      </div>
    </div>
  );
}
