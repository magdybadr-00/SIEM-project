/**
 * OBSIDIAN SIEM — Query Expression Engine
 * Parser and evaluator for field-based SIEM query expressions (e.g. event.category:authentication AND event.outcome:failure).
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Utils = window.Obsidian.Utils || {};

(function() {
    class QueryParser {
        constructor() {
            this.validFields = [
                "@timestamp", "event.id", "event.category", "event.action", "event.outcome",
                "event.severity", "source.ip", "destination.ip", "destination.port",
                "user.name", "host.name", "process.name", "network.protocol", "rule.id"
            ];
        }

        validate(queryStr) {
            if (!queryStr || !queryStr.trim()) {
                return { isValid: true, error: null };
            }

            const tokens = queryStr.trim().split(/\s+(?:AND|OR)\s+/i);
            for (const token of tokens) {
                const trimmed = token.trim();
                // Check if it's comparison operator (>=, <=, >, <, :)
                const match = trimmed.match(/^([a-zA-Z0-9_.]+)\s*(:|>=|<=|>|<|=)\s*(.*)$/);
                if (!match) {
                    // Check if it's a simple free-text word
                    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed) && !/^["'].*["']$/.test(trimmed)) {
                        return {
                            isValid: false,
                            error: `Syntax error near '${trimmed}'. Expected 'field:value', 'field>=number', or keyword.`
                        };
                    }
                }
            }

            return { isValid: true, error: null };
        }

        evaluate(record, queryStr) {
            if (!queryStr || !queryStr.trim()) return true;

            const isOr = /\s+OR\s+/i.test(queryStr);
            const clauses = queryStr.trim().split(isOr ? /\s+OR\s+/i : /\s+AND\s+/i);

            const results = clauses.map(clause => {
                const trimmed = clause.trim();
                const match = trimmed.match(/^([a-zA-Z0-9_.]+)\s*(:|>=|<=|>|<|=)\s*(.*)$/);
                
                if (match) {
                    const [, field, op, rawVal] = match;
                    const cleanVal = rawVal.replace(/^["']|["']$/g, '').toLowerCase();
                    const recordVal = record[field];

                    if (op === ':') {
                        if (recordVal === undefined || recordVal === null) return false;
                        return String(recordVal).toLowerCase().includes(cleanVal);
                    }

                    const numRec = Number(recordVal);
                    const numVal = Number(cleanVal);
                    if (isNaN(numRec) || isNaN(numVal)) return false;

                    switch (op) {
                        case '>=': return numRec >= numVal;
                        case '<=': return numRec <= numVal;
                        case '>': return numRec > numVal;
                        case '<': return numRec < numVal;
                        case '=': return numRec === numVal;
                        default: return false;
                    }
                } else {
                    // Free-text search across all record values
                    const keyword = trimmed.replace(/^["']|["']$/g, '').toLowerCase();
                    return JSON.stringify(record).toLowerCase().includes(keyword);
                }
            });

            return isOr ? results.some(Boolean) : results.every(Boolean);
        }
    }

    window.Obsidian.Utils.queryParser = new QueryParser();
})();

