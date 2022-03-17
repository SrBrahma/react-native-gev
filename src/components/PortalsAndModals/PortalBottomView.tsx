import { StyleSheet } from 'react-native';
import type { PortalViewProps } from './PortalView';
import { PortalView } from './PortalView';



export type PortalBottomViewProps = PortalViewProps;


export const PortalBottomView: React.FC<PortalBottomViewProps> = ({
  containerStyle, portalStyle, contentStyle, ...props
}) => {
  return (
    <PortalView
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