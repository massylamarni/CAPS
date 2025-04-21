// utils/database.ts
import SQLite from 'react-native-sqlite-storage';

// Enable debugging if needed
SQLite.enablePromise(true);

// Open the database (async version)
const getDatabase = async () => {
  return SQLite.openDatabase({ name: 'sensor.db', location: 'default' });
};

export const initDatabase = async () => {
  console.log('Initialising DB');
  try {
    const db = await getDatabase();
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        DateTime INTEGER,
        XA REAL,
        YA REAL,
        ZA REAL,
        XG REAL,
        YG REAL,
        ZG REAL
      )
    `);
  } catch (error) {
    console.error('DB init error:', error);
  }
};

export const addSensorData = async (data) => {
  console.log('Adding row to DB');
  try {
    const db = await getDatabase();
    await db.executeSql(
      'INSERT INTO sensor_data (DateTime, XA, YA, ZA, XG, YG, ZG) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Date.now(), data.xa, data.ya, data.za, data.xg, data.yg, data.zg]
    );
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const getAllData = async () => {
  console.log('Reading from DB');
  try {
    const db = await getDatabase();
    const [results] = await db.executeSql('SELECT * FROM sensor_data ORDER BY DateTime DESC');
    const rows = results.rows;
    const data = [];

    for (let i = 0; i < rows.length; i++) {
      data.push(rows.item(i));
    }

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const resetDatabase = async () => {
  console.log('Resetting DB');
  try {
    const db = await getDatabase();
    await db.executeSql('DROP TABLE IF EXISTS sensor_data');
    await initDatabase();
    console.log('Database fully reset');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};
