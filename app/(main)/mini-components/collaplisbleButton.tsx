import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Tex from '../base-components/tex';
import Icon from 'react-native-vector-icons/Feather';
import themeI from '@/assets/themes';
import styles from '@/assets/styles';

export default function CollapsibleButton({value, options, onPressE}: {value: string, options: string[], onPressE: any}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setIsCollapsed(prev => !prev)} style={styles.buttonListItem}>
        <Tex>{value}</Tex>
        <Icon name={isCollapsed ? 'chevron-down' : 'chevron-right'} color={themeI.legendColors.default} size={themeI.legendSize.default} />
      </TouchableOpacity>
      {isCollapsed && <View>
        {options.map((option, index) => 
          <TouchableOpacity onPress={() => onPressE[index]()} style={styles.collapsibleButtonItem}>
            <Tex>{option}</Tex>
          </TouchableOpacity>
        )}
      </View>}
    </>
  );
}

