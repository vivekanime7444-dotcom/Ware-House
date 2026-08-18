export interface AnalyticalComparisonResult {
  scenarioName: string;
  time: number;
  simulatedValue: number;
  theoreticalValue: number;
  errorPercentage: number;
  unit: string;
  variableName: string;
  formulaUsed: string;
}

export function compareFreeFall(simTime: number, initialHeight: number, simHeight: number, gravity: number = 9.81): AnalyticalComparisonResult {
  const t = Math.max(0, simTime);
  // Theoretical position y(t) = y0 - 0.5 * g * t^2
  const theoreticalY = Math.max(0, initialHeight - 0.5 * gravity * t * t);
  const diff = Math.abs(simHeight - theoreticalY);
  const err = theoreticalY > 0.01 ? (diff / theoreticalY) * 100 : 0;

  return {
    scenarioName: 'Free Fall Trajectory',
    time: t,
    simulatedValue: Number(simHeight.toFixed(3)),
    theoreticalValue: Number(theoreticalY.toFixed(3)),
    errorPercentage: Number(err.toFixed(2)),
    unit: 'm',
    variableName: 'Height (y)',
    formulaUsed: 'y(t) = y₀ - ½ g t²'
  };
}

export function compareProjectileDistance(simTime: number, v0x: number, simX: number): AnalyticalComparisonResult {
  const t = Math.max(0, simTime);
  const theoreticalX = v0x * t;
  const diff = Math.abs(simX - theoreticalX);
  const err = theoreticalX > 0.01 ? (diff / theoreticalX) * 100 : 0;

  return {
    scenarioName: 'Projectile Horizontal Displacement',
    time: t,
    simulatedValue: Number(simX.toFixed(3)),
    theoreticalValue: Number(theoreticalX.toFixed(3)),
    errorPercentage: Number(err.toFixed(2)),
    unit: 'm',
    variableName: 'Displacement (x)',
    formulaUsed: 'x(t) = v₀ₓ t'
  };
}

export function compareFrictionDeceleration(v0: number, mu: number, simVelocity: number, simTime: number, gravity: number = 9.81): AnalyticalComparisonResult {
  const t = Math.max(0, simTime);
  // a = - mu * g
  const accel = mu * gravity;
  const theoreticalV = Math.max(0, v0 - accel * t);
  const diff = Math.abs(simVelocity - theoreticalV);
  const err = theoreticalV > 0.05 ? (diff / theoreticalV) * 100 : 0;

  return {
    scenarioName: 'Friction Deceleration Velocity',
    time: t,
    simulatedValue: Number(simVelocity.toFixed(3)),
    theoreticalValue: Number(theoreticalV.toFixed(3)),
    errorPercentage: Number(err.toFixed(2)),
    unit: 'm/s',
    variableName: 'Velocity (v)',
    formulaUsed: 'v(t) = v₀ - μ g t'
  };
}
