import { TouchableOpacity } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import Icon from 'react-native-vector-icons/Feather';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';
import { useState } from 'react';

export default function StateButton({ onPressE, label }: { onPressE: any, label: string }) {
  const [isOn, setIsOn] = useState(false);

  const handlePress = () => {
    setIsOn(prev => !prev);
    onPressE();
  }
  
  return (
    <TouchableOpacity onPress={handlePress} style={styles.buttonListItem}>
      <Tex>{label}</Tex>
      <Icon name={isOn ? 'toggle-right' : 'toggle-left'} color={themeI.legendColors.default} size={themeI.legendSize.default} />
    </TouchableOpacity>
  )
}