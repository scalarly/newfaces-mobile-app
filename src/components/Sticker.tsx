import React, { forwardRef } from 'react';
import { StyleSheet, Dimensions, View as RNView } from 'react-native';
import { View } from './Layout';
import { ScrollView } from './ScrollView';
import { Pressable } from './Pressable';
import { Text } from './Typography';
import { getTheme, spacing, borderRadius } from '../helpers/theme';

const windowHeight = Dimensions.get('window').height;

interface StickerProps {
  /** Sticker title */
  title: string;
  /** Optional subtitle */
  subTitle?: string;
  /** Show reset filter button */
  reset?: boolean;
  /** Reset filter callback */
  onReset?: () => void;
  /** Toggle sticker visibility */
  toggle: () => void;
  /** Sticker content */
  children: React.ReactNode;
  /** Whether sticker is visible */
  visible?: boolean;
}

/**
 * Modal-like bottom sheet component (Sticker)
 * 
 * @example
 * <Sticker
 *   title="Filter Options"
 *   subTitle="Select your preferences"
 *   reset
 *   onReset={() => clearFilters()}
 *   toggle={() => setVisible(!visible)}
 *   visible={visible}
 * >
 *   <Text>Filter content here</Text>
 * </Sticker>
 */
export const Sticker = forwardRef<RNView, StickerProps>(({
  title,
  subTitle,
  reset,
  onReset,
  toggle,
  children,
  visible = true,
}) => {
  const theme = getTheme();

  if (!visible) return null;

  return (
    <View style={styles.sticker}>
      {/* Backdrop */}
      <Pressable 
        style={styles.backdrop}
        onPress={toggle}
      />
      
      {/* Content */}
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: theme.colors.outline }]} />
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text size="heading" weight="semiBold" color="onSurface">
              {title}
            </Text>
            {subTitle && (
              <Text size="body" variant="secondary" style={styles.subtitle}>
                {subTitle}
              </Text>
            )}
          </View>
          
          <View style={styles.headerRight}>
            {reset && (
              <Pressable onPress={onReset}>
                <Text size="body" color="primary">
                  Reset Filter
                </Text>
              </Pressable>
            )}
          </View>
        </View>
        
        {/* Body */}
        <ScrollView 
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
});

Sticker.displayName = 'Sticker';

const styles = StyleSheet.create({
  sticker: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: windowHeight - 160,
  },
  handleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 40,
    height: 3,
    borderRadius: borderRadius.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: spacing.lg,
  },
});