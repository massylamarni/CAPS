// utils/database.ts
import * as SQLite from 'expo-sqlite';

const DEBUG = false;

// Open database synchronously (new API)
const db = SQLite.openDatabaseSync('predict.db');

export const initDatabase = async () => {
  try {
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mac TEXT UNIQUE NOT NULL,
        name TEXT,
        createdAt INTEGER
    )`);
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS prediction_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      xa REAL,
      ya REAL,
      za REAL,
      xg REAL,
      yg REAL,
      zg REAL,
      createdAt INTEGER,
      predictionDateTime INTEGER,
      predictedClass INTEGER,
      confidence REAL,
      device_id INTEGER NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )`);
  } catch(e) {
    console.error('DB init error:', e);
    return false;
  } finally {
    return true;
  }
};

const manageDeviceId = async (mac: string) => {
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM devices WHERE mac = ?',
    [mac]
  );

  if (existing) return existing.id;

  await db.runAsync(
    'INSERT INTO devices (mac, createdAt) VALUES (?, ?)',
    [mac, Date.now()]
  );

  const inserted = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM devices WHERE mac = ?',
    [mac]
  );

  return inserted?.id ?? -1;
};
export const addPredictionData = async (data: DbPredictionInputC) => {
  try {
    const deviceId = await manageDeviceId(data.mac);
    if (deviceId === -1) throw new Error('Device ID not found');
    await db.runAsync(
      'INSERT INTO prediction_data (predictionDateTime, xa, ya, za, xg, yg, zg, createdAt, predictedClass, confidence, device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [Date.now(), data.xa, data.ya, data.za, data.xg, data.yg, data.zg, data.createdAt, data.predictedClass, data.confidence, deviceId]
    );
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const getLastRow = async () => {
  try {
    const result = await db.getAllAsync<DbPredictionOutputC>(
      `
      SELECT sd.*
      FROM prediction_data sd
      JOIN (
        SELECT device_id, MAX(createdAt) AS max_time
        FROM prediction_data
        GROUP BY device_id
      ) grouped
      ON sd.device_id = grouped.device_id AND sd.createdAt = grouped.max_time
      `
    );

    return result;
  } catch (error) {
    console.error('Error fetching last row per device:', error);
    return [];
  }
};

export const getRowCount = async () => {
  try {
    const result = await db.getAllAsync<{ device_id: number; count: number }>(
      `
      SELECT device_id, COUNT(*) as count
      FROM prediction_data
      GROUP BY device_id
      `
    );
    return result;
  } catch (error) {
    console.error('Error counting rows by device:', error);
    return [];
  }
};

export const getDownsampledData = async (startTime: number, endTime: number, intervalMs: number) => {
  try {
    const result = await db.getAllAsync<DbPredictionOutputC>(
      `
      SELECT pd.*
      FROM prediction_data pd
      INNER JOIN (
        SELECT
          MIN(predictionDateTime) as minTime,
          ((predictionDateTime - ?) / ?) as bucket
        FROM prediction_data
        WHERE predictionDateTime BETWEEN ? AND ?
        GROUP BY bucket
      ) grouped
      ON pd.predictionDateTime = grouped.minTime
      ORDER BY pd.predictionDateTime ASC
      `,
      [startTime, intervalMs, startTime, endTime]
    );

    return result;
  } catch (error) {
    console.error('Error retrieving downsampled data:', error);
    return [];
  }
};

export const getPredictionStats = async () => {
  try {
    const result = await db.getAllAsync<{ predictedClass: number; count: number }>(
      `
      SELECT predictedClass, COUNT(*) as count
      FROM prediction_data
      GROUP BY predictedClass
      ORDER BY predictedClass ASC
      `,
    );

    return result;
  } catch (error) {
    console.error('Error getting prediction counts:', error);
    return [];
  }
};

export const resetDatabase = async () => {
    try {
        await db.execAsync('DROP TABLE IF EXISTS prediction_data');
        await db.execAsync('DROP TABLE IF EXISTS devices');
        initDatabase();
        return true;
    } catch (error) {
        console.error('Error resetting database:', error);
        return false;
    }
};





