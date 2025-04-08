import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.AZURE_DB_HOST,
  user: process.env.AZURE_DB_USER,
  password: process.env.AZURE_DB_PASSWORD,
  database: process.env.AZURE_DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Wrapper function to handle connections properly
export async function query(sql, params) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(sql, params);
    return [results];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export default {
  query,
  pool
};
