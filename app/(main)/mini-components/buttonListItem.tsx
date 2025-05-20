import { TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import Icon from 'react-native-vector-icons/Feather';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

export default function ButtonListItem({ onPressE, label }: { onPressE: any, label: string }) {
  
  return (
    <TouchableOpacity onPress={onPressE} style={styles.buttonListItem}>
      <Tex>{label}</Tex>
      <Icon name='chevron-right' color={themeI.legendColors.default} size={themeI.legendSize.default} />
    </TouchableOpacity>
  )
}