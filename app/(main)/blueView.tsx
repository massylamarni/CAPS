import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { BlueState } from './blueClass';
import { BluetoothDevice } from 'react-native-bluetooth-classic';
import { useEffect, useState } from 'react';
import { getAllSensorData, getAllDevices, getLastRow } from '@/utils/sqlite_db';
import { SensorState } from './sensorClass';


export default function BlueView({ blueState: blueState, blueRef: blueRef, sensorState: sensorState, role: role }: {blueState: BlueState, blueRef: any, sensorState: SensorState, role: 'P' | 'C'}) {
  const [dbAnchor, setDbAnchor] = useState(null as string | null);
  const [isDbBuffered, setIsDbBuffered] = useState(false);

  const exportDatabaseAsJson = async (_dbAnchor: number) => {
    const devices = await getAllDevices();
    const sensorData = await getAllSensorData(_dbAnchor);

    const largeMessage = JSON.stringify({
      devices,
      sensorData
    });

    blueRef.current?.managedWrite(largeMessage + '\n');
  };

  const sendDbAnchor = async () => {
    const lastRow = await getLastRow();
    if (lastRow.length !== 0) {
      const most_recent_row = lastRow.reduce((latest, current) =>
        current.DateTime > latest.DateTime ? current : latest
      );

      const message = JSON.stringify(most_recent_row.id);
      blueRef.current?.managedWrite(message);
    } else {
      const message = JSON.stringify(0);
      blueRef.current?.managedWrite(message);
    }
  };

  useEffect(() => {
    if (role === 'P') {
      blueRef.current?.acceptConnections();
    }
  }, []);

  useEffect(() => {
    if (blueState.connectedDevices && blueState.connectedDevices.length !== 0) { // On connection success
      if (role === 'C') {
        sendDbAnchor();
      }
      else if (role === 'P') {
        if (dbAnchor) {
          exportDatabaseAsJson(JSON.parse(dbAnchor));
          setIsDbBuffered(true);
        }
      }
    }
  }, [blueState.connectedDevices]);

  useEffect(() => { // On receive
    if (blueState.receivedData?.length !== 0) {
      if (role == 'C') {
        
      }
      else if (role === 'P') {
        setDbAnchor(blueState.receivedData ? blueState.receivedData[0] : null);
      }
    }
  }, [blueState.receivedData]);

  useEffect(() => {
    if (isDbBuffered) {
      blueRef.current?.managedWrite(JSON.stringify(sensorState.sensorData));
    }
  }, [sensorState.sensorData]);

  return (
    <>
      <View style={[styles.COMPONENT_CARD, styles.ble_info]}>
        <Tex style={styles.COMPONENT_TITLE} >
          Bluetooth Info
        </Tex>
        <View style={styles.COMPONENT_WRAPPER}>
          <View style={styles.COMPONENT_WRAPPER}>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Status</Tex>
              <Tex>{blueState.isBluetoothEnabled ? 'Enabled' : 'Disabled'}</Tex>
            </View>
            {role == 'P' && <>
              <View style={styles.COMPONENT_LIST_ITEM}>
                <Tex>Advertising as</Tex>
                <Tex>GALAXY</Tex>
              </View>
            </>}
            {(role == 'C' && blueState.isBluetoothEnabled) && <>
              <View style={[styles.SUBCOMPONENT_CARD, styles.MD_ROW_GAP]}>
                <Tex
                onPress={blueState.discovering ? blueRef.current?.cancelDiscovery : blueRef.current?.startDiscovery}
                style={styles.SUBCOMPONENT_TITLE}>
                  Devices found {blueState.discovering && '(Discovering...)'}
                </Tex>
                <View>
                  {blueState.unpairedDevices?.length != 0 ? (blueState.unpairedDevices?.map((device, index) => (
                    <View key={index} style={styles.SUBCOMPONENT_LIST_ITEM}>
                      <Tex>{device.name}</Tex>
                      {blueState.theDevice ? (<>
                        <Tex>{blueState.theDevice.name == device.name ? 'Disconnect' : 'Connect'}</Tex>
                      </>) : (<>
                        <Tex onPress={() => blueRef.current.fullConnect(device)}>{blueState.connecting ? 'Connecting...' : 'Connect'}</Tex>
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
            {blueState.theDevice && <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Connected to</Tex>
              <Tex>{blueState.theDevice?.name}</Tex>
            </View>}
          </View>
          {role == 'P' && <>
            <View>
              <View style={styles.COMPONENT_LIST_ITEM}>
                <Tex>Num of packets sent</Tex>
                <Tex>0</Tex>
              </View>
              <View style={styles.COMPONENT_LIST_ITEM}>
                <Tex>Num of packets pending</Tex>
                <Tex>0</Tex>
              </View>
            </View>
          </>}
          {role == 'C' && <>
            <View>
              <View style={styles.COMPONENT_LIST_ITEM}>
                <Tex>Num of packets received</Tex>
                <Tex>0</Tex>
              </View>
            </View>
          </>}
        </View>
      </View>
    </>
  );
}
  