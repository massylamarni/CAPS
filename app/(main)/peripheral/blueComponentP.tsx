import RNBluetoothClassic, { BluetoothDevice, BluetoothDeviceEvent } from "react-native-bluetooth-classic";
import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

import Icon from 'react-native-vector-icons/Feather';
import { getAllSensorData, getLastRow } from '@/utils/sqlite_db_p';
import SimpleCard from "../mini-components/simpleCard";
import TextListItem from "../mini-components/textListItem";


const TAG = "C/blueComponent";

type StateChangeEvent = /*unresolved*/ any;

export default function BlueComponentP({ blueState, sensorData }: { blueState: BlueStateP, sensorData: SensorStateP["sensorData"] }) {
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
        ToastAndroid.show(`Device error`, ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(`Adapter related error`, ToastAndroid.SHORT);
      }
    }
    const onBluetoothEnabledSub = RNBluetoothClassic.onBluetoothEnabled(onBluetoothEnabled);
    const onBluetoothDisabledSub = RNBluetoothClassic.onBluetoothDisabled(onBluetoothDisabled);
    const onDeviceDisconnectedSub = RNBluetoothClassic.onDeviceDisconnected(onDeviceDisconnected);
    const onBluetoothErrorSub = RNBluetoothClassic.onError(onBluetoothError);

    // Broken connection event listener work around
    const checkConnectionsInterval = setInterval(async () => {
      if (!connectedDevice) {
        try {
          const connectedDevices_ = await RNBluetoothClassic.getConnectedDevices();
          if (connectedDevices_.length !== 0) {
            setConnectedDevice(connectedDevices_[0]);
          }
        } catch (error) {
          ToastAndroid.show(`Failed to get connected devices: ${error}`, ToastAndroid.SHORT);
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
      setReceivedData((prev) => (prev ? [...prev, receivedData] : [receivedData]));
      setReceiveCount((prev) => (prev+1));
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
  }, [connectedDevice]);

  /* On receive */
  useEffect(() => {
    if (receivedData) {
      if (receivedData.length !== 0) {
        setDbAnchor(receivedData[0]);
      }
    }
  }, [receivedData]);

  /* Stream data */
  useEffect(() => {
    if (isDbBufferedS) {
      write(JSON.stringify(sensorData));
    }
  }, [sensorData]);

  useEffect(() => {
    if (isWriting) setSendCount(prev => (prev+1));
  }, [isWriting]);

  const initBluetooth = async () => {
    // Request Permissions
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      const arePermissionsGranted_ = Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
      setArePermissionsGranted(arePermissionsGranted_);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    };

    // Get Initial Bluetooth status
    try {
      const isBluetoothEnabled_ = await RNBluetoothClassic.isBluetoothEnabled();
      setIsBluetoothEnabled(isBluetoothEnabled_);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }
  const startDiscovery = async () => {
    try {
      setIsDiscovering(true);
      const unpairedDevices_ = await RNBluetoothClassic.startDiscovery();
      setUnpairedDevices(unpairedDevices_)
      ToastAndroid.show(`Found ${unpairedDevices_.length} devices.`, ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    } finally {
      setIsDiscovering(false);
    }
  }
  const cancelDiscovery = async () => {
    try {
      const cancelled = await RNBluetoothClassic.cancelDiscovery();
      if (cancelled) setIsDiscovering(false);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }
  const acceptConnections = async () => {
    setIsAccepting(true);
      
    try {      
      const connectedDevice_ = await RNBluetoothClassic.accept({});
      setConnectedDevice(connectedDevice_);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
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
      if (cancelled) setIsAccepting(false);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    }
  }
  const connect = async (_device: BluetoothDevice) => {
    try {
      setIsConnecting(true);
      const bondedDevices = await RNBluetoothClassic.getBondedDevices();
      let isPaired = false;
      bondedDevices?.forEach((device: BluetoothDevice) => {
        if (device.address === _device.address) isPaired = true;
      });
      if (!isPaired) {
        const pairedDevice_ = await RNBluetoothClassic.pairDevice(_device.address);
      }
      const connected = await _device?.connect();
      if (connected) setConnectedDevice(_device);
    } catch (error) {
      
    } finally {
      setIsConnecting(false);
    }
  }
  const disconnect = async () => {
    try {
      setIsDisconnecting(true);
      const disconnected = await connectedDevice?.disconnect();
      if (disconnected) setConnectedDevice(null);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    } finally {
      setIsDisconnecting(false);
    }
  }
  const unpairDevice = async (deviceAddr: string) => {
    try {
      setIsUnpairing(true);
      const unpairedDevice_ = await RNBluetoothClassic.unpairDevice(deviceAddr);
    } catch (error) {
      ToastAndroid.show(`Bluetooth: ${error}`, ToastAndroid.SHORT);
    } finally {
      setIsUnpairing(false);
    }
  }

  let writeBuffer = [];
  const write = async (message: string) => {
    writeBuffer.push(message);
    if (isWriting) return;

    try {
      setIsWriting(true);
      while (writeBuffer.length > 0) {
        const message = writeBuffer.shift();
        if (!message) continue;
        const writeStatus = await connectedDevice?.write(`${message}\n`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsWriting(false);
    }
  };

  const sendDbAnchor = async () => {
    const lastRow = await getLastRow();
    if (lastRow) {
      const message = JSON.stringify(lastRow.id);
      write(message);
    } else {
      const message = JSON.stringify(0);
      write(message);
    }
  };

  const exportDatabaseAsJson = async (_dbAnchor: number) => {
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
        <View style={styles.COMPONENT_WRAPPER}>
          <TextListItem itemKey="Status" itemValue={isBluetoothEnabled ? 'Enabled' : 'Disabled'} />
          <TextListItem itemKey="Advertising as" itemValue="GALAXY" />
          <TextListItem itemKey="Connected to" itemValue={connectedDevice?.name} />
          {connectedDevice && <TextListItem itemKey="Connected to" itemValue={connectedDevice?.name} />}
        </View>
        <View>
          <TextListItem itemKey="Num of packets sent" itemValue={sendCount} iconName="trending-up" />
        </View>
      </SimpleCard>
    </>
  );
}