import ButtonListItem from '../mini-components/buttonListItem';
import { View } from 'react-native';
import { resetDatabase } from '@/utils/sqlite_db_p';

export default function SettingsComponentP({ setRole }: { setRole: any}) {

  return (
    <>
      <View>
        <ButtonListItem
          onPressE={() => setRole((prev: 'CENTRAL' | 'PERIPHERAL') => (prev === 'CENTRAL' ? 'PERIPHERAL' : 'CENTRAL'))}
          label='Switch roles'
        />
        <ButtonListItem
          onPressE={() => resetDatabase()}
          label='Reset database'
        />
      </View>
    </>
  );
}
  