"use client";
import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';
import { useSettings } from '@/context/SettingsContext';

// نضع الـ CSS مباشرة هنا لضمان عدم حدوث مشاكل في الاستيراد
const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1, // تأكيد أن الخلفية وراء كل العناصر
    pointerEvents: 'none',
    overflow: 'hidden',
    backgroundColor: '#050505', // لون احتياطي
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
  }
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uHueShift;
uniform float uIsLight;

// دالة ضجيج بسيطة وسريعة
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// دالة ضجيج ثنائية الأبعاد
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

// ضجيج كسري (FBM) لإعطاء ملمس الغيوم/الدخان
float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // تدوير لتقليل التكرار
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    // توحيد الإحداثيات وحل مشكلة التموج العملاق
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.x *= uResolution.x / uResolution.y; // تصحيح النسبة
    
    // تحريك الكاميرا
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.05 * uTime);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime );
    r.y = fbm( st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

    float f = fbm(st + r);

    // الألوان بناءً على الضجيج
    vec3 color = vec3(0.0);
    
    // خلط الألوان لإنتاج تأثير النيون الغامض
    // اللون الأساسي يتغير مع HueShift
    float hue = uHueShift / 360.0;
    
    // تكوين اللون
    vec3 baseColor = hsv2rgb(vec3(hue, 0.8, 0.8));
    vec3 secondaryColor = hsv2rgb(vec3(fract(hue + 0.4), 0.8, 0.6));
    
    color = mix(vec3(0.1, 0.1, 0.16), // خلفية داكنة جداً
                baseColor,
                clamp((f*f)*4.0, 0.0, 1.0));

    color = mix(color,
                secondaryColor,
                clamp(length(q), 0.0, 1.0));

    color = mix(color,
                vec3(0.9, 0.9, 0.9), // وميض أبيض خفيف
                clamp(length(r.x), 0.0, 1.0));

    // معالجة الوضع النهاري/الليلي
    if (uIsLight > 0.5) {
        // في النهار: نعكس الألوان ونخفف التشبع
        color = 1.0 - color;
        color = mix(color, vec3(0.95, 0.95, 0.98), 0.3);
    } else {
        // في الليل: نزيد التباين والظلام
        color *= f * 1.8; 
        color *= 0.8; // تعتيم عام
    }

    gl_FragColor = vec4(color, 1.0);
}
`;

export default function DarkVeil({
  hueShift = 220, // أزرق/بنفسجي افتراضي
  speed = 0.2
}) {
  const containerRef = useRef(null);
  const { isDark } = useSettings();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // إعداد الـ Renderer
    const renderer = new Renderer({
      alpha: false,
      dpr: Math.min(window.devicePixelRatio, 2), // تحسين الأداء
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const gl = renderer.gl;
    // إضافة الكانفاس للـ DOM
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 1);

    // إعداد الهندسة (مربع يغطي الشاشة)
    const geometry = new Triangle(gl);

    // إعداد البرنامج (Shader)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
        uHueShift: { value: hueShift },
        uIsLight: { value: isDark ? 0.0 : 1.0 }
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    // دالة تغيير الحجم باستخدام ResizeObserver (أكثر دقة من window resize)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // تحديث حجم الـ Canvas الداخلي
        renderer.setSize(width, height);
        // تحديث متغير الدقة في الشيدر لإصلاح التمدد والقص
        program.uniforms.uResolution.value.set(gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
    });

    resizeObserver.observe(container);

    let animationId;
    const start = performance.now();

    const update = () => {
      animationId = requestAnimationFrame(update);
      
      const time = (performance.now() - start) * 0.001 * speed;
      program.uniforms.uTime.value = time;
      program.uniforms.uHueShift.value = hueShift;
      program.uniforms.uIsLight.value = isDark ? 0.0 : 1.0;

      renderer.render({ scene: mesh });
    };

    animationId = requestAnimationFrame(update);

    // التنظيف عند الخروج
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      // محاولة تنظيف آمنة
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      // لا نستدعي loseContext يدوياً هنا لتجنب خطأ forEach، نترك المتصفح يدير الذاكرة
    };
  }, [hueShift, speed, isDark]); // إعادة التشغيل فقط عند تغيير هذه القيم

  return <div ref={containerRef} style={styles.container} />;
}