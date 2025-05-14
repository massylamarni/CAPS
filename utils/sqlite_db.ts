// utils/database.ts
import * as SQLite from 'expo-sqlite';

const DEBUG = false;

type DbEntry = {
  id: number;
  DateTime: number;
  XA: number;
  YA: number;
  ZA: number;
  XG: number;
  YG: number;
  ZG: number;
  device_id: number;
}

// Open database synchronously (new API)
const db = SQLite.openDatabaseSync('sensor.db');

export const initDatabase = async () => {
  try {
    db.execAsync(
    `CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      DateTime INTEGER,
      XA REAL,
      YA REAL,
      ZA REAL,
      XG REAL,
      YG REAL,
      ZG REAL,
      device_id INTEGER NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )`);
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mac TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at INTEGER
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

export const addSensorData = async (data: {
  xa: number,
  ya: number,
  za: number,
  xg: number,
  yg: number,
  zg: number,
  mac: string,
}) => {
  try {
    const deviceId = await manageDeviceId(data.mac);
    if (deviceId === -1) throw new Error('Device ID not found');
    await db.runAsync(
      'INSERT INTO sensor_data (DateTime, XA, YA, ZA, XG, YG, ZG, device_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Date.now(), data.xa, data.ya, data.za, data.xg, data.yg, data.zg, deviceId]
    );
    if (DEBUG) console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const getLastRow = async () => {
  try {
    const result = await db.getAllAsync<DbEntry>(
      `
      SELECT sd.*
      FROM sensor_data sd
      JOIN (
        SELECT device_id, MAX(DateTime) AS max_time
        FROM sensor_data
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
        AVG(XA) AS XA,
        AVG(YA) AS YA,
        AVG(ZA) AS ZA,
        AVG(XG) AS XG,
        AVG(YG) AS YG,
        AVG(ZG) AS ZG
      FROM sensor_data
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
      FROM sensor_data
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
        await db.execAsync('DROP TABLE IF EXISTS sensor_data');
        initDatabase();
        if (DEBUG) console.log('Database fully reset');
        return true;
    } catch (error) {
        console.error('Error resetting database:', error);
        return false;
    }
};