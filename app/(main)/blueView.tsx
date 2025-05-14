import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { BlueState } from './blueClass';

export default function BlueView({ blueState: blueState, role: role }: {blueState: BlueState, role: 'P' | 'C'}) {
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
                <Tex style={styles.SUBCOMPONENT_TITLE}>Devices found {blueState.discovering && '(Discovering...)'}</Tex>
                <View>
                  {blueState.unpairedDevices?.length != 0 ? (blueState.unpairedDevices?.map((device, index) => (
                    <View key={index} style={styles.SUBCOMPONENT_LIST_ITEM}>
                      <Tex>{device.name}</Tex>
                      {blueState.theDevice ? (<>
                        <Tex>{blueState.theDevice.name == device.name ? 'Disconnect' : 'Connect'}</Tex>
                      </>) : (<>
                        <Tex>{'Connect'}</Tex>
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
  