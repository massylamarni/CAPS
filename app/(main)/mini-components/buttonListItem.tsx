import { TouchableOpacity, View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import Icon from 'react-native-vector-icons/Feather';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';
import { useState } from 'react';
import { useLangs } from "@/utils/langContext";

export default function ButtonListItem({ onPressE, label, warning }: { onPressE: any, label: string, warning: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { lang, updateLangTo } = useLangs();

  return (
    <>
      <TouchableOpacity onPress={() => setIsConfirming(true)} style={styles.buttonListItem}>
        <Tex>{label}</Tex>
      </TouchableOpacity>
      {isConfirming && <View style={styles.confirmView}>
        <View style={styles.confirmViewWrapper}>
          <View style={styles.confirmViewContent}>
            <Icon style={styles.MD_ROW_GAP} name='alert-triangle' color={themeI.legendColors.default} size={themeI.legendSize.md} />
            <Tex>{warning}</Tex>
            <Tex>{lang["do_you_want_to_proceed"]}</Tex>
          </View>
          <View style={styles.horizontalButtonContainer}>
            <TouchableOpacity onPress={() => setIsConfirming(false)} style={styles.buttonSecondary}>
              <Tex>{lang["cancel"]}</Tex>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressE} style={styles.buttonPrimary}>
              <Tex>{lang["continue"]}</Tex>
            </TouchableOpacity>
          </View>
        </View>
      </View>}
    </>
  )
}