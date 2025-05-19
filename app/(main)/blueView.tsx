import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { BlueState } from './blueClass';
import { BluetoothDevice } from 'react-native-bluetooth-classic';
import { useEffect, useState } from 'react';
import { getLastRow } from '@/utils/sqlite_db';
import Icon from 'react-native-vector-icons/Feather';
import themeI from '@/assets/themes';


const TAG = "C/blueView";


export default function BlueView({ blueState: blueState, blueRef: blueRef }: { blueState: BlueState, blueRef: any }) {

  const sendDbAnchor = async () => {
    console.log(TAG, "Sending anchor...");
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
    if (blueState.connectedDevices && blueState.connectedDevices.length !== 0) { // On connection success
      console.log(TAG, "Connexion success !");
      sendDbAnchor();
    }
  }, [blueState.connectedDevices]);

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
              <Tex>{blueState.isBluetoothEnabled ? 'Enabled' : 'Disabled'}</Tex>
            </View>
            {(blueState.isBluetoothEnabled) && <>
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
          <View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Num of packets received</Tex>
              <View style={styles.LEGEND_CONTAINER}>
                <Icon style={styles.MD_COL_GAP} name="trending-down" size={themeI.legendSize.default} color={themeI.legendColors.default} />
                <Tex>{blueState.commStats?.packets_received}</Tex>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
  