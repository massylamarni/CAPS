// utils/database.ts
import * as SQLite from 'expo-sqlite';

const DEBUG = false;

// Open database synchronously (new API)
const db = SQLite.openDatabaseSync('sensor.db');

export const initDatabase = () => {
  db.execAsync(
    `CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      DateTime INTEGER,
      XA REAL,
      YA REAL,
      ZA REAL,
      XG REAL,
      YG REAL,
      ZG REAL
    )`
  ).catch(error => console.error('DB init error:', error));
};

export const addSensorData = async (data: {
  xa: number,
  ya: number,
  za: number,
  xg: number,
  yg: number,
  zg: number
}) => {
  try {
    await db.runAsync(
      'INSERT INTO sensor_data (DateTime, XA, YA, ZA, XG, YG, ZG) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Date.now(), data.xa, data.ya, data.za, data.xg, data.yg, data.zg]
    );
    if (DEBUG) console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const getAllData = async () => {
  try {
    const result = await db.getAllAsync<{
      id: number;
      DateTime: number;
      XA: number;
      YA: number;
      ZA: number;
      XG: number;
      YG: number;
      ZG: number;
    }>('SELECT * FROM sensor_data ORDER BY dateTime DESC');
    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
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