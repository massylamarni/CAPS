import { ReactNode } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';

export default function SimpleSubCard({ title, potentialValue, onPressE = null, processing = false, children }: { title: string, potentialValue?: string, onPressE?: any, processing?: boolean, children: ReactNode}) {

  return(
    <View style={[styles.SUBCOMPONENT_CARD, styles.MD_ROW_GAP]}>
      <View style={styles.SUBCOMPONENT_TITLE}>
        <Tex>{title}</Tex>
        {(potentialValue && !onPressE) && <Tex>{potentialValue}</Tex>}
        {onPressE && <TouchableOpacity style={processing ? styles.SMALL_TITLE_BUTTON_GREYED : styles.SMALL_TITLE_BUTTON} onPress={onPressE}>
          <Tex>{potentialValue}</Tex>
        </TouchableOpacity>}
      </View>
      <View style={{ marginTop: 10 }}>
        {children}
      </View>
    </View>
  )
}