import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

// Modern hooks and helpers
import { useCollection } from '../hooks/useCollection';
import { useTranslation } from '../hooks/useTranslation';
import { getFullName, getDisplayName, getUserInitials, getFormattedLocation } from '../helpers/applicationUtils';
import { formatDate, formatDateShort } from '../helpers/dateUtils';
import { colors, spacing } from '../helpers/theme';
import { apiService } from '../helpers/request';
import { SecureStorage } from '../helpers/secureStorage';
import { Text } from '../components/Typography';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { LanguageSelector } from '../components/LanguageSelector';
import { RootStackParamList } from '../navigation/types';

// Type definitions
interface LeadDetails {
  name: string;
  date_of_birth?: string;
  phone_1?: string;
  phone_2?: string;
  telephone?: string;
}

interface User {
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  created_at: string;
  expo_token?: string;
  lead_details: LeadDetails;
}

interface Course {
  id: number;
  italian_name: string;
  start_date: string;
  end_date: string;
}

interface PackageDetails {
  id: number;
  italian_name: string;
  name: string;
}

interface Package {
  id: number;
  package_details: PackageDetails;
  courses_start_date: string;
  courses_end_date: string;
  courses: Course[];
}

// RootStackParamList is now imported from navigation/types

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState<User | null>(null);
  const { collection, updateCollection } = useCollection<Package>('me/packages');

  useEffect(() => {
    // Load profile data
    apiService.get('me')
      .then((response) => {
        console.log('User data', response.data.data.expo_token);
        setProfileData(response.data.data);

        if (!response.data.data.expo_token) {
          // TODO: Implement push token logic if needed
          console.log('No expo token found');
        }
      })
      .catch((error) => {
        console.error('Error loading profile:', error);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStorage.removeItem('userToken');
      await SecureStorage.removeItem('leadID');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Notification debug functionality removed from UI but kept for future use
  // const handleNotificationDebug = () => {
  //   navigation.navigate('NotificationDebug');
  // };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('mobile.titles.profile')}
        noShadow
        showNotification
        rightComponent={
          <View style={styles.headerRightSection}>
            <LanguageSelector 
              variant="button" 
              showLanguageName={false}
              style={styles.headerLanguageSelector}
            />
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.profileContainer}
      >
        {profileData && (
          <View style={styles.profileTopSection}>
            <View style={styles.profileMainSection}>
              <View style={styles.profilePic}>
                <View style={styles.profilePicPlaceholder}>
                  <Text style={styles.profileInitials}>
                    {profileData.lead_details.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                  </Text>
                </View>
              </View>
              <View style={styles.profileDetails}>
                <Text style={[styles.profileRow, styles.profileName]}>
                  {profileData.lead_details.name}
                </Text>
                <Text style={[styles.profileRow, styles.profileEmail]}>
                  {profileData.email}
                </Text>
                <View style={[styles.profileRow, styles.profileDOBContact]}>
                  <View style={styles.profileDOB}>
                    <Icon 
                      name="calendar" 
                      size={16} 
                      color={colors.primary} 
                      style={styles.topCalendarIcon}
                    />
                    <Text style={styles.profileDOBText}>
                      {profileData.lead_details.date_of_birth || '-'}
                    </Text>
                  </View>
                  <View style={[styles.profileDOB, { marginLeft: -70 }]}>
                    <Icon 
                      name="phone" 
                      size={16} 
                      color={colors.primary} 
                      style={styles.topPhoneIcon}
                    />
                    <Text style={styles.profileDOBText}>
                      {profileData.lead_details.phone_1 || 
                       profileData.lead_details.phone_2 || 
                       profileData.lead_details.telephone || '-'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        <View style={styles.packagesContainer}>
          {collection.loaded && collection.items.map((item: Package, index: number) => (
            <Package 
              key={item.id}
              data={item}
              navigation={navigation}
            />
          ))}
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};

// Helper Components
interface ButtonProps {
  text: string;
  onPress: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onPress }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={styles.btnPrimary}>
      <Text style={styles.btnText}>{text}</Text>
    </View>
  </TouchableWithoutFeedback>
);

interface CourseProps {
  number: number;
  data: Course;
}

const Course: React.FC<CourseProps> = ({ number, data }) => {
  const { t } = useTranslation();
  const currentDate = new Date();
  const courseStartDate = new Date(data.start_date);
  const courseEndDate = new Date(data.end_date);

  let courseStatus: string;
  if (currentDate < courseStartDate) {
    courseStatus = t('mobile.profile.upcoming');
  } else if (currentDate > courseEndDate) {
    courseStatus = t('mobile.profile.completed');
  } else {
    courseStatus = t('mobile.profile.ongoing');
  }

  return (
    <View style={styles.courseContainer}>
      <View style={styles.courseFirstRow}>
        <Text style={styles.courseNumber}>{t('mobile.profile.course')} {number}</Text>
        <Text style={styles.courseStatus}>{courseStatus}</Text>
      </View>
      <Text style={styles.courseName}>{data.italian_name}</Text>
      <View style={styles.courseSecondRow}>
        <DurationCard
          startDate={formatDateShort(data.start_date)}
          endDate={formatDateShort(data.end_date)}
        />
      </View>
    </View>
  );
};

interface PackageProps {
  data: Package;
  navigation: ProfileScreenNavigationProp;
}

const Package: React.FC<PackageProps> = ({ data, navigation }) => {
  const { t } = useTranslation();
  const currentDate = new Date();
  const packageStartDate = new Date(data.courses_start_date);
  const packageEndDate = new Date(data.courses_end_date);

  let packageStatus: string;
  if (currentDate < packageStartDate) {
    packageStatus = t('mobile.profile.upcoming');
  } else if (currentDate > packageEndDate) {
    packageStatus = t('mobile.profile.completed');
  } else {
    packageStatus = t('mobile.profile.ongoing');
  }

  return (
    <View style={styles.packageContainer}>
      <View style={styles.packageHeader}>
        <View style={styles.packageHeaderFirstRow}>
          <Text style={styles.packageName}>{data.package_details.italian_name}</Text>
          <Text style={styles.packageStatus}>{packageStatus}</Text>
        </View>
        <View style={styles.packageHeaderSecondRow}>
          <DurationCard
            startDate={formatDateShort(data.courses_start_date)}
            endDate={formatDateShort(data.courses_end_date)}
          />
        </View>
      </View>
      <View style={styles.coursesContainer}>
        {data.courses.map((item, index) => (
          <Course key={item.id} number={index + 1} data={item} />
        ))}
      </View>
      <View style={styles.packageFooter}>
        <Button
          text={t('mobile.profile.viewPaymentDetails')}
          onPress={() => {
            navigation.navigate('Payments', { data: {
              id: data.id,
              package_details: data.package_details,
              final_amount: 0, // This should be set from actual data
              payment_type: 'emi' as const,
              upfront_payments_details: [],
              installments_details: []
            }});
          }}
        />
      </View>
    </View>
  );
};

interface DurationCardProps {
  startDate: string;
  endDate: string;
}

const DurationCard: React.FC<DurationCardProps> = ({ startDate, endDate }) => (
  <View style={styles.durationCard}>
    <Icon 
      name="calendar" 
      size={14} 
      color={colors.textSecondary} 
      style={styles.durationIcon}
    />
    <Text style={styles.durationText}>
      {startDate} - {endDate}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    marginLeft: 16,
    marginRight: 16,
    fontSize: 14,
    height: 10,
    marginBottom: 66,
  },
  profileTopSection: {
    top: 16,
    paddingBottom: 10,
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  headerLanguageSelector: {
    marginRight: 5,
  },
  profileMainSection: {
    flexDirection: 'row',
    height: 80,
  },
  profilePic: {
    width: 80,
    height: 80,
  },
  profilePicPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3C4F4D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileDetails: {
    left: 24,
    flex: 1,
  },
  profileRow: {
    paddingTop: 8,
  },
  profileName: {
    fontWeight: '700',
    color: '#3C4F4D',
    fontSize: 18,
  },
  profileEmail: {
    color: '#7A9491',
  },
  profileDOBContact: {
    top: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  profileDOB: {
    flex: 1,
    flexDirection: 'row',
  },
  profileDOBText: {
    left: 8,
    fontSize: 12,
  },
  topCalendarIcon: {
    marginRight: 4,
  },
  topPhoneIcon: {
    marginRight: 4,
  },
  packagesContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  packageContainer: {
    flex: 1,
    marginTop: 30,
    padding: 17,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowRadius: 8,
    backgroundColor: '#fff',
    elevation: 8,
    borderLeftWidth: 0.19,
    borderRightWidth: 1,
    borderRadius: 5,
    borderColor: '#ddd',
  },
  packageHeader: {},
  packageHeaderFirstRow: {
    flexDirection: 'row',
  },
  packageHeaderSecondRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  packageName: {
    fontWeight: '500',
    fontSize: 18,
    color: '#3C4F4D',
    flex: 1,
  },
  packageStatus: {
    color: '#13CB73',
    fontSize: 12,
    fontWeight: '700',
    justifyContent: 'flex-end',
  },
  packageFooter: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnPrimary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0052CD',
    borderRadius: 5,
    color: '#0052CD',
  },
  btnText: {
    color: '#0052CD',
    fontWeight: '600',
    textAlign: 'center',
    padding: 8,
  },
  coursesContainer: {},
  courseContainer: {
    marginTop: 16,
  },
  courseFirstRow: {
    flexDirection: 'row',
  },
  courseSecondRow: {
    marginTop: 4,
    flexDirection: 'row',
  },
  courseNumber: {
    flex: 1,
    color: '#0052CD',
    fontWeight: '500',
  },
  courseName: {
    color: '#666',
    marginTop: 5,
    marginBottom: 2,
  },
  courseStatus: {
    color: '#13CB73',
    fontSize: 12,
    fontWeight: '700',
    justifyContent: 'flex-end',
  },
  durationCard: {
    flexDirection: 'row',
    borderRadius: 30,
    backgroundColor: '#eee',
    paddingLeft: 16,
    paddingRight: 16,
  },
  durationIcon: {
    marginTop: 2,
    marginRight: 4,
  },
  durationText: {
    color: '#777777',
    textAlign: 'center',
    paddingLeft: 5,
    paddingTop: 4,
    paddingBottom: 4,
  },
  debugButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProfileScreen;