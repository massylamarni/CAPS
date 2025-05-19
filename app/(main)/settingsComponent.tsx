import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import Icon from 'react-native-vector-icons/Feather';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';
import { resetDatabase } from '@/utils/sqlite_db';

export default function SettingsComponent({ setSettings: setSettings }: {setSettings: any}) {

  return (
    <>
      <View style={styles.COMPONENT_CARD}>
        <TouchableOpacity onPress={() => setSettings((prev: any) => ({...prev, isSimulating: !prev.isSimulating }))} style={[styles.buttonListItem, styles.HORIZONTAL_SEPARATOR]}>
          <Tex>Simulate data reception</Tex>
          <Icon name='chevron-right' color={themeI.legendColors.default} size={themeI.legendSize.default} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => resetDatabase()} style={styles.buttonListItem}>
          <Tex>Reset database</Tex>
          <Icon name='chevron-right' color={themeI.legendColors.default} size={themeI.legendSize.default} />
        </TouchableOpacity>
      </View>
    </>
  );
}
  