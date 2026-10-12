import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';

export type BuddyMood = 'happy' | 'thinking' | 'alert' | 'celebrate' | 'detective';

interface ClayBuddyAvatarProps {
  mood?: BuddyMood;
  size?: number;
  speechText?: string;
  animate?: boolean;
  style?: ViewStyle;
}

export const ClayBuddyAvatar: React.FC<ClayBuddyAvatarProps> = ({
  mood = 'happy',
  size = 64,
  speechText,
  animate = true,
  style,
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animate]);

  const eyeScale = size / 64;

  const renderFace = () => {
    switch (mood) {
      case 'thinking':
        return (
          <View style={styles.faceContainer}>
            <View style={styles.eyesRow}>
              {/* Curious eyes looking up */}
              <View style={[styles.eye, { width: 10 * eyeScale, height: 10 * eyeScale }]}>
                <View style={[styles.pupil, { transform: [{ translateY: -2 }] }]} />
              </View>
              <View style={[styles.eye, { width: 10 * eyeScale, height: 10 * eyeScale }]}>
                <View style={[styles.pupil, { transform: [{ translateY: -2 }] }]} />
              </View>
            </View>
            <View style={[styles.mouthThinking, { width: 12 * eyeScale }]} />
            <View style={styles.blushRow}>
              <View style={[styles.blush, { width: 8 * eyeScale, height: 5 * eyeScale }]} />
              <View style={[styles.blush, { width: 8 * eyeScale, height: 5 * eyeScale }]} />
            </View>
          </View>
        );

      case 'alert':
        return (
          <View style={styles.faceContainer}>
            <View style={styles.eyesRow}>
              {/* Wide alarmed eyes */}
              <View style={[styles.eye, { width: 12 * eyeScale, height: 12 * eyeScale, backgroundColor: '#FFFFFF' }]}>
                <View style={[styles.pupil, { width: 5 * eyeScale, height: 5 * eyeScale }]} />
              </View>
              <View style={[styles.eye, { width: 12 * eyeScale, height: 12 * eyeScale, backgroundColor: '#FFFFFF' }]}>
                <View style={[styles.pupil, { width: 5 * eyeScale, height: 5 * eyeScale }]} />
              </View>
            </View>
            <View style={[styles.mouthAlert, { width: 8 * eyeScale, height: 8 * eyeScale }]} />
          </View>
        );

      case 'detective':
        return (
          <View style={styles.faceContainer}>
            <View style={styles.eyesRow}>
              {/* Monocle on one eye */}
              <View style={[styles.eye, styles.monocle, { width: 14 * eyeScale, height: 14 * eyeScale }]}>
                <View style={styles.pupil} />
              </View>
              <View style={[styles.eye, { width: 9 * eyeScale, height: 9 * eyeScale }]}>
                <View style={styles.pupil} />
              </View>
            </View>
            <View style={[styles.mouthSmile, { width: 14 * eyeScale, height: 7 * eyeScale }]} />
          </View>
        );

      case 'celebrate':
        return (
          <View style={styles.faceContainer}>
            <View style={styles.eyesRow}>
              {/* Happy squint eyes */}
              <Text style={{ fontSize: 13 * eyeScale, fontWeight: '900', color: '#1E1B4B' }}>^</Text>
              <Text style={{ fontSize: 13 * eyeScale, fontWeight: '900', color: '#1E1B4B' }}>^</Text>
            </View>
            <View style={[styles.mouthOpenHappy, { width: 14 * eyeScale, height: 9 * eyeScale }]} />
            <View style={styles.blushRow}>
              <View style={[styles.blush, { width: 9 * eyeScale, height: 5 * eyeScale }]} />
              <View style={[styles.blush, { width: 9 * eyeScale, height: 5 * eyeScale }]} />
            </View>
          </View>
        );

      case 'happy':
      default:
        return (
          <View style={styles.faceContainer}>
            <View style={styles.eyesRow}>
              <View style={[styles.eye, { width: 10 * eyeScale, height: 10 * eyeScale }]}>
                <View style={styles.pupil} />
                <View style={styles.eyeGleam} />
              </View>
              <View style={[styles.eye, { width: 10 * eyeScale, height: 10 * eyeScale }]}>
                <View style={styles.pupil} />
                <View style={styles.eyeGleam} />
              </View>
            </View>
            <View style={[styles.mouthSmile, { width: 14 * eyeScale, height: 7 * eyeScale }]} />
            <View style={styles.blushRow}>
              <View style={[styles.blush, { width: 8 * eyeScale, height: 5 * eyeScale }]} />
              <View style={[styles.blush, { width: 8 * eyeScale, height: 5 * eyeScale }]} />
            </View>
          </View>
        );
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {speechText && (
        <View style={[styles.speechBubble, ClayShadows.pill]}>
          <Text style={styles.speechText}>{speechText}</Text>
          <View style={styles.speechPointer} />
        </View>
      )}

      <Animated.View
        style={[
          styles.clayAvatarBody,
          ClayShadows.cardElevated,
          {
            width: size,
            height: size,
            borderRadius: size * 0.45,
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        {/* Soft 3D Clay Gloss Highlight */}
        <View
          style={[
            styles.avatarGloss,
            {
              width: size * 0.7,
              height: size * 0.28,
              borderRadius: size * 0.2,
            },
          ]}
        />

        {/* Antennas / Detective cap or badge */}
        <View style={styles.antenna}>
          <View style={styles.antennaStem} />
          <View style={styles.antennaBulb} />
        </View>

        {renderFace()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  clayAvatarBody: {
    backgroundColor: '#818CF8', // Gentle indigo clay body
    borderWidth: 2.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  avatarGloss: {
    position: 'absolute',
    top: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  antenna: {
    position: 'absolute',
    top: -12,
    alignItems: 'center',
  },
  antennaStem: {
    width: 2.5,
    height: 7,
    backgroundColor: '#6366F1',
  },
  antennaBulb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDE047',
    borderWidth: 1.5,
    borderColor: '#EAB308',
  },
  faceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  eyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '54%',
    alignItems: 'center',
    marginBottom: 4,
  },
  eye: {
    borderRadius: 10,
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pupil: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 2,
    right: 2,
  },
  eyeGleam: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    bottom: 2,
    left: 2,
  },
  monocle: {
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(254, 240, 138, 0.6)',
  },
  mouthSmile: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#1E1B4B',
    borderRadius: 10,
  },
  mouthThinking: {
    height: 2,
    backgroundColor: '#1E1B4B',
    borderRadius: 2,
  },
  mouthAlert: {
    borderRadius: 4,
    backgroundColor: '#1E1B4B',
  },
  mouthOpenHappy: {
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  blushRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    position: 'absolute',
    bottom: -2,
  },
  blush: {
    backgroundColor: 'rgba(244, 114, 182, 0.65)',
    borderRadius: 5,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.md,
    borderWidth: 1.5,
    borderColor: ClayColors.borderSubtle,
    marginBottom: 8,
    maxWidth: 220,
    position: 'relative',
  },
  speechText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textPrimary,
    textAlign: 'center',
  },
  speechPointer: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
});
