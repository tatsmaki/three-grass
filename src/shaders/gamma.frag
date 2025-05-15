uniform sampler2D tDiffuse;
varying vec2 vUv;

#define saturate(a) clamp( a, 0.0, 1.0 )

float inverseLerp(float minValue, float maxValue, float v) {
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
float t = inverseLerp(inMin, inMax, v);
    return mix(outMin, outMax, t);
}

uniform float exposure;

vec3 RRTAndODTFit( vec3 v ) {

    vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
    vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
    return a / b;

}

vec3 ACESFilmicToneMapping( vec3 color ) {

// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
    const mat3 ACESInputMat = mat3(
        vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
        vec3( 0.35458, 0.90834, 0.13383 ),
        vec3( 0.04823, 0.01566, 0.83777 )
    );

// ODT_SAT => XYZ => D60_2_D65 => sRGB
    const mat3 ACESOutputMat = mat3(
        vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
        vec3( -0.53108,  1.10813, -0.07276 ),
        vec3( -0.07367, -0.00605,  1.07602 )
    );

    color = ACESInputMat * color;

// Apply RRT and ODT
    color = RRTAndODTFit( color );

    color = ACESOutputMat * color;

// Clamp to [0, 1]
    return saturate( color );

}

vec3 vignette(vec2 uvs) {
    float v1 = smoothstep(0.5, 0.3, abs(uvs.x - 0.5));
    float v2 = smoothstep(0.5, 0.3, abs(uvs.y - 0.5));
    float v = v1 * v2;
    v = pow(v, 0.125);
    v = remap(v, 0.0, 1.0, 0.4, 1.0);
    return vec3(v);
}

void main() {
    vec4 tex = texture2D( tDiffuse, vUv );

    tex.rgb *= exposure / 0.6; // pre-exposed, outside of the tone mapping function
    tex.rgb = ACESFilmicToneMapping( tex.rgb );

    tex = LinearTosRGB(tex);
    tex.rgb *= vignette(vUv);

    gl_FragColor = tex;
}
