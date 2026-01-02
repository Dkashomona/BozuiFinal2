import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";

import FullscreenZoomViewer from "./FullscreenZoomViewer";

type Props = {
  images: string[];
  colorImages?: Record<string, string[]>;
  selectedColor?: string | null;
};

export default function ProductGalleryPremium({
  images,
  colorImages,
  selectedColor,
}: Props) {
  const list = useMemo(() => {
    if (selectedColor && colorImages?.[selectedColor]) {
      return colorImages[selectedColor];
    }
    return images;
  }, [images, colorImages, selectedColor]);

  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [hovering, setHovering] = useState(false);

  const smoothX = useRef(new Animated.Value(0)).current;
  const smoothY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const MAIN_SIZE = 420;
  const LENS_SIZE = 120;

  const changeImage = (i: number) => {
    if (i === active) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setActive(i);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleMouseMove = (e: any) => {
    if (Platform.OS !== "web") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    Animated.spring(smoothX, {
      toValue: Math.max(0, Math.min(1, x)),
      useNativeDriver: true,
      damping: 20,
      stiffness: 140,
    }).start();

    Animated.spring(smoothY, {
      toValue: Math.max(0, Math.min(1, y)),
      useNativeDriver: true,
      damping: 20,
      stiffness: 140,
    }).start();
  };

  const showDots = list.length > 1;

  if (!list.length) return null;

  return (
    <>
      <View style={styles.webWrapper}>
        <View style={styles.leftColumn}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setFullscreen(true)}
          >
            <View
              style={styles.mainImageContainer}
              {...(Platform.OS === "web"
                ? {
                    onMouseEnter: () => setHovering(true),
                    onMouseLeave: () => setHovering(false),
                    onMouseMove: handleMouseMove,
                  }
                : {})}
            >
              <Animated.Image
                source={{ uri: list[active] }}
                style={[styles.mainImage, { opacity: fadeAnim }]}
                resizeMode="contain"
              />

              {Platform.OS === "web" && hovering && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.lens,
                    {
                      transform: [
                        {
                          translateX: Animated.multiply(
                            smoothX,
                            MAIN_SIZE - LENS_SIZE
                          ),
                        },
                        {
                          translateY: Animated.multiply(
                            smoothY,
                            MAIN_SIZE - LENS_SIZE
                          ),
                        },
                      ],
                    },
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {Platform.OS === "web" && hovering && (
          <View style={styles.rightColumn}>
            <View style={styles.zoomPanel}>
              <Animated.Image
                source={{ uri: list[active] }}
                style={{
                  width: 1000,
                  height: 1000,
                  transform: [
                    { translateX: Animated.multiply(smoothX, -580) },
                    { translateY: Animated.multiply(smoothY, -580) },
                  ],
                }}
                resizeMode="cover"
              />
            </View>
          </View>
        )}
      </View>

      {showDots && (
        <View style={styles.dotsRow}>
          {list.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, active === i && styles.dotActive]}
            />
          ))}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbRow}
      >
        {list.map((img, i) => (
          <TouchableOpacity key={i} onPress={() => changeImage(i)}>
            <Image
              source={{ uri: img }}
              style={[styles.thumb, active === i && styles.activeThumb]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {fullscreen && Platform.OS !== "web" && (
        <FullscreenZoomViewer
          uri={list[active]}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "center",
    width: "100%",
  },

  leftColumn: {
    width: Platform.OS === "web" ? 420 : "100%",
    alignItems: "center",
  },

  rightColumn: {
    flex: 1,
    paddingLeft: 32,
  },

  mainImageContainer: {
    width: Platform.OS === "web" ? 420 : "100%",
    height: Platform.OS === "web" ? 420 : 360,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    overflow: "hidden",
  },

  mainImage: {
    width: "92%",
    aspectRatio: 1,
  },

  lens: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(230,126,34,0.9)",
    backgroundColor: "rgba(230,126,34,0.18)",
  },

  zoomPanel: {
    width: "100%",
    height: 420,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    pointerEvents: "none",
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginHorizontal: 4,
  },

  dotActive: {
    backgroundColor: "#e67e22",
    width: 10,
    height: 10,
  },

  thumbRow: {
    marginTop: 12,
    paddingBottom: 6,
  },

  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 10,
    opacity: 0.85,
  },

  activeThumb: {
    borderWidth: 3,
    borderColor: "#e67e22",
    opacity: 1,
  },
});
