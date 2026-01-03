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
    backgroundColor: '#050505',
  },
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

// دالة عشوائية عالية التردد (للتفاصيل الدقيقة)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// دالة ضجيج ناعمة
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// FBM مع تفاصيل دقيقة جداً
#define OCTAVES 4
float fbm(vec2 st) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < OCTAVES; ++i) {
        v += a * noise(st);
        st = rot * st * 2.0 + 100.0; // مضاعفة التردد في كل طبقة
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
    // 1. تصحيح الأبعاد
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    uv.x *= uResolution.x / uResolution.y;

    // 2. الحل الجذري: تكبير هائل (Zoom Out)
    // كلما زاد هذا الرقم، صغرت التفاصيل. كان 3، الآن 15.
    uv *= 15.0; 

    // حركة بطيئة جداً وانسيابية
    float time = uTime * 0.1;
    
    // إنشاء طبقتين من الحركة المتداخلة
    vec2 q = vec2(0.);
    q.x = fbm(uv + 0.00 * time);
    q.y = fbm(uv + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * time);
    r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * time);

    float f = fbm(uv + r);

    // الألوان
    float hue = uHueShift / 360.0;
    
    // تلوين التفاصيل الدقيقة
    vec3 color = mix(
        vec3(0.02, 0.02, 0.05), // الخلفية الداكنة
        hsv2rgb(vec3(hue, 0.8, 0.8)), // لون السديم
        clamp(f * f * 2.0, 0.0, 1.0)
    );

    // إضافة "نجوم" أو ضجيج دقيق جداً لكسر التموج
    float star = random(uv * 5.0); // نجوم صغيرة
    if (star > 0.98) {
        color += vec3(star * 0.5); // لمعان النجوم
    }

    // الوضع النهاري
    if (uIsLight > 0.5) {
        color = 1.0 - color; // عكس الألوان
        color = mix(color, vec3(0.95, 0.95, 0.98), 0.5); // تفتيح
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

    // تنظيف الحاوية بالكامل قبل البدء
    container.innerHTML = '';

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
      const time = (performance.now() - start) * 0.001 * speed;
      program.uniforms.uTime.value = time;
      program.uniforms.uHueShift.value = hueShift;
      program.uniforms.uIsLight.value = isDark ? 0.0 : 1.0;
      renderer.render({ scene: mesh });
    };

    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      // تنظيف آمن
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      if (container && container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [hueShift, speed, isDark]);

  return <div ref={containerRef} style={styles.container} />;
}