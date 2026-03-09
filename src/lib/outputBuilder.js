const DEFAULT_ORDER = ['hpi', 'ros', 'exam', 'assessment', 'plan'];
const DEFAULT_LABELS = {
  hpi: 'HPI',
  ros: 'ROS',
  exam: 'Exam',
  assessment: 'Assessment',
  plan: 'Plan'
};

function formatBody(values, separator) {
  if (separator === 'dash') {
    return values.map((line) => `- ${line}`).join('\n');
  }
  if (separator === 'line') {
    return values.join('\n');
  }
  return values.join('\n');
}

export function buildOutputText(sections, preferences = {}) {
  const outputFormat = preferences.outputFormat || {};
  const order = outputFormat.order || DEFAULT_ORDER;
  const showHeaders = outputFormat.showHeaders !== false;
  const labels = { ...DEFAULT_LABELS, ...(outputFormat.labels || {}) };
  const separator = outputFormat.separator || 'blank';

  const rendered = [];

  for (const key of order) {
    const values = sections[key] || [];
    if (!values.length) {
      continue;
    }

    const body = formatBody(values, separator);
    rendered.push(showHeaders ? `${labels[key]}:\n${body}` : body);
  }

  return rendered.join('\n\n').trim();
}
