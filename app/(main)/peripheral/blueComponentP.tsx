import RNBluetoothClassic, { BluetoothDevice, BluetoothDeviceEvent } from "react-native-bluetooth-classic";
import React, { useEffect, useRef } from 'react';
import { PermissionsAndroid, View, Platform  } from 'react-native';
import { getAllSensorData, getLastRow } from '@/utils/sqlite_db_p';
import SimpleCard from "../mini-components/simpleCard";
import TextListItem from "../mini-components/textListItem";
import { useLogs } from '@/utils/logContext';
import { useStateLogger as useState } from '@/app/(main)/useStateLogger';
import { RECEIVE_BUFFER_SIZE } from "@/utils/constants";
import { lang } from "@/assets/languages/lang-provider";

const TAG = "P/blueComponent";

type StateChangeEvent = /*unresolved*/ any;

export default function BlueComponentP({ blueState, sensorData }: { blueState: BlueStateP, sensorData: SensorStateP["sensorData"] }) {
  const [writeBuffer, setWriteBuffer] = useState([] as string[], "setWriteBuffer");
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
      if (isAccepting) cancelAcceptConnections();
      if (isDisconnecting) cancelDiscovery();
      if (connectedDevice) disconnect();
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

    return () => {
      onBluetoothDisabledSub?.remove();
      onBluetoothEnabledSub?.remove();
      onDeviceDisconnectedSub?.remove();
      onBluetoothErrorSub?.remove();
    }
  }, []);

  /* Init Reception Listener */
  useEffect(() => {
    const onReceivedDataSub = connectedDevice?.onDataReceived((receivedData: any) => {
      if ((receivedData.data && receivedData.data !== "")) {
        addLog(TAG, `Received message with length: ${receivedData.data.length} !`);
        setReceivedData((prev) => (prev ? [...prev.slice(-(RECEIVE_BUFFER_SIZE-1)), receivedData.data] : [receivedData.data]));
        setReceiveCount((prev) => (prev+1));
        addLog(TAG, `Received dbAnchor: ${receivedData.data !}`);
        setDbAnchor(receivedData.data);
      }
    });
    
    return () => {
      onReceivedDataSub?.remove();
    }
  }, [connectedDevice]);

  /* On Connection */
  useEffect(() => {
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  /* On dbAnchor reception */
  useEffect(() => {
    if (connectedDevice && dbAnchor && !isDbBufferedS) {
      exportDatabaseAsJson(JSON.parse(dbAnchor ?? "0"));
    }
  }, [dbAnchor]);

  /* Stream data */
  useEffect(() => {
    if (connectedDevice) {
      if (isDbBufferedS) {
        addLog(TAG, `Streaming data...`);
        write(JSON.stringify(sensorData));
      }
    }
    else if (isDbBufferedS) {
      setIsDbBufferedS(false);
    }
  }, [sensorData]);

  /* On Buffer update */
  useEffect(() => {
    sendfromBuffer();
  }, [writeBuffer]);

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
          
          const arePermissionsGranted_ = granted === PermissionsAndroid.RESULTS.GRANTED;
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
      setIsDiscovering(false);
    } catch (error) {
      addLog(TAG, `${error}`);
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
      setIsAccepting(false);
    } catch (error) {
      addLog(TAG, `${error}`);
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
      setIsConnecting(false);
    } catch (error) {
      addLog(TAG, `${error}`);
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
      setIsDisconnecting(false);
    } catch (error) {
      addLog(TAG, `${error}`);
    }
  }
  const unpairDevice = async (deviceAddr: string) => {
    try {
      setIsUnpairing(true);
      const unpairedDevice_ = await RNBluetoothClassic.unpairDevice(deviceAddr);
      addLog(TAG, `Unpair success !`);
      setIsUnpairing(false);
    } catch (error) {
      addLog(TAG, `${error}`);
    }
  }

  const write = async (message: string) => {
    setWriteBuffer((prev: any) => prev.length !==0 ? [...prev, message] : [message]);
  };
  const sendfromBuffer = async () => {
    if (isWriting || writeBuffer.length === 0) return;

    try {
      setIsWriting(true);
      const cloneWriteBuffer = [...writeBuffer];
      const message = cloneWriteBuffer.shift();
      setWriteBuffer(cloneWriteBuffer);
      if (!message) return;
      addLog(TAG, `Writing message with length: ${message.length} !`);
      const writeStatus = await connectedDevice?.write(`${message}\n`);
      setSendCount(prev => (prev+1));
      if (writeStatus) addLog(TAG, `Write success !`);
      setIsWriting(false);
    } catch (error) {
      addLog(TAG, `${error}`);
    }
  }

  const exportDatabaseAsJson = async (_dbAnchor: number) => {
    addLog(TAG, `Exporting database...`);
    const sensorData = await getAllSensorData(_dbAnchor);

    const smallMessage = JSON.stringify({
      header: {
        dbLength: sensorData.length,
      }
    });
    const largeMessage = JSON.stringify({
      sensorData
    });

    await write(smallMessage);
    await write(largeMessage);
    setIsDbBufferedS(true);
  };

  return (
    <>
      <SimpleCard title={lang["bluetooth_info"]}>
        <View>
          <TextListItem itemKey={lang["status"]} itemValue={isBluetoothEnabled ? lang["enabled"] : lang["disabled"]} />
          {connectedDevice && <TextListItem itemKey={lang["connected_to"]} itemValue={connectedDevice?.name} />}
        </View>
        <View>
          <TextListItem itemKey={lang["number_of_packets_sent"]} itemValue={sendCount} iconName="trending-up" />
        </View>
      </SimpleCard>
    </>
  );
}