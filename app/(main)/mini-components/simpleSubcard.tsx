import { ReactNode } from 'react';
import { View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';

export default function SimpleSubCard({ title, potentialValue,  children }: { title: string, potentialValue?: string, children: ReactNode}) {

  return(
    <View style={[styles.SUBCOMPONENT_CARD, styles.MD_ROW_GAP]}>
      <View style={styles.SUBCOMPONENT_TITLE}>
        <Tex>{title}</Tex>
        {potentialValue && <Tex>{potentialValue}</Tex>}
      </View>
      <View>
        {children}
      </View>
    </View>
  )
}