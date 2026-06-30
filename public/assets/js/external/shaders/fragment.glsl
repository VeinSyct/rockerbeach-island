varying vec3 vViewDirTangent;
varying vec2 vUv;

uniform samplerCube cubeMap;
uniform float fov;
uniform float exposure;   // multiplicative
uniform float lighten;    // additive

#ifdef USE_LOGDEPTHBUF
    varying float vFragDepth;
    uniform float logDepthBufFC;
#endif

float min3 (vec3 v) {
  return min(min(v.x, v.y), v.z);
}

void main()
{
    vec2 uv = fract(vUv);
    vec3 sampleDir = normalize(vViewDirTangent);

    sampleDir.x *= fov; // sampleDir.xy *= fov;
    sampleDir = normalize(sampleDir);

    sampleDir *= vec3(-1, -1, 1);
    vec3 viewInv = 1. / sampleDir;

    vec3 pos = vec3(uv * 2.0 - 1.0, -1.0);
    
    float fmin = min3(abs(viewInv) - viewInv * pos);
    sampleDir = sampleDir * fmin + pos;

    vec4 color = texture(cubeMap, sampleDir);

    // 🔥 Exposure (multiply) + Lighten (add)
    color.rgb = color.rgb * exposure + lighten;

    #ifdef USE_LOGDEPTHBUF
        gl_FragDepth = log2(vFragDepth) * logDepthBufFC * 0.5;
    #endif

    gl_FragColor = color;
}