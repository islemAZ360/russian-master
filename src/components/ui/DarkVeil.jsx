"use client";
import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';
import { useSettings } from '@/context/SettingsContext';

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    pointerEvents: 'none',
    overflow: 'hidden',
    backgroundColor: '#050505',
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

// دالة عشوائية محسنة
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// دالة ضجيج
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

#define OCTAVES 5

// FBM مع تقليل التردد لخلق ملمس دخاني دقيق
float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // تدوير لتقليل النمطية
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < OCTAVES; ++i) {
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
    // 1. حساب الإحداثيات الأساسية
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    
    // 2. تصحيح النسبة (Aspect Ratio) لمنع التمدد
    st.x *= uResolution.x / uResolution.y;
    
    // 3. التكبير الجذري (The Fix)
    // تغيير الرقم من 3.0 إلى 8.0 لتصغير الموجات بشكل كبير جداً
    st *= 8.0; 
    
    // حركة الكاميرا (أبطأ وأكثر تعقيداً)
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.01 * uTime);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime );
    r.y = fbm( st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

    float f = fbm(st + r);

    // الألوان
    float hue = uHueShift / 360.0;
    vec3 color = vec3(0.0);
    
    vec3 baseColor = hsv2rgb(vec3(hue, 0.9, 0.5)); // لون أغمق قليلاً
    vec3 secColor = hsv2rgb(vec3(fract(hue + 0.4), 0.8, 0.4));

    // خلط الألوان لإنتاج تأثير "النيون المظلم"
    color = mix(vec3(0.02, 0.02, 0.05), // خلفية سوداء تقريباً
                baseColor,
                clamp((f*f)*4.0, 0.0, 1.0));

    color = mix(color,
                secColor,
                clamp(length(q), 0.0, 1.0));

    color = mix(color,
                vec3(0.1, 0.1, 0.1),
                clamp(length(r.x), 0.0, 1.0));

    // إضافة Vignette (تعتيم الأطراف) لإخفاء أي عيوب في الحواف
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = pow(vignette, 0.2); // قوة التعتيم
    color *= vignette;

    if (uIsLight > 0.5) {
        color = 1.0 - color;
        color = mix(color, vec3(0.95), 0.3);
    } 

    gl_FragColor = vec4(color, 1.0);
}
`;

export default function DarkVeil({
  hueShift = 220,
  speed = 0.2
}) {
  const containerRef = useRef(null);
  const { isDark } = useSettings();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // تنظيف أي canvas قديم فوراً
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const renderer = new Renderer({
      alpha: false,
      dpr: Math.min(window.devicePixelRatio, 1.5), 
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 1);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(gl.drawingBufferWidth, gl.drawingBufferHeight) },
        uHueShift: { value: hueShift },
        uIsLight: { value: isDark ? 0.0 : 1.0 }
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // تحديث الحجم بدقة
        if (width > 0 && height > 0) {
            renderer.setSize(width, height);
            program.uniforms.uResolution.value.set(gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
      }
    });

    resizeObserver.observe(container);

    let animationId;
    const start = performance.now();

    const update = () => {
      animationId = requestAnimationFrame(update);
      const time = (performance.now() - start) * 0.0002 * speed; // إبطاء الحركة أكثر
      program.uniforms.uTime.value = time;
      program.uniforms.uHueShift.value = hueShift;
      program.uniforms.uIsLight.value = isDark ? 0.0 : 1.0;

      renderer.render({ scene: mesh });
    };

    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      // تنظيف WebGL Context
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [hueShift, speed, isDark]);

  return <div ref={containerRef} style={styles.container} />;
}