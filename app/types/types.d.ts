/* States */
declare type BlueStateC = {
  arePermissionsGranted: boolean;
  setArePermissionsGranted: React.Dispatch<React.SetStateAction<boolean>>;
  isBluetoothEnabled: boolean;
  setIsBluetoothEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isDiscovering: boolean;
  setIsDiscovering: React.Dispatch<React.SetStateAction<boolean>>;
  isConnecting: boolean;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  isDisconnecting: boolean;
  setIsDisconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  isUnpairing: boolean;
  setIsUnpairing: React.Dispatch<React.SetStateAction<boolean>>;
  isAccepting: boolean;
  setIsAccepting: React.Dispatch<React.SetStateAction<boolean>>;
  isWriting: boolean;
  setIsWriting: React.Dispatch<React.SetStateAction<boolean>>;
  unpairedDevices: BluetoothDevice[];
  setUnpairedDevices: React.Dispatch<React.SetStateAction<BluetoothDevice[]>>;
  bondedDevices: BluetoothDevice[];
  setBondedDevices: React.Dispatch<React.SetStateAction<BluetoothDevice[]>>;
  connectedDevice: BluetoothDevice | null;
  setConnectedDevice: React.Dispatch<React.SetStateAction<BluetoothDevice | null>>;
  receivedData: any[] | null;
  setReceivedData: React.Dispatch<React.SetStateAction<any[] | null>>;
  sendCount: number;
  setSendCount: React.Dispatch<React.SetStateAction<number>>;
  receiveCount: number;
  setReceiveCount: React.Dispatch<React.SetStateAction<number>>;
};
declare type DbStateC = {
  isDbConnected: boolean;
  setIsDbConnected: React.Dispatch<React.SetStateAction<boolean>>;
  dbStats: {
    last_read: number;
    last_row: DbEntry | null;
    row_count: number;
  };
  setDbStats: React.Dispatch<
    React.SetStateAction<{
      last_read: number;
      last_row: DbEntry | null;
      row_count: number;
    }>
  >;
};
declare type HistoryStateC = {
  lastRow: DbEntry[] | null;
  setLastRow: React.Dispatch<React.SetStateAction<DbEntry[] | null>>;
  predictionStats: { predictedClass: number; count: number }[] | null;
  setPredictionStats: React.Dispatch<
    React.SetStateAction<{ predictedClass: number; count: number }[] | null>
  >;
};
declare type ModelStateC = {
  model: tf.GraphModel | null;
  setModel: React.Dispatch<React.SetStateAction<tf.GraphModel | null>>;
  isModelLoaded: boolean;
  setIsModelLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  isDbBufferedR: boolean;
  setIsDbBufferedR: React.Dispatch<React.SetStateAction<boolean>>;
  isPredicting: boolean;
  setIsPredicting: React.Dispatch<React.SetStateAction<boolean>>;
  predictions: any[]; // You can replace `any` with a proper prediction type later
  setPredictions: React.Dispatch<React.SetStateAction<any[]>>;
  bufferEntriesCount: number;
  setBufferEntriesCount: React.Dispatch<React.SetStateAction<number>>;
};
declare type SensorStateC = {
  sensorData: SensorSample[];
  setSensorData: React.Dispatch<React.SetStateAction<SensorSample[]>>;
  xaData: number[];
  setXaData: React.Dispatch<React.SetStateAction<number[]>>;
  yaData: number[];
  setYaData: React.Dispatch<React.SetStateAction<number[]>>;
  zaData: number[];
  setZaData: React.Dispatch<React.SetStateAction<number[]>>;
  xgData: number[];
  setXgData: React.Dispatch<React.SetStateAction<number[]>>;
  ygData: number[];
  setYgData: React.Dispatch<React.SetStateAction<number[]>>;
  zgData: number[];
  setZgData: React.Dispatch<React.SetStateAction<number[]>>;
};

declare type BlueStateP = {
  arePermissionsGranted: boolean;
  setArePermissionsGranted: React.Dispatch<React.SetStateAction<boolean>>;
  isBluetoothEnabled: boolean;
  setIsBluetoothEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isDiscovering: boolean;
  setIsDiscovering: React.Dispatch<React.SetStateAction<boolean>>;
  isConnecting: boolean;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  isDisconnecting: boolean;
  setIsDisconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  isUnpairing: boolean;
  setIsUnpairing: React.Dispatch<React.SetStateAction<boolean>>;
  isAccepting: boolean;
  setIsAccepting: React.Dispatch<React.SetStateAction<boolean>>;
  isWriting: boolean;
  setIsWriting: React.Dispatch<React.SetStateAction<boolean>>;
  unpairedDevices: BluetoothDevice[];
  setUnpairedDevices: React.Dispatch<React.SetStateAction<BluetoothDevice[]>>;
  bondedDevices: BluetoothDevice[];
  setBondedDevices: React.Dispatch<React.SetStateAction<BluetoothDevice[]>>;
  connectedDevice: BluetoothDevice | null;
  setConnectedDevice: React.Dispatch<React.SetStateAction<BluetoothDevice | null>>;
  receivedData: any[] | null;
  setReceivedData: React.Dispatch<React.SetStateAction<any[] | null>>;
  sendCount: number;
  setSendCount: React.Dispatch<React.SetStateAction<number>>;
  receiveCount: number;
  setReceiveCount: React.Dispatch<React.SetStateAction<number>>;
  dbAnchor: string | null;
  setDbAnchor: React.Dispatch<React.SetStateAction<string | null>>;
  isDbBufferedS: boolean;
  setIsDbBufferedS: React.Dispatch<React.SetStateAction<boolean>>;
};
declare type SensorSampleP = {
  xa: number;
  ya: number;
  za: number;
  xg: number;
  yg: number;
  zg: number;
};
declare type SensorStateP = {
  sensorData: SensorSample[];
  setSensorData: React.Dispatch<React.SetStateAction<SensorSample[]>>;
  xaData: number[];
  setXaData: React.Dispatch<React.SetStateAction<number[]>>;
  yaData: number[];
  setYaData: React.Dispatch<React.SetStateAction<number[]>>;
  zaData: number[];
  setZaData: React.Dispatch<React.SetStateAction<number[]>>;
  xgData: number[];
  setXgData: React.Dispatch<React.SetStateAction<number[]>>;
  ygData: number[];
  setYgData: React.Dispatch<React.SetStateAction<number[]>>;
  zgData: number[];
  setZgData: React.Dispatch<React.SetStateAction<number[]>>;
};
declare type DbStateP = {
  isDbConnected: boolean;
  setIsDbConnected: React.Dispatch<React.SetStateAction<boolean>>;
  dbStats: {
    last_read: number;
    last_row: DbEntry | null;
    row_count: number;
  };
  setDbStats: React.Dispatch<
    React.SetStateAction<{
      last_read: number;
      last_row: DbEntry | null;
      row_count: number;
    }>
  >;
};
declare type HistoryStateP = {
  lastRow: DbEntry | null;
  setLastRow: React.Dispatch<React.SetStateAction<DbEntry | null>>;
  predictionStats: { predictedClass: number; count: number }[] | null;
  setPredictionStats: React.Dispatch<
    React.SetStateAction<{ predictedClass: number; count: number }[] | null>
  >;
};

/* Settings */
declare type SensorViewSettingsC = {
  show_title: boolean;
  show_coord: boolean;
}
declare type SensorViewSettingsP = {
  show_title: boolean;
  show_coord: boolean;
}

/* Common */
declare type SensorData = {
  x: number;
  y: number;
  z: number;
}
declare type DualSensorData = {
  xa: number;
  ya: number;
  za: number;
  xg: number;
  yg: number;
  zg: number;
}
declare type SensorLineChartData = {
  xData: number[],
  yData: number[],
  zData: number[],
}
declare type HistoryBardChartData = {
  labels: [string, string, string, string, string, string],
  data: [number, number, number, number, number, number],
}

/* DB */
declare type DbSensorInputP = DualSensorData;
declare type DbSensorOutputP = DualSensorData & {
  id: number,
  createdAt: number,
}

declare type DbPredictionInputC = Omit<DbSensorOutputP, "id"> & {
  predictedClass: number,
  confidence: number,
  mac: string,
};
declare type DbPredictionOutputC = DualSensorData & {
  id: number,
  createdAt: number,
  predictionDateTime: number,
  predictedClass: number,
  confidence: number,
  device_id: number;
}
declare type DbDeviceInputC = {
  mac: string;
  name?: string;
  createdAt: number;
}
declare type DbDeviceOutputC = {
  id: number;
  name?: string;
  createdAt: number;
}

declare type ReceivedSensorDataC = DualSensorData & {
  createdAt: number,
  mac: string,
}