/**
 * Count registration rows volunteers have highlighted by fill colour.
 *
 * Usage in a sheet cell (pass A1 refs as quoted strings):
 *   =COUNT_ROWS_BY_COLOR("A15", "A2:A2000")
 *   =COUNT_ROWS_BY_COLOR("Registrations!A15", "Registrations!A2:A2000")
 *
 * @param {string} sampleCellA1 Any cell painted the target colour.
 * @param {string} rowRangeA1   Single-column range, one cell per data row (e.g. participant id column).
 * @param {*=} _refresh         Optional; change this cell to force recalculation after recolouring.
 * @return {number}
 * @customfunction
 */
function COUNT_ROWS_BY_COLOR(sampleCellA1, rowRangeA1, _refresh) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sampleRange = resolveRange_(ss, sampleCellA1);
  const targetColor = normalizeColor_(sampleRange.getBackground());
  const scanRange = resolveRange_(ss, rowRangeA1);
  const backgrounds = scanRange.getBackgrounds();
  const values = scanRange.getValues();
  let count = 0;

  for (let i = 0; i < backgrounds.length; i++) {
    const value = values[i][0];
    if (value === "" || value === null) {
      continue;
    }
    if (normalizeColor_(backgrounds[i][0]) === targetColor) {
      count++;
    }
  }

  return count;
}

/**
 * @param {string} rangeA1
 * @param {string} sampleCellA1
 * @param {*=} _refresh
 * @return {number}
 * @customfunction
 */
function COUNT_CELLS_BY_COLOR(rangeA1, sampleCellA1, _refresh) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetColor = normalizeColor_(resolveRange_(ss, sampleCellA1).getBackground());
  const backgrounds = resolveRange_(ss, rangeA1).getBackgrounds();
  let count = 0;

  for (let i = 0; i < backgrounds.length; i++) {
    for (let j = 0; j < backgrounds[i].length; j++) {
      if (normalizeColor_(backgrounds[i][j]) === targetColor) {
        count++;
      }
    }
  }

  return count;
}

/**
 * @param {Spreadsheet} ss
 * @param {string} a1
 * @return {GoogleAppsScript.Spreadsheet.Range}
 */
function resolveRange_(ss, a1) {
  if (!a1 || typeof a1 !== "string") {
    throw new Error("Pass A1 references as quoted strings, e.g. \"A15\" or \"Registrations!A2:A2000\".");
  }
  const trimmed = a1.trim();
  if (trimmed.indexOf("!") !== -1) {
    const parts = trimmed.split("!");
    const sheetName = parts[0].replace(/^'|'$/g, "");
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error("Sheet not found: " + sheetName);
    }
    return sheet.getRange(parts[1]);
  }
  return ss.getActiveSheet().getRange(trimmed);
}

/**
 * @param {string} color
 * @return {string}
 */
function normalizeColor_(color) {
  return String(color || "#ffffff").toLowerCase();
}
