import ButtonListItem from '../mini-components/buttonListItem';
import { View, ScrollView } from 'react-native';
import { resetDatabase } from '@/utils/sqlite_db_p';
import { useLogs } from '@/app/(main)/logContext';
import Tex from '../base-components/tex';

const TAG = "C/settingsComponent";

export default function SettingsComponentP({ setRole }: { setRole: any}) {
  const { logs, addLog } = useLogs();
  
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
      <ScrollView>
        {logs.map((log, index) => (
          <Tex key={index}>{log}</Tex>
        ))}
      </ScrollView>
    </>
  );
}
  