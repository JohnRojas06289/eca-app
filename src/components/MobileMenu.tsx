import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/hooks/useAuth';
import { theme } from '@/src/theme/theme';

interface NavLink {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface MobileMenuProps {
  links: NavLink[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  return (
    <>
      {/* Botón hamburguesa flotante */}
      <TouchableOpacity
        style={[styles.hamburgerBtn, { top: insets.top + 10 }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="menu" size={22} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      {/* Drawer */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          {/* Backdrop — toca para cerrar */}
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

          {/* Panel lateral */}
          <View style={styles.drawer}>
            <SafeAreaView style={styles.drawerInner} edges={['top', 'bottom']}>

              {/* Cabecera del drawer */}
              <View style={styles.drawerHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {firstName[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.name ?? 'Usuario'}
                  </Text>
                  <Text style={styles.userRole}>Reciclador</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Links de navegación */}
              <View style={styles.navLinks}>
                {links.map((link) => (
                  <TouchableOpacity
                    key={link.route}
                    style={styles.navRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setOpen(false);
                      router.push(link.route as any);
                    }}
                  >
                    <View style={styles.navIcon}>
                      <Ionicons name={link.icon} size={20} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.navLabel}>{link.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cerrar sesión */}
              <View style={styles.footer}>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.signOutRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setOpen(false);
                    signOut();
                  }}
                >
                  <View style={[styles.navIcon, styles.signOutIcon]}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                  </View>
                  <Text style={styles.signOutLabel}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>

            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const DRAWER_WIDTH = 280;

const styles = StyleSheet.create({
  hamburgerBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 100,
    width: 38,
    height: 38,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },

  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: theme.colors.background,
    ...theme.shadows.lg,
  },
  drawerInner: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },

  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  userRole: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.separator,
  },

  navLinks: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.lg,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },

  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.lg,
  },
  signOutIcon: {
    backgroundColor: theme.colors.errorLight,
  },
  signOutLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.error,
  },
});
