import { describe, expect, it } from 'vitest';
import { compareCsv, parseCsv, reportCsv } from '../src/csv';

describe('CSV parser', () => {
  it('handles UTF-8 BOM, quoted commas, escaped quotes, and line breaks', () => {
    const csv = parseCsv('\uFEFFid,name,note\r\n1,"Amélie, Inc.","said ""yes"""\r\n2,Beta,"two\nlines"\r\n');
    expect(csv.headers).toEqual(['id', 'name', 'note']);
    expect(csv.rows).toEqual([
      { id: '1', name: 'Amélie, Inc.', note: 'said "yes"' },
      { id: '2', name: 'Beta', note: 'two\nlines' },
    ]);
  });

  it('rejects malformed shape and duplicate headers with actionable errors', () => {
    expect(() => parseCsv('id,id\n1,2')).toThrow(/Duplicate column header/);
    expect(() => parseCsv('id,name\n1,A,extra')).toThrow(/3 cells/);
  });

  it('accepts a valid one-column CSV for key-only reconciliation', () => {
    const before = parseCsv('id\n1\n2\n');
    const after = parseCsv('id\n2\n3\n');
    const result = compareCsv(before, after, ['id']);

    expect(before).toEqual({ name: 'CSV', headers: ['id'], rows: [{ id: '1' }, { id: '2' }] });
    expect({ added: result.added.map((item) => item.key), removed: result.removed.map((item) => item.key), unchanged: result.unchanged })
      .toEqual({ added: ['id=3'], removed: ['id=1'], unchanged: 1 });
  });
});

describe('keyed comparison', () => {
  it('finds additions, removals and changed fields despite reorder', () => {
    const before = parseCsv('tenant,id,name,status\nA,1,One,open\nA,2,Two,open\nB,1,Other,closed');
    const after = parseCsv('tenant,id,name,status\nB,1,Other,active\nA,3,Three,open\nA,1,One,open');
    const result = compareCsv(before, after, ['tenant', 'id']);
    expect(result.added.map((row) => row.key)).toEqual(['tenant=A · id=3']);
    expect(result.removed.map((row) => row.key)).toEqual(['tenant=A · id=2']);
    expect(result.changed[0].fields).toEqual([{ column: 'status', before: 'closed', after: 'active' }]);
    expect(result.unchanged).toBe(1);
  });

  it('quarantines all keys duplicated on either side', () => {
    const before = parseCsv('id,value\n1,A\n1,B\n2,C');
    const after = parseCsv('id,value\n1,D\n2,C');
    const result = compareCsv(before, after, ['id']);
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0].before).toHaveLength(2);
    expect(result.changed).toHaveLength(0);
  });

  it('matches a seeded 10k-row fixture with 100% expected recall', () => {
    const beforeRows = Array.from({ length: 10_000 }, (_, index) => `${index},Customer ${index},${index % 7}`);
    const afterRows = beforeRows
      .filter((_, index) => index < 50 || index >= 70)
      .map((row, index) => {
        const id = Number(row.slice(0, row.indexOf(',')));
        return id >= 100 && id < 130 ? row.replace(/,\d+$/, ',updated') : row;
      })
      .reverse();
    for (let id = 10_000; id < 10_015; id++) afterRows.push(`${id},Customer ${id},new`);
    const result = compareCsv(parseCsv(`id,name,status\n${beforeRows.join('\n')}`), parseCsv(`id,name,status\n${afterRows.join('\n')}`), ['id']);
    expect({ added: result.added.length, removed: result.removed.length, changed: result.changed.length, unchanged: result.unchanged })
      .toEqual({ added: 15, removed: 20, changed: 30, unchanged: 9950 });
  });

  it('exports one row per changed field and preserves Unicode', () => {
    const result = compareCsv(parseCsv('id,name\n1,Old'), parseCsv('id,name\n1,Néw'), ['id']);
    expect(reportCsv(result, new Set(['changed']))).toContain('changed,1,name,Old,Néw');
  });
});
