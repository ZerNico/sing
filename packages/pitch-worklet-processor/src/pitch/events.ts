export interface PitchEvent {
  readonly event: 'pitch'
}

export type WorkletEvent = MessageEvent<PitchEvent>
