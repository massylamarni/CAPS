import ButtonListItem from '../mini-components/buttonListItem';
import { View, ScrollView } from 'react-native';
import { resetDatabase } from '@/utils/sqlite_db_p';
import { useLogs } from '@/utils/logContext';
import Tex from '../base-components/tex';
import SimpleCard from '../mini-components/simpleCard';

const TAG = "C/settingsComponent";

export default function SettingsComponentP({ setRole }: { setRole: any}) {
  const { logs, addLog } = useLogs();
  
  return (
    <>
      <SimpleCard title="Settings">
        <ButtonListItem
          onPressE={() => setRole((prev: 'CENTRAL' | 'PERIPHERAL') => (prev === 'CENTRAL' ? 'PERIPHERAL' : 'CENTRAL'))}
          label='Switch roles'
        />
        <ButtonListItem
          onPressE={() => resetDatabase()}
          label='Reset database'
        />
      </SimpleCard>

      <SimpleCard title="Logs">
        <ScrollView>
          {logs.map((log, index) => (
            <Tex key={index}>{log}</Tex>
          ))}
        </ScrollView>
      </SimpleCard>
    </>
  );
}
  