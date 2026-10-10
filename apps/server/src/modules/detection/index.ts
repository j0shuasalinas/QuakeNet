import type {MotionWindow,CommunityEvent} from '@quakenet/shared';
export interface DetectionEngine {evaluate(windows:MotionWindow[],receivedAt:number):CommunityEvent|null}
// Intentionally inert: sensor traces must not imply verified detection.
export class DetectionScaffold implements DetectionEngine {
 evaluate(_windows:MotionWindow[],_receivedAt:number){return null;}
}
// TODO B: stationary calibration; gravity-aware orientation-independent strength;
// time alignment; sustained overlapping activity from >=2 distinct real devices;
// reject single-device activity; exclude stale/simulated devices; deduplicate;
// configurable thresholds, lifecycle/cooldown, and explanatory evidence.
