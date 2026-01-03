"use client";
import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';
import { useSettings } from '@/context/SettingsContext';
import './DarkVeil.css';

const vertex = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;
// متغير للتحقق من الوضع (0 = ليلي، 1 = نهاري)
uniform float uIsLight; 

#define iTime uTime
#define iResolution uResolution

vec4 buf[8];

float rand(vec2 c){
    return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);
}

mat3 rgb2yiq = mat3(0.299, 0.587, 0.114, 0.596, -0.274, -0.322, 0.211, -0.523, 0.312);
mat3 yiq2rgb = mat3(1.0, 0.956, 0.621, 1.0, -0.272, -0.647, 1.0, -1.106, 1.703);

vec3 hueShiftRGB(vec3 col, float deg){
    vec3 yiq = rgb2yiq * col;
    float rad = radians(deg);
    float cosh = cos(rad);
    float sinh = sin(rad);
    vec3 yiqShift = vec3(yiq.x, yiq.y*cosh - yiq.z*sinh, yiq.y*sinh + yiq.z*cosh);
    return clamp(yiq2rgb * yiqShift, 0.0, 1.0);
}

vec4 sigmoid(vec4 x){
    return 1.0 / (1.0 + exp(-x));
}

vec4 cppn_fn(vec2 coordinate, float in0, float in1, float in2){
    buf[6] = vec4(coordinate.x, coordinate.y, 0.3948333106474662 + in0, 0.36 + in1);
    // التصحيح الرياضي: إضافة علامة الضرب *
    buf[7] = vec4(0.14 + in2, sqrt(coordinate.x * coordinate.x + coordinate.y * coordinate.y), 0.0, 0.0);
    
    buf[0] = mat4(vec4(6.5404263,-3.6126034,0.7590882,-1.13613),vec4(2.4582713,3.1660357,1.2219609,0.06276096),vec4(-5.478085,-6.159632,1.8701609,-4.7742867),vec4(6.039214,-5.542865,-0.90925294,3.251348)) * buf[6] + 
             mat4(vec4(0.8473259,-5.722911,3.975766,1.6522468),vec4(-0.24321538,0.5839259,-1.7661959,-5.350116),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.)) * buf[7] + 
             vec4(0.21808943,1.1243913,-1.7969975,5.0294676);
             
    buf[1] = mat4(vec4(-3.3522482,-6.0612736,0.55641043,-4.4719114),vec4(0.8631464,1.7432913,5.643898,1.6106541),vec4(2.4941394,-3.5012043,1.7184316,6.357333),vec4(3.310376,8.209261,1.1355612,-1.165539)) * buf[6] + 
             mat4(vec4(5.24046,-13.034365,0.009859298,15.870829),vec4(2.987511,3.129433,-0.89023495,-1.6822904),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.)) * buf[7] + 
             vec4(-5.9457836,-6.573602,-0.8812491,1.5436668);
             
    buf[0] = sigmoid(buf[0]);
    buf[1] = sigmoid(buf[1]);
    
    // معادلة مبسطة لضمان الأداء
    buf[4] = mat4(vec4(5.2,-7.1,2.7,2.6), vec4(-5.6,-25.3,4.0,0.4), vec4(-10.5,24.2,21.1,37.5), vec4(4.3,-1.9,2.3,-1.3)) * buf[0] + 
             vec4(-7.6, 15.9, 1.3, -1.6);
             
    buf[4] = sigmoid(buf[4]);
    
    return vec4(buf[4].x, buf[4].y, buf[4].z, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = fragCoord / uResolution.xy * 2.0 - 1.0;
    uv.y *= -1.0;
    
    // Warp effect
    uv += uWarp * vec2(sin(uv.y * 6.283 + uTime * 0.5), cos(uv.x * 6.283 + uTime * 0.5)) * 0.05;
    
    fragColor = cppn_fn(uv, 0.1 * sin(0.3 * uTime), 0.1 * sin(0.69 * uTime), 0.1 * sin(0.44 * uTime));
}

void main(){
    vec4 col;
    mainImage(col, gl_FragCoord.xy);
    
    // تطبيق التأثيرات
    col.rgb = hueShiftRGB(col.rgb, uHueShift);
    
    float scanline_val = sin(gl_FragCoord.y * uScanFreq) * 0.5 + 0.5;
    col.rgb *= 1.0 - (scanline_val * scanline_val) * uScan;
    
    col.rgb += (rand(gl_FragCoord.xy + uTime) - 0.5) * uNoise;
    
    // === المنطق السحري للوضع النهاري ===
    // إذا كان الوضع نهاري، نقلب الألوان ليصبح الأساس أبيض
    if (uIsLight > 0.5) {
        col.rgb = 1.0 - col.rgb; 
    }
    
    gl_FragColor = vec4(clamp(col.rgb, 0.0, 1.0), 1.0);
}
`;

export default function DarkVeil({
  hueShift = 20,
  noiseIntensity = 0.05,
  scanlineIntensity = 0.1,
  speed = 0.3,
  scanlineFrequency = 0.5,
  warpAmount = 0.5,
  resolutionScale = 0.8
}) {
  const ref = useRef(null);
  const { isDark } = useSettings(); // استدعاء حالة الثيم

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: false, 
      canvas
    });

    const gl = renderer.gl;
    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uHueShift: { value: hueShift },
        uNoise: { value: noiseIntensity },
        uScan: { value: scanlineIntensity },
        uScanFreq: { value: scanlineFrequency },
        uWarp: { value: warpAmount },
        // تمرير حالة الثيم للشيدر (0 لليلي، 1 للنهاري)
        uIsLight: { value: isDark ? 0.0 : 1.0 } 
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w * resolutionScale, h * resolutionScale);
      program.uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener('resize', resize);
    resize();

    let animationId;
    const start = performance.now();

    const loop = () => {
      program.uniforms.uTime.value = ((performance.now() - start) / 1000) * speed;
      program.uniforms.uHueShift.value = hueShift;
      program.uniforms.uNoise.value = noiseIntensity;
      program.uniforms.uScan.value = scanlineIntensity;
      program.uniforms.uScanFreq.value = scanlineFrequency;
      program.uniforms.uWarp.value = warpAmount;
      
      // تحديث القيمة ديناميكياً عند تغيير الثيم
      program.uniforms.uIsLight.value = isDark ? 0.0 : 1.0;

      renderer.render({ scene: mesh });
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [hueShift, noiseIntensity, scanlineIntensity, speed, scanlineFrequency, warpAmount, resolutionScale, isDark]);

  return (
    <div className="darkveil-container">
        <canvas ref={ref} className="darkveil-canvas" />
    </div>
  );
}