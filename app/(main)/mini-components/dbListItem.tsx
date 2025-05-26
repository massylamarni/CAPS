import { ReactNode } from 'react';
import { View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleSubCard from './simpleSubcard';
import { useLangs } from "@/utils/langContext";

export default function DbListItem({ entryName, children, onPressE = null }: { entryName: string, children: ReactNode, onPressE?: any }) {
  const { lang } = useLangs();
  
  return(
    <SimpleSubCard title={entryName} onPressE={onPressE} potentialValue={lang["select"]}>
      {children}
    </SimpleSubCard>
  )
}