/**
 * Agent Zero v4.0 UNLEASHED - Tool: db_query
 * Executes SQL queries against PostgreSQL with FULL access when db_read_only=false.
 */

class DbQueryTool {
  constructor(config, projectRoot) {
    this.config = config;
    this.projectRoot = projectRoot;
    this.readOnly = config.security?.db_read_only ?? true; // Default to safe
  }

  definition() {
    const mode = this.readOnly ? 'READ-ONLY (SELECT only)' : 'FULL ACCESS (SELECT, INSERT, UPDATE, DELETE, CREATE, etc.)';
    return {
      name: 'db_query',
      description: `Execute SQL queries against PostgreSQL. Mode: ${mode}. Returns rows as JSON array. Max 100 rows for SELECT.`,
      parameters: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'SQL query to execute' },
          params: {
            type: 'array',
            description: 'Optional parameterized query values (e.g., ["value1", 42])',
            items: {}
          }
        },
        required: ['sql']
      }
    };
  }

  async execute(args) {
    const { sql, params = [] } = args;

    if (!sql) return { success: false, error: 'SQL query is required' };

    // Security: ONLY enforce read-only restrictions if db_read_only=true
    if (this.readOnly) {
      const trimmed = sql.trim().toUpperCase();
      const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE', 'EXEC'];
      for (const keyword of dangerous) {
        if (trimmed.startsWith(keyword)) {
          return { success: false, error: `Blocked (read-only mode): only SELECT allowed. Found: ${keyword}` };
        }
      }

      if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH') && !trimmed.startsWith('EXPLAIN')) {
        return { success: false, error: 'Read-only mode: only SELECT, WITH (CTE), and EXPLAIN allowed' };
      }

      if (/\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE)\b/i.test(sql)) {
        return { success: false, error: 'Read-only mode: query contains mutating keywords.' };
      }
    }

    try {
      let pg;
      try {
        pg = require('pg');
      } catch (e) {
        return { success: false, error: 'pg module not installed. Run: npm install pg' };
      }

      const client = new pg.Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        database: 'diana',
        connectionTimeoutMillis: 5000,
        query_timeout: this.config.timeouts?.db_query || 10000
      });

      await client.connect();

      // UNLEASHED: NO read-only transaction when db_read_only=false
      if (this.readOnly) {
        await client.query('SET TRANSACTION READ ONLY');
      }

      const result = await client.query(sql, params);
      await client.end();

      // Limit rows for SELECT queries only
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      if (isSelect) {
        const maxRows = 100;
        const rows = result.rows.slice(0, maxRows);
        const truncated = result.rows.length > maxRows;

        return {
          success: true,
          data: rows,
          columns: result.fields?.map(f => f.name) || [],
          count: rows.length,
          total: result.rowCount,
          truncated
        };
      } else {
        // For INSERT/UPDATE/DELETE/CREATE, return affected rows
        return {
          success: true,
          affected_rows: result.rowCount,
          command: result.command,
          message: `${result.command} executed successfully. Affected rows: ${result.rowCount}`
        };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = DbQueryTool;
