import RNBluetoothClassic, { BluetoothDevice, BluetoothDeviceEvent } from "react-native-bluetooth-classic";
import React, { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, View, Platform  } from 'react-native';
import { getAllSensorData, getLastRow } from '@/utils/sqlite_db_p';
import SimpleCard from "../mini-components/simpleCard";
import TextListItem from "../mini-components/textListItem";
import { useLogs } from '@/app/(main)/logContext';

const TAG = "P/blueComponent";

type StateChangeEvent = /*unresolved*/ any;

export default function BlueComponentP({ blueState, sensorData }: { blueState: BlueStateP, sensorData: SensorStateP["sensorData"] }) {
  const [writeBuffer, setWriteBuffer] = useState([] as string[]);
  const { addLog } = useLogs();

  const {
    arePermissionsGranted,
    setArePermissionsGranted,
    isBluetoothEnabled,
    setIsBluetoothEnabled,
    isDiscovering,
    setIsDiscovering,
    isConnecting,
    setIsConnecting,
    isDisconnecting,
    setIsDisconnecting,
    isUnpairing,
    setIsUnpairing,
    isAccepting,
    setIsAccepting,
    isWriting,
    setIsWriting,
    unpairedDevices,
    setUnpairedDevices,
    bondedDevices,
    setBondedDevices,
    connectedDevice,
    setConnectedDevice,
    receivedData,
    setReceivedData,
    sendCount,
    setSendCount,
    receiveCount,
    setReceiveCount,
    dbAnchor,
    setDbAnchor,
    isDbBufferedS,
    setIsDbBufferedS,
  } = blueState;
  const connectedDeviceRef = useRef(connectedDevice);

  /* Init Bluetooth */
  useEffect(() => {
    initBluetooth();
    acceptConnections();
    
    return () => {
      cancelAcceptConnections();
      cancelDiscovery();
      disconnect();
    }
  }, []);

  /* Init Listeners */
  useEffect(() => {
    const onBluetoothEnabled = (event: StateChangeEvent) => {
      setIsBluetoothEnabled(true);
    }
    const onBluetoothDisabled = (event: StateChangeEvent) => {
      setIsBluetoothEnabled(false);
    }
    const onDeviceDisconnected = (event: BluetoothDeviceEvent) => {
      setConnectedDevice(null);
    }
    const onBluetoothError = (event: BluetoothDeviceEvent) => {
      if (event.device) {
        addLog(TAG, `Device error !`);
      } else {
        addLog(TAG, `Adapter error !`);
      }
    }
    const onBluetoothEnabledSub = RNBluetoothClassic.onBluetoothEnabled(onBluetoothEnabled);
    const onBluetoothDisabledSub = RNBluetoothClassic.onBluetoothDisabled(onBluetoothDisabled);
    const onDeviceDisconnectedSub = RNBluetoothClassic.onDeviceDisconnected(onDeviceDisconnected);
    const onBluetoothErrorSub = RNBluetoothClassic.onError(onBluetoothError);

    // Broken connection event listener work around
    const checkConnectionsInterval = setInterval(async () => {
      if (!connectedDeviceRef.current) {
        try {
          const connectedDevices_ = await RNBluetoothClassic.getConnectedDevices();
          if (connectedDevices_.length !== 0) {
            setConnectedDevice(connectedDevices_[0]);
          }
        } catch (error) {
          addLog(TAG, `${error}`);
        }
      }
    }, 3000);

    return () => {
      onBluetoothDisabledSub?.remove();
      onBluetoothEnabledSub?.remove();
      onDeviceDisconnectedSub?.remove();
      onBluetoothErrorSub?.remove();
      clearInterval(checkConnectionsInterval);
    }
  }, []);

  /* Init Reception Listener */
  useEffect(() => {
    const onReceivedDataSub = connectedDevice?.onDataReceived((receivedData: any) => {
      setReceivedData((prev) => (prev ? [...prev, receivedData.data] : [receivedData.data]));
    });
    
    return () => {
      onReceivedDataSub?.remove();
    }
  }, [connectedDevice]);

  /* On Connection */
  useEffect(() => {
    if (connectedDevice) {
      if (dbAnchor) {
        exportDatabaseAsJson(JSON.parse(dbAnchor));
      }
    }
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  /* On receive */
  useEffect(() => {
    if ((receivedData && receivedData[receivedData.length-1] && receivedData[receivedData.length-1] !== "") || typeof receivedData === 'number') {
      setReceiveCount((prev) => (prev+1));
      if (receivedData.length !== 0) {
        addLog(TAG, `Received dbAnchor: ${receivedData[0] !}`);
        setDbAnchor(receivedData[0]);
      }
    }
  }, [receivedData]);

  /* Stream data */
  useEffect(() => {
    if (isDbBufferedS) {
      addLog(TAG, `Streaming data...`);
      write(JSON.stringify(sensorData));
    }
  }, [sensorData]);

  /* On Buffer update */
  useEffect(() => {
    sendfromBuffer();
  }, [writeBuffer]);

  useEffect(() => {
    if (isWriting) setSendCount(prev => (prev+1));
  }, [isWriting]);

  const initBluetooth = async () => {
    // Request Permissions
    try {
      if (Platform.OS === 'android') {
        const version = Platform.Version;
        addLog(TAG, `Using android API version ${version}`);

        if (version >= 31) {
          // Android 12+ (API 31+): request all needed permissions
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]);
          
          const arePermissionsGranted_ = Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
          setArePermissionsGranted(arePermissionsGranted_);
          addLog(TAG, `${arePermissionsGranted_ ? 'Permissions grated !' : 'Not all permissions granted !'}`);
        } else {
          // Android 9 (API 28) and below: request only location permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          
          const arePermissionsGranted_ = Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
          setArePermissionsGranted(arePermissionsGranted_);
          addLog(TAG, `${arePermissionsGranted_ ? 'Permissions grated !' : 'Not all permissions granted !'}`);
        }
      }
    } catch (error) {
      addLog(TAG, `${error}`);
    };

    // Get Initial Bluetooth status
    try {
      const isBluetoothEnabled_ = await RNBluetoothClassic.isBluetoothEnabled();
      setIsBluetoothEnabled(isBluetoothEnabled_);
    } catch (error) {
      addLog(TAG, `${error}`);
    }
  }
  const startDiscovery = async () => {
    try {
      setIsDiscovering(true);
      const unpairedDevices_ = await RNBluetoothClassic.startDiscovery();
      setUnpairedDevices(unpairedDevices_);
      addLog(TAG, `Found ${unpairedDevices_.length} devices.`);
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsDiscovering(false);
    }
  }
  const cancelDiscovery = async () => {
    try {
      const cancelled = await RNBluetoothClassic.cancelDiscovery();
      if (cancelled) setIsDiscovering(false);
      addLog(TAG, `Discovery cancelled !`);
    } catch (error) {
      addLog(TAG, `${error}`);
    }
  }
  const acceptConnections = async () => {
    setIsAccepting(true);
      
    try {      
      const connectedDevice_ = await RNBluetoothClassic.accept({});
      addLog(TAG, `Accepting success !`);
      setConnectedDevice(connectedDevice_);
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsAccepting(false);
    }
  }
  const cancelAcceptConnections = async () => {
    if (!isAccepting) {
      return;
    }

    try {
      const cancelled = await RNBluetoothClassic.cancelAccept();
      if (cancelled) {
        setIsAccepting(false);
        addLog(TAG, `Accept cancelled !`);
      }
    } catch (error) {
      addLog(TAG, `${error}`);
    }
  }
  const connect = async (_device: BluetoothDevice) => {
    try {
      setIsConnecting(true);
      const bondedDevices = await RNBluetoothClassic.getBondedDevices();
      let isPaired = false;
      bondedDevices?.forEach((device: BluetoothDevice) => {
        if (device.address === _device.address) isPaired = true;
        addLog(TAG, `Device found paired !`);
      });
      if (!isPaired) {
        addLog(TAG, `Pairing with device...`);
        const pairedDevice_ = await RNBluetoothClassic.pairDevice(_device.address);
      }
      addLog(TAG, `Connecting to device...`);
      const connected = await _device?.connect();
      if (connected) {
        setConnectedDevice(_device);
        addLog(TAG, `Connection success !`);
      }
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsConnecting(false);
    }
  }
  const disconnect = async () => {
    try {
      setIsDisconnecting(true);
      const disconnected = await connectedDevice?.disconnect();
      if (disconnected) {
        setConnectedDevice(null);
        addLog(TAG, `Disconnect success !`);
      }
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsDisconnecting(false);
    }
  }
  const unpairDevice = async (deviceAddr: string) => {
    try {
      setIsUnpairing(true);
      const unpairedDevice_ = await RNBluetoothClassic.unpairDevice(deviceAddr);
      addLog(TAG, `Unpair success !`);
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsUnpairing(false);
    }
  }

  const write = async (message: string) => {
    setWriteBuffer(prev => prev.length !==0 ? [...prev, message] : [message]);
  };
  const sendfromBuffer = async () => {
    if (writeBuffer.length === 0) return;
    if (isWriting) return;

    try {
      setIsWriting(true);
      const cloneWriteBuffer = [...writeBuffer];
      const message = cloneWriteBuffer.shift();
      setWriteBuffer(cloneWriteBuffer);
      if (!message) return;
      addLog(TAG, `Writing message with length: ${message.length} !`);
      const writeStatus = await connectedDevice?.write(`${message}\n`);
      if (writeStatus) addLog(TAG, `Write success !`);
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsWriting(false);
    }
  }

  const exportDatabaseAsJson = async (_dbAnchor: number) => {
    addLog(TAG, `Exporting database...`);
    const sensorData = await getAllSensorData(_dbAnchor);

    const largeMessage = JSON.stringify({
      sensorData
    });

    await write(largeMessage);
    setIsDbBufferedS(true);
  };

  return (
    <>
      <SimpleCard title="Bluetooth Info">
        <View>
          <TextListItem itemKey="Status" itemValue={isBluetoothEnabled ? 'Enabled' : 'Disabled'} />
          <TextListItem itemKey="Advertising as" itemValue="GALAXY" />
          {connectedDevice && <TextListItem itemKey="Connected to" itemValue={connectedDevice?.name} />}
        </View>
        <View>
          <TextListItem itemKey="Num of packets sent" itemValue={sendCount} iconName="trending-up" />
        </View>
      </SimpleCard>
    </>
  );
}