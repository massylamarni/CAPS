// utils/database.ts
import * as SQLite from 'expo-sqlite';

const DEBUG = false;

// Open database synchronously (new API)
const db = SQLite.openDatabaseSync('sensor.db');

export const initDatabase = async () => {
  try {
    db.execAsync(
    `CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      xa REAL,
      ya REAL,
      za REAL,
      xg REAL,
      yg REAL,
      zg REAL,
      createdAt INTEGER
    )`);
  } catch(e) {
    console.error('DB init error:', e);
    return false;
  } finally {
    return true;
  }
};

export const addSensorData = async (data: DbSensorInputP) => {
  try {
    await db.runAsync(
      'INSERT INTO sensor_data (createdAt, xa, ya, za, xg, yg, zg) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Date.now(), data.xa, data.ya, data.za, data.xg, data.yg, data.zg]
    );
    if (DEBUG) console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const getLastRow = async () => {
  try {
    const result = await db.getFirstAsync<DbSensorOutputP>(
      `SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1`
    );
    return result;
  } catch (error) {
    console.error('Error fetching last sensor row:', error);
    return null;
  }
};

export const getRowCount = async () => {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sensor_data`
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error('Error getting row count:', error);
    return 0;
  }
};

export const getDownsampledData = async (startTime: number, endTime: number, intervalMs: number) => {
  try {
    const result = await db.getAllAsync<DbSensorOutputP[]>(
      `
      SELECT 
        MIN(createdAt) AS createdAt,
        AVG(xa) AS xa,
        AVG(ya) AS ya,
        AVG(za) AS za,
        AVG(xg) AS xg,
        AVG(yg) AS yg,
        AVG(zg) AS zg
      FROM sensor_data
      WHERE createdAt BETWEEN ? AND ?
      GROUP BY ((createdAt / ?) * ?)
      ORDER BY createdAt ASC
      `,
      [startTime, endTime, intervalMs, intervalMs]
    );
    return result;
  } catch (error) {
    console.error('Error fetching downsampled data:', error);
    return [];
  }
};

export const getAllSensorData = async (dbAnchor: number): Promise<DbSensorOutputP[]> => {
  try {
    const result = await db.getAllAsync<DbSensorOutputP>(
      `SELECT * FROM sensor_data WHERE id >= ? ORDER BY createdAt ASC`, [dbAnchor]
    );
    return result;
  } catch (error) {
    console.error('Error fetching all sensor data:', error);
    return [];
  }
};

export const resetDatabase = async () => {
    try {
        await db.execAsync('DROP TABLE IF EXISTS sensor_data');
        initDatabase();
        if (DEBUG) console.log('Database fully reset');
        return true;
    } catch (error) {
        console.error('Error resetting database:', error);
        return false;
    }
};

