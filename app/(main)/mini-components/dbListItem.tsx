import { ReactNode } from 'react';
import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

import Icon from 'react-native-vector-icons/Feather';

export default function DbListItem({ entryName, children }: { entryName: string, children: ReactNode }) {

  return(
    <View style={[styles.HISTORY_ITEM, styles.MD_ROW_GAP]}>
      <View style={styles.HISTORY_ITEM_HEADER}>
        <Tex style={styles.SUBCOMPONENT_TITLE}>{entryName}</Tex>
      </View>
      <View style={styles.HISTORY_ITEM_BODY}>
        <View>
          {children}
        </View>
      </View>
    </View>
  )
}