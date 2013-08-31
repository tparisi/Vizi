precision highp float;
attribute vec3 a_position;
attribute vec3 a_normal;
varying vec3 v_normal;
uniform mat3 u_normalMatrix;
uniform mat4 u_worldViewMatrix;
uniform mat4 u_projectionMatrix;
varying vec3 v_lightDirection;
varying vec3 v_mPos;
void main(void) {
vec4 pos = u_worldViewMatrix * vec4(a_position,1.0);
v_normal = normalize(u_normalMatrix * a_normal);
v_lightDirection = vec3(u_worldViewMatrix * (vec4((vec3(0.,0.,-1.) - a_position.xyz) ,1.0)));
v_mPos = pos.xyz;
gl_Position = u_projectionMatrix * pos;
}
