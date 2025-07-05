// Web stub for react-native-maps
import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ children, ...props }) => (
  <View {...props} style={[{ flex: 1, backgroundColor: '#f0f0f0' }, props.style]}>
    <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
      Map not available on web
    </Text>
    {children}
  </View>
);

const Marker = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

const Callout = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

const CalloutSubview = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

const Circle = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

const Polyline = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

const Polygon = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

const Overlay = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export default MapView;
export { Marker, Callout, CalloutSubview, Circle, Polyline, Polygon, Overlay };