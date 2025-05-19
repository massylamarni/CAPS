// utils/database.ts
import * as SQLite from 'expo-sqlite';

const DEBUG = false;

export type DbEntry = {
  id: number;
  DateTime: number;
  xa: number;
  ya: number;
  za: number;
  xg: number;
  yg: number;
  zg: number;
  device_id: number;
}

// Open database synchronously (new API)
const db = SQLite.openDatabaseSync('sensor.db');

export const initDatabase = async () => {
  try {
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mac TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at INTEGER
    )`);
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS prediction_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      DateTime INTEGER,
      predictionDateTime INTEGER,
      predictedClass INTEGER,
      confidence REAL,
      xa REAL,
      ya REAL,
      za REAL,
      xg REAL,
      yg REAL,
      zg REAL,
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
    'INSERT INTO devices (mac, created_at) VALUES (?, ?)',
    [mac, Date.now()]
  );

  const inserted = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM devices WHERE mac = ?',
    [mac]
  );

  return inserted?.id ?? -1;
};

export const getLastRow = async () => {
  try {
    const result = await db.getAllAsync<DbEntry>(
      `
      SELECT sd.*
      FROM prediction_data sd
      JOIN (
        SELECT device_id, MAX(DateTime) AS max_time
        FROM prediction_data
        GROUP BY device_id
      ) grouped
      ON sd.device_id = grouped.device_id AND sd.DateTime = grouped.max_time
      `
    );

    return result;
  } catch (error) {
    console.error('Error fetching last row per device:', error);
    return [];
  }
};

export const getDownsampledData = async (startTime: number, endTime: number, intervalMs: number) => {
  try {
    const result = await db.getAllAsync<DbEntry[]>(
      `
      SELECT 
        device_id,
        MIN(DateTime) AS DateTime,
        AVG(xa) AS xa,
        AVG(ya) AS ya,
        AVG(za) AS za,
        AVG(xg) AS xg,
        AVG(yg) AS yg,
        AVG(zg) AS zg
      FROM prediction_data
      WHERE DateTime BETWEEN ? AND ?
      GROUP BY device_id, ((DateTime / ?) * ?)
      ORDER BY device_id ASC, DateTime ASC
      `,
      [startTime, endTime, intervalMs, intervalMs]
    );

    return result;
  } catch (error) {
    console.error('Error fetching downsampled data:', error);
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
    return result; // array of { device_id, count }
  } catch (error) {
    console.error('Error counting rows by device:', error);
    return [];
  }
};

export const resetDatabase = async () => {
    try {
        await db.execAsync('DROP TABLE IF EXISTS prediction_data');
        await db.execAsync('DROP TABLE IF EXISTS devices');
        initDatabase();
        if (DEBUG) console.log('Database fully reset');
        return true;
    } catch (error) {
        console.error('Error resetting database:', error);
        return false;
    }
};

export const addPredictionData = async (data: {
  xa: number,
  ya: number,
  za: number,
  xg: number,
  yg: number,
  zg: number,
  DateTime: number,
  predictedClass: number,
  confidence: number,
  mac: string,
}) => {
  try {
    const deviceId = await manageDeviceId(data.mac);
    if (deviceId === -1) throw new Error('Device ID not found');
    await db.runAsync(
      'INSERT INTO prediction_data (predictionDateTime, xa, ya, za, xg, yg, zg, DateTime, predictedClass, confidence, device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [Date.now(), data.xa, data.ya, data.za, data.xg, data.yg, data.zg, data.DateTime, data.predictedClass, data.confidence, deviceId]
    );
    if (DEBUG) console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const importDevices = async (devices: {
  id: number;
  mac: string;
  name?: string;
  created_at: number;
}[]) => {
  try {
    for (const device of devices) {
      await db.runAsync(
        `INSERT OR IGNORE INTO devices (id, mac, name, created_at) VALUES (?, ?, ?, ?)`,
        [device.id, device.mac, device.name ?? null, device.created_at]
      );
    }
    if (DEBUG) console.log('Devices imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing devices:', error);
    return false;
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