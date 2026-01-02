import React, { useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  View,
} from "react-native";

import {
  PanGestureHandler,
  PinchGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";

const SCREEN = Dimensions.get("window");

type Props = {
  uri: string;
  onClose: () => void;
};

export default function FullscreenZoomViewer({ uri, onClose }: Props) {
  /* -------------------------------------------------------
     SHARED VALUES
  ------------------------------------------------------- */
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const showBackButton = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);

  const MAX_SCALE = 4;

  /* -------------------------------------------------------
     DOUBLE TAP EXIT
  ------------------------------------------------------- */
  const onDoubleTap = () => {
    runOnJS(onClose)();
  };

  /* -------------------------------------------------------
     PINCH ZOOM + PINCH-TO-CLOSE
  ------------------------------------------------------- */
  const onPinch = (event: any) => {
    const s = event.nativeEvent.scale;
    scale.value = Math.min(Math.max(s, 0.5), MAX_SCALE);

    if (s > 1.05) {
      showBackButton.value = withTiming(1);
    }
  };

  const onPinchEnd = () => {
    if (scale.value < 0.8) {
      runOnJS(onClose)();
      return;
    }

    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  /* -------------------------------------------------------
     PAN — SWIPE DOWN TO CLOSE OR MOVE WHEN ZOOMED
  ------------------------------------------------------- */
  const onPan = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;

    if (scale.value > 1) {
      translateX.value = translationX;
      translateY.value = translationY;
      showBackButton.value = withTiming(1);
    } else {
      backdropOpacity.value = interpolate(
        translationY,
        [0, 300],
        [1, 0.2],
        Extrapolate.CLAMP
      );

      translateY.value = translationY;
    }
  };

  const onPanEnd = (event: any) => {
    const velocityY = event.nativeEvent.velocityY;

    if (scale.value <= 1) {
      if (velocityY > 800 || translateY.value > 220) {
        runOnJS(onClose)();
        return;
      }

      translateY.value = withSpring(0);
      backdropOpacity.value = withTiming(1);
    }
  };

  /* -------------------------------------------------------
     ANIMATED STYLES
  ------------------------------------------------------- */
  const backBtnStyle = useAnimatedStyle(() => ({
    opacity: showBackButton.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  /* -------------------------------------------------------
     RESET ON UNMOUNT
  ------------------------------------------------------- */
  useEffect(() => {
    return () => {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    };
  }, [scale, translateX, translateY]);

  /* -------------------------------------------------------
     RENDER (NO FRAGMENTS — WEB SAFE)
  ------------------------------------------------------- */
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* BACKDROP */}
      <Animated.View style={[styles.backdrop, backdropStyle]} />

      {/* BACK BUTTON */}
      <Animated.View style={[styles.backBtnWrapper, backBtnStyle]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* GESTURES */}
      <TapGestureHandler numberOfTaps={2} onActivated={onDoubleTap}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <TapGestureHandler>
            <Animated.View style={StyleSheet.absoluteFill}>
              <PinchGestureHandler
                onGestureEvent={onPinch}
                onEnded={onPinchEnd}
              >
                <Animated.View style={StyleSheet.absoluteFill}>
                  <PanGestureHandler onGestureEvent={onPan} onEnded={onPanEnd}>
                    <Animated.View style={styles.imageWrapper}>
                      <Animated.Image
                        source={{ uri }}
                        style={[styles.image, imageStyle]}
                        resizeMode="contain"
                      />
                    </Animated.View>
                  </PanGestureHandler>
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
}

/* -------------------------------------------------------
   STYLES
------------------------------------------------------- */
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    zIndex: 1,
  },

  imageWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN.width,
    height: SCREEN.height,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  image: {
    width: SCREEN.width,
    height: SCREEN.height,
  },

  backBtnWrapper: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 50,
  },

  backBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  backBtnText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
});
