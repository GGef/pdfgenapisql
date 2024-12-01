import { createConnection, closeConnection } from '../config/database';

export async function executeQuery<T>(
  query: string,
  params: any[] = []
): Promise<T> {
  const { pool, connector } = await createConnection();
  
  try {
    const [results] = await pool.execute(query, params);
    return results as T;
  } finally {
    await closeConnection(pool, connector);
  }
}

export async function testConnection() {
  try {
    const result = await executeQuery<{ connected: string }[]>(
      "SELECT 'True' as connected"
    );
    return result[0].connected === 'True';
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}