
vec3 SKY_LIGHT_COLOR = vec3(0.39, 0.57, 0.86) * 0.25;
vec3 SKY_MID_COLOR = vec3(0.1, 0.11, 0.1) * 0.5;
// vec3 SKY_DARK_COLOR = vec3(0.0);
// vec3 SKY_DARK_COLOR = vec3(0.027, 0.031, 0.039) * 0.13; // night
vec3 SKY_DARK_COLOR = vec3(0.48, 0.61, 0.86); // day
vec3 SKY_SUN_COLOR = vec3(0.5);
vec3 SKY_SUN_GLOW_COLOR = vec3(0.55, 0.2, 0.25);
// vec3 SKY_FOG_GLOW_COLOUR = vec3(vec3(0.75, 0.75, 1.0) * 0.15);
float SKY_POWER = 16.0;
float SUN_POWER = 128.0;
float SKY_DARK_POWER = 2.0;
float SKY_fogScatterDensity = 0.005;
float SKY_fogExtinctionDensity = 0.003;
// vec3 SUN_DIR = vec3(-1.0, -0.45, 1.0); // midday
vec3 SUN_DIR = vec3(-5.0, -5.45, 1.0); // night
// morning

// This is just a bunch of nonsense since I didn't want to implement a full
// sky model. It's just a simple gradient with a sun and some fog.
vec3 CalculateSkyLighting(vec3 viewDir, vec3 normalDir) {
  vec3 lighterBlue = col3(SKY_LIGHT_COLOR);
  vec3 midBlue = col3(SKY_MID_COLOR);
  vec3 darkerBlue = col3(SKY_DARK_COLOR);

  vec3 SUN_COLOR = col3(SKY_SUN_COLOR);
  vec3 SUN_GLOW_COLOR = col3(SKY_SUN_GLOW_COLOR);

  float viewDirY = linearstep(-0.01, 1.0, viewDir.y);

  float skyGradientMixFactor = saturate(viewDirY);
  vec3 skyGradient = mix(darkerBlue, lighterBlue, exp(-sqrt(saturate(viewDirY)) * 2.0));

  vec3 sunDir = normalize(SUN_DIR);
  float mu = 1.0 - saturate(dot(viewDir, sunDir));

  vec3 colour = skyGradient + SUN_GLOW_COLOR * saturate(exp(-sqrt(mu) * 10.0)) * 0.75;
  colour += SUN_COLOR * smoothstep(0.9997, 0.9998, 1.0 - mu);

  colour = oklabToRGB(colour);

  return colour;
}

vec3 CalculateSkyFog(vec3 normalDir) {
  return CalculateSkyLighting(normalDir, normalDir);
}

vec3 CalculateFog(vec3 baseColour, vec3 viewDir, float sceneDepth) {
	vec3 fogSkyColour = CalculateSkyFog(-viewDir);
	float fogDepth = sceneDepth * sceneDepth;

	float fogScatterFactor = exp(-SKY_fogScatterDensity * SKY_fogScatterDensity * fogDepth);
	float fogExtinctionFactor = exp(-SKY_fogExtinctionDensity * SKY_fogExtinctionDensity * fogDepth);

	vec3 finalColour = baseColour * fogExtinctionFactor + fogSkyColour * (1.0 - fogScatterFactor);
  return finalColour;
}