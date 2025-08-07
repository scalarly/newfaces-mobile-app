import React, { useState } from 'react';
import { StyleSheet, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our new migrated components
import { View, Container } from '../components/Layout';
import { Text, Title } from '../components/Typography';
import { Image } from '../components/Image';
import { Header } from '../components/Header';
import { Pressable } from '../components/Pressable';
import { BottomNavigation } from '../components/BottomNavigation';
import { useTranslation } from '../hooks/useTranslation';


const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2; // 2 columns with margins

const GalleryScreen: React.FC = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Sample gallery data for demonstration
  const galleryItems = [
    { id: '1', type: 'image', url: 'https://picsum.photos/400/300?random=1', title: 'Sample Image 1' },
    { id: '2', type: 'image', url: 'https://picsum.photos/400/300?random=2', title: 'Sample Image 2' },
    { id: '3', type: 'image', url: 'https://picsum.photos/400/300?random=3', title: 'Sample Image 3' },
    { id: '4', type: 'image', url: 'https://picsum.photos/400/300?random=4', title: 'Sample Image 4' },
    { id: '5', type: 'image', url: 'https://picsum.photos/400/300?random=5', title: 'Sample Image 5' },
    { id: '6', type: 'image', url: 'https://picsum.photos/400/300?random=6', title: 'Sample Image 6' },
  ];

  const renderGalleryItem = ({ item }: { item: typeof galleryItems[0] }) => (
    <Pressable
      style={styles.galleryItem}
      onPress={() => setSelectedImage(item.url)}
    >
      <Image
        src={item.url}
        style={styles.galleryImage}
        borderRadius={8}
        showLoading
      />
      <Text size="caption" style={styles.imageTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={t('mobile.titles.gallery')} 
        showNotification 
      />
      
      <Container style={styles.content}>
        <View style={styles.galleryContainer}>
          <Title style={styles.sectionTitle}>Photo Gallery</Title>
          <Text variant="secondary" style={styles.description}>
            Browse through your media collection
          </Text>
          
          <FlatList
            data={galleryItems}
            renderItem={renderGalleryItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Container>

      {/* Simple full-screen image viewer */}
      {selectedImage && (
        <Pressable 
          style={styles.fullScreenOverlay}
          onPress={() => setSelectedImage(null)}
        >
          <Image
            src={selectedImage}
            style={styles.fullScreenImage}
            showLoading
          />
        </Pressable>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    marginBottom: 66, // Account for bottom navigation
  },
  galleryContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 20,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  galleryItem: {
    width: itemWidth,
  },
  galleryImage: {
    width: itemWidth,
    height: itemWidth * 0.75,
    marginBottom: 8,
  },
  imageTitle: {
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullScreenImage: {
    width: width - 40,
    height: (width - 40) * 0.75,
    maxHeight: '80%',
  },
});

export default GalleryScreen;