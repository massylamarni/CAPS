import RNBluetoothClassic, { BluetoothDevice, BluetoothDeviceEvent } from "react-native-bluetooth-classic";
import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

import Icon from 'react-native-vector-icons/Feather';
import { getLastRow } from '@/utils/sqlite_db';
import { BlueState } from ".";


const TAG = "C/blueComponent";

type StateChangeEvent = /*unresolved*/ any;

export default function BlueComponent({ blueState }: { blueState: BlueState }) {
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
    setReceiveCount
  } = blueState;

  /* Init Bluetooth */
  useEffect(() => {
    initBluetooth();
    
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
    const onReceivedDataSub = connectedDevice?.onDataReceived((receivedData) => {
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
        sendDbAnchor();
      }
    }, [connectedDevice]);

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
    if (lastRow.length !== 0) {
      const most_recent_row = lastRow.reduce((latest, current) =>
        current.DateTime > latest.DateTime ? current : latest
      );

      const message = JSON.stringify(most_recent_row.id);
      write(message);
    } else {
      const message = JSON.stringify(0);
      write(message);
    }
  };

  return (
    <>
      <View style={[styles.COMPONENT_CARD, styles.ble_info]}>
        <Tex style={styles.COMPONENT_TITLE} >
          Bluetooth Info
        </Tex>
        <View style={styles.COMPONENT_WRAPPER}>
          <View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Status</Tex>
              <Tex>{isBluetoothEnabled ? 'Enabled' : 'Disabled'}</Tex>
            </View>
            {(isBluetoothEnabled) && <>
              <View style={[styles.SUBCOMPONENT_CARD, styles.MD_ROW_GAP]}>
                <Tex
                onPress={isDisconnecting ? cancelDiscovery : startDiscovery}
                style={styles.SUBCOMPONENT_TITLE}>
                  Devices found {isDisconnecting && '(Discovering...)'}
                </Tex>
                <View>
                  {unpairedDevices?.length != 0 ? (unpairedDevices?.map((device, index) => (
                    <View key={index} style={styles.SUBCOMPONENT_LIST_ITEM}>
                      <Tex>{device.name}</Tex>
                      {connectedDevice ? (<>
                        <Tex>{connectedDevice.name == device.name ? 'Disconnect' : 'Connect'}</Tex>
                      </>) : (<>
                        <Tex onPress={() => connect(device)}>{isConnecting ? 'Connecting...' : 'Connect'}</Tex>
                      </>)}
                    </View>
                  ))) : (
                    <View style={styles.SUBCOMPONENT_LIST_ITEM}>
                      <Tex>No devices found</Tex>
                    </View>
                  )}
                </View>
              </View>
            </>}
            {connectedDevice && <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Connected to</Tex>
              <Tex>{connectedDevice?.name}</Tex>
            </View>}
          </View>
          <View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Num of packets received</Tex>
              <View style={styles.LEGEND_CONTAINER}>
                <Icon style={styles.MD_COL_GAP} name="trending-down" size={themeI.legendSize.default} color={themeI.legendColors.default} />
                <Tex>{receiveCount}</Tex>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}