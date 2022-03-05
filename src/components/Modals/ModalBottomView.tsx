import { StyleSheet } from 'react-native';
import type { ModalViewProps } from './ModalView';
import { ModalView } from './ModalView';



export type ModalBottomViewProps = ModalViewProps;


export const ModalBottomView: React.FC<ModalBottomViewProps> = ({
  containerStyle, portalStyle, contentStyle, ...props
}) => {
  return (
    <ModalView
      {...props}
      portalStyle={[s.portal, portalStyle]}
      containerStyle={[s.container, containerStyle]}
    />
  );
};


const s = StyleSheet.create({
  portal: {
    justifyContent: 'flex-end',
  },
  container: {
    borderRadius: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
    // maxHeight: '70%',
  },
});