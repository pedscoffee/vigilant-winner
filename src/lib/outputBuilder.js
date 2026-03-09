const DEFAULT_ORDER = ['hpi', 'ros', 'exam', 'assessment', 'plan'];
const DEFAULT_LABELS = {
  hpi: 'HPI',
  ros: 'ROS',
  exam: 'Exam',
  assessment: 'Assessment',
  plan: 'Plan'
};

export function buildOutputText(sections, preferences = {}) {
  const outputFormat = preferences.outputFormat || {};
  const order = outputFormat.order || DEFAULT_ORDER;
  const showHeaders = outputFormat.showHeaders !== false;
  const labels = { ...DEFAULT_LABELS, ...(outputFormat.labels || {}) };

  const rendered = [];

  for (const key of order) {
    const values = sections[key] || [];
    if (!values.length) {
      continue;
    }

    const body = values.join('\n');
    rendered.push(showHeaders ? `${labels[key]}:\n${body}` : body);
  }

  return rendered.join('\n\n').trim();
}

export function upsertUniqueLine(lines, nextLine) {
  if (!nextLine || lines.includes(nextLine)) {
    return lines;
  }
  return [...lines, nextLine];
}
