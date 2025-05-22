import { ReactNode } from 'react';
import { View } from 'react-native';
import Tex from '@/app/(main)/base-components/tex';
import styles from '@/assets/styles';
import SimpleSubCard from './simpleSubcard';

export default function DbListItem({ entryName, children }: { entryName: string, children: ReactNode }) {
  return(
    <SimpleSubCard title={entryName}>
      {children}
    </SimpleSubCard>
  )
}