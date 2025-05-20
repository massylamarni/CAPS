import { ReactNode } from 'react';
import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

import Icon from 'react-native-vector-icons/Feather';

export default function SimpleSubCard({ title, children }: { title: string, children: ReactNode}) {

  return(
    <View style={[styles.SUBCOMPONENT_CARD, styles.MD_ROW_GAP]}>
      <Tex style={styles.SUBCOMPONENT_TITLE}>
        {title}
      </Tex>
      <View>
        {children}
      </View>
    </View>
  )
}