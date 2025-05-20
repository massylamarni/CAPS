import { ReactNode } from 'react';
import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

import Icon from 'react-native-vector-icons/Feather';

export default function SimpleCard({ title, children }: { title: string | null, children: ReactNode}) {

  return(
    <View style={[styles.COMPONENT_CARD, styles.ble_info]}>
      {title && <Tex style={styles.COMPONENT_TITLE} >
        {title}
      </Tex>}
      <View style={styles.COMPONENT_WRAPPER}>
        {children}
      </View>
    </View>
  )
}