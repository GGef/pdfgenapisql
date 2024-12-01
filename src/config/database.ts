import { AuthTypes, Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import mysql from 'mysql2/promise';
import { z } from 'zod';

const dbConfigSchema = z.object({
  instance: z.string(),
  name: z.string(),
  user: z.string(),
  password: z.string(),
  usePublicIp: z.boolean(),
  useIamAuth: z.boolean(),
});

const dbConfig = {
  instance: 'beaming-crowbar-354718:europe-southwest1:pdfgen',
  name: 'pdfgen',
  user: 'root',
  password: 'root',
  usePublicIp: true,
  useIamAuth: false,
};

export const validateConfig = () => dbConfigSchema.parse(dbConfig);

export async function createConnection() {
  const connector = new Connector();
  
  const clientOpts = await connector.getOptions({
    instanceConnectionName: dbConfig.instance,
    ipType: dbConfig.usePublicIp ? IpAddressTypes.PUBLIC : IpAddressTypes.PRIVATE,
    authType: dbConfig.useIamAuth ? AuthTypes.IAM : AuthTypes.PASSWORD,
  });

  const pool = mysql.createPool({
    ...clientOpts,
    user: dbConfig.user,
    password: dbConfig.useIamAuth ? undefined : dbConfig.password,
    database: dbConfig.name,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  return { pool, connector };
}

export async function closeConnection(pool: mysql.Pool, connector: Connector) {
  await pool.end();
  connector.close();
}