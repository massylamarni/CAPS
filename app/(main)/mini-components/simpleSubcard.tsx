import { ReactNode } from 'react';
import { View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';

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