/**
 * Agent Zero v4.0 UNLEASHED - Tool Registry
 * Export all available tools for the ToolExecutor.
 * MULTIFUNÇÃO TOTAL - Sem limitações, confiança plena.
 */

module.exports = {
  web_fetch: require('./web-fetch'),
  file_read: require('./file-read'),
  file_write: require('./file-write'),
  html_to_pdf: require('./html-to-pdf'),
  db_query: require('./db-query'),
  shell_exec: require('./shell-exec'),
  skill_call: require('./skill-call'),
  git_operations: require('./git-operations'),
  bash_unrestricted: require('./bash-unrestricted')
};
