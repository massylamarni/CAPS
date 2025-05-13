// components/Tex.tsx
import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';

interface TexProps extends TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}

const Tex: React.FC<TexProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.defaultText, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 11,
  },
});

export default Tex;
