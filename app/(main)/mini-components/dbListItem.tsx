import { ReactNode } from 'react';
import { View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleSubCard from './simpleSubcard';
import { lang } from '@/assets/languages/lang-provider';

export default function DbListItem({ entryName, children, onPressE }: { entryName: string, children: ReactNode, onPressE: any }) {
  return(
    <SimpleSubCard title={entryName} onPressE={onPressE} potentialValue={lang["select"]}>
      {children}
    </SimpleSubCard>
  )
}