// ==========================================================
// ORACLE DATABASE CONFIGURATION
// ==========================================================
// Update these values with your Oracle DB connection details.

module.exports = {
  user: process.env.ORACLE_USER || "supertounsi",
  password: process.env.ORACLE_PASSWORD || "your_password_here",
  connectString: process.env.ORACLE_CONNECT_STRING || "localhost:1521/FREEPDB1", // XEPDB1 or FREEPDB1 for Oracle XE

  // For Oracle Autonomous Database (ATP/ADW):
  // connectString: '(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=your_db_high.adb.oraclecloud.com))(connect_data=(service_name=your_db_high.adb.oraclecloud.com))(security=(ssl_server_cert_dn="CN=...")))',
  // walletLocation: './Wallet_DBNAME',
};
