/**
 * Type declarations for livekit-client
 * Expanded to match actual API usage in the codebase
 */

declare module 'livekit-client' {
  export class Room {
    constructor(options?: RoomOptions);
    connect(url: string, token: string, options?: RoomConnectOptions): Promise<void>;
    disconnect(stopTracks?: boolean): Promise<void>;
    localParticipant: LocalParticipant;
    participants: Map<string, RemoteParticipant>;
    remoteParticipants: Map<string, RemoteParticipant>;
    state: ConnectionState;
    on(event: RoomEvent, callback: (...args: any[]) => void): void;
    off(event: RoomEvent, callback: (...args: any[]) => void): void;
  }

  export interface RoomOptions {}
  export interface RoomConnectOptions {}

  export enum ConnectionState {
    Disconnected = 'disconnected',
    Connected = 'connected',
    Reconnecting = 'reconnecting',
  }

  export enum RoomEvent {
    ParticipantConnected = 'participantConnected',
    ParticipantDisconnected = 'participantDisconnected',
    TrackSubscribed = 'trackSubscribed',
    TrackUnsubscribed = 'trackUnsubscribed',
    LocalTrackPublished = 'localTrackPublished',
    LocalTrackUnpublished = 'localTrackUnpublished',
    Connected = 'connected',
    Disconnected = 'disconnected',
    Reconnecting = 'reconnecting',
    Reconnected = 'reconnected',
  }

  export class LocalParticipant extends Participant {
    identity: string;
    trackPublications: Map<string, LocalTrackPublication>;
    publishTrack(track: LocalTrack, options?: TrackPublishOptions): Promise<LocalTrackPublication>;
    unpublishTrack(track: LocalTrack, stopOnUnpublish?: boolean): Promise<LocalTrackPublication | undefined>;
    setMicrophoneEnabled(enabled: boolean, options?: TrackPublishOptions): Promise<LocalTrackPublication | undefined>;
    setCameraEnabled(enabled: boolean, options?: TrackPublishOptions): Promise<LocalTrackPublication | undefined>;
  }

  export class Participant {
    identity: string;
    sid: string;
  }

  export class RemoteParticipant extends Participant {
    identity: string;
    trackPublications: Map<string, RemoteTrackPublication>;
  }

  export abstract class Track {
    kind: Track.Kind;
    sid: string;
    mediaStream?: MediaStream;
    mediaStreamTrack: MediaStreamTrack;
  }

  export namespace Track {
    export enum Kind {
      Audio = 'audio',
      Video = 'video',
    }
  }

  export class LocalTrack extends Track {
    mediaStreamTrack: MediaStreamTrack;
    constructor(mediaStreamTrack: MediaStreamTrack, kind: Track.Kind);
  }

  export function createLocalTrack(track: MediaStreamTrack): LocalTrack;
  export function createLocalAudioTrack(track: MediaStreamTrack): LocalTrack;
  export function createLocalVideoTrack(track: MediaStreamTrack): LocalTrack;

  export class RemoteTrack extends Track {
    sid: string;
    mediaStreamTrack: MediaStreamTrack;
    attach(): HTMLMediaElement;
    detach(): HTMLMediaElement[];
  }

  export interface TrackPublishOptions {
    name?: string;
    simulcast?: boolean;
  }

  export interface LocalTrackPublication {
    track?: LocalTrack;
    kind: Track.Kind;
    trackSid: string;
  }

  export interface RemoteTrackPublication {
    track?: RemoteTrack;
    kind: Track.Kind;
    trackSid: string;
    subscribed: boolean;
  }
}
