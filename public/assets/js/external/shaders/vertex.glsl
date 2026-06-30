attribute vec4 tangent;

varying vec3 vViewDirTangent;
varying vec2 vUv;

#ifdef USE_LOGDEPTHBUF
    varying float vFragDepth;
#endif

void main()
{
    vUv = uv;
    vec3 vNormal = normalMatrix * normal;
    vec3 vTangent = normalMatrix * tangent.xyz;
    vec3 vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

    mat3 mTBN = transpose(mat3(vTangent, vBitangent, vNormal));
    
    vec4 mvPos = modelViewMatrix * vec4( position, 1.0 );
    vec3 viewDir = -mvPos.xyz;
    vViewDirTangent = mTBN * viewDir;

    gl_Position = projectionMatrix * mvPos;

    #ifdef USE_LOGDEPTHBUF
        vFragDepth = 1.0 + gl_Position.w;
    #endif
}