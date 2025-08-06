import React, { forwardRef } from 'react';
import {
  ScrollView as RNScrollView,
  ScrollViewProps as RNScrollViewProps,
} from 'react-native';
import { spacing } from '../helpers/theme';

interface CustomScrollViewProps extends RNScrollViewProps {
  /** Content padding variant from theme */
  contentPadding?: keyof typeof spacing | number;
  /** Remove default scroll indicators */
  hideScrollIndicator?: boolean;
  /** Enable keyboard avoiding behavior */
  keyboardAvoiding?: boolean;
}

/**
 * Enhanced ScrollView component with theme support
 * 
 * @example
 * <ScrollView contentPadding="md" hideScrollIndicator>
 *   <Text>Scrollable content</Text>
 * </ScrollView>
 */
export const ScrollView = forwardRef<RNScrollView, CustomScrollViewProps>(({
  contentPadding,
  hideScrollIndicator = false,
  keyboardAvoiding = false,
  contentContainerStyle,
  showsVerticalScrollIndicator,
  showsHorizontalScrollIndicator,
  keyboardShouldPersistTaps,
  children,
  ...props
}, ref) => {
  const getContentPadding = () => {
    if (typeof contentPadding === 'number') return contentPadding;
    if (contentPadding && contentPadding in spacing) {
      return spacing[contentPadding];
    }
    return undefined;
  };

  const contentStyle = [
    {
      padding: getContentPadding(),
    },
    contentContainerStyle,
  ];

  return (
    <RNScrollView
      ref={ref}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={hideScrollIndicator ? false : showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={hideScrollIndicator ? false : showsHorizontalScrollIndicator}
      keyboardShouldPersistTaps={keyboardAvoiding ? 'handled' : keyboardShouldPersistTaps}
      {...props}
    >
      {children}
    </RNScrollView>
  );
});

ScrollView.displayName = 'ScrollView';