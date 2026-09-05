import Papa from 'papaparse';

export type Row = Record<string, string>;

export interface CsvData {
  name: string;
  headers: string[];
  rows: Row[];
}

export interface FieldChange {
  column: string;
  before: string;
  after: string;
}

export interface RecordChange {
  key: string;
  keyValues: Row;
  before?: Row;
  after?: Row;
  fields: FieldChange[];
}

export interface DuplicateGroup {
  key: string;
  keyValues: Row;
  before: Row[];
  after: Row[];
}

export interface DiffResult {
  keys: string[];
  columns: string[];
  added: RecordChange[];
  removed: RecordChange[];
  changed: RecordChange[];
  duplicates: DuplicateGroup[];
  unchanged: number;
}

const displayKey = (row: Row, keys: string[]) =>
  keys.map((key) => `${key}=${row[key] ?? ''}`).join(' · ');

const encodedKey = (row: Row, keys: string[]) =>
  keys.map((key) => `${(row[key] ?? '').length}:${row[key] ?? ''}`).join('|');

const keyValues = (row: Row, keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, row[key] ?? '']));

export function parseCsv(text: string, name = 'CSV'): CsvData {
  const source = text.replace(/^\uFEFF/, '');
  const parsed = Papa.parse<string[]>(source, {
    skipEmptyLines: 'greedy',
  });

  const first = parsed.errors.find((error) =>
    error.code !== 'UndetectableDelimiter' || parsed.data.some((row) => row.length > 1),
  );
  if (first) {
    throw new Error(`CSV could not be read near row ${(first.row ?? 0) + 1}: ${first.message}`);
  }
  if (!parsed.data.length) throw new Error('This CSV is empty. Choose a file with a header row.');

  const headers = parsed.data[0].map((header, index) => {
    const clean = header.trim();
    if (!clean) throw new Error(`Column ${index + 1} has no header. Name every column, then try again.`);
    return clean;
  });
  const duplicates = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicates.length) {
    throw new Error(`Duplicate column header: ${[...new Set(duplicates)].join(', ')}. Make headers unique first.`);
  }

  const rows = parsed.data.slice(1).map((cells, rowIndex) => {
    if (cells.length > headers.length) {
      throw new Error(`Row ${rowIndex + 2} has ${cells.length} cells but the header has ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
  });

  return { name, headers, rows };
}

export function compareCsv(before: CsvData, after: CsvData, keys: string[]): DiffResult {
  if (!keys.length) throw new Error('Choose at least one key column.');
  for (const key of keys) {
    if (!before.headers.includes(key) || !after.headers.includes(key)) {
      throw new Error(`Key column “${key}” must exist in both files.`);
    }
  }

  const columns = [...new Set([...before.headers, ...after.headers])];
  const indexRows = (rows: Row[]) => {
    const index = new Map<string, Row[]>();
    for (const row of rows) {
      const id = encodedKey(row, keys);
      const group = index.get(id) ?? [];
      group.push(row);
      index.set(id, group);
    }
    return index;
  };

  const left = indexRows(before.rows);
  const right = indexRows(after.rows);
  const ids = new Set([...left.keys(), ...right.keys()]);
  const result: DiffResult = {
    keys,
    columns,
    added: [],
    removed: [],
    changed: [],
    duplicates: [],
    unchanged: 0,
  };

  for (const id of ids) {
    const beforeRows = left.get(id) ?? [];
    const afterRows = right.get(id) ?? [];
    const exemplar = beforeRows[0] ?? afterRows[0];
    const base = { key: displayKey(exemplar, keys), keyValues: keyValues(exemplar, keys) };

    if (beforeRows.length > 1 || afterRows.length > 1) {
      result.duplicates.push({ ...base, before: beforeRows, after: afterRows });
      continue;
    }
    if (!beforeRows.length) {
      result.added.push({ ...base, after: afterRows[0], fields: [] });
      continue;
    }
    if (!afterRows.length) {
      result.removed.push({ ...base, before: beforeRows[0], fields: [] });
      continue;
    }

    const fields = columns
      .filter((column) => !keys.includes(column))
      .filter((column) => (beforeRows[0][column] ?? '') !== (afterRows[0][column] ?? ''))
      .map((column) => ({
        column,
        before: beforeRows[0][column] ?? '',
        after: afterRows[0][column] ?? '',
      }));
    if (fields.length) result.changed.push({ ...base, before: beforeRows[0], after: afterRows[0], fields });
    else result.unchanged += 1;
  }

  const sort = <T extends { key: string }>(items: T[]) => items.sort((a, b) => a.key.localeCompare(b.key));
  sort(result.added);
  sort(result.removed);
  sort(result.changed);
  sort(result.duplicates);
  return result;
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function reportCsv(result: DiffResult, kinds: Set<string>): string {
  const rows: Array<Array<string | number>> = [
    ['change_type', ...result.keys, 'column', 'before', 'after'],
  ];
  if (kinds.has('changed')) {
    for (const item of result.changed) {
      for (const field of item.fields) {
        rows.push(['changed', ...result.keys.map((key) => item.keyValues[key]), field.column, field.before, field.after]);
      }
    }
  }
  if (kinds.has('added')) {
    for (const item of result.added) {
      rows.push(['added', ...result.keys.map((key) => item.keyValues[key]), '', '', JSON.stringify(item.after)]);
    }
  }
  if (kinds.has('removed')) {
    for (const item of result.removed) {
      rows.push(['removed', ...result.keys.map((key) => item.keyValues[key]), '', JSON.stringify(item.before), '']);
    }
  }
  if (kinds.has('duplicates')) {
    for (const item of result.duplicates) {
      rows.push(['duplicate', ...result.keys.map((key) => item.keyValues[key]), '', `${item.before.length} row(s)`, `${item.after.length} row(s)`]);
    }
  }
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
