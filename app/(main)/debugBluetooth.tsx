import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DebugBluetooth({ BlueComponentInst }: any) {
  return (
    <>
      <ThemedView>
        <ThemedText style={styles.masterTitle}>Bluetooth data transfer</ThemedText>
      </ThemedView>
      <ThemedView style={styles.horizontalButtonContainer}>
        {!BlueComponentInst.state.discovering ? (
        <TouchableOpacity style={[styles.defaultButton, styles.notLastButton]} onPress={async () => await BlueComponentInst.startDiscovery()}>
          <ThemedText style={styles.defaultButtonText}>Start Discovery</ThemedText>
        </TouchableOpacity>
        ) : (
        <TouchableOpacity style={[styles.defaultButton, styles.notLastButton, styles.activeStateButton]} onPress={async () => await BlueComponentInst.cancelDiscovery()}>
          <ThemedText style={styles.defaultButtonText}>Stop Discovery</ThemedText>
        </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.defaultButton} onPress={async () => await BlueComponentInst.getBondedDevices()}>
          <ThemedText style={styles.defaultButtonText}>Get bonded devices</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      
      <ThemedView>
        <ThemedText style={styles.sectionTitle}>Unpaired devices</ThemedText>
        {BlueComponentInst.state.unpairedDevices.length === 0 ? (
          <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
        ) : (
          BlueComponentInst.state.unpairedDevices.map((device: any, index: any) => (
            <ThemedView key={index} style={styles.deviceInfoContainer}>
              <ThemedText>
                {device.name} {device.address}
              </ThemedText>
              <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => BlueComponentInst.state.pairing ? null : BlueComponentInst.pairDevice(device.address)}>
                <ThemedText style={[BlueComponentInst.state.pairing ? styles.listActionLinkGreyed : styles.listActionLink, styles.notLastButton]}>{BlueComponentInst.state.pairing ? 'Pairing' : 'Pair'}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            ))
        )}
      </ThemedView>
      <ThemedView>
        <ThemedText style={styles.sectionTitle}>Paired devices</ThemedText>
        {!BlueComponentInst.state.theDevice ? (
          <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
        ) : (
          <ThemedView style={styles.deviceInfoContainer}>
            <ThemedText>
              {BlueComponentInst.state.theDevice.name} {BlueComponentInst.state.theDevice.address}
            </ThemedText>
            <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => BlueComponentInst.state.theDevice?.address && BlueComponentInst.unpairDevice(BlueComponentInst.state.theDevice.address)}>
              <ThemedText style={[styles.listActionLink, styles.notLastButton]}>Unpair</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => BlueComponentInst.state.connecting ? null : BlueComponentInst.connect(BlueComponentInst.state.theDevice)}>
              <ThemedText style={BlueComponentInst.state.connecting ? styles.listActionLinkGreyed : styles.listActionLink}>{BlueComponentInst.state.connecting ? 'Connecting' : 'Connect'}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
      <ThemedView>
        <ThemedText style={styles.sectionTitle}>Bonded devices</ThemedText>
        {BlueComponentInst.state.bondedDevices.length === 0 ? (
          <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
        ) : (
          BlueComponentInst.state.bondedDevices.map((device: any, index: any) => (
          <ThemedView key={index} style={styles.deviceInfoContainer}>
            <ThemedText>
              {device.name} {device.address}
            </ThemedText>
            <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => BlueComponentInst.pairDevice(device.address)}>
              <ThemedText style={[styles.listActionLink, styles.notLastButton]}>Pair</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.defaultLinkContainer} onPress={() => BlueComponentInst.state.connecting ? null : BlueComponentInst.connect(device)}>
              <ThemedText style={BlueComponentInst.state.connecting ? styles.listActionLinkGreyed : styles.listActionLink}>{BlueComponentInst.state.connecting ? 'Connecting' : 'Connect'}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          ))
      )}
      </ThemedView>
      <ThemedView>
        <ThemedText style={styles.sectionTitle}>Connected devices</ThemedText>
        {BlueComponentInst.state.connectedDevices.length === 0 ? (
          <ThemedText style={styles.deviceInfoContainer}>No devices to show</ThemedText>
        ) : (
          BlueComponentInst.state.connectedDevices.map((device: any, index: any) => (
          <ThemedView key={index} style={styles.deviceInfoContainer}>
            <ThemedText>
              {device.name} {device.address}
            </ThemedText>
          </ThemedView>
          ))
      )}
      </ThemedView>

      <ThemedView style={styles.horizontalButtonContainer}>
      <TouchableOpacity style={[styles.defaultButton, styles.notLastButton]} onPress={async () => await BlueComponentInst.write("SimpleMessage\n")}>
          <ThemedText style={styles.defaultButtonText}>Send packet</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.defaultButton]} onPress={async () => await BlueComponentInst.acceptConnections()}>
          <ThemedText style={styles.defaultButtonText}>Accept connection</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView>
        <ThemedText style={styles.sectionTitle}>General stats</ThemedText>
        <ThemedText style={styles.sectionDescription}>Bluetooth enabled:
          <ThemedText> {BlueComponentInst.state.isBluetoothEnabled ? 'true' : 'false'}</ThemedText>
        </ThemedText>
        <ThemedText style={styles.sectionDescription}>Bluetooth connection status:
          <ThemedText> {BlueComponentInst.state.connectedDevices.length !== 0 ? 'true' : 'false'}</ThemedText>
        </ThemedText>
        <ThemedText style={styles.sectionDescription}>Bluetooth accepting mode:
          <ThemedText> {BlueComponentInst.state.isAcceptingConnections ? 'true' : 'false'}</ThemedText>
        </ThemedText>
      </ThemedView>
    </>
  )
}

const styles = StyleSheet.create({
  body: {
  },
  bleSection: {
  },
  sensorSection: {
  },
  sectionContainer: {
    flex: 1,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  masterTitle: {
    fontSize: 22,
    marginBottom: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 30,
  },
  sectionDescription: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  horizontalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  defaultButton: {
    borderRadius: 5,
    backgroundColor: '#303030',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  defaultButtonText: {
    fontSize: 10,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  defaultLinkContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  defaultLink: {
    fontSize: 12,
    textDecorationLine: 'underline',
    color: '#505050',
  },
  listActionLink: {
    fontSize: 10,
    textDecorationLine: 'underline',
    color: '#50a050',
  },
  listActionLinkGreyed: {
    fontSize: 10,
    color: '#303030',
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    fontSize: 12,
  },
  deviceInfo: {
    padding: 3,
    fontSize: 10,
    fontWeight: '400',
  },
  notLastButton: {
    marginRight: 15,
  },
  activeStateButton: {
    backgroundColor: '#808080',
  },
  highlight: {
    fontWeight: '700',
  },
});