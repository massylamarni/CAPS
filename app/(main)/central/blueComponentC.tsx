import RNBluetoothClassic, { BluetoothDevice, BluetoothDeviceEvent } from "react-native-bluetooth-classic";
import React, { useEffect, useRef } from 'react';
import { PermissionsAndroid, View, Platform } from 'react-native';
import { getLastRow } from '@/utils/sqlite_db_c';
import SimpleCard from "../mini-components/simpleCard";
import TextListItem from "../mini-components/textListItem";
import SimpleSubCard from "../mini-components/simpleSubcard";
import TextListItemSubCard from "../mini-components/textListItemSubCard";
import { useLogs } from '@/utils/logContext';
import { useStateLogger as useState } from '@/app/(main)/useStateLogger';
import { RECEIVE_BUFFER_SIZE } from "@/utils/constants";
import { lang } from "@/assets/languages/lang-provider";
import styles from "@/assets/styles";

const TAG = "C/blueComponent";

type StateChangeEvent = /*unresolved*/ any;

export default function BlueComponentC({ blueState }: { blueState: BlueStateC }) {
  const [writeBuffer, setWriteBuffer] = useState([] as string[], "setWriteBuffer");
  const [processingDevice, setProcessingDevice] = useState(null as string | null, "setProcessingDevice");
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
    setReceiveCount
  } = blueState;
  
  const connectedDeviceRef = useRef(connectedDevice);

  /* Init Bluetooth */
  useEffect(() => {
    initBluetooth();
    
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
      }
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
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

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
    }

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
      if (cancelled) {
        setIsDiscovering(false);
        addLog(TAG, `Discovery cancelled !`);
      }
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
      setProcessingDevice(_device.address);
      if (connectedDevice) {
        await disconnect();
      }
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
      if (writeStatus) addLog(TAG, `Write success !`);
    } catch (error) {
      addLog(TAG, `${error}`);
    } finally {
      setIsWriting(false);
    }
  }

  const sendDbAnchor = async () => {
    if (!receivedData || receivedData.length === 0) {
      addLog(TAG, `Sending dbAnchor...`);
      const message = JSON.stringify(0);
      write(message);
    }
    /*
    const lastRow = await getLastRow();
    if (lastRow.length !== 0) {  // Needs rework (Save anchor in database and exchange it with peripheral)
      const most_recent_row = lastRow.reduce((latest, current) =>
        current.createdAt > latest.createdAt ? current : latest
      );

      const message = JSON.stringify(most_recent_row.id);
      write(message);
    } else {
      const message = JSON.stringify(0);
      write(message);
    }
    */
  };

  return (
    <>
      <SimpleCard title={lang["bluetooth_info"]}>
        <View>
          <TextListItem itemKey={lang["status"]} itemValue={isBluetoothEnabled ? lang["enabled"] : lang["disabled"]} />
          {(isBluetoothEnabled) && <>
            <SimpleSubCard title={lang["devices_found"]} potentialValue={isDiscovering ? lang["discovering"] : lang["discover"]} onPressE={() => isDiscovering ? cancelDiscovery() : startDiscovery()} processing={isDiscovering}>
              {unpairedDevices?.length != 0 ? (
                <>
                  {unpairedDevices?.map((device, index) => (
                    <TextListItemSubCard key={index} style={(index === unpairedDevices.length-1) ? null : styles.MD_ROW_GAP} itemKey={device.name}
                      itemValue={connectedDevice ? (connectedDevice.name === device.name ? lang["disconnect"] : lang["connect"]) : ((isConnecting && (processingDevice ===  device.address)) ? lang["connecting"] : lang["connect"])}
                      onPressE={connectedDevice ? (connectedDevice.name === device.name ? () => disconnect() : () => connect(device)) : (isConnecting ? null : () => connect(device))}
                    />
                  ))}
                </>
              ) : (
                <TextListItemSubCard itemKey={lang["no_devices_found"]} itemValue={''} />
              )}
            </SimpleSubCard>
          </>}
          {connectedDevice && <TextListItem itemKey={lang["connected_to"]} itemValue={connectedDevice?.name} />}
        </View>
        <View>
          <TextListItem itemKey={lang["number_of_packets_received"]} itemValue={receiveCount} iconName="trending-down"/>
        </View>
      </SimpleCard>
    </>
  );
}