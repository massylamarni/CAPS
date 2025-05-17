import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { DbState } from './dbClass';

export default function DbView({ dbState: dbState }: {dbState: DbState}) {

  return (
    <>
      <View style={[styles.COMPONENT_CARD, styles.db_info]}>
        <Tex style={styles.COMPONENT_TITLE}>
          Database Info
        </Tex>
        <View style={styles.COMPONENT_WRAPPER}>
          <View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Status</Tex>
              <Tex>{dbState.isDbConnected ? 'Connected' : 'Disconnected'}</Tex>
            </View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Last read</Tex>
              <Tex>{dbState.dbStats?.last_read}</Tex>
            </View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Last write</Tex>
              <Tex>{dbState.dbStats?.last_row?.DateTime}</Tex>
            </View>
            <View style={styles.COMPONENT_LIST_ITEM}>
              <Tex>Row count</Tex>
              <Tex>{dbState.dbStats?.row_count}</Tex>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
  