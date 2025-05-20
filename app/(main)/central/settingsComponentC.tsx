import ButtonListItem from '../mini-components/buttonListItem';
import { View } from 'react-native';
import { resetDatabase } from '@/utils/sqlite_db_c';

export default function SettingsComponentC({ setSettings, setRole }: { setSettings: any, setRole: any }) {

  return (
    <>
      <View>
        <ButtonListItem
          onPressE={() => setSettings((prev: any) => ({...prev, isSimulating: !prev.isSimulating }))}
          label='Simulate data reception'
        />
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
  