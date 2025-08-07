/**
 * GallerySelectionBar - Selection controls and batch operations
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { View } from '../../../components/Layout';
import { Text } from '../../../components/Typography';
import { Pressable } from '../../../components/Pressable';
import { GradientView, gradientPresets } from './GradientView';
import { colors, spacing, shadows } from '../../../helpers/theme';
import { useTranslation } from '../../../hooks/useTranslation';
import Icon from 'react-native-vector-icons/Feather';

export interface GallerySelectionBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownloadSelected: () => void;
  onExportPDF: () => void;
  isLoading?: boolean;
}

export const GallerySelectionBar: React.FC<GallerySelectionBarProps> = ({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onDownloadSelected,
  onExportPDF,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GradientView
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
        style={styles.background}
      />
      
      {/* Selection info and controls */}
      <View style={styles.topRow}>
        <Pressable
          style={styles.selectAllButton}
          onPress={isAllSelected ? onClearSelection : onSelectAll}
        >
          <Icon 
            name={isAllSelected ? "check-square" : "square"} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.selectAllText}>
            {isAllSelected ? 'Unselect All' : 'Select All'}
          </Text>
        </Pressable>
        
        <Text style={styles.countText}>
          {selectedCount} of {totalCount} selected
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, styles.downloadButton]}
          onPress={onDownloadSelected}
          disabled={isLoading}
        >
          <Icon 
            name="download" 
            size={18} 
            color="#FFFFFF" 
          />
          <Text style={styles.actionButtonText}>
            Download ({selectedCount})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.pdfButton]}
          onPress={onExportPDF}
          disabled={isLoading}
        >
          <Icon 
            name="file-text" 
            size={18} 
            color="#FFFFFF" 
          />
          <Text style={styles.actionButtonText}>
            Export PDF
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    ...shadows.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  selectAllText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.grey600,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  downloadButton: {
    backgroundColor: colors.primary,
  },
  pdfButton: {
    backgroundColor: colors.secondary || '#FF6B6B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
