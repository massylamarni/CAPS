import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';
import ProgressBar from '@/app/(main)/mini-components/progressbar';

import Icon from 'react-native-vector-icons/Feather';

export default function ProbabilityItem({ itemKey, itemValue }: { itemKey: string, itemValue: number }) {

  return(
    <View style={[styles.CLASS_PROBABILITY, styles.MD_ROW_GAP]}>
      <View style={styles.CLASS_PROBABILITY_HEADER}>
        <Tex>{itemKey}</Tex>
        <Tex>{`${itemValue} %`}</Tex>
      </View>
      <View style={styles.CLASS_PROBABILITY_BODY}>
        <ProgressBar progress={itemValue} backgroundColor={themeI.progressBar.background} progressBarColor={themeI.progressBar.foreground} />
      </View>
    </View>
  )
}