import importExportFeature from '@adminjs/import-export';

/**
 * importExportFeature() always adds BOTH 'import' and 'export' — no option
 * to pick just one (see node_modules/@adminjs/import-export's
 * importExportFeature.js: it unconditionally registers both actions).
 * exportOnlyFeature is that same feature, paired with exportOnlyActions to
 * hide 'import' back off — for resources that must stay read-only (e.g.
 * RawSqlResource-backed reporting resources, whose create()/update() always
 * throw, so a real import would fail every row, not just be pointless).
 *
 * Use together on a resource:
 *
 *   features: [exportOnlyFeature({ componentLoader })],
 *   options: { actions: { ...exportOnlyActions, ... any other overrides } }
 *
 * Resources where bulk import is a real, working admin workflow (anything
 * backed by an actual writable table) should keep using importExportFeature
 * directly instead — this is only for resources that can't accept writes.
 */
export const exportOnlyFeature = importExportFeature;

export const exportOnlyActions = {
  import: { isVisible: false, isAccessible: false },
} as const;
