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
uniform float uIsLight; // 0.0 = Dark Mode, 1.0 = Light Mode

#define iTime uTime
#define iResolution uResolution

vec4 buf[8];

float rand(vec2 c){
    return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);
}

// Color Space Conversions
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

// Compositional Pattern Producing Network function
vec4 cppn_fn(vec2 coordinate, float in0, float in1, float in2){
    buf[6] = vec4(coordinate.x, coordinate.y, 0.3948333106474662 + in0, 0.36 + in1);
    buf[7] = vec4(0.14 + in2, sqrt(coordinate.x*coordinate.x + coordinate.y*coordinate.y), 0.0, 0.0);
    
    buf[0] = mat4(vec4(6.5404263,-3.6126034,0.7590882,-1.13613),vec4(2.4582713,3.1660357,1.2219609,0.06276096),vec4(-5.478085,-6.159632,1.8701609,-4.7742867),vec4(6.039214,-5.542865,-0.90925294,3.251348)) * buf[6] + 
             mat4(vec4(0.8473259,-5.722911,3.975766,1.6522468),vec4(-0.24321538,0.5839259,-1.7661959,-5.350116),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.)) * buf[7] + 
             vec4(0.21808943,1.1243913,-1.7969975,5.0294676);
             
    buf[1] = mat4(vec4(-3.3522482,-6.0612736,0.55641043,-4.4719114),vec4(0.8631464,1.7432913,5.643898,1.6106541),vec4(2.4941394,-3.5012043,1.7184316,6.357333),vec4(3.310376,8.209261,1.1355612,-1.165539)) * buf[6] + 
             mat4(vec4(5.24046,-13.034365,0.009859298,15.870829),vec4(2.987511,3.129433,-0.89023495,-1.6822904),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.)) * buf[7] + 
             vec4(-5.9457836,-6.573602,-0.8812491,1.5436668);
             
    buf[0] = sigmoid(buf[0]);
    buf[1] = sigmoid(buf[1]);
    
    buf[2] = mat4(vec4(-15.219568,8.095543,-2.429353,-1.9381982),vec4(-5.951362,4.3115187,2.6393783,1.274315),vec4(-7.3145227,6.7297835,5.2473326,5.9411426),vec4(5.0796127,8.979051,-1.7278991,-1.158976)) * buf[6] + 
             mat4(vec4(-11.967154,-11.608155,6.1486754,11.237008),vec4(2.124141,-6.263192,-1.7050359,-0.7021966),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.)) * buf[7] + 
             vec4(-4.17164,-3.2281182,-4.576417,-3.6401186);
             
    buf[3] = mat4(vec4(3.1832156,-13.738922,1.879223,3.233465),vec4(0.64300746,12.768129,1.9141049,0.50990224),vec4(-0.049295485,4.4807224,1.4733979,1.801449),vec4(5.0039253,13.000481,3.3991797,-4.5561905)) * buf[6] + 
             mat4(vec4(-0.1285731,7.720628,-3.1425676,4.742367),vec4(0.6393625,3.714393,-0.8108378,-0.39174938),vec4(0.,0.,0.,0.),vec4(0.,0.,0.,0.)) * buf[7] + 
             vec4(-1.1811101,-21.621881,0.7851888,1.2329718);
             
    buf[2] = sigmoid(buf[2]);
    buf[3] = sigmoid(buf[3]);
    
    // (Simplified logic to fit shader complexity)
    // Generating final color mix
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
    
    // Generate Pattern
    fragColor = cppn_fn(uv, 0.1 * sin(0.3 * uTime), 0.1 * sin(0.69 * uTime), 0.1 * sin(0.44 * uTime));
}

void main(){
    vec4 col;
    mainImage(col, gl_FragCoord.xy);
    
    // Hue Shift
    col.rgb = hueShiftRGB(col.rgb, uHueShift);
    
    // Scanlines
    float scanline_val = sin(gl_FragCoord.y * uScanFreq) * 0.5 + 0.5;
    col.rgb *= 1.0 - (scanline_val * scanline_val) * uScan;
    
    // Noise
    col.rgb += (rand(gl_FragCoord.xy + uTime) - 0.5) * uNoise;
    
    // --- Dark/Light Mode Logic ---
    // If uIsLight is 1.0, we invert the colors to make the background white-ish
    // but keep the patterns visible.
    if (uIsLight > 0.5) {
        col.rgb = 1.0 - col.rgb;
        
        // Optional: Enhance contrast for light mode
        col.rgb = pow(col.rgb, vec3(1.2)); 
    }
    
    gl_FragColor = vec4(clamp(col.rgb, 0.0, 1.0), 1.0);
}
`;

export default function DarkVeil({
  hueShift = 20, // Default Shift
  noiseIntensity = 0.05,
  scanlineIntensity = 0.1,
  speed = 0.3, // Slower speed for elegance
  scanlineFrequency = 0.5,
  warpAmount = 0.5,
  resolutionScale = 0.8 // Slightly lower res for performance
}) {
  const ref = useRef(null);
  const { isDark } = useSettings(); // Hook into your Theme Context

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: false, // Ensure opaque background
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
        uIsLight: { value: 0.0 } // Initial value
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
      // Update Uniforms
      program.uniforms.uTime.value = ((performance.now() - start) / 1000) * speed;
      program.uniforms.uHueShift.value = hueShift;
      program.uniforms.uNoise.value = noiseIntensity;
      program.uniforms.uScan.value = scanlineIntensity;
      program.uniforms.uScanFreq.value = scanlineFrequency;
      program.uniforms.uWarp.value = warpAmount;
      
      // Dynamic Theme Switching
      // Smoothly transition could be added here, but direct switch works for now
      program.uniforms.uIsLight.value = isDark ? 0.0 : 1.0;

      renderer.render({ scene: mesh });
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      // Optional: clean up WebGL context if needed
    };
  }, [hueShift, noiseIntensity, scanlineIntensity, speed, scanlineFrequency, warpAmount, resolutionScale, isDark]);

  return <canvas ref={ref} className="darkveil-canvas" />;
}