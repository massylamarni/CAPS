import { TouchableOpacity, View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

import Icon from 'react-native-vector-icons/Feather';
import { useStateLogger } from '../useStateLogger';

export default function TextListItemSubCard({ itemKey, itemValue, iconName, onPressE = null, processing= false }: { itemKey: string, itemValue: string | number, iconName?: string, onPressE?: any, processing?: boolean }) {

  return(
    <View style={styles.SUBCOMPONENT_LIST_ITEM}>
      <Tex>{itemKey}</Tex>
      <View style={styles.LEGEND_CONTAINER}>
        {iconName && <Icon style={styles.MD_COL_GAP} name={iconName} size={themeI.legendSize.default} color={themeI.legendColors.default} />}
        {onPressE ? <TouchableOpacity style={processing ? styles.SMALL_BUTTON_GREYED : styles.SMALL_BUTTON} disabled={processing} onPress={onPressE}>
          <Tex>{itemValue}</Tex>
        </TouchableOpacity> : <Tex>{itemValue}</Tex>}
      </View>
    </View>
  )
}