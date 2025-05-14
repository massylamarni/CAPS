import { View, TouchableOpacity } from 'react-native';
import Tex from './base-components/tex';
import styles from '@/assets/styles';
import { ModelState } from './modelClass';

const actionMapping = ["Grazing", "Standing", "Walking", "Resting", "Mating", "Scratching", "Licking"];

export default function ModelView({ modelState: modelState }: {modelState: ModelState}) {
  //console.log(modelState.predictions);
  return (
    <>
      <View style={[styles.COMPONENT_CARD, styles.model_info]}>
        <Tex style={styles.COMPONENT_TITLE} >
          Model info
        </Tex>
        <View style={styles.COMPONENT_WRAPPER}>
          {modelState.predictions?.length != 0 && (modelState.predictions[0].map((prediction: any, index: any) => (
            <View key={index} style={[styles.CLASS_PROBABILITY, styles.MD_ROW_GAP]}>
              <View style={styles.CLASS_PROBABILITY_HEADER}>
                <Tex>{actionMapping[index]}</Tex>
                <Tex>{`${prediction.toFixed(2) * 100} %`}</Tex>
              </View>
              <View style={styles.CLASS_PROBABILITY_BODY}>
              </View>
            </View>
          )))}
        </View>
      </View>
    </>
  );
}
  