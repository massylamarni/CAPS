// components/Tex.tsx
import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import themeI from '@/assets/themes';
interface TexProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}

const Tex: React.FC<TexProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[texStyles.defaultText, style]} {...props}>
      {children}
    </Text>
  );
};

const texStyles = StyleSheet.create({
  defaultText: {
    fontSize: 11,
    color: themeI.fontColors.default,
  },
});

export default Tex;
