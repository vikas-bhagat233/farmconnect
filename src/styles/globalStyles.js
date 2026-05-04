import { StyleSheet, Platform } from 'react-native';
import { getTheme } from './themes';

export const createGlobalStyles = (isDark = false) => {
  const theme = getTheme(isDark);
  const { colors, spacing, borderRadius, elevation, shadow } = theme;
  
  return StyleSheet.create({
    // Containers
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    
    // Layout
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowAround: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    flex1: {
      flex: 1,
    },
    
    // Spacing
    p: {
      padding: spacing.base,
    },
    px: {
      paddingHorizontal: spacing.base,
    },
    py: {
      paddingVertical: spacing.base,
    },
    pt: {
      paddingTop: spacing.base,
    },
    pb: {
      paddingBottom: spacing.base,
    },
    pl: {
      paddingLeft: spacing.base,
    },
    pr: {
      paddingRight: spacing.base,
    },
    m: {
      margin: spacing.base,
    },
    mx: {
      marginHorizontal: spacing.base,
    },
    my: {
      marginVertical: spacing.base,
    },
    mt: {
      marginTop: spacing.base,
    },
    mb: {
      marginBottom: spacing.base,
    },
    ml: {
      marginLeft: spacing.base,
    },
    mr: {
      marginRight: spacing.base,
    },
    
    // Cards
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      marginVertical: spacing.sm,
      ...shadow.sm,
    },
    cardElevated: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      marginVertical: spacing.sm,
      ...shadow.md,
    },
    
    // Buttons
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.base,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      backgroundColor: colors.disabled,
      opacity: 0.7,
    },
    buttonText: {
      color: colors.text,
      fontSize: typography.fontSize.base,
      fontWeight: '600',
    },
    buttonOutlineText: {
      color: colors.primary,
      fontSize: typography.fontSize.base,
      fontWeight: '600',
    },
    
    // Inputs
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.fontSize.base,
      color: colors.text,
    },
    inputLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: colors.error,
      marginTop: spacing.xs,
    },
    
    // Text
    text: {
      fontSize: typography.fontSize.base,
      color: colors.text,
    },
    textPrimary: {
      color: colors.primary,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textHint: {
      color: colors.textHint,
    },
    textCenter: {
      textAlign: 'center',
    },
    textBold: {
      fontWeight: 'bold',
    },
    
    // Headings
    h1: {
      ...typography.h1,
      color: colors.text,
    },
    h2: {
      ...typography.h2,
      color: colors.text,
    },
    h3: {
      ...typography.h3,
      color: colors.text,
    },
    h4: {
      ...typography.h4,
      color: colors.text,
    },
    
    // Dividers
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.md,
    },
    dividerHorizontal: {
      width: 1,
      backgroundColor: colors.divider,
      marginHorizontal: spacing.md,
    },
    
    // Loading
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: spacing.md,
      color: colors.textSecondary,
    },
    
    // Empty States
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: spacing.md,
    },
    emptyText: {
      fontSize: typography.fontSize.lg,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    emptySubtext: {
      fontSize: typography.fontSize.sm,
      color: colors.textHint,
    },
    
    // Status Badges
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      alignSelf: 'flex-start',
    },
    badgePending: {
      backgroundColor: colors.status.pending + '20',
    },
    badgeActive: {
      backgroundColor: colors.status.active + '20',
    },
    badgeCompleted: {
      backgroundColor: colors.status.completed + '20',
    },
    badgeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
    },
    
    // Images
    image: {
      resizeMode: 'cover',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    
    // Scroll
    contentContainer: {
      paddingBottom: spacing.xl,
    },
    
    // Header
    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...shadow.sm,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      color: colors.text,
    },
    
    // Footer
    footer: {
      backgroundColor: colors.surface,
      padding: spacing.base,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
};

export const globalStyles = {
  // Common style objects that don't depend on theme
  shadow: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    heavy: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  // Flex helpers
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Text helpers
  textCenter: {
    textAlign: 'center',
  },
  textUppercase: {
    textTransform: 'uppercase',
  },
  textCapitalize: {
    textTransform: 'capitalize',
  },
  
  // Spacing helpers
  p0: { padding: 0 },
  m0: { margin: 0 },
  
  // Border helpers
  rounded: { borderRadius: 8 },
  roundedLg: { borderRadius: 12 },
  roundedXl: { borderRadius: 16 },
  roundedFull: { borderRadius: 9999 },
  
  // Background helpers
  bgTransparent: { backgroundColor: 'transparent' },
};