import { PermissionsAndroid, ToastAndroid, View, TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

import Icon from 'react-native-vector-icons/Feather';

export default function TextListItemSubCard({ itemKey, itemValue, iconName, onPressE = null }: { itemKey: string, itemValue: string | number, iconName?: string, onPressE?: any }) {

  return(
    <View style={styles.SUBCOMPONENT_LIST_ITEM}>
      <Tex>{itemKey}</Tex>
      <View style={styles.LEGEND_CONTAINER}>
        {iconName && <Icon style={styles.MD_COL_GAP} name={iconName} size={themeI.legendSize.default} color={themeI.legendColors.default} />}
        <Tex onPress={onPressE}>{itemValue}</Tex>
      </View>
    </View>
  )
}