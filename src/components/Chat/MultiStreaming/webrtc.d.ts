/**
 * Type declarations for WebRTC and DOM APIs used in MultiStreaming components
 * These are needed because the main tsconfig doesn't include DOM types
 */

// HTMLVideoElement properties and methods
interface HTMLVideoElement extends HTMLElement {
  srcObject: MediaStream | null;
  muted: boolean;
  autoplay: boolean;
  playsInline: boolean;
  readyState: number;
  videoWidth: number;
  videoHeight: number;
  onloadedmetadata: ((this: HTMLVideoElement, ev: Event) => any) | null;
  onloadeddata: ((this: HTMLVideoElement, ev: Event) => any) | null;
  onplay: ((this: HTMLVideoElement, ev: Event) => any) | null;
  onplaying: ((this: HTMLVideoElement, ev: Event) => any) | null;
  oncanplay: ((this: HTMLVideoElement, ev: Event) => any) | null;
  onerror: ((this: HTMLVideoElement, ev: Event | string) => any) | null;
  play(): Promise<void>;
}

// MediaStream
interface MediaStream {
  id: string;
  active: boolean;
  getTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
}

interface MediaStreamConstructor {
  new(): MediaStream;
  new(stream: MediaStream): MediaStream;
  new(tracks: MediaStreamTrack[]): MediaStream;
}

declare var MediaStream: MediaStreamConstructor;

// MediaStreamTrack
interface MediaStreamTrack {
  id: string;
  kind: string;
  enabled: boolean;
  readyState: string;
  muted: boolean;
  onunmute: ((this: MediaStreamTrack, ev: Event) => any) | null;
  onmute: ((this: MediaStreamTrack, ev: Event) => any) | null;
  onended: ((this: MediaStreamTrack, ev: Event) => any) | null;
  stop(): void;
}

// RTCPeerConnection
interface RTCPeerConnection {
  localDescription: RTCSessionDescription | null;
  remoteDescription: RTCSessionDescription | null;
  signalingState: RTCSignalingState;
  iceConnectionState: RTCIceConnectionState;
  connectionState: RTCPeerConnectionState;
  iceGatheringState: RTCIceGatheringState;

  ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null;
  onicecandidate: ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null;
  oniceconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
  onconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
  onicegatheringstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
  onnegotiationneeded: ((this: RTCPeerConnection, ev: Event) => any) | null;

  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender;
  removeTrack(sender: RTCRtpSender): void;
  getSenders(): RTCRtpSender[];
  addIceCandidate(candidate: RTCIceCandidateInit | RTCIceCandidate): Promise<void>;
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
  createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>;
  setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  restartIce(): void;
  close(): void;
  getTransceivers(): RTCRtpTransceiver[];
}

interface RTCPeerConnectionConstructor {
  new(configuration?: RTCConfiguration): RTCPeerConnection;
}

declare var RTCPeerConnection: RTCPeerConnectionConstructor;

// RTCSessionDescription
interface RTCSessionDescription {
  type: RTCSdpType;
  sdp: string;
}

interface RTCSessionDescriptionInit {
  type: RTCSdpType;
  sdp?: string;
}

interface RTCSessionDescriptionConstructor {
  new(descriptionInitDict: RTCSessionDescriptionInit): RTCSessionDescription;
}

declare var RTCSessionDescription: RTCSessionDescriptionConstructor;

type RTCSdpType = 'offer' | 'answer' | 'pranswer' | 'rollback';

// RTCIceCandidate
interface RTCIceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  type: RTCIceCandidateType | null;
  protocol: RTCIceProtocol | null;
  address: string | null;
  port: number | null;
  priority: number | null;
}

interface RTCIceCandidateInit {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}

interface RTCIceCandidateConstructor {
  new(candidateInitDict: RTCIceCandidateInit): RTCIceCandidate;
}

declare var RTCIceCandidate: RTCIceCandidateConstructor;

type RTCIceCandidateType = 'host' | 'srflx' | 'prflx' | 'relay';
type RTCIceProtocol = 'udp' | 'tcp';

// RTCConfiguration
interface RTCConfiguration {
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

type RTCIceTransportPolicy = 'all' | 'relay';
type RTCBundlePolicy = 'balanced' | 'max-compat' | 'max-bundle';
type RTCRtcpMuxPolicy = 'negotiate' | 'require';

// State types
type RTCSignalingState = 'stable' | 'have-local-offer' | 'have-remote-offer' | 'have-local-pranswer' | 'have-remote-pranswer' | 'closed';
type RTCIceConnectionState = 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed';
type RTCPeerConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
type RTCIceGatheringState = 'new' | 'gathering' | 'complete';

// Events
interface RTCTrackEvent extends Event {
  track: MediaStreamTrack;
  streams: ReadonlyArray<MediaStream>;
  receiver: RTCRtpReceiver;
  transceiver: RTCRtpTransceiver;
}

interface RTCPeerConnectionIceEvent extends Event {
  candidate: RTCIceCandidate | null;
}

// RTP
interface RTCRtpSender {
  track: MediaStreamTrack | null;
}

interface RTCRtpReceiver {
  track: MediaStreamTrack;
}

interface RTCRtpTransceiver {
  mid: string | null;
  sender: RTCRtpSender;
  receiver: RTCRtpReceiver;
  direction: RTCRtpTransceiverDirection;
  currentDirection: RTCRtpTransceiverDirection | null;
}

type RTCRtpTransceiverDirection = 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive' | 'stopped';

// Options
interface RTCOfferOptions {
  iceRestart?: boolean;
  offerToReceiveAudio?: boolean;
  offerToReceiveVideo?: boolean;
}

interface RTCAnswerOptions {}

// Navigator
interface Navigator {
  mediaDevices: MediaDevices;
  clipboard: Clipboard;
}

interface Clipboard {
  writeText(text: string): Promise<void>;
}

interface MediaDevices {
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

interface MediaStreamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

interface MediaTrackConstraints {
  facingMode?: string | { ideal?: string };
  width?: number | { ideal?: number };
  height?: number | { ideal?: number };
}

declare var navigator: Navigator;

// Window
interface Window {
  location: Location;
}

interface Location {
  hostname: string;
  protocol: string;
  origin: string;
  href: string;
  pathname: string;
  searchParams: URLSearchParams;
}

interface URLSearchParams {
  get(name: string): string | null;
}

interface URL {
  origin: string;
  pathname: string;
  searchParams: URLSearchParams;
}

interface URLConstructor {
  new(url: string): URL;
}

declare var URL: URLConstructor;
declare var window: Window;

// Document
interface Document {
  getElementById(elementId: string): HTMLElement | null;
  createElement(tagName: string): HTMLElement;
  body: HTMLElement;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface HTMLElement {
  style: CSSStyleDeclaration;
  appendChild(child: HTMLElement): HTMLElement;
  removeChild(child: HTMLElement): HTMLElement;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface CSSStyleDeclaration {
  [key: string]: any;
}

interface EventListener {
  (evt: Event): void;
}

interface Event {
  type: string;
  target: any;
}

declare var document: Document;
